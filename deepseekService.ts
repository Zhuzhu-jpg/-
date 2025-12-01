import { FoodItem } from "../types";

// DeepSeek API配置
const DEEPSEEK_API_KEY = "sk-1f1021e0042642e8a722ca37af1957d7";
// DeepSeek API端点 - 根据DeepSeek官方文档调整
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions";

interface NutritionAnalysis {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  confidence?: number;
}

/**
 * 使用DeepSeek分析食物的营养成分
 */
export async function analyzeNutritionWithDeepSeek(
  foodName: string,
  quantity: number,
  unit: string,
  weight?: number
): Promise<NutritionAnalysis> {
  try {
    // 构建prompt
    const prompt = `请分析以下食物的营养成分（蛋白质、脂肪、碳水化合物和卡路里）：
食物名称：${foodName}
数量：${quantity} ${unit}
${weight ? `重量：${weight}克` : ''}

请根据常见的营养数据，估算每${quantity}${unit}${foodName}的：
1. 卡路里（千卡）
2. 蛋白质含量（克）
3. 碳水化合物含量（克）
4. 脂肪含量（克）

请以JSON格式返回，格式如下：
{
  "calories": 数字,
  "protein": 数字,
  "carbs": 数字,
  "fat": 数字,
  "confidence": 0-1之间的数字（表示估算的置信度）
}

请确保数值合理，基于科学的营养数据。`;

    // 调用DeepSeek API
    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat", // DeepSeek聊天模型
        messages: [
          {
            role: "system",
            content: "你是一个专业的营养师，擅长分析食物的营养成分。请根据科学的营养数据提供准确的估算。只返回JSON格式的数据，不要包含其他文本。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 500,
        response_format: { type: "json_object" } // 请求JSON格式响应
      })
    });

    if (!response.ok) {
      console.error('DeepSeek API响应错误:', response.status, await response.text());
      return getDefaultNutrition(foodName, quantity, unit);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      console.error('DeepSeek返回内容为空');
      return getDefaultNutrition(foodName, quantity, unit);
    }

    // 解析JSON响应
    try {
      const result = JSON.parse(content);
      return validateNutritionResult(result);
    } catch (error) {
      console.error('解析DeepSeek JSON响应失败:', error, content);
      return parseNutritionFromText(content);
    }
  } catch (error) {
    console.error('DeepSeek API调用失败:', error);
    return getDefaultNutrition(foodName, quantity, unit);
  }
}

/**
 * 从文本回复中解析营养成分
 */
function parseNutritionFromText(text: string): NutritionAnalysis {
  // 清理文本，去除markdown代码块
  const cleanText = text.replace(/```json|```/g, '').trim();
  
  // 尝试再次解析JSON
  try {
    const result = JSON.parse(cleanText);
    return validateNutritionResult(result);
  } catch (e) {
    // 如果还是失败，尝试从文本中提取数字
    const extractNumber = (regex: RegExp): number => {
      const match = cleanText.match(regex);
      return match ? parseFloat(match[1]) : 0;
    };

    const calories = extractNumber(/卡路里[：:]?\s*(\d+(?:\.\d+)?)/) ||
                     extractNumber(/(\d+(?:\.\d+)?)\s*千?卡(?:路里)?/) ||
                     extractNumber(/(\d+(?:\.\d+)?)\s*kcal/);

    const protein = extractNumber(/蛋白质[：:]?\s*(\d+(?:\.\d+)?)/) ||
                    extractNumber(/(\d+(?:\.\d+)?)\s*克?\s*蛋白/);

    const carbs = extractNumber(/碳水[：:]?\s*(\d+(?:\.\d+)?)/) ||
                  extractNumber(/碳水化合物[：:]?\s*(\d+(?:\.\d+)?)/);

    const fat = extractNumber(/脂肪[：:]?\s*(\d+(?:\.\d+)?)/);

    return validateNutritionResult({
      calories: calories || 200,
      protein: protein || 10,
      carbs: carbs || 30,
      fat: fat || 5,
      confidence: 0.5
    });
  }
}

/**
 * 验证和修正营养结果
 */
function validateNutritionResult(result: any): NutritionAnalysis {
  const { calories, protein, carbs, fat, confidence = 0.7 } = result;
  
  // 基础验证
  const validated = {
    calories: Math.max(0, Math.min(calories || 200, 2000)),
    protein: Math.max(0, Math.min(protein || 10, 100)),
    carbs: Math.max(0, Math.min(carbs || 30, 300)),
    fat: Math.max(0, Math.min(fat || 5, 100)),
    confidence: Math.max(0, Math.min(confidence, 1))
  };
  
  // 确保总能量大致符合（1g蛋白质=4kcal, 1g碳水=4kcal, 1g脂肪=9kcal）
  const calculatedCalories = (validated.protein * 4) + (validated.carbs * 4) + (validated.fat * 9);
  const discrepancy = Math.abs(calculatedCalories - validated.calories);
  
  // 如果差异太大，调整数值
  if (discrepancy > validated.calories * 0.3) {
    // 按比例调整
    const scale = validated.calories / (calculatedCalories || 1);
    validated.protein *= scale;
    validated.carbs *= scale;
    validated.fat *= scale;
    validated.confidence *= 0.8; // 降低置信度
  }
  
  return validated;
}

/**
 * 获取默认的营养值（作为后备方案）
 */
function getDefaultNutrition(foodName: string, quantity: number, unit: string): NutritionAnalysis {
  const name = foodName.toLowerCase();
  
  // 常见食物的默认值（每份）
  const defaults: Record<string, NutritionAnalysis> = {
    // 主食类
    '米饭': { calories: 200, protein: 4, carbs: 45, fat: 0.5, confidence: 0.3 },
    '面条': { calories: 300, protein: 8, carbs: 60, fat: 2, confidence: 0.3 },
    '面包': { calories: 250, protein: 9, carbs: 49, fat: 3, confidence: 0.3 },
    '粥': { calories: 100, protein: 2, carbs: 22, fat: 0.5, confidence: 0.3 },
    
    // 肉类
    '鸡肉': { calories: 165, protein: 31, carbs: 0, fat: 3.6, confidence: 0.4 },
    '猪肉': { calories: 242, protein: 25, carbs: 0, fat: 14, confidence: 0.4 },
    '牛肉': { calories: 250, protein: 26, carbs: 0, fat: 15, confidence: 0.4 },
    '鱼': { calories: 120, protein: 20, carbs: 0, fat: 5, confidence: 0.4 },
    '虾': { calories: 85, protein: 20, carbs: 0, fat: 0.5, confidence: 0.4 },
    '鸡蛋': { calories: 70, protein: 6, carbs: 1, fat: 5, confidence: 0.5 },
    
    // 蔬菜类
    '青菜': { calories: 25, protein: 2, carbs: 5, fat: 0.2, confidence: 0.3 },
    '西兰花': { calories: 34, protein: 2.8, carbs: 7, fat: 0.4, confidence: 0.4 },
    '胡萝卜': { calories: 41, protein: 0.9, carbs: 10, fat: 0.2, confidence: 0.4 },
    '土豆': { calories: 77, protein: 2, carbs: 17, fat: 0.1, confidence: 0.4 },
    
    // 水果类
    '苹果': { calories: 52, protein: 0.3, carbs: 14, fat: 0.2, confidence: 0.5 },
    '香蕉': { calories: 89, protein: 1.1, carbs: 23, fat: 0.3, confidence: 0.5 },
    '橙子': { calories: 47, protein: 0.9, carbs: 12, fat: 0.1, confidence: 0.5 },
    
    // 奶制品
    '牛奶': { calories: 54, protein: 3.3, carbs: 5, fat: 3.2, confidence: 0.5 },
    '酸奶': { calories: 59, protein: 3.5, carbs: 4.7, fat: 3.3, confidence: 0.5 },
    
    // 其他常见食物
    '豆腐': { calories: 76, protein: 8, carbs: 4, fat: 4, confidence: 0.4 },
    '豆浆': { calories: 33, protein: 3, carbs: 3, fat: 2, confidence: 0.4 },
    '咖啡': { calories: 2, protein: 0.2, carbs: 0, fat: 0.1, confidence: 0.5 },
    '茶': { calories: 1, protein: 0, carbs: 0, fat: 0, confidence: 0.5 },
  };
  
  // 查找匹配的默认值
  for (const [key, value] of Object.entries(defaults)) {
    if (name.includes(key)) {
      return value;
    }
  }
  
  // 根据单位估算
  let estimatedCalories = 200;
  if (unit === '碗' || unit === '盘') estimatedCalories = 300;
  if (unit === '杯' || unit === '瓶') estimatedCalories = 150;
  if (unit === '个' || unit === '只') estimatedCalories = 100;
  if (unit === '片' || unit === '块') estimatedCalories = 50;
  
  // 通用默认值
  return {
    calories: estimatedCalories * quantity,
    protein: estimatedCalories * 0.1 / 4, // 假设10%的热量来自蛋白质
    carbs: estimatedCalories * 0.6 / 4,   // 假设60%的热量来自碳水
    fat: estimatedCalories * 0.3 / 9,     // 假设30%的热量来自脂肪
    confidence: 0.2
  };
}

/**
 * 批量分析多个食物的营养
 */
export async function analyzeMultipleFoods(foods: FoodItem[]): Promise<FoodItem[]> {
  const results = await Promise.all(
    foods.map(async (food) => {
      try {
        const nutrition = await analyzeNutritionWithDeepSeek(
          food.name,
          food.quantity,
          food.unit
        );
        
        return {
          ...food,
          calories: Math.round(nutrition.calories),
          protein: Math.round(nutrition.protein * 10) / 10, // 保留一位小数
          carbs: Math.round(nutrition.carbs * 10) / 10,
          fat: Math.round(nutrition.fat * 10) / 10
        };
      } catch (error) {
        console.error(`分析${food.name}营养失败:`, error);
        // 使用默认值
        const defaultNutrition = getDefaultNutrition(food.name, food.quantity, food.unit);
        return {
          ...food,
          calories: Math.round(defaultNutrition.calories),
          protein: Math.round(defaultNutrition.protein * 10) / 10,
          carbs: Math.round(defaultNutrition.carbs * 10) / 10,
          fat: Math.round(defaultNutrition.fat * 10) / 10
        };
      }
    })
  );
  
  return results;
}

/**
 * 分析食物文本描述的营养
 */
export async function analyzeTextNutrition(textDescription: string): Promise<FoodItem[]> {
  try {
    // 使用DeepSeek分析整个文本描述
    const prompt = `请分析以下饮食描述中的食物及其营养成分：
描述："${textDescription}"

请识别描述中的各种食物，并为每种食物估算：
1. 合理的数量（如1碗、2个等）
2. 卡路里（千卡）
3. 蛋白质（克）
4. 碳水化合物（克）
5. 脂肪（克）

请以JSON数组格式返回，每个元素格式为：
{
  "name": "食物名称",
  "unit": "单位",
  "quantity": 数量,
  "calories": 卡路里,
  "protein": 蛋白质,
  "carbs": 碳水化合物,
  "fat": 脂肪
}

只返回JSON数组，不要包含其他解释。`;

    const response = await fetch(DEEPSEEK_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`,
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "你是一个专业的营养分析师，擅长从文本描述中识别食物并估算营养成分。只返回JSON数组格式，不要包含其他文本。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.2,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`DeepSeek API调用失败: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    if (!content) {
      throw new Error('DeepSeek返回内容为空');
    }

    // 提取JSON
    try {
      const parsed = JSON.parse(content);
      // 如果返回的是对象，尝试提取数组
      const foodArray = Array.isArray(parsed) ? parsed : 
                       parsed.foods || parsed.items || parsed.result || [];
      
      if (Array.isArray(foodArray) && foodArray.length > 0) {
        return foodArray.map((item: any) => ({
          name: item.name || "未知食物",
          unit: item.unit || "份",
          quantity: item.quantity || 1,
          calories: item.calories || 200,
          protein: item.protein || 10,
          carbs: item.carbs || 25,
          fat: item.fat || 5
        }));
      }
    } catch (e) {
      console.error('解析DeepSeek响应失败:', e, content);
    }
    
    throw new Error('无法解析返回格式');
  } catch (error) {
    console.error('文本营养分析失败:', error);
    // 返回一个默认食物项
    return [{
      name: textDescription.length > 20 ? textDescription.substring(0, 20) + "..." : textDescription,
      unit: '份',
      quantity: 1,
      calories: 300,
      protein: 15,
      carbs: 40,
      fat: 10
    }];
  }
}
