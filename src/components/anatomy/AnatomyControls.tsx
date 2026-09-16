import {Activity,Brain,Dumbbell,Layers3,RotateCcw,ScanSearch,SlidersHorizontal,Video} from 'lucide-react';
import {useExperienceStore} from '../../state/useExperienceStore';
import {organContent,phaseOneOrganIds} from '../../data/organs';
import {HEAD_SYSTEMS} from '../../lib/head/model';
export function AnatomyControls(){
 const s=useExperienceStore();
 const setPreset=(preset:'body'|'vascular'|'muscle')=>{
  s.setLayerMode('normal');s.selectOrgan(null);
  if(preset==='body'){s.setLayerVisibility('shell',true);s.setLayerVisibility('vessels',true);s.setLayerVisibility('muscles',false);s.setLayerVisibility('ribs',false);s.setLayerVisibility('labels',true);s.setShellOpacity(.22);}
  if(preset==='vascular'){s.setLayerVisibility('shell',true);s.setLayerVisibility('vessels',true);s.setLayerVisibility('muscles',false);s.setLayerVisibility('ribs',false);s.setLayerVisibility('labels',true);s.setShellOpacity(.08);}
  if(preset==='muscle'){s.setLayerVisibility('shell',false);s.setLayerVisibility('vessels',false);s.setLayerVisibility('muscles',true);s.setLayerVisibility('ribs',true);s.setLayerVisibility('labels',false);}
  s.setHeadVisible(true);s.setHeadSystem('all');s.setHeadExplode(0);s.selectHeadPart(null);
 };
 const preset=s.layers.muscles&&!s.layers.shell?'muscle':s.layers.vessels&&!s.layers.muscles&&s.shellOpacity<=.1?'vascular':'body';
 return <aside className="control-panel" aria-label="Anatomy display controls">
  <div className="panel-heading"><SlidersHorizontal size={16}/> Explore the anatomy</div>
  <div className="mode-switch view-switch" role="group" aria-label="Camera framing">
   <button aria-pressed={s.viewExtent==='torso'} className={s.viewExtent==='torso'?'active':''} onClick={()=>s.setViewExtent('torso')}>Torso</button>
   <button aria-pressed={s.viewExtent==='body'} className={s.viewExtent==='body'?'active':''} onClick={()=>s.setViewExtent('body')}>Whole body</button>
  </div>
  <div className="mode-switch" role="group" aria-label="Anatomy display mode">
   {(['normal','transparent','cutaway'] as const).map((mode,i)=><button key={mode} aria-pressed={s.layerMode===mode} className={s.layerMode===mode?'active':''} onClick={()=>s.setLayerMode(mode)}>{['Normal','Transparent','Through'][i]}</button>)}
  </div>
  <div className="preset-label">Inspection presets</div><div className="anatomy-presets" role="group" aria-label="Anatomy inspection presets">
   <button aria-pressed={preset==='body'} className={preset==='body'?'active':''} onClick={()=>setPreset('body')}><Layers3 size={14}/>Body</button>
   <button aria-pressed={preset==='vascular'} className={preset==='vascular'?'active':''} onClick={()=>setPreset('vascular')}><Activity size={14}/>Vascular</button>
   <button aria-pressed={preset==='muscle'} className={preset==='muscle'?'active':''} onClick={()=>setPreset('muscle')}><Dumbbell size={14}/>Muscle</button>
  </div>
  <div className="toggle-list">{([['shell','Body / skin'],['muscles','Torso muscles'],['ribs','Ribs & shoulders'],['vessels','Major vessels'],['labels','Organ labels']] as const).map(([layer,label])=><label key={layer} className="toggle-row"><span>{label}</span><input type="checkbox" checked={s.layers[layer]} onChange={e=>s.setLayerVisibility(layer,e.target.checked)}/></label>)}</div>
  <div className="head-controls">
   <div className="preset-label"><Brain size={14}/> Head atlas · 708 structures</div>
   <label className="toggle-row"><span>Show head atlas</span><input type="checkbox" checked={s.headVisible} onChange={e=>s.setHeadVisible(e.target.checked)}/></label>
   <label className="slider-label" htmlFor="head-system">Head system</label>
   <select id="head-system" value={s.headSystem} onChange={e=>s.setHeadSystem(e.target.value as typeof s.headSystem)}><option value="all">All systems</option>{HEAD_SYSTEMS.map(system=><option key={system.id} value={system.id}>{system.label}</option>)}</select>
   <label className="slider-label" htmlFor="head-explode">Head dissection <output>{Math.round(s.headExplode*100)}%</output></label><input id="head-explode" type="range" min="0" max="1" step=".01" value={s.headExplode} onChange={e=>s.setHeadExplode(+e.target.value)}/>
   <label className="slider-label" htmlFor="head-surface">Head surface</label>
   <select id="head-surface" value={s.headSurface} onChange={e=>s.setHeadSurface(e.target.value as typeof s.headSurface)}><option value="anatomy">Anatomical colours</option><option value="porcelain">Porcelain</option><option value="wire">Wireframe</option><option value="ghost">Transparent</option></select>
   <label className="toggle-row"><span>Section head</span><input type="checkbox" checked={s.headClip} onChange={e=>s.setHeadClip(e.target.checked)}/></label>
   {s.headClip&&<><label className="slider-label" htmlFor="head-clip-position">Section position <output>{Math.round(s.headClipPosition*100)}%</output></label><input id="head-clip-position" type="range" min="-1" max="1" step=".01" value={s.headClipPosition} onChange={e=>s.setHeadClipPosition(+e.target.value)}/></>}
  </div>
  <label className="slider-label" htmlFor="shell-opacity">Skin opacity <output>{Math.round(s.shellOpacity*100)}%</output></label><input id="shell-opacity" type="range" min="0" max="1" step=".01" value={s.shellOpacity} onChange={e=>s.setShellOpacity(+e.target.value)}/>
  {s.layers.muscles&&<><label className="slider-label" htmlFor="muscle-opacity">Muscle opacity <output>{Math.round(s.muscleOpacity*100)}%</output></label><input id="muscle-opacity" type="range" min="0" max="1" step=".01" value={s.muscleOpacity} onChange={e=>s.setMuscleOpacity(+e.target.value)}/></>}
  {s.layerMode==='cutaway'&&<><label className="slider-label" htmlFor="cut-depth">Through outer layers <output>{Math.round(s.cutDepth*100)}%</output></label><input id="cut-depth" type="range" min="0" max="1" step=".01" value={s.cutDepth} onChange={e=>s.setCutDepth(+e.target.value)}/><p className="control-hint">Move the cut from front to back. Organs remain intact.</p></>}
  <label className="toggle-row"><span>Surface detail</span><input type="checkbox" checked={s.textures} onChange={e=>s.setTextures(e.target.checked)}/></label>
  <label className="slider-label" htmlFor="organ-select">Find an organ</label>
  <select id="organ-select" value={s.selectedOrganId??''} onChange={e=>s.selectOrgan((e.target.value||null) as typeof s.selectedOrganId)}><option value="">Whole anatomy</option>{phaseOneOrganIds.map(id=><option key={id} value={id}>{organContent[id].displayName}</option>)}<option value="gallbladder">Gallbladder</option><option value="muscle">Torso muscles</option></select>
  <div className="control-actions"><button className="icon-action" onClick={s.requestBodyCamera}><RotateCcw size={16}/>Reset view</button><button className="icon-action" disabled={!s.selectedOrganId} onClick={()=>s.selectedOrganId&&s.requestOrganCamera(s.selectedOrganId)}><ScanSearch size={16}/>Isolate selected organ</button><button className="icon-action" onClick={()=>{s.setVideoMode(true);s.setPathwayPlaying(true);}}><Video size={16}/>Guided peptide video</button></div>
  <p className="control-hint">Drag to rotate · scroll to zoom · right-drag to pan. Use the organ list to explore hidden structures.</p>
 </aside>;
}
