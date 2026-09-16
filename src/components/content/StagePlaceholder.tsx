import { FlaskConical, LockKeyhole } from 'lucide-react';
import type { ExperienceStage } from '../../lib/types';
import { molecularStructures } from '../../data/molecularStructures';
import { EvidenceLabel } from '../ui/EvidenceLabel';

const copy: Record<Exclude<ExperienceStage, 'body' | 'organ'>, { eyebrow: string; title: string; body: string }> = {
  overview: { eyebrow: 'RETATRUTIDE EDUCATION', title: 'From peptide to whole-body effects', body: 'Explore the conceptual molecular stage, interactive receptor contexts, realistic reference anatomy, and a normalized concentration timeline. Each scale change is labelled and deliberately educational.' },
  peptide: { eyebrow: 'MOLECULAR VIEW', title: 'Peptide explorer is ready', body: 'Rotate a molecular-inspired retatrutide chain and compare it with a conceptual membrane receptor. Deposited PDB references are shown with their evidence labels.' },
  receptors: { eyebrow: 'CONCEPTUAL SIGNALLING', title: 'Compare three receptor contexts', body: 'Switch among GLP-1R, GIPR, and GCGR. Binding, activation, and intracellular pulses are conceptual illustrations rather than molecular dynamics.' },
  cell: { eyebrow: 'CELL-LEVEL ILLUSTRATION', title: 'Cell membrane concept', body: 'Use the receptor stage to move from organ context toward a simplified membrane and signalling view. It is not a scale-accurate zoom.' },
  molecule: { eyebrow: 'MOLECULAR STRUCTURE', title: 'Molecular-inspired chain', body: 'The current chain is a structural proxy. PDB configuration is retained for the future Mol* viewer and peptide/receptor chain mapping.' },
  halfLife: { eyebrow: 'SIMPLIFIED PK MODEL', title: 'Half-life simulation is ready', body: 'Scrub normalized concentration over 42 days, compare a single illustrative input with repeated inputs, and send the selected day back to the anatomy view.' },
  sources: { eyebrow: 'SOURCES AND NOTES', title: 'Provenance is part of the experience', body: 'The anatomy view uses the Human Atlas repository\'s documented Human Reference Atlas organ assembly, adapted and redistributed under CC BY 4.0. The retatrutide pathway remains an educational interpretation layered over that reference.' },
};

export function StagePlaceholder({ stage }: { stage: Exclude<ExperienceStage, 'body' | 'organ'> }) {
  const data = copy[stage];
  return (
    <main className="placeholder-stage">
      <div className="placeholder-icon"><FlaskConical size={28} /></div>
      <div className="panel-kicker">{data.eyebrow}</div>
      <h1>{data.title}</h1>
      <p>{data.body}</p>
      {stage === 'peptide' || stage === 'molecule' ? <div className="structure-list">{molecularStructures.map((structure) => <div key={structure.id}><strong>{structure.pdbId}</strong><span>{structure.receptor}</span><EvidenceLabel label={structure.evidence} /></div>)}</div> : null}
      {stage === 'sources' ? <div className="sources-note"><LockKeyhole size={16} /> BodyParts3D attribution is included in <code>public/ATTRIBUTION.md</code>. Future external assets require a source and licence entry before they can be production-ready.</div> : null}
    </main>
  );
}
