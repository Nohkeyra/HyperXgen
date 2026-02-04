
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { TerminalMessage, KernelConfig } from '../types';
import { chatWithKernel } from '../services/geminiService';
import InputArea from './InputArea';

interface TerminalPanelProps {
  kernelConfig: KernelConfig;
}

export const TerminalPanel: React.FC<TerminalPanelProps> = ({ kernelConfig }) => {
  const [messages, setMessages] = useState<TerminalMessage[]>([
    {
      id: 'init',
      role: 'kernel',
      content: 'KSD OMEGA PROTOCOL: ACTIVE. AWAITING INPUT VECTOR.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = useCallback(async (text: string) => {
    const userMsg: TerminalMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString()
    };
    
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => !m.isTrace)
        .map(m => ({ role: m.role === 'user' ? 'user' as const : 'model' as const, content: m.content }));
      history.push({ role: 'user', content: text });

      const result = await chatWithKernel(history, kernelConfig);
      
      const kernelMsg: TerminalMessage = {
        id: `kernel-${Date.now()}`,
        role: 'kernel',
        content: result.text,
        timestamp: new Date().toLocaleTimeString(),
        groundingSources: result.sources
      };
      
      setMessages(prev => [...prev, kernelMsg]);
    } catch (e) {
      setMessages(prev => [...prev, {
        id: `err-${Date.now()}`,
        role: 'kernel',
        content: '[ERROR]: KERNEL_RESPONSE_DRIFT_DETECTED. RE-INITIATING HANDSHAKE.',
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [messages, kernelConfig]);

  const runMacro = (macro: string, label: string) => {
    if (isLoading) return;
    handleSendMessage(`[MACRO: ${label}] ${macro}`);
  };

  const macros = [
    { label: 'BS_CHECK', desc: 'Verify output logic', cmd: 'Perform a Chain of Verification on the previous output.' },
    { label: 'COMPRESS', desc: '50% token reduction', cmd: 'Rewrite the last output to reduce token count by 50% while retaining logic.' },
    { label: 'STATE_REP', desc: 'Sync state buffer', cmd: 'Output the current CURRENT_STATE JSON block for persistence.' },
    { label: 'DECONSTRUCT', desc: 'Atomic variable break', cmd: 'Apply KSD deconstruction to the current architecture.' }
  ];

  return (
    <div className="flex flex-col h-full bg-brandNeutral dark:bg-[#050505] font-mono overflow-hidden">
      {/* Terminal Header */}
      <div className="bg-brandCharcoal dark:bg-black px-6 py-4 border-b-2 border-brandRed flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-10 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-2.5 h-2.5 bg-brandRed rounded-full animate-pulse shadow-[0_0_8px_#FD1E4A]" />
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-brandRed uppercase tracking-[0.4em]">KERNEL_TELEMETRY_LINK</span>
            <span className="text-[7px] text-white/30 uppercase tracking-[0.1em]">Protocol: KSD-OMEGA-4.5 // Status: Stable</span>
          </div>
        </div>
        
        {/* Macro Deck */}
        <div className="flex flex-wrap gap-2">
          {macros.map((m) => (
            <button
              key={m.label}
              onClick={() => runMacro(m.cmd, m.label)}
              disabled={isLoading}
              className="px-3 py-1.5 bg-white/5 border border-brandRed/20 hover:border-brandRed hover:text-brandRed transition-all text-[8px] font-black uppercase rounded-sm disabled:opacity-30 group relative"
            >
              <span>[{m.label}]</span>
              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-brandCharcoal text-white text-[7px] whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-all border-2 border-brandRed shadow-2xl z-50">
                <div className="font-black text-brandRed mb-1 uppercase tracking-widest">{m.label}_INIT</div>
                <div className="text-white/60 lowercase">{m.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-10 custom-scrollbar bg-[radial-gradient(rgba(253,30,74,0.03)_1.5px,transparent_1.5px)] [background-size:24px_24px]"
      >
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex flex-col max-w-5xl mx-auto ${msg.role === 'user' ? 'items-end' : 'items-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}
          >
            <div className={`flex items-center gap-3 mb-2 px-2 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`text-[8px] font-black uppercase tracking-[0.3em] px-2 py-0.5 rounded-sm
                ${msg.role === 'user' ? 'bg-brandCharcoal dark:bg-zinc-800 text-white' : 'bg-brandRed text-white'}
              `}>
                {msg.role === 'user' ? 'Operator' : 'Engine'}
              </div>
              <span className="text-[7px] text-brandCharcoalMuted dark:text-white/20 font-mono italic tracking-widest">
                {msg.timestamp}
              </span>
            </div>
            
            <div className={`
              relative p-6 border-2 rounded-sm text-sm leading-relaxed whitespace-pre-wrap font-mono group
              ${msg.role === 'user' 
                ? 'bg-brandCharcoal dark:bg-zinc-900 border-brandCharcoal text-white shadow-[8px_8px_0px_0px_#FD1E4A] ml-20' 
                : 'bg-white dark:bg-black/40 border-brandRed text-brandCharcoal dark:text-brandNeutral border-l-[12px] mr-20 shadow-[8px_8px_0px_0px_rgba(253,30,74,0.1)]'
              }
            `}>
              <div className="absolute top-2 right-4 opacity-0 group-hover:opacity-30 transition-opacity text-[7px] font-black uppercase">
                {msg.role === 'user' ? 'SIG_VALID' : 'TRACE_BUFFER_OUT'}
              </div>
              {msg.content}
              
              {msg.groundingSources && msg.groundingSources.length > 0 && (
                <div className="mt-4 pt-4 border-t border-brandRed/20">
                  <div className="text-[8px] font-black text-brandRed uppercase mb-2">Grounding_Sources:</div>
                  <div className="flex flex-wrap gap-2">
                    {msg.groundingSources.map((source, idx) => (
                      <a 
                        key={idx} 
                        href={source.uri} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[9px] bg-brandRed/10 text-brandRed hover:bg-brandRed hover:text-white px-2 py-1 rounded-sm border border-brandRed/20 transition-all flex items-center gap-1"
                      >
                        <svg className="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/></svg>
                        {source.title}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex flex-col items-start max-w-5xl mx-auto animate-pulse pl-4">
            <div className="flex items-center gap-3 mb-3">
               <div className="w-2 h-2 bg-brandRed rounded-full animate-ping" />
               <div className="text-[9px] font-black text-brandRed uppercase tracking-[0.5em] italic">Synthesizing_Logic_Trace...</div>
            </div>
            <div className="w-full max-w-[300px] h-[2px] bg-brandRed/10 overflow-hidden relative border border-brandRed/20">
              <div className="absolute inset-0 bg-brandRed animate-shimmer" />
            </div>
          </div>
        )}
      </div>

      {/* Input Fixed at Bottom */}
      <div className="z-10">
        <InputArea 
          onSendMessage={handleSendMessage} 
          isLoading={isLoading} 
          placeholder="Input kernel directive [BS_CHECK, COMPRESS, STATE_REP]..." 
        />
      </div>
    </div>
  );
};
