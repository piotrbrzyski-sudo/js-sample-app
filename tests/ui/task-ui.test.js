// @vitest-environment jsdom

import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTaskApp } from "../../public/app.js";

function mountTaskApp(apiOverrides = {}) {
  document.body.innerHTML = `
    <form id="task-form">
      <input id="task-title" name="title" />
      <input id="task-owner" name="owner" />
      <input id="task-due-date" name="dueDate" />
      <button type="submit">Add task</button>
    </form>
    <p id="status-message" role="status"></p>
    <span id="task-count"></span>
    <ul id="task-list"></ul>
  `;

  const api = {
    listTasks: vi.fn().mockResolvedValue({ tasks: [] }),
    createTask: vi.fn().mockResolvedValue({ task: {} }),
    toggleTask: vi.fn().mockResolvedValue({ task: {} }),
    ...apiOverrides,
  };

  const app = createTaskApp({ document, api });

  return { api, app };
}

function submitForm() {
  document
    .querySelector("#task-form")
    .dispatchEvent(new Event("submit", { bubbles: true, cancelable: true }));
}

function clickFirstToggleButton() {
  document.querySelector(".task-card button").click();
}

async function waitForAsyncHandlers() {
  await new Promise((resolve) => setTimeout(resolve, 0));
}

describe("Task UI", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders tasks loaded from the API", async () => {
    const { app } = mountTaskApp({
      listTasks: vi.fn().mockResolvedValue({
        tasks: [
          {
            id: 1,
            title: "Prepare the sprint demo",
            owner: "Ava",
            dueDate: "2026-06-03",
            completed: false,
          },
          {
            id: 2,
            title: "Review API contract",
            owner: "Noah",
            dueDate: null,
            completed: true,
          },
        ],
      }),
    });

    await app.loadTasks();

    expect(document.querySelector("#task-count").textContent).toBe("2 tasks");
    expect(document.querySelector("#status-message").textContent).toBe(
      "Tasks loaded successfully.",
    );
    expect([...document.querySelectorAll(".task-card h3")].map((node) => node.textContent)).toEqual([
      "Prepare the sprint demo",
      "Review API contract",
    ]);
    expect(document.querySelectorAll(".task-card.is-completed")).toHaveLength(1);
  });

  it("shows an empty state when the API returns no tasks", async () => {
    const { app } = mountTaskApp();

    await app.loadTasks();

    expect(document.querySelector("#task-count").textContent).toBe("0 tasks");
    expect(document.querySelector("#task-list").children).toHaveLength(0);
    expect(document.querySelector("#status-message").textContent).toBe(
      "No tasks yet. Create the first one.",
    );
  });

  it("shows a load error when the task list request fails", async () => {
    const { app } = mountTaskApp({
      listTasks: vi.fn().mockRejectedValue(new Error("Unable to load tasks.")),
    });

    await app.loadTasks();

    expect(document.querySelector("#status-message").textContent).toBe(
      "Unable to load tasks.",
    );
    expect(document.querySelector("#task-list").children).toHaveLength(0);
  });

  it("renders missing due dates and completed-task actions", () => {
    const { app } = mountTaskApp();

    app.renderTasks([
      {
        id: 2,
        title: "Review API contract",
        owner: "Noah",
        dueDate: null,
        completed: true,
      },
    ]);

    expect(document.querySelector(".task-card p").textContent).toBe(
      "Noah · No due date",
    );
    expect(document.querySelector(".task-card button").textContent).toBe(
      "Reopen",
    );
  });

  it("submits form values to the API and refreshes the list", async () => {
    const { api } = mountTaskApp({
      listTasks: vi.fn().mockResolvedValue({
        tasks: [
          {
            id: 3,
            title: "Document the UI test flow",
            owner: "Ava",
            dueDate: "2026-06-15",
            completed: false,
          },
        ],
      }),
    });

    document.querySelector("#task-title").value = "Document the UI test flow";
    document.querySelector("#task-owner").value = "Ava";
    document.querySelector("#task-due-date").value = "2026-06-15";

    submitForm();
    await waitForAsyncHandlers();

    expect(api.createTask).toHaveBeenCalledWith({
      title: "Document the UI test flow",
      owner: "Ava",
      dueDate: "2026-06-15",
    });
    expect(api.listTasks).toHaveBeenCalledTimes(1);
    expect(document.querySelector("#task-title").value).toBe("");
    expect(document.querySelector("#task-count").textContent).toBe("1 task");
  });

  it("shows an API error when task creation fails", async () => {
    mountTaskApp({
      createTask: vi.fn().mockRejectedValue(new Error("Task title is required.")),
    });

    submitForm();
    await waitForAsyncHandlers();

    expect(document.querySelector("#status-message").textContent).toBe(
      "Task title is required.",
    );
  });

  it("toggles a task and reloads the task list", async () => {
    const { api, app } = mountTaskApp({
      listTasks: vi.fn().mockResolvedValue({ tasks: [] }),
    });

    app.renderTasks([
      {
        id: 7,
        title: "Confirm regression coverage",
        owner: "Mia",
        dueDate: null,
        completed: false,
      },
    ]);

    clickFirstToggleButton();
    await waitForAsyncHandlers();

    expect(api.toggleTask).toHaveBeenCalledWith(7);
    expect(api.listTasks).toHaveBeenCalledTimes(1);
    expect(document.querySelector("#status-message").textContent).toBe(
      "No tasks yet. Create the first one.",
    );
  });
});
