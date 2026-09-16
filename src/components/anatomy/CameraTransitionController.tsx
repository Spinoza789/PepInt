import { useEffect, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import { Vector3 } from 'three';
import gsap from 'gsap';
import { organContent } from '../../data/organs';
import { useExperienceStore } from '../../state/useExperienceStore';

type CameraControlsLike = { target: Vector3; update: () => void };

export function CameraTransitionController({ controlsRef }: { controlsRef: React.RefObject<CameraControlsLike | null> }) {
  const camera = useThree((state) => state.camera);
  const request = useExperienceStore((state) => state.cameraRequest);
  const requestVersion = useExperienceStore((state) => state.cameraRequestVersion);
  const reducedMotion = useExperienceStore((state) => state.reducedMotion);
  const lookTarget = useRef(new Vector3(0, 0.1, 0));

  useEffect(() => {
    const config = request.kind === 'organ'
      ? organContent[request.organId]
      : { cameraPosition: [0, 0.15, 7.6], cameraTarget: [0, 0.05, 0] };
    const [x, y, z] = config.cameraPosition;
    const [targetX, targetY, targetZ] = config.cameraTarget;
    const duration = reducedMotion ? 0 : 1.1;
    const controls = controlsRef.current;

    gsap.killTweensOf(camera.position);
    gsap.killTweensOf(lookTarget.current);
    gsap.to(camera.position, { x, y, z, duration, ease: 'power2.inOut' });
    gsap.to(lookTarget.current, {
      x: targetX, y: targetY, z: targetZ, duration, ease: 'power2.inOut',
      onUpdate: () => {
        controls?.target.copy(lookTarget.current);
        controls?.update();
      },
    });
  }, [camera, controlsRef, reducedMotion, request, requestVersion]);

  return null;
}
