

export enum PanelMode {
  START = 'start',
  VECTOR = 'vector',
  TYPOGRAPHY = 'typography',
  MONOGRAM = 'monogram',
  EXTRACTOR = 'extractor',
  FILTERS = 'filters',
  AUDIT = 'audit'
}

export interface KernelConfig {
  thinkingBudget: number;
  temperature: number;
  model: string;
  deviceContext: string;
  // Removed precision?: 'MAX' | 'STD';
}

// export interface Message {
//   id: string;
//   role: 'user' | 'model';
//   content: string;
//   timestamp: string;
//   isTrace?: boolean;
//   groundingSources?: { title: string; uri: string }[];
// }

export interface PresetItem {
  id: string;
  name: string;
  description: string;
  type?: string;
  parameters?: Record<string, number>;
  timestamp?: string;
  filter?: string;
  dna?: ExtractionResult;
  imageUrl?: string;
  prompt?: string;
}

export interface PresetCategory {
  title: string;
  items: PresetItem[];
}

export type PanelCategory = PresetCategory;

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'error' | 'success' | 'warning';
}

export interface ExtractionResult {
  domain: 'Vector' | 'Typography' | 'Monogram';
  category: string;
  name: string;
  description: string;
  confidence: number;
  styleAuthenticityScore: number; // New: Quantifies how "100% legit" the detected style is.
  palette: string[];
  parameters: {
    threshold: number;
    smoothing: number;
    detail: number;
    edge: number;
    [key: string]: number;
  };
  preview_png?: string;
}

export interface AppState {
  currentMode: PanelMode;
  selectedPresetId: string | null;
  isProcessing: boolean;
  subjectFocus: boolean;
  parameters: Record<string, number>;
  history: any[];
}

export interface PanelPersona {
  role: string;
  specialty: string;
  motto: string;
  tagline: string;
  icon: string;
  personality: {
    traits: string[];
    communication: {
      toAI: string;
      toTypography?: string;
      toVector?: string;
      toColor?: string;
      toExport?: string;
    };
    quirks: string[];
  };
  performance: {
    anchorEfficiency?: string;
    symmetryBalance?: string;
    optimizationRate?: string;
    status: string;
    glyphMorphing?: string;
    textFlow?: string;
    styleInfusion?: string;
    readabilityScore?: string;
    brandAlignment?: string;
    styleConsistency?: string;
    renderingQuality?: string;
    systemHarmony?: string;
    legibility?: string;
    aestheticCohesionIndex?: string;
    emotionalResonance?: string;
  };
}

export interface RepairSummary {
  totalNodes: number;
  repairedNodes: number;
  failedNodes: number;
  averageRepairTime: number;
  totalTime: number;
  criticalFailures: number;
  systemStabilityScore: number;
}

export interface CloudRepairSummary extends RepairSummary {
  id: string;
  timestamp: string;
  type: 'RepairReport';
  integrityAfterRepair: number;
}

export interface RefineSummary {
  totalIssues: number;
  resolvedIssues: number;
  performanceGain: number;
  visualScore: number;
  totalTime: number;
  mode: string;
  uxScore: number;
  aestheticCohesionIndex: number;
}

export interface CloudRefineSummary extends RefineSummary {
  id: string;
  timestamp: string;
  type: 'RefineReport';
  uiRefinementLevelAfterRefine: number;
}

export type CloudArchiveEntry = CloudRepairSummary | CloudRefineSummary;

export interface RealIssue {
  id: string;
  type: 'CSS' | 'Accessibility' | 'Performance' | 'TypeScript' | 'React';
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  title: string;
  description: string;
  file: string;
  line?: number;
  codeSnippet: string;
  fix: string;
  fixed: boolean;
  canAutoFix: boolean;
  timestamp: number;
  impact: 'VISUAL' | 'PERFORMANCE' | 'ACCESSIBILITY' | 'MAINTAINABILITY';
}