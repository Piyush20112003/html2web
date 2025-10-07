# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development
```bash
# Start development server with auto-reload (using custom Node.js server with Socket.IO)
npm run dev

# Build for production
npm run build

# Start production server (custom Node.js server with Socket.IO)
npm start

# Lint code
npm run lint
```

### Database Operations
```bash
# Push schema changes to database (no migration files)
npm run db:push

# Generate Prisma Client
npm run db:generate

# Create and run migration
npm run db:migrate

# Reset database and run all migrations
npm run db:reset

# Initialize admin account (username: admin, password: 123456)
npx tsx scripts/init-admin.ts
```

### Environment Setup
- Create `.env` file with `DATABASE_URL` (SQLite by default)
- Optional: Set `JWT_SECRET` for admin authentication (defaults to development key)

## Architecture Overview

### Custom Server Architecture
This project uses a **custom Node.js server** (server.ts) instead of Next.js's default server to integrate Socket.IO:
- The custom server wraps Next.js's request handler
- Socket.IO runs on the same server at `/api/socketio` path
- In development: nodemon watches for changes and restarts the entire server
- Next.js hot module replacement is disabled (`reactStrictMode: false`, `watchOptions.ignored: ['**/*']`)
- Server logs are written to `dev.log` (dev) and `server.log` (production)

**Key implication**: Changes to `server.ts` or Socket.IO setup require a full server restart, not just a hot reload.

### Database Layer (Prisma + SQLite)
- **Location**: `prisma/schema.prisma`, `src/lib/db.ts`
- **Models**:
  - `Admin`: Authentication for file management system
  - `File`: Stores HTML/Markdown content with admin ownership
  - `Share`: Public sharing of generated HTML/Markdown
  - `User`, `Post`: Example models (not actively used)
- **Pattern**: Singleton Prisma Client instance via `globalForPrisma` to prevent connection issues in development
- **Migration strategy**: Use `db:push` for quick schema changes; `db:migrate` for versioned migrations

### Socket.IO Integration
- **Setup**: `src/lib/socket.ts` - defines event handlers
- **Current implementation**: Simple echo server that broadcasts messages back to sender
- **Connection path**: `ws://localhost:3000/api/socketio`
- **Server-side**: Socket.IO server initialized in `server.ts`
- **Client example**: `examples/websocket/page.tsx` (uses `socket.io-client`)

### Admin System
- **Authentication**: JWT-based (default secret in code, override with `JWT_SECRET` env var)
- **API Routes**:
  - `POST /api/admin/auth` - Login, returns JWT token
  - `GET /api/admin/auth` - Verify token
  - `POST /api/admin/password` - Change password (requires auth)
- **Pages**:
  - `/admin/login` - Login page
  - `/admin` - File management dashboard (protected)
- **File management**: Admins can create/edit/delete HTML and Markdown files via API

### File System & APIs
- **File APIs** (`/api/files`):
  - `POST /api/files` - Create new file (admin only)
  - `GET /api/files` - List files
  - `GET /api/files/[id]` - Get file details
  - `PUT /api/files/[id]` - Update file
  - `DELETE /api/files/[id]` - Delete file
- **Markdown Processing** (`/api/markdown`):
  - POST endpoint converts Markdown to HTML
  - Uses `remark` + `remark-gfm` (GitHub Flavored Markdown)
  - Uses `rehype-highlight` for syntax highlighting (highlight.js)
- **Share System** (`/api/share`):
  - Generates public share links for HTML/Markdown
  - Stores full HTML output in database

### Monaco Editor Integration
- **Component**: `src/components/MonacoEditor.tsx`
- **Key detail**: Uses dynamic import with `ssr: false` to avoid server-side rendering issues
- **Usage pattern**:
  ```tsx
  const MonacoEditor = dynamic(() => import('@/components/MonacoEditor'), { ssr: false })
  ```

### UI Components
- Uses **shadcn/ui** components in `src/components/ui/`
- Component configuration: `components.json`
- Custom hooks: `src/hooks/` (includes `use-toast`, `use-mobile`)
- Utilities: `src/lib/utils.ts` (includes `cn` helper for className merging)

## Code Style & Conventions

### TypeScript Configuration
- Build errors ignored (`ignoreBuildErrors: true`)
- ESLint errors ignored during builds (`ignoreDuringBuilds: true`)
- **Reason**: Project prioritizes rapid iteration; add type checking to CI later if needed

### Import Patterns
- Use `@/` alias for `src/` directory (e.g., `import { db } from '@/lib/db'`)
- Database access: Always import from `@/lib/db`, never instantiate Prisma Client directly
- Client-side components requiring browser APIs: Use `'use client'` directive

### Chinese Comments
- Database operations and API responses use Chinese error messages
- Code comments are mixed Chinese/English (follow existing patterns)

## Common Patterns

### Authentication Middleware Pattern
APIs requiring admin access should:
1. Extract Bearer token from `Authorization` header
2. Verify JWT using `JWT_SECRET`
3. Query `db.admin.findUnique()` to validate admin still exists
4. Return 401 if token invalid/missing or admin not found

Example: See `/api/admin/auth/route.ts` GET handler

### File Type Handling
Files have a `type` field (`"html"` or `"markdown"`):
- Markdown files: Store raw markdown in `content`, rendered HTML in `htmlOutput`
- HTML files: Store HTML directly in both `content` and `htmlOutput`
- Frontend: Use Monaco Editor for editing both types

### Markdown Rendering Pipeline
When converting Markdown to HTML:
1. Parse with `remark` + `remark-gfm`
2. Transform to HTML with `remark-rehype` (allow raw HTML with `rehype-raw`)
3. Add syntax highlighting with `rehype-highlight`
4. Stringify with `rehype-stringify`

See `/api/markdown/route.ts` for reference implementation

## Development Notes

- **Hot reload limitations**: Server restarts on file changes (nodemon), not hot module replacement
- **Database**: SQLite file created at location specified in `DATABASE_URL`
- **First-time setup**: Run `npm run db:push` then `npx tsx scripts/init-admin.ts`
- **Port conflicts**: Server runs on port 3000 by default (hardcoded in `server.ts`)
- **WebSocket testing**: Use the example page at `/examples/websocket` (not linked in main UI)

## Tech Stack Context

- **Next.js 15**: Uses App Router exclusively, no Pages Router
- **React 19**: May have breaking changes from React 18; check documentation if hooks behave unexpectedly
- **Tailwind CSS 4**: Uses PostCSS plugin (`@tailwindcss/postcss`), not traditional config
- **shadcn/ui**: Components are copied into codebase (not npm package), modify freely
- **Prisma**: SQLite for simplicity; switching to PostgreSQL/MySQL requires schema and connection string changes only
