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
