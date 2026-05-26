import request from "supertest";
import { beforeEach, describe, expect, it } from "vitest";
import { createServer } from "../../src/server.js";
import { createTaskStore } from "../../src/taskStore.js";

const seedTasks = [
  {
    id: 10,
    title: "Publish release notes",
    owner: "Mia",
    dueDate: "2026-06-10",
    completed: false,
  },
];

describe("Task API", () => {
  let app;

  beforeEach(() => {
    const taskStore = createTaskStore(seedTasks);
    app = createServer({ taskStore });
  });

  it("returns the current list of tasks", async () => {
    const response = await request(app).get("/api/tasks").expect(200);

    expect(response.body.tasks).toEqual(seedTasks);
  });

  it("creates a task with normalized input", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({
        title: "  Update onboarding checklist  ",
        owner: "",
        dueDate: "2026-06-12",
      })
      .expect(201);

    expect(response.body.task).toMatchObject({
      id: 11,
      title: "Update onboarding checklist",
      owner: "Unassigned",
      dueDate: "2026-06-12",
      completed: false,
    });
  });

  it("rejects a task without a title", async () => {
    const response = await request(app)
      .post("/api/tasks")
      .send({ title: "   ", owner: "Mia" })
      .expect(400);

    expect(response.body).toEqual({
      error: "Task title is required.",
      code: "VALIDATION_ERROR",
    });
  });

  it("toggles the completion state of an existing task", async () => {
    const response = await request(app).patch("/api/tasks/10/toggle").expect(200);

    expect(response.body.task).toMatchObject({
      id: 10,
      title: "Publish release notes",
      completed: true,
    });
  });

  it("returns a not found error when toggling a missing task", async () => {
    const response = await request(app).patch("/api/tasks/999/toggle").expect(404);

    expect(response.body).toEqual({ error: "Task was not found." });
  });
});
