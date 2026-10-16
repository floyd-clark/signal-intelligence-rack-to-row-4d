import { useEffect, useMemo, useState } from "react";
import {
  architectures,
  architectureById,
  whyDifferent,
  representativePart,
} from "../registry";
import { sourceById } from "../sources/register";
import { useCatalogue } from "../store";
import { StudioScene, catalogueAudit, captureCatalogue } from "./StudioScene";
import { builders } from "../models";
import { resolveArchitecture } from "../variants";
import {
  catalogueFaults,
  blankReplay,
  catalogueSnapshot,
  importCatalogueReplay,
  dcCurrent,
  threePhaseCurrent,
} from "../scenarios/engine";
import type { Architecture, Concept, FamilyId } from "../types";
import { lifecycleKey } from "../lifecycle";
import { AssemblyStages, LifecyclePanel } from "./Lifecycle";
import "./catalogue.css";
import type { ProfileId } from "../../data/model";
import {
  SignalBrand,
  WorkbenchFrame,
  ComponentIntelligence,
} from "../../ui/Workbench";
import { WorkbenchRail } from "./WorkbenchRail";
import { WorkbenchTimeline } from "./WorkbenchTimeline";
import { downstreamParts, intelligenceFor, systemLayers } from "../workbench";
import { catalogueModels, ModelImport } from "./ModelImport";
import { Investigation } from "./Investigation";
import { inspectionView } from "../models/inspection";
const concepts: Concept[] = [
  "compute",
  "memory",
  "power",
  "cooling",
  "network",
  "service",
];
const overlays = [...systemLayers, "Cooling"];
function save(name: string, data: unknown) {
  const url = URL.createObjectURL(
    new Blob(
      [typeof data === "string" ? data : JSON.stringify(data, null, 2)],
      { type: "application/json" },
    ),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 500);
}
export function Catalogue({
  onClose,
}: {
  onClose: (profile?: ProfileId) => void;
}) {
  const s = useCatalogue();
  const [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [tab, setTab] = useState("Intelligence"),
    [inspectorSide, setInspectorSide] = useState<"a" | "b">("a"),
    [diagnostic, setDiagnostic] = useState(false),
    [inspectorOpen, setInspectorOpen] = useState(true),
    [tick, setTick] = useState(0),
    [message, setMessage] = useState(""),
    [workload, setWorkload] = useState("Model-parallel training"),
    [facility, setFacility] = useState("Liquid-ready"),
    [budget, setBudget] = useState(50),
    [uptime, setUptime] = useState("Redundancy-first"),
    [settingsOpen, setSettingsOpen] = useState(false),
    [modelRevision, setModelRevision] = useState(0);
  const a = useMemo(
      () => resolveArchitecture(architectureById[s.a], s.variantA),
      [s.a, s.variantA],
    ),
    b = useMemo(
      () => resolveArchitecture(architectureById[s.b], s.variantB),
      [s.b, s.variantB],
    ),
    d = s.screen === "compare" && inspectorSide === "b" ? b : a;
  const level = s.assemblyLevels[lifecycleKey(d)] ?? 12;
  useEffect(() => {
    if (s.screen !== "compare") setInspectorSide("a");
  }, [s.screen]);
  const replay = s.replays[d.architectureId] || blankReplay(d.architectureId),
    snap = catalogueSnapshot(d, replay, s.time);
  const openIncident =
    !!snap.fault && (replay.recoveredAt === null || snap.strength > 0.02);
  const current = d.components.find(
    (p) => p.id === s.selections[d.architectureId],
  );
  const selected =
    current?.concept === s.concept ? current : representativePart(d, s.concept);
  const intelligence = useMemo(
    () => intelligenceFor(d, selected),
    [d, selected],
  );
  const downstream = useMemo(() => downstreamParts(d, selected), [d, selected]);
  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    if (!s.playing) return;
    const t = setInterval(
      () =>
        useCatalogue.setState((v) => ({
          time: Math.min(600, v.time + v.speed),
          playing: v.time + v.speed < 600,
        })),
      1000,
    );
    return () => clearInterval(t);
  }, [s.playing]);
  useEffect(() => {
    if (s.tour === null) return;
    const t = setInterval(
      () =>
        useCatalogue.setState((v) => ({
          tour: (v.tour || 0) >= 59 ? null : (v.tour || 0) + 1,
        })),
      1000,
    );
    return () => clearInterval(t);
  }, [s.tour]);
  useEffect(() => {
    if (!s.buildTime) return;
    const next = Math.min(12, Math.floor(s.time / 50) + 1);
    for (const model of s.screen === "compare" ? [a, b] : [a])
      if ((s.assemblyLevels[lifecycleKey(model)] ?? 12) !== next)
        s.setAssemblyLevel(model, next);
  }, [s.buildTime, s.time, a, b, s.screen]);
  const chapter = s.tour === null ? -1 : Math.floor(s.tour / 10);
  useEffect(() => {
    if (chapter < 0) return;
    const views = ["rack", "rack", "tray", "topology", "rack", "rack"] as const;
    s.set({
      focus: views[chapter],
      camera: chapter === 1 ? "rear" : "oblique",
      cameraRevision: s.cameraRevision + 1,
      cutaway: chapter === 2,
    });
    if (chapter === 4) {
      s.inject(s.a, `${s.a}-1`);
      s.set({ playing: true });
    }
  }, [chapter]);
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (
        ["INPUT", "SELECT", "TEXTAREA"].includes(
          (e.target as HTMLElement).tagName,
        )
      )
        return;
      if (e.key === "Escape") s.back();
      if (e.key === " ") {
        e.preventDefault();
        useCatalogue.setState((v) => ({ playing: !v.playing }));
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);
  const physical =
    !!a.knownPhysicalDimensions &&
    (s.screen !== "compare" || !!b.knownPhysicalDimensions);
  const visible = architectures.filter(
    (d) =>
      `${d.familyName} ${d.generation} ${d.fabric} ${d.cooling} ${d.power}`
        .toLowerCase()
        .includes(search.toLowerCase()) &&
      (filter === "all" || d.cooling === filter || d.shape === filter),
  );
  return (
    <div
      className={`cat-root app cat-unified ${s.screen === "gallery" ? "cat-gallery-mode" : ""} ${inspectorOpen ? "" : "panels-collapsed"} experience-${s.experience.replaceAll(" ", "-")}`}
      data-testid="catalogue"
      data-family-a={s.a}
      data-family-b={s.b}
      data-focus={s.focus}
      data-time={s.time}
      data-level-a={s.assemblyLevels[lifecycleKey(a)] ?? 12}
      data-level-b={s.assemblyLevels[lifecycleKey(b)] ?? 12}
    >
      <header>
        <SignalBrand />
        {s.screen !== "gallery" && (
          <div className="experience-controls">
            <select
              aria-label="Explorer experience"
              value={s.experience}
              onChange={(e) => {
                const experience = e.target.value as typeof s.experience;
                s.set({
                  experience,
                  buildTime: experience === "Assembly Timeline",
                  playing: false,
                  ...(experience === "Assembly Timeline" ? { time: 0 } : {}),
                });
                if (experience === "Diagnose") setTab("Investigation");
                if (experience === "Assembly Timeline") setTab("L1–L12");
              }}
            >
              <option>Inspect</option>
              <option>Diagnose</option>
              <option>Assembly Timeline</option>
            </select>
            <select
              aria-label="Catalogue quality"
              value={s.quality}
              onChange={(e) =>
                s.set({ quality: e.target.value as typeof s.quality })
              }
            >
              {["Performance", "Balanced", "Detail"].map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            <button onClick={() => setInspectorOpen(!inspectorOpen)}>
              {inspectorOpen ? "Collapse panels" : "Show panels"}
            </button>
          </div>
        )}
        <nav aria-label="Catalogue navigation">
          {(["gallery", "studio", "compare"] as const).map((v) => (
            <button
              key={v}
              aria-pressed={s.screen === v}
              onClick={() =>
                s.set({
                  screen: v,
                  ...(v === "compare"
                    ? {
                        orbit: null,
                        history: [],
                        cameraRevision: s.cameraRevision + 1,
                      }
                    : {}),
                })
              }
            >
              {v === "gallery"
                ? "Catalogue"
                : v === "studio"
                  ? "4D workspace"
                  : "A/B comparison"}
            </button>
          ))}
        </nav>
        <button
          className="cat-return"
          onClick={() => {
            s.set({ playing: false, tour: null });
            onClose();
          }}
        >
          Reference profiles
        </button>
        {s.screen !== "gallery" && (
          <>
            <button onClick={() => s.set({ tour: s.tour === null ? 0 : null })}>
              {s.tour === null ? "▶ Family tour" : "■ Stop tour"}
            </button>
            <button
              onClick={() => {
                setInspectorOpen(true);
                setSettingsOpen(true);
              }}
            >
              Settings / Import Better Rack Model
            </button>
          </>
        )}
      </header>
      <div className="cat-notice notice">
        {s.screen === "gallery"
          ? "Choose an architecture to enter its 4D hardware workspace."
          : d.disclosureBanner}
        <span>All telemetry is synthetic. No affiliation or endorsement.</span>
      </div>
      {s.screen === "gallery" ? (
        <main className="cat-gallery">
          <div className="cat-intro">
            <span className="eyebrow">
              TEN ARCHITECTURES. DIFFERENT ENGINEERING CHOICES.
            </span>
            <h1>
              See the system.
              <br />
              <em>Understand the tradeoff.</em>
            </h1>
            <p>
              Explore packaging, power, cooling and communication boundaries.
              Compare real design philosophies at matched scale without invented
              performance rankings.
            </p>
          </div>
          <div className="cat-filters">
            <input
              aria-label="Search catalogue"
              placeholder="Search family, silicon, fabric or power…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select
              aria-label="Filter cooling"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All cooling strategies</option>
              <option value="air">Air</option>
              <option value="liquid">Liquid</option>
              <option value="optional liquid">Optional liquid</option>
            </select>
            <button
              onClick={() =>
                s.set({
                  screen: "compare",
                  a: "CAT-04",
                  b: "CAT-05",
                  focus: "rack",
                })
              }
            >
              Compare the rack-scale heroes ↗
            </button>
          </div>
          <div className="cat-grid">
            {visible.map((d) => (
              <article className="cat-card" key={d.architectureId}>
                <div className="cat-thumb">
                  <img
                    src={`${import.meta.env.BASE_URL}catalogue-thumbs/${d.architectureId}.png`}
                    alt={`${d.familyName} original 3D model preview`}
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <span>{d.architectureId}</span>
                </div>
                <div className="cat-card-content">
                  <span className="eyebrow">{d.type || d.generation}</span>
                  <h2>{d.familyName}</h2>
                  <p>{d.differentiator}</p>
                  <small>{d.unitOfComparison}</small>
                  <div className="cat-chips">
                    <span>{d.cooling}</span>
                    <span>
                      {d.modelType === "conceptual"
                        ? "Conceptual geometry"
                        : "Source-informed 3D"}
                    </span>
                  </div>
                  <p className="cat-status">
                    {builders[d.shape]
                      ? "Interactive model · user review ≥90/100"
                      : "Under construction"}
                  </p>
                  <button
                    disabled={!builders[d.shape]}
                    onClick={() => {
                      s.choose("a", d.architectureId);
                      s.set({ screen: "studio" });
                      setInspectorSide("a");
                    }}
                  >
                    Open 4D workspace →
                  </button>
                  <button
                    aria-label={`L1–L12 for ${d.familyName}`}
                    onClick={() => {
                      s.choose("a", d.architectureId);
                      s.set({ screen: "studio" });
                      setInspectorSide("a");
                      setInspectorOpen(true);
                      setTab("L1–L12");
                      if (s.assemblyLevels[lifecycleKey(d)] === undefined)
                        s.setAssemblyLevel(d, 1);
                    }}
                  >
                    L1–L12 integration
                  </button>
                  <button
                    disabled={!builders[d.shape]}
                    onClick={() => {
                      s.choose("b", d.architectureId);
                      s.set({ screen: "compare" });
                    }}
                  >
                    Compare as B
                  </button>
                </div>
              </article>
            ))}
          </div>
        </main>
      ) : (
        <>
          <WorkbenchFrame
            className={`cat-workspace ${s.screen === "compare" ? "cat-two" : ""}`}
          >
            <WorkbenchRail
              d={d}
              side={inspectorSide}
              onTab={(tab) => {
                setTab(tab);
                setInspectorOpen(true);
              }}
              onAudit={() => setDiagnostic(!diagnostic)}
              onReference={(id) => onClose(id)}
            />
            <main className="cat-visual-area">
              <div className="cat-flowbar">
                {concepts.map((c) => (
                  <button
                    key={c}
                    aria-pressed={s.concept === c}
                    onClick={() => {
                      s.set({
                        concept: c,
                        selections: {
                          ...s.selections,
                          [s.a]: representativePart(a, c).id,
                          [s.b]: representativePart(b, c).id,
                        },
                      });
                      s.drill(
                        c === "memory"
                          ? "chip"
                          : c === "network"
                            ? "topology"
                            : c === "power" || c === "cooling"
                              ? "component"
                              : "rack",
                      );
                    }}
                  >
                    {c}
                  </button>
                ))}
                <button onClick={() => s.drill("rack")}>Rack</button>
                <button onClick={() => s.drill("tray")}>Tray</button>
                <button onClick={() => s.drill("chip")}>Chip / wafer</button>
                <button onClick={() => s.drill("topology")}>Topology</button>
                <button onClick={() => s.drill("row")}>Row</button>
                <label>
                  <input
                    type="checkbox"
                    checked={s.fallback}
                    onChange={(e) => s.set({ fallback: e.target.checked })}
                  />
                  2D fallback
                </label>
              </div>
              <div className="cat-scenes">
                {(s.screen === "compare" ? ["a", "b"] : ["a"]).map((side) => (
                  <div
                    className="cat-pane"
                    key={side}
                    onPointerDown={() => setInspectorSide(side as "a" | "b")}
                  >
                    <AssemblyStages
                      d={side === "a" ? a : b}
                      side={side as "a" | "b"}
                      onOpen={() => {
                        setInspectorSide(side as "a" | "b");
                        setInspectorOpen(true);
                        setTab("L1–L12");
                      }}
                    />
                    <div className="cat-overlay-controls">
                      <label>
                        {side.toUpperCase()} overlay{" "}
                        <select
                          aria-label={`Overlay ${side.toUpperCase()}`}
                          value={side === "a" ? s.overlayA : s.overlayB}
                          onChange={(e) => {
                            const v = e.target.value;
                            s.set(
                              s.linkedOverlays
                                ? { overlayA: v, overlayB: v }
                                : side === "a"
                                  ? { overlayA: v }
                                  : { overlayB: v },
                            );
                          }}
                        >
                          {overlays.map((v) => (
                            <option key={v}>{v}</option>
                          ))}
                        </select>
                      </label>
                    </div>
                    {s.fallback ? (
                      <div className="cat-fallback">
                        {(side === "a" ? a : b).components
                          .filter(
                            (p) =>
                              p.level <=
                              (s.assemblyLevels[
                                lifecycleKey(side === "a" ? a : b)
                              ] ?? 12),
                          )
                          .slice(0, 90)
                          .map((p) => (
                            <button
                              key={p.id}
                              onClick={() =>
                                s.select(
                                  architectureById[s[side as "a" | "b"]]
                                    .architectureId,
                                  p.id,
                                  p.concept,
                                )
                              }
                            >
                              {p.name}
                            </button>
                          ))}
                      </div>
                    ) : (
                      <StudioScene
                        side={side as "a" | "b"}
                        imported={catalogueModels.get(
                          lifecycleKey(side === "a" ? a : b),
                        )}
                      />
                    )}
                  </div>
                ))}
              </div>
              <div className="cat-toolbar camera-bar">
                <label>
                  View{" "}
                  <select
                    aria-label="Catalogue camera"
                    value={s.camera}
                    onChange={(e) =>
                      s.set({
                        camera: e.target.value,
                        orbit: null,
                        cameraRevision: s.cameraRevision + 1,
                      })
                    }
                  >
                    <option value="oblique">Front ¾</option>
                    <option value="front">Front face</option>
                    <option value="rear">Rear service ¾</option>
                    <option value="top">Top</option>
                  </select>
                </label>
                <button onClick={() => s.back()}>← Back</button>
                <button
                  aria-pressed={s.cutaway}
                  onClick={() => s.set({ cutaway: !s.cutaway })}
                >
                  CAD cutaway
                </button>
                <label>
                  Explode{" "}
                  <input
                    aria-label="Catalogue explosion"
                    type="range"
                    min="0"
                    max="1"
                    step=".05"
                    value={s.explode}
                    onChange={(e) => s.set({ explode: +e.target.value })}
                  />
                </label>
                <select
                  aria-label="Comparison scale"
                  value={s.scale}
                  onChange={(e) =>
                    s.set({ scale: e.target.value as typeof s.scale })
                  }
                >
                  <option value="normalized">
                    Normalized conceptual height
                  </option>
                  <option disabled={!physical} value="physical">
                    Published enclosure scale
                  </option>
                </select>
                <button
                  onClick={() =>
                    document.fullscreenElement
                      ? document.exitFullscreen()
                      : document.documentElement.requestFullscreen()
                  }
                >
                  Full screen
                </button>
                <button
                  disabled={s.fallback}
                  onClick={async () => {
                    const canvas = document.createElement("canvas");
                    canvas.width = 3840;
                    canvas.height = 2160;
                    const ctx = canvas.getContext("2d")!;
                    const sides = s.screen === "compare" ? ["a", "b"] : ["a"];
                    for (let i = 0; i < sides.length; i++) {
                      const url = captureCatalogue[sides[i]]?.(
                        3840 / sides.length,
                        2160,
                      );
                      if (!url) continue;
                      const img = new Image();
                      img.src = url;
                      await img.decode();
                      ctx.drawImage(img, (i * 3840) / sides.length, 0);
                    }
                    const link = document.createElement("a");
                    link.href = canvas.toDataURL("image/png");
                    link.download = "signal-intelligence-4k-hardware.png";
                    link.click();
                  }}
                >
                  Export 4K hardware
                </button>
              </div>
              <div className="metrics cat-telemetry">
                {[
                  [
                    "USEFUL CAPACITY",
                    snap.goodputPct.toFixed(1),
                    "%",
                    "Synthetic workload goodput",
                  ],
                  [
                    "DEVICE JUNCTION",
                    snap.dieC.toFixed(1),
                    "°C",
                    "Illustrative thermal response",
                  ],
                  [
                    "SECONDARY FLOW",
                    snap.flowLmin === null ? "Air" : snap.flowLmin.toFixed(0),
                    snap.flowLmin === null ? "" : "L/min",
                    d.cooling === "optional liquid"
                      ? "Air baseline; optional liquid study"
                      : "Selected architecture cooling",
                  ],
                  [
                    "THERMAL HEADROOM",
                    (95 - snap.dieC).toFixed(1),
                    "°C",
                    "Illustrative 95°C limit",
                  ],
                ].map(([label, value, unit, note]) => (
                  <div key={label}>
                    <small>{label}</small>
                    <strong>
                      {value}
                      <em>{unit}</em>
                    </strong>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
              <WorkbenchTimeline a={a} b={b} />
            </main>
            <aside className="cat-inspector inspector">
              <div className="cat-tabs">
                {[
                  "Intelligence",
                  "Evidence",
                  "Investigation",
                  "Compare",
                  "L1–L12",
                  "Learn",
                  "Sources",
                ].map((t) => (
                  <button
                    key={t}
                    className={tab === t ? "active" : ""}
                    onClick={() => {
                      setTab(t);
                      if (t === "Investigation")
                        s.set({ experience: "Diagnose", buildTime: false });
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
              <label>
                Inspect side{" "}
                <select
                  aria-label="Inspector side"
                  value={inspectorSide}
                  onChange={(e) =>
                    setInspectorSide(e.target.value as "a" | "b")
                  }
                >
                  <option value="a">A · {a.familyName}</option>
                  {s.screen === "compare" && (
                    <option value="b">B · {b.familyName}</option>
                  )}
                </select>
              </label>
              <div className="eyebrow">COMPONENT INTELLIGENCE</div>
              <small data-testid="architecture-name">{d.familyName}</small>
              <h2>{selected.name}</h2>
              <code data-testid="catalogue-selected">{selected.id}</code>
              <p className="cat-status">{d.releaseStatus}</p>
              {tab === "Intelligence" && (
                <>
                  <div className="cat-selected">
                    <span className="eyebrow">SELECTED HARDWARE</span>
                    <h3>{selected.name}</h3>

                    <p>{selected.function}</p>
                    <button onClick={() => s.drill(inspectionView(selected))}>
                      Inspect selected assembly
                    </button>
                  </div>
                  <p className="role-brief">
                    {s.role} · Which independent evidence controls the release
                    decision for this assembly?
                  </p>
                  <ComponentIntelligence
                    card={intelligence}
                    downstream={`${selected.concept} service and explicitly owned assembly descendants; communication links are reviewed separately.`}
                    downstreamCount={downstream.length}
                    onInvestigate={() => {
                      setTab("Investigation");
                      s.set({ experience: "Diagnose" });
                    }}
                  />
                  <details>
                    <summary>Why this architecture?</summary>
                    <p>{d.why}</p>
                    {d.tradeoffs.map((t) => (
                      <p key={t}>{t}</p>
                    ))}
                  </details>
                  <details>
                    <summary>Accessible component navigator</summary>
                    <input
                      aria-label="Search catalogue components"
                      placeholder="Part name or stable ID"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    <div role="tree" aria-label="Catalogue components">
                      {d.components
                        .filter(
                          (p) =>
                            p.level <= level &&
                            `${p.name} ${p.id}`
                              .toLowerCase()
                              .includes(search.toLowerCase()),
                        )
                        .slice(0, 100)
                        .map((p) => (
                          <button
                            role="treeitem"
                            aria-selected={p.id === selected.id}
                            key={p.id}
                            onClick={() =>
                              s.select(d.architectureId, p.id, p.concept)
                            }
                          >
                            {p.name}
                          </button>
                        ))}
                    </div>
                  </details>
                </>
              )}
              {tab === "Evidence" && (
                <>
                  <h3>Discriminating tests</h3>
                  {intelligence.evidenceToCollect.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <h3>Validation</h3>
                  {intelligence.validationTests.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <button onClick={() => setTab("L1–L12")}>
                    Open owned gate
                  </button>
                  <h3>Dependency scope</h3>
                  <p>
                    {downstream.length} explicitly connected assembly/service
                    descendants. Fabric topology does not imply a physical fault
                    fan-out.
                  </p>
                </>
              )}
              {tab === "Investigation" && (
                <Investigation
                  d={d}
                  side={inspectorSide}
                  save={save}
                  onMessage={setMessage}
                />
              )}
              {tab === "Compare" && (
                <>
                  <h3>Why different?</h3>
                  {whyDifferent(a, b).map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  <table>
                    <thead>
                      <tr>
                        <th>Axis</th>
                        <th>A</th>
                        <th>B</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(
                        [
                          "unitOfComparison",
                          "fabric",
                          "scaleOut",
                          "cooling",
                          "power",
                          "software",
                          "sourceConfidence",
                          "releaseStatus",
                        ] as const
                      ).map((k) => (
                        <tr key={k}>
                          <th>{k}</th>
                          <td>{a[k]}</td>
                          <td>{b[k]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <h3>Architectural fit</h3>
                  <label>
                    Workload
                    <select
                      value={workload}
                      onChange={(e) => setWorkload(e.target.value)}
                    >
                      {[
                        "Model-parallel training",
                        "Long-context batch inference",
                        "Low-latency online inference",
                        "HPC simulation",
                        "General enterprise",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Facility
                    <select
                      value={facility}
                      onChange={(e) => setFacility(e.target.value)}
                    >
                      {[
                        "Traditional air-cooled",
                        "Liquid-ready",
                        "Power-limited",
                      ].map((v) => (
                        <option key={v}>{v}</option>
                      ))}
                    </select>
                  </label>
                  <label>
                    Cost / qualification sensitivity · {budget}% illustrative
                    <input
                      type="range"
                      value={budget}
                      onChange={(e) => setBudget(+e.target.value)}
                    />
                  </label>
                  <label>
                    Service objective
                    <select
                      value={uptime}
                      onChange={(e) => setUptime(e.target.value)}
                    >
                      <option>Redundancy-first</option>
                      <option>Fast module swap</option>
                      <option>Controlled blade service</option>
                    </select>
                  </label>
                  {[a, b].map((d) => (
                    <p key={d.architectureId}>
                      <strong>{d.familyName}: </strong>
                      {facility === "Traditional air-cooled" &&
                      d.cooling !== "air"
                        ? "Facility mismatch: liquid commissioning required."
                        : workload === "HPC simulation" && d.shape === "cray"
                          ? "Strong architectural fit: blades and Slingshot target HPC."
                          : workload === "General enterprise" &&
                              ["eia", "orv3"].includes(d.shape)
                            ? "Strong architectural fit: modular general-purpose trays."
                            : "Conditional fit: qualify workload layout, software and service boundary."}{" "}
                      {facility === "Power-limited"
                        ? "Use measured facility load; advertised FLOPs do not determine energy fit."
                        : ""}{" "}
                      {budget > 70
                        ? "Procurement and qualification costs are undisclosed; obtain program evidence."
                        : ""}{" "}
                      {uptime === "Fast module swap"
                        ? "Confirm connector/interlock service procedure."
                        : ""}
                    </p>
                  ))}
                  <p>
                    Equivalent quantitative benchmark:{" "}
                    <strong>Not comparable / not disclosed.</strong>
                  </p>
                  <div className="cat-matchups">
                    {[
                      ["CAT-04", "CAT-05"],
                      ["CAT-04", "CAT-06"],
                      ["CAT-01", "CAT-02"],
                      ["CAT-03", "CAT-04"],
                      ["CAT-09", "CAT-10"],
                    ].map(([x, y]) => (
                      <button
                        key={x + y}
                        disabled={
                          !builders[architectureById[x].shape] ||
                          !builders[architectureById[y].shape]
                        }
                        onClick={() => {
                          s.choose("a", x as FamilyId);
                          s.choose("b", y as FamilyId);
                          s.set({ screen: "compare" });
                        }}
                      >
                        {architectureById[x].familyName} /{" "}
                        {architectureById[y].familyName}
                      </button>
                    ))}
                  </div>
                </>
              )}
              {tab === "L1–L12" && (
                <LifecyclePanel
                  key={lifecycleKey(d)}
                  d={d}
                  activeFault={openIncident}
                  onExport={(data) =>
                    save(
                      `${d.architectureId}-${d.shape}-L1-L12-evidence.json`,
                      data,
                    )
                  }
                />
              )}
              {tab === "Learn" && (
                <>
                  <button
                    onClick={() => s.set({ tour: s.tour === null ? 0 : null })}
                  >
                    {s.tour === null
                      ? "Start 60-second family tour"
                      : "Stop family tour"}
                  </button>
                  {chapter >= 0 && (
                    <p>
                      Chapter {chapter + 1}/6 ·{" "}
                      {
                        [
                          "Design problem",
                          "Physical distinction",
                          "Serviceable carrier",
                          "Communication boundary",
                          "Fault and evidence",
                          "Tradeoff / TPM decision",
                        ][chapter]
                      }
                    </p>
                  )}
                  <button
                    onClick={() =>
                      s.set({
                        tour: Math.min(
                          50,
                          (Math.floor((s.tour || 0) / 10) + 1) * 10,
                        ),
                      })
                    }
                  >
                    Next chapter
                  </button>
                  {d.learningObjectives.map((t) => (
                    <p key={t}>{t}</p>
                  ))}
                  {[
                    "What is the physical versus logical unit here?",
                    "Which service is shared and which fault stays local?",
                    "Which evidence separates fabric retries from thermal throttling?",
                  ].map((q, i) => (
                    <details key={q}>
                      <summary>
                        Self-check {i + 1}: {q}
                      </summary>
                      <p>
                        {i === 0
                          ? d.unitOfComparison
                          : i === 1
                            ? `${d.cooling} cooling and ${d.power}; individual host faults remain scoped.`
                            : `Compare ${d.fabric} telemetry with independent cooling and workload traces.`}
                      </p>
                    </details>
                  ))}
                  <label>
                    TPM scenario: which evidence blocks release after a service
                    swap?
                    <textarea
                      aria-label="Offline teaching response"
                      placeholder="Record a hypothesis, evidence and owner locally…"
                    />
                  </label>
                  <label>
                    <input
                      type="checkbox"
                      checked={s.reduced}
                      onChange={(e) => s.set({ reduced: e.target.checked })}
                    />
                    Reduced motion
                  </label>
                </>
              )}
              {tab === "Sources" && (
                <>
                  <p>{d.disclosureBanner}</p>
                  <p>
                    {d.sourceConfidence}. Model type: {d.modelType}; human
                    fidelity review:{" "}
                    {d.humanReview
                      ? `${d.humanReview.reported} reported by ${d.humanReview.reviewer}, ${d.humanReview.date} (lower bound)`
                      : "not yet scored"}
                    .
                  </p>
                  {d.sourceRefs.map((id) => (
                    <p key={id}>
                      <a
                        href={sourceById[id].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {sourceById[id].organization} primary reference ↗
                      </a>
                      <small>
                        {sourceById[id].scope} · checked{" "}
                        {sourceById[id].checkedDate}
                      </small>
                    </p>
                  ))}
                  {d.claims.map((c) => (
                    <p key={c.name}>
                      <strong>
                        {c.name}: {c.value} {c.unit}
                      </strong>
                      <small>
                        {c.scope} · {c.qualifier} · {c.source}
                      </small>
                    </p>
                  ))}
                  {d.variants.map((v) => (
                    <details key={v.id}>
                      <summary>
                        {v.name} — {v.status}
                      </summary>
                      <p>{v.delta}</p>
                      <p>
                        {v.modelled
                          ? "Model delta implemented"
                          : "Separate geometry/topology delta not yet modelled; not counted as another family."}
                      </p>
                      <a
                        href={sourceById[v.source].url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Generation source
                      </a>
                    </details>
                  ))}
                  <p>
                    Original procedural meshes/materials. Vendor images are
                    reference links, not redistributed assets. Exact proprietary
                    dimensions, rear routing and service instructions remain
                    unknown.
                  </p>
                  <p>
                    Illustrative load equation: Q = ṁ Cp ΔT, Cp = 4180 J/(kg·K),
                    water density ≈ 1 kg/L. At {snap.powerKW} kW and{" "}
                    {snap.flowLmin?.toFixed(0) || 240} L/min, ΔT ={" "}
                    {(snap.returnC !== null ? snap.returnC - 30 : 0).toFixed(1)}{" "}
                    K{" "}
                    {snap.flowLmin === null
                      ? "(liquid equation not applied to air-only model)"
                      : ""}
                    .
                  </p>
                  <p>
                    Educational electrical example: 24 kW / 48 V ={" "}
                    {dcCurrent(24, 48).toFixed(0)} A DC; 24 kW at 400 V 3-phase
                    and PF 0.95 = {threePhaseCurrent(24, 400, 0.95).toFixed(1)}{" "}
                    A. Not an equipment rating.
                  </p>
                </>
              )}
              <p className="cat-disclosure">{d.disclosureBanner}</p>
              {message && <p role="status">{message}</p>}
            </aside>
          </WorkbenchFrame>
        </>
      )}
      <footer>
        <span>
          Signal Intelligence · local hardware education · no equipment
          connected
        </span>
        <button onClick={() => setDiagnostic(!diagnostic)}>
          Catalogue render audit
        </button>
        <span>4D workbench · component intelligence · L1–L12 · offline</span>
      </footer>
      {settingsOpen && (
        <div className="modal-backdrop">
          <div
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-label="Settings / Import Better Rack Model"
          >
            <button onClick={() => setSettingsOpen(false)}>Close ×</button>
            <h2>4D workspace settings</h2>
            <label>
              Role
              <select
                aria-label="Workspace role"
                value={s.role}
                onChange={(e) => s.set({ role: e.target.value })}
              >
                {[
                  "NPI TPM",
                  "Hardware engineer",
                  "Site ops / SRE",
                  "Manufacturing-quality lead",
                ].map((role) => (
                  <option key={role}>{role}</option>
                ))}
              </select>
            </label>
            <label>
              <input
                type="checkbox"
                checked={s.challenge}
                onChange={(e) =>
                  s.set({
                    challenge: e.target.checked,
                    investigations: Object.fromEntries(
                      Object.entries(s.investigations).map(([key, record]) => [
                        key,
                        { ...record, reveal: false },
                      ]),
                    ),
                  })
                }
              />{" "}
              Challenge diagnosis
            </label>
            <ModelImport
              key={lifecycleKey(d)}
              d={d}
              onChange={() => {
                setModelRevision(modelRevision + 1);
                setSettingsOpen(false);
                s.set({ focus: "rack" });
              }}
            />
          </div>
        </div>
      )}
      {diagnostic && (
        <pre data-testid="catalogue-audit" className="cat-audit">
          {JSON.stringify(catalogueAudit, null, 2)}
        </pre>
      )}
    </div>
  );
}
