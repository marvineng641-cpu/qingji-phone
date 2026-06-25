# 晴机 - GitHub Pages 部署指南

本文档提供将晴机应用部署到 GitHub Pages 的详细步骤。

## 前置准备

### 1. 安装 Git
如果还没有安装 Git，请访问 https://git-scm.com/downloads 下载并安装。

### 2. 注册 GitHub 账号
访问 https://github.com 注册一个 GitHub 账号（如果还没有）。

### 3. 确认项目已构建
确保项目已经成功构建：
```bash
cd c:/Users/Administrator/Desktop/晴机
npm run build
```
构建成功后，会在项目根目录生成 `dist` 文件夹。

---

## 第一步：初始化 Git 仓库

1. 打开 PowerShell 或命令提示符
2. 导航到项目目录：
```bash
cd c:/Users/Administrator/Desktop/晴机
```

3. 初始化 Git 仓库：
```bash
git init
```

4. 添加所有文件到暂存区：
```bash
git add .
```

5. 创建首次提交：
```bash
git commit -m "Initial commit"
```

---

## 第二步：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: 输入仓库名称（建议：`qingji-phone`）
   - **Description**: 可选，填写描述（例如：晴机 - 你的智能伴侣）
   - **Public/Private**: 选择 Public（公开）
3. **重要**：不要勾选以下选项：
   - ❌ Add a README file
   - ❌ Add .gitignore
   - ❌ Choose a license
4. 点击 **Create repository** 按钮

---

## 第三步：关联远程仓库

1. 在创建仓库后的页面，找到 "Quick setup" 部分
2. 复制 HTTPS 链接，格式类似：
   ```
   https://github.com/你的用户名/qingji-phone.git
   ```
3. 在 PowerShell 中执行以下命令（替换为你的实际链接）：
```bash
git remote add origin https://github.com/你的用户名/qingji-phone.git
```

4. 设置主分支为 main：
```bash
git branch -M main
```

5. 推送代码到 GitHub：
```bash
git push -u origin main
```

如果提示输入用户名和密码：
- 用户名：输入你的 GitHub 用户名
- 密码：输入你的 **Personal Access Token**（不是 GitHub 密码）

### 获取 Personal Access Token（如果需要）

1. 访问 https://github.com/settings/tokens
2. 点击 **Generate new token (classic)**
3. 勾选 `repo` 权限
4. 点击 **Generate token**
5. 复制生成的 token（只显示一次，请妥善保存）

---

## 第四步：构建并部署到 gh-pages 分支

1. 确保在项目目录：
```bash
cd c:/Users/Administrator/Desktop/晴机
```

2. 构建生产版本：
```bash
npm run build
```

3. 将 dist 文件夹添加到 Git：
```bash
git add dist -f
```

4. 提交更改：
```bash
git commit -m "Deploy to GitHub Pages"
```

5. 推送到 gh-pages 分支：
```bash
git subtree push --prefix dist origin gh-pages
```

---

## 第五步：启用 GitHub Pages

1. 访问你的 GitHub 仓库页面
2. 点击顶部的 **Settings** 标签
3. 在左侧菜单中找到并点击 **Pages**
4. 在 **Build and deployment** 部分：
   - **Source**: 选择 `Deploy from a branch`
   - **Branch**: 选择 `gh-pages`
   - **Folder**: 选择 `/ (root)`
5. 点击 **Save** 按钮

---

## 第六步：访问应用

1. 等待 1-2 分钟（GitHub 需要时间部署）
2. 在 Pages 页面会显示访问链接，格式为：
   ```
   https://你的用户名.github.io/qingji-phone/
   ```
3. 在浏览器中打开该链接即可访问应用

---

## 后续更新应用

当你修改代码后，需要重新部署：

1. 构建新版本：
```bash
cd c:/Users/Administrator/Desktop/晴机
npm run build
```

2. 提交代码更改（如果有）：
```bash
git add .
git commit -m "更新描述"
git push origin main
```

3. 部署到 GitHub Pages：
```bash
git add dist -f
git commit -m "Deploy to GitHub Pages"
git subtree push --prefix dist origin gh-pages
```

---

## 常见问题

### Q1: 推送时提示 "Authentication failed"
**A**: 使用 Personal Access Token 而不是 GitHub 密码。参考第三步中的说明。

### Q2: gh-pages 分支已存在，推送失败
**A**: 强制推送：
```bash
git push origin `git subtree split --prefix dist main`:gh-pages --force
```

### Q3: 访问链接显示 404
**A**: 
- 等待 2-3 分钟，GitHub 需要时间部署
- 检查 Pages 设置中的 Branch 是否正确
- 确认仓库名称与链接中的名称一致

### Q4: 应用可以打开但功能异常
**A**: 
- 确认使用 HTTPS 访问
- 检查浏览器控制台是否有错误
- 某些功能在移动端可能受限（应用会显示警告）

### Q5: 如何自定义域名
**A**: 
1. 在 Pages 设置中，点击 "Custom domain"
2. 输入你的域名
3. 按照提示配置 DNS 记录

---

## 技术支持

如果遇到问题：
- 检查 GitHub Pages 状态：https://www.githubstatus.com/
- 查看 GitHub 文档：https://docs.github.com/en/pages
- 检查浏览器控制台的错误信息

---

## 注意事项

1. **HTTPS**: GitHub Pages 自动提供 HTTPS，这是使用摄像头、麦克风等功能的前提
2. **存储限制**: IndexedDB 在某些移动浏览器有存储配额限制
3. **浏览器兼容性**: 建议使用现代浏览器（Chrome、Safari、Edge）
4. **PWA 安装**: 在移动浏览器中，可以"添加到主屏幕"以获得更好的体验

---

部署完成后，你就可以在任何设备上通过链接访问晴机应用了！
