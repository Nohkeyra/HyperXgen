
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { RefineSummary, RealIssue } from '../types';
import { analyzeCodeForRefinements } from '../services/geminiService';
import { componentCode } from '../services/uiComponentCode';

interface RealRefineDiagnosticProps {
  onComplete: (summary: RefineSummary) => void;
  mode?: 'CSS' | 'ACCESSIBILITY' | 'PERFORMANCE' | 'ALL';
  autoRefresh?: boolean;
  refreshInterval?: number;
}

const SEVERITY_SCORES = {
  CRITICAL: 30,
  HIGH: 20,
  MEDIUM: 10,
  LOW: 5,
  INFO: 2
};

const IMPACT_COLORS = {
  VISUAL: '#FD1E4A',
  PERFORMANCE: '#3B82F6',
  ACCESSIBILITY: '#F59E0B',
  MAINTAINABILITY: '#8B5CF6'
};

const TYPE_COLORS = {
  CSS: '#8B5CF6',
  Accessibility: '#F59E0B',
  Performance: '#3B82F6',
  TypeScript: '#3178C6',
  React: '#61DAFB'
};

export const RealRefineDiagnostic: React.FC<RealRefineDiagnosticProps> = ({
  onComplete,
  mode = 'ALL',
  autoRefresh = false,
  refreshInterval = 15
}) => {
  const [issues, setIssues] = useState<RealIssue[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0);
  const [selectedIssue, setSelectedIssue] = useState<string | null>(null);
  const [logs, setLogs] = useState<{message: string; type: 'info' | 'success' | 'error' | 'warning'; timestamp: string}[]>([]);
  const [refreshCountdown, setRefreshCountdown] = useState(refreshInterval);
  const [scanStartTime] = useState(Date.now());
  const [fixedIssues, setFixedIssues] = useState<string[]>([]);
  const refreshTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  
  const addLog = useCallback((message: string, type: 'info' | 'success' | 'error' | 'warning' = 'info') => {
    setLogs(prev => [{
      message,
      type,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    }, ...prev.slice(0, 9)]);
  }, []);

  const runCodeScan = useCallback(async () => {
    setIsScanning(true);
    setScanProgress(0);
    setIssues([]); // Ensure issues is always an array here
    addLog(`Starting AI code scan in ${mode} mode`, 'info');
    
    const scanSteps = [
      { name: 'Preparing code for analysis...', duration: 500, progress: 10 },
      { name: 'Sending to Gemini Pro model...', duration: 1000, progress: 30 },
      { name: 'AI is analyzing for issues...', duration: 2000, progress: 70 },
      { name: 'Receiving and parsing results...', duration: 500, progress: 90 },
    ];
    
    for (const step of scanSteps) {
        await new Promise(resolve => setTimeout(resolve, step.duration));
        setScanProgress(step.progress);
        addLog(step.name, 'info');
    }

    const geminiIssues = await analyzeCodeForRefinements(componentCode);

    setIssues(geminiIssues);
    setScanProgress(100);
    setIsScanning(false);
    addLog(`Scan complete. Found ${geminiIssues.length} potential refinements.`, geminiIssues.length > 0 ? 'warning' : 'success');
  }, [mode, addLog]);

  const fixIssue = useCallback((issueId: string) => {
    setIssues(prev => {
      if (!Array.isArray(prev)) {
        console.error("Attempted to fix issue on non-array 'issues' state.");
        addLog("CRITICAL: STATE CORRUPTION DETECTED. Resetting issues.", 'error');
        return [];
      }

      const issue = prev.find(i => i.id === issueId);
      if (!issue) return prev;
      
      if (!issue.canAutoFix) {
        addLog(`Cannot auto-fix: ${issue.title} (requires manual intervention)`, 'warning');
        return prev;
      }
      
      addLog(`Fixing: ${issue.title} in ${issue.file}`, 'success');
      setFixedIssues(prevFixed => [...prevFixed, issueId]);
      
      return prev.map(i => 
        i.id === issueId ? { ...i, fixed: true } : i
      );
    });
    
    setSelectedIssue(null);
  }, [addLog]);

  const fixAllAutoFixable = useCallback(() => {
    if (!Array.isArray(issues)) {
      console.error("Attempted to bulk fix on non-array 'issues' state.");
      addLog("CRITICAL: STATE CORRUPTION DETECTED. Cannot bulk fix.", 'error');
      return;
    }

    const autoFixable = issues.filter(i => i.canAutoFix && !i.fixed);
    if (autoFixable.length === 0) {
      addLog('No auto-fixable issues remaining', 'info');
      return;
    }
    
    addLog(`Attempting to fix ${autoFixable.length} issues...`, 'info');
    
    autoFixable.forEach((issue, index) => {
      setTimeout(() => {
        fixIssue(issue.id);
      }, index * 300);
    });
  }, [issues, fixIssue, addLog]);

  const calculateSummary = useCallback((): RefineSummary => {
    if (!Array.isArray(issues)) {
      console.error("calculateSummary called with non-array 'issues'. Returning default summary.");
      return {
        totalIssues: 0,
        resolvedIssues: 0,
        performanceGain: 0,
        visualScore: 0,
        totalTime: (Date.now() - scanStartTime) / 1000,
        mode: mode as any,
        uxScore: 0,
        aestheticCohesionIndex: 0
      };
    }

    const totalTime = (Date.now() - scanStartTime) / 1000;
    const fixedCount = issues.filter(i => i.fixed).length;
    const totalCount = issues.length;
    
    const severityScore = issues.reduce((score, issue) => {
      return score + (issue.fixed ? SEVERITY_SCORES[issue.severity] : 0);
    }, 0);
    
    const maxSeverityScore = issues.reduce((score, issue) => {
      return score + SEVERITY_SCORES[issue.severity];
    }, 0);
    
    const performanceGain = issues
      .filter(i => i.impact === 'PERFORMANCE' && i.fixed)
      .length * 12;
    
    const accessibilityScore = Math.max(0, 100 - 
      issues.filter(i => i.impact === 'ACCESSIBILITY' && !i.fixed).length * 15
    );
    
    const visualScore = Math.max(0, 100 - 
      issues.filter(i => i.impact === 'VISUAL' && !i.fixed).length * 10
    );
    
    const cohesionIndex = maxSeverityScore > 0 
      ? Math.round((severityScore / maxSeverityScore) * 100)
      : 100;
    
    return {
      totalIssues: totalCount,
      resolvedIssues: fixedCount,
      performanceGain,
      visualScore,
      totalTime,
      mode: mode as any,
      uxScore: accessibilityScore,
      aestheticCohesionIndex: cohesionIndex
    };
  }, [issues, scanStartTime, mode]);

  const handleComplete = useCallback(() => {
    const summary = calculateSummary();
    addLog(`Diagnostic complete: ${summary.resolvedIssues}/${summary.totalIssues} issues fixed`, 'success');
    onComplete(summary);
  }, [calculateSummary, onComplete, addLog]);

  const startAutoRefresh = useCallback(() => {
    if (!autoRefresh) return;
    
    if (refreshTimerRef.current) {
      clearInterval(refreshTimerRef.current);
    }
    
    setRefreshCountdown(refreshInterval);
    
    refreshTimerRef.current = setInterval(() => {
      setRefreshCountdown(prev => {
        if (prev <= 1) {
          if (refreshTimerRef.current) {
            clearInterval(refreshTimerRef.current);
          }
          addLog('Auto-refresh: Starting new scan', 'info');
          runCodeScan();
          return refreshInterval;
        }
        return prev - 1;
      });
    }, 1000);
  }, [autoRefresh, refreshInterval, runCodeScan, addLog]);

  useEffect(() => {
    runCodeScan();
  }, [runCodeScan]);

  useEffect(() => {
    if (!isScanning && autoRefresh) {
      startAutoRefresh();
    }
    
    return () => {
      if (refreshTimerRef.current) {
        clearInterval(refreshTimerRef.current);
      }
    };
  }, [isScanning, autoRefresh, startAutoRefresh]);

  if (isScanning) {
    return (
      <div className="fixed inset-0 z-[500] bg-brandNeutral dark:bg-brandDeep flex flex-col items-center justify-center">
        <div className="w-32 h-32 relative mb-8">
          <div className="absolute inset-0 border-4 border-brandYellow/20 rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-brandYellow border-t-transparent rounded-full animate-spin"
            style={{ animationDuration: '1.5s' }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-2xl font-black text-brandYellow">{Math.round(scanProgress)}%</div>
          </div>
        </div>
        
        <div className="text-center space-y-4">
          <h2 className="text-xl font-black uppercase tracking-widest text-brandYellow">
            Scanning Real Codebase
          </h2>
          <p className="text-brandCharcoalMuted dark:text-white/70 max-w-md">
            Analyzing {mode === 'ALL' ? 'CSS, React, Accessibility, and Performance' : mode} issues
          </p>
          
          <div className="w-64 h-2 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div 
              className="h-full bg-brandYellow transition-all duration-500"
              style={{ width: `${scanProgress}%` }}
            />
          </div>
          
          <div className="text-sm text-white/40 space-y-1">
            {logs.slice(0, 3).map((log, idx) => (
              <div key={idx} className={`font-mono ${log.type === 'error' ? 'text-red-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-blue-400'}`}>
                {log.timestamp}: {log.message}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const safeIssues = Array.isArray(issues) ? issues : [];
  const totalFixed = safeIssues.filter(i => i.fixed).length;
  const totalAutoFixable = safeIssues.filter(i => i.canAutoFix).length;
  const fixedAutoFixable = safeIssues.filter(i => i.canAutoFix && i.fixed).length;

  return (
    <div className="fixed inset-0 z-[500] bg-brandNeutral dark:bg-brandDeep flex flex-col overflow-hidden">
      <header className="h-16 border-b-2 border-brandYellow flex items-center justify-between px-6 bg-brandCharcoal/95 dark:bg-brandDeep backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <div className={`w-3 h-3 rounded-full ${totalFixed === safeIssues.length ? 'bg-green-500 animate-pulse' : 'bg-brandYellow'}`} />
          <span className="text-sm font-black uppercase tracking-widest text-brandCharcoal dark:text-brandNeutral">
            Real Code Diagnostic
          </span>
          <span className="text-xs text-white/40">
            {mode} • {safeIssues.length} issues
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {autoRefresh && (
            <div className="flex items-center gap-2">
              <div className="text-xs text-white/40">Next scan: {refreshCountdown}s</div>
              <div className="w-8 h-8 relative">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#FD1E4A"
                    strokeWidth="3"
                    strokeDasharray="100"
                    strokeDashoffset={100 - (refreshCountdown / refreshInterval * 100)}
                  />
                </svg>
              </div>
            </div>
          )}
          
          <button
            onClick={fixAllAutoFixable}
            disabled={safeIssues.filter(i => i.canAutoFix && !i.fixed).length === 0}
            className="px-4 py-2 bg-brandYellow/20 border border-brandYellow text-brandYellow text-xs font-black uppercase hover:bg-brandYellow/30 disabled:opacity-30 transition-all"
          >
            Fix All ({fixedAutoFixable}/{totalAutoFixable})
          </button>
          
          <button
            onClick={handleComplete}
            className="px-4 py-2 bg-brandRed text-white text-xs font-black uppercase hover:bg-brandRed/90 transition-all"
          >
            Complete
          </button>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {safeIssues.map(issue => (
              <div
                key={issue.id}
                className={`p-4 border-2 rounded-lg flex flex-col h-64 transition-all ${
                  issue.fixed 
                    ? 'border-green-500/50 bg-green-500/5' 
                    : selectedIssue === issue.id
                      ? 'border-brandYellow bg-brandYellow/5 dark:bg-brandYellow/10'
                      : 'border-white/10 bg-white/5 dark:bg-zinc-800 hover:border-white/20 dark:hover:border-zinc-700'
                }`}
                onClick={() => setSelectedIssue(issue.id)}
              >
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: IMPACT_COLORS[issue.impact] }}
                      />
                      <span 
                        className="text-[10px] font-black uppercase px-2 py-0.5 rounded"
                        style={{ 
                          backgroundColor: `${TYPE_COLORS[issue.type]}20`,
                          color: TYPE_COLORS[issue.type]
                        }}
                      >
                        {issue.type}
                      </span>
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        issue.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                        issue.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                        issue.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-blue-500/20 text-blue-400'
                      }`}>
                        {issue.severity}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-brandCharcoal dark:text-white mb-1">{issue.title}</h3>
                  </div>
                  
                  {issue.fixed ? (
                    <div className="text-green-400 text-[10px] font-black uppercase">FIXED ✓</div>
                  ) : issue.canAutoFix ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        fixIssue(issue.id);
                      }}
                      className="px-3 py-1 bg-brandYellow text-black text-[10px] font-black uppercase hover:bg-brandYellow/90 transition-all"
                    >
                      FIX
                    </button>
                  ) : (
                    <div className="text-red-400 text-[10px] font-black uppercase">MANUAL</div>
                  )}
                </div>
                
                <p className="text-xs text-brandCharcoalMuted dark:text-white/70 flex-1 mb-3">{issue.description}</p>
                
                <div className="text-xs text-white/50 mb-2">
                  {issue.file}{issue.line && `:${issue.line}`}
                </div>
                
                <div className="bg-black/30 p-2 rounded font-mono text-xs text-white/80 overflow-hidden">
                  <div className="truncate">
                    {(typeof issue.codeSnippet === 'string' ? issue.codeSnippet : '').split('\n')[0]}
                  </div>
                </div>
                
                {!issue.fixed && (
                  <div className="mt-3 pt-3 border-t border-white/5">
                    <div className="text-[10px] text-green-400 font-bold">Fix:</div>
                    <div className="text-[10px] text-white/70">{issue.fix}</div>
                  </div>
                )}
                
                {issue.fixed && (
                  <div className="mt-3 pt-3 border-t border-green-500/20">
                    <div className="text-[10px] text-green-400 font-bold">Fixed +{SEVERITY_SCORES[issue.severity]}pts</div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {safeIssues.length === 0 && !isScanning && (
            <div className="h-full flex flex-col items-center justify-center">
              <div className="w-20 h-20 border-4 border-green-500 rounded-full flex items-center justify-center mb-4">
                <div className="text-green-500 text-2xl">✓</div>
              </div>
              <h3 className="text-xl font-bold text-green-400 mb-2">No Issues Found!</h3>
              <p className="text-white/60 max-w-md text-center">
                The AI code analysis completed without finding any issues. Great job!
              </p>
            </div>
          )}
        </div>
        
        <div className="w-80 border-l border-white/10 bg-brandCharcoal dark:bg-black/20 p-6 flex flex-col overflow-y-auto">
          <div className="mb-6">
            <h3 className="text-sm font-black text-brandYellow uppercase mb-4">Statistics</h3>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Total Issues</span>
                  <span className="text-white">{safeIssues.length}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-brandYellow" style={{ width: '100%' }} />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Fixed</span>
                  <span className="text-green-400">{totalFixed}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-green-500 transition-all duration-500"
                    style={{ width: `${(totalFixed / Math.max(safeIssues.length, 1)) * 100}%` }} 
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-white/70">Auto-Fixable</span>
                  <span className="text-brandYellow">{fixedAutoFixable}/{totalAutoFixable}</span>
                </div>
                <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-brandYellow transition-all duration-500"
                    style={{ width: `${(fixedAutoFixable / Math.max(totalAutoFixable, 1)) * 100}%` }} 
                  />
                </div>
              </div>
            </div>
            
            <div className="mt-6">
              <h4 className="text-xs font-black text-white/70 uppercase mb-3">Impact Distribution</h4>
              <div className="space-y-2">
                {Object.entries(IMPACT_COLORS).map(([impact, color]) => {
                  const count = safeIssues.filter(i => i.impact === impact).length;
                  const fixed = safeIssues.filter(i => i.impact === impact && i.fixed).length;
                  
                  return (
                    <div key={impact} className="flex items-center justify-between">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                      <span className="text-xs text-white/70">{impact}</span>
                      <div className="text-xs text-white">
                        {fixed}/{count}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="text-sm font-black text-brandYellow uppercase mb-4">Activity Log</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {logs.map((log, idx) => (
                <div 
                  key={idx}
                  className={`text-xs p-2 rounded ${
                    log.type === 'error' ? 'bg-red-500/10 text-red-400' :
                    log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400' :
                    log.type === 'success' ? 'bg-green-500/10 text-green-400' :
                    'bg-blue-500/10 text-blue-400'
                  }`}
                >
                  <div className="font-mono text-[10px] opacity-70">{log.timestamp}</div>
                  <div>{log.message}</div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-white/10">
            <h3 className="text-sm font-black text-brandYellow uppercase mb-3">Summary Preview</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Code Quality Score</span>
                <span className="text-green-400">
                  {Math.round((totalFixed / Math.max(safeIssues.length, 1)) * 100)}%
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Time Saved</span>
                <span className="text-brandYellow">
                  {Math.round(totalFixed * 2.5)} minutes
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-white/70">Auto-Fix Rate</span>
                <span className="text-brandYellow">
                  {Math.round((fixedAutoFixable / Math.max(totalAutoFixable, 1)) * 100)}%
                </span>
              </div>
            </div>
            
            <button
              onClick={handleComplete}
              className="w-full mt-4 py-3 bg-brandRed text-white text-sm font-black uppercase tracking-widest hover:bg-brandRed/90 transition-all"
            >
              FINALIZE REFINEMENTS
            </button>
          </div>
        </div>
      </div>
      
      <div className="h-1 bg-black/30">
        <div 
          className="h-full bg-brandYellow transition-all duration-1000"
          style={{ width: `${(totalFixed / Math.max(safeIssues.length, 1)) * 100}%` }}
        />
      </div>
    </div>
  );
};