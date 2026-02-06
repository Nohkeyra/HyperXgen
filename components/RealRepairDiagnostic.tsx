
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RepairSummary } from '../types';

interface RealRepairDiagnosticProps {
  onComplete: (summary: RepairSummary) => void;
}

interface ForensicNode {
  id: string;
  subsystem: string;
  integrity: number;
  status: 'STABLE' | 'DEGRADED' | 'CRITICAL';
  repaired: boolean;
  isRepairing: boolean;
  address: string;
}

export const RealRepairDiagnostic: React.FC<RealRepairDiagnosticProps> = ({ onComplete }) => {
  const [nodes, setNodes] = useState<ForensicNode[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [logs, setLogs] = useState<{message: string; timestamp: string; type: 'info' | 'success' | 'error'}[]>([]);
  const [repairProgress, setRepairProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: 'info' | 'success' | 'error' = 'info') => {
    setLogs(prev => [{
      message: msg,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type
    }, ...prev.slice(0, 15)]);
  }, []);

  useEffect(() => {
    const init = async () => {
      addLog("INITIATING_FORENSIC_KERNEL_AUDIT...", 'info');
      await new Promise(r => setTimeout(r, 1200));
      
      const subsystems = [
        "VECTOR_LATTICE_CORE",
        "GLYPH_SYNTAX_PARSER",
        "DNA_STORAGE_BUFFER",
        "NEURAL_FORGE_CONTROLLER",
        "AESTHETIC_COHESION_ENGINE",
        "TELEMETRY_LINK_MODULE",
        "KERNEL_STATE_PERSISTENCE"
      ];

      const initialNodes: ForensicNode[] = subsystems.map((name, i) => ({
        id: `node-${i}`,
        subsystem: name,
        integrity: 35 + Math.random() * 35,
        status: i < 2 ? 'CRITICAL' : 'DEGRADED',
        repaired: false,
        isRepairing: false,
        address: `0x${Math.floor(Math.random() * 0xFFFFFF).toString(16).toUpperCase().padStart(6, '0')}`
      }));

      setNodes(initialNodes);
      setIsScanning(false);
      addLog(`AUDIT_COMPLETE: Found ${initialNodes.length} degraded subsystems.`, 'error');
    };
    init();
  }, [addLog]);

  const handleRepair = async (id: string) => {
    const nodeName = nodes.find(n => n.id === id)?.subsystem;
    setNodes(prev => prev.map(n => n.id === id ? { ...n, isRepairing: true } : n));
    addLog(`PATCH_SEQUENCE_INIT: ${nodeName}`, 'info');
    
    await new Promise(r => setTimeout(r, 1500));
    
    setNodes(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, integrity: 100, status: 'STABLE' as const, repaired: true, isRepairing: false } : n);
      const repairedCount = updated.filter(n => n.repaired).length;
      setRepairProgress((repairedCount / updated.length) * 100);
      return updated;
    });
    addLog(`RESTORED: ${nodeName} @ 100%_INTEGRITY`, 'success');
  };

  const handleBulkRepair = async () => {
    addLog("EXECUTING_BULK_RECONSTRUCTION_PROTOCOL", 'info');
    const unrepaired = nodes.filter(n => !n.repaired);
    for (const node of unrepaired) {
      await handleRepair(node.id);
      await new Promise(r => setTimeout(r, 200));
    }
  };

  const handleFinalize = () => {
    onComplete({
      totalNodes: nodes.length,
      repairedNodes: nodes.filter(n => n.repaired).length,
      failedNodes: nodes.filter(n => !n.repaired).length,
      averageRepairTime: 1.5,
      totalTime: nodes.filter(n => n.repaired).length * 1.5,
      criticalFailures: 0,
      systemStabilityScore: Math.round((nodes.filter(n => n.repaired).length / nodes.length) * 100)
    });
  };

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[600] bg-brandDeep flex flex-col items-center justify-center font-mono">
        <div className="relative w-24 h-24 mb-8">
          <div className="absolute inset-0 border-2 border-brandRed/20 rounded-full" />
          <div className="absolute inset-0 border-t-2 border-brandRed rounded-full animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-1 h-1 bg-brandRed rounded-full animate-ping" />
          </div>
        </div>
        <div className="text-brandRed text-[10px] font-black uppercase tracking-[0.5em] animate-pulse italic">
          Engaging_Forensic_Lattice_Scan...
        </div>
      </div>
    );
  }

  const allRepaired = nodes.every(n => n.repaired);

  return (
    <div className="fixed inset-0 z-[600] bg-brandNeutral dark:bg-brandDeep flex flex-col font-mono overflow-hidden animate-in fade-in duration-500">
      <header className="h-16 border-b-2 border-brandRed flex items-center justify-between px-8 bg-brandCharcoal/95 dark:bg-black/60 backdrop-blur-xl shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex flex-col">
            <h2 className="text-sm font-black italic uppercase tracking-[0.2em] text-brandRed">HyperXGen_Forensic_Kernel</h2>
            <span className="text-[7px] text-white/40 uppercase tracking-[0.1em]">Protocol: Reconstruction_v5.2 // Mode: Restoration</span>
          </div>
          <div className="h-8 w-[1px] bg-white/10" />
          <div className="flex items-center gap-3">
             <div className="flex flex-col">
               <span className="text-[7px] font-black text-white/30 uppercase">Lattice_Integrity</span>
               <div className="flex items-center gap-2">
                 <div className={`w-1.5 h-1.5 rounded-full ${allRepaired ? 'bg-green-500' : 'bg-brandYellow animate-pulse'}`} />
                 <span className={`text-xs font-black italic ${allRepaired ? 'text-green-400' : 'text-brandYellow'}`}>{Math.round(repairProgress)}%_OK</span>
               </div>
             </div>
          </div>
        </div>

        <div className="flex gap-4">
           {!allRepaired && (
             <button 
               onClick={handleBulkRepair}
               className="bg-brandRed/10 border border-brandRed text-brandRed px-6 py-2 text-[10px] font-black uppercase tracking-widest hover:bg-brandRed hover:text-white transition-all shadow-[0_0_15px_rgba(253,30,74,0.2)]"
             >
               Bulk_Restore
             </button>
           )}
           <button 
             onClick={handleFinalize}
             className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${allRepaired ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-white/5 border border-white/10 text-white/40 hover:text-brandRed'}`}
           >
             {allRepaired ? 'SYNC_COMPLETE' : 'FORCE_ABORT'}
           </button>
        </div>
      </header>

      <div className="flex-1 flex flex-col md:flex-row min-h-0">
        {/* Subsystem Manifest */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-8 space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            {nodes.map(node => (
              <div 
                key={node.id} 
                className={`p-5 border-2 transition-all relative group overflow-hidden ${
                  node.repaired 
                    ? 'bg-green-500/5 border-green-500/30' 
                    : node.status === 'CRITICAL' 
                      ? 'bg-brandRed/5 border-brandRed/40 animate-pulse' 
                      : 'bg-brandCharcoal dark:bg-black/20 border-white/5'
                }`}
              >
                {node.isRepairing && (
                  <div className="absolute inset-0 bg-brandDeep/80 z-20 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex flex-col items-center gap-2">
                       <div className="w-6 h-6 border-2 border-brandRed border-t-transparent rounded-full animate-spin" />
                       <span className="text-[7px] font-black text-brandRed uppercase tracking-[0.3em]">REWRITING_DNA...</span>
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-4">
                  <div className="flex flex-col">
                    <span className="text-[8px] font-mono text-white/30 mb-1">{node.address}</span>
                    <h4 className="text-[11px] font-black text-white/90 uppercase tracking-wider">{node.subsystem}</h4>
                  </div>
                  <span className={`text-[8px] px-2 py-0.5 rounded-sm font-black border ${
                    node.status === 'STABLE' ? 'bg-green-500/20 text-green-400 border-green-500/30' : 
                    node.status === 'CRITICAL' ? 'bg-brandRed/20 text-brandRed border-brandRed/30' : 
                    'bg-brandYellow/20 text-brandYellow border-brandYellow/30'
                  }`}>
                    {node.status}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[9px] font-black uppercase">
                    <span className="text-white/40">Integrity_Coefficient</span>
                    <span className={node.repaired ? 'text-green-400' : 'text-brandYellow'}>{Math.round(node.integrity)}%</span>
                  </div>
                  <div className="h-1 bg-white/5 w-full rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-1000 ${node.repaired ? 'bg-green-500' : 'bg-brandRed'}`}
                      style={{ width: `${node.integrity}%` }}
                    />
                  </div>
                </div>

                {!node.repaired && (
                  <button 
                    onClick={() => handleRepair(node.id)}
                    disabled={node.isRepairing}
                    className="mt-4 w-full py-2 bg-white/5 border border-white/10 text-white/60 hover:bg-brandRed hover:text-white hover:border-brandRed text-[9px] font-black uppercase tracking-widest transition-all"
                  >
                    Initiate_Patch
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Telemetry Sidebar */}
        <div className="w-full md:w-96 border-l-2 border-brandRed bg-brandCharcoal dark:bg-black/40 flex flex-col shrink-0">
          <div className="p-6 border-b border-white/5">
            <h3 className="text-[10px] font-black text-brandRed uppercase tracking-[0.3em] mb-4">Kernel_Trace_Buffer</h3>
            <div className="h-64 overflow-y-auto custom-scrollbar space-y-2 font-mono text-[9px]">
              {logs.length === 0 ? (
                <div className="text-white/20 italic">Awaiting telemetry handshake...</div>
              ) : (
                logs.map((log, i) => (
                  <div key={i} className={`flex gap-3 animate-in slide-in-from-left duration-300 ${log.type === 'error' ? 'text-brandRed' : log.type === 'success' ? 'text-green-400' : 'text-blue-400'}`}>
                    <span className="text-white/20 shrink-0 select-none">[{log.timestamp}]</span>
                    <span className="flex-1 uppercase font-bold">{log.message}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-6 flex-1 flex flex-col justify-end bg-gradient-to-t from-brandRed/5 to-transparent">
             <div className="space-y-6">
                <div className="space-y-1">
                   <div className="flex justify-between text-[8px] font-black text-white/40 uppercase">
                     <span>Core_Stabilization</span>
                     <span>{allRepaired ? 'LOCK_OK' : 'IN_PROGRESS'}</span>
                   </div>
                   <div className="h-1.5 bg-white/10 w-full">
                     <div className="h-full bg-brandRed animate-pulse" style={{ width: allRepaired ? '100%' : '65%' }} />
                   </div>
                </div>
                <p className="text-[8px] font-bold text-white/30 uppercase leading-relaxed italic">
                  Forensic repair mode bypasses standard UI safety protocols to force-align kernel segments at the sub-atomic lattice level.
                </p>
                <div className="flex items-center gap-3 p-3 bg-black/40 border border-brandRed/20">
                  <div className="w-1.5 h-1.5 bg-brandRed rounded-full animate-ping" />
                  <span className="text-[7px] font-black text-brandRed uppercase tracking-[0.4em]">System_Sync_Active</span>
                </div>
             </div>
          </div>
        </div>
      </div>
      
      {/* Footer Progress Strip */}
      <div className="h-1 bg-white/5">
        <div 
          className="h-full bg-brandRed transition-all duration-1000 shadow-[0_0_10px_#FD1E4A]"
          style={{ width: `${repairProgress}%` }}
        />
      </div>
    </div>
  );
};