
import { RealRefineDiagnostic } from './RealRefineDiagnostic.tsx';
import { RealRepairDiagnostic } from './RealRepairDiagnostic.tsx';

export { 
  RealRefineDiagnostic, 
  RealRepairDiagnostic 
};

export const Diagnostics = {
  Real: {
    Refine: RealRefineDiagnostic,
    Repair: RealRepairDiagnostic,
  }
} as const;