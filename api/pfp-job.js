import { timingSafeEqual } from 'node:crypto';
function respond(res,code,data){res.status(code).setHeader('Cache-Control','no-store').json(data);}
function validToken(req){const expected=process.env.PFP_STUDIO_ADMIN_TOKEN||'';const provided=req.headers.authorization?.replace(/^Bearer\s+/i,'')||'';return Boolean(expected)&&Buffer.byteLength(provided)===Buffer.byteLength(expected)&&timingSafeEqual(Buffer.from(provided),Buffer.from(expected));}
export default async function handler(req,res){
  if(req.method!=='GET')return respond(res,405,{error:'Method not allowed'});
  if(process.env.PFP_CONVERTER_ENABLED!=='true'||!process.env.PFP_3D_API_URL||!process.env.PFP_3D_API_KEY)return respond(res,503,{error:'Conversion service not configured'});
  if(!validToken(req))return respond(res,401,{error:'Invalid studio access token'});
  const id=typeof req.query?.id==='string'?req.query.id:'';
  if(!/^[A-Za-z0-9_-]{1,180}$/.test(id))return respond(res,400,{error:'Invalid job ID'});
  try{
    const base=new URL(process.env.PFP_3D_API_URL);
    if(base.protocol!=='https:')return respond(res,503,{error:'Provider must use HTTPS'});
    const jobUrl=new URL(`jobs/${encodeURIComponent(id)}`,base.toString().replace(/\/?$/,'/'));
    const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),13000);
    let r;try{r=await fetch(jobUrl,{headers:{Authorization:`Bearer ${process.env.PFP_3D_API_KEY}`},signal:controller.signal})}finally{clearTimeout(timer)}
    if(!r.ok)return respond(res,502,{error:`Provider status check failed (${r.status})`});
    const data=await r.json();
    const result={status:String(data.status||'processing')};
    for(const [a,b] of [['modelUrl','model_url'],['previewUrl','preview_url']]){
      const url=data[a]||data[b];if(typeof url==='string'&&/^https:\/\//.test(url))result[a]=url;
    }
    respond(res,200,result);
  }catch{return respond(res,502,{error:'Provider status unavailable'});}
}
