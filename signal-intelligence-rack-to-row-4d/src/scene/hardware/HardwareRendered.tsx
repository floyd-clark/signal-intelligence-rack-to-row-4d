import { materials } from "./materials";
import { useEffect, useMemo, useState } from "react";
import { Box3Helper, Color, Vector3 } from "three";
import { useStore } from "../../app/store";
import { Assembly, resolveOwner, type RenderAsset } from "./assembly";
import { acceleratorPackage } from "./AcceleratorPackage";
import type { ComponentRecord } from "../../data/model";
import { hardwareAudit, registerOwners } from "./sceneRegistry";
export function HardwareRendered({ asset }: { asset: RenderAsset }) {
  const selected = useStore((s) => s.selected);
  const set = useStore((s) => s.set);
  const drill = useStore((s) => s.drill);
  const [hover, setHover] = useState("");
  const rawOwner = asset.owners.get(hover || selected);
  const owner =
    rawOwner && (!rawOwner.kind.startsWith("Rack cabinet") || hover)
      ? rawOwner
      : undefined;
  const helper = useMemo(
    () =>
      owner
        ? new Box3Helper(owner.bounds, new Color(hover ? "#b9dcd3" : "#79bdad"))
        : null,
    [owner, hover],
  );
  useEffect(() => {
    const unregister = registerOwners(asset.group.uuid, asset.owners);
    return () => {
      unregister();
      asset.dispose();
    };
  }, [asset]);
  useEffect(
    () => () => {
      helper?.geometry.dispose();
      (helper?.material as any)?.dispose();
    },
    [helper],
  );
  return (
    <group
      onClick={(e) => {
        const id = resolveOwner(e.object, e.faceIndex);
        if (id) {
          e.stopPropagation();
          const n = Number(id.match(/\/R(\d+)\//)?.[1]);
          set({ selected: id, ...(n ? { rack: n } : {}) });
        }
      }}
      onDoubleClick={(e) => {
        const id = resolveOwner(e.object, e.faceIndex);
        if (id) {
          e.stopPropagation();
          const n = Number(id.match(/\/R(\d+)\//)?.[1]);
          if (n) set({ rack: n });
          drill(id);
        }
      }}
      onPointerMove={(e) => {
        const id = resolveOwner(e.object, e.faceIndex);
        if (id) {
          e.stopPropagation();
          if (id !== hover) {
            setHover(id);
            set({ hovered: id });
          }
          document.body.style.cursor = "pointer";
        }
      }}
      onPointerOut={() => {
        setHover("");
        set({ hovered: "" });
        document.body.style.cursor = "auto";
      }}
    >
      <primitive object={asset.group} dispose={null} />
      {helper && (
        <primitive object={helper} raycast={() => null} dispose={null} />
      )}
    </group>
  );
}
export function PackageInspection({
  records,
  focus,
}: {
  records: ComponentRecord[];
  focus: ComponentRecord;
}) {
  const s = useStore();
  const chip =
    focus.type === "accelerator"
      ? focus
      : records.find((r) => r.id === focus.parentId)!;
  const asset = useMemo(() => {
    const a = new Assembly();
    const hbms = records.filter(
      (r) => r.parentId === chip.id && r.type === "hbm",
    );
    const plate = records.find(
      (r) => r.parentId === chip.id && r.type === "cold-plate",
    )!;
    acceleratorPackage(
      a,
      chip.id,
      hbms.map((r) => r.id),
      plate.id,
      {
        cutaway: focus.type === "cold-plate" ? false : s.cutaway,
        explode: s.explode ? s.explosion : 0,
        selected: focus.id,
      },
    );
    hardwareAudit.scope =
      "Package/interposer — conceptual exposed section, original geometry";
    return a.finish(materials(s.quality));
  }, [chip.id, focus.id, s.cutaway, s.explode, s.explosion, s.quality]);
  return <HardwareRendered asset={asset} />;
}
