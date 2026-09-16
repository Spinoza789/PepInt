# Retatrutide: From Peptide to Whole-Body Effects

Interactive reference anatomy with an integrated educational concentration timeline. Start with `npm ci` and `npm run dev -- --host 0.0.0.0`. Node 22.18+ is required. No database, Blender installation or anatomy download is needed at runtime.

## Explore

- Rotate, zoom and pan. Switch between torso and whole-body framing.
- Toggle real skin, registered torso muscles, ribs and major vessels. Skin and muscle opacity range from 0–100%.
- **Through** moves a clipping plane through outer layers while preserving the organs. **Transparent** fades them. Use the organ list or on-canvas labels to select, then isolate hidden organs such as the pancreas and kidneys.
- The timeline below the anatomy scrubs/plays 42 days. Both input modes use the same isolated-dose peak reference; accumulation can exceed 1. The 0.75-day absorption phase and 6-day half-life setting are illustrative, not a fit to patient data.
- Cyan circulation particles follow the timeline's visual intensity. The eight-step story explains systemic context independently of the timeline; steps are not physiological onset times. Reduced motion removes decorative movement without disabling user-requested playback.

## Scientific and anatomical limits

Educational only: not medical advice, a diagnostic tool, a dosing calculator or a treatment recommendation. Retatrutide is described as investigational. No clinical concentration units, dose amounts, organ drug levels, measured receptor occupancy or individual efficacy are computed.

The anatomy is a **composite reference**: HRA female skin and organ surfaces, plus BodyParts3D male torso muscle/rib/stomach geometry registered for illustration. These datasets are not one person's scan. Registration, cut planes, colors and surface detail are not clinically validated. Muscle coverage is limited to the torso/shoulders. The Peptide and Receptor sections use the bundled Mol* viewer for observed retatrutide / receptor and glucagon / GCGR complexes. GLP-1R and GIPR use 8YWF and 8YW4; GCGR uses the glucagon-bound 6LMK complex. Each is one captured conformation, not a dynamics or affinity model.

## Provenance and asset preparation

Geometry comes from [ashemag/human-atlas](https://github.com/ashemag/human-atlas): BodyParts3D at `1c38bf35c254a891200d3cedecfd57abebe83d8d` and HRA geometry from historical revision `d72b4f6`. See [attribution](public/ATTRIBUTION.md) and [Human Atlas's MIT code licence](public/licenses/human-atlas-MIT.txt).

`npm run prepare:anatomy` rebuilds the local compact bundle using the existing `public/models` data. `scripts/prepare-anatomy.mjs` preserves source IDs, curates visible outer organ surfaces, and records the registration matrix in `public/anatomy/manifest.json`. No remote fetches are needed. The runtime bundle is about 6 MB compressed and has 38 groups / 373k triangles. The original atlases are retained for reproducibility.

`npm run prepare:structures` verifies the local mmCIF entity and chain mappings for GLP-1R (`8YWF`), GIPR (`8YW4`) and GCGR (`6LMK`) and regenerates their compact metadata. The structure files are deposited coordinates; missing residues, receptor motion, affinity and retatrutide-specific GCGR binding are not reconstructed.

Runtime code is split across `src/lib/atlas/{model,materials,camera,renderer}.ts`; materials have one owner and are disposed on teardown. Geometry downloads are cached in memory across navigation; failures are retryable. `src/state/useExperienceStore.ts` owns controls. A single application-level playback hook prevents timers multiplying when views change.

## Validation

- `npm test`: PK arithmetic and geometry/source-contract checks.
- `npm run build`: TypeScript and production build.
- `npx playwright install chromium` (once), then run the dev server and `npm run test:browser`. Optional `ANATOMY_TEST_URL` points this at a production preview. Browser checks cover direct picking, layers, cutaway, isolation/reset, accumulation, pause, reduced motion, mobile overflow and download failure. Screenshots go to `artifacts/`.

## Future model replacements

Keep organ IDs (`heart`, `lungs`, `liver`, `stomach`, `pancreas`, `smallIntestine`, `largeIntestine`, `kidneys`) and source provenance. Use meter/Y-up coordinates with the same specimen origin or document an explicit transform. The renderer derives camera fits from mesh bounds and dispatches selection by organ ID. Add the asset licence and modification notes before enabling any new model. Detailed molecular and cell-scale stages can share this state and timeline without implying a scale-accurate continuous zoom.
# PepInt
