# Hello LLM Core

> 为 "Hello Agents" 定制的 LLM 客户端 — TypeScript 实现。

兼容任何 OpenAI 接口的服务，默认使用流式响应。

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

编辑 `.env` 文件，填入你的 API 配置：

```env
LLM_MODEL_ID=deepseek-chat
LLM_API_KEY=your-api-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_TIMEOUT=60
```

### 3. 运行

```bash
npm start
```

## API 使用

```ts
import "dotenv/config";
import { HelloAgentsLLM } from "./client.js";

const client = new HelloAgentsLLM({
  // model: "gpt-4",      // 可选，不传则从环境变量读取
  // apiKey: "sk-...",    // 可选
  // baseUrl: "https://...", // 可选
  // timeout: 30000,      // 可选，单位毫秒
});

const messages = [
  { role: "system", content: "你是一个编写 TypeScript 代码的助手。" },
  { role: "user", content: "写一个快速排序算法" },
];

const response = await client.think(messages);
console.log(response);
```

## HelloAgentsLLM

| 参数 | 环境变量 | 默认值 | 说明 |
|------|---------|--------|------|
| `model` | `LLM_MODEL_ID` | - | 模型 ID |
| `apiKey` | `LLM_API_KEY` | - | API 密钥 |
| `baseUrl` | `LLM_BASE_URL` | - | API 地址 |
| `timeout` | `LLM_TIMEOUT` | `60000` | 超时（毫秒） |

### `think(messages, temperature?)`

- 调用 LLM 生成响应，终端流式打印输出
- 返回完整响应文本，出错返回 `null`

## 技术栈

- **TypeScript** — 类型安全
- **OpenAI SDK** — API 调用
- **dotenv** — 环境变量管理
- **tsx** — TypeScript 执行
