import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

const PURPLE = '#9466ff';
const GLOW = '#af8cff';

function metal(color = '#3d276f', emissive = '#1c0c4c', glow = .26) {
  return { color, metalness: .83, roughness: .23, emissive, emissiveIntensity: glow };
}

function Extruded({ shape, depth=.24, color='#3f2c7e', position=[0,0,0], rotation=[0,0,0], glow=.23 }) {
  const geometry = useMemo(() => new THREE.ExtrudeGeometry(shape, {depth, bevelEnabled:true, bevelThickness:.055, bevelSize:.044, bevelSegments:3, curveSegments:48, steps:1}), [shape,depth]);
  return <mesh geometry={geometry} position={position} rotation={rotation} castShadow receiveShadow>
    <meshStandardMaterial {...metal(color, '#27115c', glow)}/>
  </mesh>;
}

function Crescent({ top=true, ...props }) {
  const shape = useMemo(()=>{
    const s=new THREE.Shape();
    if(top){
      s.moveTo(-1.38,.03);s.bezierCurveTo(-.82,.64,.37,.85,1.38,.17);
      s.bezierCurveTo(.65,.40,-.35,.31,-.85,.04);
      s.bezierCurveTo(-1.11,-.08,-1.27,-.04,-1.38,.03);
    }else{
      s.moveTo(-1.40,-.11);s.bezierCurveTo(-.56,-.93,.55,-.76,1.40,-.08);
      s.bezierCurveTo(.55,-.43,-.39,-.46,-.92,-.12);
      s.bezierCurveTo(-1.13,.04,-1.26,-.01,-1.40,-.11);
    }
    return s;
  },[top]);
  return <Extruded shape={shape} {...props}/>;
}
function Shield({isTop}) {
  const shape=useMemo(()=>{
    const s=new THREE.Shape();
    if(isTop){
      s.moveTo(-1.19,.04);s.bezierCurveTo(-1.12,1.10,-.58,1.54,0,1.58);
      s.bezierCurveTo(.59,1.54,1.16,1.10,1.22,.04);
      s.lineTo(.84,.24);s.bezierCurveTo(.54,.67,.24,.84,0,.88);
      s.bezierCurveTo(-.32,.85,-.69,.60,-.87,.24);s.closePath();
    }else{
      s.moveTo(-1.23,.08);s.bezierCurveTo(-1.09,-.59,-.60,-1.23,0,-1.60);
      s.bezierCurveTo(.64,-1.20,1.10,-.61,1.23,.08);
      s.lineTo(.82,-.18);s.bezierCurveTo(.57,-.52,.22,-.78,0,-.90);
      s.bezierCurveTo(-.35,-.68,-.68,-.42,-.82,-.18);s.closePath();
    }
    return s;
  },[isTop]);
  return <Extruded shape={shape} depth={.3} color={isTop?'#322250':'#403070'} glow={.38}/>;
}
function EdgeLoop({radius=1.0, tube=.035, rotation=[0,0,0], color=GLOW, opacity=1}) {
  return <mesh rotation={rotation}>
    <torusGeometry args={[radius,tube,12,144]}/>
    <meshStandardMaterial color={color} emissive={color} emissiveIntensity={.5} metalness={.68} roughness={.23} transparent opacity={opacity}/>
  </mesh>;
}
function Fastener({position}) {
  return <group position={position} rotation={[Math.PI/2,0,0]}>
    <mesh><cylinderGeometry args={[.062,.062,.33,14]}/><meshStandardMaterial {...metal('#655495', '#37216b',.25)}/></mesh>
    <mesh position={[0,.18,0]}><cylinderGeometry args={[.11,.11,.075,6]}/><meshStandardMaterial {...metal('#9482c9','#55469a',.22)}/></mesh>
  </group>;
}
function Crown(){
  return <group>
    <mesh position={[0,.42,0]}><capsuleGeometry args={[.18,.62,10,24]}/><meshStandardMaterial {...metal('#2c234d','#261050',.55)}/></mesh>
    <mesh position={[0,.39,.165]}><capsuleGeometry args={[.066,.49,8,16]}/><meshStandardMaterial color="#be9bff" emissive="#7b3bff" emissiveIntensity={2.1} roughness={.28}/></mesh>
    <mesh position={[0,.42,-.01]}><boxGeometry args={[.49,.03,.39]}/><meshStandardMaterial {...metal('#554183')}/></mesh>
    <pointLight position={[0,.5,.6]} color="#925aff" intensity={2.2} distance={3.8}/>
  </group>;
}
function Shell(){return <group>
  <Shield isTop/>
  <mesh position={[0,.75,.05]}><boxGeometry args={[.12,.8,.28]}/><meshStandardMaterial {...metal('#261747','#170733',.35)}/></mesh>
  <EdgeLoop radius={1.12} tube={.019} rotation={[.08,0,0]} color="#7250dd" opacity={.65}/>
</group>}
function Iris(){return <group>
  <Crescent top position={[0,0,.12]}/>
  <Crescent top={false} position={[0,0,.12]}/>
  <mesh position={[0,0,.37]}><sphereGeometry args={[.37,48,32]}/><meshPhysicalMaterial color="#9a55ff" metalness={.42} roughness={.15} clearcoat={1} clearcoatRoughness={.13} emissive="#5e24c9" emissiveIntensity={1.05}/></mesh>
  <mesh position={[-.12,.11,.61]}><sphereGeometry args={[.095,20,12]}/><meshBasicMaterial color="#f0d9ff" transparent opacity={.85}/></mesh>
  <pointLight position={[0,0,.8]} intensity={2.5} color="#a06bff" distance={3.7}/>
</group>}
function Halo(){return <group>
  <EdgeLoop radius={1.78} tube={.073} rotation={[.19,0,-.13]} color="#9370f4"/>
  <EdgeLoop radius={1.66} tube={.018} rotation={[.19,0,-.13]} color="#d8baff" opacity={.9}/>
  {[-1,1].map(i=><mesh key={i} position={[i*1.76,-i*.18,0]} rotation={[.3,.2,.5]}><boxGeometry args={[.25,.17,.24]}/><meshStandardMaterial {...metal('#4b3782')}/></mesh>)}
</group>}
function Base(){return <group><Shield isTop={false}/>
  <mesh position={[0,-.87,.14]}><boxGeometry args={[.82,.13,.38]}/><meshStandardMaterial {...metal('#4e3b83')}/></mesh>
</group>}

const anchors=[[-1.16,.76,.5],[1.16,.76,.5],[-1.22,-.84,.5],[1.22,-.84,.5]];
const guides=[-1.08,0,1.08];

export default function SentinelModel({ exploded=0.72 }) {
  const root=useRef();
  const parts=useRef([]);
  const setPart=(index)=>(node)=>{parts.current[index]=node;};
  const positions=useMemo(()=>[1.86, .73, .05, -.04, -1.25, .10],[]);
  const spread=[1.55, .85, .34, -.35, -1.27, .05];
  useFrame((state,delta)=>{
    const rate=1-Math.exp(-delta*5.3);
    positions.forEach((p,i)=>{const node=parts.current[i];if(node) node.position.y=THREE.MathUtils.lerp(node.position.y,p+spread[i]*exploded,rate);});
    if(root.current){
      // OrbitControls already owns the auto-rotation; avoid spinning the model a second time.
      root.current.rotation.y=THREE.MathUtils.damp(root.current.rotation.y,-.10,1.3,delta);
      root.current.position.y=Math.sin(state.clock.elapsedTime*1.05)*.035;
    }
  });
  return <group ref={root} scale={.83} rotation={[.10,-.1,0]}>
    <group ref={setPart(0)}><Crown/></group>
    <group ref={setPart(1)}><Shell/></group>
    <group ref={setPart(2)}><Halo/></group>
    <group ref={setPart(3)}><Iris/></group>
    <group ref={setPart(4)}><Base/></group>
    <group ref={setPart(5)}>{anchors.map((a,i)=><Fastener key={i} position={a}/>)}</group>
    {guides.map((x,i)=><group key={x} position={[x,0,-.24]}>
      <mesh position={[0,0,0]}><cylinderGeometry args={[.006,.006,6.3,5]}/><meshBasicMaterial color={PURPLE} transparent opacity={i===1?.28:.12} depthWrite={false}/></mesh>
    </group>)}
  </group>;
}
