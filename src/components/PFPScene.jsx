import React, { Suspense, useMemo } from 'react';
import * as THREE from 'three';
import { Canvas, useLoader } from '@react-three/fiber';
import { OrbitControls, Center, Float, ContactShadows } from '@react-three/drei';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const MATERIALS = {
  resin: { color: '#dc9fff', metalness: .19, roughness: .11, transmission: .06, clearcoat: 1, clearcoatRoughness: .06 },
  chrome: { color: '#a8b8dc', metalness: .96, roughness: .12, transmission: 0, clearcoat: .72, clearcoatRoughness: .10 },
  holo: { color: '#75e8ed', metalness: .48, roughness: .16, transmission: .12, clearcoat: 1, clearcoatRoughness: .08 }
};

function ActualModel({ url }) {
  const gltf = useLoader(GLTFLoader, url);
  // Clone so scene transformations never mutate a cached GLTF instance.
  const instance = useMemo(() => {
    const clone = gltf.scene.clone(true);
    const bounds = new THREE.Box3().setFromObject(clone);
    const size = bounds.getSize(new THREE.Vector3());
    const center = bounds.getCenter(new THREE.Vector3());
    const maxDimension = Math.max(size.x,size.y,size.z) || 1;
    clone.position.sub(center);
    clone.scale.setScalar(3 / maxDimension);
    return clone;
  }, [gltf]);
  return <group><primitive object={instance}/></group>;
}

function ImageRelief({ source, material, depth, exploded }) {
  const geometry = useMemo(() => {
    if (!source?.alpha) return null;
    const count = 120;
    const shape = new THREE.Shape();
    const {alpha,width,height} = source;
    const cx = width / 2, cy = height / 2;
    const maxR = Math.hypot(cx,cy);
    for (let i=0;i<count;i++) {
      const a = 2*Math.PI*i/count;
      let edge=0;
      for (let r=0;r<maxR;r+=1.5) {
        const x=Math.round(cx+Math.cos(a)*r);
        const y=Math.round(cy-Math.sin(a)*r);
        if(x>=0&&x<width&&y>=0&&y<height&&alpha[y*width+x]>95)edge=r;
      }
      const px=Math.cos(a)*edge/Math.max(width,height)*3.1;
      const py=Math.sin(a)*edge/Math.max(width,height)*3.1;
      if(i===0)shape.moveTo(px,py);else shape.lineTo(px,py);
    }
    shape.closePath();
    return new THREE.ExtrudeGeometry(shape,{depth:.27,bevelEnabled:true,bevelThickness:.055,bevelSize:.035,bevelSegments:3,curveSegments:4});
  }, [source]);

  const colorTexture = useMemo(() => {
    if(!source?.colorCanvas)return null;
    const t=new THREE.CanvasTexture(source.colorCanvas);
    t.colorSpace=THREE.SRGBColorSpace;
    t.anisotropy=4;
    return t;
  },[source]);
  const heightTexture=useMemo(() => {
    if(!source?.heightCanvas)return null;
    const t=new THREE.CanvasTexture(source.heightCanvas);
    t.colorSpace=THREE.NoColorSpace;
    return t;
  },[source]);
  const options=MATERIALS[material]||MATERIALS.resin;
  if(!source)return <PlaceholderOrb/>;
  return <group>
    <mesh geometry={geometry} position={[0,0,-.26-exploded*.50]} castShadow>
      <meshPhysicalMaterial {...options} emissive={material==='holo'?'#0b606a':'#381452'} emissiveIntensity={.14}/>
    </mesh>
    <mesh position={[0,0,.025+exploded*.15]} castShadow>
      <planeGeometry args={[3.1*source.aspectWidth,3.1*source.aspectHeight,100,100]}/>
      <meshPhysicalMaterial map={colorTexture} displacementMap={heightTexture}
        displacementScale={depth*.42} displacementBias={0}
        transparent alphaTest={.15} depthWrite side={THREE.DoubleSide}
        metalness={material==='chrome'?.38:.16} roughness={.24} clearcoat={1} clearcoatRoughness={.1}/>
    </mesh>
    {exploded>.03&&<mesh position={[0,0,-.12-exploded*.26]}>
      <ringGeometry args={[1.7,1.71,90]}/>
      <meshBasicMaterial color="#a584ff" transparent opacity={.22}/>
    </mesh>}
  </group>;
}

function PlaceholderOrb() {
  return <group>
    <mesh><icosahedronGeometry args={[1.15,4]}/>
      <meshPhysicalMaterial {...MATERIALS.resin} color="#573da0" transparent opacity={.76}/></mesh>
    <mesh rotation={[.4,.15,-.3]}><torusGeometry args={[1.45,.025,10,128]}/>
      <meshStandardMaterial color="#b99bff" emissive="#6434bd" emissiveIntensity={1.2}/></mesh>
    <mesh rotation={[-.8,.4,.2]}><torusGeometry args={[1.63,.012,6,128]}/>
      <meshBasicMaterial color="#9beaff" transparent opacity={.63}/></mesh>
    <mesh position={[0,0,1.12]}><sphereGeometry args={[.26,32,20]}/>
      <meshBasicMaterial color="#b997ff"/></mesh>
  </group>;
}

class ViewErrorBoundary extends React.Component {
  constructor(props){super(props);this.state={error:false};}
  static getDerivedStateFromError(){return {error:true};}
  componentDidUpdate(prev){if(prev.modelUrl!==this.props.modelUrl&&this.state.error)this.setState({error:false});}
  render(){return this.state.error?null:this.props.children;}
}

export default function PFPScene({source,material='resin',depth=.5,exploded=0,modelUrl}) {
  return <div className="pfp-canvas-frame">
    <Canvas camera={{position:[0,.15,6.5],fov:38}} dpr={[1,1.75]}
      gl={{antialias:true,alpha:true,powerPreference:'high-performance'}}
      fallback={<div className="pfp-canvas-fallback">WebGL is required to view 3D previews.</div>}>
      <color attach="background" args={['#0d0a16']}/>
      <ambientLight intensity={1.6}/>
      <hemisphereLight args={['#dec9ff','#18112b',2.0]}/>
      <directionalLight position={[3,5,5]} intensity={4} color="#ffffff"/>
      <directionalLight position={[-4,2,3]} intensity={3.5} color="#a67dff"/>
      <pointLight position={[1,-2,2]} intensity={10} color="#a34ef5" distance={7}/>
      <Suspense fallback={null}>
        <Float speed={1.1} rotationIntensity={.06} floatIntensity={.2}>
          <Center>
            {modelUrl?<ViewErrorBoundary modelUrl={modelUrl}><ActualModel url={modelUrl}/></ViewErrorBoundary>:
              <ImageRelief source={source} material={material} depth={depth} exploded={exploded}/>}
          </Center>
        </Float>
        <ContactShadows position={[0,-2.15,0]} opacity={.3} scale={7} blur={2.8} far={6} color="#ad7eff"/>
      </Suspense>
      <OrbitControls enablePan={false} minDistance={3.4} maxDistance={10}
        enableDamping dampingFactor={.08} minPolarAngle={.2} maxPolarAngle={Math.PI-.2}/>
    </Canvas>
    <div className="pfp-crosshair one" aria-hidden="true">+</div>
    <div className="pfp-crosshair two" aria-hidden="true">+</div>
    <span className="pfp-stage-marker">FIG. PFP-01 / LIVE WEBGL</span>
    <span className="pfp-stage-hint">DRAG TO ROTATE · PINCH / SCROLL TO ZOOM</span>
  </div>;
}
