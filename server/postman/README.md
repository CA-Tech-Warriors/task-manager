# Postman collection

Owner: D (card D-6). Every API endpoint, with status checks on each request.

| File | What it is |
| --- | --- |
| `TaskManagementAPI.postman_collection.json` | The requests and their checks |
| `local.postman_environment.json` | Points at your local server (`http://localhost:3001/api`) |
| `live.postman_environment.json` | Points at the deployed API on Render |

## What a run does

Each run registers a brand-new user, so it never clashes with earlier runs:

1. **Health:** the API is up and connected to the database
2. **Auth:** register, log in, wrong password (401), profile, update profile, change password (wrong current password is 400)
3. **Tasks:** no token (401), missing title (400), create, list with filters, stats, get one, update, delete, then get it again (404)
4. **Admin:** a regular user gets 403, admin logs in, lists users (no password hashes) and tasks (with owner names), deletes a task, can't delete itself (400), then deletes the run's user so test users don't pile up

## Run it from the terminal

From the `server` folder, with the API running:

```bash
npm run test:postman
```

Against the live API, pass the admin password on the command line. It's left blank in the live environment file on purpose, so it never gets committed:

```bash
npm run test:postman:live -- --env-var "adminPassword=THE-LIVE-ADMIN-PASSWORD"
```

The live API rate-limits login and sign-up to 5 attempts per 15 minutes. Each run uses 4, so wait 15 minutes between live runs (unless the limiter only counts failed attempts).

## Run it in Postman

1. **Import** the collection and both environment files.
2. Pick **Task Manager (Local)** or **Task Manager (Live)** in the environment dropdown (top right).
3. For Live, set `adminPassword` in the environment. Keep it in the **Current value** column only, so it isn't synced or shared.
4. Click the collection, then **Run**.

If a run fails partway, its test user may not get deleted. You can remove it from the Admin page; test users start with `pm`.
