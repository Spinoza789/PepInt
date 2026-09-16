import * as T from 'three';
import {OrbitControls} from 'three/addons/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/addons/environments/RoomEnvironment.js';
import {geometryFor,type AnatomyData,type RenderPart} from './model';
import {createTissueMaterial,tissuePalette,tissueTexture} from './materials';
import {bodyBounds,torsoBounds,fittedCamera,moveCamera} from './camera';
import {PointerTap} from './pointer-tap';
import type {ExperienceState} from '../../state/useExperienceStore';
import {organContent} from '../../data/organs';
import type {OrganId} from '../types';
import {concentrationAt,effectAt} from '../pk';
import {pathwaySteps} from '../../data/pathwaySteps';
import {loadHeadAtlas,type HeadAtlas} from '../head/headAtlas';

type Entry={part:RenderPart;mesh:T.Mesh<T.BufferGeometry,T.MeshPhysicalMaterial>};
export function createAnatomyRenderer(host:HTMLDivElement,data:AnatomyData,initial:ExperienceState,onError:(s:string)=>void){
 const renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(devicePixelRatio,1.6));renderer.setClearColor('#07111c',0);
 renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1;
 renderer.localClippingEnabled=true;host.appendChild(renderer.domElement);
 const canvas=renderer.domElement;canvas.setAttribute('aria-label','3D reference anatomy. Use the adjacent organ list to select with a keyboard.');
 const scene=new T.Scene(),camera=new T.PerspectiveCamera(32,1,.005,12);
 const controls=new OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.1;
 controls.minDistance=.12;controls.maxDistance=5;controls.target.set(0,1.12,-.035);
 const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),environment=pmrem.fromScene(room,.08);
 scene.environment=environment.texture;scene.environmentIntensity=.3;room.dispose();pmrem.dispose();
 scene.add(new T.HemisphereLight('#e5edef','#222432',.85));
 for(const [color,intensity,position] of [['#fff0df',2.6,[-2,3,3]],['#b7d1e3',1.1,[2,1,-2]],['#f5bda8',.5,[2,.4,2]]] as const){const l=new T.DirectionalLight(color,intensity);l.position.fromArray(position);scene.add(l);}
 const texture=tissueTexture(false),lungTexture=tissueTexture(false,'lung'),fibres=tissueTexture(true);
 const entries:Entry[]=data.manifest.parts.map(part=>{const mesh=new T.Mesh(geometryFor(part,data.buffer),createTissueMaterial(part.style,part.style==='muscle'?fibres:part.style==='lung'?lungTexture:texture));mesh.name=part.id;mesh.userData.organId=part.organId;scene.add(mesh);return {part,mesh};});
 const headGroup=new T.Group();headGroup.name='z-anatomy-head';headGroup.visible=false;scene.add(headGroup);
 let headAtlas:HeadAtlas|null=null;
 const headAbort=new AbortController();
 const brainGroup=new T.Group();brainGroup.name='conceptual-brain-inset';brainGroup.position.set(.27,1.37,.12);brainGroup.scale.setScalar(1.35);brainGroup.visible=false;scene.add(brainGroup);
 const brainMaterial=new T.MeshPhysicalMaterial({color:'#8667aa',roughness:.5,clearcoat:.12,transparent:true,opacity:.86,depthWrite:false});
 for(const side of [-1,1]){const lobe=new T.Mesh(new T.IcosahedronGeometry(1,3),brainMaterial);lobe.scale.set(.12,.105,.085);lobe.position.set(side*.07,0,0);brainGroup.add(lobe);for(let i=0;i<5;i++){const fold=new T.Mesh(new T.TorusGeometry(.025,.006,6,12,Math.PI*1.5),brainMaterial);fold.position.set(side*.07+(i-2)*.025,.015+(i%2)*.035,.072);fold.rotation.set(Math.PI/2,(i-2)*.22,.15*side);brainGroup.add(fold);}}
 const brainSignal=new T.Mesh(new T.SphereGeometry(.018,10,8),new T.MeshBasicMaterial({color:'#bba0e4',transparent:true,opacity:0}));brainSignal.position.set(0,.02,.1);brainGroup.add(brainSignal);
 const crop=[new T.Plane(new T.Vector3(0,1,0),-.76),new T.Plane(new T.Vector3(0,-1,0),1.48)];
 const throughPlane=new T.Plane(new T.Vector3(0,0,-1),0);
 const tooltip=document.createElement('div');tooltip.className='atlas-tooltip';tooltip.hidden=true;tooltip.setAttribute('role','tooltip');host.appendChild(tooltip);
 const labels=new Map<OrganId,HTMLButtonElement>();
 const labelIds:OrganId[]=['lungs','heart','liver','stomach','pancreas','smallIntestine','largeIntestine','kidneys','brain'];
 const boundsFor=(id:OrganId)=>{if(id==='brain'&&headAtlas&&!headAtlas.brainBounds.isEmpty())return headAtlas.brainBounds.clone();if(id==='brain')return new T.Box3(new T.Vector3(.02,1.16,-.02),new T.Vector3(.57,1.68,.3));const b=new T.Box3();entries.forEach(({part,mesh})=>{if(part.organId===id)b.union(mesh.geometry.boundingBox!);});return b;};
 for(const id of labelIds){const el=document.createElement('button');el.className='atlas-label';el.textContent=organContent[id].displayName;el.onclick=()=>state.selectOrgan(id);host.appendChild(el);labels.set(id,el);}
 // Small, finite instanced overlay. It illustrates circulation, not a physical drug trajectory.
 const flowCurve=new T.CatmullRomCurve3([new T.Vector3(-.018,1.34,.075),new T.Vector3(.022,1.26,.07),new T.Vector3(.002,1.15,.07),new T.Vector3(-.005,1.04,.07),new T.Vector3(.015,.94,.07),new T.Vector3(-.03,.85,.07)]);
 const particleGeometry=new T.SphereGeometry(.0025,8,6),particleMaterial=new T.MeshBasicMaterial({color:'#45c9c7',transparent:true,depthWrite:false,depthTest:false});
 const particles=new T.InstancedMesh(particleGeometry,particleMaterial,24);particles.name='conceptual-peptide-circulation';particles.frustumCulled=false;particles.renderOrder=8;scene.add(particles);
 const dummy=new T.Object3D(),projected=new T.Vector3();
 let state=initial,dirty=true,disposed=false,raf=0,destination:ReturnType<typeof fittedCamera>|null=null,prevTime=0,phase=0,lastRequest=-1;
 let headReady=false;
 const headSystemCenters=new Map<string,T.Vector3>();
 const headClipPlane=new T.Plane(new T.Vector3(1,0,0),0);
  loadHeadAtlas(headAbort.signal).then(loaded=>{
   if(disposed){loaded.dispose();return;}
   headAtlas=loaded;headReady=true;
   for(const record of loaded.records){const center=headSystemCenters.get(record.source.system)??new T.Vector3();center.add(record.center);headSystemCenters.set(record.source.system,center);}
   for(const [system,center] of headSystemCenters){const count=loaded.records.filter(record=>record.source.system===system).length;center.multiplyScalar(1/count);}
   loaded.records.forEach(record=>{
     const {source,mesh}=record;
     mesh.userData.organId=source.system==='brain'?'brain':null;
     mesh.userData.headSystem=source.system;
     headGroup.add(mesh);
   });
   dirty=true;
   update(state);
 }).catch(error=>{if(!disposed&&error?.name!=='AbortError')onError(error instanceof Error?error.message:'The head anatomy could not be loaded.');});
 const frameBox=()=>state.viewExtent==='body'?bodyBounds:torsoBounds;
 function update(next:ExperienceState){
 const previous=state;state=next;
  const storyOrgan=state.pathwayPlaying?pathwaySteps[state.pathwayStep]?.organId:null;
  const guidedBrain=state.pathwayPlaying&&state.pathwayStep===6;
  brainGroup.visible=!headReady&&(state.selectedOrganId==='brain'||storyOrgan==='brain'||state.pathwayStep===6);
  brainSignal.material.opacity=state.pathwayStep===6?.95:0;
  throughPlane.constant=.18-state.cutDepth*.4;
  entries.forEach(({part,mesh})=>{
   const mat=mesh.material,outer=part.layer==='shell'||part.layer==='muscles'||part.layer==='ribs';
   const selected=(state.selectedOrganId===part.organId&&part.organId!==null)||storyOrgan===part.organId;
   let opacity=part.layer==='shell'?state.shellOpacity:part.layer==='muscles'?state.muscleOpacity:part.layer==='ribs'?.32:1;
   if(state.layerMode==='transparent'&&outer)opacity*=part.layer==='shell'?.15:.22;
   mesh.visible=(part.layer==='organs'||state.layers[part.layer])&&(state.layerMode!=='focus'||selected)&&!(guidedBrain&&(part.layer==='shell'||part.layer==='muscles'||part.layer==='ribs'));
   if(opacity<=.001)mesh.visible=false;
   mat.opacity=opacity;mat.transparent=opacity<.999;mat.depthWrite=!mat.transparent;
   mat.side=part.layer==='shell'&&opacity<.999?T.FrontSide:T.DoubleSide;
   const planes=state.viewExtent==='torso'?[...crop]:[];
   if(state.layerMode==='cutaway'&&outer)planes.push(throughPlane);
   if((mat.clippingPlanes?.length??0)!==planes.length)mat.needsUpdate=true;
   mat.clippingPlanes=planes;
   mat.color.set(tissuePalette[part.style]??'#be9c87');
   if(state.selectedOrganId&&!selected&&part.layer==='organs')mat.color.multiplyScalar(.62);
   mat.emissive.set(selected?'#a36925':state.hoveredOrganId===part.organId&&part.organId?'#694624':'#000000');mat.emissiveIntensity=selected?.32:.13;
   if(Boolean(mat.bumpMap)!==state.textures){mat.bumpMap=state.textures?(part.style==='muscle'?fibres:part.style==='lung'?lungTexture:texture):null;mat.needsUpdate=true;}
  });
  if(headReady&&headAtlas){
   const atlas=headAtlas;
   const showHead=state.viewExtent==='body'&&state.headVisible;
   headGroup.visible=showHead;
   atlas.records.forEach(({source,mesh,baseColor})=>{
    const mat=mesh.material;
    const selected=state.headSelection?.key===source.key||(state.selectedOrganId==='brain'&&source.system==='brain');
    const layerVisible=state.headSystem==='all'||state.headSystem===source.system;
    let opacity=source.tissue==='membrane'?.2:source.tissue==='glass'?.13:source.tissue==='csf'?.46:1;
    if(source.system==='muscle')opacity*=state.muscleOpacity;
    if(state.layerMode==='transparent'&&(source.system==='muscle'||source.system==='skull'))opacity*=.2;
    if(state.layerMode==='cutaway'&&(source.system==='muscle'||source.system==='skull'))opacity*=.42;
    if(state.headSurface==='ghost')opacity*=.2;
    if(selected)opacity=Math.max(opacity,.86);
    mesh.visible=showHead&&layerVisible&&(state.layerMode!=='focus'||selected);
    mat.opacity=opacity;mat.transparent=opacity<.999||source.tissue==='membrane'||source.tissue==='glass'||source.tissue==='csf'||state.headSurface==='ghost';mat.depthWrite=!mat.transparent;
    mat.color.copy(baseColor);
    if(state.headSurface==='porcelain')mat.color.set('#cbd5db');
    if(state.selectedOrganId&&source.system!=='brain'&&source.system!=='skull')mat.color.multiplyScalar(.66);
    mat.wireframe=state.headSurface==='wire';
    mat.emissive.set(selected?'#a36925':'#000000');mat.emissiveIntensity=selected?.34:0;
    const center=headSystemCenters.get(source.system);if(center){const amount=state.headExplode*(source.system==='brain'?.11:.2);const direction=mesh.geometry.boundingBox!.getCenter(new T.Vector3()).sub(center).normalize();mesh.position.copy(direction.multiplyScalar(amount));}
    if(state.headClip){const box=atlas.bounds;const x=T.MathUtils.lerp(box.min.x,box.max.x,(state.headClipPosition+1)/2);headClipPlane.normal.set(1,0,0);headClipPlane.constant=-x;mat.clippingPlanes=[headClipPlane];}else mat.clippingPlanes=[];
   });
  }
  const requestChanged=lastRequest!==state.cameraRequestVersion;
  if(requestChanged){lastRequest=state.cameraRequestVersion;const request=state.cameraRequest;
   let box=request.kind==='organ'?boundsFor(request.organId):frameBox();if(box.isEmpty())box=frameBox();
   if(request.kind==='body'&&state.viewExtent==='body'&&headAtlas)box=bodyBounds.clone().union(headAtlas.bounds);
   destination=fittedCamera(box,camera);
   if(state.reducedMotion){moveCamera(camera,controls,destination,1);destination=null;}
  }
  if(previous.selectedOrganId!==state.selectedOrganId)tooltip.hidden=true;
  host.dataset.layers=entries.filter(e=>e.mesh.visible).map(e=>e.part.layer).filter((v,i,a)=>a.indexOf(v)===i).join(',');
  host.dataset.selected=state.selectedOrganId??'';host.dataset.mode=state.layerMode;
  host.dataset.time=state.currentTimeDays.toFixed(2);dirty=true;
 }
 function resize(){const w=host.clientWidth,h=host.clientHeight;if(!w||!h)return;
  camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);
   const box=state.layerMode==='focus'&&state.selectedOrganId?boundsFor(state.selectedOrganId):frameBox();
   if(state.viewExtent==='body'&&state.headVisible&&headAtlas)box.union(headAtlas.bounds);
  const fitted=fittedCamera(box.isEmpty()?frameBox():box,camera);moveCamera(camera,controls,fitted,1);destination=null;dirty=true;
 }
 const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
 controls.addEventListener('change',()=>{dirty=true;});controls.addEventListener('start',()=>{destination=null;tooltip.hidden=true;});
 const tap=new PointerTap(),ray=new T.Raycaster(),pointer=new T.Vector2();
 function pick(e:PointerEvent){const rect=canvas.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,1-(e.clientY-rect.top)/rect.height*2);ray.setFromCamera(pointer,camera);
 const candidates=entries.filter(({part,mesh})=>mesh.visible&&part.organId&&part.layer==='organs').map(e=>e.mesh);
  if(headReady&&headAtlas) candidates.push(...headAtlas.records.filter(record=>record.mesh.visible).map(record=>record.mesh));
  for(const hit of ray.intersectObjects(candidates,false)){
   const mat=(hit.object as T.Mesh<T.BufferGeometry,T.MeshPhysicalMaterial>).material;
   if(mat.clippingPlanes?.some(p=>p.distanceToPoint(hit.point)<0))continue;
   if(hit.object.userData.headPart){const source=hit.object.userData.headPart as HeadAtlas['records'][number]['source'];return {head:source};}
   return hit.object.userData.organId as OrganId;
  }return null;
 }
 const down=(e:PointerEvent)=>tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);
 const up=(e:PointerEvent)=>{if(tap.up(e.pointerId,e.clientX,e.clientY)){const picked=pick(e);if(picked&&typeof picked==='object'&&'head' in picked){const source=picked.head;state.selectHeadPart({key:source.key,name:source.name,system:source.system,side:source.side});state.selectOrgan(source.system==='brain'?'brain':null);}else state.selectOrgan(picked as OrganId|null);}};
 const cancel=(e:PointerEvent)=>tap.cancel(e.pointerId);
 const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons)return;
  const picked=pick(e);const id=picked&&typeof picked==='string'?picked:null;if(state.hoveredOrganId!==id)state.setHoveredOrgan(id);canvas.style.cursor=picked?'pointer':'grab';tooltip.hidden=!picked;
  if(picked){const title=typeof picked==='string'?organContent[picked].displayName:picked.head.name;tooltip.textContent=title;const r=host.getBoundingClientRect();tooltip.style.left=`${Math.min(e.clientX-r.left+12,r.width-130)}px`;tooltip.style.top=`${e.clientY-r.top+14}px`;}
 };
 const leave=()=>{tooltip.hidden=true;state.setHoveredOrgan(null);};
 canvas.addEventListener('pointerdown',down);canvas.addEventListener('pointerup',up);canvas.addEventListener('pointermove',move);canvas.addEventListener('pointercancel',cancel);canvas.addEventListener('pointerleave',leave);
 const contextLost=(e:Event)=>{e.preventDefault();onError('The graphics context was lost. Reload the anatomy to continue.');};canvas.addEventListener('webglcontextlost',contextLost);
 function draw(time:number){if(disposed)return;raf=requestAnimationFrame(draw);const dt=Math.min(.1,(time-prevTime)/1000||.016);prevTime=time;
  const storyOrgan=state.pathwayPlaying?pathwaySteps[state.pathwayStep]?.organId:null;
  if(destination){moveCamera(camera,controls,destination,state.reducedMotion?1:1-Math.exp(-dt*8));if(camera.position.distanceTo(destination.position)<.001){moveCamera(camera,controls,destination,1);destination=null;}dirty=true;}
  controls.update();
  const c=concentrationAt(state.currentTimeDays,state.halfLifeDays,state.dosingMode),intensity=effectAt(c);
  particles.visible=c>.005;particleMaterial.opacity=intensity*.8;
  if(particles.visible){if(state.timelinePlaying&&!state.reducedMotion)phase+=dt*.08;
   for(let i=0;i<24;i++){dummy.position.copy(flowCurve.getPoint((i/24+phase)%1));dummy.updateMatrix();particles.setMatrixAt(i,dummy.matrix);}
   particles.instanceMatrix.needsUpdate=true;if(state.timelinePlaying&&!state.reducedMotion)dirty=true;
  }
  if(!dirty)return;renderer.render(scene,camera);dirty=false;
  labels.forEach((el,id)=>{const b=boundsFor(id),on=state.layers.labels&&state.showLabels&&(state.layerMode!=='focus'||state.selectedOrganId===id||state.pathwayStep===6&&id==='brain');el.hidden=!on;
   if(!on||b.isEmpty())return;const center=b.getCenter(projected);const side=['lungs','liver','smallIntestine','kidneys'].includes(id)?-1:1;
   if(state.layerMode==='focus'){center.y=b.min.y-.012;}else if(id==='brain'){center.x=.55;center.y=1.68;center.z=.2;}else{center.x=side*.19;center.z=.09;}center.project(camera);el.style.left=`${(center.x+1)*host.clientWidth/2}px`;el.style.top=`${(1-center.y)*host.clientHeight/2}px`;el.dataset.selected=String(state.selectedOrganId===id||storyOrgan===id);
  });
  host.dataset.ready='true';host.dataset.drawCalls=String(renderer.info.render.calls);
 }
 update(initial);resize();raf=requestAnimationFrame(draw);
  return {update,dispose(){disposed=true;headAbort.abort();cancelAnimationFrame(raf);resizeObserver.disconnect();controls.dispose();
  canvas.removeEventListener('pointerdown',down);canvas.removeEventListener('pointerup',up);canvas.removeEventListener('pointermove',move);canvas.removeEventListener('pointercancel',cancel);canvas.removeEventListener('pointerleave',leave);canvas.removeEventListener('webglcontextlost',contextLost);
  entries.forEach(e=>{e.mesh.geometry.dispose();e.mesh.material.dispose();});headAtlas?.dispose();particleGeometry.dispose();particleMaterial.dispose();texture.dispose();lungTexture.dispose();fibres.dispose();environment.dispose();renderer.dispose();tooltip.remove();labels.forEach(e=>e.remove());canvas.remove();
 }};
}
