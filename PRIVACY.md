# Privacy Policy for Perspective Chrome Extension

**Effective Date: January 25, 2026 · Last updated: October 6, 2026**

## 1. Data Collection
Perspective does not collect, store, or share any personal data.

**On-device engine (default):** The AI model runs entirely inside your browser. Article text is never sent to any server. On first use, the extension downloads model files (the AI model and its runtime) from Hugging Face and GitHub; after that it can work offline.

**Cloud engine (optional):** If you choose the Cloud engine, the first ~1000 characters of the article text are sent to Google's Gemini API for analysis (see section 2).

## 2. API Communications (Cloud Engine)
When the Cloud engine is selected, the first ~1000 characters of the article text are sent to Google's Gemini API for analysis. This requires your own API key, which is stored securely in Chrome's local storage and never transmitted except to Google's servers. If you never select the Cloud engine, no article text ever leaves your browser.

## 3. Local Storage
Perspective uses Chrome's storage API to save:
- Your Gemini API key (stored securely by Chrome; only used in Cloud mode)
- Extension settings (engine choice, model choice, theme preferences, feature toggles)
- Cached analysis results (stored locally for 7 days)
- Downloaded on-device model files (cached by the browser; cleared by removing the extension)

## 4. No Tracking
We do not use any analytics, tracking, or third-party services that collect user data.

## 5. Your Rights
You can clear all data at any time by:
- Removing the extension from Chrome
- Clearing Chrome storage for the extension
- Deleting your API key in the extension settings

## 6. Contact
For questions about this privacy policy, please open an issue at:
https://github.com/MuataSr/perspective-browser-extension/issues
