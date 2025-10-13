# 哲思日记 - Philosophical Writing App

一个基于 React + FastAPI 的个人哲学思考记录平台，帮助用户通过回答哲学问题进行深度思考和自我探索。

## ✨ 功能特性

- 📝 **每日问题推荐** - 每天推荐 3 个精选哲学问题
- 💭 **自由写作** - 记录你对问题的思考和答案
- 📊 **写作日历** - 可视化展示你的写作活跃度
- 📁 **问题收藏夹** - 创建文件夹整理你感兴趣的问题
- ✍️ **自定义问题** - 创建并分享你自己的哲学问题
- 👤 **用户管理** - 完整的用户认证和个人资料管理

## 🏗️ 技术栈

### 前端
- ⚛️ React 19
- 🎨 Tailwind CSS 4
- ⚡ Vite 7
- 🔄 React Router DOM 7

### 后端
- 🚀 FastAPI 0.104
- 🗄️ SQLAlchemy 2.0
- 🔐 Token-based 认证
- 📊 SQLite / PostgreSQL

## 📦 快速开始

### 前置要求

- Node.js 18+ 
- Python 3.11+
- Git

### 安装步骤

#### 1. 克隆项目

```bash
git clone <your-repository-url>
cd your-project
```

#### 2. 设置前端

```bash
cd frontend

# 复制环境变量模板
cp .env.example .env.development

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将在 http://localhost:5173 运行

#### 3. 设置后端

```bash
cd backend

# 复制环境变量模板
cp .env.example .env.development

# 创建虚拟环境（推荐）
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn main:app --reload
```

后端将在 http://127.0.0.1:8000 运行

API 文档：http://127.0.0.1:8000/docs

### 4. 访问应用

打开浏览器访问 http://localhost:5173

## ⚙️ 环境配置

### 前端环境变量

创建 `frontend/.env.development` 文件：

```env
# API 地址
VITE_API_URL=http://127.0.0.1:8000

# 环境标识
VITE_ENV=development
```

### 后端环境变量

创建 `backend/.env.development` 文件：

```env
# 调试模式
DEBUG=True

# 环境标识
ENVIRONMENT=development

# 数据库 URL（开发环境使用 SQLite）
DATABASE_URL=sqlite:///./test.db

# CORS 允许的源
ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

## 📝 可用脚本

### 前端

```bash
# 开发环境运行
npm run dev

# 生产环境构建
npm run build

# 预览生产构建
npm run preview

# 代码检查
npm run lint
```

### 后端

```bash
# 开发环境运行
uvicorn main:app --reload

# 生产环境运行
uvicorn main:app --host 0.0.0.0 --port 8000

# 查看 API 文档
# 访问 http://127.0.0.1:8000/docs
```

## 🗂️ 项目结构

```
.
├── frontend/                 # React 前端
│   ├── src/
│   │   ├── api/             # API 调用层
│   │   ├── components/      # React 组件
│   │   ├── pages/           # 页面组件
│   │   ├── assets/          # 静态资源
│   │   ├── App.jsx          # 应用主组件
│   │   └── main.jsx         # 应用入口
│   ├── .env.example         # 环境变量模板
│   ├── package.json         # 依赖配置
│   └── vite.config.js       # Vite 配置
│
├── backend/                  # FastAPI 后端
│   ├── main.py              # 主应用文件
│   ├── requirements.txt     # Python 依赖
│   └── .env.example         # 环境变量模板
│
├── README.md                # 项目说明（本文件）
├── DEPLOYMENT.md            # 部署指南
└── CONTRIBUTING.md          # 开发指南
```

## 🔑 主要功能说明

### 用户认证

- 注册：`POST /api/auth/signup`
- 登录：`POST /api/auth/login`
- 获取用户信息：`GET /api/me`

### 问题管理

- 获取每日问题：`GET /api/daily-questions`
- 获取所有问题：`GET /api/all_questions`
- 创建自定义问题：`POST /api/my-questions`
- 分享问题：`PUT /api/my-questions/{id}/share`

### 答案管理

- 保存答案：`POST /api/answer`
- 获取答案列表：`GET /api/answer`
- 更新答案：`PUT /api/answer/{id}`

### 文件夹管理

- 创建文件夹：`POST /api/folders`
- 获取文件夹列表：`GET /api/folders`
- 添加问题到文件夹：`POST /api/folders/{id}/questions`

### 活跃度统计

- 获取月度活跃度：`GET /api/user/activity`
- 获取某天的答案：`GET /api/user/answers/by-date`

## 🔒 安全说明

- ⚠️ **不要提交 `.env` 文件到 Git**
- ⚠️ **生产环境必须使用强密码**
- ⚠️ **生产环境必须配置正确的 CORS 白名单**
- ⚠️ **定期备份数据库**

## 🐛 问题排查

### 前端无法连接后端

1. 检查后端是否正常运行：访问 http://127.0.0.1:8000/health
2. 检查环境变量：`console.log(import.meta.env.VITE_API_URL)`
3. 检查浏览器控制台的 Network 标签

### CORS 错误

1. 确认后端 `ALLOWED_ORIGINS` 包含前端地址
2. 开发环境可以临时设置 `allow_origins=["*"]`
3. 检查前端请求的 URL 是否正确

### 数据库错误

1. 删除 `test.db` 文件重新创建
2. 检查 `DATABASE_URL` 配置是否正确
3. 确认数据库表已创建（FastAPI 会自动创建）

## 📚 更多文档

- [部署指南](./DEPLOYMENT.md) - 如何部署到 Render
- [开发指南](./CONTRIBUTING.md) - 如何参与开发

## 📄 许可证

MIT License

## 👥 贡献者

感谢所有为这个项目做出贡献的开发者！

## 📮 联系方式

如有问题或建议，欢迎提交 Issue 或 Pull Request。

---

**Happy Coding! 🎉**