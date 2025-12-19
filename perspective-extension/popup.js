document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('visual-spectrum-placeholder');
  const settingsLink = document.getElementById('settings-link');
  const usageInfo = document.getElementById('usage-info');

  placeholder.innerHTML = 'Analyzing page<span class="ellipsis"></span>'; // Initial loading message
  placeholder.classList.add('loading');

  // Load usage information
  loadUsageInfo();

  // Settings link click handler
  settingsLink.addEventListener('click', (e) => {
    e.preventDefault();
    // Open settings as popup window
    const settingsUrl = chrome.runtime.getURL('settings-popup.html');
    window.open(settingsUrl, 'Perspective Settings', 'width=450,height=700,scrollbars=yes,resizable=yes');
  });

  // Function to format the counterarguments response
  function formatCounterarguments(data, isCached = false) {
    // Check if this is a cached result
    if (data.startsWith('[Cached]')) {
      data = data.substring(9).trim();
    }

    // Split the response into lines and filter out empty lines
    const lines = data.split('\n').filter(line => line.trim().length > 0);

    // Create HTML for the list
    let html = '<ul class="counterarguments-list">';

    // Add cached indicator if needed
    if (isCached) {
      html += '<span class="cached-indicator">Cached Result</span>';
    }

    lines.forEach(line => {
      // Clean up the line - remove bullet characters at the start
      const cleanedLine = line.replace(/^[-•*]\s*/, '').trim();

      if (cleanedLine) {
        html += `<li>${cleanedLine}</li>`;
      }
    });

    html += '</ul>';

    // Display the formatted list
    placeholder.innerHTML = html;
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
                  chrome.runtime.sendMessage(
                    { type: 'getCounterarguments', text: article.textContent },
                    (response) => {
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
                            const settingsUrl = chrome.runtime.getURL('settings-popup.html');
                            const formattedMessage = response.data.replace(
                              'Add your own API key for unlimited use:',
                              `<a href="#" onclick="window.open('${settingsUrl}', 'Perspective Settings', 'width=450,height=700,scrollbars=yes,resizable=yes'); return false;" style="color: #d32f2f; text-decoration: underline;">Add your own API key for unlimited use</a>`
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
                    }
                  );
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
        usageInfo.style.color = '#2a7a2a';
      } else {
        usageInfo.textContent = `${usage.count}/10 today`;
        usageInfo.style.color = usage.count >= 8 ? '#d32f2f' : '#666';
      }
    } catch (error) {
      console.error('Error loading usage info:', error);
      usageInfo.textContent = '';
    }
  }
});
