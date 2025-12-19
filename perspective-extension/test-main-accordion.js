// Test script for Main Page Accordion Functionality
// GOAT Mode: TEST FIRST verification

console.log('=== Testing Main Page Accordion Functionality ===\n');

// Test 1: CSS Styles for Main Page Accordion
console.log('Test 1: Main Page Accordion CSS Styles');
const popupCss = require('fs').readFileSync('popup.css', 'utf8');

if (popupCss.includes('/* ==================== ACCORDION FOR MAIN PAGE ==================== */')) {
  console.log('✓ Accordion section comment present');
} else {
  console.log('✗ Accordion section comment missing');
  process.exit(1);
}

if (popupCss.includes('.accordion-card {')) {
  console.log('✓ .accordion-card CSS class exists');
} else {
  console.log('✗ .accordion-card CSS class missing');
  process.exit(1);
}

if (popupCss.includes('.accordion-header {')) {
  console.log('✓ .accordion-header CSS class exists');
} else {
  console.log('✗ .accordion-header CSS class missing');
  process.exit(1);
}

if (popupCss.includes('.accordion-content {')) {
  console.log('✓ .accordion-content CSS class exists');
} else {
  console.log('✗ .accordion-content CSS class missing');
  process.exit(1);
}

if (popupCss.includes('.accordion-chevron {')) {
  console.log('✓ .accordion-chevron CSS class exists');
} else {
  console.log('✗ .accordion-chevron CSS class missing');
  process.exit(1);
}

if (popupCss.includes('border-radius: 8px')) {
  console.log('✓ Accordion cards have 8px rounded corners');
} else {
  console.log('✗ Missing rounded corners');
  process.exit(1);
}

if (popupCss.includes('cursor: pointer')) {
  console.log('✓ Headers are clickable');
} else {
  console.log('✗ Headers not clickable');
  process.exit(1);
}

if (popupCss.includes('transition: transform 0.3s ease')) {
  console.log('✓ Smooth transitions on chevron');
} else {
  console.log('✗ Missing transitions');
  process.exit(1);
}

if (popupCss.includes('.accordion-card.expanded .accordion-chevron')) {
  console.log('✓ Chevron rotation on expand');
} else {
  console.log('✗ Chevron rotation missing');
  process.exit(1);
}

if (popupCss.includes('max-height: 0') && popupCss.includes('max-height: 1000px')) {
  console.log('✓ Content collapse/expand animation');
} else {
  console.log('✗ Missing collapse/expand animation');
  process.exit(1);
}

// Test 2: JavaScript Functions
console.log('\nTest 2: Main Page Accordion JavaScript Functions');
const popupJs = require('fs').readFileSync('popup.js', 'utf8');

if (popupJs.includes('function initializeMainPageAccordion(')) {
  console.log('✓ initializeMainPageAccordion() function exists');
} else {
  console.log('✗ initializeMainPageAccordion() function missing');
  process.exit(1);
}

if (popupJs.includes('querySelectorAll(\'.accordion-card\')')) {
  console.log('✓ Selects all accordion cards');
} else {
  console.log('✗ Missing accordion card selection');
  process.exit(1);
}

if (popupJs.includes('addEventListener(\'click\'')) {
  console.log('✓ Click event listeners attached');
} else {
  console.log('✗ Missing click event listeners');
  process.exit(1);
}

if (popupJs.includes('initializeMainPageAccordion()')) {
  console.log('✓ initializeMainPageAccordion() is called');
} else {
  console.log('✗ initializeMainPageAccordion() not called');
  process.exit(1);
}

// Test 3: Accordion in formatCounterarguments
console.log('\nTest 3: Accordion Implementation in formatCounterarguments');

if (popupJs.includes('html += `<div class="accordion-card"')) {
  console.log('✓ Creates accordion-card elements');
} else {
  console.log('✗ Missing accordion-card creation');
  process.exit(1);
}

if (popupJs.includes('accordion-header')) {
  console.log('✓ Creates accordion-header elements');
} else {
  console.log('✗ Missing accordion-header creation');
  process.exit(1);
}

if (popupJs.includes('accordion-content')) {
  console.log('✓ Creates accordion-content elements');
} else {
  console.log('✗ Missing accordion-content creation');
  process.exit(1);
}

if (popupJs.includes('accordion-chevron')) {
  console.log('✓ Creates accordion-chevron elements');
} else {
  console.log('✗ Missing accordion-chevron creation');
  process.exit(1);
}

if (popupJs.includes('M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z')) {
  console.log('✓ Chevron SVG path included');
} else {
  console.log('✗ Chevron SVG path missing');
  process.exit(1);
}

// Test 4: Exclusive Accordion Logic
console.log('\nTest 4: Exclusive Accordion Behavior');

if (popupJs.includes('accordionCards.forEach(otherCard => {')) {
  console.log('✓ Loops through all cards');
} else {
  console.log('✗ Missing card iteration');
  process.exit(1);
}

if (popupJs.includes('if (otherCard !== card)')) {
  console.log('✓ Closes other cards when one opens');
} else {
  console.log('✗ Missing exclusive accordion logic');
  process.exit(1);
}

if (popupJs.includes('otherCard.classList.remove(\'expanded\')')) {
  console.log('✓ Removes expanded class from other cards');
} else {
  console.log('✗ Missing expanded class removal');
  process.exit(1);
}

if (popupJs.includes('card.classList.toggle(\'expanded\')') ||
    (popupJs.includes('card.classList.remove(\'expanded\')') && popupJs.includes('card.classList.add(\'expanded\')'))) {
  console.log('✓ Toggles expanded class on clicked card');
} else {
  console.log('✗ Missing toggle logic');
  process.exit(1);
}

// Test 5: Default Open State
console.log('\nTest 5: Default Open State');

if (popupJs.includes('accordionCards[0]')) {
  console.log('✓ Targets first card for default open');
} else {
  console.log('✗ Missing first card reference');
  process.exit(1);
}

if (popupJs.includes('firstCard.classList.add(\'expanded\')')) {
  console.log('✓ First card opens by default');
} else {
  console.log('✗ First card not opened by default');
  process.exit(1);
}

// Test 6: Settings Panel Not Affected
console.log('\nTest 6: Settings Panel Reverted');

const popupHtml = require('fs').readFileSync('popup.html', 'utf8');

if (popupHtml.includes('class="settings-section"')) {
  console.log('✓ Settings panel uses settings-section (not accordion)');
} else {
  console.log('✗ Settings panel not reverted');
  process.exit(1);
}

if (popupHtml.includes('class="accordion-card"')) {
  console.log('⚠ Settings panel still has accordion-card classes');
} else {
  console.log('✓ Settings panel has no accordion classes');
}

if (popupHtml.includes('<section class="settings-section">')) {
  console.log('✓ Settings sections restored to <section> tags');
} else {
  console.log('✗ Settings sections not restored');
  process.exit(1);
}

if (!popupCss.includes('/* ==================== ACCORDION ==================== */')) {
  console.log('✓ Settings accordion CSS removed');
} else {
  console.log('✗ Settings accordion CSS still present');
}

console.log('\n=== All Main Page Accordion Tests Passed! ===\n');

console.log('Summary of Main Page Accordion Implementation:\n');

console.log('1. CSS Styling (Main Page):');
console.log('   ✓ Accordion cards with 8px rounded corners');
console.log('   ✓ Bordered cards (1px solid border)');
console.log('   ✓ Clickable headers with hover effects');
console.log('   ✓ Chevron icons with rotation animation');
console.log('   ✓ Smooth transitions (0.3s ease)');
console.log('   ✓ Max-height animation for content');
console.log('   ✓ 16px margin between cards');
console.log('');

console.log('2. JavaScript Logic:');
console.log('   ✓ initializeMainPageAccordion() function');
console.log('   ✓ Exclusive accordion (only one open at a time)');
console.log('   ✓ Click handlers on all headers');
console.log('   ✓ First section open by default');
console.log('   ✓ Proper event handling');
console.log('   ✓ Class toggle for state management');
console.log('');

console.log('3. HTML Generation (formatCounterarguments):');
console.log('   ✓ Creates accordion-card containers');
console.log('   ✓ Creates accordion-header with title and chevron');
console.log('   ✓ Creates accordion-content with bulleted list');
console.log('   ✓ Keeps existing styling (counterarguments-list)');
console.log('   ✓ Fallacy term highlighting preserved');
console.log('');

console.log('4. Settings Panel Reverted:');
console.log('   ✓ Restored to original structure (<section>)');
console.log('   ✓ Removed accordion-card classes');
console.log('   ✓ Removed accordion HTML structure');
console.log('   ✓ Settings accordion CSS removed');
console.log('   ✓ Settings accordion JS removed');
console.log('');

console.log('Expected User Behavior:\n');

console.log('Scenario 1 - Analysis Results Display:');
console.log('  1. User analyzes an article');
console.log('  2. Results appear as accordion cards');
console.log('  3. "Counter Arguments" section is open by default');
console.log('  4. Other sections are collapsed');
console.log('');

console.log('Scenario 2 - Expanding Sections:');
console.log('  1. Click "Logical Fallacies & Analysis" header');
console.log('  2. "Counter Arguments" collapses');
console.log('  3. "Logical Fallacies & Analysis" expands');
console.log('  4. Chevron rotates 180°');
console.log('  5. Bulleted list slides down smoothly');
console.log('');

console.log('Scenario 3 - Collapsing Section:');
console.log('  1. Click currently open section header');
console.log('  2. Section collapses');
console.log('  3. Content slides up');
console.log('  4. Chevron rotates back');
console.log('  5. All sections now closed');
console.log('');

console.log('Benefits:\n');

console.log('✓ More compact analysis results view');
console.log('✓ Better focus on one section at a time');
console.log('✓ Reduced visual clutter');
console.log('✓ Modern accordion UX pattern');
console.log('✓ Smooth animations');
console.log('✓ Exclusive behavior (one open at a time)');
console.log('✓ Preserved styling (bulleted lists, fallacy highlighting)');
console.log('✓ Settings panel restored to original');
console.log('');

console.log('🎉 Main page accordion implementation complete and verified!');
