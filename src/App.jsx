import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowRight, ArrowUpRight, Check, ChevronLeft, ChevronRight, Code2, Github, Layers3, Maximize2, Move3d, Pause, Play, RotateCcw, Rotate3d, ScanLine, SlidersHorizontal, Sparkles } from 'lucide-react';
import TechnicalScene from './components/TechnicalScene.jsx';

const EXPERIMENTS = [
  {
    id:'sentinel', no:'01', figure:'FIG. 001 / SENTINEL', category:'IDENTITY / SYSTEM STUDIES',
    heading:['Sentinel', 'Bot.'], italic:'Bot.',
    description:'A spherical watchtower for your signals. The Sentinel Bot eye glows inside a mechanical globe, wrapped in curved armor and orbital gyroscope rings.',
    caption:'Sentinel Orb Mk II — a true spherical core with rounded armor, metallic rings and a luminous iris. Assemble the globe or pull its six groups apart.',
    specs:[['06','ASSEMBLIES'],['01','GLOBE CORE'],['360°','FREE ROTATION']],
    slider:'EXPLODED ASSEMBLY', detail:'DRAG TO ROTATE · SCROLL TO ZOOM',
    cardText:'The eye within the orb. Explore its orbital anatomy.'
  },
  {
    id:'assembly', no:'02', figure:'FIG. 002 / ASSEMBLY', category:'STRUCTURE STUDIES',
    heading:['Anatomy of', 'an object.'], italic:'an object.',
    description:'A study of how things fit together. Pull the mechanism apart, examine each component, and watch order emerge from geometry.',
    caption:'A mechanical study in five independent components. Each part has its own geometry, position and purpose.',
    specs:[['05','COMPONENTS'],['03','LAYERS'],['360°','FREE ROTATION']],
    slider:'EXPLOSION DISTANCE', detail:'DRAG TO ROTATE · SCROLL TO ZOOM',
    cardText:'Separate the components. Discover the structure.'
  },
  {
    id:'orbit', no:'03', figure:'FIG. 003 / ORBIT', category:'MOTION STUDIES',
    heading:['The geometry', 'of motion.'], italic:'of motion.',
    description:'A small universe of paths and possibilities. Adjust the phase of each orbit and explore a system in continuous motion.',
    caption:'Nested elliptical paths intersect around a central body. Every orbit can be explored from any angle.',
    specs:[['03','TRAJECTORIES'],['01','CORE'],['∞','POSSIBILITIES']],
    slider:'ORBITAL PHASE', detail:'DRAG TO ORBIT · SCROLL TO ZOOM',
    cardText:'Follow the invisible rules of motion.'
  },
  {
    id:'signal', no:'04', figure:'FIG. 004 / SIGNAL', category:'SYSTEM STUDIES',
    heading:['The art of', 'connection.'], italic:'connection.',
    description:'A field of individual nodes becomes something greater when connected. Rotate the structure and examine its changing pattern.',
    caption:'Twenty-five nodes, connected across a spatial lattice. Information lives in the relationships.',
    specs:[['25','NODES'],['40','EDGES'],['01','NETWORK']],
    slider:'SIGNAL PHASE', detail:'DRAG TO EXPLORE · SCROLL TO ZOOM',
    cardText:'Find the hidden structure within a network.'
  }
];

function AxiomSymbol({small=false}){
  return <svg className={small?'axiom-symbol axiom-symbol-small':'axiom-symbol'} viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M4 33 20 5l16 28H4Z" stroke="currentColor" strokeWidth="1.45"/>
    <path d="M10 23h20M7 29h26M20 5v28" stroke="currentColor" strokeWidth=".85" opacity=".65"/>
    <circle cx="20" cy="23" r="2" fill="#d1e7af" />
  </svg>
}

function BlueprintIcon({type}){
  if(type==='orbit')return <svg viewBox="0 0 200 150" fill="none" aria-hidden="true">
    <circle cx="100" cy="75" r="16" stroke="#c9e3b1" strokeWidth="1.2"/><circle cx="100" cy="75" r="9" stroke="#c9e3b1" strokeWidth=".65"/>
    <ellipse cx="100" cy="75" rx="84" ry="30" stroke="currentColor" transform="rotate(-27 100 75)"/>
    <ellipse cx="100" cy="75" rx="84" ry="30" stroke="currentColor" transform="rotate(33 100 75)" opacity=".7"/>
    <ellipse cx="100" cy="75" rx="72" ry="23" stroke="currentColor" transform="rotate(83 100 75)" opacity=".45"/>
    <circle cx="35" cy="120" r="4" fill="#c9e3b1"/><circle cx="171" cy="91" r="3" fill="currentColor"/>
  </svg>;
  if(type==='signal')return <svg viewBox="0 0 200 150" fill="none" aria-hidden="true">
    <g stroke="currentColor" strokeWidth=".7" opacity=".6">
      {Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>
        <React.Fragment key={`${i}-${j}`}>
          {i<3 && <path d={`M${40+i*39} ${30+j*29} L${40+(i+1)*39} ${30+j*29}`}/>}
          {j<3 && <path d={`M${40+i*39} ${30+j*29} L${40+i*39} ${30+(j+1)*29}`}/>}
        </React.Fragment>
      ))}
    </g>
    {Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=><circle key={`${i}-${j}`} cx={40+i*39} cy={30+j*29} r={i===j?3.5:2} fill={i===j?'#c9e3b1':'currentColor'}/>))}
  </svg>;
  if(type==='sentinel') return <svg viewBox="0 0 200 150" fill="none" aria-hidden="true">
    <ellipse cx="100" cy="78" rx="81" ry="22" stroke="#b78aff" strokeWidth="2.2" transform="rotate(-10 100 78)"/>
    <path d="M60 67Q69 24 100 25Q131 24 140 67L121 50Q99 37 79 50Z" stroke="#c1a2ff" strokeWidth="2" fill="#51318b" fillOpacity=".25"/>
    <path d="M55 76Q101 45 145 76Q98 110 55 76Z" stroke="#ad83ff" strokeWidth="1.8"/>
    <circle cx="100" cy="76" r="14" fill="#9a6cff" fillOpacity=".3" stroke="#d7c4ff"/>
    <path d="M62 92Q70 129 100 135Q130 129 138 92L120 110L100 120L80 110Z" stroke="#b89aff" strokeWidth="2"/>
    <path d="M94 10L100 3L106 10V40H94Z" stroke="#bc91ff" strokeWidth="1.7"/>
  </svg>;
  return <svg viewBox="0 0 200 150" fill="none" aria-hidden="true">
    {[0,1,2].map(i=><g key={i} stroke="currentColor" strokeWidth="1" transform={`translate(0 ${i*29})`}>
      <path d="M30 35 91 11 169 41 108 65Z"/><path d="M30 35v8l78 30v-8l61-24v8l-61 24"/>
    </g>)}
    <path d="M98 3V38" stroke="#c9e3b1" strokeWidth="1.5"/>
    <ellipse cx="98" cy="4" rx="6" ry="2.5" stroke="#c9e3b1"/>
  </svg>;
}

function App(){
  const [selected,setSelected]=useState(()=>typeof window!=='undefined' && ['assembly','orbit','signal','sentinel'].includes(window.location.hash.slice(1))?window.location.hash.slice(1):'sentinel');
  const [explode,setExplode]=useState(selected==='sentinel'?.18:.73);
  const [autoRotate,setAutoRotate]=useState(false);
  const [resetKey,setResetKey]=useState(0);
  const [copied,setCopied]=useState(false);
  const heroRef=useRef(null);
  const active=EXPERIMENTS.find(e=>e.id===selected) ?? EXPERIMENTS[0];
  const index=EXPERIMENTS.findIndex(e=>e.id===selected);

  function choose(id,scroll=false){
    setSelected(id);setExplode(id==='sentinel'?.18:.73);setAutoRotate(false);setResetKey(k=>k+1);
    // Preserve a shareable deep link without letting the browser jump to an absent anchor.
    window.history.replaceState(null, '', `${window.location.pathname}${window.location.search}#${id}`);
    if(scroll){heroRef.current?.scrollIntoView({behavior:'smooth',block:'start'});}
  }
  function shift(delta){choose(EXPERIMENTS[(index+delta+EXPERIMENTS.length)%EXPERIMENTS.length].id);}
  async function copySpec(){
    const txt=`AXIOM LAB / ${active.figure}\n${active.heading.join(' ')}\n${active.description}\n${active.caption}`;
    try {await navigator.clipboard.writeText(txt);setCopied(true);window.setTimeout(()=>setCopied(false),1600);} catch {setCopied(false);}
  }
  useEffect(()=>{
    // Allow opening a specific experiment using /#sentinel, /#orbit, etc.
    const readHash=()=>{
      const id=window.location.hash.slice(1);
      if(EXPERIMENTS.some(e=>e.id===id)){
        setSelected(id);
        setExplode(id==='sentinel'?.18:.73);
        setAutoRotate(false);
        setResetKey(k=>k+1);
      }
    };
    window.addEventListener('hashchange',readHash);
    return ()=>window.removeEventListener('hashchange',readHash);
  },[]);

  useEffect(()=>{
    const handleKey=(e)=>{
      const tag=document.activeElement?.tagName;
      if(tag==='INPUT'||tag==='TEXTAREA'||tag==='BUTTON'||document.activeElement?.isContentEditable||e.altKey||e.ctrlKey||e.metaKey)return;
      if(e.key==='ArrowRight')shift(1);
      if(e.key==='ArrowLeft')shift(-1);
    };
    window.addEventListener('keydown',handleKey);
    return ()=>window.removeEventListener('keydown',handleKey);
  },[index]);

  return <div className={`app-shell ${selected==='sentinel'?'sentinel-active':''}`}>
    <header className="site-header">
      <a className="brand" href="#top" aria-label="Axiom Lab home"><AxiomSymbol/><span>AXIOM<span className="brand-light">/LAB</span></span><span className="brand-sup">®</span></a>
      <nav className="main-nav" aria-label="Primary navigation">
        <a href="#lab" className="nav-active">The laboratory <span>01</span></a><a href="#lab" onClick={()=>choose('sentinel')}>Sentinel Bot <span>NEW</span></a>
        <a href="#experiments">Experiments <span>04</span></a>
        <a href="/pfp-studio">PFP 3D Studio <span>NEW</span></a>
        <a href="#about">Manifesto</a>
      </nav>
      <div className="header-right"><a href="/pfp-studio" className="pfp-studio-trigger">PFP STUDIO <ArrowUpRight size={13}/></a><span className="live-status"><i/>ALL SYSTEMS CURIOUS</span><a className="header-gh" href="https://github.com/ariefzzz5421/Axiom-Lab" target="_blank" rel="noreferrer" aria-label="View project on GitHub"><Github size={17}/><span>GITHUB</span><ArrowUpRight size={13}/></a></div>
    </header>

    <main id="top">
      <div className="announcement"><span><span className="announcement-square"/> AN OPEN-ENDED STUDY OF DIGITAL FORM</span><span>EST. 2026 <span className="announcement-divider">/</span> BUILT IN THE BROWSER</span></div>

      <section className="laboratory" id="lab" ref={heroRef} aria-label="Interactive laboratory">
        <aside className="lab-story">
          <div className="story-top"><span className="eyebrow"><span className="eyebrow-line"/> A FIELD GUIDE TO FORM</span><span className="story-index">{active.no} — {EXPERIMENTS.length.toString().padStart(2,'0')}</span></div>
          <div className="story-main" key={selected}>
            <div className="preheading">{active.category} <span>/</span> {active.figure}</div>
            <h1>{active.heading[0]}<br/><em>{active.heading[1]}</em></h1>
            <p className="story-description">{active.description}</p>
            <div className="story-hairline"/>
            <p className="story-caption"><span className="story-caption-label">ABSTRACT —</span> {active.caption}</p>
            <div className="spec-grid">
              {active.specs.map(([value,label])=><div className="spec-item" key={label}><strong>{value}</strong><span>{label}</span></div>)}
            </div>
          </div>
          <div className="story-bottom">
            <div className="lab-select-title"><span>SELECT AN EXPERIMENT</span><span>({EXPERIMENTS.length.toString().padStart(2,'0')})</span></div>
            <div className="experiment-tabs" role="tablist" aria-label="Experiments">
              {EXPERIMENTS.map(e=><button role="tab" aria-selected={selected===e.id} className={`experiment-tab ${selected===e.id?'is-selected':''}`} key={e.id} onClick={()=>choose(e.id)}><span className="tab-number">{e.no}</span><span>{e.id}</span><ArrowUpRight size={14}/></button>)}
            </div>
          </div>
        </aside>

        <div className="lab-visual">
          <div className="visual-grid" aria-hidden="true"/>
          <div className="visual-meta"><div><span className="tiny-label">{active.figure}</span><div className="visual-meta-sub">ORTHOGRAPHIC PROJECTION / LIVE GEOMETRY</div></div><div className="visual-meta-right"><ScanLine size={17}/><span>REAL-TIME RENDER</span></div></div>
          <div className="viewport">
            <TechnicalScene experiment={selected} exploded={explode} autoRotate={autoRotate} resetKey={resetKey}/>
            <div className="crosshair crosshair-tl" aria-hidden="true"/><div className="crosshair crosshair-br" aria-hidden="true"/>
            <div className="diagram-annotation annotation-one"><span className="annot-line"/><span>{selected==='sentinel'?'01 / CROWN CAP':selected==='assembly'?'10 / UPPER PLATE':selected==='orbit'?'01 / OUTER RING':'01 / SIGNAL NODE'}</span></div>
            <div className="diagram-annotation annotation-two"><span className="annot-line"/><span>{selected==='sentinel'?'04 / IRIS CORE':selected==='assembly'?'18 / RETAINING PIN':selected==='orbit'?'02 / CORE':'02 / CONNECTION'}</span></div>
            <div className="axis-key" aria-hidden="true"><span className="axis-y">Y</span><span className="axis-x">X</span><span className="axis-z">Z</span></div>
            <div className="viewport-bottom-left"><Move3d size={16}/> {active.detail}</div>
            {selected==='sentinel' && <div className="sentinel-reference"><img src="/sentinel-logo.png" alt="Original Sentinel Bot logo"/><span>ORIGINAL MARK / REFERENCE</span></div>}
            <div className="viewport-bottom-right">X <span>+</span> Y <span>+</span> Z</div>
          </div>
          <div className="control-deck">
            <div className="control-title"><SlidersHorizontal size={16}/><span>INTERACTION PANEL</span><span className="control-code">CTRL_00{index+1}</span></div>
            <div className="control-body"><div className="range-control"><div className="range-top"><label htmlFor="motion-slider">{active.slider}</label><span>{Math.round(explode*100).toString().padStart(3,'0')} <span className="range-unit">/ 100</span></span></div><input id="motion-slider" type="range" min="0" max="100" value={Math.round(explode*100)} style={{'--range':`${explode*100}%`}} onChange={e=>setExplode(+e.target.value/100)}/><div className="range-ticks"><span>MIN</span><span>25</span><span>50</span><span>75</span><span>MAX</span></div></div>
              <div className="control-actions"><button aria-pressed={autoRotate} onClick={()=>setAutoRotate(v=>!v)} title={autoRotate?'Pause rotation':'Auto rotate'}>{autoRotate?<Pause size={16}/>:<Play size={16}/>} <span>{autoRotate?'PAUSE':'AUTO ROTATE'}</span></button><button onClick={()=>{setExplode(selected==='sentinel'?.18:.73);setAutoRotate(false);setResetKey(k=>k+1)}} title="Reset camera and controls"><RotateCcw size={16}/><span>RESET VIEW</span></button></div>
            </div>
          </div>
          <div className="visual-bottom-nav"><button onClick={()=>shift(-1)} aria-label="Previous experiment"><ChevronLeft size={17}/> PREV</button><div className="pagination">{EXPERIMENTS.map(e=><button key={e.id} onClick={()=>choose(e.id)} className={selected===e.id?'current':''} aria-label={`Show ${e.id}`}/>)}</div><button onClick={()=>shift(1)} aria-label="Next experiment">NEXT <ChevronRight size={17}/></button></div>
        </div>
      </section>

      <section className="section experiments-section" id="experiments">
        <div className="section-top"><div className="section-kicker"><span className="number-box">02</span> THE INDEX / EXPERIMENTS</div><span className="section-aside">FOUR OPEN STUDIES — NO TWO ALIKE</span></div>
        <div className="section-heading"><h2>Curiosity, <em>made tangible.</em></h2><p>Every experiment is drawn with code, animated in real time, and made to be touched. Choose a study and start pulling at the threads.</p></div>
        <div className="experiment-cards">
          {EXPERIMENTS.map(e=><button className="experiment-card" key={e.id} onClick={()=>choose(e.id,true)}>
            <div className="card-header"><span>{e.id==='sentinel'?'FEATURED / SENTINEL BOT':`STUDY NO. ${e.no}`}</span><ArrowUpRight size={17}/></div><div className="card-art"><span className="card-axis card-axis-x">X</span><span className="card-axis card-axis-y">Y</span><BlueprintIcon type={e.id}/><span className="card-corner-left">{e.figure}</span><span className="card-corner-right">AXL / {e.no}</span></div><div className="card-footer"><div><h3>{e.id.charAt(0).toUpperCase()+e.id.slice(1)} <span>↗</span></h3><p>{e.cardText}</p></div><span className="card-view">VIEW STUDY <ArrowRight size={14}/></span></div>
          </button>)}
        </div>
      </section>

      <section className="manifesto" id="about"><div className="manifesto-kicker"><span className="number-box">03</span> A SMALL MANIFESTO</div><div className="manifesto-main"><div className="manifesto-icon"><AxiomSymbol/></div><div><p className="manifesto-overline">WHY THIS EXISTS</p><h2>Not everything needs<br/>a <em>purpose.</em> Some things<br/>need to be <em>explored.</em></h2><p className="manifesto-description">AXIOM LAB is a living sketchbook for computational design — a place to experiment with SVG, WebGL, geometry, and interaction. No templates. Interactive WebGL geometry, original illustrations and working controls — all built in the browser.</p><a href="https://github.com/ariefzzz5421/Axiom-Lab" target="_blank" rel="noreferrer" className="manifesto-link"><Code2 size={17}/> EXPLORE THE SOURCE <ArrowUpRight size={16}/></a></div></div></section>

      <footer className="footer"><div className="footer-brand"><AxiomSymbol small/><span>AXIOM / LAB</span></div><div className="footer-meta">AN ONGOING EXPERIMENT IN FORM & FUNCTION. <span>© 2026</span></div><a href="#top">BACK TO TOP ↑</a></footer>
    </main>
  </div>;
}

export default App;
