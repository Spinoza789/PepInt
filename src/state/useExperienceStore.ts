import { create } from 'zustand';
import type { ExperienceStage, LayerMode, OrganId, ReceptorId } from '../lib/types';
import type { HeadSystem, HeadSystemFilter } from '../lib/head/model';
export type AnatomyLayers = {shell:boolean; ribs:boolean; vessels:boolean; muscles:boolean; labels:boolean};
export type HeadSelection = {key:string; name:string; system:HeadSystem; side:string}|null;
export type ViewExtent = 'torso'|'body';
type CameraRequest = {kind:'body'}|{kind:'organ';organId:OrganId};
export interface ExperienceState {
  stage:ExperienceStage; selectedOrganId:OrganId|null; hoveredOrganId:OrganId|null;
  selectedReceptorId:ReceptorId|null; layerMode:LayerMode; layers:AnatomyLayers;
  shellOpacity:number; muscleOpacity:number; cutDepth:number; viewExtent:ViewExtent; textures:boolean;
  headVisible:boolean; headSystem:HeadSystemFilter; headExplode:number; headSurface:'anatomy'|'porcelain'|'wire'|'ghost'; headClip:boolean; headClipPosition:number; headSelection:HeadSelection;
  pathwayPlaying:boolean; pathwayStep:number; timelinePlaying:boolean; currentTimeDays:number;
  videoMode:boolean;
  halfLifeDays:number; dosingMode:'single'|'weekly'; showLabels:boolean; reducedMotion:boolean;
  cameraRequest:CameraRequest; cameraRequestVersion:number;
  setStage:(v:ExperienceStage)=>void; selectOrgan:(v:OrganId|null)=>void; setHoveredOrgan:(v:OrganId|null)=>void;
  selectReceptor:(v:ReceptorId|null)=>void; setLayerMode:(v:LayerMode)=>void;
  setLayerVisibility:(k:keyof AnatomyLayers,v:boolean)=>void; setShellOpacity:(v:number)=>void;
  setMuscleOpacity:(v:number)=>void; setCutDepth:(v:number)=>void; setViewExtent:(v:ViewExtent)=>void; setTextures:(v:boolean)=>void;
  setHeadVisible:(v:boolean)=>void; setHeadSystem:(v:HeadSystemFilter)=>void; setHeadExplode:(v:number)=>void; setHeadSurface:(v:ExperienceState['headSurface'])=>void; setHeadClip:(v:boolean)=>void; setHeadClipPosition:(v:number)=>void; selectHeadPart:(v:HeadSelection)=>void;
  setPathwayPlaying:(v:boolean)=>void; setPathwayStep:(v:number)=>void; setTimelinePlaying:(v:boolean)=>void;
  setVideoMode:(v:boolean)=>void;
  setCurrentTimeDays:(v:number)=>void; setHalfLifeDays:(v:number)=>void; setDosingMode:(v:'single'|'weekly')=>void;
  setShowLabels:(v:boolean)=>void; setReducedMotion:(v:boolean)=>void;
  requestBodyCamera:()=>void; requestOrganCamera:(v:OrganId)=>void; resetExperience:()=>void;
}
const initialLayers:AnatomyLayers={shell:true,ribs:false,vessels:true,muscles:false,labels:true};
const initial={stage:'body' as ExperienceStage,selectedOrganId:null,hoveredOrganId:null,selectedReceptorId:'GLP1R' as ReceptorId,
 layerMode:'normal' as LayerMode,layers:initialLayers,shellOpacity:.22,muscleOpacity:.9,cutDepth:.5,viewExtent:'body' as ViewExtent,textures:true,
 headVisible:true,headSystem:'all' as HeadSystemFilter,headExplode:0,headSurface:'anatomy' as const,headClip:false,headClipPosition:0,headSelection:null,
 pathwayPlaying:false,pathwayStep:0,timelinePlaying:false,videoMode:false,currentTimeDays:0,halfLifeDays:6,dosingMode:'single' as const,showLabels:true};
const clamp=(v:number,min:number,max:number)=>Math.min(max,Math.max(min,Number.isFinite(v)?v:min));
export const useExperienceStore=create<ExperienceState>((set)=>({
 ...initial,reducedMotion:typeof window!=='undefined'&&window.matchMedia('(prefers-reduced-motion: reduce)').matches,
 cameraRequest:{kind:'body'},cameraRequestVersion:0,
 setStage:stage=>set(s=>({stage,pathwayPlaying:['body','organ','halfLife'].includes(stage)?s.pathwayPlaying:false})),selectOrgan:selectedOrganId=>set(s=>({selectedOrganId,hoveredOrganId:null,
  ...(s.layerMode==='focus'?{layerMode:selectedOrganId?'focus' as const:'normal' as const,cameraRequest:selectedOrganId?{kind:'organ' as const,organId:selectedOrganId}:{kind:'body' as const},cameraRequestVersion:s.cameraRequestVersion+1}:{})})),
 setHoveredOrgan:hoveredOrganId=>set({hoveredOrganId}),selectReceptor:selectedReceptorId=>set({selectedReceptorId}),
 setLayerMode:layerMode=>set({layerMode}),setLayerVisibility:(k,v)=>set(s=>({layers:{...s.layers,[k]:v}})),
 setShellOpacity:v=>set({shellOpacity:clamp(v,0,1)}),setMuscleOpacity:v=>set({muscleOpacity:clamp(v,0,1)}),
 setCutDepth:v=>set({cutDepth:clamp(v,0,1)}),setViewExtent:viewExtent=>set(s=>({viewExtent,cameraRequest:{kind:'body'},cameraRequestVersion:s.cameraRequestVersion+1})),setTextures:textures=>set({textures}),
 setHeadVisible:headVisible=>set({headVisible}),setHeadSystem:headSystem=>set({headSystem}),setHeadExplode:headExplode=>set({headExplode:clamp(headExplode,0,1)}),setHeadSurface:headSurface=>set({headSurface}),setHeadClip:headClip=>set({headClip}),setHeadClipPosition:headClipPosition=>set({headClipPosition:clamp(headClipPosition,-1,1)}),selectHeadPart:headSelection=>set({headSelection}),
 setPathwayPlaying:pathwayPlaying=>set({pathwayPlaying}),setPathwayStep:pathwayStep=>set({pathwayStep:clamp(pathwayStep,0,7)}),setVideoMode:videoMode=>set({videoMode}),
 setTimelinePlaying:timelinePlaying=>set(s=>({timelinePlaying,currentTimeDays:timelinePlaying&&s.currentTimeDays>=42?0:s.currentTimeDays})),
 setCurrentTimeDays:v=>set({currentTimeDays:clamp(v,0,42)}),setHalfLifeDays:v=>set({halfLifeDays:clamp(v,3,12)}),setDosingMode:dosingMode=>set({dosingMode}),
 setShowLabels:showLabels=>set({showLabels}),setReducedMotion:reducedMotion=>set({reducedMotion}),
 requestBodyCamera:()=>set(s=>({layerMode:s.layerMode==='focus'?'normal':s.layerMode,cameraRequest:{kind:'body'},cameraRequestVersion:s.cameraRequestVersion+1})),
 requestOrganCamera:organId=>set(s=>({selectedOrganId:organId,layerMode:'focus',cameraRequest:{kind:'organ',organId},cameraRequestVersion:s.cameraRequestVersion+1})),
 resetExperience:()=>set(s=>({...initial,videoMode:false,cameraRequest:{kind:'body'},cameraRequestVersion:s.cameraRequestVersion+1})),
}));
