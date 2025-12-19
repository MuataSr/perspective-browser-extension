// background.js

// Configuration for Abacus AI
const ABACUS_API_CONFIG = {
  endpoint: 'https://routellm.abacus.ai/v1/chat/completions',
  sharedApiKey: 's2_114636cbfb9b4f4194185d452c6b19f8',
  model: 'deepseek-ai/DeepSeek-V3.2',
  timeout: 30000, // 30 second timeout
  freeTierLimit: 10 // 10 analyses per day for free tier
};

/**
 * Get settings from chrome.storage
 */
async function getSettings() {
  const result = await chrome.storage.sync.get({
    usePersonalKey: false,
    userApiKey: '',
    settings: {
      logicalFallacies: true,
      sourceCredibility: true,
      biasDetection: true
    },
    usage: {
      date: new Date().toISOString().split('T')[0],
      count: 0
    }
  });
  return result;
}

/**
 * Check and update usage for free tier
 */
async function checkUsageLimit(settings) {
  const today = new Date().toISOString().split('T')[0];
  let usage = settings.usage || { date: today, count: 0 };

  // Reset counter if it's a new day
  if (usage.date !== today) {
    usage = { date: today, count: 0 };
    await chrome.storage.sync.set({ usage });
  }

  // Check limit only if using shared key
  if (!settings.usePersonalKey && usage.count >= ABACUS_API_CONFIG.freeTierLimit) {
    return {
      allowed: false,
      reason: 'limit_reached',
      usage: usage
    };
  }

  return {
    allowed: true,
    usage: usage
  };
}

/**
 * Increment usage counter
 */
async function incrementUsage() {
  const result = await chrome.storage.sync.get('usage');
  const today = new Date().toISOString().split('T')[0];
  let usage = result.usage || { date: today, count: 0 };

  if (usage.date !== today) {
    usage = { date: today, count: 0 };
  }

  usage.count += 1;
  await chrome.storage.sync.set({ usage });
}

/**
 * Build dynamic prompt based on user settings
 */
function buildPrompt(text, settings) {
  let prompt = `You are a critical thinking coach named "Perspective". Your tone is helpful, neutral, and educational. Below is an article. Please provide a concise summary of the main counterarguments or alternative perspectives to the arguments presented in this article. Present them as a bulleted list. Do not add any preamble or conclusion, only the bulleted list.

Article:
---
${text.substring(0, 2000)}
---
Counterarguments:`;

  // Add additional analysis based on enabled features
  const additions = [];

  if (settings.settings.logicalFallacies) {
    additions.push('Also identify any logical fallacies present in the arguments (e.g., ad hominem, strawman, false dilemma, appeal to authority).');
  }

  if (settings.settings.sourceCredibility) {
    additions.push('Also assess the credibility of sources cited and the author\'s expertise on this topic.');
  }

  if (settings.settings.biasDetection) {
    additions.push('Also note any potential bias in the presentation of information or loaded language.');
  }

  if (additions.length > 0) {
    prompt += '\n\nAdditional Analysis:\n' + additions.join('\n');
  }

  return prompt;
}

/**
 * Calls the Abacus AI API to get counterarguments.
 * @param {string} text The article text to analyze.
 * @param {Object} settings User settings from chrome.storage
 * @returns {Promise<string>} A promise that resolves to the model's response.
 */
async function getCounterargumentsFromAbacus(text, settings) {
  // Check usage limit
  const usageCheck = await checkUsageLimit(settings);
  if (!usageCheck.allowed) {
    return createLimitReachedMessage(usageCheck.usage);
  }

  const prompt = buildPrompt(text, settings);

  // Select API key (personal or shared)
  const apiKey = settings.usePersonalKey ? settings.userApiKey : ABACUS_API_CONFIG.sharedApiKey;

  // Validate API key
  if (!apiKey || apiKey.trim() === '') {
    console.error('Background: No API key available');
    return "Error: API key not configured. Please check your settings.";
  }

  try {
    console.log("Background: Starting Abacus AI API call...");
    console.log("Background: Using model:", ABACUS_API_CONFIG.model);
    console.log("Background: Endpoint:", ABACUS_API_CONFIG.endpoint);
    console.log("Background: API mode:", settings.usePersonalKey ? "Personal" : "Shared");

    // Prepare request body (OpenAI-compatible format)
    const requestBody = {
      model: ABACUS_API_CONFIG.model,
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.5
    };

    console.log("Background: Sending request to Abacus AI...");
    console.log("Background: Request body:", JSON.stringify(requestBody, null, 2));

    // Create abort controller for timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log("Background: Request timeout after 30 seconds");
      controller.abort();
    }, ABACUS_API_CONFIG.timeout);

    // Make API call
    const response = await fetch(ABACUS_API_CONFIG.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log("Background: Response received");
    console.log("Background: Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Background: API Error - Status:', response.status);
      console.error('Background: API Error - Response:', errorText);
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log("Background: Full response data:", JSON.stringify(data, null, 2));

    // Extract response based on OpenAI-compatible format
    const result = data.choices?.[0]?.message?.content || data.response || data.text || 'No response from AI model';

    console.log("Background: Successfully extracted response:", result);

    // Increment usage counter (only for shared key)
    if (!settings.usePersonalKey) {
      await incrementUsage();
      console.log("Background: Incremented usage counter");
    }

    console.log("Background: Returning counterarguments to popup");
    return result;

  } catch (error) {
    console.error("Background: Error in getCounterargumentsFromAbacus:", error);

    if (error.name === 'AbortError') {
      console.error("Background: Request was aborted (timeout)");
      return "Error: Request timed out after 30 seconds. Please try again.";
    }

    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error("Background: Network error:", error.message);
      return "Error: Network error. Please check your internet connection and try again.";
    }

    const errorMessage = error.message || 'Unknown error';
    console.error("Background: Returning error message:", errorMessage);
    return `Error: Failed to get counterarguments. ${errorMessage}`;
  }
}

/**
 * Create limit reached message
 */
function createLimitReachedMessage(usage) {
  const settingsLink = 'chrome-extension://' + chrome.runtime.id + '/settings.html';
  return `⚠️ Daily Limit Reached

You've used ${usage.count}/${ABACUS_API_CONFIG.freeTierLimit} free analyses today.

Add your own API key for unlimited use:
${settingsLink}`;
}

// Main listener for requests from the popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getCounterarguments') {
    console.log('Background: Received request from popup for analysis.');
    console.log('Background: Text length:', request.text?.length || 0, 'characters');

    // Get settings and check usage
    (async () => {
      try {
        const settings = await getSettings();
        console.log('Background: Loaded settings:', settings);

        // Add timeout wrapper to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log('Background: Extension timeout after 45 seconds');
            reject(new Error('Extension timeout'));
          }, 45000);
        });

        const analysisPromise = getCounterargumentsFromAbacus(request.text, settings);

        Promise.race([analysisPromise, timeoutPromise])
          .then(counterarguments => {
            console.log('Background: Promise resolved, sending response back to popup');
            sendResponse({ data: counterarguments });
          })
          .catch(error => {
            console.error('Background: Promise race error:', error);
            sendResponse({
              data: `Error: ${error.message}`
            });
          });
      } catch (error) {
        console.error('Background: Error in message handler:', error);
        sendResponse({
          data: `Error: Failed to load settings. ${error.message}`
        });
      }
    })();

    // Return true to indicate that the response will be sent asynchronously.
    return true;
  }

  if (request.type === 'settingsUpdated') {
    console.log('Background: Settings updated, reloading...');
    // Settings are automatically loaded from chrome.storage when needed
    return true;
  }
});

console.log('Perspective background script loaded and listener is active.');
