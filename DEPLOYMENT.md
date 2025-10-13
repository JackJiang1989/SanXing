# 部署指南 (Deployment Guide)

本文档详细说明如何将应用部署到 Render 平台。

## 📋 部署前检查清单

在开始部署前，请确认：

- ✅ 代码已推送到 GitHub
- ✅ 本地测试通过
- ✅ 环境变量配置正确
- ✅ 数据库模型已确认
- ✅ API 文档已验证

## 🚀 Render 部署步骤

### 阶段一：准备工作

#### 1. 创建 GitHub 仓库

```bash
# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit for deployment"

# 连接远程仓库
git remote add origin <your-github-repo-url>

# 推送
git push -u origin main
```

#### 2. 注册 Render 账号

1. 访问 https://render.com
2. 使用 GitHub 账号登录
3. 授权 Render 访问你的 GitHub 仓库

---

### 阶段二：部署后端 (Web Service)

#### 1. 创建 Web Service

1. 在 Render Dashboard 点击 **"New +"** → **"Web Service"**
2. 选择你的 GitHub 仓库
3. 点击 **"Connect"**

#### 2. 配置后端服务

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| **Name** | `your-app-backend` |
| **Region** | Singapore (推荐，离中国最近) |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `uvicorn main:app --host 0.0.0.0 --port $PORT` |
| **Instance Type** | Free (测试) / Standard (生产) |

#### 3. 配置环境变量

在 **"Environment"** 部分添加：

```env
# Python 版本
PYTHON_VERSION=3.11.0

# 环境标识
DEBUG=False
ENVIRONMENT=production

# CORS 配置（稍后更新为前端 URL）
ALLOWED_ORIGINS=*

# 数据库 URL（如果使用 PostgreSQL）
# DATABASE_URL 会在连接数据库后自动添加
```

#### 4. 创建数据库（可选但推荐）

**如果使用 PostgreSQL：**

1. 在 Render Dashboard 点击 **"New +"** → **"PostgreSQL"**
2. 配置：
   - **Name**: `your-app-db`
   - **Database**: `your_app_db`
   - **Region**: 与后端相同
   - **Plan**: Free (测试) / Starter (生产)
3. 点击 **"Create Database"**
4. 复制 **"Internal Database URL"**
5. 回到后端服务的 Environment 设置
6. 添加环境变量：
   ```
   DATABASE_URL=<粘贴 Internal Database URL>
   ```

**如果使用 SQLite：**

- 不需要额外配置，但数据可能在重新部署时丢失
- 不推荐用于生产环境

#### 5. 部署

1. 点击 **"Create Web Service"**
2. 等待构建和部署（约 3-5 分钟）
3. 部署成功后会显示 URL，例如：
   ```
   https://your-app-backend.onrender.com
   ```

#### 6. 验证后端

访问以下 URL 确认部署成功：

- 健康检查：`https://your-app-backend.onrender.com/health`
- API 文档：`https://your-app-backend.onrender.com/docs`

预期响应：
```json
{
  "status": "healthy",
  "environment": "production",
  "database": "connected"
}
```

---

### 阶段三：部署前端 (Static Site)

#### 1. 创建 Static Site

1. 在 Render Dashboard 点击 **"New +"** → **"Static Site"**
2. 选择同一个 GitHub 仓库
3. 点击 **"Connect"**

#### 2. 配置前端服务

填写以下信息：

| 配置项 | 值 |
|--------|-----|
| **Name** | `your-app-frontend` |
| **Branch** | `main` |
| **Root Directory** | `frontend` |
| **Build Command** | `npm install && npm run build` |
| **Publish Directory** | `dist` |

#### 3. 配置环境变量

在 **"Environment"** 部分添加：

```env
# Node 版本
NODE_VERSION=18

# API 地址（使用步骤二获得的后端 URL）
VITE_API_URL=https://your-app-backend.onrender.com

# 环境标识
VITE_ENV=production
```

⚠️ **重要**：将 `your-app-backend.onrender.com` 替换为你实际的后端 URL

#### 4. 部署

1. 点击 **"Create Static Site"**
2. 等待构建和部署（约 2-3 分钟）
3. 部署成功后会显示 URL，例如：
   ```
   https://your-app-frontend.onrender.com
   ```

---

### 阶段四：连接前后端

#### 1. 更新后端 CORS 配置

1. 返回后端服务的 Environment 设置
2. 更新 `ALLOWED_ORIGINS` 环境变量：
   ```
   ALLOWED_ORIGINS=https://your-app-frontend.onrender.com
   ```
3. 点击 **"Save Changes"**
4. 服务会自动重新部署

#### 2. 验证连接

1. 访问前端 URL：`https://your-app-frontend.onrender.com`
2. 尝试注册/登录
3. 检查浏览器控制台是否有错误
4. 测试所有主要功能

---

## 📊 部署架构图

```
用户浏览器
    ↓
前端 (Static Site)
https://your-app-frontend.onrender.com
    ↓ API 请求
后端 (Web Service)
https://your-app-backend.onrender.com
    ↓ 数据操作
数据库 (PostgreSQL)
<internal database URL>
```

---

## 💰 成本估算

### 免费套餐（开发/测试）

| 服务 | 套餐 | 价格 | 限制 |
|------|------|------|------|
| 前端 | Static Site Free | $0 | 100 GB 带宽/月 |
| 后端 | Web Service Free | $0 | 15 分钟后休眠 |
| 数据库 | PostgreSQL Free | $0 | 1 GB, 90 天后删除 |
| **总计** | | **$0/月** | 适合测试 |

### 生产环境套餐（推荐）

| 服务 | 套餐 | 价格 | 特性 |
|------|------|------|------|
| 前端 | Static Site Free | $0 | 已足够 |
| 后端 | Web Service Standard | $25 | 不休眠，2GB RAM |
| 数据库 | PostgreSQL Starter | $7 | 10 GB，自动备份 |
| **总计** | | **$32/月** | 适合生产 |

---

## 🔧 自定义域名配置（可选）

### 1. 购买域名

推荐域名注册商：
- Namecheap
- GoDaddy
- 阿里云（需要备案）

### 2. 配置前端域名

1. 在前端服务的 Settings 中，找到 **"Custom Domains"**
2. 点击 **"Add Custom Domain"**
3. 输入你的域名，如 `www.yourdomain.com`
4. 按照指示在域名服务商添加 DNS 记录：
   ```
   Type: CNAME
   Name: www
   Value: your-app-frontend.onrender.com
   ```
5. 等待 DNS 传播（可能需要几分钟到几小时）

### 3. 配置后端域名

1. 在后端服务的 Settings 中，找到 **"Custom Domains"**
2. 添加域名，如 `api.yourdomain.com`
3. 添加 DNS 记录：
   ```
   Type: CNAME
   Name: api
   Value: your-app-backend.onrender.com
   ```

### 4. 更新环境变量

**前端：**
```env
VITE_API_URL=https://api.yourdomain.com
```

**后端：**
```env
ALLOWED_ORIGINS=https://www.yourdomain.com
```

---

## 🔄 自动部署设置

Render 默认启用自动部署，每次推送到 `main` 分支都会触发部署。

### 配置自动部署分支

1. 在服务的 Settings 中找到 **"Build & Deploy"**
2. 设置 **"Auto-Deploy"** 为 `Yes`
3. 选择 **"Branch"** 为 `main`

### 手动触发部署

1. 在服务页面点击 **"Manual Deploy"**
2. 选择 **"Deploy latest commit"**
3. 点击 **"Deploy"**

---

## 🐛 部署问题排查

### 问题 1: 构建失败

**症状**：显示 "Build failed"

**解决方案**：

1. 查看 **Deploy Logs**
2. 常见问题：
   - 依赖安装失败：检查 `package.json` 或 `requirements.txt`
   - 构建命令错误：检查配置是否正确
   - 环境变量缺失：添加必要的环境变量

### 问题 2: 服务启动失败

**症状**：构建成功但服务无法访问

**解决方案**：

1. 检查 **Logs** 标签页
2. 常见问题：
   - 端口配置错误：确保使用 `$PORT` 环境变量
   - 数据库连接失败：检查 `DATABASE_URL`
   - 缺少依赖：确认所有依赖都在配置文件中

### 问题 3: CORS 错误

**症状**：前端显示 "CORS policy blocked"

**解决方案**：

1. 确认后端 `ALLOWED_ORIGINS` 包含前端 URL
2. 检查 URL 格式（不要包含尾部斜杠）
3. 确保协议匹配（https vs http）

### 问题 4: 免费服务休眠

**症状**：首次访问需要等待 30-60 秒

**解决方案**：

**选项 A：升级到付费套餐**（推荐）
- 升级后端到 Standard ($25/月)

**选项 B：使用 Cron Job 保持唤醒**
1. 创建一个 Cron Job 服务
2. 每 10 分钟 ping 一次后端：
   ```bash
   curl https://your-app-backend.onrender.com/health
   ```

**选项 C：接受休眠**
- 适合开发/测试环境
- 用户首次访问会较慢

### 问题 5: 数据库连接错误

**症状**：显示 "could not connect to database"

**解决方案**：

1. 确认 `DATABASE_URL` 环境变量正确设置
2. 检查数据库服务是否正常运行
3. 确认使用了 **Internal Database URL**（内网地址更快）
4. 检查 `requirements.txt` 包含 `psycopg2-binary`

---

## 📱 移动端访问优化

### 1. PWA 配置（可选）

在 `frontend/public` 创建 `manifest.json`：

```json
{
  "name": "哲思日记",
  "short_name": "哲思",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#000000",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    }
  ]
}
```

### 2. 响应式设计检查

确保在 Tailwind 中使用响应式类：
- `sm:` - 640px+
- `md:` - 768px+
- `lg:` - 1024px+

---

## 🔐 生产环境安全检查

### 部署前安全清单

- [ ] 后端 `DEBUG=False`
- [ ] CORS 配置了具体域名（不是 `*`）
- [ ] 数据库使用强密码
- [ ] 环境变量不在代码中硬编码
- [ ] `.env` 文件已添加到 `.gitignore`
- [ ] API 接口添加了适当的认证
- [ ] 敏感数据不在日志中输出

---

## 📊 监控和日志

### 查看日志

1. 在 Render Dashboard 选择服务
2. 点击 **"Logs"** 标签
3. 实时查看应用日志

### 配置日志级别

**后端 (`main.py`)：**
```python
import logging

if DEBUG:
    logging.basicConfig(level=logging.DEBUG)
else:
    logging.basicConfig(level=logging.WARNING)
```

### 监控指标

Render 提供的监控：
- CPU 使用率
- 内存使用
- 请求数量
- 响应时间

在服务页面查看 **"Metrics"** 标签

---

## 🔄 数据库迁移

### 备份数据

```bash
# 从 Render 导出数据库
pg_dump $DATABASE_URL > backup.sql
```

### 恢复数据

```bash
# 导入到新数据库
psql $NEW_DATABASE_URL < backup.sql
```

---

## 📈 性能优化

### 前端优化

1. **启用 Gzip 压缩**（Render 自动启用）
2. **优化图片**：使用 WebP 格式
3. **代码分割**：使用 React.lazy()
4. **缓存配置**：在 `_headers` 文件中设置缓存

### 后端优化

1. **数据库索引**：为常用查询添加索引
2. **连接池**：配置 SQLAlchemy 连接池
3. **缓存**：使用 Redis 缓存热数据
4. **异步处理**：使用 FastAPI 的异步特性

---

## 🌍 多地区部署（高级）

如果需要服务全球用户：

1. **使用 CDN**：
   - Cloudflare（免费）
   - 阿里云 CDN（国内）

2. **多区域部署**：
   - 美国：服务美洲用户
   - 新加坡：服务亚洲用户
   - 欧洲：服务欧洲用户

3. **智能 DNS**：
   - 根据用户位置路由到最近的服务器

---

## 📞 获取帮助

### Render 支持

- 文档：https://render.com/docs
- 社区：https://community.render.com
- 支持：support@render.com

### 项目相关

- GitHub Issues：提交 Bug 或功能请求
- 项目维护者：联系方式

---

## ✅ 部署完成清单

部署完成后，确认以下项目：

- [ ] 前端可以正常访问
- [ ] 后端 API 正常响应
- [ ] 用户注册/登录功能正常
- [ ] 数据可以正常保存和读取
- [ ] 所有页面都能正确加载
- [ ] 移动端显示正常
- [ ] 控制台没有错误
- [ ] 生产环境变量已正确配置
- [ ] 自定义域名已配置（如果需要）
- [ ] 监控和日志已设置

---

## 🎉 恭喜！

你的应用已成功部署到 Render！

**下一步：**
- 分享你的应用链接
- 收集用户反馈
- 持续迭代改进

**记住：**
- 定期备份数据
- 监控应用性能
- 及时更新依赖

Happy Deploying! 🚀