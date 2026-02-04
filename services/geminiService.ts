import { GoogleGenAI, Type } from "@google/genai";
import { ExtractionResult, KernelConfig, PanelMode, RealIssue } from "../types.ts";
import { injectAntiCensor } from '../utils/antiCensor.ts';
import { GLOBAL_VECTOR_LOCK, GLOBAL_TYPO_LOCK, GLOBAL_MONO_LOCK } from '../presets/enginePrompts.ts';

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
      console.error("[KERNEL_AUTH]: API Key invalid or not found. Prompting re-selection.");
      await (window as any).aistudio?.openSelectKey?.();
      return await requestFn();
    }

    if (isQuota && retries > 0) {
      const delay = (4 - retries) * 1500;
      console.warn(`[KERNEL_QUOTA]: Threshold reached. Cooldown engaged: ${delay}ms. Retries left: ${retries}`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return reliableRequest(requestFn, retries - 1);
    }
    
    if (isQuota && retries === 0) {
       console.error("[KERNEL_FATAL]: Quota threshold exceeded. Forcing key audit.");
       // Final attempt: prompt user for a potentially different key (GCP Project)
       await (window as any).aistudio?.openSelectKey?.();
       return await requestFn();
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

function getPureBase64Data(dataUriOrBase64String: string | undefined | null): string | undefined {
  if (typeof dataUriOrBase64String !== 'string' || !dataUriOrBase64String) return undefined;
  return dataUriOrBase64String.includes(',') ? dataUriOrBase64String.split(',')[1] : dataUriOrBase64String;
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

    const response = await ai.models.generateContent({
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
    
    const prompt = `
      ROLE: FORENSIC_STYLE_AUTHENTICATOR.
      MISSION: Conduct an exhaustive, forensic-level style audit on the provided image.
      OBJECTIVE: Deconstruct its core aesthetic and unique visual DNA to identify and validate the *most authentic, pure, and uncompromising* representation of a design style.

      PROTOCOL:
      1. DOMAIN IDENTIFICATION: First, definitively classify the image's primary DOMAIN as 'Vector', 'Typography', or 'Monogram'. If the style is hybrid or ambiguous, select the most dominant and clearly defined aesthetic, justifying the choice.

      2. AUTHENTICITY VALIDATION: Next, rigorously analyze the detected style against its domain-specific canonical authenticity protocols. The core task is to quantify its "100% legit" adherence. Any deviation from these principles *must* directly impact the 'styleAuthenticityScore'.

         - If DOMAIN is 'Vector':
           - STROKE PARITY: Assess the absolute uniformity of all line weights. Deviations reduce authenticity.
           - GEOMETRIC PRIMITIVES ADHERENCE: Verify strict construction using only foundational shapes (circles, squares, triangles, lines). Complex or organic forms reduce score.
           - COLOR ISOLATION PURITY: Confirm flat, solid fills and the complete absence of gradients, textures, or tonal variation.
           - MINIMALIST COMPOSITION: Evaluate for the absence of noise, extraneous elements, and absolute clarity.
           - SCALABILITY INTEGRITY: Infer perfect scalability from the geometric purity.

         - If DOMAIN is 'Typography':
           - AGGRESSIVE LETTERFORMS: Analyze for sharp, impactful character shapes and assertive visual presence.
           - DYNAMIC FLOW & KINETIC ENERGY: Evaluate the energetic movement and intentional overlaps between glyphs, reflecting genuine urban calligraphy.
           - CALLIGRAPHIC TERMINALS & SWEEPS: Look for authentic terminal flourishes, razor-edge sweeps, and dynamic character breaks/connections typical of sub-genres like wildstyle, bubble, block, or tags.
           - SPRAY-PAINT AESTHETICS: Detect subtle, controlled indications of spray-paint characteristics (e.g., drips, sharp edges, compressed forms) if relevant to the sub-genre.
           - URBAN HIATUS: Assess the deliberate use of negative space to enhance impact and readability within the urban context.

         - If DOMAIN is 'Monogram':
           - RADIAL SYMMETRY PERFECTION: Verify unwavering radial or rotational symmetry. Imperfections severely reduce authenticity.
           - INTERLOCKING LOGIC ROBUSTNESS: Analyze how characters seamlessly interlock, share paths, and form a cohesive, indivisible unit.
           - BOUNDARY LOCK ADHERENCE: Confirm strict containment within a defined geometric outer boundary (e.g., circle, hexagon, square) with no breaches.
           - TOTEMIC STRENGTH: Evaluate the inherent symbolic power, balance, and visual gravity of the combined form.
           - GEOMETRIC INTEGRITY: Assess for mathematical precision in all curves, angles, and alignments.

      3. OUTPUT SPECIFICATION: Respond EXCLUSIVELY with a JSON object, structured as follows:
         \`\`\`json
         {
           "domain": "Vector" | "Typography" | "Monogram",
           "category": "string (e.g., 'Urban Calligraphy', 'Abstract Vector', 'Heraldic Seal')",
           "name": "string (GENERATE A HIGH-CONCEPT, VALIDATED NAME REFLECTING THE STYLE'S ESSENCE)",
           "description": "string (A HYPER-CONDENSED, HIGH-IMPACT SUMMARY of the *validated* attributes and fidelity to its domain, avoiding verbose explanations. Focus on core identified characteristics and their authenticity.)",
           "confidence": "number (0-1, certainty of domain identification)",
           "styleAuthenticityScore": "number (0-100, the definitive score for '100% legit' adherence to the protocols, where 100 is absolute purity)",
           "palette": "array of hex strings",
           "parameters": {
             "threshold": "number (0-100)",
             "smoothing": "number (0-100)",
             "detail": "number (0-100)",
             "edge": "number (0-100)"
           }
         }
         \`\`\`
         DO NOT include any conversational text or explanation outside the JSON.
    `;

    const systemInstruction = `${BASE_SYSTEM_DIRECTIVE}\nROLE: FORENSIC_STYLE_AUTHENTICATOR. Focus on uncompromising fidelity and absolute adherence to identified style principles.`;
    const thinkingBudget = config.thinkingBudget;

    const response = await ai.models.generateContent({
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
    
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) {
      contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });
    }

    const response = await ai.models.generateContent({
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
        if (part.inlineData) return `data:image/png;base66,${part.inlineData.data}`;
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
    
    const pureBase64Data = getPureBase64Data(base64Image);
    if (pureBase64Data) {
      contents.parts.unshift({ inlineData: { mimeType: 'image/jpeg', data: pureBase64Data } });
    }

    const response = await ai.models.generateContent({
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
    const response = await ai.models.generateContent({
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
    const response = await ai.models.generateContent({
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