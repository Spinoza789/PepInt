import {useEffect,useRef,useState} from 'react';
import {Expand,RotateCcw} from 'lucide-react';
import {molecularStructures} from '../../data/molecularStructures';
import type {MolecularSettings} from '../../lib/molecular/molstar';
import {useExperienceStore} from '../../state/useExperienceStore';
import {EvidenceLabel} from '../ui/EvidenceLabel';
export function PeptideExplorer(){
 const host=useRef<HTMLDivElement>(null),full=useRef<HTMLElement>(null),viewer=useRef<Awaited<ReturnType<typeof import('../../lib/molecular/molstar')['createMolecularViewer']>>|null>(null);
 const [entry,setEntry]=useState(()=>{const receptor=useExperienceStore.getState().selectedReceptorId;return receptor==='GIPR'?1:receptor==='GCGR'?2:0;}),[attempt,setAttempt]=useState(0),[error,setError]=useState(''),[ready,setReady]=useState(false);
 const [settings,setSettings]=useState<MolecularSettings>({peptide:true,receptor:false,labels:false,representation:'ball-and-stick'});
 const settingsRef=useRef(settings);settingsRef.current=settings;
 const config=molecularStructures[entry],s=useExperienceStore();
 useEffect(()=>{const abort=new AbortController();let owned:typeof viewer.current=null;setReady(false);setError('');if(host.current)delete host.current.dataset.ready;
  async function start(){try{
   const {createMolecularViewer}=await import('../../lib/molecular/molstar');if(abort.signal.aborted)return;
   owned=await createMolecularViewer(host.current!,config,abort.signal);if(abort.signal.aborted){owned.dispose();return;}
   viewer.current=owned;await owned.setSettings(settingsRef.current);if(!abort.signal.aborted)setReady(true);
  }catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'Unable to load the structure.');}}
  void start();return ()=>{abort.abort();if(viewer.current===owned)viewer.current=null;owned?.dispose();};
 },[config,attempt]);
 useEffect(()=>{if(!ready||!viewer.current)return;const active=viewer.current;void active.setSettings(settings).catch(e=>{if(viewer.current===active)setError(String(e));});},[settings,ready]);
 return <main className="molecular-stage peptide-explorer"><header className="molecular-header"><div><div className="panel-kicker">DEPOSITED COORDINATES · MOL*</div><h1>{config.peptideName} peptide explorer</h1><p>Rotate the observed ligand, reveal its receptor complex, and change the molecular representation. Missing residues and the free-peptide conformation are not reconstructed.</p></div><EvidenceLabel label="Experimental structure"/></header>
 <div className="molecular-layout"><section className="experimental-card" ref={full}>
  <div className="experimental-toolbar"><select aria-label="Experimental structure" value={entry} onChange={e=>setEntry(+e.target.value)}>{molecularStructures.map((c,i)=><option value={i} key={c.id}>{c.pdbId} · {c.receptor}</option>)}</select><select aria-label="Molecular representation" value={settings.representation} onChange={e=>setSettings({...settings,representation:e.target.value as MolecularSettings['representation']})}><option value="cartoon">Cartoon / ribbon</option><option value="ball-and-stick">Ball and stick</option><option value="spacefill">Space filling</option><option value="molecular-surface">Molecular surface</option></select><button className="icon-action" aria-label="Reset molecular orientation" onClick={()=>viewer.current?.reset()}><RotateCcw size={16}/></button><button className="icon-action" aria-label="Fullscreen molecular viewer" onClick={()=>{if(document.fullscreenElement)void document.exitFullscreen();else void full.current?.requestFullscreen().catch(()=>{});}}><Expand size={16}/></button></div>
  <div className="molstar-shell"><div className="molstar-host" ref={host} data-pdb={config.pdbId}/>{!ready&&!error&&<div className="molecular-loading" role="status">Loading experimental structure…</div>}{error&&<div className="molecular-loading" role="alert"><strong>Molecular viewer unavailable</strong><p>{error}</p><button className="icon-action" onClick={()=>setAttempt(v=>v+1)}>Retry molecular viewer</button><a href={`${import.meta.env.BASE_URL}${config.localUrl}`} download>Download the local mmCIF</a><button className="secondary-action" onClick={()=>s.setStage('receptors')}>Open conceptual receptor scene</button></div>}</div>
  <div className="molecular-toggles">{(['peptide','receptor','labels'] as const).map(key=><label key={key}><input type="checkbox" checked={settings[key]} onChange={e=>setSettings({...settings,[key]:e.target.checked})}/>{key==='labels'?'Residue labels':key==='peptide'?config.peptideName:'Receptor complex'}</label>)}</div><div className="experimental-caption">Molecular structure — not to scale · cyan ligand · warm neutral receptor</div>
 </section><aside className="molecular-info"><div className="panel-kicker">PDB {config.pdbId}</div><h2>{config.receptor} complex</h2><p>{config.observedResidues} peptide residues have coordinates in this entry.</p><p>{config.chainMappingNote}</p><a href={`https://www.rcsb.org/structure/${config.pdbId}`} target="_blank" rel="noreferrer">Open deposited structure and citation ↗</a><div className="molecular-caveat">This is an experimental receptor-bound model, not the complete circulating molecule, a dynamic binding simulation, or a measurement of affinity. Accessories and G-protein subunits are omitted from the main view.</div><p>The viewer selects entities verified from the local mmCIF metadata. Hover or click an atom/residue for Mol* details. Drag to rotate; scroll to zoom; right-drag to pan.</p><button className="body-link" onClick={()=>s.setStage('receptors')}>Explore the binding concept →</button><button className="secondary-action" onClick={()=>s.setStage('body')}>Back to anatomy and timeline</button></aside></div>
 </main>;
}
