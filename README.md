# Perspective - Critical Thinking Chrome Extension

> A Chrome extension that acts as a critical thinking coach, providing counterarguments, logical fallacy detection, and bias analysis for web articles.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-0.7.0-blue.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)
[![OER](https://img.shields.io/badge/Open-Educational-Resource-red.svg)]()

---

## What is Perspective?

**Perspective** is a Chrome extension designed to enhance critical thinking by providing AI-powered analysis of web articles. It can run a small AI model **entirely on your device** — private, no account, no API key — or optionally use Google Gemini. When you encounter an article online, Perspective can:

- Generate counterarguments and alternative viewpoints
- Detect logical fallacies in the reasoning (ad hominem, strawman, false dilemmas, etc.)
- Assess source credibility and author expertise
- Identify bias and loaded language in the presentation

Perfect for students, educators, journalists, and anyone who wants to engage more thoughtfully with online content.

---

## Features

### Core Functionality
- **Instant Analysis** - Click the extension icon while reading any article
- **Two AI Engines** - On-device (private, no API key, works offline after first load) or Cloud (Google Gemini 2.5 Flash with your own key)
- **On-Device Models** - Gemma 3 1B (recommended), Gemma 2 2B, or Qwen2.5 0.5B running locally via WebGPU
- **Minimalist UI** - Clean, distraction-free design that puts content first
- **Smart Caching** - Automatically caches results for 7 days to speed up repeated analyses

### Analysis Types
- **Counterarguments** - Alternative perspectives and opposing viewpoints
- **Logical Fallacies** - Detection of flawed reasoning patterns
- **Source Credibility** - Assessment of author and publication trustworthiness
- **Bias Detection** - Identification of ideological bias and loaded language

### User Experience
- **Dark Mode** - Auto-detect system preference or choose manually
- **Customizable** - Toggle analysis features on/off
- **Private by Default** - The on-device engine needs no account, no key, and no network after the model is downloaded

---

## Screenshots

### Main Popup - Analysis Results
![Main Popup](perspective-extension/perspectiveui.png)

### Counter Arguments Expanded
![Counter Arguments](perspective-extension/perspectiveui2.png)

### Settings Page
![Settings](perspective-extension/perspectivesettings1.png)

### Settings Page - Dark Mode
![Settings Dark Mode](perspective-extension/perspectivesettings2.png)

---

## Installation

### Load Unpacked (Development)

1. **Download or clone this repository**
   ```bash
   git clone https://github.com/MuataSr/perspective-browser-extension.git
   ```

2. **Open Chrome Extensions**
   - Navigate to `chrome://extensions/`
   - Enable "Developer mode" (toggle in top-right)

3. **Load the Extension**
   - Click "Load unpacked"
   - Select the `perspective-extension` folder
   - The Perspective extension will appear in your toolbar

4. **Start Using**
   - Navigate to any article webpage
   - Click the Perspective icon
   - Wait for analysis (usually a few seconds on a GPU)
   - First run on the On-device engine downloads the model once (~0.4–2 GB depending on model); keep the popup open while it loads — after that it runs locally
   - Prefer cloud? Settings → AI Engine → Cloud, add a Gemini API key, done

---

## AI Engines

| Engine | Model(s) | Needs | Privacy | First load |
|---|---|---|---|---|
| **On-device** (default) | Gemma 3 1B, Gemma 2 2B, Qwen2.5 0.5B | Chrome 113+ with WebGPU | Article text never leaves your browser | One-time model download (~0.4–2 GB) |
| **Cloud** | Gemini 2.5 Flash | Free Google AI Studio API key | Article excerpt is sent to Google | None |

Pick the engine in Settings → AI Engine. The on-device engine runs [WebLLM](https://github.com/mlc-ai/web-llm) locally via WebGPU; browser-cached models are reused on later visits.

## API Key Setup (Cloud Mode only)

The Cloud engine uses **Google Gemini 2.5 Flash**. You need to provide your own API key:

1. Get a free API key from [Google AI Studio](https://aistudio.google.com/apikey)
2. Open Settings → Gemini API Configuration
3. Paste your API key and save
4. Select **Cloud (Gemini)** as the AI Engine

**Note**: API calls are billed by Google based on usage. The Gemini 2.5 Flash model is cost-effective for this use case.

---

## Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of JavaScript, HTML, CSS
- Chrome Extension development experience (helpful but not required)

### Project Structure
```
perspective-extension/
├── manifest.json              # Extension configuration
├── background.js              # Service worker - cloud (Gemini) integration, caching
├── popup.html                 # Main popup UI
├── popup.js                   # Popup logic + on-device engine (WebLLM)
├── popup.css                  # Popup styling
├── settings.html              # Settings page UI
├── settings.js                # Settings logic
├── settings.css               # Settings styling
└── lib/
    ├── Readability.js         # Mozilla's content extraction
    └── webllm.bundle.js       # WebLLM runtime (@mlc-ai/web-llm 0.2.85, bundled)
```

### Key Technologies
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (no frameworks)
- **chrome.storage API** (for settings)
- **Readability.js** (content extraction)
- **WebLLM / WebGPU** (on-device model inference)
- **Google Gemini 2.5 Flash** (optional cloud analysis)

### Building from Source
This extension requires no build process - it's pure HTML, CSS, and JavaScript.

1. Make changes to any file
2. Reload the extension in `chrome://extensions/`
3. Test your changes

### Testing

1. **Load the extension** (see Installation)
2. **Navigate to an article** (news sites, blogs, etc.)
3. **Click the Perspective icon**
4. **Check the results** in the popup
5. **Debug if needed:**
   - Background script: `chrome://extensions/` → Perspective → "service worker"
   - Popup: Right-click extension icon → "Inspect popup"

---

## Architecture

### Data Flow

```
User clicks extension icon
    ↓
popup.js injects Readability.js into page
    ↓
popup.js extracts article text (first ~1000–1400 chars)
    ↓
popup.js checks cache (by URL + engine + settings)
    ↓
    ├─ On-device engine: WebLLM runs the model locally (WebGPU)
    │    → result cached in chrome.storage.local (7 days)
    │
    └─ Cloud engine: sends text to background.js
         → checks cache → calls Gemini API with user's key
         → result cached in chrome.storage.local (7 days)
    ↓
popup.js parses sections, displays in accordion
```

### Core Components

**1. Popup Layer** (`popup.html`, `popup.js`, `popup.css`)
- User interface with accordion-style results display
- Content extraction via injected Readability.js
- On-device engine: loads and runs the WebLLM model, shows download/init progress
- Results rendering and interaction

**2. Background Script** (`background.js`)
- Cloud (Gemini) API integration
- Response caching (7-day expiration, 100-entry limit) shared by both engines
- Prompt building for the cloud engine

**3. Settings Panel** (`settings.html`, `settings.js`, `settings.css`)
- AI engine selection (on-device vs. cloud) + on-device model picker
- API key management (cloud mode)
- Theme selection (auto/dark/light)
- Feature toggles (logical fallacies, source credibility, bias detection)

**4. Content Extraction** (`lib/Readability.js`)
- Mozilla's battle-tested library for extracting clean article text
- Removes ads, navigation, and boilerplate content

---

## Configuration

### Settings Options

**AI Engine**
- **On-device**: Private, no API key, runs locally (WebGPU required)
- **Cloud**: Gemini via your own API key

**API Configuration (Cloud Mode)**
- **API Key**: Your Google Gemini API key (only needed for the cloud engine)

**Theme**
- **Auto**: Follow system preference
- **Dark**: Always dark mode
- **Light**: Always light mode

**Analysis Features**
- **Logical Fallacies Detection**: Flag ad hominem, strawman, false dilemmas, etc.
- **Source Credibility Check**: Assess author expertise, citations, publication
- **Bias Detection**: Identify ideological bias, loaded language

### Environment Variables

No environment variables required. All configuration is stored in Chrome's local storage.

---

## Contributing

We welcome contributions! This is an Open Educational Resource (OER) project.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Contribution Guidelines

- **Follow the existing code style** (vanilla JS, minimal CSS)
- **Keep the minimalist aesthetic** - no flashy gradients or "AI slop"
- **Test thoroughly** before submitting
- **Update README** if you change functionality
- **Focus on accessibility** and user experience

### Areas for Contribution

- Bug fixes
- New analysis features
- UI/UX improvements
- Documentation
- Performance optimization
- Accessibility improvements

### Reporting Bugs

If you find a bug, please open an issue with:

- Browser version
- Extension version
- Steps to reproduce
- Expected behavior
- Actual behavior
- Screenshots if relevant

---

## Known Issues

- **Readability fails** on some websites (custom JavaScript-heavy sites)
- **Cache size limit** - older cached articles are removed when cache exceeds 100 entries

---

## Security

### API Key Security

- API key is stored in Chrome's encrypted storage
- Never transmitted except to the Google Gemini API
- Only accessible to the extension

### Data Privacy

- **No data collection** - All processing happens locally
- **No tracking** - No analytics or user tracking
- **No server** - Everything runs in your browser
- **API calls** - Only article text (first 1000 chars) is sent to Google
- **No storage** - Article content is not stored locally

### Best Practices

1. Review Chrome permissions before installation
2. Check [Google's privacy policy](https://policies.google.com/privacy) for Gemini API
3. Don't analyze sensitive content if privacy is critical

---

## License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Open Educational Resource (OER)

This is designed as an **Open Educational Resource** for:

- Critical thinking education
- Media literacy training
- Digital citizenship
- Philosophy and logic courses

Feel free to use, modify, and distribute for educational purposes!

---

## Acknowledgments

- **Mozilla Readability** - Content extraction library
- **Google** - Gemini API and AI Studio
- **Chrome Extension Team** - Platform and documentation
- **Critical Thinking Community** - Inspiration and feedback

---

## Support

- **Issues**: [GitHub Issues](https://github.com/MuataSr/perspective-browser-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MuataSr/perspective-browser-extension/discussions)

---

## Why Perspective?

In an age of information overload and polarized discourse, **critical thinking skills** are more important than ever. Perspective helps by:

1. **Challenging assumptions** - Forces you to consider alternative viewpoints
2. **Building skepticism** - Teaches you to question and verify
3. **Improving comprehension** - Helps you understand arguments from multiple angles
4. **Enhancing decision-making** - Better information leads to better choices
5. **Fighting misinformation** - Tools to identify bias and flawed reasoning

> "The important thing is not to stop questioning. Curiosity has its own reason for existence." - Albert Einstein

---

**Made using Claude Code + MiniMax M2.1 + Mu2.solutions for better thinking**

[GitHub](https://github.com/MuataSr/perspective-browser-extension) • [Issues](https://github.com/MuataSr/perspective-browser-extension/issues) • [MIT License](LICENSE)
