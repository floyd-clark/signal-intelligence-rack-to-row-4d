import { materials } from "./materials";
import { useMemo } from "react";
import type { ComponentRecord } from "../../data/model";
import { useStore } from "../../app/store";
import { Assembly } from "./assembly";
import { HardwareRendered } from "./HardwareRendered";
import { rackAssembly } from "./RackAssembly";
import { hardwareAudit } from "./sceneRegistry";
export function RackHardware({
  records,
  rack,
  offset = 0,
  detail = true,
  affected = false,
}: {
  records: ComponentRecord[];
  rack: number;
  offset?: number;
  detail?: boolean;
  affected?: boolean;
}) {
  const s = useStore();
  const asset = useMemo(() => {
    const a = new Assembly();
    rackAssembly(a, records, rack, {
      racks: s.racks,
      level: s.level,
      detail: detail && s.quality !== "Performance",
      cutaway: s.cutaway || s.xray,
      doors: s.doors,
      selected: s.selected,
      explode: s.explode ? s.explosion : 0,
      coolant: s.showCoolant,
      power: s.showPower,
      network: s.showNetwork,
      chassis: s.showChassis,
    });
    if (affected && s.showFaults) {
      const rid = records.find(
        (r) =>
          r.type === "rack" &&
          r.physicalLocation.rack === `RACK-${String(rack).padStart(2, "0")}`,
      )!.id;
      for (const x of [-0.73, 0.73])
        a.box(rid, "amber", [x, 2.12, 1.14], [0.018, 3.95, 0.018]);
    }
    hardwareAudit.scope =
      "Rack cabinet / service equipment — original illustrative dimensions";
    return a.finish(materials(s.quality));
  }, [
    records,
    rack,
    s.level,
    s.quality,
    s.cutaway,
    s.xray,
    s.doors,
    s.explode,
    s.explosion,
    s.showCoolant,
    s.showPower,
    s.showNetwork,
    s.showChassis,
    s.showFaults,
    affected,
    detail,
  ]);
  return (
    <group position={[offset, 0, 0]}>
      <HardwareRendered asset={asset} />
    </group>
  );
}
