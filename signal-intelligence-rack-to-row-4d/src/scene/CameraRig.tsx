import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import { Vector3, Spherical } from "three";
import { useStore } from "../app/store";
import type { ComponentRecord } from "../data/model";
import { hardwareAudit } from "./hardware/sceneRegistry";
const cameraCache = new Map<string, { position: Vector3; target: Vector3 }>();
export function Camera({ records }: { records: ComponentRecord[] }) {
  const s = useStore();
  const { camera, controls, size } = useThree();
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(
          (e.target as HTMLElement).tagName,
        ) ||
        ![
          "ArrowLeft",
          "ArrowRight",
          "ArrowUp",
          "ArrowDown",
          "+",
          "-",
          "=",
        ].includes(e.key)
      )
        return;
      e.preventDefault();
      const target =
        controls && "target" in controls
          ? (controls as any).target
          : new Vector3(0, 2, 0);
      const spherical = new Spherical().setFromVector3(
        camera.position.clone().sub(target),
      );
      if (e.key === "ArrowLeft") spherical.theta -= 0.12;
      if (e.key === "ArrowRight") spherical.theta += 0.12;
      if (e.key === "ArrowUp") spherical.phi -= 0.1;
      if (e.key === "ArrowDown") spherical.phi += 0.1;
      if (e.key === "+" || e.key === "=") spherical.radius *= 0.9;
      if (e.key === "-") spherical.radius *= 1.1;
      spherical.makeSafe();
      camera.position.copy(
        new Vector3().setFromSpherical(spherical).add(target),
      );
      camera.lookAt(target);
      if (controls) (controls as any).update();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [camera, controls]);
  const frameOwner = useRef(false);
  const desired = useRef<Vector3 | null>(null),
    look = useRef(new Vector3(0, 2, 0));
  const context = `${s.profile}:${s.view}:${s.view === "row" ? "all" : s.rack}:${s.focus}`;
  const focusRecord = records.find((r) => r.id === s.focus);
  const previous = useRef(context);
  const key = useRef(s.cameraKey);
  useEffect(() => {
    const changed = previous.current !== context;
    frameOwner.current =
      !!focusRecord &&
      !["tray", "board", "accelerator", "hbm", "cold-plate"].includes(
        focusRecord.type,
      );
    if (changed) {
      cameraCache.set(previous.current, {
        position: camera.position.clone(),
        target:
          controls && "target" in controls
            ? (controls as any).target.clone()
            : look.current.clone(),
      });
      previous.current = context;
    }
    const cached = cameraCache.get(context);
    if (cached && changed) {
      frameOwner.current = false;
      desired.current = cached.position.clone();
      look.current.copy(cached.target);
    } else {
      const row = s.view === "row";
      const poses: Record<string, number[]> = {
        isometric: [6, 4.7, 7],
        front: [0, 2.2, 8],
        orthographic: [0, 2.2, 8],
        rear: [0, 2.2, -8],
        "rear-service": [-5.5, 4.7, -7],
        left: [-8, 2.2, 0],
        right: [8, 2.2, 0],
        top: [0, 10, 0.01],
        inside: [2, 4, 3],
        plumbing: [3, 3, -5],
        aisle: [10, 5, 13],
        graph: [0, 9, 9],
      };
      const p = poses[s.camera] || poses.isometric;
      desired.current = new Vector3(
        p[0] * (row ? 1.8 : s.focus ? 0.5 : 1),
        p[1] * (row ? 1.5 : s.focus ? 0.5 : 1),
        p[2] * (row ? 1.8 : s.focus ? 0.5 : 1),
      );
      look.current.set(0, s.focus ? 1 : s.height, 0);
      if (row) {
        look.current.set(-0.9, 2.45, -0.3);
        desired.current.set(
          s.camera.startsWith("rear") ? -s.racks * 1.4 : s.racks * 1.4,
          7,
          s.camera.startsWith("rear") ? -s.racks * 1.8 : s.racks * 1.8,
        );
      }
      if (focusRecord && ["tray", "board"].includes(focusRecord.type)) {
        look.current.set(0, 0.1, 0);
        desired.current.set(6.8, 6.4, 8.5);
        if (s.camera === "top") desired.current.set(0.01, 11, 0.01);
        if (s.camera === "rear") desired.current.set(-6.8, 6.4, -8.5);
      }
      if (
        focusRecord &&
        ["accelerator", "hbm", "cold-plate"].includes(focusRecord.type)
      ) {
        look.current.set(0, 0.15, 0);
        desired.current.set(2.8, 2.7, 3.5);
        if (focusRecord.type === "hbm") {
          const index = Number(focusRecord.id.split(".").at(-1)) - 1;
          look.current.set(
            index < 2 ? -0.65 : 0.65,
            0.15 + (s.explode ? s.explosion * 0.3 : 0),
            index % 2 ? -0.37 : 0.37,
          );
          desired.current.copy(look.current).add(
            new Vector3(
              ...((
                {
                  front: [0, 0.3, 1],
                  rear: [-0.3, 0.6, -1],
                  top: [0.01, 1, 0.01],
                  right: [1, 0.4, 0.1],
                } as Record<string, [number, number, number]>
              )[s.camera] || [0.6, 0.65, 0.8]),
            )
              .normalize()
              .multiplyScalar(
                (s.explode ? 2.0 : 1.4) /
                  (2 *
                    Math.tan((38 * Math.PI) / 360) *
                    (size.width / size.height)),
              ),
          );
        }
      }
    }
    key.current = s.cameraKey;
  }, [
    s.camera,
    s.cameraKey,
    context,
    s.height,
    s.explode,
    s.explosion,
    camera,
    controls,
    size.width,
    size.height,
  ]);
  useFrame((_, delta) => {
    const alpha = s.reduced ? 1 : 1 - Math.exp(-8 * delta);
    if (
      frameOwner.current &&
      focusRecord &&
      hardwareAudit.owners[focusRecord.id]
    ) {
      const b = hardwareAudit.owners[focusRecord.id].bounds;
      look.current.set((b[0] + b[3]) / 2, (b[1] + b[4]) / 2, (b[2] + b[5]) / 2);
      const length = new Vector3(
        b[3] - b[0],
        b[4] - b[1],
        b[5] - b[2],
      ).length();
      desired.current = look.current
        .clone()
        .add(
          new Vector3(1, 0.85, 1.2)
            .normalize()
            .multiplyScalar(Math.max(0.65, length * 1.5)),
        );
      frameOwner.current = false;
    }
    hardwareAudit.camera = camera.position.toArray();
    hardwareAudit.target =
      controls && "target" in controls
        ? (controls as any).target.toArray()
        : look.current.toArray();
    if (!desired.current) return;
    camera.position.lerp(desired.current, alpha);
    if (controls && "target" in controls) {
      (controls as any).target.lerp(look.current, alpha);
      (controls as any).update();
    } else camera.lookAt(look.current);
    if (
      camera.position.distanceTo(desired.current) < 0.01 &&
      (!controls ||
        !("target" in controls) ||
        (controls as any).target.distanceTo(look.current) < 0.01)
    )
      desired.current = null;
  });
  return null;
}
