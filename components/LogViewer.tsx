
import React, { useRef, useEffect } from 'react';
import { LogEntry } from '../types';
import { TrashIcon } from './Icons';

interface LogViewerProps {
  logs: LogEntry[];
  onClear: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const LogViewer: React.FC<LogViewerProps> = ({ logs, onClear, isOpen, onClose }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 sm:p-10 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-4xl h-full max-h-[600px] bg-brandCharcoal dark:bg-black border-2 border-brandRed shadow-[20px_20px_0px_0px_rgba(253,30,74,0.3)] flex flex-col overflow-hidden rounded-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/40">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-brandRed rounded-full animate-ping" />
            <h3 className="text-[10px] font-black text-brandRed uppercase tracking-[0.4em]">System_Trace_Buffer</h3>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={onClear} className="text-[8px] font-black text-white/40 hover:text-brandRed transition-colors uppercase">Clear_Buffer</button>
            <button onClick={onClose} className="text-[10px] font-black text-white hover:text-brandRed transition-colors uppercase">Close_X</button>
          </div>
        </div>

        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 font-mono text-[10px] space-y-2 custom-scrollbar">
          {logs.length === 0 ? (
            <div className="h-full flex items-center justify-center text-white/20 italic uppercase tracking-widest">Buffer_Empty</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-4 group hover:bg-white/5 py-1 px-2 rounded-sm transition-colors border-l border-white/5">
                <span className="text-white/20 shrink-0 select-none">[{log.timestamp}]</span>
                <span className={`
                  ${log.type === 'error' ? 'text-brandRed font-black' : 
                    log.type === 'warning' ? 'text-brandYellow' : 
                    log.type === 'success' ? 'text-green-400' : 'text-blue-400'}
                `}>
                  {log.message}
                </span>
              </div>
            ))
          )}
        </div>

        <div className="px-6 py-3 bg-black/60 border-t border-white/10 flex justify-between items-center">
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Total_Entries: {logs.length}</span>
          <span className="text-[8px] font-black text-brandRed/40 uppercase tracking-widest animate-pulse">Lattice_Sync_Active</span>
        </div>
      </div>
    </div>
  );
};
