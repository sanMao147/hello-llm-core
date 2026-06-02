import "dotenv/config";
import { MyLLM } from "./my_llm.js";
import type { ChatCompletionMessageParam } from "openai/resources/chat/completions";

// ============================================================
// 演示 1：自动检测 provider
// ============================================================
async function demoAutoDetect() {
  console.log("========== 演示 1: 自动检测 provider ==========");
  const llm = new MyLLM();
  console.log(`检测到 provider: ${llm.provider}`);
  console.log(`使用的模型: ${llm.modelName}`);

  const messages: ChatCompletionMessageParam[] = [
    { role: "user", content: "你好，用一句话介绍你自己。" },
  ];

  // think() — 流式调用（AsyncGenerator，对标 Python think() → Iterator[str]）
  console.log("\n--- think() 流式输出 ---");
  for await (const chunk of llm.think(messages)) {
    // chunk 逐 token 输出（控制台同时自动打印）
  }
  console.log("--- think() 结束 ---\n");
}

// ============================================================
// 演示 2：显式指定 provider + invoke 非流式调用
// ============================================================
async function demoExplicitProvider() {
  console.log("========== 演示 2: 显式指定 provider ==========");

  // modelscope
  if (process.env["MODELSCOPE_API_KEY"]) {
    const llm = new MyLLM({ provider: "modelscope" });
    console.log(`provider: ${llm.provider}, model: ${llm.modelName}`);
    const result = await llm.invoke([
      { role: "user", content: "1+1=?" },
    ]);
    console.log(`invoke 结果: ${result}`);
  } else {
    console.log("跳过 modelscope (未设置 MODELSCOPE_API_KEY)");
  }

  // deepseek
  if (process.env["DEEPSEEK_API_KEY"]) {
    const llm = new MyLLM({ provider: "deepseek" });
    console.log(`provider: ${llm.provider}, model: ${llm.modelName}`);
    const result = await llm.invoke([
      { role: "user", content: "What is 2+2?" },
    ]);
    console.log(`invoke 结果: ${result}`);
  } else {
    console.log("跳过 deepseek (未设置 DEEPSEEK_API_KEY)");
  }

  console.log();
}

// ============================================================
// 演示 3：stream_invoke() 别名方法
// ============================================================
async function demoStreamInvoke() {
  console.log("========== 演示 3: stream_invoke() ==========");
  const llm = new MyLLM();
  for await (const chunk of llm.stream_invoke([
    { role: "user", content: "数 1 到 3。" },
  ])) {
    // 与 think() 完全相同
  }
  console.log("--- stream_invoke() 结束 ---\n");
}

// ============================================================
// 演示 4：自定义参数（temperature, maxTokens）
// ============================================================
async function demoCustomParams() {
  console.log("========== 演示 4: 自定义参数 ==========");
  const llm = new MyLLM({
    provider: "auto",
    temperature: 0.3,
    maxTokens: 100,
  });
  console.log(`provider: ${llm.provider}, model: ${llm.modelName}`);
  for await (const chunk of llm.think(
    [{ role: "user", content: "说一个笑话。" }],
    0.5 // 运行时覆盖 temperature
  )) {
    // 流式输出
  }
  console.log("--- 结束 ---\n");
}

// ============================================================
// 主入口
// ============================================================
async function main() {
  try {
    await demoAutoDetect();
    await demoExplicitProvider();
  } catch (error) {
    if (error instanceof Error) {
      console.error(`错误: ${error.message}`);
    }
  }
}

await main();
