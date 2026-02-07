// Button visibility debug
document.addEventListener('DOMContentLoaded', () => {
  console.log('DEBUG: Page loaded');
  
  // Method 1: Direct buttons
  const buttons = document.querySelectorAll('button');
  console.log('Found', buttons.length, 'buttons');
  
  buttons.forEach(btn => {
    btn.style.border = '3px solid red !important';
    btn.style.backgroundColor = '#FD1E4A !important';
    btn.style.color = 'white !important';
    btn.style.padding = '12px 24px !important';
    btn.style.margin = '5px !important';
  });
  
  // Method 2: Vue/React components might render later
  setTimeout(() => {
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.innerHTML && el.innerHTML.includes('button') || 
          el.className && el.className.includes('btn')) {
        el.style.outline = '2px dashed blue !important';
      }
    });
  }, 2000);
});
