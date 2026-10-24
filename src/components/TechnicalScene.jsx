import React, { Suspense, useMemo, useRef, useEffect } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, OrthographicCamera } from '@react-three/drei';
import SentinelModel from './SentinelScene.jsx';

const INK = '#dcded5';
const GHOST = '#758078';
const MINT = '#bfdba6';

function useEdges(geometry) {
  return useMemo(() => new THREE.EdgesGeometry(geometry, 18), [geometry]);
}

function LineSolid({ geometry, materialOpacity = 0.028, color = INK, edgeOpacity = 0.85, children, ...props }) {
  const edges = useEdges(geometry);
  return (
    <group {...props}>
      <mesh geometry={geometry}>
        <meshBasicMaterial color={color} transparent opacity={materialOpacity} depthWrite={false} side={THREE.DoubleSide} />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial color={color} transparent opacity={edgeOpacity} />
      </lineSegments>
      {children}
    </group>
  );
}

function Plate({ y = 0, w = 4.25, d = 2.18, notch = false }) {
  const bodyGeometry = useMemo(() => new THREE.BoxGeometry(w, 0.13, d), [w,d]);
  const screwGeometry = useMemo(() => new THREE.CylinderGeometry(0.105, 0.105, 0.012, 20), []);
  const screwEdges = useEdges(screwGeometry);
  return (
    <group position={[0,y,0]}>
      <LineSolid geometry={bodyGeometry} />
      {[-1,1].map(x=>[-1,1].map(z=>(
        <group position={[x*(w/2-.28), .078, z*(d/2-.24)]} key={`${x}-${z}`}>
          <lineSegments geometry={screwEdges}>
            <lineBasicMaterial color={INK} transparent opacity={.82}/>
          </lineSegments>
          <mesh rotation={[-Math.PI/2,0,0]}><ringGeometry args={[.029,.038,12]}/><meshBasicMaterial color={INK} side={THREE.DoubleSide}/></mesh>
        </group>
      )))}
      {notch && <LineSolid geometry={new THREE.BoxGeometry(.62,.20,.62)} position={[1.16,.01,0]} color={GHOST} materialOpacity={.012}/>} 
      {Array.from({length:18},(_,i)=>(
        <line key={i} geometry={new THREE.BufferGeometry().setFromPoints([
          new THREE.Vector3(-w/2+.12+i*.21,-.070, d/2+.002),
          new THREE.Vector3(-w/2+.20+i*.21,-.070, d/2+.002)
        ])}>
          <lineBasicMaterial color={INK} transparent opacity={.34}/>
        </line>
      ))}
    </group>
  );
}

function Pin() {
  const geo = useMemo(()=>new THREE.CylinderGeometry(.16,.16,1.52,24),[]);
  const collar = useMemo(()=>new THREE.CylinderGeometry(.235,.235,.085,24),[]);
  return <group>
    <LineSolid geometry={geo} position={[.18,0,0]}/>
    <LineSolid geometry={collar} position={[.18,.81,0]} materialOpacity={.1}/>
    <LineSolid geometry={collar} position={[.18,-.76,0]} materialOpacity={.1}/>
  </group>;
}

function Latch() {
  const barrel=useMemo(()=>new THREE.CylinderGeometry(.27,.27,.65,32),[]);
  const plank=useMemo(()=>new THREE.BoxGeometry(1.05,.09,.62),[]);
  return <group>
    <LineSolid geometry={barrel} rotation={[Math.PI/2,0,0]} position={[0,0,0]}/>
    <LineSolid geometry={plank} position={[.53,.06,0]}/>
    <mesh position={[0,0,.332]}><ringGeometry args={[.11,.13,24]}/><meshBasicMaterial color={INK} side={THREE.DoubleSide}/></mesh>
  </group>;
}

function Assembly({ exploded, autoRotate }) {
  const top=useRef(), middle=useRef(), bottom=useRef(), pin=useRef(), latch=useRef();
  useFrame((_,dt)=>{
    const x=THREE.MathUtils.clamp(dt*4,0,1);
    top.current.position.y=THREE.MathUtils.lerp(top.current.position.y,.46+exploded*1.15,x);
    middle.current.position.y=THREE.MathUtils.lerp(middle.current.position.y,.08,x);
    bottom.current.position.y=THREE.MathUtils.lerp(bottom.current.position.y,-.35-exploded*.96,x);
    pin.current.position.y=THREE.MathUtils.lerp(pin.current.position.y,.85+exploded*1.85,x);
    latch.current.position.x=THREE.MathUtils.lerp(latch.current.position.x,2.12+exploded*.90,x);
    latch.current.rotation.z=THREE.MathUtils.lerp(latch.current.rotation.z,exploded*.27,x);
  });
  return <group rotation={[0,-.12,0]}>
    <group ref={top}><Plate y={0}/></group>
    <group ref={middle}><Plate y={0} w={4.2} d={.75}/><LineSolid geometry={new THREE.BoxGeometry(1.45,.4,1.12)} position={[-.7,.10,0]} color={GHOST}/></group>
    <group ref={bottom}><Plate y={0}/></group>
    <group ref={pin}><Pin/></group>
    <group ref={latch}><Latch/></group>
  </group>;
}

function OrbitRings({ motion, autoRotate }) {
  const root=useRef();
  useFrame((state,dt)=>{if (root.current && autoRotate) root.current.rotation.y+=dt*.14;});
  const radius=[1.2,1.86,2.55];
  return <group ref={root} rotation={[.12,0,.12]}>
    <LineSolid geometry={new THREE.IcosahedronGeometry(.64,1)} materialOpacity={.07} color={MINT}/>
    <LineSolid geometry={new THREE.IcosahedronGeometry(.85,1)} materialOpacity={.008} color={GHOST}/>
    {radius.map((r,i)=><group key={r} rotation={[.35+i*.44,.14+i*.4,i*.4]}>
      <mesh><torusGeometry args={[r,.008,3,180]}/><meshBasicMaterial color={i===1?MINT:INK} transparent opacity={.50-i*.07}/></mesh>
      <mesh position={[Math.cos(motion*3+i*2)*r,Math.sin(motion*3+i*2)*r,0]}>
        <sphereGeometry args={[i===1?.13:.075,12,12]}/>
        <meshBasicMaterial color={i===1?MINT:INK}/>
      </mesh>
    </group>)}
  </group>;
}

function SignalGrid({ motion, autoRotate }) {
  const root=useRef();
  useFrame((state,dt)=>{if(root.current&&autoRotate) root.current.rotation.y+=dt*.07;});
  const nodes=useMemo(()=>{
    const list=[];
    for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++) {
      const y=Math.sin(x*1.25+z*.72)*.42;
      list.push([x*.92,y,z*.92]);
    }
    return list;
  },[]);
  const lines=useMemo(()=>{
    const points=[];
    nodes.forEach((n,i)=>{
      if(i%5!==4)points.push(new THREE.Vector3(...n),new THREE.Vector3(...nodes[i+1]));
      if(i<20)points.push(new THREE.Vector3(...n),new THREE.Vector3(...nodes[i+5]));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  },[nodes]);
  return <group ref={root} rotation={[-.27,.18,.1]}>
    <lineSegments geometry={lines}><lineBasicMaterial color={INK} transparent opacity={.38}/></lineSegments>
    {nodes.map((n,i)=><group key={i} position={n}>
      <mesh><octahedronGeometry args={[.064+(Math.sin(i*2+motion*8)+1)*.026,0]}/><meshBasicMaterial color={i%6===0?MINT:INK}/></mesh>
      {i%6===0 && <mesh rotation={[Math.PI/2,0,0]}><ringGeometry args={[.14,.148,24]}/><meshBasicMaterial color={MINT} transparent opacity={.60} side={THREE.DoubleSide}/></mesh>}
    </group>)}
  </group>;
}

function Stage({ experiment, exploded, autoRotate, resetKey }) {
  const controls=useRef();
  useEffect(()=>{controls.current?.reset();},[resetKey,experiment]);
  return <>
    <OrthographicCamera makeDefault position={experiment==='sentinel'?[0.5,2.1,10]:[7,6.4,8]} zoom={experiment==='sentinel'?63:70} near={.1} far={100}/>
    <ambientLight intensity={.8}/>
    <group scale={experiment==='assembly'?.93:1}>
      {experiment==='assembly' && <Assembly exploded={exploded}/>}
      {experiment==='orbit' && <OrbitRings motion={exploded} autoRotate={autoRotate}/>}
      {experiment==='signal' && <SignalGrid motion={exploded} autoRotate={autoRotate}/>}
      {experiment==='sentinel' && <SentinelModel exploded={exploded} autoRotate={autoRotate}/>}
    </group>
    <OrbitControls ref={controls} makeDefault enablePan={false} enableZoom={true} minZoom={experiment==='sentinel'?34:40} maxZoom={experiment==='sentinel'?110:105} minPolarAngle={.15} maxPolarAngle={Math.PI-.15} autoRotate={autoRotate&&(experiment==='assembly'||experiment==='sentinel')} autoRotateSpeed={.55} enableDamping dampingFactor={.075}/>
  </>;
}

export default function TechnicalScene({ experiment, exploded, autoRotate, resetKey }) {
  return <Canvas dpr={[1,1.8]} gl={{alpha:true,antialias:true,powerPreference:'high-performance'}} fallback={<div className="webgl-fallback">3D preview requires WebGL support.</div>}>
    <Suspense fallback={null}><Stage experiment={experiment} exploded={exploded} autoRotate={autoRotate} resetKey={resetKey}/></Suspense>
  </Canvas>;
}
