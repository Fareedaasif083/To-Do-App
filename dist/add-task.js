const themeToggle = document.getElementById("theme-toggle");
if (themeToggle)
    themeToggle.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        localStorage.setItem("theme", document.body.classList.contains("dark-mode") ? "dark" : "light");
    });
function getDataInput(key) {
    const item = localStorage.getItem(key);
    try {
        return item ? JSON.parse(item) : [];
    }
    catch (e) {
        return [];
    }
}
// form for adding task and save it 
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("add-task-form");
    const cancelBtn = document.getElementById("cancel-btn");
    const todayBtn = document.getElementById("todayBtn");
    const tomorrowBtn = document.getElementById("tomorrowBtn");
    //   handle task submit
    if (form) {
        form.addEventListener("submit", (e) => {
            e.preventDefault(); //stop form from its default behaviour
            // get form values
            const title = document.getElementById("title").value.trim();
            const description = document.getElementById("description").value.trim();
            const dueDate = document.getElementById("dueDate").value;
            const priority = document.getElementById("priority").value;
            if (!title) {
                alert("Title is required!");
                return;
            }
            const task = {
                id: Date.now().toString(),
                title,
                description,
                dueDate,
                completed: false,
                starred: false,
                priority
            };
            // Get existing tasks or empty array
            let tasks = getDataInput("tasks");
            // Add new task
            tasks.push(task);
            // Save back to localStorage
            localStorage.setItem("tasks", JSON.stringify(tasks));
            // Redirect to index.html
            window.location.href = "index.html";
        });
    }
    // Cancel button → go back without saving
    // Cancel button → go back without saving
    if (cancelBtn) {
        cancelBtn.addEventListener("click", () => {
            window.location.href = "index.html";
        });
    }
    const dueDateInput = document.getElementById("dueDate");
    // Today / Tomorrow buttons
    if (todayBtn && tomorrowBtn && dueDateInput) {
        function setActive(button) {
            [todayBtn, tomorrowBtn].forEach(btn => btn.classList.remove("active"));
            button.classList.add("active");
        }
        if (dueDateInput) {
            todayBtn.addEventListener("click", () => {
                const today = new Date();
                dueDateInput.value = today.toISOString().split("T")[0];
                setActive(todayBtn);
            });
            tomorrowBtn.addEventListener("click", () => {
                const tomorrow = new Date();
                tomorrow.setDate(tomorrow.getDate() + 1);
                dueDateInput.value = tomorrow.toISOString().split("T")[0];
                setActive(tomorrowBtn);
            });
            // If user picks a date manually, "remove" Today/Tomorrow option effect
            dueDateInput.addEventListener("input", () => {
                todayBtn.classList.remove("active");
                tomorrowBtn.classList.remove("active");
            });
        }
    }
});
export {};
//# sourceMappingURL=add-task.js.map