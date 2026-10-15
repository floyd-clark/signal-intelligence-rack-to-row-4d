import { materials } from "./materials";
import { useMemo } from "react";
import { useStore } from "../../app/store";
import type { ComponentRecord } from "../../data/model";
import { Assembly } from "./assembly";
import { HardwareRendered } from "./HardwareRendered";
import { cduCabinet } from "./CoolantLoop";
import { utilityRoutes } from "./utilityRoutes";
export function RowInfrastructure({ records }: { records: ComponentRecord[] }) {
  const s = useStore();
  const asset = useMemo(() => {
    const a = new Assembly();
    const row = s.view === "row";
    const left = row ? -(s.racks - 1) * 0.95 - 2.1 : -2.1;
    const right = row ? (s.racks - 1) * 0.95 + 0.7 : 0.7;
    const ids = Object.fromEntries(
      records
        .filter((r) => r.physicalLocation.rack === "SHARED")
        .map((r) => [r.type, r.id]),
    );
    if (s.showCoolant && s.level >= 4 && (row || s.rack <= s.racks - 2)) {
      cduCabinet(a, ids, [left, 0, -0.7], s.cutaway);
      const routes = utilityRoutes(records, s.racks, row, s.rack);
      for (const material of ["supply", "return"]) {
        const matching = routes.filter((r) => r.material === material);
        const furthest = matching.at(-1);
        if (furthest)
          a.pipe(
            furthest.source,
            material,
            furthest.points,
            furthest.radius,
            24,
          );
        for (const r of matching.slice(0, -1))
          a.pipe(r.source, material, r.points.slice(-2), r.radius, 8);
      }
      for (let x = left + 0.65; x < right; x += 1.9) {
        a.box(ids.cdu, "steel", [x, 4.78, -2.0], [0.06, 0.08, 0.5]);
        a.box(ids.cdu, "steel", [x, 4.95, -2], [0.04, 0.4, 0.04]);
      }
    }
    if (s.showPower && s.level >= 2) {
      const id = ids["row-pdu"];
      a.box(id, "steel", [left - 0.25, 1.4, 1.3], [0.8, 2.65, 0.58], 0.1);
      a.box(id, "aluminum", [left - 0.25, 1.5, 1.61], [0.68, 2.33, 0.025]);
      for (let i = 0; i < 12; i++)
        a.box(
          id,
          "black",
          [left - 0.25, 0.48 + i * 0.16, 1.64],
          [0.12, 0.08, 0.035],
        );
      a.pipe(
        id,
        "black",
        [
          [left - 0.25, 2.8, 1.3],
          [left - 0.25, 5.2, 0.1],
          [right, 5.2, 0.1],
        ],
        0.065,
      );
      a.box(
        id,
        "steel",
        [(left + right) / 2, 5.2, 0.1],
        [right - left, 0.16, 0.23],
      );
      for (let i = 0; i < (row ? s.racks : 1); i++) {
        const x = row ? (i - (s.racks - 1) / 2) * 1.9 : 0;
        a.pipe(
          id,
          "black",
          [
            [x + 0.3, 5.14, 0.1],
            [x + 0.3, 4.58, 0.1],
            [x + 0.3, 4.35, -1.1],
            [x + 0.3, 4.2, -0.7],
          ],
          0.028,
        );
      }
    }
    if (s.showNetwork && s.level >= 3) {
      const id = records.find((r) => r.type === "cable-tray")?.id || ids.cdu;
      for (const z of [0.55, 1.05])
        a.box(
          id,
          "aluminum",
          [(left + right) / 2, 5.65, z],
          [right - left, 0.075, 0.045],
        );
      for (let x = left; x < right; x += 0.27)
        a.box(id, "steel", [x, 5.61, 0.8], [0.022, 0.035, 0.52]);
      for (let i = 0; i < (row ? s.racks : 1); i++) {
        const x = row ? (i - (s.racks - 1) / 2) * 1.9 : 0;
        for (const dx of [-0.03, 0.03])
          a.pipe(
            id,
            "polymer",
            [
              [x - 0.63 + dx, 4.48, 1.15],
              [x - 0.63 + dx, 5.3, 1.15],
              [x - 0.63 + dx, 5.62, 0.8],
              [left, 5.62, 0.8],
            ],
            0.009,
            15,
          );
      }
    }
    const floor = ids.floor;
    for (const z of [2.5, 4.1, -2.8, -4.4])
      a.box(
        floor,
        "aluminum",
        [(left + right) / 2, 0.006, z],
        [right - left, 0.006, 0.018],
      );
    for (let x = Math.floor(left); x < right + 1; x++)
      for (let z = -5; z < 6; z++)
        a.box(floor, "steel", [x, 0.004, z], [0.008, 0.005, 1]);
    a.box(
      floor,
      "polymer",
      [(left + right) / 2, 0.002, 3.3],
      [right - left, 0.003, 1.6],
    );
    return a.finish(materials(s.quality));
  }, [
    records,
    s.view,
    s.racks,
    s.showCoolant,
    s.showPower,
    s.showNetwork,
    s.cutaway,
    s.level,
    s.rack,
    s.quality,
  ]);
  return <HardwareRendered asset={asset} />;
}
