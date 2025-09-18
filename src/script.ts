export{};

const manuButton = document.getElementById("menu-toggle")as HTMLButtonElement | null;
const sidebar = document.getElementById("sidebar")as HTMLElement | null;
const mainContent = document.getElementById("main-content")as HTMLElement | null;

if(manuButton && sidebar && mainContent){
manuButton.addEventListener("click", () => {
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
};

// --- Add task buttons ---
const addTaskBtn =document.getElementById("add-task-btn")as HTMLElement | null;
if(addTaskBtn){ 
    addTaskBtn.addEventListener("click", () => {
  window.location.href = "add-task.html";
})
};
const addTaskMain =document.getElementById("add-task-main")as HTMLElement | null;
if(addTaskMain){ 
    addTaskMain.addEventListener("click", () => {
  window.location.href = "add-task.html";
})
};


// --- Elements ---
const tasksList = document.getElementById("tasks-list")as HTMLElement | null;
const noTaskMsg = document.getElementById("no-task-msg")as HTMLElement | null;

// Sidebar filters
const allTasks = document.getElementById("all-tasks")as HTMLElement | null;
const todayTasks = document.getElementById("today-tasks")as HTMLElement | null;
const completedTasks = document.getElementById("completed-tasks")as HTMLElement | null;
const pendingTasks = document.getElementById("pending-tasks")as HTMLElement | null;
const trashbin = document.getElementById("trash")as HTMLElement | null;

const filterSelect = document.getElementById("filter-tasks")as HTMLSelectElement | null;
const sectionTitle = document.getElementById("section-title")as HTMLHeadingElement | null;
const searchBar = document.getElementById("search-bar")as HTMLInputElement | null;
const searchIcon = document.getElementById("search-icon")as HTMLElement | null;
// Keep current filter state
let currentFilter: string = "all";

// --- Load tasks ---
function tasksLoading(filter: string = currentFilter): void {
  currentFilter = filter;

  let tasks: Task[] = getData("tasks")
  let trash: Task[] = getData("trash")
  let filteredTasks: Task[] = [];

  // Filter selection
  if (filter === "all"&& sectionTitle) {
    filteredTasks = tasks;
    sectionTitle.textContent = "All Tasks";
  } else if (filter === "today" && sectionTitle) {
    const today = new Date().toISOString().split("T")[0];
    filteredTasks = tasks.filter((t) => t.dueDate === today);
    sectionTitle.textContent = "Today's Tasks";
  } else if (filter === "completed" && sectionTitle) {
    filteredTasks = tasks.filter((t) => t.completed);
    sectionTitle.textContent = "Completed Tasks";
  } else if (filter === "pending" && sectionTitle) {
    filteredTasks = tasks.filter((t) => !t.completed);
    sectionTitle.textContent = "Pending Tasks";
  } else if (filter === "trash" && sectionTitle) {
    filteredTasks = trash;
    sectionTitle.textContent = "Trash";
  }


  // Apply priority filter
   if(filterSelect){
  const priorityFilter = filterSelect.value;
  if (priorityFilter !== "all" && filter !== "trash") {
    filteredTasks = filteredTasks.filter((t) => t.priority === priorityFilter);
  }
}

  // Apply search filter
   if(searchBar){
  const search = searchBar.value.toLowerCase();
  if (search) {
    filteredTasks = filteredTasks.filter(
      (t) =>
        (t.title && t.title.toLowerCase().includes(search)) ||
        (t.description && t.description.toLowerCase().includes(search))
    );
  }
}

  // Clear list
  if(tasksList){
  tasksList.innerHTML = "";

  if (filteredTasks.length === 0 && noTaskMsg) {
    noTaskMsg.style.display = "block";
    return;
  } else {
    if(noTaskMsg)noTaskMsg.style.display = "none";
  }

  // Render tasks
  filteredTasks.forEach((task) => {
    const div = document.createElement("div");
    div.classList.add("task-item");
    div.setAttribute("data-id", task.id);

    div.innerHTML = `
      <div class="task-info">
        <h3 class="task-title ${task.completed ? "completed" : ""}">
          ${task.title}
        </h3>
        <p>${task.description || ""}</p>
        <small>Due: ${task.dueDate || "No date"} | Priority: ${
      task.priority
    }</small>
      </div>
      <div class="task-menu">
        <button class="menu-btn">...</button>
        <div class="menu-dropdown hidden">
          ${
            filter !== "trash"
              ? `
            <button class="star-btn">${task.starred ? "Unstar" : "Star"}</button>
            <button class="edit-btn">Rename</button>
            <button class="complete-btn">${
              task.completed ? "Undo" : "Complete"
            }</button>
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

    const menuBtn = div.querySelector(".menu-btn")as HTMLButtonElement | null;
    const dropdown = div.querySelector(".menu-dropdown")as HTMLSelectElement | null;
    
    if(menuBtn && dropdown){
    menuBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.querySelectorAll(".menu-dropdown").forEach((menu) => {
        if (menu !== dropdown) menu.classList.add("hidden");
      });
      dropdown.classList.toggle("hidden");
    });
    document.addEventListener("click", () =>
      dropdown.classList.add("hidden")
    );

    if (filter !== "trash") {
      dropdown.querySelector(".delete-btn")?.addEventListener("click", () => deleteTask(task.id));
      dropdown.querySelector(".edit-btn")?.addEventListener("click", () => renameTask(task.id));
      dropdown.querySelector(".complete-btn")?.addEventListener("click", () => toggleComplete(task.id));
      dropdown.querySelector(".star-btn")?.addEventListener("click", () => toggleStar(task.id));
    } 
    else {
      dropdown.querySelector(".restore-btn")?.addEventListener("click", () => restoreTask(task.id));
      dropdown.querySelector(".permanent-delete-btn")?.addEventListener("click", () => permanentDelete(task.id));
    }

}
    tasksList.appendChild(div);
  });
}

  updateCounts();
}

// --- Task Actions ---
function deleteTask(id: string): void {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  const task = tasks.find(t => t.id === id);
  if (task) {
    trash.push(task);
    tasks = tasks.filter(t => t.id !== id);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("trash", JSON.stringify(trash));

  tasksLoading(currentFilter);
}

function restoreTask(id: string): void {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  const task = trash.find(t => t.id === id);
  if (task) {
    tasks.push(task);
    trash = trash.filter(t => t.id !== id);
  }

  localStorage.setItem("tasks", JSON.stringify(tasks));
  localStorage.setItem("trash", JSON.stringify(trash));

  tasksLoading("trash");
}

function permanentDelete(id: string): void {
  let trash = JSON.parse(localStorage.getItem("trash")) || [];
  trash = trash.filter(t => t.id !== id);
  localStorage.setItem("trash", JSON.stringify(trash));
  tasksLoading("trash");
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

function toggleComplete(id: string): void {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find(t => t.id === id);
  task.completed = !task.completed;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  tasksLoading(currentFilter);
}

function toggleStar(id: string): void {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  const task = tasks.find(t => t.id === id);
  task.starred = !task.starred;
  localStorage.setItem("tasks", JSON.stringify(tasks));
  tasksLoading(currentFilter);
}

// --- Update counts ---
function updateCounts() {
  let tasks = JSON.parse(localStorage.getItem("tasks")) || [];
  let trash = JSON.parse(localStorage.getItem("trash")) || [];

  const allCount=document.querySelector("#all-tasks .count")
  if(allCount) allCount.textContent = tasks.length.toString();

  const todayCount=document.querySelector("#today-tasks .count")
  if(todayCount)todayCount.textContent = tasks.filter(
    (t) => t.dueDate === new Date().toISOString().split("T")[0]).length.toString();

  const completedCount=document.querySelector("#completed-tasks .count")
  if(completedCount)completedCount.textContent = tasks.filter(
    (t) => t.completed).length.toString();

  const pendingCount=document.querySelector("#pending-tasks .count")
  if(pendingCount)pendingCount.textContent = tasks.filter(
    (t) => !t.completed).length.toString();

  const trashCount=document.querySelector("#trash .count")
  if(trashCount)trashCount.textContent = trash.length.toString();
}

// --- Sidebar filters ---
allTasks?.addEventListener("click", () => tasksLoading("all"));
todayTasks?.addEventListener("click", () => tasksLoading("today"));
completedTasks?.addEventListener("click", () => tasksLoading("completed"));
pendingTasks?.addEventListener("click", () => tasksLoading("pending"));
trashbin?.addEventListener("click", () => tasksLoading("trash"));

// --- Filter dropdown ---
filterSelect?.addEventListener("change", () => tasksLoading(currentFilter));

// --- Search bar ---
searchBar?.addEventListener("input", () => tasksLoading(currentFilter));

// On page load
tasksLoading("all");
