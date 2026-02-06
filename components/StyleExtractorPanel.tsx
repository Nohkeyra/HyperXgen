import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import { PanelMode, ExtractionResult, KernelConfig } from '../types.ts';
import { extractStyleFromImage } from '../services/geminiService.ts';
import { GenerationBar } from './GenerationBar.tsx';
import { StarIcon, BoxIcon, PulseIcon, DownloadIcon, UploadIcon, TrashIcon, VectorIcon, TypographyIcon, MonogramIcon } from './Icons.tsx';
import { CanvasStage } from './CanvasStage.tsx';
import { ReconHUD } from './HUD.tsx';
import { PanelLayout } from './Layouts.tsx';

interface StyleExtractorPanelProps {
  initialData?: any;
  onSaveToHistory?: (data: any) => void;
  onSaveToPresets?: (data: any) => void;
  onDeletePreset?: (id: string) => void;
  savedPresets?: any[];
  kernelConfig: KernelConfig;
  integrity?: number;
  refinementLevel?: number;
  uiRefined?: boolean;
  onModeSwitch: (mode: PanelMode, data?: any) => void;
  onSetGlobalDna?: (dna: ExtractionResult | null) => void;
  activeGlobalDna?: ExtractionResult | null;
  onCommitPreset?: () => void; // New prop for global commit
}

const AUTHENTICITY_THRESHOLD = 80; // Minimum score for a style to be considered "100% legit"

export const StyleExtractorPanel: React.FC<StyleExtractorPanelProps> = ({
  initialData,
  onSaveToHistory,
  onSaveToPresets,
  onDeletePreset,
  savedPresets = [],
  kernelConfig,
  integrity,
  refinementLevel = 0,
  uiRefined,
  onModeSwitch,
  onSetGlobalDna,
  activeGlobalDna,
  onCommitPreset // Destructure new prop
}) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialData?.uploadedImage || initialData?.imageUrl || null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedData, setExtractedData] = useState<ExtractionResult | null>(initialData?.dna || null);
  const [reconStatus, setReconStatus] = useState(initialData?.dna ? "DNA_HARVESTED" : "IDLE");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const processingRef = useRef(false);

  const storedDnaLibrary = useMemo(() => {
    return Array.isArray(savedPresets) ? savedPresets.filter(p => p && p.dna) : [];
  }, [savedPresets]);

  const isAlreadySaved = useMemo(() => {
    if (!extractedData) return false;
    return storedDnaLibrary.some(p => p.dna?.name === extractedData.name && p.dna?.domain === extractedData.domain);
  }, [extractedData, storedDnaLibrary]);

  const isAuthenticityHigh = useMemo(() => {
    return extractedData && extractedData.styleAuthenticityScore >= AUTHENTICITY_THRESHOLD;
  }, [extractedData]);

  useEffect(() => {
    if (initialData?.uploadedImage || initialData?.imageUrl) {
      setUploadedImage(initialData.uploadedImage || initialData.imageUrl);
      if (initialData.dna) {
        setExtractedData(initialData.dna);
        setReconStatus("DNA_HARVESTED");
      }
    }
  }, [initialData]);

  const handleAnalyze = useCallback(async () => {
    if (processingRef.current) return;
    if (!uploadedImage) {
      setReconStatus('CRITICAL: NO_BUFFER');
      return;
    }
    setIsProcessing(true);
    processingRef.current = true;
    setExtractedData(null); // Clear previous data

    setReconStatus("SCANNING_BUFFER");
    await new Promise(r => setTimeout(r, 700)); // Simulate initial scan
    
    setReconStatus("PERFORMING_FORENSIC_AUDIT");
    await new Promise(r => setTimeout(r, 1200)); // Simulate forensic audit

    setReconStatus("ASSESSING_AUTHENTICITY");
    await new Promise(r => setTimeout(r, 1500)); // Simulate authenticity assessment
    
    try {
      const result = await extractStyleFromImage(uploadedImage, kernelConfig);
      
      setExtractedData(result);
      if (result.styleAuthenticityScore >= AUTHENTICITY_THRESHOLD) {
        setReconStatus("DNA_HARVESTED");
      } else {
        setReconStatus("AUTHENTICITY_LOW");
      }
      onSaveToHistory?.({ name: result.name, type: PanelMode.EXTRACTOR, uploadedImage, dna: result });
    } catch (e) {
      console.error(e); // Log the actual error
      setReconStatus("AUDIT_FAILED");
    } finally { 
      setIsProcessing(false); 
      processingRef.current = false;
    }
  }, [uploadedImage, kernelConfig, onSaveToHistory]);

  const handleSavePreset = () => {
    if (!extractedData || isProcessing || !isAuthenticityHigh) return;
    
    let presetType: PanelMode;
    switch (extractedData.domain) {
      case 'Vector':
        presetType = PanelMode.VECTOR;
        break;
      case 'Typography':
        presetType = PanelMode.TYPOGRAPHY;
        break;
      case 'Monogram':
        presetType = PanelMode.MONOGRAM;
        break;
      default:
        presetType = PanelMode.EXTRACTOR; // Fallback if domain doesn't match a synthesis panel directly
    }

    onSaveToPresets?.({
      id: `dna-${extractedData.name}-${Date.now()}`,
      name: extractedData.name,
      type: presetType, // Use the dynamically determined type
      description: `${extractedData.name} Blueprint (${extractedData.domain}): ${extractedData.description}`, // Simplified description
      dna: {
        ...extractedData,
        preview_png: undefined 
      },
      category: extractedData.category,
      timestamp: new Date().toLocaleTimeString(),
      isBlueprint: true 
    });
    setReconStatus("FILE_COMMITTED");
    onCommitPreset?.(); // Trigger global commit after saving
  };

  const handleExportDna = () => {
    if (!extractedData) return;
    const blob = new Blob([JSON.stringify(extractedData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${extractedData.name.replace(/\s+/g, '_')}_DNA_PROFILE.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleImportDna = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const dna = JSON.parse(event.target?.result as string);
        if (dna.domain && dna.parameters && typeof dna.styleAuthenticityScore === 'number') {
          setExtractedData(dna);
          setReconStatus("DNA_IMPORTED");
        } else {
          setReconStatus("IMPORT_ERROR: INVALID_SCHEMA");
        }
      } catch (err) {
        setReconStatus("IMPORT_ERROR: INVALID_SCHEMA");
      }
    };
    reader.readAsText(file);
  };

  const handleSetGlobalAnchor = () => {
    if (!extractedData || isProcessing || !isAuthenticityHigh) return;
    onSetGlobalDna?.(isAnchorActive ? null : extractedData);
  };

  const jumpToSynthesis = (mode: PanelMode) => {
    if (!extractedData || isProcessing || !isAuthenticityHigh) return;
    onSetGlobalDna?.(extractedData); // Set as global anchor when jumping to synthesis
    onModeSwitch(mode, { dna: extractedData, isPresetLoad: true });
  };

  const isAnchorActive = activeGlobalDna?.name === extractedData?.name && activeGlobalDna?.domain === extractedData?.domain;

  // Updated placeholder text
  const generationBarPlaceholder = "Image buffer ready. Initiate forensic audit...";

  return (
    <PanelLayout sidebar={null}>
      <CanvasStage
        uploadedImage={uploadedImage}
        generatedOutput={null}
        isProcessing={isProcessing}
        hudContent={<ReconHUD reconStatus={reconStatus} authenticityScore={extractedData?.styleAuthenticityScore} />}
        isValidationError={reconStatus.includes("FAILED") || reconStatus.includes("CRITICAL")}
        uiRefined={uiRefined}
        refinementLevel={refinementLevel}
        onClear={() => { if(isProcessing) return; setUploadedImage(null); setExtractedData(null); setReconStatus("IDLE"); }}
        onGenerate={handleAnalyze} // Trigger analysis here
        onFileUpload={(f) => {
          if(isProcessing) return;
          const r = new FileReader(); r.onload = (e) => {
            setUploadedImage(e.target?.result as string);
            setReconStatus("IMAGE_LOADED_FOR_ANALYSIS"); // New state after upload
            setExtractedData(null); // Clear previous extracted data on new upload
          };
          r.readAsDataURL(f);
        }}
        downloadFilename={`hyperxgen_extract_${Date.now()}.png`}
      />

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={handleSavePreset}
              disabled={!extractedData || isProcessing || isAlreadySaved || !isAuthenticityHigh}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase transition-all border-2 rounded-sm
                ${isAlreadySaved 
                  ? 'border-green-500 bg-green-500/10 text-green-500 cursor-default' 
                  : (extractedData && !isProcessing && isAuthenticityHigh) 
                    ? 'border-brandRed bg-brandRed text-white shadow-lg' 
                    : 'border-brandCharcoal/10 text-brandCharcoalSoft cursor-not-allowed opacity-50'}
              `}
              title={isAlreadySaved 
                ? 'Blueprint already installed' 
                : !isAuthenticityHigh 
                  ? 'Authenticity too low to install blueprint' 
                  : 'Install extracted DNA as a system blueprint, usable across all synthesis panels, and commit to cloud storage'}
            >
              <StarIcon className={`w-3.5 h-3.5 ${isAlreadySaved ? 'fill-current' : ''}`} /> 
              {isAlreadySaved ? 'BLUEPRINT_INSTALLED' : 'INSTALL_DNA_BLUEPRINT'}
            </button>
            <button 
              onClick={handleSetGlobalAnchor}
              disabled={!extractedData || isProcessing || !isAuthenticityHigh}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-[10px] font-black uppercase transition-all border-2 rounded-sm
                ${isAnchorActive 
                  ? 'border-brandYellow bg-brandYellow text-brandCharcoal shadow-lg' 
                  : (extractedData && !isProcessing && isAuthenticityHigh) 
                    ? 'border-brandCharcoal bg-transparent text-brandCharcoal dark:text-white' 
                    : 'border-brandCharcoal/10 text-brandCharcoalSoft cursor-not-allowed opacity-50'}
              `}
              title={isAnchorActive 
                ? "Release Global Style Anchor" 
                : !isAuthenticityHigh 
                  ? "Authenticity too low to set global anchor" 
                  : "Set Extracted DNA as Global Style Anchor for all synthesis modes"}
            >
              {isAnchorActive ? 'ANCHOR_ENGAGED' : 'SET_GLOBAL_DNA_ANCHOR'}
            </button>
            
            <div className="flex gap-2">
              <button 
                onClick={handleExportDna}
                disabled={!extractedData}
                title="Export DNA Profile (.json)"
                aria-label="Export DNA Profile as JSON file"
                className="w-12 h-full flex items-center justify-center border-2 border-brandCharcoal dark:border-white/10 text-brandCharcoal dark:text-white hover:border-brandRed hover:text-brandRed transition-all rounded-sm disabled:opacity-20"
              >
                <DownloadIcon className="w-4 h-4" />
              </button>
              <button 
                onClick={() => fileInputRef.current?.click()}
                title="Import DNA Profile (.json)"
                aria-label="Import DNA Profile from JSON file"
                className="w-12 h-full flex items-center justify-center border-2 border-brandCharcoal dark:border-white/10 text-brandCharcoal dark:text-white hover:border-brandYellow hover:text-brandYellow transition-all rounded-sm"
              >
                <UploadIcon className="w-4 h-4" />
              </button>
              <input ref={fileInputRef} type="file" accept=".json" onChange={handleImportDna} className="hidden" />
            </div>
        </div>

        {extractedData && (isAuthenticityHigh || reconStatus === "AUTHENTICITY_LOW") && (
          <div className="animate-in slide-in-up duration-500">
             <div className="flex items-center gap-4 mb-4">
                <div className="bg-brandCharcoal text-brandYellow text-[9px] font-black uppercase px-3 py-1 border-l-4 border-brandRed rounded-sm">SYNTHESIS_JUMP</div>
                <div className="h-[1px] flex-1 bg-brandCharcoal/10 dark:bg-white/5" />
             </div>
             <div className="grid grid-cols-3 gap-3">
               <button 
                  onClick={() => jumpToSynthesis(PanelMode.VECTOR)}
                  disabled={isProcessing || !isAuthenticityHigh}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all border-2 rounded-sm 
                    ${isAuthenticityHigh ? 'border-brandCharcoal/20 text-brandCharcoal dark:text-white/60 hover:border-brandRed hover:text-brandRed' : 'border-brandCharcoal/10 text-brandCharcoalSoft cursor-not-allowed opacity-50'}
                  `}
                  title={isAuthenticityHigh ? "Apply DNA to Vector Synthesis" : "Authenticity too low for synthesis"}
                >
                  <VectorIcon className="w-4 h-4" /> VECTOR
               </button>
               <button 
                  onClick={() => jumpToSynthesis(PanelMode.TYPOGRAPHY)}
                  disabled={isProcessing || !isAuthenticityHigh}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all border-2 rounded-sm
                    ${isAuthenticityHigh ? 'border-brandCharcoal/20 text-brandCharcoal dark:text-white/60 hover:border-brandYellow hover:text-brandYellow' : 'border-brandCharcoal/10 text-brandCharcoalSoft cursor-not-allowed opacity-50'}
                  `}
                  title={isAuthenticityHigh ? "Apply DNA to Typography Synthesis" : "Authenticity too low for synthesis"}
                >
                  <TypographyIcon className="w-4 h-4" /> TYPO
               </button>
               <button 
                  onClick={() => jumpToSynthesis(PanelMode.MONOGRAM)}
                  disabled={isProcessing || !isAuthenticityHigh}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 text-[10px] font-black uppercase transition-all border-2 rounded-sm
                    ${isAuthenticityHigh ? 'border-brandCharcoal/20 text-brandCharcoal dark:text-white/60 hover:border-brandCharcoal dark:hover:text-white' : 'border-brandCharcoal/10 text-brandCharcoalSoft cursor-not-allowed opacity-50'}
                  `}
                  title={isAuthenticityHigh ? "Apply DNA to Monogram Synthesis" : "Authenticity too low for synthesis"}
                >
                  <MonogramIcon className="w-4 h-4" /> MONO
               </button>
             </div>
          </div>
        )}
        
        <GenerationBar 
          onGenerate={handleAnalyze} 
          isProcessing={isProcessing} 
          placeholder={generationBarPlaceholder}
          activePresetName={extractedData?.name} // Display extracted DNA name
          // Removed additionalControls prop with subjectFocus and isDeepScan toggles
        />

        {extractedData && (
          <div className="animate-in slide-in-up duration-500 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* DNA Basic Info */}
            <div className="bg-brandCharcoal text-brandNeutral p-6 sm:p-8 border-t-8 border-brandRed shadow-2xl rounded-sm flex flex-col justify-between relative">
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <div>
                      <h3 className="text-2xl sm:text-3xl font-black italic uppercase tracking-tighter leading-none mb-2">{extractedData.name}</h3>
                      <div className="flex gap-2">
                        <span className="text-[8px] font-black bg-brandRed text-white px-2 py-0.5 rounded-sm">{extractedData.domain.toUpperCase()}</span>
                        <span className="text-[8px] font-black bg-white/10 px-2 py-0.5 rounded-sm border border-white/5">{extractedData.category.toUpperCase()}</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] font-bold uppercase leading-relaxed text-brandNeutral/80 italic border-l-4 border-brandRed pl-4 mb-8">{extractedData.description}</p>
                </div>
                
                <div>
                  <div className="mb-6">
                    <span className="text-[8px] font-black uppercase tracking-[0.3em] text-white/30 block mb-3">SYNTHETIC_PALETTE</span>
                    <div className="flex gap-1.5">
                      {extractedData.palette.map((color, idx) => (
                        <div key={idx} className="w-8 h-8 rounded-sm border border-white/10 shadow-lg group relative" style={{ backgroundColor: color }}>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-black text-[7px] font-mono px-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase">{color}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* NEW SAVE BUTTON */}
                <button
                  onClick={handleSavePreset}
                  disabled={!extractedData || isProcessing || isAlreadySaved || !isAuthenticityHigh}
                  className={`absolute bottom-4 right-4 p-2 rounded-sm transition-all flex items-center gap-1 shadow-md
                    ${isAlreadySaved 
                      ? 'bg-green-500/10 text-green-500 cursor-default' 
                      : (extractedData && !isProcessing && isAuthenticityHigh) 
                        ? 'bg-white/5 text-brandYellow hover:bg-brandRed hover:text-white shadow-[0_0_15px_rgba(250,189,13,0.3)]' 
                        : 'text-brandCharcoalMuted/40 cursor-not-allowed opacity-50 shadow-[0_0_10px_rgba(250,189,13,0.1)]'}
                  `}
                  title={isAlreadySaved 
                    ? 'Blueprint already installed' 
                    : !isAuthenticityHigh 
                      ? 'Authenticity too low to install blueprint' 
                      : 'Save extracted DNA as a system blueprint'}
                >
                  <StarIcon className="w-3 h-3" />
                  <span className="text-[8px] font-black uppercase">SAVE</span>
                </button>
            </div>

            {/* DNA Parameters breakdown - Multi-Domain Identification */}
            <div className="bg-white dark:bg-zinc-900 border-2 border-brandCharcoal dark:border-white/10 p-6 sm:p-8 rounded-sm shadow-xl flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <PulseIcon 
                    className={`w-5 h-5 ${
                      extractedData.domain === 'Typography' ? 'text-brandRed' : 
                      extractedData.domain === 'Vector' ? 'text-brandYellow' : 
                      extractedData.domain === 'Monogram' ? 'text-brandCharcoalMuted dark:text-white/60' : // Explicit Monogram color
                      'text-brandCharcoalMuted dark:text-white/60' // Fallback
                    }`} 
                  />
                  <h4 className="text-xs font-black uppercase tracking-[0.2em] text-brandCharcoal dark:text-white">
                    {extractedData.domain}_DNA_METRICS
                  </h4>
                </div>
                <span className="text-[8px] font-mono opacity-30 tracking-tighter">
                  REF: {extractedData.domain === 'Typography' ? 'GLYPH_V5' : extractedData.domain === 'Vector' ? 'VECTOR_V5' : extractedData.domain === 'Monogram' ? 'MONO_V5' : 'UNKNOWN_REF'}
                </span>
              </div>
              
              <div className="space-y-6 flex-1 flex flex-col justify-center">
                {Object.entries(extractedData.parameters).map(([key, value]) => {
                  // Determine the color based on domain for better visual identification
                  let barColor;
                  if (extractedData.domain === 'Typography') {
                    barColor = 'bg-brandRed';
                  } else if (extractedData.domain === 'Vector') {
                    barColor = 'bg-brandYellow';
                  } else {
                    barColor = 'bg-brandCharcoalMuted dark:bg-white/60'; // For Monogram and others
                  }
                  
                  return (
                    <div key={key} className="group space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                        <div className="flex items-center gap-2">
                          <div className={`w-1 h-1 rounded-full transition-all duration-500 ${Number(value) > 75 ? barColor + ' animate-ping' : 'bg-brandCharcoal/20'}`} />
                          <span className="text-brandCharcoal/40 dark:text-white/40 group-hover:text-brandCharcoal dark:group-hover:text-white transition-colors">
                            {key.replace(/_/g, ' ')}
                          </span>
                        </div>
                        <span className={`font-mono ${Number(value) > 80 ? 'text-brandRed' : 'text-brandCharcoal dark:text-white'}`}>
                          {value}%
                        </span>
                      </div>
                      <div className="h-1.5 bg-brandCharcoal/5 dark:bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-1000 ease-out ${barColor} shadow-[0_0_8px_rgba(0,0,0,0.1)]`} 
                          style={{ width: `${value}%` }} 
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8 pt-6 border-t border-brandCharcoal/5 dark:border-white/5 flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[7px] font-black uppercase text-brandCharcoalMuted dark:text-white/20">Identification_Level</span>
                  <span className="text-lg font-black italic text-brandCharcoal dark:text-white">
                    {(extractedData.confidence * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[7px] font-black uppercase text-brandCharcoalMuted dark:text-white/20">Protocol</span>
                  <span className={`text-[10px] font-black uppercase tracking-widest ${
                    extractedData.domain === 'Typography' ? 'text-brandRed' : 
                    extractedData.domain === 'Vector' ? 'text-brandYellowDark' : 
                    extractedData.domain === 'Monogram' ? 'text-brandCharcoalMuted dark:text-white/60' : // Explicit Monogram color
                    'text-brandCharcoalMuted dark:text-white/60' // Fallback
                  }`}>
                    {extractedData.domain === 'Typography' ? 'GLYPH_SYNTAX' : extractedData.domain === 'Vector' ? 'GEOMETRIC_LATTICE' : extractedData.domain === 'Monogram' ? 'MONOGRAM_LATTICE' : 'UNKNOWN_PROTOCOL'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="pb-16 mt-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-brandCharcoal text-brandYellow text-[9px] font-black uppercase px-3 py-1 border-l-4 border-brandRed rounded-sm">SYSTEM_FILES_LATTICE</div>
              <div className="h-[1px] flex-1 bg-brandCharcoal/10 dark:bg-white/5" />
              <span className="text-[8px] font-bold text-brandCharcoalSoft dark:text-white/40 uppercase tracking-widest">{storedDnaLibrary.length} BLUEPRINTS</span>
            </div>
            {storedDnaLibrary.length === 0 ? (
              <div className="p-10 border-2 border-dashed border-brandCharcoal/10 dark:border-white/10 rounded-sm flex flex-col items-center justify-center opacity-30">
                <BoxIcon className="w-8 h-8 mb-3" />
                <span className="text-[9px] font-black uppercase tracking-widest">AWAITING_SYSTEM_FILE_COMMITS</span>
              </div>
            ) : (
              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                {storedDnaLibrary.map((item) => (
                  <div 
                    key={item.id} 
                    className={`group relative h-24 flex flex-col items-center justify-center text-center p-3 border-2 transition-all duration-300 rounded-sm cursor-pointer
                      ${activeGlobalDna?.name === item.dna.name && activeGlobalDna?.domain === item.dna.domain ? 'border-brandRed bg-brandRed/5 shadow-md' : 'bg-white dark:bg-zinc-800 border-brandCharcoal/10 dark:border-white/10 hover:border-brandRed hover:-translate-y-1.5'}`}
                    onClick={() => { if(isProcessing) return; setExtractedData(item.dna); setReconStatus("DNA_LOADED_FROM_FILE"); }}
                  >
                    <button 
                      onClick={(e) => { e.stopPropagation(); onDeletePreset?.(item.id); }}
                      className="absolute top-1 right-1 p-1 opacity-0 group-hover:opacity-100 hover:text-brandRed transition-opacity"
                      aria-label={`Delete DNA preset ${item.dna.name}`}
                    >
                      <TrashIcon className="w-3 h-3" />
                    </button>

                    <div className="flex flex-col items-center w-full">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-sm font-black text-[10px] mb-2 shadow-inner
                        bg-brandRed/10 text-brandRed`}> {/* Generic DNA icon for all extracted types */}
                        <StarIcon className="w-4 h-4" /> {/* Using StarIcon as the generic DNA blueprint icon */}
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-tight truncate w-full px-1
                        ${activeGlobalDna?.name === item.dna.name && activeGlobalDna?.domain === item.dna.domain ? 'text-brandRed' : 'text-brandCharcoal dark:text-brandYellow'}`}>
                        {item.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
        </div>
      </div>
    </PanelLayout>
  );
};