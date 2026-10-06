# Perspective - Critical Thinking Chrome Extension

> A Chrome extension that acts as a critical thinking coach — powered by a small AI model that runs entirely on your device. No API keys, no accounts, no data leaving your browser.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-0.8.0-blue.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)
[![OER](https://img.shields.io/badge/Open-Educational-Resource-red.svg)]()

---

## What is Perspective?

**Perspective** is a Chrome extension that enhances critical thinking by analyzing web articles — with an AI model that runs **entirely on your device**. When you encounter an article online, Perspective can:

- Generate counterarguments and alternative viewpoints
- Detect logical fallacies in the reasoning (ad hominem, strawman, false dilemmas, etc.)
- Assess source credibility and author expertise
- Identify bias and loaded language in the presentation

Everything happens locally: no API key, no account, no server. The model downloads once (~0.8–2 GB depending on which Gemma you pick), then Perspective works offline — your reading never leaves the browser.

Perfect for students, educators, journalists, and anyone who wants to engage more thoughtfully with online content.

---

## Features

### Core Functionality
- **Instant Analysis** - Click the extension icon while reading any article
- **Fully On-Device (beta)** - A small Gemma model runs locally via WebLLM + WebGPU; no API key, no account, no server
- **Works Offline** - After the one-time model download, no network is needed at all
- **Minimalist UI** - Clean, distraction-free design that puts content first
- **Smart Caching** - Automatically caches results for 7 days to speed up repeated analyses

### Analysis Types
- **Counterarguments** - Alternative perspectives and opposing viewpoints
- **Logical Fallacies** - Detection of flawed reasoning patterns
- **Source Credibility** - Assessment of author and publication trustworthiness
- **Bias Detection** - Identification of ideological bias and loaded language

### On-Device Models
| Model | First load | Notes |
|---|---|---|
| **Gemma 3 1B** (default) | ~0.8 GB | Fast, recommended |
| **Gemma 2 2B** | ~2 GB | Higher quality |

Smaller models are fast and fully private, but less detailed than the big cloud AI services — that's the trade for privacy and zero cost.

### User Experience
- **Dark Mode** - Auto-detect system preference or choose manually
- **Customizable** - Analysis feature toggles
- **Private by Default** - Nothing you read ever leaves your browser

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

## Requirements

- Chrome 113+ (or another Chromium browser with WebGPU enabled)
- A one-time model download (~0.8–2 GB), cached by the browser afterwards

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
   - First run: approve the one-time model download (keep the popup open while it loads — usually a few minutes). After that, it runs locally.
   - Later reads are analyzed in seconds, and results are cached for 7 days

---

## Development

### Project Structure
```
perspective-extension/
├── manifest.json              # Extension configuration
├── popup.html                 # Main popup UI
├── popup.js                   # Popup logic + on-device engine (WebLLM)
├── popup.css                  # Popup styling
├── settings.html              # Settings page UI
├── settings.js                # Settings logic
├── settings.css               # Settings styling
└── lib/
    ├── Readability.js         # Mozilla's content extraction
    └── webllm.bundle.js       # WebLLM runtime (@mlc-ai/web-llm 0.2.85, bundled in-repo)
```

### Key Technologies
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (no frameworks)
- **WebLLM / WebGPU** — in-browser model inference (runtime bundled; no remote code)
- **Gemma** — Gemma 3 1B / Gemma 2 2B (MLC builds), downloaded once and cached by the browser
- **Readability.js** — article text extraction
- **chrome.storage API** — settings and the local result cache

### Building from Source
There is no build step: the WebLLM runtime ships in `lib/`. Change any file and reload the extension in `chrome://extensions/`.

### Testing

1. **Load the extension** (see Installation)
2. **Navigate to an article** (news sites, blogs, etc.)
3. **Click the Perspective icon** — approve the one-time download on first use
4. **Check the results** in the popup; repeat visits come from the local cache
5. **Debug if needed:**
   - Popup: Right-click the extension icon → "Inspect popup"
   - WebGPU status: `chrome://gpu`

---

## Architecture

### Data Flow

```
User clicks extension icon
    ↓
popup.js injects Readability.js into page
    ↓
popup.js extracts article text (first ~1400 chars)
    ↓
cache check (by URL + model + settings)
    ↓ (miss)
first run only: one-time download consent → model download (~0.8–2 GB)
    ↓
WebLLM runs Gemma locally on the GPU (WebGPU) — no network
    ↓
result cached in chrome.storage.local (7 days)
    ↓
popup.js parses sections, displays in accordion
```

### Core Components

**1. Popup Layer** (`popup.html`, `popup.js`, `popup.css`)
- User interface with accordion-style results display
- Content extraction via injected Readability.js
- On-device engine: model download consent, progress display, and local inference

**2. Settings Panel** (`settings.html`, `settings.js`, `settings.css`)
- On-device model picker (Gemma 3 1B / Gemma 2 2B)
- Theme selection (auto/dark/light)
- Feature toggles (logical fallacies, source credibility, bias detection)

**3. On-Device Runtime** (`lib/webllm.bundle.js`)
- WebLLM + WebGPU inference, bundled locally
- The model itself is fetched once from Hugging Face and cached by the browser

**4. Content Extraction** (`lib/Readability.js`)
- Mozilla's battle-tested library for extracting clean article text
- Removes ads, navigation, and boilerplate content

---

## Configuration

### Settings Options

**On-device Model**
- **Gemma 3 1B**: Fast, recommended (beta)
- **Gemma 2 2B**: Higher quality (beta)

**Theme**
- **Auto**: Follow system preference
- **Dark**: Always dark mode
- **Light**: Always light mode

**Analysis Features**
- **Logical Fallacies Detection**
- **Source Credibility Check**
- **Bias Detection**

### Environment Variables

None. All configuration is stored locally in Chrome's storage.

---

## Privacy

Perspective collects nothing and sends nothing: all analysis runs locally on your device. The only network activity is the one-time model download. See [PRIVACY.md](PRIVACY.md).

---

## Contributing

We welcome contributions! This is an Open Educational Resource (OER) project.

### How to Contribute

1. **Fork** the repository
2. **Create** a feature branch
3. **Make** your changes (keep the local-only philosophy intact — no servers, no keys)
4. **Submit** a pull request

## License

Released under the MIT License.
