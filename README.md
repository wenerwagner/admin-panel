# Admin Panel

Administrative student management panel for Escola do Breno.

## Local Setup

The current scaffold starts with Docker Compose:

```sh
docker compose up --build
```

Default local URLs:

- Web app: `http://localhost:8080`
- API health: `http://localhost:3000/api/health`
- API through Caddy: `http://localhost:8080/api/health`
- PostgreSQL: `localhost:5432`

Optional local defaults are documented in [.env.example](.env.example). The stack also has built-in defaults, so an
`.env` file is not required for the scaffold.

The API validates environment variables before startup. For production-like runs, provide explicit values for
`DATABASE_URL`, `CSRF_SECRET`, session settings, CORS origins, proxy trust, and log level.

## Current Scope

Delivered so far:

- Root npm workspace scaffold
- TypeScript Express API scaffold with `GET /api/health`
- Vite React web scaffold with placeholder login and students pages
- Docker Compose stack with PostgreSQL, API, Caddy-served web app, and a persistent PostgreSQL volume
- Validated API environment configuration
- Prisma schema and initial migration for admins, sessions, and students

Not delivered yet:

- Admin login
- Student CRUD
- Admin seed or credentials

The main AI tool used for implementation work is Codex.
