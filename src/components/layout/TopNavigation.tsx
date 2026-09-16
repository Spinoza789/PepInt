import { Activity, Atom, BookOpen, Dna, HeartPulse, TimerReset } from 'lucide-react';
import type { ExperienceStage } from '../../lib/types';
import { useExperienceStore } from '../../state/useExperienceStore';

const navigation: { stage: ExperienceStage; label: string; icon: typeof Activity }[] = [
  { stage: 'overview', label: 'Overview', icon: Activity },
  { stage: 'peptide', label: 'Peptide', icon: Dna },
  { stage: 'receptors', label: 'Receptors', icon: Atom },
  { stage: 'body', label: 'Body', icon: HeartPulse },
  { stage: 'halfLife', label: 'Half-life', icon: TimerReset },
  { stage: 'sources', label: 'Sources', icon: BookOpen },
];

export function TopNavigation() {
  const stage = useExperienceStore((state) => state.stage);
  const setStage = useExperienceStore((state) => state.setStage);
  return (
    <nav className="top-navigation" aria-label="Experience sections">
      {navigation.map(({ stage: target, label, icon: Icon }) => (
        <button key={target} className={stage === target || (target === 'body' && stage === 'organ') || (target === 'peptide' && (stage === 'molecule' || stage === 'cell')) ? 'active' : ''} onClick={() => setStage(target)}>
          <Icon size={15} /><span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
