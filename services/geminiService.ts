
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, EMERGENCY_KEYWORDS } from "../constants.ts";
import { RiskLevel } from "../types.ts";

export class GeminiService {
  /**
   * Generates medical guidance using the Google Gemini API.
   * Uses process.env.API_KEY which must be pre-configured.
   */
  async generateMedicalGuidance(
    chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[]
  ) {
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
      throw new Error("API_KEY_MISSING: The Gemini API key is not configured in your environment. Please add it to your project settings.");
    }

    // Creating a fresh instance to ensure we use the latest injected key
    const ai = new GoogleGenAI({ apiKey });
    
    try {
      // Using gemini-3-flash-preview as the primary task-specific model
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: chatHistory,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
        },
      });

      if (!response || !response.text) {
        throw new Error("The AI returned an empty response. This can happen due to safety filters or connection interruptions.");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini API detailed error:", error);
      
      // Extract specific error messages from the API response
      const errorMessage = error.message || String(error);
      
      if (errorMessage.includes("401") || errorMessage.includes("API key not valid")) {
        throw new Error("INVALID_API_KEY: The provided Gemini API key is invalid. Please check your key at ai.google.dev.");
      }
      
      if (errorMessage.includes("404") || errorMessage.includes("model not found")) {
        throw new Error(`MODEL_NOT_FOUND: The model 'gemini-3-flash-preview' was not found or is not available in your region.`);
      }

      if (errorMessage.includes("429") || errorMessage.includes("quota")) {
        throw new Error("QUOTA_EXCEEDED: You have reached the rate limit for the free Gemini API tier.");
      }
      
      throw new Error(`API_ERROR: ${errorMessage}`);
    }
  }

  /**
   * Analyzes text for emergency keywords and symptom severity locally.
   */
  analyzeRisk(text: string): { level: RiskLevel; confidence: number } {
    const lowerText = text.toLowerCase();
    const matches = EMERGENCY_KEYWORDS.filter(keyword => lowerText.includes(keyword));
    
    if (matches.length > 0) {
      return { level: RiskLevel.HIGH, confidence: 0.95 };
    }
    
    const mediumKeywords = ['fever', 'pain', 'rash', 'vomiting', 'diarrhea', 'cough', 'headache', 'dizzy', 'nausea'];
    const mediumMatches = mediumKeywords.filter(keyword => lowerText.includes(keyword));
    
    if (mediumMatches.length >= 2) {
      return { level: RiskLevel.MEDIUM, confidence: 0.75 };
    }
    
    return { level: RiskLevel.LOW, confidence: 0.85 };
  }
}

export const medicalService = new GeminiService();
