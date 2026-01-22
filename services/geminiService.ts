
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, EMERGENCY_KEYWORDS } from "../constants.ts";
import { RiskLevel } from "../types.ts";

export class GeminiService {
  /**
   * Generates medical guidance using the Google Gemini API.
   * Requires process.env.API_KEY to be set in the environment.
   */
  async generateMedicalGuidance(
    chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[]
  ) {
    // Creating a fresh instance for every request as per the guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: chatHistory,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
        },
      });

      // The .text property directly returns the generated string
      if (!response.text) {
        throw new Error("Empty response from AI");
      }

      return response.text;
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      
      // Provide a helpful error message if the API key is missing
      if (error.message?.includes("API_KEY") || !process.env.API_KEY) {
        throw new Error("API Key Missing: Please ensure the API_KEY environment variable is configured to receive actual AI responses.");
      }
      
      throw new Error("The medical assistant is temporarily unavailable. Please try again in a moment.");
    }
  }

  /**
   * Analyzes text for emergency keywords and symptom severity to assign a risk level.
   * This runs locally for instant feedback.
   */
  analyzeRisk(text: string): { level: RiskLevel; confidence: number } {
    const lowerText = text.toLowerCase();
    const matches = EMERGENCY_KEYWORDS.filter(keyword => lowerText.includes(keyword));
    
    if (matches.length > 0) {
      return { level: RiskLevel.HIGH, confidence: 0.95 };
    }
    
    const mediumKeywords = ['fever', 'pain', 'rash', 'vomiting', 'diarrhea', 'cough', 'headache', 'dizzy'];
    const mediumMatches = mediumKeywords.filter(keyword => lowerText.includes(keyword));
    
    if (mediumMatches.length >= 2) {
      return { level: RiskLevel.MEDIUM, confidence: 0.75 };
    }
    
    return { level: RiskLevel.LOW, confidence: 0.85 };
  }
}

export const medicalService = new GeminiService();
