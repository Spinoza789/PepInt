import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type { Group } from 'three';
import { OrganGroup, useOrganVisual } from './OrganGroup';

export function ProceduralHeart() {
  const group = useRef<Group>(null);
  const visual = useOrganVisual('heart', '#9d3640');
  useFrame(({ clock }) => {
    if (group.current) {
      const beat = 1 + Math.sin(clock.elapsedTime * 2.4) * 0.025;
      group.current.scale.setScalar(beat * visual.scale);
    }
  });
  return (
    <OrganGroup organId="heart" position={[0.08, 1.0, 0.48]} rotation={[0, 0.15, -0.15]}>
      <group ref={group}>
        <mesh position={[-0.27, 0.05, 0]} scale={[0.48, 0.64, 0.38]}>
          <sphereGeometry args={[1, 28, 24]} />
          <meshPhysicalMaterial {...visual} roughness={0.34} clearcoat={0.25} />
        </mesh>
        <mesh position={[0.28, 0.03, 0]} scale={[0.5, 0.69, 0.4]}>
          <sphereGeometry args={[1, 28, 24]} />
          <meshPhysicalMaterial {...visual} roughness={0.34} clearcoat={0.25} />
        </mesh>
        <mesh position={[0.02, -0.42, 0]} rotation={[0, 0, Math.PI / 4]} scale={[0.52, 0.76, 0.44]}>
          <sphereGeometry args={[1, 28, 24]} />
          <meshPhysicalMaterial {...visual} roughness={0.34} clearcoat={0.25} />
        </mesh>
        <mesh position={[-0.1, 0.73, -0.08]} rotation={[0.12, 0, 0]} scale={[0.15, 0.48, 0.16]}>
          <cylinderGeometry args={[1, 0.82, 1, 16]} />
          <meshPhysicalMaterial {...visual} roughness={0.34} />
        </mesh>
      </group>
    </OrganGroup>
  );
}
