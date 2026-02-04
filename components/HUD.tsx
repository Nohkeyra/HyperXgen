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
    </div>
    
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
      <div className="px-8 py-2.5 bg-brandCharcoal/80 rounded-sm backdrop-blur-md border border-brandRed/40 shadow-[0_0_15px_rgba(253,30,74,0.2)]">
        <div className="text-[10px] font-black uppercase text-brandRed tracking-[0.4em] animate-pulse drop-shadow-[0_0_5px_rgba(253,30,74,0.5)]">
          {reconStatus}
          {(reconStatus === "DNA_HARVESTED" || reconStatus === "AUTHENTICITY_LOW") && authenticityScore !== undefined && (
            <span className={`ml-2 text-white/80`}>({authenticityScore.toFixed(0)}% AUTH)</span>
          )}
        </div>
      </div>
      <div className="flex gap-1">
        <div className="w-1 h-1 bg-brandRed rounded-full animate-ping" />
        <div className="w-1 h-1 bg-brandRed rounded-full animate-ping delay-75" />
        <div className="w-1 h-1 bg-brandRed rounded-full animate-ping delay-150" />
      </div>
    </div>
  </div>
);

export const FilterHUD: React.FC<{ filterStatus: string }> = ({ filterStatus }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
    <div className={`relative w-80 h-80 flex items-center justify-center transition-opacity duration-1000 ${filterStatus === 'IDLE' ? 'opacity-0' : 'opacity-60'}`}>
      <div className="absolute inset-0 border-2 border-brandYellow/10 animate-pulse" />
      <div className="absolute inset-4 border-2 border-brandYellow/20 rounded-full animate-spin-slow" />
      
      {/* Refractive elements */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-px h-full bg-gradient-to-b from-transparent via-brandYellow/20 to-transparent rotate-45" />
        <div className="w-px h-full bg-gradient-to-b from-transparent via-brandYellow/20 to-transparent -rotate-45" />
      </div>
    </div>
    
    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-brandCharcoal/80 px-8 py-2.5 rounded-full border border-brandYellow/50 backdrop-blur-md shadow-[0_0_20px_rgba(250,189,13,0.3)]">
      <div className="text-[10px] font-black uppercase text-brandYellow tracking-[0.3em] animate-pulse italic drop-shadow-[0_0_5px_rgba(250,189,13,0.8)]">
        {filterStatus}
      </div>
    </div>
  </div>
);