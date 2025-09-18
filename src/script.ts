const menuToggle = document.getElementById("menu-toggle")as HTMLButtonElement | null;
const sidebar = document.querySelector(".sidebar")as HTMLElement | null;
const mainContent = document.querySelector(".main-content")as HTMLElement | null;

if(menuToggle && sidebar && mainContent){
menuToggle.addEventListener("click", () => {
  sidebar.classList.toggle("active");
  mainContent.classList.toggle("expanded");
})
};

// --- Theme toggle ---
const theme = document.getElementById("theme-toggle")as HTMLElement | null;
if(theme){
theme.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  localStorage.setItem(
    "theme",
    document.body.classList.contains("dark-mode") ? "dark" : "light"
  );
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}
}

const searchBar = document.getElementById("search-bar");
const searchIcon = document.getElementById("search-icon");

searchIcon.addEventListener("click", () => {
  searchBar.classList.toggle("active");
  if (searchBar.classList.contains("active")) {
    searchBar.focus();
  }
});


// Add Task buttons → go to form
document.getElementById("add-task-btn").addEventListener("click", () => {
  window.location.href = "add-task.html";
});
document.getElementById("add-task-main").addEventListener("click", () => {
  window.location.href = "add-task.html";
});

// --- Elements ---
const tasksList = document.getElementById("tasks-list");
const noTaskMsg = document.getElementById("no-task-msg");

// Sidebar filters
const allTasksBtn = document.getElementById("all-tasks");
const todayTasksBtn = document.getElementById("today-tasks");
const completedTasksBtn = document.getElementById("completed-tasks");
const pendingTasksBtn = document.getElementById("pending-tasks");
const trashBtn = document.getElementById("trash");

const filterSelect = document.getElementById("filter-tasks");
// const searchBar = document.getElementById("search-bar");
const sectionTitle = document.getElementById("section-title");

// Keep current filter state
let currentFilter = "all";

// --- Load tasks with filter + search + priority ---
function loadTasks(filter = currentFilter) {
  currentFilter = filter;

  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];
  let filteredTasks = [];

  if (filter === "all") {
    filteredTasks = tasks;
    sectionTitle.textContent = "All Tasks";
  } else if (filter === "today") {
    const today = new Date().toISOString().split("T")[0];
    filteredTasks = tasks.filter(t => t.dueDate === today);
    sectionTitle.textContent = "Today's Tasks";
  } else if (filter === "completed") {
    filteredTasks = tasks.filter(t => t.completed);
    sectionTitle.textContent = "Completed Tasks";
  } else if (filter === "pending") {
    filteredTasks = tasks.filter(t => !t.completed);
    sectionTitle.textContent = "Pending Tasks";
  } else if (filter === "trash") {
    filteredTasks = trash;
    sectionTitle.textContent = "Trash";
  }

  // Apply priority filter
  const priorityFilter = filterSelect.value;
  if (priorityFilter !== "all" && filter !== "trash") {
    filteredTasks = filteredTasks.filter(t => t.priority === priorityFilter);
  }

  // Apply search filter
  const query = searchBar.value.toLowerCase();
  if (query) {
    filteredTasks = filteredTasks.filter(
      t =>
        (t.title && t.title.toLowerCase().includes(query)) ||
        (t.description && t.description.toLowerCase().includes(query))
    );
  }

  // Clear list
  tasksList.innerHTML = "";

  if (filteredTasks.length === 0) {
    noTaskMsg.style.display = "block";
    return;
  } else {
    noTaskMsg.style.display = "none";
  }

  // Render tasks
  filteredTasks.forEach(task => {
    const div = document.createElement("div");
    div.classList.add("task-item");
    div.setAttribute("data-id", task.id);

    div.innerHTML = `
      <div class="task-info">
        <h3 class="task-title ${task.completed ? "completed" : ""}">
          ${task.title}
        </h3>
        <p>${task.description || ""}</p>
        <small>Due: ${task.dueDate || "No date"} | Priority: ${task.priority}</small>
      </div>
      <div class="task-menu">
        <button class="menu-btn">⋮</button>
        <div class="menu-dropdown hidden">
          ${
            filter !== "trash"
              ? `
            <button class="star-btn">${task.starred ? "Unstar" : "Star"}</button>
            <button class="edit-btn">Rename</button>
            <button class="complete-btn">${task.completed ? "Undo" : "Complete"}</button>
            <button class="delete-btn">Delete</button>
          `
              : `
            <button class="restore-btn">Restore</button>
            <button class="permanent-delete-btn">Delete Permanently</button>
          `
          }
        </div>
      </div>
    `;

    const menuBtn = div.querySelector(".menu-btn");
    const dropdown = div.querySelector(".menu-dropdown");

    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".menu-dropdown").forEach(menu => {
        if (menu !== dropdown) menu.classList.add("hidden");
      });
      dropdown.classList.toggle("hidden");
    });

    document.addEventListener("click", () => dropdown.classList.add("hidden"));

    if (filter !== "trash") {
      dropdown.querySelector(".delete-btn").addEventListener("click", () => deleteTask(task.id));
      dropdown.querySelector(".edit-btn").addEventListener("click", () => renameTask(task.id));
      dropdown.querySelector(".complete-btn").addEventListener("click", () => toggleComplete(task.id));
      dropdown.querySelector(".star-btn").addEventListener("click", () => toggleStar(task.id));
    } else {
      dropdown.querySelector(".restore-btn").addEventListener("click", () => restoreTask(task.id));
      dropdown.querySelector(".permanent-delete-btn").addEventListener("click", () => permanentDelete(task.id));
    }

    tasksList.appendChild(div);
  });

  updateCounts();
}

// --- Task Actions ---
function deleteTask(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  const task = tasks.find(t => t.id === id);
  if (task) {
    trash.push(task);
    tasks = tasks.filter(t => t.id !== id);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("trash", JSON.stringify(trash));

  loadTasks(currentFilter);
}

function restoreTask(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  const task = trash.find(t => t.id === id);
  if (task) {
    tasks.push(task);
    trash = trash.filter(t => t.id !== id);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("trash", JSON.stringify(trash));

  loadTasks("trash");
}

function permanentDelete(id) {
  let trash = JSON.parse(localStorage.getItem("trash")) || [];
  trash = trash.filter(t => t.id !== id);
  localStorage.setItem("trash", JSON.stringify(trash));
  loadTasks("trash");
}

function renameTask(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find(t => t.id === id);
  const newTitle = prompt("Enter new title:", task.title);
  if (newTitle) {
    task.title = newTitle.trim();
    localStorage.setItem("tasks", JSON.stringify(tasks));
    loadTasks(currentFilter);
  }
}

function toggleComplete(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks(currentFilter);
}

function toggleStar(id) {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find(t => t.id === id);
  task.starred = !task.starred;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  loadTasks(currentFilter);
}

// --- Update counts ---
function updateCounts() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  document.querySelector("#all-tasks .count").textContent = tasks.length;
  document.querySelector("#today-tasks .count").textContent = tasks.filter(t => t.dueDate === new Date().toISOString().split("T")[0]).length;
  document.querySelector("#completed-tasks .count").textContent = tasks.filter(t => t.completed).length;
  document.querySelector("#pending-tasks .count").textContent = tasks.filter(t => !t.completed).length;
  document.querySelector("#trash .count").textContent = trash.length;
}

// --- Sidebar filters ---
allTasksBtn.addEventListener("click", () => loadTasks("all"));
todayTasksBtn.addEventListener("click", () => loadTasks("today"));
completedTasksBtn.addEventListener("click", () => loadTasks("completed"));
pendingTasksBtn.addEventListener("click", () => loadTasks("pending"));
trashBtn.addEventListener("click", () => loadTasks("trash"));

// --- Filter dropdown ---
filterSelect.addEventListener("change", () => loadTasks(currentFilter));

// --- Search bar ---
searchBar.addEventListener("input", () => loadTasks(currentFilter));

// On page load
loadTasks("all");
