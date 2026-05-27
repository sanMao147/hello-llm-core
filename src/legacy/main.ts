import "dotenv/config";
import { HelloAgentsLLM } from "./client.js";

// --- 客户端使用示例 ---
try {
  const llmClient = new HelloAgentsLLM();

  const exampleMessages: Array<{
    role: "system" | "user" | "assistant";
    content: string;
  }> = [
    { role: "system", content: "你是一个编写 TypeScript 代码的助手。" },
    { role: "user", content: "写一个快速排序算法" },
  ];

  console.log("--- 调用LLM ---");
  const responseText = await llmClient.think(exampleMessages);
  if (responseText) {
    console.log("\n\n--- 完整模型响应 ---");
    console.log(responseText);
  }
} catch (error) {
  if (error instanceof Error) {
    console.error(error.message);
  }
}
