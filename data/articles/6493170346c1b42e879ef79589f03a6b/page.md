---
title: "OpenClaw 安装与运行教程"
link: "http://mp.weixin.qq.com/s?__biz=MzUxNzk1MjQ0Ng==&mid=2247529192&idx=2&sn=6b76b96417be7ae3a249a2c77aa338dc&chksm=f9927439cee5fd2fec0bc048cec6758692c5b68d1269d8c7ff756304e3a24db4527f75977925#rd"
date: 2026-02-22
md5: 6493170346c1b42e879ef79589f03a6b
---

# OpenClaw 安装与运行教程

> OpenClaw 是一款开源的 AI 个人助手，运行在你自己的机器上，通过聊天应用（Slack、Telegram、WhatsApp、Discord 等）或 Web 控制面板与之交互。它能帮你处理邮件、管理日历、写代码、控制智能家居、抓取网页数据等——就像一个 24 小时在线的私人助理。
> 
> - 官网：https://openclaw.ai/
> - GitHub：https://github.com/openclaw/openclaw
> - 官方文档：https://docs.openclaw.ai/zh-CN/start/wizard

---

```js_darkmode__1
点击上方 程序员成长指北，关注公众号
回复1，加入高级Node交流群
```
## 一、安装与配置（从零到可用）

整个过程分 3 步：安装 OpenClaw → 运行 onboard 向导（配置 AI 模型 + 聊天渠道 + 技能 + Gateway）→ 开始使用。

### 第 1 步：安装 OpenClaw

```
npm install -g openclaw
```
验证安装：

```
openclaw --version
```
看到版本号即安装成功。

#### 其他安装方式

如果 npm 安装不适合你，还有以下替代方式：

**官方安装脚本（一键安装）：**

macOS / Linux：

```
curl -fsSL https://openclaw.ai/install.sh | bash
```
Windows PowerShell：

```
iwr
 
-useb
 https://openclaw.ai/install.ps1 | 
iex
```
**从源码安装（适合开发者）：**

```
git clone https://github.com/openclaw/openclaw.git
cd openclaw
pnpm install
pnpm build
```
### 第 2 步：运行初始化向导

```
openclaw onboard
```
向导会交互式引导你完成**所有配置**，包括：AI 模型、聊天渠道、技能、Hooks、Gateway 服务安装等。

#### 2.1 安全提示

首先会显示安全警告，阅读后选择 **Yes** 继续。

#### 2.2 选择 Onboarding 模式

```
◇  Onboarding mode
│  QuickStart
```
选择 **QuickStart**（推荐），会自动配置网关端口（18789）、绑定地址（127.0.0.1）等默认设置。

#### 2.3 配置 AI 模型

选择 AI 模型提供商并输入 API Key：



| 提供商 | 获取 API Key | 备注 |
| --- | --- | --- |
| Anthropic Claude（推荐） | https://console.anthropic.com → 创建账号 → API Keys → Create Key | 需国际信用卡 |
| OpenAI GPT | https://platform.openai.com → API Keys → Create new secret key | 需国际信用卡 |
| OpenRouter（中国大陆推荐） | https://openrouter.ai → 注册 → Keys → Create Key | 支持多种支付方式，聚合多家模型 |
| DeepSeek（中国大陆推荐） | https://platform.deepseek.com → 注册 → API Keys → 创建 | 中国大陆服务商，支持支付宝充值 |
| Moonshot / Kimi | https://platform.moonshot.cn → 注册 → API Key 管理 → 新建 | 中国大陆服务商，支持国内支付 |
| 本地模型 | 支持 Ollama 等，无需 API Key | 免费，需本地算力 |


##### 中国大陆用户指南

由于 Anthropic 和 OpenAI 的 API Key 需要绑定国际信用卡，中国大陆用户可以选择以下更便捷的方案：

**方案一：使用 DeepSeek（最简单）**

DeepSeek 是中国大陆的大语言模型服务商，注册即可使用，支持支付宝充值：

```
◇  Model/auth provider
│  DeepSeek
│
◇  DeepSeek API key
│  （粘贴你的 DeepSeek API Key）
│
◇  Default model
│  deepseek/deepseek-chat
```
**方案二：使用 OpenRouter（一个 Key 访问多家模型）**

OpenRouter 是一个模型聚合平台，一个 API Key 即可访问 Claude、GPT、DeepSeek、Llama 等多家模型，支持多种支付方式：

```
◇  Model/auth provider
│  OpenRouter
│
◇  OpenRouter API key
│  （粘贴你的 OpenRouter API Key）
│
◇  Default model
│  openrouter/anthropic/claude-opus-4-6
```
**方案三：Claude 订阅用户使用 Token**

如果你已经有 Claude Pro/Team 订阅（https://claude.ai），可以通过以下命令生成 Token，无需额外申请 API Key：

```
claude setup-token
```
然后在向导中选择对应的认证方式：

```
◇  Model/auth provider
│  Anthropic
│
◇  Anthropic auth method
│  Claude.ai token
│
◇  Default model
│  anthropic/claude-opus-4-6
```
##### 国际用户（默认方案）

```
◇  Model/auth provider
│  Anthropic
│
◇  Anthropic auth method
│  Anthropic API key
│
◇  Default model
│  anthropic/claude-opus-4-6
```
> 💡 如果环境变量中已有 API Key（如 `ANTHROPIC_API_KEY`），向导会自动检测并询问是否使用。

#### 2.4 选择聊天渠道

向导会显示所有支持的聊天渠道状态，然后让你选择：

```
◇  Select channel (QuickStart)
│  Slack (Socket Mode)
```
选择你要配置的渠道。如果暂时不需要，可以跳过（后续通过 `openclaw configure` 补充）。

> 以下以 **Slack** 为例，详见第 3 步。

配置完成后可运行诊断命令验证：

```
openclaw doctor
```
全部显示 ✅ 即表示配置成功。

### 第 3 步：配置 Slack 聊天渠道（可选）

在第 2.4 步选择 Slack 后，向导会提示你先去 Slack API 控制台创建 App 并获取 Token。以下是详细步骤：

> 💡 OpenClaw 支持多种聊天渠道（Telegram、WhatsApp、Discord、Signal 等），这里以 **Slack** 为例。

#### 3.1 创建 Slack App

1. 打开 Slack API 控制台
2. 点击 **Create New App** → 选择 **From scratch**
3. 输入 App 名称（如 `OpenClaw`），选择你的工作区
4. 点击 **Create App**

#### 3.2 配置 Bot 权限并安装到工作区

**手动配置方式**：

1. 在左侧菜单点击 **OAuth & Permissions**
2. 滚动到 **Bot Token Scopes**，点击 **Add an OAuth Scope**，添加以下权限：



| 权限 | 说明 |
| --- | --- |
| chat:write | 允许 Bot 发送消息 |
| channels:history | 读取公共频道消息历史 |
| channels:read | 访问公共频道信息 |
| groups:history | 读取私有频道消息历史 |
| im:history | 读取私聊消息历史 |
| mpim:history | 读取群组私聊消息历史 |
| users:read | 读取用户信息 |
| app_mentions:read | 读取 @提及消息 |
| reactions:read | 读取表情回应 |
| reactions:write | 添加表情回应 |
| pins:read | 读取置顶消息 |
| pins:write | 置顶消息 |
| emoji:read | 读取自定义表情 |
| commands | 支持斜杠命令 |
| files:read | 读取文件 |
| files:write | 上传文件 |
| 3. 还需要配置以下内容： |   |


- **Socket Mode**：左侧菜单 → Socket Mode → 开启
- **Event Subscriptions**：左侧菜单 → Event Subscriptions → 开启，添加以下 Bot Events：  
  `app_mention`、`message.channels`、`message.groups`、`message.im`、`message.mpim`、`reaction_added`、`reaction_removed`、`member_joined_channel`、`member_left_channel`、`channel_rename`、`pin_added`、`pin_removed`
- **App Home**：左侧菜单 → App Home → 开启 **Messages Tab** -> 勾选下面的 "Allow users to send Slash commands and messages from the messages tab"
- **Slash Commands**：添加 `/openclaw` 命令
1. 滚动到页面顶部，点击 **Install to**
2. 在弹出的授权页面点击 **Allow**
3. 安装完成后，复制页面上显示的 **Bot User OAuth Token**

> ⚠️ 这个 Token 以 `xoxb-` 开头，类似：`xoxb-xxxx-xxxx-xxxx-xxxxxx`  
> 请妥善保存，后面在 onboard 向导中需要输入。

#### 3.3 获取 App 级别 Token

1. 在左侧菜单点击 **Basic Information**
2. 滚动到 **App-Level Tokens** 区域
3. 点击 **Generate Token and Scopes**
4. 输入 Token 名称（如 `openclaw-socket`）
5. 点击 **Add Scope**，选择 `connections:write`
6. 点击 **Generate**
7. 复制生成的 Token

> ⚠️ 这个 Token 以 `xapp-` 开头，类似：`xapp-1-A1234567890-1234567890123-abcdef...` 同样请妥善保存。

#### 3.4 在 onboard 向导中输入 Token

回到 `openclaw onboard` 向导，当出现以下提示时依次输入：

```
◇  Enter Slack bot token (xoxb-...)
│  （粘贴第 3.2 步获取的 xoxb- 开头的 Bot Token）
│
◇  Enter Slack app token (xapp-...)
│  （粘贴第 3.3 步获取的 xapp- 开头的 App Token）
```
#### 3.5 配置频道访问权限

输入完 Token 后，向导会继续提示配置频道权限：

```
◇  Configure Slack channels access?
│  Yes
│
◇  Slack channels access
│  Allowlist (recommended)
│
◆  Slack channels allowlist (comma-separated)
│  #general, #projects（或留空）
```


| 提示 | 怎么填 |
| --- | --- |
| Configure Slack channels access? | 选 Yes |
| Slack channels access | 选 Allowlist (recommended) |
| Slack channels allowlist | 填入允许 Bot 响应的频道，逗号分隔 |


> 💡 **allowlist 怎么填**：
> 
> - 支持三种格式：`[#频道名](javascript:;)`、`频道名`、`频道ID`（如 `C123456`）
> - 示例：`[#general](javascript:;), [#private](javascript:;), C123456`
> - **留空**：Bot 在所有频道都能响应（适合测试）
> - **私聊始终可用**，allowlist 只影响频道中的 @提及响应

#### 3.6 配置技能（Skills）

频道配置完成后，向导会显示技能状态并询问是否配置：

```
◇  Skills status ────────────╮
│                            │
│  Eligible: 7               │
│  Missing requirements: 42  │
│  Blocked by allowlist: 0   │
│                            │
├────────────────────────────╯
│
◇  Configure skills now? (recommended)
│  Yes
```


| 提示 | 怎么填 |
| --- | --- |
| Configure skills now? | 选 Yes（推荐） |
| Show Homebrew install command? | Linux/macOS 用户选 Yes 查看安装命令，可稍后安装 |
| Preferred node manager for skill installs | 选 npm |
| Install missing skill dependencies | 可选 Skip for now（跳过，后续手动安装） |


接下来向导会逐一询问是否配置各技能的 API Key：

```
◇  Set GOOGLE_PLACES_API_KEY for goplaces?     → No（没有就跳过）
◇  Set GEMINI_API_KEY for nano-banana-pro?      → No
◇  Set NOTION_API_KEY for notion?               → No
◇  Set OPENAI_API_KEY for openai-image-gen?     → No
◇  Set OPENAI_API_KEY for openai-whisper-api?   → No
◇  Set ELEVENLABS_API_KEY for sag?              → No
```
> 💡 这些 API Key 都是可选的，用于特定技能。没有的话全部选 **No** 跳过即可，后续可通过 `openclaw configure` 随时补充。

#### 3.7 配置 Hooks（自动化钩子）

```
◇  Hooks ──────────────────────────────────────────────────────────╮
│                                                                  │
│  Hooks let you automate actions when agent commands are issued.  │
│  Example: Save session context to memory when you issue /new.    │
│                                                                  │
├──────────────────────────────────────────────────────────────────╯
│
◇  Enable hooks?
│  🚀 boot-md, 📝 command-logger, 💾 session-memory
```
建议**全部启用**（默认已全选），这三个 Hook 的作用：



| Hook | 作用 |
| --- | --- |
| boot-md | 启动时加载引导信息 |
| command-logger | 记录命令日志 |
| session-memory | 保存会话上下文到记忆 |


> 💡 后续可通过以下命令管理 Hooks：
> 
> - `openclaw hooks list` — 查看所有 Hooks
> - `openclaw hooks enable <name>` — 启用
> - `openclaw hooks disable <name>` — 禁用

#### 3.8 安装 Gateway 服务

向导会自动完成以下操作（无需手动干预）：

1. **Systemd 配置**（仅 Linux）：启用 systemd lingering，防止退出登录后服务被终止
2. **Gateway 服务安装**：自动安装 systemd 服务，确保网关持续运行

```
◇  Systemd ─────────────────────────────╮
│                                       │
│  Enabled systemd lingering for root.  │
│                                       │
├───────────────────────────────────────╯
│
◇  Gateway service installed.
```
安装完成后，向导会自动验证 Slack 连接：

```
Slack: ok (2180ms)
Agents: main (default)
```
看到 `Slack: ok` 表示 Slack 连接成功 ✅

#### 3.9 Control UI 信息

向导会显示 Web 控制面板的访问地址：

```
◇  Control UI ─────────────────────────────────────────────────────────────────────╮
│                                                                                  │
│  Web UI: http://127.0.0.1:18789/                                                 │
│  Web UI (with token): http://127.0.0.1:18789/#token=xxxxx                        │
│  Gateway WS: ws://127.0.0.1:18789                                                │
│                                                                                  │
├──────────────────────────────────────────────────────────────────────────────────╯
```
> 💡 记住这个地址，后续可以通过浏览器访问 Web 控制面板与 Bot 对话。  
> 也可以随时运行 `openclaw dashboard` 打开。

#### 3.10 孵化 Bot（Hatch）

这是 onboard 的最后一步，选择如何首次启动你的 Bot：

```
◇  How do you want to hatch your bot?
│  ● Hatch in TUI (recommended)
│  ○ Open the Web UI
│  ○ Do this later
```


| 选项 | 说明 |
| --- | --- |
| Hatch in TUI (recommended) ✅ | 直接在终端进入交互式 TUI 界面，与 Bot 对话并设定人设。推荐选这个。 |
| Open the Web UI | 打开浏览器 Web 控制面板完成初始化 |
| Do this later | 跳过，以后再做 |


选择 **Hatch in TUI** 后，会自动进入终端聊天界面：

```
openclaw tui - ws://127.0.0.1:18789 - agent main - session main

 Wake up, my friend!
```
Bot 会发送 "Wake up, my friend!" 作为第一条消息。你可以开始和它对话，告诉它你的需求和偏好——**描述越详细，后续体验越好**。

> 💡 退出 TUI：按 `Ctrl+C` 即可退出。Bot 的 Gateway 服务仍在后台运行。

#### 3.11 验证 Slack 连接

1. 打开你的 Slack 工作区
2. 在左侧栏找到 **OpenClaw**（如果没看到，点击 **+** → **Browse apps** 搜索）
3. 给它发一条私聊消息，比如：`你好`
4. 如果收到回复，说明配置成功 ✅

> 💡 你也可以在任意频道中 @OpenClaw 来调用它，比如：`@OpenClaw 帮我查一下今天的日程`

1. 如果出现 access not configured 则需要根据提示在终端上进行配置 `openclaw pairing approve slack <code>`

---

## 二、启动并使用

### 理解守护进程和 TUI 的区别

OpenClaw 有两个核心概念需要区分：



| 组件 | 说明 | 是否需要一直开着 |
| --- | --- | --- |
| Gateway 守护进程 | 后台服务，负责连接 Slack 等渠道、接收和处理消息。没有界面，默默运行。 | ✅ 是（开机自动启动） |
| TUI / Web 控制面板 | 聊天界面，方便你在终端或浏览器中直接和 Bot 对话。 | ❌ 否（需要时打开即可） |


> 💡 **关键点**：只要 Gateway 守护进程在后台运行，你就能通过 Slack 随时和 Bot 对话——**不需要打开 TUI 或 Web 控制面板**。TUI 和 Web 控制面板只是额外的聊天入口，关掉它们不影响 Slack 的使用。

### 下次开机后怎么用

onboard 向导已经自动安装了 Gateway 的 systemd 服务，**每次开机后 Gateway 会自动启动**，无需手动操作。

你可以通过以下命令确认 Gateway 是否在运行：

```
openclaw status
```
看到 `Gateway service: running` 和 `Slack: OK` 就说明一切正常，直接去 Slack 聊天即可。

### 打开终端聊天界面（TUI）

如果你更喜欢在终端中与 Bot 对话：

```
openclaw tui
```
> 💡 退出 TUI（`Ctrl+C`）不会停止 Gateway，Slack 仍然可以正常使用。

### 打开 Web 控制面板

你也可以通过浏览器和 Bot 对话：

```
openclaw dashboard
```
浏览器会自动打开 `http://localhost:18789`，你会看到一个聊天界面。

> 💡 如果 onboard 时显示了带 token 的 URL（如 `http://127.0.0.1:18789/[#token](javascript:;)=xxxxx`），可以直接用该 URL 访问，无需手动输入 token。

### 后台持续运行

onboard 向导已经自动安装了 Gateway 的 systemd 服务（Linux），Bot 会在后台持续运行。查看状态：

```
openclaw status
```
看到 `Gateway service: running` 和 `Slack: OK` 就说明一切正常。

### 手动管理 Gateway 服务

通常不需要手动操作，但以下命令在排查问题时可能用到：

```
# 查看 Gateway 状态
openclaw status

# 手动启动 Gateway（如果未自动启动）
openclaw gateway --force

# 查看实时日志
openclaw logs --follow

# 安装/卸载守护进程
openclaw daemon install
openclaw daemon uninstall
```
---

## 三、权限配置：让 OpenClaw 全自动

默认安装后，OpenClaw 很多操作需要手动确认（比如让它发邮件会提示你先装 SMTP）。只需一步配置即可解锁全自动模式。

### 3.1 一键开启全自动模式

编辑 `~/.openclaw/config.json`，粘贴以下配置：

```
{
  "agents": {
    "defaults": {
      "sandbox": { "mode": "off" }
    }
  },
  "tools": {
    "exec": {
      "security": "full",
      "ask": "off"
    },
    "elevated": {
      "enabled": true,
      "allowFrom": {
        "slack": ["你的 Slack 用户 ID"]
      }
    }
  }
}
```
> **如何获取 Slack 用户 ID**：打开 Slack → 点击左上角你的头像 → **Profile** → 点击右侧 **⋮** 更多按钮 → **Copy member ID**，得到的 `U0XXXXXXX` 格式字符串就是你的 ID。
> 
> 如果用 Discord/WhatsApp 等其他渠道，把 `"slack"` 换成对应渠道名并填入你的 ID。  
> 配置后重启 Gateway：

```
openclaw gateway --force
```
**效果**：OpenClaw 可以在你的机器上自主执行任何操作，不再弹审批提示。

> ⚠️ 此配置仅适合**个人设备**。如果是共享服务器，参考官方安全文档做更细粒度的配置。

### 3.2 配置 Gmail 邮件

不需要手动装 SMTP。开启全自动模式后，直接在 Slack 跟 OpenClaw 说：

```
帮我配置 Gmail 邮件，我的邮箱是 your-email@gmail.com
```
OpenClaw 会自动安装所需依赖（`gog`、`gcloud` 等）、运行配置命令，只在需要你登录 Google 账号授权时才会提示你操作。

> 如果 OpenClaw 还不够聪明没有自动装依赖，也可以手动一条命令搞定：
> 
> ```
> npm install -g gog && openclaw webhooks gmail setup --account your-email@gmail.com
> ```
> 
> `gcloud` CLI 未安装的话参考 安装指南，装完后执行 `source ~/.bashrc` 刷新环境变量。

### 3.3 哪些必须自己配？



| 必须手动配置 | 一句话说明 |
| --- | --- |
| AI 模型 API Key | openclaw onboard 时填写（中国大陆用户推荐 DeepSeek 或 OpenRouter，详见 2.3 节） |
| 聊天渠道 Token | openclaw onboard 时填写 |
| Gmail 授权 | 需要本人登录 Google 账号授权 |


**其他所有操作**（装依赖、跑脚本、发消息、改文件等）OpenClaw 都能自主完成，无需你干预。

---

## 四、OpenClaw 能做什么？（详细使用示例）

配置好 API Key 后，OpenClaw 就是一个**有手有脚的 AI 助手**——它不仅能聊天，还能操作你的电脑、访问互联网、执行代码。以下是具体的使用场景和示例。

### 场景 1：日常对话和问答

在 Slack 或 Web 控制面板中直接发消息：

```
你：今天北京天气怎么样？
OpenClaw：北京今天晴，气温 -2°C ~ 8°C，北风 3-4 级...

你：帮我用中文总结一下这篇文章 https://example.com/article
OpenClaw：这篇文章主要讲了三个要点：1)... 2)... 3)...
```
### 场景 2：执行 Shell 命令和写代码

OpenClaw 可以直接在你的机器上执行命令：

```
你：帮我看一下当前目录有哪些文件，按大小排序
OpenClaw：我来执行一下...
（OpenClaw 自动执行 ls -lhS 或 dir 命令，返回结果）

你：写一个 Python 脚本，把当前目录下所有 .jpg 文件批量重命名为 photo_001.jpg, photo_002.jpg ...
OpenClaw：好的，我来创建这个脚本...
（OpenClaw 自动创建 rename.py 文件并写入代码）
要我直接运行它吗？

你：运行吧
OpenClaw：已完成，共重命名了 23 个文件。
```
### 场景 3：邮件管理

> 💡 需先配置 Gmail，详见 第三节 3.2，一条命令搞定，无需手动装 SMTP。

```
你：帮我检查一下 Gmail 里有没有未读的重要邮件
OpenClaw：你有 3 封未读邮件：
1. 来自 boss@company.com - "Q1 预算审批"（2小时前）
2. 来自 hr@company.com - "年假余额提醒"（5小时前）
3. 来自 client@example.com - "合同确认"（昨天）

你：帮我回复第一封，说"收到，我会在今天下午 5 点前提交修改版本"
OpenClaw：邮件已发送 ✅
```
### 场景 4：日历和提醒

```
你：帮我创建一个提醒，明天下午 3 点和产品团队开会
OpenClaw：已创建日历事件 ✅
- 标题：产品团队会议
- 时间：明天 15:00
- 需要我提前 15 分钟提醒你吗？

你：好的，提前 15 分钟提醒
OpenClaw：已设置提醒 ✅
```
### 场景 5：网页浏览和数据抓取

OpenClaw 内置浏览器控制能力，可以帮你操作网页：

```
你：帮我去 GitHub trending 看看今天最火的 Python 项目有哪些
OpenClaw：我来查看一下...
（OpenClaw 自动打开浏览器访问 GitHub Trending）
今天 Python 热门项目 Top 5：
1. xxx/project-a ⭐ 2.3k - 一个用于...
2. xxx/project-b ⭐ 1.8k - 一个用于...
...

你：帮我把这个列表保存到 ~/Desktop/trending.md
OpenClaw：已保存 ✅
```
### 场景 6：文件操作

```
你：帮我把 ~/Downloads 里超过 30 天的文件移到回收站
OpenClaw：我来检查一下...
找到 47 个超过 30 天的文件，总大小 2.3 GB。
确认要移到回收站吗？

你：确认
OpenClaw：已完成 ✅ 清理了 47 个文件，释放 2.3 GB 空间。
```
### 场景 7：技能扩展（Skills）

OpenClaw 支持安装和创建技能插件，扩展更多能力：

```
你：帮我创建一个技能，每天早上 9 点自动查看 Hacker News 头条，然后发到我的 Slack
OpenClaw：好的，我来创建这个技能...
（OpenClaw 自动编写技能代码，设置定时任务）
技能已创建并启用 ✅ 明天早上 9 点你会收到第一条推送。
```
你也可以从社区安装现成的技能：

```
你：有没有 Todoist 的技能？
OpenClaw：有的，我来安装...
（自动安装 Todoist 技能）
已安装 ✅ 现在你可以说"帮我添加一个待办事项"来使用了。
```
### 场景 8：通过 Slack 远程控制

配置好 Slack 后，你可以在电脑或手机 Slack App 中随时发消息给 OpenClaw：

```
你（在 Slack 中）：帮我看一下服务器的 CPU 和内存使用率
OpenClaw：当前服务器状态：
- CPU: 23%
- 内存: 4.2 GB / 16 GB (26%)
- 磁盘: 120 GB / 500 GB (24%)
一切正常 ✅

你（在 Slack 中）：帮我重启一下 nginx
OpenClaw：已执行 sudo systemctl restart nginx ✅
nginx 已重启，状态正常。
```
---

## 五、常用命令速查



| 命令 | 说明 |
| --- | --- |
| openclaw onboard | 初始化配置向导（一站式完成所有配置） |
| openclaw tui | 打开终端聊天界面（TUI） |
| openclaw dashboard | 打开 Web 控制面板（浏览器聊天） |
| openclaw doctor | 诊断系统环境 |
| openclaw status | 查看运行状态 |
| openclaw configure | 修改配置（API Key、渠道等） |
| openclaw update | 更新到最新版本 |
| openclaw logs | 查看运行日志 |
| openclaw hooks list | 查看所有 Hooks |
| openclaw hooks enable <name> | 启用指定 Hook |
| openclaw hooks disable <name> | 禁用指定 Hook |
| openclaw security audit --deep | 深度安全审计 |
| openclaw daemon install | 安装后台守护进程 |
| openclaw daemon uninstall | 卸载后台守护进程 |


---

## 六、快速上手路线图

```
1. npm install -g openclaw          ← 安装
   ↓
2. openclaw onboard                 ← 一站式配置（AI 模型 + 渠道 + 技能 + Gateway）
   ↓
3. Hatch in TUI                     ← 在终端和 Bot 对话，设定人设
   ↓
4. openclaw dashboard               ← 打开浏览器 Web 控制面板
   ↓
5. 试试："帮我写一个 Python 脚本"    ← 体验 AI 执行任务
   ↓
6. 在 Slack 中随时和 AI 对话         ← 随时随地远程控制
```
---

## 参考链接

- **官网**：https://openclaw.ai/
- **官方文档**：https://docs.openclaw.ai/zh-CN/start/wizard
- **GitHub**：https://github.com/openclaw/openclaw
- **中文社区**：https://clawcn.net/install/
- **技能市场**：https://openclaw.ai/ → Skills & Plugins
- **Discord 社区**：https://openclaw.ai/ → Discord
- **Slack API 控制台**：https://api.slack.com/apps

Node 社群
