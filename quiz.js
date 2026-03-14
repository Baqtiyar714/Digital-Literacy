(function () {
  "use strict";

  /* ═══════════════════════════════
       CONSTANTS
    ═══════════════════════════════ */
  var RESULTS_KEY = "diq_block_results";
  var HISTORY_KEY = "diq_test_history";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";

  var LEVELS = [
    { min: 0, max: 8, num: 1, kk: "Іргетас", color: "#ef5350" },
    { min: 9, max: 18, num: 2, kk: "Іргетас", color: "#ef5350" },
    { min: 19, max: 27, num: 3, kk: "Орташа", color: "#f9a825" },
    { min: 28, max: 36, num: 4, kk: "Орташа", color: "#f9a825" },
    { min: 37, max: 45, num: 5, kk: "Кеңейтілген", color: "#1b8a4e" },
    { min: 46, max: 54, num: 6, kk: "Кеңейтілген", color: "#1b8a4e" },
    {
      min: 55,
      max: 63,
      num: 7,
      kk: "Жоғары мамандандырылған",
      color: "#1565c0",
    },
    {
      min: 64,
      max: 90,
      num: 8,
      kk: "Жоғары мамандандырылған",
      color: "#1565c0",
    },
  ];

  var LEVEL_DESCS = {
    1: "Бұл деңгейде сіз қарапайым жағдайларды өзіңіз немесе көмекпен шеше аласыз.",
    2: "Бұл деңгейде сіз қарапайым жағдайларды өзіңіз шеше аласыз.",
    3: "Бұл деңгейде сіз тікелей және кейбір болжанбайтын жағдайларды өзіңіз шеше аласыз.",
    4: "Бұл деңгейде сіз тікелей және болжанбайтын жағдайларды тәуелсіз шеше аласыз.",
    5: "Бұл деңгейде сіз өз қажеттіліктеріңіз үшін шешімдер таба аласыз және басқаларға қолдау көрсете аласыз.",
    6: "Бұл деңгейде сіз күрделі жағдайларда өзіңіз бен басқалар үшін шешімдер таба аласыз.",
    7: "Бұл деңгейде сіз ең күрделі жағдайларда шешімдерді жасай аласыз.",
    8: "Бұл деңгейде сіз жоғары мамандандырылған деңгейде жұмыс жасайсыз.",
  };

  /* ═══════════════════════════════
       BLOCKS
    ═══════════════════════════════ */
  var BLOCKS = [
    { id: "info-search", title: "Ақпарат іздеу", color: "#0097a7", icon: "🔍" },
    {
      id: "financial-security",
      title: "Қаржылық қауіпсіздік",
      color: "#f57c00",
      icon: "🛡️",
    },
    { id: "egov", title: "eGov қызметтері", color: "#5e35b1", icon: "🏛️" },
    {
      id: "network-culture",
      title: "Желі мәдениеті",
      color: "#c62828",
      icon: "💬",
    },
    {
      id: "device-care",
      title: "Құрылғыларды күту",
      color: "#2e7d32",
      icon: "⚙️",
    },
  ];

  /* ═══════════════════════════════
       ANSWER OPTIONS
    ═══════════════════════════════ */
  var OPTIONS = [
    { score: 0, text: "Мен мұны қалай істейтінімді білмеймін" },
    { score: 1, text: "Мен мұны көмекпен жасай аламын" },
    { score: 2, text: "Мен мұны өзім жасай аламын" },
    {
      score: 3,
      text: "Мен мұны сенімділікпен жасай аламын және қажет болған жағдайда басқаларды қолдай/бағыттай аламын",
    },
  ];

  /* ═══════════════════════════════
       30 QUESTIONS (6 per block)
    ═══════════════════════════════ */
  var QUESTIONS_MAP = {
    "info-search": [
      "Мен интернетте керекті ақпаратты табу үшін дұрыс кілт сөздерді таңдай аламын.",
      "Мен әртүрлі іздеу жүйелерінің (Google, Bing, Yandex) нәтижелері әртүрлі болуы мүмкін екенін түсінемін.",
      "Мен онлайн табылған ақпараттың сенімді не сенімсіз екенін тексере аламын.",
      "Мен файлдарды (суреттер, бейнелер, құжаттар) қалталарға сақтап, кейін оңай таба аламын.",
      "Мен жалған жаңалықтар (fake news) мен шынайы ақпаратты ажырата аламын.",
      "Мен деректерді кестелер, диаграммалар немесе графиктер арқылы оқып талдай аламын.",
    ],
    "financial-security": [
      "Мен фишинг шабуылдарын (жеке деректерді ұрлауға бағытталған жалған хабарламаларды) анықтай аламын.",
      "Мен онлайн банкинг немесе төлем жасау кезінде сайттың қауіпсіздігін тексере аламын (https, сертификат).",
      "Мен әр сайт үшін күшті және бірегей пароль жасап, оны қауіпсіз сақтай аламын.",
      "Мен смартфон, компьютер немесе планшетімде антивирус орнатып, жаңартып отыра аламын.",
      "Мен жеке деректерімді (ЖСН, банк карточкасы, пароль) онлайнда қорғай аламын.",
      "Мен онлайн алаяқтыққа тап болсам, тиісті органдарға хабарлай аламын.",
    ],
    egov: [
      "Мен egov.kz порталы арқылы мемлекеттік қызметтерге онлайн өтініш бере аламын.",
      "Мен электрондық цифрлық қолтаңба (ЭЦҚ) арқылы құжаттарды растай аламын.",
      "Мен email, мессенджер немесе бейнеконференция арқылы ресми байланыс жүргізе аламын.",
      "Мен онлайн платформа арқылы жұмысқа өтініш бере аламын (форма толтыру, CV жүктеу).",
      "Мен ортақ онлайн құжаттарды (Google Docs, OneDrive) бірлесіп өңдей аламын.",
      "Мен жағдайға қарай онлайнда қалай мінез-құлық ету керек екенін (ресми/бейресми) білемін.",
    ],
    "network-culture": [
      "Мен мәтін, сурет, аудио немесе бейне форматында сандық контент жасай аламын.",
      "Мен басқалар жасаған сандық контентті өңдеп, жаңасын жасай аламын (мысалы, суретке мәтін қосу).",
      "Мен заңды және заңсыз онлайн контентті (бағдарламалық жасақтама, музыка, фильм) ажырата аламын.",
      "Мен авторлық құқық пен лицензиялар туралы негізгі ережелерді білемін.",
      "Мен Python, Java немесе Visual Basic сияқты бағдарламалау тілдері бар екенін және олардың мақсатын түсінемін.",
      "Мен кибербуллинг (желідегі қудалау) жағдайында дұрыс әрекет ете аламын.",
    ],
    "device-care": [
      "Мен техникалық мәселеге тап болсам, интернеттен шешімін таба аламын.",
      "Мен белгілі бір тапсырмаға сәйкес дұрыс құрал, құрылғы немесе қызметті таңдай аламын.",
      "Мен сандық технологияны шығармашылық мақсатта пайдалана аламын (бейне, инфографика, блог).",
      "Мен онлайн оқу ресурстары (YouTube, онлайн курс) арқылы жаңа сандық дағдыларды үйрене аламын.",
      "Мен смартфон немесе компьютерімдегі деректерді резервтік көшірмесін жасай аламын (backup).",
      "Мен қолданбалар мен операциялық жүйені жаңартып отырудың маңыздылығын түсінемін.",
    ],
  };

  /* ─── Flatten into 30 questions array ─── */
  var ALL_QUESTIONS = [];
  BLOCKS.forEach(function (block) {
    var qs = QUESTIONS_MAP[block.id] || [];
    qs.forEach(function (text, qi) {
      ALL_QUESTIONS.push({
        blockId: block.id,
        blockTitle: block.title,
        blockColor: block.color,
        blockIcon: block.icon,
        blockQIdx: qi, // 0-5 within block
        text: text,
      });
    });
  });

  var TOTAL = ALL_QUESTIONS.length; // 30

  /* ═══════════════════════════════
       STATE
    ═══════════════════════════════ */
  var state = {
    current: 0, // current question index 0-29
    answers: [], // answers[i] = score (0-3) or null
    userInfo: null,
    started: false,
  };

  /* ═══════════════════════════════
       DOM REFS
    ═══════════════════════════════ */
  var screenIntro = document.getElementById("screenIntro");
  var screenQuestion = document.getElementById("screenQuestion");
  var screenResult = document.getElementById("screenResult");

  var progressFill = document.getElementById("progressFill");
  var topbarCounter = document.getElementById("topbarCounter");

  var blockLabel = document.getElementById("blockLabel");
  var blockIcon = document.getElementById("blockIcon");
  var blockName = document.getElementById("blockName");
  var blockQNum = document.getElementById("blockQNum");
  var questionText = document.getElementById("questionText");
  var optionsWrap = document.getElementById("optionsWrap");

  var prevBtn = document.getElementById("prevBtn");
  var nextBtn = document.getElementById("nextBtn");
  var startBtn = document.getElementById("startBtn");
  var downloadBtn = document.getElementById("downloadBtn");
  var retakeBtn = document.getElementById("retakeBtn");

  /* ═══════════════════════════════
       INIT
    ═══════════════════════════════ */
  function init() {
    // Auth check
    try {
      if (
        !localStorage.getItem(USER_KEY) &&
        !localStorage.getItem(LEGACY_KEY)
      ) {
        window.location.href = "index.html";
        return;
      }
    } catch (_) {}

    // Prefill name from localStorage
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

  /* ═══════════════════════════════
       SCREEN SWITCHER
    ═══════════════════════════════ */
  function showScreen(name) {
    screenIntro.classList.add("quiz-screen--hidden");
    screenQuestion.classList.add("quiz-screen--hidden");
    screenResult.classList.add("quiz-screen--hidden");

    if (name === "intro") {
      screenIntro.classList.remove("quiz-screen--hidden");
    }
    if (name === "question") {
      screenQuestion.classList.remove("quiz-screen--hidden");
    }
    if (name === "result") {
      screenResult.classList.remove("quiz-screen--hidden");
    }

    // Re-trigger animation
    var target =
      name === "intro"
        ? screenIntro
        : name === "question"
          ? screenQuestion
          : screenResult;
    target.style.animation = "none";
    // eslint-disable-next-line no-void
    void target.offsetWidth;
    target.style.animation = "";
  }

  /* ═══════════════════════════════
       START
    ═══════════════════════════════ */
  function onStart() {
    var name = (document.getElementById("introName").value || "").trim();
    var age = document.getElementById("introAge").value;
    var edu = document.getElementById("introEducation").value;
    var field = document.getElementById("introField").value;

    if (!name) {
      document.getElementById("introName").focus();
      document.getElementById("introName").style.borderColor = "#e53935";
      return;
    }

    state.userInfo = { name: name, age: age, education: edu, field: field };
    state.current = 0;
    state.answers = new Array(TOTAL).fill(null);
    state.started = true;

    showScreen("question");
    renderQuestion();
  }

  /* ═══════════════════════════════
       RENDER QUESTION
    ═══════════════════════════════ */
  function renderQuestion() {
    var idx = state.current;
    var q = ALL_QUESTIONS[idx];
    var saved = state.answers[idx]; // null or 0-3

    // Progress
    var pct = (idx / TOTAL) * 100;
    progressFill.style.width = pct + "%";
    topbarCounter.textContent = idx + 1 + " / " + TOTAL;

    // Block label
    var blockInGroup = BLOCKS.findIndex(function (b) {
      return b.id === q.blockId;
    });
    blockIcon.textContent = q.blockIcon;
    blockName.textContent = q.blockTitle;
    blockQNum.textContent = q.blockQIdx + 1 + " / 6";
    blockLabel.style.borderColor = q.blockColor + "66";

    // Question
    questionText.textContent = q.text;

    // Options
    optionsWrap.innerHTML = "";
    OPTIONS.forEach(function (opt) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className =
        "quiz-option" + (saved === opt.score ? " quiz-option--selected" : "");
      btn.setAttribute("data-score", opt.score);

      var radio = document.createElement("span");
      radio.className = "quiz-option__radio";

      var text = document.createElement("span");
      text.className = "quiz-option__text";
      text.textContent = opt.text;

      btn.appendChild(radio);
      btn.appendChild(text);

      btn.addEventListener("click", function () {
        selectOption(opt.score);
      });

      optionsWrap.appendChild(btn);
    });

    // Nav buttons
    prevBtn.style.visibility = idx === 0 ? "hidden" : "visible";

    var isLast = idx === TOTAL - 1;
    var hasAnswer = saved !== null;

    if (isLast) {
      nextBtn.textContent = "";
      nextBtn.innerHTML =
        "Аяқтау <svg width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M20 6L9 17l-5-5' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";
    } else {
      nextBtn.innerHTML =
        "Келесі <svg width='18' height='18' viewBox='0 0 24 24' fill='none'><path d='M5 12h14M13 6l6 6-6 6' stroke='currentColor' stroke-width='2' stroke-linecap='round'/></svg>";
    }

    nextBtn.disabled = !hasAnswer;
  }

  function selectOption(score) {
    state.answers[state.current] = score;

    // Update UI
    document.querySelectorAll(".quiz-option").forEach(function (btn) {
      var s = Number(btn.getAttribute("data-score"));
      btn.classList.toggle("quiz-option--selected", s === score);
    });

    nextBtn.disabled = false;
  }

  /* ═══════════════════════════════
       NAVIGATION
    ═══════════════════════════════ */
  function onPrev() {
    if (state.current > 0) {
      state.current--;
      renderQuestion();
    }
  }

  function onNext() {
    if (state.answers[state.current] === null) return;

    if (state.current === TOTAL - 1) {
      finishQuiz();
    } else {
      state.current++;
      renderQuestion();
    }
  }

  /* ═══════════════════════════════
       FINISH & RESULTS
    ═══════════════════════════════ */
  function finishQuiz() {
    // Compute per-block scores
    var blockScores = {};
    BLOCKS.forEach(function (b) {
      blockScores[b.id] = 0;
    });

    ALL_QUESTIONS.forEach(function (q, i) {
      var ans = state.answers[i];
      if (ans !== null) blockScores[q.blockId] += ans;
    });

    var totalScore = Object.values(blockScores).reduce(function (s, v) {
      return s + v;
    }, 0);

    // Save to localStorage
    saveResults(blockScores);
    saveHistory(blockScores, totalScore);

    // Progress bar to 100%
    progressFill.style.width = "100%";
    topbarCounter.textContent = TOTAL + " / " + TOTAL;

    showScreen("result");
    renderResult(blockScores, totalScore);
  }

  function saveResults(blockScores) {
    try {
      var all = {};
      BLOCKS.forEach(function (b) {
        all[b.id] = {
          score: blockScores[b.id] || 0,
          total: 18,
          date: new Date().toISOString(),
        };
      });
      localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch (_) {}
  }

  function saveHistory(blockScores, totalScore) {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      var hist = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(hist)) hist = [];

      var lvl = getLevelForScore(totalScore);
      hist.unshift({
        date: new Date().toISOString(),
        totalScore: totalScore,
        levelNum: lvl.num,
        levelKk: lvl.kk,
        blockScores: blockScores,
        userInfo: state.userInfo,
      });
      if (hist.length > 10) hist = hist.slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch (_) {}
  }

  /* ═══════════════════════════════
       RENDER RESULT
    ═══════════════════════════════ */
  function renderResult(blockScores, totalScore) {
    var lvl = getLevelForScore(totalScore);

    // Overall
    document.getElementById("overallLevelText").textContent = lvl.kk;
    document.getElementById("overallLevelNum").textContent =
      lvl.num + "-деңгей";
    document.getElementById("overallScore").textContent =
      totalScore + " / 90 балл";

    var overall = document.getElementById("resultOverall");
    overall.style.borderLeftColor = lvl.color;

    // Segments
    var segsEl = document.getElementById("overallSegs");
    segsEl.innerHTML = "";
    for (var i = 1; i <= 8; i++) {
      var seg = document.createElement("div");
      seg.className = "result-seg" + (i <= lvl.num ? " filled" : "");
      if (i <= lvl.num) seg.style.background = lvl.color;
      segsEl.appendChild(seg);
    }

    // Per-block
    var container = document.getElementById("resultBlocks");
    container.innerHTML = "";

    BLOCKS.forEach(function (block) {
      var score = blockScores[block.id] || 0;
      var bLvl = getLevelForScore(score);
      var bPct = Math.round((score / 18) * 100);

      // Row
      var row = document.createElement("div");
      row.className = "result-block-row";
      row.style.setProperty("--block-color", block.color);

      var segsHtml = "";
      for (var n = 1; n <= 8; n++) {
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
        bLvl.num +
        "-деңгей · " +
        bLvl.kk +
        "</div>" +
        '  <div class="result-block-row__score">' +
        score +
        " / 18 балл</div>" +
        "</div>";

      // Detail (expand on click)
      var detail = document.createElement("div");
      detail.className = "result-block-detail";
      detail.innerHTML = "<p>" + (LEVEL_DESCS[bLvl.num] || "") + "</p>";

      row.addEventListener("click", function () {
        var isOpen = row.classList.contains("is-open");
        // close all
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
  }

  /* ═══════════════════════════════
       RETAKE
    ═══════════════════════════════ */
  function onRetake() {
    state.current = 0;
    state.answers = new Array(TOTAL).fill(null);
    progressFill.style.width = "0%";
    showScreen("intro");
  }

  /* ═══════════════════════════════
       DOWNLOAD REPORT
    ═══════════════════════════════ */
  function onDownload() {
    var blockScores = {};
    BLOCKS.forEach(function (b) {
      blockScores[b.id] = 0;
    });
    ALL_QUESTIONS.forEach(function (q, i) {
      var ans = state.answers[i];
      if (ans !== null) blockScores[q.blockId] += ans;
    });
    var totalScore = Object.values(blockScores).reduce(function (s, v) {
      return s + v;
    }, 0);
    var overallLvl = getLevelForScore(totalScore);

    var name = (state.userInfo && state.userInfo.name) || "Пайдаланушы";
    var age = (state.userInfo && state.userInfo.age) || "—";
    var edu = (state.userInfo && state.userInfo.education) || "—";
    var field = (state.userInfo && state.userInfo.field) || "—";
    var dateStr = formatDate(new Date().toISOString());

    var blocksHtml = BLOCKS.map(function (block) {
      var score = blockScores[block.id] || 0;
      var lvl = getLevelForScore(score);
      var pct = Math.round((score / 18) * 100);

      var segHtml = "";
      for (var n = 1; n <= 8; n++) {
        segHtml +=
          '<div style="width:24px;height:8px;border-radius:3px;display:inline-block;margin-right:3px;background:' +
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
        " — " +
        lvl.num +
        "-деңгей · " +
        score +
        "/18 балл · " +
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
    for (var n = 1; n <= 8; n++) {
      overallSegHtml +=
        '<div style="width:28px;height:10px;border-radius:3px;display:inline-block;margin-right:4px;background:' +
        (n <= overallLvl.num ? overallLvl.color : "#e0e0e0") +
        '"></div>';
    }

    var html =
      '<!DOCTYPE html><html lang="kk"><head><meta charset="UTF-8">' +
      "<title>Сандық дағдылар есебі — " +
      name +
      "</title>" +
      "<style>body{font-family:Arial,sans-serif;max-width:820px;margin:40px auto;padding:0 28px;color:#1a1f36}" +
      "h1{font-size:1.6rem;font-weight:900;margin:0 0 4px}" +
      ".line{height:4px;background:" +
      overallLvl.color +
      ";border-radius:2px;margin:12px 0 20px}" +
      ".meta{font-size:.82rem;color:#9ba3c9;margin-bottom:20px}" +
      ".overall{background:#f8f9ff;border-radius:12px;padding:20px 24px;margin-bottom:28px;border-left:5px solid " +
      overallLvl.color +
      "}" +
      ".footer{margin-top:40px;padding-top:16px;border-top:1px solid #dde1f5;display:flex;justify-content:space-between;font-size:.78rem;color:#9ba3c9}" +
      "@media print{button{display:none}}" +
      "</style></head><body>" +
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
      overallLvl.num +
      "-деңгей · " +
      totalScore +
      " / 90 балл</div>" +
      "<div>" +
      overallSegHtml +
      "</div>" +
      "</div>" +
      '<p class="meta">Аты: <strong>' +
      name +
      "</strong> &nbsp;|&nbsp; Жасы: " +
      age +
      " &nbsp;|&nbsp; Білімі: " +
      edu +
      " &nbsp;|&nbsp; Сала: " +
      field +
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

  /* ═══════════════════════════════
       UTILS
    ═══════════════════════════════ */
  function getLevelForScore(score) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (score >= LEVELS[i].min && score <= LEVELS[i].max) return LEVELS[i];
    }
    return LEVELS[LEVELS.length - 1];
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

  /* ═══════════════════════════════
       BOOT
    ═══════════════════════════════ */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
