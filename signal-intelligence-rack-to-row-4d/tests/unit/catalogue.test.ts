import { describe, it, expect } from "vitest";
import { MeshStandardMaterial, Raycaster, Vector3, Box3 } from "three";
import {
  architectures,
  architectureById,
  validateCatalogue,
  whyDifferent,
  representativePart,
} from "../../src/catalogue/registry";
import { catalogueGraphs } from "../../src/catalogue/graphs";
import {
  catalogueFaults,
  blankReplay,
  catalogueSnapshot,
  importCatalogueReplay,
  dcCurrent,
  threePhaseCurrent,
} from "../../src/catalogue/scenarios/engine";
import { buildModel, builders } from "../../src/catalogue/models";
import { MATERIAL_KEYS } from "../../src/scene/hardware/materials";
import { resolveOwner } from "../../src/scene/hardware/assembly";
import { inventory } from "../../src/data/model";
import { resolveArchitecture } from "../../src/catalogue/variants";
const palette = Object.fromEntries(
  MATERIAL_KEYS.map((k) => [k, new MeshStandardMaterial()]),
);
const options = {
  view: "rack" as const,
  level: 12,
  explode: 0,
  cutaway: true,
  quality: "Balanced",
  overlay: "Hardware",
  selected: "",
  concept: "compute" as const,
  faultStrength: 0,
  affected: [],
};
describe("Rack Catalogue contracts and engineering", () => {
  it("ten unique registered families retain required fields, dated scoped claims, sources and stable parent IDs", () => {
    expect(architectures).toHaveLength(10);
    expect(validateCatalogue()).toEqual([]);
    expect(new Set(architectures.map((a) => a.shape)).size).toBe(10);
    for (const a of architectures) {
      expect(builders[a.shape]).toBeTypeOf("function");
      expect(a.lifecycleStages).toHaveLength(12);
      expect(a.modelFidelityScore).toBe(90);
      expect(a.humanReview?.minimumScore).toBe(90);
      expect(a.humanReview?.reported).toBe("≥90/100");
      expect(a.disclosureBanner).toContain("No Fluidstack");
      expect(
        a.components.every(
          (p) => p.symptoms.length === 3 && p.tests.length >= 2,
        ),
      ).toBe(true);
      for (const c of a.claims) {
        expect(c.checkedDate).toBe("2026-10-15");
        expect(c.scope.length).toBeGreaterThan(5);
      }
    }
  });
  it("GB300 generation quantities and separate DGX eight-GPU node are exact", () => {
    const a = architectureById["CAT-04"];
    expect(a.layout).toEqual({
      trays: 18,
      chipsPerTray: 4,
      cpusPerTray: 2,
      switches: 9,
      shelves: 8,
      psus: 6,
    });
    expect(a.components.filter((p) => p.id.includes("/chip/"))).toHaveLength(
      72,
    );
    expect(a.components.filter((p) => p.id.includes("/cpu/"))).toHaveLength(36);
    expect(a.claims.find((c) => c.name === "PSU rating")?.value).toBe(5.5);
    expect(architectureById["CAT-03"].layout.chipsPerTray).toBe(8);
  });
  it("UALink and ICI/OCS are separate communication models, with six neighbors per Ironwood chip", () => {
    expect(
      catalogueGraphs(architectureById["CAT-05"]).communication.every(
        (e) => e.kind === "UALink",
      ),
    ).toBe(true);
    const g = catalogueGraphs(architectureById["CAT-06"]);
    const ici = g.communication.filter((e) => e.kind === "ICI");
    expect(ici).toHaveLength(192);
    for (const p of architectureById["CAT-06"].components.filter((p) =>
      p.id.includes("/chip/"),
    ))
      expect(ici.filter((e) => e.from === p.id || e.to === p.id)).toHaveLength(
        6,
      );
    expect(g.communication.filter((e) => e.kind === "OCS")).toHaveLength(1);
    expect(JSON.stringify(g)).not.toContain("NVLink");
    expect(g.service.every((e) => e.scope === "physical service")).toBe(true);
  });
  it("logical and roadmap truth controls do not infer undocumented physical counts", () => {
    expect(architectureById["CAT-07"].physicalRackCountKnown).toBeNull();
    expect(architectureById["CAT-07"].claims[0].scope).toContain("Logical");
    expect(architectureById["CAT-08"].releaseStatus).toContain("2027");
    expect(architectureById["CAT-09"].layout.trays).toBe(3);
    expect(
      architectureById["CAT-10"].claims.find(
        (c) => c.name === "Cabinet cooling fans",
      )?.value,
    ).toBe(0);
    expect(
      whyDifferent(
        architectureById["CAT-01"],
        architectureById["CAT-02"],
      ).join(),
    ).toContain("48V");
  });
  it("all twenty authored faults are deterministic and have distinct signatures and evidence", () => {
    expect(catalogueFaults).toHaveLength(20);
    expect(new Set(catalogueFaults.map((f) => f.signature)).size).toBe(20);
    for (const a of architectures) {
      expect(
        catalogueFaults.filter((f) => f.family === a.architectureId),
      ).toHaveLength(2);
      for (const f of catalogueFaults.filter(
        (f) => f.family === a.architectureId,
      )) {
        const r = { ...blankReplay(a.architectureId), fault: f.id };
        expect(catalogueSnapshot(a, r, 90)).toEqual(
          catalogueSnapshot(a, importCatalogueReplay(JSON.stringify(r)), 90),
        );
        expect(catalogueSnapshot(a, r, 0).goodputPct).toBe(100);
        if (f.kind === "fabric" || f.kind === "logical")
          expect(catalogueSnapshot(a, r, 180).dieC).toBe(48);
        if (f.kind === "power") {
          expect(catalogueSnapshot(a, r, 180).goodputPct).toBe(100);
          expect(catalogueSnapshot(a, r, 180).reservePct).toBeLessThan(100);
        }
      }
    }
  });
  it("flow precedes thermal rise, local and common loops have appropriate scope, and recovery settles", () => {
    const a = architectureById["CAT-04"],
      r = { ...blankReplay(a.architectureId), fault: "CAT-04-1" };
    expect(catalogueSnapshot(a, r, 8).flowLmin).toBeLessThan(240);
    expect(catalogueSnapshot(a, r, 8).dieC).toBe(48);
    expect(catalogueSnapshot(a, r, 180).dieC).toBeGreaterThan(78);
    expect(catalogueSnapshot(a, r, 180).affected).toHaveLength(27);
    const h = architectureById["CAT-05"];
    expect(
      catalogueSnapshot(
        h,
        { ...blankReplay(h.architectureId), fault: "CAT-05-2" },
        180,
      ).affected,
    ).toHaveLength(1);
    expect(
      catalogueSnapshot(a, { ...r, recoveredAt: 180 }, 500).dieC,
    ).toBeLessThan(49);
  });
  it("SI heat and DC/three-phase equations preserve units; malformed replays are rejected", () => {
    const a = architectureById["CAT-04"];
    const t = catalogueSnapshot(a, blankReplay(a.architectureId), 0);
    expect((t.returnC! - t.supplyC!) * (t.flowLmin! / 60) * 4180).toBeCloseTo(
      t.powerKW * 1000,
      6,
    );
    expect(dcCurrent(24, 48)).toBe(500);
    expect(threePhaseCurrent(24, 400, 0.95)).toBeCloseTo(36.46, 1);
    expect(() =>
      importCatalogueReplay(
        '{"version":2,"family":"CAT-04","fault":"CAT-05-1"}',
      ),
    ).toThrow();
    expect(() => dcCurrent(20, 0)).toThrow();
  });
  it("original concept inventory and IDs are unchanged", () => {
    const rs = inventory("FS_CONCEPT");
    expect(rs).toHaveLength(3266);
    expect(rs[0].id).toBe("FS_CONCEPT/R1/rack");
  });
});
describe("All ten physical models", () => {
  it("comparison concepts resolve to real service assemblies rather than incidental children", () => {
    for (const a of architectures) {
      expect(representativePart(a, "cooling").id).toBe(
        `${a.architectureId}/cooling`,
      );
      expect(representativePart(a, "power").id).toBe(
        `${a.architectureId}/power/1`,
      );
      const model = buildModel(a, options, palette);
      expect(model.owners.has(representativePart(a, "network").id)).toBe(true);
      model.dispose();
    }
  });
  it("illustrative row context never expands a local reference fault across independent copies", () => {
    const a = architectureById["CAT-05"];
    const rack = buildModel(a, options, palette),
      row = buildModel(a, { ...options, view: "row" }, palette);
    expect(row.triangles).toBeGreaterThan(rack.triangles * 2);
    expect(row.owners.get("CAT-05/tray/1")!.bounds.min.x).toBeCloseTo(
      rack.owners.get("CAT-05/tray/1")!.bounds.min.x,
    );
    expect(row.owners.get("CAT-05/tray/1")!.bounds.max.x).toBeCloseTo(
      rack.owners.get("CAT-05/tray/1")!.bounds.max.x,
    );
    row.dispose();
    rack.dispose();
  });
  it("fabric fault highlights resolve to actual physical owner IDs", () => {
    for (const f of catalogueFaults.filter((f) => f.kind === "fabric")) {
      const a = architectureById[f.family],
        asset = buildModel(a, options, palette);
      const t = catalogueSnapshot(
        a,
        { ...blankReplay(a.architectureId), fault: f.id },
        180,
      );
      expect(t.affected.length).toBeGreaterThan(0);
      for (const id of t.affected) expect(asset.owners.has(id), id).toBe(true);
      asset.dispose();
    }
  });
  it("Rubin is an explicit mechanical and electrical generation delta", () => {
    const base = architectureById["CAT-04"],
      a = resolveArchitecture(base, "rubin");
    expect(a.modelFidelityScore).toBeNull();
    expect(a.humanReview).toBeUndefined();
    expect(a.layout.shelves).toBe(4);
    expect(base.layout.shelves).toBe(8);
    expect(a.claims.find((c) => c.name === "DC output")?.value).toBe(54);
    expect(a.components.filter((p) => p.id.includes("/power/"))).toHaveLength(
      4,
    );
    const x = buildModel(base, options, palette),
      y = buildModel(a, options, palette),
      tray = buildModel(a, { ...options, view: "tray" }, palette);
    expect(x.triangles).not.toBe(y.triangles);
    expect(tray.owners.has("CAT-04/cpu/1.2")).toBe(true);
    expect(tray.owners.get("CAT-04/board/1")!.primitives).toBe(2);
    expect(y.owners.get("CAT-04/rack")!.bounds.max.y).toBeLessThan(4.3);
    x.dispose();
    y.dispose();
    tray.dispose();
  });
  it("unique bounds/geometry, finite buffers, exact owner identities, and bounded draw calls", () => {
    const signatures = [];
    for (const a of architectures) {
      const asset = buildModel(a, options, palette);
      const bounds = new Box3().setFromObject(asset.group);
      expect(asset.group.children.length).toBeLessThanOrEqual(16);
      expect(asset.triangles).toBeGreaterThan(1000);
      expect(asset.triangles).toBeLessThan(400000);
      expect(asset.owners.has(`${a.architectureId}/tray/1`)).toBe(true);
      for (const [id] of asset.owners)
        expect(
          a.components.some((p) => p.id === id),
          id,
        ).toBe(true);
      const size = bounds.getSize(new Vector3());
      signatures.push(
        `${size.x.toFixed(3)}:${size.z.toFixed(3)}:${asset.triangles}`,
      );
      asset.group.traverse((o) => {
        if ("geometry" in o)
          expect(
            [...(o as any).geometry.attributes.position.array].every(
              Number.isFinite,
            ),
          ).toBe(true);
      });
      asset.dispose();
    }
    expect(new Set(signatures).size).toBe(10);
  });
  it("front physical tray raycasts resolve stable records in every family", () => {
    for (const a of architectures) {
      const asset = buildModel(a, options, palette);
      asset.group.updateMatrixWorld(true);
      const bounds = asset.owners.get(`${a.architectureId}/tray/1`)!.bounds;
      const c = bounds.getCenter(new Vector3());
      if (a.shape === "cray") c.y += 0.22;
      if (a.shape === "cerebras") c.y += 0.65;
      const hit = new Raycaster(
        new Vector3(c.x, c.y, 10),
        new Vector3(0, 0, -1),
      ).intersectObject(asset.group, true)[0];
      expect(resolveOwner(hit.object, hit.faceIndex), a.familyName).toBe(
        `${a.architectureId}/tray/1`,
      );
      asset.dispose();
    }
  });
  it("deep defining assets remain real meshes and stage filtering changes the assembly", () => {
    for (const a of architectures) {
      const deep = buildModel(
        a,
        { ...options, view: a.shape === "cerebras" ? "chip" : "tray" },
        palette,
      );
      expect(deep.triangles).toBeGreaterThan(500);
      deep.dispose();
      const early = buildModel(a, { ...options, level: 1 }, palette);
      expect([...early.owners.keys()].every((id) => id.endsWith("/rack"))).toBe(
        true,
      );
      early.dispose();
    }
  });
});
