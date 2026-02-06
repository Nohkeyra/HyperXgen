import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const distPath = 'dist';
const indexPath = join(distPath, 'index.html');

if (readFileSync(indexPath, 'utf8').includes('</head>')) {
  const viewportFix = `
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <style>
    /* DEPLOYED CLIPPING FIX */
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { width: 100vw; min-height: 100vh; overflow-x: hidden; }
    body { background: #0a0a0f; color: #00ff88; font-family: monospace; }
    #root { width: 100% !important; padding: 20px !important; }
    h1, h2, h3 { font-size: clamp(1rem, 5vw, 1.8rem) !important; }
  </style>
  `;
  
  let html = readFileSync(indexPath, 'utf8');
  html = html.replace('</head>', `${viewportFix}</head>`);
  writeFileSync(indexPath, html);
  console.log('✅ Added clipping fix to deployed index.html');
}
