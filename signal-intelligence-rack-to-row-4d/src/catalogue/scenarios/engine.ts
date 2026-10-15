import type { Architecture, Fault, Replay, Concept } from "../types";
import { architectures } from "../registry";
import { heatDelta } from "../../simulation/engine";
const authored: [
  string,
  string,
  Fault["kind"],
  Fault["scope"],
  Concept,
  string,
  string,
  string,
][] = [
  [
    "CAT-01",
    "Fan rotor stalled",
    "air",
    "local",
    "cooling",
    "One chassis exhaust rises while neighboring inlets remain stable",
    "Compare tach, inlet and exhaust; distinguish a stopped rotor from blocked inlet",
    "Drain the chassis and inspect the simulated fan module",
  ],
  [
    "CAT-01",
    "One redundant AC PSU lost",
    "power",
    "local",
    "power",
    "Reserve falls; surviving PSU carries the load without automatic outage",
    "Verify feed independence and surviving capacity",
    "Reduce demand if reserve becomes insufficient",
  ],
  [
    "CAT-02",
    "One rectifier failed under N+1",
    "power",
    "shared",
    "power",
    "Shelf reserve decreases before any DC rail collapse",
    "Compare module status with bus voltage and aggregate demand",
    "Keep demand within surviving shelf capacity",
  ],
  [
    "CAT-02",
    "Blind-mate contact resistance",
    "local",
    "local",
    "power",
    "One tray contact heats with local voltage drop",
    "Compare contact temperature with adjacent tray current",
    "Drain and stop insertion acceptance",
  ],
  [
    "CAT-03",
    "Node-local GPU memory ECC",
    "local",
    "local",
    "memory",
    "One eight-GPU node loses local usable capacity; other nodes remain up",
    "Isolate GPU ECC from NVSwitch peer test errors",
    "Drain the affected node partition",
  ],
  [
    "CAT-03",
    "Scale-out NIC retry hotspot",
    "fabric",
    "fabric",
    "network",
    "NIC retries rise before inter-node goodput falls; intra-node fabric stays distinct",
    "Compare NIC FEC and intra-node peer bandwidth",
    "Reroute inter-node traffic or reduce offered load",
  ],
  [
    "CAT-04",
    "Shared manifold flow disturbance",
    "flow",
    "shared",
    "cooling",
    "Flow drops, then return and die temperature rise, then throttling",
    "Correlate all tray flow/pressure and thermal trends",
    "Throttle/drain dependent compute; preserve leak/flow evidence",
  ],
  [
    "CAT-04",
    "NVSwitch tray connectivity loss",
    "fabric",
    "fabric",
    "network",
    "Rack peer routes degrade before collective completion slows",
    "Compare NVLink lane telemetry with healthy ConnectX scale-out counters",
    "Drain impacted collective partition; qualify topology before release",
  ],
  [
    "CAT-05",
    "UALink cartridge lane degradation",
    "fabric",
    "fabric",
    "network",
    "UALink retries precede scale-up goodput loss; Ethernet scope is separate",
    "Run UALink peer tests and compare Vulcano scale-out counters",
    "Drain affected UALink domain; preserve cartridge evidence",
  ],
  [
    "CAT-05",
    "Sled QD not fully engaged",
    "flow",
    "local",
    "cooling",
    "One sled loses flow before its packages heat; neighbors remain cool",
    "Compare QD latch evidence with sled-local flow and pressure",
    "Stop service gate and drain the affected sled",
  ],
  [
    "CAT-06",
    "ICI neighbor link degraded",
    "fabric",
    "fabric",
    "network",
    "One torus edge retries; alternate route adds collective latency",
    "Compare six-neighbor tests with separate OCS/DCN state",
    "Reroute the synthetic collective or drain affected slice",
  ],
  [
    "CAT-06",
    "Cross-cube OCS reconfiguration",
    "fabric",
    "fabric",
    "network",
    "Optical path changes across cubes; local ICI links remain a separate domain",
    "Compare cross-cube route evidence with rack-local ICI tests",
    "Pause/reconfigure cross-cube workload; retain local cube",
  ],
  [
    "CAT-07",
    "NeuronSwitch collective hotspot",
    "fabric",
    "fabric",
    "network",
    "Neuron collective retries reduce logical-system goodput",
    "Compare host-local work with cross-host collective trace",
    "Repartition the logical UltraServer workload",
  ],
  [
    "CAT-07",
    "One Trainium host unavailable",
    "local",
    "local",
    "compute",
    "Host partition is lost; no assertion of total physical-rack outage",
    "Compare host heartbeat and Neuron device inventory",
    "Checkpoint and replace the affected logical partition",
  ],
  [
    "CAT-08",
    "HXU circulation lost",
    "flow",
    "shared",
    "cooling",
    "Loop flow falls before package heat and serving throttling",
    "Compare HXU pump/flow evidence with supply-temperature loss",
    "Drain dependent serving capacity and stop cooling acceptance",
  ],
  [
    "CAT-08",
    "Inference KV-cache memory pressure",
    "logical",
    "software",
    "memory",
    "Serving latency rises while physical cooling and ECC remain nominal",
    "Compare allocation/layout traces against physical memory error counters",
    "Reduce batch/context pressure and qualify serving layout",
  ],
  [
    "CAT-09",
    "Wafer I/O stream stall",
    "fabric",
    "fabric",
    "network",
    "External stream starvation reduces useful wafer work",
    "Compare external I/O and on-wafer activity; do not invent NVLink counters",
    "Checkpoint/reroute the stream boundary",
  ],
  [
    "CAT-09",
    "Wafer backpack heat removal loss",
    "flow",
    "local",
    "cooling",
    "One wafer module warms after local cooling loss",
    "Compare backpack inlet/return and neighboring wafer temperatures",
    "Drain the affected wafer module",
  ],
  [
    "CAT-10",
    "Common CDU low-flow condition",
    "flow",
    "shared",
    "cooling",
    "Compute and switch cold plates warm after shared flow loss",
    "Compare CDU trends across blade and Slingshot service loops",
    "Stop commissioning and drain all dependent blades",
  ],
  [
    "CAT-10",
    "Slingshot switch blade degraded",
    "fabric",
    "fabric",
    "network",
    "HPC collective goodput drops with switch-local link errors",
    "Correlate MPI stragglers with Slingshot counters; cooling may stay nominal",
    "Route around or drain the fabric partition",
  ],
];
export const catalogueFaults: Fault[] = authored.map((x, i) => ({
  id: `${x[0]}-${(i % 2) + 1}`,
  family: x[0] as Fault["family"],
  name: x[1],
  kind: x[2],
  scope: x[3],
  target: x[4],
  signature: x[5],
  tests: [
    x[6],
    "Use a known-good peer and the independent service layer as controls",
  ],
  containment: x[7],
  prevention:
    "Require repeatable DVT/PVT evidence, capture the pre/post state and add the discriminating test to the release gate.",
  hypotheses: [
    x[1],
    "A similar alarm from a different service boundary",
    "A sensor or software artifact",
  ],
  sourceRefs: architectures.find((a) => a.architectureId === x[0])!.sourceRefs,
}));
export const faultById = Object.fromEntries(
  catalogueFaults.map((f) => [f.id, f]),
);
export const blankReplay = (family: Replay["family"]): Replay => ({
  version: 2,
  family,
  fault: null,
  seed: 1729,
  injectedAt: 0,
  recoveredAt: null,
});
export function catalogueSnapshot(a: Architecture, r: Replay, time: number) {
  const fault = r.fault ? faultById[r.fault] : null;
  const age = Math.max(0, time - r.injectedAt);
  const active = !!fault && time >= r.injectedAt;
  const recovery =
    r.recoveredAt !== null && time >= r.recoveredAt
      ? Math.exp(-(time - r.recoveredAt) / 35)
      : 1;
  const strength = active ? (1 - Math.exp(-age / 5)) * recovery : 0;
  const thermal = active
    ? (1 - Math.exp(-Math.max(0, age - 12) / 80)) * recovery
    : 0;
  const local = fault?.scope === "local";
  const liquid = a.cooling === "liquid";
  const nominalKW =
    a.shape === "eia"
      ? 18
      : a.shape === "orv3"
        ? 12
        : a.shape === "dgx"
          ? 48
          : 96; // Educational loads, never vendor power ratings.
  const branchCount = local && fault?.kind === "flow" ? a.layout.trays : 1;
  const nominalFlow = 240 / branchCount;
  const flow = liquid
    ? nominalFlow * (1 - (fault?.kind === "flow" ? strength * 0.7 : 0))
    : null;
  const supply = liquid ? 30 : null;
  const returnC = liquid
    ? 30 + heatDelta(nominalKW / branchCount, flow!)
    : null;
  const physicalHeat =
    fault?.kind === "flow" ||
    fault?.kind === "air" ||
    (fault?.kind === "local" && fault.target === "power");
  const dieC = 48 + (physicalHeat ? 42 * thermal : 0);
  const retries =
    fault?.kind === "fabric" ? Math.round(400 * strength + (r.seed % 11)) : 0;
  const goodput =
    100 -
    (fault?.kind === "fabric"
      ? 32 * strength
      : fault?.kind === "logical"
        ? 27 * strength
        : physicalHeat
          ? Math.max(0, dieC - 72) * 1.6
          : fault?.kind === "local"
            ? (100 / a.layout.trays) * strength
            : 0);
  const reserve =
    fault?.kind === "power" ? Math.max(0, 100 - 65 * strength) : 100;
  let affected =
    active && strength > 0.05
      ? fault?.kind === "flow" ||
        fault?.kind === "air" ||
        fault?.kind === "local"
        ? a.components
            .filter(
              (p) =>
                p.concept === "compute" &&
                p.id.includes("/tray/") &&
                (!local || p.id.endsWith("/1")),
            )
            .map((p) => p.id)
        : a.components
            .filter((p) => p.concept === fault!.target)
            .slice(
              0,
              fault?.scope === "fabric" ? Math.max(1, a.layout.switches) : 1,
            )
            .map((p) => p.id)
      : [];
  if (active && strength > 0.05 && fault?.kind === "fabric") {
    const target: Record<string, string> = {
      "CAT-03": "network",
      "CAT-04": "fabric/1",
      "CAT-05": "fabric/1",
      "CAT-06": fault.id.endsWith("-1") ? "fabric/ici" : "fabric/ocs",
      "CAT-07": "fabric/1",
      "CAT-09": "network",
      "CAT-10": "fabric/1",
    };
    affected = [`${a.architectureId}/${target[a.architectureId] || "network"}`];
  }
  if (
    active &&
    strength > 0.05 &&
    fault?.kind === "flow" &&
    fault.scope === "shared" &&
    ["nvl72", "rubin", "helios", "cray"].includes(a.shape)
  )
    affected.push(
      ...a.components.filter((p) => p.id.includes("/fabric/")).map((p) => p.id),
    );
  if (fault?.kind === "logical") affected = []; // Software pressure never paints a fictitious physical failure.
  return {
    time,
    dieC,
    flowLmin: flow,
    pressureKpa: liquid ? 180 * (flow! / nominalFlow) ** 2 : null,
    supplyC: supply,
    returnC,
    powerKW: nominalKW,
    goodputPct: Math.max(0, goodput),
    retries,
    reservePct: reserve,
    affected,
    scope: fault?.scope || "none",
    fault: active ? fault : null,
    strength,
    synthetic: true,
  };
}
export function importCatalogueReplay(text: string): Replay {
  const r = JSON.parse(text);
  if (
    r.version !== 2 ||
    !architectures.some((a) => a.architectureId === r.family) ||
    !Number.isInteger(r.seed) ||
    !Number.isFinite(r.injectedAt) ||
    r.injectedAt < 0 ||
    r.injectedAt > 600 ||
    (r.recoveredAt !== null &&
      (!Number.isFinite(r.recoveredAt) ||
        r.recoveredAt < r.injectedAt ||
        r.recoveredAt > 600)) ||
    (r.fault && faultById[r.fault]?.family !== r.family)
  )
    throw Error("Invalid catalogue replay");
  return r;
}
export function dcCurrent(kW: number, volts: number) {
  if (volts <= 0 || kW < 0) throw Error("Invalid electrical parameters");
  return (kW * 1000) / volts;
}
export function threePhaseCurrent(kW: number, lineV: number, pf: number) {
  if (lineV <= 0 || pf <= 0 || pf > 1 || kW < 0)
    throw Error("Invalid electrical parameters");
  return (kW * 1000) / (Math.sqrt(3) * lineV * pf);
}
