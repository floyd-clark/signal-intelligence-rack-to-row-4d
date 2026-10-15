import { Assembly } from "../../scene/hardware/assembly";
import { acceleratorPackage } from "../../scene/hardware/AcceleratorPackage";
import type { Architecture } from "../types";
import {
  part,
  shell,
  shelf,
  face,
  rearServices,
  type ModelOptions,
} from "./common";
export function rubin(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o);
  shelf(a, d, 0, 0.4, d.width * 0.87, 0.26);
  shelf(a, d, 1, 0.7, d.width * 0.87, 0.26);
  const ys: number[] = [];
  let y = 0.91;
  for (let i = 0; i < 9; i++) {
    y += 0.085;
    ys.push(y);
    face(
      a,
      part(d, `tray/${i + 1}`),
      y,
      d.width * 0.87,
      0.077,
      d.depth,
      4,
      "compute",
      i === 0 ? o.explode : 0,
    );
  }
  for (let i = 0; i < 9; i++) {
    y += 0.085;
    face(
      a,
      part(d, `fabric/${i + 1}`),
      y,
      d.width * 0.87,
      0.077,
      d.depth,
      4,
      "switch",
    );
  }
  for (let i = 9; i < 18; i++) {
    y += 0.085;
    ys.push(y);
    face(
      a,
      part(d, `tray/${i + 1}`),
      y,
      d.width * 0.87,
      0.077,
      d.depth,
      4,
      "compute",
    );
  }
  shelf(a, d, 2, 3.48, d.width * 0.87, 0.26);
  shelf(a, d, 3, 3.78, d.width * 0.87, 0.26);
  rearServices(a, d, ys, o);
  for (let i = 0; i < 2; i++)
    face(
      a,
      part(d, "network"),
      3.98 + i * 0.07,
      d.width * 0.87,
      0.04,
      d.depth,
      12,
      "switch",
    );
  // The hardware guide identifies liquid cooling of the 54V busbar.
  for (const x of [-0.17, 0.17])
    a.pipe(
      part(d, "power/1"),
      "supply",
      [
        [x, 0.35, -d.depth / 2 - 0.17],
        [x, 3.9, -d.depth / 2 - 0.17],
      ],
      0.018,
      6,
    );
}
export function rubinTray(a: Assembly, d: Architecture, o: ModelOptions) {
  const id = part(d, "tray/1");
  a.box(id, "aluminum", [0, -0.12, 0], [6.1, 0.08, 4.5], 0.1);
  for (const x of [-3, 3]) a.box(id, "steel", [x, 0.2, 0], [0.07, 0.7, 4.5]);
  for (let b = 0; b < 2; b++) {
    const x = b ? 1.47 : -1.47;
    a.box(part(d, "board/1"), "pcb", [x, 0, 0], [2.78, 0.07, 4.05], 0.1);
    for (let i = 0; i < 2; i++)
      a.withTransform([x, 0.12, i ? 0.85 : -0.85], [0.68, 0.68, 0.68], () =>
        acceleratorPackage(
          a,
          part(d, `chip/1.${b * 2 + i + 1}`),
          Array(4).fill(part(d, `memory/1.${b * 2 + i + 1}`)),
          part(d, `plate/1.${b * 2 + i + 1}`),
          { cutaway: o.cutaway, explode: o.explode },
        ),
      );
    const cpu = part(d, `cpu/1.${b + 1}`);
    a.box(cpu, "edge", [x, 0.18, 1.7], [0.8, 0.15, 0.65], 0.15);
    for (let m = 0; m < 2; m++)
      a.box(
        part(d, "dimm/1"),
        "ceramic",
        [x + (m ? -0.65 : 0.65), 0.12, 1.55],
        [0.35, 0.08, 0.7],
        0.1,
      );
    a.box(part(d, "nic/1"), "pcbBlue", [x, 0.15, -1.8], [0.9, 0.05, 0.35]);
  }
  a.box(part(d, "bmc/1"), "pcbBlue", [0, 0.13, 1.5], [0.3, 0.06, 0.7], 0.1);
}
