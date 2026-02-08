import { PresetCategory, PresetItem } from '../types';
import { 
  GLOBAL_VECTOR_LOCK, 
  GLOBAL_TYPO_LOCK, 
  GLOBAL_MONO_LOCK, 
  groupAllPromptsByCategory
} from './enginePrompts';

// Export global locks directly from enginePrompts
export { GLOBAL_VECTOR_LOCK, GLOBAL_TYPO_LOCK, GLOBAL_MONO_LOCK };

/**
 * FULL PRESET LIBRARIES
 * Grouped for sidebar and carousel navigation.
 */
export const VECTOR_PRESETS: PresetCategory[] = groupAllPromptsByCategory('vector');
export const TYPOGRAPHY_PRESETS: PresetCategory[] = groupAllPromptsByCategory('typography');
export const MONOGRAM_PRESETS: PresetCategory[] = groupAllPromptsByCategory('monogram');
export const FILTERS_PRESETS: PresetCategory[] = groupAllPromptsByCategory('filter');

export const PRESET_REGISTRY = {
  VECTOR: {
    libraries: VECTOR_PRESETS
  },
  TYPOGRAPHY: {
    libraries: TYPOGRAPHY_PRESETS
  },
  MONOGRAM: {
    libraries: MONOGRAM_PRESETS
  },
  FILTERS: {
    libraries: FILTERS_PRESETS
  }
};