import {Atom,Dna,HeartPulse,TimerReset} from 'lucide-react';
import type {ExperienceStage} from '../../lib/types';
import {useExperienceStore} from '../../state/useExperienceStore';

const stages:{stage:ExperienceStage;number:string;label:string;detail:string;icon:typeof Atom}[]=[
 {stage:'peptide',number:'01',label:'Peptide',detail:'Observed chain',icon:Dna},
 {stage:'receptors',number:'02',label:'Binding',detail:'Receptor context',icon:Atom},
 {stage:'body',number:'03',label:'Body atlas',detail:'Systems view',icon:HeartPulse},
 {stage:'halfLife',number:'04',label:'Time course',detail:'Relative concentration',icon:TimerReset},
];

function storyIndex(stage:ExperienceStage){
 if(stage==='peptide'||stage==='molecule')return 0;
 if(stage==='receptors')return 1;
 if(stage==='body'||stage==='organ'||stage==='cell')return 2;
 if(stage==='halfLife')return 3;
 return -1;
}

export function StoryProgress(){
 const stage=useExperienceStore(state=>state.stage),setStage=useExperienceStore(state=>state.setStage);
 const current=storyIndex(stage);
 return <nav className="story-rail" aria-label="Scientific story stages">
  <div className="story-rail-lead"><span className="panel-kicker">Scientific storyboard</span><strong>{current<0?'Choose a scale':`Stage ${String(current+1).padStart(2,'0')} of 04`}</strong></div>
  <ol className="story-rail-list">{stages.map(({stage:target,number,label,detail,icon:Icon},index)=><li key={target} className={index===current?'is-current':index<current?'is-visited':''}>
   <button type="button" aria-current={index===current?'step':undefined} onClick={()=>setStage(target)}><span className="story-rail-number">{number}</span><Icon size={16}/><span><b>{label}</b><small>{detail}</small></span></button>
  </li>)}</ol>
 </nav>;
}
