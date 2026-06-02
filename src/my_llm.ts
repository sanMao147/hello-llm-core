import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * 支持的 LLM 提供商类型。
 * 对应 Python llm.py 中的 SUPPORTED_PROVIDERS。
 */
export type LLMProvider =
  | "openai"
  | "deepseek"
  | "qwen"
  | "modelscope"
  | "kimi"
  | "zhipu"
  | "ollama"
  | "vllm"
  | "local"
  | "auto";

/**
 * MyLLM — 独立实现，完整复刻 Python llm.py 的全部功能。
 *
 * - 多 provider 支持（openai/deepseek/qwen/modelscope/kimi/zhipu/ollama/vllm/local/auto）
 * - 自动检测 provider（环境变量 → API key 格式 → base_url）
 * - think() 返回 AsyncGenerator（对标 Python Iterator[str]）
 * - invoke() 非流式调用
 * - stream_invoke() 别名方法
 * - 按 provider 智能选择默认模型
 *
 * 用法：
 *   const llm = new MyLLM({ provider: "modelscope" });          // 显式指定
 *   const llm = new MyLLM();                                     // 自动检测
 *   for await (const chunk of llm.think([...messages])) {}       // 流式
 *   const text = await llm.invoke([...messages]);                // 非流式
 */
export class MyLLM {
  private readonly _model: string;
  private readonly _client: OpenAI;
  private readonly _provider: LLMProvider;
  private readonly _temperature: number;
  private readonly _maxTokens: number | undefined;

  constructor(opts?: {
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    provider?: LLMProvider;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  }) {
    // ---- 1. 确定 provider ----
    this._provider =
      opts?.provider ?? MyLLM._autoDetectProvider(opts?.apiKey, opts?.baseUrl);

    // ---- 2. 解析 credentials ----
    const [apiKey, baseUrl] = MyLLM._resolveCredentials(
      this._provider,
      opts?.apiKey,
      opts?.baseUrl
    );

    const timeoutSec =
      opts?.timeout ??
      (process.env["LLM_TIMEOUT"] ? Number(process.env["LLM_TIMEOUT"]) : 60);

    this._model =
      opts?.model ??
      process.env["LLM_MODEL_ID"] ??
      MyLLM._getDefaultModel(this._provider);

    this._temperature = opts?.temperature ?? 0.7;
    this._maxTokens = opts?.maxTokens;

    // ---- 3. 创建 OpenAI 客户端 ----
    this._client = new OpenAI({
      apiKey,
      baseURL: baseUrl,
      timeout: timeoutSec * 1000,
    });
  }

  // ============ 只读属性 ============

  get provider(): LLMProvider {
    return this._provider;
  }

  get modelName(): string {
    return this._model;
  }

  // ============ think() — 流式调用（AsyncGenerator 对标 Python Iterator[str]） ============

  /**
   * 流式调用 LLM，返回 AsyncGenerator，逐 chunk yield 响应内容。
   * 调用期间会在终端流式打印模型输出。
   *
   * 对应 Python think() → Iterator[str]。
   *
   * @param messages    - 对话消息列表
   * @param temperature - 采样温度，未提供时使用构造参数
   * @yields 流式响应的文本片段
   */
  async *think(
    messages: ChatCompletionMessageParam[],
    temperature?: number
  ): AsyncGenerator<string, string | null, unknown> {
    const temp = temperature ?? this._temperature;
    console.log(`🧠 正在调用 ${this._model} 模型...`);

    try {
      const stream = await this._client.chat.completions.create({
        model: this._model,
        messages,
        temperature: temp,
        ...(this._maxTokens !== undefined
          ? { max_tokens: this._maxTokens }
          : {}),
        stream: true,
      });

      console.log("✅ 大语言模型响应成功:");
      const collected: string[] = [];

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (content) {
          process.stdout.write(content);
          collected.push(content);
          yield content;
        }
      }

      console.log();
      return collected.join("");
    } catch (error) {
      console.error(`❌ 调用LLM API时发生错误: ${error}`);
      return null;
    }
  }

  // ============ invoke() — 非流式调用 ============

  /**
   * 非流式调用 LLM，返回完整响应字符串。
   * 对应 Python invoke()。
   *
   * @param messages - 对话消息列表
   * @param kwargs   - 额外参数（temperature, max_tokens 等）
   * @returns 模型完整响应文本
   */
  async invoke(
    messages: ChatCompletionMessageParam[],
    kwargs?: {
      temperature?: number;
      maxTokens?: number;
      [key: string]: unknown;
    }
  ): Promise<string | null> {
    try {
      const response = await this._client.chat.completions.create({
        model: this._model,
        messages,
        temperature: kwargs?.temperature ?? this._temperature,
        max_tokens: kwargs?.maxTokens ?? this._maxTokens,
        ...Object.fromEntries(
          Object.entries(kwargs ?? {}).filter(
            ([k]) => k !== "temperature" && k !== "maxTokens"
          )
        ),
      });
      return response.choices[0]?.message?.content ?? null;
    } catch (error) {
      console.error(`❌ 调用LLM API时发生错误: ${error}`);
      return null;
    }
  }

  // ============ stream_invoke() — 别名 ============

  /**
   * 流式调用 LLM 的别名方法，与 think 功能相同。
   * 对应 Python stream_invoke()。
   */
  async *stream_invoke(
    messages: ChatCompletionMessageParam[],
    kwargs?: { temperature?: number }
  ): AsyncGenerator<string, string | null, unknown> {
    return yield* this.think(messages, kwargs?.temperature);
  }

  // ============ 静态方法：自动检测 / 凭证解析 / 默认模型 ============

  /**
   * 自动检测 LLM 提供商。
   * 检测优先级：环境变量 → API key 格式 → base_url → auto
   */
  private static _autoDetectProvider(
    apiKey?: string,
    baseUrl?: string
  ): LLMProvider {
    // 1. 检查特定提供商的环境变量
    if (process.env["OPENAI_API_KEY"]) return "openai";
    if (process.env["DEEPSEEK_API_KEY"]) return "deepseek";
    if (process.env["DASHSCOPE_API_KEY"]) return "qwen";
    if (process.env["MODELSCOPE_API_KEY"]) return "modelscope";
    if (process.env["KIMI_API_KEY"] || process.env["MOONSHOT_API_KEY"])
      return "kimi";
    if (process.env["ZHIPU_API_KEY"] || process.env["GLM_API_KEY"])
      return "zhipu";
    if (process.env["OLLAMA_API_KEY"] || process.env["OLLAMA_HOST"])
      return "ollama";
    if (process.env["VLLM_API_KEY"] || process.env["VLLM_HOST"]) return "vllm";

    // 2. 根据 API 密钥格式判断
    const actualApiKey = apiKey ?? process.env["LLM_API_KEY"];
    if (actualApiKey) {
      if (actualApiKey.startsWith("ms-")) return "modelscope";
      const lower = actualApiKey.toLowerCase();
      if (lower === "ollama") return "ollama";
      if (lower === "vllm") return "vllm";
      if (lower === "local") return "local";
      if (actualApiKey.includes(".") && actualApiKey.length > 20) {
        return "zhipu";
      }
    }

    // 3. 根据 base_url 判断
    const actualBaseUrl = baseUrl ?? process.env["LLM_BASE_URL"];
    if (actualBaseUrl) {
      const lower = actualBaseUrl.toLowerCase();
      if (lower.includes("api.openai.com")) return "openai";
      if (lower.includes("api.deepseek.com")) return "deepseek";
      if (lower.includes("dashscope.aliyuncs.com")) return "qwen";
      if (lower.includes("api-inference.modelscope.cn")) return "modelscope";
      if (lower.includes("api.moonshot.cn")) return "kimi";
      if (lower.includes("open.bigmodel.cn")) return "zhipu";
      if (lower.includes("localhost") || lower.includes("127.0.0.1")) {
        if (lower.includes(":11434") || lower.includes("ollama"))
          return "ollama";
        if (lower.includes(":8000") && lower.includes("vllm")) return "vllm";
        if (lower.includes(":8080") || lower.includes(":7860")) return "local";
        return "local";
      }
      if ([":8080", ":7860", ":5000"].some((p) => lower.includes(p))) {
        return "local";
      }
    }

    return "auto";
  }

  /**
   * 根据 provider 解析 API 密钥和 base_url。
   * 对应 Python _resolve_credentials。
   */
  private static _resolveCredentials(
    provider: LLMProvider,
    apiKey?: string,
    baseUrl?: string
  ): [string, string] {
    switch (provider) {
      case "openai":
        return [
          apiKey ??
            process.env["OPENAI_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "https://api.openai.com/v1",
        ];
      case "deepseek":
        return [
          apiKey ??
            process.env["DEEPSEEK_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "https://api.deepseek.com",
        ];
      case "qwen":
        return [
          apiKey ??
            process.env["DASHSCOPE_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "https://dashscope.aliyuncs.com/compatible-mode/v1",
        ];
      case "modelscope":
        return [
          apiKey ??
            process.env["MODELSCOPE_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "https://api-inference.modelscope.cn/v1/",
        ];
      case "kimi":
        return [
          apiKey ??
            process.env["KIMI_API_KEY"] ??
            process.env["MOONSHOT_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "https://api.moonshot.cn/v1",
        ];
      case "zhipu":
        return [
          apiKey ??
            process.env["ZHIPU_API_KEY"] ??
            process.env["GLM_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "https://open.bigmodel.cn/api/paas/v4",
        ];
      case "ollama":
        return [
          apiKey ??
            process.env["OLLAMA_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "ollama",
          baseUrl ??
            process.env["OLLAMA_HOST"] ??
            process.env["LLM_BASE_URL"] ??
            "http://localhost:11434/v1",
        ];
      case "vllm":
        return [
          apiKey ??
            process.env["VLLM_API_KEY"] ??
            process.env["LLM_API_KEY"] ??
            "vllm",
          baseUrl ??
            process.env["VLLM_HOST"] ??
            process.env["LLM_BASE_URL"] ??
            "http://localhost:8000/v1",
        ];
      case "local":
        return [
          apiKey ?? process.env["LLM_API_KEY"] ?? "local",
          baseUrl ??
            process.env["LLM_BASE_URL"] ??
            "http://localhost:8000/v1",
        ];
      default:
        return [
          apiKey ?? process.env["LLM_API_KEY"] ?? "",
          baseUrl ?? process.env["LLM_BASE_URL"] ?? "",
        ];
    }
  }

  /**
   * 根据 provider 获取默认模型。
   * 对应 Python _get_default_model。
   */
  private static _getDefaultModel(provider: LLMProvider): string {
    switch (provider) {
      case "openai":
        return "gpt-3.5-turbo";
      case "deepseek":
        return "deepseek-chat";
      case "qwen":
        return "qwen-plus";
      case "modelscope":
        return "Qwen/Qwen2.5-72B-Instruct";
      case "kimi":
        return "moonshot-v1-8k";
      case "zhipu":
        return "glm-4";
      case "ollama":
        return "llama3.2";
      case "vllm":
        return "meta-llama/Llama-2-7b-chat-hf";
      case "local":
        return "local-model";
      default: {
        const baseUrl = (process.env["LLM_BASE_URL"] ?? "").toLowerCase();
        if (baseUrl.includes("modelscope")) return "Qwen/Qwen2.5-72B-Instruct";
        if (baseUrl.includes("deepseek")) return "deepseek-chat";
        if (baseUrl.includes("dashscope")) return "qwen-plus";
        if (baseUrl.includes("moonshot")) return "moonshot-v1-8k";
        if (baseUrl.includes("bigmodel")) return "glm-4";
        if (baseUrl.includes("ollama") || baseUrl.includes(":11434"))
          return "llama3.2";
        if (baseUrl.includes(":8000") || baseUrl.includes("vllm"))
          return "meta-llama/Llama-2-7b-chat-hf";
        if (baseUrl.includes("localhost") || baseUrl.includes("127.0.0.1"))
          return "local-model";
        return "gpt-3.5-turbo";
      }
    }
  }
}
