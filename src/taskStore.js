const defaultTasks = [
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
    dueDate: "2026-06-05",
    completed: true,
  },
];

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  error.code = "VALIDATION_ERROR";
  return error;
}

function cloneTask(task) {
  return { ...task };
}

function normalizeTaskInput(input = {}) {
  const title = typeof input.title === "string" ? input.title.trim() : "";
  const owner = typeof input.owner === "string" ? input.owner.trim() : "";
  const dueDate = typeof input.dueDate === "string" ? input.dueDate.trim() : "";

  if (!title) {
    throw validationError("Task title is required.");
  }

  return {
    title,
    owner: owner || "Unassigned",
    dueDate: dueDate || null,
  };
}

export function createTaskStore(seedTasks = defaultTasks) {
  let tasks = seedTasks.map(cloneTask);
  let nextId =
    tasks.reduce((highestId, task) => Math.max(highestId, task.id), 0) + 1;

  return {
    list() {
      return tasks.map(cloneTask);
    },

    create(input) {
      const task = {
        id: nextId,
        ...normalizeTaskInput(input),
        completed: false,
      };

      nextId += 1;
      tasks.push(task);
      return cloneTask(task);
    },

    toggle(id) {
      const numericId = Number(id);
      const task = tasks.find((item) => item.id === numericId);

      if (!task) {
        return null;
      }

      task.completed = !task.completed;
      return cloneTask(task);
    },

    reset(newTasks = defaultTasks) {
      tasks = newTasks.map(cloneTask);
      nextId =
        tasks.reduce((highestId, task) => Math.max(highestId, task.id), 0) + 1;
    },
  };
}
