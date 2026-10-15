import { Assembly, type V3 } from "../../scene/hardware/assembly";
import { inventory, type ComponentRecord } from "../../data/model";
import { computeTray } from "../../scene/hardware/ComputeTray";
import { acceleratorPackage } from "../../scene/hardware/AcceleratorPackage";
import type { Architecture, Concept, ViewMode } from "../types";
export interface ModelOptions {
  view: ViewMode;
  level: number;
  explode: number;
  cutaway: boolean;
  quality: string;
  overlay: string;
  selected: string;
  concept: Concept;
  faultStrength: number;
  affected: string[];
}
export const part = (d: Architecture, path: string) =>
  `${d.architectureId}/${path}`;
export function shell(
  a: Assembly,
  d: Architecture,
  opts: ModelOptions,
  w = d.width,
  depth = d.depth,
) {
  const id = part(d, "rack");
  a.box(id, "steel", [0, 0.12, 0], [w + 0.12, 0.22, depth + 0.1], 0.16);
  a.box(id, "steel", [0, 4.16, 0], [w + 0.12, 0.12, depth + 0.1], 0.12);
  for (const x of [-w / 2, w / 2])
    for (const z of [-depth / 2, depth / 2]) {
      a.box(id, "steel", [x, 2.12, z], [0.07, 4.05, 0.08], 0.08);
      for (let y = 0.35; y < 4.05; y += 0.16)
        a.box(id, "black", [x, y, z + 0.045], [0.028, 0.06, 0.012]);
      a.cylinder(id, "black", [x, 0.035, z], 0.08, 0.065);
    }
  if (!opts.cutaway)
    for (const x of [-w / 2, w / 2])
      a.box(id, "polymer", [x, 2.12, 0], [0.035, 3.94, depth * 0.96], 0.08);
  a.box(id, "black", [0, 4.0, depth / 2 + 0.02], [w * 0.9, 0.19, 0.045], 0.1);
}
export function connector(a: Assembly, id: string, p: V3, w = 0.1, h = 0.055) {
  a.box(id, "edge", p, [w, h, 0.05], 0.08);
  a.box(id, "black", [p[0], p[1], p[2] + 0.03], [w * 0.74, h * 0.65, 0.012]);
  a.box(
    id,
    "gold",
    [p[0], p[1] - h * 0.22, p[2] + 0.04],
    [w * 0.52, 0.006, 0.003],
  );
}
export function handle(
  a: Assembly,
  id: string,
  x: number,
  y: number,
  z: number,
  w = 0.18,
  h = 0.05,
) {
  a.pipe(
    id,
    "edge",
    [
      [x - w / 2, y - h, z],
      [x - w / 2, y + h, z + 0.08],
      [x + w / 2, y + h, z + 0.08],
      [x + w / 2, y - h, z],
    ],
    0.012,
    8,
  );
}
export function face(
  a: Assembly,
  id: string,
  y: number,
  w: number,
  h: number,
  depth: number,
  ports: number,
  style: "compute" | "switch" | "disk" = "compute",
  pull = 0,
) {
  const z = depth / 2 + pull;
  a.box(
    id,
    style === "switch" ? "black" : "steel",
    [0, y, pull],
    [w, h, depth * 0.94],
    0.1,
  );
  a.box(
    id,
    style === "switch" ? "black" : "aluminum",
    [0, y, z],
    [w, h * 0.94, 0.026],
    0.1,
  );
  for (const x of [-w * 0.45, w * 0.45]) {
    handle(a, id, x, y, z + 0.025, 0.1, h * 0.22);
    a.cylinder(
      id,
      "edge",
      [x, y + h * 0.3, z + 0.03],
      0.01,
      0.012,
      [Math.PI / 2, 0, 0],
      6,
    );
  }
  if (style === "disk")
    for (let i = 0; i < 8; i++) {
      const x = -w * 0.37 + i * w * 0.105;
      a.box(id, "black", [x, y, z + 0.025], [w * 0.085, h * 0.7, 0.03]);
      a.box(id, "label", [x, y, z + 0.046], [0.018, h * 0.5, 0.012]);
    }
  else {
    for (let i = 0; i < ports; i++)
      connector(
        a,
        id,
        [-w * 0.34 + i * ((w * 0.68) / Math.max(1, ports - 1)), y, z + 0.025],
        Math.min(0.12, (w * 0.6) / ports),
        h * 0.44,
      );
    for (let i = 0; i < 12; i++)
      a.box(
        id,
        "black",
        [-w * 0.39 + i * w * 0.069, y + h * 0.32, z + 0.016],
        [w * 0.025, h * 0.08, 0.008],
      );
  }
  a.box(id, "led", [w * 0.4, y - h * 0.28, z + 0.033], [0.017, 0.012, 0.008]);
}
export function shelf(
  a: Assembly,
  d: Architecture,
  i: number,
  y: number,
  w = d.width * 0.9,
  h = 0.17,
) {
  const id = part(d, `power/${i + 1}`);
  a.box(id, "steel", [0, y, 0], [w, h, d.depth * 0.87], 0.1);
  for (let k = 0; k < d.layout.psus; k++) {
    const pw = w / d.layout.psus;
    const x = -w / 2 + pw * (k + 0.5);
    a.box(
      id,
      "aluminum",
      [x, y, d.depth / 2],
      [pw * 0.94, h * 0.88, 0.045],
      0.1,
    );
    a.cylinder(
      id,
      "black",
      [x, y, d.depth / 2 + 0.034],
      h * 0.27,
      0.015,
      [Math.PI / 2, 0, 0],
      12,
    );
    a.ring(id, "edge", [x, y, d.depth / 2 + 0.05], h * 0.27, 0.008, [
      Math.PI / 2,
      0,
      0,
    ]);
    a.box(
      id,
      "led",
      [x + pw * 0.3, y + h * 0.25, d.depth / 2 + 0.035],
      [0.012, 0.01, 0.008],
    );
    handle(a, id, x, y, d.depth / 2 + 0.045, pw * 0.65, h * 0.25);
  }
}
export function rearServices(
  a: Assembly,
  d: Architecture,
  ys: number[],
  opts: ModelOptions,
) {
  const p = part(d, "power/1"),
    cool = part(d, "cooling"),
    net = part(d, "network"),
    z = -d.depth / 2 - 0.08;
  for (const x of [-0.12, 0.12]) {
    a.box(p, "copper", [x, 2.1, z], [0.055, 3.65, 0.035], 0.06);
    for (const y of [0.4, 1.3, 2.4, 3.8]) {
      a.box(p, "black", [x, y, z + 0.04], [0.13, 0.08, 0.06]);
      a.cylinder(
        p,
        "edge",
        [x, y, z - 0.03],
        0.016,
        0.02,
        [Math.PI / 2, 0, 0],
        6,
      );
    }
  }
  if (d.cooling !== "air")
    for (const side of [-1, 1]) {
      const x = side * (d.width / 2 - 0.12),
        m = side < 0 ? "supply" : "return";
      a.cylinder(cool, m, [x, 2.13, z - 0.11], 0.035, 3.8);
      for (const y of [0.3, 1.7, 3.9]) {
        a.ring(cool, "edge", [x, y, z - 0.11], 0.04, 0.012);
        a.box(cool, "steel", [x, y, z + 0.02], [0.1, 0.08, 0.22]);
      }
      for (const y of ys) {
        a.cylinder(
          cool,
          "edge",
          [x, y, z - 0.1],
          0.048,
          0.06,
          [Math.PI / 2, 0, 0],
          10,
        );
        a.pipe(
          cool,
          "polymer",
          [
            [x, y, z - 0.1],
            [x * 0.8, y + 0.025, z - 0.27],
            [x * 0.65, y, z + 0.12],
          ],
          0.013,
          6,
        );
      }
      a.pipe(
        cool,
        m,
        [
          [x, 4.02, z - 0.11],
          [x, 4.3, z - 0.11],
          [x * 0.7, 4.3, z + 0.03],
        ],
        0.035,
        10,
      );
      a.cylinder(
        cool,
        "edge",
        [x * 0.7, 4.3, z + 0.03],
        0.046,
        0.09,
        [Math.PI / 2, 0, 0],
        10,
      );
    }
  for (let i = 0; i < Math.min(ys.length, 18); i++) {
    const y = ys[i];
    a.pipe(
      net,
      "polymer",
      [
        [d.width * 0.3, y, z],
        [d.width * 0.42, y + 0.04, z - 0.2],
        [d.width * 0.46, 4.0, z - 0.19],
      ],
      0.01,
      8,
    );
  }
  if (opts.overlay === "Power")
    for (const y of ys)
      a.pipe(
        p,
        "gold",
        [
          [0, y, z - 0.06],
          [0, y, 0.1],
          [d.width * 0.3, y, 0.1],
        ],
        0.013,
        6,
      );
}
const legacy = new Map<string, ComponentRecord[]>();
export function trayDetails(a: Assembly, d: Architecture, opts: ModelOptions) {
  const profile =
    d.shape === "ironwood"
      ? "GOOGLE_IRONWOOD_TPU_REFERENCE"
      : d.shape === "nvl72"
        ? "NVIDIA_GB200_NVL72_REFERENCE"
        : "FS_CONCEPT";
  let rs = legacy.get(profile);
  if (!rs) {
    rs = inventory(profile);
    legacy.set(profile, rs);
  }
  const tray = rs.find((r) => r.type === "tray")!;
  const children = new Set([tray.id]);
  for (const r of rs)
    if (
      r.parentId &&
      children.has(r.parentId) &&
      !(
        r.type === "accelerator" &&
        Number(r.id.split(".").at(-1)) > d.layout.chipsPerTray
      ) &&
      !(
        r.type === "cpu" &&
        Number(r.id.split(".").at(-1)) > d.layout.cpusPerTray
      )
    )
      children.add(r.id);
  const t = Number(opts.selected.match(/\/(?:tray|board)\/(\d+)/)?.[1] || 1);
  const mapped = rs
    .filter((r) => children.has(r.id))
    .map((r) => {
      let path =
        r.type === "tray"
          ? `tray/${t}`
          : r.type === "board"
            ? `board/${t}`
            : r.type === "accelerator"
              ? `chip/${t}.${r.id.split(".").at(-1)}`
              : r.type === "hbm"
                ? `memory/${t}.${r.id.split(".").at(-2)}`
                : r.type === "cold-plate"
                  ? `plate/${t}.${r.id.split(".").at(-1)}`
                  : r.type === "cpu"
                    ? `cpu/${t}.${r.id.split(".").at(-1)}`
                    : `${r.type}/${t}`;
      if (!d.components.some((p) => p.id === part(d, path)))
        path = `board/${t}`;
      return {
        ...r,
        id: part(d, path),
        parentId: r.parentId
          ? part(
              d,
              r.type === "board"
                ? `tray/${t}`
                : [
                      "accelerator",
                      "cpu",
                      "nic",
                      "vrm",
                      "nvme",
                      "fan",
                      "quick-disconnect",
                      "bmc",
                      "dimm",
                      "package-sensor",
                    ].includes(r.type)
                  ? `board/${t}`
                  : r.type === "hbm" || r.type === "cold-plate"
                    ? `chip/${t}.${r.type === "hbm" ? r.id.split(".").at(-2) : r.id.split(".").at(-1)}`
                    : `board/${t}`,
            )
          : null,
      };
    });
  a.withTransform([0, 0, 0], [d.shape === "helios" ? 1.22 : 1, 1, 1], () =>
    computeTray(
      a,
      mapped,
      mapped.find((r) => r.type === "tray")!,
      {
        cutaway: opts.cutaway,
        explode: opts.explode,
        level: opts.level,
        quality: opts.quality,
      },
    ),
  );
  if (d.shape === "helios")
    for (const x of [-3.55, 3.55]) {
      a.box(part(d, `tray/${t}`), "steel", [x, 0.12, 0], [0.18, 0.4, 4.4]);
      for (let z = -1.8; z < 2; z += 0.35)
        a.box(part(d, `nic/${t}`), "black", [x, 0.35, z], [0.17, 0.08, 0.17]);
    }
}
export function chipDetails(a: Assembly, d: Architecture, opts: ModelOptions) {
  const suffix =
    opts.selected.match(/\/(?:chip|memory|plate)\/(.*)/)?.[1] || "1.1";
  acceleratorPackage(
    a,
    part(d, `chip/${suffix}`),
    Array(4).fill(part(d, `memory/${suffix}`)),
    part(d, `plate/${suffix}`),
    {
      cutaway: opts.cutaway,
      explode: opts.explode,
      architecture: d.shape === "ironwood" ? "ironwood" : "gpu",
    },
  );
}
export function layerMarkers(
  a: Assembly,
  d: Architecture,
  opts: ModelOptions,
  ys: number[],
) {
  if (opts.overlay === "Hardware") return;
  const id = part(
    d,
    opts.overlay === "Cooling"
      ? "cooling"
      : opts.overlay === "Power"
        ? "power/1"
        : "network",
  );
  const mat =
    opts.overlay === "Cooling"
      ? "supply"
      : opts.overlay === "Power"
        ? "gold"
        : "pcbBlue";
  for (const y of ys)
    a.pipe(
      id,
      mat,
      [
        [-d.width * 0.35, y, d.depth / 2 + 0.13],
        [0, y + 0.03, d.depth / 2 + 0.2],
        [d.width * 0.35, y, d.depth / 2 + 0.13],
      ],
      0.013,
      8,
    );
}
