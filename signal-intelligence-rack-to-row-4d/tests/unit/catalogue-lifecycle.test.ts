import { beforeEach, describe, expect, it } from "vitest";
import { MeshStandardMaterial } from "three";
import { architectures, architectureById } from "../../src/catalogue/registry";
import { resolveArchitecture } from "../../src/catalogue/variants";
import { buildModel } from "../../src/catalogue/models";
import { MATERIAL_KEYS } from "../../src/scene/hardware/materials";
import { useCatalogue } from "../../src/catalogue/store";
import {
  canSignStage,
  fixtureResult,
  lifecycleKey,
  lifecycleStage,
  parseSavedLifecycle,
  previousApplicable,
  recordStageNote,
  recordStageResult,
  type GateRecords,
} from "../../src/catalogue/lifecycle";
const palette = Object.fromEntries(
  MATERIAL_KEYS.map((k) => [k, new MeshStandardMaterial()]),
);
function ready(records: GateRecords, level: number) {
  let next = records;
  for (let i = 0; i < 3; i++)
    next = recordStageResult(
      next,
      level,
      i,
      fixtureResult(false, false, "2026-10-15"),
    );
  return recordStageNote(
    next,
    level,
    "Recorded synthetic evidence and reviewer context",
  );
}
beforeEach(() =>
  useCatalogue.setState({ assemblyLevels: {}, gateRecords: {}, replays: {} }),
);
describe("Catalogue L1–L12 restoration", () => {
  it("all ten families expose twelve named stages with an owner, phase, three checks and family-specific context", () => {
    for (const d of architectures) {
      for (let level = 1; level <= 12; level++) {
        const stage = lifecycleStage(d, level);
        expect(stage.level).toBe(level);
        expect(stage.name.length).toBeGreaterThan(5);
        expect(stage.owner.length).toBeGreaterThan(3);
        expect(stage.phase.length).toBeGreaterThan(2);
        expect(stage.tests).toHaveLength(3);
        expect(stage.context.length).toBeGreaterThan(25);
      }
      expect(lifecycleStage(d, 9).context).toContain(d.fabric);
      expect(lifecycleStage(d, 12).context).toContain(d.familyName);
    }
  });
  it("three passes, a note, the previous applicable gate and no active fault are required; air L4 remains visible but is skipped", () => {
    for (const d of architectures) {
      let records: GateRecords = {};
      for (let level = 1; level <= 12; level++) {
        records = ready(records, level);
        const applicable = lifecycleStage(d, level).applicable;
        expect(canSignStage(d, level, records, true)).toBe(false);
        expect(canSignStage(d, level, records, false)).toBe(applicable);
        if (applicable) records[level].signedAt = "2026-10-15";
      }
      expect(Object.values(records).filter((r) => r.signedAt)).toHaveLength(
        d.cooling === "air" ? 11 : 12,
      );
    }
    const air = architectureById["CAT-01"];
    expect(previousApplicable(air, 5)).toBe(3);
    expect(canSignStage(air, 12, ready({}, 12), false)).toBe(false);
    expect(canSignStage(air, 0, {}, false)).toBe(false);
    expect(fixtureResult(true, false).passed).toBe(false);
    expect(fixtureResult(false, true).passed).toBe(false);
    expect(
      canSignStage(air, 1, { 1: { ...ready({}, 1)[1], note: "" } }, false),
    ).toBe(false);
  });
  it("failed retests and earlier evidence edits invalidate downstream passes and cached tests", () => {
    let records = ready({}, 1);
    records[1].signedAt = "signed";
    records = ready(records, 2);
    records[2].signedAt = "signed";
    records = recordStageResult(records, 1, 0, fixtureResult(true, false));
    expect(records[1].signedAt).toBeNull();
    expect(records[2].signedAt).toBeNull();
    expect(records[2].results).toEqual({});
    records[2].signedAt = "signed";
    expect(
      recordStageNote(records, 1, "Revised evidence")[2].signedAt,
    ).toBeNull();
  });
  it("per-family and generation preview/evidence state cannot bleed between A and B or bypass store signoff", () => {
    const a = architectureById["CAT-04"],
      b = architectureById["CAT-05"],
      rubin = resolveArchitecture(a, "rubin");
    useCatalogue.getState().setAssemblyLevel(a, 2);
    useCatalogue.getState().setAssemblyLevel(b, 9);
    expect(useCatalogue.getState().assemblyLevels[lifecycleKey(a)]).toBe(2);
    expect(useCatalogue.getState().assemblyLevels[lifecycleKey(b)]).toBe(9);
    expect(
      useCatalogue.getState().assemblyLevels[lifecycleKey(rubin)],
    ).toBeUndefined();
    useCatalogue.getState().signGate(a, 1, false);
    expect(
      useCatalogue.getState().gateRecords[lifecycleKey(a)],
    ).toBeUndefined();
    for (let i = 0; i < 3; i++)
      useCatalogue
        .getState()
        .recordGateResult(a, 1, i, fixtureResult(false, false));
    useCatalogue.getState().recordGateNote(a, 1, "Saved fixture evidence");
    useCatalogue.getState().signGate(a, 1, true);
    expect(
      useCatalogue.getState().gateRecords[lifecycleKey(a)][1].signedAt,
    ).toBeNull();
    useCatalogue.getState().signGate(a, 1, false);
    expect(
      useCatalogue.getState().gateRecords[lifecycleKey(a)][1].signedAt,
    ).toBeTruthy();
    expect(
      useCatalogue.getState().gateRecords[lifecycleKey(b)],
    ).toBeUndefined();
    expect(
      useCatalogue.getState().gateRecords[lifecycleKey(rubin)],
    ).toBeUndefined();
  });
  it("saved progress roundtrips and corrupt or out-of-range storage falls back without breaking the lab", () => {
    const saved = {
      assemblyLevels: { "CAT-04/nvl72": 2 },
      gateRecords: { "CAT-04/nvl72": ready({}, 1) },
    };
    expect(parseSavedLifecycle(JSON.stringify(saved))).toEqual(saved);
    for (const text of [
      "bad JSON",
      "null",
      '{"assemblyLevels":{"CAT-04/nvl72":99},"gateRecords":{}}',
    ])
      expect(parseSavedLifecycle(text)).toEqual({
        assemblyLevels: {},
        gateRecords: {},
      });
  });
  it("each family's real rack assembly reveals only installed L1/L2/L3 owner records", () => {
    for (const d of architectures) {
      const counts = [];
      for (const level of [1, 2, 3, 12]) {
        const asset = buildModel(
          d,
          {
            view: "rack",
            level,
            explode: 0,
            cutaway: false,
            quality: "Performance",
            overlay: "Hardware",
            selected: "",
            concept: "service",
            faultStrength: 0,
            affected: [],
          },
          palette,
        );
        expect(
          [...asset.owners.keys()].every(
            (id) => d.components.find((p) => p.id === id)!.level <= level,
          ),
        ).toBe(true);
        expect(asset.owners.has(`${d.architectureId}/tray/1`)).toBe(level >= 3);
        expect(asset.owners.has(`${d.architectureId}/power/1`)).toBe(
          level >= 2,
        );
        counts.push(asset.triangles);
        asset.dispose();
      }
      expect(counts[0]).toBeLessThan(counts[2]);
      expect(counts[2]).toBeLessThanOrEqual(counts[3]);
    }
  });
});
