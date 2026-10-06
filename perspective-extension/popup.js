import * as webllm from './lib/webllm.bundle.js';

// ==================== ON-DEVICE (LOCAL) ENGINE ====================

const LOCAL_MODELS = {
  'gemma3-1b-it-q4f16_1-MLC': 'Gemma 3 1B',
  'gemma-2-2b-it-q4f16_1-MLC': 'Gemma 2 2B'
};

const DEFAULT_LOCAL_MODEL = 'gemma3-1b-it-q4f16_1-MLC';

let localEngine = null;      // MLCEngine instance (lives as long as this popup is open)
let localEngineModel = null; // model id currently loaded

function localModelLabel(modelId) {
  return LOCAL_MODELS[modelId] || modelId;
}

// Cache key — MUST match generateCacheKey() in background.js (local branch)
function localCacheKey(url, nestedSettings, modelId) {
  return 'article_cache_' + btoa(url + '|' + JSON.stringify(nestedSettings || {}) + '|local|' + modelId);
}

async function ensureLocalEngine(modelId) {
  if (localEngine && localEngineModel === modelId) {
    return localEngine;
  }
  if (localEngine) {
    try { await localEngine.unload(); } catch (e) { /* ignore */ }
    localEngine = null;
    localEngineModel = null;
  }

  const engine = new webllm.MLCEngine({
    initProgressCallback: (report) => {
      const el = document.getElementById('visual-spectrum-placeholder');
      if (!el) return;
      const pct = Math.round((report.progress || 0) * 100);
      el.innerHTML = `Loading ${localModelLabel(modelId)} — first load downloads the model (up to ~2 GB) and may take a few minutes.<br><strong>${pct}%</strong> — keep this window open.`;
    }
  });
  await engine.reload(modelId);
  localEngine = engine;
  localEngineModel = modelId;
  return engine;
}

function buildLocalPrompt(text) {
  const excerpt = text.substring(0, 1400);
  return `You are "Perspective", a critical thinking coach. Analyze the article excerpt below. Reply using EXACTLY these four headings, in this order, with 2-3 short bullet points under each (each bullet starts with "- "). If a section has nothing to report, write "- None found." No introductions, no conclusions, no other markdown beyond the headings and dashes.

## Counter Arguments
## Logical Fallacies & Analysis
## Loaded Language
## Source Credibility & Bias

Article excerpt:
---
${excerpt}
---

Response:`;
}

async function analyzeLocally(text, modelId, cacheKey) {
  const engine = await ensureLocalEngine(modelId);
  const el = document.getElementById('visual-spectrum-placeholder');
  if (el) el.innerHTML = `Analyzing on-device with ${localModelLabel(modelId)}<span class="ellipsis"></span>`;

  const completion = await engine.chat.completions.create({
    messages: [{ role: 'user', content: buildLocalPrompt(text) }],
    temperature: 0.3,
    max_tokens: 600
  });

  const message = completion && completion.choices && completion.choices[0] && completion.choices[0].message;
  const result = ((message && message.content) || '').trim();
  if (!result) {
    throw new Error('The on-device model returned an empty response. Try again or pick a different model in Settings.');
  }

  try {
    await chrome.storage.local.set({ [cacheKey]: { data: result, timestamp: new Date().toISOString() } });
  } catch (e) {
    console.warn('Could not cache local result:', e);
  }
  return result;
}

document.addEventListener('DOMContentLoaded', async () => {
  const placeholder = document.getElementById('visual-spectrum-placeholder');
  const settingsLink = document.getElementById('settings-link');
  const usageInfo = document.getElementById('usage-info');

  placeholder.innerHTML = 'Analyzing page<span class="ellipsis"></span>'; // Initial loading message
  placeholder.classList.add('loading');

  // Load usage information
  loadUsageInfo();

  // Apply dark mode based on settings
  await applyDarkMode();

  // Settings panel elements
  const settingsPanel = document.getElementById('settings-panel');
  const settingsOverlay = document.getElementById('settings-overlay');
  const closeSettingsBtn = document.getElementById('close-settings-btn');

  // Settings panel state
  let settingsPanelOpen = false;

  // Open settings panel
  function openSettingsPanel() {
    settingsPanel.classList.add('active');
    settingsOverlay.classList.add('active');
    settingsPanel.setAttribute('aria-hidden', 'false');
    settingsPanelOpen = true;

    // Focus management
    setTimeout(() => {
      closeSettingsBtn.focus();
    }, 300);

    // Prevent body scroll
    document.body.style.overflow = 'hidden';
  }

  // Close settings panel
  function closeSettingsPanel() {
    settingsPanel.classList.remove('active');
    settingsOverlay.classList.remove('active');
    settingsPanel.setAttribute('aria-hidden', 'true');
    settingsPanelOpen = false;

    // Restore body scroll
    document.body.style.overflow = '';

    // Return focus to settings link
    settingsLink.focus();
  }

  // Toggle settings panel
  function toggleSettingsPanel() {
    if (settingsPanelOpen) {
      closeSettingsPanel();
    } else {
      openSettingsPanel();
    }
  }

  // Settings link click handler
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    loadSettings(); // Load settings before opening
    toggleSettingsPanel();
  });

  // Close button click handler
  closeSettingsBtn.addEventListener('click', closeSettingsPanel);

  // Overlay click handler
  settingsOverlay.addEventListener('click', closeSettingsPanel);

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && settingsPanelOpen) {
      closeSettingsPanel();
    }
  });

  // Trap focus within settings panel when open
  settingsPanel.addEventListener('keydown', (e) => {
    if (!settingsPanelOpen || e.key !== 'Tab') return;

    const focusableElements = settingsPanel.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      }
    } else {
      if (document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    }
  });

  // Logical Fallacy Terms Database
  const FALLACY_TERMS = {
    'ad hominem': 'Attacking the person making the argument rather than the argument itself.',
    'straw man': 'Misrepresenting someone\'s argument to make it easier to attack or refute.',
    'false dilemma': 'Presenting only two choices when more options exist.',
    'slippery slope': 'Arguing that one event will inevitably lead to a chain of negative events.',
    'circular reasoning': 'Using the conclusion as evidence for the premise of the argument.',
    'appeal to authority': 'Using the opinion of an authority figure as evidence when the authority is not an expert on the subject.',
    'bandwagon fallacy': 'Arguing that something is true or good because many people believe it.',
    'red herring': 'Introducing irrelevant information to distract from the real issue.',
    'hasty generalization': 'Making a broad generalization based on a small sample size.',
    'post hoc ergo propter hoc': 'Assuming that because one event followed another, the first event caused the second.',
    'appeal to emotion': 'Manipulating emotions instead of using valid reasoning.',
    'false equivalence': 'Treating two things as equivalent when they are not.',
    'anecdotal': 'Using personal experience instead of a sound argument.',
    'middle ground': 'Assuming the compromise between two positions is correct.',
    'burden of proof': 'Claiming something is true until proven otherwise.',
    'no true scottsman': 'Dismissing counterexamples by redefining terms to exclude them.',
    'loaded question': 'Asking a question that contains a controversial assumption.',
    'false cause': 'Assuming a causal relationship when none exists.',
    'appeal to tradition': 'Arguing something is correct because it\'s traditionally been done that way.',
    'appeal to probability': 'Assuming something will happen because it might happen.',
    'composition fallacy': 'Assuming what\'s true for parts is true for the whole.',
    'division fallacy': 'Assuming what\'s true for the whole is true for parts.',
    'begging the question': 'Using circular reasoning where the conclusion is assumed in the premise.',
    'false analogy': 'Making a comparison that isn\'t valid or relevant.',
    'tu quoque': 'Avoiding criticism by turning it back on the accuser.'
  };

  // Highlight fallacy terms in text
  function highlightFallacyTerms(text) {
    let highlightedText = text;

    // Sort terms by length (longest first) to avoid partial matches
    const sortedTerms = Object.keys(FALLACY_TERMS).sort((a, b) => b.length - a.length);

    sortedTerms.forEach(term => {
      // Create regex with word boundaries to match whole terms only
      const regex = new RegExp(`\\b${escapeRegExp(term)}\\b`, 'gi');
      highlightedText = highlightedText.replace(regex, (match) => {
        return `<strong>${match}</strong>`;
      });
    });

    return highlightedText;
  }

  // Escape special regex characters
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Show tooltip with fallacy definition
  function showTooltip(element, term, definition) {
    const tooltipContainer = document.getElementById('tooltip-container');
    const tooltipContent = tooltipContainer.querySelector('.tooltip-content');
    const tooltipTitle = tooltipContent.querySelector('.tooltip-title');
    const tooltipText = tooltipContent.querySelector('.tooltip-text');

    // Set tooltip content
    tooltipTitle.textContent = term;
    tooltipText.textContent = definition;

    // Position tooltip
    const rect = element.getBoundingClientRect();
    const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
    const scrollY = window.pageYOffset || document.documentElement.scrollTop;
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Add visible class to show tooltip
    tooltipContainer.classList.add('visible');
    tooltipContent.classList.remove('position-top', 'position-bottom', 'position-left', 'position-right');

    // Get tooltip dimensions after it's visible
    const tooltipRect = tooltipContent.getBoundingClientRect();
    let top = rect.bottom + scrollY + 10;
    let left = rect.left + scrollX + (rect.width / 2) - (tooltipRect.width / 2);

    // Check if tooltip goes off screen and adjust
    if (left < scrollX + 10) {
      left = scrollX + 10;
    } else if (left + tooltipRect.width > scrollX + viewportWidth - 10) {
      left = scrollX + viewportWidth - tooltipRect.width - 10;
    }

    // Check vertical positioning
    if (rect.bottom + tooltipRect.height + 20 > viewportHeight) {
      // Show above
      top = rect.top + scrollY - tooltipRect.height - 10;
      tooltipContent.classList.add('position-top');
    } else {
      // Show below
      tooltipContent.classList.add('position-bottom');
    }

    tooltipContainer.style.top = `${top}px`;
    tooltipContainer.style.left = `${left}px`;
  }

  // Hide tooltip
  function hideTooltip() {
    const tooltipContainer = document.getElementById('tooltip-container');
    tooltipContainer.classList.remove('visible');
    tooltipContainer.style.visibility = 'hidden';
  }

  // Attach tooltip events to fallacy terms
  function attachTooltipEvents() {
    const fallacyTerms = document.querySelectorAll('.fallacy-term');

    fallacyTerms.forEach(term => {
      // Mouse events
      term.addEventListener('mouseenter', (e) => {
        const termText = e.target.textContent.toLowerCase();
        const definition = FALLACY_TERMS[termText];
        if (definition) {
          showTooltip(e.target, e.target.textContent, definition);
        }
      });

      term.addEventListener('mouseleave', () => {
        hideTooltip();
      });

      // Keyboard events
      term.addEventListener('focus', (e) => {
        const termText = e.target.textContent.toLowerCase();
        const definition = FALLACY_TERMS[termText];
        if (definition) {
          showTooltip(e.target, e.target.textContent, definition);
        }
      });

      term.addEventListener('blur', () => {
        hideTooltip();
      });

      term.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
          hideTooltip();
        }
      });

      // Click events
      term.addEventListener('click', (e) => {
        const termText = e.target.textContent.toLowerCase();
        const definition = FALLACY_TERMS[termText];
        if (definition) {
          const tooltipContainer = document.getElementById('tooltip-container');
          if (tooltipContainer.classList.contains('visible')) {
            hideTooltip();
          } else {
            showTooltip(e.target, e.target.textContent, definition);
          }
        }
      });
    });

    // Close tooltip when clicking outside
    document.addEventListener('click', (e) => {
      if (!e.target.classList.contains('fallacy-term')) {
        hideTooltip();
      }
    });

    // Close tooltip on scroll
    document.addEventListener('scroll', () => {
      hideTooltip();
    }, true);
  }

  // ==================== ACCORDION FOR MAIN PAGE ====================

  // Initialize accordion for main analysis page
  function initializeMainPageAccordion() {
    const accordionCards = document.querySelectorAll('.accordion-card');

    accordionCards.forEach(card => {
      const header = card.querySelector('.accordion-header');

      header.addEventListener('click', () => {
        const isExpanded = card.classList.contains('expanded');

        // Close all other accordion cards (exclusive accordion)
        accordionCards.forEach(otherCard => {
          if (otherCard !== card) {
            otherCard.classList.remove('expanded');
          }
        });

        // Toggle current card
        if (isExpanded) {
          card.classList.remove('expanded');
        } else {
          card.classList.add('expanded');
        }
      });
    });

    // Open first accordion card by default
    const firstCard = accordionCards[0];
    if (firstCard) {
      firstCard.classList.add('expanded');
    }
  }

  // Function to format the counterarguments response
  function formatCounterarguments(data, isCached = false) {
    // Check if this is a cached result
    if (data.startsWith('[Cached]')) {
      data = data.substring(9).trim();
    }

    // Parse categorized sections
    const sections = parseSections(data);

    // Create HTML for the categorized output
    let html = '';

    // Render each section
    const sectionOrder = [
      'Counter Arguments',
      'Logical Fallacies & Analysis',
      'Loaded Language',
      'Source Credibility & Bias'
    ];

    sectionOrder.forEach((sectionTitle, index) => {
      if (sections[sectionTitle] && sections[sectionTitle].length > 0) {
        html += `<div class="accordion-card" data-section="${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
          <div class="accordion-header">
            <h3>${sectionTitle}</h3>
            <svg class="accordion-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </div>
          <div class="accordion-content">
            ${isCached && index === 0 ? '<span class="cached-indicator">Cached Result</span>' : ''}
            <ul class="counterarguments-list">
        `;

        sections[sectionTitle].forEach(item => {
          const highlightedItem = highlightFallacyTerms(item);
          html += `<li>${highlightedItem}</li>`;
        });

        html += `</ul></div></div>`;
      }
    });

    // Display the formatted output
    placeholder.innerHTML = html;

    // Initialize accordion for the main page
    initializeMainPageAccordion();

    // Note: Tooltip functionality removed - fallacy terms now use <strong> for bold formatting only
  }

  // Parse sections from AI response
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

  // This function will be injected AFTER Readability.js
  function getReadableArticle() {
    const documentClone = document.cloneNode(true);
    const article = new Readability(documentClone).parse();
    return article;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    if (activeTab && activeTab.id) {
      // 1. Inject Readability.js library
      chrome.scripting.executeScript(
        {
          target: { tabId: activeTab.id },
          files: ['lib/Readability.js'],
        },
        () => {
          if (chrome.runtime.lastError) {
            placeholder.innerText = 'Error: ' + chrome.runtime.lastError.message;
            return;
          }

          // 2. Inject our script to get the article content
          chrome.scripting.executeScript(
            {
              target: { tabId: activeTab.id },
              function: getReadableArticle,
            },
            (injectionResults) => {
              if (injectionResults && injectionResults.length > 0 && injectionResults[0].result) {
                const article = injectionResults[0].result;
                if (article && article.textContent) {
                  runAnalysis(article.textContent, activeTab.url || '');
                } else {
                  placeholder.innerText = 'Readability could not extract article content.';
                }
              } else {
                placeholder.innerText = 'Could not get a result from the content script.';
              }
            }
          );
        }
      );
    } else {
      placeholder.innerText = 'Could not find an active tab.';
    }
  });

  // Run the analysis on the on-device model
  async function runAnalysis(articleText, url) {
    let selected;
    try {
      selected = await chrome.storage.sync.get({
        localModel: DEFAULT_LOCAL_MODEL,
        settings: {
          logicalFallacies: true,
          sourceCredibility: true,
          biasDetection: true
        }
      });
    } catch (e) {
      placeholder.classList.remove('loading');
      placeholder.innerText = 'Error loading settings: ' + e.message;
      return;
    }

    await runLocalAnalysis(articleText, url, selected);
  }

  // On-device engine path: runs here in the popup; after the one-time model
  // download it needs no network at all.
  async function runLocalAnalysis(articleText, url, selected) {
    const modelId = selected.localModel || DEFAULT_LOCAL_MODEL;

    if (!('gpu' in navigator)) {
      placeholder.classList.remove('loading');
      placeholder.innerHTML = '<div class="error-message">Perspective runs its AI on your device and needs WebGPU (Chrome 113 or newer). Please update Chrome to use the extension.</div>';
      return;
    }

    const cacheKey = localCacheKey(url, selected.settings, modelId);

    // Serve a fresh cached result if one exists
    try {
      const cached = await chrome.storage.local.get(cacheKey);
      if (cached[cacheKey]) {
        const ageDays = (Date.now() - new Date(cached[cacheKey].timestamp).getTime()) / (1000 * 60 * 60 * 24);
        if (ageDays < 7) {
          placeholder.classList.remove('loading');
          formatCounterarguments(cached[cacheKey].data, true);
          return;
        }
      }
    } catch (e) {
      console.warn('Cache read failed:', e);
    }

    // One-time consent before the model download. Asked once; after the model
    // is in the browser cache this step never runs again.
    let inCache = false;
    try {
      inCache = await webllm.hasModelInCache(modelId);
    } catch (e) {
      inCache = false;
    }

    if (!inCache) {
      showDownloadConsent(modelId, () => {
        startLocalRun(articleText, modelId, cacheKey);
      });
      return;
    }

    startLocalRun(articleText, modelId, cacheKey);
  }

  // One-time download consent UI (no silent gigabyte)
  function showDownloadConsent(modelId, onProceed) {
    const sizeNote = modelId === 'gemma-2-2b-it-q4f16_1-MLC' ? '~2 GB' : '~0.8 GB';
    placeholder.classList.remove('loading');
    placeholder.innerHTML =
      '<div class="error-message" style="text-align:left;">' +
      '<strong>One-time download needed</strong><br>' +
      localModelLabel(modelId) + ' is a small AI model that runs inside your browser (' + sizeNote + '). It downloads once from Hugging Face, then lives on this machine — after that, Perspective works offline and nothing about what you read ever leaves your device.<br><br>' +
      '<button id="consent-download" class="btn-primary">Download model</button> ' +
      '<button id="consent-cancel" class="btn-secondary">Not now</button>' +
      '</div>';

    const goBtn = document.getElementById('consent-download');
    const cancelBtn = document.getElementById('consent-cancel');
    if (goBtn) goBtn.addEventListener('click', onProceed);
    if (cancelBtn) cancelBtn.addEventListener('click', () => {
      placeholder.innerHTML = 'No problem — nothing was downloaded. Click the icon again when you are ready.';
    });
  }

  async function startLocalRun(articleText, modelId, cacheKey) {
    try {
      placeholder.innerHTML = 'Preparing ' + localModelLabel(modelId) + '<span class="ellipsis"></span>';
      placeholder.classList.add('loading');
      const result = await analyzeLocally(articleText, modelId, cacheKey);
      placeholder.classList.remove('loading');
      formatCounterarguments(result, false);
    } catch (error) {
      console.error('On-device analysis failed:', error);
      placeholder.classList.remove('loading');
      placeholder.innerHTML = '<div class="error-message">On-device analysis failed: ' + error.message + '</div>';
    }
  }

  async function loadUsageInfo() {
    try {
      const result = await chrome.storage.sync.get({
        localModel: DEFAULT_LOCAL_MODEL
      });

      usageInfo.textContent = 'On-device • ' + localModelLabel(result.localModel || DEFAULT_LOCAL_MODEL);
      usageInfo.style.color = 'var(--text-tertiary)';
    } catch (error) {
      console.error('Error loading usage info:', error);
      usageInfo.textContent = '';
    }
  }

  // Apply dark mode based on settings
  async function applyDarkMode() {
    try {
      const result = await chrome.storage.sync.get({
        darkMode: 'auto'
      });

      const darkMode = result.darkMode;
      const body = document.body;

      if (darkMode === 'dark') {
        body.classList.add('dark-mode');
      } else if (darkMode === 'light') {
        body.classList.remove('dark-mode');
      } else {
        // Auto mode - detect system preference
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          body.classList.add('dark-mode');
        } else {
          body.classList.remove('dark-mode');
        }
      }

      // Listen for system preference changes if in auto mode
      if (darkMode === 'auto') {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
          if (e.matches) {
            body.classList.add('dark-mode');
          } else {
            body.classList.remove('dark-mode');
          }
        });
      }
    } catch (error) {
      console.error('Error applying dark mode:', error);
    }
  }

  // Load settings from chrome.storage
  async function loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        darkMode: 'auto',
        localModel: DEFAULT_LOCAL_MODEL,
        settings: {
          logicalFallacies: true,
          sourceCredibility: true,
          biasDetection: true
        }
      });

      // On-device model
      document.getElementById('local-model').value = result.localModel;

      // Theme
      document.querySelector(`input[name="theme-mode"][value="${result.darkMode}"]`).checked = true;

      // Analysis Features
      // Analysis Features (the nested settings object is canonical; fall back to legacy top-level keys)
      const features = result.settings || {};
      document.getElementById('logical-fallacies').checked = features.logicalFallacies !== undefined ? features.logicalFallacies : true;
      document.getElementById('source-credibility').checked = features.sourceCredibility !== undefined ? features.sourceCredibility : true;
      document.getElementById('bias-detection').checked = features.biasDetection !== undefined ? features.biasDetection : true;

      // Load usage info for settings panel
      await loadUsageInfoForSettings();

    } catch (error) {
      console.error('Error loading settings:', error);
    }
  }

  // Load usage information for settings panel
  async function loadUsageInfoForSettings() {
    try {
      const result = await chrome.storage.sync.get({
        localModel: DEFAULT_LOCAL_MODEL,
        usage: {
          date: new Date().toISOString().split('T')[0],
          count: 0
        }
      });

      const settingsUsageCount = document.getElementById('settings-usage-count');
      const localModel = result.localModel || DEFAULT_LOCAL_MODEL;

      settingsUsageCount.textContent = '✓ On-device engine — private, fully local (' + localModelLabel(localModel) + ')';
      settingsUsageCount.style.color = 'var(--text-primary)';
    } catch (error) {
      console.error('Error loading usage info for settings:', error);
    }
  }

  // Save settings to chrome.storage
  async function saveSettings() {
    try {
      const darkMode = document.querySelector('input[name="theme-mode"]:checked').value;
      const localModel = document.getElementById('local-model').value;
      const logicalFallacies = document.getElementById('logical-fallacies').checked;
      const sourceCredibility = document.getElementById('source-credibility').checked;
      const biasDetection = document.getElementById('bias-detection').checked;

      await chrome.storage.sync.set({
        darkMode,
        localModel,
        logicalFallacies,
        sourceCredibility,
        biasDetection,
        settings: {
          logicalFallacies,
          sourceCredibility,
          biasDetection
        }
      });

      console.log('Settings saved successfully');

      // Apply theme immediately
      await applyDarkMode();

      // Show success feedback
      const saveBtn = document.getElementById('save-settings');
      const originalText = saveBtn.textContent;
      saveBtn.textContent = 'Saved!';
      saveBtn.disabled = true;

      // Close settings panel after save
      closeSettingsPanel();

      setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.disabled = false;
      }, 2000);

    } catch (error) {
      console.error('Error saving settings:', error);
    }
  }

  // Reset settings to defaults
  async function resetSettings() {
    try {
      // Reset form inputs
      document.getElementById('local-model').value = DEFAULT_LOCAL_MODEL;
      document.getElementById('theme-auto').checked = true;
      document.getElementById('logical-fallacies').checked = true;
      document.getElementById('source-credibility').checked = true;
      document.getElementById('bias-detection').checked = true;

      // Clear storage
      await chrome.storage.sync.clear();

      // Reload usage info
      await loadUsageInfoForSettings();

      console.log('Settings reset successfully');

    } catch (error) {
      console.error('Error resetting settings:', error);
    }
  }

  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);

  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      resetSettings();
    }
  });

});
