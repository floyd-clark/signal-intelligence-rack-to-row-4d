import { materials } from "./materials";
import { useEffect, useMemo } from "react";
import { CanvasTexture, SpriteMaterial, SRGBColorSpace } from "three";
import { useStore } from "../../app/store";
import { Assembly } from "./assembly";
import { computeTray } from "./ComputeTray";
import { HardwareRendered } from "./HardwareRendered";
import type { ComponentRecord } from "../../data/model";
import { hardwareAudit } from "./sceneRegistry";
function TPULabel({
  index,
  position,
}: {
  index: number;
  position: [number, number, number];
}) {
  const material = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 320;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#0c1b23";
    ctx.fillRect(0, 0, 320, 64);
    ctx.strokeStyle = "#719695";
    ctx.lineWidth = 3;
    ctx.strokeRect(1.5, 1.5, 317, 61);
    ctx.font = "36px sans-serif";
    ctx.fillStyle = "#e6f5f2";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(`Ironwood TPU ${index}`, 160, 32);
    const map = new CanvasTexture(canvas);
    map.colorSpace = SRGBColorSpace;
    return new SpriteMaterial({
      map,
      depthTest: false,
      depthWrite: false,
      toneMapped: false,
    });
  }, [index]);
  useEffect(
    () => () => {
      material.map?.dispose();
      material.dispose();
    },
    [material],
  );
  return (
    <sprite
      position={position}
      scale={[0.92, 0.184, 1]}
      material={material}
      renderOrder={20}
      raycast={() => null}
    />
  );
}
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
  const board = records.find(
    (r) => r.parentId === tray.id && r.type === "board",
  );
  const tpus = records.filter(
    (r) =>
      r.parentId === board?.id &&
      r.type === "accelerator" &&
      r.vendorProfile === "GOOGLE_IRONWOOD_TPU_REFERENCE" &&
      r.level <= s.level,
  );
  return (
    <>
      <HardwareRendered asset={asset} />
      {s.cutaway &&
        tpus.map((r, i) => (
          <TPULabel
            key={r.id}
            index={i + 1}
            position={[
              i % 2 ? 1.43 : -1.43,
              0.42 + (s.explode ? s.explosion * 0.2 : 0),
              Math.floor(i / 2) ? -0.85 : 0.65,
            ]}
          />
        ))}
    </>
  );
}
