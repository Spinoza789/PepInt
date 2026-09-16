import {useEffect,useRef,useState} from 'react';
import type {MolecularStructureConfig} from '../../data/molecularStructures';
import {createMolecularViewer,type MolecularSettings} from '../../lib/molecular/molstar';

export function ExperimentalBindingViewer({config,settings,reset,onReady}:{config:MolecularStructureConfig;settings:MolecularSettings;reset:number;onReady:()=>void}){
 const host=useRef<HTMLDivElement>(null),viewer=useRef<Awaited<ReturnType<typeof createMolecularViewer>>|null>(null),settingsRef=useRef(settings);settingsRef.current=settings;
 const [ready,setReady]=useState(false),[error,setError]=useState('');
 useEffect(()=>{const abort=new AbortController();let owned:typeof viewer.current=null;setReady(false);setError('');
  async function start(){try{owned=await createMolecularViewer(host.current!,config,abort.signal);if(abort.signal.aborted){owned.dispose();return;}viewer.current=owned;await owned.setSettings(settingsRef.current);if(!abort.signal.aborted){setReady(true);onReady();}}catch(e){if(!abort.signal.aborted)setError(e instanceof Error?e.message:'The experimental complex could not be displayed.');}}
  void start();return ()=>{abort.abort();if(viewer.current===owned)viewer.current=null;owned?.dispose();};
 },[config]);
 useEffect(()=>{if(!ready||!viewer.current)return;void viewer.current.setSettings(settings);},[settings,ready]);
 useEffect(()=>{if(ready)viewer.current?.reset();},[reset,ready]);
 return <div className="experimental-binding-host"><div className="molstar-host" ref={host} data-ready={ready} data-pdb={config.pdbId}/>{!ready&&!error&&<div className="molecular-loading" role="status">Loading deposited {config.pdbId} complex…</div>}{error&&<div className="molecular-loading" role="alert"><strong>Experimental complex unavailable</strong><p>{error}</p><a href={`${import.meta.env.BASE_URL}${config.localUrl}`} download>Download the local mmCIF</a></div>}</div>;
}
