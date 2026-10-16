import { create } from "zustand";
import type { Concept, FamilyId, Replay, ViewMode } from "./types";
import { blankReplay } from "./scenarios/engine";
import {
  canSignStage,
  emptyGate,
  lifecycleKey,
  LIFECYCLE_STORAGE,
  readSavedLifecycle,
  recordStageNote,
  recordStageResult,
  type GateRecords,
  type GateResult,
} from "./lifecycle";
import type { Architecture } from "./types";
export interface InvestigationRecord {
  replayKey: string;
  evidence: string[];
  hypothesis: string;
  containmentAt: number | null;
  decision: string;
  reveal: boolean;
  gateAtRecovery: string | null;
}
export const emptyInvestigation = (replayKey = ""): InvestigationRecord => ({
  replayKey,
  evidence: [],
  hypothesis: "",
  containmentAt: null,
  decision: "",
  reveal: false,
  gateAtRecovery: null,
});
interface State {
  screen: "gallery" | "studio" | "compare";
  a: FamilyId;
  b: FamilyId;
  variantA: string;
  variantB: string;
  concept: Concept;
  selections: Record<string, string>;
  focus: ViewMode;
  history: ViewMode[];
  camera: string;
  cameraRevision: number;
  backRevision: number;
  orbit: { position: number[]; target: number[] } | null;
  explode: number;
  cutaway: boolean;
  overlayA: string;
  overlayB: string;
  linkedOverlays: boolean;
  scale: "normalized" | "physical";
  quality: "Performance" | "Balanced" | "Detail";
  assemblyLevels: Record<string, number>;
  gateRecords: Record<string, GateRecords>;
  setAssemblyLevel: (d: Architecture, level: number) => void;
  recordGateResult: (
    d: Architecture,
    level: number,
    check: number,
    result: GateResult,
  ) => void;
  recordGateNote: (d: Architecture, level: number, note: string) => void;
  signGate: (d: Architecture, level: number, activeFault: boolean) => void;
  time: number;
  playing: boolean;
  replays: Record<string, Replay>;
  reduced: boolean;
  fallback: boolean;
  tour: number | null;
  experience: "Inspect" | "Diagnose" | "Assembly Timeline";
  speed: number;
  buildTime: boolean;
  bookmarks: number[];
  role: string;
  challenge: boolean;
  investigations: Record<string, InvestigationRecord>;
  set: (s: Partial<State>) => void;
  choose: (side: "a" | "b", id: FamilyId) => void;
  select: (family: FamilyId, id: string, concept: Concept) => void;
  drill: (view: ViewMode) => void;
  back: () => void;
  inject: (family: FamilyId, fault: string) => void;
}
const savedLifecycle = readSavedLifecycle();
export const useCatalogue = create<State>((set, get) => ({
  screen: "gallery",
  a: "CAT-04",
  b: "CAT-05",
  variantA: "",
  variantB: "",
  concept: "service",
  selections: { "CAT-04": "CAT-04/rack" },
  focus: "rack",
  history: [],
  camera: "oblique",
  cameraRevision: 0,
  backRevision: 0,
  orbit: null,
  explode: 0,
  cutaway: false,
  overlayA: "Hardware",
  overlayB: "Hardware",
  linkedOverlays: true,
  scale: "normalized",
  quality: "Balanced",
  ...savedLifecycle,
  setAssemblyLevel: (d, level) => {
    if (!Number.isInteger(level) || level < 1 || level > 12) return;
    set({
      assemblyLevels: { ...get().assemblyLevels, [lifecycleKey(d)]: level },
      focus: "rack",
      cutaway: level < 12,
      history: [],
      selections: {
        ...get().selections,
        [d.architectureId]: `${d.architectureId}/rack`,
      },
      concept: "service",
    });
  },
  recordGateResult: (d, level, check, result) => {
    const key = lifecycleKey(d);
    set({
      gateRecords: {
        ...get().gateRecords,
        [key]: recordStageResult(
          get().gateRecords[key] || {},
          level,
          check,
          result,
        ),
      },
    });
  },
  recordGateNote: (d, level, note) => {
    const key = lifecycleKey(d);
    set({
      gateRecords: {
        ...get().gateRecords,
        [key]: recordStageNote(get().gateRecords[key] || {}, level, note),
      },
    });
  },
  signGate: (d, level, activeFault) => {
    const key = lifecycleKey(d),
      records = get().gateRecords[key] || {};
    if (!canSignStage(d, level, records, activeFault)) return;
    set({
      gateRecords: {
        ...get().gateRecords,
        [key]: {
          ...records,
          [level]: {
            ...(records[level] || emptyGate()),
            signedAt: new Date().toISOString(),
          },
        },
      },
    });
  },
  time: 0,
  playing: false,
  replays: {},
  reduced: false,
  fallback: false,
  tour: null,
  experience: "Inspect",
  speed: 10,
  buildTime: false,
  bookmarks: [],
  role: "NPI TPM",
  challenge: false,
  investigations: {},
  set,
  choose: (side, id) =>
    set({
      [side]: id,
      [side === "a" ? "variantA" : "variantB"]: "",
      focus: "rack",
      scale: "normalized",
      history: [],
      orbit: null,
      cameraRevision: get().cameraRevision + 1,
      selections: { ...get().selections, [id]: `${id}/rack` },
      concept: "service",
    }),
  select: (family, id, concept) =>
    set({ selections: { ...get().selections, [family]: id }, concept }),
  drill: (view) =>
    set({
      history: [...get().history, get().focus],
      focus: view,
      orbit: null,
      cameraRevision: get().cameraRevision + 1,
    }),
  back: () =>
    set({
      backRevision: get().backRevision + 1,
      focus: get().history.at(-1) || "rack",
      history: get().history.slice(0, -1),
      orbit: null,
      cameraRevision: get().cameraRevision + 1,
    }),
  inject: (family, fault) =>
    set({
      investigations: Object.fromEntries(
        Object.entries(get().investigations).map(([key, record]) => [
          key,
          key.startsWith(`${family}/`) ? emptyInvestigation() : record,
        ]),
      ),
      replays: {
        ...get().replays,
        [family]: { ...blankReplay(family), fault, injectedAt: get().time },
      },
    }),
}));
useCatalogue.subscribe((state, previous) => {
  if (
    state.assemblyLevels === previous.assemblyLevels &&
    state.gateRecords === previous.gateRecords
  )
    return;
  try {
    window.localStorage.setItem(
      LIFECYCLE_STORAGE,
      JSON.stringify({
        assemblyLevels: state.assemblyLevels,
        gateRecords: state.gateRecords,
      }),
    );
  } catch {
    /* Storage restrictions must not disable offline session progress. */
  }
});
