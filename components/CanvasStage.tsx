import React, { useRef, useCallback } from 'react';
import { DownloadIcon, TrashIcon, BoxIcon } from './Icons.tsx';

interface CanvasStageProps {
  uploadedImage: string | null;
  generatedOutput: string | null;
  isProcessing: boolean;
  hudContent?: React.ReactNode;
  isValidationError?: boolean;
  uiRefined?: boolean;
  refinementLevel?: number;
  onClear: () => void;
  onGenerate?: () => void;
  onFileUpload: (file: File) => void;
  downloadFilename?: string;
}

export const CanvasStage: React.FC<CanvasStageProps> = ({
  uploadedImage,
  generatedOutput,
  isProcessing,
  hudContent,
  isValidationError,
  uiRefined,
  onClear,
  onGenerate,
  onFileUpload,
  downloadFilename = "hyperxgen_output.png"
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (!uploadedImage && !generatedOutput && !isProcessing) fileInputRef.current?.click();
  };

  const processFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileUpload(file);
  };

  const handleDownload = useCallback(() => {
    const imageToDownload = generatedOutput || uploadedImage;
    if (imageToDownload) {
      const link = document.createElement('a');
      link.href = imageToDownload;
      link.download = downloadFilename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }, [generatedOutput, uploadedImage, downloadFilename]);

  return (
    <div className="flex-1 flex items-center justify-center bg-[#0c0c0c] relative min-h-[250px] md:min-h-[450px] overflow-hidden rounded-sm w-full">
      {/* Background Grid - Animated */}
      <div className="absolute inset-0 pointer-events-none opacity-20" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
             `,
             backgroundSize: '40px 40px',
             backgroundPosition: 'center'
           }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-[#0c0c0c]/80" />
      </div>

      <button
        type="button"
        className={`canvas-stage relative w-full h-auto max-w-[900px] aspect-square md:aspect-video group transition-all duration-700 rounded-sm overflow-hidden border-4 border-brandCharcoal dark:border-white/10 bg-[#0f0f0f] shadow-[10px_10px_0px_0px_rgba(45,45,47,0.05)] dark:shadow-[10px_10px_0px_0px_rgba(253,30,74,0.05)] md:shadow-[20px_20px_0px_0px_rgba(45,45,47,0.05)] md:dark:shadow-[20px_20px_0px_0px_rgba(253,30,74,0.05)] ${
          isProcessing ? 'border-brandRed shadow-[0_0_30px_rgba(253,30,74,0.15)]' : ''
        }`}
        onClick={handleClick}
        disabled={isProcessing}
        aria-label={uploadedImage || generatedOutput ? "View generated output" : "Upload source image"}
      >
        <input ref={fileInputRef} type="file" className="hidden" accept="image/*" onChange={processFile} />
        
        {/* REFINED VIEWFINDER OVERLAY */}
        <div className="absolute inset-0 pointer-events-none z-20 transition-opacity duration-300 opacity-60 group-hover:opacity-100">
          {/* Top Left */}
          <div className="absolute top-4 left-4 w-6 h-6 md:w-8 md:h-8 border-t-2 border-l-2 border-brandRed/40" />
          <div className="absolute top-4 left-4 w-1.5 h-1.5 md:w-2 md:h-2 bg-brandRed/40" />
          
          {/* Top Right */}
          <div className="absolute top-4 right-4 w-6 h-6 md:w-8 md:h-8 border-t-2 border-r-2 border-brandRed/40" />
          <div className="absolute top-4 right-4 w-1.5 h-1.5 md:w-2 md:h-2 bg-brandRed/40" />
          
          {/* Bottom Left */}
          <div className="absolute bottom-4 left-4 w-6 h-6 md:w-8 md:h-8 border-b-2 border-l-2 border-brandRed/40" />
          <div className="absolute bottom-4 left-4 w-1.5 h-1.5 md:w-2 md:h-2 bg-brandRed/40" />
          
          {/* Bottom Right */}
          <div className="absolute bottom-4 right-4 w-6 h-6 md:w-8 md:h-8 border-b-2 border-r-2 border-brandRed/40" />
          <div className="absolute bottom-4 right-4 w-1.5 h-1.5 md:w-2 md:h-2 bg-brandRed/40" />
          
          {/* Crosshair Center */}
          {!uploadedImage && !generatedOutput && (
            <div className="absolute inset-0 flex items-center justify-center opacity-20">
              <div className="w-32 md:w-64 h-[1px] bg-brandRed/30" />
              <div className="h-32 md:h-64 w-[1px] bg-brandRed/30" />
            </div>
          )}

          <div className="absolute top-5 left-12 md:left-16 text-[8px] font-mono text-brandRed/60 font-black tracking-widest bg-black/40 px-2 py-0.5 backdrop-blur-sm border border-brandRed/10">
            COORD: 000.00, 000.00
          </div>
          <div className="absolute bottom-5 right-12 md:right-16 text-[8px] font-mono text-brandRed/60 font-black tracking-widest bg-black/40 px-2 py-0.5 backdrop-blur-sm border border-brandRed/10">
            STATUS: {isProcessing ? 'SYNTHESIZING' : (generatedOutput ? 'OUTPUT_LOCKED' : 'AWAITING_INPUT')}
          </div>
        </div>

        {/* SCANLINE DURING PROCESSING */}
        {isProcessing && (
          <div className="absolute inset-0 z-30 pointer-events-none overflow-hidden">
            <div className="w-full h-[2px] bg-brandRed shadow-[0_0_20px_rgba(253,30,74,1)] animate-scan absolute" />
            <div className="absolute inset-0 bg-brandRed/5 animate-pulse mix-blend-overlay" />
          </div>
        )}

        {/* HUD CONTENT */}
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          {hudContent}
        </div>

        {/* ART CONTENT */}
        <div className="w-full h-full flex items-center justify-center overflow-hidden p-6 md:p-8 relative z-10">
          {isValidationError ? (
            <div className="flex flex-col items-center text-center max-w-xs animate-in zoom-in duration-300">
              <span className="text-brandRed font-black text-lg md:text-xl uppercase italic mb-2 tracking-tighter drop-shadow-md">Null_Lattice_Error</span>
              <p className="text-[9px] font-black text-white/50 uppercase leading-tight tracking-[0.2em] mb-4">
                Synthesis returned semantic drift. Handshake failed.
              </p>
              {onGenerate && (
                <button onClick={(e) => { e.stopPropagation(); onGenerate(); }} className="px-6 py-2 bg-brandRed text-white text-[10px] font-black uppercase italic border-2 border-brandRed hover:bg-white hover:text-brandRed transition-all">
                  RE_SYNC_KERNEL
                </button>
              )}
            </div>
          ) : (generatedOutput || uploadedImage) ? (
            <img 
              src={generatedOutput || uploadedImage || ''} 
              className="w-full h-full object-contain animate-in zoom-in duration-1000 select-none pointer-events-none" 
              alt="Generated Output" 
            />
          ) : (
            <div className="flex flex-col items-center gap-4 md:gap-6 text-center group-hover:scale-105 transition-transform duration-500">
              <div className="w-16 h-16 md:w-20 md:h-20 border-2 border-dashed border-brandRed/30 flex items-center justify-center rounded-sm bg-brandRed/5">
                <BoxIcon className="w-8 h-8 md:w-10 md:h-10 text-brandRed opacity-40" />
              </div>
              <div className="space-y-1">
                <span className="text-4xl xs:text-5xl lg:text-7xl font-black italic tracking-tighter uppercase text-white/5 select-none block">VOID</span>
                <p className="text-[8px] md:text-[9px] font-black text-brandRed/30 uppercase tracking-[0.4em] bg-black/40 px-3 py-1 rounded-full border border-brandRed/10">
                  Upload_Source_Image
                </p>
              </div>
            </div>
          )}
        </div>

        {/* CONTROLS */}
        <div className="absolute top-4 right-4 md:top-6 md:right-6 z-40 flex flex-col gap-2 md:gap-3">
          <button 
            onClick={(e) => { e.stopPropagation(); onClear(); }} 
            disabled={isProcessing}
            className="p-2 md:p-3 bg-brandCharcoal/90 text-brandRed border border-brandRed/20 hover:bg-brandRed hover:text-white transition-all shadow-xl rounded-sm disabled:opacity-0 backdrop-blur-sm"
            title="Purge Buffer"
          >
            <TrashIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
          </button>
          {(generatedOutput || uploadedImage) && (
            <button 
              onClick={(e) => { e.stopPropagation(); handleDownload(); }} 
              disabled={isProcessing}
              className="p-2 md:p-3 bg-brandCharcoal/90 text-brandYellow border border-brandYellow/20 hover:bg-brandYellow hover:text-brandCharcoal transition-all shadow-xl rounded-sm disabled:opacity-0 backdrop-blur-sm"
              title="Export Artifact"
            >
              <DownloadIcon className="w-3.5 h-3.5 md:w-4 md:h-4" />
            </button>
          )}
        </div>

        {/* STATUS OVERLAY */}
        {isProcessing && (
          <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 z-40 flex items-center gap-3 bg-brandCharcoal/90 backdrop-blur-md px-4 py-2 md:px-5 md:py-2.5 border-l-4 border-brandRed shadow-lg">
            <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-brandRed rounded-full animate-ping" />
            <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.3em] text-brandRed animate-pulse">Synthesizing...</span>
          </div>
        )}
      </button>
    </div>
  );
};