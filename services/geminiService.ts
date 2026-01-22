
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, EMERGENCY_KEYWORDS } from "../constants.ts";
import { RiskLevel, GroundingChunk } from "../types.ts";

export class GeminiService {
  /**
   * Generates medical guidance using the Google Gemini API.
   * Includes Google Maps grounding for location-based specialist suggestions.
   */
  async generateMedicalGuidance(
    chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[],
    location?: { latitude: number; longitude: number }
  ) {
    const apiKey = process.env.API_KEY;

    if (!apiKey || apiKey === "undefined" || apiKey.trim() === "") {
      throw new Error("API_KEY_MISSING: The Gemini API key is not configured.");
    }

    const ai = new GoogleGenAI({ apiKey });
    
    try {
      // Use gemini-2.5-flash as it is the current standard for maps grounding
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: chatHistory,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.7,
          tools: [{ googleMaps: {} }],
          toolConfig: location ? {
            retrievalConfig: {
              latLng: {
                latitude: location.latitude,
                longitude: location.longitude
              }
            }
          } : undefined
        },
      });

      if (!response || !response.text) {
        throw new Error("The AI returned an empty response.");
      }

      // Extract grounding chunks for maps
      const groundingUrls: GroundingChunk[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.maps) {
            groundingUrls.push({
              title: chunk.maps.title || "View on Maps",
              uri: chunk.maps.uri
            });
          }
        });
      }

      return {
        text: response.text,
        groundingUrls: groundingUrls.length > 0 ? groundingUrls : undefined
      };
    } catch (error: any) {
      console.error("Gemini API Error:", error);
      throw new Error(`API_ERROR: ${error.message || "Failed to generate guidance"}`);
    }
  }

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
