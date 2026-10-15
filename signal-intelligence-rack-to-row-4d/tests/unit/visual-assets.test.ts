import { describe, it, expect } from "vitest";
import { MeshStandardMaterial, Raycaster, Vector3, Mesh } from "three";
import { Assembly, resolveOwner } from "../../src/scene/hardware/assembly";
import { acceleratorPackage } from "../../src/scene/hardware/AcceleratorPackage";
import { MATERIAL_KEYS } from "../../src/scene/hardware/materials";
import { inventory } from "../../src/data/model";
import { rackSlots, DESIGN_SPACE } from "../../src/scene/hardware/lod";
import { utilityRoutes } from "../../src/scene/hardware/utilityRoutes";
import { computeTray } from "../../src/scene/hardware/ComputeTray";
import { useStore } from "../../src/app/store";
const palette = Object.fromEntries(
  MATERIAL_KEYS.map((k) => [k, new MeshStandardMaterial()]),
);
describe("v2 physical assets and semantic picking", () => {
  it("HBM is layered package geometry and merged-face picking preserves ownership", () => {
    const a = new Assembly();
    acceleratorPackage(a, "gpu", ["h0", "h1", "h2", "h3"], "plate", {
      cutaway: true,
      explode: 0,
    });
    expect(a.owners.get("h0")!.primitives).toBeGreaterThan(80);
    const asset = a.finish(palette);
    asset.group.updateMatrixWorld(true);
    const ray = new Raycaster(
      new Vector3(-0.65, 0.9, 0.37),
      new Vector3(0, -1, 0),
    );
    const hit = ray.intersectObject(asset.group, true)[0];
    expect(resolveOwner(hit.object, hit.faceIndex)).toBe("h0");
    expect(asset.group.children.length).toBeLessThan(16);
    expect(asset.triangles).toBeGreaterThan(1000);
    for (const o of asset.group.children as Mesh[])
      expect(
        [...o.geometry.attributes.position.array].every(Number.isFinite),
      ).toBe(true);
    asset.dispose();
  });
  it("populated tray keeps independent GPU, HBM, NIC, VRM and NVMe record owners", () => {
    const rs = inventory("FS_CONCEPT");
    const tray = rs.find((r) => r.type === "tray")!;
    const a = new Assembly();
    computeTray(a, rs, tray, {
      cutaway: true,
      explode: 0,
      level: 12,
      quality: "Balanced",
    });
    for (const type of [
      "board",
      "accelerator",
      "hbm",
      "nic",
      "vrm",
      "nvme",
      "fan",
      "quick-disconnect",
    ]) {
      const rec = rs.find((r) => r.type === type)!;
      expect(a.owners.has(rec.id), type).toBe(true);
    }
    const asset = a.finish(palette);
    expect(asset.group.children.length).toBeLessThan(18);
    asset.dispose();
  });
  it("reference rack slots fit without overlap while retaining all major counts", () => {
    const rs = inventory("NVIDIA_GB200_NVL72_REFERENCE");
    const slots = rackSlots(rs, 1, 8);
    expect(slots).toHaveLength(35);
    expect(slots.filter((s) => s.role === "compute")).toHaveLength(18);
    expect(slots.filter((s) => s.role === "switch")).toHaveLength(9);
    expect(slots.filter((s) => s.role === "power")).toHaveLength(8);
    for (let i = 1; i < slots.length; i++)
      expect(slots[i].y - slots[i].height / 2).toBeGreaterThan(
        slots[i - 1].y + slots[i - 1].height / 2,
      );
    expect(Math.max(...slots.map((s) => s.y + s.height / 2))).toBeLessThan(
      DESIGN_SPACE.rackHeight,
    );
  });
  it("physical coolant branches use the existing functional dependency set and meet manifold endpoints", () => {
    const rs = inventory("FS_CONCEPT");
    const routes = utilityRoutes(rs, 8, true);
    expect(routes).toHaveLength(12);
    expect([...new Set(routes.map((r) => r.target))]).toEqual(
      Array.from({ length: 6 }, (_, i) => `FS_CONCEPT/R${i + 1}/rack`),
    );
    for (const r of routes) {
      expect(r.points.at(-1)![1]).toBe(4);
      expect(r.points.at(-1)![2]).toBe(-1.48);
      expect(r.points[0][2]).toBe(r.material === "supply" ? -1.4 : -1.6);
    }
    expect(utilityRoutes(rs, 8, false, 8)).toEqual([]);
  });
  it("Back restores selection and scope, rather than just changing a breadcrumb", () => {
    useStore.getState().changeProfile("FS_CONCEPT");
    const s = useStore.getState();
    s.set({
      selected: "FS_CONCEPT/R1/accelerator-1.1",
      focus: "FS_CONCEPT/R1/board-1",
    });
    s.drill("FS_CONCEPT/R1/hbm-1.1.1");
    useStore.getState().back();
    expect(useStore.getState().focus).toBe("FS_CONCEPT/R1/board-1");
    expect(useStore.getState().selected).toBe("FS_CONCEPT/R1/accelerator-1.1");
  });
});
