import { describe, it, expect } from "vitest";
import { inventory, audit, profiles, recordSchema } from "../../src/data/model";
import {
  graph,
  descendants,
  fabricTopology,
} from "../../src/graphs/dependencies";
import {
  snapshot,
  heatDelta,
  scenarioSchema,
  type Scenario,
} from "../../src/simulation/engine";
import { incidents } from "../../src/data/failures/incidents";
import levels from "../../src/data/levels.json";
import sources from "../../src/data/sources.json";
import { inspectGLTF, validateBinding } from "../../src/import/adapter";
const records = inventory("FS_CONCEPT");
const base: Scenario = {
  version: 1,
  seed: 42,
  profile: "FS_CONCEPT",
  racks: 8,
  events: [],
};
const pump = records.find((r) => r.type === "pump")!,
  hbm = records.find((r) => r.type === "hbm")!;
describe("content integrity", () => {
  for (const profile of profiles)
    it(
      profile.name + " has complete stable records and no orphan hierarchy",
      () => {
        const data = inventory(profile.id as any);
        const a = audit(data);
        expect(a.types).toBeGreaterThanOrEqual(50);
        expect(a.nodes).toBeGreaterThanOrEqual(100);
        expect(a.missing).toEqual([]);
        expect(a.orphans).toEqual([]);
        expect(new Set(data.map((r) => r.id)).size).toBe(data.length);
        for (const r of data)
          expect(
            r.sourceIds.every((id) => sources.some((s) => s.id === id)),
          ).toBe(true);
      },
    );
  it("required card schema rejects omissions", () => {
    expect(
      recordSchema.safeParse({ ...records[0], whatItDoes: "" }).success,
    ).toBe(false);
  });
  it("36 incidents, 3 per level, distinct test and differential content", () => {
    expect(incidents).toHaveLength(36);
    expect(new Set(incidents.map((i) => i.title)).size).toBe(36);
    for (const l of levels) {
      expect(incidents.filter((i) => i.level === l.level)).toHaveLength(3);
      expect(l.tests.length).toBeGreaterThanOrEqual(3);
    }
    expect(incidents.filter((i) => i.redHerring === "shared")).toHaveLength(3);
    expect(incidents.filter((i) => i.redHerring === "local")).toHaveLength(3);
  });
  it("reference counts and fabrics remain separated", () => {
    const nv = inventory("NVIDIA_GB200_NVL72_REFERENCE"),
      tp = inventory("GOOGLE_IRONWOOD_TPU_REFERENCE");
    for (const [type, count] of [
      ["tray", 18],
      ["accelerator", 72],
      ["cpu", 36],
      ["scale-up-switch", 9],
      ["power-shelf", 8],
      ["psu", 48],
    ] as const)
      expect(
        nv.filter(
          (r) => r.physicalLocation.rack === "RACK-01" && r.type === type,
        ),
      ).toHaveLength(count);
    expect(
      tp.filter(
        (r) =>
          r.physicalLocation.rack === "RACK-01" && r.type === "accelerator",
      ),
    ).toHaveLength(64);
    expect(tp.some((r) => ["c2c", "scale-up-switch"].includes(r.type))).toBe(
      false,
    );
    expect(nv.some((r) => ["ici", "ocs"].includes(r.type))).toBe(false);
  });
});
describe("deterministic physics and scope", () => {
  it("heat balance uses consistent water mass units", () => {
    expect(heatDelta(96, 120)).toBeCloseTo(11.4832536);
    expect(heatDelta(96, 60)).toBeCloseTo(heatDelta(96, 120) * 2);
  });
  it("identical imported replay and rewind snapshots", () => {
    const s: Scenario = {
      ...base,
      events: [
        { time: 0, kind: "inject", incidentId: "INC-10", target: pump.id },
      ],
    };
    const a = snapshot(s, 300, incidents);
    snapshot(s, 600, incidents);
    expect(snapshot(JSON.parse(JSON.stringify(s)), 300, incidents)).toEqual(a);
    expect(snapshot(s, 0, incidents).racks[0].temp).toBeLessThan(
      a.racks[0].temp,
    );
  });
  it("pump first changes hydraulics then thermal and goodput", () => {
    const s: Scenario = {
      ...base,
      events: [
        { time: 0, kind: "inject", incidentId: "INC-10", target: pump.id },
      ],
    };
    const early = snapshot(s, 1, incidents),
      late = snapshot(s, 500, incidents);
    expect(early.racks[0].flow).toBe(42);
    expect(early.racks[0].temp).toBeLessThan(60);
    expect(late.racks[0].temp).toBeGreaterThan(78);
    expect(late.capacity).toBeLessThan(100);
    expect(late.racks.filter((r) => r.affected).map((r) => r.rack)).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
    expect(late.racks[7].goodput).toBe(100);
  });
  it("shared graph excludes storage and local HBM has no row fan-out", () => {
    const g = graph(records);
    const affected = descendants(pump.id, g);
    expect(affected).toContain("FS_CONCEPT/R1/rack");
    expect(affected).not.toContain("FS_CONCEPT/R8/rack");
    expect(descendants(hbm.id, g)).toEqual([hbm.id]);
    const s: Scenario = {
      ...base,
      events: [
        { time: 0, kind: "inject", incidentId: "INC-14", target: hbm.id },
      ],
    };
    expect(
      snapshot(s, 300, incidents)
        .racks.filter((r) => r.affected)
        .map((r) => r.rack),
    ).toEqual([1]);
  });
  it("containment and recovery are rewindable and restore capacity", () => {
    const s: Scenario = {
      ...base,
      events: [
        { time: 0, kind: "inject", incidentId: "INC-10", target: pump.id },
        { time: 200, kind: "contain", incidentId: "INC-10", target: pump.id },
        { time: 300, kind: "recover", incidentId: "INC-10", target: pump.id },
      ],
    };
    expect(snapshot(s, 250, incidents).contained).toBe(true);
    expect(snapshot(s, 100, incidents).contained).toBe(false);
    const end = snapshot(s, 600, incidents);
    expect(end.capacity).toBe(100);
    expect(end.racks[0].flow).toBe(120);
    expect(
      end.racks.every((r) => Number.isFinite(r.temp) && r.temp < 100),
    ).toBe(true);
  });
});
describe("local import boundaries", () => {
  it("rejects external resources and unsupported required extensions", () => {
    expect(() =>
      inspectGLTF({ buffers: [{ uri: "https://evil.invalid/payload" }] }),
    ).toThrow();
    expect(() =>
      inspectGLTF({ images: [{ uri: "data:image/svg+xml;base64,ABC" }] }),
    ).toThrow();
    expect(() => inspectGLTF({ extensionsRequired: ["evil"] })).toThrow();
    expect(() =>
      inspectGLTF({
        buffers: [{ uri: "data:application/octet-stream;base64,AAAA" }],
      }),
    ).not.toThrow();
  });
  it("rejects duplicates, absent meshes and unknown records", () => {
    const errors = validateBinding(
      {
        version: 1,
        assetName: "test",
        attribution: "self",
        license: "owned",
        scale: 1,
        rotation: 0,
        xray: false,
        meshes: { a: "x", b: "x", c: "z" },
      },
      ["a", "b"],
      ["x"],
    );
    expect(errors).toContain("Duplicate component binding x");
    expect(errors).toContain("Absent mesh c");
    expect(errors).toContain("Unknown component z");
  });
  it("rejects scenario invalid time/profile", () => {
    expect(
      scenarioSchema.safeParse({ ...base, profile: "mixed" }).success,
    ).toBe(false);
    expect(
      scenarioSchema.safeParse({
        ...base,
        events: [{ time: -1, kind: "inject", incidentId: "a", target: "b" }],
      }).success,
    ).toBe(false);
  });
});

describe("reference graph topology", () => {
  it("Ironwood 4x4x4 torus gives each chip six ICI neighbors and no NVLink", () => {
    const rs = inventory("GOOGLE_IRONWOOD_TPU_REFERENCE");
    const links = fabricTopology(rs);
    const chips = rs.filter(
      (r) => r.type === "accelerator" && r.physicalLocation.rack === "RACK-01",
    );
    for (const chip of chips)
      expect(
        links.filter(
          (l) => l.fabric === "ICI" && (l.from === chip.id || l.to === chip.id),
        ),
      ).toHaveLength(6);
    expect(links.some((l) => l.fabric === "NVLink")).toBe(false);
    expect(links.filter((l) => l.fabric === "OCS")).toHaveLength(5);
  });
  it("GB200 graph keeps NVLink and C2C separate from ICI", () => {
    const links = fabricTopology(inventory("NVIDIA_GB200_NVL72_REFERENCE"));
    expect(links.some((l) => l.fabric === "NVLink")).toBe(true);
    expect(links.filter((l) => l.fabric === "NVLink-C2C")).toHaveLength(6 * 72);
    expect(links.some((l) => l.fabric === "ICI")).toBe(false);
  });
  it("nonzero-time injection produces relative alert chronology", () => {
    const s: Scenario = {
      ...base,
      events: [
        { time: 200, kind: "inject", incidentId: "INC-10", target: pump.id },
      ],
    };
    expect(snapshot(s, 400, incidents).chronology.map((e) => e.time)).toEqual([
      200, 230, 320,
    ]);
  });
  it("ECC replay seed changes fixture counts without nondeterminism", () => {
    const s: Scenario = {
      ...base,
      events: [
        { time: 0, kind: "inject", incidentId: "INC-14", target: hbm.id },
      ],
    };
    expect(snapshot(s, 300, incidents)).toEqual(snapshot(s, 300, incidents));
    expect(
      new Set(
        Array.from(
          { length: 20 },
          (_, seed) => snapshot({ ...s, seed }, 300, incidents).racks[0].ecc,
        ),
      ).size,
    ).toBeGreaterThan(1);
  });
});
