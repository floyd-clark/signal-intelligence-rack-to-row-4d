import { Assembly, type V3 } from "./assembly";
import type { ComponentRecord } from "../../data/model";
import { acceleratorPackage } from "./AcceleratorPackage";
export function fan(
  a: Assembly,
  id: string,
  p: V3,
  r = 0.24,
  vertical = false,
) {
  a.box(id, "polymer", p, [r * 2.35, 0.17, r * 2.35], 0.12);
  a.cylinder(id, "black", [p[0], p[1] + 0.1, p[2]], r, 0.04);
  a.ring(id, "aluminum", [p[0], p[1] + 0.13, p[2]], r, 0.014);
  a.cylinder(id, "edge", [p[0], p[1] + 0.14, p[2]], r * 0.28, 0.06);
  for (let i = 0; i < 7; i++) {
    const angle = (i * Math.PI * 2) / 7;
    a.withTransform(
      [p[0], p[1] + 0.14, p[2]],
      [1, 1, 1],
      () =>
        a.box(id, "steel", [r * 0.5, 0, 0], [r * 0.65, 0.018, r * 0.27], 0.08),
      [0, angle, 0],
    );
  }
}
export function board(
  a: Assembly,
  records: ComponentRecord[],
  boardRec: ComponentRecord,
  opts: { cutaway: boolean; explode: number; level: number; quality: string },
) {
  const id = boardRec.id;
  const kids = records.filter((r) => r.parentId === id);
  a.box(id, "pcb", [0, 0, 0], [5.65, 0.075, 3.96], 0.08);
  for (const x of [-2.65, 2.65])
    for (const z of [-1.8, 1.8]) {
      a.cylinder(id, "edge", [x, -0.08, z], 0.065, 0.15);
      a.ring(id, "gold", [x, 0.045, z], 0.075, 0.012);
      a.bolt(id, [x, 0.07, z], 0.045);
    }
  for (let i = 0; i < 24; i++) {
    const x = -2.5 + i * 0.21;
    const z = i % 2 ? 1.5 : -1.5;
    a.box(id, "gold", [x, 0.041, z], [0.008, 0.002, 0.55]);
    a.box(id, "gold", [x + 0.06, 0.041, z + 0.3], [0.12, 0.002, 0.008]);
    a.box(id, "ceramic", [x, 0.055, z - 0.15], [0.075, 0.035, 0.045]);
  }
  const chips = kids.filter(
    (r) => r.type === "accelerator" && r.level <= opts.level,
  );
  chips.forEach((r, i) => {
    const hbms = records.filter((x) => x.parentId === r.id && x.type === "hbm");
    const cp = records.find(
      (x) => x.parentId === r.id && x.type === "cold-plate",
    )!;
    a.withTransform(
      [
        i % 2 ? 1.43 : -1.43,
        0.12 + opts.explode * 0.2,
        Math.floor(i / 2) ? -0.85 : 0.65,
      ],
      [0.68, 0.68, 0.68],
      () =>
        acceleratorPackage(
          a,
          r.id,
          hbms.map((x) => x.id),
          cp.id,
          { cutaway: opts.cutaway, explode: opts.explode * 0.3 },
        ),
    );
  });
  const pick = (type: string) =>
    kids.find((r) => r.type === type && r.level <= opts.level)?.id;
  const cpus = kids.filter((r) => r.type === "cpu" && r.level <= opts.level);
  cpus.forEach((r, i) => {
    a.box(
      r.id,
      "polymer",
      [-1.5 + i * 2.8, 0.12, 1.55],
      [0.83, 0.09, 0.72],
      0.1,
    );
    a.box(
      r.id,
      "aluminum",
      [-1.5 + i * 2.8, 0.21, 1.55],
      [0.69, 0.12, 0.61],
      0.15,
    );
    for (const x of [-0.35, 0.35])
      a.box(
        r.id,
        "steel",
        [-1.5 + i * 2.8 + x, 0.2, 1.55],
        [0.035, 0.035, 0.76],
      );
  });
  const dimm = pick("dimm");
  if (dimm)
    for (let i = 0; i < 4; i++) {
      const x = -2.35 + i * 0.2;
      if (boardRec.vendorProfile === "FS_CONCEPT") {
        a.box(dimm, "polymer", [x, 0.12, 0], [0.12, 0.08, 1.1]);
        a.box(dimm, "pcb", [x, 0.36, 0], [0.035, 0.42, 1.08]);
        for (let n = 0; n < 6; n++)
          a.box(
            dimm,
            "black",
            [x + 0.025, 0.38, -0.43 + n * 0.17],
            [0.03, 0.25, 0.13],
          );
        for (const z of [-0.6, 0.6])
          a.box(dimm, "label", [x, 0.18, z], [0.12, 0.16, 0.05]);
      } else {
        a.box(dimm, "ceramic", [x, 0.09, -1.5], [0.16, 0.06, 0.21], 0.08);
      }
    }
  const vrm = pick("vrm");
  if (vrm)
    for (let i = 0; i < 10; i++) {
      a.box(
        vrm,
        "steel",
        [2.35, 0.12, -1.6 + i * 0.32],
        [0.24, 0.18, 0.24],
        0.1,
      );
      a.cylinder(
        vrm,
        "aluminum",
        [2.65, 0.1, -1.6 + i * 0.32],
        0.052,
        0.15,
        undefined,
        10,
      );
    }
  const nic = pick("nic");
  if (nic)
    for (let i = 0; i < 4; i++) {
      a.box(nic, "pcbBlue", [-1.12 + i * 0.75, 0.12, -1.72], [0.52, 0.06, 0.5]);
      a.box(
        nic,
        "steel",
        [-1.12 + i * 0.75, 0.2, -1.72],
        [0.28, 0.12, 0.27],
        0.1,
      );
      for (let n = 0; n < 5; n++)
        a.box(
          nic,
          "edge",
          [-1.22 + i * 0.75 + n * 0.05, 0.28, -1.72],
          [0.018, 0.05, 0.27],
        );
    }
  const nvme = pick("nvme");
  if (nvme) {
    a.box(nvme, "pcbBlue", [0.05, 0.12, 1.45], [0.34, 0.045, 0.95], 0.05);
    for (let i = 0; i < 3; i++)
      a.box(nvme, "black", [0.05, 0.17, 1.15 + i * 0.25], [0.25, 0.055, 0.19]);
    a.bolt(nvme, [0.05, 0.16, 1.88], 0.04);
    a.box(nvme, "gold", [0.05, 0.12, 0.94], [0.27, 0.05, 0.08]);
  }
  const bmc = pick("bmc");
  if (bmc) {
    a.box(bmc, "pcb", [1.85, 0.13, -1.65], [0.52, 0.04, 0.45]);
    a.box(bmc, "black", [1.85, 0.19, -1.65], [0.27, 0.07, 0.24]);
  }
  const f = pick("fan");
  if (f)
    for (let i = 0; i < 3; i++) fan(a, f, [-0.7 + i * 0.7, 0.12, -0.1], 0.22);
  const q = pick("quick-disconnect");
  if (q)
    for (const x of [-2.66, 2.66]) {
      a.cylinder(q, "edge", [x, 0.15, -2.05], 0.08, 0.25, [Math.PI / 2, 0, 0]);
      a.ring(
        q,
        x < 0 ? "supply" : "return",
        [x, 0.15, -2.15],
        0.085,
        0.018,
        [0, 0, 0],
      );
      if (!opts.explode)
        a.pipe(
          q,
          "polymer",
          [
            [x, 0.15, -1.97],
            [x * 0.8, 0.36, -1.55],
            [x * 0.6, 0.42, -0.65],
          ],
          0.045,
        );
    }
  a.owners.get(id)!.kind =
    "Populated PCB with mounting/standoffs, traces, accelerator packages, CPU IHS, host memory, VRM, NIC, NVMe and fan modules";
}
