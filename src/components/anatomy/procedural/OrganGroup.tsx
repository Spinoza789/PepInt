import type { PropsWithChildren } from 'react';
import { useMemo } from 'react';
import type { ThreeElements } from '@react-three/fiber';
import type { OrganId } from '../../../lib/types';
import { useExperienceStore } from '../../../state/useExperienceStore';

type OrganGroupProps = PropsWithChildren<ThreeElements['group'] & { organId: OrganId; visible?: boolean }>;

export function OrganGroup({ organId, visible = true, children, ...groupProps }: OrganGroupProps) {
  const selectedOrganId = useExperienceStore((state) => state.selectedOrganId);
  const setHoveredOrgan = useExperienceStore((state) => state.setHoveredOrgan);
  const selectOrgan = useExperienceStore((state) => state.selectOrgan);

  const selectionOpacity = useMemo(() => {
    if (!selectedOrganId || selectedOrganId === organId) return 1;
    return 0.25;
  }, [organId, selectedOrganId]);

  return (
    <group
      {...groupProps}
      name={organId}
      visible={visible}
      userData={{ organId, selectionOpacity }}
      onClick={(event) => {
        event.stopPropagation();
        selectOrgan(organId);
      }}
      onPointerOver={(event) => {
        event.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHoveredOrgan(organId);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
        setHoveredOrgan(null);
      }}
    >
      {children}
    </group>
  );
}

export function useOrganVisual(organId: OrganId, baseColor: string, baseOpacity = 1) {
  const selectedOrganId = useExperienceStore((state) => state.selectedOrganId);
  const hoveredOrganId = useExperienceStore((state) => state.hoveredOrganId);
  const layerMode = useExperienceStore((state) => state.layerMode);
  const selected = selectedOrganId === organId;
  const hovered = hoveredOrganId === organId;
  const dimmed = Boolean(selectedOrganId && !selected);
  const opacity = (dimmed ? 0.24 : 1) * baseOpacity;

  return {
    color: selected ? '#f0aa57' : baseColor,
    opacity,
    transparent: opacity < 0.99,
    emissive: selected ? '#754115' : hovered ? baseColor : '#000000',
    emissiveIntensity: selected ? 0.38 : hovered ? 0.18 : 0,
    scale: selected || hovered ? 1.025 : 1,
    renderOrder: layerMode === 'focus' && !selected ? 0 : 2,
  };
}
