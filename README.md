# Task Manager

A full-stack task manager. Sign up, add tasks with priorities and due dates, then filter, sort,
search and move them from To do to Done. Each account only sees its own tasks, and admins can manage every user.

We built it as our bootcamp final project: a team of four working from one API contract, with real
authentication, user roles, a hosted PostgreSQL database and automated tests.

**Live app:** https://task-manager-mvv3.onrender.com
**Live API:** https://task-manager-api-yxso.onrender.com/api (health check: [/api/health](https://task-manager-api-yxso.onrender.com/api/health))
**Demo video:** https://drive.google.com/file/d/1uJISF0aMrYqWQRD7coLr198j6NV1l-Dw/view?usp=sharing

> The app runs on Render's free tier. If nobody has used it for 15 minutes, the first request can take up to a minute while the server wakes up.

## Screenshots

| Dashboard | Board view |
| --- | --- |
| ![Dashboard with the task list, filters and progress bar](docs/screenshots/dashboard.png) | ![Board view with To do, In progress and Done columns](docs/screenshots/board.png) |

| Create a task | Admin page |
| --- | --- |
| ![Form for creating a new task](docs/screenshots/create-task.png) | ![Admin page listing every user and task](docs/screenshots/admin.png) |

## Features

- Sign up, log in with username or email, and choose "remember me" to stay logged in for 7 days
- Create, view, edit and delete tasks with a title, description, status, priority and due date
- Search, filter by status and priority, and sort by created date or due date
- List and board views, with a progress bar and counts for each status and tasks due this week
- Light and dark theme
- Profile page with account details and password change
- Admin page to see and delete any user or task
- Passwords hashed with bcrypt, JWTs that expire, rate-limited login, validated and sanitized input, Helmet security headers

## Tech stack

- **Frontend:** React 18, React Router 7, Vite
- **Backend:** Node.js, Express 4, Sequelize
- **Database:** PostgreSQL (hosted on Supabase)
- **Auth and security:** JWT, bcrypt, Helmet, CORS, express-rate-limit, express-validator, sanitize-html
- **Testing:** Mocha, Supertest, Postman/Newman
- **Deployment:** Render (API as a web service, React app as a static site)

## Getting started

You need Node.js 20.19 or newer, npm and PostgreSQL (local, or a free hosted database such as Supabase).

**1. Clone the repository**

```bash
git clone https://github.com/CA-Tech-Warriors/task-manager.git
cd task-manager
```

**2. Install dependencies**

```bash
npm install
```

This installs the client and the server together (the repo uses npm workspaces).

**3. Set up environment variables**

```bash
cp server/.env.example server/.env   # Windows: copy server\.env.example server\.env
```

Open `server/.env` and set `DATABASE_URL` and `JWT_SECRET` (see the table below). The client needs no `.env` locally.

**4. Set up the database**

Create an empty database, then seed it:

```bash
createdb task_management
npm run seed
```

The seed creates the tables, the `admin` and `user` roles, two accounts (`admin` / `admin123` and `alice` / `alice123`) and a few sample tasks. It's safe to run again: it skips if the admin already exists.

**5. Run the app**

```bash
npm run dev
```

The API runs on http://localhost:3001 and the React app on http://localhost:5173. Open http://localhost:5173 and log in with one of the seeded accounts.

### Commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API and the React app together |
| `npm run dev:server` / `npm run dev:client` | Runs one of them |
| `npm test` | Runs the API tests (Mocha) |
| `npm run test:postman -w server` | Runs the Postman collection against your local API (needs `npm run dev` running) |
| `npm run build` | Builds the React app into `client/dist` |
| `npm run seed` | Adds the starter roles, users and tasks |
| `npm run format` | Formats the code with Prettier |

## Environment variables

**server/.env**

| Variable | Required | Example |
| --- | --- | --- |
| `PORT` | No | `3001` |
| `NODE_ENV` | No | `development` (set to `production` when deployed) |
| `DATABASE_URL` | Yes in production | `postgresql://postgres:postgres@localhost:5432/task_management` |
| `POSTGRES_SSL` | No | `true` for hosted databases like Supabase |
| `JWT_SECRET` | Yes in production | a long random string |
| `JWT_EXPIRES_IN` | No | `1d` |
| `JWT_REMEMBER_EXPIRES_IN` | No | `7d` |
| `CLIENT_URL` | Yes in production | `https://task-manager-mvv3.onrender.com` |
| `BCRYPT_ROUNDS` | No | `12` (minimum 10) |

**client/.env**

| Variable | Required | Example |
| --- | --- | --- |
| `VITE_API_URL` | Production only | `https://task-manager-api-yxso.onrender.com` (no `/api` at the end) |

Never commit a real `.env` file. Both folders have a `.env.example` to copy from.

## Deployment

- **API:** Render web service from the `staging` branch. Build `npm install`, start `npm start`, health check `/api/health`. Environment: `DATABASE_URL` (Supabase Session pooler), `POSTGRES_SSL=true`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`.
- **React app:** Render static site from the `staging` branch. Build `npm install && npm run build`, publish `client/dist`, environment `VITE_API_URL`, and a rewrite from `/*` to `/index.html` so page refreshes work.

Both redeploy automatically when a pull request is merged into `staging`.

## API

All endpoints, request bodies, status codes and the error format are documented in [docs/API.md](docs/API.md).

## Testing

- **Mocha + Supertest** (`npm test`): auth, tasks, admin, error format and database tests. Most use stubbed models, so they run without a database. The database tests skip when `DATABASE_URL` isn't set.
- **Postman/Newman** (`server/postman/`): 26 requests and 51 checks covering every route, including the error cases. It passes against both the local and the live API. See [server/postman/README.md](server/postman/README.md).

## Known issues

- On Render's free tier the API sleeps after 15 minutes without traffic, so the first request after that can take up to a minute.
- In production, login and registration are limited to 5 attempts per 15 minutes per network, to slow down password guessing. People sharing one network (like a classroom) share that limit.

## Team

| Name | Role | Built |
| --- | --- | --- |
| Chris | Database | Sequelize models and relationships, hosted Supabase database, seed script, database tests |
| Walter | Auth and security | Registration, login, JWT and role middleware, profile and password routes, rate limiting, light/dark theme |
| Sky | Tasks API | Task CRUD, validation and sanitizing, filters, search and sorting, stats, task tests |
| Rania | Admin, errors, deployment, docs | Admin routes and tests, shared error format, status code audit, Postman collection, Render deployment, React frontend, README |
