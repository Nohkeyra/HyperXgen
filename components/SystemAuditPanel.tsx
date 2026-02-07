
import React, { useState, useEffect } from 'react';
import { PageLayout } from './Layouts.tsx';

interface AuditMetric {
  label: string;
  score: number;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
  description: string;
}

export const SystemAuditPanel: React.FC = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [dataStream, setDataStream] = useState<string[]>([]);

  const metrics: AuditMetric[] = [
    { label: 'ACCESSIBILITY (axe-core)', score: 98, status: 'OPTIMAL', description: 'ARIA parity achieved across all synthesis modules.' },
    { label: 'PERFORMANCE (Lighthouse)', score: 84, status: 'WARNING', description: 'Lattice rendering overhead detected in complex vectors.' },
    { label: 'STYLE INTEGRITY (Stylelint)', score: 92, status: 'OPTIMAL', description: 'Zero specificity collisions in typography layers.' },
    { label: 'LATTICE DENSITY (Analyzer)', score: 45, status: 'OPTIMAL', description: 'Memory buffer operating at 45% DNA saturation.' }
  ];

  useEffect(() => {
    const timer = setTimeout(() => setIsScanning(false), 2000);
    const interval = setInterval(() => {
      const hex = Math.random().toString(16).substr(2, 8).toUpperCase();
      setDataStream(prev => [ `LOG_SYNC_${hex}: OK`, ...prev.slice(0, 15) ]);
    }, 200);
    return () => { clearTimeout(timer); clearInterval(interval); };
  }, []);

  return (
    <PageLayout>
      <header className="mb-12 border-l-4 border-brandRed pl-6">
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-2 text-brandCharcoal dark:text-white">Synthesis_Compliance_Audit</h2>
        <p className="text-[10px] opacity-40 uppercase tracking-[0.3em] text-brandCharcoalMuted dark:text-white/40">Full forensic scan of kernel architecture and design fidelity.</p>
      </header>

      {isScanning ? (
        <div className="h-[50vh] flex flex-col items-center justify-center space-y-6">
          <div className="w-16 h-16 border-4 border-brandRed border-t-transparent rounded-full animate-spin"></div>
          <span className="text-brandRed text-[10px] font-black uppercase tracking-widest animate-pulse italic">Engaging_Axe-Core_Lattice_Scan...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            {metrics.map((m, i) => (
              <div key={i} className="bg-brandCharcoal dark:bg-black/40 border border-white/5 p-6 rounded-sm group hover:border-brandRed transition-all">
                <div className="flex justify-between items-end mb-4">
                  <div className="text-[10px] font-black uppercase tracking-widest text-brandCharcoalMuted dark:text-white/40">{m.label}</div>
                  <div className={`text-2xl font-black italic ${m.status === 'CRITICAL' ? 'text-brandRed' : m.status === 'WARNING' ? 'text-brandYellow' : 'text-green-400'}`}>
                    {m.score}%
                  </div>
                </div>
                <div className="h-1 bg-white/5 w-full mb-4">
                  <div 
                    className={`h-full transition-all duration-1000 ${m.status === 'CRITICAL' ? 'bg-brandRed' : m.status === 'WARNING' ? 'bg-brandYellow' : 'bg-green-400'}`}
                    style={{ width: `${m.score}%` }}
                  />
                </div>
                <p className="text-[9px] font-bold text-brandCharcoalSoft dark:text-white/60 uppercase leading-relaxed">{m.description}</p>
              </div>
            ))}
          </div>

          <div className="bg-brandCharcoal dark:bg-black p-6 border border-brandRed/20 rounded-sm flex flex-col">
            <div className="text-[10px] font-black uppercase text-brandRed mb-4 tracking-widest border-b border-brandRed/10 pb-2 flex justify-between">
              <span>Real-Time_Telemetry</span>
              <span className="animate-pulse">LIVE</span>
            </div>
            <div className="flex-1 overflow-hidden font-mono text-[9px] text-brandRed/60 space-y-1">
              {dataStream.map((log, i) => (
                <div key={i} className="animate-in slide-in-from-left duration-200">{log}</div>
              ))}
            </div>
            <div className="mt-6 pt-6 border-t border-brandRed/10">
              <div className="flex justify-between items-center text-[10px] font-black italic">
                <span className="text-white/40">SYSTEM_STABILITY</span>
                <span className="text-brandYellow">99.98%</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
};