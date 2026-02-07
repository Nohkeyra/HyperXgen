
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
  onCommitPreset, // Destructure new prop
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
      // kernelConfig already contains the precision setting from App.tsx
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
      description: extractedData.description,
      type: presetType,
      dna: extractedData,
      timestamp: new Date().toLocaleTimeString()
    });
  };

  const handleSetGlobalDna = useCallback(() => {
    if (!extractedData || isProcessing) return;
    if (activeGlobalDna?.name === extractedData.name && activeGlobalDna?.domain === extractedData.domain) {
      onSetGlobalDna?.(null); // Unset if already active
    } else {
      onSetGlobalDna?.(extractedData);
    }
  }, [extractedData, isProcessing, activeGlobalDna, onSetGlobalDna]);

  const handleClear = useCallback(() => {
    if (isProcessing) return;
    setUploadedImage(null);
    setExtractedData(null);
    setReconStatus("IDLE");
  }, [isProcessing]);
  
  const isGlobalDnaActive = activeGlobalDna?.name === extractedData?.name && activeGlobalDna?.domain === extractedData?.domain;

  const SidebarContent = (
    <>
      <div className="mb-6 md:mb-8 border-b-2 border-brandRed pb-4 md:pb-6">
        <div className="text-[10px] font-black uppercase tracking-widest italic mb-2 text-brandRed">
          Module_04
        </div>
        <h2 className="text-xl md:text-2xl font-black text-brandCharcoal dark:text-white uppercase italic tracking-tighter leading-none mb-1">
          Style_Extractor
        </h2>
        <p className="text-[8px] font-bold text-brandCharcoalMuted uppercase tracking-widest">
          DNA Forensic Audit v2.0
        </p>
      </div>

      <div className="space-y-6 flex-1 flex flex-col">
        <div className="flex-none">
          <button 
            onClick={() => fileInputRef.current?.click()} 
            disabled={isProcessing}
            className="w-full px-6 py-3 bg-brandCharcoal dark:bg-zinc-800 text-brandYellow text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-3 border-2 border-brandYellow/30 hover:bg-brandYellow hover:text-brandCharcoal transition-all shadow-[0_0_20px_rgba(250,189,13,0.2)]"
          >
            <UploadIcon className="w-4 h-4" />
            UPLOAD_SOURCE
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                const reader = new FileReader();
                reader.onload = event => { setUploadedImage(event.target?.result as string); setReconStatus("BUFFER_LOADED"); };
                reader.readAsDataURL(file);
              }
            }} 
          />
        </div>

        <div className="flex-1 space-y-4 pt-4 min-h-[100px] overflow-y-auto custom-scrollbar">
          {storedDnaLibrary.length === 0 ? (
            <div className="p-4 text-[9px] font-black uppercase text-brandCharcoalMuted dark:text-white/30 text-center tracking-widest border border-dashed border-white/5 rounded-sm">
              DNA_VAULT_EMPTY
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1 h-3 bg-brandRed rounded-full" />
                <h3 className="text-[9px] font-black uppercase text-brandCharcoal dark:text-white tracking-[0.25em]">VAULT_ARCHIVES</h3>
              </div>
              <div className="space-y-3">
                {storedDnaLibrary.map(item => (
                  <button 
                    key={item.id} 
                    onClick={() => onSetGlobalDna?.(item.dna)} 
                    className={`w-full p-3 flex flex-col transition-all duration-300 rounded-sm text-left relative overflow-hidden group border-2
                      ${(activeGlobalDna?.name === item.dna?.name && activeGlobalDna?.domain === item.dna?.domain)
                        ? 'bg-brandYellow border-brandYellow text-brandCharcoal shadow-[0_8px_20px_rgba(250,189,13,0.4)] z-10 scale-[1.01]' 
                        : 'bg-white/5 border-white/5 text-brandNeutral hover:bg-white/10 hover:border-brandYellow/30'
                      }
                    `}
                  >
                     <div className="flex items-start gap-3 w-full">
                       <div className={`shrink-0 w-8 h-8 flex items-center justify-center font-black text-xs rounded-sm transition-all duration-300
                         ${(activeGlobalDna?.name === item.dna?.name && activeGlobalDna?.domain === item.dna?.domain) ? 'bg-brandCharcoal text-brandYellow' : 'bg-brandYellow/10 text-brandYellowDark group-hover:bg-brandYellow group-hover:text-brandCharcoal'}
                       `}>
                         <StarIcon className="w-4 h-4" />
                       </div>
                       <div className="min-w-0 flex-1 relative z-10 pt-0.5">
                         <h4 className={`text-[10px] font-black uppercase truncate leading-tight mb-1 transition-colors tracking-widest
                           ${(activeGlobalDna?.name === item.dna?.name && activeGlobalDna?.domain === item.dna?.domain) 
                             ? 'text-brandCharcoal' 
                             : 'text-brandCharcoal dark:text-brandYellow group-hover:text-brandYellow dark:group-hover:text-brandCharcoal'
                           }
                         `}>
                           {item.name}
                         </h4>
                         <div className={`h-[1px] transition-all duration-500 ${ (activeGlobalDna?.name === item.dna?.name && activeGlobalDna?.domain === item.dna?.domain) ? 'bg-brandCharcoal/40 w-full' : 'bg-brandYellow/20 w-3 group-hover:w-6'}`} />
                       </div>
                     </div>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {extractedData && (
          <div className="flex-none p-4 mt-6 border-t border-brandRed/20 animate-in fade-in slide-in-from-bottom duration-300">
            <h3 className="text-[10px] font-black uppercase text-brandRed tracking-[0.2em] mb-3">Extracted_DNA</h3>
            <div className="space-y-1 text-[9px] font-bold uppercase text-brandCharcoalMuted dark:text-white/60">
              <p>Domain: <span className="text-brandRed">{extractedData.domain}</span></p>
              <p>Category: <span className="text-brandYellow">{extractedData.category}</span></p>
              <p>Name: <span className="text-white">{extractedData.name}</span></p>
              <p>Auth Score: <span className={isAuthenticityHigh ? 'text-green-400' : 'text-brandRed'}>{extractedData.styleAuthenticityScore.toFixed(1)}%</span></p>
              <p>Palette: {extractedData.palette.map((c, i) => <span key={i} className="inline-block w-3 h-3 rounded-full mr-1 border border-white/20" style={{ backgroundColor: c }}></span>)}</p>
            </div>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleSavePreset} 
                disabled={isProcessing || !isAuthenticityHigh || isAlreadySaved}
                className="flex-1 px-4 py-2 bg-brandYellow text-brandCharcoal text-[9px] font-black uppercase italic tracking-widest hover:bg-brandYellow/80 disabled:opacity-50"
              >
                {isAlreadySaved ? 'DNA_ARCHIVED' : 'SAVE_DNA'}
              </button>
              <button 
                onClick={handleSetGlobalDna} 
                disabled={isProcessing}
                className={`flex-1 px-4 py-2 text-[9px] font-black uppercase italic tracking-widest 
                  ${isGlobalDnaActive ? 'bg-brandRed text-white' : 'bg-brandCharcoal dark:bg-zinc-800 text-brandYellow hover:bg-brandYellow hover:text-brandCharcoal'} disabled:opacity-50`}
              >
                {isGlobalDnaActive ? 'DNA_ANCHORED' : 'ANCHOR_DNA'}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );

  return (
    <PanelLayout sidebar={SidebarContent}>
      <CanvasStage
        uploadedImage={uploadedImage}
        generatedOutput={extractedData?.preview_png || uploadedImage}
        isProcessing={isProcessing}
        hudContent={<ReconHUD reconStatus={reconStatus} authenticityScore={extractedData?.styleAuthenticityScore} />}
        isValidationError={reconStatus === "AUDIT_FAILED"}
        uiRefined={uiRefined}
        refinementLevel={refinementLevel}
        onClear={handleClear}
        onGenerate={handleAnalyze} // Trigger analyze on generate button
        onFileUpload={(file) => {
          const reader = new FileReader();
          reader.onload = e => { setUploadedImage(e.target?.result as string); setReconStatus("BUFFER_LOADED"); };
          reader.readAsDataURL(file);
        }}
        downloadFilename={`hyperxgen_dna_${extractedData?.name || Date.now()}.png`}
      />

      <GenerationBar 
        onGenerate={handleAnalyze} // Ensure generate button triggers analyze
        isProcessing={isProcessing} 
        placeholder="Upload an image to extract its style DNA..."
        activePresetName={extractedData?.name}
        isExtractor={true} // Indicate this is the extractor panel to hide prompt input
        extractedDnaDetails={extractedData} // Pass extractedData here
        // onToggleTurbo={onToggleDeepScan} // Removed this prop as 'pro' models are no longer used.
      >
        {/* No text input for extractor */}
      </GenerationBar>
    </PanelLayout>
  );
};