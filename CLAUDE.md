# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Perspective** is a Chrome Extension (Manifest V3) that acts as a critical thinking coach. When users are on a web article, they can activate the extension to receive a concise, bulleted list of counterarguments and alternative perspectives related to the content they're reading.

- **Version:** 0.1.0 (Pre-Alpha)
- **Platform:** Chrome Extension (Manifest V3)
- **AI Model:** Uses Gemini API for generating counterarguments
- **Content Extraction:** Mozilla's Readability.js library
- **Current Status:** Simplified architecture pending user testing to resolve hanging bug

## Common Development Tasks

### Loading the Extension for Development

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer mode" (toggle in top-right)
3. Click "Load unpacked"
4. Select the `perspective-extension` directory

### Testing the Extension

1. Load the extension following the steps above
2. Navigate to any article webpage
3. Click the Perspective extension icon in the toolbar
4. The popup will display:
   - "Analyzing page..." (initial)
   - "Article extracted. Finding counterarguments..." (after extraction)
   - AI-generated counterarguments (final result)

### Debugging the Extension

**Critical:** This extension has a known hanging bug. If it freezes at "Finding counterarguments...", check:

- **Background Script Logs:**
  - Go to `chrome://extensions/` → Find Perspective → Click "background page"
  - Look for "Background script is calling the AI model" message
  - Check for errors in console

- **Popup Logs:**
  - Right-click the extension icon → Inspect popup
  - Verify message passing between popup and background

- **Console Errors:**
  - Check both background page and popup console for errors
  - Look for `chrome.runtime.lastError` messages

## Current Architecture

The extension follows a simplified two-component architecture (recently refactored):

### 1. Popup Layer (`popup.html`, `popup.js`, `popup.css`)
**Responsibilities:**
- User interface displayed when extension icon is clicked
- Injects Readability.js into the current web page
- Extracts article content using Readability.js
- Sends extracted text to background script for AI analysis
- Displays AI-generated counterarguments to user

### 2. Background Script (`background.js`)
**Responsibilities:**
- Service worker that handles AI model interactions
- Listens for messages from popup via `chrome.runtime.onMessage`
- Calls `getCounterargumentsFromGemini(text)` to interface with AI model
- Returns AI analysis results back to popup

### 3. Content Extraction (`lib/Readability.js`)
**Purpose:** Mozilla's Readability library for extracting clean article content
**Usage:** Injected into web pages via `chrome.scripting.executeScript`
**Output:** Returns article object with `textContent`, `title`, etc.

## Data Flow

```
User clicks extension icon
    ↓
popup.js injects Readability.js into page
    ↓
popup.js extracts article text using Readability
    ↓
popup.js sends text to background.js via chrome.runtime.sendMessage
    ↓
background.js receives message (type: 'getCounterarguments')
    ↓
background.js calls getCounterargumentsFromGemini(text)
    ↓
background.js calls gemini.ask(prompt)
    ↓
Gemini API responds with counterarguments
    ↓
background.js returns response to popup via sendResponse
    ↓
popup.js displays bulleted list to user
```

## Bug History & Known Issues

### Current Issue: Extension Hanging
**Symptom:** Extension displays "Article extracted. Finding counterarguments..." and freezes
**Status:** Simplified architecture just implemented, pending successful user test

### Attempt 1: Offscreen Document (FAILED)
**Hypothesis:** Background service worker was terminated before AI call completed
**Implementation:**
- Added offscreen.html document to keep AI processing persistent
- Modified data flow: popup → background → offscreen → Gemini
- Added `offscreen` permission to manifest.json

**Result:** Failed. Introduced silent errors in message passing. Race condition suspected. Complexity made debugging difficult.

### Attempt 2: Simplification (CURRENT)
**Hypothesis:** Offscreen Document solution was overly complex and caused the bug
**Implementation:**
- Removed offscreen.html and offscreen.js entirely
- Removed `offscreen` permission from manifest.json
- Moved `gemini.ask(prompt)` call directly into background.js
- Simplified data flow back to popup → background → Gemini

**Result:** Pending user testing. Much cleaner and easier to trace. If successful, confirms that complexity was the root cause.

### Testing Protocol
To verify the fix works:
1. Load extension in Developer mode
2. Navigate to article page
3. Click extension icon
4. Verify:
   - "Analyzing page..." appears
   - "Article extracted. Finding counterarguments..." appears
   - **AI-generated counterarguments appear (not freeze)**
5. Check background console for "Background script is calling the AI model"

## GOAT Mode Development Philosophy

This project follows the **GOAT (Greatest Of All Time) Mode** development principles from `gemini.md`:

### Core Principles
1. **Measure Twice, Cut Once:** Plan thoroughly before writing code
2. **Clear Specifications:** All tasks based on unambiguous specs
3. **Iterative Refinement:** Review output and refine until commercial-grade quality
4. **Pragmatic over Perfect:** Ship working software, simplify when blocked
5. **Quality is Non-Negotiable:** High standards for functionality, code quality, UX, and robustness

### Workflow
1. **UNDERSTAND** - Analyze requirements and existing codebase
2. **PLAN** - Create detailed implementation plan
3. **BUILD** - Implement based on plan
4. **REVIEW** - Test and verify quality
5. **REFINE or SHIP** - Iterate or ship based on quality check

### Quality Standards
- **Functionality:** Works correctly, handles edge cases, fails safely
- **Code Quality:** Follows conventions, DRY, clear names, commented, no debug code
- **User Experience:** Intuitive, responsive, accessible, consistent
- **Robustness:** Handles malformed data, backward compatible

## Key Technical Details

### Permissions Required
- `storage` - For storing user settings (future feature)
- `activeTab` - To access the current tab's content
- `scripting` - To inject Readability.js into web pages

### Manifest V3 Compliance
- Uses service worker (`background.js`) instead of persistent background page
- Follows MV3 security model with web accessible resources properly configured
- **Note:** Previously used `offscreen` permission in failed Attempt 1, now removed

### AI Integration
- Uses `gemini.ask()` function for AI model interaction (provided by interactive environment)
- Prompt structure in `background.js:9-15` formats requests to Gemini
- Response limited to first 4000 characters for performance
- Prompt instructs AI to act as "critical thinking coach" with "helpful, neutral, and educational" tone

### Known Limitations (v0.1.0)
- **Active Bug:** Extension may hang during AI analysis (see Bug History section)
- No error handling for network failures
- No user settings or preferences
- Single AI model (Gemini) - no provider switching
- No fallback for pages where Readability fails
- No handling of very short or very long articles

## File Structure

```
perspective-extension/
├── manifest.json          # Extension configuration (MV3)
├── background.js          # Service worker - AI model interaction
├── popup.html             # Extension UI
├── popup.js               # Popup logic - content extraction & messaging
├── popup.css              # Styles (minimal, centered layout)
└── lib/
    └── Readability.js     # Mozilla's content extraction library (third-party)
```

## Important Implementation Patterns

### Message Passing Pattern
**Popup → Background:**
```javascript
chrome.runtime.sendMessage({ type: 'getCounterarguments', text: articleText }, (response) => {
  if (chrome.runtime.lastError) {
    placeholder.innerText = 'Error: ' + chrome.runtime.lastError.message;
    return;
  }
  if (response && response.data) {
    placeholder.innerText = response.data;
  }
});
```

**Background Listener:**
```javascript
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getCounterarguments') {
    (async () => {
      const counterarguments = await getCounterargumentsFromGemini(request.text);
      sendResponse({ data: counterarguments });
    })();
    return true; // Indicates async response
  }
});
```

### Content Script Injection Pattern
```javascript
// 1. Inject library first
chrome.scripting.executeScript({
  target: { tabId: activeTab.id },
  files: ['lib/Readability.js']
}, () => {
  // 2. Then inject function to extract content
  chrome.scripting.executeScript({
    target: { tabId: activeTab.id },
    function: getReadableArticle
  }, (injectionResults) => {
    // 3. Handle extracted article
  });
});
```

### AI Prompt Structure
Located in `background.js:9-15`:
```
You are a critical thinking coach named "Perspective". Your tone is helpful, neutral, and educational.
Below is an article. Please provide a concise summary of the main counterarguments or alternative
perspectives to the arguments presented in this article. Present them as a bulleted list.
Do not add any preamble or conclusion, only the bulleted list.
```

## Development Notes

- The `gemini.ask()` function is provided by the interactive environment - not standard Chrome extension APIs
- Readability.js is a third-party library (see license header in lib/Readability.js:1-19)
- Current implementation is intentionally minimal - focus is on core functionality before adding features
- No build process required - extension uses vanilla JavaScript and loads directly from filesystem
- Recent refactoring removed complexity (offscreen document) in favor of simplicity
- The hanging bug is the primary blocker - all other functionality works correctly
