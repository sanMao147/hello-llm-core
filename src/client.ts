import OpenAI from "openai";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

/**
 * HelloAgentsLLM — 兼容 OpenAI 接口的大语言模型客户端。
 * 默认使用流式响应，优先使用传入参数，回退到环境变量。
 */
export class HelloAgentsLLM {
  private readonly model: string;
  private readonly client: OpenAI;

  /**
   * 初始化客户端。
   * @param opts.model       - 模型 ID，默认读取 `LLM_MODEL_ID` 环境变量
   * @param opts.apiKey      - API 密钥，默认读取 `LLM_API_KEY` 环境变量
   * @param opts.baseUrl     - 服务地址，默认读取 `LLM_BASE_URL` 环境变量
   * @param opts.timeout     - 超时时间(毫秒)，默认读取 `LLM_TIMEOUT` 环境变量，未设置时回退 60 秒
   */
  constructor(opts?: {
    model?: string;
    apiKey?: string;
    baseUrl?: string;
    timeout?: number;
  }) {
    const model = opts?.model ?? process.env["LLM_MODEL_ID"];
    const apiKey = opts?.apiKey ?? process.env["LLM_API_KEY"];
    const baseUrl = opts?.baseUrl ?? process.env["LLM_BASE_URL"];
    const timeout =
      opts?.timeout ??
      (process.env["LLM_TIMEOUT"] ? Number(process.env["LLM_TIMEOUT"]) : 60_000);

    if (!model || !apiKey || !baseUrl) {
      throw new Error(
        "模型ID、API密钥和服务地址必须被提供或在.env文件中定义。"
      );
    }

    this.model = model;
    this.client = new OpenAI({ apiKey, baseURL: baseUrl, timeout });
  }

  /**
   * 调用大语言模型进行思考，返回其完整响应文本。
   * 调用期间会在终端流式打印模型输出。
   *
   * @param messages    - 对话消息列表
   * @param temperature - 采样温度 (0-2)，默认 0
   * @returns 模型完整响应文本，出错时返回 `null`
   */
  async think(
    messages: ChatCompletionMessageParam[],
    temperature = 0
  ): Promise<string | null> {
    console.log(`🧠 正在调用 ${this.model} 模型...`);
    try {
      const stream = await this.client.chat.completions.create({
        model: this.model,
        messages,
        temperature,
        stream: true,
      });

      console.log("✅ 大语言模型响应成功:");
      const collected: string[] = [];

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content ?? "";
        if (content) {
          process.stdout.write(content);
          collected.push(content);
        }
      }

      console.log(); // 流式输出结束换行
      return collected.join("");
    } catch (error) {
      console.error(`❌ 调用LLM API时发生错误: ${error}`);
      return null;
    }
  }
}
