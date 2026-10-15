# Visual refinement brief for reviewing agents

## User objective

The application works, but the procedural rack is still too dominated by blocks and cubes. Make components recognizable as their real-world counterparts while retaining every diagnostic interaction. Prioritize engineering legibility and physical plausibility over cinematic effects. Feedback should identify actual source changes, not only recommend a new renderer or demand a licensed CAD model.

## Start here

Read README.md, ACCEPTANCE_MATRIX.md and ASSUMPTIONS_AND_PROVENANCE.md. Run the app and inspect evidence/01-rack.png, 02-component.png, 03-row.png and 10-ironwood-topology.png. Main implementation files:

- src/scene/Scene.tsx — rack/tray/component renderers, instanced face details, overlays, cameras, labels and imported geometry.
- src/data/model.ts — stable IDs, parent hierarchy, positions and sizes; authored cards stay independent of visual meshes.
- src/data/profiles/*.json — three separate inventories and provenance badges.
- src/graphs/dependencies.ts — actual service propagation graph and separated ICI/NVLink/C2C topology.
- src/import/adapter.ts — safe local model and versioned mesh-binding pipeline.
- src/styles/main.css — layout, information hierarchy, contrast and controls.

## High-value visual improvements

1. Compute trays: sheet-metal chassis lips, handles, retention latches, distinct perforated front faces, service labels, consistent front/rear orientation, credible ports and recesses. Keep face details instanced or merged where practical and owned by the tray record.
2. Board view: green/blue PCB substrate, mounting holes, traces as bounded decals/lines, processor sockets/packages, correctly differentiated host memory and HBM, VRM clusters, PCIe/connector edge shapes, NVMe form factors, heatsinks and fan shrouds. Avoid portraying functional chip blocks as externally visible package internals.
3. Accelerator/HBM: package/interposer outline, die and stack arrangement clearly marked schematic, mounting/fastener features, cold plate metal finish, inlet/outlet fittings and hoses. Four depicted HBM stacks are illustrative, not a vendor count claim.
4. Liquid path: cylindrical manifolds with fittings and per-tray branch hoses, supply/return separation, quick-disconnect collars, service-loop bends, pump/heat exchanger/CDU enclosure distinction. The current shared equipment is mostly isolated primitives; make the functional path visible without thousands of full-detail tubes.
5. Power: visually distinct shelf cages and PSU modules, fan grilles, input/output connectors, copper busbar and insulated supports. Preserve source boundaries and do not universalize ORv3 details.
6. Network: credible optical cages, fibers/DACs, management RJ45 versus compute/storage links, cable guides and leaf/spine service equipment. NVIDIA NVLink/C2C must never appear as TPU ICI/OCS hardware.
7. Row: more convincing floor/aisle containment, network/storage role differentiation, overhead routing and shared service paths, suitable scale cues and unobstructed inspection cameras.
8. Materials/light: restrained graphite sheet metal, copper, aluminum, PCB and polymer material differences; local environment lighting or authored procedural highlights, bevels where silhouette warrants them. No runtime CDN or texture dependencies. Avoid an expensive global effects stack.

## Constraints to preserve

- Unique stable per-component IDs and meaningful cards; decorative submeshes must resolve to the owning record. Keep raycast click/drill/back and camera restoration working.
- Local/offline operation, no APIs/keys/uploads, loopback-only serving and source/illustrative labels.
- At least 50 meaningful types/100 selectable nodes; currently 80 types/3,266 concept records across lazy hierarchy scopes, not simultaneous meshes.
- L1–L12 reveal/integration gates, deterministic replay, shared cooling domain and local ECC isolation.
- Keep vendor architectures distinct, and maintain exact major reference counts. Treat undocumented mechanical geometry as an illustrative approximation.
- Preserve the ability to replace procedural geometry through the existing GLB/glTF adapter. Do not hide engineering facts in mesh names.
- Measure FPS, draw calls, triangles and geometry/texture counts. Existing default-rack software-rendering sample is in evidence/performance-baseline.json; it is not a hardware guarantee.
- Do not copy proprietary CAD, the investigated NVL72.dev shipped JavaScript or unlicensed vendor artwork. The user-supplied REA report suggested interaction patterns; implementation here is original.

## Requested review output

Provide (a) the five most important visual problems, referencing screenshot/source locations; (b) concrete procedural geometry or material fixes; (c) a bounded first implementation slice; (d) performance/picking risks; and (e) tests/screenshots needed to demonstrate improvement. If proposing code, modify the existing scene architecture and retain component data and telemetry. Distinguish sourced mechanical facts from visual approximation.

## Known implementation gaps

Read the acceptance matrix rather than assuming every original directive item is complete. Geometry is schematic, some auxiliary inventories are illustrative, build scheduling is simplified, one root fault is active at a time, imported mapping lacks drag/drop groups and full coverage gating, and accessibility/device QA is partial. Visual review should improve the actual current app without concealing these gaps.

## V2 review handoff

Rack Catalogue 2.0 supersedes the three-profile visual review scope below: start with CATALOGUE_INDEX.md, CATALOGUE_ACCEPTANCE.md and CATALOGUE_PROVENANCE.md. The user reported ≥90/100 for all ten base families on October 15, 2026. This is a lower-bound human review; Rubin, exact hidden mechanics and the documented engineering qualification gaps are not covered by that score.

Review evidence/v2/hbm-closeup.png, compute-tray-isolated.png, compute-board-inspection.png, rack-front-hero.png, rack-rear-service.png and row-cold-aisle.png against the preserved baseline and NVIDIA official hardware photographs. The flat HBM slab, bare tray, uniform rack fronts and disconnected row utilities have been replaced with original detailed procedural assemblies. Stable-ID diagnostics, simulation and local GLB binding remain. Please prioritize proportion/packaging, tray mechanical credibility, rear utility continuity and material readability. Distinguish verified vendor counts from illustrative mechanical dimensions and conceptual exposed chip layers. VISUAL_FIDELITY_DELTA.md lists explicit gaps, rubric estimates and measured performance. Do not assume the developer rubric is independent visual approval. This revision is committed locally; publication is not part of the v2 directive.
