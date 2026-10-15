import type { Architecture, Concept, FamilyId, Part } from "./types";
import { sourceById } from "./sources/register";
import levels from "../data/levels.json";
type Definition = Pick<
  Architecture,
  | "architectureId"
  | "familyName"
  | "generation"
  | "shape"
  | "width"
  | "depth"
  | "cooling"
  | "power"
  | "fabric"
  | "scaleOut"
  | "software"
  | "differentiator"
  | "why"
  | "tradeoffs"
  | "layout"
  | "sourceRefs"
  | "releaseStatus"
  | "unitOfComparison"
>;
const defs: Definition[] = [
  {
    architectureId: "CAT-01",
    familyName: "Enterprise EIA",
    generation: "19-inch AC / air",
    shape: "eia",
    width: 1.35,
    depth: 2.15,
    cooling: "air",
    power: "Dual AC PDUs → redundant chassis PSUs",
    fabric: "Node-local PCIe",
    scaleOut: "TOR Ethernet; separate BMC",
    software: "General enterprise OS / hypervisor",
    differentiator: "Individual AC-powered servers and front-to-rear air",
    why: "Cross-vendor mounting and independent field replacement suit diverse, lower-density services.",
    tradeoffs: [
      "Flexible chassis replacement",
      "Airflow and blanking discipline constrain density",
    ],
    layout: {
      trays: 12,
      chipsPerTray: 2,
      cpusPerTray: 2,
      switches: 1,
      shelves: 0,
      psus: 2,
    },
    sourceRefs: ["eia"],
    releaseStatus: "Established mounting convention",
    unitOfComparison: "Illustrative populated EIA rack",
  },
  {
    architectureId: "CAT-02",
    familyName: "OCP Open Rack V3",
    generation: "21-inch OU / 48V",
    shape: "orv3",
    width: 1.52,
    depth: 2.25,
    cooling: "optional liquid",
    power: "AC rectifiers → 48V vertical DC busbar",
    fabric: "Tray PCIe; modular fabric",
    scaleOut: "Ethernet",
    software: "Open infrastructure software",
    differentiator: "Wide OU trays blind-mate to a shared DC spine",
    why: "Shared power conversion removes individual power cords and makes tray insertion repeatable.",
    tradeoffs: [
      "Shared rectifier service",
      "Blind-mate contact integrity and DC current matter",
    ],
    layout: {
      trays: 10,
      chipsPerTray: 2,
      cpusPerTray: 1,
      switches: 1,
      shelves: 2,
      psus: 6,
    },
    sourceRefs: ["ocp"],
    releaseStatus: "Published open standard / product",
    unitOfComparison: "Illustrative ORv3 equipment rack",
  },
  {
    architectureId: "CAT-03",
    familyName: "NVIDIA DGX B200",
    generation: "Blackwell / node",
    shape: "dgx",
    width: 1.45,
    depth: 2.6,
    cooling: "air",
    power: "Redundant AC PSUs per DGX system",
    fabric: "NVLink / two NVSwitch per 8-GPU node",
    scaleOut: "Ethernet / InfiniBand",
    software: "CUDA / NVIDIA AI software",
    differentiator: "Large eight-GPU systems; scale-up stops at each node",
    why: "An integrated eight-GPU appliance supports node-local model parallelism before scale-out networking.",
    tradeoffs: [
      "Independent server maintenance",
      "Cross-node collectives cross the NIC boundary",
    ],
    layout: {
      trays: 4,
      chipsPerTray: 8,
      cpusPerTray: 2,
      switches: 1,
      shelves: 0,
      psus: 6,
    },
    sourceRefs: ["b200"],
    releaseStatus: "Published product",
    unitOfComparison: "Four demonstrative DGX systems in a rack",
  },
  {
    architectureId: "CAT-04",
    familyName: "NVIDIA GB300 NVL72",
    generation: "Blackwell Ultra / Grace",
    shape: "nvl72",
    width: 1.48,
    depth: 2.4,
    cooling: "liquid",
    power: "Eight DC shelves; six 5.5 kW PSUs each (Enterprise RA)",
    fabric: "Rack-wide fifth-generation NVLink / nine NVSwitch trays",
    scaleOut: "ConnectX-8 Ethernet / InfiniBand; separate OOB",
    software: "CUDA / NVOS",
    differentiator: "18 compute trays surround nine scale-up switch trays",
    why: "A single 72-GPU scale-up domain supports tightly coupled model parallel workloads.",
    tradeoffs: [
      "Large coherent scale-up domain",
      "Shared cooling and switch service affect a broader boundary",
    ],
    layout: {
      trays: 18,
      chipsPerTray: 4,
      cpusPerTray: 2,
      switches: 9,
      shelves: 8,
      psus: 6,
    },
    sourceRefs: ["gb300"],
    releaseStatus: "Published Enterprise reference architecture",
    unitOfComparison: "One 72-GPU physical reference rack",
  },
  {
    architectureId: "CAT-05",
    familyName: "AMD Helios",
    generation: "MI455X / Venice / Vulcano",
    shape: "helios",
    width: 2.65,
    depth: 2.3,
    cooling: "liquid",
    power: "Shared power shelves → vertical DC busbar; voltage not asserted",
    fabric: "Four UALink scale-up cartridges / UALoE",
    scaleOut: "Ultra Ethernet / Pensando",
    software: "ROCm",
    differentiator: "Double-wide ORW sleds and four scale-up cartridges",
    why: "Open rack-wide service interfaces and an alternate scale-up ecosystem emphasize modular integration.",
    tradeoffs: [
      "Open fabric and software ecosystem choice",
      "ORW is not the earlier single-wide ORv3 form factor",
    ],
    layout: {
      trays: 18,
      chipsPerTray: 4,
      cpusPerTray: 1,
      switches: 4,
      shelves: 4,
      psus: 6,
    },
    sourceRefs: ["helios"],
    releaseStatus: "Vendor reference / projected metrics qualified",
    unitOfComparison: "One 72-GPU ORW reference rack",
  },
  {
    architectureId: "CAT-06",
    familyName: "Google Ironwood",
    generation: "TPU7x / dual chiplet",
    shape: "ironwood",
    width: 1.68,
    depth: 2.3,
    cooling: "liquid",
    power: "Illustrative shared power; exact shelf BOM undisclosed",
    fabric: "64-chip ICI 3D torus / six neighbors",
    scaleOut: "OCS between cubes; independent DCN",
    software: "XLA / JAX / PyTorch",
    differentiator:
      "Four-TPU carriers with dense ICI harness and separate optics",
    why: "ASIC, compiler and topology co-design links four-chip hosts into a 64-chip cube.",
    tradeoffs: [
      "Explicit topology and compiler layout control",
      "OCS reconfiguration is a cross-cube service, not a local ICI wire",
    ],
    layout: {
      trays: 16,
      chipsPerTray: 4,
      cpusPerTray: 1,
      switches: 0,
      shelves: 4,
      psus: 6,
    },
    sourceRefs: ["ironwood", "tpu7x"],
    releaseStatus: "Published TPU7x platform",
    unitOfComparison: "One 64-chip cube plus separate illustrative OCS",
  },
  {
    architectureId: "CAT-07",
    familyName: "AWS Trainium3",
    generation: "Trn3 / NeuronSwitch-v1",
    shape: "trainium",
    width: 4.4,
    depth: 2.3,
    cooling: "liquid",
    power: "Illustrative cabinet feeds; physical rack count undisclosed",
    fabric: "NeuronLink / NeuronSwitch-v1 logical UltraServer",
    scaleOut: "UltraClusters 3.0 networking",
    software: "AWS Neuron",
    differentiator:
      "Logical multi-cabinet UltraServer with an explicit grouping bridge",
    why: "A logical integrated accelerator domain separates the workload unit from physical cabinet assumptions.",
    tradeoffs: [
      "Large Neuron software/hardware domain",
      "144 chips cannot be inferred to occupy one cabinet",
    ],
    layout: {
      trays: 12,
      chipsPerTray: 4,
      cpusPerTray: 1,
      switches: 3,
      shelves: 3,
      psus: 4,
    },
    sourceRefs: ["trn3"],
    releaseStatus: "AWS general availability announcement",
    unitOfComparison: "Logical UltraServer; three illustrative cabinets",
  },
  {
    architectureId: "CAT-08",
    familyName: "Azure Maia",
    generation: "Maia 200",
    shape: "maia",
    width: 2.45,
    depth: 2.3,
    cooling: "liquid",
    power: "Illustrative shelves; production rack BOM undisclosed",
    fabric: "Maia backend Ethernet fabric",
    scaleOut: "Azure network / control plane",
    software: "Maia SDK / Triton / PyTorch",
    differentiator:
      "Compute tower with a separate closed-loop heat-exchanger unit",
    why: "An inference-oriented memory/compute system co-designs cooling and cloud diagnostics.",
    tradeoffs: [
      "Integrated inference and management stack",
      "Exact production rack interior is not publicly established here",
    ],
    layout: {
      trays: 8,
      chipsPerTray: 4,
      cpusPerTray: 1,
      switches: 2,
      shelves: 3,
      psus: 4,
    },
    sourceRefs: ["maia", "maia300"],
    releaseStatus: "Maia 200 production; 300 roadmap 2027",
    unitOfComparison: "Illustrative Maia 200 rack / HXU service unit",
  },
  {
    architectureId: "CAT-09",
    familyName: "Cerebras CS-4",
    generation: "WSE-3 Turbo / Nexus",
    shape: "cerebras",
    width: 2.1,
    depth: 2.65,
    cooling: "liquid",
    power: "Nexus modular power conversion close to wafer",
    fabric: "On-wafer fabric / wafer I/O modules",
    scaleOut: "Nexus wafer I/O; disaggregated system",
    software: "Cerebras software stack",
    differentiator: "Three tall wafer-scale backpacks, not GPU server boards",
    why: "Wafer-scale compute changes the packaging and I/O boundary instead of multiplying small chips.",
    tradeoffs: [
      "Dense on-wafer communication",
      "Expansion and memory stream boundaries differ from GPU fabrics",
    ],
    layout: {
      trays: 3,
      chipsPerTray: 1,
      cpusPerTray: 0,
      switches: 1,
      shelves: 3,
      psus: 4,
    },
    sourceRefs: ["cs4"],
    releaseStatus:
      "Vendor advertised; shipment timing not independently confirmed",
    unitOfComparison: "One three-wafer CS-4 system",
  },
  {
    architectureId: "CAT-10",
    familyName: "HPE Cray EX4000",
    generation: "EX4000 / Slingshot",
    shape: "cray",
    width: 2.7,
    depth: 2.65,
    cooling: "liquid",
    power: "Four power shelves / redundant rectifiers",
    fabric: "Slingshot switch blades",
    scaleOut: "Slingshot HPC fabric",
    software: "HPE Cray programming environment / MPI",
    differentiator: "Sealed fanless cabinet, vertical blades and adjacent CDU",
    why: "Liquid cooling removes heat from processors and switches without exhausting cabinet air into the room.",
    tradeoffs: [
      "Closed-loop blade service boundaries",
      "CDU capacity and common-loop commissioning govern readiness",
    ],
    layout: {
      trays: 64,
      chipsPerTray: 2,
      cpusPerTray: 2,
      switches: 8,
      shelves: 4,
      psus: 8,
    },
    sourceRefs: ["cray"],
    releaseStatus: "Published QuickSpecs; configuration dependent",
    unitOfComparison: "One illustrative fully populated EX4000 cabinet",
  },
];
const claim = (
  source: string,
  name: string,
  value: number,
  unit: string,
  scope: string,
  qualifier = "Vendor reference; not an operator deployment",
) => ({
  source,
  name,
  value,
  unit,
  scope,
  qualifier,
  checkedDate: "2026-10-15",
});
const claims: Record<string, Architecture["claims"]> = {
  "CAT-01": [
    claim(
      "eia",
      "Example enclosure",
      42,
      "RU",
      "AR3100 example; not universal rack population",
    ),
  ],
  "CAT-02": [
    claim("ocp", "Nominal DC bus", 48, "V", "Sanmina ORv3 listing"),
    claim("ocp", "Mounting", 21, "inch", "OU hardware"),
  ],
  "CAT-03": [
    claim("b200", "GPUs per system", 8, "GPU", "One DGX B200"),
    claim("b200", "NVSwitch per system", 2, "ASIC", "One DGX B200"),
  ],
  "CAT-04": [
    claim("gb300", "Compute trays", 18, "tray", "GB300 rack"),
    claim("gb300", "GPUs", 72, "GPU", "GB300 rack"),
    claim("gb300", "Grace CPUs", 36, "CPU", "GB300 rack"),
    claim("gb300", "Scale-up trays", 9, "tray", "GB300 rack"),
    claim("gb300", "Power shelves", 8, "shelf", "GB300 Enterprise RA"),
    claim("gb300", "PSUs per shelf", 6, "PSU", "GB300 Enterprise RA"),
    claim(
      "gb300",
      "PSU rating",
      5.5,
      "kW",
      "GB300 Enterprise RA; not inherited from GB200",
    ),
  ],
  "CAT-05": [
    claim("helios", "GPUs", 72, "GPU", "Helios reference"),
    claim("helios", "GPUs per tray", 4, "GPU", "Helios compute tray"),
    claim("helios", "Scale-up cartridges", 4, "cartridge", "Helios reference"),
  ],
  "CAT-06": [
    claim("ironwood", "TPUs per host", 4, "chip", "Ironwood host"),
    claim("ironwood", "TPUs per cube", 64, "chip", "One rack/cube"),
    claim("tpu7x", "Chiplets per chip", 2, "chiplet", "Ironwood package"),
  ],
  "CAT-07": [
    claim(
      "trn3",
      "Maximum chips",
      144,
      "chip",
      "Logical fully configured UltraServer; cabinet count unknown",
      "Up to; does not establish physical rack count",
    ),
  ],
  "CAT-08": [],
  "CAT-09": [
    claim("cs4", "WSE-3 Turbo backpacks", 3, "wafer", "One CS-4 system"),
  ],
  "CAT-10": [
    claim("cray", "Compute chassis", 8, "chassis", "EX4000"),
    claim("cray", "Maximum blades", 64, "blade", "EX4000 configuration limit"),
    claim(
      "cray",
      "Cabinet cooling fans",
      0,
      "fan",
      "Sealed EX4000 cabinet; not an unknown value",
    ),
  ],
};
const roles: Record<
  Concept,
  {
    function: string;
    symptoms: string[];
    tests: string[];
    containment: string;
    owner: string;
  }
> = {
  compute: {
    function:
      "Executes the architecture’s workload within its package and host boundary.",
    symptoms: [
      "Corrected/uncorrected compute errors",
      "Local throttling with healthy shared services",
      "Job partition unavailable",
    ],
    tests: [
      "Correlate accelerator and host error counters",
      "Run isolated known-good workload and compare peers",
    ],
    containment:
      "Drain the affected workload partition before simulated service.",
    owner: "Compute/platform engineering",
  },
  memory: {
    function: "Feeds accelerator compute through local high-bandwidth memory.",
    symptoms: [
      "ECC escalation",
      "Memory pressure or allocation stalls",
      "Bandwidth-sensitive workload slowdown",
    ],
    tests: [
      "Distinguish ECC counters from software allocation pressure",
      "Compare known-good memory test and workload layout",
    ],
    containment:
      "Checkpoint and isolate the affected package; preserve error context.",
    owner: "Silicon/platform engineering",
  },
  power: {
    function:
      "Converts and distributes energy across the documented service boundary.",
    symptoms: [
      "Lost redundancy while workload remains online",
      "Voltage droop and connector temperature rise",
      "Load exceeds surviving reserve",
    ],
    tests: [
      "Verify remaining module capacity and A/B feed independence",
      "Correlate current/voltage and contact temperature",
    ],
    containment: "Reduce synthetic load before redundancy is exhausted.",
    owner: "Electrical/platform engineering",
  },
  cooling: {
    function:
      "Moves heat through air or the liquid loop; physical mechanism is architecture-specific.",
    symptoms: [
      "Flow or pressure change precedes temperature rise",
      "Supply temperature high with normal flow",
      "Local hotspot differs from shared service fault",
    ],
    tests: [
      "Compare inlet/return and flow/pressure trends",
      "Check whether all dependent modules move together",
    ],
    containment:
      "Throttle or drain dependents and stop simulated commissioning.",
    owner: "Thermal/facilities engineering",
  },
  network: {
    function:
      "Connects the defined scale-up or scale-out domain; these fabrics are not interchangeable.",
    symptoms: [
      "Lane/FEC retries before goodput loss",
      "Collective straggler",
      "Route or fabric partition",
    ],
    tests: [
      "Separate intra-domain errors from scale-out NIC telemetry",
      "Run topology-aware peer tests and inspect retry locality",
    ],
    containment:
      "Reroute or drain the affected logical partition; preserve traces.",
    owner: "Fabric/network engineering",
  },
  service: {
    function:
      "Supports mechanical insertion, alignment, grounding and controlled replacement.",
    symptoms: [
      "Latch/interlock mismatch",
      "Connector not fully seated",
      "Service boundary blocked",
    ],
    tests: [
      "Confirm fixture alignment and interlock evidence",
      "Inspect the documented insertion envelope",
    ],
    containment:
      "Stop the educational gate; qualified personnel own real service.",
    owner: "NPI/manufacturing engineering",
  },
};
function parts(d: Definition): Part[] {
  const rs: Part[] = [];
  const add = (
    path: string,
    name: string,
    concept: Concept,
    parent: string | null,
    level: number,
  ) => {
    const id = `${d.architectureId}/${path}`;
    rs.push({
      id,
      name,
      concept,
      parentId: parent,
      level,
      ...roles[concept],
      sourceRefs: d.sourceRefs,
      illustrative: true,
    });
    return id;
  };
  const rack = add("rack", d.familyName, "service", null, 1);
  for (let t = 0; t < d.layout.trays; t++) {
    const tray = add(
      `tray/${t + 1}`,
      `${d.shape === "cerebras" ? "Wafer backpack" : d.shape === "cray" ? "Compute blade" : "Compute tray"} ${t + 1}`,
      "compute",
      rack,
      3,
    );
    const board = add(
      `board/${t + 1}`,
      `Carrier board ${t + 1}`,
      "compute",
      tray,
      5,
    );
    for (let c = 0; c < d.layout.chipsPerTray; c++) {
      const chip = add(
        `chip/${t + 1}.${c + 1}`,
        `${d.generation} ${d.shape === "cerebras" ? "wafer" : d.shape === "ironwood" ? "TPU" : "processor"} ${t + 1}.${c + 1}`,
        "compute",
        board,
        6,
      );
      add(
        `memory/${t + 1}.${c + 1}`,
        d.shape === "cerebras"
          ? "On-wafer SRAM region"
          : ["eia", "orv3"].includes(d.shape)
            ? "Host DRAM"
            : "Representative HBM assembly",
        "memory",
        chip,
        6,
      );
    }
  }
  for (let t = 0; t < d.layout.trays; t++) {
    for (let c = 0; c < d.layout.cpusPerTray; c++)
      add(
        `cpu/${t + 1}.${c + 1}`,
        `${d.shape === "nvl72" ? "Grace" : d.shape === "helios" ? "Venice" : "Host CPU"} ${t + 1}.${c + 1}`,
        "compute",
        `${d.architectureId}/board/${t + 1}`,
        6,
      );
    for (const type of [
      "nic",
      "vrm",
      "nvme",
      "fan",
      "quick-disconnect",
      "bmc",
      "dimm",
    ])
      add(
        `${type}/${t + 1}`,
        `${type} / carrier ${t + 1}`,
        type === "nic" || type === "bmc"
          ? "network"
          : type === "vrm"
            ? "power"
            : type === "fan" || type === "quick-disconnect"
              ? "cooling"
              : type === "dimm"
                ? "memory"
                : "service",
        `${d.architectureId}/board/${t + 1}`,
        type === "fan" ? 10 : type === "quick-disconnect" ? 4 : 7,
      );
    for (let c = 0; c < d.layout.chipsPerTray; c++)
      add(
        `plate/${t + 1}.${c + 1}`,
        `Cold plate ${t + 1}.${c + 1}`,
        "cooling",
        `${d.architectureId}/chip/${t + 1}.${c + 1}`,
        6,
      );
  }
  for (let i = 0; i < d.layout.switches; i++)
    add(
      `fabric/${i + 1}`,
      `${d.fabric.split(" / ")[0]} ${i + 1}`,
      "network",
      rack,
      9,
    );
  for (let i = 0; i < Math.max(1, d.layout.shelves); i++)
    add(
      `power/${i + 1}`,
      d.layout.shelves
        ? `Power shelf ${i + 1}`
        : "AC PDU / redundant node PSUs",
      "power",
      rack,
      2,
    );
  add(
    "cooling",
    d.cooling === "air"
      ? "Fan/airflow service"
      : d.shape === "maia"
        ? "Closed-loop Heat Exchanger Unit"
        : d.shape === "cray"
          ? "CDU and cold-plate circuit"
          : "Supply/return manifolds",
    "cooling",
    rack,
    4,
  );
  if (d.shape === "ironwood") {
    add("fabric/ici", "Rack-local ICI neighbor links", "network", rack, 9);
    add("fabric/ocs", "Cross-cube optical circuit switch", "network", rack, 9);
  }
  add(
    "network",
    d.shape === "ironwood"
      ? "Separate OCS / DCN optical unit"
      : "Scale-out / management interface",
    "network",
    rack,
    9,
  );
  return rs;
}
export const architectures: Architecture[] = defs.map((d) => ({
  ...d,
  type: d.shape,
  alternatives: defs
    .filter((x) => x.architectureId !== d.architectureId)
    .slice(0, 3)
    .map((x) => x.architectureId),
  edition: "Public reference / educational original",
  physicalRackCountKnown: d.shape === "trainium" ? null : 1,
  knownPhysicalDimensions:
    d.shape === "orv3"
      ? { width: 600, height: 2286, depth: 1068, unit: "mm", source: "ocp" }
      : d.shape === "eia"
        ? { width: 600, height: 1991, depth: 1070, unit: "mm", source: "eia" }
        : null,
  components: parts(d),
  claims: claims[d.architectureId],
  mechanicalHierarchy: [
    "rack",
    "tray",
    "board",
    d.shape === "cerebras" ? "wafer" : "chip",
    "memory",
  ],
  ports: [d.scaleOut, d.fabric, "Service interface"],
  cabling: [d.fabric, d.scaleOut],
  powerTree: ["Entrance", d.power, "Compute"],
  coolingTree:
    d.cooling === "air"
      ? ["Room air", "Chassis fans", "Exhaust"]
      : ["Facility interface", "Loop/HX", "Manifold", "Cold plates"],
  networkFabrics: [d.fabric, d.scaleOut],
  faultDomains: ["local", "shared service", "communication fabric"],
  floorplanRules: [
    "Front service clearance and rear utility access are illustrative",
    "No operator site layout inferred",
  ],
  assetRefs: [`models/${d.shape}`],
  assetLicense:
    "Original procedural geometry; no vendor image/mesh redistribution",
  sourceConfidence:
    "Primary architecture facts; illustrative concealed mechanical layout",
  modelType: d.shape === "trainium" ? "conceptual" : "sourcedIllustration",
  // The user's review supplied a lower bound, not ten exact numerical grades.
  modelFidelityScore: 90,
  humanReview: {
    minimumScore: 90,
    reported: "≥90/100",
    reviewer: "User",
    date: "2026-10-15",
  },
  learningObjectives: [
    d.why,
    "Distinguish physical service from communication scope",
    "Discriminate a local fault from a shared root",
  ],
  scenarioIds: [`${d.architectureId}-1`, `${d.architectureId}-2`],
  lifecycleStages: levels.map((l) => ({
    level: l.level,
    name: l.name,
    applicable: !(d.cooling === "air" && l.level === 4),
    note:
      d.cooling === "air" && l.level === 4
        ? "Liquid commissioning not applicable; validate airflow instead."
        : l.level >= 9
          ? `Validate ${d.fabric}; fixture evidence is illustrative`
          : "Educational DVT/PVT gate; no vendor certification",
  })),
  disclosureBanner: `Source-informed ${d.shape === "trainium" ? "logical system with illustrative cabinet grouping" : "original 3D illustration"}. Concealed internals and spacing are illustrative. Synthetic signals. No Fluidstack deployment claim.`,
  variants:
    d.shape === "nvl72"
      ? [
          {
            id: "rubin",
            name: "Vera Rubin NVL72",
            status: "Separate published generation manual",
            delta:
              "Vera/Rubin silicon and sixth-generation NVLink; service mechanics require separate qualification. Not a GB300 BOM.",
            source: "rubin",
            modelled: true,
          },
        ]
      : d.shape === "ironwood"
        ? [
            {
              id: "tpu8t",
              name: "TPU 8t",
              status: "Announced training generation",
              delta:
                "Training-oriented ICI superpod; no inherited Ironwood tray CAD.",
              source: "tpu8",
              modelled: false,
            },
            {
              id: "tpu8i",
              name: "TPU 8i",
              status: "Announced inference generation",
              delta:
                "Boardfly topology rather than Ironwood cube torus; mechanical model deferred.",
              source: "tpu8",
              modelled: false,
            },
          ]
        : d.shape === "maia"
          ? [
              {
                id: "maia300",
                name: "Maia 300",
                status: "Roadmap — deployments planned 2027",
                delta:
                  "96-accelerator full configuration announced; production Maia 200 geometry is not substituted.",
                source: "maia300",
                modelled: false,
              },
            ]
          : d.shape === "cerebras"
            ? [
                {
                  id: "cs3",
                  name: "CS-3",
                  status: "Prior generation",
                  delta:
                    "Prior system; not substituted for the three-wafer CS-4 Nexus packaging.",
                  source: "cs4",
                  modelled: false,
                },
              ]
            : [],
}));
export const architectureById = Object.fromEntries(
  architectures.map((a) => [a.architectureId, a]),
);
export function representativePart(a: Architecture, concept: Concept) {
  const path =
    concept === "cooling"
      ? "cooling"
      : concept === "power"
        ? "power/1"
        : concept === "network"
          ? a.shape === "ironwood"
            ? "fabric/ici"
            : ["nvl72", "rubin", "helios", "trainium", "maia", "cray"].includes(
                  a.shape,
                )
              ? "fabric/1"
              : "network"
          : null;
  return (
    a.components.find((p) => p.id === `${a.architectureId}/${path}`) ||
    a.components.find((p) => p.concept === concept)!
  );
}
export function validateCatalogue() {
  const errors: string[] = [];
  const ids = new Set<string>();
  for (const a of architectures) {
    if (ids.has(a.architectureId)) errors.push("Duplicate family");
    ids.add(a.architectureId);
    for (const s of a.sourceRefs)
      if (!sourceById[s]) errors.push(`Missing source ${s}`);
    const parts = new Set(a.components.map((p) => p.id));
    if (parts.size !== a.components.length) errors.push("Duplicate part");
    for (const p of a.components)
      if (p.parentId && !parts.has(p.parentId)) errors.push("Orphan " + p.id);
    for (const c of a.claims)
      if (!sourceById[c.source] || !c.scope || !c.unit)
        errors.push("Invalid claim");
  }
  return errors;
}
export function whyDifferent(a: Architecture, b: Architecture) {
  return [
    `${a.familyName}: ${a.why}`,
    `${b.familyName}: ${b.why}`,
    `Scale-up: ${a.fabric} versus ${b.fabric}.`,
    `Service: ${a.power}; ${b.power}.`,
    `${a.cooling} versus ${b.cooling} cooling changes the commissioning and fault boundary. Performance is not ranked without equivalent workload, precision and system scope.`,
  ];
}
