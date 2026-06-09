# Smart Task Panel

智能任务面板，用自然语言管理任务。**纯静态网站，无需后端服务器**。

## 核心功能

**任务管理**
- 增删改查、状态切换、优先级、截止日期、标签
- 搜索、筛选（标签/状态）、排序（创建时间/优先级/截止日期）
- 批量操作、撤销、导入/导出 JSON

**AI 操作**
- 自然语言解析任务命令（新增/更新/删除/批量操作）
- 操作预览与确认机制
- 风险检测（误删、大批量变更）
- 支持任何 OpenAI 兼容 API（OpenAI、DeepSeek、Ollama、Claude 等）

## 在线访问

🌐 **网站地址**: https://samiytaa.github.io/smart-task-panel/

📦 **GitHub 仓库**: https://github.com/samiytaa/smart-task-panel

**首次使用**：点击右上角设置图标，配置您的 AI API 即可开始使用。

## AI 配置指南

本应用支持任何兼容 OpenAI API 格式的服务：

### 选项 1: OpenAI（推荐）
- **Base URL**: `https://api.openai.com/v1`
- **API Key**: 在 [OpenAI Platform](https://platform.openai.com/api-keys) 获取
- **Model**: `gpt-4o-mini` 或 `gpt-3.5-turbo`

### 选项 2: DeepSeek（便宜高效）
- **Base URL**: `https://api.deepseek.com/v1`
- **API Key**: 在 [DeepSeek Platform](https://platform.deepseek.com/) 获取
- **Model**: `deepseek-chat`

### 选项 3: Ollama（本地免费）
1. 安装并启动 Ollama
2. 配置：
   - **Base URL**: `http://localhost:11434/v1`
   - **API Key**: `ollama`（任意值）
   - **Model**: `llama3` 或其他已安装的模型

### 选项 4: 其他兼容服务
任何支持 OpenAI Chat Completions API 格式的服务都可以使用。

## 本地开发

需要 Node.js。

```bash
# 安装依赖
npm install

# 启动开发服务
npm run dev
```

访问 `http://localhost:3000`，在设置中配置 AI 后即可使用。

## 部署

### 自动部署到 GitHub Pages

项目配置了自动部署，推送到 main 分支后会自动触发构建和部署。

**使用部署脚本（推荐）**:
```powershell
# 完整部署流程（清理 + 构建 + 提交 + 推送）
.\deploy.ps1

# 快速更新（仅提交和推送）
.\update.ps1 "your commit message"

# 检查部署状态
.\check-status.ps1
```

**手动部署**:
```bash
# 1. 构建静态文件
npm run build

# 2. 提交更改
git add .
git commit -m "your message"

# 3. 推送到 GitHub
git push origin main

# 4. GitHub Actions 会自动部署
```

部署大约需要 2-3 分钟，完成后访问: https://samiytaa.github.io/smart-task-panel/

### 部署到其他静态托管服务

构建后的静态文件在 `dist` 目录，可以部署到：
- Vercel
- Netlify
- Cloudflare Pages
- GitHub Pages
- 或任何静态文件托管服务

## 数据隐私

- ✅ 所有任务数据保存在浏览器本地存储（localStorage）
- ✅ AI API 调用直接从浏览器发起，不经过第三方服务器
- ✅ API Key 保存在浏览器本地，不会上传到任何服务器
