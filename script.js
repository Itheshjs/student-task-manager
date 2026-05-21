function addTask() {
  const input = document.getElementById("taskInput");
  const task = input.value.trim();
  const errorMsg = document.getElementById("errorMsg");

  if (task.trim() === "") {
    errorMsg.textContent = " Please enter a task.";
    return;
  };
  errorMsg.textContent = "";
  const li = document.createElement("li");


  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.addEventListener("change", function () {
    toggleTask(checkbox);
  });

  const span = document.createElement("span");
  span.textContent = task;

  const now = new Date();
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const day = dayNames[now.getDay()];
  const date = `${now.getDate()} ${now.toLocaleString("default", { month: "long" })} ${now.getFullYear()}`;
  const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const timeElement = document.createElement("small");
  timeElement.textContent = ` (${day}, ${date} at ${time})`;
  timeElement.style.marginLeft = "10px";
  timeElement.style.color = "#888";


  const editButton = document.createElement("button");
  editButton.textContent = "Edit";
  editButton.addEventListener("click", function () {
    const newTask = prompt("Edit task:", span.textContent);
    if (newTask !== null) {
      span.textContent = newTask;
    }
  });
  li.appendChild(span);
  li.appendChild(timeElement);
  li.appendChild(editButton);
  const removeButton = document.createElement("button");
  removeButton.textContent = "Remove";
  removeButton.addEventListener("click", function () {
    li.remove();

    taskTracker();

  });



  li.appendChild(checkbox);
  li.appendChild(span);


  li.appendChild(removeButton);

  document.getElementById("taskList").appendChild(li);

  input.value = "";

  taskTracker();

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
  span.classList.toggle("completed");

  taskTracker();
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
      coin.remove();
    }, 1200 + delay * 1000);
  }
}

// ==========================================================================
// 7. WEEKLY STREAK TRACKER COMPILER
// ==========================================================================

function renderWeeklyStreak() {
  const container = document.getElementById("streakDaysGrid");
  if (!container) return;
  container.innerHTML = "";

  const dayNames = ["M", "T", "W", "T", "F", "S", "S"];
  const today = new Date();

  // Find Mon date of the current week
  const currentDayOfWeek = today.getDay(); // 0 is Sun, 1-6 Mon-Sat
  const diffToMonday = currentDayOfWeek === 0 ? -6 : 1 - currentDayOfWeek;

  const monday = new Date();
  monday.setDate(today.getDate() + diffToMonday);

  for (let i = 0; i < 7; i++) {
    const loopDay = new Date(monday.getTime());
    loopDay.setDate(monday.getDate() + i);
    const dateStr = getFormattedDate(loopDay);

    // Is active if completed a task or studied
    const hasStudyMins = (analyticsData.dailyStudyMinutes[dateStr] || 0) > 0;
    const hasCompletions = (analyticsData.completedTasksPerDay[dateStr] || 0) > 0;
    const isActive = hasStudyMins || hasCompletions;

    const cell = document.createElement("div");
    cell.className = "streak-day-cell";
    if (isActive) {
      cell.classList.add("active");
    }

    cell.innerHTML = `
      <span>${dayNames[i]}</span>
      <div class="day-indicator">
        ${isActive ? '<i class="ri-fire-fill"></i>' : '<i class="ri-checkbox-blank-circle-line"></i>'}
      </div>
    `;

    container.appendChild(cell);
  }
}

// ==========================================================================
// 8. CHART.JS ANALYTICS GENERATOR
// ==========================================================================

function updateAnalyticsDashboard() {
  // 1. Update stats cards
  const totalStudyMinutes = Object.values(analyticsData.dailyStudyMinutes).reduce((a, b) => a + b, 0);
  const totalStudyHours = (totalStudyMinutes / 60).toFixed(1);
  const totalHoursEl = document.getElementById("analyticsTotalHours");
  if (totalHoursEl) totalHoursEl.textContent = `${totalStudyHours}h`;

  const totalCompletedQuests = Object.values(analyticsData.completedTasksPerDay).reduce((a, b) => a + b, 0);
  const completedQuestsEl = document.getElementById("analyticsCompletedQuests");
  if (completedQuestsEl) completedQuestsEl.textContent = totalCompletedQuests;

  const streakEl = document.getElementById("analyticsStreak");
  if (streakEl) streakEl.textContent = `${analyticsData.currentStreak} days`;

  const totalCreated = Object.values(analyticsData.categoryStats).reduce((acc, obj) => acc + (obj.created || 0), 0);
  const totalCompleted = Object.values(analyticsData.categoryStats).reduce((acc, obj) => acc + (obj.completed || 0), 0);
  const completionRate = totalCreated > 0 ? Math.round((totalCompleted / totalCreated) * 100) : 0;
  const rateEl = document.getElementById("analyticsCompletionRate");
  if (rateEl) rateEl.textContent = `${completionRate}%`;

  // 2. Initialize or Update Chart.js instances
  initStudyHoursChart();
  initCategoryChart();
  initCompletionTrendChart();

  // 3. Render Heatmap and mastery stats
  renderHeatmap();
  renderQuestMastery();

  // 4. Render Highlights & History
  renderFocusHistory();

  const mostProductiveDayEl = document.getElementById("mostProductiveDay");
  if (mostProductiveDayEl) mostProductiveDayEl.textContent = calculateMostProductiveDay();

  const peakFocusHourEl = document.getElementById("peakFocusHour");
  if (peakFocusHourEl) peakFocusHourEl.textContent = getPeakFocusHour();

  const longestFocusStreakEl = document.getElementById("longestFocusStreak");
  if (longestFocusStreakEl) longestFocusStreakEl.textContent = `${analyticsData.longestStreak || 8} days`;
}

function initStudyHoursChart() {
  const chartCanvas = document.getElementById("studyHoursChart");
  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext("2d");
  const dates = [];
  const studyValues = [];
  const today = new Date();

  // Handle Weekly vs Monthly labels
  const daysToView = currentStudyView === "weekly" ? 7 : 30;
  for (let i = daysToView - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = getFormattedDate(date);
    dates.push(date.toLocaleDateString(undefined, { weekday: daysToView === 7 ? 'short' : undefined, month: 'short', day: 'numeric' }));
    studyValues.push((analyticsData.dailyStudyMinutes[dateStr] || 0).toFixed(1));
  }

  // Get active CSS variables for chart colors
  const textClr = isLightTheme() ? "#4b5563" : "#94a3b8";
  const gridClr = isLightTheme() ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
  const primaryClr = getComputedStyle(document.body).getPropertyValue('--primary').trim() || "#7c3aed";
  const secondaryClr = getComputedStyle(document.body).getPropertyValue('--secondary').trim() || "#06b6d4";

  if (studyChartInstance) {
    studyChartInstance.destroy();
  }

  // Generate linear gradients for the chart
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, primaryClr);
  gradient.addColorStop(1, secondaryClr);

  studyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [{
        label: 'Minutes Studied',
        data: studyValues,
        backgroundColor: gradient,
        borderRadius: 8,
        hoverBackgroundColor: primaryClr
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textClr, font: { family: 'Poppins' } }
        },
        y: {
          grid: { color: gridClr },
          ticks: { color: textClr, font: { family: 'Poppins' } }
        }
      }
    }
  });
}

function initCategoryChart() {
  const chartCanvas = document.getElementById("categoryChart");
  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext("2d");

  const labels = ["Theory 📘", "Practical 🧪", "Assignment 📝", "Revision 📖"];
  const completedData = [
    analyticsData.categoryStats.Theory?.completed || 0,
    analyticsData.categoryStats.Practical?.completed || 0,
    analyticsData.categoryStats.Assignment?.completed || 0,
    analyticsData.categoryStats.Revision?.completed || 0
  ];

  const textClr = isLightTheme() ? "#4b5563" : "#e2e8f0";

  if (categoryChartInstance) {
    categoryChartInstance.destroy();
  }

  // Fallback visual data if no completed category items yet
  const displayData = completedData.some(v => v > 0) ? completedData : [1, 1, 1, 1];

  categoryChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: displayData,
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
        borderWidth: 0,
        hoverOffset: 12
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: textClr, font: { family: 'Poppins', size: 12 }, padding: 15 }
        }
      },
      cutout: '70%'
    }
  });
}

// Chart toggle click listeners
document.getElementById("btnWeeklyStudy")?.addEventListener("click", () => {
  const weekly = document.getElementById("btnWeeklyStudy");
  const monthly = document.getElementById("btnMonthlyStudy");
  weekly.classList.add("active");
  weekly.setAttribute("aria-pressed", "true");
  monthly.classList.remove("active");
  monthly.setAttribute("aria-pressed", "false");
  currentStudyView = "weekly";
  initStudyHoursChart();
});

document.getElementById("btnMonthlyStudy")?.addEventListener("click", () => {
  const weekly = document.getElementById("btnWeeklyStudy");
  const monthly = document.getElementById("btnMonthlyStudy");
  monthly.classList.add("active");
  monthly.setAttribute("aria-pressed", "true");
  weekly.classList.remove("active");
  weekly.setAttribute("aria-pressed", "false");
  currentStudyView = "monthly";
  initStudyHoursChart();
});

let completionTrendView = "weekly"; // "weekly" or "monthly"

function initCompletionTrendChart() {
  const chartCanvas = document.getElementById("completionTrendChart");
  if (!chartCanvas) return;

  const ctx = chartCanvas.getContext("2d");
  const dates = [];
  const completionValues = [];
  const today = new Date();

  // Handle Weekly vs Monthly labels
  const daysToView = completionTrendView === "weekly" ? 7 : 30;
  for (let i = daysToView - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(today.getDate() - i);
    const dateStr = getFormattedDate(date);
    dates.push(date.toLocaleDateString(undefined, { weekday: daysToView === 7 ? 'short' : undefined, month: 'short', day: 'numeric' }));
    completionValues.push(analyticsData.completedTasksPerDay[dateStr] || 0);
  }

  const textClr = isLightTheme() ? "#4b5563" : "#94a3b8";
  const gridClr = isLightTheme() ? "rgba(0, 0, 0, 0.05)" : "rgba(255, 255, 255, 0.05)";
  const primaryClr = getComputedStyle(document.body).getPropertyValue('--primary').trim() || "#7c3aed";
  const secondaryClr = getComputedStyle(document.body).getPropertyValue('--secondary').trim() || "#06b6d4";

  if (completionTrendChartInstance) {
    completionTrendChartInstance.destroy();
  }

  // Generate linear gradient for the line fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 300);
  gradient.addColorStop(0, "rgba(6, 182, 212, 0.25)");
  gradient.addColorStop(1, "rgba(124, 58, 237, 0.0)");

  completionTrendChartInstance = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [{
        label: 'Quests Completed',
        data: completionValues,
        borderColor: secondaryClr,
        backgroundColor: gradient,
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointBackgroundColor: primaryClr,
        pointBorderColor: "#fff",
        pointHoverRadius: 7
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textClr, font: { family: 'Poppins' } }
        },
        y: {
          grid: { color: gridClr },
          ticks: {
            color: textClr,
            font: { family: 'Poppins' },
            stepSize: 1,
            precision: 0
          }
        }
      }
    }
  });
}

// Chart toggle click listeners for completion trend
document.getElementById("btnWeeklyTrend")?.addEventListener("click", () => {
  const weekly = document.getElementById("btnWeeklyTrend");
  const monthly = document.getElementById("btnMonthlyTrend");
  weekly.classList.add("active");
  weekly.setAttribute("aria-pressed", "true");
  monthly.classList.remove("active");
  monthly.setAttribute("aria-pressed", "false");
  completionTrendView = "weekly";
  initCompletionTrendChart();
});

document.getElementById("btnMonthlyTrend")?.addEventListener("click", () => {
  const weekly = document.getElementById("btnWeeklyTrend");
  const monthly = document.getElementById("btnMonthlyTrend");
  monthly.classList.add("active");
  monthly.setAttribute("aria-pressed", "true");
  weekly.classList.remove("active");
  weekly.setAttribute("aria-pressed", "false");
  completionTrendView = "monthly";
  initCompletionTrendChart();
});

function renderFocusHistory() {
  const container = document.getElementById("focusHistoryList");
  if (!container) return;
  container.innerHTML = "";

  const history = analyticsData.focusHistory || [];
  if (history.length === 0) {
    container.innerHTML = `<div class="empty-history" style="text-align: center; color: var(--textLight); padding: 20px;">No sessions logged yet.</div>`;
    return;
  }

  // Render in reverse chronological order (newest first)
  [...history].reverse().forEach(session => {
    const item = document.createElement("div");
    item.className = "history-item";

    const date = new Date(session.timestamp);
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dayStr = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    // Check if it's today or yesterday or older
    const todayStr = new Date().toDateString();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toDateString();

    let displayTime = `${dayStr}, ${timeStr}`;
    if (date.toDateString() === todayStr) {
      displayTime = `Today, ${timeStr}`;
    } else if (date.toDateString() === yesterdayStr) {
      displayTime = `Yesterday, ${timeStr}`;
    }

    item.innerHTML = `
      <span class="history-time">${displayTime}</span>
      <span class="history-details">${getCategoryEmoji(session.category)} Studied ${session.category} for ${session.duration} mins</span>
      <span class="history-reward">+${session.rewardXp} XP</span>
    `;
    container.appendChild(item);
  });
}

function calculateMostProductiveDay() {
  const daySums = [0, 0, 0, 0, 0, 0, 0]; // Sun-Sat
  const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

  // Sum completed tasks per weekday
  Object.keys(analyticsData.completedTasksPerDay).forEach(dateStr => {
    const date = new Date(dateStr);
    const dayOfWeek = date.getDay();
    if (!isNaN(dayOfWeek)) {
      daySums[dayOfWeek] += analyticsData.completedTasksPerDay[dateStr] || 0;
    }
  });

  let maxIdx = 2; // Default to Tuesday/Wednesday if no data
  let maxVal = 0;
  for (let i = 0; i < 7; i++) {
    if (daySums[i] > maxVal) {
      maxVal = daySums[i];
      maxIdx = i;
    }
  }

  return dayNames[maxIdx];
}

function getPeakFocusHour() {
  const hours = ["9 AM - 11 AM", "2 PM - 4 PM", "4 PM - 6 PM", "7 PM - 9 PM"];
  const index = (xp + coins) % hours.length;
  return hours[index];
}

// ==========================================================================
// 9. GITHUB CONSISTENCY HEATMAP GENERATOR
// ==========================================================================

function renderHeatmap() {
  const container = document.getElementById("heatmapContainer");
  if (!container) return;
  container.innerHTML = "";

  const today = new Date();
  const weeksToDisplay = 15;
  const daysToDisplay = weeksToDisplay * 7;

  // Align start date to the beginning of the week
  const startDate = new Date();
  startDate.setDate(today.getDate() - daysToDisplay + 1);

  // Generate grid items
  for (let i = 0; i < daysToDisplay; i++) {
    const day = new Date(startDate.getTime());
    day.setDate(startDate.getDate() + i);
    const dateStr = getFormattedDate(day);

    const studyMinutes = analyticsData.dailyStudyMinutes[dateStr] || 0;
    const completedTasks = analyticsData.completedTasksPerDay[dateStr] || 0;

    // Overall activity metric
    const activityScore = Math.round(studyMinutes + (completedTasks * 12));

    let level = 0;
    if (activityScore > 0) {
      if (activityScore <= 15) level = 1;
      else if (activityScore <= 35) level = 2;
      else if (activityScore <= 65) level = 3;
      else level = 4;
    }

    const dayBlock = document.createElement("div");
    dayBlock.classList.add("heatmap-day", `level-${level}`);

    // Readable date for tooltip
    const formattedDate = day.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    const tooltipText = `${formattedDate}: ${studyMinutes.toFixed(1)} mins study, ${completedTasks} completed quests`;
    dayBlock.setAttribute("data-tooltip", tooltipText);

    container.appendChild(dayBlock);
  }
}

// ==========================================================================
// 10. QUEST MASTERY PROGRESS LIST
// ==========================================================================

function renderQuestMastery() {
  const container = document.getElementById("subjectProgressList");
  if (!container) return;
  container.innerHTML = "";

  const categories = ["Theory", "Practical", "Assignment", "Revision"];
  const progressClasses = ["theory", "practical", "assignment", "revision"];

  categories.forEach((cat, index) => {
    const stats = analyticsData.categoryStats[cat] || { created: 0, completed: 0 };
    const created = stats.created || 0;
    const completed = stats.completed || 0;

    const percentage = created > 0 ? Math.round((completed / created) * 100) : 0;
    const barClass = progressClasses[index];

    const progressRow = document.createElement("div");
    progressRow.classList.add("subject-progress-item");
    progressRow.innerHTML = `
      <div class="subject-info-row">
        <span class="subject-name">${getCategoryEmoji(cat)} ${cat}</span>
        <span class="subject-ratio"><span>${completed}</span> / ${created} completed</span>
      </div>
      <div class="subject-bar-container">
        <div class="subject-bar-fill ${barClass}" style="width: ${percentage}%"></div>
      </div>
    `;

    container.appendChild(progressRow);
  });
}

// ==========================================================================
// DEADLINE TRACKER FUNCTIONS
// ==========================================================================

function getTimeUntilDeadline(deadlineString) {
  if (!deadlineString) return null;

  const deadline = new Date(deadlineString).getTime();
  const now = Date.now();
  const diff = deadline - now;

  if (diff < 0) {
    return {
      formatted: "OVERDUE",
      minutes: 0,
      urgency: "critical"
    };
  }

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  let formatted = "";
  if (days > 0) {
    formatted = `${days}d ${hours % 24}h`;
  } else if (hours > 0) {
    formatted = `${hours}h ${minutes % 60}m`;
  } else {
    celebration.classList.remove("show");
    celebration.classList.add("hidden");
  }
}


