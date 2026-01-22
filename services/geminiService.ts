
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, EMERGENCY_KEYWORDS } from "../constants.ts";
import { RiskLevel } from "../types.ts";

export class GeminiService {
  /**
   * Generates medical guidance. 
   * Fallback to Mock Response if API key is missing or request fails.
   */
  async generateMedicalGuidance(
    chatHistory: { role: string; parts: { text?: string; inlineData?: any }[] }[]
  ) {
    const apiKey = import.meta.env.VITE_API_KEY;
    const lastUserMessage = chatHistory[chatHistory.length - 1]?.parts[0]?.text || "";

    console.log("API Key present:", !!apiKey);
    console.log("API Key length:", apiKey?.length);

    // If no API Key is provided, use Mock Mode for demonstration
    if (!apiKey || apiKey === "undefined" || apiKey.length < 10) {
      console.warn("Gemini API Key missing. Switching to Demo Mode (Mock Responses).");
      return this.generateMockResponse(lastUserMessage);
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = SYSTEM_PROMPT + "\n\nUser: " + lastUserMessage;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      console.log("Gemini API Success:", text.substring(0, 100) + "...");
      return text;
    } catch (error) {
      console.error("Gemini API Error details:", error);
      console.error("Error message:", error.message);
      console.error("Gemini API Error, falling back to Mock:", error);
      return this.generateMockResponse(lastUserMessage);
    }
  }

  private generateMockResponse(input: string): string {
    const text = input.toLowerCase();
    let condition = "general health query";
    
    if (text.includes("fever")) condition = "Viral Fever or Infection";
    else if (text.includes("headache")) condition = "Tension Headache or Migraine";
    else if (text.includes("stomach") || text.includes("pain")) condition = "Gastrointestinal Distress";
    else if (text.includes("rash") || text.includes("skin")) condition = "Contact Dermatitis";
    else if (text.includes("cough") || text.includes("cold")) condition = "Common Cold or Flu";

    const isEmergency = EMERGENCY_KEYWORDS.some(k => text.includes(k));

    return `[DEMO MODE: Simulated AI Response]

### Possible causes:
- ${condition} (likely based on your description)
- Minor inflammatory response
- Seasonal allergies or fatigue

### Immediate precautions / home care:
- Get plenty of rest and stay hydrated with water and electrolytes.
- Monitor your temperature every 4 hours.
- Avoid heavy meals or strenuous physical activity for the next 24 hours.
- Keep a log of when symptoms worsen or improve.

### When to consult a doctor:
- If symptoms persist for more than 48 hours without improvement.
- If you develop a high fever (above 101°F/38.3°C).
- If you experience unusual levels of lethargy or confusion.

${isEmergency ? `### ⚠️ EMERGENCY WARNING:
Your symptoms suggest a potentially serious condition. PLEASE SEEK IMMEDIATE MEDICAL ATTENTION AT THE NEAREST EMERGENCY ROOM.` : ''}

**Disclaimer:** I am an AI assistant and NOT a doctor. This guidance is for educational purposes only. Always consult a qualified healthcare professional for medical diagnosis.` ;
  }

  /**
   * Analyzes text for emergency keywords and symptom severity to assign a risk level.
   */
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
