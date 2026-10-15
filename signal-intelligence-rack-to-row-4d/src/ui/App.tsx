import { hardwareAudit } from "../scene/hardware/sceneRegistry";
import { useEffect, useMemo, useState, lazy, Suspense } from "react";
import { useStore } from "../app/store";
import {
  inventory,
  audit,
  profiles,
  colors,
  type ComponentRecord,
  type ProfileId,
} from "../data/model";
import sources from "../data/sources.json";
import levels from "../data/levels.json";
import facility from "../data/facility.json";
import { applicableIncidents } from "../data/failures/incidents";
import { snapshot, scenarioSchema, type Scenario } from "../simulation/engine";
import { graph, descendants } from "../graphs/dependencies";
import { perf } from "../scene/performance";
const Scene = lazy(() =>
  import("../scene/Scene").then((m) => ({ default: m.Scene })),
);
const Catalogue = lazy(() =>
  import("../catalogue/ui/Catalogue").then((m) => ({ default: m.Catalogue })),
);
import {
  loadAsset,
  validateBinding,
  type Asset,
  type Binding,
} from "../import/adapter";
import { download } from "../export/report";
const overlays = [
  "Hardware",
  "Power",
  "Liquid Cooling",
  "Airflow",
  "Network",
  "Management/Telemetry",
  "Storage",
  "Dependencies",
];
const chapters = [
  "Rack overview",
  "Compute tray and board",
  "Accelerator and HBM",
  "NVLink / ICI comparison",
  "Power and cooling",
  "Shared CDU incident",
  "Row propagation",
  "TPM release call",
];
export function App() {
  const [catalogueOpen, setCatalogueOpen] = useState(false);
  const s = useStore();
  const records = useMemo(
    () => inventory(s.profile, s.racks),
    [s.profile, s.racks],
  );
  const edges = useMemo(() => graph(records), [records]);
  const incidents = useMemo(() => applicableIncidents(s.profile), [s.profile]);
  const snap = useMemo(
    () => snapshot(s.scenario, s.time, incidents),
    [s.scenario, s.time, incidents],
  );
  const [tab, setTab] = useState("intelligence"),
    [search, setSearch] = useState(""),
    [panel, setPanel] = useState(""),
    [incidentId, setIncidentId] = useState("INC-10"),
    [error, setError] = useState(""),
    [asset, setAsset] = useState<Asset | null>(null),
    [binding, setBinding] = useState<Binding | null>(null),
    [draft, setDraft] = useState<Binding | null>(null),
    [mesh, setMesh] = useState(""),
    [target, setTarget] = useState(""),
    [compare, setCompare] = useState(false),
    [demoTime, setDemoTime] = useState<number | null>(null),
    [demoIndex, setDemoIndex] = useState(-1),
    [tick, setTick] = useState(0),
    [gateFault, setGateFault] = useState(false),
    [metric, setMetric] = useState("temperature");
  const selected =
    records.find((r) => r.id === s.selected) ||
    records.find((r) => r.type === "rack")!;
  const profile = profiles.find((p) => p.id === s.profile)!;
  const active = snap.fault;
  const discriminating = s.evidence.filter((label) =>
    active?.evidence.some((e) => e.label === label && e.supports >= 0),
  ).length;
  const currentLevel = s.buildTime
    ? Math.max(1, Math.min(12, Math.floor(s.time / 50) + 1))
    : s.level;
  const level = levels[currentLevel - 1];
  const report = {
    title: "Simulated TPM decision brief",
    scenario: s.scenario,
    time: s.time,
    incident: active?.title,
    diagnosis:
      s.answer || discriminating >= 2 ? active?.hypotheses[0] : "unverified",
    confidence:
      discriminating >= 2 && s.hypothesis === 0
        ? "tested in synthetic fixtures"
        : "unverified",
    owner: active?.owner,
    DRI: s.role,
    decision: s.decision,
    hypothesis: s.hypothesis,
    score:
      discriminating >= 2 && s.hypothesis === 0 && !snap.active
        ? 100
        : discriminating >= 2
          ? 60
          : 0,
    evidence: s.evidence,
    capacityPercent: snap.capacity,
    containmentRadius: snap.racks.filter((r) => r.affected).map((r) => r.rack),
    MTTD_seconds: active ? 30 : null,
    timeToContainment: s.scenario.events.find((e) => e.kind === "contain")
      ? s.scenario.events.find((e) => e.kind === "contain")!.time -
        (s.scenario.events.find((e) => e.kind === "inject")?.time || 0)
      : null,
    MTTR: s.scenario.events.find((e) => e.kind === "recover")
      ? s.scenario.events.find((e) => e.kind === "recover")!.time -
        (s.scenario.events.find((e) => e.kind === "inject")?.time || 0)
      : null,
    recurrence: s.scenario.events.filter((e) => e.kind === "inject").length,
    BOM: "EDU-C / fictional",
    serial: "SI-2026-0001 / fictional",
    lot: "PILOT-07 / fictional",
    leadTimeDays: 21,
    phase: level.phase,
    gatePass: s.gatePass,
    releaseCriteria: [
      "Two discriminating tests",
      "Recovery and no recurrence through modeled soak",
      "No critical open fault",
      "L1–L12 evidence and facility signoffs",
    ],
    prevention: active?.prevention,
  };
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 1500);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!s.playing) return;
    const id = setInterval(() => {
      const n = useStore.getState();
      n.set({
        time: Math.min(600, n.time + n.speed),
        playing: n.time + n.speed < 600,
      });
    }, 1000);
    return () => clearInterval(id);
  }, [s.playing]);
  useEffect(() => {
    if (s.buildTime && s.level !== currentLevel) s.set({ level: currentLevel });
  }, [currentLevel, s.buildTime]);
  useEffect(() => {
    const key = (e: KeyboardEvent) => {
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      const n = useStore.getState();
      if (e.code === "Space") {
        e.preventDefault();
        n.set({ playing: !n.playing });
      }
      if (e.key === "Escape") n.back();
      if (e.key.toLowerCase() === "r") n.reset();
      if (e.key.toLowerCase() === "e") n.set({ explode: !n.explode });
      if (e.key.toLowerCase() === "x") n.set({ xray: !n.xray });
    };
    window.addEventListener("keydown", key);
    return () => window.removeEventListener("keydown", key);
  }, []);
  useEffect(() => {
    if (demoTime === null) return;
    const id = setInterval(
      () => setDemoTime((t) => (t === null ? null : Math.min(360, t + 1))),
      1000,
    );
    return () => clearInterval(id);
  }, [demoTime === null]);
  useEffect(() => {
    if (demoTime === null) return;
    const i = Math.min(7, Math.floor(demoTime / 45));
    if (i === demoIndex) return;
    setDemoIndex(i);
    if (i === 0) s.set({ view: "rack", focus: null, mode: "presenter" });
    if (i === 1) s.drill(records.find((r) => r.type === "tray")!.id);
    if (i === 2) s.drill(records.find((r) => r.type === "accelerator")!.id);
    if (i === 3) setPanel("compare");
    if (i === 4) {
      setPanel("");
      s.set({ focus: null, overlay: "Liquid Cooling" });
    }
    if (i === 5) inject("INC-10");
    if (i === 6) s.set({ view: "row", focus: null, playing: true, speed: 10 });
    if (i === 7) {
      s.set({ playing: false });
      setTab("investigation");
    }
  }, [demoTime, demoIndex]);
  function inject(id = incidentId) {
    const i = incidents.find((x) => x.id === id)!;
    const r =
      records.find((x) => x.id === s.selected && x.type === i.type) ||
      records.find((x) => x.type === i.type) ||
      selected;
    const time = Math.floor(s.time);
    s.set({
      scenario: {
        ...s.scenario,
        events: [
          ...s.scenario.events.filter((e) => e.time <= time),
          { time, kind: "inject", incidentId: id, target: r.id },
        ],
      },
      selected: s.mode === "challenge" ? `${s.profile}/R${s.rack}/rack` : r.id,
      evidence: [],
      answer: false,
      hypothesis: null,
      decision: "",
      playing: true,
      experience: "Diagnose",
    });
    setTab("investigation");
  }
  function event(kind: "contain" | "recover") {
    if (!active) return;
    s.set({
      scenario: {
        ...s.scenario,
        events: [
          ...s.scenario.events,
          {
            time: Math.floor(s.time),
            kind,
            incidentId: active.id,
            target:
              s.scenario.events.filter((e) => e.kind === "inject").at(-1)
                ?.target || selected.id,
          },
        ],
      },
      decision:
        kind === "contain"
          ? "Contain affected domain"
          : "Recovery pending validation",
      playing: true,
    });
  }
  function select(r: ComponentRecord) {
    s.set({ selected: r.id });
    const n = Number(r.physicalLocation.rack.slice(-2));
    if (n) s.set({ rack: n });
  }
  async function importScenario(file: File) {
    try {
      if (file.size > 1048576) throw Error("Scenario exceeds 1 MiB");
      const sc = scenarioSchema.parse(
        JSON.parse(await file.text()),
      ) as Scenario;
      const rs = inventory(sc.profile as ProfileId, sc.racks);
      for (const e of sc.events)
        if (
          !incidents.some((i) => i.id === e.incidentId) ||
          !rs.some((r) => r.id === e.target)
        )
          throw Error("Unknown incident or component");
      s.changeProfile(sc.profile as ProfileId);
      s.set({ racks: sc.racks, scenario: sc, time: 0, playing: false });
      setError("Scenario imported; scrub or play to reproduce.");
    } catch (e) {
      setError(String(e));
    }
  }
  const tree = records
    .filter((r) => r.level <= s.level)
    .filter((r) =>
      search
        ? `${r.displayName} ${r.id} ${r.family}`
            .toLowerCase()
            .includes(search.toLowerCase())
        : s.focus
          ? r.parentId === s.focus
          : r.physicalLocation.rack ===
              `RACK-${String(s.rack).padStart(2, "0")}` &&
            (!r.parentId ||
              records.find((x) => x.id === r.parentId)?.type === "rack"),
    );
  const diagnostics = audit(records);
  const trace = useMemo(
    () =>
      Array.from(
        { length: 61 },
        (_, i) => snapshot(s.scenario, i * 10, incidents).racks[s.rack - 1],
      ),
    [s.scenario, incidents, s.rack],
  );
  const values = trace.map((r) =>
    metric === "temperature"
      ? r.temp
      : metric === "flow"
        ? r.flow
        : metric === "goodput"
          ? r.goodput
          : metric === "power"
            ? r.power
            : metric === "pressure"
              ? r.pressure
              : metric === "link"
                ? r.link
                : metric === "ecc"
                  ? r.ecc
                  : metric === "supply"
                    ? r.supply
                    : metric === "voltage"
                      ? r.voltage
                      : metric === "fec"
                        ? r.fec
                        : metric === "retries"
                          ? r.retries
                          : metric === "rxPower"
                            ? r.rxPower
                            : metric === "airTemp"
                              ? r.airTemp
                              : metric === "share"
                                ? r.share
                                : r.return,
  );
  const min = Math.min(...values, 0),
    max = Math.max(...values, 1),
    unit = ["temperature", "supply", "return", "airTemp"].includes(metric)
      ? "°C"
      : metric === "flow"
        ? "L/min"
        : metric === "goodput"
          ? "%"
          : metric === "power"
            ? "kW"
            : metric === "pressure"
              ? "kPa"
              : metric === "link"
                ? "Gbps"
                : metric === "voltage"
                  ? "V"
                  : metric === "share"
                    ? "%"
                    : metric === "rxPower"
                      ? "dBm"
                      : "events";
  if (catalogueOpen)
    return (
      <Suspense
        fallback={<div className="fallback">Loading local Rack Catalogue…</div>}
      >
        <Catalogue onClose={() => setCatalogueOpen(false)} />
      </Suspense>
    );
  return (
    <div
      data-render-state={JSON.stringify({
        profile: s.profile,
        level: s.level,
        selected: s.selected,
        focus: s.focus,
        view: s.view,
        rack: s.rack,
        camera: s.camera,
        quality: s.quality,
        cutaway: s.cutaway,
        explode: s.explode,
        time: s.time,
        panels: s.panels,
      })}
      className={`app ${s.reduced ? "reduced" : ""} ${s.mode} ${s.panels ? "" : "panels-collapsed"} experience-${s.experience.replaceAll(" ", "-")}`}
    >
      <header>
        <div className="experience-controls">
          <select
            aria-label="Explorer experience"
            value={s.experience}
            onChange={(e) =>
              s.set({
                experience: e.target.value as any,
                buildTime: e.target.value === "Assembly Timeline",
              })
            }
          >
            {["Inspect", "Diagnose", "Assembly Timeline"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <select
            aria-label="Graphics quality"
            value={s.quality}
            onChange={(e) => s.set({ quality: e.target.value as any })}
          >
            {["Performance", "Balanced", "Detail"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          <button onClick={() => s.set({ panels: !s.panels })}>
            {s.panels ? "Collapse panels" : "Show panels"}
          </button>
        </div>
        <div className="brand">
          <span className="brandmark">
            <img
              src="/brand/signal-intelligence-symbol.png"
              alt="Signal Intelligence symbol"
              width="90"
              height="90"
            />
          </span>
          <div>
            <span className="brand-name">SIGNAL INTELLIGENCE</span>
            <small>RACK-TO-ROW · 4D DIGITAL TWIN</small>
          </div>
        </div>
        <div className="header-status">● LOCAL SIMULATION</div>
        <button
          onClick={() => {
            s.set({ playing: false });
            setCatalogueOpen(true);
          }}
        >
          Rack Catalogue 2.0
        </button>
        <button onClick={() => setPanel("compare")}>
          Compare architectures
        </button>
        <button
          onClick={() => {
            setDemoIndex(-1);
            setDemoTime(demoTime === null ? 0 : null);
          }}
        >
          {demoTime === null ? "▶ 6-minute tour" : "■ Stop tour"}
        </button>
        <button onClick={() => setPanel("settings")}>
          Settings / Import Better Rack Model
        </button>
      </header>
      <div className="notice">
        {profile.badge}
        <span>All telemetry is synthetic. No affiliation or endorsement.</span>
      </div>
      <div className="workspace">
        <aside className="left">
          <div className="eyebrow">ARCHITECTURE</div>
          <select
            aria-label="Architecture profile"
            value={s.profile}
            onChange={(e) => {
              s.changeProfile(e.target.value as ProfileId);
              setAsset(null);
              setBinding(null);
            }}
          >
            {profiles.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
          <div className="segmented">
            <button
              className={s.view === "rack" ? "active" : ""}
              onClick={() => s.set({ view: "rack" })}
            >
              Single rack
            </button>
            <button
              className={s.view === "row" ? "active" : ""}
              onClick={() => s.set({ view: "row", focus: null })}
            >
              Row overview
            </button>
          </div>
          <div className="row">
            <label>
              Slots{" "}
              <select
                aria-label="Row slot count"
                value={s.racks}
                onChange={(e) => {
                  const racks = Number(e.target.value);
                  s.set({
                    racks,
                    rack: 1,
                    scenario: { ...s.scenario, racks, events: [] },
                    time: 0,
                  });
                }}
              >
                {[4, 6, 8, 10, 12].map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
            </label>
            <label>
              Visit{" "}
              <select
                aria-label="Visit rack"
                value={s.rack}
                onChange={(e) =>
                  s.set({
                    rack: Number(e.target.value),
                    view: "rack",
                    focus: null,
                    selected: `${s.profile}/R${e.target.value}/rack`,
                  })
                }
              >
                {Array.from({ length: s.racks }, (_, i) => (
                  <option key={i} value={i + 1}>
                    R{String(i + 1).padStart(2, "0")}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="eyebrow">ASSEMBLY / INTEGRATION</div>
          <label className="level-label">
            L{currentLevel}
            <span>{level.name}</span>
          </label>
          <input
            aria-label="Integration level"
            type="range"
            min="1"
            max="12"
            value={currentLevel}
            onChange={(e) =>
              s.set({ level: Number(e.target.value), buildTime: false })
            }
          />
          <div className="ticks">
            {levels.map((l) => (
              <button
                className={l.level === currentLevel ? "active" : ""}
                key={l.level}
                onClick={() => s.set({ level: l.level, buildTime: false })}
              >
                {l.level}
              </button>
            ))}
          </div>
          <button onClick={() => setPanel("gates")}>
            Gate evidence · {s.gatePass.length}/12 passed
          </button>
          <div className="eyebrow">SYSTEM LAYERS</div>
          <div className="overlays">
            {overlays.map((o, i) => (
              <button
                key={o}
                className={s.overlay === o ? "active" : ""}
                onClick={() =>
                  s.set({
                    overlay: o,
                    camera: o === "Liquid Cooling" ? "plumbing" : s.camera,
                    cameraKey: s.cameraKey + 1,
                  })
                }
              >
                <span>{["◇", "ϟ", "≈", "≋", "⌁", "◎", "▤", "⤳"][i]}</span>
                {o}
              </button>
            ))}
          </div>
          <div className="eyebrow">COMPONENT EXPLORER</div>
          <input
            placeholder="Search name, ID, subsystem…"
            aria-label="Search components"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div
            className="tree"
            role="tree"
            aria-label="Accessible component tree"
          >
            {tree.slice(0, 150).map((r) => (
              <button
                role="treeitem"
                aria-selected={s.selected === r.id}
                title={r.id}
                className={s.selected === r.id ? "selected" : ""}
                key={r.id}
                onClick={() => select(r)}
                onDoubleClick={() => s.drill(r.id)}
              >
                <span style={{ color: colors[r.family] }}>▪</span>{" "}
                {r.displayName}{" "}
                <span className="location-hint">{r.physicalLocation.rack}</span>
                <small>L{r.level}</small>
              </button>
            ))}
            {tree.length > 150 && <p>First 150 matches; refine search.</p>}
          </div>
          <button onClick={() => setPanel("diagnostics")}>
            Inventory & performance audit
          </button>
        </aside>
        <main>
          <div className="scene-top">
            <div>
              <span className="eyebrow">
                ROW-01 / RACK-{String(s.rack).padStart(2, "0")}
              </span>
              <h1>
                {s.focus
                  ? records.find((r) => r.id === s.focus)?.displayName
                  : s.view === "row"
                    ? "Infrastructure, connected."
                    : "Inside the AI rack."}
              </h1>
              <p>{profile.fabric}</p>
              <small className="cutaway-note">
                {s.camera === "graph"
                  ? "COMPUTATIONAL TOPOLOGY — NOT PHYSICAL CIRCUIT ROUTING"
                  : s.focus && s.cutaway
                    ? "CONCEPTUAL EXPOSED CUTAWAY — NOT VISIBLE THROUGH A SEALED PACKAGE"
                    : "ORIGINAL PROCEDURAL HARDWARE · ILLUSTRATIVE DIMENSIONS"}
              </small>
            </div>
            <div className="scene-badge">
              {s.overlay.toUpperCase()}
              <br />
              <small>SCHEMATIC · L{currentLevel}</small>
            </div>
          </div>
          <div className="canvas">
            {s.hovered && (
              <div className="hardware-hover">
                {records.find((r) => r.id === s.hovered)?.displayName} ·{" "}
                {records.find((r) => r.id === s.hovered)?.physicalLocation.rack}
              </div>
            )}
            {s.fallback ? (
              <div className="diagram">
                <h2>Accessible 2D system diagram</h2>
                <p>Shared CDU → compute manifolds → cold plates → return</p>
                <p>Feed A + Feed B → shelf → busbar → VRM → compute</p>
                <p>{profile.fabric}</p>
                <small className="cutaway-note">
                  {s.camera === "graph"
                    ? "COMPUTATIONAL TOPOLOGY — NOT PHYSICAL CIRCUIT ROUTING"
                    : s.focus && s.cutaway
                      ? "CONCEPTUAL EXPOSED CUTAWAY — NOT VISIBLE THROUGH A SEALED PACKAGE"
                      : "ORIGINAL PROCEDURAL HARDWARE · ILLUSTRATIVE DIMENSIONS"}
                </small>
                {records
                  .filter(
                    (r) => r.parentId === selected.id || r.type === "rack",
                  )
                  .map((r) => (
                    <button key={r.id} onClick={() => select(r)}>
                      {r.displayName} / {r.physicalLocation.rack}
                    </button>
                  ))}
              </div>
            ) : (
              <Suspense
                fallback={
                  <div className="fallback">Loading local WebGL engine…</div>
                }
              >
                <Scene
                  records={records}
                  affected={snap.racks
                    .filter((r) => r.affected)
                    .map((r) => r.rack)}
                  asset={asset}
                  binding={binding}
                />
              </Suspense>
            )}
          </div>
          <div className="camera-bar">
            <div className="layer-toggles">
              {(
                [
                  ["showChassis", "Chassis"],
                  ["showCoolant", "Coolant"],
                  ["showPower", "Power"],
                  ["showNetwork", "Network"],
                  ["showIds", "IDs"],
                  ["showFaults", "Fault propagation"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  aria-pressed={s[key]}
                  onClick={() => s.set({ [key]: !s[key] })}
                >
                  {label}
                </button>
              ))}
            </div>
            <button onClick={() => s.back()}>← Back</button>
            <button onClick={() => s.drill(selected.id)}>Drill In ↗</button>
            <select
              aria-label="Camera preset"
              value={s.camera}
              onChange={(e) =>
                s.set({ camera: e.target.value, cameraKey: s.cameraKey + 1 })
              }
            >
              {[
                "isometric",
                "orthographic",
                "front",
                "rear",
                "rear-service",
                "left",
                "right",
                "top",
                "inside",
                "plumbing",
                "aisle",
                "graph",
              ].map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
            <button
              aria-pressed={s.explode}
              onClick={() => s.set({ explode: !s.explode })}
            >
              Explode
            </button>
            <button
              aria-pressed={s.xray}
              onClick={() => s.set({ xray: !s.xray })}
            >
              X-ray
            </button>
            <button onClick={() => s.set({ doors: !s.doors })}>
              {s.doors ? "Close doors" : "Open doors"}
            </button>
            <button onClick={() => s.reset()}>Reset view</button>
            <button onClick={() => s.set({ cutaway: !s.cutaway })}>
              {s.cutaway ? "Photo / closed" : "CAD cutaway"}
            </button>
            <label className="mini-control">
              Explode{" "}
              <input
                aria-label="Explosion amount"
                type="range"
                min="0"
                max="1"
                step=".01"
                value={s.explode ? s.explosion : 0}
                onChange={(e) =>
                  s.set({
                    explosion: Number(e.target.value),
                    explode: Number(e.target.value) > 0,
                  })
                }
              />
            </label>
            <label className="mini-control">
              Height{" "}
              <input
                aria-label="Camera height"
                type="range"
                min="0"
                max="4.5"
                step=".1"
                value={s.height}
                onChange={(e) => s.set({ height: Number(e.target.value) })}
              />
            </label>
          </div>
          <div className="metrics">
            {[
              [
                "USEFUL CAPACITY",
                snap.capacity.toFixed(1),
                "%",
                compare ? "Baseline 100%" : "Synthetic workload goodput",
              ],
              [
                `RACK ${s.rack} JUNCTION`,
                snap.racks[s.rack - 1].temp.toFixed(1),
                "°C",
                "Illustrative thermal response",
              ],
              [
                "SECONDARY FLOW",
                snap.racks[s.rack - 1].flow.toFixed(0),
                "L/min",
                "Technology loop",
              ],
              [
                "THERMAL HEADROOM",
                snap.thermalHeadroom.toFixed(1),
                "°C",
                "Illustrative 95°C limit",
              ],
            ].map(([label, value, units, note]) => (
              <div key={label}>
                <small>{label}</small>
                <strong>
                  {value}
                  <em>{units}</em>
                </strong>
                <span>{note}</span>
              </div>
            ))}
          </div>
          <div className="timeline">
            <div className="row">
              <div className="eyebrow">
                4D / {s.buildTime ? "BUILD TIME · DAYS" : "RUNTIME · MINUTES"}
              </div>
              <button
                onClick={() =>
                  s.set({ buildTime: !s.buildTime, time: 0, playing: false })
                }
              >
                {s.buildTime ? "Runtime" : "Build time"}
              </button>
              <button
                onClick={() => setCompare(!compare)}
                aria-pressed={compare}
              >
                Baseline compare
              </button>
            </div>
            <div className="row">
              <button onClick={() => s.set({ playing: !s.playing })}>
                {s.playing ? "Ⅱ Pause" : "▶ Play"}
              </button>
              <select
                aria-label="Playback speed"
                value={s.speed}
                onChange={(e) => s.set({ speed: Number(e.target.value) })}
              >
                {[1, 10, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}×
                  </option>
                ))}
              </select>
              <button onClick={() => s.set({ time: Math.max(0, s.time - 30) })}>
                −30s
              </button>
              <input
                aria-label="Time scrubber"
                type="range"
                min="0"
                max="600"
                value={s.time}
                onChange={(e) =>
                  s.set({ time: Number(e.target.value), playing: false })
                }
              />
              <b>
                {s.buildTime
                  ? `Day ${Math.floor(s.time / 5)}`
                  : `${Math.floor(s.time / 60)}:${String(Math.floor(s.time % 60)).padStart(2, "0")}`}
              </b>
              <button
                onClick={() => s.set({ bookmarks: [...s.bookmarks, s.time] })}
              >
                Bookmark
              </button>
            </div>
            <div className="row">
              <select
                aria-label="Metric trace"
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
              >
                {[
                  "temperature",
                  "flow",
                  "goodput",
                  "power",
                  "pressure",
                  "link",
                  "ecc",
                  "supply",
                  "return",
                  "voltage",
                  "fec",
                  "retries",
                  "rxPower",
                  "airTemp",
                  "share",
                ].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <small>
                {unit} · {Math.min(...values).toFixed(1)}–
                {Math.max(...values).toFixed(1)} · synthetic / illustrative{" "}
                {compare ? "· dashed baseline" : ""}
              </small>
              {s.bookmarks.map((t, i) => (
                <button
                  key={i}
                  onClick={() => s.set({ time: t, playing: false })}
                >
                  {Math.floor(t)}s
                </button>
              ))}
            </div>
            <svg
              className="chart"
              viewBox="0 0 600 55"
              role="img"
              aria-label={`${metric} in ${unit}, synthetic data`}
            >
              <path
                d={`M ${values.map((v, i) => `${i * 10},${48 - ((v - min) / (max - min)) * 40}`).join(" L ")}`}
                fill="none"
                stroke="var(--brand-accent)"
                strokeWidth="1.6"
              />
              {compare && (
                <line
                  x1="0"
                  x2="600"
                  y1={
                    48 -
                    (((metric === "temperature"
                      ? 58.4
                      : metric === "flow"
                        ? 120
                        : metric === "goodput"
                          ? 100
                          : metric === "power"
                            ? 96
                            : metric === "pressure"
                              ? 80
                              : metric === "link"
                                ? 400
                                : 0) -
                      min) /
                      (max - min)) *
                      40
                  }
                  y2={
                    48 -
                    (((metric === "temperature"
                      ? 58.4
                      : metric === "flow"
                        ? 120
                        : metric === "goodput"
                          ? 100
                          : metric === "power"
                            ? 96
                            : metric === "pressure"
                              ? 80
                              : metric === "link"
                                ? 400
                                : 0) -
                      min) /
                      (max - min)) *
                      40
                  }
                  stroke="#8da4b8"
                  strokeDasharray="4 4"
                />
              )}
              <line x1={s.time} x2={s.time} y1="0" y2="55" stroke="#e9bf77" />
            </svg>
            <small>
              {metric === "temperature"
                ? "Lumped junction response; rack-dependent time constants."
                : metric === "flow"
                  ? "Volumetric technology-coolant flow; assumed water Cp 4180 J/kg·K."
                  : metric === "goodput"
                    ? "Useful workload relative to illustrative nominal capacity."
                    : metric === "power"
                      ? "DC load; P=VI; conversion efficiency assumed 95%."
                      : "Illustrative telemetry, not measured equipment data."}
            </small>
            <div className="event-tape">
              {snap.chronology.map((e, i) => (
                <button
                  key={i}
                  onClick={() => s.set({ time: e.time, playing: false })}
                >
                  {e.time}s · {e.text}
                </button>
              ))}
            </div>
            {s.buildTime && (
              <p>
                Day {Math.floor(s.time / 5)} · BOM EDU-
                {currentLevel < 5 ? "A" : currentLevel < 9 ? "B" : "C"} ·{" "}
                {level.phase} · fictional cooler lead time 21 days ·
                qualification hold affects pilot quantity.
              </p>
            )}
          </div>
        </main>
        <aside className="inspector">
          <div className="eyebrow">COMPONENT INTELLIGENCE</div>
          <h2>{selected.displayName}</h2>
          <code>{selected.id}</code>
          <div className="badge">ILLUSTRATIVE · REPRESENTATIVE SIGNATURE</div>
          <div className="tabs">
            {["intelligence", "evidence", "investigation"].map((t) => (
              <button
                className={tab === t ? "active" : ""}
                key={t}
                onClick={() => setTab(t)}
              >
                {t}
              </button>
            ))}
          </div>
          <p className="role-brief">
            {s.role} ·{" "}
            {s.role === "Hardware engineer"
              ? "Which independent signal separates physical and firmware causes?"
              : s.role === "Site ops / SRE"
                ? "Which workloads and dependency domains need safe containment?"
                : s.role === "Manufacturing-quality lead"
                  ? "Which serial/lot, ECO and recurrence evidence controls acceptance?"
                  : "Who owns the decision, what blocks release, and what is the schedule exposure?"}
          </p>
          {tab === "intelligence" ? (
            <>
              <section>
                <h3>What is it?</h3>
                <p>{selected.shortDescription}</p>
                <h3>Why it matters</h3>
                <p>{selected.whyItMatters}</p>
              </section>
              <section>
                <h3>What would I see?</h3>
                <p className="signature">
                  △ {selected.primaryFailureSignature}
                </p>
                <h3>How do I distinguish it?</h3>
                {selected.evidenceToCollect.map((t) => (
                  <p key={t}>{t}</p>
                ))}
                <small>
                  Alternative: {selected.alternativeExplanations[0]}
                </small>
              </section>
              <details>
                <summary>Engineer depth / operating principle</summary>
                <p>{selected.normalOperatingPrinciple}</p>
                <p>{selected.secondarySignatures}</p>
                <p>Telemetry: {selected.telemetryKeys.join(", ")}</p>
                <p>{selected.applicabilityNotes}</p>
                {s.profile === "NVIDIA_GB200_NVL72_REFERENCE" && (
                  <p>
                    NVIDIA Xid examples: 48 (double-bit ECC), 79 (fallen off
                    bus), 74 (NVLink error) require generation-appropriate logs
                    and differential diagnosis; no code alone proves a failed
                    part.
                  </p>
                )}
                {s.profile === "GOOGLE_IRONWOOD_TPU_REFERENCE" && (
                  <p>
                    ICI/OCS and host DCN are distinct. Xid is not a TPU code.
                    MXU and vector blocks are functional illustrations within a
                    sealed package.
                  </p>
                )}
              </details>
              <section>
                <h3>What breaks next?</h3>
                <p>
                  {selected.type === "pump"
                    ? "Shared compute cooling loop → manifold flow → thermal margin → workload derating. Network and storage racks are outside this assumed liquid domain."
                    : selected.type === "hbm"
                      ? "Local memory integrity and device capacity; no edge to other racks."
                      : `${selected.family} service and explicit graph descendants.`}
                </p>
                <small>
                  {descendants(selected.id, edges).length - 1} downstream nodes
                </small>
                <h3>How do I confirm it is fixed?</h3>
                {selected.validationTests
                  .concat(selected.exitCriteria)
                  .map((t) => (
                    <p key={t}>{t}</p>
                  ))}
              </section>
              <section>
                <h3>TPM decision and DRI</h3>
                <p>{selected.ownerFunctions.join(" + ")}</p>
                <small>BOM EDU-C · serial SI-2026-0001 · fictional</small>
                <button
                  onClick={() => {
                    const i = incidents.find((i) => i.type === selected.type);
                    if (i) {
                      setIncidentId(i.id);
                      inject(i.id);
                    } else {
                      setTab("investigation");
                      setError(
                        "Choose a relevant family preset; this part has no dedicated preset.",
                      );
                    }
                  }}
                >
                  Investigate selected component
                </button>
              </section>
              <details>
                <summary>Sources & applicability</summary>
                <p>
                  Diagnostics and placement are authored illustrative
                  assumptions. Linked sources support profile context:
                </p>
                {sources
                  .filter((x) => selected.sourceIds.includes(x.id))
                  .map((x) => (
                    <p key={x.id}>
                      {x.url ? (
                        <a href={x.url} target="_blank" rel="noreferrer">
                          {x.organization} / {x.id} ↗
                        </a>
                      ) : (
                        x.supportedFacts
                      )}
                      <small>
                        {x.checkedDate} · {x.supportedFacts}
                      </small>
                    </p>
                  ))}
              </details>
            </>
          ) : tab === "evidence" ? (
            <>
              <h3>Discriminating tests</h3>
              {selected.evidenceToCollect.map((t) => (
                <p key={t}>{t}</p>
              ))}
              <h3>Validation</h3>
              <p>{selected.validationTests}</p>
              <button onClick={() => setPanel("gates")}>Open owned gate</button>
              <h3>Safety stop</h3>
              <p>{selected.safeTriageSteps[1]}</p>
            </>
          ) : (
            <>
              <div className="eyebrow">INCIDENT LAB · 36 PRESETS</div>
              <select
                aria-label="Incident preset"
                value={incidentId}
                onChange={(e) => setIncidentId(e.target.value)}
              >
                {incidents.map((i) => (
                  <option key={i.id} value={i.id}>
                    L{i.level} ·{" "}
                    {s.mode === "challenge"
                      ? `Challenge ${i.id} / ${i.domain}`
                      : i.title}
                  </option>
                ))}
              </select>
              <p>{incidents.find((i) => i.id === incidentId)!.impact}</p>
              <button className="primary wide" onClick={() => inject()}>
                Inject simulated fault
              </button>
              {active ? (
                <>
                  <details>
                    <summary>Observed rack telemetry / synthetic</summary>
                    <pre>{JSON.stringify(snap.racks[s.rack - 1], null, 2)}</pre>
                  </details>
                  <h3>
                    {s.mode === "challenge" && !s.answer && discriminating < 2
                      ? "Masked diagnosis challenge"
                      : active.title}
                  </h3>
                  <div className="rca">
                    <h3>RCA hypothesis graph</h3>
                    <p>
                      Signature → {discriminating} discriminating tests →
                      hypotheses → decision
                    </p>
                    {active.hypotheses.map((h, i) => (
                      <div key={h}>
                        <b>
                          {discriminating ? (i === 0 ? "↑" : "↓") : "?"}{" "}
                          {s.mode === "challenge" &&
                          !s.answer &&
                          discriminating < 2
                            ? `Candidate ${i + 1}`
                            : h}
                        </b>
                        <small>
                          {discriminating
                            ? i === 0
                              ? `${discriminating} supporting synthetic tests`
                              : "No supporting evidence"
                            : "unverified"}
                        </small>
                      </div>
                    ))}
                  </div>
                  {active.evidence.map((e) => (
                    <div className="test" key={e.label}>
                      <button
                        onClick={() =>
                          s.set({
                            evidence: [...new Set([...s.evidence, e.label])],
                          })
                        }
                      >
                        {s.evidence.includes(e.label)
                          ? "✓ Collected"
                          : "Collect"}{" "}
                        · {e.label}
                      </button>
                      {s.evidence.includes(e.label) && <p>{e.result}</p>}
                    </div>
                  ))}
                  <button onClick={() => s.set({ answer: !s.answer })}>
                    {s.answer ? "Mask answer" : "Show answer"}
                  </button>
                  {(s.answer || discriminating >= 2) && (
                    <p className="signature">
                      Injected truth: {active.hypotheses[0]}.{" "}
                      {discriminating >= 2
                        ? "Tested in synthetic fixtures."
                        : "Assumed; not corroborated."}
                    </p>
                  )}
                  <h3>Contain → recover → prevent</h3>
                  <p>{active.containment}</p>
                  <button
                    disabled={discriminating < 2}
                    onClick={() => event("contain")}
                  >
                    Choose containment
                  </button>
                  <p>
                    STOP: physical intervention requires qualified
                    personnel/SOPs. Simulation state only.
                  </p>
                  <button
                    disabled={!snap.contained}
                    onClick={() => event("recover")}
                  >
                    Apply simulated recovery
                  </button>
                  <p>{active.recovery}</p>
                  <p>{active.prevention}</p>
                  <h3>Classify the likely cause</h3>
                  <select
                    aria-label="Hypothesis decision"
                    value={s.hypothesis ?? ""}
                    onChange={(e) =>
                      s.set({
                        hypothesis:
                          e.target.value === "" ? null : Number(e.target.value),
                      })
                    }
                  >
                    <option value="">Choose evidence-backed hypothesis…</option>
                    {active.hypotheses.map((h, i) => (
                      <option key={h} value={i}>
                        {s.mode === "challenge" &&
                        !s.answer &&
                        discriminating < 2
                          ? `Candidate ${i + 1}`
                          : h}
                      </option>
                    ))}
                  </select>
                  <h3>TPM release decision</h3>
                  <select
                    aria-label="Release decision"
                    value={s.decision}
                    onChange={(e) => s.set({ decision: e.target.value })}
                  >
                    <option value="">Choose decision…</option>
                    <option>Hold release; validation incomplete</option>
                    <option>
                      Controlled workaround; qualification required
                    </option>
                    <option>Engineering redesign / ECO</option>
                    <option>
                      Procurement acceleration; approved alternate only
                    </option>
                    <option
                      disabled={
                        discriminating < 2 || s.hypothesis !== 0 || snap.active
                      }
                    >
                      Release after validated recovery
                    </option>
                  </select>
                  <p>
                    DRI: {active.owner} · evidence {discriminating}/2 · capacity{" "}
                    {snap.capacity.toFixed(1)}%
                  </p>
                </>
              ) : (
                <p>Inject a preset to begin evidence-first investigation.</p>
              )}
              <button
                className="wide"
                onClick={() => download("incident-report.json", report)}
              >
                Export incident report JSON
              </button>
              <button
                className="wide"
                onClick={() =>
                  download(
                    "TPM-decision-brief.md",
                    `# TPM decision brief\n\n${JSON.stringify(report, null, 2)}`,
                  )
                }
              >
                Export human-readable brief
              </button>
              <button onClick={() => download("scenario.json", s.scenario)}>
                Export replay
              </button>
              <label className="file-label">
                Import replay
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) =>
                    e.target.files?.[0] && importScenario(e.target.files[0])
                  }
                />
              </label>
            </>
          )}
        </aside>
      </div>
      <footer>
        <span>
          ◈ Illustrative geometry · synthetic signals · educational mapping
        </span>
        <span>
          {diagnostics.types} types / {diagnostics.nodes.toLocaleString()}{" "}
          authored nodes · Space play · Esc back · R reset · E explode · X X-ray
        </span>
        <button onClick={() => setPanel("diagnostics")}>{perf.fps} FPS</button>
      </footer>
      {demoTime !== null && (
        <div className="demo">
          <b>
            Tour {Math.floor(demoTime / 60)}:
            {String(demoTime % 60).padStart(2, "0")} / 6:00
          </b>
          <span>
            {demoTime === 360
              ? "Tour complete — export your release decision"
              : chapters[Math.max(0, demoIndex)]}
          </span>
          <button
            onClick={() => setDemoTime(Math.min(360, (demoIndex + 1) * 45))}
          >
            Next chapter
          </button>
        </div>
      )}
      {panel && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label={panel}
          >
            <button className="close" onClick={() => setPanel("")}>
              Close ×
            </button>
            {panel === "compare" ? (
              <>
                <div className="eyebrow">ARCHITECTURES / COMMON TAXONOMY</div>
                <h2>Different fabrics. Shared engineering questions.</h2>
                <div className="compare-grid">
                  {profiles.map((p) => (
                    <section key={p.id}>
                      <h3>{p.name}</h3>
                      <p>{p.badge}</p>
                      <dl>
                        <dt>Compute</dt>
                        <dd>
                          {p.trays} trays/hosts × {p.chipsPerTray} ={" "}
                          {p.trays * p.chipsPerTray} accelerators
                        </dd>
                        <dt>Memory</dt>
                        <dd>Accelerator HBM separate from host memory</dd>
                        <dt>Interconnect</dt>
                        <dd>{p.fabric}</dd>
                        <dt>Cooling</dt>
                        <dd>Liquid-cooled packages; residual airflow</dd>
                        <dt>Power / management</dt>
                        <dd>
                          {p.id === "NVIDIA_GB200_NVL72_REFERENCE"
                            ? "8 shelves × 6 PSUs documented"
                            : "Auxiliary inventory illustrative"}
                          ; separate OOB
                        </dd>
                        <dt>Validation</dt>
                        <dd>
                          Memory RAS, enumeration, thermal/fabric and recovery
                          evidence
                        </dd>
                      </dl>
                      <button
                        onClick={() => {
                          s.changeProfile(p.id as ProfileId);
                          setPanel("");
                        }}
                      >
                        Explore profile
                      </button>
                    </section>
                  ))}
                </div>
                <p>
                  Anthropic’s Google TPU usage and Fluidstack’s Anthropic
                  data-center relationship are separate announcements,
                  establishing no Fluidstack equipment deployment. NVIDIA’s
                  eight-compute-rack scalable unit is separate from this
                  mixed-role illustrative row.
                </p>
              </>
            ) : panel === "diagnostics" ? (
              <>
                <h2>Inventory / runtime audit</h2>
                <pre>
                  {JSON.stringify(
                    {
                      ...diagnostics,
                      renderedScope:
                        s.focus ||
                        "major assemblies; internals revealed on drill",
                      fps: perf.fps,
                      drawCalls: perf.calls,
                      triangles: perf.triangles,
                      geometries: perf.geometries,
                      textures: perf.textures,
                      materials: perf.materials,
                      renderer: perf.renderer,
                      dpr: perf.dpr,
                      fpsSamples: perf.fpsSamples,
                      quality: perf.quality,
                      tick,
                      graphEdges: edges.length,
                      hardware: hardwareAudit,
                    },
                    null,
                    2,
                  )}
                </pre>
                <p>
                  Source coverage counts linked context, not verified card
                  claims. FPS is a live sample, not a device guarantee.
                </p>
                <button
                  onClick={() =>
                    download("inventory-audit.json", {
                      ...diagnostics,
                      perf,
                      edges,
                    })
                  }
                >
                  Export audit
                </button>
              </>
            ) : panel === "gates" ? (
              <>
                <h2>
                  L{currentLevel} / {level.name}
                </h2>
                <p>{level.note}</p>
                <p>
                  DRI {level.owner} · NPI crosswalk {level.phase}
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={gateFault}
                    onChange={(e) => setGateFault(e.target.checked)}
                  />{" "}
                  Simulate a failing acceptance fixture
                </label>
                {level.tests.map((test) => {
                  const key = `${s.profile}:L${currentLevel}:${test}`;
                  return (
                    <div className="test" key={key}>
                      <b>{test}</b>
                      <button
                        onClick={() =>
                          s.set({
                            gateTests: {
                              ...s.gateTests,
                              [key]:
                                gateFault || snap.active
                                  ? "FAIL — synthetic fixture / open fault"
                                  : "PASS — synthetic validation fixture",
                            },
                          })
                        }
                      >
                        Run simulated test
                      </button>
                      <span>{s.gateTests[key] || "Evidence pending"}</span>
                      <input
                        aria-label={`Evidence note ${test}`}
                        placeholder="Artifact / reviewer note"
                        onBlur={(e) => {
                          if (e.target.value)
                            s.set({
                              gateTests: {
                                ...s.gateTests,
                                [key + ":note"]: e.target.value,
                              },
                            });
                        }}
                      />
                    </div>
                  );
                })}
                <p>Guided parts:</p>
                {records
                  .filter((r) => r.level === currentLevel)
                  .slice(0, 5)
                  .map((r) => (
                    <button
                      key={r.id}
                      onClick={() => {
                        select(r);
                        s.drill(r.parentId || r.id);
                        setPanel("");
                      }}
                    >
                      {r.displayName}
                    </button>
                  ))}
                {incidents
                  .filter((i) => i.level === currentLevel)
                  .map((i) => (
                    <p key={i.id}>
                      <button
                        onClick={() => {
                          setIncidentId(i.id);
                          inject(i.id);
                          setPanel("");
                        }}
                      >
                        {i.title}
                      </button>{" "}
                      · differential: {i.hypotheses[1]}
                    </p>
                  ))}
                <button
                  disabled={
                    !level.tests.every((t) =>
                      s.gateTests[
                        `${s.profile}:L${currentLevel}:${t}`
                      ]?.startsWith("PASS"),
                    ) ||
                    snap.active ||
                    (currentLevel > 1 && !s.gatePass.includes(currentLevel - 1))
                  }
                  onClick={() =>
                    s.set({
                      gatePass: [...new Set([...s.gatePass, currentLevel])],
                    })
                  }
                >
                  Sign earned L{currentLevel} pass
                </button>
                <p>
                  Sequential pass requires previous level, three synthetic test
                  passes and no active incident. Never physical qualification.
                </p>
                <h3>Separate facility / row readiness</h3>
                {facility.map((f) => (
                  <label className="facility" key={f}>
                    <input
                      type="checkbox"
                      checked={s.facility[f] || false}
                      disabled={s.gatePass.length !== 12}
                      onChange={(e) =>
                        s.set({
                          facility: { ...s.facility, [f]: e.target.checked },
                        })
                      }
                    />
                    {f} · {s.facility[f] ? "simulated signoff" : "pending"}
                  </label>
                ))}
              </>
            ) : (
              <>
                <h2>Workspace settings & local model adapter</h2>
                <div className="row">
                  <label>
                    Mode{" "}
                    <select
                      aria-label="Operational mode"
                      value={s.mode}
                      onChange={(e) =>
                        s.set({
                          mode: e.target.value,
                          ...(e.target.value === "executive"
                            ? { view: "row", focus: null }
                            : {}),
                        })
                      }
                    >
                      {["guided", "challenge", "executive", "presenter"].map(
                        (v) => (
                          <option key={v}>{v}</option>
                        ),
                      )}
                    </select>
                  </label>
                  <label>
                    Role{" "}
                    <select
                      aria-label="Operational role"
                      value={s.role}
                      onChange={(e) => s.set({ role: e.target.value })}
                    >
                      {[
                        "Hardware engineer",
                        "Site ops / SRE",
                        "Manufacturing-quality lead",
                        "NPI TPM",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                </div>
                <p>
                  {s.role === "Hardware engineer"
                    ? "Prioritize signal/physical evidence and differential diagnosis."
                    : s.role === "Site ops / SRE"
                      ? "Prioritize affected services, containment and recovery."
                      : s.role === "Manufacturing-quality lead"
                        ? "Prioritize serial/lot traceability, ECO and recurrence."
                        : "Prioritize dependencies, schedule, decision owner and release evidence."}
                </p>
                <label>
                  <input
                    type="checkbox"
                    checked={s.reduced}
                    onChange={(e) => s.set({ reduced: e.target.checked })}
                  />{" "}
                  Reduced motion
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={s.fallback}
                    onChange={(e) => s.set({ fallback: e.target.checked })}
                  />{" "}
                  Accessible 2D fallback
                </label>
                <h3>Import Better Rack Model</h3>
                <p>
                  Browser-local only. Self-contained GLB/glTF, STL or PNG
                  reference plane; 50 MiB, 2,000 meshes, one million vertices
                  maximum. External resources and unsupported extensions
                  blocked. CAD/USDZ require GLB export. PNG remains a flat
                  reference, never a reconstructed rack. Format containment is
                  not antivirus scanning.
                </p>
                <input
                  aria-label="Local rack model"
                  type="file"
                  accept=".glb,.gltf,.stl,.png"
                  onChange={async (e) => {
                    try {
                      const a = await loadAsset(e.target.files![0]);
                      setAsset(a);
                      setBinding(null);
                      setMesh(a.names[0]);
                      let b: Binding = {
                        version: 1,
                        assetName: a.name,
                        attribution: "",
                        license: "",
                        scale: 1,
                        rotation: 0,
                        xray: false,
                        meshes: {},
                      };
                      try {
                        const saved = JSON.parse(
                          localStorage.getItem("rack-mapping:" + a.name) ||
                            "null",
                        );
                        if (saved) b = saved;
                      } catch {}
                      setDraft(b);
                      setError(
                        `Loaded ${a.name}; bind meshes before replacing rack.`,
                      );
                    } catch (e) {
                      setError(String(e));
                    }
                  }}
                />
                {asset && draft && (
                  <>
                    <p>
                      {asset.name} · bounds{" "}
                      {asset.bounds.map((v) => v.toFixed(3)).join(" × ")} model
                      units · centered and normalized
                    </p>
                    <div className="mapping">
                      <select
                        aria-label="Asset mesh"
                        value={mesh}
                        onChange={(e) => setMesh(e.target.value)}
                      >
                        {asset.names.map((n) => (
                          <option key={n}>{n}</option>
                        ))}
                      </select>
                      <input
                        aria-label="Binding search"
                        placeholder="Search component to bind"
                        value={target}
                        onChange={(e) => setTarget(e.target.value)}
                      />
                      <select
                        aria-label="Bind component"
                        value={draft.meshes[mesh] || ""}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            meshes: { ...draft.meshes, [mesh]: e.target.value },
                          })
                        }
                      >
                        <option value="">Choose stable ID…</option>
                        {records
                          .filter((r) =>
                            `${r.displayName} ${r.id}`
                              .toLowerCase()
                              .includes(target.toLowerCase()),
                          )
                          .slice(0, 200)
                          .map((r) => (
                            <option key={r.id} value={r.id}>
                              {r.displayName} · {r.id}
                            </option>
                          ))}
                      </select>
                    </div>
                    <input
                      aria-label="Model attribution"
                      placeholder="Attribution / source"
                      value={draft.attribution}
                      onChange={(e) =>
                        setDraft({ ...draft, attribution: e.target.value })
                      }
                    />
                    <input
                      aria-label="Model license"
                      placeholder="License / permission"
                      value={draft.license}
                      onChange={(e) =>
                        setDraft({ ...draft, license: e.target.value })
                      }
                    />
                    <label>
                      Scale
                      <input
                        type="number"
                        min=".01"
                        max="100"
                        step=".1"
                        value={draft.scale}
                        onChange={(e) =>
                          setDraft({ ...draft, scale: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label>
                      Rotation °
                      <input
                        type="number"
                        value={draft.rotation}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            rotation: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label>
                      <input
                        type="checkbox"
                        checked={draft.xray}
                        onChange={(e) =>
                          setDraft({ ...draft, xray: e.target.checked })
                        }
                      />{" "}
                      X-ray imported geometry
                    </label>
                    <pre>{JSON.stringify(draft.meshes, null, 2)}</pre>
                    <button
                      onClick={() => {
                        const errors = validateBinding(
                          draft,
                          asset.names,
                          records.map((r) => r.id),
                        );
                        if (!Object.keys(draft.meshes).length)
                          errors.push("At least one binding required");
                        if (errors.length) setError(errors.join("; "));
                        else {
                          setBinding(draft);
                          localStorage.setItem(
                            "rack-mapping:" + asset.name,
                            JSON.stringify(draft),
                          );
                          s.set({ focus: null, view: "rack" });
                          s.reset();
                          setPanel("");
                          setError(
                            "Mapping applied; bound meshes retain diagnostic records.",
                          );
                        }
                      }}
                    >
                      Validate, preview & apply mapping
                    </button>
                    <button
                      onClick={() => download("rack-mapping.json", draft)}
                    >
                      Export versioned mapping
                    </button>
                    <label className="file-label">
                      Import mapping
                      <input
                        type="file"
                        accept=".json"
                        onChange={async (e) => {
                          try {
                            const b = JSON.parse(
                              await e.target.files![0].text(),
                            );
                            const errs = validateBinding(
                              b,
                              asset.names,
                              records.map((r) => r.id),
                            );
                            if (errs.length) throw Error(errs.join("; "));
                            setDraft(b);
                          } catch (e) {
                            setError(String(e));
                          }
                        }}
                      />
                    </label>
                    <button
                      onClick={() => {
                        setBinding(null);
                        setPanel("");
                      }}
                    >
                      Return to procedural geometry
                    </button>
                  </>
                )}
                <h3>Scenario & sources</h3>
                <button onClick={() => download("scenario.json", s.scenario)}>
                  Export scenario
                </button>
                <label className="file-label">
                  Import scenario
                  <input
                    type="file"
                    accept=".json"
                    onChange={(e) =>
                      e.target.files?.[0] && importScenario(e.target.files[0])
                    }
                  />
                </label>
                <button
                  onClick={() => download("source-manifest.json", sources)}
                >
                  Export source manifest
                </button>
                <p>
                  Bundled local geometry and data. Source links access
                  documentation only on explicit navigation.
                </p>
              </>
            )}
            {error && (
              <p className="error" role="status">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
      {error && !panel && (
        <button className="toast" onClick={() => setError("")}>
          {error} ×
        </button>
      )}
    </div>
  );
}
