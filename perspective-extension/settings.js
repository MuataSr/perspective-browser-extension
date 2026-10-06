// settings.js

// Default settings
const DEFAULT_SETTINGS = {
  darkMode: 'auto', // 'auto', 'dark', 'light'
  localModel: 'gemma3-1b-it-q4f16_1-MLC',
  settings: {
    logicalFallacies: true,
    sourceCredibility: true,
    biasDetection: true
  },
  usage: {
    date: new Date().toISOString().split('T')[0],
    count: 0
  }
};

// DOM elements
let localModelSelect;
let themeAutoRadio, themeDarkRadio, themeLightRadio;
let logicalFallaciesCheckbox, sourceCredibilityCheckbox, biasDetectionCheckbox;
let saveBtn, resetBtn, usageInfo;

document.addEventListener('DOMContentLoaded', async () => {
  // Initialize DOM elements
  initializeElements();

  // Load current settings
  await loadSettings();

  // Set up event listeners
  setupEventListeners();

  // Load usage info
  await loadUsageInfo();

  // Apply dark mode based on settings
  await applyDarkMode();
});

function initializeElements() {
  localModelSelect = document.getElementById('local-model');

  themeAutoRadio = document.getElementById('theme-auto');
  themeDarkRadio = document.getElementById('theme-dark');
  themeLightRadio = document.getElementById('theme-light');

  logicalFallaciesCheckbox = document.getElementById('logical-fallacies');
  sourceCredibilityCheckbox = document.getElementById('source-credibility');
  biasDetectionCheckbox = document.getElementById('bias-detection');

  saveBtn = document.getElementById('save-settings');
  resetBtn = document.getElementById('reset-settings');
  usageInfo = document.getElementById('usage-info');
}

function setupEventListeners() {

  // Save settings
  saveBtn.addEventListener('click', saveSettings);

  // Reset settings
  resetBtn.addEventListener('click', resetToDefaults);
}

async function loadSettings() {
  const result = await chrome.storage.sync.get(null);

  // On-device model
  localModelSelect.value = result.localModel || DEFAULT_SETTINGS.localModel;

  // Dark mode
  const darkMode = result.darkMode || DEFAULT_SETTINGS.darkMode;
  if (darkMode === 'auto') {
    themeAutoRadio.checked = true;
  } else if (darkMode === 'dark') {
    themeDarkRadio.checked = true;
  } else {
    themeLightRadio.checked = true;
  }

  // Analysis features
  const settings = result.settings || DEFAULT_SETTINGS.settings;
  logicalFallaciesCheckbox.checked = settings.logicalFallacies;
  sourceCredibilityCheckbox.checked = settings.sourceCredibility;
  biasDetectionCheckbox.checked = settings.biasDetection;
}

async function saveSettings() {
  const localModel = localModelSelect.value;

  // Get dark mode selection
  let darkMode = 'auto';
  if (themeDarkRadio.checked) {
    darkMode = 'dark';
  } else if (themeLightRadio.checked) {
    darkMode = 'light';
  }

  const settings = {
    darkMode: darkMode,
    localModel: localModel,
    settings: {
      logicalFallacies: logicalFallaciesCheckbox.checked,
      sourceCredibility: sourceCredibilityCheckbox.checked,
      biasDetection: biasDetectionCheckbox.checked
    }
  };

  await chrome.storage.sync.set(settings);

  // Show confirmation
  saveBtn.textContent = 'Saved!';
  saveBtn.style.background = '#4caf50';
  setTimeout(() => {
    saveBtn.textContent = 'Save Settings';
    saveBtn.style.background = '#1a1a1a';
  }, 2000);

}

async function resetToDefaults() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  await chrome.storage.sync.clear();
  await chrome.storage.sync.set(DEFAULT_SETTINGS);

  // Reload the page
  window.location.reload();
}

async function loadUsageInfo() {
  const result = await chrome.storage.sync.get(['usage', 'localModel']);
  const usage = result.usage || DEFAULT_SETTINGS.usage;

  const today = new Date().toISOString().split('T')[0];

  // Reset count if it's a new day
  if (usage.date !== today) {
    const newUsage = { date: today, count: 0 };
    await chrome.storage.sync.set({ usage: newUsage });
    usage.count = 0;
  }

  let html = '<p>✓ <strong>On-device engine</strong> — private and fully local</p>';

  usageInfo.innerHTML = html;
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

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'usageUpdated') {
    loadUsageInfo();
  }
});
