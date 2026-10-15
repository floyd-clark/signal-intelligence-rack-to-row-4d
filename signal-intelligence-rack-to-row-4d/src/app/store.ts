import { create } from "zustand";
import type { ProfileId } from "../data/model";
import type { Scenario } from "../simulation/engine";
interface State {
  profile: ProfileId;
  racks: number;
  selected: string;
  hovered: string;
  focus: string | null;
  history: {
    focus: string | null;
    selected: string;
    view: "rack" | "row";
    rack: number;
  }[];
  view: "rack" | "row";
  rack: number;
  level: number;
  overlay: string;
  quality: "Performance" | "Balanced" | "Detail";
  experience: "Inspect" | "Diagnose" | "Assembly Timeline";
  panels: boolean;
  cutaway: boolean;
  showChassis: boolean;
  showCoolant: boolean;
  showPower: boolean;
  showNetwork: boolean;
  showIds: boolean;
  showFaults: boolean;
  explode: boolean;
  explosion: number;
  height: number;
  xray: boolean;
  doors: boolean;
  camera: string;
  cameraKey: number;
  reduced: boolean;
  fallback: boolean;
  mode: string;
  role: string;
  time: number;
  playing: boolean;
  speed: number;
  buildTime: boolean;
  scenario: Scenario;
  evidence: string[];
  decision: string;
  hypothesis: number | null;
  answer: boolean;
  gateTests: Record<string, string>;
  gatePass: number[];
  facility: Record<string, boolean>;
  bookmarks: number[];
  set: (patch: Partial<State>) => void;
  drill: (id: string) => void;
  back: () => void;
  reset: () => void;
  changeProfile: (p: ProfileId) => void;
}
export const useStore = create<State>((set, get) => ({
  profile: "FS_CONCEPT",
  racks: 8,
  selected: "FS_CONCEPT/R1/rack",
  hovered: "",
  focus: null,
  history: [],
  view: "rack",
  rack: 1,
  level: 9,
  overlay: "Hardware",
  quality: "Balanced",
  experience: "Inspect",
  panels: true,
  cutaway: false,
  showChassis: true,
  showCoolant: true,
  showPower: true,
  showNetwork: true,
  showIds: false,
  showFaults: true,
  explode: false,
  explosion: 0.65,
  height: 2,
  xray: false,
  doors: true,
  camera: "isometric",
  cameraKey: 0,
  reduced: false,
  fallback: false,
  mode: "guided",
  role: "NPI TPM",
  time: 0,
  playing: false,
  speed: 10,
  buildTime: false,
  scenario: {
    version: 1,
    seed: 42,
    profile: "FS_CONCEPT",
    racks: 8,
    events: [],
  },
  evidence: [],
  decision: "",
  hypothesis: null,
  answer: false,
  gateTests: {},
  gatePass: [],
  facility: {},
  bookmarks: [],
  set: (p) => set(p),
  drill: (id) =>
    set((s) => ({
      history: [
        ...s.history,
        { focus: s.focus, selected: s.selected, view: s.view, rack: s.rack },
      ],
      focus: id,
      cutaway: true,
      selected: id,
      cameraKey: s.cameraKey + 1,
    })),
  back: () =>
    set((s) => ({
      ...(s.history.at(-1) ?? {
        focus: null,
        selected: s.profile + "/R" + s.rack + "/rack",
        view: s.view,
        rack: s.rack,
      }),
      history: s.history.slice(0, -1),
      cameraKey: s.cameraKey + 1,
    })),
  reset: () =>
    set((s) => ({ camera: "isometric", cameraKey: s.cameraKey + 1 })),
  changeProfile: (profile) =>
    set({
      profile,
      selected: profile + "/R1/rack",
      focus: null,
      history: [],
      gatePass: [],
      facility: {},
      rack: 1,
      view: "rack",
      time: 0,
      evidence: [],
      decision: "",
      hypothesis: null,
      answer: false,
      scenario: {
        version: 1,
        seed: get().scenario.seed,
        profile,
        racks: get().racks,
        events: [],
      },
    }),
}));
