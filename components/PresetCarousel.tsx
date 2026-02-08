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
    <div className="md:hidden w-full overflow-x-auto no-scrollbar py-2 bg-brandNeutral dark:bg-brandNeutral border-y border-brandCharcoal/5 dark:border-white/5">
      <div className="flex gap-6 px-4">
        {presets.map((category) => (
          <div key={category.title} className="flex-none flex flex-col gap-2">
            <div className="flex items-center gap-2 px-1">
              <div className="w-1 h-2 bg-brandRed rounded-full" />
              <span className="text-[7px] font-black uppercase tracking-[0.15em] text-brandCharcoal/30 dark:text-white/30 italic">
                {category.title.replace('USER_', '')}
              </span>
            </div>

            <div className="flex gap-3">
              {category.items.map((item) => {
                const isActive = activeId === item.id;
                const iconChar = getIconChar(item);
                const iconColorClass = getIconColor(item);

                return (
                  <button 
                    key={item.id} 
                    onClick={() => onSelect(item.id)} 
                    className={`flex-none w-48 p-3 flex flex-col transition-all duration-300 rounded-sm text-left relative overflow-hidden group border-2
                      ${isActive 
                        ? 'bg-brandRed border-brandRed text-white shadow-[4px_4px_0px_0px_rgba(253,30,74,0.2)]' 
                        : 'bg-white dark:bg-zinc-900 border-brandCharcoal/5 dark:border-white/5 text-brandCharcoal dark:text-brandNeutral hover:border-brandRed/30'
                      }`}
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-7 h-7 shrink-0 flex items-center justify-center font-black text-[9px] rounded-sm transition-all duration-300
                        ${isActive ? 'bg-white text-brandRed' : iconColorClass}
                      `}>
                        {iconChar}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`text-[9px] font-black uppercase truncate tracking-widest leading-none
                          ${isActive ? 'text-white' : 'text-brandCharcoal dark:text-brandYellow'}
                        `}>
                          {item.name}
                        </h4>
                        <div className={`h-[1px] transition-all duration-500 mt-1 ${isActive ? 'bg-white/30 w-full' : 'bg-brandRed/10 w-3'}`} />
                      </div>
                    </div>
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