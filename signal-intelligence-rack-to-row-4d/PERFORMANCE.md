# 4D workbench — current measured visual performance

Final convergence build, captured 2026-10-16T01:29:36.104Z. Installed Chrome, ANGLE D3D11, Intel UHD Graphics (0x00009A60); 1920×1080 browser viewport, Balanced, DPR 1.25. All ten single-rack samples used the same three-panel Inspect workbench. After settling, the last four one-second samples each had a median of 72 FPS on this machine; this is a short observation near the refresh cap, not a sustained-performance guarantee.

| Family | Median FPS | Draw calls | Rendered triangles |
|---|---:|---:|---:|
| Enterprise EIA | 72 | 10 | 55,490 |
| OCP ORv3 | 72 | 10 | 21,470 |
| DGX B200 | 72 | 10 | 39,914 |
| GB300 NVL72 | 72 | 12 | 65,518 |
| AMD Helios | 72 | 12 | 56,686 |
| Google Ironwood | 72 | 13 | 59,862 |
| AWS Trainium3 | 72 | 9 | 36,890 |
| Azure Maia | 72 | 12 | 25,442 |
| Cerebras CS-4 | 72 | 9 | 10,838 |
| HPE Cray EX4000 | 72 | 12 | 54,766 |

The single hardware canvas measured about 1329×613 CSS pixels. A/B GB300/Ironwood at t=180s with a shared-manifold fault, runtime chart and two canvases recorded 52 total calls and 125,272 rendered triangles. Last four sample medians: A 72.0 FPS, B 72.0 FPS. Only this comparison state was measured, not every pair/deep view.

[Exact native samples, canvas bounds, generation/ownership and bundle hash](evidence/catalogue-v2/workbench/native-verification.json). All new screenshots are under evidence/catalogue-v2/workbench; no uncaught exceptions or external runtime requests occurred during this capture. Browser regression uses SwiftShader separately.

The main application still has a >500 kB bundle advisory. Long endurance, byte-level GPU memory, touch/mobile GPUs and every two-canvas state remain unqualified. Earlier differing measurements are retained below as history rather than being overwritten or presented as current.

## Earlier catalogue measurements


Measured October 15, 2026, using installed Chrome with ANGLE D3D11 on this Windows computer. The actual WebGL renderer reports **Intel UHD Graphics (0x00009A60), Direct3D11**, rather than an assumed discrete GPU. Native capture uses a 1920×1080 browser viewport, Balanced quality and DPR 1.25. UI screenshots are full-page captures; their height may exceed the viewport. These are short local measurements, not performance guarantees.

Each base-family rack sample contains five one-second FPS readings after a settling interval. Calls and triangles are per canvas. Exact samples, ownership bounds, object counts, camera/view/time settings, capture timestamps and thumbnail hashes are in [visual-metrics.json](evidence/catalogue-v2/visual-metrics.json).

| Base family | Median FPS | Draw calls | Rendered triangles |
|---|---:|---:|---:|
| Enterprise EIA | 48 | 11 | 55,490 |
| OCP ORv3 | 72 | 11 | 21,470 |
| DGX B200 | 38 | 10 | 39,914 |
| GB300 NVL72 | 69 | 13 | 65,518 |
| AMD Helios | 72 | 13 | 56,686 |
| Google Ironwood | 54 | 14 | 59,862 |
| AWS Trainium3 | 72 | 10 | 36,890 |
| Azure Maia | 72 | 13 | 25,442 |
| Cerebras CS-4 | 56 | 10 | 10,838 |
| HPE Cray EX4000 | 67 | 13 | 54,766 |

The table combines dated captures rather than one simultaneous benchmark. DGX reflects the latest public L1–L12 restoration at L12, including its added AC distribution: samples 45, 36, 38, 37 and 45 FPS (median 38), recorded in evidence/catalogue-v2/public-verification.json. An earlier native check of the same local distribution returned five readings of 72 FPS in publication-local-verification.json. The cause of that variation was not measured; neither result is a guaranteed sustained rate. Cray reflects the previous final refresh, and the other eight retain the original full capture samples. Those nine rows are historical measurements, not a complete post-restoration benchmark. The mixed table spans 38–72 FPS. A/B comparison has two independently rendered canvases, so its calls and triangles sum both sides. The earlier GB300/Helios cooling audit used 26 calls and 125,660 triangles total with short median readings of 72 FPS per side under `metrics.comparison`; no all-pair sustained FPS claim is made.

Two complete family-switch cycles recorded equal geometry/texture counts for corresponding families after settling. They demonstrate bounded object counts across that test, not byte-level GPU-memory use or a long-duration leak proof. Batched material geometry limits draw calls; generated environment lighting and model assets stay local. The capture recorded no uncaught page exceptions and no external runtime requests.

Browser interaction regression uses forced SwiftShader at Performance quality and is kept separate from this native GPU benchmark. The 3840×2160 export is a separate render target; it does not permanently increase the interactive canvas DPR. Performance, Balanced and Detail presets remain available.

Remaining checks: long endurance sessions, mobile/touch GPUs, GPU-byte allocation profiling and sustained two-canvas measurements across every deep view/fault/overlay combination. The main Three.js/application bundle still triggers Vite's >500 kB advisory; the catalogue and scene are lazy-loaded, but this is not a claim of fully optimized startup on low-memory devices.
