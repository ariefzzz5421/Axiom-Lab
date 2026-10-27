import { timingSafeEqual } from 'node:crypto';
// Provider-neutral, deliberately disabled until env vars are explicitly configured.
// POST {image: data:image/jpeg;base64,..., style: 'resin'|'chrome'|'holo', output:'glb'}
// Returns {modelUrl?,previewUrl?,jobId?,status?}. Never expose API keys to the client.
const MAX_BODY = 3_700_000;
const STYLES = new Set(['resin','chrome','holo']);
function send(res,status,payload){res.status(status).setHeader('Cache-Control','no-store').json(payload);}
function access(req){
  const expected=process.env.PFP_STUDIO_ADMIN_TOKEN;
  const value=req.headers.authorization?.replace(/^Bearer\s+/i,'') || '';
  if(!expected || !value || Buffer.byteLength(value)!==Buffer.byteLength(expected))return false;
  // Constant-time string comparison for equal-length secret tokens.
  const a=Buffer.from(value),b=Buffer.from(expected);
  return timingSafeEqual(a,b);
}
function configured(){return process.env.PFP_CONVERTER_ENABLED==='true'&&Boolean(process.env.PFP_3D_API_URL)&&Boolean(process.env.PFP_3D_API_KEY)&&Boolean(process.env.PFP_STUDIO_ADMIN_TOKEN);}
function providerUrl(){
  const url=new URL(process.env.PFP_3D_API_URL);
  if(url.protocol!=='https:')throw new Error('Provider API must use HTTPS');
  return url.toString();
}
export default async function handler(req,res){
  if(req.method==='GET')return send(res,200,{ready:configured(),configured:configured(),provider:'external',mode:'optional'});
  if(req.method!=='POST')return send(res,405,{error:'Method not allowed'});
  if(!configured())return send(res,503,{error:'AI conversion is not configured. Local 3D preview remains available.'});
  if(!access(req))return send(res,401,{error:'Invalid studio access token'});
  const body=req.body||{};
  const {image,style,output}=body;
  if(!STYLES.has(style)||output!=='glb')return send(res,400,{error:'Invalid conversion options'});
  if(typeof image!=='string'||!/^data:image\/jpeg;base64,[A-Za-z0-9+/=]+$/.test(image)||image.length>MAX_BODY)return send(res,400,{error:'Image data invalid or too large'});
  let url;
  try{url=providerUrl();}catch{return send(res,503,{error:'Invalid provider configuration'});}
  try {
    const controller=new AbortController();
    const timeout=setTimeout(()=>controller.abort(),23000);
    let upstream;
    try{upstream=await fetch(url,{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.PFP_3D_API_KEY}`},body:JSON.stringify({image,style,output}),signal:controller.signal});}
    finally{clearTimeout(timeout)}
    if(!upstream.ok)return send(res,502,{error:`Provider request failed (${upstream.status}). Verify provider adapter configuration.`});
    const data=await upstream.json();
    const result={status:String(data.status||'submitted')};
    const modelUrl=data.modelUrl||data.model_url;
    const previewUrl=data.previewUrl||data.preview_url;
    const jobId=data.jobId||data.job_id||data.id;
    if(typeof modelUrl==='string'&&/^https:\/\//.test(modelUrl))result.modelUrl=modelUrl;
    if(typeof previewUrl==='string'&&/^https:\/\//.test(previewUrl))result.previewUrl=previewUrl;
    if(typeof jobId==='string'||typeof jobId==='number')result.jobId=String(jobId).slice(0,180);
    return send(res,200,result);
  }catch{return send(res,502,{error:'Provider unavailable, timed out, or returned an incompatible response'});}
}
