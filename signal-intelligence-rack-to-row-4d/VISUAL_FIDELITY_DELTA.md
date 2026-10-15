# Visual fidelity delta — v2

This revision replaces the physical scene geometry while retaining the simulation, component records, diagnostics and local model adapter. Geometry is original procedural engineering illustration, not dimensionally authoritative NVIDIA CAD. The requested quality target still requires human review; the remaining gaps below are explicit.

## Before and after

P0 captured the existing production application at 1920×1080 before implementation. `evidence/v2/baseline-rack.png`, `baseline-hbm.png`, `baseline-row.png` and `baseline-state.json` preserve the comparison settings. Original v1 evidence is preserved unchanged. The old HBM inspection showed a flat teal board without package context.

| Phase | Concrete implementation | Evidence |
|---|---|---|
| P1 | Substrate, interposer, neighboring compute die, eight illustrative sectional memory layers, sparse gold interconnect motifs, mounting hardware, cold plate and fittings. Local close framing and precise merged-triangle ownership. | hbm-closeup, hbm-closeup-alternate, hbm-exploded-cutaway, accelerator-package |
| P2 | Deep sheet-metal tray, lips, rails, extraction handles, bolts, vents, front connectors, PCB/standoffs/traces, VRM, NIC heatsinks, NVMe form factor, host memory and gated fan modules. Cabinet uprights, plinth, hinged door, PSU cartridges and distinct switch faceplates. | compute-tray-isolated, compute-board-inspection, rack-front-hero, rack-front-orthographic, rack-rear-service |
| P3 | Mixed-role row with floor joints/service markings, CDU pump volutes/motors and plate exchanger, supported supply/return headers and branches, overhead busway/drop feeds and network ladder. Graph-derived coolant paths exclude network/storage racks. | row-cold-aisle, row-rear-service, row-cooling-fault-t15, row-cooling-fault-t500, power-network-layer |
| P4 | Inspect/Diagnose/Assembly Timeline presentation, collapsible panels, actual orthographic projection, camera history and reduced motion, physical visibility controls and three graphics presets. Material batching and progressive detail. | interaction-regression.json, native-visual-metrics.json, visual-metrics.json |

All PNG names above are under `evidence/v2/`. P1, P2 and P3 proof captures were generated and inspected before proceeding to the subsequent phase; their capture scripts are retained.

## Reference comparison and provenance

Inspected NVIDIA's [official hardware guide](https://docs.nvidia.com/dgx/dgxgb200-user-guide/hardware.html), [compute-tray top photograph](https://docs.nvidia.com/dgx/dgxgb200-user-guide/_images/hardware-compute-tray-top.png), front photograph, rear rack photograph and [SuperPOD component reference](https://docs.nvidia.com/dgx-superpod/reference-architecture-scalable-infrastructure-gb200/latest/dgx-superpod-components.html). The official tray shows four GPUs/two Grace CPUs, sheet metal, service handles, manifolds, fans and network modules. These relationships now guide the NVIDIA procedural tray rather than a bare PCB. Rack classes have separate front designs; rear manifolds, supported busbars and cartridge motifs provide service context. Ironwood retains separate TPU/ICI/OCS topology.

The supplied REA findings informed layered inspection and hierarchy only; they are not vendor mechanical evidence. No vendor photographs, meshes, remote textures or new dependencies are bundled. RoomEnvironment is generated locally from existing Three.js code. The exact chip stack count/layout, dimensions, RU spacing and cable routing remain explicitly illustrative. The visible stack layers are a labeled conceptual section, not an assertion about actual B200 die construction.

## Architecture and performance

`src/scene/hardware/` separates accelerator/package, compute board/tray, power/network, cabinet, rack, coolant loop and row assemblies. `assembly.ts` merges geometry by shared material and maintains per-triangle owner ranges for stable picking. `sceneRegistry.ts` exposes bounds and ownership for repeatable camera/picking checks. Camera motion uses elapsed time and stores previous inspection poses. Performance uses Lambert materials and lower DPR; Balanced/Detail use shared PBR materials and a local PMREM studio environment. Unfocused row racks omit internal board/package detail; focused inspection generates it lazily. This is scope-based LOD, not a full distance-adaptive mesh system.

Recorded machine: Windows laptop, Intel Core i7-11800H, Intel UHD plus NVIDIA RTX 3050 Ti adapters. Chrome ANGLE D3D11 actually selected Intel UHD. At 1920×1080, default rack Balanced/DPR 1.25 measured 50 FPS (steady samples 50–52), 22 draw calls, 55,664 triangles, 34 geometries, 14 materials and four textures. This meets the default-view 45–60 FPS target on this measured adapter, not a guarantee for all devices. Full per-scope distributions and settings are in the native metrics file. Forced SwiftShader PBR capture measured roughly 1–3 FPS; software results are retained separately and must not be confused with GPU results. Geometry/material/texture counts are available; GPU-byte memory and long-duration leak profiling are not established.

Final native capture (five one-second samples per scope, 1920×1080, Intel UHD ANGLE D3D11):

| Scope | FPS min / median / max | Draw calls | Triangles | DPR |
|---|---|---:|---:|---:|
| Rack Balanced | 60 / 64 / 67 | 22 | 55,664 | 1.25 |
| HBM Balanced | 40 / 41 / 43 | 9 | 14,678 | 1.25 |
| Row Balanced | 48 / 50 / 52 | 104 | 305,362 | 1.25 |
| Row Performance | 30 / 72 / 72 | 104 | 294,562 | 1 |

Zero browser exceptions and zero external runtime requests were recorded during the full native capture. These short measurements include a transition sample in Performance mode and are not a long-duration stress test. `visual-metrics.json` preserves the earlier software/PBR run; `native-visual-metrics.json` is the final preset implementation and screenshot manifest. The final screenshots were refreshed on the native adapter after regression tests.

## Validation

23 unit tests cover original simulation/inventory and five geometry/ownership/layout/history regressions. Four browser workflows cover investigation and gates, import/replay/tour, denied-remote offline startup, and real rack → tray → board → accelerator → HBM raycast navigation with precise IDs, Back pose, resize and reduced motion. Exact NVIDIA 18-tray/4-GPU/2-CPU/9-switch/8-shelf/6-PSU quantities, 80 types, 3,266 concept records and 36 incidents remain unchanged. Test results are recorded separately rather than inferred from screenshots.

The screenshot manifest records profile, level, selection, view, camera, quality and time. `t15` means 15 seconds; an additional `t500` image shows later thermal impact within the unchanged 600-second simulation horizon. Remote requests and browser exceptions are recorded. Import remains local and binds a better licensed model to stable authored IDs without replacing diagnostics.

## Visual rubric and remaining gaps

These are developer estimates, not independent visual acceptance. A reviewer should compare the PNGs against the source photographs.

| Category | Estimate / 5 | Qualification |
|---|---:|---|
| Rack silhouette and service geometry | 4 | Cabinet, rails, faceplates, rear utilities; illustrative dimensions |
| Tray/PCB mechanical detail | 4 | Real structural/detail geometry; exact ducts/connector BOM not reconstructed |
| Accelerator/HBM packaged context | 4 | Layered section, interposer and adjacent die; conceptual section rather than literal exposed silicon |
| Connected row and service context | 4 | Continuous headers, CDU, busway and distinct roles; conceptual room placement |
| Materials and lighting | 4 | Shared PBR, bevels and studio environment; no screen-space AO/contact-shadow solver |
| Camera and presentation | 4 | Local framing, actual orthographic and saved Back pose; no free walk |
| Performance and maintainability | 4 | Measured native default target, batched modular assets; no byte-level leak audit |
| Picking, diagnostics and replay | 5 | Stable owner triangle picks and regression coverage; broader device/a11y audit remains |

Unfinished specification details: hover uses precise owned bounds plus a tooltip rather than a true silhouette postprocess; IDs control shows contextual labels rather than every full stable ID in 3D. Cutaway and focus are actions rather than dedicated named camera presets. Door/service tray motion is authored, not collision-solved; side-panel service animation is not complete. LOD is inspection/scope-based rather than distance-adaptive. Some secondary instrumentation types use a representative PCB enclosure rather than unique authoritative device geometry. Full screen-reader/touch/drag audit, WebGL-context-loss exercise, process/GPU-byte memory and long-duration profiling remain unverified. No new claim of fully verified vendor CAD, perfect photorealism, or all-green original acceptance is made.
