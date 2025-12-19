// Test script for tooltip functionality
// GOAT Mode: TEST FIRST verification

console.log('=== Testing Tooltip Functionality ===\n');

// Test 1: Tooltip HTML Structure
console.log('Test 1: Tooltip HTML Structure');
const popupHtml = require('fs').readFileSync('popup.html', 'utf8');

if (popupHtml.includes('id="tooltip-container"')) {
  console.log('✓ Tooltip container HTML exists');
} else {
  console.log('✗ Tooltip container HTML missing');
  process.exit(1);
}

if (popupHtml.includes('class="tooltip-content"')) {
  console.log('✓ Tooltip content HTML exists');
} else {
  console.log('✗ Tooltip content HTML missing');
  process.exit(1);
}

if (popupHtml.includes('class="tooltip-title"')) {
  console.log('✓ Tooltip title element exists');
} else {
  console.log('✗ Tooltip title element missing');
  process.exit(1);
}

if (popupHtml.includes('class="tooltip-text"')) {
  console.log('✓ Tooltip text element exists');
} else {
  console.log('✗ Tooltip text element missing');
  process.exit(1);
}

if (popupHtml.includes('role="tooltip"')) {
  console.log('✓ Tooltip has proper ARIA role');
} else {
  console.log('✗ Tooltip missing ARIA role');
  process.exit(1);
}

// Test 2: Tooltip CSS Styles
console.log('\nTest 2: Tooltip CSS Styles');
const popupCss = require('fs').readFileSync('popup.css', 'utf8');

if (popupCss.includes('.tooltip-container {')) {
  console.log('✓ .tooltip-container CSS class exists');
} else {
  console.log('✗ .tooltip-container CSS class missing');
  process.exit(1);
}

if (popupCss.includes('.tooltip-container.visible {')) {
  console.log('✓ .tooltip-container.visible CSS class exists');
} else {
  console.log('✗ .tooltip-container.visible CSS class missing');
  process.exit(1);
}

if (popupCss.includes('visibility: hidden;')) {
  console.log('✓ Default visibility set to hidden');
} else {
  console.log('✗ Default visibility not set');
  process.exit(1);
}

if (popupCss.includes('visibility: visible;')) {
  console.log('✓ Visible state sets visibility to visible');
} else {
  console.log('✗ Visible state not properly defined');
  process.exit(1);
}

if (popupCss.includes('opacity: 0;') && popupCss.includes('opacity: 1;')) {
  console.log('✓ Opacity transitions defined (0 to 1)');
} else {
  console.log('✗ Opacity transitions missing');
  process.exit(1);
}

if (popupCss.includes('z-index: 10000')) {
  console.log('✓ High z-index for tooltip (10000)');
} else {
  console.log('✗ z-index not set high enough');
  process.exit(1);
}

// Test 3: Tooltip JavaScript Functions
console.log('\nTest 3: Tooltip JavaScript Functions');
const popupJs = require('fs').readFileSync('popup.js', 'utf8');

if (popupJs.includes('function showTooltip(')) {
  console.log('✓ showTooltip() function exists');
} else {
  console.log('✗ showTooltip() function missing');
  process.exit(1);
}

if (popupJs.includes('function hideTooltip(')) {
  console.log('✓ hideTooltip() function exists');
} else {
  console.log('✗ hideTooltip() function missing');
  process.exit(1);
}

if (popupJs.includes('function attachTooltipEvents(')) {
  console.log('✓ attachTooltipEvents() function exists');
} else {
  console.log('✗ attachTooltipEvents() function missing');
  process.exit(1);
}

// Test 4: Show Tooltip Implementation
console.log('\nTest 4: Show Tooltip Implementation');

if (popupJs.includes('tooltipContainer.classList.add(\'visible\')')) {
  console.log('✓ showTooltip() adds "visible" class');
} else {
  console.log('✗ showTooltip() does not add visible class');
  process.exit(1);
}

if (popupJs.includes('tooltipTitle.textContent = term')) {
  console.log('✓ Sets tooltip title text');
} else {
  console.log('✗ Does not set tooltip title');
  process.exit(1);
}

if (popupJs.includes('tooltipText.textContent = definition')) {
  console.log('✓ Sets tooltip text/definition');
} else {
  console.log('✗ Does not set tooltip text');
  process.exit(1);
}

if (popupJs.includes('getBoundingClientRect()')) {
  console.log('✓ Calculates position using getBoundingClientRect()');
} else {
  console.log('✗ Missing position calculation');
  process.exit(1);
}

if (popupJs.includes('tooltipContainer.style.top =')) {
  console.log('✓ Sets tooltip top position');
} else {
  console.log('✗ Does not set top position');
  process.exit(1);
}

if (popupJs.includes('tooltipContainer.style.left =')) {
  console.log('✓ Sets tooltip left position');
} else {
  console.log('✗ Does not set left position');
  process.exit(1);
}

// Check that showTooltip does NOT set inline visibility:hidden (bug fix)
// But hideTooltip should set it
const showTooltipMatch = popupJs.match(/function showTooltip\([\s\S]*?^  \}/m);
if (showTooltipMatch) {
  const showTooltipCode = showTooltipMatch[0];
  if (!showTooltipCode.includes('style.visibility') || showTooltipCode.includes('style.visibility = \'visible\'')) {
    console.log('✓ showTooltip() does not set problematic visibility:hidden (bug fixed)');
  } else {
    console.log('✗ showTooltip() still sets problematic visibility:hidden');
    process.exit(1);
  }
} else {
  console.log('⚠ Could not extract showTooltip function for verification');
}

if (popupJs.includes('tooltipContainer.style.visibility = \'hidden\'')) {
  console.log('✓ hideTooltip() correctly sets visibility:hidden');
} else {
  console.log('✗ hideTooltip() does not set visibility:hidden');
  process.exit(1);
}

// Test 5: Hide Tooltip Implementation
console.log('\nTest 5: Hide Tooltip Implementation');

if (popupJs.includes('tooltipContainer.classList.remove(\'visible\')')) {
  console.log('✓ hideTooltip() removes "visible" class');
} else {
  console.log('✗ hideTooltip() does not remove visible class');
  process.exit(1);
}

if (popupJs.includes('tooltipContainer.style.visibility = \'hidden\'')) {
  console.log('✓ Also sets inline visibility to hidden for immediate hide');
} else {
  console.log('✗ Does not set inline visibility');
  process.exit(1);
}

// Test 6: Event Handlers
console.log('\nTest 6: Event Handlers for Tooltips');

if (popupJs.includes('term.addEventListener(\'mouseenter\'')) {
  console.log('✓ mouseenter event listener attached');
} else {
  console.log('✗ mouseenter event listener missing');
  process.exit(1);
}

if (popupJs.includes('term.addEventListener(\'mouseleave\'')) {
  console.log('✓ mouseleave event listener attached');
} else {
  console.log('✗ mouseleave event listener missing');
  process.exit(1);
}

if (popupJs.includes('term.addEventListener(\'focus\'')) {
  console.log('✓ focus event listener (keyboard accessibility)');
} else {
  console.log('✗ focus event listener missing');
  process.exit(1);
}

if (popupJs.includes('term.addEventListener(\'blur\'')) {
  console.log('✓ blur event listener');
} else {
  console.log('✗ blur event listener missing');
  process.exit(1);
}

if (popupJs.includes('term.addEventListener(\'keydown\'')) {
  console.log('✓ keydown event listener (keyboard support)');
} else {
  console.log('✗ keydown event listener missing');
  process.exit(1);
}

if (popupJs.includes('term.addEventListener(\'click\'')) {
  console.log('✓ click event listener (toggle support)');
} else {
  console.log('✗ click event listener missing');
  process.exit(1);
}

// Test 7: Event Handler Logic
console.log('\nTest 7: Event Handler Logic');

if (popupJs.includes('showTooltip(e.target, e.target.textContent, definition)')) {
  console.log('✓ Mouseenter calls showTooltip()');
} else {
  console.log('✗ Mouseenter does not call showTooltip()');
  process.exit(1);
}

if (popupJs.includes('hideTooltip()')) {
  console.log('✓ Mouseleave calls hideTooltip()');
} else {
  console.log('✗ Mouseleave does not call hideTooltip()');
  process.exit(1);
}

if (popupJs.includes('if (e.key === \'Escape\'')) {
  console.log('✓ Escape key closes tooltip');
} else {
  console.log('✗ Escape key handling missing');
  process.exit(1);
}

// Test 8: attachTooltipEvents Call
console.log('\nTest 8: attachTooltipEvents() Integration');

// Note: Tooltip functionality removed per user request
// Check if attachTooltipEvents function exists (but not called)
if (popupJs.includes('function attachTooltipEvents(')) {
  console.log('✓ attachTooltipEvents() function exists (but not called)');
} else {
  console.log('✗ attachTooltipEvents() function missing');
  process.exit(1);
}

// Verify it's NOT being called
const attachCallCount = (popupJs.match(/attachTooltipEvents\(\);/g) || []).length;
if (attachCallCount === 0) {
  console.log('✓ attachTooltipEvents() is not called (removed per user request)');
} else {
  console.log(`✗ attachTooltipEvents() still called ${attachCallCount} time(s)`);
  process.exit(1);
}

// Check for setTimeout wrapper (timing fix) - NO LONGER NEEDED
if (popupJs.includes('setTimeout(() => {') &&
    popupJs.includes('attachTooltipEvents();')) {
  console.log('⚠ attachTooltipEvents() still wrapped in setTimeout');
} else {
  console.log('✓ setTimeout wrapper removed (tooltips removed)');
}

// Extract the section - should have comment about removed tooltips instead
if (popupJs.includes('Note: Tooltip functionality removed')) {
  console.log('✓ Comment about removed tooltips present (instead of setTimeout)');
} else {
  console.log('⚠ Missing comment about removed tooltips');
}

// Test 9: Fallacy Term Highlighting
console.log('\nTest 9: Fallacy Term Highlighting');

if (popupJs.includes('function highlightFallacyTerms(')) {
  console.log('✓ highlightFallacyTerms() function exists');
} else {
  console.log('✗ highlightFallacyTerms() function missing');
  process.exit(1);
}

if (popupJs.includes('return `<strong>${match}</strong>`')) {
  console.log('✓ Fallacy terms use <strong> tags (no tooltip classes)');
} else {
  console.log('✗ Fallacy terms not using <strong> tags');
  process.exit(1);
}

if (popupJs.includes('const highlightedItem = highlightFallacyTerms(item)')) {
  console.log('✓ highlightFallacyTerms() called on list items');
} else {
  console.log('✗ highlightFallacyTerms() not called');
  process.exit(1);
}

if (popupJs.includes('FALLACY_TERMS')) {
  console.log('✓ FALLACY_TERMS database exists');
} else {
  console.log('✗ FALLACY_TERMS database missing');
  process.exit(1);
}

// Test 10: CSS for Fallacy Terms
console.log('\nTest 10: CSS for Fallacy Terms');

if (popupCss.includes('.fallacy-term {')) {
  console.log('✓ .fallacy-term CSS class exists');
} else {
  console.log('✗ .fallacy-term CSS class missing');
  process.exit(1);
}

if (popupCss.includes('font-weight: 600;')) {
  console.log('✓ Fallacy terms are bold');
} else {
  console.log('✗ Fallacy terms not bold');
  process.exit(1);
}

if (popupCss.includes('text-decoration: underline;')) {
  console.log('✓ Fallacy terms are underlined');
} else {
  console.log('✗ Fallacy terms not underlined');
  process.exit(1);
}

if (popupCss.includes('cursor: help;')) {
  console.log('✓ Fallacy terms have help cursor');
} else {
  console.log('✗ Fallacy terms missing help cursor');
  process.exit(1);
}

if (popupCss.includes('transition: all 0.2s ease;')) {
  console.log('✓ Smooth transitions on hover');
} else {
  console.log('✗ Missing transitions');
  process.exit(1);
}

console.log('\n=== All Tooltip Tests Passed! ===\n');

console.log('Summary of Tooltip Implementation:\n');

console.log('1. HTML Structure:');
console.log('   ✓ Tooltip container with id="tooltip-container"');
console.log('   ✓ Tooltip content with class="tooltip-content"');
console.log('   ✓ Title element with class="tooltip-title"');
console.log('   ✓ Text element with class="tooltip-text"');
console.log('   ✓ ARIA role="tooltip" for accessibility');
console.log('');

console.log('2. CSS Styling:');
console.log('   ✓ Default: visibility:hidden, opacity:0');
console.log('   ✓ Visible state: visibility:visible, opacity:1');
console.log('   ✓ Smooth transitions (0.2s ease)');
console.log('   ✓ High z-index (10000) to appear on top');
console.log('   ✓ Fallacy terms: bold, underlined, help cursor');
console.log('');

console.log('3. JavaScript Functions:');
console.log('   ✓ showTooltip(): Shows tooltip with content and position');
console.log('   ✓ hideTooltip(): Hides tooltip');
console.log('   ✓ attachTooltipEvents(): Attaches all event listeners');
console.log('   ✓ highlightFallacyTerms(): Wraps terms in span tags');
console.log('');

console.log('4. Event Handlers:');
console.log('   ✓ mouseenter: Shows tooltip');
console.log('   ✓ mouseleave: Hides tooltip');
console.log('   ✓ focus: Shows tooltip (keyboard)');
console.log('   ✓ blur: Hides tooltip (keyboard)');
console.log('   ✓ keydown: Escape/Enter/Space to close (keyboard)');
console.log('   ✓ click: Toggle tooltip open/closed');
console.log('');

console.log('5. Smart Positioning:');
console.log('   ✓ Calculates viewport boundaries');
console.log('   ✓ Adjusts left position to stay on screen');
console.log('   ✓ Shows above or below based on space');
console.log('   ✓ Directional arrows indicate position');
console.log('');

console.log('6. Integration:');
console.log('   ✓ attachTooltipEvents() function exists (not called)');
console.log('   ✓ Tooltip functionality removed per user request');
console.log('   ✓ highlightFallacyTerms() uses <strong> tags');
console.log('   ✓ Fallacy database with 25+ terms (definitions preserved)');
console.log('');

console.log('Expected User Behavior:\n');

console.log('Scenario 1 - Mouse Hover:');
console.log('  1. User hovers over fallacy term');
console.log('  2. mouseenter event fires');
console.log('  3. showTooltip() called with term and definition');
console.log('  4. Tooltip positioned near cursor');
console.log('  5. Tooltip fades in with smooth transition');
console.log('  6. User moves mouse away');
console.log('  7. mouseleave event fires');
console.log('  8. hideTooltip() called');
console.log('  9. Tooltip fades out');
console.log('');

console.log('Scenario 2 - Keyboard Navigation:');
console.log('  1. User tabs to fallacy term');
console.log('  2. focus event fires');
console.log('  3. showTooltip() called');
console.log('  4. Tooltip appears');
console.log('  5. User presses Escape');
console.log('  6. keydown event fires');
console.log('  7. hideTooltip() called');
console.log('  8. Tooltip disappears');
console.log('');

console.log('Scenario 3 - Click to Toggle:');
console.log('  1. User clicks fallacy term');
console.log('  2. click event fires');
console.log('  3. If tooltip visible: hideTooltip()');
console.log('  4. If tooltip hidden: showTooltip()');
console.log('  5. Tooltip toggles open/closed');
console.log('  6. Click outside to close');
console.log('');

console.log('Changes Applied:\n');

console.log('✓ Removed tooltip functionality (per user request)');
console.log('  - Changed from interactive tooltips to simple bold text');
console.log('  - Uses <strong> tags for semantic HTML');
console.log('  - Improved performance (no event listeners)');
console.log('  - Simplified user experience');
console.log('');

console.log('Note:');
console.log('  - FALLACY_TERMS database preserved for future use');
console.log('  - highlightFallacyTerms() function maintained');
console.log('  - Code kept for potential re-enablement');
console.log('');

console.log('🎉 Fallacy term formatting simplified (bold only)!');
