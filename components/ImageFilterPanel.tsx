import React, { useState, useRef, useCallback, useMemo } from 'react';
import { PanelMode, KernelConfig } from '../types.ts';
import { PRESET_REGISTRY } from '../presets/index.ts';
import { GenerationBar } from './GenerationBar.tsx';
import { PresetCarousel } from './PresetCarousel.tsx';
import { CanvasStage } from './CanvasStage.tsx';
import { FilterHUD } from './HUD.tsx';
import { PanelLayout } from './Layouts.tsx';

interface ImageFilterPanelProps {
  onSaveToHistory?: (data: any) => void;
  kernelConfig: KernelConfig;
  integrity?: number;
  refinementLevel?: number;
  uiRefined?: boolean;
  onModeSwitch: (mode: PanelMode, data?: any) => void;
}

const applyFiltersToImage = (imageUrl: string, b: number, c: number, s: number, f: string): Promise<string> => {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width; canvas.height = img.height;
      if (ctx) {
        ctx.filter = `brightness(${b}%) contrast(${c}%) saturate(${s}%) ${f}`;
        ctx.drawImage(img, 0, 0); resolve(canvas.toDataURL('image/png'));
      } else resolve(imageUrl);
    };
    img.src = imageUrl;
  });
};

export const ImageFilterPanel: React.FC<ImageFilterPanelProps> = ({ onSaveToHistory, integrity, refinementLevel = 0, uiRefined, kernelConfig }) => {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [filteredImage, setFilteredImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [filterStatus, setFilterStatus] = useState("IDLE");
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  const [activeFilterId, setActiveFilterId] = useState<string | null>(null);
  
  const processingRef = useRef(false);

  const PRESETS = useMemo(() => {
    return [PRESET_REGISTRY.FILTERS.signature, ...PRESET_REGISTRY.FILTERS.libraries];
  }, []);

  const handleApplyFilter = useCallback(async () => {
    if (processingRef.current || !uploadedImage) return;
    setIsProcessing(true);
    processingRef.current = true;
    setFilterStatus("APPLYING_TRANSFORMATION...");
    try {
      const activeFilter = PRESETS.flatMap(c => c.items).find(f => f.id === activeFilterId);
      const fCss = (activeFilter as any)?.filter || '';
      const result = await applyFiltersToImage(uploadedImage, brightness, contrast, saturation, fCss);
      setFilteredImage(result);
      setFilterStatus("TRANSFORMATION_COMPLETE");
    } catch (e) {
      console.error(e);
      setFilterStatus("TRANSFORMATION_FAILED");
    } finally { 
      setIsProcessing(false); 
      processingRef.current = false;
    }
  }, [uploadedImage, brightness, contrast, saturation, activeFilterId, PRESETS]);

  return (
    <PanelLayout sidebar={null}>
      <CanvasStage
        uploadedImage={uploadedImage}
        generatedOutput={filteredImage}
        isProcessing={isProcessing}
        hudContent={<FilterHUD filterStatus={filterStatus} />}
        isValidationError={false}
        uiRefined={uiRefined}
        refinementLevel={refinementLevel}
        onClear={() => {
          if(isProcessing) return;
          setUploadedImage(null);
          setFilteredImage(null);
          setActiveFilterId(null);
          setFilterStatus("IDLE");
        }}
        onGenerate={handleApplyFilter}
        onFileUpload={(f) => {
          if(isProcessing) return;
          const r = new FileReader(); r.onload = (e) => {
              const base64 = e.target?.result as string;
              setUploadedImage(base64);
              setFilteredImage(base64);
              setFilterStatus("BUFFER_LOADED");
          }; 
          r.readAsDataURL(f);
        }}
        downloadFilename={`hyperxgen_filter_${Date.now()}.png`}
      />

      <div className="flex flex-col gap-6">
        <GenerationBar
          onGenerate={handleApplyFilter}
          isProcessing={isProcessing}
          additionalControls={
            <div className="flex-1 flex items-center gap-6 py-2 min-w-0">
              {[
                { label: 'B', val: brightness, set: setBrightness },
                { label: 'C', val: contrast, set: setContrast },
                { label: 'S', val: saturation, set: setSaturation }
              ].map(s => (
                <div key={s.label} className="flex-1 flex flex-col gap-1.5 min-w-0">
                  <div className="flex justify-between items-center px-1">
                    <span className="text-[10px] font-black text-brandCharcoal dark:text-white tracking-widest">{s.label}</span>
                    <span className="text-[10px] font-mono font-black text-brandRed drop-shadow-sm">{s.val}%</span>
                  </div>
                  <div className="relative flex items-center h-4">
                    <input 
                      type="range" 
                      min="0" 
                      max="200" 
                      value={s.val} 
                      disabled={isProcessing}
                      onChange={e => s.set(parseInt(e.target.value))} 
                      className="w-full h-2 bg-brandCharcoalMuted/30 border border-white/10 rounded-full appearance-none accent-brandRed cursor-pointer disabled:opacity-50 transition-colors hover:bg-white/20" 
                    />
                  </div>
                </div>
              ))}
            </div>
          }
        />

        <PresetCarousel presets={PRESETS as any} activeId={activeFilterId} onSelect={(id:string) => !isProcessing && setActiveFilterId(id)} />
      </div>
    </PanelLayout>
  );
};