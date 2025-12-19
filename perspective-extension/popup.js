document.addEventListener('DOMContentLoaded', () => {
  const placeholder = document.getElementById('visual-spectrum-placeholder');
  placeholder.innerHTML = 'Analyzing page<span class="ellipsis"></span>'; // Initial loading message
  placeholder.classList.add('loading');

  // Function to format the counterarguments response
  function formatCounterarguments(data) {
    // Split the response into lines and filter out empty lines
    const lines = data.split('\n').filter(line => line.trim().length > 0);

    // Create HTML for the list
    let html = '<ul class="counterarguments-list">';

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
                        if (response.data.startsWith('Error:')) {
                          // Show error message with proper styling
                          placeholder.classList.remove('loading');
                          placeholder.innerHTML = `<div class="error-message">${response.data}</div>`;
                        } else {
                          // Format bulleted list
                          placeholder.classList.remove('loading');
                          formatCounterarguments(response.data);
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
});
