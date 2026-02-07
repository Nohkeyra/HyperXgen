import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { PanelMode, KernelConfig, ExtractionResult, PresetItem, PresetCategory } from '../types.ts';
import { PRESET_REGISTRY } from '../presets/index.ts';
import { synthesizeTypoStyle, refineTextPrompt } from '../services/geminiService.ts';
import { useDevourer } from '../hooks/useDevourer.ts';
import { PresetCard } from './PresetCard.tsx';
import { GenerationBar } from './GenerationBar.tsx';
import { PresetCarousel } from './PresetCarousel.tsx';
import { CanvasStage } from './CanvasStage.tsx';
import { DevourerHUD } from './HUD.tsx';
import { SparkleIcon } from './Icons.tsx';
import { PanelLayout, SidebarHeader } from './Layouts.tsx';

interface MonogramPanelProps {
  initialData?: any;
  kernelConfig: KernelConfig & { useProModel?: boolean };
  integrity: number;
  refinementLevel?: number;
  uiRefined?: boolean;
  onSaveToHistory: (work: any) => void;
  onModeSwitch: (mode: PanelMode, data?: any) => void;
  onSetGlobalDna?: (dna: ExtractionResult | null) => void;
  savedPresets: any[];
  globalDna?: ExtractionResult | null;
  onToggleTurbo?: () => void;
}

export const MonogramPanel: React.FC<MonogramPanelProps> = ({
  initialData,
  kernelConfig,
  integrity,
  refinementLevel = 0,
  uiRefined,
  onSaveToHistory,
  onModeSwitch,
  onSetGlobalDna,
  savedPresets = [],
  globalDna,
  onToggleTurbo
}) => {
  const PRESETS = useMemo(() => {
    let presetsToRender: PresetCategory[] = [
      PRESET_REGISTRY.MONOGRAM.signature, 
      ...PRESET_REGISTRY.MONOGRAM.libraries
    ];

    if (Array.isArray(savedPresets)) {
      const userPresets = savedPresets.filter(p => p && (p.type === PanelMode.MONOGRAM || p.mode === PanelMode.MONOGRAM));
      if (userPresets.length > 0) {
        const grouped: Record<string, PresetItem[]> = {};
        userPresets.forEach(p => {
          const catName = p.category || p.dna?.category || "VAULT_ARCHIVES";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push({
            id: p.id || Math.random().toString(),
            name: p.name || p.dna?.name || "UNNAMED_DNA",
            type: p.type as any || PanelMode.MONOGRAM,
            description: p.description || p.dna?.description || "Extracted Style DNA",
            dna: p.dna,
            prompt: p.prompt
          });
        });
        const userCategories = Object.entries(grouped).map(([title, items]) => ({ title: `USER_${title.toUpperCase()}`, items }));
        presetsToRender = [...userCategories, ...presetsToRender];
      }
    }
    return presetsToRender;
  }, [savedPresets]);

  const { status, isProcessing, transition } = useDevourer(initialData?.dna || globalDna ? 'DNA_LINKED' : 'STARVING');
  const [activePresetId, setActivePresetId] = useState<string | null>(initialData?.id || null);
  const [activePreset, setActivePreset] = useState<PresetItem | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(initialData?.imageUrl || initialData?.uploadedImage || null);
  const [prompt, setPrompt] = useState(''); 
  const [isRefining, setIsRefining] = useState(false);
  const [generatedOutput, setGeneratedOutput] = useState<string | null>(initialData?.generatedOutput || null);
  const [dna, setDna] = useState<ExtractionResult | null>(initialData?.dna || globalDna || null);
  const [isValidationError, setIsValidationError] = useState(false);
  const processingRef = useRef(false);

  useEffect(() => {
    if (globalDna && dna?.name !== globalDna.name) { 
      setDna(globalDna); 
      transition("DNA_LINKED"); 
    }
  }, [globalDna, dna, transition]);

  const handleSelectPreset = useCallback((id: string) => {
    if (isProcessing) return;
    if (activePresetId === id) {
      setActivePresetId(null);
      setActivePreset(null);
      return;
    }
    setActivePresetId(id);
    const item = PRESETS.flatMap(c => c.items).find(i => i.id === id);
    if (item) {
      setActivePreset(item);
      if (item.dna) { 
        setDna(item.dna); 
        transition("DNA_LINKED"); 
      }
      if ((item as any).imageUrl) setUploadedImage((item as any).imageUrl);
    }
  }, [PRESETS, isProcessing, transition, activePresetId]);

  const handleRefine = async () => {
    if (!prompt.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineTextPrompt(prompt, PanelMode.MONOGRAM, kernelConfig, dna || undefined);
      setPrompt(refined);
    } catch (e) {
      console.error("Refinement failed");
    } finally {
      setIsRefining(false);
    }
  };

  const handleToggleAnchor = () => {
    if (!dna || isProcessing) return;
    const isCurrentlyAnchored = globalDna?.name === dna.name;
    onSetGlobalDna?.(isCurrentlyAnchored ? null : dna);
  };

  const handleGenerate = async () => {
    if (processingRef.current) return;
    const effectivePrompt = prompt.trim() || "X";
    const combinedPrompt = [activePreset?.prompt, effectivePrompt].filter(Boolean).join('. ');
    
    processingRef.current = true;
    transition(dna ? "DNA_STYLIZE_ACTIVE" as any : "DEVOURING_BUFFER", true);
    setIsValidationError(false);
    
    try {
      const result = await synthesizeTypoStyle(combinedPrompt.slice(0, 10), uploadedImage || undefined, kernelConfig, dna || undefined);
      setGeneratedOutput(result);
      transition("LATTICE_ACTIVE");
      onSaveToHistory({
        id: `mono-${Date.now()}`,
        name: effectivePrompt,
        description: "Geometric monogram seal",
        type: PanelMode.MONOGRAM,
        generatedOutput: result,
        dna: dna || undefined,
        imageUrl: uploadedImage,
        timestamp: new Date().toLocaleTimeString()
      });
    } catch (e) {
      console.error(e);
      transition("LATTICE_FAIL");
      setIsValidationError(true);
    } finally { 
      processingRef.current = false;
    }
  };

  const SidebarContent = (
    <>
      <SidebarHeader 
        moduleNumber="Module_03" 
        title="Seal_Architect" 
        version="Geometric Monogram core v5.0"
        colorClass="text-brandCharcoalMuted dark:text-white/60"
        borderColorClass="border-brandCharcoal dark:border-white/20"
      />
      <div className="space-y-8">
        {PRESETS.map((cat, i) => (
          <div key={i} className="animate-in fade-in slide-in-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-3 bg-brandCharcoal dark:bg-white/40 rounded-full" />
              <h3 className="text-[9px] font-black uppercase text-brandCharcoal dark:text-white tracking-[0.25em]">{cat.title}</h3>
            </div>
            <div className="space-y-3">
              {cat.items.map(item => (
                <PresetCard 
                  key={item.id} 
                  name={item.name} 
                  description={item.description} 
                  isActive={activePresetId === item.id} 
                  onClick={() => handleSelectPreset(item.id)} 
                  iconChar="M" 
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const isAnchored = dna && globalDna?.name === dna.name;

  return (
    <PanelLayout sidebar={SidebarContent}>
      <CanvasStage
        uploadedImage={uploadedImage}
        generatedOutput={generatedOutput}
        isProcessing={isProcessing}
        hudContent={<DevourerHUD devourerStatus={isAnchored ? `DNA_LOCKED: ${dna?.name.toUpperCase()}` : dna?.name ? `DNA_LINKED: ${dna.name.toUpperCase()}` : status} />}
        isValidationError={isValidationError}
        uiRefined={uiRefined}
        refinementLevel={refinementLevel}
        onClear={() => { setUploadedImage(null); setGeneratedOutput(null); setDna(null); setActivePresetId(null); setActivePreset(null); setPrompt(''); transition("STARVING"); }}
        onGenerate={handleGenerate}
        onFileUpload={(file) => {
            const reader = new FileReader();
            reader.onload = e => { setUploadedImage(e.target?.result as string); transition("BUFFER_LOADED"); };
            reader.readAsDataURL(file);
        }}
        downloadFilename={`hyperxgen_monogram_${Date.now()}.png`}
      />
      
      <GenerationBar 
        prompt={prompt} 
        setPrompt={setPrompt} 
        onGenerate={handleGenerate} 
        isProcessing={isProcessing} 
        activePresetName={activePreset?.name || dna?.name}
        placeholder="Enter letters for monogram seal..." 
        useTurbo={kernelConfig.useProModel}
        onToggleTurbo={onToggleTurbo}
        additionalControls={
          dna && (
            <button 
              onClick={handleToggleAnchor}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-sm border-2 transition-all text-[9px] font-black uppercase tracking-widest
                ${isAnchored 
                  ? 'border-brandRed bg-brandRed text-white shadow-lg' 
                  : 'border-brandCharcoal/20 text-brandCharcoal dark:border-white/20 dark:text-white/40 hover:border-brandRed'
                }`}
              title={isAnchored ? "Release Global Anchor" : "Set as Global Style Anchor"}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${isAnchored ? 'bg-white animate-pulse' : 'bg-brandCharcoal/20 dark:bg-white/20'}`} />
              {isAnchored ? 'ANCHORED' : 'ANCHOR'}
            </button>
          )
        }
        refineButton={
          <button 
            onClick={handleRefine}
            disabled={isProcessing || isRefining || !prompt.trim()}
            className={`p-3 bg-black/40 border border-white/10 text-brandYellow hover:text-white transition-all rounded-sm group ${isRefining ? 'animate-pulse' : ''}`}
            title="AI Prompt Refinement"
          >
            <SparkleIcon className={`w-4 h-4 ${isRefining ? 'animate-spin' : 'group-hover:scale-110'}`} />
          </button>
        }
      />

      <PresetCarousel presets={PRESETS as any} activeId={activePresetId} onSelect={handleSelectPreset} />
    </PanelLayout>
  );
};