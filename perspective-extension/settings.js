// settings.js

// Default settings
const DEFAULT_SETTINGS = {
  userApiKey: '',
  darkMode: 'auto', // 'auto', 'dark', 'light'
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

// Gemini API configuration
const GEMINI_API_CONFIG = {
  endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-001:generateContent',
  testEndpoint: 'https://generativelanguage.googleapis.com/v1beta/models'
};

// DOM elements
let userApiKeyInput, testKeyBtn, keyStatus;
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
  userApiKeyInput = document.getElementById('user-api-key');
  testKeyBtn = document.getElementById('test-key-btn');
  keyStatus = document.getElementById('key-status');

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
  // Test API key
  testKeyBtn.addEventListener('click', testApiKey);

  // Save settings
  saveBtn.addEventListener('click', saveSettings);

  // Reset settings
  resetBtn.addEventListener('click', resetToDefaults);
}

async function loadSettings() {
  const result = await chrome.storage.sync.get(null);

  // API key
  if (result.userApiKey) {
    userApiKeyInput.value = result.userApiKey;
  }

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

async function testApiKey() {
  const apiKey = userApiKeyInput.value.trim();

  if (!apiKey) {
    showKeyStatus('Please enter an API key', 'error');
    return;
  }

  showKeyStatus('Testing connection...', 'info');
  testKeyBtn.disabled = true;

  try {
    // Create timeout promise (10 seconds)
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        reject(new Error('timeout'));
      }, 10000);
    });

    // Test by making a simple request to list models (lightweight test)
    const fetchPromise = fetch(`${GEMINI_API_CONFIG.testEndpoint}?key=${apiKey}`);

    // Race fetch against timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (response.ok) {
      showKeyStatus('✓ Connection successful! API key is valid.', 'success');
    } else {
      showKeyStatus(`✗ Invalid API key (status: ${response.status})`, 'error');
    }
  } catch (error) {
    if (error.message === 'timeout') {
      showKeyStatus('✗ Request timed out - please try again', 'error');
    } else {
      showKeyStatus(`✗ Error: ${error.message}`, 'error');
    }
  } finally {
    testKeyBtn.disabled = false;
  }
}

function showKeyStatus(message, type) {
  keyStatus.textContent = message;
  keyStatus.className = `status-message ${type}`;
  keyStatus.style.display = 'block';
}

async function saveSettings() {
  const userApiKey = userApiKeyInput.value.trim();

  // Validate that API key is entered
  if (!userApiKey) {
    showKeyStatus('Please enter your Gemini API key', 'error');
    return;
  }

  // Get dark mode selection
  let darkMode = 'auto';
  if (themeDarkRadio.checked) {
    darkMode = 'dark';
  } else if (themeLightRadio.checked) {
    darkMode = 'light';
  }

  const settings = {
    userApiKey: userApiKey,
    darkMode: darkMode,
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

  // Notify background script
  chrome.runtime.sendMessage({ type: 'settingsUpdated' });
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
  const result = await chrome.storage.sync.get('usage');
  const usage = result.usage || DEFAULT_SETTINGS.usage;

  const today = new Date().toISOString().split('T')[0];

  // Reset count if it's a new day
  if (usage.date !== today) {
    const newUsage = { date: today, count: 0 };
    await chrome.storage.sync.set({ usage: newUsage });
    usage.count = 0;
  }

  // Check if user has an API key configured
  const hasApiKey = result.userApiKey && result.userApiKey.trim() !== '';

  let html = '';

  if (hasApiKey) {
    html = '<p>✓ API key configured - <strong>using Gemini</strong></p>';
  } else {
    html = '<p style="color: #d32f2f;">⚠️ No API key configured</p>';
  }

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
