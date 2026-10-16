import { describe, it, expect } from "vitest";
import { BoxGeometry, Group, Mesh, MeshStandardMaterial } from "three";
import { architectures, architectureById } from "../../src/catalogue/registry";
import {
  intelligenceFor,
  downstreamParts,
  partType,
  traceFor,
  layerMatches,
  systemLayers,
} from "../../src/catalogue/workbench";
import { blankReplay } from "../../src/catalogue/scenarios/engine";
import { buildModel } from "../../src/catalogue/models";
import { MATERIAL_KEYS } from "../../src/scene/hardware/materials";
import { importedOwners } from "../../src/import/ownership";
const palette = Object.fromEntries(
  MATERIAL_KEYS.map((k) => [k, new MeshStandardMaterial()]),
);
const options = {
  view: "tray" as const,
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
describe("Converged 4D architecture adapters", () => {
  it("every catalogue part has actionable intelligence and a bounded physical dependency scope", () => {
    for (const d of architectures)
      for (const p of d.components) {
        const card = intelligenceFor(d, p);
        expect(card.shortDescription).toContain(p.name);
        expect(card.validationTests.length).toBeGreaterThan(0);
        expect(card.evidenceToCollect.length).toBeGreaterThan(0);
        expect(card.applicabilityNotes).toContain(d.disclosureBanner);
        expect(
          downstreamParts(d, p).every((id) =>
            d.components.some((p) => p.id === id),
          ),
        ).toBe(true);
      }
  });
  it("shared knowledge does not substitute NVIDIA switch principles or external HBM for other fabrics/wafer SRAM", () => {
    expect(
      partType(
        architectureById["CAT-05"],
        architectureById["CAT-05"].components.find((p) =>
          p.id.includes("/fabric/"),
        )!,
      ),
    ).toBe("scale-up");
    const wafer = architectureById["CAT-09"];
    expect(
      partType(
        wafer,
        wafer.components.find((p) => p.concept === "memory")!,
      ),
    ).toBe("sram");
  });
  it("air-only runtime traces and semantic layers never invent a liquid loop", () => {
    expect(systemLayers).toHaveLength(8);
    for (const d of architectures) {
      expect(
        traceFor(d, blankReplay(d.architectureId), "goodputPct"),
      ).toHaveLength(61);
      if (d.cooling === "air") {
        expect(traceFor(d, undefined, "flowLmin")).toBeNull();
        expect(
          d.components.some((p) => layerMatches(d, p, "Liquid Cooling")),
        ).toBe(false);
      }
    }
  });
  it("all ten dedicated carrier detail builders own the selected second carrier", () => {
    for (const d of architectures) {
      const a = buildModel(
        d,
        { ...options, selected: `${d.architectureId}/tray/2` },
        palette,
      );
      expect(a.owners.has(`${d.architectureId}/tray/2`)).toBe(true);
      expect(
        [...a.owners.keys()].filter((id) =>
          /\/(tray|board|chip|memory)\/1(?:\.|$)/.test(id),
        ),
      ).toEqual([]);
      expect(
        [...a.owners.keys()].every((id) =>
          d.components.some((p) => p.id === id),
        ),
      ).toBe(true);
      a.dispose();
    }
  });
  it("system layers emphasize real owned hardware without adding schematic pipes", () => {
    for (const d of architectures) {
      const a = buildModel(d, { ...options, view: "rack" }, palette),
        b = buildModel(
          d,
          { ...options, view: "rack", overlay: "Power" },
          palette,
        );
      expect(b.triangles).toBe(a.triangles);
      expect([...b.owners.keys()]).toEqual([...a.owners.keys()]);
      a.dispose();
      b.dispose();
    }
  });
  it("import ownership applies normalization and user transforms while honoring assembly levels", () => {
    const object = new Group();
    const mesh = new Mesh(new BoxGeometry(2, 2, 2), new MeshStandardMaterial());
    mesh.name = "rack";
    object.add(mesh);
    object.position.set(0, 2, 0);
    const asset = { object, names: ["rack"], bounds: [], name: "owned.glb" };
    const binding = {
      version: 1 as const,
      assetName: asset.name,
      attribution: "QA",
      license: "Original",
      scale: 2,
      rotation: 90,
      xray: false,
      meshes: { rack: "CAT-04/tray/2" },
    };
    expect(importedOwners(asset, binding, { "CAT-04/tray/2": 3 }, 2).size).toBe(
      0,
    );
    const bounds = importedOwners(
      asset,
      binding,
      { "CAT-04/tray/2": 3 },
      12,
    ).get("CAT-04/tray/2")!.bounds;
    bounds.min
      .toArray()
      .forEach((v, i) => expect(v).toBeCloseTo([-2, 2, -2][i], 10));
    bounds.max
      .toArray()
      .forEach((v, i) => expect(v).toBeCloseTo([2, 6, 2][i], 10));
    mesh.geometry.dispose();
    (mesh.material as MeshStandardMaterial).dispose();
  });
});
import { useCatalogue, emptyInvestigation } from "../../src/catalogue/store";
it("reinjecting the same family starts fresh evidence and preserves other-family investigations", () => {
  const a = {
    ...emptyInvestigation("CAT-04-1:0:42"),
    evidence: ["old check"],
    decision: "old release",
  };
  const b = {
    ...emptyInvestigation("CAT-05-1:0:42"),
    evidence: ["peer check"],
  };
  useCatalogue.setState({
    time: 0,
    investigations: { "CAT-04/nvl72": a, "CAT-05/helios": b },
  });
  useCatalogue.getState().inject("CAT-04", "CAT-04-1");
  expect(
    useCatalogue.getState().investigations["CAT-04/nvl72"].evidence,
  ).toEqual([]);
  expect(
    useCatalogue.getState().investigations["CAT-05/helios"].evidence,
  ).toEqual(["peer check"]);
});
