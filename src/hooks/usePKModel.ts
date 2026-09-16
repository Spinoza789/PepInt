import {useEffect,useMemo} from 'react';
import {concentrationAt,effectAt,makePKSeries} from '../lib/pk';
import {useExperienceStore} from '../state/useExperienceStore';
export function usePKModel(){
 const day=useExperienceStore(s=>s.currentTimeDays),halfLife=useExperienceStore(s=>s.halfLifeDays),mode=useExperienceStore(s=>s.dosingMode);
 const series=useMemo(()=>makePKSeries(halfLife,mode),[halfLife,mode]);
 const concentration=concentrationAt(day,halfLife,mode);return {series,concentration,effect:effectAt(concentration)};
}
/** Mounted ONCE in App, so navigation and multiple charts never duplicate playback. */
export function useTimelinePlayback(){
 const playing=useExperienceStore(s=>s.timelinePlaying);
 useEffect(()=>{
  if(!playing)return;let last=performance.now();
  const timer=window.setInterval(()=>{const now=performance.now(),dt=(now-last)/1000;last=now;
   const state=useExperienceStore.getState();const next=Math.min(42,state.currentTimeDays+dt*1.5);
   state.setCurrentTimeDays(next);if(next>=42)state.setTimelinePlaying(false);
  },100);return ()=>window.clearInterval(timer);
 },[playing]);
}
