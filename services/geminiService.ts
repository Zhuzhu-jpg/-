
import { GoogleGenAI, Type } from "@google/genai";
import { FoodItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const modelName = "gemini-2.5-flash";

// Helper interface for the API response structure
interface AIResponse {
  dishName: string;
  items: FoodItem[];
}

const foodAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    dishName: { 
      type: Type.STRING, 
      description: "The overall name of the dish (e.g. 麻辣烫, 豪华午餐, 宫保鸡丁)" 
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Name of the specific ingredient" },
          unit: { type: Type.STRING, description: "Unit (e.g., 克, 个, 块)" },
          quantity: { type: Type.NUMBER, description: "Estimated quantity" },
          calories: { type: Type.NUMBER, description: "Total calories for this ingredient" },
          caloriesPerUnit: { type: Type.NUMBER, description: "Calories per 1 unit" },
          protein: { type: Type.NUMBER, description: "Protein in grams" },
          carbs: { type: Type.NUMBER, description: "Carbs in grams" },
          fat: { type: Type.NUMBER, description: "Fat in grams" },
        },
        required: ["name", "unit", "quantity", "calories", "caloriesPerUnit"],
      },
    }
  },
  required: ["dishName", "items"]
};

export const analyzeFoodImage = async (base64Image: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: base64Image,
            },
          },
          {
            text: "识别图中的食物。如果图中包含多种食物（如麻辣烫、火锅），请提供一个总的菜品名称（dishName），并列出具体的食材明细。请务必使用中文。",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: foodAnalysisSchema,
        temperature: 0.2,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponse;
    }
    return { dishName: "未知食物", items: [] };
  } catch (error) {
    console.error("Gemini Image Analysis Error:", error);
    throw new Error("识别失败，请重试");
  }
};

export const analyzeFoodText = async (textDescription: string): Promise<AIResponse> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            text: `分析这段饮食描述: "${textDescription}". 请提供一个总结性的菜品名称(dishName)和详细的食材列表(items)。请务必使用中文。`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: foodAnalysisSchema,
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AIResponse;
    }
    return { dishName: "未知食物", items: [] };
  } catch (error) {
    console.error("Gemini Text Analysis Error:", error);
    throw new Error("文本分析失败");
  }
};
