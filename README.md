# Task Manager

<!-- D-7: replace this section with the final description, screenshots and live URL before Nov 23. -->

A full-stack task manager. Sign up, add tasks with priorities and due dates, then filter, sort,
search and move them from To do to Done. Each account only sees its own tasks, and admins can manage every user.

**Live app:** [add the deployed URL]
**Demo video:** [add the link]

## Tech stack

- **Frontend:** React 18, React Router 6, Vite
- **Backend:** Node.js, Express 4, Sequelize
- **Database:** PostgreSQL
- **Auth and security:** JWT, bcrypt, Helmet, CORS, express-rate-limit, express-validator
- **Testing:** Mocha, Supertest, Postman/Newman

## Project structure

```
task-manager/
├── client/                 React app (Vite)
│   └── src/
│       ├── api/            fetch wrapper + one function per endpoint
│       ├── components/     layouts, route guards, task form, badges
│       ├── context/        auth and toast state
│       ├── pages/          one file per route
│       └── utils/
├── server/                 Express API
│   ├── src/
│   │   ├── config/         environment variables
│   │   ├── db/             Sequelize connection
│   │   ├── models/         User, Role, Task + relationships
│   │   ├── routes/         one router per area, mounted in routes/index.js
│   │   ├── controllers/    request handlers
│   │   ├── validators/     express-validator rules
│   │   ├── middleware/     auth, roles, validation, rate limit, errors
│   │   ├── utils/
│   │   ├── seed/           starter data
│   │   ├── app.js          builds the Express app
│   │   └── server.js       connects to the database and listens
│   ├── tests/
│   └── postman/
├── docs/
│   ├── API.md              the API contract
│   └── screenshots/
└── CONTRIBUTING.md         how the team works in this repo
```

## Getting started

You need Node.js 20 or newer, npm and PostgreSQL (local, or a free Render or Supabase database).

```bash
git clone <repo-url>
cd task-manager
npm install                          # installs client and server together
cp server/.env.example server/.env   # Windows: copy server\.env.example server\.env
# edit server/.env: set DATABASE_URL and JWT_SECRET
npm run seed                         # creates admin/admin123 and alice/alice123
npm run dev                          # API on :3001, React app on :5173
```

Open http://localhost:5173.

| Command | What it does |
| --- | --- |
| `npm run dev` | Runs the API and the React app together |
| `npm run dev:server` / `npm run dev:client` | Runs one of them |
| `npm test` | Runs the API tests |
| `npm run build` | Builds the React app into `client/dist` |
| `npm run seed` | Adds the starter roles, users and tasks |
| `npm run format` | Formats the code with Prettier |

## Environment variables

**server/.env**

| Variable | Required | Example |
| --- | --- | --- |
| `PORT` | No | `3001` |
| `DATABASE_URL` | Yes in production | `postgresql://postgres:postgres@localhost:5432/task_management` |
| `POSTGRES_SSL` | No | `true` for hosted databases |
| `JWT_SECRET` | Yes in production | a long random string |
| `JWT_EXPIRES_IN` | No | `1d` |
| `JWT_REMEMBER_EXPIRES_IN` | No | `7d` |
| `CLIENT_URL` | Yes in production | `https://your-app.onrender.com` |
| `BCRYPT_ROUNDS` | No | `12` (minimum 10) |

**client/.env**

| Variable | Required | Example |
| --- | --- | --- |
| `VITE_API_URL` | Production only | `https://your-api.onrender.com` |

## Features

- Sign up, log in with username or email, stay logged in
- Create, view, edit and delete tasks with title, description, status, priority and due date
- Search, filter by status and priority, sort by created or due date
- List and board views, with a progress bar
- Profile page with account details and password change
- Admin page to manage all users and tasks
- Passwords hashed with bcrypt, JWTs that expire, rate-limited login, validated input, Helmet headers

## Screenshots

<!-- Add at least 3: docs/screenshots/dashboard.png, create-task.png, board.png -->

## API

See [docs/API.md](docs/API.md).

## Known issues

<!-- List anything that doesn't work yet, or "None". -->

## Team

<!-- Names and what each person built. -->
