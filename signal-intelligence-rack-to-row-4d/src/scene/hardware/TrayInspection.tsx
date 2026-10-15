import { materials } from "./materials";
import { useMemo } from "react";
import { useStore } from "../../app/store";
import { Assembly } from "./assembly";
import { computeTray } from "./ComputeTray";
import { HardwareRendered } from "./HardwareRendered";
import type { ComponentRecord } from "../../data/model";
import { hardwareAudit } from "./sceneRegistry";
export function TrayInspection({
  records,
  focus,
}: {
  records: ComponentRecord[];
  focus: ComponentRecord;
}) {
  const s = useStore();
  const tray =
    focus.type === "tray"
      ? focus
      : records.find((r) => r.id === focus.parentId)!;
  const asset = useMemo(() => {
    const a = new Assembly();
    computeTray(a, records, tray, {
      cutaway: s.cutaway,
      explode: s.explode ? s.explosion : 0,
      level: s.level,
      quality: s.quality,
    });
    hardwareAudit.scope =
      "Compute sled / populated board — original illustrative mechanical arrangement";
    return a.finish(materials(s.quality));
  }, [tray.id, s.cutaway, s.explode, s.explosion, s.level, s.quality]);
  return <HardwareRendered asset={asset} />;
}
