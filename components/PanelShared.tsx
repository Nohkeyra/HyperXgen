
import React from 'react';
import { 
  TrashIcon, 
  UploadIcon, 
  DownloadIcon, 
  SparkleIcon, 
  StarIcon, 
  BoxIcon,
  SunIcon,
  MoonIcon 
} from './Icons.tsx';

// Re-export icons for uniform access across the architecture
export { 
  TrashIcon, 
  UploadIcon, 
  DownloadIcon, 
  SparkleIcon, 
  StarIcon, 
  BoxIcon,
  SunIcon,
  MoonIcon 
};

// Localized Theme Toggle with high-fidelity transitions
export const ThemeToggle = ({ 
  isDarkMode = false, 
  onToggle 
}: { 
  isDarkMode?: boolean; 
  onToggle: () => void 
}) => (
  <button 
    onClick={onToggle}
    className="p-3 bg-brandCharcoal dark:bg-zinc-800 border border-white/10 text-brandYellow hover:border-brandRed hover:text-brandRed transition-all shadow-xl rounded-sm group flex items-center justify-center pointer-events-auto"
    title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
  >
    {isDarkMode ? (
      <SunIcon className="w-4 h-4 transition-transform group-hover:rotate-90 duration-500" />
    ) : (
      <MoonIcon className="w-4 h-4 transition-transform group-hover:-rotate-12 duration-500" />
    )}
  </button>
);

// Re-export localized components
// Removed GenerationBar, PresetCard, PresetCarousel, DevourerHUD, ReconHUD, FilterHUD re-exports.

/**
 * CANVAS FLOATING CONTROLS
 * Context-aware control cluster for the main canvas interface.
 */
export const CanvasFloatingControls = ({ onClear, onDownload }: { onClear: () => void; onDownload?: () => void }) => (
  <div className="absolute top-4 right-4 z-[60] flex flex-col gap-2">
    <button 
      onClick={(e) => { e.stopPropagation(); onClear(); }} 
      className="p-3 bg-brandCharcoal border border-white/10 text-brandRed hover:bg-brandRed hover:text-white transition-all shadow-xl rounded-sm group"
      title="Purge Buffer"
    >
      <TrashIcon className="w-3.5 h-3.5" />
    </button>
    {onDownload && (
      <button 
        onClick={(e) => { e.stopPropagation(); onDownload(); }} 
        className="p-3 bg-brandCharcoal border border-white/10 text-brandYellow hover:bg-brandYellow hover:text-brandCharcoal transition-all shadow-xl rounded-sm group"
        title="Extract Artifact"
      >
        <DownloadIcon className="w-3.5 h-3.5" />
      </button>
    )}
  </div>
);