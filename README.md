# Resume.polish() - 程序员简历亮点润色神器

<p align="center">
  <strong>🚀 将大白话描述瞬间转化为专业简历话术</strong>
</p>

**演示地址：**https://refine.qzz.io

## ✨ 功能特点

- **免费使用**：每台设备免费 50 次润色机会，无需任何配置
- **一键润色**：输入你的工作描述，AI 自动生成三个版本的专业简历话术
- **多版本输出**：
  - 📝 **标准专业版** - 语言简练、用词专业
  - 📊 **数据驱动版** - 强调量化成果，突出数据价值
  - 🏆 **专家/架构师版** - 体现技术深度与商业影响力
- **多 AI 服务支持**：
  - 免费服务（内置，每设备 50 次）
  - OpenAI（需配置 API Key）
  - 自定义 API（兼容 OpenAI 格式的任意服务）
- **一键复制**：点击即可复制润色结果到剪贴板

## 🛠️ 技术栈

- **前端框架**：React 18 + TypeScript
- **构建工具**：Vite
- **UI 组件**：shadcn/ui + Tailwind CSS
- **后端服务**：Supabase Edge Functions
- **AI 服务**：支持多种 AI 提供商
- **使用量追踪**：基于设备 ID 的使用量统计
- **数据分析**：Google Analytics 4

## 🚀 快速开始

### 在线使用

直接访问部署后的网站即可使用，无需任何配置。默认使用免费服务，每台设备有 50 次免费润色机会。

### 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd <project-name>

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

## ⚙️ 配置说明

### AI 服务配置

点击页面右上角的设置图标，可以选择不同的 AI 服务提供商：

1. **免费服务（默认）**

   - 内置服务，无需配置
   - 每台设备 50 次免费使用机会
   - 基于 SiliconFlow API
2. **OpenAI**

   - 需要填写 OpenAI API Key
   - 可选择指定模型（默认 gpt-4o-mini）
3. **自定义 API**

   - 支持任何兼容 OpenAI Chat Completions 格式的 API
   - 需填写 API URL、API Key 和模型名称
   - 示例：SiliconFlow、Azure OpenAI、DeepSeek 等

### 环境变量

| 变量名                     | 说明                          | 默认值 |
| -------------------------- | ----------------------------- | ------ |
| `SILICONFLOW_API_KEY`      | SiliconFlow API Key（后端）   | -      |
| `VITE_GA_MEASUREMENT_ID`   | Google Analytics 4 衡量 ID    | -      |

## � 数据分析与追踪

本项目已集成 **Google Analytics 4 (GA4)**，用于了解用户行为和优化产品体验。

### 追踪的事件

| 事件类别 | 事件动作            | 事件标签           | 说明                             |
| -------- | ------------------- | ------------------ | -------------------------------- |
| Resume   | Polish Request      | `free/openai/custom` | 用户发起润色请求，标签为 AI 提供商 |
| Resume   | Copy Result         | `Version A/B/C`    | 用户复制润色结果，标签为版本类型 |
| Settings | Open Dialog         | -                  | 用户打开设置对话框               |
| Settings | Configure API       | `free/openai/custom` | 用户切换 AI 服务提供商           |
| -        | pageview            | 页面路径           | 页面浏览事件                     |

### GA4 配置步骤

1. 前往 [Google Analytics](https://analytics.google.com/) 创建账号和 GA4 属性
2. 获取衡量 ID（格式：`G-XXXXXXXXXX`）
3. 在 `.env` 文件中添加：
   ```env
   VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
   ```
4. 重启开发服务器或重新部署

### 隐私说明

- 本项目仅收集匿名的使用行为数据
- 不会追踪用户输入的具体简历内容
- 所有数据用于改进产品体验

如不希望被追踪，可以：
- 不配置 `VITE_GA_MEASUREMENT_ID` 环境变量
- 使用浏览器的隐私模式或广告拦截插件

## �📖 使用指南

1. 在输入框中输入你的工作描述（大白话即可）
2. 点击「AI 智能润色」按钮
3. 等待 AI 生成三个版本的润色结果
4. 选择最适合的版本，点击复制按钮
5. 将结果粘贴到你的简历中，并补充具体的数据

### 💡 Pro Tips

- **使用强动词开头**：重构、主导、设计、优化、推动
- **包含技术关键词**：Redis、Kubernetes、微服务、分布式
- **补充真实数据**：将 `[X]%` 替换为你的实际成果

## 📝 示例

**输入**：

> 我在项目中使用了 Redis 缓存。

**输出**：

| 版本          | 润色结果                                                                                                                                    |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| 标准专业版    | 设计并实施 Redis 缓存策略，有效减轻数据库负载，提升系统整体响应效率。                                                                       |
| 数据驱动版    | 引入 Redis 多级缓存架构，将核心接口 QPS 提升了 [X]%，平均响应时间从 [Y]ms 降低至 [Z]ms，显著优化用户体验。                                  |
| 专家/架构师版 | 主导高并发场景下的缓存架构升级，通过 Redis Cluster 解决缓存击穿、穿透与雪崩问题，设计热点数据预加载机制，成功支撑百万级日活用户的稳定访问。 |

## 🔧 自定义开发

### 项目结构

```
src/
├── components/          # UI 组件
│   ├── ui/              # shadcn 基础组件
│   ├── ResultCard.tsx   # 结果卡片组件
│   ├── LoadingSkeleton.tsx
│   └── SettingsDialog.tsx  # 设置弹窗
├── pages/
│   └── Index.tsx        # 主页面
└── integrations/
    └── supabase/        # Supabase 集成

supabase/
└── functions/
    └── polish-resume/   # AI 润色 Edge Function
```

### 修改 AI Prompt

如需自定义润色风格，可以修改 `supabase/functions/polish-resume/index.ts` 中的 `SYSTEM_PROMPT`。

### 使用量限制

免费服务的使用量限制可以在以下位置修改：

- 后端：`supabase/functions/polish-resume/index.ts` 中的 `FREE_USAGE_LIMIT`
- 前端：`src/components/SettingsDialog.tsx` 中的 `FREE_USAGE_LIMIT`

## 📄 开源协议

MIT License

---

<p align="center">
  Built for developers, by Anarkh-Lee 🚀
</p>
