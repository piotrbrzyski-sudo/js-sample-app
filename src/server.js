import express from "express";
import { createTaskStore } from "./taskStore.js";

export function createServer({ taskStore = createTaskStore() } = {}) {
  const app = express();

  app.use(express.json());
  app.use(express.static("public"));

  app.get("/api/tasks", (request, response) => {
    response.json({ tasks: taskStore.list() });
  });

  app.post("/api/tasks", (request, response, next) => {
    try {
      const task = taskStore.create(request.body);
      response.status(201).json({ task });
    } catch (error) {
      next(error);
    }
  });

  app.patch("/api/tasks/:id/toggle", (request, response) => {
    const task = taskStore.toggle(request.params.id);

    if (!task) {
      response.status(404).json({ error: "Task was not found." });
      return;
    }

    response.json({ task });
  });

  app.use((error, request, response, next) => {
    if (response.headersSent) {
      next(error);
      return;
    }

    response.status(error.status || 500).json({
      error: error.message || "Unexpected server error.",
      code: error.code || "SERVER_ERROR",
    });
  });

  return app;
}
