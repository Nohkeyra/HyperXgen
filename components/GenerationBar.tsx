
import React, { useState, useEffect, useCallback } from 'react';
import { SparkleIcon, UploadIcon } from './Icons.tsx';
import { PanelMode, ExtractionResult } from '../types.ts'; // Import PanelMode and ExtractionResult

interface GenerationBarProps {
  prompt?: string;
  setPrompt?: (prompt: string) => void;
  onGenerate: () => void;
  isProcessing: boolean;
  activePresetName?: string | null;
  placeholder?: string;
  isExtractor?: boolean; // New prop to indicate if it's the extractor panel
  extractedDnaDetails?: ExtractionResult | null; // New prop for extractor DNA details
  // useTurbo?: boolean; // Removed useTurbo
  // onToggleTurbo?: () => void; // Removed onToggleTurbo
  additionalControls?: React.ReactNode;
  refineButton?: React.ReactNode;
  children?: React.ReactNode; // For any custom children (e.g., text input)
}

export const GenerationBar: React.FC<GenerationBarProps> = ({
  prompt,
  setPrompt,
  onGenerate,
  isProcessing,
  activePresetName,
  placeholder = "Describe your subject for neural synthesis...",
  isExtractor = false,
  extractedDnaDetails,
  // useTurbo, // Removed useTurbo
  // onToggleTurbo, // Removed onToggleTurbo
  additionalControls,
  refineButton,
  children,
}) => {
  const [localPrompt, setLocalPrompt] = useState(prompt || '');

  useEffect(() => {
    setLocalPrompt(prompt || '');
  }, [prompt]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalPrompt(e.target.value);
    setPrompt?.(e.target.value);
  }, [setPrompt]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onGenerate();
    }
  }, [onGenerate]);

  return (
    <div className="generation-bar w-full max-w-[1400px] mx-auto bg-brandCharcoal dark:bg-black border-2 border-brandRed rounded-sm shadow-[0_0_30px_rgba(253,30,74,0.1)] flex flex-col md:flex-row items-stretch overflow-hidden relative transition-all duration-300">
      {/* Visual Indicator on left */}
      <div className={`shrink-0 w-2 h-auto ${isProcessing ? 'bg-brandRed' : 'bg-brandYellow'} transition-colors duration-300`} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col p-4 md:p-6 min-w-0">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-1 h-3 bg-brandRed rounded-full shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-black uppercase text-brandRed tracking-[0.2em] leading-none mb-1">
              Kernel_Input_Protocol
            </h3>
            {activePresetName && (
              <p className="text-[7px] font-bold text-brandCharcoalMuted dark:text-white/40 uppercase tracking-wider truncate">
                DNA_LINKED: {activePresetName}
              </p>
            )}
          </div>
          {additionalControls} {/* Render additional controls here */}
        </div>

        {!isExtractor && ( // Only show prompt input for non-extractor panels
          <div className="flex items-center gap-3 w-full">
            {refineButton}
            <textarea
              className="flex-1 p-3 bg-white/5 border border-white/10 rounded-sm text-[10px] text-white placeholder-white/30 font-bold uppercase tracking-wide focus:outline-none focus:border-brandYellow resize-none h-10 overflow-hidden transition-all"
              placeholder={placeholder}
              value={localPrompt}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={isProcessing}
              rows={1}
            />
          </div>
        )}

        {isExtractor && extractedDnaDetails && ( // Show DNA details for extractor
          <div className="p-3 bg-white/5 border border-white/10 rounded-sm text-[10px] text-white font-bold uppercase tracking-wide">
            <p>Domain: <span className="text-brandRed">{extractedDnaDetails.domain}</span></p>
            <p>Category: <span className="text-brandYellow">{extractedDnaDetails.category}</span></p>
            <p>Name: <span className="text-white">{extractedDnaDetails.name}</span></p>
            <p>Auth Score: <span className={extractedDnaDetails.styleAuthenticityScore >= 80 ? 'text-green-400' : 'text-brandRed'}>{extractedDnaDetails.styleAuthenticityScore.toFixed(1)}%</span></p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="shrink-0 flex flex-col md:flex-row items-stretch border-t-2 md:border-t-0 md:border-l-2 border-brandRed/10">
        <button
          onClick={onGenerate}
          disabled={isProcessing || (!isExtractor && !localPrompt.trim() && !activePresetName)} // Disable if no prompt/preset/image for non-extractor
          className={`flex-1 md:flex-none h-16 md:h-auto px-6 py-3 flex items-center justify-center gap-3 bg-brandRed text-white text-[10px] font-black uppercase tracking-widest hover:bg-brandRedHigh transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md md:shadow-lg
            ${isProcessing ? 'animate-pulse' : ''}
          `}
        >
          {isProcessing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              {isExtractor ? 'ANALYZE_DNA' : 'GENERATE_SYNTH'}
              <SparkleIcon className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};