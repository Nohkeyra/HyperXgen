document.addEventListener('DOMContentLoaded', function() {
  console.log('=== BUTTON HUNTER ===');
  
  // Method 1: Find all potential buttons
  const selectors = [
    'button', '[role="button"]', '.btn', '[class*="button"]',
    '[onclick]', '[href*="javascript:"]', 'input[type="submit"]',
    'input[type="button"]', 'a.button'
  ];
  
  selectors.forEach(selector => {
    const elements = document.querySelectorAll(selector);
    console.log(`Found ${elements.length} elements with selector: ${selector}`);
    
    elements.forEach((el, i) => {
      console.log(`  [${i}]`, el.tagName, el.className, el.id);
      // Make sure they're clickable
      el.style.pointerEvents = 'auto !important';
      el.style.cursor = 'pointer !important';
    });
  });
  
  // Method 2: Check Vue/React components
  setTimeout(() => {
    console.log('Checking for framework components...');
    const allElements = document.querySelectorAll('*');
    allElements.forEach(el => {
      if (el.__vue__) console.log('Vue component:', el);
      if (el._reactInternalFiber) console.log('React component:', el);
    });
  }, 1000);
  
  // Method 3: Add test button if none found
  setTimeout(() => {
    const buttons = document.querySelectorAll('button, [role="button"]');
    if (buttons.length === 0) {
      console.log('No buttons found! Adding test button...');
      const testBtn = document.createElement('button');
      testBtn.textContent = 'TEST BUTTON (Added by script)';
      testBtn.style.cssText = 'background:blue;color:white;padding:20px;margin:20px;display:block;';
      testBtn.onclick = () => alert('Test button works!');
      document.body.appendChild(testBtn);
    }
  }, 2000);
});
