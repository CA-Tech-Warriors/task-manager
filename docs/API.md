# API contract

This is team card **T-1**. Frontend and backend both build against it, so change it here
first (in a PR everyone sees) before changing code.

Base path: `/api`. All bodies are JSON. Protected routes need `Authorization: Bearer <token>`.

## Values

| Field | Values |
| --- | --- |
| Task `status` | `todo`, `in-progress`, `done` |
| Task `priority` | `low`, `medium`, `high` |
| User `role` | `admin`, `user` |
| Dates | `dueDate` is `YYYY-MM-DD` or `null`. `createdAt` and `updatedAt` are ISO timestamps. |

The same values live in `server/src/constants.js` and `client/src/config.js`.

## Objects

```json
// user (never includes the password or its hash)
{ "id": 2, "username": "alice", "email": "alice@example.com", "role": "user", "createdAt": "2026-11-01T10:00:00.000Z" }

// task
{
  "id": 7, "title": "Deploy API to Render", "description": "Set env vars in Render.",
  "status": "todo", "priority": "high", "dueDate": "2026-11-16",
  "userId": 2, "createdAt": "2026-11-07T18:00:00.000Z", "updatedAt": "2026-11-07T18:00:00.000Z"
}
```

Admin task lists also include `"owner": "alice"`.

## Errors

Every error uses one shape. `errors` appears only when specific fields are wrong.

```json
{ "message": "Some of the details need fixing.", "errors": { "title": "Give your task a title." } }
```

| Status | When |
| --- | --- |
| 400 | Validation failed, bad JSON |
| 401 | No token, bad token, expired token, wrong login details |
| 403 | Logged in, but not allowed (non-admin on `/api/admin`) |
| 404 | Not found, or a task that belongs to someone else |
| 409 | Username or email already taken |
| 429 | Too many login or sign-up attempts |
| 500 | Server error (no stack trace in production) |
| 501 | Route exists but isn't built yet (scaffold placeholder) |
| 503 | Database not connected |

## Endpoints

| Method | Path | Body or query | Success |
| --- | --- | --- | --- |
| GET | `/api/health` | | 200 `{ status, database }` |
| POST | `/api/auth/register` | `{ username, email, password }` | 201 `{ token, user }` |
| POST | `/api/auth/login` | `{ username, password, rememberMe }` (`username` may be an email) | 200 `{ token, user }` |
| GET | `/api/auth/me` | | 200 `{ user }` |
| GET | `/api/auth/profile` | | 200 `{ user }` |
| PUT | `/api/auth/profile` | `{ username, email }` | 200 `{ user }` |
| PUT | `/api/auth/password` | `{ currentPassword, newPassword }` | 200 `{ message }` |
| GET | `/api/tasks` | `?status=&priority=&search=&sortBy=createdAt\|dueDate&order=asc\|desc` | 200 `[task]` |
| GET | `/api/tasks/stats` | | 200 `{ todo, "in-progress", done, dueThisWeek }` |
| POST | `/api/tasks` | `{ title, description?, status?, priority?, dueDate? }` | 201 `task` |
| GET | `/api/tasks/:taskId` | | 200 `task` |
| PUT | `/api/tasks/:taskId` | any task fields; missing fields stay unchanged | 200 `task` |
| DELETE | `/api/tasks/:taskId` | | 204 |
| GET | `/api/admin/users` | | 200 `[user]` |
| DELETE | `/api/admin/users/:userId` | | 204 |
| GET | `/api/admin/tasks` | | 200 `[task + owner]` |
| DELETE | `/api/admin/tasks/:taskId` | | 204 |

## Rules

- Passwords: at least 8 characters, with a letter and a number. Stored as bcrypt hashes (10+ rounds).
- Tokens expire after `JWT_EXPIRES_IN` (1 day), or `JWT_REMEMBER_EXPIRES_IN` (7 days) when `rememberMe` is true.
- `title` 1 to 100 characters, `description` up to 500. HTML is stripped before saving.
- Users only ever see and change their own tasks.
