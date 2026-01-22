
import { GoogleGenAI } from "@google/genai";
import { SYSTEM_PROMPT, EMERGENCY_KEYWORDS } from "../constants";
import { RiskLevel } from "../types";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }

  async generateMedicalGuidance(
    userMessage: string, 
    chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[] = [],
    imageData?: string // Base64 encoded data
  ) {
    try {
      const parts: any[] = [{ text: userMessage }];
      
      if (imageData) {
        // Handle potential data URL prefix
        const base64Data = imageData.includes('base64,') 
          ? imageData.split('base64,')[1] 
          : imageData;
          
        parts.push({
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data
          }
        });
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          ...chatHistory,
          { role: 'user', parts: parts }
        ],
        config: {
          systemInstruction: SYSTEM_PROMPT + "\nIf an image is provided, carefully analyze visible symptoms (like rashes, swelling, or visible injuries) and include your observations in the 'Possible causes' section while maintaining all safety guidelines and disclaimers.",
          temperature: 0.7,
          topP: 0.95,
        },
      });

      return response.text;
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw new Error("Failed to get medical guidance. Please try again later.");
    }
  }

  analyzeRisk(text: string): { level: RiskLevel; confidence: number } {
    const lowerText = text.toLowerCase();
    const matches = EMERGENCY_KEYWORDS.filter(keyword => lowerText.includes(keyword));
    
    if (matches.length > 0) {
      return { level: RiskLevel.HIGH, confidence: 0.95 };
    }
    
    const mediumKeywords = ['fever', 'pain', 'rash', 'vomiting', 'diarrhea', 'cough', 'headache'];
    const mediumMatches = mediumKeywords.filter(keyword => lowerText.includes(keyword));
    
    if (mediumMatches.length >= 2) {
      return { level: RiskLevel.MEDIUM, confidence: 0.75 };
    }
    
    return { level: RiskLevel.LOW, confidence: 0.85 };
  }
}

export const medicalService = new GeminiService();
