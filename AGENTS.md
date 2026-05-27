# AGENTS.md

## Cursor Cloud specific instructions

This is a simple Express.js Task Tracker application with in-memory storage (no database).

### Quick reference

| Action | Command |
|---|---|
| Install deps | `npm install` |
| Dev server (port 3000, auto-reload) | `npm run dev` |
| Production start | `npm start` |
| Run all tests | `npm test` |
| Run API tests only | `npm run test:api` |
| Run UI tests only | `npm run test:ui` |

### Notes

- The app uses ES Modules (`"type": "module"` in `package.json`).
- No database or external services are needed; all data is stored in-memory via `src/taskStore.js`.
- Tests are fully self-contained: API tests spin up their own Express instance with an isolated store; UI tests use jsdom with mocked fetch. No running server is needed to execute tests.
- The dev server (`npm run dev`) uses Node's built-in `--watch` flag for auto-reload.
- No environment variables are required. `PORT` defaults to 3000 if unset.
- No lint tool is configured in the project; there is no `eslint` or similar setup.
