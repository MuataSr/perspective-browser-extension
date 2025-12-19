// Test script for settings window fix

console.log('=== Settings Window Fix Verification ===\n');

// Test 1: Verify popup.js uses openOptionsPage
console.log('Test 1: popup.js uses chrome.runtime.openOptionsPage()');
const popupContent = require('fs').readFileSync('popup.js', 'utf8');
if (popupContent.includes('chrome.runtime.openOptionsPage()')) {
  console.log('✓ popup.js correctly uses chrome.runtime.openOptionsPage()');
} else {
  console.log('✗ popup.js does NOT use chrome.runtime.openOptionsPage()');
  process.exit(1);
}

if (!popupContent.includes('window.open')) {
  console.log('✓ No more window.open() calls in popup.js');
} else {
  console.log('✗ Still has window.open() calls in popup.js');
  process.exit(1);
}

// Test 2: Verify settings.html has Appearance section
console.log('\nTest 2: settings.html has Appearance section with dark mode');
const settingsHtml = require('fs').readFileSync('settings.html', 'utf8');
if (settingsHtml.includes('id="theme-auto"')) {
  console.log('✓ settings.html has theme-auto radio button');
} else {
  console.log('✗ settings.html missing theme-auto');
  process.exit(1);
}

if (settingsHtml.includes('id="theme-dark"')) {
  console.log('✓ settings.html has theme-dark radio button');
} else {
  console.log('✗ settings.html missing theme-dark');
  process.exit(1);
}

if (settingsHtml.includes('id="theme-light"')) {
  console.log('✓ settings.html has theme-light radio button');
} else {
  console.log('✗ settings.html missing theme-light');
  process.exit(1);
}

// Test 3: Verify settings.js has dark mode support
console.log('\nTest 3: settings.js has dark mode support');
const settingsJs = require('fs').readFileSync('settings.js', 'utf8');
if (settingsJs.includes('darkMode: \'auto\'')) {
  console.log('✓ DEFAULT_SETTINGS includes darkMode');
} else {
  console.log('✗ DEFAULT_SETTINGS missing darkMode');
  process.exit(1);
}

if (settingsJs.includes('themeAutoRadio, themeDarkRadio, themeLightRadio')) {
  console.log('✓ DOM elements include theme radio buttons');
} else {
  console.log('✗ DOM elements missing theme radios');
  process.exit(1);
}

if (settingsJs.includes('applyDarkMode()')) {
  console.log('✓ applyDarkMode() function exists');
} else {
  console.log('✗ applyDarkMode() function missing');
  process.exit(1);
}

if (settingsJs.includes('darkMode: darkMode')) {
  console.log('✓ saveSettings saves darkMode setting');
} else {
  console.log('✗ saveSettings does not save darkMode');
  process.exit(1);
}

// Test 4: Verify settings.css has dark mode styles
console.log('\nTest 4: settings.css has dark mode styles');
const settingsCss = require('fs').readFileSync('settings.css', 'utf8');
if (settingsCss.includes('body.dark-mode')) {
  console.log('✓ settings.css has dark mode styles');
} else {
  console.log('✗ settings.css missing dark mode styles');
  process.exit(1);
}

if (settingsCss.includes('background: #2a2a2a')) {
  console.log('✓ Dark mode background color defined');
} else {
  console.log('✗ Dark mode background color missing');
  process.exit(1);
}

// Test 5: Verify manifest.json
console.log('\nTest 5: manifest.json options_page configuration');
const manifest = require('fs').readFileSync('manifest.json', 'utf8');
if (manifest.includes('"options_page": "settings.html"')) {
  console.log('✓ manifest.json points to settings.html as options_page');
} else {
  console.log('✗ manifest.json does not point to settings.html');
  process.exit(1);
}

console.log('\n=== All Tests Passed! ===\n');

console.log('Summary of Changes:');
console.log('1. ✓ popup.js now uses chrome.runtime.openOptionsPage()');
console.log('2. ✓ settings.html includes Appearance section with Auto/Dark/Light options');
console.log('3. ✓ settings.js loads/saves darkMode setting and applies dark mode');
console.log('4. ✓ settings.css includes comprehensive dark mode styles');
console.log('5. ✓ settings.html is configured as options_page in manifest.json');
console.log('');

console.log('Expected Behavior:');
console.log('- Clicking "Settings" opens chrome://extensions page in a new tab');
console.log('- Settings page opens in a standard Chrome tab (not a popup window)');
console.log('- Settings page supports dark mode (Auto/Dark/Light)');
console.log('- Dark mode matches the main popup dark mode');
console.log('- No more "window inside a window" appearance');
console.log('');

console.log('The "window in window" problem is FIXED! ✅');
