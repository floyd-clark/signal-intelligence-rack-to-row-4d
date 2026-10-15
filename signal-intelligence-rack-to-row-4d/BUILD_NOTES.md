# Build notes

Initial workspace contained only .git; no existing application or assets were overwritten. Node 24.16.0/npm 11.13.0 were available. The supplied directive and later REA findings report were read. Dependencies were installed once; package-lock.json pins the resolved tree.

Implementation: React 19, TypeScript, Vite, Three.js/R3F/Drei, Zustand and Zod. Original procedural geometry; no CDN/runtime APIs. Production dist uses local chunks and lazy scene loading. Root stylesheet is authored locally, with system fonts.

Defects found and fixed during QA: duplicate concept switch IDs; Drei DOM-label teardown errors (replaced by WebGL sprite labels); Windows file-watcher EBUSY on downloaded test evidence (ignored generated outputs; production-based E2E); nonzero-time incident alert chronology; incomplete camera look-at interpolation; missing Node type declarations; non-discriminating context tests incorrectly counting as RCA evidence; profile gate state carryover.

Run npm test, npm run build, npm run test:e2e. Browser tests use installed Chromium with SwiftShader software rendering for repeatability. Performance evidence therefore is not an integrated-GPU hardware guarantee. The production server uses loopback, path containment and a local CSP. Source links open only on explicit navigation. Vite emits a nonfatal bundle-size warning; no build errors are ignored.

Remaining scope gaps are enumerated per acceptance criterion in ACCEPTANCE_MATRIX.md. In particular the model is schematic, one root fault is simulated at a time, import binding lacks drag/drop grouping, and the build/program timeline is a simple stage/BOM sequence rather than a full procurement scheduler. No actual rack model was supplied, so CAD fidelity cannot be validated.
