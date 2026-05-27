# JavaScript API and UI Testing Example

This repository contains a small Task Tracker application that demonstrates how to test both an HTTP API and a browser-facing UI in JavaScript.

## What the app includes

- An Express API for listing, creating, and toggling tasks.
- A vanilla JavaScript UI that consumes the API.
- API tests written with Vitest and Supertest.
- UI tests written with Vitest and jsdom.

## Project structure

```text
src/
  server.js       Express application and API routes
  taskStore.js    In-memory task store used by the API
public/
  index.html      Browser UI markup
  app.js          UI behavior and API client
  styles.css      Basic styling
tests/
  api/            API integration tests
  ui/             UI interaction tests
```

## Getting started

Install dependencies:

```bash
npm install
```

Run the application:

```bash
npm start
```

Open `http://localhost:3000` in a browser.

## Running tests

Run the complete test suite:

```bash
npm test
```

Run only API tests:

```bash
npm run test:api
```

Run only UI tests:

```bash
npm run test:ui
```

## Testing approach

### API tests

The API tests create a fresh Express app with an isolated in-memory store for every test. They verify successful responses, validation errors, and not-found behavior through real HTTP requests handled by the Express app.

### UI tests

The UI tests mount the HTML elements in jsdom, inject a mocked API client, and verify user-facing behavior such as rendering tasks, submitting the form, showing errors, and refreshing data after a toggle action.
