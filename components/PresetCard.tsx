
import React from 'react';

interface PresetCardProps {
  name: string;
  description: string;
  isActive: boolean;
  onClick: () => void;
  iconChar: string;
}

export const PresetCard: React.FC<PresetCardProps> = ({ name, description, isActive, onClick, iconChar }) => (
  <button 
    onClick={onClick} 
    className={`w-full p-4 flex flex-col transition-all duration-300 rounded-sm text-left relative overflow-hidden group border-2
      ${isActive 
        ? 'bg-brandRed border-brandRed text-white shadow-[0_8px_20px_rgba(253,30,74,0.4)] z-10 scale-[1.01]' 
        : 'bg-white/5 border-white/5 text-brandNeutral hover:bg-white/10 hover:border-brandRed/30'
      }
    `}
  >
    {isActive && (
      <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 -mr-12 -mt-12 rounded-full blur-2xl animate-pulse"></div>
    )}
    
    <div className="flex items-start gap-4 w-full">
      <div className={`shrink-0 w-10 h-10 flex items-center justify-center font-black text-sm rounded-sm transition-all duration-300
        ${isActive ? 'bg-white text-brandRed scale-110 shadow-lg' : 'bg-brandRed/10 text-brandRed group-hover:bg-brandRed group-hover:text-white'}
      `}>
        {iconChar}
      </div>
      
      <div className="min-w-0 flex-1 relative z-10 pt-1">
        <h4 className={`text-[11px] font-black uppercase truncate leading-tight mb-1 transition-colors tracking-widest
          ${isActive 
            ? 'text-white' 
            : 'text-brandCharcoal dark:text-brandYellow group-hover:text-brandRed dark:group-hover:text-white'
          }
        `}>
          {name}
        </h4>
        {/* Progress line indicator */}
        <div className={`h-[1px] transition-all duration-500 ${isActive ? 'bg-white/40 w-full' : 'bg-brandRed/20 w-4 group-hover:w-8'}`} />
      </div>
    </div>

    {/* Reveal description only when active/selected */}
    {isActive && (
      <div className="mt-4 animate-in fade-in slide-in-from-top-1 duration-300">
        <p className="text-[8px] font-bold uppercase leading-relaxed text-white/80 italic border-l-2 border-white/30 pl-3">
          {description}
        </p>
      </div>
    )}
  </button>
);
