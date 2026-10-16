# Rack Catalogue 2.0 — implementation handoff

Feature branch: `codex/rack-catalogue-2`, based on published `266055b`. The baseline audit confirmed the existing detailed v2 geometry, four dual-chiplet TPUs per Ironwood host and approved Signal Intelligence branding before implementation. The user authorized public repository/site publication on October 15 after the local handoff was committed. Publication uses the tested static distribution with paths compatible with both loopback and the GitHub Pages repository prefix.

## Hardware and architecture data

Added ten registered architecture families with separate geometry builders: Enterprise EIA, OCP ORv3, NVIDIA DGX B200, NVIDIA GB300 NVL72, AMD Helios, Google Ironwood, AWS Trainium3, Azure Maia, Cerebras CS-4 and HPE Cray EX4000. Their silhouettes, tray forms, service equipment, power distribution, cooling and fabrics differ. The [catalogue index](CATALOGUE_INDEX.md) lists each physical distinction, source and scope.

GB300 has the source-specific tray/GPU/CPU/switch/power inventory. Helios uses a double-wide ORW enclosure, four separate UALink cartridges and liquid/DC service hardware. Ironwood contains four dual-chiplet TPUs per carrier, a 64-node cube, six-neighbor ICI torus and a separately owned OCS interface. A separately selectable Rubin child changes to four taller power shelves, a 54 V liquid-cooled busbar and two-board compute carrier. Future TPU8/Maia300 details remain qualified source notes instead of inherited hardware models.

New `src/catalogue/types.ts`, `registry.ts`, `variants.ts`, `sources/register.ts` and `graphs.ts` carry dated scoped claims, source confidence, unknown dimensions, parent IDs, lifecycle adapters and separate service/communication edges. Original procedural geometry is under `src/catalogue/models/`; reference artwork/CAD is not redistributed. [Provenance](CATALOGUE_PROVENANCE.md) separates supported architecture facts from illustrative mechanics.

## Interaction, diagnostics and teaching

`src/catalogue/ui/` provides an offline gallery with actual rendered thumbnails, a full three-panel 4D workbench and synchronized true-3D A/B comparison. Camera orbit including damping, presets, time and explosion synchronize; overlays can be linked or independent. Compute/memory/power/cooling/network/service concepts resolve to actual owned assemblies on both sides. Front/rear/deep picking, click/drill/back, retained selection, cutaways, topology, reference-row context, panel collapse, keyboard selection, reduced motion, fallback and 4K hardware export are implemented.

Twenty authored synthetic fault scenarios have architecture-specific symptoms, hypotheses, tests, containment and prevention. Pure seeded snapshots support rewind and validated replay import/export. Scope distinguishes local, shared cooling/power, communication fabric and software conditions. Cooling flow changes precede heat/throttling; reserve power loss does not imply an automatic outage. Five comparison matchups explain design differences. Qualitative fit controls, six-chapter tours, self-checks and L1–L12 NPI fixtures are available.

The original 4D lab remains accessible, preserving its 80 concept types/3,266 records, original IDs, 36 incidents, deterministic simulation, diagnostics, independent row propagation and GLB binding/import. A tested catalogue roundtrip preserves imported geometry and picking. The local model validator and imported renderer are now shared with catalogue-specific component mappings, including transformed ownership and original-profile roundtrip.

## Validation and acceptance

The L1–L12 restoration makes all twelve stages visible on every hardware pane and provides a direct entry on each card, replacing the hidden/shared NPI preview. It adds per-family and per-generation saved progress, original owners/phases/three-check gates, evidence notes/export, active-incident blocking, explicit incident clearing and downstream invalidation. A real owned DGX AC distribution assembly fills the missing L2 hardware preview. [Restoration details](CATALOGUE_L1_L12.md).

Initial publication passed 39 unit tests and nine browser workflows. The L1–L12 restoration expands validation to 45 passing unit tests and twelve validated browser workflows, including all ten stage entry points, all 118 applicable signoffs, persistence and generation isolation. Exact run/rerun details and resolved findings are in evidence/catalogue-v2/lifecycle/test-results.json. Existing coverage includes all ten real front/rear picks, deep geometry, offline network blocking, synchronized orbit/overlays, replay/rewind, all twenty scenarios and legacy import/diagnostic functionality. Capture scripts provide reproducible baseline, hero, complete-family and final-refresh evidence under `evidence/catalogue-v2`.

Actual native Chrome captures include ten full screenshot sets, fault states, defining components, illustrative row context, five A/B pairs, Rubin's generation delta and a 3840×2160 export. [Performance](PERFORMANCE.md) reports native per-family FPS/calls/triangles and explicitly limits the memory/disposal evidence. Regression SwiftShader FPS is not used as a native benchmark.

The user's direct review response reports **≥90/100 for all ten base families**; it is recorded as a lower bound with the original wording in `evidence/catalogue-v2/human-review.json`. Rubin remains unscored. [Acceptance](CATALOGUE_ACCEPTANCE.md) keeps unavailable CAD/hidden dimensions, unmodelled roadmap variants, calibrated physical dynamics, long endurance/GPU-byte profiling and full assistive-device QA explicit. There is no claim of vendor certification, live facility telemetry or deployed equipment inventories.


## 4D workbench convergence

[Complete implementation changes and current acceptance](CATALOGUE_4D_CONVERGENCE.md). All ten entries now use the original workbench layout and shared intelligence/timeline/import components. New checks exercise arbitrary-carrier inspection, semantic layers, per-family evidence/recovery/release, model mappings and synchronized build-time comparison. Earlier test totals above describe the preceding lifecycle release.
