export{};
const themeToggle=document.getElementById("theme-toggle")as HTMLButtonElement | null;
if(themeToggle)
themeToggle.addEventListener("click",()=>{
    document.body.classList.toggle("dark-mode");
    localStorage.setItem("theme",
        document.body.classList.contains("dark-mode")? "dark":"light"
    );
});
interface Task {
  id: string
  title: string
  description?: string
  dueDate?: string
  completed: boolean
  starred: boolean
  priority: string
}

function getDataInput(key: string): Task[]{
  const item=localStorage.getItem(key)
  try{
    return item? JSON.parse(item)as Task[] : [];
  }
  catch(e){
    return [];
  }
}
// form for adding task and save it 
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("add-task-form")as HTMLFormElement;
  const cancelBtn = document.getElementById("cancel-btn")as HTMLButtonElement;
  const todayBtn = document.getElementById("todayBtn")as HTMLButtonElement;
  const tomorrowBtn = document.getElementById("tomorrowBtn")as HTMLButtonElement;
  //   handle task submit
    if (form){
    form.addEventListener("submit",(e)=>{
      e.preventDefault();  //stop form from its default behaviour
    
        // get form values
        const title=(document.getElementById("title")as HTMLInputElement).value.trim();
        const description = (document.getElementById("description")as HTMLInputElement).value.trim();
        const dueDate = (document.getElementById("dueDate")as HTMLInputElement).value;
        const priority = (document.getElementById("priority")as HTMLSelectElement).value;

        if(!title){
            alert("Title is required!");
            return;
        }

        const task: Task={
          id: Date.now().toString(),
          title,
          description,
          dueDate,
          completed: false,
          starred: false,
          priority
        }
        
        // Get existing tasks or empty array
        let tasks = getDataInput("tasks")

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
  const dueDateInput = document.getElementById("dueDate")as HTMLInputElement;
  // Today / Tomorrow buttons
  if (todayBtn && tomorrowBtn && dueDateInput) {
    function setActive(button: HTMLButtonElement ) {
      [todayBtn, tomorrowBtn].forEach(btn => btn.classList.remove("active"));
      button.classList.add("active");
    }
   if(dueDateInput){
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