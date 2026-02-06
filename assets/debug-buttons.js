// DEBUG: Force all buttons to be visible
document.addEventListener('DOMContentLoaded', function() {
  console.log('DEBUG: Looking for buttons...');
  
  // Method 1: Check all buttons
  const buttons = document.querySelectorAll('button, [role="button"], .btn');
  console.log('Found', buttons.length, 'button elements');
  
  buttons.forEach(btn => {
    console.log('Button:', btn);
    btn.style.outline = '2px solid red !important';
    btn.style.backgroundColor = '#FD1E4A !important';
    btn.style.color = 'white !important';
    btn.style.padding = '10px !important';
  });
  
  // Method 2: If using Vue/React shadow DOM
  setTimeout(() => {
    const shadowButtons = document.querySelectorAll('*');
    shadowButtons.forEach(el => {
      if (el.shadowRoot) {
        const shadowBtns = el.shadowRoot.querySelectorAll('button');
        shadowBtns.forEach(btn => {
          btn.style.border = '3px solid yellow !important';
        });
      }
    });
  }, 1000);
});
