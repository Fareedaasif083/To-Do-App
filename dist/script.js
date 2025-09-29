// --- Sidebar toggle ---
const manuButton = document.getElementById("menu-toggle");
const sidebar = document.getElementById("sidebar");
const mainContent = document.getElementById("main-content");
if (manuButton && sidebar && mainContent) {
    manuButton.addEventListener("click", () => {
        sidebar.classList.toggle("active");
        mainContent.classList.toggle("expanded");
    });
}
;
// --- Theme toggle ---
const theme = document.getElementById("theme-toggle");
if (theme) {
    theme.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });
    if (localStorage.getItem("theme") === "dark") {
        document.body.classList.add("dark-mode");
    }
}
// --- Add task buttons ---
const addTaskBtn = document.getElementById("add-task-btn");
if (addTaskBtn) {
    addTaskBtn.addEventListener("click", () => {
        window.location.href = "add-task.html";
    });
}
;
const addTaskMain = document.getElementById("add-task-main");
if (addTaskMain) {
    addTaskMain.addEventListener("click", () => {
        window.location.href = "add-task.html";
    });
}
;
// --- Elements ---
const tasksList = document.getElementById("tasks-list");
const noTaskMsg = document.getElementById("no-task-msg");
const allTasks = document.getElementById("all-tasks");
const todayTasks = document.getElementById("today-tasks");
const completedTasks = document.getElementById("completed-tasks");
const pendingTasks = document.getElementById("pending-tasks");
const trashbin = document.getElementById("trash");
const filterSelect = document.getElementById("filter-tasks");
const sectionTitle = document.getElementById("section-title");
const searchBar = document.getElementById("search-bar");
const searchIcon = document.getElementById("search-icon");
// Keep current filter state
let currentFilter = "all";
function getData(key) {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : [];
    }
    catch (_a) {
        return [];
    }
}
function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}
// --- Load tasks ---
function tasksLoading(filter = currentFilter) {
    currentFilter = filter;
    let tasks = getData("tasks");
    let trash = getData("trash");
    let filteredTasks = [];
    // Filter selection
    if (!sectionTitle)
        return;
    switch (filter) {
        case "all":
            filteredTasks = tasks;
            sectionTitle.textContent = "All Tasks";
            break;
        case "today":
            const today = new Date().toISOString().split("T")[0];
            filteredTasks = tasks.filter((t) => t.dueDate === today);
            sectionTitle.textContent = "Today's Tasks";
            break;
        case "completed":
            filteredTasks = tasks.filter((t) => t.completed);
            sectionTitle.textContent = "Completed Tasks";
            break;
        case "pending":
            filteredTasks = tasks.filter((t) => !t.completed);
            sectionTitle.textContent = "Pending Tasks";
            break;
        case "trash":
            filteredTasks = trash;
            sectionTitle.textContent = "Trash";
            break;
    }
    // Priority filter
    if (filterSelect) {
        const priorityFilter = filterSelect.value;
        if (priorityFilter !== "all" && filter !== "trash") {
            filteredTasks = filteredTasks.filter((t) => t.priority === priorityFilter);
        }
    }
    // Search filter
    if (searchBar) {
        const search = searchBar.value.toLowerCase();
        if (search) {
            filteredTasks = filteredTasks.filter((t) => (t.title && t.title.toLowerCase().includes(search)) ||
                (t.description && t.description.toLowerCase().includes(search)));
        }
    }
    // Clear list
    if (tasksList) {
        tasksList.innerHTML = "";
        if (filteredTasks.length === 0 && noTaskMsg) {
            noTaskMsg.style.display = "block";
            return;
        }
        else {
            if (noTaskMsg)
                noTaskMsg.style.display = "none";
        }
        // Render tasks
        filteredTasks.forEach((task) => {
            var _a, _b, _c, _d, _e, _f;
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
        <button class="menu-btn">...</button>
        <div class="menu-dropdown hidden">
          ${filter !== "trash"
                ? `
            <button class="star-btn">${task.starred ? "Unstar" : "Star"}</button>
            <button class="edit-btn">Rename</button>
            <button class="complete-btn">${task.completed ? "Undo" : "Complete"}</button>
            <button class="delete-btn">Delete</button>
          `
                : `
            <button class="restore-btn">Restore</button>
            <button class="permanent-delete-btn">Delete Permanently</button>
          `}
        </div>
      </div>
    `;
            const menuBtn = div.querySelector(".menu-btn");
            const dropdown = div.querySelector(".menu-dropdown");
            if (menuBtn && dropdown) {
                menuBtn.addEventListener("click", (e) => {
                    e.stopPropagation();
                    document.querySelectorAll(".menu-dropdown").forEach((menu) => {
                        if (menu !== dropdown)
                            menu.classList.add("hidden");
                    });
                    dropdown.classList.toggle("hidden");
                });
                document.addEventListener("click", () => dropdown.classList.add("hidden"));
                if (filter !== "trash") {
                    (_a = dropdown.querySelector(".delete-btn")) === null || _a === void 0 ? void 0 : _a.addEventListener("click", () => deleteTask(task.id));
                    (_b = dropdown.querySelector(".edit-btn")) === null || _b === void 0 ? void 0 : _b.addEventListener("click", () => renameTask(task.id));
                    (_c = dropdown.querySelector(".complete-btn")) === null || _c === void 0 ? void 0 : _c.addEventListener("click", () => toggleComplete(task.id));
                    (_d = dropdown.querySelector(".star-btn")) === null || _d === void 0 ? void 0 : _d.addEventListener("click", () => toggleStar(task.id));
                }
                else {
                    (_e = dropdown.querySelector(".restore-btn")) === null || _e === void 0 ? void 0 : _e.addEventListener("click", () => restoreTask(task.id));
                    (_f = dropdown.querySelector(".permanent-delete-btn")) === null || _f === void 0 ? void 0 : _f.addEventListener("click", () => permanentDelete(task.id));
                }
            }
            tasksList.appendChild(div);
        });
    }
    updateCounts();
}
// --- Task Actions ---
function deleteTask(id) {
    let tasks = getData("tasks");
    let trash = getData("trash");
    const task = tasks.find((t) => t.id === id);
    if (task) {
        trash.push(task);
        tasks = tasks.filter((t) => t.id !== id);
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("trash", JSON.stringify(trash));
    tasksLoading(currentFilter);
}
function restoreTask(id) {
    let tasks = getData("tasks");
    let trash = getData("trash");
    const task = trash.find((t) => t.id === id);
    if (task) {
        tasks.push(task);
        trash = trash.filter((t) => t.id !== id);
    }
    localStorage.setItem("tasks", JSON.stringify(tasks));
    localStorage.setItem("trash", JSON.stringify(trash));
    tasksLoading("trash");
}
function permanentDelete(id) {
    let trash = getData("trash");
    trash = trash.filter((t) => t.id !== id);
    localStorage.setItem("trash", JSON.stringify(trash));
    tasksLoading("trash");
}
function renameTask(id) {
    let tasks = getData("tasks");
    const task = tasks.find((t) => t.id === id);
    if (!task)
        return;
    const newTitle = prompt("Enter new title:", task.title);
    if (newTitle) {
        task.title = newTitle.trim();
        localStorage.setItem("tasks", JSON.stringify(tasks));
        tasksLoading(currentFilter);
    }
}
function toggleComplete(id) {
    let tasks = getData("tasks");
    const task = tasks.find((t) => t.id === id);
    if (task)
        task.completed = !task.completed;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    tasksLoading(currentFilter);
}
function toggleStar(id) {
    let tasks = getData("tasks");
    const task = tasks.find((t) => t.id === id);
    if (task)
        task.starred = !task.starred;
    localStorage.setItem("tasks", JSON.stringify(tasks));
    tasksLoading(currentFilter);
}
// --- Update counts ---
function updateCounts() {
    let tasks = getData("tasks");
    let trash = getData("trash");
    const allCount = document.querySelector("#all-tasks .count");
    if (allCount)
        allCount.textContent = tasks.length.toString();
    const todayCount = document.querySelector("#today-tasks .count");
    if (todayCount)
        todayCount.textContent = tasks.filter((t) => t.dueDate === new Date().toISOString().split("T")[0]).length.toString();
    const completedCount = document.querySelector("#completed-tasks .count");
    if (completedCount)
        completedCount.textContent = tasks.filter((t) => t.completed).length.toString();
    const pendingCount = document.querySelector("#pending-tasks .count");
    if (pendingCount)
        pendingCount.textContent = tasks.filter((t) => !t.completed).length.toString();
    const trashCount = document.querySelector("#trash .count");
    if (trashCount)
        trashCount.textContent = trash.length.toString();
}
// --- Sidebar filters ---
allTasks === null || allTasks === void 0 ? void 0 : allTasks.addEventListener("click", () => tasksLoading("all"));
todayTasks === null || todayTasks === void 0 ? void 0 : todayTasks.addEventListener("click", () => tasksLoading("today"));
completedTasks === null || completedTasks === void 0 ? void 0 : completedTasks.addEventListener("click", () => tasksLoading("completed"));
pendingTasks === null || pendingTasks === void 0 ? void 0 : pendingTasks.addEventListener("click", () => tasksLoading("pending"));
trashbin === null || trashbin === void 0 ? void 0 : trashbin.addEventListener("click", () => tasksLoading("trash"));
// --- Filter dropdown ---
filterSelect === null || filterSelect === void 0 ? void 0 : filterSelect.addEventListener("change", () => tasksLoading(currentFilter));
// --- Search bar toggle ---
searchIcon === null || searchIcon === void 0 ? void 0 : searchIcon.addEventListener("click", () => {
    if (searchBar) {
        searchBar.classList.toggle("active");
        if (searchBar.classList.contains("active")) {
            searchBar.focus();
        }
    }
});
// --- Search bar input ---
searchBar === null || searchBar === void 0 ? void 0 : searchBar.addEventListener("input", () => tasksLoading(currentFilter));
// --- On page load ---
tasksLoading("all");
export {};
//# sourceMappingURL=script.js.map