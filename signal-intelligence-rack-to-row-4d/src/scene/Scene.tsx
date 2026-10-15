import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Line } from "@react-three/drei";
import {
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  Component,
  type ReactNode,
} from "react";
import {
  Vector3,
  Mesh,
  MeshStandardMaterial,
  CanvasTexture,
  InstancedMesh,
  Object3D,
  Spherical,
} from "three";
import { useStore } from "../app/store";
import { colors, type ComponentRecord } from "../data/model";
import type { Asset, Binding } from "../import/adapter";
import { perf } from "./performance";
import { fabricTopology } from "../graphs/dependencies";
function Monitor() {
  const { gl } = useThree();
  const count = useRef(0),
    last = useRef(0);
  useFrame(({ clock }) => {
    count.current++;
    if (clock.elapsedTime - last.current >= 1) {
      perf.fps = Math.round(count.current / (clock.elapsedTime - last.current));
      perf.calls = gl.info.render.calls;
      perf.triangles = gl.info.render.triangles;
      perf.geometries = gl.info.memory.geometries;
      perf.textures = gl.info.memory.textures;
      count.current = 0;
      last.current = clock.elapsedTime;
    }
  });
  return null;
}
const cameraCache = new Map<string, { position: Vector3; target: Vector3 }>();
function Camera() {
  const s = useStore();
  const { camera, controls } = useThree();
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
  const desired = useRef<Vector3 | null>(null),
    look = useRef(new Vector3(0, 2, 0));
  const context = `${s.profile}:${s.view}:${s.rack}:${s.focus}`;
  const previous = useRef(context);
  const key = useRef(s.cameraKey);
  useEffect(() => {
    const changed = previous.current !== context;
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
      desired.current = cached.position.clone();
      look.current.copy(cached.target);
    } else {
      const row = s.view === "row";
      const poses: Record<string, number[]> = {
        isometric: [6, 4.7, 7],
        front: [0, 2.2, 8],
        rear: [0, 2.2, -8],
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
    }
    key.current = s.cameraKey;
  }, [s.camera, s.cameraKey, context, s.height, camera, controls]);
  useFrame(() => {
    if (!desired.current) return;
    camera.position.lerp(desired.current, s.reduced ? 1 : 0.14);
    if (controls && "target" in controls) {
      (controls as any).target.lerp(look.current, s.reduced ? 1 : 0.14);
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
function LocalLabel({
  text,
  position = [0, 0, 0],
}: {
  text: string;
  position?: [number, number, number];
}) {
  const texture = useMemo(() => {
    const c = document.createElement("canvas");
    c.width = 768;
    c.height = 80;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = "#132634";
    ctx.fillRect(0, 0, 768, 80);
    ctx.strokeStyle = "#55798b";
    ctx.strokeRect(1, 1, 766, 78);
    ctx.fillStyle = "#d0e8e7";
    ctx.font = "26px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillText(text, 384, 50);
    return new CanvasTexture(c);
  }, [text]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <sprite position={position} scale={[1.85, 0.19, 1]}>
      <spriteMaterial map={texture} depthTest={false} />
    </sprite>
  );
}
function Part({
  record,
  position,
  size,
  affected = false,
}: {
  record: ComponentRecord;
  position: [number, number, number];
  size: [number, number, number];
  affected?: boolean;
}) {
  const s = useStore();
  const [hover, setHover] = useState(false);
  const moving = useRef<Mesh>(null);
  useFrame(() => {
    if (moving.current)
      moving.current.position.lerp(
        new Vector3(...position),
        s.reduced ? 1 : 0.15,
      );
  });
  const selected = s.selected === record.id;
  let color = record.type === "tray" ? "#334550" : colors[record.family];
  if (
    s.overlay !== "Hardware" &&
    !(
      {
        Power: ["power", "facility", "safety"],
        "Liquid Cooling": ["cooling", "safety"],
        Airflow: ["cooling"],
        Network: ["network"],
        "Management/Telemetry": ["management"],
        Storage: ["storage"],
        Dependencies: ["facility", "network", "cooling", "power"],
      }[s.overlay] || []
    ).includes(record.family)
  )
    color = "#26323e";
  if (affected) color = "#df9860";
  return (
    <mesh
      ref={moving}
      name={record.id}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        s.set({ selected: record.id });
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (record.type === "rack")
          s.set({
            view: "rack",
            rack: Number(record.physicalLocation.rack.slice(-2)),
            focus: null,
          });
        else s.drill(record.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = "auto";
      }}
    >
      {[
        "manifold-supply",
        "manifold-return",
        "hose",
        "pump",
        "spare-pump",
        "quick-disconnect",
      ].includes(record.type) ? (
        <cylinderGeometry
          args={[
            Math.max(size[0], size[2]) / 2,
            Math.max(size[0], size[2]) / 2,
            size[1],
            12,
          ]}
        />
      ) : (
        <boxGeometry args={size} />
      )}
      <meshStandardMaterial
        color={selected ? "#d2fff2" : hover ? "#b7dddc" : color}
        metalness={record.type === "tray" ? 0.35 : 0.62}
        roughness={0.34}
        transparent
        opacity={s.xray ? 0.35 : record.type === "door" ? 0.12 : 1}
        emissive={selected ? "#3e9f90" : affected ? "#6f3518" : "#000"}
        emissiveIntensity={0.25}
      />
      {hover && (
        <LocalLabel
          text={`${record.displayName} / ${affected ? "affected" : "illustrative"}`}
          position={[0, 0.25, 0]}
        />
      )}
    </mesh>
  );
}
function TrayDetails({ parts }: { parts: ComponentRecord[] }) {
  const s = useStore();
  const vents = useRef<InstancedMesh>(null);
  const trays = parts.filter((r) => r.type === "tray");
  const dummy = useMemo(() => new Object3D(), []);
  useEffect(() => {
    if (!vents.current) return;
    trays.forEach((r, i) => {
      for (let j = 0; j < 10; j++) {
        dummy.position.set(-0.44 + j * 0.083, r.position[1], 0.523);
        dummy.scale.set(0.045, Math.min(r.size[1] * 0.42, 0.065), 0.012);
        dummy.updateMatrix();
        vents.current!.setMatrixAt(i * 10 + j, dummy.matrix);
      }
    });
    vents.current.instanceMatrix.needsUpdate = true;
  }, [parts, dummy]);
  return (
    <instancedMesh
      ref={vents}
      args={[undefined, undefined, trays.length * 10]}
      onClick={(e) => {
        e.stopPropagation();
        const r = trays[Math.floor((e.instanceId || 0) / 10)];
        if (r) s.set({ selected: r.id });
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        const r = trays[Math.floor((e.instanceId || 0) / 10)];
        if (r) s.drill(r.id);
      }}
    >
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#10202a" metalness={0.5} roughness={0.55} />
    </instancedMesh>
  );
}
function Rack({
  records,
  rack,
  offset,
  affected,
}: {
  records: ComponentRecord[];
  rack: number;
  offset: number;
  affected: boolean;
}) {
  const s = useStore();
  const root = records.find(
    (r) =>
      r.type === "rack" &&
      r.physicalLocation.rack === "RACK-" + String(rack).padStart(2, "0"),
  )!;
  const parts = records.filter(
    (r) =>
      r.parentId === root.id &&
      r.level <= s.level &&
      !(r.type === "door" && s.doors),
  );
  return (
    <group position={[offset, 0, 0]}>
      {!s.explode && <TrayDetails parts={parts} />}{" "}
      {/* structural members are one selectable frame record */}
      <group
        onClick={(e) => {
          e.stopPropagation();
          s.set({ selected: root.id });
        }}
        onDoubleClick={(e) => {
          e.stopPropagation();
          s.set({ view: "rack", rack, focus: null });
        }}
      >
        {[-0.7, 0.7].flatMap((x) =>
          [-0.62, 0.62].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 2.1, z]}>
              <boxGeometry args={[0.055, 4.2, 0.055]} />
              <meshStandardMaterial
                color={s.selected === root.id ? "#b0eadc" : "#46596b"}
                metalness={0.85}
                roughness={0.25}
              />
            </mesh>
          )),
        )}
        {[0.03, 4.17].map((y) => (
          <mesh key={y} position={[0, y, 0]}>
            <boxGeometry args={[1.45, 0.08, 1.3]} />
            <meshStandardMaterial
              color="#566a7d"
              metalness={0.8}
              roughness={0.3}
            />
          </mesh>
        ))}
      </group>
      {parts.map((r, i) => (
        <group key={r.id}>
          <Part
            record={r}
            position={[
              r.position[0],
              r.position[1],
              r.position[2] +
                (s.explode
                  ? r.type === "tray"
                    ? ((i % 3) * 0.6 + 0.5) * s.explosion
                    : 0
                  : 0),
            ]}
            size={r.size}
            affected={
              affected &&
              ["tray", "manifold-return", "manifold-supply"].includes(r.type)
            }
          />
          {r.type === "tray" && s.level >= 7 && (
            <mesh position={[0.47, r.position[1], 0.53]}>
              <sphereGeometry args={[0.015, 6, 6]} />
              <meshBasicMaterial color={affected ? "#ffc273" : "#71d3b5"} />
            </mesh>
          )}
        </group>
      ))}
      <LocalLabel
        position={[0, 4.45, 0]}
        text={`RACK ${String(rack).padStart(2, "0")} / ${rack <= s.racks - 2 ? "COMPUTE" : rack === s.racks - 1 ? "NETWORK" : "STORAGE"}${affected ? " !" : ""}${s.level >= 10 ? ` / ${s.level === 10 ? "LOAD TEST" : s.level === 11 ? "ENDURANCE" : "ACCEPTANCE"}` : ""}`}
      />
    </group>
  );
}
function Path({
  color,
  points,
}: {
  color: string;
  points: [number, number, number][];
}) {
  const s = useStore();
  const marker = useRef<Mesh>(null);
  const vectors = useMemo(() => points.map((p) => new Vector3(...p)), [points]);
  useFrame(({ clock }) => {
    if (marker.current) {
      const t =
        (s.reduced ? 0.5 : (clock.elapsedTime * 0.2) % 1) *
        (vectors.length - 1);
      const i = Math.min(vectors.length - 2, Math.floor(t));
      marker.current.position.lerpVectors(vectors[i], vectors[i + 1], t - i);
    }
  });
  return (
    <>
      <Line
        points={points}
        color={color}
        lineWidth={2}
        dashed={["Power", "Network", "Management/Telemetry"].includes(
          s.overlay,
        )}
        dashSize={0.12}
        gapSize={0.08}
      />
      <mesh ref={marker}>
        <sphereGeometry args={[0.035, 8, 8]} />
        <meshBasicMaterial color={color} />
      </mesh>
    </>
  );
}
function SystemPaths() {
  const s = useStore();
  return (
    <>
      {Array.from({ length: s.view === "row" ? s.racks : 1 }, (_, i) => {
        const x = s.view === "row" ? (i - (s.racks - 1) / 2) * 1.9 : 0;
        const cooling = s.overlay === "Liquid Cooling",
          power = s.overlay === "Power";
        if (cooling)
          return (
            <group key={i}>
              <Path
                color="#57c9de"
                points={[
                  [x - 0.76, 0.2, -0.68],
                  [x - 0.76, 3.7, -0.68],
                  [x, 3.7, -0.3],
                ]}
              />
              <Path
                color="#dd9466"
                points={[
                  [x, 1.5, -0.3],
                  [x + 0.76, 1.5, -0.68],
                  [x + 0.76, 0.2, -0.68],
                ]}
              />
              {s.view === "row" && i < s.racks - 2 && (
                <Path
                  color="#438c9e"
                  points={[
                    [-s.racks - 1.7, 1, 0],
                    [x - 0.76, 1, -0.68],
                    [x - 0.76, 3.7, -0.68],
                  ]}
                />
              )}
            </group>
          );
        if (s.overlay === "Airflow")
          return (
            <group key={i}>
              {[1, 2, 3].map((y) => (
                <Path
                  key={y}
                  color="#a8c5db"
                  points={[
                    [x, y, 1.2],
                    [x, y, 0.4],
                    [x, y, -1.1],
                  ]}
                />
              ))}
            </group>
          );
        return (
          <Path
            key={i}
            color={
              power
                ? "#d9ae66"
                : s.overlay === "Storage"
                  ? "#c99b77"
                  : s.overlay === "Management/Telemetry"
                    ? "#b9a1d6"
                    : "#82c7a2"
            }
            points={
              power
                ? [
                    [x + 0.6, 4, 0],
                    [x + 0.6, 4, -0.7],
                    [x + 0.6, 0.25, -0.7],
                  ]
                : [
                    [x, 3.7, 0.7],
                    [x, 4.7, 0.7],
                    [x + 1, 4.7, 0.7],
                  ]
            }
          />
        );
      })}
    </>
  );
}
function FabricView({ records }: { records: ComponentRecord[] }) {
  const s = useStore();
  const chips = records.filter(
    (r) =>
      r.type === "accelerator" &&
      r.physicalLocation.rack === `RACK-${String(s.rack).padStart(2, "0")}`,
  );
  const isTPU = s.profile === "GOOGLE_IRONWOOD_TPU_REFERENCE";
  const positions = new Map(
    chips.map((c, i) => [
      c.id,
      isTPU
        ? ([
            (i % 4) - 1.5,
            1 + (Math.floor(i / 4) % 4),
            Math.floor(i / 16) - 1.5,
          ] as [number, number, number])
        : ([((i % 8) - 3.5) * 0.55, 1 + Math.floor(i / 8) * 0.35, 0] as [
            number,
            number,
            number,
          ]),
    ]),
  );
  const links = fabricTopology(records).filter(
    (l) => l.fabric === "ICI" && positions.has(l.from) && positions.has(l.to),
  );
  const switches = records.filter(
    (r) =>
      r.type === "scale-up-switch" &&
      r.physicalLocation.rack === `RACK-${String(s.rack).padStart(2, "0")}`,
  );
  return (
    <group>
      <LocalLabel
        text={
          isTPU
            ? "64-chip cube / ICI 3D torus"
            : `${chips.length} accelerators / sampled schematic fabric edges`
        }
        position={[0, 5, 0]}
      />
      {chips.map((c) => (
        <Part
          key={c.id}
          record={c}
          position={positions.get(c.id)!}
          size={[0.18, 0.12, 0.18]}
        />
      ))}
      {isTPU
        ? links.map((l, i) => (
            <Line
              key={i}
              points={[positions.get(l.from)!, positions.get(l.to)!]}
              color={["#4daab4", "#c1a878", "#9b8dc4"][l.axis || 0]}
              lineWidth={1}
            />
          ))
        : switches.map((sw, i) => (
            <group key={sw.id}>
              <Part
                record={sw}
                position={[(i - 4) * 0.5, 0.35, -1]}
                size={[0.3, 0.1, 0.3]}
              />
              {chips
                .filter((_, j) => j % switches.length === i)
                .map((c) => (
                  <Line
                    key={c.id}
                    points={[positions.get(c.id)!, [(i - 4) * 0.5, 0.35, -1]]}
                    color="#80b5a1"
                    lineWidth={1}
                  />
                ))}
            </group>
          ))}
    </group>
  );
}
function Imported({ asset, binding }: { asset: Asset; binding: Binding }) {
  const s = useStore();
  const object = useMemo(() => {
    const o = asset.object.clone(true);
    o.traverse((x) => {
      if (x instanceof Mesh) {
        const materials = (
          Array.isArray(x.material) ? x.material : [x.material]
        ).map((m) => {
          const clone = m.clone();
          clone.transparent = binding.xray;
          clone.opacity = binding.xray ? 0.4 : 1;
          return clone;
        });
        x.material = materials.length === 1 ? materials[0] : materials;
      }
    });
    return o;
  }, [asset, binding.xray]);
  return (
    <group
      scale={binding.scale}
      rotation={[0, (binding.rotation * Math.PI) / 180, 0]}
      onClick={(e) => {
        e.stopPropagation();
        const id = binding.meshes[e.object.name];
        if (id) s.set({ selected: id });
      }}
    >
      <primitive object={object} />
    </group>
  );
}
class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    useStore.getState().set({ fallback: true });
  }
  render() {
    return this.state.failed ? (
      <div className="fallback">
        WebGL unavailable. Use the accessible component tree and 2D diagram.
      </div>
    ) : (
      this.props.children
    );
  }
}
export function Scene({
  records,
  affected,
  asset,
  binding,
}: {
  records: ComponentRecord[];
  affected: number[];
  asset: Asset | null;
  binding: Binding | null;
}) {
  const s = useStore();
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0]?.isIntersecting ?? true),
      { rootMargin: "300px" },
    );
    if (host.current) observer.observe(host.current);
    return () => observer.disconnect();
  }, []);
  const focus = records.find((r) => r.id === s.focus);
  let children = focus
    ? records.filter((r) => r.parentId === focus.id && r.level <= s.level)
    : [];
  if (focus && !children.length) children = [focus];
  return (
    <div ref={host} style={{ width: "100%", height: "100%" }}>
      <Boundary>
        <Canvas
          aria-label="Interactive 3D hardware model; use component tree as keyboard alternative"
          frameloop={visible ? "always" : "never"}
          shadows={false}
          dpr={[1, 1.5]}
          camera={{ position: [6, 4.7, 7], fov: 38 }}
          gl={{ antialias: true, powerPreference: "low-power" }}
        >
          <color attach="background" args={["#0b141e"]} />
          <ambientLight intensity={1.2} />
          <directionalLight position={[3, 8, 5]} intensity={3} />
          <directionalLight
            position={[-5, 4, -3]}
            intensity={2}
            color="#6c9caf"
          />
          <Suspense fallback={null}>
            <OrbitControls
              makeDefault
              enableDamping={!s.reduced}
              minDistance={0.4}
              maxDistance={50}
            />
            <Camera />
            <Monitor />
            <gridHelper args={[40, 40, "#304254", "#1b2b3b"]} />
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
              <planeGeometry args={[80, 80]} />
              <meshStandardMaterial color="#111e2a" roughness={0.8} />
            </mesh>
            {s.camera === "graph" && !focus ? (
              <FabricView records={records} />
            ) : asset && binding && s.view === "rack" && !focus ? (
              <Imported asset={asset} binding={binding} />
            ) : focus ? (
              <group position={[0, 0.75, 0]}>
                {children.map((r, i) => (
                  <Part
                    key={r.id}
                    record={r}
                    position={
                      r === focus
                        ? [0, 0, 0]
                        : [
                            r.position[0] * 3,
                            r.position[1] * 2 +
                              (s.explode ? i * 0.12 * s.explosion : 0),
                            r.position[2] * 3,
                          ]
                    }
                    size={r.size.map((v) => v * 3) as [number, number, number]}
                    affected={false}
                  />
                ))}
              </group>
            ) : (
              <>
                {Array.from(
                  { length: s.view === "row" ? s.racks : 1 },
                  (_, i) => {
                    const r = s.view === "row" ? i + 1 : s.rack;
                    return (
                      <Rack
                        key={r}
                        records={records}
                        rack={r}
                        offset={
                          s.view === "row" ? (i - (s.racks - 1) / 2) * 1.9 : 0
                        }
                        affected={affected.includes(r)}
                      />
                    );
                  },
                )}
                {records
                  .filter(
                    (r) =>
                      r.physicalLocation.rack === "SHARED" &&
                      r.type !== "floor" &&
                      r.level <= s.level,
                  )
                  .map((r) => (
                    <Part
                      key={r.id}
                      record={r}
                      position={[
                        r.position[0] - (s.view === "row" ? s.racks : 0),
                        r.position[1],
                        r.position[2],
                      ]}
                      size={r.size}
                      affected={affected.length > 1 && r.type === "pump"}
                    />
                  ))}
              </>
            )}
            {s.overlay !== "Hardware" && <SystemPaths />}
          </Suspense>
        </Canvas>
      </Boundary>
    </div>
  );
}
