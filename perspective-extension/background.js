// background.js

// Configuration for Abacus AI
const ABACUS_API_CONFIG = {
  endpoint: 'https://routellm.abacus.ai/v1/chat/completions',
  sharedApiKey: 's2_114636cbfb9b4f4194185d452c6b19f8',
  model: 'deepseek-ai/DeepSeek-V3.2',
  timeout: 60000, // 60 second timeout
  freeTierLimit: 10, // 10 analyses per day for free tier
  maxInputChars: 1000, // Reduced for faster processing
  maxTokens: 400, // Reduced for faster response
  cacheExpirationDays: 7 // Cache expires after 7 days
};

// Cache configuration
const CACHE_KEY_PREFIX = 'article_cache_';
const CACHE_CLEANUP_THRESHOLD = 100; // Clean up if we have more than 100 cached articles

/**
 * Generate cache key from URL and settings
 */
function generateCacheKey(url, settings) {
  const settingsSignature = JSON.stringify(settings.settings);
  return CACHE_KEY_PREFIX + btoa(url + '|' + settingsSignature);
}

/**
 * Check if cached result exists and is not expired
 */
async function getCachedResult(url, settings) {
  const cacheKey = generateCacheKey(url, settings);

  try {
    const result = await chrome.storage.local.get(cacheKey);

    if (result[cacheKey]) {
      const cached = result[cacheKey];
      const now = new Date();
      const cachedDate = new Date(cached.timestamp);
      const daysDiff = (now - cachedDate) / (1000 * 60 * 60 * 24);

      if (daysDiff < ABACUS_API_CONFIG.cacheExpirationDays) {
        console.log('Background: Using cached result for:', url);
        return {
          found: true,
          data: cached.data,
          fromCache: true
        };
      } else {
        // Cache expired, remove it
        console.log('Background: Cache expired, removing:', cacheKey);
        await chrome.storage.local.remove(cacheKey);
      }
    }
  } catch (error) {
    console.error('Background: Error reading cache:', error);
  }

  return { found: false };
}

/**
 * Store result in cache
 */
async function storeCachedResult(url, settings, data) {
  const cacheKey = generateCacheKey(url, settings);
  const cacheData = {
    data: data,
    timestamp: new Date().toISOString()
  };

  try {
    await chrome.storage.local.set({ [cacheKey]: cacheData });
    console.log('Background: Stored result in cache:', cacheKey);

    // Clean up old entries if cache is getting large
    await cleanupCache();
  } catch (error) {
    console.error('Background: Error storing cache:', error);
  }
}

/**
 * Clean up expired and old cache entries
 */
async function cleanupCache() {
  try {
    const allData = await chrome.storage.local.get(null);
    const cacheEntries = Object.keys(allData).filter(key =>
      key.startsWith(CACHE_KEY_PREFIX)
    );

    if (cacheEntries.length > CACHE_CLEANUP_THRESHOLD) {
      console.log(`Background: Cleaning up cache (${cacheEntries.length} entries)`);

      const now = new Date();
      const entriesToKeep = [];
      const expirationMs = ABACUS_API_CONFIG.cacheExpirationDays * 24 * 60 * 60 * 1000;

      // Check each entry
      for (const key of cacheEntries) {
        const cached = allData[key];
        const cachedDate = new Date(cached.timestamp);
        const isExpired = (now - cachedDate) > expirationMs;

        if (!isExpired) {
          entriesToKeep.push({ key, timestamp: cachedDate });
        }
      }

      // Remove expired entries
      const keysToRemove = cacheEntries.filter(key => {
        const cached = allData[key];
        const cachedDate = new Date(cached.timestamp);
        return (now - cachedDate) > expirationMs;
      });

      if (keysToRemove.length > 0) {
        await chrome.storage.local.remove(keysToRemove);
        console.log(`Background: Removed ${keysToRemove.length} expired cache entries`);
      }

      // If still too many, keep only the most recent ones
      if (entriesToKeep.length > CACHE_CLEANUP_THRESHOLD) {
        entriesToKeep.sort((a, b) => b.timestamp - a.timestamp);
        const entriesToDelete = entriesToKeep.slice(CACHE_CLEANUP_THRESHOLD);

        const keysToDelete = entriesToDelete.map(entry => entry.key);
        await chrome.storage.local.remove(keysToDelete);
        console.log(`Background: Removed ${keysToDelete.length} old cache entries (keeping most recent)`);
      }
    }
  } catch (error) {
    console.error('Background: Error during cache cleanup:', error);
  }
}

/**
 * Get current tab URL
 */
async function getCurrentTabUrl() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0]?.url || '';
}

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
  let prompt = `You are a critical thinking coach named "Perspective". Your tone is helpful, neutral, and educational.

Below is an article. Please analyze it and provide your response in the following format with EXACT section headings:

## Counter Arguments
- Main counterarguments or alternative perspectives (bulleted list)

## Logical Fallacies & Analysis
- Identify any logical fallacies present (e.g., ad hominem, strawman, false dilemma, appeal to authority)

## Loaded Language
- Note any loaded language or emotionally charged wording

## Source Credibility & Bias
- Assess the credibility of sources cited and the author's expertise
- Note any potential bias in the presentation

Article:
---
${text.substring(0, ABACUS_API_CONFIG.maxInputChars)}
---

Response:`;

  return prompt;
}

/**
 * Calls the Abacus AI API to get counterarguments.
 * @param {string} text The article text to analyze.
 * @param {Object} settings User settings from chrome.storage
 * @param {string} url The current page URL
 * @returns {Promise<string>} A promise that resolves to the model's response.
 */
async function getCounterargumentsFromAbacus(text, settings, url) {
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
      max_tokens: ABACUS_API_CONFIG.maxTokens,
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

    console.log("Background: Returning counterarguments to popup");
    return result;

  } catch (error) {
    console.error("Background: Error in getCounterargumentsFromAbacus:", error);

    if (error.name === 'AbortError') {
      console.error("Background: Request was aborted (timeout)");
      return "Error: Request timed out after 60 seconds. Please try again.";
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

    // Get settings, URL, and check cache
    (async () => {
      try {
        const [settings, currentUrl] = await Promise.all([
          getSettings(),
          getCurrentTabUrl()
        ]);

        console.log('Background: Loaded settings:', settings);
        console.log('Background: Current URL:', currentUrl);

        // Check cache first
        const cachedResult = await getCachedResult(currentUrl, settings);

        if (cachedResult.found) {
          console.log('Background: Returning cached result');
          sendResponse({ data: cachedResult.data, fromCache: true });
          return;
        }

        console.log('Background: No cached result, checking usage limit...');

        // Check usage limit for non-cached requests
        const usageCheck = await checkUsageLimit(settings);
        if (!usageCheck.allowed) {
          return sendResponse({ data: createLimitReachedMessage(usageCheck.usage) });
        }

        // Add timeout wrapper to prevent hanging
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => {
            console.log('Background: Extension timeout after 45 seconds');
            reject(new Error('Extension timeout'));
          }, 45000);
        });

        const analysisPromise = getCounterargumentsFromAbacus(request.text, settings, currentUrl);

        Promise.race([analysisPromise, timeoutPromise])
          .then(async (counterarguments) => {
            console.log('Background: Promise resolved, sending response back to popup');

            // Increment usage counter (only for shared key and only for new API calls)
            if (!settings.usePersonalKey) {
              await incrementUsage();
              console.log("Background: Incremented usage counter");
            }

            // Store result in cache
            await storeCachedResult(currentUrl, settings, counterarguments);

            sendResponse({ data: counterarguments, fromCache: false });
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
