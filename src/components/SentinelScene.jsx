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
  return <group>
    <mesh castShadow>
      <sphereGeometry args={[1.64,48,24,0,Math.PI*2,isTop?.12:2.49,.51]}/>
      <meshPhysicalMaterial {...metal(isTop?'#37274f':'#4b306c','#2d125c',.25)}
        clearcoat={.7} clearcoatRoughness={.15} side={THREE.DoubleSide}/>
    </mesh>
  </group>;
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
    <mesh position={[0,1.73,0]}>
      <capsuleGeometry args={[.16,.35,8,20]}/>
      <meshPhysicalMaterial {...metal('#3c2a60','#2b0d65',.45)} clearcoat={1}/>
    </mesh>
    <mesh position={[0,1.76,.175]}>
      <capsuleGeometry args={[.064,.28,6,16]}/>
      <meshBasicMaterial color="#d3aeff" toneMapped={false}/>
    </mesh>
    <mesh position={[0,2.04,0]}>
      <sphereGeometry args={[.08,16,12]}/>
      <meshBasicMaterial color="#f5e8ff" toneMapped={false}/>
    </mesh>
    <pointLight position={[0,1.9,.6]} color="#9863ff" intensity={2.5} distance={4}/>
  </group>;
}
function Shell(){
  return <group>
    <Shield isTop/>
    <mesh>
      <sphereGeometry args={[1.60,46,26,Math.PI,Math.PI,.55,2]}/>
      <meshPhysicalMaterial {...metal('#241a39','#1b0c3e',.14)} clearcoat={.6} side={THREE.DoubleSide}/>
    </mesh>
    {[[.12,.42],[2.61,.41]].map(([phi,len],i)=>
      <mesh key={i} castShadow>
        <sphereGeometry args={[1.69,34,22,phi,len,.70,1.7]}/>
        <meshPhysicalMaterial {...metal(i?'#3b2c5a':'#493062','#301257',.25)}
          clearcoat={.78} clearcoatRoughness={.13} side={THREE.DoubleSide}/>
      </mesh>)}
  </group>;
}
function Iris(){
  return <group>
    <mesh castShadow>
      <sphereGeometry args={[1.36,56,36]}/>
      <meshPhysicalMaterial color="#160c30" roughness={.16} metalness={.42}
        clearcoat={1} clearcoatRoughness={.07} emissive="#2d0b64" emissiveIntensity={.32}/>
    </mesh>
    <mesh>
      <sphereGeometry args={[1.41,46,30]}/>
      <meshPhysicalMaterial color="#8652d9" metalness={.15} roughness={.1}
        transparent opacity={.10} depthWrite={false} clearcoat={1}/>
    </mesh>
    <mesh rotation={[0,Math.PI/2,0]}>
      <torusGeometry args={[1.44,.025,8,120]}/>
      <meshStandardMaterial {...metal('#674d8f','#230d5d',.28)}/>
    </mesh>
    <group position={[0,0,1.56]}>
      <mesh rotation={[Math.PI/2,0,0]}>
        <cylinderGeometry args={[1.02,1.02,.14,64]}/>
        <meshStandardMaterial {...metal('#21153c','#250e52',.3)}/>
      </mesh>
      <Crescent top position={[0,0,.08]} color="#8e65db" glow={.65}/>
      <Crescent top={false} position={[0,0,.08]} color="#7853c9" glow={.65}/>
      <mesh position={[0,0,.21]}>
        <sphereGeometry args={[.32,36,28]}/>
        <meshPhysicalMaterial color="#bb8dff" metalness={.32} roughness={.12}
          clearcoat={1} emissive="#7430d2" emissiveIntensity={1.1}/>
      </mesh>
      <mesh position={[-.09,.09,.49]}>
        <sphereGeometry args={[.075,14,12]}/>
        <meshBasicMaterial color="#f6dfff" toneMapped={false}/>
      </mesh>
      <pointLight position={[0,0,1.5]} intensity={2.2} color="#a569ff" distance={4}/>
    </group>
  </group>;
}
function Halo(){
  return <group>
    <EdgeLoop radius={1.94} tube={.072} rotation={[1.06,.28,-.25]} color="#ad82ff"/>
    <EdgeLoop radius={2.025} tube={.015} rotation={[1.06,.28,-.25]} color="#caa8ff"/>
    <EdgeLoop radius={1.80} tube={.029} rotation={[.13,0,.19]} color="#8c64da" opacity={.7}/>
    {[-1,1].map(i=><mesh key={i} position={[i*1.86,-i*.35,.38]}>
      <sphereGeometry args={[.11,16,12]}/>
      <meshPhysicalMaterial color="#ae8cff" metalness={.55} roughness={.15}
        emissive="#6333c4" emissiveIntensity={.45}/>
    </mesh>)}
  </group>;
}
function Base(){
  return <group>
    <Shield isTop={false}/>
    <mesh position={[0,-1.76,0]}>
      <cylinderGeometry args={[.44,.32,.14,32]}/>
      <meshPhysicalMaterial {...metal('#5d418c','#36107b',.45)} clearcoat={.75}/>
    </mesh>
  </group>;
}

const anchors=[[-1.16,.76,.5],[1.16,.76,.5],[-1.22,-.84,.5],[1.22,-.84,.5]];
const guides=[-1.08,0,1.08];

export default function SentinelModel({ exploded=0.18 }) {
  const root=useRef();
  const parts=useRef([]);
  const setPart=(index)=>(node)=>{parts.current[index]=node;};

  const targets=useMemo(()=>[
    [0,1.35,0], [0,0,-.65], [0,.23,.62],
    [0,0,1.25], [0,-1.35,0], [0,0,-1.25]
  ],[]);
  useFrame((state,delta)=>{
    const rate=1-Math.exp(-Math.min(delta,.08)*5);
    targets.forEach((target,i)=>{
      const node=parts.current[i];
      if(!node)return;
      for(let axis=0;axis<3;axis++){
        node.position.setComponent(axis,THREE.MathUtils.lerp(
          node.position.getComponent(axis),target[axis]*exploded,rate
        ));
      }
    });
    if(root.current)root.current.position.y=Math.sin(state.clock.elapsedTime*.9)*.04;
  });

  return <group ref={root} scale={.89} rotation={[.045,-.08,0]}>
    <pointLight position={[2,3,5]} intensity={15} distance={11} color="#d6baff"/>
    <pointLight position={[-3,-1,3]} intensity={9} distance={9} color="#7c4cff"/>
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
