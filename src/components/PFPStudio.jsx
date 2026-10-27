import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, ChevronDown, CircleHelp, Download, Eye, FileImage, Layers, LockKeyhole, RotateCcw, ScanLine, ShieldCheck, Sparkles, UploadCloud, WandSparkles, X } from 'lucide-react';
import PFPScene from './PFPScene.jsx';
import { preparePFPImage } from './pfpImage.js';
import './pfpStudio.css';

const MATERIALS=[
  {id:'resin',label:'Liquid resin',detail:'Glossy enamel / toy-like finish'},
  {id:'chrome',label:'Mirror alloy',detail:'Reflective metallic object'},
  {id:'holo',label:'Holographic',detail:'Violet / cyan material'}
];
const MAX_BYTES=10*1024*1024;

function getOutputUrl(value){
  if(typeof value!=='string'||!/^https:\/\//i.test(value))return null;
  return value;
}
export default function PFPStudio(){
  const picker=useRef(null);
  const [photo,setPhoto]=useState(null);
  const [source,setSource]=useState(null);
  const [sourceUrl,setSourceUrl]=useState('');
  const [material,setMaterial]=useState('resin');
  const [depth,setDepth]=useState(.5);
  const [exploded,setExploded]=useState(.12);
  const [removeBackground,setRemoveBackground]=useState(true);
  const [adminToken,setAdminToken]=useState('');
  const [service,setService]=useState({ready:false,configured:false});
  const [job,setJob]=useState(null);
  const [status,setStatus]=useState('');
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const [modelUrl,setModelUrl]=useState(null);
  const [imageUrl,setImageUrl]=useState(null);
  const fileKey=photo?.name||'none';

  useEffect(()=>{
    let ignore=false;
    fetch('/api/pfp-convert',{method:'GET'}).then(r=>r.json()).then(data=>{
      if(!ignore)setService({ready:Boolean(data.ready),configured:Boolean(data.configured)});
    }).catch(()=>{if(!ignore)setService({ready:false,configured:false})});
    return ()=>{ignore=true};
  },[]);
  useEffect(()=>{
    if(!photo)return;
    let active=true;
    setError('');setBusy(true);
    preparePFPImage(photo,removeBackground).then(data=>{
      if(active){setSource(data);setStatus(data.flatBackgroundRemoved?'Flat background detected and removed.':'Image processed — local preview ready.');}
    }).catch(err=>{if(active){setError(err.message);setSource(null)}})
      .finally(()=>{if(active)setBusy(false)});
    return ()=>{active=false};
  },[photo,removeBackground]);
  useEffect(()=>()=>{if(sourceUrl)URL.revokeObjectURL(sourceUrl)},[sourceUrl]);

  const openFile=useCallback((file)=>{
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)){
      setError('Upload PNG, JPG or WebP only.');return;
    }
    if(file.size>MAX_BYTES){setError('Max 10 MB per image.');return;}
    setPhoto(file);setSourceUrl(URL.createObjectURL(file));
    setModelUrl(null);setImageUrl(null);setJob(null);setStatus('');setError('');
  },[]);
  const onDrop=(e)=>{e.preventDefault();openFile(e.dataTransfer.files?.[0]);};
  const reset=()=>{setPhoto(null);setSource(null);setSourceUrl('');setModelUrl(null);setImageUrl(null);setJob(null);setError('');setStatus('');setExploded(.12);if(picker.current)picker.current.value='';};

  const requestConversion=async()=>{
    if(!source)return;
    setError('');setStatus('Submitting protected conversion request…');setBusy(true);
    try{
      const response=await fetch('/api/pfp-convert',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${adminToken}`},
        body:JSON.stringify({image:source.dataUrl,style:material,output:'glb'})
      });
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(data.error||`Conversion API returned ${response.status}`);
      const url=getOutputUrl(data.modelUrl);
      const preview=getOutputUrl(data.previewUrl);
      if(url)setModelUrl(url);
      if(preview)setImageUrl(preview);
      if(data.jobId){setJob(String(data.jobId));setStatus('Queued for AI conversion. Check status to fetch result.');}
      else if(url||preview){setStatus('Conversion output received.');}
      else throw new Error('Provider did not return modelUrl, previewUrl or jobId.');
    }catch(e){setError(e.message);setStatus('');}finally{setBusy(false)}
  };
  const checkStatus=async()=>{
    if(!job)return;
    setBusy(true);setError('');
    try{
      const r=await fetch(`/api/pfp-job?id=${encodeURIComponent(job)}`,{headers:{Authorization:`Bearer ${adminToken}`}});
      const d=await r.json().catch(()=>({}));
      if(!r.ok)throw new Error(d.error||`Status check failed (${r.status})`);
      if(getOutputUrl(d.modelUrl))setModelUrl(d.modelUrl);
      if(getOutputUrl(d.previewUrl))setImageUrl(d.previewUrl);
      setStatus(d.status==='completed'||d.modelUrl?'Completed. Preview the output.':`Provider status: ${d.status||'processing'}`);
      if(d.status==='failed')setError('Provider reported a failed conversion.');
    }catch(e){setError(e.message)}finally{setBusy(false)}
  };
  return <div className="pfp-page">
    <header className="pfp-header"><a href="/" className="pfp-brand"><span className="pfp-brand-symbol">◇</span> AXIOM<span>/LAB</span></a>
      <nav aria-label="PFP studio navigation"><a href="/">LABORATORY</a><a className="pfp-current" href="/pfp-studio">PFP 3D STUDIO</a><a href="https://github.com/ariefzzz5421/Axiom-Lab" target="_blank" rel="noreferrer">SOURCE <ArrowUpRight size={13}/></a></nav>
    </header>
    <div className="pfp-topline"><span>AXIOM LAB / EXPERIMENT 005</span><span>IMAGE → RELIEF → AI MODEL</span></div>
    <main className="pfp-main">
      <section className="pfp-intro"><div className="pfp-eyebrow"><span className="pfp-square"/> VISUAL EXPERIMENT // MATERIAL STUDIES</div>
        <h1>Your image,<br/><em>re-engineered.</em></h1>
        <p>Transform profile pictures and illustrations into glossy three-dimensional experiments. Start with an instant browser-made relief, then connect a 3D-generation API for real downloadable models.</p>
        <div className="pfp-intro-meta"><span>FIG 005 — PFP CONVERSION LAB</span><span>REAL-TIME WEBGL PREVIEW</span></div>
      </section>
      <section className="pfp-workbench" aria-label="PFP creation workbench">
        <div className="pfp-settings">
          <div className="pfp-section-heading"><span>01 / INPUT SOURCE</span><span>UPLOAD</span></div>
          <input ref={picker} type="file" accept="image/png,image/jpeg,image/webp" hidden aria-label="Choose image" onChange={e=>openFile(e.target.files?.[0])}/>
          <div className="pfp-upload" role="button" tabIndex={0}
            onDrop={onDrop} onDragOver={e=>e.preventDefault()}
            onClick={()=>picker.current?.click()}
            onKeyDown={e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();picker.current?.click()}}}>
            {sourceUrl?<><img src={sourceUrl} alt="Uploaded PFP"/><div className="pfp-upload-overlay">REPLACE IMAGE</div></>:
              <><UploadCloud size={36} strokeWidth={1.3}/><strong>Drop your PFP here</strong><span>OR CLICK TO BROWSE</span><small>PNG / JPG / WEBP · MAX 10 MB</small></>}
          </div>
          <div className="pfp-check"><label><input type="checkbox" checked={removeBackground} onChange={e=>setRemoveBackground(e.target.checked)}/> Remove uniform background</label><span>Best for illustrations / flat color backdrops</span></div>
          <div className="pfp-section-heading pfp-space"><span>02 / MATERIAL FINISH</span><span>SELECT</span></div>
          <div className="pfp-materials">{MATERIALS.map(m=><button key={m.id} className={material===m.id?'pfp-material selected':'pfp-material'} onClick={()=>setMaterial(m.id)}><i className={`pfp-swatch ${m.id}`}/><span><strong>{m.label}</strong><small>{m.detail}</small></span>{material===m.id&&<Check size={15}/>}</button>)}</div>
          <div className="pfp-range"><div><label htmlFor="pfp-depth">RELIEF DEPTH</label><output>{Math.round(depth*100)}%</output></div><input type="range" id="pfp-depth" min="0" max="100" value={Math.round(depth*100)} onChange={e=>setDepth(+e.target.value/100)}/></div>
          <div className="pfp-range"><div><label htmlFor="pfp-explode">EXPLODED LAYERS</label><output>{Math.round(exploded*100)}%</output></div><input type="range" id="pfp-explode" min="0" max="100" value={Math.round(exploded*100)} onChange={e=>setExploded(+e.target.value/100)}/></div>
          <button className="pfp-secondary" onClick={reset}><RotateCcw size={15}/> CLEAR & RESET</button>
        </div>
        <div className="pfp-stage"><div className="pfp-section-heading"><span>LIVE / 3D PREVIEW</span><span>{modelUrl?'GLB MODEL':source?'BROWSER RELIEF':'AWAITING INPUT'}</span></div>
          <div className="pfp-viewer"><PFPScene source={source} material={material} depth={depth} exploded={exploded} modelUrl={modelUrl}/></div>
          <div className="pfp-stage-footer"><span><Eye size={15}/> {source?'INTERACTIVE RELIEF LOADED':'UPLOAD AN IMAGE TO BEGIN'}</span><span>THREE.JS / WEBGL</span></div>
          <div className="pfp-info"><ScanLine size={17}/><div><strong>Browser preview vs. AI model</strong><p>Local preview uses image color and brightness to build an approximate raised surface. It is interactive 3D but not AI reconstruction. Genuine image-to-3D GLB export becomes available after configuring a supported provider API.</p></div></div>
        </div>
        <aside className="pfp-output"><div className="pfp-section-heading"><span>03 / CONVERSION PIPELINE</span><span>OUTPUT</span></div>
          <div className="pfp-step-list"><div><i>01</i><span>UPLOAD / VALIDATE</span><Check size={14} className={source?'pfp-step-done':''}/></div><div><i>02</i><span>INSTANT 3D RELIEF</span><Check size={14} className={source?'pfp-step-done':''}/></div><div><i>03</i><span>AI CONVERSION (OPTIONAL)</span><span className="pfp-queued">API</span></div><div><i>04</i><span>DOWNLOAD GLB</span><span className="pfp-queued">OUTPUT</span></div></div>
          <div className="pfp-service-state"><span className={service.ready?'ready-dot':'idle-dot'}/>{service.ready?'PROVIDER CONFIGURED':'PROVIDER NOT CONFIGURED'}<small>{service.ready?'Server environment detected. Access token required.':'Local 3D preview works without any API keys.'}</small></div>
          <label htmlFor="pfp-access-token" className="pfp-secret-label"><LockKeyhole size={15}/> STUDIO ACCESS TOKEN</label>
          <input id="pfp-access-token" className="pfp-token" type="password" autoComplete="off" value={adminToken} onChange={e=>setAdminToken(e.target.value)} placeholder="Configured server-side later"/>
          <small className="pfp-secret-note">Enter your protected studio token only when you configure the backend. It is kept in this page's memory, not saved in the browser.</small>
          <button className="pfp-convert" disabled={!source||busy||!service.ready||!adminToken.trim()} onClick={requestConversion}><WandSparkles size={17}/>{busy?'PROCESSING…':'RUN AI CONVERSION'} <ArrowUpRight size={15}/></button>
          {job&&<button className="pfp-secondary" disabled={busy} onClick={checkStatus}><ScanLine size={16}/> CHECK JOB STATUS</button>}
          {modelUrl&&<a className="pfp-download" href={modelUrl} target="_blank" rel="noopener noreferrer"><Download size={17}/> OPEN GENERATED GLB</a>}
          {imageUrl&&<a className="pfp-download" href={imageUrl} target="_blank" rel="noopener noreferrer"><FileImage size={17}/> OPEN RENDER</a>}
          {status&&<div className="pfp-message" role="status">{status}</div>}
          {error&&<div className="pfp-message pfp-error" role="alert">{error}</div>}
          <div className="pfp-outro"><ShieldCheck size={20}/><p>No files are uploaded during local preview. Upload to an external provider happens only when you explicitly run AI conversion.</p></div>
        </aside>
      </section>
      <section className="pfp-bottom"><div><span>TECHNICAL SPECIFICATION / 001</span><h2>Designed to be<br/><em>connected later.</em></h2></div><div><p>Image preprocessing, client-side 3D relief, editable materials, and protected serverless API routes are separated. Plug in the provider when you are ready; no model-generation API is claimed or invoked before that.</p><a href="https://github.com/ariefzzz5421/Axiom-Lab" target="_blank" rel="noreferrer">VIEW REPOSITORY <ArrowUpRight size={15}/></a></div></section>
    </main>
    <footer className="pfp-footer"><span>AXIOM / LAB — PFP 3D STUDIO</span><a href="/"><ArrowLeft size={15}/> BACK TO LAB</a><span>EXPERIMENT 005 / 2026</span></footer>
  </div>;
}
