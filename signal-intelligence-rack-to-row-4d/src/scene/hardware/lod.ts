import type { ComponentRecord } from "../../data/model";
export interface Slot {
  record: ComponentRecord;
  y: number;
  height: number;
  role: "compute" | "network" | "storage" | "switch" | "power" | "management";
}
export function rackSlots(
  records: ComponentRecord[],
  rack: number,
  racks: number,
): Slot[] {
  const prefix = `RACK-${String(rack).padStart(2, "0")}`;
  const root = records.find(
    (r) => r.type === "rack" && r.physicalLocation.rack === prefix,
  )!;
  const trays = records.filter(
    (r) => r.parentId === root.id && r.type === "tray",
  );
  const power = records.filter(
    (r) => r.parentId === root.id && r.type === "power-shelf",
  );
  const switches = records.filter(
    (r) =>
      r.parentId === root.id &&
      ["scale-up-switch", "switch-asic"].includes(r.type),
  );
  const role =
    rack <= racks - 2 ? "compute" : rack === racks - 1 ? "network" : "storage";
  const isNV =
    root.vendorProfile === "NVIDIA_GB200_NVL72_REFERENCE" && role === "compute";
  const ordered = isNV
    ? [
        ...power.slice(0, 4),
        ...trays.slice(0, 10),
        ...switches,
        ...trays.slice(10),
        ...power.slice(4),
      ]
    : [...power, ...trays, ...switches];
  const pitch = isNV ? 0.101 : 3.5 / (ordered.length + 1);
  return ordered.map((record, i) => ({
    record,
    y: 0.34 + i * pitch,
    height: pitch * 0.87,
    role:
      record.type === "power-shelf"
        ? "power"
        : record.type === "tray"
          ? role
          : "switch",
  }));
}
export const DESIGN_SPACE = {
  rackWidth: 1.44,
  rackDepth: 2.24,
  rackHeight: 4.2,
  front: 1.12,
  rear: -1.12,
  RU: 0.101,
  units:
    "illustrative scene units; approximately 0.45 m per unit, not certified dimensions",
};
