import { FoodItem } from "../types";

// 百度智能云API配置
const BAIDU_API_KEY = "O0VwFyuVnY9lrUu9B20ROUHQ";
const BAIDU_SECRET_KEY = "EbsHcdKArky9dfwj6RjMA1Szdbc2dPSj";
const ACCESS_TOKEN_URL = "https://aip.baidubce.com/oauth/2.0/token";

// 图像内容理解大模型API
const SUBMIT_TASK_URL = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/image/visionbus";
const GET_RESULT_URL = "https://aip.baidubce.com/rpc/2.0/ai_custom/v1/wenxinworkshop/image/visionbus_result";

interface AIResponse {
  dishName: string;
  items: FoodItem[];
}

interface BaiduFoodItem {
  name: string;
  unit: string;
  quantity: string;
}

interface BaiduSubmitResponse {
  task_id: string;
}

interface BaiduResultResponse {
  data: {
    answer: BaiduFoodItem[];
  };
  task_status: string;
}

// 缓存access_token
let cachedAccessToken: string | null = null;
let tokenExpiryTime: number = 0;

async function getAccessToken(): Promise<string> {
  if (cachedAccessToken && Date.now() < tokenExpiryTime) {
    return cachedAccessToken;
  }

  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: BAIDU_API_KEY,
      client_secret: BAIDU_SECRET_KEY
    });

    const response = await fetch(`${ACCESS_TOKEN_URL}?${params}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) throw new Error(`获取token失败: ${response.status}`);
    const data = await response.json();
    
    if (data.error) throw new Error(`百度API错误: ${data.error_description}`);

    cachedAccessToken = data.access_token;
    tokenExpiryTime = Date.now() + (29 * 24 * 60 * 60 * 1000);
    return cachedAccessToken;
  } catch (error) {
    console.error("获取百度Access Token错误:", error);
    throw new Error("认证失败，请检查API配置");
  }
}

async function pollTaskResult(taskId: string, accessToken: string): Promise<BaiduResultResponse> {
  const maxAttempts = 20;
  const pollInterval = 1500;
  
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const params = new URLSearchParams({
        access_token: accessToken,
        task_id: taskId
      });

      const response = await fetch(`${GET_RESULT_URL}?${params}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error(`获取结果失败: ${response.status}`);
      const result: BaiduResultResponse = await response.json();
      
      switch (result.task_status) {
        case 'SUCCESS': return result;
        case 'PROCESSING':
          await new Promise(resolve => setTimeout(resolve, pollInterval));
          continue;
        case 'FAILED': throw new Error('图像分析任务失败');
        default: throw new Error(`未知任务状态: ${result.task_status}`);
      }
    } catch (error) {
      if (attempt === maxAttempts - 1) throw new Error(`轮询超时: ${error.message}`);
      await new Promise(resolve => setTimeout(resolve, pollInterval));
    }
  }
  throw new Error('分析超时，请重试');
}

function parseQuantity(quantityStr: string): number {
  const cleaned = quantityStr.replace(/\s+/g, '');
  const match = cleaned.match(/[\d\.]+/);
  if (match) return parseFloat(match[0]);
  
  const chineseNumbers: Record<string, number> = {
    '一': 1, '两': 2, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '半': 0.5, '几': 3, '一些': 2, '少许': 0.5, '少量': 0.3
  };
  
  for (const [chinese, value] of Object.entries(chineseNumbers)) {
    if (cleaned.includes(chinese)) return value;
  }
  
  return 1;
}

/**
 * 只进行食物识别，不包含营养分析
 */
export const analyzeFoodImage = async (base64Image: string): Promise<AIResponse> => {
  try {
    const accessToken = await getAccessToken();
    
    const submitBody = {
      access_token: accessToken,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            },
            {
              type: "text",
              text: "请识别图中的食物或菜品。每种食物以JSON格式 {name: '食物名称', unit: '单位', quantity: '数量'} 输出，放在数组中。请使用中文，数量可以是具体数字或描述（如'一碗'、'两个'）。只需要识别食物种类和数量，不要分析营养。"
            }
          ]
        }
      ],
      stream: false
    };

    const submitResponse = await fetch(SUBMIT_TASK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(submitBody)
    });

    if (!submitResponse.ok) throw new Error(`提交任务失败: ${submitResponse.status}`);
    const submitResult: BaiduSubmitResponse = await submitResponse.json();
    if (!submitResult.task_id) throw new Error('未收到任务ID');

    const result = await pollTaskResult(submitResult.task_id, accessToken);
    
    if (!result.data?.answer || result.data.answer.length === 0) {
      return { dishName: "未识别到食物", items: [] };
    }

    const baiduItems = result.data.answer;
    const foodItems: FoodItem[] = baiduItems.map(item => ({
      name: item.name,
      unit: item.unit || '份',
      quantity: parseQuantity(item.quantity),
      calories: 0, // 先设为0，后面会由DeepSeek分析
      protein: 0,
      carbs: 0,
      fat: 0
    }));
    
    const foodNames = baiduItems.map(item => item.name);
    const dishName = foodNames.length > 1 
      ? `${foodNames.slice(0, 2).join('+')}等${foodNames.length}种食物`
      : foodNames[0];
    
    return { dishName, items: foodItems };
  } catch (error) {
    console.error("百度图像分析错误:", error);
    throw new Error(error.message || "识别失败，请重试");
  }
};

/**
 * 简化的文本分析
 */
export const analyzeFoodText = async (textDescription: string): Promise<AIResponse> => {
  try {
    const dishName = textDescription.length > 20 
      ? textDescription.substring(0, 20) + "..." 
      : textDescription;
    
    const defaultItem: FoodItem = {
      name: dishName,
      unit: '份',
      quantity: 1,
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0
    };
    
    return { dishName, items: [defaultItem] };
  } catch (error) {
    console.error("文本分析错误:", error);
    throw new Error("文本分析失败");
  }
};
