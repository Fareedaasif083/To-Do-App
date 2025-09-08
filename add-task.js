const theme=document.getElementById("theme-toggle");
theme.addEventListener("click",()=>{
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme",
        document.body.classList.contains("dark-mode")? "dark":"light"
    );
});
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
}

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-task-form");
  const cancelBtn = document.getElementById("cancel-btn");
  const todayBtn = document.getElementById("todayBtn");
  const tomorrowBtn = document.getElementById("tomorrowBtn");
  const dueDateInput = document.getElementById("dueDate");
  //   handle task submit
  if (form){
    form.addEventListener("submit",(e)=>{
      e.preventDefault();  //stop form from its default behaviour
    
        // get form values
        const title=document.getElementById("title").value.trim();
        const description = document.getElementById("description").value.trim();
        const dueDate = document.getElementById("dueDate").value;
        const priority = document.getElementById("priority").value;

        if(!title){
            alert("Title is required!");
            return;
        }

        // Create task object
        const task ={
            id:Date.now(),
            title,
            description,
            dueDate,
            priority,
            completed: false
        };
        
        // Get existing tasks or empty array
        let tasks = JSON.parse(localStorage.getItem("tasks")) || [];

        // Add new task
        tasks.push(task);

        // Save back to localStorage
        localStorage.setItem("tasks", JSON.stringify(tasks));

        // Redirect to index.html
        window.location.href = "index.html";
    });
  }

  // Cancel button → go back without saving
  if (cancelBtn) {
    cancelBtn.addEventListener("click", () => {
      window.location.href = "index.html";
    });
  }

  // Today / Tomorrow buttons
  if (todayBtn && tomorrowBtn && dueDateInput) {
    function setActive(button) {
      [todayBtn, tomorrowBtn].forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    }

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

});