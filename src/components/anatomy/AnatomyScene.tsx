import { OrbitControls } from '@react-three/drei';
import { useRef } from 'react';
import { useExperienceStore } from '../../state/useExperienceStore';
import { CameraTransitionController } from './CameraTransitionController';
import { OrganLabels } from './OrganLabels';
import { ProceduralBodyShell } from './procedural/ProceduralBodyShell';
import { ProceduralHeart } from './procedural/ProceduralHeart';
import { ProceduralIntestinePlaceholder } from './procedural/Placeholder';
import { ProceduralKidneys } from './procedural/ProceduralKidneys';
import { ProceduralLargeIntestine, ProceduralSmallIntestine } from './procedural/ProceduralIntestines';
import { ProceduralLiver } from './procedural/ProceduralLiver';
import { ProceduralLungs } from './procedural/ProceduralLungs';
import { ProceduralPancreas } from './procedural/ProceduralPancreas';
import { ProceduralRibcage } from './procedural/ProceduralRibcage';
import { ProceduralStomach } from './procedural/ProceduralStomach';
import { ProceduralVessels } from './procedural/ProceduralVessels';

export function AnatomyScene() {
  const controlsRef = useRef<any>(null);
  const selectOrgan = useExperienceStore((state) => state.selectOrgan);
  return (
    <>
      <color attach="background" args={['#07111c']} />
      <fog attach="fog" args={['#07111c', 8, 16]} />
      <ambientLight intensity={1.25} color="#b7d6dd" />
      <hemisphereLight args={['#b8e8ea', '#07101b', 1.15]} />
      <directionalLight position={[-4, 7, 6]} intensity={3.4} color="#fff1da" castShadow />
      <pointLight position={[3, 1, 4]} intensity={16} distance={8} color="#4c99d2" />
      <pointLight position={[-4, -1, 2]} intensity={7} distance={7} color="#a85962" />
      <group position={[0, -0.05, 0]}>
        <ProceduralVessels />
        <ProceduralKidneys />
        <ProceduralLungs />
        <ProceduralHeart />
        <ProceduralLiver />
        <ProceduralStomach />
        <ProceduralPancreas />
        <ProceduralSmallIntestine />
        <ProceduralLargeIntestine />
        <ProceduralRibcage />
        <ProceduralBodyShell />
        <OrganLabels />
      </group>
      <OrbitControls
        ref={controlsRef}
        makeDefault
        target={[0, 0.05, 0]}
        minDistance={2.35}
        maxDistance={11}
        maxPolarAngle={Math.PI * 0.72}
        minPolarAngle={Math.PI * 0.22}
        enableDamping
        dampingFactor={0.08}
      />
      <CameraTransitionController controlsRef={controlsRef} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3.4, 0]} onClick={() => selectOrgan(null)} raycast={() => null}>
        <planeGeometry args={[20, 20]} /><shadowMaterial transparent opacity={0.16} />
      </mesh>
    </>
  );
}
