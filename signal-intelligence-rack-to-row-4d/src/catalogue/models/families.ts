import { Assembly, type V3 } from "../../scene/hardware/assembly";
import { fan } from "../../scene/hardware/ComputeBoard";
import {
  acceleratorPackage,
  coldPlate,
} from "../../scene/hardware/AcceleratorPackage";
import type { Architecture } from "../types";
import {
  shell,
  face,
  shelf,
  rearServices,
  connector,
  handle,
  part,
  type ModelOptions,
} from "./common";
export function eia(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o);
  const w = d.width;
  for (let i = 0; i < 12; i++) {
    const y = 0.45 + i * 0.27,
      id = part(d, `tray/${i + 1}`);
    face(
      a,
      id,
      y,
      w * 0.85,
      i % 3 === 0 ? 0.22 : 0.14,
      d.depth,
      i % 3 === 0 ? 8 : 2,
      i % 3 === 0 ? "disk" : "compute",
      i === 0 ? o.explode : 0,
    );
    for (let k = 0; k < 2; k++) {
      const x = k ? 0.35 : -0.35;
      a.withTransform(
        [x, y, -d.depth / 2 - 0.05],
        [0.26, 0.26, 0.26],
        () => fan(a, part(d, "cooling"), [0, 0, 0], 0.22),
        [Math.PI / 2, 0, 0],
      );
    }
  }
  for (const x of [-w * 0.4, w * 0.4]) {
    const id = part(d, "power/1");
    a.box(id, "polymer", [x, 2, -d.depth / 2 - 0.12], [0.12, 3.5, 0.1]);
    for (let i = 0; i < 12; i++) {
      connector(a, id, [x, 0.4 + i * 0.27, -d.depth / 2 - 0.2], 0.08, 0.07);
      a.pipe(
        id,
        "polymer",
        [
          [x, 0.4 + i * 0.27, -d.depth / 2 - 0.22],
          [x * 0.7, 0.4 + i * 0.27, -d.depth / 2 - 0.4],
          [x * 0.5, 0.45 + i * 0.27, -d.depth / 2],
        ],
        0.012,
        6,
      );
    }
  }
  face(a, part(d, "network"), 3.8, w * 0.85, 0.1, d.depth, 12, "switch");
  for (let i = 0; i < 4; i++)
    a.box(
      part(d, "rack"),
      "black",
      [0, 3.7 - i * 0.14, d.depth / 2],
      [w * 0.86, 0.1, 0.025],
    );
  if (!o.cutaway) {
    for (let y = 0.25; y < 3.9; y += 0.06)
      for (let x = -w * 0.42; x < w * 0.43; x += 0.085)
        a.box(
          part(d, "rack"),
          "polymer",
          [x, y, d.depth / 2 + 0.1],
          [0.025, 0.015, 0.01],
        );
  }
  if (o.overlay === "Cooling")
    for (let i = 0; i < 6; i++)
      a.pipe(
        part(d, "cooling"),
        "supply",
        [
          [-0.5, 1 + i * 0.4, 1.8],
          [-0.5, 1 + i * 0.4, -1.8],
        ],
        0.015,
        5,
      );
}
export function orv3(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, { ...o, cutaway: true });
  for (let i = 0; i < 2; i++)
    shelf(a, d, i, 0.38 + i * 0.22, d.width * 0.88, 0.2);
  for (let i = 0; i < 10; i++) {
    const y = 1 + i * 0.28,
      id = part(d, `tray/${i + 1}`);
    face(
      a,
      id,
      y,
      d.width * 0.91,
      0.21,
      d.depth,
      3,
      "compute",
      i === 0 ? o.explode : 0,
    );
    a.box(
      id,
      "aluminum",
      [0, y + 0.1, -0.2],
      [d.width * 0.9, 0.02, d.depth * 0.75],
    );
    for (const x of [-d.width * 0.43, d.width * 0.43])
      a.box(id, "edge", [x, y - 0.09, 0], [0.035, 0.04, d.depth * 0.92]);
  }
  const id = part(d, "power/1");
  a.box(id, "copper", [0, 2.1, -d.depth / 2 - 0.08], [0.17, 3.7, 0.045]);
  for (let i = 0; i < 10; i++) {
    const y = 1 + i * 0.28;
    for (const x of [-0.04, 0, 0.04])
      a.box(id, "gold", [x, y, -d.depth / 2 - 0.16], [0.025, 0.09, 0.12]);
    a.box(id, "polymer", [0, y, -d.depth / 2 - 0.24], [0.25, 0.16, 0.05], 0.1);
    a.bolt(id, [0, y + 0.08, -d.depth / 2 - 0.25], 0.025);
  }
  face(a, part(d, "network"), 3.85, d.width * 0.9, 0.12, d.depth, 12, "switch");
  if (o.overlay === "Cooling")
    rearServices(
      a,
      d,
      Array.from({ length: 10 }, (_, i) => 1 + i * 0.28),
      o,
    );
}
export function dgx(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o);
  // Illustrative rack AC distribution, separate from each DGX node's fans/NICs.
  const power = part(d, "power/1");
  for (const x of [-d.width * 0.44, d.width * 0.44]) {
    a.box(
      power,
      "polymer",
      [x, 2.1, -d.depth / 2 + 0.03],
      [0.12, 3.75, 0.1],
      0.1,
    );
    for (let i = 0; i < 4; i++) {
      a.withTransform(
        [x, 0.65 + i * 0.84, -d.depth / 2 - 0.04],
        [1, 1, 1],
        () => connector(a, power, [0, 0, 0], 0.09, 0.12),
        [0, Math.PI, 0],
      );
    }
  }
  for (let i = 0; i < 4; i++) {
    const y = 0.65 + i * 0.84,
      id = part(d, `tray/${i + 1}`),
      pull = i === 0 ? o.explode * 1.4 : 0;
    face(a, id, y, d.width * 0.89, 0.72, d.depth, 8, "disk", pull);
    for (let r = 0; r < 6; r++)
      a.box(
        id,
        "black",
        [-0.5 + r * 0.2, y + 0.21, d.depth / 2 + 0.035],
        [0.12, 0.18, 0.03],
      );
    for (let k = 0; k < 6; k++) {
      const x = -0.5 + k * 0.2;
      a.withTransform(
        [x, y, -d.depth / 2 - 0.08],
        [0.4, 0.4, 0.4],
        () => fan(a, part(d, "cooling"), [0, 0, 0], 0.22),
        [Math.PI / 2, 0, 0],
      );
      connector(
        a,
        part(d, "network"),
        [x, y - 0.25, -d.depth / 2 - 0.08],
        0.1,
        0.09,
      );
    }
    for (let k = 0; k < 4; k++)
      a.pipe(
        part(d, "network"),
        "polymer",
        [
          [-0.35 + k * 0.23, y - 0.15, -d.depth / 2 - 0.13],
          [-0.35 + k * 0.23, y + 0.05, -d.depth / 2 - 0.45],
          [d.width * 0.6, 3.9, -d.depth / 2 - 0.45],
        ],
        0.015,
        10,
      );
  }
  face(a, part(d, "network"), 3.95, d.width * 0.89, 0.1, d.depth, 12, "switch");
}
export function trainium(a: Assembly, d: Architecture, o: ModelOptions) {
  for (let c = 0; c < 3; c++)
    a.withTransform([(c - 1) * 1.52, 0, 0], [1, 1, 1], () => {
      shell(a, d, o, 1.32, d.depth);
      for (let i = 0; i < 4; i++)
        face(
          a,
          part(d, `tray/${c * 4 + i + 1}`),
          0.85 + i * 0.68,
          1.2,
          0.5,
          d.depth,
          6,
          "compute",
          c === 0 && i === 0 ? o.explode : 0,
        );
      shelf(a, d, c, 0.35, 1.2, 0.25);
      face(
        a,
        part(d, `fabric/${c + 1}`),
        3.7,
        1.2,
        0.25,
        d.depth,
        10,
        "switch",
      );
      for (let k = 0; k < 6; k++)
        a.pipe(
          part(d, "network"),
          "polymer",
          [
            [-0.5 + k * 0.18, 3.7, -d.depth / 2 - 0.05],
            [-0.5 + k * 0.18, 4.35, -d.depth / 2 - 0.3],
            [-0.5 + k * 0.18 + (1 - c) * 1.52, 4.65, -d.depth / 2 - 0.3],
          ],
          0.015,
          10,
        );
    });
  a.box(
    part(d, "network"),
    "steel",
    [0, 4.63, -d.depth / 2 - 0.3],
    [4.15, 0.16, 0.32],
    0.12,
  );
}
export function heatExchanger(a: Assembly, d: Architecture, x: number) {
  const id = part(d, "cooling");
  a.box(id, "steel", [x, 1.8, 0], [0.65, 3.4, 1.65], 0.1);
  a.box(id, "aluminum", [x, 2.5, 0.86], [0.52, 1.65, 0.04]);
  for (let y = 1.75; y < 3.3; y += 0.085)
    a.box(id, "edge", [x, y, 0.9], [0.46, 0.025, 0.025]);
  for (const y of [0.65, 1.25]) {
    a.cylinder(id, "steel", [x, y, 0.85], 0.2, 0.3, [Math.PI / 2, 0, 0], 16);
    a.ring(id, "copper", [x, y, 1.02], 0.13, 0.035, [Math.PI / 2, 0, 0]);
    for (let k = 0; k < 8; k++)
      a.box(id, "edge", [x - 0.16 + k * 0.045, y, 0.96], [0.014, 0.26, 0.24]);
  }
  a.box(id, "black", [x, 3.45, 0.86], [0.33, 0.2, 0.04]);
  for (const dx of [-0.18, 0.18])
    a.pipe(
      id,
      dx < 0 ? "supply" : "return",
      [
        [x + dx, 0.4, 0.9],
        [x + dx, 0.4, -0.95],
        [x + dx, 3.8, -0.95],
        [0, 3.8, -1.18],
      ],
      0.035,
      16,
    );
}
export function maia(a: Assembly, d: Architecture, o: ModelOptions) {
  a.withTransform([-0.4, 0, 0], [1, 1, 1], () => {
    shell(a, d, o, 1.5, d.depth);
    for (let i = 0; i < 8; i++)
      face(
        a,
        part(d, `tray/${i + 1}`),
        0.9 + i * 0.38,
        1.35,
        0.3,
        d.depth,
        4,
        "compute",
        i === 0 ? o.explode : 0,
      );
    for (let i = 0; i < 3; i++) shelf(a, d, i, 0.25 + i * 0.18, 1.34, 0.15);
    for (let i = 0; i < 2; i++)
      face(
        a,
        part(d, `fabric/${i + 1}`),
        3.95 - i * 0.12,
        1.35,
        0.1,
        d.depth,
        8,
        "switch",
      );
    rearServices(
      a,
      { ...d, width: 1.5 },
      Array.from({ length: 8 }, (_, i) => 0.9 + i * 0.38),
      o,
    );
  });
  heatExchanger(a, d, 1.2);
}
export function wafer(a: Assembly, id: string, size = 1.9, vertical = false) {
  const build = () => {
    a.box(id, "copper", [0, 0, 0], [size * 1.12, 0.08, size * 1.12], 0.12);
    a.box(id, "ceramic", [0, 0.07, 0], [size * 1.04, 0.06, size * 1.04], 0.08);
    a.box(id, "silicon", [0, 0.12, 0], [size, 0.06, size], 0.1);
    for (let i = 0; i < 18; i++)
      for (let j = 0; j < 18; j++)
        a.box(
          id,
          (i + j) % 9 === 0 ? "gold" : "pcbBlue",
          [
            -size * 0.47 + i * size * 0.055,
            0.156,
            -size * 0.47 + j * size * 0.055,
          ],
          [size * 0.044, 0.003, size * 0.044],
        );
    for (const x of [-size * 0.53, size * 0.53])
      for (const z of [-size * 0.53, size * 0.53])
        a.bolt(id, [x, 0.12, z], size * 0.023);
    for (let i = 0; i < 10; i++)
      a.box(
        id,
        "gold",
        [-size * 0.46 + i * size * 0.1, 0.07, size * 0.55],
        [size * 0.06, 0.04, size * 0.12],
      );
  };
  if (vertical)
    a.withTransform([0, 0, 0], [1, 1, 1], build, [Math.PI / 2, 0, 0]);
  else build();
}
export function cerebras(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, { ...o, cutaway: true });
  for (let i = 0; i < 3; i++) {
    const x = -0.65 + i * 0.65,
      id = part(d, `tray/${i + 1}`),
      pull = i === 0 ? o.explode : 0;
    a.box(id, "steel", [x, 2.15, pull], [0.59, 3.55, d.depth * 0.86], 0.12);
    a.box(
      id,
      "aluminum",
      [x, 2.15, d.depth / 2 + pull],
      [0.56, 3.47, 0.045],
      0.1,
    );
    for (const y of [0.55, 3.7])
      handle(a, id, x, y, d.depth / 2 + 0.08 + pull, 0.35, 0.05);
    if (o.cutaway)
      a.withTransform([x, 2.15, d.depth / 2 + 0.12 + pull], [1, 1, 1], () =>
        wafer(a, part(d, `chip/${i + 1}.1`), 0.45, true),
      );
    else
      for (let y = 0.8; y < 3.55; y += 0.09)
        a.box(
          id,
          "black",
          [x, y, d.depth / 2 + 0.03 + pull],
          [0.47, 0.03, 0.014],
        );
    for (const y of [0.75, 3.55]) {
      connector(a, part(d, "network"), [x, y, -d.depth / 2 - 0.06], 0.3, 0.14);
      a.pipe(
        part(d, "cooling"),
        "copper",
        [
          [x - 0.2, y, -d.depth / 2 - 0.1],
          [x - 0.2, y, -d.depth / 2 - 0.3],
          [x - 0.2, 4.05, -d.depth / 2 - 0.3],
        ],
        0.025,
        8,
      );
    }
  }
  for (let i = 0; i < 3; i++)
    shelf(a, d, i, 0.28 + i * 0.15, d.width * 0.87, 0.12);
}
export function cray(a: Assembly, d: Architecture, o: ModelOptions) {
  shell(a, d, o, 2.1, d.depth);
  if (!o.cutaway)
    for (const x of [-0.52, 0.52]) {
      const id = part(d, "rack");
      a.box(
        id,
        "polymer",
        [x, 2.12, d.depth / 2 + 0.13],
        [1.01, 3.92, 0.07],
        0.08,
      );
      for (const y of [0.35, 1.25, 2.35, 3.8])
        a.box(id, "steel", [x, y, d.depth / 2 + 0.18], [0.95, 0.025, 0.025]);
      handle(
        a,
        id,
        x + (x < 0 ? 0.38 : -0.38),
        2.1,
        d.depth / 2 + 0.19,
        0.07,
        0.18,
      );
      for (const y of [0.65, 3.6])
        a.box(
          id,
          "edge",
          [x + (x < 0 ? -0.48 : 0.48), y, d.depth / 2 + 0.18],
          [0.04, 0.14, 0.04],
          0.1,
        );
    }
  for (let row = 0; row < 4; row++)
    for (let col = 0; col < 2; col++) {
      const x = col ? 0.52 : -0.52,
        y = 0.75 + row * 0.83;
      for (let blade = 0; blade < 8; blade++) {
        const id = part(d, `tray/${(row * 2 + col) * 8 + blade + 1}`),
          bx = x - 0.4 + blade * 0.115,
          pull = row === 0 && col === 0 && blade === 0 ? o.explode : 0;
        a.box(id, "steel", [bx, y, pull], [0.095, 0.69, d.depth * 0.9], 0.08);
        a.box(
          id,
          "aluminum",
          [bx, y, d.depth / 2 + pull],
          [0.09, 0.66, 0.03],
          0.1,
        );
        a.box(
          id,
          "black",
          [bx, y - 0.24, d.depth / 2 + 0.05 + pull],
          [0.07, 0.09, 0.05],
        );
        for (const yy of [-0.2, 0.2])
          a.cylinder(
            id,
            "edge",
            [bx, y + yy, d.depth / 2 + 0.055 + pull],
            0.022,
            0.04,
            [Math.PI / 2, 0, 0],
            8,
          );
      }
      if (!o.cutaway)
        a.box(
          part(d, "rack"),
          "polymer",
          [x, y, d.depth / 2 + 0.08],
          [0.96, 0.74, 0.045],
          0.1,
        );
      face(
        a,
        part(d, `fabric/${row * 2 + col + 1}`),
        y,
        0.94,
        0.15,
        d.depth,
        8,
        "switch",
      );
    }
  for (let i = 0; i < 4; i++) shelf(a, d, i, 0.23 + i * 0.92, 1.92, 0.14);
  rearServices(
    a,
    { ...d, width: 2.1 },
    Array.from({ length: 8 }, (_, i) => 0.7 + i * 0.4),
    o,
  );
  heatExchanger(a, d, 1.5);
}
export function dgxTray(a: Assembly, d: Architecture, o: ModelOptions) {
  const id = part(d, "tray/1");
  a.box(id, "aluminum", [0, -0.12, 0], [6.2, 0.08, 4.5], 0.1);
  for (const x of [-3, 3]) a.box(id, "steel", [x, 0.3, 0], [0.08, 0.85, 4.5]);
  a.box(part(d, "board/1"), "pcb", [0, 0, 0], [5.8, 0.06, 4.15], 0.1);
  for (let i = 0; i < 8; i++)
    a.withTransform(
      [((i % 4) - 1.5) * 1.4, 0.13, Math.floor(i / 4) ? -0.9 : 0.9],
      [0.48, 0.48, 0.48],
      () =>
        acceleratorPackage(
          a,
          part(d, `chip/1.${i + 1}`),
          Array(4).fill(part(d, `memory/1.${i + 1}`)),
          part(d, `plate/1.${i + 1}`),
          { cutaway: o.cutaway, explode: o.explode },
        ),
    );
  for (let i = 0; i < 6; i++)
    fan(a, part(d, "cooling"), [-2.5 + i, 0.15, -1.82], 0.28);
  a.withTransform([0, 0, 2.21], [1, 1, 1], () =>
    face(a, id, 0.3, 6.1, 0.75, 0.08, 8, "disk"),
  );
}
export function blade(a: Assembly, d: Architecture, o: ModelOptions) {
  const id = part(d, "tray/1");
  a.box(id, "aluminum", [0, 0, 0], [3.5, 0.08, 4.6], 0.1);
  a.box(part(d, "board/1"), "pcb", [0, 0.07, 0], [3.25, 0.05, 4.3], 0.1);
  for (let i = 0; i < 4; i++) {
    const p: V3 = [i % 2 ? 0.8 : -0.8, 0.18, Math.floor(i / 2) ? -1 : 1];
    a.box(part(d, "chip/1.1"), "ceramic", p, [0.9, 0.12, 0.9], 0.1);
    coldPlate(a, part(d, "cooling"), [p[0], 0.3, p[2]], false, o.explode * 0.3);
  }
  for (const x of [-1.4, 1.4])
    a.pipe(
      part(d, "cooling"),
      x < 0 ? "supply" : "return",
      [
        [x, 0.4, -2.4],
        [x, 0.4, 0],
        [x, 0.4, 2.1],
      ],
      0.05,
      12,
    );
  for (let i = 0; i < 8; i++)
    connector(a, part(d, "network"), [-1.3 + i * 0.37, 0.25, 2.35], 0.22, 0.16);
}
export function enterpriseTray(a: Assembly, d: Architecture, o: ModelOptions) {
  const id = part(d, "tray/1");
  a.box(id, "aluminum", [0, -0.1, 0], [5.8, 0.08, 4.2], 0.1);
  for (const x of [-2.85, 2.85])
    a.box(id, "steel", [x, 0.15, 0], [0.08, 0.5, 4.2]);
  a.box(part(d, "board/1"), "pcb", [0, 0, 0], [5.5, 0.06, 3.8], 0.1);
  for (let c = 0; c < 2; c++) {
    const x = c ? 1.2 : -1.2,
      cpu = part(d, `chip/1.${c + 1}`);
    a.box(cpu, "polymer", [x, 0.1, 0], [0.9, 0.08, 1], 0.1);
    a.box(cpu, "edge", [x, 0.2, 0], [0.78, 0.14, 0.84], 0.1);
    if (!o.cutaway)
      for (let k = 0; k < 12; k++)
        a.box(
          cpu,
          "aluminum",
          [x - 0.36 + k * 0.065, 0.38, 0],
          [0.025, 0.24, 0.9],
        );
    for (let m = 0; m < 4; m++) {
      a.box(
        part(d, `memory/1.${c + 1}`),
        "pcb",
        [x - 0.4 + m * 0.27, 0.22, 1.2],
        [0.04, 0.4, 0.75],
      );
      for (let n = 0; n < 4; n++)
        a.box(
          part(d, `memory/1.${c + 1}`),
          "black",
          [x - 0.37 + m * 0.27, 0.24, 0.94 + n * 0.17],
          [0.025, 0.2, 0.1],
        );
    }
  }
  for (let i = 0; i < 4; i++)
    fan(a, part(d, "cooling"), [-1.65 + i * 1.1, 0.15, -1.4], 0.32);
  for (let i = 0; i < 8; i++) {
    const x = -2.3 + i * 0.65;
    a.box(part(d, "nvme/1"), "steel", [x, 0.15, 1.8], [0.5, 0.25, 0.55], 0.1);
    handle(a, id, x, 0.15, 2.15, 0.35, 0.06);
  }
}
