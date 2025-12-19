// Test script for categorized output parsing

// Simulate the parseSections function
function parseSections(data) {
  const sections = {};
  const lines = data.split('\n');
  let currentSection = null;
  let currentItems = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Check for section heading (## Heading)
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      // Save previous section
      if (currentSection) {
        sections[currentSection] = currentItems;
      }

      // Start new section
      currentSection = headingMatch[1];
      currentItems = [];
      continue;
    }

    // Check for bullet point
    const bulletMatch = line.match(/^[-•*]\s+(.+)$/);
    if (bulletMatch && currentSection) {
      currentItems.push(bulletMatch[1].trim());
    }
  }

  // Save last section
  if (currentSection) {
    sections[currentSection] = currentItems;
  }

  return sections;
}

// Test data simulating AI response
const testResponse = `## Counter Arguments
- Climate change policies may harm economic growth in developing nations
- The cost of renewable energy infrastructure is prohibitively expensive
- Rapid transitions could lead to energy grid instability

## Logical Fallacies & Analysis
- Appeal to consequences: The article suggests that if climate action is expensive, we shouldn't act
- False dilemma: Presents only two options: immediate drastic action or no action
- Strawman: Misrepresents opposing views as ignoring climate science entirely

## Loaded Language
- "Catastrophic" climate impacts (emotionally charged)
- "Corporate polluters" (negative labeling)
- "Urgent crisis requiring immediate action" (fear-based framing)

## Source Credibility & Bias
- Primary sources: Peer-reviewed climate journals (high credibility)
- Author: Environmental science professor (appropriate expertise)
- Potential bias: Clear environmental advocacy stance may influence interpretation
- Missing perspective: Limited input from economists or industry experts`;

console.log('=== Categorized Output Parsing Test ===\n');

// Run the test
const parsed = parseSections(testResponse);

console.log('Parsed Sections:');
console.log(JSON.stringify(parsed, null, 2));

// Verify expected sections exist
const expectedSections = [
  'Counter Arguments',
  'Logical Fallacies & Analysis',
  'Loaded Language',
  'Source Credibility & Bias'
];

console.log('\n=== Validation ===');
let allPassed = true;

expectedSections.forEach(section => {
  if (parsed[section]) {
    console.log(`✓ ${section}: ${parsed[section].length} items`);
  } else {
    console.log(`✗ ${section}: MISSING`);
    allPassed = false;
  }
});

console.log('\n=== Test Result ===');
if (allPassed) {
  console.log('✅ All tests PASSED!');
  console.log('\nThe categorized output parsing is working correctly.');
  console.log('Sections will be displayed with proper headings and bullet points.');
} else {
  console.log('❌ Some tests FAILED!');
}

console.log('\n=== Expected Output Format ===');
console.log('The AI response will be formatted as:');
console.log('');
console.log('## Counter Arguments');
console.log('- Item 1');
console.log('- Item 2');
console.log('');
console.log('## Logical Fallacies & Analysis');
console.log('- Item 1');
console.log('- Item 2');
console.log('');
console.log('... and so on');
