---
name: python-to-typescript-llm-client
overview: 将 Python 版 HelloAgentsLLM 客户端逐函数转换为 TypeScript，包含项目初始化、环境变量加载、OpenAI SDK 流式调用。使用 bun 作为运行时。
todos:
  - id: init-project
    content: 初始化 TypeScript 项目结构，包括 package.json、tsconfig.json 和 .env 模板文件
    status: completed
  - id: implement-client
    content: 使用 [skill:coding-standards] 实现 HelloAgentsLLM 类，包含构造函数校验和 think() 流式调用方法
    status: completed
    dependencies:
      - init-project
  - id: create-main
    content: 创建 main.ts 入口文件，包含客户端使用示例和可执行脚本
    status: completed
    dependencies:
      - implement-client
---

## 用户需求

将一段 Python 代码（HelloAgentsLLM 客户端类）用 TypeScript 实现。原始 Python 代码是一个为大语言模型调用封装的客户端，功能包括：

## 核心功能

- 从 `.env` 文件或构造函数参数加载 LLM 配置（模型ID、API密钥、服务地址、超时时间）
- 在参数缺失时抛出明确错误
- 使用 OpenAI 兼容接口创建客户端
- 提供 `think()` 方法，发送消息列表并启用流式响应
- 流式输出时逐块打印内容并在结束时拼接返回完整响应
- 提供一个可直接运行的 main 示例

## 技术栈

- 运行时: Bun
- 语言: TypeScript
- OpenAI SDK: `openai` (npm)
- 环境变量: `process.env` + 可选 `dotenv` 或 Bun 内置 `.env` 自动加载
- 类型: `ChatCompletionMessageParam` 来自 openai SDK

## 实现方案

### 数据流

初始化读取环境变量/参数 → 校验必要字段 → 构造 OpenAI 客户端实例 → 调用 `think()` 传入消息数组 → 启用 stream 异步迭代 → 逐 chunk 打印 content → 累积拼接完整响应 → 返回完整字符串

### 关键设计决策

1. **环境变量加载**: Bun 原生支持 `.env` 文件自动加载，无需额外依赖
2. **流式处理**: 使用 `for await...of` 迭代 OpenAI SDK 返回的 `Stream<ChatCompletionChunk>`
3. **类型安全**: 使用 SDK 内置的 `ChatCompletionMessageParam` 类型定义消息结构
4. **错误处理**: 保持与 Python 版本一致的 try/catch + 返回 `null` 的错误处理策略
5. **包管理**: 使用 bun，依赖精简仅需 `openai` 一个 npm 包

### 目录结构

```
hello-llm-core/
├── .env                    # [NEW] 环境变量配置文件模板
├── package.json            # [NEW] 项目配置与依赖
├── tsconfig.json           # [NEW] TypeScript 编译配置
├── src/
│   └── client.ts           # [NEW] HelloAgentsLLM 类实现，包含 think() 流式方法
└── src/
    └── main.ts             # [NEW] 入口文件，包含使用示例
```

### 实现要点

- `think()` 方法签名: `async think(messages: ChatCompletionMessageParam[], temperature?: number): Promise<string | null>`
- 流式迭代使用 `for await (const chunk of stream)` 配合 `chunk.choices[0]?.delta?.content`
- 使用 `process.stdout.write()` 实现不换行打印（等同于 Python 的 `print(content, end="", flush=True)`）
- 校验逻辑: 检查 `model`、`apiKey`、`baseUrl` 三者是否都存在

## Agent Extensions

### Skill

- **coding-standards**
- 用途: 确保 TypeScript 代码遵循通用编码规范和最佳实践
- 预期结果: 代码风格一致、类型安全、可维护性强