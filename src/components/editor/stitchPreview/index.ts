/**
 * Stitch-surface preview (Room312-style canvas, no API).
 *
 * Revert without touching the rest of the editor:
 * 1. git checkout cursor/backup-before-stitch-sim-eec7
 *    or delete this folder and undo the stitch tab in AiPreviewNavigator /
 *    the gauge pass in PatternEditor / editor.stitchSim locale keys.
 * 2. 3D garment preview stays on the "garment" tab and is unchanged.
 */
export { default as KnitStitchPreview } from "./KnitStitchPreview.tsx";
export { drawStitchSimulation } from "./stitchSim.ts";
export type { StitchSimMode, StitchSimOptions } from "./stitchSim.ts";
