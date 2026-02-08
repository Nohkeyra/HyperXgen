import React, { useEffect, useMemo, useCallback, useRef, useState } from 'react';
import { PanelMode, KernelConfig, ExtractionResult, PresetItem, PresetCategory } from '../types.ts';
import { PRESET_REGISTRY } from '../presets/index.ts';
import { synthesizeVectorStyle, refineTextPrompt } from '../services/geminiService.ts';
import { useDevourer } from '../hooks/useDevourer.ts';
import { PresetCard } from './PresetCard.tsx';
import { GenerationBar } from './GenerationBar.tsx';
import { PresetCarousel } from './PresetCarousel.tsx';
import { CanvasStage } from './CanvasStage.tsx';
import { DevourerHUD } from './HUD.tsx';
import { SparkleIcon } from './Icons.tsx';
import { PanelLayout, SidebarHeader } from './Layouts.tsx';

interface VectorPanelProps {
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

type GeometryEngine = 'primitives' | 'parametric' | 'organic' | 'hybrid';
type PrimitiveLock = 'circle' | 'square' | 'triangle' | 'all';
type AlignmentGrid = 'none' | 'square' | 'isometric' | 'golden';

export const VectorPanel: React.FC<VectorPanelProps> = ({
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
      ...PRESET_REGISTRY.VECTOR.libraries
    ];

    if (Array.isArray(savedPresets)) {
      const userPresets = savedPresets.filter(p => p && (p.type === PanelMode.VECTOR || p.mode === PanelMode.VECTOR));
      if (userPresets.length > 0) {
        const grouped: Record<string, PresetItem[]> = {};
        userPresets.forEach(p => {
          const catName = p.category || p.dna?.category || "VAULT_ARCHIVES";
          if (!grouped[catName]) grouped[catName] = [];
          grouped[catName].push({
            id: p.id || Math.random().toString(),
            name: p.name || p.dna?.name || "UNNAMED_DNA",
            type: p.type as any || PanelMode.VECTOR,
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
  const [engine, setEngine] = useState<GeometryEngine>('primitives');
  const [primLock, setPrimLock] = useState<PrimitiveLock>('all');
  const [nodeComplexity, setNodeComplexity] = useState<number>(5);
  const [strokeParity, setStrokeParity] = useState<boolean>(true);
  const [cornerRadius, setCornerRadius] = useState<number>(0);
  const [grid, setGrid] = useState<AlignmentGrid>('none');
  const [negativeSpace, setNegativeSpace] = useState<number>(20);

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
      const refined = await refineTextPrompt(prompt, PanelMode.VECTOR, kernelConfig, dna || undefined);
      setPrompt(refined);
    } catch (e) {
      console.error("Refinement failed");
    } finally {
      setIsRefining(false);
    }
  };

  const handleGenerate = async () => {
    if (processingRef.current) return;
    const effectivePrompt = prompt.trim() || (uploadedImage ? "Refine silhouette into geometric paths." : "Abstract geometric synthesis.");
    const combinedPrompt = [activePreset?.prompt, effectivePrompt].filter(Boolean).join('. ');
    
    // Construct architectural directives
    const extraDirectives = `
      GEOMETRY_ENGINE: ${engine.toUpperCase()}
      PRIMITIVE_LOCK: ${primLock.toUpperCase()}
      NODE_COMPLEXITY: ${nodeComplexity}/10
      STROKE_PARITY: ${strokeParity ? 'MONOWEIGHT_ENFORCED' : 'VARYING'}
      CORNER_RADIUS: ${cornerRadius}%
      ALIGNMENT_GRID: ${grid.toUpperCase()}
      NEGATIVE_SPACE_RATIO: ${negativeSpace}%
    `.trim();

    processingRef.current = true;
    transition(dna ? "DNA_STYLIZE_ACTIVE" as any : "DEVOURING_BUFFER", true);
    setIsValidationError(false);
    
    try {
      const result = await synthesizeVectorStyle(combinedPrompt, uploadedImage || undefined, kernelConfig, dna || undefined, extraDirectives);
      setGeneratedOutput(result);
      transition("LATTICE_ACTIVE");
      onSaveToHistory({
        id: `vec-${Date.now()}`,
        name: effectivePrompt.slice(0, 15),
        description: uploadedImage ? `Vectorized image using ${engine} engine` : `Vector synthesis using ${engine} engine`,
        type: PanelMode.VECTOR,
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
        moduleNumber="Module_01" 
        title="Vector_Synth" 
        version="Architectural engine v5.2"
        colorClass="text-brandRed"
        borderColorClass="border-brandRed"
      />
      
      {/* --- ARCHITECT_CONTROLS --- */}
      <div className="space-y-10 mb-12">
        {/* 1. Logic Switches */}
        <section>
          <h4 className="text-[10px] font-black uppercase text-brandCharcoal/40 dark:text-white/30 tracking-widest mb-4 border-b border-brandCharcoal/10 dark:border-white/5 pb-2">Architecture</h4>
          <div className="space-y-4">
            <div>
              <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 mb-1.5 block">Geometry Engine</label>
              <div className="grid grid-cols-2 gap-1.5">
                {(['primitives', 'parametric', 'organic', 'hybrid'] as GeometryEngine[]).map(e => (
                  <button 
                    key={e} 
                    onClick={() => setEngine(e)}
                    className={`py-2 text-[8px] font-black uppercase tracking-widest border-2 transition-all rounded-sm ${engine === e ? 'bg-brandRed border-brandRed text-white' : 'border-brandCharcoal/10 text-brandCharcoal/40 dark:border-white/10 dark:text-white/30 hover:border-brandRed'}`}
                  >
                    {e}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 mb-1.5 block">Primitive Lock</label>
              <select 
                value={primLock} 
                onChange={e => setPrimLock(e.target.value as any)}
                className="w-full bg-transparent border-2 border-brandCharcoal/10 dark:border-white/10 text-[8px] font-black uppercase px-2 py-1.5 rounded-sm outline-none focus:border-brandRed"
              >
                <option value="all">All Primitives</option>
                <option value="circle">Circular Only</option>
                <option value="square">Quadrilateral Only</option>
                <option value="triangle">Triangular Only</option>
              </select>
            </div>
          </div>
        </section>

        {/* 2. Geometric Precision */}
        <section>
          <h4 className="text-[10px] font-black uppercase text-brandCharcoal/40 dark:text-white/30 tracking-widest mb-4 border-b border-brandCharcoal/10 dark:border-white/5 pb-2">Precision</h4>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Node Density</label>
                <span className="text-[8px] font-black text-brandRed">{nodeComplexity}/10</span>
              </div>
              <input 
                type="range" min="1" max="10" step="1" 
                value={nodeComplexity} 
                onChange={e => setNodeComplexity(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandRed"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Corner Smoothing</label>
                <span className="text-[8px] font-black text-brandRed">{cornerRadius}%</span>
              </div>
              <input 
                type="range" min="0" max="100" 
                value={cornerRadius} 
                onChange={e => setCornerRadius(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandRed"
              />
            </div>
          </div>
        </section>

        {/* 3. Structural Rules */}
        <section>
          <h4 className="text-[10px] font-black uppercase text-brandCharcoal/40 dark:text-white/30 tracking-widest mb-4 border-b border-brandCharcoal/10 dark:border-white/5 pb-2">Lattice Rules</h4>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Stroke Parity</label>
              <button 
                onClick={() => setStrokeParity(!strokeParity)}
                className={`w-10 h-5 rounded-full p-1 transition-colors ${strokeParity ? 'bg-brandRed' : 'bg-brandCharcoal/20 dark:bg-white/10'}`}
              >
                <div className={`w-3 h-3 bg-white rounded-full transition-transform ${strokeParity ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <div>
              <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40 mb-1.5 block">Alignment Grid</label>
              <select value={grid} onChange={e => setGrid(e.target.value as any)} className="w-full bg-transparent border-2 border-brandCharcoal/10 dark:border-white/10 text-[8px] font-black uppercase px-2 py-1.5 rounded-sm outline-none">
                <option value="none">None</option>
                <option value="square">Standard Grid</option>
                <option value="isometric">Isometric Lattice</option>
                <option value="golden">Golden Ratio</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-[8px] font-black uppercase text-brandCharcoalMuted dark:text-white/40">Negative Space</label>
                <span className="text-[8px] font-black text-brandRed">{negativeSpace}%</span>
              </div>
              <input 
                type="range" min="0" max="50" 
                value={negativeSpace} 
                onChange={e => setNegativeSpace(parseInt(e.target.value))} 
                className="w-full h-1.5 bg-brandCharcoal/5 dark:bg-white/5 appearance-none rounded-full accent-brandRed"
              />
            </div>
          </div>
        </section>
      </div>

      <div className="space-y-8">
        {PRESETS.map((cat, i) => (
          <div key={i} className="animate-in fade-in slide-in-left duration-500" style={{ animationDelay: `${i * 100}ms` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-1 h-3 bg-brandRed rounded-full" />
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
                  iconChar="V" 
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
        downloadFilename={`hyperxgen_vector_${Date.now()}.png`}
      />
      
      <div className="flex flex-col gap-6">
        <GenerationBar 
          prompt={prompt} 
          setPrompt={setPrompt} 
          onGenerate={handleGenerate} 
          isProcessing={isProcessing} 
          activePresetName={activePreset?.name || dna?.name}
          placeholder={uploadedImage ? "Describe structural adjustments for vectorization..." : "Enter synthesis parameters or subject..."} 
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