import React, { useState, useRef, useEffect } from 'react';

interface InputAreaProps {
  onSendMessage: (message: string) => void;
  isLoading: boolean;
  placeholder?: string;
}

const InputArea: React.FC<InputAreaProps> = ({ onSendMessage, isLoading, placeholder = "Input synthesis parameters..." }) => {
  const [input, setInput] = useState<string>('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  // Auto-resize logic
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [input]);

  return (
    <div className="w-full bg-brandNeutral dark:bg-brandDeep border-t-2 border-brandCharcoal dark:border-white/10 p-4 animate-in slide-in-up duration-300">
      <div className="max-w-screen-2xl mx-auto flex flex-col md:flex-row items-stretch gap-0 border-2 border-brandCharcoal dark:border-white/20 bg-white dark:bg-black/40 overflow-hidden shadow-[8px_8px_0px_0px_rgba(45,45,47,1)] dark:shadow-[8px_8px_0px_0px_rgba(253,30,74,0.3)]">
        <div className="flex-none bg-brandCharcoal dark:bg-zinc-900 px-3 py-4 flex items-center justify-center border-r border-brandCharcoal dark:border-white/10">
          <span className="text-brandRed font-black text-[10px] tracking-tighter uppercase [writing-mode:vertical-lr] rotate-180">INPUT_BUFFER</span>
        </div>
        
        <textarea
          ref={textareaRef}
          className="flex-1 p-4 bg-transparent text-brandCharcoal dark:text-white font-mono text-xs sm:text-sm focus:outline-none resize-none custom-scrollbar placeholder-brandCharcoalMuted/50 dark:placeholder-white/20 min-h-[60px] max-h-[200px]"
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyPress}
          disabled={isLoading}
          rows={1}
          aria-label="Input synthesis parameters"
        />

        <button
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          className={`flex-none px-8 py-4 font-black uppercase text-[11px] italic tracking-[0.2em] transition-all flex items-center justify-center min-w-[140px]
            ${isLoading || !input.trim() 
              ? 'bg-brandCharcoal/10 text-brandCharcoalMuted cursor-not-allowed' 
              : 'bg-brandRed text-white hover:bg-brandYellow hover:text-brandCharcoal active:translate-x-0.5 active:translate-y-0.5'
            }
          `}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              <span>SYNCING...</span>
            </div>
          ) : (
            'EXECUTE'
          )}
        </button>
      </div>
      
      <div className="max-w-screen-2xl mx-auto mt-2 flex justify-between items-center px-1">
        <div className="flex items-center gap-2">
          <div className={`w-1.5 h-1.5 rounded-full ${isLoading ? 'bg-brandYellow animate-pulse' : 'bg-green-500'}`} />
          <span className="text-[8px] font-black text-brandCharcoalMuted dark:text-white/40 uppercase tracking-widest">
            {isLoading ? 'Lattice_Synthesis_Active' : 'Neural_Engine_Ready'}
          </span>
        </div>
        <span className="text-[8px] font-mono text-brandCharcoalMuted/40 dark:text-white/20 uppercase">
          Shift+Enter for newline
        </span>
      </div>
    </div>
  );
};

export default InputArea;