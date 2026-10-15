# Rack Catalogue 2.0 — measured visual performance

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
