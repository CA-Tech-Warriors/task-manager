# Working together

Four people in one repo for two weeks. These rules keep merge conflicts small and rare.

## Who owns which files

Each card in Trello maps to files that one person owns. Work in your own files and you won't collide.

| Person | Track | Your files |
| --- | --- | --- |
| A | Database and models | `server/src/db/`, `server/src/models/`, `server/src/seed/`, `server/tests/database.test.js` |
| B | Auth and security | `server/src/routes/auth.routes.js`, `controllers/auth.controller.js`, `validators/auth.validators.js`, `middleware/auth.js`, `middleware/rateLimit.js`, `utils/tokens.js`, `tests/auth.test.js` |
| C | Tasks API | `server/src/routes/task.routes.js`, `controllers/task.controller.js`, `validators/task.validators.js`, `tests/tasks.test.js` |
| D | Admin, errors, deploy, docs | `server/src/routes/admin.routes.js`, `controllers/admin.controller.js`, `middleware/errorHandler.js`, `utils/ApiError.js`, `routes/health.routes.js`, `server/postman/`, `README.md` |
| Rania | Frontend | everything in `client/` |

**Shared files.** Post in the team chat before editing these, and keep the change small:
`server/src/app.js`, `server/src/routes/index.js`, `server/src/models/index.js`, `server/src/constants.js`,
`server/src/config/index.js`, `docs/API.md`, both `package.json` files.

The routes, middleware and error handling are already wired together, so most cards only touch
your own controller and validator.

## Branches

`staging` is where all our work comes together. `main` stays untouched until we merge the finished project at the end.

1. Start from the latest staging: `git checkout staging && git pull`
2. One branch per card, named after it: `git checkout -b b-3-login-with-email`
3. Commit small and often, with messages that say what changed: `Allow login with email (B-3)`
4. Before opening a PR, bring in staging: `git pull origin staging` and fix any conflicts on your branch
5. Open a pull request into staging. Fill in the template.
6. One other person reviews and approves. Then merge. Delete the branch.
7. Move the Trello card to Done.

Never push straight to staging or main. Merge staging into your branch at least once a day.

## Before you push

```bash
npm run format   # Prettier formats everyone's code the same way, so diffs stay small
npm test         # the smoke tests must stay green
```

Don't reformat or reorder code in files you don't own. It turns a one-line change into a conflict.

## Dependencies

Adding a package changes `package.json` and `package-lock.json`, which everyone shares.
Say so in the team chat, install it from the repo root (`npm install <name> -w server`), and merge that PR quickly.

## Secrets

Never commit `.env`. Share real values (database URL, JWT secret) privately, not in the repo or Trello.
