
import React from 'react';

// --- Shared Components ---

interface SidebarHeaderProps {
  moduleNumber: string;
  title: string;
  version: string;
  colorClass: string; // e.g. "text-brandRed"
  borderColorClass: string; // e.g. "border-brandRed"
}

export const SidebarHeader: React.FC<SidebarHeaderProps> = ({
  moduleNumber,
  title,
  version,
  colorClass,
  borderColorClass
}) => (
  <div className={`mb-6 md:mb-8 border-b-2 ${borderColorClass} pb-4 md:pb-6`}>
    <div className={`text-[10px] font-black uppercase tracking-widest italic mb-2 ${colorClass}`}>
      {moduleNumber}
    </div>
    <h2 className="text-xl md:text-2xl font-black text-brandCharcoal dark:text-white uppercase italic tracking-tighter leading-none mb-1">
      {title}
    </h2>
    <p className="text-[8px] font-bold text-brandCharcoalMuted uppercase tracking-widest">
      {version}
    </p>
  </div>
);

// --- Layouts ---

interface PanelLayoutProps {
  sidebar?: React.ReactNode;
  children: React.ReactNode; // Main Content Area
}

/**
 * Standard Panel Layout
 * - Strict Breakpoint: 768px (md)
 * - Mobile: Sidebar hidden (handled by Carousel/Drawer in panels), content stacks.
 * - Desktop: Fixed width sidebar, fluid content.
 */
export const PanelLayout: React.FC<PanelLayoutProps> = ({ sidebar, children }) => {
  return (
    <div className="flex h-full w-full overflow-hidden bg-brandNeutral dark:bg-brandNeutral">
      {sidebar && (
        <aside className="hidden md:flex w-[var(--sidebar-w)] flex-col border-r border-brandCharcoal/10 dark:border-white/5 bg-brandNeutral dark:bg-brandDeep overflow-hidden z-10 shrink-0">
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-24">
            {sidebar}
          </div>
        </aside>
      )}
      
      <main className="flex-1 flex flex-col min-w-0 relative overflow-hidden bg-brandNeutral dark:bg-brandNeutral">
        {/* Scrollable Container for the main content area */}
        <div className="flex-1 overflow-y-auto custom-scrollbar"> 
          {/* Dynamic padding bottom ensures content clears the fixed AppControlsBar */}
          <div className="w-full max-w-[1400px] mx-auto flex flex-col gap-3 md:gap-6 p-2 md:p-6" style={{ paddingBottom: 'calc(var(--app-controls-bar-h) + 2rem)' }}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

interface PageLayoutProps {
  children: React.ReactNode;
  centered?: boolean;
}

/**
 * Standard Page Layout
 * - Single column.
 * - Unified Padding: p-4 (mobile) -> p-8 (desktop)
 * - Max Width enforcement.
 */
export const PageLayout: React.FC<PageLayoutProps> = ({ children, centered = false }) => {
  return (
    <div className={`flex-1 w-full h-full overflow-y-auto custom-scrollbar bg-brandNeutral dark:bg-brandNeutral relative ${centered ? 'flex items-center justify-center' : ''}`}>
      <div className="w-full max-w-[1400px] mx-auto p-4 md:p-8" style={{ paddingBottom: 'calc(var(--app-controls-bar-h) + 2rem)' }}>
        {children}
      </div>
    </div>
  );
};
