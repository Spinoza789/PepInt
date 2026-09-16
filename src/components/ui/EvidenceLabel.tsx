import type { EvidenceLabel as EvidenceLabelType } from '../../lib/types';
import { Badge } from './Badge';

export function EvidenceLabel({ label }: { label: EvidenceLabelType }) {
  const tone = label === 'Experimental structure' ? 'cyan' : label === 'Conceptual educational animation' ? 'amber' : 'neutral';
  return <Badge tone={tone}>{label}</Badge>;
}
