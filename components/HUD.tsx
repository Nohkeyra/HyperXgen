import React from 'react';

export const DevourerHUD: React.FC<{ devourerStatus: string }> = ({ devourerStatus }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none overflow-hidden">
    {/* Background Rings */}
    <div className="relative w-[120%] h-[120%] flex items-center justify-center opacity-20">
      <div className="absolute inset-0 border-[1px] border-brandRed/30 rounded-full animate-pulse" />
      <div className="w-[90%] h-[90%] border-[1px] border-brandRed/20 rounded-full border-dashed animate-spin-slow" />
      <div className="w-[70%] h-[70%] border-[1px] border-brandRed/30 rounded-full animate-spin-reverse-slow" />
    </div>
    
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 px-8 py-2.5 bg-brandCharcoal/80 rounded-full backdrop-blur-md border border-brandRed/40 shadow-[0_0_20px_rgba(253,30,74,0.4)]">
      <div className="text-[10px] font-black uppercase text-brandRed tracking-[0.5em] animate-pulse drop-shadow-[0_0_8px_rgba(253,30,74,0.8)]">
        {devourerStatus}
      </div>
    </div>
  </div>
);

export const ReconHUD: React.FC<{ reconStatus: string; authenticityScore?: number }> = ({ reconStatus, authenticityScore }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <div className={`relative w-64 h-64 border-[1px] border-brandRed/20 rounded-full flex items-center justify-center animate-pulse transition-opacity duration-1000 ${reconStatus === 'IDLE' ? 'opacity-0' : 'opacity-60'}`}>
      <div className="absolute inset-2 border-2 border-brandYellow/20 rounded-full animate-spin-slow" />
      
      {/* Target Crosshair */}
      <div className="absolute h-[110%] w-[1px] bg-brandRed/20" />
      <div className="absolute w-[110%] h-[1px] bg-brandRed/20" />
      
      {/* Corner Brackets inside the ring */}
      <div className="absolute top-10 left-10 w-4 h-4 border-t border-l border-brandRed/40" />
      <div className="absolute top-10 right-10 w-4 h-4 border-t border-r border-brandRed/40" />
      <div className="absolute bottom-10 left-10 w-4 h-4 border-b border-l border-brandRed/40" />
      <div className="absolute bottom-10 right-10 w-4 h-4 border-b border-r border-brandRed/40" />
      
      {/* Dynamic Status */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 px-8 py-2.5 bg-brandCharcoal/80 rounded-full backdrop-blur-md border border-brandRed/40 shadow-[0_0_20px_rgba(253,30,74,0.4)]">
        <div className="text-[10px] font-black uppercase text-brandRed tracking-[0.5em] animate-pulse drop-shadow-[0_0_8px_rgba(253,30,74,0.8)]">
          {reconStatus}
        </div>
        {typeof authenticityScore === 'number' && reconStatus !== 'IDLE' && (
          <div className="text-[8px] font-mono text-white/50">{authenticityScore.toFixed(1)}% AUTHENTICITY</div>
        )}
      </div>
    </div>
  </div>
);

// Fix: Add FilterHUD component and export it
export const FilterHUD: React.FC<{ filterStatus: string }> = ({ filterStatus }) => (
  <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 px-8 py-2.5 bg-brandCharcoal/80 rounded-full backdrop-blur-md border border-brandRed/40 shadow-[0_0_20px_rgba(253,30,74,0.4)]">
    <div className="text-[10px] font-black uppercase text-brandRed tracking-[0.5em] animate-pulse drop-shadow-[0_0_8px_rgba(253,30,74,0.8)]">
      {filterStatus}
    </div>
  </div>
);