import {lazy,Suspense,useEffect} from 'react';
import {Info,RotateCcw} from 'lucide-react';
import {AnatomyControls} from '../components/anatomy/AnatomyControls';
import {OrganInfoPanel} from '../components/anatomy/OrganInfoPanel';
import {EducationalDisclaimer} from '../components/content/EducationalDisclaimer';
import {Overview} from '../components/content/Overview';
import {ErrorBoundary} from '../components/layout/ErrorBoundary';
import {SourcesAndNotes} from '../components/content/SourcesAndNotes';
import {TopNavigation} from '../components/layout/TopNavigation';
import {StoryProgress} from '../components/layout/StoryProgress';
import {useExperienceStore} from '../state/useExperienceStore';
import {useTimelinePlayback} from '../hooks/usePKModel';
import {pathwaySteps} from '../data/pathwaySteps';
const AnatomyCanvas=lazy(()=>import('../components/anatomy/AnatomyCanvas').then(m=>({default:m.AnatomyCanvas})));
const Timeline=lazy(()=>import('../components/halfLife/HalfLifeExperience').then(m=>({default:m.HalfLifeExperience})));
const CellExperience=lazy(()=>import('../components/cells/CellExperience').then(m=>({default:m.CellExperience})));
const PeptideExplorer=lazy(()=>import('../components/peptide/PeptideExplorer').then(m=>({default:m.PeptideExplorer})));
const MolecularExperience=lazy(()=>import('../components/molecular/MolecularExperience').then(m=>({default:m.MolecularExperience})));
export function App(){
 const s=useExperienceStore();useTimelinePlayback();
 useEffect(()=>{if(!s.pathwayPlaying)return;const id=setInterval(()=>{const st=useExperienceStore.getState();if(st.pathwayStep>=7){st.setPathwayPlaying(false);return;}
  const next=st.pathwayStep+1;st.setPathwayStep(next);st.selectOrgan(pathwaySteps[next].organId);st.setLayerMode('normal');if(pathwaySteps[next].organId&&pathwaySteps[next].organId!=='muscle')st.requestOrganCamera(pathwaySteps[next].organId);else st.requestBodyCamera();if(pathwaySteps[next].organId==='muscle')st.setLayerVisibility('muscles',true);
 },8000);return ()=>clearInterval(id);},[s.pathwayPlaying]);
 const anatomy=['body','organ','halfLife'].includes(s.stage);
 return <div className="app-shell"><header className="app-header"><a className="brand" href="#top" onClick={()=>s.setStage('body')}><span className="brand-mark">R</span><span><strong>RETATRUTIDE</strong><small>FROM PEPTIDE TO WHOLE-BODY EFFECTS</small></span></a><TopNavigation/><div className="header-actions"><label className="motion-toggle"><span>Reduced motion</span><input type="checkbox" checked={s.reducedMotion} onChange={e=>s.setReducedMotion(e.target.checked)}/></label><button className="header-icon" aria-label="Reset experience" onClick={s.resetExperience}><RotateCcw size={17}/></button></div></header>
 <div className="notice-bar"><Info size={15}/><span>Investigational peptide · GLP-1, GIP and glucagon receptor agonism · Educational illustration, not treatment guidance.</span></div><StoryProgress/>
 <ErrorBoundary>{anatomy?<main className="anatomy-workspace" id="top"><AnatomyControls/><div className="anatomy-center"><Suspense fallback={<div className="scene-loading">Loading interactive anatomy…</div>}><AnatomyCanvas/></Suspense><Suspense fallback={<div className="scene-loading">Loading timeline…</div>}><Timeline/></Suspense></div><OrganInfoPanel/></main>:['peptide','receptors','cell','molecule'].includes(s.stage)?<Suspense fallback={<div className="scene-loading">Loading molecular scene…</div>}>{s.stage==='cell'?<CellExperience/>:s.stage==='peptide'||s.stage==='molecule'?<PeptideExplorer/>:<MolecularExperience/>}</Suspense>:s.stage==='sources'?<SourcesAndNotes/>:<Overview/>}</ErrorBoundary>
 <footer><EducationalDisclaimer/><span>HRA + BodyParts3D · Composite reference · CC BY 4.0</span></footer></div>;
}
