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

    // Add cached indicator if needed
    if (isCached) {
      html += '<span class="cached-indicator">Cached Result</span>';
    }

    // Render each section
    const sectionOrder = [
      'Counter Arguments',
      'Logical Fallacies & Analysis',
      'Loaded Language',
      'Source Credibility & Bias'
    ];

    sectionOrder.forEach(sectionTitle => {
      if (sections[sectionTitle] && sections[sectionTitle].length > 0) {
        html += `<div class="accordion-card" data-section="${sectionTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}">
          <div class="accordion-header">
            <h3>${sectionTitle}</h3>
            <svg class="accordion-chevron" width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
            </svg>
          </div>
          <div class="accordion-content">
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
                  placeholder.innerHTML = 'Article extracted. Finding counterarguments<span class="ellipsis"></span>';
                  placeholder.classList.add('loading');
                  
                  // 3. Send the clean text to the background script for analysis
                  // Wrap sendMessage in a Promise with timeout
                  const messagePromise = new Promise((resolve) => {
                    chrome.runtime.sendMessage(
                      { type: 'getCounterarguments', text: article.textContent },
                      (response) => {
                        if (chrome.runtime.lastError) {
                          resolve({ error: chrome.runtime.lastError.message });
                          return;
                        }
                        resolve(response);
                      }
                    );
                  });

                  // Create timeout promise (50 seconds - background has 45s timeout)
                  const timeoutPromise = new Promise((resolve) => {
                    setTimeout(() => {
                      resolve({ error: 'timeout' });
                    }, 50000);
                  });

                  // Wait for either response or timeout
                  Promise.race([messagePromise, timeoutPromise])
                    .then((response) => {
                      if (response && response.error === 'timeout') {
                        placeholder.classList.remove('loading');
                        placeholder.innerHTML = `<div class="error-message">⚠️ Request timed out. Please try again. If this persists, try again later.</div>`;
                        return;
                      }

                      if (chrome.runtime.lastError) {
                        placeholder.innerText = 'Error: ' + chrome.runtime.lastError.message;
                        return;
                      }
                      if (response && response.data) {
                        // 4. Display the final result with formatting
                        if (response.data.startsWith('Error:') || response.data.startsWith('⚠️')) {
                          // Show error message with proper styling
                          placeholder.classList.remove('loading');

                          // Check if it's a limit reached message
                          if (response.data.includes('Daily Limit Reached')) {
                            const formattedMessage = response.data.replace(
                              'Add your own API key for unlimited use:',
                              `<a href="#" onclick="chrome.runtime.openOptionsPage(); return false;" style="color: var(--error-text); text-decoration: underline;">Add your own API key for unlimited use</a>`
                            );
                            placeholder.innerHTML = `<div class="error-message">${formattedMessage}</div>`;
                          } else {
                            placeholder.innerHTML = `<div class="error-message">${response.data}</div>`;
                          }
                        } else {
                          // Format bulleted list
                          placeholder.classList.remove('loading');

                          // Show cached indicator if result is from cache
                          if (response.fromCache) {
                            formatCounterarguments(response.data, true);
                          } else {
                            formatCounterarguments(response.data, false);
                          }
                        }
                      } else {
                        placeholder.innerText = 'No response from analysis service.';
                      }
                    });
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

  // Load usage information from chrome.storage
  async function loadUsageInfo() {
    try {
      const result = await chrome.storage.sync.get({
        usePersonalKey: false,
        usage: {
          date: new Date().toISOString().split('T')[0],
          count: 0
        }
      });

      const usePersonalKey = result.usePersonalKey;
      const usage = result.usage;
      const today = new Date().toISOString().split('T')[0];

      // Reset count if it's a new day
      if (usage.date !== today) {
        const newUsage = { date: today, count: 0 };
        await chrome.storage.sync.set({ usage: newUsage });
        usage.count = 0;
      }

      if (usePersonalKey) {
        usageInfo.textContent = 'Unlimited';
        usageInfo.style.color = 'var(--text-tertiary)';
      } else {
        usageInfo.textContent = `${usage.count}/10 today`;
        usageInfo.style.color = usage.count >= 8 ? 'var(--error-text)' : 'var(--text-tertiary)';
      }
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
        usePersonalKey: false,
        userApiKey: '',
        darkMode: 'auto',
        logicalFallacies: true,
        sourceCredibility: true,
        biasDetection: true
      });

      // API Mode
      if (result.usePersonalKey) {
        document.getElementById('use-personal').checked = true;
        document.getElementById('personal-key-section').style.display = 'block';
      } else {
        document.getElementById('use-shared').checked = true;
      }

      // API Key
      if (result.userApiKey) {
        document.getElementById('user-api-key').value = result.userApiKey;
      }

      // Theme
      document.querySelector(`input[name="theme-mode"][value="${result.darkMode}"]`).checked = true;

      // Analysis Features
      document.getElementById('logical-fallacies').checked = result.logicalFallacies;
      document.getElementById('source-credibility').checked = result.sourceCredibility;
      document.getElementById('bias-detection').checked = result.biasDetection;

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
        usePersonalKey: false,
        usage: {
          date: new Date().toISOString().split('T')[0],
          count: 0
        }
      });

      const usePersonalKey = result.usePersonalKey;
      const usage = result.usage;
      const today = new Date().toISOString().split('T')[0];

      // Reset count if it's a new day
      if (usage.date !== today) {
        const newUsage = { date: today, count: 0 };
        await chrome.storage.sync.set({ usage: newUsage });
        usage.count = 0;
      }

      const settingsUsageInfo = document.getElementById('settings-usage-info');
      const settingsUsageCount = document.getElementById('settings-usage-count');

      if (usePersonalKey) {
        settingsUsageCount.textContent = '✓ Using personal API key - unlimited analyses';
        settingsUsageCount.style.color = 'var(--text-primary)';
      } else {
        settingsUsageCount.textContent = `Using free tier - ${usage.count}/10 analyses used today`;
        settingsUsageCount.style.color = usage.count >= 8 ? 'var(--error-text)' : 'var(--text-primary)';
      }
    } catch (error) {
      console.error('Error loading usage info for settings:', error);
    }
  }

  // Save settings to chrome.storage
  async function saveSettings() {
    try {
      const usePersonalKey = document.getElementById('use-personal').checked;
      const userApiKey = document.getElementById('user-api-key').value;
      const darkMode = document.querySelector('input[name="theme-mode"]:checked').value;
      const logicalFallacies = document.getElementById('logical-fallacies').checked;
      const sourceCredibility = document.getElementById('source-credibility').checked;
      const biasDetection = document.getElementById('bias-detection').checked;

      await chrome.storage.sync.set({
        usePersonalKey,
        userApiKey,
        darkMode,
        logicalFallacies,
        sourceCredibility,
        biasDetection
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
      document.getElementById('use-shared').checked = true;
      document.getElementById('use-personal').checked = false;
      document.getElementById('user-api-key').value = '';
      document.getElementById('personal-key-section').style.display = 'none';
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

  // Test API key
  async function testApiKey() {
    const apiKey = document.getElementById('user-api-key').value;
    const statusDiv = document.getElementById('key-status');
    const testBtn = document.getElementById('test-key-btn');

    if (!apiKey) {
      statusDiv.textContent = 'Please enter an API key';
      statusDiv.className = 'status-message error';
      return;
    }

    testBtn.disabled = true;
    testBtn.textContent = 'Testing...';

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
        statusDiv.textContent = '✓ Connection successful!';
        statusDiv.className = 'status-message success';
      } else {
        statusDiv.textContent = '✗ Invalid API key';
        statusDiv.className = 'status-message error';
      }
    } catch (error) {
      if (error.message === 'timeout') {
        statusDiv.textContent = '✗ Request timed out - please try again';
        statusDiv.className = 'status-message error';
      } else {
        statusDiv.textContent = '✗ Error testing key';
        statusDiv.className = 'status-message error';
      }
    } finally {
      testBtn.disabled = false;
      testBtn.textContent = 'Test';
    }
  }

  // API mode change handler
  document.querySelectorAll('input[name="api-mode"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
      const personalSection = document.getElementById('personal-key-section');
      if (e.target.value === 'personal') {
        personalSection.style.display = 'block';
      } else {
        personalSection.style.display = 'none';
      }
    });
  });

  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);

  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', () => {
    if (confirm('Are you sure you want to reset all settings?')) {
      resetSettings();
    }
  });

  // Test key button
  document.getElementById('test-key-btn').addEventListener('click', testApiKey);
});
