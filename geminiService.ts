
import { GoogleGenAI, Type } from "@google/genai";
import { Task, StudySession, Reminder } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function generateStudyPlan(tasks: Task[]): Promise<{ sessions: StudySession[]; reminders: Reminder[] }> {
  if (tasks.length === 0) return { sessions: [], reminders: [] };

  const prompt = `
    Analizza i seguenti compiti scolastici e genera un piano di studio completo.
    Compiti: ${JSON.stringify(tasks)}

    Per ogni compito, calcola:
    1. Sessioni di Studio: In base alla difficoltà (1-5), assegna da 1 a 5 sessioni di studio (60-120 min), distribuite nei giorni precedenti la scadenza.
    2. Promemoria Intelligenti: Imposta avvisi basati sulla difficoltà.
       - Difficoltà 1-2: 1 giorno prima.
       - Difficoltà 3-4: 3 giorni e 1 giorno prima.
       - Difficoltà 5: 7 giorni, 3 giorni e 1 giorno prima.

    Data Corrente: ${new Date().toISOString().split('T')[0]}
    Lingua: Italiano.

    Ritorna SOLO un oggetto JSON che segua questo schema.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            sessions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  taskId: { type: Type.STRING },
                  date: { type: Type.STRING },
                  startTime: { type: Type.STRING },
                  duration: { type: Type.NUMBER },
                  topic: { type: Type.STRING }
                },
                required: ["id", "taskId", "date", "startTime", "duration", "topic"]
              }
            },
            reminders: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  taskId: { type: Type.STRING },
                  date: { type: Type.STRING },
                  message: { type: Type.STRING }
                },
                required: ["id", "taskId", "date", "message"]
              }
            }
          },
          required: ["sessions", "reminders"]
        }
      }
    });

    return JSON.parse(response.text || '{"sessions":[],"reminders":[]}');
  } catch (error) {
    console.error("Gemini Error:", error);
    return { sessions: [], reminders: [] };
  }
}
