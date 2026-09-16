import { ChevronLeft, ChevronRight, Pause, Play, Video, X } from 'lucide-react';
import { pathwaySteps } from '../../data/pathwaySteps';
import { useExperienceStore } from '../../state/useExperienceStore';

export function GuidedVideoOverlay() {
  const pathwayStep = useExperienceStore((state) => state.pathwayStep);
  const pathwayPlaying = useExperienceStore((state) => state.pathwayPlaying);
  const videoMode = useExperienceStore((state) => state.videoMode);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const setVideoMode = useExperienceStore((state) => state.setVideoMode);
  const setPathwayPlaying = useExperienceStore((state) => state.setPathwayPlaying);
  const setPathwayStep = useExperienceStore((state) => state.setPathwayStep);
  const setLayerMode = useExperienceStore((state) => state.setLayerMode);
  const requestOrganCamera = useExperienceStore((state) => state.requestOrganCamera);
  const requestBodyCamera = useExperienceStore((state) => state.requestBodyCamera);
  const selectOrgan = useExperienceStore((state) => state.selectOrgan);
  const setLayerVisibility = useExperienceStore((state) => state.setLayerVisibility);

  if (!videoMode) {
    return (
      <button className="guided-video-launch" onClick={() => { setVideoMode(true); setPathwayPlaying(true); }}>
        <Video size={15} /> Follow peptide video
      </button>
    );
  }

  const step = pathwaySteps[pathwayStep];
  const move = (next: number) => {
    const bounded = Math.min(pathwaySteps.length - 1, Math.max(0, next));
    setPathwayStep(bounded);
    selectOrgan(pathwaySteps[bounded].organId);
    setLayerMode('normal');
    if (pathwaySteps[bounded].organId && pathwaySteps[bounded].organId !== 'muscle') requestOrganCamera(pathwaySteps[bounded].organId);
    else requestBodyCamera();
    if (pathwaySteps[bounded].organId === 'muscle') setLayerVisibility('muscles', true);
  };

  return (
    <section className="guided-video" aria-label="Guided peptide pathway video">
      <div className="guided-video-head"><span><Video size={14} /> GUIDED VISUAL STORY</span><button aria-label="Close guided video" onClick={() => { setVideoMode(false); setPathwayPlaying(false); }}><X size={15} /></button></div>
      <div className="guided-video-progress"><i style={{ width: `${((pathwayStep + 1) / pathwaySteps.length) * 100}%` }} /></div>
      <div className="guided-video-kicker">SCENE {String(pathwayStep + 1).padStart(2, '0')} / {pathwaySteps.length}</div>
      <h2>{step.title}</h2>
      <p>{step.text}</p>
      <div className="guided-video-controls"><button aria-label="Previous video scene" disabled={pathwayStep === 0} onClick={() => move(pathwayStep - 1)}><ChevronLeft size={16} /></button><button className="guided-play" onClick={() => { if (reducedMotion) move(pathwayStep + 1); else setPathwayPlaying(!pathwayPlaying); }}>{pathwayPlaying ? <Pause size={14} /> : <Play size={14} />}{reducedMotion ? 'Next scene' : pathwayPlaying ? 'Pause video' : 'Play video'}</button><button aria-label="Next video scene" disabled={pathwayStep === pathwaySteps.length - 1} onClick={() => move(pathwayStep + 1)}><ChevronRight size={16} /></button></div>
      <label className="guided-video-scrub" htmlFor="guided-video-step"><span>Scene</span><input id="guided-video-step" type="range" min="0" max={pathwaySteps.length - 1} step="1" value={pathwayStep} onChange={(event) => { setPathwayPlaying(false); move(Number(event.target.value)); }} /><span>{pathwayStep + 1}</span></label>
      <small>Camera zooms and organ highlights are illustrative. Scene timing is not a physiological onset time.</small>
    </section>
  );
}
