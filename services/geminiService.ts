import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";

// Initialize with a placeholder or empty string to avoid browser errors
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const ai = API_KEY ? new GoogleGenAI({ apiKey: API_KEY }) : null;

const SYSTEM_INSTRUCTION = `You are 'Presently AI', a helpful assistant for the Presently Attendance Management System.
Your goal is to help students and lecturers with attendance related queries.
For students: Explain how to scan QR codes, check analytics, and understand attendance policies (generally).
For lecturers: Help them draft emails to students with low attendance, explain how to create sessions, or analyze attendance trends.
Keep answers concise, professional, and friendly.
Theme: You are part of a 'Yellow and Black' branded modern SaaS platform.`;

export const getAiResponse = async (userMessage: string): Promise<string> => {
  try {
    if (!ai) {
      return "AI assistant is currently unavailable. Please configure the API key.";
    }
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: userMessage,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      }
    });
    
    return response.text || "I'm sorry, I couldn't process that request right now.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "I am currently experiencing connection issues. Please try again later.";
  }
};

export const analyzeTimetableImage = async (base64Image: string): Promise<any[]> => {
  try {
    if (!ai) {
      throw new Error("AI service is currently unavailable. Please configure the API key.");
    }
    // Remove header if present (data:image/png;base64,)
    const cleanBase64 = base64Image.split(',')[1] || base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: cleanBase64
            }
          },
          {
            text: "Analyze this image of a school timetable. Extract the schedule details into a list. For each entry, identify the Course Code, Day of the week (e.g., Monday), Start Time (HH:MM 24h format), End Time (HH:MM 24h format), and Venue. If a venue isn't explicitly stated, use 'TBA'. Ignore empty slots."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              courseCode: { type: Type.STRING },
              day: { type: Type.STRING },
              startTime: { type: Type.STRING },
              endTime: { type: Type.STRING },
              venue: { type: Type.STRING }
            }
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error("Failed to analyze timetable image.");
  }
};
