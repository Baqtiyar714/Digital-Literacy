(function () {
  "use strict";

  var API_BASE = "http://localhost:5000";

  var HISTORY_KEY = "diq_test_history";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";
  var AI_CACHE_KEY = "diq_ai_result";

  var BLOCKS = [
    { id: "information", title: "Ақпарат", color: "#0097a7", icon: "🔍" },
    {
      id: "communication",
      title: "Коммуникация",
      color: "#f57c00",
      icon: "🛡️",
    },
    { id: "content", title: "Контент", color: "#5e35b1", icon: "🏛️" },
    { id: "safety", title: "Қауіпсіздік", color: "#c62828", icon: "💬" },
    {
      id: "problem",
      title: "Проблемаларды шешу",
      color: "#2e7d32",
      icon: "⚙️",
    },
  ];

  var OPTION_KEYS = ["A", "B", "C", "D"];

  var LEVEL_DESCS = {
    1: "Цифрлық дағдылар әлі дамып келе жатыр. Негізгі цифрлық құралдармен жұмыс жасауды жалғастыру ұсынылады.",
    2: "Цифрлық сауаттылық орта деңгейде. Жаңа технологияларды үйрену арқылы білімді тереңдетуге болады.",
    3: "Цифрлық дағдылар жоғары деңгейде. Күрделі цифрлық міндеттерді еркін шеше алатын деңгей.",
  };

  var GROQ_API_KEY =
    typeof window !== "undefined" && window.GROQ_API_KEY
      ? window.GROQ_API_KEY
      : "YOUR_API_KEY";

  var state = {
    current: 0,
    answers: [],
    questions: [],
    userInfo: null,
    started: false,
  };

  var screenIntro = document.getElementById("screenIntro");
  var screenQuestion = document.getElementById("screenQuestion");
  var screenResult = document.getElementById("screenResult");
  var progressFill = document.getElementById("progressFill");
  var topbarCounter = document.getElementById("topbarCounter");
  var blockIcon = document.getElementById("blockIcon");
  var blockName = document.getElementById("blockName");
  var blockQNum = document.getElementById("blockQNum");
  var blockLabel = document.getElementById("blockLabel");
  var questionText = document.getElementById("questionText");
  var optionsWrap = document.getElementById("optionsWrap");
  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var startBtn = document.getElementById("startBtn");
  var downloadBtn = document.getElementById("downloadBtn");
  var retakeBtn = document.getElementById("retakeBtn");

  function init() {
    try {
      if (
        !localStorage.getItem(USER_KEY) &&
        !localStorage.getItem(LEGACY_KEY)
      ) {
        window.location.href = "index.html";
        return;
      }
    } catch (_) {}

    try {
      var raw =
        localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_KEY);
      var user = raw ? JSON.parse(raw) : null;
      if (user && user.name) {
        var nameEl = document.getElementById("introName");
        if (nameEl) nameEl.value = user.name.split(" ")[0];
      }
    } catch (_) {}

    startBtn.addEventListener("click", onStart);
    prevBtn.addEventListener("click", onPrev);
    nextBtn.addEventListener("click", onNext);
    retakeBtn.addEventListener("click", onRetake);
    if (downloadBtn) downloadBtn.addEventListener("click", onDownload);

    showScreen("intro");
  }

  function showScreen(name) {
    screenIntro.classList.add("quiz-screen--hidden");
    screenQuestion.classList.add("quiz-screen--hidden");
    screenResult.classList.add("quiz-screen--hidden");

    var target;
    if (name === "intro") {
      screenIntro.classList.remove("quiz-screen--hidden");
      target = screenIntro;
    } else if (name === "question") {
      screenQuestion.classList.remove("quiz-screen--hidden");
      target = screenQuestion;
    } else {
      screenResult.classList.remove("quiz-screen--hidden");
      target = screenResult;
    }

    target.style.animation = "none";
    void target.offsetWidth;
    target.style.animation = "";
  }

  function showLoading(show) {
    startBtn.disabled = show;
    startBtn.innerHTML = show
      ? "Жүктелуде..."
      : 'Сынақты бастау <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  async function onStart() {
    var name = (document.getElementById("introName").value || "").trim();
    var age = document.getElementById("introAge").value;
    var edu = document.getElementById("introEducation").value;

    if (!name) {
      var nameEl = document.getElementById("introName");
      nameEl.focus();
      nameEl.style.borderColor = "#e53935";
      return;
    }

    state.userInfo = { name: name, age: age, education: edu };
    showLoading(true);

    try {
      var response = await fetch(API_BASE + "/test/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ age_group: age, education: edu }),
      });

      if (!response.ok) throw new Error("Сервер қатесі: " + response.status);

      var data = await response.json();
      if (!data.success || !data.data || data.data.length === 0) {
        throw new Error("Сұрақтар табылмады. Алдымен сұрақтар қосыңыз.");
      }

      state.questions = data.data;
      state.current = 0;
      state.answers = new Array(state.questions.length).fill(null);
      state.started = true;

      showLoading(false);
      showScreen("question");
      renderQuestion();
    } catch (err) {
      showLoading(false);
      alert("Қате: " + err.message);
    }
  }

  function getBlockInfo(competency) {
    return (
      BLOCKS.find(function (b) {
        return b.id === competency;
      }) || BLOCKS[0]
    );
  }

  function renderQuestion() {
    var idx = state.current;
    var q = state.questions[idx];
    var saved = state.answers[idx];
    var total = state.questions.length;
    var block = getBlockInfo(q.competency);

    var pct = (idx / total) * 100;
    progressFill.style.width = pct + "%";
    if (topbarCounter) topbarCounter.textContent = idx + 1 + " / " + total;

    blockIcon.textContent = block.icon;
    blockName.textContent = block.title;

    var blockQs = state.questions.filter(function (x) {
      return x.competency === q.competency;
    });
    var qNumInBlock =
      blockQs.findIndex(function (x) {
        return x.id === q.id;
      }) + 1;
    blockQNum.textContent = qNumInBlock + " / " + blockQs.length;
    blockLabel.style.borderColor = block.color + "66";

    questionText.textContent = q.text;

    optionsWrap.innerHTML = "";
    var opts = [
      { key: "A", text: q.option_a },
      { key: "B", text: q.option_b },
      { key: "C", text: q.option_c },
      { key: "D", text: q.option_d },
    ];

    opts.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "quiz-option" + (saved === opt.key ? " quiz-option--selected" : "");
      btn.setAttribute("data-key", opt.key);

      var radio = document.createElement("span");
      radio.className = "quiz-option__radio";

      var label = document.createElement("span");
      label.className = "quiz-option__text";
      label.textContent = opt.key + ") " + opt.text;

      btn.appendChild(radio);
      btn.appendChild(label);
      btn.addEventListener("click", function () {
        selectOption(opt.key);
      });
      optionsWrap.appendChild(btn);
    });

    prevBtn.style.visibility = idx === 0 ? "hidden" : "visible";

    var isLast = idx === total - 1;
    if (isLast) {
      nextBtn.innerHTML =
        "Аяқтау <svg width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M20 6L9 17l-5-5' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";
    } else {
      nextBtn.innerHTML =
        "Келесі <svg width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";
    }
    nextBtn.disabled = saved === null;
  }

  function selectOption(key) {
    state.answers[state.current] = key;
    document.querySelectorAll(".quiz-option").forEach(function (btn) {
      btn.classList.toggle(
        "quiz-option--selected",
        btn.getAttribute("data-key") === key,
      );
    });
    nextBtn.disabled = false;
  }

  function onPrev() {
    if (state.current > 0) {
      state.current--;
      renderQuestion();
    }
  }

  function onNext() {
    if (state.answers[state.current] === null) return;
    if (state.current === state.questions.length - 1) {
      finishQuiz();
    } else {
      state.current++;
      renderQuestion();
    }
  }

  async function finishQuiz() {
    progressFill.style.width = "100%";
    if (topbarCounter)
      topbarCounter.textContent =
        state.questions.length + " / " + state.questions.length;

    var answers = state.questions.map(function (q, i) {
      return { question_id: q.id, answer: state.answers[i] };
    });

    var user = null;
    try {
      var raw =
        localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_KEY);
      user = raw ? JSON.parse(raw) : null;
    } catch (_) {}

    try {
      var response = await fetch(API_BASE + "/test/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user ? user.id : null,
          answers: answers,
          age_group: state.userInfo.age,
          education: state.userInfo.education,
        }),
      });

      var data = await response.json();
      if (data.success) {
        var scaledScores = {};
        Object.keys(data.scores).forEach(function (k) {
          scaledScores[k] = data.scores[k] * 5;
        });
        saveHistory(scaledScores, data.total * 5, 100);
        showScreen("result");
        renderResult(scaledScores, data.total * 5, 100);
      } else {
        throw new Error(data.message || "Submit қатесі");
      }
    } catch (err) {
      var localScores = computeLocalScores();
      saveHistory(localScores.scores, localScores.total, 100);
      showScreen("result");
      renderResult(localScores.scores, localScores.total, 100);
    }
  }

  function computeLocalScores() {
    var scores = {
      information: 0,
      communication: 0,
      content: 0,
      safety: 0,
      problem: 0,
    };
    var total = 0;
    state.questions.forEach(function (q, i) {
      if (state.answers[i] === q.correct_answer) {
        scores[q.competency] = (scores[q.competency] || 0) + 5;
        total += 5;
      }
    });
    return { scores: scores, total: total };
  }

  function saveHistory(scores, total, maxScore) {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      var hist = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(hist)) hist = [];
      var lvl = getLevelForScore(total, maxScore);
      hist.unshift({
        date: new Date().toISOString(),
        totalScore: total,
        maxScore: maxScore,
        levelNum: lvl.num,
        levelKk: lvl.kk,
        blockScores: scores,
        userInfo: state.userInfo,
      });
      if (hist.length > 10) hist = hist.slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch (_) {}
  }

  function getLevelForScore(score, maxScore) {
    var max = maxScore !== undefined ? maxScore : 20;
    var pct = max > 0 ? (score / max) * 100 : 0;
    if (pct < 34) return { num: 1, kk: "Төмен", color: "#ef5350" };
    if (pct < 67) return { num: 2, kk: "Орташа", color: "#f9a825" };
    return { num: 3, kk: "Жоғары", color: "#1b8a4e" };
  }

  function renderResult(scores, total, maxScore) {
    var lvl = getLevelForScore(total, maxScore);

    document.getElementById("overallLevelText").textContent = lvl.kk;
    document.getElementById("overallLevelNum").textContent = lvl.kk + " деңгей";
    document.getElementById("overallScore").textContent =
      total + " / " + maxScore + " балл";

    var overall = document.getElementById("resultOverall");
    overall.style.borderLeftColor = lvl.color;

    var segsEl = document.getElementById("overallSegs");
    segsEl.innerHTML = "";
    for (var i = 1; i <= 3; i++) {
      var seg = document.createElement("div");
      seg.className = "result-seg" + (i <= lvl.num ? " filled" : "");
      if (i <= lvl.num) seg.style.background = lvl.color;
      segsEl.appendChild(seg);
    }

    var container = document.getElementById("resultBlocks");
    container.innerHTML = "";

    var perBlock = Math.floor(maxScore / BLOCKS.length);

    BLOCKS.forEach(function (block) {
      var score = scores[block.id] || 0;
      var bLvl = getLevelForScore(score, perBlock);

      var row = document.createElement("div");
      row.className = "result-block-row";
      row.style.setProperty("--block-color", block.color);

      var segsHtml = "";
      for (var n = 1; n <= 3; n++) {
        segsHtml +=
          '<div class="result-block-seg' +
          (n <= bLvl.num
            ? ' filled" style="background:' + block.color + '"'
            : '"') +
          "></div>";
      }

      row.innerHTML =
        '<div class="result-block-row__icon">' +
        block.icon +
        "</div>" +
        '<div class="result-block-row__info">' +
        '  <div class="result-block-row__name">' +
        block.title +
        "</div>" +
        '  <div class="result-block-row__segs">' +
        segsHtml +
        "</div>" +
        "</div>" +
        '<div class="result-block-row__right">' +
        '  <div class="result-block-row__level">' +
        bLvl.kk +
        "</div>" +
        '  <div class="result-block-row__score">' +
        score +
        " / " +
        perBlock +
        " балл</div>" +
        "</div>";

      var detail = document.createElement("div");
      detail.className = "result-block-detail";
      detail.innerHTML = "<p>" + (LEVEL_DESCS[bLvl.num] || "") + "</p>";

      row.addEventListener("click", function () {
        var isOpen = row.classList.contains("is-open");
        document
          .querySelectorAll(".result-block-row.is-open")
          .forEach(function (r) {
            r.classList.remove("is-open");
          });
        if (!isOpen) row.classList.add("is-open");
      });

      container.appendChild(row);
      container.appendChild(detail);
    });

    saveResultsToStorage(scores, total, maxScore);
    initAI(scores, total, maxScore);
  }

  function saveResultsToStorage(scores, total, maxScore) {
    try {
      var RESULTS_KEY = "diq_block_results";
      var now = new Date().toISOString();
      var perBlock = Math.floor(maxScore / BLOCKS.length);
      var all = {};
      BLOCKS.forEach(function (b) {
        all[b.id] = {
          score: scores[b.id] || 0,
          total: perBlock,
          date: now,
        };
      });
      all._lastTest = {
        total: total,
        maxScore: maxScore,
        date: now,
        blockScores: scores,
        perBlock: perBlock,
      };
      localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch (_) {}
  }

  function onRetake() {
    state.current = 0;
    state.answers = [];
    state.questions = [];
    state.started = false;
    progressFill.style.width = "0%";
    showScreen("intro");
  }

  function onDownload() {
    var scores = {};
    var total = 0;
    var maxScore = 100;
    var perBlock = Math.floor(maxScore / BLOCKS.length);

    state.questions.forEach(function (q, i) {
      if (!scores[q.competency]) scores[q.competency] = 0;
      if (state.answers[i] === q.correct_answer) {
        scores[q.competency] += 5;
        total += 5;
      }
    });

    var overallLvl = getLevelForScore(total, maxScore);
    var name = (state.userInfo && state.userInfo.name) || "Пайдаланушы";
    var age = (state.userInfo && state.userInfo.age) || "—";
    var edu = (state.userInfo && state.userInfo.education) || "—";
    var dateStr = formatDate(new Date().toISOString());

    var blocksHtml = BLOCKS.map(function (block) {
      var score = scores[block.id] || 0;
      var lvl = getLevelForScore(score, perBlock);
      var pct = perBlock > 0 ? Math.round((score / perBlock) * 100) : 0;

      var segHtml = "";
      for (var n = 1; n <= 3; n++) {
        segHtml +=
          '<div style="width:36px;height:10px;border-radius:3px;display:inline-block;margin-right:3px;background:' +
          (n <= lvl.num ? lvl.color : "#e0e0e0") +
          '"></div>';
      }

      return (
        '<div style="margin-bottom:28px;border-left:4px solid ' +
        block.color +
        ';padding-left:16px">' +
        '<h2 style="font-size:1.3rem;font-weight:700;margin:0 0 4px">' +
        block.icon +
        " " +
        block.title +
        "</h2>" +
        '<div style="color:' +
        lvl.color +
        ';font-weight:700;margin-bottom:6px">' +
        lvl.kk +
        " · " +
        score +
        "/" +
        perBlock +
        " балл · " +
        pct +
        "%</div>" +
        '<div style="margin-bottom:8px">' +
        segHtml +
        "</div>" +
        '<p style="font-size:.88rem;color:#5c6690;line-height:1.6">' +
        (LEVEL_DESCS[lvl.num] || "") +
        "</p>" +
        "</div>"
      );
    }).join("");

    var overallSegHtml = "";
    for (var n = 1; n <= 3; n++) {
      overallSegHtml +=
        '<div style="width:44px;height:12px;border-radius:3px;display:inline-block;margin-right:4px;background:' +
        (n <= overallLvl.num ? overallLvl.color : "#e0e0e0") +
        '"></div>';
    }

    var html =
      '<!DOCTYPE html><html lang="kk"><head><meta charset="UTF-8"><title>Сандық дағдылар есебі — ' +
      name +
      "</title>" +
      "<style>body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;padding:0 28px;color:#1a1f36}" +
      "h1{font-size:1.6rem;font-weight:900;margin:0 0 4px}.line{height:4px;background:" +
      overallLvl.color +
      ";border-radius:2px;margin:12px 0 20px}" +
      ".meta{font-size:.82rem;color:#9ba3c9;margin-bottom:20px}.overall{background:#f8f9ff;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:5px solid " +
      overallLvl.color +
      "}" +
      ".footer{margin-top:40px;padding-top:16px;border-top:1px solid #dde1f5;display:flex;justify-content:space-between;font-size:.78rem;color:#9ba3c9}" +
      "@media print{button{display:none}}</style></head><body>" +
      "<h1>Сандық дағдыларды өзін-өзі бағалау: тест нәтижелері</h1>" +
      '<div class="line"></div>' +
      '<p class="meta">Бұл ресми тест емес және сертификатқа әкелмейді. DigComp 2.2 негізінде</p>' +
      '<div class="overall">' +
      '<div style="font-size:.78rem;color:#9ba3c9;text-transform:uppercase;letter-spacing:.07em;margin-bottom:6px">Сіздің сандық профиліңіз</div>' +
      '<div style="font-size:2.2rem;font-weight:900;color:#1a1f36;line-height:1.1">' +
      overallLvl.kk +
      "</div>" +
      '<div style="color:' +
      overallLvl.color +
      ';font-weight:700;margin:4px 0 10px">' +
      overallLvl.kk +
      " · " +
      total +
      " / " +
      maxScore +
      " балл</div>" +
      "<div>" +
      overallSegHtml +
      "</div></div>" +
      '<p class="meta">Аты: <strong>' +
      name +
      "</strong> &nbsp;|&nbsp; Жасы: " +
      age +
      " &nbsp;|&nbsp; Білімі: " +
      edu +
      "</p>" +
      blocksHtml +
      '<div class="footer"><span>' +
      name +
      "</span><span>Күні: " +
      dateStr +
      "</span></div>" +
      '<br><button onclick="window.print()" style="padding:10px 24px;background:' +
      overallLvl.color +
      ';color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;margin-top:12px">🖨️ PDF ретінде сақтау</button>' +
      "</body></html>";

    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download =
      "digcomp-" + name + "-" + dateStr.replace(/\./g, "-") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  var _aiScores = null;
  var _aiTotal = null;
  var _aiMax = null;

  function saveAIResult(html) {
    try {
      localStorage.setItem(
        AI_CACHE_KEY,
        JSON.stringify({
          html: html,
          date: new Date().toISOString(),
        }),
      );
    } catch (_) {}
  }

  function initAI(scores, total, maxScore) {
    _aiScores = scores;
    _aiTotal = total;
    _aiMax = maxScore;

    var aiBtn = document.getElementById("aiBtn");
    var aiRetryBtn = document.getElementById("aiRetryBtn");
    var aiErrorRetryBtn = document.getElementById("aiErrorRetryBtn");

    if (aiBtn) {
      aiBtn.disabled = false;
      aiBtn.addEventListener("click", runAIAnalysis);
    }
    if (aiRetryBtn) aiRetryBtn.addEventListener("click", runAIAnalysis);
    if (aiErrorRetryBtn)
      aiErrorRetryBtn.addEventListener("click", runAIAnalysis);
  }

  function showAIState(s) {
    var loading = document.getElementById("aiLoading");
    var result = document.getElementById("aiResult");
    var error = document.getElementById("aiError");
    var trigger = document.getElementById("aiTrigger");

    [loading, result, error].forEach(function (el) {
      if (el) el.classList.add("quiz-screen--hidden");
    });

    if (s === "loading") {
      if (trigger) trigger.style.display = "none";
      if (loading) loading.classList.remove("quiz-screen--hidden");
    } else if (s === "result") {
      if (trigger) trigger.style.display = "none";
      if (result) result.classList.remove("quiz-screen--hidden");
    } else if (s === "error") {
      if (trigger) trigger.style.display = "none";
      if (error) error.classList.remove("quiz-screen--hidden");
    } else {
      if (trigger) trigger.style.display = "";
    }
  }

  function buildPrompt(scores, total, maxScore) {
    var name = (state.userInfo && state.userInfo.name) || "Пайдаланушы";
    var age = (state.userInfo && state.userInfo.age) || "белгісіз";
    var edu = (state.userInfo && state.userInfo.education) || "белгісіз";
    var overallLvl = getLevelForScore(total, maxScore);
    var perBlock = Math.floor(maxScore / BLOCKS.length);
    var overallPct = Math.round((total / maxScore) * 100);

    var sortedBlocks = BLOCKS.slice().sort(function (a, b) {
      return (scores[b.id] || 0) - (scores[a.id] || 0);
    });
    var strongest = sortedBlocks
      .slice(0, 2)
      .map(function (b) {
        return b.title + " (" + (scores[b.id] || 0) + "/" + perBlock + ")";
      })
      .join(", ");
    var weakest = sortedBlocks
      .slice(-2)
      .reverse()
      .map(function (b) {
        return b.title + " (" + (scores[b.id] || 0) + "/" + perBlock + ")";
      })
      .join(", ");

    var blockLines = BLOCKS.map(function (b) {
      var sc = scores[b.id] || 0;
      var lvl = getLevelForScore(sc, perBlock);
      var pct = Math.round((sc / perBlock) * 100);
      return (
        "- " +
        b.title +
        ": " +
        sc +
        "/" +
        perBlock +
        " балл (" +
        pct +
        "%, " +
        lvl.num +
        "-деңгей — " +
        lvl.kk +
        ")"
      );
    }).join("\n");

    return (
      "Сен DigComp 2.2 халықаралық фреймворкі бойынша цифрлық сауаттылықты бағалайтын сарапшысың.\n" +
      "Тек қазақ тілінде жауап бер. Нақты, жеке, мазмұнды бол.\n\n" +
      "ПАЙДАЛАНУШЫ ДЕРЕКТЕРІ:\n" +
      "- Аты: " +
      name +
      "\n" +
      "- Жасы: " +
      age +
      "\n" +
      "- Білімі: " +
      edu +
      "\n\n" +
      "ТЕСТ НӘТИЖЕЛЕРІ (DigComp 2.2, макс " +
      perBlock +
      " балл/блок, " +
      maxScore +
      " жалпы):\n" +
      blockLines +
      "\n" +
      "Жалпы: " +
      total +
      "/" +
      maxScore +
      " балл (" +
      overallPct +
      "%) — " +
      overallLvl.num +
      "-деңгей, " +
      overallLvl.kk +
      "\n" +
      "Ең күшті блоктар: " +
      strongest +
      "\n" +
      "Ең әлсіз блоктар: " +
      weakest +
      "\n\n" +
      "МІНДЕТ: Төмендегі 5 бөлімді кезегімен жаз. Әр бөлімді тақырыбымен бастап, тікелей мазмұнға кір.\n\n" +
      "🎯 Жалпы баға\n" +
      name +
      "-ның " +
      total +
      "/" +
      maxScore +
      " нәтижесін DigComp 2.2 стандарты тұрғысынан бағала. " +
      "Бұл деңгейдің практикалық мәнін " +
      age +
      " жастағы " +
      edu +
      " білімді адам үшін 3-4 сөйлеммен нақты түсіндір.\n\n" +
      "📊 Блок профилі\n" +
      "Барлық 5 блокты салыстырмалы талда. Қай блоктарда үйлесімдік бар, " +
      "қайсысында алшақтық бар — нақты мысалмен түсіндір. 3-4 сөйлем жаз.\n\n" +
      "💪 Күшті жақтарыңыз\n" +
      "Ең жоғары балл алған блоктарды (" +
      strongest +
      ") талда. " +
      "Осы дағдылар күнделікті өмірде немесе жұмыста қалай пайдаланылатынын 2 нақты мысалмен көрсет. " +
      "Бұл күшті жақтарды одан әрі дамытудың 1 жолын ұсын.\n\n" +
      "⚠️ Дамыту керек бағыттар\n" +
      "Ең төмен балл алған блоктарды (" +
      weakest +
      ") жан-жақты талда. " +
      "Неге бұл блоктар маңызды, осы олқылықтар қандай тәуекел туғызады — нақты сценарий арқылы түсіндір. " +
      "Әр әлсіз блок үшін бір нақты тегін онлайн ресурс атауын жаз " +
      "(мысалы: Coursera, Google Digital Garage, Kaspersky Academy, Khan Academy).\n\n" +
      "🗓️ 30 күнге оқу жоспары\n" +
      "Дәл осы нәтижелерге негізделген, " +
      name +
      "-ға арналған жеке 30 күндік жоспар жаз. " +
      "5 кезең: 1-7 күн, 8-14 күн, 15-21 күн, 22-28 күн, 29-30 күн. " +
      "Әр кезең үшін: не істейді, қай ресурсты қолданады, нәтижесі не болады — нақты атап өт.\n\n" +
      "ЕРЕЖЕЛЕР:\n" +
      "- Тек қазақ тілінде\n" +
      "- ** немесе ## таңбаларын қолданба\n" +
      "- Жалпы кеңес емес — " +
      name +
      "-ға арналған жеке талдау\n" +
      "- Нақты ресурс атаулары, нақты мерзімдер, нақты мысалдар\n" +
      "- Әр бөлімді тақырыбынан кейін тікелей бастап кет"
    );
  }

  function parseAIResponse(text) {
    var sections = [
      { key: "🎯 Жалпы баға", color: "#1565c0" },
      { key: "📊 Блок профилі", color: "#0097a7" },
      { key: "💪 Күшті жақтарыңыз", color: "#1b8a4e" },
      { key: "⚠️ Дамыту керек бағыттар", color: "#e65100" },
      { key: "🗓️ 30 күнге оқу жоспары", color: "#5e35b1" },
    ];

    var html = "";

    sections.forEach(function (sec, idx) {
      var startIdx = text.indexOf(sec.key);
      if (startIdx === -1) return;
      var contentStart = startIdx + sec.key.length;
      var nextIdx = text.length;
      for (var ni = idx + 1; ni < sections.length; ni++) {
        var npos = text.indexOf(sections[ni].key);
        if (npos !== -1 && npos > startIdx) {
          nextIdx = npos;
          break;
        }
      }
      var content = text.slice(contentStart, nextIdx).trim();
      var lines = content.split("\n").filter(function (l) {
        return l.trim();
      });
      var isListy = lines.some(function (l) {
        return /^[-•\d]/.test(l.trim());
      });
      var bodyHtml;
      if (isListy) {
        bodyHtml =
          "<ul>" +
          lines
            .map(function (l) {
              var clean = l
                .trim()
                .replace(/^[-•]\s*/, "")
                .replace(/^\d+[\.\)]\s*/, "");
              return clean ? "<li>" + clean + "</li>" : "";
            })
            .filter(Boolean)
            .join("") +
          "</ul>";
      } else {
        bodyHtml = lines
          .map(function (l) {
            return "<p>" + l.trim() + "</p>";
          })
          .join("");
      }
      html +=
        '<div class="ai-section-title" style="color:' +
        sec.color +
        ';margin-top:14px;margin-bottom:6px;font-weight:700;font-size:0.95rem">' +
        sec.key +
        "</div>" +
        bodyHtml;
    });

    if (!html) html = "<p>" + text.replace(/\n/g, "<br>") + "</p>";
    return html;
  }

  async function runAIAnalysis() {
    if (!_aiScores) return;
    var aiBtn = document.getElementById("aiBtn");
    var resultBodyEl = document.getElementById("aiResultBody");
    if (aiBtn) aiBtn.disabled = true;
    showAIState("loading");

    try {
      var response = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GROQ_API_KEY,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 2500,
            temperature: 0.7,
            stream: true,
            messages: [
              {
                role: "system",
                content:
                  "Сен DigComp 2.2 стандарты бойынша цифрлық сауаттылық сарапшысысың. Тек қазақ тілінде жауап бер. Нақты, жеке, мазмұнды бол.",
              },
              {
                role: "user",
                content: buildPrompt(_aiScores, _aiTotal, _aiMax),
              },
            ],
          }),
        },
      );

      if (!response.ok) {
        var errData = await response.json().catch(function () {
          return {};
        });
        throw new Error(
          errData.error && errData.error.message
            ? errData.error.message
            : "API қате: " + response.status,
        );
      }

      showAIState("result");
      if (resultBodyEl) resultBodyEl.innerHTML = "";

      var reader = response.body.getReader();
      var decoder = new TextDecoder("utf-8");
      var fullText = "";
      var buffer = "";

      while (true) {
        var chunk = await reader.read();
        if (chunk.done) break;
        buffer += decoder.decode(chunk.value, { stream: true });
        var lines = buffer.split("\n");
        buffer = lines.pop();
        for (var i = 0; i < lines.length; i++) {
          var line = lines[i].trim();
          if (!line || line === "data: [DONE]") continue;
          if (line.startsWith("data: ")) {
            try {
              var json = JSON.parse(line.slice(6));
              var delta =
                json.choices &&
                json.choices[0] &&
                json.choices[0].delta &&
                json.choices[0].delta.content;
              if (delta) {
                fullText += delta;
                if (resultBodyEl)
                  resultBodyEl.innerHTML = parseAIResponse(fullText);
              }
            } catch (_) {}
          }
        }
      }

      if (!fullText) throw new Error("Жауап бос келді");

      var finalHtml = parseAIResponse(fullText);
      if (resultBodyEl) resultBodyEl.innerHTML = finalHtml;
      saveAIResult(finalHtml);

      var dateEl = document.getElementById("aiResultDate");
      if (dateEl)
        dateEl.textContent =
          "Сақталған: " + formatDate(new Date().toISOString());
    } catch (err) {
      var errTextEl = document.getElementById("aiErrorText");
      if (errTextEl)
        errTextEl.textContent = "Қате: " + (err.message || "Белгісіз қате");
      showAIState("error");
      if (aiBtn) aiBtn.disabled = false;
    }
  }

  function formatDate(iso) {
    try {
      var d = new Date(iso);
      return (
        String(d.getDate()).padStart(2, "0") +
        "." +
        String(d.getMonth() + 1).padStart(2, "0") +
        "." +
        d.getFullYear()
      );
    } catch (_) {
      return "—";
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
