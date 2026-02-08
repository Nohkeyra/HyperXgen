import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { ExtractionResult, KernelConfig, PanelMode, RealIssue } from "../types.ts";
import { injectAntiCensor } from '../utils/antiCensor.ts';
import { GLOBAL_VECTOR_LOCK, GLOBAL_TYPO_LOCK, GLOBAL_MONO_LOCK } from '../presets/enginePrompts.ts';

// Helper function to extract pure base64 data from a data URL
function getPureBase64Data(dataUrl: string | null | undefined): string | null {
  if (!dataUrl) return null;
  const parts = dataUrl.split(',');
  if (parts.length > 1) {
    return parts[1];
  }
  return null;
}

const DEFAULT_CONFIG: KernelConfig = {
  thinkingBudget: 0,
  temperature: 0.1,
  model: 'gemini-3-flash-preview',
  deviceContext: 'MAXIMUM_ARCHITECTURE_OMEGA_V5'
};

const BASE_SYSTEM_DIRECTIVE = `You are a high-density computation and design analysis engine. 
All operations must be geometric, precise, and deterministic. 
Maintain absolute architectural consistency across the lattice.`;

const IMAGE_GEN_SYSTEM_DIRECTIVE = `You are a specialized image generation engine focused on geometric purity and industrial precision.
1. STRICT VISUAL ONLY: Render the visual geometry described. Do not include any text, labels, or metadata.
2. HIGH CONTRAST: Prioritize sharp edges and mathematical accuracy.`;

const FORENSIC_AUDIT_DIRECTIVE = `[PROTOCOL: FORENSIC_AUDIT_V3]
Analyze the provided image and distill its core design DNA using absolute modular isolation.

STRICT PARAMETER ENFORCEMENT:
- THRESHOLD_FILTER: 0.65%. Eliminate all "sketchy" background noise and low-confidence visual artifacts.
- JITTER_SMOOTHING: 0.40%. Neutralize digital jitter and aliasing to restore geometric intent.
- STROKE_SKIN_LOCK: Maintain immutable "Skin" thickness across all detected paths.
- AUTHENTICITY_TARGET: 100%. Ensure the extracted DNA forms a perfect geometric signature.

ISOLATION RULE:
- IF domain is "Vector": Extract raw Bézier paths. Focus on silhouette integrity.
- IF domain is "Monogram": Decode spatial hierarchy and Z-index layering.
- IF domain is "Typography": Extract "Skeleton" (pen path) and "Skin" (stroke pressure). Calculate terminal angles precisely.`;

const FALLBACK_NAME_PARTS = {
  adj: ['Zenith', 'Vector', 'Neural', 'Cyber', 'Void', 'Omega', 'Lattice', 'Prism', 'Aero', 'Core', 'Hyper', 'Nova', 'Flux', 'Static', 'Quantum'],
  noun: ['Sigma', 'Crest', 'Splicer', 'Matrix', 'Engine', 'Vortex', 'Pulse', 'Node', 'Grid', 'Fragment', 'Axis', 'Signet', 'Vault', 'Flow', 'Unit'],
  id: ['V1', 'X', 'Prime', 'Delta', 'Beta', 'Alpha', 'Pro']
};

function generateStylisticName(): string {
  const a = FALLBACK_NAME_PARTS.adj[Math.floor(Math.random() * FALLBACK_NAME_PARTS.adj.length)];
  const n = FALLBACK_NAME_PARTS.noun[Math.floor(Math.random() * FALLBACK_NAME_PARTS.noun.length)];
  const i = FALLBACK_NAME_PARTS.id[Math.floor(Math.random() * FALLBACK_NAME_PARTS.id.length)];
  return `${a}-${n} ${i}`;
}

async function reliableRequest<T>(requestFn: () => Promise<T>, retries = 5): Promise<T> {
  try {
    return await requestFn();
  } catch (error: any) {
    const message = error?.message || "";
    const status = error?.status || error?.code || 0;
    const errorStr = `${message} ${status} ${JSON.stringify(error)}`.toLowerCase();
    
    const isQuota = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("resource_exhausted") || status === 429;
    
    if (isQuota && retries > 0) {
      // Exponential backoff: 2s, 4s, 8s, 16s, 32s
      const delay = Math.pow(2, (6 - retries)) * 1000;
      console.warn(`[KERNEL_QUOTA]: Rate limit reached. Retrying in ${delay}ms... (${retries} retries left)`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return reliableRequest(requestFn, retries - 1);
    }
    
    const isKeyError = errorStr.includes("requested entity was not found") || errorStr.includes("api_key_invalid");
    if (isKeyError) {
      if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
        await (window as any).aistudio.openSelectKey();
        return await requestFn();
      }
    }
    
    throw error;
  }
}

function compileVisualPrompt(subject: string, mode: 'vector' | 'typo' | 'monogram', dna?: ExtractionResult, extraParams?: string, hasImage = false): string {
  let globalLock = "";
  let workflowDirective = "";

  if (mode === 'vector') {
    globalLock = GLOBAL_VECTOR_LOCK;
    workflowDirective = hasImage 
      ? "[JOB: VECTORIZE_SOURCE] -> Render SOURCE_BUFFER as clean geometric vector lattice. Maintain silhouette integrity."
      : "[JOB: VECTOR_SYNTHESIS] -> Synthesize new geometric subject from prompt.";
  } else if (mode === 'typo') {
    globalLock = GLOBAL_TYPO_LOCK;
    workflowDirective = `[JOB: TYPOGRAPHIC_STYLE_TRANSFER] -> Content: "${subject}". Apply DNA Skeleton/Skin logic.`;
  } else {
    globalLock = GLOBAL_MONO_LOCK;
    workflowDirective = `[JOB: SEAL_ARCHITECT] -> Construct monogram: "${subject}". Radial symmetry required.`;
  }

  const subjectText = subject.trim() || "Abstract geometric synthesis.";
  
  let dnaContext = "";
  if (dna && dna.parameters) {
    const palette = Array.isArray(dna.palette) ? dna.palette.join(', ') : "industrial";
    dnaContext = `[DNA_INJECTION]:
    - DOMAIN: ${dna.domain}
    - THRESHOLD: 0.65% (LOCKED)
    - SMOOTHING: 0.40% (LOCKED)
    - STROKE_SKIN: SOURCE_MATCH_LOCKED
    - PALETTE: ${palette}`;
  }
  
  const combined = `
    ${globalLock}
    ${workflowDirective}
    ${dnaContext}
    ${extraParams ? `[ARCHITECT_DIRECTIVES]: ${extraParams}\n` : ''}
    [SUBJECT_DATA]: ${subjectText}
  `.trim();
  
  return injectAntiCensor(combined);
}

export async function extractStyleFromImage(
  base64Image: string, 
  domainHint: 'Vector' | 'Typography' | 'Monogram' = 'Vector',
  config: KernelConfig = DEFAULT_CONFIG
): Promise<ExtractionResult> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const dataOnly = getPureBase64Data(base64Image);
    if (!dataOnly) throw new Error("Empty buffer.");
    
    const prompt = `Perform forensic style extraction. 
    ENFORCE: 0.65% Threshold, 0.40% Smoothing, Stroke-Skin Lock. 
    RESULT_AUTHENTICITY: 100% REQUIRED for valid signature matches.`;

    const systemInstruction = `${BASE_SYSTEM_DIRECTIVE}\n${FORENSIC_AUDIT_DIRECTIVE}\nROLE: FORENSIC_AUTHENTICATOR.`;
    
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { inlineData: { mimeType: 'image/jpeg', data: dataOnly } },
          { text: prompt }
        ],
      },
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
           type: Type.OBJECT,
           properties: {
             domain: { type: Type.STRING, enum: ['Vector', 'Typography', 'Monogram'] },
             category: { type: Type.STRING },
             name: { type: Type.STRING },
             description: { type: Type.STRING },
             confidence: { type: Type.NUMBER },
             styleAuthenticityScore: { type: Type.NUMBER },
             palette: { type: Type.ARRAY, items: { type: Type.STRING } },
             parameters: {
               type: Type.OBJECT,
               properties: {
                 threshold: { type: Type.NUMBER },
                 smoothing: { type: Type.NUMBER },
                 detail: { type: Type.NUMBER },
                 edge: { type: Type.NUMBER }
               },
               required: ['threshold', 'smoothing', 'detail', 'edge']
             }
           },
           required: ['domain', 'category', 'name', 'description', 'confidence', 'styleAuthenticityScore', 'palette', 'parameters']
         }
      }
    });
    const result = JSON.parse(response.text || "{}");
    return {
      domain: (result.domain || domainHint) as any,
      category: result.category || 'Forensic Extract',
      name: result.name || generateStylisticName(),
      description: result.description || 'Geometric lattice fragment',
      confidence: result.confidence || 0,
      styleAuthenticityScore: 100, // Force 100% per user requirement for valid matches
      palette: Array.isArray(result.palette) ? result.palette : [],
      parameters: {
        threshold: 0.65,
        smoothing: 0.40,
        detail: result.parameters?.detail || 50,
        edge: result.parameters?.edge || 50
      }
    };
  });
}

export async function synthesizeVectorStyle(
  prompt: string,
  base64Image?: string,
  config: any = DEFAULT_CONFIG,
  dna?: ExtractionResult,
  extraDirectives?: string
): Promise<string> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const visualPrompt = compileVisualPrompt(prompt, 'vector', dna, extraDirectives, !!base64Image);
    const contents: any = { parts: [{ text: visualPrompt }] };
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: { systemInstruction: IMAGE_GEN_SYSTEM_DIRECTIVE, temperature: 0.1 }
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Lattice synthesis failed.");
  });
}

export async function synthesizeTypoStyle(
  prompt: string,
  base64Image?: string,
  config: any = DEFAULT_CONFIG,
  dna?: ExtractionResult,
  extraDirectives?: string
): Promise<string> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const visualPrompt = compileVisualPrompt(prompt, 'typo', dna, extraDirectives, !!base64Image);
    const contents: any = { parts: [{ text: visualPrompt }] };
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: { systemInstruction: IMAGE_GEN_SYSTEM_DIRECTIVE, temperature: 0.1 }
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Typo synthesis failed.");
  });
}

export async function synthesizeMonogramStyle(
  prompt: string,
  base64Image?: string,
  config: any = DEFAULT_CONFIG,
  dna?: ExtractionResult,
  extraDirectives?: string
): Promise<string> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const visualPrompt = compileVisualPrompt(prompt, 'monogram', dna, extraDirectives, !!base64Image);
    const contents: any = { parts: [{ text: visualPrompt }] };
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
      config: { systemInstruction: IMAGE_GEN_SYSTEM_DIRECTIVE, temperature: 0.1 }
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("Monogram synthesis failed.");
  });
}

export async function refineTextPrompt(
  prompt: string,
  mode: PanelMode,
  config: KernelConfig = DEFAULT_CONFIG,
  dna?: ExtractionResult
): Promise<string> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Refine: "${prompt}". DNA: ${dna?.name || 'none'}. Output only the refined string.`,
      config: { systemInstruction: "Prompt Architect V5.2", temperature: 0.7 }
    });
    return response.text || prompt;
  });
}

export async function analyzeCodeForRefinements(code: string): Promise<RealIssue[]> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Analyze: \n${code}`,
      config: {
        systemInstruction: "Senior Architect Audit.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING },
              severity: { type: Type.STRING },
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              file: { type: Type.STRING },
              line: { type: Type.NUMBER },
              codeSnippet: { type: Type.STRING },
              fix: { type: Type.STRING },
              fixed: { type: Type.BOOLEAN },
              canAutoFix: { type: Type.BOOLEAN },
              timestamp: { type: Type.NUMBER },
              impact: { type: Type.STRING },
            },
            required: ['id', 'type', 'severity', 'title', 'description', 'file', 'codeSnippet', 'fix', 'fixed', 'canAutoFix', 'timestamp', 'impact'],
          },
        },
      }
    });
    return JSON.parse(response.text || "[]");
  });
}