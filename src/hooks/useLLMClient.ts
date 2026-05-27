import { useMemo } from "react";
import OpenAI from "openai";
import type { Settings, LLMClient } from "../types/chat";

/**
 * useLLMClient — 对标原 HelloAgentsLLM 构造函数
 *
 * 原 CLI 代码：
 *   constructor(opts?) → 校验 model/apiKey/baseUrl → 创建 OpenAI 实例
 *
 * Hook 实现：
 *   - 输入：{ apiKey, baseUrl, model }
 *   - 校验：任一为空时 isConfigured 为 false
 *   - 客户端实例通过 useMemo 缓存，config 变更时惰性重建
 */
export function useLLMClient(settings: Settings): LLMClient {
  const isConfigured = useMemo(() => {
    return Boolean(settings.apiKey && settings.baseUrl && settings.model);
  }, [settings.apiKey, settings.baseUrl, settings.model]);

  const client = useMemo(() => {
    if (!isConfigured) return null;
    return new OpenAI({
      apiKey: settings.apiKey,
      baseURL: settings.baseUrl,
      dangerouslyAllowBrowser: true,
    });
  }, [isConfigured, settings.apiKey, settings.baseUrl]);

  return {
    client,
    config: settings,
    isConfigured,
  };
}
