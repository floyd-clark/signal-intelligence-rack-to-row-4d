export type FamilyId = `CAT-${string}`;
export type Concept =
  "compute" | "memory" | "power" | "cooling" | "network" | "service";
export type ViewMode =
  "rack" | "tray" | "chip" | "topology" | "row" | "component";
export interface Claim {
  name: string;
  value: number;
  unit: string;
  scope: string;
  source: string;
  checkedDate: string;
  qualifier: string;
}
export interface Source {
  id: string;
  organization: string;
  url: string;
  checkedDate: string;
  status: "checked";
  scope: string;
  license: string;
}
export interface Part {
  id: string;
  name: string;
  concept: Concept;
  parentId: string | null;
  level: number;
  function: string;
  symptoms: string[];
  tests: string[];
  containment: string;
  owner: string;
  sourceRefs: string[];
  illustrative: boolean;
}
export interface Architecture {
  architectureId: FamilyId;
  familyName: string;
  generation: string;
  edition: string;
  type: string;
  releaseStatus: string;
  unitOfComparison: string;
  physicalRackCountKnown: number | null;
  knownPhysicalDimensions: {
    width: number;
    height: number;
    depth: number;
    unit: "mm";
    source: string;
  } | null;
  shape: string;
  width: number;
  depth: number;
  cooling: "air" | "liquid" | "optional liquid";
  power: string;
  fabric: string;
  scaleOut: string;
  software: string;
  differentiator: string;
  why: string;
  tradeoffs: string[];
  alternatives: FamilyId[];
  sourceRefs: string[];
  claims: Claim[];
  components: Part[];
  mechanicalHierarchy: string[];
  ports: string[];
  cabling: string[];
  powerTree: string[];
  coolingTree: string[];
  networkFabrics: string[];
  faultDomains: string[];
  floorplanRules: string[];
  assetRefs: string[];
  assetLicense: string;
  sourceConfidence: string;
  modelType: "sourcedIllustration" | "conceptual";
  modelFidelityScore: number | null;
  humanReview?: {
    minimumScore: number;
    reported: string;
    reviewer: string;
    date: string;
  };
  learningObjectives: string[];
  scenarioIds: string[];
  lifecycleStages: {
    level: number;
    name: string;
    applicable: boolean;
    note: string;
  }[];
  disclosureBanner: string;
  layout: {
    trays: number;
    chipsPerTray: number;
    cpusPerTray: number;
    switches: number;
    shelves: number;
    psus: number;
  };
  variants: {
    id: string;
    name: string;
    status: string;
    delta: string;
    source: string;
    modelled: boolean;
  }[];
}
export interface Fault {
  id: string;
  family: FamilyId;
  name: string;
  kind: "flow" | "fabric" | "power" | "local" | "air" | "logical";
  scope: "local" | "shared" | "fabric" | "software";
  target: Concept;
  signature: string;
  tests: string[];
  containment: string;
  prevention: string;
  hypotheses: string[];
  sourceRefs: string[];
}
export interface Replay {
  version: 2;
  family: FamilyId;
  fault: string | null;
  seed: number;
  injectedAt: number;
  recoveredAt: number | null;
}
