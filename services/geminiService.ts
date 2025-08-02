import { GoogleGenAI, Chat } from '@google/genai';
import { SYSTEM_PROMPT } from '../constants';

// Check if the VITE_GEMINI_API_KEY is available in the Vite env
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("VITE_GEMINI_API_KEY environment variable not set. Please set it in your .env file.");
}

// Initialize the Gemini client with the API key
const ai = new GoogleGenAI({ apiKey });

export function createChatSession(): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_PROMPT,
    },
  });
  return chat;
}
