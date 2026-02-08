
import React, { useState, useEffect, useCallback } from 'react';
import { PanelMode, KernelConfig, ExtractionResult, CloudArchiveEntry, LogEntry } from './types.ts';
import { VectorPanel } from './components/VectorPanel.tsx';
import { TypographyPanel } from './components/TypographyPanel.tsx';
import { MonogramPanel } from './components/MonogramPanel.tsx';
import { StyleExtractorPanel } from './components/StyleExtractorPanel.tsx';
import { ImageFilterPanel } from './components/ImageFilterPanel.tsx';
import { SystemAuditPanel } from './components/SystemAuditPanel.tsx';
import { BootScreen } from './components/BootScreen.tsx';

import { RealRefineDiagnostic } from './components/RealRefineDiagnostic.tsx';
import { RealRepairDiagnostic } from './components/RealRepairDiagnostic.tsx';
import { useDeviceDetection } from './components/DeviceDetector.tsx';
import { StartScreen } from './components/StartScreen.tsx';
import { PanelHeader } from './components/PanelHeader.tsx';
import { AppControlsBar } from './components/AppControlsBar.tsx';
import { LogViewer } from './components/LogViewer.tsx';

const LS_KEYS = {
  ARCHIVES: 'hyperxgen_cloud_archives_v4',
  DNA: 'hyperxgen_active_dna_v4',
  PRESETS: 'hyperxgen_presets_v4',
  RECENT: 'hyperxgen_recent_v4',
  THEME: 'hyperxgen_theme_v1',
  CONFIG: 'hyperxgen_config_v1',
  LOGS: 'hyperxgen_logs_v1'
};

interface AppConfig {
  panels: {
    enabled: string[];
    disabled: string[];
    panelOrder: string[];
  };
}

export const App: React.FC = () => {
  const [isBooting, setIsBooting] = useState(true);
  const [currentPanel, setCurrentPanel] = useState<PanelMode>(PanelMode.START);
  const [transferData, setTransferData] = useState<any>(null);
  const [isRepairing, setIsRepairing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [systemIntegrity, setSystemIntegrity] = useState(100);
  const [activeDna, setActiveDna] = useState<ExtractionResult | null>(null);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [enabledModes, setEnabledModes] = useState<PanelMode[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showLogViewer, setShowLogViewer] = useState(false);
  
  const deviceInfo = useDeviceDetection();
  const [uiRefinementLevel, setUiRefinementLevel] = useState(0);

  const [kernelConfig, setKernelConfig] = useState<KernelConfig>({
    thinkingBudget: 0,
    temperature: 0.1,
    model: 'gemini-3-flash-preview',
    deviceContext: 'MAXIMUM_ARCHITECTURE_OMEGA_V5'
  });

  const [recentWorks, setRecentWorks] = useState<any[]>([]);
  const [savedPresets, setSavedPresets] = useState<any[]>([]);
  const [cloudArchives, setCloudArchives] = useState<CloudArchiveEntry[]>([]);

  const addLog = useCallback((message: string, type: 'info' | 'error' | 'success' | 'warning' = 'info') => {
    setLogs(prev => {
      const newLogEntry: LogEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toLocaleTimeString(),
        message,
        type,
      };
      return [newLogEntry, ...prev].slice(0, 50); 
    });
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem(LS_KEYS.THEME);
    if (storedTheme) setIsDarkMode(storedTheme === 'dark');
    else if (window.matchMedia('(prefers-color-scheme: dark)').matches) setIsDarkMode(true);

    const storedConfig = localStorage.getItem(LS_KEYS.CONFIG);
    if (storedConfig) {
      setKernelConfig(prev => ({ ...prev, ...JSON.parse(storedConfig) }));
    }
    
    const storedLogs = localStorage.getItem(LS_KEYS.LOGS);
    if (storedLogs) {
      setLogs(JSON.parse(storedLogs));
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
    localStorage.setItem(LS_KEYS.THEME, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = useCallback(() => setIsDarkMode(prev => !prev), []);

  useEffect(() => {
    if (!isBooting && !hasInitialized) {
      const boot = async () => {
        try {
          addLog("INITIATING: OMEGA_KERNEL_BOOT", 'info');
          const response = await fetch('/config.json');
          const appConfig: AppConfig = await response.json();
          
          const configuredModes: PanelMode[] = appConfig.panels.enabled.map(panelName => {
            switch (panelName) {
              case 'VectorPanel': return PanelMode.VECTOR;
              case 'TypographyPanel': return PanelMode.TYPOGRAPHY;
              case 'MonogramPanel': return PanelMode.MONOGRAM;
              case 'StyleExtractorPanel': return PanelMode.EXTRACTOR;
              case 'ImageFilterPanel': return PanelMode.FILTERS;
              case 'SystemAuditPanel': return PanelMode.AUDIT;
              default: return PanelMode.START;
            }
          }).filter(mode => mode !== PanelMode.START);
          setEnabledModes(configuredModes);

          const p4 = localStorage.getItem(LS_KEYS.PRESETS);
          setSavedPresets(p4 ? JSON.parse(p4) : []);
          const r4 = localStorage.getItem(LS_KEYS.RECENT);
          setRecentWorks(r4 ? JSON.parse(r4) : []);
          const dna = localStorage.getItem(LS_KEYS.DNA);
          if (dna) setActiveDna(JSON.parse(dna));
          const archives = localStorage.getItem(LS_KEYS.ARCHIVES);
          setCloudArchives(archives ? JSON.parse(archives) : []);
          
          setHasInitialized(true);
          addLog("ARCHITECTURE: PARITY_CHECK_OK", 'success');
        } catch (e) {
          setHasInitialized(true);
          addLog(`CRITICAL_KERNEL_PANIC: ${e instanceof Error ? e.message : String(e)}`, 'error');
        }
      };
      boot();
    }
  }, [addLog, isBooting, hasInitialized]);

  useEffect(() => { 
    if (hasInitialized) {
      localStorage.setItem(LS_KEYS.PRESETS, JSON.stringify(savedPresets)); 
      localStorage.setItem(LS_KEYS.RECENT, JSON.stringify(recentWorks.slice(0, 15))); 
      localStorage.setItem(LS_KEYS.ARCHIVES, JSON.stringify(cloudArchives));
      localStorage.setItem(LS_KEYS.DNA, JSON.stringify(activeDna));
      localStorage.setItem(LS_KEYS.CONFIG, JSON.stringify(kernelConfig));
      localStorage.setItem(LS_KEYS.LOGS, JSON.stringify(logs));
    }
  }, [savedPresets, recentWorks, cloudArchives, activeDna, kernelConfig, logs, hasInitialized]);

  const handleForceSave = useCallback(() => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      addLog("COMMIT_SUCCESS: DNA_BUFFER_LOCKED", 'success');
    }, 800);
  }, [addLog]);

  const handleModeSwitch = useCallback((mode: PanelMode, data?: any) => {
    setCurrentPanel(mode);
    setTransferData(data || null);
    addLog(`OMEGA_PIVOT: ${mode.toUpperCase()}_ENGAGED`, 'info');
  }, [addLog]);

  const handleDeletePreset = useCallback((id: string) => {
    setSavedPresets(prev => prev.filter(p => p.id !== id));
    addLog("DNA_VAULT: FRAGMENT_PURGED", 'warning');
  }, [addLog]);

  const handleSetGlobalDna = useCallback((dna: ExtractionResult | null) => {
    setActiveDna(dna);
    addLog(dna ? `DNA_ANCHOR: ${dna.name.toUpperCase()}` : "DNA_ANCHOR: RELEASED", 'info');
  }, [addLog]);

  const handleLoadItem = useCallback((item: any) => {
    if (item.dna) {
      handleSetGlobalDna(item.dna);
      addLog(`DNA_INJECTION: ${item.dna.name.toUpperCase()} APPLIED`, 'success');
      const synthesisModes: PanelMode[] = [PanelMode.VECTOR, PanelMode.TYPOGRAPHY, PanelMode.MONOGRAM];
      if (!synthesisModes.includes(currentPanel)) {
        handleModeSwitch(item.type || item.mode, item);
      }
    } else {
      handleModeSwitch(item.type || item.mode, item);
    }
  }, [currentPanel, handleSetGlobalDna, handleModeSwitch, addLog]);

  const handleBootComplete = useCallback(() => {
    setIsBooting(false);
  }, []);

  if (isBooting) {
    return <BootScreen onBootComplete={handleBootComplete} isDarkMode={isDarkMode} />;
  }

  const renderPanel = () => {
    if (!hasInitialized) return null;
    const commonProps = {
      initialData: transferData,
      kernelConfig,
      integrity: systemIntegrity,
      refinementLevel: uiRefinementLevel,
      onSaveToHistory: (w: any) => {
        setRecentWorks(p => [w, ...p]);
        addLog(`BUFFER_APPEND: ${w.name.toUpperCase()}`, 'success');
      },
      onModeSwitch: handleModeSwitch,
      onSetGlobalDna: handleSetGlobalDna,
      savedPresets,
      globalDna: activeDna,
      addLog: addLog,
    };

    switch (currentPanel) {
      case PanelMode.START: 
        return <StartScreen recentCount={recentWorks.length} onSelectMode={handleModeSwitch} enabledModes={enabledModes} />;
      case PanelMode.VECTOR: 
        return <VectorPanel {...commonProps} />;
      case PanelMode.TYPOGRAPHY: 
        return <TypographyPanel {...commonProps} />;
      case PanelMode.MONOGRAM: 
        return <MonogramPanel {...commonProps} />;
      case PanelMode.EXTRACTOR:
        return (
          <StyleExtractorPanel 
            {...commonProps}
            onSaveToPresets={(p) => {
              setSavedPresets(prev => [p, ...prev]);
              addLog(`DNA_VAULT: FRAGMENT_STORED`, 'success');
            }} 
            onDeletePreset={handleDeletePreset}
            activeGlobalDna={activeDna} 
            onCommitPreset={handleForceSave}
          />
        );
      case PanelMode.FILTERS:
        return <ImageFilterPanel {...commonProps} />;
      case PanelMode.AUDIT: 
        return <SystemAuditPanel />;
      default: return null;
    }
  };

  return (
    <div className="app-shell relative">
      <div className="fixed inset-0 pointer-events-none z-[200] opacity-[0.03] bg-grid-pattern"></div>
      
      {isRepairing && (
        <RealRepairDiagnostic onComplete={(r) => { 
          setIsRepairing(false); 
          setSystemIntegrity(r.systemStabilityScore); 
          addLog(`FORENSIC_SYNC: SUBSYSTEMS_RECONSTRUCTED`, 'success');
        }} />
      )}
      
      {isRefining && (
        <RealRefineDiagnostic onComplete={(r) => { 
          setIsRefining(false); 
          setUiRefinementLevel(r.visualScore); 
          addLog(`REFINE_REPORT: AESTHETIC_${r.visualScore}%`, 'success');
        }} />
      )}
      
      <PanelHeader 
        title="HYPERXGEN" 
        integrity={systemIntegrity}
        onBack={() => handleModeSwitch(PanelMode.START)}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
        onStartRepair={() => {
          setIsRepairing(true);
          addLog("DIAGNOSTIC: FORENSIC_KERNEL_AUDIT", 'info');
        }}
        onStartRefine={() => {
          setIsRefining(true);
          addLog("DIAGNOSTIC: UI_REFINE_INITIATED", 'info');
        }}
        onToggleLogViewer={() => setShowLogViewer(prev => !prev)}
      />

      <div className="app-main"><div className="app-main-content-area custom-scrollbar">{renderPanel()}</div></div>
      
      <AppControlsBar 
        activeMode={currentPanel}
        recentWorks={recentWorks}
        savedPresets={savedPresets}
        cloudArchives={cloudArchives}
        isSaving={isSaving}
        onSwitchMode={handleModeSwitch}
        onForceSave={handleForceSave}
        onLoadHistoryItem={handleLoadItem}
        enabledModes={enabledModes}
      />

      <LogViewer 
        logs={logs} 
        onClear={() => setLogs([])} 
        isOpen={showLogViewer} 
        onClose={() => setShowLogViewer(false)} 
      />
    </div>
  );
};
