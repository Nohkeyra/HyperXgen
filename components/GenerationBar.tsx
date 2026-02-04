
import React, { useRef, useEffect, useState } from 'react';

interface GenerationBarProps {
  onGenerate: () => void;
  isProcessing: boolean;
  prompt?: string;
  setPrompt?: (v: string) => void;
  placeholder?: string;
  activePresetName?: string | null;
  children?: React.ReactNode;
  additionalControls?: React.ReactNode;
  refineButton?: React.ReactNode;
  useTurbo?: boolean;
  onToggleTurbo?: () => void;
}

export const GenerationBar: React.FC<GenerationBarProps> = ({ 
  onGenerate, 
  isProcessing, 
  prompt, 
  setPrompt, 
  placeholder = "Describe synthesis parameters...", 
  activePresetName,
  children, 
  additionalControls, 
  refineButton,
  useTurbo,
  onToggleTurbo
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [latticeId, setLatticeId] = useState('');

  useEffect(() => {
    const generateId = () => {
      const hex = Math.random().toString(16).substring(2, 8).toUpperCase();
      setLatticeId(`LAT_${hex}`);
    };
    generateId();
    if (isProcessing) {
      const interval = setInterval(generateId, 100);
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) onGenerate();
  };

  return (
    <div className={`w-full border-t-2 transition-colors duration-500 ${useTurbo ? 'border-brandYellow bg-brandNeutral dark:bg-black' : 'border-brandRed bg-brandNeutral dark:bg-brandDeep'} shadow-[0_-10px_30px_rgba(0,0,0,0.5)] z-50 rounded-sm py-2 px-3 md:py-4 md:px-6`}>
      <div className={`max-w-screen-2xl mx-auto flex flex-col md:flex-row items-stretch gap-0 border-2 transition-all duration-500 ${useTurbo ? 'border-brandYellow shadow-[0_0_20px_rgba(250,189,13,0.2)]' : 'border-brandCharcoal dark:border-white/20 shadow-[2px_2px_0px_0px_#FD1E4A] md:shadow-[4px_4px_0px_0px_#FD1E4A]'} bg-white dark:bg-black/60 overflow-hidden`}>
        
        {/* Left Side: Additional Controls */}
        <div className="flex-none bg-brandCharcoal/5 dark:bg-white/5 border-b md:border-b-0 md:border-r border-brandCharcoal dark:border-white/10 px-2 md:px-4 flex items-center py-2 md:py-0 gap-2">
          {onToggleTurbo && (
            <button 
              onClick={onToggleTurbo}
              disabled={isProcessing}
              title="Toggle Turbo Pro Synthesis (Bypass Standard Quota)"
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border transition-all text-[8px] font-black uppercase tracking-widest shrink-0
                ${useTurbo 
                  ? 'border-brandYellow bg-brandYellow/20 text-brandYellow shadow-[0_0_10px_rgba(250,189,13,0.3)]' 
                  : 'border-brandCharcoal/20 text-brandCharcoal dark:border-white/10 dark:text-white/40 hover:border-brandYellow'
                }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${useTurbo ? 'bg-brandYellow animate-ping' : 'bg-brandCharcoal/20 dark:bg-white/20'}`} />
              PRO_LATTICE
            </button>
          )}
          {additionalControls}
        </div>
        
        {/* Main Input Area */}
        <div className="flex-1 flex min-w-0 items-center bg-transparent">
          {activePresetName && (
            <div className="flex-none pl-3 md:pl-4 py-1 animate-in fade-in slide-in-from-left-2 duration-300">
              <div className={`px-2 py-1 ${useTurbo ? 'bg-brandYellow text-brandCharcoal border-brandYellow' : 'bg-brandRed text-white border-brandRed/50'} text-[7px] md:text-[8px] font-black uppercase italic tracking-widest rounded-sm border flex items-center gap-1.5 whitespace-nowrap shadow-sm transition-colors duration-500`}>
                <div className={`w-1 h-1 ${useTurbo ? 'bg-brandCharcoal' : 'bg-white'} rounded-full animate-pulse`} />
                <span className="opacity-70">DNA:</span> {activePresetName}
              </div>
            </div>
          )}

          <div className="flex-1 flex min-w-0 relative h-full">
            {children || (
              <input
                ref={inputRef}
                type="text"
                value={prompt || ''}
                onChange={e => setPrompt && setPrompt(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={placeholder}
                disabled={isProcessing}
                className={`w-full px-3 py-3 md:px-5 md:py-4 bg-transparent text-brandCharcoal dark:text-white font-mono text-xs md:text-sm focus:outline-none placeholder-brandCharcoalMuted/40 dark:placeholder-white/30 min-w-0 caret-brandRed`}
              />
            )}
            
            {refineButton && <div className="flex items-center px-1 md:px-2">{refineButton}</div>}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onGenerate}
          disabled={isProcessing}
          className={`flex-none px-6 py-3 md:px-10 md:py-4 font-black uppercase text-[10px] md:text-[11px] italic tracking-[0.15em] md:tracking-[0.25em] transition-all flex items-center justify-center border-l border-brandCharcoal/10 dark:border-white/10
            ${isProcessing 
              ? 'bg-black text-brandYellow animate-pulse cursor-wait' 
              : useTurbo
                ? 'bg-brandYellow text-brandCharcoal hover:bg-brandCharcoal hover:text-brandYellow active:translate-x-0.5 active:translate-y-0.5'
                : 'bg-brandRed text-white hover:bg-brandYellow hover:text-brandCharcoal active:translate-x-0.5 active:translate-y-0.5'
            }
          `}
        >
          {isProcessing ? (
            <div className="flex items-center gap-1 md:gap-2">
              <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>SYNCING</span>
            </div>
          ) : (
            <span className="flex items-center gap-2">
              <span className="hidden sm:inline">EXECUTE_LATTICE</span>
              <span className="sm:hidden">EXECUTE</span>
            </span>
          )}
        </button>
      </div>
      
      {/* Telemetry Footer */}
      <div className="max-w-screen-2xl mx-auto mt-1 md:mt-2 flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`w-1 h-1 md:w-1.5 md:h-1.5 rounded-full ${isProcessing ? 'bg-brandYellow animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[7px] md:text-[8px] font-black text-brandCharcoalMuted dark:text-white/40 uppercase tracking-widest">
            {isProcessing ? 'LATTICE_LOCK_ACTIVE' : (useTurbo ? 'LATTICE_LOCK_v5.2_TURBO' : 'LATTICE_LOCK_v5.2')}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[6px] md:text-[7px] font-mono ${useTurbo ? 'text-brandYellow' : 'text-brandRed'} font-black tracking-widest transition-colors duration-500`}>{latticeId}</span>
          <div className="h-2 w-[1px] bg-brandCharcoal/10 dark:bg-white/10" />
          <span className="text-[6px] md:text-[7px] font-black text-brandCharcoalMuted dark:text-white/20 uppercase">{useTurbo ? 'PRO_QUOTA_ENGAGED' : 'STANDARD_QUOTA_ENGAGED'}</span>
        </div>
      </div>
    </div>
  );
};
