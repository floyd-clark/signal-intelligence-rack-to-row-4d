import { z } from "zod";
import levels from "../data/levels.json";
import type { Architecture } from "./types";

export const LIFECYCLE_STORAGE = "signal-intelligence-catalogue-lifecycle-v1";
const resultSchema = z.object({
  passed: z.boolean(),
  detail: z.string(),
  checkedAt: z.string(),
});
const gateSchema = z.object({
  results: z.record(z.string(), resultSchema),
  note: z.string(),
  signedAt: z.string().nullable(),
});
const savedSchema = z.object({
  assemblyLevels: z.record(z.string(), z.number().int().min(1).max(12)),
  gateRecords: z.record(z.string(), z.record(z.string(), gateSchema)),
});
export type GateResult = z.infer<typeof resultSchema>;
export type GateRecord = z.infer<typeof gateSchema>;
export type GateRecords = Record<string, GateRecord>;
export type SavedLifecycle = z.infer<typeof savedSchema>;
export const lifecycleKey = (d: Architecture) =>
  `${d.architectureId}/${d.shape}`;
export const emptyGate = (): GateRecord => ({
  results: {},
  note: "",
  signedAt: null,
});
export function parseSavedLifecycle(text: string | null): SavedLifecycle {
  try {
    const result = savedSchema.safeParse(JSON.parse(text || "null"));
    if (result.success) return result.data;
  } catch {
    /* A corrupt or unavailable browser store must not stop the lab. */
  }
  return { assemblyLevels: {}, gateRecords: {} };
}
export function readSavedLifecycle(): SavedLifecycle {
  try {
    return parseSavedLifecycle(
      typeof window === "undefined"
        ? null
        : window.localStorage.getItem(LIFECYCLE_STORAGE),
    );
  } catch {
    return parseSavedLifecycle(null);
  }
}
export function lifecycleStage(d: Architecture, level: number) {
  const common = levels[level - 1],
    stage = d.lifecycleStages[level - 1];
  const contexts = [
    `Review ${d.familyName} enclosure, rail and grounding interfaces; ${d.knownPhysicalDimensions ? "published enclosure dimensions are linked in Sources" : "concealed dimensions remain illustrative"}.`,
    `Trace ${d.power}. Record interface and reserve evidence without inferring deployed load.`,
    `Review ${d.layout.trays} ${d.shape === "cerebras" ? "wafer backpacks" : d.shape === "cray" ? "blade positions" : "carrier positions"}, connector alignment and service clearance within ${d.unitOfComparison}.`,
    d.cooling === "air"
      ? "Liquid dry-integration tests are N/A. Airflow and fan performance are reviewed at L10."
      : `${d.cooling === "optional liquid" ? "Optional liquid configuration study; the baseline remains air-cooled. " : ""}Review ${d.coolingTree.join(" → ")}, supply/return mapping and cold-plate contacts.`,
    `Reconcile carrier, processor and memory records against scoped claims for ${d.generation}; hidden package counts remain illustrative.`,
    `Review management discovery, firmware compatibility and the ${d.software} software boundary.`,
    `Exercise the synthetic power sequence and reserve model for ${d.power}.`,
    `Reconcile discovered devices with ${d.unitOfComparison}; do not confuse a logical system with one cabinet.`,
    `Qualify ${d.fabric} separately from ${d.scaleOut}; service dependencies and communication edges have different scopes.`,
    `Review ${d.cooling === "air" || d.cooling === "optional liquid" ? "airflow and thermal margin" : "flow, heat balance and thermal margin"} under synthetic load.`,
    `Rehearse the two authored ${d.familyName} faults, bounded recovery and replay; no physical endurance duration is claimed.`,
    `Reconcile all applicable L1–L11 evidence, scoped BOM, source limitations and the release owner for ${d.familyName}.`,
  ];
  return { ...common, ...stage, context: contexts[level - 1] };
}
export function previousApplicable(d: Architecture, level: number) {
  return d.lifecycleStages.filter((s) => s.applicable && s.level < level).at(-1)
    ?.level;
}
export function canSignStage(
  d: Architecture,
  level: number,
  records: GateRecords,
  activeFault: boolean,
) {
  if (!Number.isInteger(level) || level < 1 || level > 12) return false;
  const stage = lifecycleStage(d, level),
    record = records[level],
    previous = previousApplicable(d, level);
  return (
    stage.applicable &&
    !activeFault &&
    !!record?.note.trim() &&
    stage.tests.every((_, i) => record?.results[i]?.passed) &&
    (!previous || !!records[previous]?.signedAt)
  );
}
export function fixtureResult(
  failingFixture: boolean,
  activeFault: boolean,
  checkedAt = new Date().toISOString(),
): GateResult {
  return {
    passed: !failingFixture && !activeFault,
    detail: activeFault
      ? "FAIL — open synthetic incident; clear the initiating condition before qualification"
      : failingFixture
        ? "FAIL — simulated acceptance fixture"
        : "PASS — synthetic validation fixture",
    checkedAt,
  };
}
function invalidateFrom(records: GateRecords, level: number): GateRecords {
  return Object.fromEntries(
    Object.entries(records).map(([n, r]) => [
      n,
      +n >= level
        ? { ...r, signedAt: null, results: +n > level ? {} : r.results }
        : r,
    ]),
  );
}
export function recordStageResult(
  records: GateRecords,
  level: number,
  check: number,
  result: GateResult,
): GateRecords {
  const next = invalidateFrom(records, level),
    record = next[level] || emptyGate();
  return {
    ...next,
    [level]: { ...record, results: { ...record.results, [check]: result } },
  };
}
export function recordStageNote(
  records: GateRecords,
  level: number,
  note: string,
): GateRecords {
  const next = invalidateFrom(records, level);
  return { ...next, [level]: { ...(next[level] || emptyGate()), note } };
}
