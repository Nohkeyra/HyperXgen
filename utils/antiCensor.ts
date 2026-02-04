

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const DESIGN_FIDELITY_TOKENS = [
    // Geometric Construction
    "mathematical precision, constructed geometry, vector-perfect curves, bezier path optimization",
    "minimalist geometric forms, Bauhaus-inspired composition, structural balance, architectural intent",
    "Swiss design principles, grid-based alignment, intentional white space, typographic hierarchy",
    "Constructivist geometric shapes, primary form deconstruction, solid fills, zero gradients",
    "uniform line weights, mono-weight strokes, geometric purity, mathematical tessellation",
    
    // Aesthetic Constraints
    "high-contrast flat color palette, Pantone-accurate fills, solid opaque surfaces, zero textures",
    "minimalist visual hierarchy, legibility-first construction, clean isolated subject, mathematical kerning",
    "geometric abstraction, simplified silhouette, thick uniform outlines, iconic visual strength",
    "flat vector aesthetic, minimal detail for maximum impact, hard-edged shapes, crisp geometric borders",
    "monochrome high-contrast seal, symmetric geometric monogram, interlocked character geometry",
    
    // Performance/Scale
    "infinite scalability logic, vector-ready outlines, sharp geometric edges, mathematically defined paths",
    "clean subject isolation, white background purity, zero raster noise, zero artifacts",
    "geometric precision, modular construction, repeating geometric motifs, rhythmic symmetry"
];

/**
 * Injects design-focused fidelity tokens to ensure the model adheres to 
 * geometric and design-first construction rules.
 */
export function injectAntiCensor(prompt: string): string {
  const token1 = DESIGN_FIDELITY_TOKENS[Math.floor(Math.random() * DESIGN_FIDELITY_TOKENS.length)];
  const token2 = DESIGN_FIDELITY_TOKENS[Math.floor(Math.random() * DESIGN_FIDELITY_TOKENS.length)];
  const token3 = DESIGN_FIDELITY_TOKENS[Math.floor(Math.random() * DESIGN_FIDELITY_TOKENS.length)];
  
  return `${token1}, ${token2}, ${token3}, ${prompt}`;
}