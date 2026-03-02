---
title: "Agent开发必学-8000字长文带你了解下LangChain 生态系统"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247528899&idx=1&sn=ba5011b805230ca2b38c6e5a9d215c41&chksm=f9927712cee5fe04df282f43a1522099318965c4d68dcb8b55e6c259026823b5602164cd9c50#rd"
date: 2026-01-09
md5: bb62de687480107d3e03d34d3df9b804
---

# Agent开发必学-8000字长文带你了解下LangChain 生态系统

### 1. **LangChain 是什么？**

**LangChain** 是一个用于开发由大语言模型（LLM）驱动的应用程序的框架。它的核心目标是：

- **简化 LLM 应用开发**：提供标准化的接口和工具
- **连接外部数据源**：让 LLM 能够访问实时数据、数据库、API 等
- **构建复杂应用**：通过组合不同的组件构建智能应用

**主要功能**：

- **Prompt 管理**：模板化和优化提示词
- **链式调用（Chains）**：将多个 LLM 调用串联起来
- **记忆（Memory）**：管理对话历史和上下文
- **工具调用（Tools）**：让 LLM 能够调用外部工具和 API
- **Agent**：构建能够自主决策和执行任务的智能体
- **文档加载和处理**：加载、分割、向量化文档
- **检索增强生成（RAG）**：结合向量数据库实现知识问答

更多精彩Cursor开发技巧博客地址：https://cursor.npmlib.com/blogs

关于**你不知道的Cursor**是一个系列，更多 `Cursor` 使用技巧也可关注公众号 **AI近距离**系列历史文章，也可加我微信  ai239Ni  拉你Cursor技术交流进群

![图片](./images/0afe51eb992068fdfc9adaad80434a19.png)

### 2. **LangChain 生态系统的包结构**

LangChain 采用**模块化设计**，拆分成多个独立的包：

```
LangChain 生态系统
├── @langchain/core          # 核心抽象和接口
├── @langchain/openai         # OpenAI 集成
├── @langchain/anthropic      # Anthropic (Claude) 集成
├── @langchain/google-genai   # Google Gemini 集成
├── @langchain/community      # 社区贡献的集成
├── @langchain/langgraph      # 图编排框架
├── langchain                 # 主包（包含常用功能）
└── ... 其他集成包
```
### 3. **各个包的详细说明**

#### 📦 `@langchain/core` - 核心抽象层

**作用**：定义 LangChain 生态系统的**基础接口和抽象类**，是所有其他包的基础。

**主要内容**：

```
// 1. 语言模型接口
import { BaseLanguageModel } from'@langchain/core/language_models/base';
import { BaseChatModel } from'@langchain/core/language_models/chat_models';

// 2. 消息类型
import { 
  HumanMessage,      // 用户消息
  AIMessage,         // AI 回复
  SystemMessage,     // 系统提示
  FunctionMessage,   // 函数调用结果
} from'@langchain/core/messages';

// 3. Prompt 模板
import { PromptTemplate } from'@langchain/core/prompts';

// 4. 输出解析器
import { BaseOutputParser } from'@langchain/core/output_parsers';

// 5. Runnable 接口（可执行对象）
import { Runnable } from'@langchain/core/runnables';

// 6. 工具接口
import { BaseTool } from'@langchain/core/tools';

// 7. 文档和向量存储接口
import { Document } from'@langchain/core/documents';
import { VectorStore } from'@langchain/core/vectorstores';
```
**为什么需要 @langchain/core？**

- **统一接口**：不同的 LLM 提供商（OpenAI、Anthropic、Google）都实现相同的接口
- **类型安全**：提供 TypeScript 类型定义
- **解耦依赖**：核心逻辑不依赖具体的 LLM 实现
- **减小包体积**：只安装需要的集成包

#### 📦 `@langchain/openai` - OpenAI 集成

**作用**：提供 OpenAI 模型（GPT-3.5、GPT-4、DALL-E、Whisper 等）的具体实现。

**主要内容**：

```
// 1. Chat 模型（GPT-3.5-turbo, GPT-4 等）
import { ChatOpenAI } from'@langchain/openai';

const chatModel = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0.7,
  openAIApiKey: 'your-api-key',
});

// 2. 文本补全模型（GPT-3 等）
import { OpenAI } from'@langchain/openai';

const llm = new OpenAI({
  modelName: 'gpt-3.5-turbo-instruct',
});

// 3. Embeddings（文本向量化）
import { OpenAIEmbeddings } from'@langchain/openai';

const embeddings = new OpenAIEmbeddings({
  modelName: 'text-embedding-ada-002',
});

// 4. 使用示例
const response = await chatModel.invoke([
  { role: 'system', content: '你是一个helpful的助手' },
  { role: 'user', content: '什么是 LangChain？' },
]);

console.log(response.content);
```
**包含的功能**：

- **Chat Models**：对话模型（GPT-4、GPT-3.5-turbo）
- **LLMs**：文本补全模型
- **Embeddings**：文本向量化（用于 RAG）
- **Function Calling**：函数调用支持
- **Streaming**：流式输出支持
- **Token 计算**：Token 使用量统计

#### 📦 `@langchain/langgraph` - 图编排框架

**作用**：基于图的 Agent 编排框架，用于构建复杂的、有状态的 AI 应用。

**主要内容**：

```
import { 
  StateGraph,           // 状态图
  Annotation,           // 状态定义
  START,                // 起点
  END,                  // 终点
} from'@langchain/langgraph';

// 定义状态
const MyState = Annotation.Root({
  messages: Annotation<string[]>({
    reducer: (prev, next) => [...prev, ...next],
  }),
});

// 创建图
const graph = new StateGraph(MyState);
graph.addNode('node1', node1Function);
graph.addNode('node2', node2Function);
graph.addEdge(START, 'node1');
graph.addEdge('node1', 'node2');
graph.addEdge('node2', END);

const workflow = graph.compile();
```
**核心特性**：

- **有状态工作流**：状态在节点间流转
- **条件路由**：根据状态动态选择路径
- **循环支持**：支持有环图
- **并行执行**：独立节点可并行
- **流式输出**：支持实时输出

### 4. **LangChain 与 LangGraph 的关系**

```
┌─────────────────────────────────────────────────┐
│            LangChain 生态系统                    │
│                                                 │
│  ┌──────────────┐      ┌──────────────┐       │
│  │  LangChain   │      │  LangGraph   │       │
│  │              │      │              │       │
│  │ • Chains     │      │ • StateGraph │       │
│  │ • Agents     │      │ • Workflows  │       │
│  │ • Memory     │      │ • 复杂编排    │       │
│  │ • Tools      │      │              │       │
│  └──────────────┘      └──────────────┘       │
│         │                      │               │
│         └──────────┬───────────┘               │
│                    │                           │
│         ┌──────────▼──────────┐                │
│         │   @langchain/core   │                │
│         │   (核心抽象层)        │                │
│         └─────────────────────┘                │
│                    │                           │
│         ┌──────────▼──────────┐                │
│         │  LLM 集成包          │                │
│         │ • @langchain/openai │                │
│         │ • @langchain/anthropic│              │
│         │ • 其他集成            │                │
│         └─────────────────────┘                │
└─────────────────────────────────────────────────┘
```
**关系说明**：

- **LangGraph 是 LangChain 生态的一部分**，但是独立的包
- **LangChain** 提供基础的 Chain、Agent、Tool 等功能
- **LangGraph** 提供更高级的图编排能力，适合复杂场景
- 两者都依赖 `@langchain/core` 的核心抽象
- 可以在 LangGraph 的节点中使用 LangChain 的功能

### 5. **实际项目中的依赖关系**

实际项目中的依赖：

```
"@langchain/core": "^1.1.8",        // 核心抽象层
"@langchain/langgraph": "^1.0.7",  // 图编排框架
"@langchain/openai": "^1.2.0",     // OpenAI 集成
```
### 6. **项目实践场景**

#### `@langchain/core`

- 提供基础类型定义（如 `BaseMessage`、`Document` 等）
- 提供 Runnable 接口（用于链式调用）
- 作为其他两个包的依赖

#### `@langchain/langgraph`

- **Hub Agent 工作流编排**：使用 `StateGraph` 构建意图识别 → 路由 → Sub Agent 的流程
- **Sub Agent 工作流**：每个 Sub Agent 内部也使用 `StateGraph` 管理自己的执行流程
- **状态管理**：使用 `Annotation` 定义和管理 Agent 状态

#### `@langchain/openai`

- **LLM 调用**：如果需要调用 GPT-4 进行意图识别或内容生成
- **Embeddings**：如果需要实现 RAG（检索增强生成）
- **Function Calling**：让 LLM 能够调用工具

### 7. **典型使用场景示例**

```
// 场景 1：在 LangGraph 节点中使用 OpenAI
import { ChatOpenAI } from'@langchain/openai';
import { StateGraph } from'@langchain/langgraph';
import { HumanMessage } from'@langchain/core/messages';

const llm = new ChatOpenAI({
  modelName: 'gpt-4',
  temperature: 0,
});

asyncfunction llmNode(state: typeof MyState.State) {
// 在 LangGraph 节点中调用 OpenAI
const response = await llm.invoke([
    new HumanMessage(state.query),
  ]);

return {
    output: response.content,
  };
}

const graph = new StateGraph(MyState);
graph.addNode('llm_call', llmNode);
// ...
```
```
// 场景 2：使用 LangChain 的 Chain 功能
import { ChatOpenAI } from'@langchain/openai';
import { PromptTemplate } from'@langchain/core/prompts';
import { StringOutputParser } from'@langchain/core/output_parsers';

const prompt = PromptTemplate.fromTemplate(
'你是一个{role}，请回答：{question}'
);

const llm = new ChatOpenAI({ modelName: 'gpt-4' });
const parser = new StringOutputParser();

// 链式调用
const chain = prompt.pipe(llm).pipe(parser);

const result = await chain.invoke({
  role: '专家',
  question: '什么是 LangChain？',
});
```
### 8. **总结对比**



| 包名 | 作用 | 包含内容 | 依赖关系 |
| --- | --- | --- | --- |
| @langchain/core | 核心抽象层 | 接口、类型定义、基础类 | 无依赖 |
| @langchain/openai | OpenAI 集成 | GPT-4、Embeddings、Function Calling | 依赖 @langchain/core |
| @langchain/langgraph | 图编排框架 | StateGraph、工作流管理 | 依赖 @langchain/core |
| langchain (主包) | 完整功能集 | 包含常用功能的一站式包 | 包含多个子包 |


### 9. **为什么要模块化？**

1. **按需安装**：只安装需要的功能，减小包体积
2. **版本独立**：各个集成包可以独立更新
3. **解耦依赖**：不使用 OpenAI 就不需要安装 `@langchain/openai`
4. **类型安全**：每个包都有自己的类型定义
5. **社区贡献**：方便社区贡献新的集成包

---

希望这些解释能帮助您更好地理解 LangChain 生态系统！

Node 社群
