import { Assembly } from "../../scene/hardware/assembly";
import type { Architecture } from "../types";
import {
  shell,
  face,
  shelf,
  rearServices,
  connector,
  part,
  layerMarkers,
  type ModelOptions,
} from "./common";
export function nvl72(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o);
  let y = 0.3;
  const ys: number[] = [];
  const compute = (i: number) => {
    y += 0.093;
    ys.push(y);
    face(
      a,
      part(d, `tray/${i + 1}`),
      y,
      d.width * 0.87,
      0.083,
      d.depth,
      4,
      "compute",
      o.explode && i === 0 ? o.explode * 1.2 : 0,
    );
  };
  for (let i = 0; i < 4; i++) {
    shelf(a, d, i, y);
    y += 0.15;
  }
  for (let i = 0; i < 10; i++) compute(i);
  for (let i = 0; i < 9; i++) {
    y += 0.085;
    face(
      a,
      part(d, `fabric/${i + 1}`),
      y,
      d.width * 0.87,
      0.075,
      d.depth,
      3,
      "switch",
    );
  }
  for (let i = 10; i < 18; i++) compute(i);
  for (let i = 4; i < 8; i++) {
    y += 0.15;
    shelf(a, d, i, y);
  }
  for (let i = 0; i < 2; i++)
    face(
      a,
      part(d, "network"),
      3.89 + i * 0.09,
      d.width * 0.87,
      0.07,
      d.depth,
      12,
      "switch",
    );
  rearServices(a, d, ys, o);
  for (let c = 0; c < 6; c++) {
    const x = -0.52 + c * 0.205;
    a.box(
      part(d, `fabric/${(c % 9) + 1}`),
      "polymer",
      [x, 2.15, -d.depth / 2 - 0.03],
      [0.15, 2.8, 0.13],
      0.12,
    );
    for (let y = 0.8; y < 3.55; y += 0.15)
      a.box(
        part(d, `fabric/${(c % 9) + 1}`),
        "edge",
        [x, y, -d.depth / 2 - 0.11],
        [0.12, 0.035, 0.018],
      );
  }
  layerMarkers(a, d, o, ys);
}
export function helios(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o);
  const ys: number[] = [];
  // Double-wide ORW: broad sleds and a dedicated service/fabric spine.
  for (let i = 0; i < 18; i++) {
    const y = 1.05 + i * 0.16;
    ys.push(y);
    face(
      a,
      part(d, `tray/${i + 1}`),
      y,
      d.width * 0.9,
      0.145,
      d.depth,
      6,
      "compute",
      i === 0 ? o.explode * 1.5 : 0,
    );
    a.box(
      part(d, `tray/${i + 1}`),
      "black",
      [0, y, d.depth / 2 + 0.035],
      [0.055, 0.12, 0.025],
    );
  }
  for (let i = 0; i < 4; i++)
    shelf(a, d, i, 0.28 + i * 0.17, d.width * 0.86, 0.13);
  rearServices(a, d, ys, o);
  for (let i = 0; i < 4; i++) {
    const id = part(d, `fabric/${i + 1}`),
      x = -0.93 + i * 0.62;
    a.box(id, "steel", [x, 2.15, -d.depth / 2 - 0.22], [0.46, 3.25, 0.3], 0.12);
    a.box(
      id,
      "aluminum",
      [x, 2.15, -d.depth / 2 - 0.39],
      [0.42, 3.16, 0.035],
      0.08,
    );
    for (let y = 0.75; y < 3.6; y += 0.15)
      connector(a, id, [x, y, -d.depth / 2 - 0.43], 0.21, 0.085);
    for (const y of [0.65, 3.65])
      a.box(id, "black", [x, y, -d.depth / 2 - 0.45], [0.3, 0.07, 0.09]);
  }
  layerMarkers(a, d, o, ys);
}
export function ironwood(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o);
  const ys: number[] = [];
  for (let i = 0; i < 4; i++)
    shelf(a, d, i, 0.28 + i * 0.17, d.width * 0.87, 0.14);
  for (let i = 0; i < 16; i++) {
    const y = 1.05 + i * 0.179;
    ys.push(y);
    face(
      a,
      part(d, `tray/${i + 1}`),
      y,
      d.width * 0.87,
      0.15,
      d.depth,
      8,
      "compute",
      i === 0 ? o.explode * 1.2 : 0,
    );
    for (let k = 0; k < 4; k++)
      a.box(
        part(d, `chip/${i + 1}.${k + 1}`),
        "ceramic",
        [-0.5 + k * 0.33, y, d.depth / 2 + 0.043],
        [0.13, 0.065, 0.014],
        0.1,
      );
  }
  rearServices(a, d, ys, o);
  const id = part(d, "fabric/ocs"),
    x = d.width / 2 + 0.38;
  a.box(id, "steel", [x, 2.55, -0.45], [0.52, 2.2, 0.65], 0.15);
  a.box(id, "aluminum", [x, 2.55, -0.08], [0.47, 2.07, 0.035]);
  for (let i = 0; i < 16; i++) {
    const y = 1.63 + i * 0.12;
    connector(a, id, [x, y, -0.04], 0.28, 0.065);
    a.pipe(
      id,
      "gold",
      [
        [x, y, -0.05],
        [x + 0.36, y, -0.35],
        [x + 0.36, 3.85, -0.5],
        [d.width * 0.3, 3.85, -d.depth / 2 - 0.3],
      ],
      0.008,
      10,
    );
  }
  for (let i = 0; i < 16; i++)
    for (let k = 0; k < 2; k++)
      a.pipe(
        part(d, "fabric/ici"),
        "polymer",
        [
          [k ? 0.48 : -0.48, ys[i], -d.depth / 2 - 0.2],
          [k ? 0.64 : -0.64, ys[i] + 0.05, -d.depth / 2 - 0.43],
          [k ? 0.64 : -0.64, ys[(i + 1) % 16], -d.depth / 2 - 0.43],
        ],
        0.009,
        8,
      );
  layerMarkers(a, d, o, ys);
}
