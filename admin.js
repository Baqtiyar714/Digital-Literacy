const API = "http://localhost:5000";
let adminPassword = "";
let adminUsername = "";

const COMP_LABELS = {
  information: "Ақпарат",
  communication: "Коммуникация",
  content: "Контент",
  safety: "Қауіпсіздік",
  problem: "Проблема шешу",
};
const COMP_CLASSES = {
  information: "badge-info",
  communication: "badge-comm",
  content: "badge-cont",
  safety: "badge-safe",
  problem: "badge-prob",
};

// ── UTILS ──
function showMsg(id, text, type) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = text;
  el.className = "msg show msg-" + type;
  setTimeout(() => el.classList.remove("show"), 4000);
}

function getInitials(name) {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.substring(0, 2).toUpperCase();
}

// ── LOGIN ──
async function doLogin() {
  const username = document.getElementById("adminUsername").value.trim();
  const pwd = document.getElementById("adminPwd").value;

  if (!username) {
    showMsg("loginMsg", "Атыңызды енгізіңіз", "error");
    return;
  }
  if (!pwd) {
    showMsg("loginMsg", "Парольді енгізіңіз", "error");
    return;
  }

  try {
    const resp = await fetch(API + "/admin/stats", {
      headers: { "x-admin-password": pwd },
    });
    if (resp.ok) {
      adminPassword = pwd;
      adminUsername = username;
      localStorage.setItem("adminUsername", username);

      document.getElementById("loginWrap").classList.add("hidden");
      document.getElementById("adminApp").classList.remove("hidden");

      // Set avatar and name in header
      document.getElementById("headerAvatar").textContent =
        getInitials(username);
      document.getElementById("headerName").textContent = username;

      loadStats();
      loadQuestions();
    } else {
      showMsg("loginMsg", "Пароль қате!", "error");
    }
  } catch (e) {
    showMsg("loginMsg", "Сервермен байланыс жоқ", "error");
  }
}

function doLogout() {
  adminPassword = "";
  adminUsername = "";
  localStorage.removeItem("adminUsername");
  document.getElementById("loginWrap").classList.remove("hidden");
  document.getElementById("adminApp").classList.add("hidden");
  document.getElementById("adminPwd").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  // Restore username if saved
  const savedName = localStorage.getItem("adminUsername");
  if (savedName) document.getElementById("adminUsername").value = savedName;

  document.getElementById("adminPwd").addEventListener("keydown", (e) => {
    if (e.key === "Enter") doLogin();
  });
  document.getElementById("adminUsername").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("adminPwd").focus();
  });

  document.getElementById("editModal").addEventListener("click", (e) => {
    if (e.target === document.getElementById("editModal")) closeEdit();
  });
});

// ── STATS ──
async function loadStats() {
  try {
    const resp = await fetch(API + "/admin/stats", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById("statQuestions").textContent = data.questions;
      document.getElementById("statResults").textContent = data.results;
      document.getElementById("statAvg").textContent = data.avgPercent + "%";
    }
  } catch (e) {}
}

// ── QUESTIONS LIST ──
async function loadQuestions() {
  const search = document.getElementById("filterSearch").value;
  const comp = document.getElementById("filterComp").value;
  const age = document.getElementById("filterAge").value;
  const field = document.getElementById("filterField").value;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (comp) params.append("competency", comp);
  if (age) params.append("age_group", age);
  if (field) params.append("field", field);

  document.getElementById("questionsTable").innerHTML =
    '<div class="loading">⏳ Жүктелуде...</div>';

  try {
    const resp = await fetch(API + "/admin/questions?" + params, {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await resp.json();
    if (!data.success) return;

    document.getElementById("questionsCount").textContent =
      data.count + " сұрақ";

    if (data.count === 0) {
      document.getElementById("questionsTable").innerHTML =
        '<div class="empty"><div class="empty-icon">🔍</div>Сұрақтар табылмады</div>';
      return;
    }

    const rows = data.data
      .map(
        (q) => `
      <tr>
        <td style="font-family:monospace;color:var(--muted);font-size:0.75rem;">#${q.id}</td>
        <td>
          <div class="q-text" title="${q.text}">${q.text}</div>
          <div class="q-options">A) ${q.option_a} &nbsp;·&nbsp; B) ${q.option_b} &nbsp;·&nbsp; C) ${q.option_c} &nbsp;·&nbsp; D) ${q.option_d}</div>
        </td>
        <td><span class="correct-badge">${q.correct_answer}</span></td>
        <td><span class="badge ${COMP_CLASSES[q.competency]}">${COMP_LABELS[q.competency]}</span></td>
        <td class="cat-text">${q.age_group}<br>${q.education}<br>${q.field}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-outline btn-sm" onclick="openEdit(${q.id})">✏️ Өзгерту</button>
            <button class="btn btn-danger btn-sm" onclick="deleteQ(${q.id})">🗑️</button>
          </div>
        </td>
      </tr>
    `,
      )
      .join("");

    document.getElementById("questionsTable").innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Сұрақ мәтіні</th>
            <th>Дұрыс</th>
            <th>Құзыреттілік</th>
            <th>Категория</th>
            <th>Әрекет</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (e) {
    document.getElementById("questionsTable").innerHTML =
      '<div class="empty">❌ Қате шықты. Серверді тексеріңіз.</div>';
  }
}

function resetFilters() {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterComp").value = "";
  document.getElementById("filterAge").value = "";
  document.getElementById("filterField").value = "";
  loadQuestions();
}

// ── ADD QUESTION ──
async function addQuestion() {
  const body = {
    text: document.getElementById("addText").value.trim(),
    option_a: document.getElementById("addA").value.trim(),
    option_b: document.getElementById("addB").value.trim(),
    option_c: document.getElementById("addC").value.trim(),
    option_d: document.getElementById("addD").value.trim(),
    correct_answer: document.getElementById("addCorrect").value,
    competency: document.getElementById("addComp").value,
    age_group: document.getElementById("addAge").value,
    education: document.getElementById("addEdu").value,
    field: document.getElementById("addField").value,
  };

  if (
    !body.text ||
    !body.option_a ||
    !body.option_b ||
    !body.option_c ||
    !body.option_d ||
    !body.correct_answer ||
    !body.competency
  ) {
    showMsg("addMsg", "⚠️ Міндетті өрістерді толтырыңыз!", "error");
    return;
  }

  try {
    const resp = await fetch(API + "/admin/questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (data.success) {
      showMsg("addMsg", "✅ Сұрақ сәтті сақталды!", "success");
      clearForm();
      loadStats();
    } else {
      showMsg("addMsg", data.message || "Қате шықты", "error");
    }
  } catch (e) {
    showMsg("addMsg", "Сервермен байланыс жоқ", "error");
  }
}

function clearForm() {
  ["addText", "addA", "addB", "addC", "addD"].forEach((id) => {
    document.getElementById(id).value = "";
  });
  document.getElementById("addCorrect").value = "";
  document.getElementById("addComp").value = "";
  document.getElementById("addAge").value = "all";
  document.getElementById("addEdu").value = "all";
  document.getElementById("addField").value = "all";
}

async function openEdit(id) {
  try {
    const resp = await fetch(API + "/admin/questions", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await resp.json();
    const q = data.data.find((x) => x.id === id);
    if (!q) return;

    document.getElementById("editId").value = q.id;
    document.getElementById("editText").value = q.text;
    document.getElementById("editA").value = q.option_a;
    document.getElementById("editB").value = q.option_b;
    document.getElementById("editC").value = q.option_c;
    document.getElementById("editD").value = q.option_d;
    document.getElementById("editCorrect").value = q.correct_answer;
    document.getElementById("editComp").value = q.competency;
    document.getElementById("editAge").value = q.age_group;
    document.getElementById("editEdu").value = q.education;
    document.getElementById("editField").value = q.field;

    document.getElementById("editModal").classList.add("open");
  } catch (e) {}
}

function closeEdit() {
  document.getElementById("editModal").classList.remove("open");
}

async function saveEdit() {
  const id = document.getElementById("editId").value;
  const body = {
    text: document.getElementById("editText").value.trim(),
    option_a: document.getElementById("editA").value.trim(),
    option_b: document.getElementById("editB").value.trim(),
    option_c: document.getElementById("editC").value.trim(),
    option_d: document.getElementById("editD").value.trim(),
    correct_answer: document.getElementById("editCorrect").value,
    competency: document.getElementById("editComp").value,
    age_group: document.getElementById("editAge").value,
    education: document.getElementById("editEdu").value,
    field: document.getElementById("editField").value,
  };

  try {
    const resp = await fetch(API + "/admin/questions/" + id, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-password": adminPassword,
      },
      body: JSON.stringify(body),
    });
    const data = await resp.json();
    if (data.success) {
      showMsg("editMsg", "✅ Сәтті сақталды!", "success");
      setTimeout(closeEdit, 1000);
      loadQuestions();
    } else {
      showMsg("editMsg", data.message || "Қате шықты", "error");
    }
  } catch (e) {
    showMsg("editMsg", "Сервермен байланыс жоқ", "error");
  }
}

async function deleteQ(id) {
  if (!confirm("Сұрақты жою керек пе?")) return;
  try {
    const resp = await fetch(API + "/admin/questions/" + id, {
      method: "DELETE",
      headers: { "x-admin-password": adminPassword },
    });
    const data = await resp.json();
    if (data.success) {
      loadQuestions();
      loadStats();
    }
  } catch (e) {}
}

function switchTab(tab, btn) {
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  btn.classList.add("active");
  document.getElementById("tabList").classList.toggle("hidden", tab !== "list");
  document.getElementById("tabAdd").classList.toggle("hidden", tab !== "add");
  if (tab === "list") loadQuestions();
}
