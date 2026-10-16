import { utilityRoutes } from "./hardware/utilityRoutes";
import { ComponentInspection } from "./hardware/ComponentInspection";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { Camera } from "./CameraRig";
import { RowInfrastructure } from "./hardware/RowInfrastructure";
import { RackHardware } from "./hardware/RackHardware";
import { TrayInspection } from "./hardware/TrayInspection";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, OrthographicCamera } from "@react-three/drei";
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
  PMREMGenerator,
} from "three";
import { useStore } from "../app/store";
import { colors, type ComponentRecord } from "../data/model";
import type { Asset, Binding } from "../import/adapter";
import { ImportedHardware } from "../import/ImportedHardware";
import { perf } from "./performance";
import { PackageInspection } from "./hardware/HardwareRendered";
import { hardwareAudit } from "./hardware/sceneRegistry";
import { fabricTopology } from "../graphs/dependencies";
function Studio() {
  const quality = useStore((s) => s.quality);
  const { gl, scene } = useThree();
  useEffect(() => {
    if (quality === "Performance") {
      scene.environment = null;
      return;
    }
    const generator = new PMREMGenerator(gl);
    const room = new RoomEnvironment();
    const env = generator.fromScene(room, 0.04);
    scene.environment = env.texture;
    scene.environmentIntensity = 0.65;
    return () => {
      scene.environment = null;
      env.dispose();
      room.dispose();
      generator.dispose();
    };
  }, [gl, scene, quality]);
  return null;
}
function Projection() {
  const camera = useStore((s) => s.camera);
  const { size } = useThree();
  return camera === "orthographic" ? (
    <OrthographicCamera
      makeDefault
      position={[0, 2.2, 8]}
      zoom={size.height / 5.35}
      near={0.005}
      far={100}
    />
  ) : null;
}
function Monitor() {
  const { gl, scene } = useThree();
  const count = useRef(0),
    last = useRef(0);
  useFrame(({ clock }) => {
    count.current++;
    if (clock.elapsedTime - last.current >= 1) {
      perf.fps = Math.round(count.current / (clock.elapsedTime - last.current));
      perf.fpsSamples.push(perf.fps);
      if (perf.fpsSamples.length > 120) perf.fpsSamples.shift();
      perf.dpr = gl.getPixelRatio();
      perf.quality = useStore.getState().quality;
      hardwareAudit.quality = perf.quality;
      const mats = new Set();
      scene.traverse((o: any) => {
        if (o.material)
          for (const m of Array.isArray(o.material) ? o.material : [o.material])
            mats.add(m.uuid);
      });
      perf.materials = mats.size;
      const ctx = gl.getContext();
      const ext = ctx.getExtension("WEBGL_debug_renderer_info");
      perf.renderer = ext
        ? ctx.getParameter(ext.UNMASKED_RENDERER_WEBGL)
        : ctx.getParameter(ctx.RENDERER);
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
        color={selected ? "#e0f1ff" : hover ? "#d5eaff" : color}
        metalness={record.type === "tray" ? 0.35 : 0.62}
        roughness={0.34}
        transparent
        opacity={s.xray ? 0.35 : record.type === "door" ? 0.12 : 1}
        emissive={selected ? "#287dc2" : affected ? "#6f3518" : "#000"}
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
function SystemPaths({ records }: { records: ComponentRecord[] }) {
  const s = useStore();
  const row = s.view === "row";
  if (s.overlay === "Liquid Cooling")
    return (
      <>
        {utilityRoutes(records, s.racks, row, s.rack).map((r, i) => (
          <Path
            key={i}
            color={r.material === "supply" ? "#69bbd0" : "#d2ad82"}
            points={r.points}
          />
        ))}
      </>
    );
  return (
    <>
      {Array.from({ length: row ? s.racks : 1 }, (_, i) => {
        const x = row ? (i - (s.racks - 1) / 2) * 1.9 : 0;
        const left = row ? -(s.racks - 1) * 0.95 - 2.1 : -2.1;
        if (s.overlay === "Airflow")
          return (
            <group key={i}>
              {[1, 2, 3].map((y) => (
                <Path
                  key={y}
                  color="#a7bec9"
                  points={[
                    [x, y, 1.5],
                    [x, y, 0],
                    [x, y, -1.2],
                  ]}
                />
              ))}
            </group>
          );
        return (
          <Path
            key={i}
            color={
              s.overlay === "Power"
                ? "#d6b47a"
                : s.overlay === "Management/Telemetry"
                  ? "#a698c4"
                  : "#80baa3"
            }
            points={
              s.overlay === "Power"
                ? [
                    [x + 0.3, 5.2, 0.1],
                    [x + 0.3, 4.35, -1.1],
                    [x + 0.19, 0.35, -1.22],
                  ]
                : [
                    [x - 0.63, 4.48, 1.15],
                    [x - 0.63, 5.62, 0.8],
                    [left, 5.62, 0.8],
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
  return (
    <ImportedHardware
      asset={asset}
      binding={binding}
      onSelect={(id) => s.set({ selected: id })}
    />
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
  const boardContext = focus
    ? records.find((r) => r.id === focus.parentId && r.type === "board")
    : undefined;
  const rackContext = focus
    ? records.find((r) => r.id === focus.parentId && r.type === "rack")
    : undefined;
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
          dpr={
            s.quality === "Performance"
              ? 1
              : s.quality === "Detail"
                ? 1.5
                : 1.25
          }
          camera={{ position: [6, 4.7, 7], fov: 38, near: 0.005 }}
          gl={{ antialias: true, powerPreference: "high-performance" }}
        >
          <color attach="background" args={["#0b141e"]} />
          <hemisphereLight args={["#dce8f4", "#464a42", 1.1]} />
          <ambientLight intensity={0.65} />
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
              minDistance={0.08}
              maxDistance={50}
            />
            <Projection />
            <Studio />
            <Camera records={records} />
            <Monitor />
            {!focus && <gridHelper args={[40, 40, "#304254", "#1b2b3b"]} />}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.015, 0]}>
              <planeGeometry args={[80, 80]} />
              <meshStandardMaterial color="#111e2a" roughness={0.8} />
            </mesh>
            {s.camera === "graph" && !focus ? (
              <FabricView records={records} />
            ) : asset && binding && s.view === "rack" && !focus ? (
              <Imported asset={asset} binding={binding} />
            ) : focus?.type === "rack" ? (
              <RackHardware records={records} rack={s.rack} />
            ) : focus &&
              ["accelerator", "hbm", "cold-plate"].includes(focus.type) ? (
              <PackageInspection records={records} focus={focus} />
            ) : focus && ["tray", "board"].includes(focus.type) ? (
              <TrayInspection records={records} focus={focus} />
            ) : boardContext ? (
              <TrayInspection records={records} focus={boardContext} />
            ) : rackContext &&
              !["power-shelf", "tray"].includes(focus!.type) ? (
              <RackHardware records={records} rack={s.rack} />
            ) : focus ? (
              <ComponentInspection records={records} focus={focus} />
            ) : (
              <>
                {Array.from(
                  { length: s.view === "row" ? s.racks : 1 },
                  (_, i) => {
                    const r = s.view === "row" ? i + 1 : s.rack;
                    return (
                      <group key={r}>
                        <RackHardware
                          records={records}
                          rack={r}
                          affected={affected.includes(r)}
                          detail={s.view === "rack" || r === s.rack}
                          offset={
                            s.view === "row" ? (i - (s.racks - 1) / 2) * 1.9 : 0
                          }
                        />
                        <LocalLabel
                          position={[
                            s.view === "row"
                              ? (i - (s.racks - 1) / 2) * 1.9
                              : 0,
                            4.35,
                            1.08,
                          ]}
                          text={`R${String(r).padStart(2, "0")} / ${r <= s.racks - 2 ? "COMPUTE" : r === s.racks - 1 ? "NETWORK" : "STORAGE"}${s.showIds ? " / illustrative" : ""}`}
                        />
                      </group>
                    );
                  },
                )}
                <RowInfrastructure records={records} />
              </>
            )}
            {s.overlay !== "Hardware" && <SystemPaths records={records} />}
          </Suspense>
        </Canvas>
      </Boundary>
    </div>
  );
}
