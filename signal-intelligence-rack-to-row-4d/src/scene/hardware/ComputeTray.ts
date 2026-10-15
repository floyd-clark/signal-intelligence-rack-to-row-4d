import { Assembly, type V3 } from "./assembly";
import { board } from "./ComputeBoard";
import type { ComponentRecord } from "../../data/model";
export function port(a: Assembly, id: string, p: V3, w = 0.3, h = 0.17) {
  a.box(id, "aluminum", p, [w, h, 0.16], 0.08);
  a.box(id, "black", [p[0], p[1], p[2] + 0.09], [w * 0.8, h * 0.7, 0.018]);
  a.box(
    id,
    "gold",
    [p[0], p[1] - h * 0.18, p[2] + 0.103],
    [w * 0.55, 0.025, 0.006],
  );
}
export function trayChassis(a: Assembly, id: string) {
  a.box(id, "aluminum", [0, -0.15, 0], [6.05, 0.075, 4.5], 0.08);
  for (const x of [-3, 3]) {
    a.box(id, "aluminum", [x, 0.15, 0], [0.07, 0.58, 4.5]);
    a.box(id, "steel", [x + 0.07 * Math.sign(x), -0.06, 0], [0.07, 0.12, 4.62]);
    for (let z = -1.8; z < 2; z += 0.6) a.bolt(id, [x, 0.46, z], 0.035);
  }
  a.box(id, "steel", [0, 0.15, 2.23], [6.05, 0.58, 0.075], 0.08);
  a.box(id, "aluminum", [0, 0.1, -2.23], [6.05, 0.47, 0.05]);
  for (const x of [-2.83, 2.83]) {
    a.box(id, "edge", [x, 0.14, 2.32], [0.17, 0.55, 0.07], 0.1);
    a.pipe(
      id,
      "aluminum",
      [
        [x - 0.1, 0.03, 2.4],
        [x - 0.1, 0.34, 2.62],
        [x + 0.1, 0.34, 2.62],
        [x + 0.1, 0.03, 2.4],
      ],
      0.035,
    );
    a.box(id, "supply", [x, 0.03, 2.43], [0.14, 0.13, 0.035], 0.1);
  }
  for (let i = 0; i < 22; i++)
    for (let j = 0; j < 3; j++)
      a.box(
        id,
        "black",
        [-2.4 + i * 0.07, -0.03 + j * 0.09, 2.276],
        [0.032, 0.045, 0.008],
      );
  a.box(id, "label", [-1, 0.31, 2.28], [1, 0.045, 0.009]);
  for (const x of [-2.3, 2.3]) a.bolt(id, [x, 0.43, 1.8], 0.045);
}
export function computeTray(
  a: Assembly,
  records: ComponentRecord[],
  tray: ComponentRecord,
  opts: { cutaway: boolean; explode: number; level: number; quality: string },
) {
  trayChassis(a, tray.id);
  const b = records.find((r) => r.parentId === tray.id && r.type === "board");
  if (b && opts.level >= 5)
    a.withTransform([0, -0.04, 0], [1, 1, 1], () => board(a, records, b, opts));
  const nic =
    records.find((r) => r.parentId === b?.id && r.type === "nic")?.id ||
    tray.id;
  for (let i = 0; i < 4; i++)
    port(a, nic, [-0.7 + i * 0.54, 0.16, 2.28], 0.39, 0.2);
  const bmc =
    records.find((r) => r.parentId === b?.id && r.type === "bmc")?.id ||
    tray.id;
  port(a, bmc, [1.8, 0.16, 2.29], 0.25, 0.19);
  for (let i = 0; i < 2; i++)
    port(a, bmc, [2.13 + i * 0.2, 0.14, 2.29], 0.15, 0.075);
  a.box(tray.id, "led", [-1.6, 0.3, 2.29], [0.025, 0.025, 0.014]);
  if (!opts.cutaway)
    a.box(tray.id, "steel", [0, 0.49, 0], [5.9, 0.045, 4.35], 0.1);
  a.owners.get(tray.id)!.kind =
    "Serviceable sheet-metal compute sled: floor, rails, lips, handles, latches, face perforations and rear interface";
}
