
const expenseTimeInput = document.getElementById("expenseTime");
const moneyInput = document.getElementById("money");
const categoryAdd = document.getElementById("category");
const customCategory = document.getElementById("customCategory");
const opisanie = document.getElementById("opisanie");
const addBtn = document.querySelector(".raskhod");


let expenses = JSON.parse(localStorage.getItem("expenses")) || [];

// ====== КАСТОМНАЯ КАТЕГОРИЯ ======
function toggleCustomCategory() {
  if (categoryAdd.value === "other") {
    customCategory.style.display = "block";
  } else {
    customCategory.style.display = "none";
    customCategory.value = "";
  }
}


// ====== ДОБАВЛЕНИЕ РАСХОДА ======
addBtn.addEventListener("click", () => {
  const date =
    expenseTimeInput.value || new Date().toISOString().slice(0, 16);

  const money = moneyInput.value;
  let category = categoryAdd.value;
  const desc = opisanie.value;

  if (category === "other") {
    category = customCategory.value;
  }

  if (!date || !money || !category) {
    alert("Заполните дату, сумму и категорию");
    return;
  }

  const expense = {
    date,                 
    money: Number(money), 
    category,
    opisanie: desc
  };

  expenses.push(expense);

  // СОХРАНЕНИЕ В localStorage
  localStorage.setItem("expenses", JSON.stringify(expenses));
  showTodayExpenses(); // ← ОБНОВЛЯЕТ ТАБЛИЦУ СРАЗУ

  console.log("Сохранено:", expenses);

  // очистка полей
  expenseTimeInput.value = "";
  moneyInput.value = "";
  categoryAdd.value = "";
  customCategory.value = "";
  customCategory.style.display = "none";
  opisanie.value = "";
});



function showTodayExpenses() {
  const tbody = document.querySelector("#searchTable tbody");
  tbody.innerHTML = "";

  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  expenses.forEach(exp => {
    if (exp.date.slice(0, 10) === today) {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${formatDate(exp.date)}</td>
        <td>${exp.money}</td>
        <td>${exp.category}</td>
        <td>${exp.opisanie || ""}</td>
      `;

      tbody.appendChild(tr);
    }
  });
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

document.addEventListener("DOMContentLoaded", () => {
  showTodayExpenses();
});

showTodayExpenses();


//poisk
const searchDateInput = document.getElementById("searchDate");
const searchCategoryInput = document.getElementById("searchCategory");
const searchMoneyInput = document.getElementById("searchMoney");

const searchBtn = document.querySelector(".but_search");
const resetBtn = document.querySelector(".but_reset");


function filterExpenses() {
  const tbody = document.querySelector("#searchTable tbody");
  tbody.innerHTML = "";

  const dateFilter = searchDateInput.value;           // YYYY-MM-DD
  const categoryFilter = searchCategoryInput.value;  
  const moneyFilter = searchMoneyInput.value.trim(); // оставим как строку, проверим позже

  expenses.forEach(exp => {
    const expDate = exp.date.slice(0, 10); // только дата
    const expMoney = Number(exp.money);

    let show = true;

    // проверяем дату
    if (dateFilter !== "" && expDate !== dateFilter) show = false;

    // проверяем категорию
    if (categoryFilter !== "" && exp.category !== categoryFilter) show = false;

    // проверяем минимальную сумму
    if (moneyFilter !== "" && expMoney < Number(moneyFilter)) show = false;

    if (show) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDate(exp.date)}</td>
        <td>${exp.money}</td>
        <td>${exp.category}</td>
        <td>${exp.opisanie || ""}</td>
      `;
      tbody.appendChild(tr);
    }
  });
}

searchBtn.addEventListener("click", () => {
  filterExpenses();
});

resetBtn.addEventListener("click", () => {
  searchDateInput.value = "";
  searchCategoryInput.value = "";
  searchMoneyInput.value = "";
  showTodayExpenses();
});


// ======== ПОКАЗ РАСХОДОВ ПО ПЕРИОДУ ========
const periodTableBody = document.querySelector("#periodTable tbody");

// Функция для обновления таблицы по выбранному периоду
function showExpensesByPeriod(startDate, endDate) {
  periodTableBody.innerHTML = "";

  expenses.forEach(exp => {
    const expDate = new Date(exp.date);
    if (expDate >= startDate && expDate <= endDate) {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${formatDate(exp.date)}</td>
        <td>${exp.money}</td>
        <td>${exp.category}</td>
        <td>${exp.opisanie || ""}</td>
      `;
      periodTableBody.appendChild(tr);
    }
  });
}


function showDay() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  showExpensesByPeriod(start, end);
}

function showWeek() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (воскресенье) - 6 (суббота)
  const start = new Date(now);
  start.setDate(now.getDate() - dayOfWeek); // начало недели (воскресенье)
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  showExpensesByPeriod(start, end);
}

function showMonth() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  showExpensesByPeriod(start, end);
}


// При загрузке показываем сегодня по умолчанию
document.addEventListener("DOMContentLoaded", () => {
  showDay();
});



//================footer============================
let currentPeriod = "day"; // day | week | month

function getPeriodLabel(period) {
  if (period === "day") return "Сегодня";
  if (period === "week") return "За неделю";
  if (period === "month") return "За месяц";
  return "";
}

function getExpensesByPeriod(period) {
  const now = new Date();

  return expenses.filter(exp => {
    const d = new Date(exp.date);

    if (period === "day") {
      return d.toDateString() === now.toDateString();
    }

    if (period === "week") {
      const start = new Date();
      start.setDate(now.getDate() - 6);
      return d >= start && d <= now;
    }

    if (period === "month") {
      return d.getMonth() === now.getMonth() &&
             d.getFullYear() === now.getFullYear();
    }
  });
}

function updateFooterStats() {
  const list = getExpensesByPeriod(currentPeriod);

  const count = list.length;
  const sum = list.reduce((s, e) => s + e.money, 0);

  const label = getPeriodLabel(currentPeriod);

  document.getElementById("footerStats").textContent =
    `${label}: ${count} расход(ов) -  ${sum} сомони`;
}

function showDay() {
  currentPeriod = "day";
  renderPeriodTable("day");
  updateFooterStats();
}

function showWeek() {
  currentPeriod = "week";
  renderPeriodTable("week");
  updateFooterStats();
}

function showMonth() {
  currentPeriod = "month";
  renderPeriodTable("month");
  updateFooterStats();
}


function renderPeriodTable(period) {
  const tbody = document.querySelector("#periodTable tbody");
  tbody.innerHTML = "";

  getExpensesByPeriod(period).forEach(exp => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${formatDate(exp.date)}</td>
      <td>${exp.money}</td>
      <td>${exp.category}</td>
      <td>${exp.opisanie || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  showDay();
});

//================footer============================
