
import React, { useState, useEffect, useCallback } from 'react';
import { NIcon, BoxIcon, StarIcon } from './Icons.tsx';

interface BootScreenProps {
  onBootComplete: () => void;
  isDarkMode: boolean;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onBootComplete, isDarkMode }) => {
  const [bootLog, setBootLog] = useState<string[]>([]);
  const [bootProgress, setBootProgress] = useState(0);
  const [bootStatus, setBootStatus] = useState("INITIATING_CORE_BOOT");

  const addBootLog = useCallback((message: string) => {
    setBootLog(prev => [...prev, message].slice(-5)); // Keep last 5 messages
  }, []);

  useEffect(() => {
    const bootSequence = async () => {
      addBootLog("INITIATING: OMEGA_KERNEL_BOOT");
      setBootProgress(10);
      await new Promise(res => setTimeout(res, 500));
      
      addBootLog("LATTICE_INTEGRITY_CHECK: 100%_OK");
      setBootProgress(30);
      await new Promise(res => setTimeout(res, 600));

      addBootLog("SUBSYSTEMS_ONLINE: VECTOR, TYPO, MONO, EXTRACTOR");
      setBootProgress(50);
      await new Promise(res => setTimeout(res, 700));

      addBootLog("DNA_BUFFER_SYNCHRONIZATION: COMPLETE");
      setBootProgress(70);
      await new Promise(res => setTimeout(res, 800));

      addBootLog("ARCHITECTURAL_ENGINE: READY");
      setBootProgress(90);
      await new Promise(res => setTimeout(res, 900));

      addBootLog("PROTOCOL: OMEGA_V5.2_ACTIVE");
      setBootProgress(100);
      setBootStatus("SYSTEM_READY");
      await new Promise(res => setTimeout(res, 1000));
      
      onBootComplete();
    };
    bootSequence();
  }, [addBootLog, onBootComplete]);

  return (
    <div className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center transition-colors duration-500
      ${isDarkMode ? 'bg-brandDeep text-white' : 'bg-brandNeutral text-brandCharcoal'}`}
    >
      <div className="absolute top-0 left-0 right-0 h-12 flex items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 bg-brandRed rounded-full animate-ping" />
          <span className="text-[7px] font-black uppercase text-brandRed tracking-widest">HYPERXGEN</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[7px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 tracking-widest">5G</span>
          <div className="w-0.5 h-3 bg-brandCharcoal/20 dark:bg-white/20" />
          <span className="text-[7px] font-black uppercase text-green-500 tracking-widest">57%</span>
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 max-w-lg w-full px-4 text-center relative">
        <div className="absolute top-16 left-0 flex flex-col items-start leading-none">
          <span className="text-[7px] font-black text-brandRed tracking-[0.1em] opacity-80 uppercase">OMEGA_CORE_ACTIVE</span>
          <span className="text-[9px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 tracking-wider">Stability_Core</span>
        </div>

        <NIcon className="w-48 h-48 sm:w-64 sm:h-64 text-brandCharcoal dark:text-white mb-8 opacity-20 animate-pulse" style={{ animationDuration: '2s' }} />
        
        <div className="absolute bottom-16 left-0 text-left">
          <div className="text-[9px] font-black uppercase tracking-wider mb-2 text-brandCharcoal dark:text-white">100%_OK</div>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center border-2 border-brandCharcoal/20 dark:border-white/10 text-brandCharcoalMuted dark:text-white/40 rounded-sm cursor-default">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M12 2L2 22h20L12 2z"/></svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border-2 border-brandCharcoal/20 dark:border-white/10 text-brandCharcoalMuted dark:text-white/40 rounded-sm cursor-default">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M4 7V4h16v3M9 20h6M12 4v16"/></svg>
            </button>
            <button className="w-8 h-8 flex items-center justify-center border-2 border-brandCharcoal/20 dark:border-white/10 text-brandCharcoalMuted dark:text-white/40 rounded-sm cursor-default">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M8 15V9l4 4 4-4v6" /><path d="M12 13V22" strokeWidth="1" opacity="0.3" /></svg>
            </button>
          </div>
        </div>

        <div className="absolute bottom-16 right-0 text-right">
          <span className="text-[7px] font-bold text-brandCharcoal dark:text-white/50 uppercase tracking-widest">Engine_v5.2</span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-brandCharcoal dark:text-white italic uppercase leading-none mt-1">HYPERXGEN</h1>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 flex items-center justify-between px-4 sm:px-6 border-t-2 border-brandCharcoal/20 dark:border-white/10">
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center group cursor-default">
            <BoxIcon className="w-6 h-6 text-brandCharcoal dark:text-white/60 group-hover:text-brandRed transition-colors" />
            <span className="text-[7px] font-bold uppercase text-brandCharcoal dark:text-white/40">History</span>
          </div>
          <div className="flex flex-col items-center group cursor-default">
            <StarIcon className="w-6 h-6 text-brandCharcoal dark:text-white/60 group-hover:text-brandYellow transition-colors" />
            <span className="text-[7px] font-bold uppercase text-brandCharcoal dark:text-white/40">Vault</span>
          </div>
          <div className="flex flex-col items-start ml-4">
            <span className="text-[7px] font-black text-brandCharcoalMuted dark:text-white/20 uppercase tracking-[0.2em]">Kernel_Status</span>
            <span className="text-[9px] font-black uppercase text-brandCharcoal dark:text-white/40">IDLE</span>
          </div>
        </div>

        <button 
          className="px-4 sm:px-6 py-2 bg-brandRed text-white text-[9px] font-black uppercase italic tracking-widest shadow-[4px_4px_0px_0px_rgba(253,30,74,0.3)] opacity-70 cursor-default rounded-sm"
        >
          COMMIT_DNASAVE
        </button>
      </div>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-brandCharcoal/20 dark:bg-white/10">
        <div 
          className="h-full bg-brandRed transition-all duration-1000 ease-out" 
          style={{ width: `${bootProgress}%` }} 
        />
      </div>

      {/* Boot Log Overlay */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/70 px-6 py-4 border border-brandRed/30 shadow-lg text-white font-mono text-[9px] uppercase tracking-wider backdrop-blur-md rounded-sm animate-in fade-in duration-500">
        {bootLog.map((log, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-brandRed rounded-full animate-ping" />
            <span>{log}</span>
          </div>
        ))}
        {bootStatus !== "SYSTEM_READY" && (
            <div className="flex items-center gap-2 mt-2 text-brandYellow animate-pulse">
                <div className="w-1.5 h-1.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                <span>LOADING... {bootProgress}%</span>
            </div>
        )}
      </div>
    </div>
  );
};
