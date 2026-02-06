import React, { memo } from 'react';
import { StarIcon, PulseIcon } from './Icons';
import { ThemeToggle } from './PanelShared';

interface PanelHeaderProps {
  title?: string;
  onBack?: () => void;
  onStartRepair?: () => void;
  onStartRefine?: () => void;
  integrity?: number;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
  onToggleLogViewer?: () => void; // New prop for LogViewer
}

export const PanelHeader: React.FC<PanelHeaderProps> = memo(({ 
  title = "HYPERXGEN", 
  onBack = () => {}, 
  onStartRepair, 
  onStartRefine, 
  integrity,
  isDarkMode,
  onToggleTheme,
  onToggleLogViewer // Destructure new prop
}) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-[var(--header-h)] bg-brandCharcoal dark:bg-brandDeep dark:border-white/10 flex z-[100] border-b border-white/5 shadow-2xl backdrop-blur-xl bg-opacity-95 transition-all duration-300">
      <div className="w-full max-w-[1400px] mx-auto flex flex-row items-center justify-between h-full px-4 md:px-6">
        <div className="flex items-center gap-3 md:gap-6 min-w-0">
          <button onClick={onBack} className="flex items-center gap-2 md:gap-3 cursor-pointer group shrink-0">
            <div className="relative w-3 h-3 md:w-4 md:h-4">
               <div className="absolute inset-0 bg-brandRed rounded-full animate-ping opacity-30"></div>
               <div className="relative w-3 h-3 md:w-4 md:h-4 bg-brandRed rounded-full shadow-[0_0_12px_rgba(253,30,74,1)] flex items-center justify-center">
                 <div className="w-0.5 h-0.5 md:w-1 md:h-1 bg-white rounded-full"></div>
               </div>
            </div>
            <div className="flex flex-col items-start leading-none min-w-0">
              <div className="font-black text-xs md:text-sm tracking-[0.15em] md:tracking-[0.25em] text-brandNeutral dark:text-white uppercase italic group-hover:text-brandYellow transition-colors duration-300 truncate">
                {title}
              </div>
              <span className="text-[6px] md:text-[7px] font-black text-brandRed tracking-[0.1em] opacity-80 uppercase mt-0.5 hidden xs:block">OMEGA_CORE_ACTIVE</span>
            </div>
          </button>
        </div>

        <div className="flex items-center gap-2 md:gap-6 shrink-0">
          {typeof integrity === 'number' && (
            <div className="flex flex-col items-end hidden lg:flex border-r border-white/10 pr-6">
              <span className="text-[7px] font-black uppercase text-brandCharcoalMuted dark:text-white/30 tracking-widest leading-none mb-1">Stability_Core</span>
              <div className={`flex items-center gap-2 text-[11px] font-black uppercase italic ${integrity < 100 ? 'text-brandRed' : 'text-green-400'}`}>
                <PulseIcon className={`w-3 h-3 ${integrity === 100 ? 'animate-pulse' : 'animate-bounce'}`} />
                <span>{integrity}%_OK</span>
              </div>
            </div>
          )}
          <div className="flex gap-1 md:gap-2 items-center">
             {onStartRepair && (
               <button onClick={onStartRepair} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-white/10 bg-white/5 text-brandNeutral dark:text-white hover:border-blue-500 hover:text-blue-500 transition-all rounded-sm group shadow-sm hover:shadow-lg" title="Forensic Repair">
                 <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:rotate-6 transition-transform md:w-[18px] md:h-[18px]"><path d="M10 13l4-4M16 16l-4-4-4 4"/></svg>
               </button>
             )}
             {onStartRefine && (
               <button onClick={onStartRefine} className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-white/10 bg-white/5 text-brandNeutral dark:text-white hover:border-brandYellow hover:text-brandYellow transition-all rounded-sm group shadow-sm hover:shadow-lg" title="AI Code Refinement">
                 <StarIcon className="w-3.5 h-3.5 md:w-5 md:h-5 group-hover:scale-110 transition-transform" /> 
               </button>
             )}
             
             {/* New button for LogViewer */}
             {onToggleLogViewer && (
                <button 
                  onClick={onToggleLogViewer} 
                  className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center border border-white/10 bg-white/5 text-brandNeutral dark:text-white hover:border-brandRed hover:text-brandRed transition-all rounded-sm group shadow-sm hover:shadow-lg" 
                  title="View System Logs"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="group-hover:translate-y-px transition-transform md:w-[18px] md:h-[18px]"><path d="M12 20h9M12 4h9M4 12h17M4 12l-3-3m3 3l-3 3"/></svg>
                </button>
             )}

             {onToggleTheme && (
                <div className="ml-1 md:ml-2 border-l border-white/10 pl-2 md:pl-4">
                  <ThemeToggle isDarkMode={isDarkMode} onToggle={onToggleTheme} />
                </div>
             )}
          </div>
        </div>
      </div>
    </header>
  );
});