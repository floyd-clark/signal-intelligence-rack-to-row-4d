# Source and asset provenance

Primary reference metadata, scope and checked date are maintained in src/catalogue/sources/register.ts; numeric claims in src/catalogue/registry.ts and the explicit Rubin variant in variants.ts. All references were checked October 15, 2026. Their contents support architecture facts, not the application's exact hidden mechanical layout. Source links and metadata remain readable offline; websites open only on deliberate clicks.

Every shipped family asset is original procedural geometry built with existing Three.js and the local Assembly batch builder. Author: Signal Intelligence project contributors / Codex-assisted implementation. No vendor photographs, proprietary meshes, unknown-license CAD, logos or third-party textures were downloaded or redistributed. References are linked only. The approved user-provided Signal Intelligence brand image remains the only supplied raster artwork. Three.js and existing dependency attributions remain in LICENSE_ATTRIBUTIONS.md. The rendered gallery previews are actual local Chromium output of these original models.

Modification history: baseline 266055b; new feature branch codex/rack-catalogue-2. Shared v2 materials/geometry primitives are retained. The catalogue adds builders for ten families plus a Rubin child delta. The original 80 types, 3266 concept records and all original stable IDs are unchanged. CAT-xx IDs are additive. Decorative bolts, ports and PSUs map many meshes to their assembly's stable ID; representative HBM stacks map to one authored memory record per package. Two Rubin carrier boards map to the existing catalogue board record with a documented one-to-many relationship. This does not assert exact HBM die/stack inventory.

## Truth boundaries

| Family | Supported facts | Explicitly inferred / deferred |
|---|---|---|
| Enterprise EIA | Example 42U 19-inch compatible enclosure | Server population, CPU/drive layout and power are demonstration fixtures |
| ORv3 | Sanmina OU mounting, 48 V busbar and product dimensions | Tray population and shared power arrangement; product ratings not a universal ORv3 rating; air baseline with optional liquid visual study |
| DGX B200 | Eight GPUs/two NVSwitch per system | Four-node rack population and internal placement; HGX ODMs need separate BOM |
| GB300 | Enterprise RA tray/GPU/CPU/switch/PSU quantities | Mechanical spacing, internal package section and rear cable routes |
| Helios | ORW double width, 72 MI455X/four per tray, four UALink cartridges, Venice/Vulcano | Auxiliary power counts, voltage and exact carrier/wire placement |
| Ironwood | Four TPUs/host, 64/cube, dual chiplet, ICI/OCS separation | Rack dimensions, auxiliary shelves, internal memory placement; sampled physical harness differs from schematic torus |
| Trainium3 | Up to 144 chips/logical UltraServer, NeuronSwitch-v1 | Physical cabinet count is unknown; three-cabinet grouping and 48 visible host devices are illustrative samples |
| Maia | 200 production and closed-loop heat-exchanger unit; 300 planned 2027 | 200 rack BOM/interior; 300 physical model not supplied |
| Cerebras | Three WSE-3 Turbo modules/system, Nexus compute/power/I/O | Backpack/cabinet dimensions, cassette placement and external memory details |
| HPE Cray | Sealed EX4000, eight chassis/up to 64 blades, no cabinet fans, CDU cooling | Specific populated blade SKU, switch population and exact CDU geometry |
| Rubin child | Hardware manual: 18 trays, four GPUs/two Vera per tray, nine NVLink6 trays, four six-PSU shelves, 54 V busbar | Dimensions/placement of original model; deployment and exact package internals not inferred |

Unknown dimensions are NULL. Only the cited EIA example and Sanmina enclosure expose physical dimension metadata for scaled comparison. Other families use matched normalized height, not a dimensional fit claim. No FLOPs, price or energy leaderboard is generated. Software/precision, utilization and physical/logical scope must align before quantitative performance comparison.

## Simulation and equations

All diagnostic scenarios are educational, source-informed hypotheses with synthetic telemetry, not measured failure prevalence or vendor-qualified procedures. Water Cp=4180 J/(kg·K) and approximately 1 kg/L convert Q=ṁ Cp ΔT correctly. Liquid demo flow starts at 240 L/min; a local branch receives its share of total load/flow. EIA 18 kW, ORv3 12 kW, four-DGX rack 48 kW and other 96 kW nominal loads are illustrative, not vendor ratings. Optional-liquid ORv3 uses an air baseline until a separately qualified loop is configured; its liquid overlay is an illustrative study. DC current and three-phase current examples state their units and power factor. No system is approved for design or service by these fixtures.

Physical service edges are separate from NVLink/UALink/ICI/OCS/Neuron/Ethernet/wafer/Slingshot communication edges. Common-loop fixtures include cooled compute/switch dependents; local QD and wafer faults stay local. Software-only memory pressure never paints fictitious physical failure. Real containment belongs to qualified owners; the app controls no hardware.

Catalogue Row is a contextual view of a central reference unit with decorative neighboring copies; those copies do not acquire fabricated component IDs or join its fault domain. The original 4D lab retains independently identified row racks and shared propagation. Detailed source-qualified multi-unit catalogue facility simulation remains a future scope.
