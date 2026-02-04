
import React from 'react';
import { PanelMode, PresetCategory, PresetItem } from '../types';

interface PresetCarouselProps {
  presets: PresetCategory[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export const PresetCarousel: React.FC<PresetCarouselProps> = ({ presets, activeId, onSelect }) => {
  const getIconChar = (item: PresetItem) => {
    if (item.type) return item.type[0].toUpperCase();
    return '•';
  };

  const getIconColor = (item: PresetItem) => {
    const type = (item.type || '').toLowerCase();
    if (type.includes('vector')) return 'bg-brandRed/10 text-brandRed';
    if (type.includes('typo')) return 'bg-brandYellow/10 text-brandYellowDark';
    if (type.includes('mono')) return 'bg-brandCharcoal/10 text-brandCharcoal dark:bg-white/10 dark:text-white';
    return 'bg-brandCharcoal/5 text-brandCharcoalMuted';
  };

  return (
    <div className="md:hidden w-full overflow-x-auto no-scrollbar py-4 bg-brandNeutral dark:bg-brandNeutral border-y-2 border-brandCharcoal/10 dark:border-white/5">
      <div className="flex gap-8 px-6">
        {presets.map((category) => (
          <div key={category.title} className="flex-none flex flex-col gap-3">
            {/* Category Header */}
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-3 bg-brandRed rounded-full" />
              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-brandCharcoal/40 dark:text-white/40 italic">
                {category.title.replace('USER_', '')}
              </span>
            </div>

            {/* Category Items */}
            <div className="flex gap-4">
              {category.items.map((item) => {
                const isActive = activeId === item.id;
                const iconChar = getIconChar(item);
                const iconColorClass = getIconColor(item);

                return (
                  <button 
                    key={item.id} 
                    onClick={() => onSelect(item.id)} 
                    className={`flex-none w-64 p-4 flex flex-col transition-all duration-300 rounded-sm text-left relative overflow-hidden group border-2
                      ${isActive 
                        ? 'bg-brandRed border-brandRed text-white shadow-[8px_8px_0px_0px_rgba(253,30,74,0.3)] scale-[1.02]' 
                        : 'bg-white dark:bg-zinc-900 border-brandCharcoal/10 dark:border-white/10 text-brandCharcoal dark:text-brandNeutral hover:border-brandRed'
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 shrink-0 flex items-center justify-center font-black text-[10px] rounded-sm transition-all duration-300
                        ${isActive ? 'bg-white text-brandRed' : iconColorClass}
                      `}>
                        {iconChar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[10px] font-black uppercase truncate tracking-widest leading-none
                          ${isActive ? 'text-white' : 'text-brandCharcoal dark:text-brandYellow'}
                        `}>
                          {item.name}
                        </h4>
                        <div className={`h-[1px] transition-all duration-500 mt-1 ${isActive ? 'bg-white/40 w-full' : 'bg-brandRed/20 w-4'}`} />
                      </div>
                    </div>
                    
                    {/* Reveal description only when active */}
                    {isActive && (
                      <p className="mt-3 text-[8px] font-bold uppercase leading-tight line-clamp-3 italic text-white/90 animate-in fade-in slide-in-from-top-1 duration-300">
                        {item.description}
                      </p>
                    )}

                    {isActive && (
                      <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
