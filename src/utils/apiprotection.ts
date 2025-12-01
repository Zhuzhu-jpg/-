// API 调用保护工具
export class APIRateLimiter {
  private static limits: Map<string, { count: number; lastReset: number }> = new Map();
  private static readonly RESET_INTERVAL = 60 * 1000; // 1分钟
  private static readonly MAX_CALLS_PER_MINUTE = 30;

  static canCall(apiName: string): boolean {
    const now = Date.now();
    const limit = this.limits.get(apiName);

    if (!limit) {
      this.limits.set(apiName, { count: 1, lastReset: now });
      return true;
    }

    // 检查是否需要重置
    if (now - limit.lastReset > this.RESET_INTERVAL) {
      this.limits.set(apiName, { count: 1, lastReset: now });
      return true;
    }

    // 检查是否超过限制
    if (limit.count >= this.MAX_CALLS_PER_MINUTE) {
      return false;
    }

    // 增加计数
    this.limits.set(apiName, { 
      count: limit.count + 1, 
      lastReset: limit.lastReset 
    });
    
    return true;
  }

  static getRemainingCalls(apiName: string): number {
    const limit = this.limits.get(apiName);
    if (!limit) return this.MAX_CALLS_PER_MINUTE;
    
    const now = Date.now();
    if (now - limit.lastReset > this.RESET_INTERVAL) {
      return this.MAX_CALLS_PER_MINUTE;
    }
    
    return this.MAX_CALLS_PER_MINUTE - limit.count;
  }
}

// 加密 API Key（基础版）
export function encryptAPIKey(key: string): string {
  // 简单混淆，实际应用中应该使用更安全的加密
  return btoa(key.split('').reverse().join(''));
}

// 解密 API Key
export function decryptAPIKey(encrypted: string): string {
  try {
    return atob(encrypted).split('').reverse().join('');
  } catch {
    throw new Error('Failed to decrypt API key');
  }
}
