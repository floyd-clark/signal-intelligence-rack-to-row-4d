import { Assembly } from "./assembly";
import { port } from "./ComputeTray";
export function deviceFace(
  a: Assembly,
  id: string,
  y: number,
  h: number,
  role: string,
  detail: boolean,
) {
  a.box(id, "steel", [0, y, 0], [1.23, h, 2.01], 0.1);
  a.box(
    id,
    role === "compute" ? "aluminum" : "steel",
    [0, y, 1.02],
    [1.24, h * 0.88, 0.035],
    0.1,
  );
  for (const x of [-0.58, 0.58]) {
    a.box(id, "polymer", [x, y, 1.058], [0.065, h * 0.72, 0.04], 0.15);
    a.pipe(
      id,
      "edge",
      [
        [x - 0.013, y - h * 0.28, 1.08],
        [x - 0.013, y + h * 0.28, 1.12],
        [x + 0.013, y + h * 0.28, 1.12],
        [x + 0.013, y - h * 0.28, 1.08],
      ],
      0.006,
      5,
    );
    a.box(id, "supply", [x, y - h * 0.23, 1.12], [0.04, 0.018, 0.008]);
  }
  if (role === "storage") {
    for (let i = 0; i < 12; i++) {
      const x = -0.49 + i * 0.089;
      a.box(id, "polymer", [x, y, 1.055], [0.074, h * 0.72, 0.035], 0.1);
      a.box(id, "label", [x, y + h * 0.16, 1.079], [0.045, 0.012, 0.002]);
      a.box(id, "supply", [x, y - h * 0.2, 1.08], [0.028, 0.01, 0.003]);
    }
  } else if (role === "switch") {
    for (let i = 0; i < 3; i++)
      port(a, id, [0.2 + i * 0.12, y, 1.045], 0.07, h * 0.5);
    for (let i = 0; i < 18; i++)
      a.box(
        id,
        "black",
        [-0.49 + i * 0.026, y, 1.045],
        [0.01, h * 0.55, 0.007],
      );
  } else if (role === "network") {
    const count = 16;
    for (let i = 0; i < count; i++) {
      const x = -0.5 + i * (1 / count);
      port(a, id, [x, y, 1.045], 0.055, h * 0.46);
      if (detail)
        a.pipe(
          id,
          "polymer",
          [
            [x, y, 1.12],
            [x, y - 0.03, 1.23],
            [x * 1.02, y - 0.09, 1.25],
          ],
          0.006,
          5,
        );
    }
  } else {
    for (let i = 0; i < (detail ? 16 : 8); i++)
      for (let j = 0; j < 2; j++)
        a.box(
          id,
          "black",
          [-0.49 + i * (detail ? 0.026 : 0.05), y + (j - 0.5) * h * 0.25, 1.04],
          [0.012, h * 0.16, 0.004],
        );
    for (let i = 0; i < 4; i++)
      port(a, id, [0.03 + i * 0.102, y, 1.05], 0.077, h * 0.46);
    port(a, id, [0.46, y, 1.05], 0.05, h * 0.44);
  }
  a.box(id, "led", [-0.51, y + h * 0.25, 1.05], [0.012, 0.012, 0.008]);
  if (detail)
    for (const x of [-0.54, 0.54])
      a.cylinder(
        id,
        "edge",
        [x, y, 1.063],
        0.009,
        0.005,
        [Math.PI / 2, 0, 0],
        6,
      );
  a.owners.get(id)!.kind =
    `${role} service chassis, recessed faceplate, ports/perforations, extraction tabs and status lamp`;
}
export function powerShelf(
  a: Assembly,
  id: string,
  psus: string[],
  y: number,
  h: number,
  detail: boolean,
) {
  a.box(id, "steel", [0, y, 0], [1.25, h, 1.85], 0.1);
  psus.forEach((pid, i) => {
    const x = -0.51 + i * 0.205;
    a.box(pid, "aluminum", [x, y, 0.85], [0.187, h * 0.8, 0.21], 0.12);
    a.cylinder(
      pid,
      "black",
      [x - 0.025, y, 0.966],
      Math.min(h * 0.32, 0.065),
      0.01,
      [Math.PI / 2, 0, 0],
    );
    if (detail) {
      a.ring(
        pid,
        "edge",
        [x - 0.025, y, 0.974],
        Math.min(h * 0.32, 0.065),
        0.003,
        [0, 0, 0],
      );
      for (let j = 0; j < 4; j++)
        a.box(
          pid,
          "steel",
          [x - 0.075 + j * 0.026, y, 0.979],
          [0.003, h * 0.55, 0.004],
        );
    }
    a.box(pid, "polymer", [x + 0.058, y, 0.98], [0.024, h * 0.65, 0.025]);
    a.box(
      pid,
      "supply",
      [x + 0.058, y - h * 0.22, 1.001],
      [0.018, 0.01, 0.008],
    );
    a.box(pid, "led", [x + 0.055, y + h * 0.22, 1.001], [0.008, 0.008, 0.005]);
    a.owners.get(pid)!.kind =
      "Rectifier/PSU module with fan aperture, extraction latch and status LED";
  });
}
