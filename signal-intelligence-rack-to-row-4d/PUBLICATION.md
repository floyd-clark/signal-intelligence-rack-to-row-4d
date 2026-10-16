# Public publication record

**Live app:** https://floyd-clark.github.io/signal-intelligence-rack-to-row-4d/?catalogue=1

**Repository:** https://github.com/floyd-clark/signal-intelligence-rack-to-row-4d

Initial publication on October 15, 2026 followed the user's explicit instruction to publish publicly. Initial source/application commit: `2dcde2a19d10d16555e82eba9751707872954060`, on `codex/rack-catalogue-2` and the existing default branch `codex/rack-to-row-digital-twin`; initial static-only Pages commit: `32c574abe4df791fef2568bd83c9f959fc5f5ac7`. The current L1–L12 restoration updates that distribution; see CATALOGUE_L1_L12.md for its scope and evidence.

Native Chrome verification of the actual public URL passed: HTTP 200; ten decoded architecture previews and the brand image; two real rendered comparison canvases; GB300 common-loop fault affecting 27 owned assemblies; return to the legacy 4D lab. No uncaught page exceptions or HTTP failure responses were recorded. See [machine-readable verification](evidence/catalogue-v2/public-verification.json), [live gallery screenshot](evidence/catalogue-v2/public-gallery.png) and [live comparison screenshot](evidence/catalogue-v2/public-comparison.png).

The public link opens the catalogue directly. The root URL without `?catalogue=1` opens the original lab. Source, offline distribution, provenance, acceptance gaps, local screenshots and test results remain available in the repository. Public hosting adds no account requirement, telemetry service or equipment connection to the application.

## L1–L12 restoration deployed and verified

Source commit `2dece2a`; static Pages commit `4de34c19ec26ee414b372e0bd7178bf35a3156ee`. GitHub reports this build as **built**. Native Chrome verified the actual public site on October 15: all ten direct L1–L12 entries, twelve stage controls per pane, independent architecture levels, active-incident blocking and clearing, earned L1 signoff and return to the original lab. No uncaught exceptions or failed HTTP responses were recorded. [Live stage comparison](evidence/catalogue-v2/public-lifecycle.png), [DGX L2 power preview](evidence/catalogue-v2/public-DGX-L2-power.png), [verification JSON](evidence/catalogue-v2/public-verification.json), [complete lifecycle test report](evidence/catalogue-v2/lifecycle/test-results.json).

Existing open tabs may need a hard refresh (Ctrl+Shift+R) to load the new application bundle. All later documentation-only commits preserve this deployed static build.

To republish a later tested distribution, commit its source/build and push the source branch, then split `signal-intelligence-rack-to-row-4d/dist` with `git subtree split` and push that commit to `gh-pages` without force. GitHub Pages serves the branch root; `.nojekyll` and repository-relative asset paths are included. `node scripts/github-pages.mjs status` checks deployment status using existing Git credential-manager authentication without logging credentials; `node scripts/verify-public.mjs` repeats the live verification.


## Catalogue / 4D convergence deployed and verified

Source/application commit `5a98fe2`; static Pages commit `152c354d6a587754e25064dc39fa0d7d3a7e31d4`. GitHub reports this Pages commit **built**. [Open the updated workbench catalogue](https://floyd-clark.github.io/signal-intelligence-rack-to-row-4d/?catalogue=1&v=4d-workbench).

Every catalogue card opens the full three-panel 4D workspace. Shared intelligence, timeline/chart and local model rendering preserve the original profiles while adding per-family layers, component navigation, investigation/recovery/release and model bindings. All 52 unit tests passed. The complete 16-workflow browser run passed, followed by all 11 catalogue/workbench workflows after the camera correction. Native captures cover all ten entries and verify matching initial A/B camera positions/targets.

Live verification passed against the exact local build bundle `index-pGVUAE_L.js` on 2026-10-16T01:33:24.242Z: HTTP 200, ten decoded cards, the shared workbench/explorer/intelligence, linked A/B controls, two real canvases, a 27-owner GB300 incident, independently staged L1–L12, incident blocking/clearing, earned signoff and return to the original reference profiles. No uncaught page exception or failed HTTP response occurred. [Live verification JSON](evidence/catalogue-v2/workbench/public-verification.json), [live comparison](evidence/catalogue-v2/workbench/public-comparison.png), [live stage preview](evidence/catalogue-v2/workbench/public-lifecycle.png).

[Full changes, screenshots, acceptance and remaining gaps](CATALOGUE_4D_CONVERGENCE.md). Catalogue neighboring row copies remain illustrative; independently identified row simulation remains in the original reference profiles. Imported user files remain local and are not published. Earlier public proof files remain preserved at their original paths; this release's evidence is in the workbench subdirectory. Documentation/evidence-only commits after `5a98fe2` do not change this deployed static build. Existing tabs may need Ctrl+Shift+R.
