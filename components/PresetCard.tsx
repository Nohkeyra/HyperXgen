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
    className={`w-full p-3 flex flex-col transition-all duration-300 rounded-sm text-left relative overflow-hidden group border-2
      ${isActive 
        ? 'bg-brandRed border-brandRed text-white shadow-[0_4px_12px_rgba(253,30,74,0.3)] z-10' 
        : 'bg-white/5 border-white/5 text-brandNeutral hover:bg-white/10 hover:border-brandRed/30'
      }
    `}
  >
    <div className="flex items-center gap-3 w-full">
      <div className={`shrink-0 w-8 h-8 flex items-center justify-center font-black text-[10px] rounded-sm transition-all duration-300
        ${isActive ? 'bg-white text-brandRed scale-105 shadow-sm' : 'bg-brandRed/10 text-brandRed group-hover:bg-brandRed group-hover:text-white'}
      `}>
        {iconChar}
      </div>
      
      <div className="min-w-0 flex-1 relative z-10">
        <h4 className={`text-[10px] font-black uppercase truncate leading-tight transition-colors tracking-widest
          ${isActive 
            ? 'text-white' 
            : 'text-brandCharcoal dark:text-brandYellow group-hover:text-brandRed dark:group-hover:text-white'
          }
        `}>
          {name}
        </h4>
        <div className={`h-[1px] transition-all duration-500 mt-0.5 ${isActive ? 'bg-white/40 w-full' : 'bg-brandRed/20 w-4 group-hover:w-8'}`} />
      </div>

      {isActive && (
        <div className="flex-none animate-in fade-in zoom-in duration-300">
           <span className="text-[7px] font-black bg-white/20 px-1.5 py-0.5 rounded-full uppercase tracking-tighter">Active</span>
        </div>
      )}
    </div>
  </button>
);