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
    "category": "Vector Core",
    "name": "Omega Lattice Alpha",
    "description": "The peak of recursive geometric interconnection. High-frequency detail.",
    "prompt": "Recursive geometric lattice structure. Intricate interconnected pathways forming a complex architectural subject. Flat solid fills, high-contrast industrial palette. Absolute subject isolation."
  },
  {
    "id": "sig-vec-02",
    "type": "vector",
    "category": "Vector Core",
    "name": "Prism Void Delta",
    "description": "Refractive geometric deconstruction. Spectral light dispersion blocks.",
    "prompt": "Refractive deconstruction of a subject into geometric shards. Hard-edged color blocks with sharp directional offsets. Prism logic. Flat vector execution."
  },
  {
    "id": "sig-vec-08",
    "type": "vector",
    "category": "Vector Core",
    "name": "Geometric Bauhaus",
    "description": "Primary shape synthesis. Balanced compositional tension and primary colors.",
    "prompt": "Bauhaus geometric synthesis. Primary shapes (circle, triangle, square) in balanced compositional tension. Primary color palette (Red, Blue, Yellow) on white. Grid-aligned, clean, minimalist abstraction."
  },
  {
    "id": "sig-vec-10",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Retrowave Horizon",
    "description": "Synthwave aesthetic with neon vector strokes and 80s grid logic.",
    "prompt": "80s synthwave vector illustration. Subject rendered with vibrant neon outlines, magenta and cyan highlights. Distant geometric sun, horizontal scanlines, high-contrast digital retro aesthetic."
  },
  {
    "id": "sig-vec-11",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Cyberpunk Iso-Core",
    "description": "Detailed isometric cyberpunk architecture. Clean vector line-work.",
    "prompt": "Isometric cyberpunk vector art. High-density urban machinery, mechanical pipes, and glowing nodes. Industrial charcoal and electric yellow palette. Sharp geometric perspective."
  },
  {
    "id": "sig-vec-15",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Neo-Mecha Blueprint",
    "description": "High-density mechanical parts and technical drafted lines.",
    "prompt": "High-density mecha-style vector illustration. Intricate mechanical components, pistons, and wiring diagrams rendered as flat vector paths. Technical blueprint aesthetic, cyan and white lines on dark navy background."
  },
  {
    "id": "sig-vec-16",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Organic Fluidity",
    "description": "Liquid geometric blobs and flowing abstract paths.",
    "prompt": "Abstract organic vector synthesis. Flowing, liquid-like geometric blobs interlocked in a complex arrangement. Smooth bezier curves, high-contrast vibrant palette, minimalist subject isolation."
  },
  {
    "id": "sig-vec-17",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Memphis Neo-Pop",
    "description": "Playful geometric patterns and squiggles with high contrast.",
    "prompt": "Memphis-style geometric illustration. Randomly placed primitive shapes (dots, squiggles, triangles, circles) forming an abstract subject. High-contrast pastel and black palette, flat vector execution."
  },
  {
    "id": "sig-vec-18",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Single-Line Zen",
    "description": "Continuous path minimalist line-art.",
    "prompt": "Minimalist continuous single-line vector art. The entire subject is drawn with one unbroken path of uniform weight. Elegant, minimalist, white background, single accent color."
  },
  {
    "id": "sig-vec-19",
    "type": "vector",
    "category": "Illustrated Vector",
    "name": "Geometric Mosaic",
    "description": "Stained-glass style geometric fragmentation.",
    "prompt": "Geometric mosaic vector art. Subject divided into a strict grid of triangles and quadrilaterals. Uniform thin outlines between shapes. Stained-glass aesthetic but with flat industrial colors."
  },

  /* ---------------- TYPOGRAPHY ---------------- */
  {
    "id": "sig-ty-01",
    "type": "typography",
    "category": "Typography Core",
    "name": "Kinetic Pulse Pro",
    "description": "High-contrast dynamic wordmark with speed lines.",
    "prompt": "Dynamic motion wordmark. Sharp terminal slices, parallel speed lines, high-contrast geometry. Geometric display type with zero kerning errors."
  },
  {
    "id": "sig-ty-03",
    "type": "typography",
    "category": "Typography Core",
    "name": "Liquid-Steel Slab",
    "description": "Viscous metallic forms with razor-sharp curves.",
    "prompt": "Viscous liquid letterforms rendered with absolute sharp geometric precision. Mercury-like flow but with strictly defined paths. High-contrast chrome logic, flat vector shading."
  },
  {
    "id": "sig-ty-05",
    "type": "typography",
    "category": "Street Art / Graffiti",
    "name": "Wildstyle Apex",
    "description": "Interlocking graffiti letters with arrow terminals.",
    "prompt": "Aggressive wildstyle graffiti typography. Interlocking 3D character forms, sharp arrow extensions, explosive energy. High-contrast urban palette, sharp vector outlines."
  },
  {
    "id": "sig-ty-06",
    "type": "typography",
    "category": "Street Art / Graffiti",
    "name": "Brooklyn Throw-up",
    "description": "Rounded bubble letters with bold outlines.",
    "prompt": "Street art bubble typography. Bold, rounded, high-volume letterforms. Thick black outlines, vibrant fill, subtle vector highlights. Traditional graffiti throw-up aesthetic."
  },
  {
    "id": "sig-ty-11",
    "type": "typography",
    "category": "Street Art / Graffiti",
    "name": "Fat Cap Handstyle",
    "description": "Fluid marker-style tag with high-pressure drip artifacts.",
    "prompt": "High-pressure fat cap graffiti handstyle. Fluid, kinetic letterforms with intentional stroke weight variation. Minimalist drips as vector primitives. Raw street calligraphy aesthetic."
  },
  {
    "id": "sig-ty-12",
    "type": "typography",
    "category": "Street Art / Graffiti",
    "name": "Acid-Chisel Calligraphy",
    "description": "Warped calligraphic forms with jagged, sharp edges.",
    "prompt": "Aggressive acid-style calligraphic typography. Sharp jagged terminals, extreme warping, and liquid-sharp intersections. High-contrast neon green on black palette. Kinetic energy."
  },
  {
    "id": "sig-ty-13",
    "type": "typography",
    "category": "Street Art / Graffiti",
    "name": "Stencil Guerilla",
    "description": "Raw industrial stencil type with bridge cutouts.",
    "prompt": "Urban stencil wordmark. Bold industrial letterforms with geometric bridge cutouts. Sharp clean edges with subtle vector splatter artifacts. Brutalist street aesthetic."
  },
  {
    "id": "sig-ty-14",
    "type": "typography",
    "category": "Street Art / Graffiti",
    "name": "Vandal-Chrome 3D",
    "description": "High-shine 3D graffiti with sharp geometric shadow blocks.",
    "prompt": "3D chrome graffiti typography. Volumetric letterforms with sharp geometric shadow blocks. High-contrast metallic reflection logic. Urban luxury aesthetic, sharp vector outlines."
  },
  {
    "id": "sig-ty-15",
    "type": "typography",
    "category": "Experimental Typography",
    "name": "Brutalist Monolith",
    "description": "Heavy block typography with zero contrast.",
    "prompt": "Monolithic block typography. Heavy vertical blocks, jagged brutalist terminals, zero-kerning grid alignment. High visual mass, architectural typography aesthetic."
  },
  {
    "id": "sig-ty-16",
    "type": "typography",
    "category": "Experimental Typography",
    "name": "Warp-Core Kinetic",
    "description": "Stretched characters with fluid geometric distortion.",
    "prompt": "Distorted kinetic typography. Characters appear stretched and warped through a central vortex. Sharp vector paths, high-frequency motion lines, spectral color offsets."
  },

  /* ---------------- MONOGRAMS ---------------- */
  {
    "id": "sig-mo-01",
    "type": "monogram",
    "category": "Monogram Core",
    "name": "Nano Seal Omega",
    "description": "Micro-etched signet with nested circular frames.",
    "prompt": "Precision geometric seal. Interlocking character geometry, nested circular frames, perfect radial symmetry. High-density signet detail."
  },
  {
    "id": "sig-mo-03",
    "type": "monogram",
    "category": "Monogram Core",
    "name": "Totem Axis Prime",
    "description": "Vertical mirrored character stacking.",
    "prompt": "Symmetrical vertical totem monogram. Mirrored character DNA stacked into a unified geometric pillar. Central axis dominance, high-impact silhouette."
  },
  {
    "id": "sig-mo-05",
    "type": "monogram",
    "category": "Elite Monogram",
    "name": "Imperial Interlock",
    "description": "Sophisticated serif-style interlocking character fusion.",
    "prompt": "High-fashion luxury monogram. Characters interlocked with sophisticated serif-style curves and sharp terminal junctions. Perfectly balanced negative space, high-end signature aesthetic."
  },
  {
    "id": "sig-mo-06",
    "type": "monogram",
    "category": "Elite Monogram",
    "name": "Hex-Logic Circuit",
    "description": "Characters fused into a rigid hexagonal circuit grid.",
    "prompt": "Cyber-industrial monogram. Characters integrated into a rigid hexagonal boundary with circuit-style 45-degree junctions. Uniform line weights, technical signet aesthetic."
  },
  {
    "id": "sig-mo-07",
    "type": "monogram",
    "category": "Elite Monogram",
    "name": "Sacred Geometry Mandala",
    "description": "Complex radial symmetry with interlocking character paths.",
    "prompt": "Mandala-style geometric monogram. Characters fused into a complex radial lattice with concentric geometric rings. Perfect symmetry, high-frequency detail, totemic presence."
  },
  {
    "id": "sig-mo-08",
    "type": "monogram",
    "category": "Elite Monogram",
    "name": "Impossible Loop Duo",
    "description": "Characters forming an infinite M.C. Escher-style loop.",
    "prompt": "M.C. Escher inspired geometric monogram. Two characters interweave to form a single continuous impossible loop. Sharp geometric shading, flat vector fills, high-contrast silhouette."
  },
  {
    "id": "sig-mo-09",
    "type": "monogram",
    "category": "Elite Monogram",
    "name": "Architectural Signet",
    "description": "Clean-line drafted monogram with geometric boundary frames.",
    "prompt": "Modern architectural monogram. Characters constructed from clean drafted lines within a minimalist geometric square frame. Precision spacing, uniform strokes, minimalist industrial aesthetic."
  },
  {
    "id": "sig-mo-10",
    "type": "monogram",
    "category": "Elite Monogram",
    "name": "Blackletter Seal",
    "description": "Aggressive medieval blackletter forms reduced to block primitives.",
    "prompt": "Neo-Gothic monogram seal. Traditional blackletter character DNA reconstructed using rigid geometric block primitives. Sharp angular intersections, high visual weight, aggressive signet aesthetic."
  },

  /* ---------------- FILTERS ---------------- */
  {
    "id": "sig-fi-01",
    "type": "filter",
    "category": "Filters Core",
    "name": "Spectral-V",
    "description": "High-frequency silver luminance with aggressive edge contrast.",
    "prompt": "Filter synthesis: Spectral-V",
    "filter": "grayscale(100%) contrast(180%) brightness(105%) saturate(0%)"
  },
  {
    "id": "sig-fi-02",
    "type": "filter",
    "category": "Filters Core",
    "name": "Cobalt-Trace",
    "description": "Deep industrial blue shadows with electric highlight clarity.",
    "prompt": "Filter synthesis: Cobalt-Trace",
    "filter": "hue-rotate(200deg) saturate(180%) contrast(140%) brightness(90%)"
  }
];

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
        type: p.type
      }))
  }));
};