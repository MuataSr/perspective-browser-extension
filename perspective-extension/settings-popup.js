// settings-popup.js

// Default settings
const DEFAULT_SETTINGS = {
  usePersonalKey: false,
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

// DOM elements
let useSharedRadio, usePersonalRadio, personalKeySection;
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
  useSharedRadio = document.getElementById('use-shared');
  usePersonalRadio = document.getElementById('use-personal');
  personalKeySection = document.getElementById('personal-key-section');

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
  // API mode toggle
  useSharedRadio.addEventListener('change', handleApiModeChange);
  usePersonalRadio.addEventListener('change', handleApiModeChange);

  // Test API key
  testKeyBtn.addEventListener('click', testApiKey);

  // Save settings
  saveBtn.addEventListener('click', saveSettings);

  // Reset settings
  resetBtn.addEventListener('click', resetToDefaults);
}

async function loadSettings() {
  const result = await chrome.storage.sync.get(null);

  // API mode
  const usePersonalKey = result.usePersonalKey || DEFAULT_SETTINGS.usePersonalKey;
  if (usePersonalKey) {
    usePersonalRadio.checked = true;
    personalKeySection.style.display = 'block';
  } else {
    useSharedRadio.checked = true;
    personalKeySection.style.display = 'none';
  }

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

function handleApiModeChange() {
  if (usePersonalRadio.checked) {
    personalKeySection.style.display = 'block';
  } else {
    personalKeySection.style.display = 'none';
    keyStatus.style.display = 'none';
  }
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

    // Create fetch promise
    const fetchPromise = fetch('https://routellm.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-V3.2',
        messages: [{ role: 'user', content: 'Test' }],
        max_tokens: 5
      })
    });

    // Race fetch against timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]);

    if (response.ok) {
      showKeyStatus('✓ Connection successful!', 'success');
    } else {
      const error = await response.json();
      showKeyStatus(`✗ Connection failed: ${response.status}`, 'error');
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
  const usePersonalKey = usePersonalRadio.checked;
  const userApiKey = userApiKeyInput.value.trim();

  // Get dark mode selection
  let darkMode = 'auto';
  if (themeDarkRadio.checked) {
    darkMode = 'dark';
  } else if (themeLightRadio.checked) {
    darkMode = 'light';
  }

  // Validate personal key if selected
  if (usePersonalKey && !userApiKey) {
    showKeyStatus('Please enter an API key', 'error');
    return;
  }

  const settings = {
    usePersonalKey: usePersonalKey,
    userApiKey: usePersonalKey ? userApiKey : '',
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
    saveBtn.textContent = 'Save';
    saveBtn.style.background = '#1a1a1a';
    window.close(); // Close popup after saving
  }, 1500);

  // Notify background script
  chrome.runtime.sendMessage({ type: 'settingsUpdated' });
}

async function resetToDefaults() {
  if (!confirm('Reset all settings to defaults?')) {
    return;
  }

  const defaultSettings = { ...DEFAULT_SETTINGS };

  await chrome.storage.sync.clear();
  await chrome.storage.sync.set(defaultSettings);

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

  const usePersonalKey = result.usePersonalKey || DEFAULT_SETTINGS.usePersonalKey;

  let html = '';

  if (usePersonalKey) {
    html = '<p>✓ Using personal API key - <strong>unlimited analyses</strong></p>';
  } else {
    html = `
      <p>Using free tier - <strong>${usage.count}/10 analyses used today</strong></p>
      <p style="font-size: 12px; color: #666; margin-top: 8px;">
        Add your own API key for unlimited use
      </p>
    `;
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
