// Force correct viewport on load
window.addEventListener('load', function() {
  console.log('Applying viewport fixes...');
  
  // Set viewport
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }
  
  // Force body styles
  document.body.style.width = '100vw';
  document.body.style.height = '100vh';
  document.body.style.overflow = 'hidden';
  document.body.style.margin = '0';
  document.body.style.padding = '0';
  document.body.style.position = 'fixed';
  
  // Force root styles
  const root = document.getElementById('root');
  if (root) {
    root.style.width = '100vw';
    root.style.height = '100vh';
    root.style.overflow = 'hidden';
    root.style.position = 'fixed';
    root.style.top = '0';
    root.style.left = '0';
  }
  
  console.log('Viewport fixes applied');
});

// Also fix on resize
window.addEventListener('resize', function() {
  document.body.style.width = window.innerWidth + 'px';
  document.body.style.height = window.innerHeight + 'px';
});
