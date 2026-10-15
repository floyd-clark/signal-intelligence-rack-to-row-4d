import { Assembly } from "./assembly";
export function rackChassis(
  a: Assembly,
  id: string,
  opts: {
    shell: boolean;
    doors: boolean;
    detail: boolean;
    doorId?: string;
    railId?: string;
  },
) {
  a.box(id, "steel", [0, 0.12, 0], [1.48, 0.23, 2.3], 0.12);
  a.box(id, "steel", [0, 4.14, 0], [1.48, 0.15, 2.3], 0.12);
  const rail = opts.railId || id;
  for (const x of [-0.7, 0.7])
    for (const z of [-1.1, 1.1]) {
      a.box(rail, "steel", [x, 2.13, z], [0.055, 4.04, 0.085]);
      a.box(
        rail,
        "edge",
        [x + Math.sign(x) * 0.012, 2.13, z],
        [0.018, 4.04, 0.1],
      );
      a.cylinder(id, "black", [x, 0.01, z], 0.065, 0.08);
      if (opts.detail)
        for (let u = 0; u < 38; u++)
          a.box(
            id,
            "black",
            [x, 0.31 + u * 0.1, z + 0.047],
            [0.025, 0.028, 0.005],
          );
    }
  for (const y of [0.27, 4.02])
    for (const z of [-1.07, 1.07])
      a.box(id, "aluminum", [0, y, z], [1.4, 0.028, 0.045]);
  if (opts.shell)
    for (const x of [-0.745, 0.745]) {
      a.box(id, "steel", [x, 2.15, 0], [0.025, 3.9, 2.1], 0.08);
      for (let k = 0; k < 10; k++)
        a.box(
          id,
          "black",
          [x + Math.sign(x) * 0.014, 0.5 + k * 0.065, 0.65],
          [0.003, 0.025, 0.5],
        );
    }
  // Hinge-pivot motion: the whole door follows a physical swing, not disappearance.
  a.withTransform(
    [-0.735, 0.27, 1.15],
    [1, 1, 1],
    () => {
      for (const x of [0, 1.43])
        a.box(opts.doorId || id, "steel", [x, 1.91, 0], [0.035, 3.82, 0.035]);
      for (const y of [0, 3.82])
        a.box(opts.doorId || id, "steel", [0.715, y, 0], [1.43, 0.035, 0.035]);
      for (let y = 0.15; y < 3.7; y += 0.12)
        a.box(opts.doorId || id, "black", [0.715, y, 0], [1.38, 0.008, 0.008]);
      a.box(
        opts.doorId || id,
        "edge",
        [1.34, 1.8, 0.025],
        [0.027, 0.28, 0.03],
        0.1,
      );
    },
    [0, opts.doors ? -Math.PI * 0.54 : 0, 0],
  );
  a.owners.get(id)!.kind =
    "Rack cabinet with deep service envelope, slotted uprights, plinth, feet and hinged perforated door";
}
