# Changelog

[![Version](https://img.shields.io/github/v/release/h7ml/html2web?style=flat-square&logo=github&label=最新版本)](https://github.com/h7ml/html2web/releases)
[![Release Date](https://img.shields.io/github/release-date/h7ml/html2web?style=flat-square&logo=github&label=发布日期)](https://github.com/h7ml/html2web/releases)
[![Total Downloads](https://img.shields.io/github/downloads/h7ml/html2web/total?style=flat-square&logo=github&label=总下载量)](https://github.com/h7ml/html2web/releases)

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-07

### Added

#### 编辑器功能
- Monaco Editor 集成,支持语法高亮和智能提示
- HTML 和 Markdown 双模式切换
- 实时预览功能
- 所见即所得的编辑体验

#### 管理系统
- JWT 身份认证机制
- 文件 CRUD 完整操作 (创建/读取/更新/删除)
- 公开/私密文件访问控制
- 密码管理功能
- 管理员后台 Dashboard

#### 分享功能
- 生成永久分享链接
- 无需登录即可访问公开内容
- 完整 HTML 输出存储
- 一键复制分享链接

#### 实时通信
- Socket.IO 4.8.1 集成
- WebSocket 双向通信支持
- 为未来协作编辑功能预留接口

#### 数据库
- Prisma ORM 集成
- SQLite 默认数据库
- 支持切换到 PostgreSQL/MySQL
- 数据持久化存储

#### 代理功能
- HTTPS 代理 (`/proxy/:match/:url*`)
- HTTP 代理 (`/httpproxy/:match/:url*`)
- WebSocket 代理 (`/wsproxy/:match/:url*`, `/wssproxy/:match/:url*`)
- FTP 代理 (`/ftpproxy/:match/:url*`)
- API 转发至 nestjs.h7ml.cn (`/api/:path*`)

#### CI/CD
- GitHub Actions 工作流
- ESLint 代码检查
- TypeScript 类型检查
- Next.js 构建验证
- 多级缓存策略 (node_modules, Prisma Client, Next.js build)
- 自动发布 Release 工作流

### Performance

#### 缓存优化
- 静态资源长期缓存 (字体/JS/CSS - 1年)
- Next.js 增量构建缓存
- GitHub Actions CI 缓存优化
- Prisma Client 按需生成缓存

#### 构建优化
- 生产环境代码压缩
- Tree-shaking 优化
- 代码分割 (Code Splitting)

### Technical Stack

#### 核心框架
- Next.js 15.3.5 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS 4

#### UI 组件
- shadcn/ui (基于 Radix UI)
- Monaco Editor (@monaco-editor/react 4.7.0)
- Lucide React (图标库)
- Framer Motion (动画)
- Sonner (Toast 通知)

#### 后端 & 数据库
- Prisma 6.16.3
- SQLite
- Socket.IO 4.8.1
- jsonwebtoken (JWT)
- bcryptjs (密码加密)

#### Markdown 处理
- remark 15.0.1
- remark-gfm 4.0.1 (GitHub Flavored Markdown)
- rehype-highlight 7.0.2 (代码高亮)
- rehype-raw 7.0.0 (原始 HTML 支持)

#### 表单 & 验证
- React Hook Form 7.64.0
- Zod 4.1.12
- @hookform/resolvers 5.2.2

#### 工具库
- Axios 1.12.2
- date-fns 4.1.0
- uuid 11.1.0
- clsx + tailwind-merge

### Deployment

- **Platform**: Vercel
- **Production URL**: https://html2web.h7ml.cn
- **Environment Variables**:
  - `DATABASE_URL`: Database connection string
  - `JWT_SECRET`: JWT signing secret

### Documentation

- Complete README.md with setup instructions
- API documentation at `/api-docs`
- Comprehensive feature report (FEATURES_COMPLETE_REPORT.md)
- Project instructions (CLAUDE.md)

### Initial Release Notes

这是 HTML2WEB 的首次正式发布版本,包含完整的 HTML/Markdown 编辑、预览、分享功能,以及后台管理系统。项目已部署至 Vercel,提供稳定的在线服务。

欢迎使用和反馈!

---

[1.0.0]: https://github.com/h7ml/html2web/releases/tag/v1.0.0
