import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import {
  Box3,
  Box3Helper,
  Color,
  Vector3,
  Vector2,
  PMREMGenerator,
} from "three";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { useCatalogue } from "../store";
import { architectureById, representativePart } from "../registry";
import { resolveArchitecture } from "../variants";
import type { Architecture, ViewMode } from "../types";
import { buildModel } from "../models";
import { resolveOwner } from "../../scene/hardware/assembly";
import { catalogueSnapshot, blankReplay } from "../scenarios/engine";
import { lifecycleKey } from "../lifecycle";
import type { BoundModel } from "./ModelImport";
import { ImportedHardware } from "../../import/ImportedHardware";
import { importedOwners } from "../../import/ownership";
import { layerMatches, downstreamParts } from "../workbench";
import { inspectionView } from "../models/inspection";
export const catalogueAudit: Record<string, any> = {};
export const captureCatalogue: Record<
  string,
  (width: number, height: number) => string
> = {};
const cache = new Map<string, { position: number[]; target: number[] }>();
let drivingSide: "a" | "b" | null = null;
function Hardware({
  d,
  side,
  imported,
}: {
  d: Architecture;
  side: "a" | "b";
  imported?: BoundModel;
}) {
  const s = useCatalogue();
  const level = s.assemblyLevels[lifecycleKey(d)] ?? 12;
  const replay = s.replays[d.architectureId] || blankReplay(d.architectureId);
  const snap = catalogueSnapshot(d, replay, s.time);
  const asset = useMemo(
    () =>
      buildModel(d, {
        view: s.focus,
        level,
        explode: s.explode,
        cutaway: s.cutaway,
        quality: s.quality,
        overlay: side === "a" ? s.overlayA : s.overlayB,
        selected:
          s.selections[d.architectureId] || `${d.architectureId}/tray/1`,
        concept: s.concept,
        faultStrength: snap.strength,
        affected: snap.affected,
      }),
    [
      d,
      s.focus,
      level,
      s.explode,
      s.cutaway,
      s.quality,
      s.overlayA,
      s.overlayB,
      s.concept,
      s.selections[d.architectureId],
    ],
  );
  const current = d.components.find(
    (p) => p.id === s.selections[d.architectureId],
  );
  const selected =
    current?.concept === s.concept
      ? current.id
      : representativePart(d, s.concept)?.id;
  const levels = useMemo(
    () => Object.fromEntries(d.components.map((p) => [p.id, p.level])),
    [d],
  );
  const activeImport = s.focus === "rack" && imported;
  const owners = useMemo(
    () =>
      activeImport
        ? importedOwners(
            activeImport.asset,
            activeImport.binding,
            levels,
            level,
          )
        : asset.owners,
    [activeImport, asset, levels, level],
  );
  const overlay = side === "a" ? s.overlayA : s.overlayB;
  const highlighted = useMemo(() => {
    if (overlay === "Hardware") return undefined;
    const part = d.components.find((p) => p.id === selected);
    return new Set(
      overlay === "Dependencies" && part
        ? [part.id, ...downstreamParts(d, part)]
        : d.components
            .filter((p) => layerMatches(d, p, overlay))
            .map((p) => p.id),
    );
  }, [d, overlay, selected]);
  const owner = owners.get(selected || "");
  const helper = useMemo(
    () => (owner ? new Box3Helper(owner.bounds, new Color("#66baff")) : null),
    [owner],
  );
  useEffect(
    () => () => {
      asset.dispose();
    },
    [asset],
  );
  useEffect(
    () => () => {
      helper?.geometry.dispose();
      (helper?.material as any)?.dispose();
    },
    [helper],
  );
  useEffect(() => {
    catalogueAudit[side] = {
      family: d.architectureId,
      level,
      owners: Object.fromEntries(
        [...owners].map(([id, o]) => [
          id,
          {
            bounds: [...o.bounds.min.toArray(), ...o.bounds.max.toArray()],
            kind: o.kind,
            primitives: o.primitives,
          },
        ]),
      ),
      triangles: activeImport ? null : asset.triangles,
      renderMode: activeImport ? "imported" : "procedural",
      assetName: activeImport ? activeImport.asset.name : null,
      highlightedOwners: highlighted ? [...highlighted] : null,
    };
    return () => {
      delete catalogueAudit[side];
    };
  }, [asset, d, side, owners, activeImport, highlighted]);
  const select = (id: string, drill = false) => {
    const p = d.components.find((p) => p.id === id);
    if (!p) return;
    s.select(d.architectureId, id, p.concept);
    if (drill) s.drill(inspectionView(p));
  };
  const pick = (e: any, drill = false) => {
    const id = resolveOwner(e.object, e.faceIndex);
    const p = d.components.find((p) => p.id === id);
    if (!p) return;
    e.stopPropagation();
    select(id!, drill);
  };
  return (
    <group onClick={(e) => pick(e)} onDoubleClick={(e) => pick(e, true)}>
      {activeImport ? (
        <ImportedHardware
          asset={activeImport.asset}
          binding={activeImport.binding}
          levels={levels}
          level={level}
          highlighted={highlighted}
          onSelect={(id) => select(id)}
          onDrill={(id) => select(id, true)}
        />
      ) : (
        <primitive object={asset.group} dispose={null} />
      )}
      {helper && !selected?.endsWith("/rack") && (
        <primitive object={helper} dispose={null} raycast={() => null} />
      )}
      {snap.affected.map((id, i) => {
        const o = owners.get(id);
        if (!o) return null;
        const center = o.bounds.getCenter(new Vector3());
        const size = o.bounds.getSize(new Vector3());
        return (
          <mesh
            key={id}
            position={[center.x, center.y, center.z + size.z / 2 + 0.035]}
            raycast={() => null}
          >
            <boxGeometry args={[size.x, 0.015, 0.015]} />
            <meshBasicMaterial
              color={snap.dieC > 78 ? "#ef7c52" : "#e4b565"}
              transparent
              opacity={Math.max(0.2, snap.strength)}
            />
          </mesh>
        );
      })}
    </group>
  );
}
function Rig({ side, d }: { side: "a" | "b"; d: Architecture }) {
  const s = useCatalogue();
  const { camera, controls, gl, scene } = useThree();
  const dragging = useRef(false),
    last = useRef(0),
    frames = useRef(0),
    stamp = useRef(0),
    fps = useRef<number[]>([]);
  const previous = useRef("");
  const lastBack = useRef(s.backRevision);
  useEffect(() => {
    captureCatalogue[side] = (width, height) => {
      const size = gl.getSize(new Vector2()),
        dpr = gl.getPixelRatio(),
        c = camera as any,
        aspect = c.aspect;
      gl.setPixelRatio(1);
      gl.setSize(width, height, false);
      c.aspect = width / height;
      c.updateProjectionMatrix();
      gl.render(scene, camera);
      const png = gl.domElement.toDataURL("image/png");
      gl.setPixelRatio(dpr);
      gl.setSize(size.x, size.y, false);
      c.aspect = aspect;
      c.updateProjectionMatrix();
      gl.render(scene, camera);
      return png;
    };
    return () => {
      delete captureCatalogue[side];
    };
  }, [side, gl, camera, scene]);
  useEffect(() => {
    if (s.quality === "Performance") return;
    const gen = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = gen.fromScene(room, 0.04);
    scene.environment = env.texture;
    room.dispose();
    gen.dispose();
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [gl, scene, s.quality]);
  useEffect(() => {
    const c = controls as any;
    if (!c) return;
    const start = () => {
      dragging.current = true;
      drivingSide = side;
    };
    const end = () => {
      dragging.current = false;
      s.set({
        orbit: {
          position: camera.position.toArray(),
          target: c.target.toArray(),
        },
      });
    };
    c.addEventListener("start", start);
    c.addEventListener("end", end);
    return () => {
      c.removeEventListener("start", start);
      c.removeEventListener("end", end);
    };
  }, [controls, camera]);
  useEffect(() => {
    const c = controls as any;
    if (!c) return;
    const key = `${side}:${d.architectureId}:${d.shape}:${s.focus}`;
    const cached = cache.get(key);
    const restoring = s.backRevision !== lastBack.current;
    lastBack.current = s.backRevision;
    previous.current = key;
    const deep = ["tray", "chip", "component"].includes(s.focus);
    const target = deep ? [0, 0.15, 0] : [0, 2.05, 0];
    if (s.focus === "component" && s.concept === "cooling") target[1] = 1.8;
    const poses: Record<string, number[]> = {
      oblique: [6, 4.1, 7],
      front: [0, 2.1, 8],
      rear: [-5.3, 4.3, -7],
      top: [0, 10, 0.01],
    };
    const base = poses[s.camera] || poses.oblique;
    const factor = s.focus === "chip" ? 0.55 : s.focus === "row" ? 1.8 : 1;
    const p = base.map((v) => v * factor);
    camera.position.fromArray(cached && restoring ? cached.position : p);
    c.target.fromArray(cached && restoring ? cached.target : target);
    camera.lookAt(c.target);
    c.update();
  }, [s.focus, s.camera, s.cameraRevision, d, controls]);
  useEffect(() => {
    const c = controls as any;
    if (s.orbit && !dragging.current && c) {
      camera.position.fromArray(s.orbit.position);
      c.target.fromArray(s.orbit.target);
      c.update();
    }
  }, [s.orbit, controls, camera]);
  useFrame((state) => {
    if (previous.current && controls)
      cache.set(previous.current, {
        position: camera.position.toArray(),
        target: (controls as any).target.toArray(),
      });
    if (catalogueAudit[side]) {
      catalogueAudit[side].camera = camera.position.toArray();
      catalogueAudit[side].target = (controls as any)?.target.toArray();
    }
    frames.current++;
    const elapsed = state.clock.elapsedTime;
    if (drivingSide === side && elapsed - last.current > 0.08) {
      last.current = elapsed;
      const position = camera.position.toArray(),
        target = (controls as any).target.toArray();
      if (
        !s.orbit ||
        position.some((v, i) => Math.abs(v - s.orbit!.position[i]) > 1e-6) ||
        target.some(
          (v: number, i: number) => Math.abs(v - s.orbit!.target[i]) > 1e-6,
        )
      )
        s.set({
          orbit: {
            position,
            target,
          },
        });
    }
    if (elapsed - stamp.current > 1) {
      fps.current = [
        ...fps.current.slice(-9),
        Math.round(frames.current / (elapsed - stamp.current)),
      ];
      frames.current = 0;
      stamp.current = elapsed;
      const extension = gl
        .getContext()
        .getExtension("WEBGL_debug_renderer_info");
      catalogueAudit[side] = {
        ...catalogueAudit[side],
        camera: camera.position.toArray(),
        target: (controls as any)?.target.toArray(),
        fpsSamples: fps.current,
        drawCalls: gl.info.render.calls,
        renderTriangles: gl.info.render.triangles,
        geometries: gl.info.memory.geometries,
        textures: gl.info.memory.textures,
        renderer: extension
          ? gl.getContext().getParameter(extension.UNMASKED_RENDERER_WEBGL)
          : gl.getContext().getParameter(gl.getContext().RENDERER),
      };
    }
  });
  return null;
}
export function StudioScene({
  side = "a",
  imported,
}: {
  side?: "a" | "b";
  imported?: BoundModel;
}) {
  const s = useCatalogue();
  const d = useMemo(
    () =>
      resolveArchitecture(
        architectureById[s[side]],
        side === "a" ? s.variantA : s.variantB,
      ),
    [s[side], side === "a" ? s.variantA : s.variantB],
  );
  const deep =
    s.focus === "tray" || s.focus === "chip" || s.focus === "component";
  const physical: [number, number, number] =
    s.scale === "physical" && d.knownPhysicalDimensions && !deep
      ? [
          d.knownPhysicalDimensions.width / (500 * d.width),
          d.knownPhysicalDimensions.height / 2100,
          d.knownPhysicalDimensions.depth / (500 * d.depth),
        ]
      : [1, 1, 1];
  return (
    <div className="cat-canvas" data-side={side}>
      <Canvas
        dpr={
          s.quality === "Performance" ? 1 : s.quality === "Detail" ? 1.5 : 1.25
        }
        camera={{ position: [6, 4.1, 7], fov: 38, near: 0.01, far: 100 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
      >
        <color attach="background" args={["#07111c"]} />
        <hemisphereLight args={["#d8e8fa", "#42525a", 1.5]} />
        <directionalLight position={[4, 8, 5]} intensity={3.2} />
        <directionalLight
          position={[-5, 4, -3]}
          intensity={2.2}
          color="#86b9e8"
        />
        <group scale={physical}>
          <Hardware d={d} side={side} imported={imported} />
        </group>
        {!deep && (
          <>
            <gridHelper args={[20, 40, "#26394a", "#152331"]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
              <planeGeometry args={[30, 30]} />
              <meshStandardMaterial color="#17232d" roughness={0.9} />
            </mesh>
          </>
        )}
        <OrbitControls
          makeDefault
          enableDamping={!s.reduced}
          dampingFactor={0.14}
          minDistance={0.6}
          maxDistance={28}
        />
        <Rig d={d} side={side} />
      </Canvas>
      <div className="cat-scene-label">
        <span>
          {d.architectureId} · {s.focus.toUpperCase()}
        </span>
        <strong>{d.familyName}</strong>
        <small>{d.generation}</small>
      </div>
      <div className="cat-scene-foot">
        {s.focus === "rack" && imported
          ? `${imported.asset.name} · ${imported.binding.attribution} · ${imported.binding.license} · `
          : ""}
        {deep
          ? "Conceptual exposed interior · illustrative dimensions"
          : s.focus === "row"
            ? "Central reference unit; neighbors are illustrative context, not a deployed row"
            : s.focus === "topology"
              ? "Schematic communication topology; not a physical cable route"
              : d.unitOfComparison}{" "}
        · {side === "a" ? s.overlayA : s.overlayB} ·{" "}
        {s.scale === "physical"
          ? "published enclosure scale"
          : "matched normalized height"}
      </div>
    </div>
  );
}
