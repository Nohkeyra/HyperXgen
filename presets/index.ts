import { PresetCategory, PresetItem } from '../types';
import { 
  GLOBAL_VECTOR_LOCK, 
  GLOBAL_TYPO_LOCK, 
  GLOBAL_MONO_LOCK, 
  groupPromptsByCategory,
  groupAllPromptsByCategory // Import the new grouping function
} from './enginePrompts';

// Export global locks directly from enginePrompts
export { GLOBAL_VECTOR_LOCK, GLOBAL_TYPO_LOCK, GLOBAL_MONO_LOCK };

/**
 * SIGNATURE PRESETS
 * Extracted directly from the engine library for high-visibility UI components.
 */

export const HYPERX_SIGNATURE_VECTOR = groupPromptsByCategory('vector');
export const HYPERX_SIGNATURE_TYPO = groupPromptsByCategory('typography');
export const HYPERX_SIGNATURE_MONO = groupPromptsByCategory('monogram');
// Fix: Define HYPERX_SIGNATURE_FILTER using groupPromptsByCategory
export const HYPERX_SIGNATURE_FILTER = groupPromptsByCategory('filter');

/**
 * FULL PRESET LIBRARIES
 * Grouped for sidebar and carousel navigation.
 */

// Fix: Define full preset libraries using groupAllPromptsByCategory
export const VECTOR_PRESETS: PresetCategory[] = groupAllPromptsByCategory('vector');
export const TYPOGRAPHY_PRESETS: PresetCategory[] = groupAllPromptsByCategory('typography');
export const MONOGRAM_PRESETS: PresetCategory[] = groupAllPromptsByCategory('monogram');
export const FILTERS_PRESETS: PresetCategory[] = groupAllPromptsByCategory('filter');


// Re-export specific presets for convenience if desired by other modules
// Fix: Removed direct re-exports from individual preset files as content is now handled by ENGINE_PROMPTS
// export * from './vectorPresets';
// export * from './typoPresets';
// export * from './monogramPresets';

export const PRESET_REGISTRY = {
  VECTOR: {
    signature: HYPERX_SIGNATURE_VECTOR,
    // Fix: Use the newly defined VECTOR_PRESETS
    libraries: VECTOR_PRESETS
  },
  TYPOGRAPHY: {
    signature: HYPERX_SIGNATURE_TYPO,
    // Fix: Use the newly defined TYPOGRAPHY_PRESETS
    libraries: TYPOGRAPHY_PRESETS
  },
  MONOGRAM: {
    signature: HYPERX_SIGNATURE_MONO,
    // Fix: Use the newly defined MONOGRAM_PRESETS
    libraries: MONOGRAM_PRESETS
  },
  FILTERS: {
    signature: HYPERX_SIGNATURE_FILTER,
    // Fix: Use the newly defined FILTERS_PRESETS
    libraries: FILTERS_PRESETS
  }
};