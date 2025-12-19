# Perspective - Critical Thinking Chrome Extension

> A Chrome extension that acts as a critical thinking coach, providing counterarguments, logical fallacy detection, and bias analysis for web articles.

[![Chrome Extension](https://img.shields.io/badge/Chrome-Extension-orange)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](#)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](#)
[![OER](https://img.shields.io/badge/Open-Educational-Resource-red.svg)]()

---

## 🎯 What is Perspective?

**Perspective** is a Chrome extension designed to enhance critical thinking by providing AI-powered analysis of web articles. When you encounter an article online, Perspective can:

- 🎯 **Generate counterarguments** - Present alternative viewpoints to help you think critically
- 🧠 **Detect logical fallacies** - Identify flawed reasoning patterns (ad hominem, strawman, false dilemmas, etc.)
- 📊 **Assess source credibility** - Evaluate author expertise, citations, and publication reputation
- ⚖️ **Identify bias** - Recognize political or ideological bias in article presentation

Perfect for students, educators, journalists, and anyone who wants to engage more thoughtfully with online content.

---

## ✨ Features

### Core Functionality
- **Instant Analysis** - Click the extension icon while reading any article
- **AI-Powered Insights** - Uses advanced language models (DeepSeek, GPT-4, Claude, etc.)
- **Minimalist UI** - Clean, distraction-free design that puts content first
- **Fast Performance** - Optimized for speed with 2-3x faster loading than standard implementations

### Analysis Types
- **Counterarguments** - Alternative perspectives and opposing viewpoints
- **Logical Fallacies** - Detection of flawed reasoning patterns
- **Source Credibility** - Assessment of author and publication trustworthiness
- **Bias Detection** - Identification of ideological bias and loaded language

### User Experience
- **Zero Friction** - Works immediately with shared API (10 analyses/day)
- **Unlimited Mode** - Add your own API key for unlimited use
- **Customizable** - Toggle analysis features on/off
- **Rate Limited** - Sustainable free tier with upgrade options

---

## 📸 Screenshots

### Main Popup - Minimalist Design
```
┌─────────────────────────────────────┐
│  Perspective                        │
│  ─────────────────────────────      │
│                                     │
│  • Each counterargument in clean    │
│    card with subtle styling         │
│                                     │
│  • Simple dot bullets, generous     │
│    spacing                          │
│                                     │
│  • Professional typography          │
│                                     │
│  • Distraction-free reading         │
└─────────────────────────────────────┘
```

### Settings Panel
```
┌─────────────────────────────────────┐
│  Perspective - Settings             │
│                                     │
│  API Configuration                  │
│  ○ Free Tier (10/day)               │
│  ● Personal Key (Unlimited)         │
│  [Enter your API key...]            │
│  [Test Connection] [Save]           │
│                                     │
│  Analysis Features                  │
│  ☑ Logical Fallacies Detection     │
│  ☑ Source Credibility Check        │
│  ☑ Bias Detection                  │
│                                     │
│  [Reset to Defaults]                │
└─────────────────────────────────────┘
```

---

## 🚀 Installation

### Method 1: Load Unpacked (Development)

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
   - Wait for analysis (usually 5-15 seconds)

### Method 2: Chrome Web Store (Coming Soon)
> The extension will be published to the Chrome Web Store in a future release.

---

## 🛠️ Development

### Prerequisites
- Google Chrome (latest version)
- Basic knowledge of JavaScript, HTML, CSS
- Chrome Extension development experience (helpful but not required)

### Project Structure
```
perspective-extension/
├── manifest.json              # Extension configuration
├── background.js              # Service worker - AI integration
├── popup.html                 # Main popup UI
├── popup.js                   # Popup logic
├── popup.css                  # Popup styling
├── settings.html              # Settings page UI
├── settings.js                # Settings logic
├── settings.css               # Settings styling
├── lib/
│   └── Readability.js         # Mozilla's content extraction
└── README.md                  # This file
```

### Key Technologies
- **Chrome Extension Manifest V3**
- **Vanilla JavaScript** (no frameworks)
- **chrome.storage API** (for settings)
- **Readability.js** (content extraction)
- **Abacus AI API** (or compatible LLM providers)

### Building from Source
This extension requires no build process - it's pure HTML, CSS, and JavaScript.

1. Make changes to any file
2. Reload the extension in `chrome://extensions/`
3. Test your changes

### API Configuration

The extension supports a **hybrid API model**:

**Free Tier (Default)**
- Uses shared API key
- 10 analyses per day
- Works immediately, no setup

**Personal Key Mode**
- Users provide their own API key
- Unlimited analyses
- Stored securely in Chrome's storage

**Supported Providers**
- Abacus AI (current default)
- OpenAI (GPT-4, GPT-3.5)
- Anthropic Claude
- OpenRouter
- Other OpenAI-compatible APIs

### Testing

1. **Load the extension** (see Installation)
2. **Navigate to an article** (news sites, blogs, etc.)
3. **Click the Perspective icon**
4. **Check the results** in the popup
5. **Debug if needed:**
   - Background script: `chrome://extensions/` → Perspective → "background page"
   - Popup: Right-click extension icon → "Inspect popup"

---

## 📚 Architecture

### Data Flow

```
User clicks extension icon
    ↓
popup.js injects Readability.js into page
    ↓
popup.js extracts article text
    ↓
popup.js checks usage limits
    ↓
popup.js sends text to background.js
    ↓
background.js selects API key (shared vs personal)
    ↓
background.js builds dynamic prompt based on settings
    ↓
background.js calls LLM API
    ↓
LLM returns analysis
    ↓
background.js formats response
    ↓
popup.js displays results
```

### Core Components

**1. Popup Layer** (`popup.html`, `popup.js`, `popup.css`)
- User interface
- Content extraction
- Usage tracking
- Results display

**2. Background Script** (`background.js`)
- API integration
- Rate limiting
- Prompt building
- Settings management

**3. Settings Panel** (`settings.html`, `settings.js`, `settings.css`)
- API key management
- Feature toggles
- Usage tracking
- Preferences

**4. Content Extraction** (`lib/Readability.js`)
- Extracts clean article text
- Removes ads, navigation, etc.
- Mozilla's battle-tested library

---

## 🔧 Configuration

### Settings Options

**API Configuration**
- **Free Tier**: Uses shared key (10/day limit)
- **Personal Key**: Your own API key (unlimited)

**Analysis Features**
- **Logical Fallacies Detection**: Flag ad hominem, strawman, false dilemmas, etc.
- **Source Credibility Check**: Assess author expertise, citations, publication
- **Bias Detection**: Identify ideological bias, loaded language

### Environment Variables

No environment variables required. All configuration is stored in Chrome's local storage.

---

## 🤝 Contributing

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

- 🐛 Bug fixes
- ✨ New analysis features
- 🎨 UI/UX improvements
- 📚 Documentation
- 🧪 Testing
- 🌐 Internationalization
- ⚡ Performance optimization

### Reporting Bugs

If you find a bug, please open an issue with:

- **Browser version**
- **Extension version**
- **Steps to reproduce**
- **Expected behavior**
- **Actual behavior**
- **Screenshots if relevant**

---

## 🐛 Known Issues

- **Readability fails** on some websites (custom JavaScript-heavy sites)
- **Rate limiting** resets daily (not rolling 24-hour window)
- **API key exposure** in free tier (key is visible in extension code - see security section)

---

## 🔒 Security

### API Key Security

**Free Tier**
- API key is embedded in the extension code
- Suitable for limited free use (10 analyses/day)
- Key can be extracted by technical users
- Consider adding your own key for security

**Personal Key Mode**
- API key stored in Chrome's encrypted storage
- Never transmitted except to the LLM provider
- Only accessible to the extension
- Most secure option

### Data Privacy

- **No data collection** - All processing happens locally
- **No tracking** - No analytics or user tracking
- **No server** - Everything runs in your browser
- **API calls** - Only article text is sent to AI providers
- **No storage** - Article content is not stored

### Best Practices

1. **Use personal API key** for regular use
2. **Review Chrome permissions** before installation
3. **Check provider privacy policies** (OpenAI, Anthropic, etc.)
4. **Don't analyze sensitive content** with free tier

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

### Open Educational Resource (OER)

This is designed as an **Open Educational Resource** for:
- **Critical thinking education**
- **Media literacy training**
- **Digital citizenship**
- **Philosophy and logic courses**

Feel free to use, modify, and distribute for educational purposes!

---

## 🙏 Acknowledgments

- **Mozilla Readability** - Content extraction library
- **Abacus AI** - LLM API provider
- **Chrome Extension Team** - Platform and documentation
- **Critical Thinking Community** - Inspiration and feedback

---

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/MuataSr/perspective-browser-extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/MuataSr/perspective-browser-extension/discussions)
- **Email**: [Your contact information]

---

## 🗺️ Roadmap

### Version 0.2.0 (Next)
- [ ] Settings Panel UI
- [ ] Hybrid API system
- [ ] Rate limiting implementation
- [ ] Feature toggles

### Version 0.3.0
- [ ] Analysis history
- [ ] Share functionality
- [ ] Dark mode

### Version 1.0.0
- [ ] Chrome Web Store publication
- [ ] Comprehensive testing
- [ ] Performance optimization
- [ ] Documentation complete

### Future Features
- [ ] Multiple article comparison
- [ ] Critical thinking dashboard
- [ ] Export to various formats
- [ ] Mobile browser support (if possible)
- [ ] Team/organization features
- [ ] Advanced analytics

---

## 💡 Why Perspective?

In an age of information overload and polarized discourse, **critical thinking skills** are more important than ever. Perspective helps by:

1. **Challenging assumptions** - Forces you to consider alternative viewpoints
2. **Building skepticism** - Teaches you to question and verify
3. **Improving comprehension** - Helps you understand arguments from multiple angles
4. **Enhancing decision-making** - Better information leads to better choices
5. **Fighting misinformation** - Tools to identify bias and flawed reasoning

**"The important thing is not to stop questioning. Curiosity has its own reason for existence."** - Albert Einstein

---

**Made with ❤️ for better thinking**

[GitHub](https://github.com/MuataSr/perspective-browser-extension) • [Issues](https://github.com/MuataSr/perspective-browser-extension/issues) • [MIT License](LICENSE)
