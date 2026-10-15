import { Assembly, type V3 } from "./assembly";
/** Original conceptual section, not a claimed die count or vendor package drawing. */
export function hbmStack(a: Assembly, id: string, p: V3, explosion = 0) {
  const [x, y, z] = p;
  a.box(id, "pcbBlue", [x, y, z], [0.36, 0.035, 0.47], 0.12);
  for (let layer = 0; layer < 8; layer++) {
    const ly = y + 0.03 + layer * (0.009 + explosion * 0.06);
    a.box(
      id,
      layer % 2 ? "silicon" : "ceramic",
      [x, ly, z],
      [0.31, 0.006, 0.42],
      0.08,
    );
    for (const side of [-1, 1])
      for (let k = 0; k < 5; k++)
        a.cylinder(
          id,
          "gold",
          [x + side * 0.164, ly, z - 0.15 + k * 0.074],
          0.006,
          0.015,
          [0, 0, Math.PI / 2],
          6,
        );
  }
  a.box(
    id,
    "silicon",
    [x, y + 0.11 + explosion * 0.48, z],
    [0.32, 0.018, 0.43],
    0.1,
  );
  for (let i = 0; i < 6; i++)
    a.box(
      id,
      "gold",
      [x - 0.125 + i * 0.05, y - 0.024, z],
      [0.018, 0.012, 0.4],
    );
  a.owners.get(id)!.kind =
    "HBM layered package: substrate, eight conceptual section layers, edge interconnect motifs";
}
export function coldPlate(
  a: Assembly,
  id: string,
  p: V3,
  cutaway: boolean,
  explode: number,
) {
  const [x, y, z] = p;
  const lift = explode * 0.9;
  a.box(id, "copper", [x, y + lift, z], [1.8, 0.11, 1.3], 0.18);
  a.box(id, "aluminum", [x, y + 0.08 + lift, z], [1.72, 0.09, 1.22], 0.2);
  for (const dx of [-0.74, 0.74])
    for (const dz of [-0.49, 0.49])
      a.bolt(id, [x + dx, y + 0.14 + lift, z + dz], 0.035);
  for (const dx of [-0.5, 0.5]) {
    a.cylinder(id, "edge", [x + dx, y + 0.18 + lift, z - 0.45], 0.085, 0.18);
    a.ring(
      id,
      dx < 0 ? "supply" : "return",
      [x + dx, y + 0.25 + lift, z - 0.45],
      0.084,
      0.015,
    );
    a.pipe(
      id,
      "polymer",
      [
        [x + dx, y + 0.3 + lift, z - 0.45],
        [x + dx, y + 0.42 + lift, z - 0.65],
        [x + dx * 1.6, y + 0.42 + lift, z - 0.95],
      ],
      0.04,
    );
  }
  if (cutaway)
    for (let i = 0; i < 14; i++)
      a.box(
        id,
        "copper",
        [x - 0.65 + i * 0.1, y - 0.012 + lift, z],
        [0.035, 0.02, 0.95],
      );
}
export function acceleratorPackage(
  a: Assembly,
  id: string,
  hbmIds: string[],
  plateId: string,
  opts: { cutaway: boolean; explode: number; selected?: string; cpu?: boolean },
) {
  a.box(id, "pcb", [0, 0, 0], [2.15, 0.07, 1.65], 0.09);
  a.box(id, "ceramic", [0, 0.06, 0], [1.9, 0.045, 1.4], 0.08);
  a.box(id, "silicon", [0, 0.13, 0], [0.8, 0.08, 1.02], 0.1);
  a.box(id, "silicon", [0, 0.176, 0], [0.76, 0.008, 0.98], 0.05);
  for (let x = -0.3; x < 0.35; x += 0.08)
    for (let z = -0.39; z < 0.42; z += 0.08)
      a.box(id, "silicon", [x, 0.182, z], [0.06, 0.002, 0.06]);
  for (let i = 0; i < 26; i++) {
    a.box(id, "gold", [-0.98 + i * 0.078, -0.045, 0.73], [0.025, 0.018, 0.11]);
    a.box(
      id,
      "ceramic",
      [-0.98 + i * 0.078, 0.053, -0.73],
      [0.033, 0.024, 0.045],
    );
  }
  for (const dx of [-0.98, 0.98])
    for (const dz of [-0.69, 0.69]) a.bolt(id, [dx, 0.06, dz], 0.033);
  hbmIds.forEach((hid, i) =>
    hbmStack(
      a,
      hid,
      [i < 2 ? -0.65 : 0.65, 0.085, i % 2 ? -0.37 : 0.37],
      hid === opts.selected ? opts.explode : opts.explode * 0.35,
    ),
  );
  if (!opts.cutaway || opts.explode > 0)
    coldPlate(a, plateId, [0, 0.49, 0], opts.cutaway, opts.explode);
  a.owners.get(id)!.kind =
    "Accelerator substrate, interposer, silicon package, decoupling and mounting frame";
}
