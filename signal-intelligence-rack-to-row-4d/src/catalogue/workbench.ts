import knowledge from "../data/components/catalog.json";
import type { IntelligenceCard } from "../ui/Workbench";
import type { Architecture, Part } from "./types";
import { catalogueGraphs } from "./graphs";
import { blankReplay, catalogueSnapshot } from "./scenarios/engine";
import type { Replay } from "./types";

export const systemLayers = [
  "Hardware",
  "Power",
  "Liquid Cooling",
  "Airflow",
  "Network",
  "Management/Telemetry",
  "Storage",
  "Dependencies",
];
export function partType(d: Architecture, p: Part) {
  const path = p.id.slice(d.architectureId.length + 1).split("/")[0];
  if (path === "chip")
    return d.shape === "cerebras"
      ? "wafer"
      : ["eia", "orv3"].includes(d.shape)
        ? "cpu"
        : "accelerator";
  if (path === "memory")
    return d.shape === "cerebras"
      ? "sram"
      : ["eia", "orv3"].includes(d.shape)
        ? "dimm"
        : "hbm";
  if (path === "power") return d.layout.shelves ? "power-shelf" : "pdu";
  if (path === "cooling")
    return d.cooling !== "liquid"
      ? "fan"
      : ["maia", "cray"].includes(d.shape)
        ? "cdu"
        : "manifold-supply";
  if (path === "fabric")
    return d.shape === "ironwood"
      ? p.id.endsWith("ocs")
        ? "ocs"
        : "ici"
      : ["nvl72", "rubin", "dgx"].includes(d.shape)
        ? "scale-up-switch"
        : "scale-up";
  return (
    ({ plate: "cold-plate", network: "scale-out" } as Record<string, string>)[
      path
    ] || path
  );
}
const serviceAdjacency = new WeakMap<Architecture, Map<string, Set<string>>>();
export function downstreamParts(d: Architecture, p: Part) {
  let adjacency = serviceAdjacency.get(d);
  if (!adjacency) {
    adjacency = new Map();
    const links = [
      ...catalogueGraphs(d).service,
      ...d.components
        .filter((c) => c.parentId)
        .map((c) => ({ from: c.parentId!, to: c.id })),
    ];
    for (const { from, to } of links) {
      if (!adjacency.has(from)) adjacency.set(from, new Set());
      adjacency.get(from)!.add(to);
    }
    serviceAdjacency.set(d, adjacency);
  }
  const seen = new Set([p.id]),
    queue = [p.id];
  while (queue.length) {
    const id = queue.shift()!;
    for (const to of adjacency.get(id) || [])
      if (!seen.has(to)) {
        seen.add(to);
        queue.push(to);
      }
  }
  return [...seen].filter((id) => id !== p.id);
}
export function intelligenceFor(d: Architecture, p: Part): IntelligenceCard {
  const type = partType(d, p),
    base = knowledge.find((k) => k.type === type);
  const special =
    type === "wafer"
      ? "Executes computation across a wafer-scale processor and its integrated on-wafer fabric."
      : type === "sram"
        ? "Provides on-wafer static memory; this is not external HBM or host DIMM geometry."
        : null;
  return {
    shortDescription: `${p.name}. ${special || base?.principle || p.function}`,
    whyItMatters: `${p.function} ${d.why}`,
    normalOperatingPrinciple: `${special || base?.principle || p.function} Architecture context: ${d.fabric}; ${d.power}; ${d.cooling} cooling.`,
    primaryFailureSignature: p.symptoms[0],
    secondarySignatures: p.symptoms.slice(1),
    alternativeExplanations: [
      base?.alternative || "A similar alarm from another dependency domain",
      "Firmware, workload placement or sensor interpretation rather than a failed part",
    ],
    telemetryKeys:
      p.concept === "cooling"
        ? ["flowLmin", "dieC", "returnC", "pressureKpa"]
        : p.concept === "power"
          ? ["powerKW", "reservePct"]
          : p.concept === "network"
            ? ["retries", "goodputPct"]
            : ["dieC", "goodputPct"],
    evidenceToCollect: [...p.tests, ...(base ? [base.evidence] : [])],
    applicabilityNotes: `${d.disclosureBanner} Generic diagnostic principles are shared with the original component knowledge library; this does not add verified vendor service procedures.`,
    validationTests: [...p.tests, ...(base ? [base.test] : [])],
    exitCriteria: [
      "Restore baseline synthetic signals after recovery",
      "Recheck owned L1–L12 evidence and recurrence before release",
    ],
    ownerFunctions: [p.owner],
  };
}
export const traceMetrics = {
  dieC: "°C",
  flowLmin: "L/min",
  goodputPct: "%",
  powerKW: "kW",
  pressureKpa: "kPa",
  supplyC: "°C",
  returnC: "°C",
  retries: "events",
  reservePct: "%",
};
export type TraceMetric = keyof typeof traceMetrics;
export function traceFor(
  d: Architecture,
  replay: Replay | undefined,
  metric: TraceMetric,
) {
  const points = Array.from(
    { length: 61 },
    (_, i) =>
      catalogueSnapshot(d, replay || blankReplay(d.architectureId), i * 10)[
        metric
      ],
  );
  return points.some((p) => p === null) ? null : (points as number[]);
}
export function layerMatches(
  d: Architecture,
  p: Part,
  layer: string,
  selected?: Part,
) {
  if (layer === "Hardware") return true;
  if (layer === "Power") return p.concept === "power";
  if (layer === "Cooling" || layer === "Liquid Cooling")
    return (
      d.cooling === "liquid" &&
      p.concept === "cooling" &&
      !p.id.includes("/fan/")
    );
  if (layer === "Airflow")
    return (
      p.id.includes("/fan/") ||
      (d.cooling !== "liquid" && p.id.endsWith("/cooling"))
    );
  if (layer === "Network") return p.concept === "network";
  if (layer === "Management/Telemetry") return p.id.includes("/bmc/");
  if (layer === "Storage") return p.id.includes("/nvme/");
  if (layer === "Dependencies")
    return (
      !selected ||
      p.id === selected.id ||
      downstreamParts(d, selected).includes(p.id)
    );
  return false;
}
