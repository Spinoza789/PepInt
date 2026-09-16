import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { OrganGroup, useOrganVisual } from './OrganGroup';

export function ProceduralLungs() {
  const group = useRef<Group>(null);
  const visual = useOrganVisual('lungs', '#bd7777', 0.9);
  useFrame(({ clock }) => {
    if (group.current) group.current.scale.setScalar(visual.scale * (1 + Math.sin(clock.elapsedTime * 0.8) * 0.012));
  });
  return (
    <OrganGroup organId="lungs" position={[0, 1.25, -0.02]}>
      <group ref={group}>
        <mesh position={[-0.7, 0, 0]} scale={[0.68, 1.22, 0.5]} rotation={[0.04, 0, -0.1]}>
          <icosahedronGeometry args={[1, 4]} /><meshPhysicalMaterial {...visual} roughness={0.68} clearcoat={0.06} />
        </mesh>
        <mesh position={[0.72, -0.04, 0]} scale={[0.62, 1.17, 0.48]} rotation={[-0.04, 0, 0.1]}>
          <icosahedronGeometry args={[1, 4]} /><meshPhysicalMaterial {...visual} roughness={0.68} clearcoat={0.06} />
        </mesh>
        <mesh position={[0.05, 0.86, 0]} scale={[0.18, 0.48, 0.17]}>
          <capsuleGeometry args={[1, 8, 12, 18]} /><meshStandardMaterial color="#d7b8ae" transparent opacity={visual.opacity} />
        </mesh>
      </group>
    </OrganGroup>
  );
}
