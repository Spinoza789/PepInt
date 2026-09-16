import {useEffect,useRef} from 'react';
import type { RefObject } from 'react';
import * as T from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';
import {createExplosionLayout} from '../../lib/atlas/explosion-layout';
import {decodeModelResponse} from '../../lib/atlas/model-download';
import {PointerTap} from '../../lib/atlas/pointer-tap';
import {SYSTEMS,type Atlas,type SceneState,type SystemId} from '../../lib/atlas/anatomy';
interface Props {atlas:Atlas;state:SceneState;onSelect:(id:string)=>void;onProgress:(n:number)=>void;onError:(s:string)=>void}

function materialKey(part: Atlas['parts'][number]) {
  const name = part.name.toLowerCase();
  if (part.system === 'digestive') {
    if (/liver|hepatic|biliary/.test(name)) return 'liver';
    if (/pancreas/.test(name)) return 'pancreas';
    if (/gallbladder|cystic duct/.test(name)) return 'gallbladder';
    if (/stomach|esophagus/.test(name)) return 'stomach';
    if (/intestin|ileum|jejunum|duodenum|colon|rectum|appendix|mesentery/.test(name)) return 'gut';
  }
  if (part.system === 'respiratory') return 'lung';
  if (part.system === 'cardiac' || /heart|cardiac/.test(name)) return 'heart';
  if (part.system === 'urinary') return 'kidney';
  if (part.system === 'muscular') return 'muscle';
  if (part.system === 'skeletal') return 'bone';
  if (part.system === 'integumentary') return 'skin';
  if (part.system === 'arterial') return 'artery';
  if (part.system === 'venous') return 'vein';
  return part.system;
}

function makeSurfaceTexture(base: string, accent: string) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const context = canvas.getContext('2d');
  if (!context) return undefined;
  const gradient = context.createRadialGradient(34, 28, 2, 96, 104, 115);
  gradient.addColorStop(0, accent);
  gradient.addColorStop(0.42, base);
  gradient.addColorStop(1, new T.Color(base).multiplyScalar(.72).getStyle());
  context.fillStyle = gradient;
  context.fillRect(0, 0, 128, 128);
  const image = context.getImageData(0, 0, 128, 128);
  for (let i = 0; i < image.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * 3.5;
    image.data[i] = Math.max(0, Math.min(255, image.data[i] + noise));
    image.data[i + 1] = Math.max(0, Math.min(255, image.data[i + 1] + noise));
    image.data[i + 2] = Math.max(0, Math.min(255, image.data[i + 2] + noise));
  }
  context.putImageData(image, 0, 0);
  context.globalAlpha = 0.035;
  context.strokeStyle = accent;
  context.lineWidth = 1;
  for (let x = -128; x < 256; x += 24) {
    context.beginPath();
    context.moveTo(x, 0);
    context.bezierCurveTo(x + 12, 32, x - 8, 76, x + 28, 128);
    context.stroke();
  }
  const texture = new T.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = T.RepeatWrapping;
  texture.repeat.set(1.6, 1.6);
  texture.colorSpace = T.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

export default function AnatomyScene({atlas,state,onSelect,onProgress,onError}:Props){
 const host=useRef<HTMLDivElement>(null),latest=useRef(state),select=useRef(onSelect);
 latest.current=state;select.current=onSelect;
 useEffect(()=>{
  const el=host.current!;let disposed=false,frame=0,dirty=true,ready=false,lastView='',lastReset=-1,lastIsolate='',layoutKey='',amount=0;
  let lastState:SceneState|null=null;
  const abort=new AbortController();
  let renderer:T.WebGLRenderer;
  try{renderer=new T.WebGLRenderer({antialias:true,alpha:false,powerPreference:'high-performance'});}catch{onError('This browser could not start the 3D viewer. Please try a browser with WebGL enabled.');return;}
  renderer.localClippingEnabled = true;
  renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<768?1.5:2));renderer.setClearColor('#07111c');renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.12;el.appendChild(renderer.domElement);
  renderer.domElement.setAttribute('aria-label','Interactive human anatomy. Drag to orbit, pinch or scroll to zoom, and tap a structure to inspect it.');
  const scene=new T.Scene(),camera=new T.PerspectiveCamera(34,1,.005,100),controls=new OrbitControls(camera,renderer.domElement);
  camera.position.set(.72,1.0,2.35);controls.target.set(0,.94,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.4;controls.maxDistance=20;controls.maxPolarAngle=Math.PI*.96;controls.addEventListener('change',()=>{dirty=true;});
  const pmrem=new T.PMREMGenerator(renderer),room=new RoomEnvironment(),env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
  scene.add(new T.HemisphereLight(0xb8e8ea,0x07101b,1.2));
  const key=new T.DirectionalLight(0xfffaf4,2.3);key.position.set(-2,4,3);scene.add(key);
  const rim=new T.DirectionalLight(0xe9f0ff,1.8);rim.position.set(2,2,-3);scene.add(rim);
  const ground=new T.Mesh(new T.CircleGeometry(30,96),new T.MeshStandardMaterial({color:0x07111c,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-.019;scene.add(ground);
  const platform=new T.Mesh(new T.CylinderGeometry(.68,.7,.028,100),new T.MeshStandardMaterial({color:0x142837,metalness:.12,roughness:.67}));platform.position.y=-.016;scene.add(platform);
  const ring=new T.Mesh(new T.RingGeometry(.63,.632,128),new T.MeshBasicMaterial({color:0x3bd6d0,transparent:true,opacity:.34,side:T.DoubleSide}));ring.rotation.x=-Math.PI/2;ring.position.y=.001;scene.add(ring);
  const innerRing=new T.Mesh(new T.RingGeometry(.55,.551,128),new T.MeshBasicMaterial({color:0xa4d8df,transparent:true,opacity:.12,side:T.DoubleSide}));innerRing.rotation.x=-Math.PI/2;innerRing.position.y=.001;scene.add(innerRing);
  // BodyParts3D contains detailed vessels and organ substructures, but its male
  // reference does not ship a contiguous lung/liver surface. These softly lit
  // surface proxies restore the readable atlas silhouette while remaining clearly
  // labelled as structural proxies in the surrounding UI.
  const proxyGroup=new T.Group();proxyGroup.name='structural-organ-proxies';
  const proxyMaterials:T.Material[]=[];
  const proxyMaterial=(color:string,opacity:number)=>{const m=new T.MeshPhysicalMaterial({color,roughness:.48,metalness:.02,clearcoat:.16,clearcoatRoughness:.42,transparent:true,opacity,depthWrite:false,side:T.DoubleSide});proxyMaterials.push(m);return m;};
  const proxyLung=proxyMaterial('#bc6f7a',.48),proxyLiver=proxyMaterial('#754238',.34);
  const leftLung=new T.Mesh(new T.IcosahedronGeometry(1,4),proxyLung);leftLung.name='lung-surface-proxy-left';leftLung.position.set(-.095,1.285,-.015);leftLung.scale.set(.085,.205,.07);leftLung.rotation.z=-.08;leftLung.renderOrder=-1;
  const rightLung=leftLung.clone();rightLung.name='lung-surface-proxy-right';rightLung.position.x=.095;rightLung.rotation.z=.08;
  const liverProxy=new T.Mesh(new T.IcosahedronGeometry(1,4),proxyLiver);liverProxy.name='liver-surface-proxy';liverProxy.position.set(-.02,1.105,-.025);liverProxy.scale.set(.18,.085,.065);liverProxy.rotation.z=.06;liverProxy.renderOrder=-1;
  proxyGroup.add(leftLung,rightLung,liverProxy);proxyGroup.visible=atlas.source!=='Human Reference Atlas';scene.add(proxyGroup);
  const bodyGroup = new T.Group();
  bodyGroup.name = 'body-shell';
  const bodyProfile = [new T.Vector2(0.02, 0.54), new T.Vector2(0.13, 0.58), new T.Vector2(0.16, 0.64), new T.Vector2(0.18, 0.8), new T.Vector2(0.16, 1.0), new T.Vector2(0.17, 1.18), new T.Vector2(0.2, 1.32), new T.Vector2(0.17, 1.4), new T.Vector2(0.02, 1.45)];
  const bodyGeometry = new T.LatheGeometry(bodyProfile, 64);
  const bodyTexture = makeSurfaceTexture('#b69488', '#e1c1b0');
  const bodyMaterial = new T.MeshPhysicalMaterial({ color: '#c09d91', map: bodyTexture, roughness: .44, metalness: .02, transmission: .08, thickness: .4, transparent: true, opacity: .1, depthWrite: false, side: T.DoubleSide });
  const bodyMesh = new T.Mesh(bodyGeometry, bodyMaterial);
  bodyMesh.position.set(0, 0, 0);
  bodyGroup.add(bodyMesh);
  bodyGroup.visible = atlas.source !== 'Human Reference Atlas' && latest.current.visible.includes('integumentary' as SystemId);
  scene.add(bodyGroup);
  const muscleGroup = new T.Group();
  muscleGroup.name = 'muscle-overlay';
  const muscleMaterial = new T.MeshPhysicalMaterial({ color: '#8d4f59', map: makeSurfaceTexture('#8d4f59', '#c97972'), roughness: .58, clearcoat: .08, transparent: true, opacity: .24, depthWrite: false, side: T.DoubleSide });
  const muscleMantle = new T.Mesh(new T.SphereGeometry(1, 40, 28), muscleMaterial);
  muscleMantle.name = 'muscle-mantle';
  muscleMantle.position.set(0, .9, .03);
  muscleMantle.scale.set(.16, .42, .05);
  muscleMantle.renderOrder = -2;
  muscleGroup.add(muscleMantle);
  const addMuscle = (position: [number, number, number], scale: [number, number, number], rotation = 0) => {
    const mesh = new T.Mesh(new T.SphereGeometry(1, 28, 20), muscleMaterial);
    mesh.position.set(...position); mesh.scale.set(...scale); mesh.rotation.z = rotation; muscleGroup.add(mesh);
  };
  addMuscle([-.055, 1.23, .075], [.04, .028, .016], -.12); addMuscle([.055, 1.23, .075], [.04, .028, .016], .12);
  addMuscle([-.055, .98, .08], [.016, .06, .014], -.04); addMuscle([.055, .98, .08], [.016, .06, .014], .04);
  addMuscle([-.055, .73, .075], [.018, .05, .014], -.03); addMuscle([.055, .73, .075], [.018, .05, .014], .03);
  muscleGroup.visible = latest.current.visible.includes('muscular' as SystemId);
  scene.add(muscleGroup);
  const atlasMuscleGroup = new T.Group();
  atlasMuscleGroup.name = 'bodyparts3d-muscle-layer';
  const atlasMuscleMaterial = new T.MeshPhysicalMaterial({ color: '#8d4f59', map: makeSurfaceTexture('#8d4f59', '#c97972'), roughness: .58, clearcoat: .08, transparent: true, opacity: .4, depthWrite: false, side: T.DoubleSide });
  const atlasMuscleLoaded = { value: false };
  scene.add(atlasMuscleGroup);
  // The source atlas is a full-body reference. This experience is torso-first, so keep
  // the anatomy in the thorax-to-pelvis window and omit limbs/head from the initial atlas pass.
  const torsoPart=(p:(typeof atlas.parts)[number])=>{const minY=p.bounds[0][1],maxY=p.bounds[1][1],minX=p.bounds[0][0],maxX=p.bounds[1][0];const vessel=p.system==='arterial'||p.system==='venous';if(p.system==='integumentary')return /skin of body|skin$/i.test(p.name);if(p.system==='muscular')return false;if(p.system==='skeletal')return minY>=.34&&maxY<=1.42&&minX>=-.34&&maxX<=.34;return minY>=(vessel?.72:.24)&&maxY<=1.42&&minX>=-0.24&&maxX<=0.24;};
  const displayParts=atlas.parts.filter(torsoPart);
  const width=T.MathUtils.ceilPowerOfTwo(atlas.parts.length),data=new Float32Array(width*4),partTexture=new T.DataTexture(data,width,1,T.RGBAFormat,T.FloatType);partTexture.needsUpdate=true;
  const selectedData=new Uint8Array(width*4),selectionTexture=new T.DataTexture(selectedData,width,1);selectionTexture.needsUpdate=true;
  const materials:T.Material[]=[],geometries:T.BufferGeometry[]=[],pickers:(T.Mesh|undefined)[]=[],systemMeshes=new Map<string,T.Mesh>(),centers=atlas.parts.map(p=>new T.Vector3().fromArray(p.bounds[0]).add(new T.Vector3().fromArray(p.bounds[1])).multiplyScalar(.5));
  const peptideCurve = new T.CatmullRomCurve3([new T.Vector3(.05, 1.31, .19), new T.Vector3(.02, 1.22, .17), new T.Vector3(-.03, 1.13, .12), new T.Vector3(.01, 1.02, .1), new T.Vector3(.03, .91, .12), new T.Vector3(.0, .79, .15)]);
  const peptideCount = 22;
  const peptideGeometry = new T.BufferGeometry();
  const peptidePositions = new Float32Array(peptideCount * 3);
  peptideGeometry.setAttribute('position', new T.BufferAttribute(peptidePositions, 3));
  const peptideSpriteCanvas = document.createElement('canvas'); peptideSpriteCanvas.width = peptideSpriteCanvas.height = 32;
  const spriteContext = peptideSpriteCanvas.getContext('2d');
  if (spriteContext) { const gradient = spriteContext.createRadialGradient(16, 16, 1, 16, 16, 16); gradient.addColorStop(0, 'rgba(255,255,255,1)'); gradient.addColorStop(.35, 'rgba(59,214,208,.9)'); gradient.addColorStop(1, 'rgba(59,214,208,0)'); spriteContext.fillStyle = gradient; spriteContext.fillRect(0, 0, 32, 32); }
  const peptideSprite = new T.CanvasTexture(peptideSpriteCanvas);
  const peptideMaterial = new T.PointsMaterial({ color: '#3bd6d0', size: .028, map: peptideSprite, transparent: true, opacity: 0, depthWrite: false, blending: T.AdditiveBlending, sizeAttenuation: true, alphaTest: .02 });
  materials.push(peptideMaterial);
  const peptideParticles = new T.Points(peptideGeometry, peptideMaterial);
  peptideParticles.name = 'retatrutide-conceptual-circulation';
  peptideParticles.frustumCulled = false;
  scene.add(peptideParticles);
  const offsets:T.Vector3[]=[],bounds=atlas.parts.map(p=>new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1])));
  let packingWidth=1,packingHeight=1;
  const markerPositions=new Float32Array(atlas.parts.length*3),markerGeometry=new T.BufferGeometry();markerGeometry.setAttribute('position',new T.BufferAttribute(markerPositions,3));
  const markerMaterial=new T.PointsMaterial({color:0x64748b,size:5,sizeAttenuation:false,transparent:true,opacity:.72,depthTest:false});
  markerMaterial.onBeforeCompile=shader=>{shader.fragmentShader=shader.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif (distance(gl_PointCoord, vec2(0.5)) > 0.5) discard;');};
  const markers=new T.Points(markerGeometry,markerMaterial);markers.frustumCulled=false;markers.renderOrder=10;markers.visible=false;scene.add(markers);
  const hover=document.createElement('div');hover.className='part-hover';hover.setAttribute('role','tooltip');hover.hidden=true;el.appendChild(hover);
  type Target={index:number;x:number;y:number;left:number;right:number;top:number;bottom:number};let targets:Target[]=[];
  const projected=new T.Vector3();
  const findTarget=(x:number,y:number,radius:number)=>{
   let best=-1,score=Infinity;
   for(const t of targets){const dx=Math.max(t.left-x,0,x-t.right),dy=Math.max(t.top-y,0,y-t.bottom),distance=Math.hypot(dx,dy);if(distance>radius)continue;const candidate=distance+Math.hypot(t.x-x,t.y-y)*.025;if(candidate<score){score=candidate;best=t.index;}}
   return best;
  };
  const materialFor=(key:string)=>{const palette:Record<string,[string,string]>={gut:['#d7847d','#f0b2a6'],stomach:['#c88476','#f2b7a6'],pancreas:['#c79b82','#f2c6aa'],liver:['#855040','#b7755b'],gallbladder:['#748b44','#b6c96a'],lung:['#b86f7a','#e1a2a1'],heart:['#a63f4d','#ec7d79'],kidney:['#75423e','#bb7260'],artery:['#9e3443','#eb6a68'],vein:['#345f93','#6da0c9'],muscle:['#8d4f59','#c97972'],bone:['#c8bda2','#efe2c5'],skin:['#c69687','#e1c1b0']};const [base,accent]=palette[key]??[SYSTEMS.find(s=>s.id===key)?.color??'#aebbb8','#d6e2e3'];const map=key==='liver'||key==='skin'?undefined:makeSurfaceTexture(base,accent);const clippingPlanes=key==='skin'?[new T.Plane(new T.Vector3(0,1,0),-.54),new T.Plane(new T.Vector3(0,-1,0),1.5),new T.Plane(new T.Vector3(1,0,0),.43),new T.Plane(new T.Vector3(-1,0,0),.43)]:undefined;const m=new T.MeshPhysicalMaterial({color:base,map,metalness:.025,roughness:key==='gut'||key==='heart'?.4:.55,clearcoat:key==='gut'||key==='heart'?.16:.06,clearcoatRoughness:.35,side:T.DoubleSide,transparent:key==='skin',opacity:key==='skin'?.2:1,depthWrite:key!=='skin',clippingPlanes});materials.push(m);return m;};
  const mats=new Map<string,T.Material>();
  const loadRealMuscles = async () => {
    try {
      const response = await fetch('/models/atlas.json', { signal: abort.signal });
      if (!response.ok) return;
      const muscleAtlas = await response.json() as Atlas;
      const matcher = /pectoralis|intercostal|serratus|latissimus|diaphragm|transversus thoracis|trapezius|external oblique|internal oblique/i;
      const muscleParts = muscleAtlas.parts.filter((part) => part.system === 'muscular' && matcher.test(part.name) && part.bounds[0][1] < 1.52 && part.bounds[1][1] > .88);
      const chunks = [...new Set(muscleParts.map((part) => part.chunk))];
      await Promise.all(chunks.map(async (chunkIndex) => {
        const chunk = muscleAtlas.chunks[chunkIndex];
        const response = await fetch(chunk.gzip ?? chunk.url, { signal: abort.signal });
        const buffer = await decodeModelResponse(response, chunk.bytes, Boolean(chunk.gzip));
        const geometries: T.BufferGeometry[] = [];
        for (const part of muscleParts.filter((candidate) => candidate.chunk === chunkIndex)) {
          const geometry = new T.BufferGeometry();
          const positions = new Float32Array(buffer, part.positions, part.vertexCount * 3);
          geometry.setAttribute('position', new T.BufferAttribute(positions, 3));
          const uv = new Float32Array(part.vertexCount * 2); for (let vertex = 0; vertex < part.vertexCount; vertex++) { uv[vertex * 2] = positions[vertex * 3] + .5; uv[vertex * 2 + 1] = positions[vertex * 3 + 1] / 1.75; } geometry.setAttribute('uv', new T.BufferAttribute(uv, 2));
          geometry.setAttribute('normal', new T.BufferAttribute(new Int16Array(buffer, part.normals, part.vertexCount * 3), 3, true));
          geometry.setIndex(new T.BufferAttribute(new Uint32Array(buffer, part.indices, part.indexCount), 1));
          geometry.computeBoundingSphere(); geometries.push(geometry);
        }
        const merged = mergeGeometries(geometries, false);
        if (merged) { const mesh = new T.Mesh(merged, atlasMuscleMaterial); mesh.frustumCulled = false; mesh.name = `bodyparts3d-muscles-${chunkIndex}`; atlasMuscleGroup.add(mesh); }
      }));
      atlasMuscleLoaded.value = atlasMuscleGroup.children.length > 0;
      muscleGroup.visible = !atlasMuscleLoaded.value && latest.current.visible.includes('muscular' as SystemId);
    } catch { /* The conceptual fallback remains available if the optional muscle atlas fails. */ }
  };
  void loadRealMuscles();
  let loaded=0;
  const loadChunk=async(ci:number)=>{
   const chunk=atlas.chunks[ci],compressed=!!chunk.gzip&&typeof DecompressionStream!=='undefined';const response=await fetch(compressed?chunk.gzip!:chunk.url,{signal:abort.signal});const buffer=await decodeModelResponse(response,chunk.bytes,compressed);if(disposed)return;
   const groups=new Map<string,T.BufferGeometry[]>();
   atlas.parts.forEach((p,i)=>{
    if(p.chunk!==ci||!torsoPart(p))return;
    const g=new T.BufferGeometry();const positions=new Float32Array(buffer,p.positions,p.vertexCount*3);g.setAttribute('position',new T.BufferAttribute(positions,3));const uv=new Float32Array(p.vertexCount*2);for(let v=0;v<p.vertexCount;v++){const px=positions[v*3],py=positions[v*3+1];uv[v*2]=px+0.5;uv[v*2+1]=py/1.75;};g.setAttribute('uv',new T.BufferAttribute(uv,2));
    // GPU normalized signed-short normals keep the complete atlas compact in memory.
    g.setAttribute('normal',new T.BufferAttribute(new Int16Array(buffer,p.normals,p.vertexCount*3),3,true));g.setIndex(new T.BufferAttribute(new Uint32Array(buffer,p.indices,p.indexCount),1));
    g.boundingBox=bounds[i].clone();g.computeBoundingSphere();const pick=new T.Mesh(g);pick.matrixAutoUpdate=false;pickers[i]=pick;geometries.push(g);
    g.setAttribute('partIndex',new T.BufferAttribute(new Float32Array(p.vertexCount).fill(i),1));
    const key=materialKey(p);const list=groups.get(key)??[];list.push(g);groups.set(key,list);
   });
   groups.forEach((gs,key)=>{const geometry=mergeGeometries(gs,false);if(!geometry)throw new Error('Could not assemble anatomy geometry.');geometries.push(geometry);const material=mats.get(key)??materialFor(key);mats.set(key,material);const mesh=new T.Mesh(geometry,material);mesh.frustumCulled=false;mesh.userData.system=atlas.parts.find((p)=>materialKey(p)===key)?.system;mesh.visible=latest.current.visible.includes(mesh.userData.system as SystemId);systemMeshes.set(`${ci}:${key}`,mesh);scene.add(mesh);});
   lastState=null;loaded++;onProgress(Math.round(loaded/atlas.chunks.length*100));dirty=true;
  };
  (async()=>{try{let cursor=0;await Promise.all(Array.from({length:3},async()=>{while(cursor<atlas.chunks.length){const i=cursor++;await loadChunk(i);}}));if(!disposed){ready=true;dirty=true;}}catch(e){if(!disposed)onError(e instanceof Error?e.message:'Could not load the anatomy.');}})();
  const fit=(view:string,extent=0)=>{
   const aspect=camera.aspect,mobile=el.clientWidth<768,normalDistance=mobile?2.55:2.15;
   const reservedHeight=mobile?350:270;const availableAspect=Math.max(.35,(el.clientWidth-(mobile?40:340))/Math.max(160,el.clientHeight-reservedHeight));const atlasDistance=Math.max(packingHeight,packingWidth/availableAspect)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*(el.clientHeight/Math.max(160,el.clientHeight-reservedHeight))*1.08;
   const muscleFraming=latest.current.visible.includes('muscular') ? 1.3 : 1;const distance=T.MathUtils.lerp(normalDistance * muscleFraming * .72,Math.max(.2,atlasDistance),extent);if(extent>.8)view='front';
   const direction=view==='front'?new T.Vector3(0,.02,1):view==='back'?new T.Vector3(0,.02,-1):view==='side'?new T.Vector3(1,.02,0):new T.Vector3(.35,.06,1).normalize();
   controls.target.set(0,0.96,0);camera.position.copy(controls.target).addScaledVector(direction,distance);controls.update();dirty=true;
  };
  const resize=()=>{layoutKey='';lastState=null;renderer.setPixelRatio(Math.min(devicePixelRatio,el.clientWidth<768||el.clientHeight<600?1.5:2));camera.aspect=Math.max(.1,el.clientWidth/Math.max(1,el.clientHeight));camera.updateProjectionMatrix();renderer.setSize(Math.max(1,el.clientWidth),Math.max(1,el.clientHeight));fit(latest.current.view,amount);dirty=true;};const observer=new ResizeObserver(resize);observer.observe(el);resize();
  const raycaster=new T.Raycaster(),pointer=new T.Vector2(),tap=new PointerTap(),worldBox=new T.Box3(),hitPoint=new T.Vector3();
  const down=(e:PointerEvent)=>{hover.hidden=true;tap.down(e.pointerId,e.clientX,e.clientY,e.pointerType==='touch'?12:5);};
  const move=(e:PointerEvent)=>{tap.move(e.pointerId,e.clientX,e.clientY);if(e.buttons||amount<.5||e.pointerType==='touch'){hover.hidden=true;return;}const rect=el.getBoundingClientRect(),x=e.clientX-rect.left,y=e.clientY-rect.top,index=findTarget(x,y,12);hover.hidden=index<0;renderer.domElement.style.cursor=index<0?'grab':'pointer';if(index>=0){hover.textContent=atlas.parts[index].name;hover.style.left=`${Math.max(8,Math.min(x+14,el.clientWidth-260))}px`;hover.style.top=`${Math.max(8,Math.min(y+18,el.clientHeight-55))}px`;}};
  const cancel=(e:PointerEvent)=>tap.cancel(e.pointerId);
  const up=(e:PointerEvent)=>{
   const validTap=tap.up(e.pointerId,e.clientX,e.clientY);if(!validTap||!ready)return;const rect=renderer.domElement.getBoundingClientRect();pointer.set((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1);raycaster.setFromCamera(pointer,camera);
   let nearest=Infinity,found=-1;const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);
   pickers.forEach((mesh,i)=>{if(!mesh||data[i*4+3]<.5||(hasSolid&&atlas.parts[i].system==='integumentary'))return;worldBox.copy(bounds[i]).translate(mesh.position);if(!raycaster.ray.intersectBox(worldBox,hitPoint))return;const hits=raycaster.intersectObject(mesh,false);if(hits[0]&&hits[0].distance<nearest){nearest=hits[0].distance;found=i;}});
   if(found<0&&amount>.45)found=findTarget(e.clientX-rect.left,e.clientY-rect.top,e.pointerType==='touch'?24:16);if(found>=0){hover.hidden=true;select.current(atlas.parts[found].id);}
  };
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',cancel);
  const clock=new T.Clock();let lastExtent=-1;
  const animate=()=>{
   if(disposed)return;frame=requestAnimationFrame(animate);const dt=Math.min(clock.getDelta(),.05),s=latest.current;
   const changed=lastState?.visible!==s.visible||lastState?.selected!==s.selected||lastState?.isolate!==s.isolate||lastState?.layerMode!==s.layerMode||lastState?.shellOpacity!==s.shellOpacity;
   const moving=Math.abs(amount-s.explode)>.0001;
   if(moving){amount=T.MathUtils.damp(amount,s.explode,8,dt);dirty=true;}
   const effectLevel = s.effectLevel ?? 0;
   peptideMaterial.opacity = s.pathwayPlaying || effectLevel > .04 ? .24 + effectLevel * .7 : 0;
   peptideParticles.visible = peptideMaterial.opacity > 0;
   if (peptideParticles.visible) {
     for (let particle = 0; particle < peptideCount; particle++) {
       const u = (clock.elapsedTime * .035 + particle / peptideCount) % 1;
       peptideCurve.getPointAt(u, projected);
       peptidePositions.set([projected.x, projected.y, projected.z], particle * 3);
     }
     peptideGeometry.attributes.position.needsUpdate = true;
     dirty = true;
   }
   if(changed||moving||lastExtent<0){
    const visible=new Set(s.visible),selection=new Set(s.selected);
    systemMeshes.forEach((mesh) => { mesh.visible = visible.has(mesh.userData.system as SystemId); });
    bodyGroup.visible = atlas.source !== 'Human Reference Atlas' && visible.has('integumentary') && latest.current.layerMode !== 'cutaway';
    bodyMaterial.opacity = latest.current.layerMode === 'cutaway' ? .015 : latest.current.layerMode === 'transparent' ? .04 : (latest.current.shellOpacity ?? .1);
    const skinMaterial = mats.get('skin') as T.MeshPhysicalMaterial | undefined;
    if (skinMaterial) skinMaterial.opacity = latest.current.layerMode === 'cutaway' ? 0 : latest.current.layerMode === 'transparent' ? .06 : Math.min(.34, (latest.current.shellOpacity ?? .2) + .06);
    muscleGroup.visible = visible.has('muscular') && !atlasMuscleLoaded.value;
    atlasMuscleGroup.visible = visible.has('muscular');
    atlasMuscleMaterial.opacity = latest.current.layerMode === 'cutaway' ? .2 : latest.current.layerMode === 'transparent' ? .28 : .4;
    const visibleParts=displayParts.filter(p=>s.isolate?selection.has(p.id):visible.has(p.system)||selection.has(p.id));
    const nextLayoutKey=visibleParts.map(p=>p.id).join(',')+':'+camera.aspect.toFixed(3);
    if(nextLayoutKey!==layoutKey){const layout=createExplosionLayout(visibleParts,camera.aspect);packingWidth=layout.width;packingHeight=layout.height;atlas.parts.forEach((p,i)=>{const cell=layout.cells.get(p.id);offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();});layoutKey=nextLayoutKey;if(amount>.05&&!s.isolate)fit(s.view,Math.max(0,(amount-.3)/.7));}

    atlas.parts.forEach((p,i)=>{
     const c=centers[i],destination=offsets[i];let dx=0,dy=0,dz=0;
     if(amount<=.45){const t=amount/.45;const group=SYSTEMS.findIndex(sys=>sys.id===p.system);const angle=group/SYSTEMS.length*Math.PI*2;dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;}
     else {const t=(amount-.45)/.55,group=SYSTEMS.findIndex(sys=>sys.id===p.system),angle=group/SYSTEMS.length*Math.PI*2;dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);}
     const selected=selection.has(p.id);data.set([dx,dy,dz,(s.isolate?selected:visible.has(p.system)||selected)?1:0],i*4);selectedData[i*4]=selected?255:0;
     markerPositions.set(data[i*4+3]>.5?[c.x+dx,c.y+dy,c.z+dz]:[10000,10000,10000],i*3);const mesh=pickers[i];if(mesh){mesh.position.set(dx,dy,dz);mesh.updateMatrix();mesh.updateMatrixWorld(true);}
    });partTexture.needsUpdate=true;selectionTexture.needsUpdate=true;markerGeometry.attributes.position.needsUpdate=true;lastState=s;lastExtent=amount;dirty=true;
   }
   if(s.view!==lastView||s.reset!==lastReset){fit(s.view,amount);lastView=s.view;lastReset=s.reset;}
   if(moving&&!s.isolate)fit(amount>.5?'front':s.view,Math.max(0,(amount-.3)/.7));
   const isolateKey=s.isolate?s.selected.join(',')+':'+s.reset+':'+s.inspectorOpen+':'+camera.aspect:'';
   if(isolateKey!==lastIsolate||(s.isolate&&moving)){
    if(s.isolate){const box=new T.Box3();atlas.parts.forEach((p,i)=>{if(s.selected.includes(p.id))box.union(bounds[i].clone().translate(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])));});
     if(!box.isEmpty()){const center=box.getCenter(new T.Vector3()),size=box.getSize(new T.Vector3());const w=el.clientWidth,h=el.clientHeight,mobile=w<768,landscape=w>h&&h<=600;let left=20,right=w-20,top=mobile?175:110,bottom=h-170;if(s.inspectorOpen){if(landscape){right=w-335;top=100;bottom=h-125;}else if(mobile){const sheet=document.querySelector('.detail-sheet')?.getBoundingClientRect(),header=document.querySelector('.identity')?.getBoundingClientRect();top=(header?.bottom??94)+16;bottom=(sheet?.top??h*.58-139)-16;}else{right=w-370;left=w>1100?285:25;}}const availableWidth=Math.max(150,right-left),availableHeight=Math.max(40,bottom-top);camera.setViewOffset(w,h,w/2-(left+right)/2,h/2-(top+bottom)/2,w,h);const distance=Math.max(.07,Math.max(size.y*h/availableHeight,size.x*w/availableWidth/camera.aspect,size.z)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))*1.35);controls.maxDistance=Math.max(40,distance*2);controls.target.copy(center);camera.position.copy(center).add(new T.Vector3(.2,.1,1).normalize().multiplyScalar(distance));controls.update();dirty=true;}
    }else if(lastIsolate){camera.clearViewOffset();fit(s.view,amount);}
    lastIsolate=isolateKey;
   }
   controls.enableRotate=amount<.8;controls.mouseButtons.LEFT=amount<.8?T.MOUSE.ROTATE:T.MOUSE.PAN;controls.touches.ONE=amount<.8?T.TOUCH.ROTATE:T.TOUCH.PAN;ground.visible=platform.visible=ring.visible=innerRing.visible=false;markers.visible=amount>.75;controls.autoRotate=s.rotate&&!s.isolate&&amount<.4;controls.autoRotateSpeed=.65;controls.update();if(controls.autoRotate)dirty=true;
   if(dirty){renderer.render(scene,camera);targets=[];if(amount>.45){const hasSolid=atlas.parts.some((p,i)=>p.system!=='integumentary'&&data[i*4+3]>.5);atlas.parts.forEach((p,i)=>{if(data[i*4+3]<.5||(hasSolid&&p.system==='integumentary'))return;let left=Infinity,right=-Infinity,top=Infinity,bottom=-Infinity;for(let corner=0;corner<8;corner++){projected.set(p.bounds[(corner&1)?1:0][0]+data[i*4],p.bounds[(corner&2)?1:0][1]+data[i*4+1],p.bounds[(corner&4)?1:0][2]+data[i*4+2]).project(camera);const x=(projected.x+1)*el.clientWidth/2,y=(1-projected.y)*el.clientHeight/2;left=Math.min(left,x);right=Math.max(right,x);top=Math.min(top,y);bottom=Math.max(bottom,y);}projected.copy(centers[i]).add(new T.Vector3(data[i*4],data[i*4+1],data[i*4+2])).project(camera);if(projected.z< -1||projected.z>1)return;targets.push({index:i,x:(projected.x+1)*el.clientWidth/2,y:(1-projected.y)*el.clientHeight/2,left,right,top,bottom});});}dirty=false;}

  };animate();
  const contextLost=(e:Event)=>{e.preventDefault();onError('The 3D session was paused by your device. Reload to continue.');};renderer.domElement.addEventListener('webglcontextlost',contextLost);
  return()=>{disposed=true;abort.abort();cancelAnimationFrame(frame);observer.disconnect();controls.dispose();geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());scene.traverse(o=>{if(o instanceof T.Mesh&&!geometries.includes(o.geometry)){o.geometry.dispose();const ms=Array.isArray(o.material)?o.material:[o.material];ms.forEach(m=>m.dispose());}});env.dispose();partTexture.dispose();selectionTexture.dispose();markerGeometry.dispose();markerMaterial.dispose();peptideGeometry.dispose();peptideSprite.dispose();hover.remove();renderer.dispose();renderer.domElement.remove();};
 },[atlas]);
 return <div className="scene" ref={host}/>;
}
