import { Assembly, type V3 } from "./assembly";
export function pumpEquipment(a: Assembly, id: string, p: V3) {
  a.withTransform(p, [1, 1, 1], () => {
    a.box(id, "steel", [0, -0.2, 0], [0.8, 0.08, 0.48], 0.1);
    a.cylinder(id, "aluminum", [0, 0, 0], 0.16, 0.5, [0, 0, Math.PI / 2], 16);
    a.ring(id, "steel", [-0.28, 0, 0], 0.2, 0.06, [0, Math.PI / 2, 0]);
    a.cylinder(id, "steel", [-0.28, 0, 0], 0.15, 0.1, [0, 0, Math.PI / 2]);
    for (let i = 0; i < 8; i++)
      a.box(id, "edge", [-0.16 + i * 0.045, 0.15, 0], [0.015, 0.07, 0.22]);
    a.pipe(
      id,
      "aluminum",
      [
        [-0.28, 0, 0],
        [-0.5, 0, 0],
        [-0.5, 0.6, 0],
      ],
      0.06,
    );
    a.pipe(
      id,
      "aluminum",
      [
        [-0.28, 0.13, 0],
        [-0.28, 0.33, 0],
        [0.42, 0.33, 0],
      ],
      0.06,
    );
    for (const x of [-0.3, 0.3]) a.bolt(id, [x, -0.15, 0.17], 0.035);
  });
  a.owners.get(id)!.kind =
    "Motor-driven secondary pump with finned motor, volute, suction/discharge ports and bolted mounting foot";
}
export function cduCabinet(
  a: Assembly,
  ids: Record<string, string>,
  p: V3,
  cutaway: boolean,
) {
  a.withTransform(p, [1, 1, 1], () => {
    const id = ids.cdu;
    a.box(id, "steel", [0, 0.12, 0], [1.3, 0.18, 1.55], 0.12);
    a.box(id, "aluminum", [0, 3.35, 0], [1.3, 0.09, 1.55], 0.1);
    for (const x of [-0.62, 0.62])
      for (const z of [-0.72, 0.72])
        a.box(id, "steel", [x, 1.75, z], [0.045, 3.3, 0.045]);
    a.box(id, "steel", [0, 1.75, -0.73], [1.25, 3.1, 0.03]);
    if (!cutaway) a.box(id, "steel", [-0.64, 1.75, 0], [0.025, 3.1, 1.5]);
    a.box(id, "aluminum", [0, 2.96, 0.75], [1.23, 0.6, 0.04], 0.08);
    a.box(id, "black", [-0.24, 3.02, 0.78], [0.51, 0.25, 0.02], 0.08);
    a.box(id, "supply", [-0.24, 3.02, 0.792], [0.43, 0.16, 0.005]);
    for (let i = 0; i < 8; i++)
      a.box(id, "black", [0.35, 2.8 + i * 0.045, 0.78], [0.3, 0.018, 0.01]);
    pumpEquipment(a, ids.pump, [-0.06, 0.7, 0.1]);
    pumpEquipment(a, ids["spare-pump"], [-0.06, 1.46, 0.1]);
    for (let i = 0; i < 14; i++)
      a.box(
        ids["heat-exchanger"],
        "aluminum",
        [-0.38 + i * 0.055, 2.35, -0.23],
        [0.033, 0.87, 0.65],
        0.08,
      );
    for (const x of [-0.46, 0.46])
      a.pipe(
        ids["secondary-loop"],
        x < 0 ? "supply" : "return",
        [
          [x, 0.4, 0.5],
          [x, 2, 0.5],
          [x, 2.8, 0.25],
          [0.58, 2.8, x < 0 ? -0.7 : -0.9],
        ],
        0.05,
      );
    for (const y of [1.9, 2.6]) {
      a.cylinder(
        ids["secondary-loop"],
        "aluminum",
        [0.46, y, 0.56],
        0.11,
        0.06,
        [Math.PI / 2, 0, 0],
      );
      a.cylinder(ids["secondary-loop"], "label", [0.46, y, 0.6], 0.09, 0.01, [
        Math.PI / 2,
        0,
        0,
      ]);
      a.box(
        ids["secondary-loop"],
        "black",
        [0.47, y + 0.015, 0.608],
        [0.006, 0.09, 0.004],
      );
      a.ring(
        ids["secondary-loop"],
        "return",
        [0.46, y - 0.22, 0.5],
        0.11,
        0.013,
        [0, 0, 0],
      );
    }
    a.owners.get(id)!.kind =
      "CDU service cabinet with control panel, redundant pump pair, plate heat exchanger, gauges, isolation wheels and connected loop pipes";
  });
}
