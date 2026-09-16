import {useEffect,useMemo,useRef} from 'react';
import {Canvas,useFrame,useThree} from '@react-three/fiber';
import {OrbitControls} from '@react-three/drei';
import {CatmullRomCurve3,TubeGeometry,Vector3} from 'three';
import {RoundedBoxGeometry} from 'three/addons/geometries/RoundedBoxGeometry.js';
function Helices({progress}:{progress:number}){
 const geometries=useMemo(()=>Array.from({length:7},(_,i)=>{
  const angle=i*Math.PI*2/7,cx=Math.cos(angle)*.4,cz=Math.sin(angle)*.32;
  const points=Array.from({length:100},(_,j)=>{const u=j/99;return new Vector3(cx+.08*Math.cos(u*Math.PI*12+i),-.62+u*1.28,cz+.08*Math.sin(u*Math.PI*12+i));});
  return new TubeGeometry(new CatmullRomCurve3(points),96,.046,7,false);
 }),[]);
 useEffect(()=>()=>geometries.forEach(g=>g.dispose()),[geometries]);
 return <group rotation={[0,0,progress>.58?-.07:0]}>{geometries.map((g,i)=><mesh key={i} geometry={g}><meshPhysicalMaterial color={progress>.5?'#cc9b61':'#99887c'} roughness={.42} clearcoat={.1}/></mesh>)}</group>;
}
function Bilayer(){
 const g=useMemo(()=>new RoundedBoxGeometry(2.35,.12,1.25,3,.055),[]);
 useEffect(()=>()=>g.dispose(),[g]);
 return <group>{[-1,1].map(side=><group key={side} position={[side*1.66,0,-.1]}>{[-.25,.25].map(y=><mesh key={y} position={[0,y,0]} geometry={g}><meshStandardMaterial color={y>0?'#536278':'#454b66'} roughness={.6}/></mesh>)}{Array.from({length:12},(_,i)=><mesh key={i} position={[-1.05+i*.19,0,.43]}><cylinderGeometry args={[.018,.018,.4,7]}/><meshStandardMaterial color="#373e55" roughness={.8}/></mesh>)}</group>)}</group>;
}
function PeptideSymbol({progress}:{progress:number}){
 const t=Math.min(1,progress/.48),ease=t*t*(3-2*t);
 const points=useMemo(()=>Array.from({length:17},(_,i)=>new Vector3(Math.cos(i*.94)*.16,(i-8)*.045,Math.sin(i*.94)*.16)),[]);
 const backbone=useMemo(()=>new TubeGeometry(new CatmullRomCurve3(points),80,.032,8,false),[points]);
 useEffect(()=>()=>backbone.dispose(),[backbone]);
 return <group position={[-1.35*(1-ease),1.5-ease*.58,.18]} rotation={[0,0,.5*(1-ease)]}><mesh geometry={backbone}><meshPhysicalMaterial color="#32bdb8" roughness={.35}/></mesh>{points.map((p,i)=><mesh key={i} position={p}><sphereGeometry args={[.06,12,8]}/><meshPhysicalMaterial color="#49c9c2" roughness={.4}/></mesh>)}</group>;
}
function Signal({progress}:{progress:number}){
 const visible=progress>.6;
 return <group visible={visible}>{Array.from({length:6},(_,i)=>{const u=((progress-.6)*2.5+i/6)%1;return <mesh key={i} position={[.3*Math.sin(u*3),-.8-u*.9,.12]}><sphereGeometry args={[.04,12,8]}/><meshBasicMaterial color="#8ed1a0" transparent opacity={.9-u*.4}/></mesh>;})}<mesh position={[.1,-1.8,0]} scale={[.42,.17,.25]}><icosahedronGeometry args={[1,2]}/><meshStandardMaterial color="#678e7f" roughness={.7}/></mesh></group>;
}
function Drawn({onReady}:{onReady:()=>void}){const frames=useRef(0);useFrame(()=>{if(++frames.current===3)onReady();});return null;}
function Reset({version}:{version:number}){const {camera,controls}=useThree();useEffect(()=>{camera.position.set(0,1.2,7.5);const c=controls as {target:Vector3;update:()=>void}|null;c?.target.set(0,0,0);c?.update();},[version,camera,controls]);return null;}
export function ConceptualScene({progress,reset,onReady}:{progress:number;reset:number;onReady:()=>void}){
 return <Canvas camera={{position:[0,1.2,7.5],fov:38}} dpr={[1,1.5]} gl={{antialias:true}} fallback={<div>WebGL is unavailable. Use the step descriptions alongside this scene.</div>}>
  <color attach="background" args={['#09151e']}/><ambientLight intensity={.8}/><directionalLight position={[-3,4,5]} intensity={2.8} color="#f5e5d1"/><directionalLight position={[3,2,-3]} intensity={1.6} color="#aacbd6"/>
  <Bilayer/><Helices progress={progress}/><PeptideSymbol progress={progress}/><Signal progress={progress}/><OrbitControls makeDefault enableDamping minDistance={3.4} maxDistance={12}/><Reset version={reset}/><Drawn onReady={onReady}/>
 </Canvas>;
}
