// Function to save tasks to local storage
function saveTasks() {
  const tasks = [];
  document.querySelectorAll("#taskList li").forEach(li => {
    const text = li.querySelector("span").textContent;
    const completed = li.querySelector("input[type='checkbox']").checked;
    const time = li.querySelector("small").textContent;
    tasks.push({ text, completed, time });
  });
  localStorage.setItem("studyTasks", JSON.stringify(tasks));
}

// Function to load tasks from local storage
function loadTasks() {
  const saved = localStorage.getItem("studyTasks");
  if (saved) {
    const tasks = JSON.parse(saved);
    tasks.forEach(task => {
      createTaskElement(task.text, task.completed, task.time);
    });
  }
}

// Helper function to create the DOM elements for a task
function createTaskElement(taskText, isCompleted, timeString) {
  const li = document.createElement("li");

  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.checked = isCompleted;
  checkbox.addEventListener("change", function () {
    toggleTask(checkbox);
  });

  const span = document.createElement("span");
  span.textContent = taskText;
  if (isCompleted) {
    span.classList.add("completed");
  }

  const timeElement = document.createElement("small");
  timeElement.textContent = timeString;
  timeElement.style.marginLeft = "10px";
  timeElement.style.color = "#888";

  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", function () {
    const newTask = prompt("Edit task:", span.textContent);
    if (newTask !== null && newTask.trim() !== "") {
      span.textContent = newTask.trim();
      saveTasks();
    }
  });

  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", function () {
    li.remove();
    taskTracker();
    saveTasks();
  });

  li.appendChild(checkbox);
  li.appendChild(span);
  li.appendChild(timeElement);
  li.appendChild(editButton);
  li.appendChild(removeButton);

  document.getElementById("taskList").appendChild(li);
}

function addTask() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (task === "") {
    errorMsg.textContent = " Please enter a task.";
    return;
  }
  errorMsg.textContent = "";

  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = dayNames[now.getDay()];
  const date = `${now.getDate()} ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timeString = ` (${day}, ${date} at ${time})`;

  createTaskElement(task, false, timeString);
  
  input.value = "";

  taskTracker();
  saveTasks();
}

/* =========================
   MULTI-THEME SWITCHER
========================= */

const themeSwitcher = document.getElementById("themeSwitcher");

// Load saved theme
const savedTheme = localStorage.getItem("theme") || "light";
document.documentElement.setAttribute("data-theme", savedTheme);

if (themeSwitcher) {
  themeSwitcher.value = savedTheme;

  themeSwitcher.addEventListener("change", function (e) {
    const selectedTheme = e.target.value;

    document.documentElement.setAttribute("data-theme", selectedTheme);
    localStorage.setItem("theme", selectedTheme);
  });
}

function toggleTask(checkbox) {
  const span = checkbox.nextElementSibling;
  if (checkbox.checked) {
    span.classList.add("completed");
  } else {
    span.classList.remove("completed");
  }

  taskTracker();
  saveTasks();
}

function taskTracker() {
  const tasks = document.querySelectorAll("#taskList li");
  const completed = document.querySelectorAll("#taskList input:checked");

  const empty = document.getElementById("emptyState");
  if (empty) {
    empty.style.display = tasks.length === 0 ? "block" : "none";
  }

  const stats = document.getElementById("taskStats");
  if (stats) {
    stats.innerText = `✅ ${completed.length} / ${tasks.length} completed`;
  }

  const celebration = document.getElementById("celebration");

  if (tasks.length > 0 && tasks.length === completed.length) {
    celebration.classList.remove("hidden");

    setTimeout(() => {
      celebration.classList.add("show");
    }, 100);
  } else {
    celebration.classList.remove("show");
    celebration.classList.add("hidden");
  }
}

// Initialize task tracker and load saved tasks on page load
loadTasks();
taskTracker();
