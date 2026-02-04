
import { PresetCategory } from '../types';

export const SIGNATURE_TYPO: PresetCategory = {
  title: "SIGNATURE_WORDMARKS",
  items: [
    {
      id: "sig-ty-nexus",
      name: "Sanguine-Vector-Nexus",
      description: "CALLIGRAPHIC URBAN ABSTRACTION. Aggressive red calligraphy merging with interlocking charcoal letterforms.",
      prompt: "High-contrast typographic composition. Aggressive, sharp-angled red calligraphy merging with interlocking charcoal-grey letterforms. Architectural flow, terminal flares, razor-edge sweeps. Kinetic urban tension. Calligraphic urban abstraction. Flat vector style, solid fills, no gradients."
    },
    {
      id: "sig-ty-01",
      name: "Kinetic Pulse Pro",
      description: "High-contrast dynamic wordmark with intentional terminal slices.",
      prompt: "Dynamic motion wordmark. Sharp terminal slices, parallel speed lines, high-contrast geometry. Geometric display type with zero kerning errors."
    },
    {
      id: "hx-ty2",
      name: "Omega Core V2",
      description: "The definitive engine wordmark. Maximum weight, zero compromise.",
      prompt: "Monolithic geometric wordmark. Ultra-heavy visual mass, zero contrast strokes, stark grid-locked alignment. Industrial architecture."
    },
    {
      id: "hx-ty3",
      name: "Neo Grid Mono",
      description: "Strict grid-locked display type for industrial branding.",
      prompt: "Monospaced geometric typography. Strict 8x8 grid alignment, uniform stroke weights, robotic precision glyphs. Flat vector style."
    }
  ]
};

export const CORE_TYPO_LIBRARIES: PresetCategory[] = [
  {
    title: "GLITCH_SYNTAX",
    items: [
      {
        id: "gs-1",
        name: "Stagger-Stack",
        description: "Characters sliced into horizontal strips and laterally offset by varying amounts.",
        prompt: "Geometric glitch wordmark. Each glyph sliced into 8 horizontal segments with random lateral offsets. Sharp edges, high-contrast, strictly vector."
      },
      {
        id: "gs-2",
        name: "Vector Noise-Fill",
        description: "Glyphs filled with high-frequency micro-geometric patterns.",
        prompt: "Pattern-filled typography. Monolithic letterforms filled with micro-scale geometric hatching and circuit patterns. High density, industrial, monochrome."
      }
    ]
  },
  {
    title: "LIQUID_GEOMETRY",
    items: [
      {
        id: "lg-1",
        name: "Mercury Flow",
        description: "Viscous, rounded terminals that maintain strict architectural paths.",
        prompt: "Viscous liquid wordmark. High-surface-tension curves, mercury-like flow, but executed with razor-sharp geometric outlines. High-contrast chrome aesthetic."
      },
      {
        id: "lg-2",
        name: "Ferrofluid Block",
        description: "Sharp spiky extensions erupting from heavy block characters.",
        prompt: "Ferrofluid-inspired typography. Spiky geometric extensions erupting from the edges of heavy brutalist glyphs. Symmetrical, aggressive, flat vector."
      }
    ]
  },
  {
    title: "ARCHITECTURAL_BRUTALISM",
    items: [
      { 
        id: "ab-1", 
        name: "Cast-in-Place", 
        description: "Raw, heavy block typography inspired by exposed concrete structures.", 
        prompt: "Brutalist monolithic type. Raw heavy block forms, zero contrast stroke weights, oppressive visual mass. Inspired by exposed concrete architecture. Flat solid fills."
      },
      { 
        id: "ab-2", 
        name: "Modular Slab", 
        description: "Typography as repeating structural facade units.",
        prompt: "Modular architectural typography. Characters constructed from repeating slab primitives. High-density structural detail, grid-locked, monolithic."
      }
    ]
  },
  {
    title: "STREET_HIEROGLYPHS",
    items: [
      { 
        id: "sh-1", 
        name: "Wildstyle Blueprint", 
        description: "Complex interlocking graffiti letters with mechanical junctions.",
        prompt: "Complex interlocking wildstyle typography. Sharp aggressive angles, mechanical letter junctions, complex geometric weaving. Flat vector style, architectural graffiti."
      },
      { 
        id: "sh-2", 
        name: "Fat-Cap Vector", 
        description: "Rounded high-pressure terminals with aggressive overlaps.",
        prompt: "Graffiti fat-cap aesthetic. High-pressure rounded terminals, bold industrial outlines, overlapping kinetic paths. Flat solid fills, high-contrast."
      }
    ]
  },
  {
    title: "SWISS_GRID_LOGIC",
    items: [
      { 
        id: "sl-1", 
        name: "International Style", 
        description: "Absolute grid-locked sans-serif with maximum negative space.",
        prompt: "Swiss International Style typography. Pure geometric sans deconstruction, absolute grid alignment, maximum negative space efficiency. Clean, clinical, deterministic."
      },
      { 
        id: "sl-2", 
        name: "Negative Carve", 
        description: "Type formed by subtracting volume from a geometric block.",
        prompt: "Negative space typography. Letterforms carved out of a solid geometric block. Subject is the void. High-contrast binary composition."
      }
    ]
  }
];
