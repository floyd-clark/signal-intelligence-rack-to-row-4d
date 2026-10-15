import type { ComponentRecord } from "../../data/model";
import { graph } from "../../graphs/dependencies";
import type { V3 } from "./assembly";
export interface UtilityRoute {
  source: string;
  target: string;
  kind: "coolant" | "power" | "network";
  points: V3[];
  radius: number;
  material: string;
}
export function utilityRoutes(
  records: ComponentRecord[],
  racks: number,
  row: boolean,
  rack = 1,
): UtilityRoute[] {
  const pump = records.find((r) => r.type === "pump")!.id;
  const source = records.find((r) => r.type === "cdu")!.id;
  const edges = graph(records).filter(
    (e) => e.from === pump && e.kind === "coolant",
  );
  const routes: UtilityRoute[] = [];
  const left = row ? -(racks - 1) * 0.95 - 2.1 : -2.1;
  for (const e of edges) {
    const n = Number(e.to.match(/\/R(\d+)\//)![1]);
    if (!row && n !== rack) continue;
    const x = row ? (n - 1 - (racks - 1) / 2) * 1.9 : 0;
    for (const [dx, y, z, material] of [
      [-0.62, 4.65, -1.9, "supply"],
      [0.62, 4.42, -2.1, "return"],
    ] as const)
      routes.push({
        source: pump,
        target: e.to,
        kind: "coolant",
        points: [
          [left + 0.58, 2.8, material === "supply" ? -1.4 : -1.6],
          [left + 0.58, 3.2, z],
          [left + 0.58, y, z],
          [x + dx, y, z],
          [x + dx, 4.0, -1.48],
        ],
        radius: 0.038,
        material,
      });
  }
  return routes;
}
