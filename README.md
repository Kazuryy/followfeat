# FollowFeat

Self-hosted product feedback, roadmap and changelog — inspired by Featurebase.

## ✨ Features

### 👥 For users
- **📋 Feedback board** — Submit feature requests, bug reports and ideas; upvote, comment and tag posts by service/app
- **✏️ Edit own posts** — Authors can update their title, description and tags at any time
- **🗺️ Roadmap** — Kanban view of posts organised by status
- **📣 Changelog** — Versioned release notes with rich text and category badges
- **👤 User profiles** — Activity stats, post history, custom avatar color

### 🔧 For admins
- **📬 Post management** — Change status, pin/unpin, reject and delete posts
- **🎯 Roadmap management** — Drag & drop cards across status columns
- **📝 Changelog editor** — Rich text editor (Tiptap) with paste-from-markdown, featured image and category tags
- **🗂️ Boards** — Create and manage feedback categories (icon + color)
- **🏷️ Tags** — Manage service/app tags with custom colors
- **👥 Members** — List all users with stats (posts, votes, comments); promote/demote admin, ban/unban, delete
- **🔔 Notifications** — Email (SMTP) and Discord webhook alerts on new posts, status changes, comments and vote thresholds
- **🔑 API keys** — Generate and revoke keys for the REST API

### 🌐 REST API (v1)
- `POST /api/v1/changelog` — Create a changelog entry (Bearer key auth)
- `GET /api/v1/changelog/categories` — List changelog categories

---

## 🛠️ Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 App Router + TypeScript |
| Styling | Tailwind CSS v4 |
| Database | Prisma + SQLite |
| Auth | Better Auth v1 — Authentik OIDC via `genericOAuth` |
| Rich text | Tiptap v2 |
| Drag & drop | @dnd-kit |
| Font | Geist |

---

## 🚀 Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env`:

```env
DATABASE_URL="file:./data/followfeat.db"

# Generate with: openssl rand -hex 32
BETTER_AUTH_SECRET="your-random-secret"
BETTER_AUTH_URL="https://feedback.yourdomain.com"

# Authentik OIDC provider (see setup below)
AUTHENTIK_CLIENT_ID="your-client-id"
AUTHENTIK_CLIENT_SECRET="your-client-secret"
AUTHENTIK_ISSUER="https://auth.example.com/application/o/followfeat"

# Comma-separated emails — these users get the admin role on first login
ADMIN_EMAILS="you@example.com"

# Optional: change the exposed port (default: 3000)
APP_PORT=3000
```

### 3. Set up the database

```bash
mkdir -p data
pnpm db:migrate   # apply migrations
pnpm db:seed      # seed default boards and statuses
```

### 4. Start dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) 🎉

---

## 🔐 Authentik setup

1. In Authentik go to **Applications → Providers → Create** → choose **OAuth2/OpenID Provider**
2. Set **Redirect URIs**: `https://yourdomain.com/api/auth/callback/authentik`
3. Set **Scopes**: `openid email profile`
4. Set the **Authorization flow** to one that includes a consent stage with **Always require consent** if you want users to explicitly approve data sharing
5. Copy **Client ID**, **Client Secret** and the **OpenID Configuration URL** — use the URL *without* the `/.well-known/openid-configuration` suffix as `AUTHENTIK_ISSUER`

---

## 🐳 Docker Compose deployment

```bash
cp .env.example .env
# Edit .env with production values, then:

docker compose up --build -d
```

The SQLite database is stored in `./data/followfeat.db` (bind-mounted volume). Migrations and seeding run automatically on startup.

To expose a non-default port, set `APP_PORT` in `.env`:

```env
APP_PORT=8080
```

---

## 🛡️ Admin panel

Users whose email is listed in `ADMIN_EMAILS` receive the `admin` role on first login. Admins access `/admin` to manage posts, roadmap, changelog, boards, tags, members, notifications and API keys.

### 🔔 Notifications

Configure email and Discord notifications at `/admin/settings`:

| Event | Email | Discord |
|---|---|---|
| New post submitted | ✅ | ✅ |
| Post status changed | ✅ (to author) | — |
| New comment | ✅ (to author) | — |
| Vote threshold reached | ✅ | ✅ |

---

## 🌐 REST API

All v1 endpoints require a bearer token generated in `/admin/api-keys`.

### Create a changelog entry

```http
POST /api/v1/changelog
Authorization: Bearer <key>
Content-Type: application/json

{
  "title": "Better search",
  "content": "<p>We improved search relevance…</p>",
  "categories": ["New", "Improved"],
  "featuredImage": "https://cdn.example.com/img.png",
  "publishedAt": "2026-02-28T00:00:00Z",
  "state": "LIVE"
}
```

### List changelog categories

```http
GET /api/v1/changelog/categories
Authorization: Bearer <key>
```
