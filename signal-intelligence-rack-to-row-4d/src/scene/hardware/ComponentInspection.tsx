import { materials } from "./materials";
import { useMemo } from "react";
import { Assembly } from "./assembly";
import { HardwareRendered } from "./HardwareRendered";
import type { ComponentRecord } from "../../data/model";
import { powerShelf, deviceFace } from "./PowerNetwork";
import { pumpEquipment, cduCabinet } from "./CoolantLoop";
import { useStore } from "../../app/store";
export function ComponentInspection({
  records,
  focus,
}: {
  records: ComponentRecord[];
  focus: ComponentRecord;
}) {
  const s = useStore();
  const asset = useMemo(() => {
    const a = new Assembly();
    const id = focus.id;
    if (focus.type === "psu") {
      a.box(id, "aluminum", [0, 0.2, 0], [1.1, 0.5, 2], 0.1);
      a.cylinder(id, "black", [-0.15, 0.2, 1.02], 0.2, 0.025, [
        Math.PI / 2,
        0,
        0,
      ]);
      a.ring(id, "steel", [-0.15, 0.2, 1.05], 0.2, 0.014, [0, 0, 0]);
      for (let i = 0; i < 8; i++)
        a.box(
          id,
          "aluminum",
          [-0.33 + i * 0.052, 0.2, 1.065],
          [0.008, 0.38, 0.008],
        );
      a.pipe(
        id,
        "edge",
        [
          [0.32, 0.04, 1.07],
          [0.32, 0.4, 1.23],
          [0.48, 0.4, 1.23],
          [0.48, 0.04, 1.07],
        ],
        0.025,
      );
      a.box(id, "supply", [0.4, 0.05, 1.1], [0.16, 0.08, 0.04]);
      a.box(id, "gold", [0, 0.15, -1.05], [0.42, 0.22, 0.08]);
      for (let i = 0; i < 8; i++)
        a.box(id, "black", [-0.2 + i * 0.055, 0.15, -1.1], [0.02, 0.2, 0.01]);
      a.owners.get(id)!.kind =
        "Service PSU cartridge with fan grille, retention handle and blind-mate power contacts";
    } else if (focus.type === "power-shelf")
      a.withTransform([0, 0, 0], [4, 4, 4], () =>
        powerShelf(
          a,
          id,
          records
            .filter((r) => r.parentId === id && r.type === "psu")
            .map((r) => r.id),
          0.1,
          0.16,
          true,
        ),
      );
    else if (
      [
        "pump",
        "spare-pump",
        "cdu",
        "heat-exchanger",
        "primary-loop",
        "secondary-loop",
      ].includes(focus.type)
    ) {
      const ids = Object.fromEntries(
        records
          .filter((r) => r.physicalLocation.rack === "SHARED")
          .map((r) => [r.type, r.id]),
      );
      cduCabinet(a, ids, [0, 0, 0], true);
    } else if (focus.family === "network")
      a.withTransform([0, 0, 0], [3, 3, 3], () =>
        deviceFace(a, id, 0.2, 0.18, "network", true),
      );
    else {
      a.box(id, "pcb", [0, 0, 0], [1.6, 0.07, 1.1], 0.08);
      a.box(id, "polymer", [0, 0.22, 0], [0.56, 0.35, 0.55], 0.12);
      a.cylinder(id, "edge", [0, 0.46, 0], 0.2, 0.09);
      for (let i = 0; i < 8; i++) {
        a.box(id, "gold", [-0.65 + i * 0.18, 0.06, 0.4], [0.07, 0.025, 0.09]);
        a.box(
          id,
          "ceramic",
          [-0.65 + i * 0.18, 0.08, -0.4],
          [0.07, 0.05, 0.09],
        );
      }
      for (const x of [-0.67, 0.67])
        for (const z of [-0.42, 0.42]) a.bolt(id, [x, 0.07, z], 0.04);
      a.owners.get(id)!.kind =
        "Illustrative instrumentation/service module in board context; not a vendor mechanical drawing";
    }
    return a.finish(materials(s.quality));
  }, [focus.id, records, s.quality]);
  return <HardwareRendered asset={asset} />;
}
