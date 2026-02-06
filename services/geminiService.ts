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

/**
 * reliableRequest
 * Advanced bypass for 429 Quota Exceeded and Key issues.
 * Implements exponential backoff and triggers key selection dialog on persistent failure.
 */
async function reliableRequest<T>(requestFn: () => Promise<T>, retries = 3): Promise<T> {
  try {
    return await requestFn();
  } catch (error: any) {
    const message = error?.message || "";
    const status = error?.status || error?.code || "";
    const errorStr = `${message} ${status} ${JSON.stringify(error)}`.toLowerCase();
    
    const isQuota = errorStr.includes("429") || errorStr.includes("quota") || errorStr.includes("resource_exhausted") || status === 429 || status === "RESOURCE_EXHAUSTED";
    const isKeyError = errorStr.includes("requested entity was not found") || errorStr.includes("api_key_invalid");

    if (isKeyError) {
      console.error("[KERNEL_AUTH]: API Key invalid or not found.");
      // CRITICAL FIX: Only attempt to open key selection if window.aistudio exists.
      if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
        console.warn("[KERNEL_AUTH]: Attempting re-selection via AI Studio API.");
        await (window as any).aistudio.openSelectKey();
        return await requestFn(); // Retry after potential key re-selection
      } else {
        console.error("[KERNEL_FATAL]: API Key invalid. Cannot prompt for key in this environment. Please ensure API_KEY is set correctly.");
        throw new Error("API Key invalid or not set. Please check your environment configuration.");
      }
    }

    if (isQuota && retries > 0) {
      const delay = (4 - retries) * 1500;
      console.warn(`[KERNEL_QUOTA]: Threshold reached. Cooldown engaged: ${delay}ms. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return reliableRequest(requestFn, retries - 1);
    }
    
    if (isQuota && retries === 0) {
       console.error("[KERNEL_FATAL]: Quota threshold exceeded. Forcing key audit.");
       // CRITICAL FIX: Only attempt to open key selection if window.aistudio exists.
       if ((window as any).aistudio && typeof (window as any).aistudio.openSelectKey === 'function') {
         console.warn("[KERNEL_AUTH]: Attempting key audit via AI Studio API.");
         await (window as any).aistudio.openSelectKey();
         return await requestFn(); // Retry after potential key re-selection
       } else {
         console.error("[KERNEL_FATAL]: Quota exceeded and cannot prompt for key in this environment. Please ensure API_KEY is valid and has sufficient quota.");
         throw new Error("API Quota Exceeded. Please check your billing or try again later.");
       }
    }

    throw error;
  }
}

function compileVisualPrompt(subject: string, mode: 'vector' | 'typo' | 'monogram', dna?: ExtractionResult): string {
  let globalLock = "";
  if (mode === 'vector') globalLock = GLOBAL_VECTOR_LOCK;
  else if (mode === 'typo') globalLock = GLOBAL_TYPO_LOCK;
  else globalLock = GLOBAL_MONO_LOCK;

  const subjectText = subject.trim() || "Abstract geometric synthesis.";
  
  let dnaContext = "";
  if (dna && dna.parameters) {
    const palette = Array.isArray(dna.palette) ? dna.palette.join(', ') : "industrial";
    dnaContext = `[DNA_INJECTION]: Edge sharpness ${dna.parameters.edge ?? 50}, Line smoothing ${dna.parameters.smoothing ?? 50}, Color palette ${palette}.`;
  }
  
  const combined = `${globalLock}\n${dnaContext}\n[VISUAL_SUBJECT]: ${subjectText}`;
  return injectAntiCensor(combined);
}

export async function chatWithKernel(
  history: { role: 'user' | 'model'; content: string }[],
  config: KernelConfig = DEFAULT_CONFIG
): Promise<{ text: string; sources?: { title: string; uri: string }[] }> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const contents = history.map(item => ({
      role: item.role,
      parts: [{ text: item.content }]
    }));

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: config.model,
      contents: contents,
      config: {
        systemInstruction: `${BASE_SYSTEM_DIRECTIVE}\nROLE: KERNEL_OPERATOR. Communicate with architectural precision.`,
        temperature: config.temperature,
        tools: [{ googleSearch: {} }] 
      }
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.map((chunk: any) => {
        if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
        return null;
      })
      .filter(Boolean) as { title: string; uri: string }[] | undefined;

    return { text: response.text || "PROTOCOL_NULL", sources };
  });
}

export async function extractStyleFromImage(
  base64Image: string, 
  config: KernelConfig = DEFAULT_CONFIG
): Promise<ExtractionResult> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const dataOnly = getPureBase64Data(base64Image);
    if (!dataOnly) throw new Error("Empty buffer.");
    
    // Updated prompt for improved style extraction
    const prompt = `Perform a forensic style extraction on the provided image. Analyze and distill its core design DNA.
Focus on:
1.  **Dominant Domain:** Identify if the primary style aligns with 'Vector', 'Typography', or 'Monogram' principles.
2.  **Category & Name:** Determine a precise design category and generate a high-concept, validated name for this style.
3.  **Description:** Provide a hyper-condensed summary of the *validated* attributes and fidelity to its domain.
4.  **Visual Parameters:** Quantify key visual attributes:
    *   **Threshold:** Overall visual intensity/contrast (0-100).
    *   **Smoothing:** Curve smoothness vs. angularity (0-100).
    *   **Detail:** Intricacy and complexity of elements (0-100).
    *   **Edge:** Sharpness and definition of lines/boundaries (0-100).
5.  **Color Palette:** Extract the most prominent hexadecimal color codes.
6.  **Authenticity Score:** Rate the detected style's "100% legit" adherence to established design protocols (0-100).

Return the analysis strictly as a JSON object matching the ExtractionResult schema. Maintain absolute objectivity and precision.`;

    const systemInstruction = `${BASE_SYSTEM_DIRECTIVE}\nROLE: FORENSIC_STYLE_AUTHENTICATOR. Focus on uncompromising fidelity and absolute adherence to identified style principles.`;
    const thinkingBudget = config.thinkingBudget;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: config.model,
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
             domain: { type: Type.STRING, description: '"Vector" | "Typography" | "Monogram"' },
             category: { type: Type.STRING, description: 'e.g., "Urban Calligraphy", "Abstract Vector", "Heraldic Seal"' },
             name: { type: Type.STRING, description: 'GENERATE A HIGH-CONCEPT, VALIDATED NAME REFLECTING THE STYLE\'S ESSENCE' },
             description: { type: Type.STRING, description: 'A HYPER-CONDENSED, HIGH-IMPACT SUMMARY of the *validated* attributes and fidelity to its domain, avoiding verbose explanations. Focus on core identified characteristics and their authenticity.' },
             confidence: { type: Type.NUMBER, description: '0-1, certainty of domain identification' },
             styleAuthenticityScore: { type: Type.NUMBER, description: '0-100, the definitive score for \'100% legit\' adherence to the protocols, where 100 is absolute purity' },
             palette: { type: Type.ARRAY, items: { type: Type.STRING }, description: 'array of hex strings' },
             parameters: {
               type: Type.OBJECT,
               properties: {
                 threshold: { type: Type.NUMBER, description: '0-100' },
                 smoothing: { type: Type.NUMBER, description: '0-100' },
                 detail: { type: Type.NUMBER, description: '0-100' },
                 edge: { type: Type.NUMBER, description: '0-100' }
               },
               required: ['threshold', 'smoothing', 'detail', 'edge']
             }
           },
           required: ['domain', 'category', 'name', 'description', 'confidence', 'styleAuthenticityScore', 'palette', 'parameters']
         },
        thinkingConfig: { thinkingBudget: thinkingBudget }
      }
    });
    const result = JSON.parse(response.text || "{}");
    return {
      domain: result.domain || 'Typography', // Default to Typography given the context
      category: result.category || 'Extracted Urban',
      name: result.name || generateStylisticName(),
      description: result.description || 'Geometric lattice fragment',
      confidence: result.confidence || 0,
      styleAuthenticityScore: result.styleAuthenticityScore || 0, // Default to 0
      palette: Array.isArray(result.palette) ? result.palette : [],
      parameters: result.parameters || { threshold: 50, smoothing: 50, detail: 50, edge: 50 }
    };
  });
}

export async function synthesizeVectorStyle(
  prompt: string,
  base64Image?: string,
  config: any = DEFAULT_CONFIG,
  dna?: ExtractionResult
): Promise<string> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isPro = config.useProModel;
    const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
    
    const visualPrompt = compileVisualPrompt(prompt, 'vector', dna);
    const contents: any = { parts: [{ text: visualPrompt }] };
    
    // Fix: Use the new getPureBase64Data function
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) {
      contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents,
      config: { 
        systemInstruction: IMAGE_GEN_SYSTEM_DIRECTIVE, 
        temperature: 0.1,
        // @ts-ignore
        imageConfig: isPro ? { aspectRatio: "1:1", imageSize: "2K" } : undefined
      }
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image output generated.");
  });
}

export async function synthesizeTypoStyle(
  prompt: string,
  base64Image?: string,
  config: any = DEFAULT_CONFIG,
  dna?: ExtractionResult
): Promise<string> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const isPro = config.useProModel;
    const modelName = isPro ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';

    const visualPrompt = compileVisualPrompt(prompt, 'typo', dna);
    const contents: any = { parts: [{ text: visualPrompt }] };
    
    // Fix: Use the new getPureBase64Data function
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) {
      contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });
    }

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: modelName,
      contents,
      config: { 
        systemInstruction: IMAGE_GEN_SYSTEM_DIRECTIVE, 
        temperature: 0.1,
        // @ts-ignore
        imageConfig: isPro ? { aspectRatio: "1:1", imageSize: "2K" } : undefined
      }
    });
    
    for (const candidate of response.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (part.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No typo image output generated.");
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
      model: config.model,
      contents: `Refine this prompt for better image generation in ${mode} mode. Prompt: "${prompt}". DNA Context: ${JSON.stringify(dna || {})}. Return ONLY the refined prompt.`,
      config: {
        systemInstruction: "You are a prompt engineer for high-end design AI.",
        temperature: 0.7,
      }
    });
    return response.text || prompt;
  });
}

export async function analyzeCodeForRefinements(code: string): Promise<RealIssue[]> {
  return reliableRequest(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Analyze the following code for refinements. Output a JSON array of RealIssue objects.\n\nCODE:\n${code}`,
      config: {
        systemInstruction: "You are a senior frontend architect.",
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