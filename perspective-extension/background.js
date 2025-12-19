// background.js

// Configuration for Abacus AI
const ABACUS_API_CONFIG = {
  endpoint: 'https://routellm.abacus.ai/v1/chat/completions',
  apiKey: 's2_114636cbfb9b4f4194185d452c6b19f8',
  model: 'deepseek-ai/DeepSeek-V3.2',
  timeout: 30000 // 30 second timeout
};

/**
 * Calls the Abacus AI API to get counterarguments.
 * @param {string} text The article text to analyze.
 * @returns {Promise<string>} A promise that resolves to the model's response.
 */
async function getCounterargumentsFromAbacus(text) {
  const prompt = `You are a critical thinking coach named "Perspective". Your tone is helpful, neutral, and educational. Below is an article. Please provide a concise summary of the main counterarguments or alternative perspectives to the arguments presented in this article. Present them as a bulleted list. Do not add any preamble or conclusion, only the bulleted list.

Article:
---
${text.substring(0, 2000)}
---
Counterarguments:`;

  // Check if API key is set
  if (ABACUS_API_CONFIG.apiKey === 'YOUR_API_KEY_HERE') {
    console.error('Background: API key not configured. Please set ABACUS_API_CONFIG.apiKey in background.js');
    return "Error: API key not configured. Please contact the developer.";
  }

  try {
    console.log("Background: Starting Abacus AI API call...");
    console.log("Background: Using model:", ABACUS_API_CONFIG.model);
    console.log("Background: Endpoint:", ABACUS_API_CONFIG.endpoint);

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
        'Authorization': `Bearer ${ABACUS_API_CONFIG.apiKey}`
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    console.log("Background: Response received");
    console.log("Background: Response status:", response.status);
    console.log("Background: Response headers:", JSON.stringify(Object.fromEntries(response.headers.entries())));

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

// Main listener for requests from the popup.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getCounterarguments') {
    console.log('Background: Received request from popup for analysis.');
    console.log('Background: Text length:', request.text?.length || 0, 'characters');

    // Add timeout wrapper to prevent hanging
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => {
        console.log('Background: Extension timeout after 45 seconds');
        reject(new Error('Extension timeout'));
      }, 45000);
    });

    const analysisPromise = getCounterargumentsFromAbacus(request.text);

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

    // Return true to indicate that the response will be sent asynchronously.
    return true;
  }
});

console.log('Perspective background script loaded and listener is active.');
