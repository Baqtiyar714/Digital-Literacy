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
      localStorage.setItem("adminPassword", pwd);

      document.getElementById("loginWrap").classList.add("hidden");
      document.getElementById("adminApp").classList.remove("hidden");

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
  localStorage.removeItem("adminPassword");
  document.getElementById("loginWrap").classList.remove("hidden");
  document.getElementById("adminApp").classList.add("hidden");
  document.getElementById("adminPwd").value = "";
}

document.addEventListener("DOMContentLoaded", () => {
  const savedName = localStorage.getItem("adminUsername");
  const savedPwd = localStorage.getItem("adminPassword");

  if (savedName && savedPwd) {
    adminUsername = savedName;
    adminPassword = savedPwd;
    document.getElementById("loginWrap").classList.add("hidden");
    document.getElementById("adminApp").classList.remove("hidden");
    document.getElementById("headerAvatar").textContent =
      getInitials(savedName);
    document.getElementById("headerName").textContent = savedName;
    loadStats();
    loadQuestions();
  } else if (savedName) {
    document.getElementById("adminUsername").value = savedName;
  }

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

async function loadStats() {
  try {
    const resp = await fetch(API + "/admin/stats", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await resp.json();
    if (data.success) {
      document.getElementById("statQuestions").textContent = data.questions;
      document.getElementById("statUsers").textContent = data.users ?? "—";
      document.getElementById("statResults").textContent = data.results;
      document.getElementById("statAvg").textContent = data.avgPercent + "%";
    }
  } catch (e) {}
}

async function loadQuestions() {
  const search = document.getElementById("filterSearch").value;
  const comp = document.getElementById("filterComp").value;
  const age = document.getElementById("filterAge").value;
  const edu = document.getElementById("filterEdu").value;

  const params = new URLSearchParams();
  if (search) params.append("search", search);
  if (comp) params.append("competency", comp);
  if (age) params.append("age_group", age);
  if (edu) params.append("education", edu);

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
        <td style="text-align:center;width:36px;">
          <input type="checkbox" class="q-checkbox" data-id="${q.id}"
            style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary);"
            onchange="onCheckboxChange()">
        </td>
        <td style="font-family:monospace;color:var(--muted);font-size:0.75rem;">#${q.id}</td>
        <td>
          <div class="q-text" title="${q.text}">${q.text}</div>
          <div class="q-options">A) ${q.option_a} &nbsp;·&nbsp; B) ${q.option_b} &nbsp;·&nbsp; C) ${q.option_c} &nbsp;·&nbsp; D) ${q.option_d}</div>
        </td>
        <td><span class="correct-badge">${q.correct_answer}</span></td>
        <td><span class="badge ${COMP_CLASSES[q.competency]}">${COMP_LABELS[q.competency]}</span></td>
        <td class="cat-text">${q.age_group}<br>${q.education}</td>
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
            <th style="width:36px;text-align:center;"></th>
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
    updateBulkBar();
  } catch (e) {
    document.getElementById("questionsTable").innerHTML =
      '<div class="empty">❌ Қате шықты. Серверді тексеріңіз.</div>';
  }
}

function resetFilters() {
  document.getElementById("filterSearch").value = "";
  document.getElementById("filterComp").value = "";
  document.getElementById("filterAge").value = "";
  document.getElementById("filterEdu").value = "";
  loadQuestions();
}

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
  document.getElementById("addAge").value = "";
  document.getElementById("addEdu").value = "";
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
  document
    .getElementById("tabImport")
    .classList.toggle("hidden", tab !== "import");
  document
    .getElementById("tabUsers")
    .classList.toggle("hidden", tab !== "users");
  if (tab === "list") loadQuestions();
  if (tab === "users") loadUsers();
}

let importData = [];

document.addEventListener("DOMContentLoaded", () => {
  const fileInput = document.getElementById("importFile");
  if (fileInput) {
    fileInput.addEventListener("change", handleFileSelect);
  }
});

function handleFileSelect(e) {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (ev) {
    try {
      const parsed = JSON.parse(ev.target.result);
      if (!Array.isArray(parsed)) {
        showMsg("importMsg", "❌ JSON массив болуы керек [ ]", "error");
        return;
      }
      importData = parsed;
      const preview = document.getElementById("importPreview");
      const previewText = document.getElementById("importPreviewText");
      preview.classList.remove("hidden");

      const comps = {};
      parsed.forEach((q) => {
        comps[q.competency] = (comps[q.competency] || 0) + 1;
      });
      const compStr = Object.entries(comps)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" | ");
      previewText.innerHTML = `✅ <strong>${parsed.length} сұрақ</strong> табылды<br><span style="font-size:0.8rem;opacity:0.8;">${compStr}</span>`;
    } catch (err) {
      showMsg("importMsg", "❌ JSON форматы қате: " + err.message, "error");
    }
  };
  reader.readAsText(file, "UTF-8");
}

async function startImport() {
  if (!importData.length) {
    showMsg("importMsg", "⚠️ Алдымен JSON файлын таңдаңыз", "error");
    return;
  }

  const total = importData.length;
  let success = 0;
  let failed = 0;
  const errors = [];

  document.getElementById("importProgress").classList.remove("hidden");
  document.getElementById("importResult").classList.add("hidden");

  const BATCH = 10;
  for (let i = 0; i < total; i += BATCH) {
    const batch = importData.slice(i, i + BATCH);

    await Promise.all(
      batch.map(async (q, idx) => {
        try {
          const resp = await fetch(API + "/admin/questions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-admin-password": adminPassword,
            },
            body: JSON.stringify({
              text: q.text,
              option_a: q.option_a,
              option_b: q.option_b,
              option_c: q.option_c,
              option_d: q.option_d,
              correct_answer: (q.correct_answer || "A").toUpperCase(),
              competency: q.competency || "information",
              age_group: q.age_group || null,
              education: q.education || null,
            }),
          });
          const data = await resp.json();
          if (data.success) {
            success++;
          } else {
            failed++;
            errors.push(`#${i + idx + 1}: ${data.message}`);
          }
        } catch (err) {
          failed++;
          errors.push(`#${i + idx + 1}: желі қатесі`);
        }
      }),
    );

    const done = Math.min(i + BATCH, total);
    const pct = Math.round((done / total) * 100);
    document.getElementById("importProgressBar").style.width = pct + "%";
    document.getElementById("importProgressText").textContent =
      done + " / " + total;
  }

  document.getElementById("importResult").classList.remove("hidden");
  const body = document.getElementById("importResultBody");
  body.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px;">
      <div style="padding:14px;background:#e8f5e9;border-radius:10px;border:1px solid #a5d6a7;text-align:center;">
        <div style="font-size:1.6rem;font-weight:700;color:#1b8a4e;">${success}</div>
        <div style="font-size:0.8rem;color:#2e7d32;">Сәтті қосылды</div>
      </div>
      <div style="padding:14px;background:${failed ? "#ffebee" : "#f0f4ff"};border-radius:10px;border:1px solid ${failed ? "#ffcdd2" : "#dde1f5"};text-align:center;">
        <div style="font-size:1.6rem;font-weight:700;color:${failed ? "#e53935" : "#9ba3c9"};">${failed}</div>
        <div style="font-size:0.8rem;color:${failed ? "#c62828" : "#9ba3c9"};">Қате</div>
      </div>
    </div>
    ${errors.length ? `<details style="font-size:0.78rem;color:#e53935;"><summary>Қателер тізімі</summary><pre style="margin-top:8px;">${errors.slice(0, 20).join("\n")}</pre></details>` : ""}
  `;

  if (failed === 0) {
    showMsg("importMsg", `✅ ${success} сұрақ сәтті жүктелді!`, "success");
  } else {
    showMsg("importMsg", `⚠️ ${success} сәтті, ${failed} қате`, "error");
  }

  loadStats();
  importData = [];
  document.getElementById("importFile").value = "";
  document.getElementById("importPreview").classList.add("hidden");
  document.getElementById("importProgress").classList.add("hidden");
}

function downloadTemplate() {
  const template = [
    {
      text: "Интернетте ақпарат іздегенде қай іздеу жүйесі ең кеңінен қолданылады?",
      option_a: "Yahoo",
      option_b: "Google",
      option_c: "Bing",
      option_d: "DuckDuckGo",
      correct_answer: "B",
      competency: "information",
      age_group: "10-18",
      education: "Орта мектеп",
    },
    {
      text: "Email арқылы ресми хат жазғанда қандай тіл қолдану керек?",
      option_a: "Сленг тіл",
      option_b: "Ресми, сыпайы тіл",
      option_c: "Қысқартулар мен эмодзи",
      option_d: "Бейресми тіл",
      correct_answer: "B",
      competency: "communication",
      age_group: "19-35",
      education: "Жоғары",
    },
    {
      text: "Интернетке жарияланған мазмұнды (сурет, мақала) пайдаланғанда не істеу керек?",
      option_a: "Тікелей пайдалану",
      option_b: "Авторды көрсету және рұқсат алу",
      option_c: "Атауын өзгерту",
      option_d: "Басқа сайтқа жою",
      correct_answer: "B",
      competency: "content",
      age_group: "19-35",
      education: "Жоғары",
    },
    {
      text: "Фишинг шабуылынан сақтанудың ең тиімді жолы қандай?",
      option_a: "Барлық электрондық хаттарды оқу",
      option_b: "Күдікті сілтемелерді баспау",
      option_c: "Антивирус орнату",
      option_d: "Парольді жиі ауыстыру",
      correct_answer: "B",
      competency: "safety",
      age_group: "36-60",
      education: "Колледж",
    },
    {
      text: "Компьютер баяу жұмыс істесе алдымен не тексеру керек?",
      option_a: "Жаңа компьютер сатып алу",
      option_b: "Қажетсіз бағдарламаларды жою және дискіні тазалау",
      option_c: "Интернетті өшіру",
      option_d: "Барлық файлдарды жою",
      correct_answer: "B",
      competency: "problem",
      age_group: "60+",
      education: "Орта мектеп",
    },
  ];

  const blob = new Blob([JSON.stringify(template, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "questions_template.json";
  a.click();
  URL.revokeObjectURL(url);
}

let allSelected = false;

function onCheckboxChange() {
  const checkboxes = document.querySelectorAll(".q-checkbox");
  const checked = document.querySelectorAll(".q-checkbox:checked");
  allSelected = checkboxes.length > 0 && checked.length === checkboxes.length;
  updateSelectAllBtn();
  updateBulkBar();
}

function toggleSelectAll() {
  const checkboxes = document.querySelectorAll(".q-checkbox");
  if (checkboxes.length === 0) return;
  const checked = document.querySelectorAll(".q-checkbox:checked");
  const shouldSelect = checked.length < checkboxes.length;
  checkboxes.forEach((c) => (c.checked = shouldSelect));
  allSelected = shouldSelect;
  updateSelectAllBtn();
  updateBulkBar();
}

function updateSelectAllBtn() {
  const btn = document.getElementById("selectAllBtn");
  if (!btn) return;
  const checkboxes = document.querySelectorAll(".q-checkbox");
  const checked = document.querySelectorAll(".q-checkbox:checked");
  if (checkboxes.length > 0 && checked.length === checkboxes.length) {
    btn.textContent = "☐ Таңдауды алу";
    btn.style.borderColor = "var(--error)";
    btn.style.color = "var(--error)";
  } else {
    btn.textContent = "☑️ Барлығын таңдау";
    btn.style.borderColor = "";
    btn.style.color = "";
  }
}

function updateBulkBar() {
  const checked = document.querySelectorAll(".q-checkbox:checked");
  const bar = document.getElementById("bulkBar");
  const countEl = document.getElementById("bulkCount");
  if (!bar) return;
  if (checked.length > 0) {
    bar.style.display = "flex";
    countEl.textContent = checked.length;
  } else {
    bar.style.display = "none";
  }
}

function cancelSelection() {
  document.querySelectorAll(".q-checkbox").forEach((c) => (c.checked = false));
  allSelected = false;
  updateSelectAllBtn();
  updateBulkBar();
}

async function deleteSelected() {
  const checked = document.querySelectorAll(".q-checkbox:checked");
  if (!checked.length) return;
  const ids = Array.from(checked).map((c) => c.dataset.id);
  if (
    !confirm(
      ids.length + " сұрақты жоясыз ба? Бұл әрекетті қайтару мүмкін емес!",
    )
  )
    return;

  const btn = document.getElementById("bulkDeleteBtn");
  btn.disabled = true;
  btn.textContent = "⏳ Жойылуда...";

  let success = 0,
    failed = 0;
  for (const id of ids) {
    try {
      const resp = await fetch(API + "/admin/questions/" + id, {
        method: "DELETE",
        headers: { "x-admin-password": adminPassword },
      });
      const data = await resp.json();
      if (data.success) success++;
      else failed++;
    } catch (e) {
      failed++;
    }
  }

  btn.disabled = false;
  btn.textContent = "🗑️ Жою";

  const bar = document.getElementById("bulkBar");
  if (bar) bar.style.display = "none";

  if (failed === 0) {
    showMsg("listMsg", "✅ " + success + " сұрақ сәтті жойылды!", "success");
  } else {
    showMsg(
      "listMsg",
      "⚠️ " + success + " жойылды, " + failed + " қате шықты",
      "error",
    );
  }
  loadQuestions();
  loadStats();
}

async function loadUsers() {
  document.getElementById("usersTable").innerHTML =
    '<div class="loading">⏳ Жүктелуде...</div>';
  try {
    const resp = await fetch(API + "/admin/users", {
      headers: { "x-admin-password": adminPassword },
    });
    const data = await resp.json();
    if (!data.success) throw new Error(data.message);

    document.getElementById("usersCount").textContent =
      data.count + " қолданушы";

    if (!data.data.length) {
      document.getElementById("usersTable").innerHTML =
        '<div class="empty"><div class="empty-icon">👥</div>Қолданушылар жоқ</div>';
      return;
    }

    const rows = data.data
      .map(
        (u) => `
      <tr>
        <td style="font-family:monospace;color:var(--muted);font-size:0.75rem;">#${u.id}</td>
        <td><strong>${u.name}</strong></td>
        <td style="color:var(--muted);font-size:0.88rem;">${u.email}</td>
        <td style="font-size:0.82rem;color:var(--muted);">${new Date(u.created_at).toLocaleDateString("kk-KZ", { year: "numeric", month: "2-digit", day: "2-digit" })}</td>
        <td style="text-align:center;">
          <span class="count-chip">${u.test_count}</span>
        </td>
        <td style="text-align:center;">
          ${u.avg_score !== null ? `<span class="badge ${u.avg_score >= 70 ? "badge-safe" : u.avg_score >= 40 ? "badge-comm" : "badge-prob"}">${u.avg_score}%</span>` : '<span style="color:var(--muted);font-size:0.82rem;">—</span>'}
        </td>
      </tr>
    `,
      )
      .join("");

    document.getElementById("usersTable").innerHTML = `
      <table>
        <thead>
          <tr>
            <th>#</th>
            <th>Аты-жөні</th>
            <th>Email</th>
            <th>Тіркелген күні</th>
            <th style="text-align:center;">Тест саны</th>
            <th style="text-align:center;">Орт. нәтиже</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>`;
  } catch (e) {
    document.getElementById("usersTable").innerHTML =
      `<div class="empty">❌ ${e.message}</div>`;
  }
}
