# 开发指南 (Contributing Guide)

感谢你对本项目的关注！本文档将帮助你快速上手项目开发。

## 📋 目录

- [开发环境设置](#开发环境设置)
- [项目架构](#项目架构)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [Git 工作流](#git-工作流)
- [测试指南](#测试指南)
- [常见问题](#常见问题)

---

## 🛠️ 开发环境设置

### 前置要求

确保你的开发环境安装了：

- **Node.js** 18.0.0 或更高版本
- **Python** 3.11.0 或更高版本
- **Git** 2.0.0 或更高版本
- **代码编辑器**（推荐 VS Code）

### 快速设置

#### 1. 克隆项目

```bash
git clone <repository-url>
cd your-project
```

#### 2. 设置前端

```bash
cd frontend

# 复制环境变量模板
cp .env.example .env.development

# 编辑环境变量（如果需要）
# vim .env.development

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端开发服务器：http://localhost:5173

#### 3. 设置后端

```bash
cd backend

# 创建虚拟环境（推荐）
python -m venv venv

# 激活虚拟环境
# macOS/Linux:
source venv/bin/activate
# Windows:
venv\Scripts\activate

# 复制环境变量模板
cp .env.example .env.development

# 安装依赖
pip install -r requirements.txt

# 启动开发服务器
uvicorn main:app --reload
```

后端开发服务器：http://127.0.0.1:8000

API 文档：http://127.0.0.1:8000/docs

### VS Code 推荐扩展

在 VS Code 中搜索并安装：

**前端：**
- ESLint - 代码检查
- Prettier - 代码格式化
- Tailwind CSS IntelliSense - Tailwind 自动完成
- ES7+ React/Redux/React-Native snippets - React 代码片段

**后端：**
- Python - Python 支持
- Pylance - Python 语言服务器
- autoDocstring - 自动生成文档字符串

**通用：**
- GitLens - Git 增强
- Path Intellisense - 路径自动完成
- Todo Tree - TODO 标记

### VS Code 配置

创建 `.vscode/settings.json`：

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true
  },
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "eslint.validate": ["javascript", "javascriptreact"],
  "tailwindCSS.experimental.classRegex": [
    ["className\\s*[:=]\\s*['\"`]([^'\"`]*)['\"`]", "([^'\"`]*)"]
  ]
}
```

---

## 🏗️ 项目架构

### 整体架构

```
┌─────────────┐      HTTP/HTTPS      ┌──────────────┐
│   Browser   │ ◄──────────────────► │    React     │
│   (用户)     │                       │   Frontend   │
└─────────────┘                       └──────────────┘
                                             │
                                             │ API Calls
                                             ▼
                                      ┌──────────────┐
                                      │   FastAPI    │
                                      │   Backend    │
                                      └──────────────┘
                                             │
                                             │ ORM
                                             ▼
                                      ┌──────────────┐
                                      │  PostgreSQL  │
                                      │   Database   │
                                      └──────────────┘
```

### 前端架构

```
frontend/src/
├── api/                    # API 调用层
│   ├── config.js          # API 配置（URL、拦截器）
│   ├── auth.jsx           # 认证相关 API
│   ├── answer.jsx         # 答案相关 API
│   ├── question.jsx       # 问题相关 API
│   ├── user.jsx           # 用户相关 API
│   ├── folder.jsx         # 文件夹相关 API
│   └── activity.jsx       # 活动统计 API
│
├── components/            # 可复用组件
│   ├── Calendar.jsx       # 日历组件
│   ├── DailyQuestionsCard.jsx  # 每日问题卡片
│   ├── WriteAnswer.jsx    # 写答案组件
│   ├── Folders.jsx        # 文件夹列表
│   └── ...
│
├── pages/                 # 页面组件
│   ├── home/             # 首页相关
│   │   ├── homepage.jsx
│   │   └── Dashboard.jsx
│   ├── auth/             # 认证相关
│   │   ├── login.jsx
│   │   └── signup.jsx
│   ├── QA/               # 问答相关
│   ├── users/            # 用户设置
│   ├── question/         # 问题管理
│   ├── folder/           # 文件夹管理
│   └── activity/         # 活动统计
│
├── assets/               # 静态资源
│   ├── css/             # 样式文件
│   └── images/          # 图片
│
├── App.jsx              # 主应用组件（路由配置）
└── main.jsx             # 应用入口
```

### 后端架构

```
backend/
├── main.py              # 主应用文件
│   ├── 环境配置
│   ├── 数据库配置
│   ├── 中间件配置（CORS）
│   ├── 数据模型（Models）
│   │   ├── User
│   │   ├── Token
│   │   ├── Question
│   │   ├── Answer
│   │   ├── Folder
│   │   └── FolderQuestion
│   │
│   └── API 端点（Routes）
│       ├── 认证：/api/auth/*
│       ├── 问题：/api/question/*
│       ├── 答案：/api/answer/*
│       ├── 用户：/api/me, /api/user/*
│       ├── 文件夹：/api/folders/*
│       └── 活动：/api/user/activity
│
└── requirements.txt     # Python 依赖
```

### 数据流向

```
用户操作
    ↓
React Component
    ↓
API 调用函数 (api/*.jsx)
    ↓
HTTP Request
    ↓
FastAPI 端点
    ↓
业务逻辑处理
    ↓
SQLAlchemy ORM
    ↓
数据库操作
    ↓
返回响应
    ↓
React State 更新
    ↓
UI 重新渲染
```

---

## 🔄 开发流程

### 添加新功能的完整流程

#### 示例：添加"问题点赞"功能

##### 1. 后端开发

**步骤 1：定义数据模型**

```python
# backend/main.py

class QuestionLike(Base):
    __tablename__ = "question_likes"
    
    id = Column(String, primary_key=True, default=lambda: str(uuid4()))
    question_id = Column(String, ForeignKey("questions.id"))
    user_email = Column(String, ForeignKey("users.email"))
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # 关系
    question = relationship("Question", backref="likes")
    user = relationship("User")
```

**步骤 2：创建 Pydantic 模型**

```python
class LikeResponse(BaseModel):
    question_id: str
    likes_count: int
    user_has_liked: bool
```

**步骤 3：实现 API 端点**

```python
@app.post("/api/questions/{question_id}/like")
def like_question(
    question_id: str,
    user: User = Depends(get_current_user)
):
    db = SessionLocal()
    
    # 检查是否已点赞
    existing_like = db.query(QuestionLike).filter(
        QuestionLike.question_id == question_id,
        QuestionLike.user_email == user.email
    ).first()
    
    if existing_like:
        # 取消点赞
        db.delete(existing_like)
        db.commit()
        action = "unliked"
    else:
        # 添加点赞
        new_like = QuestionLike(
            question_id=question_id,
            user_email=user.email
        )
        db.add(new_like)
        db.commit()
        action = "liked"
    
    # 统计点赞数
    likes_count = db.query(QuestionLike).filter(
        QuestionLike.question_id == question_id
    ).count()
    
    db.close()
    
    return {
        "message": f"Question {action}",
        "likes_count": likes_count
    }
```

**步骤 4：测试 API**

访问：http://127.0.0.1:8000/docs

测试新端点是否正常工作

##### 2. 前端开发

**步骤 1：创建 API 调用函数**

```javascript
// frontend/src/api/question.jsx
import { apiUrl } from './config';

export async function likeQuestion(token, questionId) {
  const res = await fetch(apiUrl(`/api/questions/${questionId}/like`), {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error("点赞失败");
  return res.json();
}
```

**步骤 2：创建/更新组件**

```javascript
// frontend/src/components/QuestionCard.jsx
import { useState } from 'react';
import { likeQuestion } from '../api/question';

export default function QuestionCard({ question, token }) {
  const [likesCount, setLikesCount] = useState(question.likes_count || 0);
  const [isLiked, setIsLiked] = useState(question.user_has_liked || false);
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    setLoading(true);
    try {
      const result = await likeQuestion(token, question.id);
      setLikesCount(result.likes_count);
      setIsLiked(!isLiked);
    } catch (err) {
      console.error('点赞失败:', err);
      alert('点赞失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-lg p-4">
      <h3>{question.question_text}</h3>
      
      <button
        onClick={handleLike}
        disabled={loading}
        className={`mt-2 px-4 py-2 rounded ${
          isLiked ? 'bg-red-500 text-white' : 'bg-gray-200'
        }`}
      >
        {isLiked ? '❤️' : '🤍'} {likesCount}
      </button>
    </div>
  );
}
```

**步骤 3：测试功能**

1. 启动前后端服务
2. 在浏览器中测试点赞功能
3. 检查数据库是否正确记录

##### 3. 提交代码

```bash
# 创建功能分支
git checkout -b feature/question-like

# 提交更改
git add .
git commit -m "Add question like feature"

# 推送到远程
git push origin feature/question-like

# 创建 Pull Request
```

---

## 📏 代码规范

### JavaScript/React 规范

#### 1. 命名约定

```javascript
// ✅ 组件使用 PascalCase
function QuestionCard() { }

// ✅ 函数/变量使用 camelCase
const handleClick = () => { };
const userName = "John";

// ✅ 常量使用 UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.example.com";

// ✅ 文件名：组件用 PascalCase，其他用 camelCase
QuestionCard.jsx
apiHelper.js
```

#### 2. 组件结构

```javascript
// ✅ 推荐的组件结构
import { useState, useEffect } from 'react';
import { someApi } from '../api';

export default function MyComponent({ prop1, prop2 }) {
  // 1. Hooks
  const [state, setState] = useState(null);
  
  // 2. 副作用
  useEffect(() => {
    // ...
  }, []);
  
  // 3. 事件处理函数
  const handleClick = () => {
    // ...
  };
  
  // 4. 渲染逻辑
  if (!state) return <div>Loading...</div>;
  
  // 5. 主要 JSX
  return (
    <div className="container">
      <h1>{prop1}</h1>
      <button onClick={handleClick}>{prop2}</button>
    </div>
  );
}
```

#### 3. API 调用

```javascript
// ✅ 使用 try-catch 处理错误
async function fetchData() {
  try {
    const data = await someApi();
    // 处理数据
  } catch (error) {
    console.error('Failed to fetch:', error);
    // 显示错误提示
  }
}

// ✅ 在组件中使用
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetchData();
      // 更新状态
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  loadData();
}, []);
```

#### 4. Tailwind CSS 使用

```javascript
// ✅ 使用 Tailwind 工具类
<button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
  Click me
</button>

// ✅ 条件样式
<div className={`
  p-4 rounded
  ${isActive ? 'bg-blue-500' : 'bg-gray-200'}
  ${isLarge ? 'text-xl' : 'text-base'}
`}>
  Content
</div>

// ✅ 响应式设计
<div className="w-full md:w-1/2 lg:w-1/3">
  Responsive width
</div>
```

### Python/FastAPI 规范

#### 1. 命名约定

```python
# ✅ 类使用 PascalCase
class UserSettings:
    pass

# ✅ 函数/变量使用 snake_case
def get_user_settings():
    pass

user_email = "test@example.com"

# ✅ 常量使用 UPPER_SNAKE_CASE
DATABASE_URL = "postgresql://..."
```

#### 2. 类型注解

```python
# ✅ 使用类型注解
from typing import Optional, List

def get_questions(
    user_id: str,
    limit: Optional[int] = 10
) -> List[Question]:
    # ...
    pass

# ✅ Pydantic 模型
class UserCreate(BaseModel):
    email: EmailStr
    password: str
    username: Optional[str] = "Anonymous"
```

#### 3. API 端点规范

```python
# ✅ 清晰的端点定义
@app.post("/api/questions", response_model=QuestionResponse)
async def create_question(
    data: QuestionCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    创建新问题
    
    - **data**: 问题数据
    - **user**: 当前登录用户
    - **db**: 数据库会话
    """
    # 业务逻辑
    question = Question(
        question_text=data.question_text,
        created_by=user.id
    )
    db.add(question)
    db.commit()
    db.refresh(question)
    return question
```

#### 4. 错误处理

```python
# ✅ 使用 HTTPException
from fastapi import HTTPException

@app.get("/api/questions/{question_id}")
def get_question(question_id: str, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    
    if not question:
        raise HTTPException(
            status_code=404,
            detail=f"Question {question_id} not found"
        )
    
    return question
```

#### 5. 数据库操作

```python
# ✅ 使用 try-finally 确保连接关闭
@app.get("/api/data")
def get_data():
    db = SessionLocal()
    try:
        data = db.query(Model).all()
        return data
    finally:
        db.close()

# ✅ 更好的方式：使用依赖注入
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/api/data")
def get_data(db: Session = Depends(get_db)):
    return db.query(Model).all()
```

---

## 🌿 Git 工作流

### 分支策略

```
main (生产环境)
  │
  ├── develop (开发环境)
  │     │
  │     ├── feature/question-like (功能分支)
  │     ├── feature/user-profile (功能分支)
  │     └── bugfix/login-error (修复分支)
  │
  └── hotfix/critical-bug (紧急修复)
```

### 分支命名规范

```bash
# 新功能
feature/功能名称
feature/question-like
feature/user-avatar

# Bug 修复
bugfix/问题描述
bugfix/login-error
bugfix/cors-issue

# 紧急修复
hotfix/问题描述
hotfix/security-patch

# 文档更新
docs/更新内容
docs/api-documentation
```

### 提交信息规范

使用约定式提交（Conventional Commits）：

```bash
# 格式
<type>(<scope>): <subject>

# 类型（type）
feat:     新功能
fix:      Bug 修复
docs:     文档更新
style:    代码格式（不影响功能）
refactor: 重构
test:     测试相关
chore:    构建/工具相关

# 示例
feat(question): add like functionality
fix(auth): resolve token expiration issue
docs(readme): update installation instructions
style(frontend): format code with prettier
refactor(api): simplify user authentication logic
```

### 完整工作流示例

```bash
# 1. 更新主分支
git checkout main
git pull origin main

# 2. 创建开发分支（如果不存在）
git checkout -b develop

# 3. 创建功能分支
git checkout -b feature/question-like

# 4. 开发功能...
# 编辑文件

# 5. 提交更改
git add .
git commit -m "feat(question): add like functionality"

# 6. 推送到远程
git push origin feature/question-like

# 7. 创建 Pull Request
# 在 GitHub 上创建 PR: feature/question-like → develop

# 8. 代码审查通过后合并
git checkout develop
git merge feature/question-like

# 9. 测试通过后合并到 main
git checkout main
git merge develop
git push origin main

# 10. 删除功能分支
git branch -d feature/question-like
git push origin --delete feature/question-like
```

---

## 🧪 测试指南

### 前端测试

#### 手动测试清单

```markdown
## 登录/注册流程
- [ ] 可以成功注册新用户
- [ ] 可以用已注册用户登录
- [ ] 错误的密码显示错误信息
- [ ] Token 过期后跳转到登录页

## 问题浏览
- [ ] 可以查看每日推荐问题
- [ ] 可以查看所有问题列表
- [ ] 可以查看问题详情

## 答案功能
- [ ] 可以提交答案
- [ ] 可以编辑已提交的答案
- [ ] 可以查看历史答案

## 文件夹功能
- [ ] 可以创建文件夹
- [ ] 可以重命名文件夹
- [ ] 可以删除文件夹
- [ ] 可以添加问题到文件夹

## 活动统计
- [ ] 日历正确显示活跃天数
- [ ] 点击日期显示当天答案
- [ ] 月份切换正常

## 响应式设计
- [ ] 移动端显示正常
- [ ] 平板端显示正常
- [ ] 桌面端显示正常
```

### 后端测试

#### 使用 FastAPI 文档测试

1. 启动后端服务
2. 访问 http://127.0.0.1:8000/docs
3. 测试各个端点

#### 手动API 测试示例

```bash
# 测试注册
curl -X POST http://127.0.0.1:8000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 测试登录
curl -X POST http://127.0.0.1:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# 保存返回的 token
TOKEN="<your-token>"

# 测试获取用户信息
curl http://127.0.0.1:8000/api/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## ❓ 常见问题

### Q1: 如何添加新的 API 端点？

**步骤：**
1. 在 `backend/main.py` 中定义端点
2. 在 `frontend/src/api/` 中创建调用函数
3. 在组件中使用

### Q2: 如何修改数据库模型？

**步骤：**
1. 修改 `backend/main.py` 中的模型定义
2. 删除 `test.db` 文件（开发环境）
3. 重启后端服务（会自动创建新表）

**注意**：生产环境需要使用数据库迁移工具！

### Q3: 前端如何访问后端 API？

**开发环境**：
- 使用 Vite 代理：`/api/...` 自动转发到 `http://127.0.0.1:8000`

**生产环境**：
- 使用完整 URL：`https://your-backend.onrender.com/api/...`

### Q4: 如何调试 CORS 错误？

**检查清单：**
1. 后端 `ALLOWED_ORIGINS` 包含前端地址
2. 请求包含正确的 `Authorization` header
3. 前端 API URL 配置正确

### Q5: 如何重置数据库？

**开发环境（SQLite）：**
```bash
cd backend
rm test.db
uvicorn main:app --reload  # 会自动创建新数据库
```

**生产环境（PostgreSQL）：**
- 不要删除！使用数据库迁移工具

---

## 📚 学习资源

### 前端

- [React 官方文档](https://react.dev/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Vite 文档](https://vitejs.dev/)

### 后端

- [FastAPI 文档](https://fastapi.tiangolo.com/)
- [SQLAlchemy 文档](https://docs.sqlalchemy.org/)
- [Pydantic 文档](https://docs.pydantic.dev/)

### 工具

- [Git 教程](https://git-scm.com/book/zh/v2)
- [REST API 设计指南](https://restfulapi.net/)

---

## 🤝 贡献流程

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### Pull Request 模板

```markdown
## 描述
简要描述这个 PR 的目的

## 类型
- [ ] 新功能
- [ ] Bug 修复
- [ ] 文档更新
- [ ] 代码重构

## 更改内容
- 添加了 XXX 功能
- 修复了 YYY 问题
- 更新了 ZZZ 文档

## 测试
- [ ] 本地测试通过
- [ ] 所有功能正常
- [ ] 无控制台错误

## 截图（如果适用）
添加截图展示更改

## 相关 Issue
Closes #123
```

---

## 📞 获取帮助

- **GitHub Issues**: 报告 Bug 或提出功能请求
- **GitHub Discussions**: 讨论想法或提问
- **项目维护者**: 联系方式

---

## 🎉 感谢

感谢所有贡献者的辛勤付出！

Happy Coding! 💻✨