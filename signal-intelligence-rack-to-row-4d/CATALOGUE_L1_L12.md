# L1–L12 restored throughout the catalogue

The first catalogue release hid assembly levels inside an NPI tab, shared one preview level between all architectures and kept gate acknowledgements only in component memory. That made the original L1–L12 workflow difficult to find and incomplete in the catalogue.

Every catalogue card now has an explicit **L1–L12 integration** entry. Every hardware pane has a permanently visible **L1–L12 integration** strip with twelve individually named level buttons and a **Gate evidence** action. The engineering panel has a clearly named **L1–L12** tab. These controls remain available in single-family and A/B views, including the Rubin generation.

Choose a level to preview the rack assembly at that stage. Enclosure hardware is present at L1, power at L2, and trays/blades/backpacks at L3; later owned components appear according to their existing integration metadata. Stage previews open the enclosure cutaway below L12; selecting L12 restores the complete enclosure. The full hardware view defaults to L12; a new card's integration workflow starts at L1. Exploring a preview does not grant acceptance. Deep component views continue to show their reference assembly rather than pretending to be a physical build instruction.

The evidence panel restores the original twelve stage names, responsible discipline, NPI phase and three simulated checks per stage, with architecture-specific power, cooling, fabric and logical/physical scope context. Signoff requires three passes, an evidence/reviewer note, the previous applicable gate and no active synthetic incident. A failing fixture can be rehearsed explicitly. Changing earlier evidence or rerunning its checks invalidates downstream signatures and cached test results.

After a failure rehearsal, use **Investigate → Clear family incident**, then rerun failed checks before signing. This resets only the selected family's synthetic initiating condition. DGX B200 now has an independently owned illustrative rack AC distribution assembly so its L2 power preview contains actual selectable hardware.

Air-cooled Enterprise EIA and DGX B200 keep L4 visible as **N/A** for liquid dry integration; L5 depends on their last applicable gate, L3. Airflow qualification remains at L10. ORv3's optional-liquid L4 is labelled as a configuration study while its baseline stays air-cooled. Every other stage remains visible for every family.

Each architecture and modelled generation keeps its own preview level, check results, notes and signatures. Distinct A/B architectures/generations have independent levels; comparing an identical definition twice shares that definition's saved state. Progress survives switching families, returning to the original lab and refreshing the browser through local browser storage; no records are uploaded. If browser storage is unavailable, the workflow still functions for the current session. **Export L1–L12 evidence** downloads the current family's stage definitions and records as JSON.

These are educational synthetic fixtures, not measured physical qualification, program-specific vendor instructions or real engineering approvals. Original diagnostic, simulation, source, offline and model-import functionality remains intact.

Validation and screenshots are recorded under `evidence/catalogue-v2/lifecycle/`. The unit suite checks every family's twelve definitions, sequential prerequisites, explicit N/A handling, fault blocking, generation isolation, storage parsing and actual staged geometry ownership. Browser coverage checks all ten card entry points, all 120 stage previews, all 118 applicable signoffs, persistence, A/B/Rubin isolation, failed fixtures, downstream invalidation and evidence export, alongside the original workflows.

[Actual public A/B stage screenshot](evidence/catalogue-v2/public-lifecycle.png) · [Ten-family stage results](evidence/catalogue-v2/lifecycle/family-stages.json) · [118 gate signoffs](evidence/catalogue-v2/lifecycle/gate-signoffs.json) · [Tests and resolved findings](evidence/catalogue-v2/lifecycle/test-results.json)
