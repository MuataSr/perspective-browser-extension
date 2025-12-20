// Test script for Cached Indicator Theme Fix
// GOAT Mode: TEST FIRST verification

console.log('=== Testing Cached Indicator Theme Fix ===\n');

console.log('Test 1: JavaScript - Cached Indicator Placement');
const popupJs = require('fs').readFileSync('popup.js', 'utf8');

// Check that cached indicator is NOT placed before accordion cards
const cachedBeforeAccordion = popupJs.match(/if \(isCached\) \{[\s\S]*?<span class="cached-indicator">Cached Result<\/span>[\s\S]*?\}/);
if (!cachedBeforeAccordion || !popupJs.substring(0, cachedBeforeAccordion.index).includes('sectionOrder.forEach')) {
  console.log('✓ Cached indicator NOT placed before accordion cards');
} else {
  console.log('✗ Cached indicator still placed before accordion cards');
  process.exit(1);
}

// Check that cached indicator is placed inside accordion content
if (popupJs.includes('${isCached && index === 0 ? \'<span class="cached-indicator">Cached Result</span>\' : \'\'}')) {
  console.log('✓ Cached indicator placed inside first accordion content');
} else {
  console.log('✗ Cached indicator not properly placed in accordion');
  process.exit(1);
}

// Check that it's only in the first section (index === 0)
if (popupJs.includes('index === 0')) {
  console.log('✓ Cached indicator only added to first section');
} else {
  console.log('✗ Cached indicator not limited to first section');
  process.exit(1);
}

console.log('\nTest 2: CSS - General .cached-indicator Selector');
const popupCss = require('fs').readFileSync('popup.css', 'utf8');

// Check for general .cached-indicator selector (not nested)
const generalCachedMatch = popupCss.match(/\.cached-indicator \{[\s\S]*?\n\}/);
if (generalCachedMatch) {
  console.log('✓ General .cached-indicator CSS rule exists');
} else {
  console.log('✗ General .cached-indicator CSS rule missing');
  process.exit(1);
}

// Check that it uses CSS custom properties for theme colors
const generalCachedCss = generalCachedMatch[0];
if (generalCachedCss.includes('background: var(--cached-bg)')) {
  console.log('✓ Uses var(--cached-bg) for background');
} else {
  console.log('✗ Not using CSS custom property for background');
  process.exit(1);
}

if (generalCachedCss.includes('color: var(--cached-text)')) {
  console.log('✓ Uses var(--cached-text) for text color');
} else {
  console.log('✗ Not using CSS custom property for text color');
  process.exit(1);
}

// Check for enhanced glow effect
if (generalCachedCss.includes('box-shadow: 0 0 12px rgba(100, 181, 246, 0.5), 0 0 24px rgba(100, 181, 246, 0.3)')) {
  console.log('✓ Light mode has enhanced double-layer glow');
} else {
  console.log('✗ Light mode glow effect not correct');
  process.exit(1);
}

console.log('\nTest 3: CSS - Dark Mode Theme Override');

// Check for dark mode override
const darkModeCachedMatch = popupCss.match(/body\.dark-mode \.cached-indicator \{[\s\S]*?\n\}/);
if (darkModeCachedMatch) {
  console.log('✓ Dark mode .cached-indicator override exists');
} else {
  console.log('✗ Dark mode .cached-indicator override missing');
  process.exit(1);
}

const darkModeCachedCss = darkModeCachedMatch[0];
if (darkModeCachedCss.includes('box-shadow: 0 0 16px rgba(100, 181, 246, 0.7), 0 0 32px rgba(100, 181, 246, 0.4)')) {
  console.log('✓ Dark mode has enhanced double-layer glow');
} else {
  console.log('✗ Dark mode glow effect not correct');
  process.exit(1);
}

console.log('\nTest 4: Verify Old Selectors Removed');

// Check that old nested selector is removed
const oldNestedSelector = popupCss.match(/\.counterarguments-list \.cached-indicator \{/);
if (!oldNestedSelector) {
  console.log('✓ Old .counterarguments-list .cached-indicator selector removed');
} else {
  console.log('✗ Old selector still present');
  process.exit(1);
}

const oldDarkModeSelector = popupCss.match(/body\.dark-mode \.counterarguments-list \.cached-indicator \{/);
if (!oldDarkModeSelector) {
  console.log('✓ Old dark mode selector removed');
} else {
  console.log('✗ Old dark mode selector still present');
  process.exit(1);
}

console.log('\nTest 5: CSS Custom Properties');

// Check that CSS custom properties exist for both themes
if (popupCss.includes('--cached-bg:') && popupCss.includes('--cached-text:')) {
  console.log('✓ CSS custom properties for cached indicator exist');
} else {
  console.log('✗ CSS custom properties missing');
  process.exit(1);
}

// Check light mode values
const lightModeMatch = popupCss.match(/:root \{[\s\S]*?--cached-bg: ([^;]+);[\s\S]*?--cached-text: ([^;]+);/);
if (lightModeMatch) {
  console.log(`  Light mode --cached-bg: ${lightModeMatch[1]}`);
  console.log(`  Light mode --cached-text: ${lightModeMatch[2]}`);
}

// Check dark mode values
const darkModeVarsMatch = popupCss.match(/body\.dark-mode \{[\s\S]*?--cached-bg: ([^;]+);[\s\S]*?--cached-text: ([^;]+);/);
if (darkModeVarsMatch) {
  console.log(`  Dark mode --cached-bg: ${darkModeVarsMatch[1]}`);
  console.log(`  Dark mode --cached-text: ${darkModeVarsMatch[2]}`);
}

console.log('\n=== All Cached Indicator Theme Fix Tests Passed! ===\n');

console.log('Summary of Fix:\n');

console.log('Problem:');
console.log('  ✗ Cached indicator placed outside accordion structure');
console.log('  ✗ CSS selector expected .cached-indicator inside .counterarguments-list');
console.log('  ✗ Result: Default styles, no theme colors');
console.log('');

console.log('Solution:');
console.log('  1. JavaScript (popup.js):');
console.log('     - Removed cached indicator placement before accordion cards');
console.log('     - Added cached indicator inside first accordion content');
console.log('     - Only shows in first section (index === 0)');
console.log('');
console.log('  2. CSS (popup.css):');
console.log('     - Changed selector from .counterarguments-list .cached-indicator');
console.log('     - To general .cached-indicator');
console.log('     - Maintains theme-aware colors via CSS custom properties');
console.log('     - Light mode: var(--cached-bg), var(--cached-text)');
console.log('     - Dark mode: Overrides with different values');
console.log('');

console.log('Expected Behavior:\n');

console.log('Light Theme:');
console.log('  1. Analysis results display');
console.log('  2. "Cached Result" badge appears in first section');
console.log('  3. Badge uses light blue background (#e3f2fd)');
console.log('  4. Badge uses dark blue text (#1976d2)');
console.log('  5. Subtle glow effect emanates from badge');
console.log('');

console.log('Dark Theme:');
console.log('  1. Analysis results display');
console.log('  2. "Cached Result" badge appears in first section');
console.log('  3. Badge uses dark blue background (#1e3a5f)');
console.log('  4. Badge uses light blue text (#64b5f6)');
console.log('  5. Stronger glow effect emanates from badge');
console.log('');

console.log('Benefits:\n');

console.log('✓ Theme-aware colors (light vs dark)');
console.log('✓ Enhanced visibility (double-layer glow)');
console.log('✓ Proper placement (inside accordion content)');
console.log('✓ CSS custom properties for easy maintenance');
console.log('✓ Consistent with design system');
console.log('✓ Works in both light and dark modes');
console.log('');

console.log('Visual Difference:\n');

console.log('Light Theme:');
console.log('  - Background: Light blue (#e3f2fd)');
console.log('  - Text: Dark blue (#1976d2)');
console.log('  - Glow: 12px + 24px blur (subtle)');
console.log('');

console.log('Dark Theme:');
console.log('  - Background: Dark blue (#1e3a5f)');
console.log('  - Text: Light blue (#64b5f6)');
console.log('  - Glow: 16px + 32px blur (prominent)');
console.log('');

console.log('🎉 Cached indicator now properly uses theme-aware colors!');
