import { GoogleGenAI } from "@google/genai";
import { AssessmentResult } from "../types";

const API_KEY = process.env.API_KEY;

export const generateRiskSummary = async (assessment: AssessmentResult): Promise<string> => {
  if (!API_KEY) {
    return "AI analysis unavailable (API Key missing). Please review the raw risk factors below.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey: API_KEY });
    
    const prompt = `
      You are Magnus Compliance Engine, an expert auditor for nonprofits.
      Analyze the following risk assessment data for ${assessment.organization.name} (EIN: ${assessment.organization.ein}).
      
      Overall Risk Score: ${assessment.overallRiskScore}/100 (Lower is better).
      
      Risk Factors Detected:
      ${assessment.factors.map(f => `- [${f.severity}] ${f.category}: ${f.finding}`).join('\n')}
      
      Provide a concise, professional 3-sentence executive summary explaining the primary compliance concerns and a recommended immediate action. Do not use markdown formatting.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Analysis generated, but no text returned.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "AI analysis failed due to technical issues. Please rely on the data charts provided.";
  }
};