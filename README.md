# FollowFeat

Self-hosted product feedback, roadmap and changelog — inspired by Featurebase.

## Features

- **Feedback board** — Feature requests with upvoting, comments, tags and status tracking
- **Roadmap** — Kanban view with drag & drop (admin only)
- **Changelog** — Rich text entries with categories (New, Improved, Fixed, Beta)
- **SSO via Authentik** — OpenID Connect integration with Better Auth
- **Self-hosted** — SQLite database, Docker Compose deployment

## Quick start

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="file:./data/followfeat.db"
BETTER_AUTH_SECRET="your-random-secret"
BETTER_AUTH_URL="http://localhost:3000"

# Authentik OIDC — create an OAuth2/OIDC provider in Authentik
# Redirect URI to set in Authentik: http://localhost:3000/api/auth/callback/authentik
AUTHENTIK_CLIENT_ID="your-client-id"
AUTHENTIK_CLIENT_SECRET="your-client-secret"
AUTHENTIK_ISSUER="https://auth.example.com/application/o/followfeat"

# These emails will get the admin role on first login
ADMIN_EMAILS="you@example.com"
```

### 3. Set up the database

```bash
mkdir -p data
pnpm db:migrate      # run migrations
pnpm db:seed         # seed default boards & statuses
```

### 4. Start the dev server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Authentik setup

1. In Authentik, go to **Applications → Providers → Create** → choose **OAuth2/OpenID Provider**
2. Set **Redirect URIs**: `https://yourdomain.com/api/auth/callback/authentik`
3. Set **Scopes**: `openid`, `email`, `profile`
4. Copy the **Client ID**, **Client Secret**, and the **OpenID Configuration URL** (use it as `AUTHENTIK_ISSUER` without the `/.well-known/openid-configuration` suffix)

---

## Docker Compose deployment

```bash
# Create a .env file with production values
cp .env.example .env
# Edit .env...

docker compose up --build -d
```

The database is stored in `./data/followfeat.db` (mounted as a volume).

---

## Admin access

The first user whose email matches `ADMIN_EMAILS` will get the `admin` role on login.
Admins can access `/admin` to:
- Change post statuses
- Pin/unpin posts
- Manage the roadmap via drag & drop
- Create and publish changelog entries (rich text editor)
