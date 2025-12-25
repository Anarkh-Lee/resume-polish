# Cloudflare Pages 部署指南

本指南详细介绍如何将 Resume.polish() 部署到 Cloudflare Pages。

---

## 前置条件

- [Cloudflare 账号](https://dash.cloudflare.com/sign-up)（免费）
- [GitHub 账号](https://github.com/)
- 已完成 [自部署指南](./SELF_HOSTING.md) 中的 Supabase 配置

---

## 第一步：准备代码仓库

### 1.1 Fork 或克隆项目到 GitHub

```bash
# 克隆项目
git clone <your-repo-url>
cd <project-folder>

# 推送到你的 GitHub 仓库
git remote set-url origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

### 1.2 确保项目结构正确

项目根目录应包含以下文件：
```
├── src/
├── public/
├── package.json
├── vite.config.ts
├── index.html
└── ...
```

---

## 第二步：创建 Cloudflare Pages 项目

### 2.1 登录 Cloudflare Dashboard

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 登录你的账号

### 2.2 创建新的 Pages 项目

1. 在左侧菜单中选择 **Workers & Pages**
2. 点击 **Create** 按钮
3. 选择 **Pages** 标签
4. 点击 **Connect to Git**

### 2.3 连接 GitHub

1. 点击 **Connect GitHub**
2. 授权 Cloudflare 访问你的 GitHub 账号
3. 选择包含项目代码的仓库
4. 点击 **Begin setup**

---

## 第三步：配置构建设置

### 3.1 基本设置

| 设置项 | 值 |
|--------|-----|
| **Project name** | `resume-polish`（或你喜欢的名称） |
| **Production branch** | `main` |
| **Framework preset** | `None`（选择 None，不要选择 Vite） |
| **Build command** | `npm install && npm run build` |
| **Build output directory** | `dist` |

> ⚠️ **重要**：
> - **必须选择 `None`** 作为 Framework preset，不要选择 Vite
> - **必须使用 `npm install && npm run build`** 作为构建命令
> - 这是因为项目的 `bun.lockb` 文件可能与 Cloudflare 的 bun 版本不兼容

### 3.2 环境变量（重要！）

在 **Environment variables** 部分，点击 **Add variable** 添加以下变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `VITE_SUPABASE_URL` | `https://<project-id>.supabase.co` | 你的 Supabase 项目 URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | `eyJhbGciOi...` | 你的 Supabase Anon Key |
| `VITE_SUPABASE_PROJECT_ID` | `<project-id>` | 你的 Supabase 项目 ID |
| `NODE_VERSION` | `20` | 指定 Node.js 版本 |
| SKIP_DEPENDENCY_INSTALL | true | 这样 Cloudflare 就不会自动运行 bun install，而是使用你指定的 npm install |

> ⚠️ **注意**：前端环境变量必须以 `VITE_` 开头才能被 Vite 识别

---

## 第四步：部署

### 4.1 首次部署

1. 确认所有设置正确
2. 点击 **Save and Deploy**
3. 等待构建完成（通常 1-3 分钟）

### 4.2 查看部署状态

部署过程中可以查看：
- **构建日志**：实时查看构建过程
- **部署状态**：成功/失败提示

### 4.3 访问你的网站

部署成功后，你将获得一个 URL：
```
https://resume-polish.pages.dev
```

或者你可以在项目设置中绑定自定义域名。

---

## 第五步：配置自定义域名（可选）

### 5.1 添加自定义域名

1. 进入你的 Pages 项目
2. 点击 **Custom domains** 标签
3. 点击 **Set up a custom domain**
4. 输入你的域名（如 `polish.yourdomain.com`）
5. 点击 **Continue**

### 5.2 DNS 配置

根据提示配置 DNS 记录：

**方式一：使用 Cloudflare DNS（推荐）**
- 将域名的 DNS 托管到 Cloudflare
- Cloudflare 会自动配置

**方式二：使用其他 DNS 提供商**
- 添加 CNAME 记录指向 `resume-polish.pages.dev`

### 5.3 SSL 证书

Cloudflare 会自动为你的域名配置免费 SSL 证书。

---

## 第六步：配置重定向规则

### 6.1 创建 `_redirects` 文件

在 `public/` 目录下创建 `_redirects` 文件：

```
# 单页应用路由支持
/*    /index.html   200
```

这确保 React Router 的客户端路由正常工作。

### 6.2 创建 `_headers` 文件（可选）

在 `public/` 目录下创建 `_headers` 文件来设置安全头：

```
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
```

---

## 自动部署

### GitHub 集成

连接 GitHub 后，每次推送到 `main` 分支都会自动触发部署：

```bash
# 修改代码后
git add .
git commit -m "Update feature"
git push origin main

# Cloudflare Pages 会自动检测并部署
```

### 预览部署

- 每个 Pull Request 都会生成一个预览 URL
- 格式：`https://<commit-hash>.resume-polish.pages.dev`

---

## 环境管理

### 生产环境 vs 预览环境

Cloudflare Pages 支持为不同环境设置不同的环境变量：

1. 进入项目 **Settings** → **Environment variables**
2. 选择 **Production** 或 **Preview** 环境
3. 添加相应的环境变量

### 更新环境变量

1. 进入项目 **Settings** → **Environment variables**
2. 点击变量旁边的编辑按钮
3. 修改值并保存
4. **重新部署**以使更改生效

```bash
# 触发重新部署
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

## 监控和日志

### 查看部署历史

1. 进入 Pages 项目
2. 点击 **Deployments** 标签
3. 查看所有部署记录

### 查看分析数据

1. 进入 Pages 项目
2. 点击 **Analytics** 标签
3. 查看访问量、带宽等数据

---

## 常见问题

### Q: 构建失败，提示 "lockfile had changes, but lockfile is frozen"

**原因：** 项目使用 `bun.lockb` 文件，但 Cloudflare 的 bun 版本可能不兼容

**解决方法：**
1. 确保 Framework preset 选择 **None**（不是 Vite）
2. 确保构建命令是 `npm install && npm run build`
3. 不要使用 `--frozen-lockfile` 选项

### Q: 构建失败，提示 "npm install failed"

**解决方法：**
1. 确保 `package.json` 中的依赖版本正确
2. 检查 Node.js 版本是否设置为 20
3. 查看构建日志中的具体错误信息

### Q: 页面显示 404

**解决方法：**
1. 确保 `_redirects` 文件在 `public/` 目录下
2. 检查 `vite.config.ts` 中的 `base` 配置

### Q: 环境变量不生效

**解决方法：**
1. 确保变量名以 `VITE_` 开头
2. 重新部署项目（环境变量更新后需要重新构建）
3. 检查 Production 和 Preview 环境的变量是否都设置了

### Q: API 请求失败

**解决方法：**
1. 检查 Supabase 项目是否正常运行
2. 确认 Edge Function 已部署
3. 检查环境变量是否正确
4. 查看浏览器控制台的具体错误

### Q: 自定义域名 SSL 证书错误

**解决方法：**
1. 等待 DNS 传播（最多 24 小时）
2. 确保 DNS 记录配置正确
3. 在 Cloudflare Dashboard 中检查 SSL 状态

---

## 性能优化

### 启用缓存

Cloudflare 默认会缓存静态资源。你可以通过 `_headers` 文件自定义缓存策略：

```
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.js
  Cache-Control: public, max-age=31536000, immutable

/*.css
  Cache-Control: public, max-age=31536000, immutable
```

### 使用 Cloudflare CDN

Cloudflare Pages 自动使用全球 CDN，无需额外配置。

---

## 费用说明

Cloudflare Pages **免费套餐**包含：

| 功能 | 免费额度 |
|------|---------|
| 构建次数 | 500 次/月 |
| 并发构建 | 1 个 |
| 带宽 | 无限制 |
| 请求数 | 无限制 |
| 站点数量 | 无限制 |

对于个人项目，免费套餐完全足够。

---

## 完整部署检查清单

- [ ] GitHub 仓库已创建并推送代码
- [ ] Supabase 项目已配置（数据库、Edge Function、Secrets）
- [ ] Cloudflare Pages 项目已创建
- [ ] 环境变量已设置（VITE_SUPABASE_URL、VITE_SUPABASE_PUBLISHABLE_KEY、VITE_SUPABASE_PROJECT_ID）
- [ ] Node.js 版本已设置为 20
- [ ] `_redirects` 文件已添加
- [ ] 构建成功
- [ ] 网站可访问
- [ ] API 调用正常

---

## 相关链接

- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)
- [Vite 部署指南](https://vitejs.dev/guide/static-deploy.html#cloudflare-pages)
- [自部署指南](./SELF_HOSTING.md)

---

## 许可证

MIT License
