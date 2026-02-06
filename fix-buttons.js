// JavaScript fallback for scattered buttons
function fixScatteredButtons() {
  console.log('🔧 Applying scattered button fix...');
  
  // Find all buttons
  const buttons = Array.from(document.querySelectorAll('button'));
  
  if (buttons.length === 0) {
    console.log('No buttons found');
    return;
  }
  
  // Group buttons by their Y position (to find which are together)
  const buttonGroups = {};
  buttons.forEach(button => {
    const rect = button.getBoundingClientRect();
    const groupKey = Math.floor(rect.top / 50); // Group by vertical position
    
    if (!buttonGroups[groupKey]) {
      buttonGroups[groupKey] = [];
    }
    buttonGroups[groupKey].push(button);
  });
  
  // Fix each group
  Object.values(buttonGroups).forEach((group, groupIndex) => {
    if (group.length > 1) {
      // Create container for this group
      let container = group[0].parentElement;
      
      // Apply grid layout to container
      container.style.display = 'grid';
      container.style.gridTemplateColumns = `repeat(${Math.min(group.length, 3)}, 1fr)`;
      container.style.gap = '15px';
      container.style.padding = '20px';
      container.style.width = '100%';
      
      // Fix each button in group
      group.forEach(button => {
        button.style.width = '100%';
        button.style.margin = '0';
        button.style.float = 'none';
        button.style.position = 'relative';
        button.style.display = 'flex';
        button.style.flexDirection = 'column';
        button.style.justifyContent = 'center';
        button.style.alignItems = 'center';
        button.style.minHeight = '80px';
        button.style.padding = '15px';
        button.style.borderRadius = '12px';
        button.style.background = 'rgba(30, 41, 59, 0.9)';
        button.style.border = '2px solid #3b82f6';
        button.style.color = 'white';
        button.style.fontWeight = 'bold';
        button.style.textAlign = 'center';
      });
      
      console.log(`✅ Fixed group ${groupIndex + 1} with ${group.length} buttons`);
    }
  });
  
  console.log(`✅ Total buttons fixed: ${buttons.length}`);
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', fixScatteredButtons);
} else {
  fixScatteredButtons();
}

// Also run after a short delay to catch dynamically added buttons
setTimeout(fixScatteredButtons, 1000);
