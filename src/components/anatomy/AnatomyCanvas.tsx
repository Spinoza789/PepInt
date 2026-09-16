import {useEffect,useRef,useState} from 'react';
import {useExperienceStore} from '../../state/useExperienceStore';
import {loadAnatomy} from '../../lib/atlas/model';
import {createAnatomyRenderer} from '../../lib/atlas/renderer';
import {GuidedVideoOverlay} from './GuidedVideoOverlay';
export function AnatomyCanvas(){
 const host=useRef<HTMLDivElement>(null);const [progress,setProgress]=useState(0),[error,setError]=useState(''),[attempt,setAttempt]=useState(0);
 const view=useExperienceStore(s=>s.viewExtent),mode=useExperienceStore(s=>s.layerMode),day=useExperienceStore(s=>s.currentTimeDays);
 useEffect(()=>{const controller=new AbortController();let viewer:ReturnType<typeof createAnatomyRenderer>|undefined;let unsubscribe:(()=>void)|undefined;
  setError('');setProgress(0);
  loadAnatomy(controller.signal,setProgress).then(data=>{if(controller.signal.aborted)return;
   viewer=createAnatomyRenderer(host.current!,data,useExperienceStore.getState(),setError);
   unsubscribe=useExperienceStore.subscribe(s=>viewer?.update(s));
  }).catch(e=>{if(!controller.signal.aborted)setError(e instanceof Error?e.message:'Unable to start the anatomy viewer.');});
  return ()=>{controller.abort();unsubscribe?.();viewer?.dispose();};
 },[attempt]);
 return <div className="anatomy-canvas">
  <div className="scene" ref={host}/>
  <div className="canvas-badge canvas-badge-top">{mode==='focus'?'ORGAN VIEW':view==='body'?'WHOLE BODY':'TORSO ATLAS'} · 3D REFERENCE ANATOMY</div>
  <div className="canvas-badge canvas-badge-bottom">COMPOSITE REFERENCE · NOT TO SCALE</div>
  <GuidedVideoOverlay />
  {day>0&&<div className="canvas-badge canvas-badge-effect">DAY {day.toFixed(1)} · CONCEPTUAL CIRCULATION</div>}
  {progress<100&&!error&&<div className="atlas-loading" role="status"><strong>Preparing reference anatomy</strong><span>{Math.round(progress)}% · body, organs and muscles</span><progress max={100} value={progress}/></div>}
  {error&&<div className="atlas-error" role="alert"><strong>Unable to display the anatomy</strong><p>{error}</p><button onClick={()=>setAttempt(x=>x+1)}>Retry anatomy</button></div>}
 </div>;
}
