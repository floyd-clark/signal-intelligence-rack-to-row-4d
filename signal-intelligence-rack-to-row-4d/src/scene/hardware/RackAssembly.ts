import { Assembly, type V3 } from "./assembly";
import type { ComponentRecord } from "../../data/model";
import { rackSlots } from "./lod";
import { rackChassis } from "./RackChassis";
import { deviceFace, powerShelf } from "./PowerNetwork";
export function rackAssembly(
  a: Assembly,
  records: ComponentRecord[],
  rack: number,
  opts: {
    racks: number;
    level: number;
    detail: boolean;
    cutaway: boolean;
    doors: boolean;
    selected: string;
    explode: number;
    coolant: boolean;
    power: boolean;
    network: boolean;
    chassis: boolean;
  },
) {
  const rackName = `RACK-${String(rack).padStart(2, "0")}`;
  const root = records.find(
    (r) => r.type === "rack" && r.physicalLocation.rack === rackName,
  )!;
  const find = (type: string) =>
    records.find((r) => r.type === type && r.physicalLocation.rack === rackName)
      ?.id || root.id;
  const slots = rackSlots(records, rack, opts.racks);
  if (opts.chassis)
    rackChassis(a, root.id, {
      shell: !opts.cutaway,
      doors: opts.doors,
      detail: opts.detail,
      doorId: find("door"),
      railId: find("rail"),
    });
  else a.box(root.id, "steel", [0, 0.12, 0], [1.48, 0.23, 2.3]);
  let selectedTray = slots.find((s) => s.record.id === opts.selected);
  if (!selectedTray) {
    let node = records.find((r) => r.id === opts.selected);
    while (node?.parentId) {
      selectedTray = slots.find((s) => s.record.id === node?.parentId);
      if (selectedTray) break;
      node = records.find((r) => r.id === node?.parentId);
    }
  }
  slots
    .filter((s) => s.record.level <= opts.level)
    .forEach((slot, i) => {
      const pull =
        opts.explode &&
        (selectedTray?.record.id === slot.record.id ||
          (!selectedTray && i === 4))
          ? opts.explode * 1.25
          : 0;
      a.withTransform([0, 0, pull], [1, 1, 1], () => {
        if (slot.role === "power")
          powerShelf(
            a,
            slot.record.id,
            records
              .filter((r) => r.parentId === slot.record.id && r.type === "psu")
              .map((r) => r.id),
            slot.y,
            slot.height,
            opts.detail,
          );
        else
          deviceFace(
            a,
            slot.record.id,
            slot.y,
            slot.height,
            slot.role,
            opts.detail,
          );
      });
      if (
        opts.coolant &&
        rack <= opts.racks - 2 &&
        opts.level >= 4 &&
        slot.role === "compute" &&
        !pull
      ) {
        const q =
          records.find(
            (r) =>
              r.type === "quick-disconnect" &&
              r.physicalLocation.rack === rackName &&
              r.id.endsWith(`-${i + 1}`),
          )?.id || find("hose");
        for (const x of [-0.62, 0.62]) {
          a.cylinder(q, "edge", [x, slot.y, -1.07], 0.024, 0.11, [
            Math.PI / 2,
            0,
            0,
          ]);
          a.ring(
            q,
            x < 0 ? "supply" : "return",
            [x, slot.y, -1.14],
            0.026,
            0.005,
            [0, 0, 0],
          );
          a.pipe(
            q,
            "polymer",
            [
              [x, slot.y, -1.13],
              [x * 0.86, slot.y + 0.045, -1.34],
              [x * 0.86, slot.y + 0.065, -1.46],
              [x, slot.y + 0.08, -1.48],
            ],
            0.014,
            8,
          );
        }
      }
    });
  if (opts.coolant && rack <= opts.racks - 2 && opts.level >= 4) {
    for (const [x, type, mat] of [
      [-0.62, "manifold-supply", "supply"],
      [0.62, "manifold-return", "return"],
    ] as const) {
      a.cylinder(find(type), mat, [x, 2.12, -1.48], 0.038, 3.75);
      for (const y of [0.27, 2, 3.95]) {
        a.ring(find(type), "edge", [x, y, -1.48], 0.044, 0.01);
        a.box(find(type), "steel", [x, y, -1.35], [0.1, 0.06, 0.2]);
      }
      a.pipe(
        find(type),
        mat,
        [
          [x, 0.25, -1.48],
          [x, 0.15, -1.6],
          [x, 0.15, -1.85],
        ],
        0.038,
      );
      a.cylinder(find(type), "steel", [x, 0.15, -1.85], 0.042, 0.025, [
        Math.PI / 2,
        0,
        0,
      ]);
    }
  }
  if (opts.power && opts.level >= 2) {
    const bus = find("busbar");
    for (const x of [-0.15, 0.02, 0.19]) {
      a.box(bus, "copper", [x, 2.1, -1.22], [0.055, 3.65, 0.018]);
      for (const y of [0.45, 1.4, 2.5, 3.7]) {
        a.box(bus, "black", [x, y, -1.19], [0.11, 0.07, 0.06]);
        if (opts.detail)
          a.cylinder(
            bus,
            "edge",
            [x, y, -1.24],
            0.014,
            0.012,
            [Math.PI / 2, 0, 0],
            6,
          );
      }
    }
    a.pipe(
      find("feed-a"),
      "black",
      [
        [0.3, 4.2, -0.7],
        [0.3, 4.35, -0.7],
        [0.3, 4.35, -1.1],
      ],
      0.035,
    );
  }
  if (opts.network && opts.level >= 9) {
    const net = find("fiber");
    for (let i = 0; i < (opts.detail ? 8 : 3); i++)
      a.pipe(
        net,
        "polymer",
        [
          [-0.48 + i * 0.11, 3.86, 1.1],
          [-0.48 + i * 0.11, 3.9, 1.38],
          [-0.63, 4.15, 1.38],
          [-0.63, 4.48, 1.15],
        ],
        0.008,
        8,
      );
    if (root.vendorProfile === "NVIDIA_GB200_NVL72_REFERENCE")
      for (let i = 0; i < 6; i++) {
        a.box(
          find("scale-up"),
          "polymer",
          [-0.45 + i * 0.18, 2.1, -1.08],
          [0.12, 2.9, 0.13],
        );
        a.box(
          find("scale-up"),
          "aluminum",
          [-0.45 + i * 0.18, 3.6, -1.08],
          [0.13, 0.08, 0.14],
        );
      }
  }
  const tor = find("tor");
  deviceFace(a, tor, 3.99, 0.075, "network", opts.detail);
  if (root.vendorProfile === "NVIDIA_GB200_NVL72_REFERENCE")
    deviceFace(a, tor, 3.9, 0.075, "network", opts.detail);
  a.box(find("asset-tag"), "label", [0.56, 4.04, 1.12], [0.12, 0.04, 0.005]);
}
