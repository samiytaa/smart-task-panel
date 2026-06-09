# Smart Task Panel

智能任务面板，用自然语言管理任务。

## 核心功能

**任务管理**
- 增删改查、状态切换、优先级、截止日期、标签
- 搜索、筛选（标签/状态）、排序（创建时间/优先级/截止日期）
- 批量操作、撤销、导入/导出 JSON

**AI 操作**
- 自然语言解析任务命令（新增/更新/删除/批量操作）
- 操作预览与确认机制
- 风险检测（误删、大批量变更）
- 支持 Gemini 或自定义 OpenAI 兼容接口

## 快速开始

需要 Node.js。

```bash
# 安装依赖
npm install

# 配置 Gemini API Key（可选）
echo GEMINI_API_KEY=your_key > .env.local

# 启动开发服务
npm run dev
```

访问 `http://localhost:3000`，在设置中配置 AI 后即可使用。

## 在线访问

🌐 **网站地址**: https://samiytaa.github.io/smart-task-panel/

📦 **GitHub 仓库**: https://github.com/samiytaa/smart-task-panel

## 本地开发与部署

### 开发环境
```bash
npm run build  # 构建前端和后端
npm start      # 启动生产服务
```

### 更新和部署到 GitHub Pages

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
# 1. 提交更改
git add .
git commit -m "your message"

# 2. 推送到 GitHub
git push origin main

# 3. GitHub Actions 会自动构建和部署
```

部署大约需要 2-3 分钟，完成后访问: https://samiytaa.github.io/smart-task-panel/
