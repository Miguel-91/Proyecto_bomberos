import OpenAI from 'openai';

const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

/**
 * Initializes the OpenAI client with the API key from environment variables.
 * Returns null when no key is configured so the app still loads without a .env file.
 * @returns {OpenAI|null} Configured OpenAI client instance, or null.
 */
const openai = apiKey
  ? new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true, // Required for client-side usage in React
    })
  : null;

export default openai;
