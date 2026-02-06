import { PresetCategory, PresetItem } from '../types';

/**
 * KSD-OMEGA DIRECTIVES
 * Specialized high-fidelity prompts designed for deterministic design synthesis.
 * These are injected into every generation request to force geometric adherence.
 */

export const GLOBAL_VECTOR_LOCK = `[PROTOCOL: GEOMETRIC_PRECISION_V5]
Execute synthesis with absolute mathematical rigor. 
1. PRIMITIVES ONLY: Construct subjects using atomic geometric primitives (circles, triangles, rectangles).
2. STROKE PARITY: Maintain uniform line weights across the entire composition. No tapered strokes.
3. COLOR ISOLATION: Use flat, solid fills. Gradients are strictly forbidden. 
4. SUBJECT PURITY: Isolate the primary subject against a 100% white or transparent background. No environmental noise.
5. SYMMETRY ENFORCEMENT: Prioritize radial or bilateral symmetry where applicable.
[OUTPUT]: High-contrast vector-style synthesis. Minimalist. Deterministic.`;

export const GLOBAL_TYPO_LOCK = `[PROTOCOL: GLYPH_SYNTAX_DECONSTRUCTION_URBAN_KINETIC]
Process alphabetic characters as dynamic, aggressive, and expressive forms, reflecting urban calligraphy and graffiti art.
1. KINETIC FLOW: Prioritize fluid, hand-drawn kinetics and intentional overlaps between glyphs. Avoid strict grid-locked alignment if it restricts dynamic movement.
2. STROKE VARIATION: Embrace varying stroke weights, sharp calligraphic terminals, and dynamic sweeps to convey energy. Uniformity is secondary to expressive form.
3. NEGATIVE SPACE: Command the background as a solid, flat void, but allow for implied depth and motion through character placement.
4. SPRAY-PAINT AESTHETICS: Incorporate subtle hints of spray-paint texture or aggressive edge treatment if contextually relevant.
5. IMPACT APEX: Ensure the wordmark delivers raw, high-energy impact and maintains its street art aesthetic across various scales.
[OUTPUT]: High-contrast kinetic, urban, hand-styled wordmark. Expressive. Aggressive.`;

export const GLOBAL_MONO_LOCK = `[PROTOCOL: SEAL_SYNTHESIS_RADIAL]
Fuse character DNA into a single unified geometric seal.
1. INTERLOCKING LOGIC: Letters must share shared paths or interlock within a defined boundary.
2. BOUNDARY LOCK: The composition must fit within a primary geometric container (Circle, Hexagon, or Square).
3. SYMMETRY LATTICE: Enforce perfect radial symmetry across 2, 4, or 8 axes.
4. STROKE RATIO: Maintain a 1:1 ratio between stroke weight and inner negative space.
[OUTPUT]: Geometric signet/seal. Symmetric. Totemic.`;

export interface EnginePrompt {
  id: string;
  type: "vector" | "typography" | "monogram" | "filter";
  category: string;
  name: string;
  description: string;
  prompt: string;
  filter?: string;
  options?: Record<string, any>;
}

export const ENGINE_PROMPTS: EnginePrompt[] = [
  /* ---------------- VECTORS ---------------- */
  {
    "id": "sig-vec-01",
    "type": "vector",
    "category": "Signature Vector",
    "name": "Omega Lattice Alpha",
    "description": "The peak of recursive geometric interconnection. High-frequency detail.",
    "prompt": "Recursive geometric lattice structure. Intricate interconnected pathways forming a complex architectural subject. Flat solid fills, high-contrast industrial palette. Absolute subject isolation."
  },
  {
    "id": "sig-vec-04",
    "type": "vector",
    "category": "Signature Vector",
    "name": "Glitch-Core Matrix",
    "description": "Deterministic vector glitching. Staggered geometric slices and lateral path offsets.",
    "prompt": "Vector-based glitch art. Subject sliced into parallel horizontal shards with lateral offsets. Sharp geometric displacement, high-contrast flat fills, zero organic curves."
  },
  {
    "id": "sig-vec-05",
    "type": "vector",
    "category": "Signature Vector",
    "name": "Neural Fungal PCB",
    "description": "Biological growth logic meets rigid circuit trace architecture.",
    "prompt": "Rhizomatic growth pattern rendered as a rigid PCB circuit. Interlocking 45-degree and 90-degree vector pathways, circular nodes, uniform stroke weights. Synthetic-organic hybrid."
  },
  {
    "id": "sig-vec-02",
    "type": "vector",
    "category": "Signature Vector",
    "name": "Prism Void Delta",
    "description": "Refractive geometric deconstruction. Spectral light dispersion blocks.",
    "prompt": "Refractive deconstruction of a subject into geometric shards. Hard-edged color blocks with sharp directional offsets. Prism logic. Flat vector execution."
  },
  {
    "id": "sig-vec-03",
    "type": "vector",
    "category": "Signature Vector",
    "name": "Neural Weave V9",
    "description": "Synthetic synaptic pathways mimic biological growth in a rigid grid.",
    "prompt": "Biological neural pathways rendered as synthetic vector circuitry. Branching geometric nodes, uniform line weights, clean mathematical flow. Zero organic noise."
  },

  /* ---------------- TYPOGRAPHY ---------------- */
  {
    "id": "sig-ty-01",
    "type": "typography",
    "category": "Signature Wordmarks",
    "name": "Kinetic Pulse Pro",
    "description": "High-contrast dynamic wordmark with intentional terminal slices.",
    "prompt": "Dynamic motion wordmark. Sharp terminal slices, parallel speed lines, high-contrast geometry. Geometric display type with zero kerning errors."
  },
  {
    "id": "sig-ty-03",
    "type": "typography",
    "category": "Signature Wordmarks",
    "name": "Liquid-Steel Slab",
    "description": "High-viscosity metallic forms deconstructed into razor-sharp vector curves.",
    "prompt": "Viscous liquid letterforms rendered with absolute sharp geometric precision. Mercury-like flow but with strictly defined paths. High-contrast chrome logic, flat vector shading."
  },
  {
    "id": "sig-ty-04",
    "type": "typography",
    "category": "Signature Wordmarks",
    "name": "Brutalist X-Ray",
    "description": "Overlapping transparent geometric planes creating emergent character forms.",
    "prompt": "Architectural typography deconstructed into overlapping transparent planes. Emergent shapes at junctions, high-contrast monochrome, strict grid-locked alignment."
  },
  {
    "id": "sig-ty-02",
    "type": "typography",
    "category": "Signature Wordmarks",
    "name": "Brutalist Monolith",
    "description": "Heavy monolithic glyphs with zero contrast and iron-grid alignment.",
    // Fix: Added missing 'prompt' property
    "prompt": "Monolithic block typography. Zero contrast stroke weights, jagged brutalist edges, heavy visual mass. Grid-locked architectural alignment."
  },

  /* ---------------- MONOGRAMS ---------------- */
  {
    "id": "sig-mo-01",
    "type": "monogram",
    "category": "Signature Monograms",
    "name": "Nano Seal Omega",
    "description": "Micro-etched signet construction with nested circular frames.",
    "prompt": "Precision geometric seal. Interlocking character geometry, nested circular frames, perfect radial symmetry. High-density signet detail."
  },
  {
    "id": "sig-mo-03",
    "type": "monogram",
    "category": "Signature Monograms",
    "name": "Totem Axis Prime",
    "description": "Vertical mirrored character stacking with aggressive symmetry enforcement.",
    "prompt": "Symmetrical vertical totem monogram. Mirrored character DNA stacked into a unified geometric pillar. Central axis dominance, high-impact silhouette."
  },
  {
    "id": "sig-mo-04",
    "type": "monogram",
    "category": "Signature Monograms",
    "name": "Orbital Logic V2",
    "description": "Planetary ring logic applied to character intersections. Concentric circuitry.",
    "prompt": "Circular orbital monogram. Letters interlock with concentric ring pathways. PCB-inspired junctions, high-frequency radial detail, geometric signet aesthetic."
  },
  {
    "id": "sig-mo-02",
    "type": "monogram",
    "category": "Signature Monograms",
    "name": "Apex Crest Prime",
    "description": "Shield-based heraldry deconstructed into raw geometric primitives.",
    // Fix: Added missing 'prompt' property
    "prompt": "Modern heraldic crest. Subject fused into a geometric shield boundary. Mathematical symmetry, uniform line weights, flat solid fills."
  },

  /* ---------------- FILTERS ---------------- */
  {
    "id": "sig-fi-01",
    "type": "filter",
    "category": "Signature Series",
    "name": "Spectral-V",
    "description": "High-frequency silver luminance with aggressive edge contrast.",
    "prompt": "Filter synthesis: Spectral-V",
    "filter": "grayscale(100%) contrast(180%) brightness(105%) saturate(0%)"
  },
  {
    "id": "sig-fi-02",
    "type": "filter",
    "category": "Signature Series",
    "name": "Cobalt-Trace",
    "description": "Deep industrial blue shadows with electric highlight clarity.",
    "prompt": "Filter synthesis: Cobalt-Trace",
    "filter": "hue-rotate(200deg) saturate(180%) contrast(140%) brightness(90%)"
  }
];

export const groupPromptsByCategory = (type: "vector" | "typography" | "monogram" | "filter"): PresetCategory => {
  const filtered = ENGINE_PROMPTS.filter(p => p.type === type);
  // Assuming there's only one category per type for the 'Signature Series'
  const categoryName = filtered.length > 0 ? filtered[0].category : 'Unknown Category';
  
  return {
    title: categoryName,
    items: filtered
      .filter(p => p.category === categoryName)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        filter: p.filter,
        prompt: p.prompt,
        type: p.type // Added type to preset item
      }))
  };
};

export const groupAllPromptsByCategory = (type: "vector" | "typography" | "monogram" | "filter"): PresetCategory[] => {
  const filtered = ENGINE_PROMPTS.filter(p => p.type === type);
  const categories = Array.from(new Set(filtered.map(p => p.category)));
  
  return categories.map(catName => ({
    title: catName,
    items: filtered
      .filter(p => p.category === catName)
      .map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        filter: p.filter,
        prompt: p.prompt,
        type: p.type // Added type to preset item
      }))
  }));
};