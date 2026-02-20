
import { GoogleGenAI } from "@google/genai";
import { Habit, HabitLog } from "../types";

export const aiService = {
  generateStatusReport: async (habits: Habit[], logs: HabitLog[]) => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      // Define temporal threshold for analysis (30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const threshold = thirtyDaysAgo.toISOString().split('T')[0];

      // Filter and compress logs to optimize context window efficiency
      const history = logs
        .filter(l => l.date >= threshold)
        .map(l => ({
          h: habits.find(h => h.id === l.habitId)?.name,
          a: habits.find(h => h.id === l.habitId)?.archetype,
          d: l.date,
          c: l.completed,
          e: l.energyLevel
        }));
      
      const prompt = `
        Act as a high-performance "Discipline OS" AI coach. 
        Analyze the following 30-day mission logs for potential behavioral bottlenecks and synchronization efficiency.
        
        Current Protocol Configuration: ${habits.map(h => `${h.name} [${h.archetype}]`).join(', ')}
        Historical Execution Data (JSON): ${JSON.stringify(history)}
        
        Task: Provide a "System Status Report" formatted for an elite operator.
        
        Required Sections:
        1. STRATEGIC_OVERVIEW: Summary of overall performance trajectories.
        2. ANOMALY_DETECTION: Identification of specific failure patterns (e.g., "Technical nodes consistently fail after low-energy Physical cycles" or "Weekend synchronization drop detected").
        3. OPTIMIZATION_ADVICE: One high-impact tactical adjustment to improve neural pathway solidification.

        Tone: Futuristic, gritty, tactical, data-driven, high-authority.
        Constraints: Max 100 words. No conversational filler. Return plain text only.
      `;

      // Using gemini-3-pro-preview for advanced pattern recognition and reasoning
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: prompt,
        config: {
          temperature: 0.7,
          thinkingConfig: { thinkingBudget: 2000 }
        }
      });

      return response.text || "SYSTEM_ERROR: ANALYTICS_OFFLINE_AWAITING_REBOOT";
    } catch (error) {
      console.error("AI Analysis failed:", error);
      return "COULD_NOT_ESTABLISH_NEURAL_LINK. PROCEED WITH RAW DISCIPLINE.";
    }
  }
};
