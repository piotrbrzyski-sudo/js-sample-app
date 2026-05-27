export function createTaskApi(fetchClient = fetch) {
  return {
    async listTasks() {
      const response = await fetchClient("/api/tasks");
      return parseJsonResponse(response);
    },

    async createTask(task) {
      const response = await fetchClient("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(task),
      });
      return parseJsonResponse(response);
    },

    async toggleTask(id) {
      const response = await fetchClient(`/api/tasks/${id}/toggle`, {
        method: "PATCH",
      });
      return parseJsonResponse(response);
    },
  };
}

async function parseJsonResponse(response) {
  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.error || "The request failed.");
  }

  return payload;
}

function formatDueDate(dueDate) {
  return dueDate ? `Due ${dueDate}` : "No due date";
}

function formatCount(count) {
  return count === 1 ? "1 task" : `${count} tasks`;
}

export function createTaskApp({ document, api }) {
  const form = document.querySelector("#task-form");
  const titleInput = document.querySelector("#task-title");
  const ownerInput = document.querySelector("#task-owner");
  const dueDateInput = document.querySelector("#task-due-date");
  const statusMessage = document.querySelector("#status-message");
  const taskList = document.querySelector("#task-list");
  const taskCount = document.querySelector("#task-count");

  async function loadTasks() {
    statusMessage.textContent = "Loading tasks...";

    try {
      const { tasks } = await api.listTasks();
      renderTasks(tasks);
      statusMessage.textContent = tasks.length
        ? "Tasks loaded successfully."
        : "No tasks yet. Create the first one.";
    } catch (error) {
      statusMessage.textContent = error.message;
    }
  }

  function renderTasks(tasks) {
    taskList.replaceChildren(...tasks.map(createTaskCard));
    taskCount.textContent = formatCount(tasks.length);
  }

  function createTaskCard(task) {
    const item = document.createElement("li");
    item.className = `task-card${task.completed ? " is-completed" : ""}`;

    const content = document.createElement("div");

    const title = document.createElement("h3");
    title.textContent = task.title;

    const details = document.createElement("p");
    details.textContent = `${task.owner} · ${formatDueDate(task.dueDate)}`;

    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = task.completed ? "Reopen" : "Complete";
    toggleButton.addEventListener("click", async () => {
      statusMessage.textContent = "Updating task...";
      await api.toggleTask(task.id);
      await loadTasks();
    });

    content.append(title, details);
    item.append(content, toggleButton);

    return item;
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    statusMessage.textContent = "Creating task...";

    try {
      await api.createTask({
        title: titleInput.value,
        owner: ownerInput.value,
        dueDate: dueDateInput.value,
      });
      form.reset();
      await loadTasks();
    } catch (error) {
      statusMessage.textContent = error.message;
    }
  });

  return {
    loadTasks,
    renderTasks,
  };
}

if (
  typeof document !== "undefined" &&
  document.querySelector("#task-form") &&
  document.querySelector("#task-list")
) {
  const app = createTaskApp({
    document,
    api: createTaskApi(),
  });

  app.loadTasks();
}
