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

interface TypographyPanelProps {
  initialData?: any;
  kernelConfig: KernelConfig;
  integrity: number;
  refinementLevel?: number;
  uiRefined?: boolean;
  onSaveToHistory: (work: any) => void;
  onModeSwitch: (mode: PanelMode, data?: any) => void;
  onSetGlobalDna?: (dna: ExtractionResult | null) => void;
  savedPresets: any[];
  globalDna?: ExtractionResult | null;
}

type TerminalLogic = 'clipped' | 'flare' | 'rounded' | 'spike';
type LigatureLogic = 'manual' | 'auto' | 'aggressive';
type FontWeight = 'light' | 'regular' | 'bold' | 'ultra';

export const TypographyPanel: React.FC<TypographyPanelProps> = ({
  initialData,
  kernelConfig,
  integrity,
  refinementLevel = 0,
  uiRefined,
  onSaveToHistory,
  onModeSwitch,
  onSetGlobalDna,
  savedPresets = [],
  globalDna
}) => {
  const PRESETS = useMemo(() => {
    let presetsToRender: PresetCategory[] = [
      ...PRESET_REGISTRY.TYPOGRAPHY.libraries
    ];

    if (Array.isArray(savedPresets)) {
      const userPresets = savedPresets.filter(p => p && (p.type === PanelMode.TYPOGRAPHY || p.mode === PanelMode.TYPOGRAPHY));
      if (userPresets.length > 0) {
        const grouped: Record<string, PresetItem[]> = {};
        userPresets.forEach(p => {
          const catName = p.category || p.dna?.category || "VAULT_ARCHIVES";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push({
            id: p.id || Math.random().toString(),
            name: p.name || p.dna?.name || "UNNAMED_DNA",
            type: p.type as any || PanelMode.TYPOGRAPHY,
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
  
  // --- Architecture States ---
  const [capHeight, setCapHeight] = useState<number>(100);
  const [strokeContrast, setStrokeContrast] = useState<number>(50);
  const [terminalLogic, setTerminalLogic] = useState<TerminalLogic>('clipped');
  const [fontWeight, setFontWeight] = useState<FontWeight>('regular');
  const [splicingIntensity, setSplicingIntensity] = useState<number>(20);
  const [interlockGutter, setInterlockGutter] = useState<number>(2);
  const [xHeightBias, setXHeightBias] = useState<number>(50);
  const [ligatureLogic, setLigatureLogic] = useState<LigatureLogic>('auto');

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
      onSetGlobalDna?.(null); // Clear anchor on deselect
      return;
    }
    setActivePresetId(id);
    const item = PRESETS.flatMap(c => c.items).find(i => i.id === id);
    if (item) {
      setActivePreset(item);
      if (item.dna) { 
        setDna(item.dna); 
        transition("DNA_LINKED"); 
        onSetGlobalDna?.(item.dna); // Auto-anchor DNA
      }
      if ((item as any).imageUrl) setUploadedImage((item as any).imageUrl);
    }
  }, [PRESETS, isProcessing, transition, activePresetId, onSetGlobalDna]);

  const handleRefine = async () => {
    if (!prompt.trim() || isRefining) return;
    setIsRefining(true);
    try {
      const refined = await refineTextPrompt(prompt, PanelMode.TYPOGRAPHY, kernelConfig, dna || undefined);
      setPrompt(refined);
    } catch (e) {
      console.error("Refinement failed");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerate = async () => {
    if (processingRef.current) return;
    const effectivePrompt = prompt.trim() || "HYPER";
    
    // Construct extra architectural directives string
    const extraDirectives = `
      CAP_HEIGHT: ${capHeight}%
      STROKE_CONTRAST: ${strokeContrast}%
      TERMINAL_LOGIC: ${terminalLogic.toUpperCase()}
      FONT_WEIGHT: ${fontWeight.toUpperCase()}
      SPLICING_INTENSITY: ${splicingIntensity}%
      INTERLOCK_GUTTER: ${interlockGutter}%
      X_HEIGHT_BIAS: ${xHeightBias}%
      LIGATURE_LOGIC: ${ligatureLogic.toUpperCase()}
    `.trim();

    processingRef.current = true;
    transition(dna ? "DNA_STYLIZE_ACTIVE" as any : "DEVOURING_BUFFER", true);
    setIsValidationError(false);
    
    try {
      const result = await synthesizeTypoStyle(effectivePrompt, uploadedImage || undefined, kernelConfig, dna || undefined, extraDirectives);
      setGeneratedOutput(result);
      transition("LATTICE_ACTIVE");
      onSaveToHistory({
        id: `typo-${Date.now()}`,
        name: effectivePrompt.slice(0, 15),
        description: `Typographic wordmark [${terminalLogic} terminals]`,
        type: PanelMode.TYPOGRAPHY,
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
        moduleNumber="Module_02" 
        title="Typo_Splicer" 
        version="Neural Glyph Engine v3.4"
        colorClass="text-brandYellow"
        borderColorClass="border-brandYellow"
      />
      
      {/* --- ARCHITECT_CONTROLS --- */}
      <div className="space-y-10 mb-12">
        {/* 1. Anatomical Logic */}
        <section>
          <h4 className="text-[10px] font-black uppercase text-brandCharcoal/40 dark:text-white/30 tracking-widest mb-4 border-b border-brandCharcoal/10 dark:border-white/5 pb-2">Anatomical Logic</h4>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 mb-1.5 block">Weight</label>
                <select value={fontWeight} onChange={e => setFontWeight(e.target.value as any)} className="w-full bg-transparent border-2 border-brandCharcoal/10 dark:border-white/10 text-[8px] font-black uppercase px-2 py-1.5 rounded-sm outline-none">
                  <option value="light">Light</option>
                  <option value="regular">Regular</option>
                  <option value="bold">Bold</option>
                  <option value="ultra">Ultra</option>
                </select>
              </div>
              <div>
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 mb-1.5 block">Terminals</label>
                <select value={terminalLogic} onChange={e => setTerminalLogic(e.target.value as any)} className="w-full bg-transparent border-2 border-brandCharcoal/10 dark:border-white/10 text-[8px] font-black uppercase px-2 py-1.5 rounded-sm outline-none">
                  <option value="clipped">Clipped</option>
                  <option value="flare">Flare</option>
                  <option value="rounded">Rounded</option>
                  <option value="spike">Spike</option>
                </select>
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Cap Height</label>
                <span className="text-[8px] font-black text-brandYellow">{capHeight}%</span>
              </div>
              <input type="range" min="50" max="150" value={capHeight} onChange={e => setCapHeight(parseInt(e.target.value))} className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandYellow" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Stroke Contrast</label>
                <span className="text-[8px] font-black text-brandYellow">{strokeContrast}%</span>
              </div>
              <input type="range" min="0" max="100" value={strokeContrast} onChange={e => setStrokeContrast(parseInt(e.target.value))} className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandYellow" />
            </div>
          </div>
        </section>

        {/* 2. Structural Splicing */}
        <section>
          <h4 className="text-[10px] font-black uppercase text-brandCharcoal/40 dark:text-white/30 tracking-widest mb-4 border-b border-brandCharcoal/10 dark:border-white/5 pb-2">Splicing Module</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Splicing Intensity</label>
                <span className="text-[8px] font-black text-brandYellow">{splicingIntensity}%</span>
              </div>
              <input type="range" min="0" max="100" value={splicingIntensity} onChange={e => setSplicingIntensity(parseInt(e.target.value))} className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandYellow" />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Interlock Gutter</label>
                <span className="text-[8px] font-black text-brandYellow">{interlockGutter}%</span>
              </div>
              <input type="range" min="1" max="5" step="0.5" value={interlockGutter} onChange={e => setInterlockGutter(parseFloat(e.target.value))} className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandYellow" />
            </div>
          </div>
        </section>

        {/* 3. Optical Settings */}
        <section>
          <h4 className="text-[10px] font-black uppercase text-brandCharcoal/40 dark:text-white/30 tracking-widest mb-4 border-b border-brandCharcoal/10 dark:border-white/5 pb-2">Optical Settings</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">X-Height Bias</label>
                <span className="text-[8px] font-black text-brandYellow">{xHeightBias}%</span>
              </div>
              <input type="range" min="20" max="80" value={xHeightBias} onChange={e => setXHeightBias(parseInt(e.target.value))} className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandYellow" />
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 mb-1.5 block">Ligature Threshold</label>
              <div className="flex gap-1.5">
                {(['manual', 'auto', 'aggressive'] as LigatureLogic[]).map(l => (
                  <button key={l} onClick={() => setLigatureLogic(l)} className={`flex-1 py-1.5 text-[7px] font-black uppercase border-2 rounded-sm ${ligatureLogic === l ? 'bg-brandYellow text-brandCharcoal border-brandYellow' : 'border-brandCharcoal/10 text-brandCharcoal/40 dark:border-white/10 dark:text-white/30'}`}>{l}</button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        {PRESETS.map((cat, i) => (
          <div key={i} className="animate-in fade-in slide-in-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-3 bg-brandYellow rounded-full" />
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
                  iconChar="T" 
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
        onClear={() => { setUploadedImage(null); setGeneratedOutput(null); setDna(null); setActivePresetId(null); setActivePreset(null); setPrompt(''); transition("STARVING"); onSetGlobalDna?.(null); }}
        onGenerate={handleGenerate}
        onFileUpload={(file) => {
            const reader = new FileReader();
            reader.onload = e => { setUploadedImage(e.target?.result as string); transition("BUFFER_LOADED"); };
            reader.readAsDataURL(file);
        }}
        downloadFilename={`hyperxgen_typo_${Date.now()}.png`}
      />
      
      <div className="flex flex-col gap-6">
        <GenerationBar 
          prompt={prompt} 
          setPrompt={setPrompt} 
          onGenerate={handleGenerate} 
          isProcessing={isProcessing} 
          activePresetName={activePreset?.name || dna?.name}
          placeholder="Enter wordmark characters (e.g. 'HYPER')..." 
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
      </div>
    </PanelLayout>
  );
};