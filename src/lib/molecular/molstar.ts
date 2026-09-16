import {createRoot,type Root} from 'react-dom/client';
import {createPluginUI} from 'molstar/lib/mol-plugin-ui/index.js';
import {DefaultPluginUISpec} from 'molstar/lib/mol-plugin-ui/spec.js';
import {MolScriptBuilder as MS} from 'molstar/lib/mol-script/language/builder.js';
import {Color} from 'molstar/lib/mol-util/color/index.js';
import {PluginConfig} from 'molstar/lib/mol-plugin/config.js';
import type {MolecularStructureConfig} from '../../data/molecularStructures';
import 'molstar/build/viewer/molstar.css';
export interface MolecularSettings {
 peptide:boolean; receptor:boolean; labels:boolean; interface?:boolean;
 representation:'cartoon'|'ball-and-stick'|'spacefill'|'molecular-surface';
 peptideRepresentation?:'cartoon'|'ball-and-stick'|'spacefill'|'molecular-surface';
 receptorRepresentation?:'cartoon'|'ball-and-stick'|'spacefill'|'molecular-surface';
}
export async function createMolecularViewer(host:HTMLElement,config:MolecularStructureConfig,signal:AbortSignal){
 let root:Root|undefined;
 const spec=DefaultPluginUISpec();
 spec.layout={initial:{isExpanded:false,showControls:false}};
 spec.components={controls:{top:'none',bottom:'none',left:'none',right:'none'},remoteState:'none'};
 spec.config=[...(spec.config??[]),[PluginConfig.VolumeStreaming.Enabled,false]];
 const plugin=await createPluginUI({target:host,spec,render:(el,target)=>{if(signal.aborted)return;root=createRoot(target);root.render(el);}});
 let disposed=false;
 function dispose(){if(disposed)return;disposed=true;const r=root;root=undefined;
  // React StrictMode and fast receptor tab changes can overlap initialization. Keep
  // teardown on the microtask queue so React finishes the current commit first.
  queueMicrotask(()=>{try{r?.unmount();}catch{/* the plugin may already have detached the host */}plugin.dispose();});
 }
 if(signal.aborted){dispose();throw new DOMException('Aborted','AbortError');}
 try{
  if(!plugin.canvas3d)throw Error('WebGL could not initialize the molecular viewer.');
  plugin.canvas3d.setProps({renderer:{backgroundColor:Color(0x07111c)},camera:{mode:'perspective'},trackball:{animate:{name:'off',params:{}}}});
  const response=await fetch(`${import.meta.env.BASE_URL}${config.localUrl}`,{signal});
  if(!response.ok)throw Error('Structure file could not be loaded.');
  const data=await plugin.builders.data.rawData({data:await response.text(),label:config.pdbId});
  const trajectory=await plugin.builders.structure.parseTrajectory(data,'mmcif');
  const model=await plugin.builders.structure.createModel(trajectory);
  const structure=await plugin.builders.structure.createStructure(model);
  const component=(entity:string,key:string)=>plugin.builders.structure.tryCreateComponentFromExpression(structure,MS.struct.generator.atomGroups({'chain-test':MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_entity_id(),entity])}),key,{label:key});
  const peptide=await component(config.peptideEntity,config.peptideName),receptor=await component(config.receptorEntity,config.receptor);
  if(!peptide?.obj?.data.elementCount||!receptor?.obj?.data.elementCount)throw Error('Verified peptide/receptor selections did not match this structure.');
  // Structural proximity is derived from the deposited coordinates, not an affinity model.
  const interfaceExpression=MS.struct.filter.within({
   '0':MS.struct.generator.atomGroups({'chain-test':MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_entity_id(),config.receptorEntity])}),
   target:MS.struct.generator.atomGroups({'chain-test':MS.core.rel.eq([MS.struct.atomProperty.macromolecular.label_entity_id(),config.peptideEntity])}),
   'max-radius':4,'atom-radius':MS.acp('vdw'),invert:false,
  });
  const interfaceComponent=await plugin.builders.structure.tryCreateComponentFromExpression(structure,interfaceExpression,'Observed proximity',{label:'Observed proximity'});
  let refs:string[]=[];let queue=Promise.resolve();let lastReceptor=false;
  function reset(showReceptor:boolean){if(disposed)return;const sphere=(showReceptor?receptor:peptide)!.obj!.data.boundary.sphere;plugin.managers.camera.focusSphere(sphere,{durationMs:0,extraRadius:.35});}
  function setSettings(settings:MolecularSettings){
   queue=queue.then(async()=>{
    if(disposed||signal.aborted)return;
    const update=plugin.build();refs.forEach(ref=>update.delete(ref));await update.commit();refs=[];
    if(disposed||signal.aborted)return;
    const draw=async(comp:typeof peptide,color:number,type:MolecularSettings['representation']|'label')=>{
     const repr=await plugin.builders.structure.representation.addRepresentation(comp!,{type,color:'uniform',colorParams:{value:Color(color)}});refs.push(repr.ref);
    };
    const peptideType=settings.peptideRepresentation??settings.representation;
    const receptorType=settings.receptorRepresentation??(settings.representation==='molecular-surface'?'molecular-surface':'cartoon');
    if(settings.receptor)await draw(receptor,0xb2a090,receptorType);
    if(settings.interface&&interfaceComponent?.obj?.data.elementCount)await draw(interfaceComponent,0xe6a465,'ball-and-stick');
    if(settings.peptide)await draw(peptide,0x39c7c3,peptideType);
    if(settings.labels&&settings.peptide)await draw(peptide,0xf2d7ae,'label');
    if(lastReceptor!==settings.receptor||host.dataset.ready!=='true')reset(settings.receptor);
    lastReceptor=settings.receptor;host.dataset.ready='true';host.dataset.representation=settings.representation;host.dataset.peptide=String(settings.peptide);host.dataset.receptor=String(settings.receptor);host.dataset.interface=String(Boolean(settings.interface&&interfaceComponent?.obj?.data.elementCount));
   });return queue;
  }
  return {setSettings,reset:()=>reset(lastReceptor),dispose};
 }catch(e){dispose();throw e;}
}
