# Smart Task Panel

智能任务面板。支持手动管理任务，也可以用自然语言让 AI 新增、修改、删除、完成任务。

## 功能

- 任务增删改查、完成状态、优先级、截止日期、标签
- 搜索、标签筛选、状态筛选、排序
- AI 指令解析任务操作
- 支持内置 Gemini，或配置 OpenAI 兼容接口

## 本地运行

需要 Node.js。

1. 安装依赖：

   ```bash
   npm install
   ```

2. 创建 `.env.local`，并配置 Gemini API key：

   ```env
   GEMINI_API_KEY=your_gemini_api_key
   ```

3. 启动开发服务：

   ```bash
   npm run dev
   ```

默认服务地址为 `http://localhost:3000`。
