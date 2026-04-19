// quiz.js — Тест (викторина) беті логикасы
// Сұрақтарды жүктеу, жауап алу, балл есептеу,
// нәтижені көрсету және AI талдауын іске қосу

(function () {
  "use strict";

  //  Глобалды константалар ---
  // API_BASE — сервер адресі
  // HISTORY_KEY — тест тарихы localStorage кілті
  // USER_KEY — ағымдағы пайдаланушы кілті
  // LEGACY_KEY — ескі форматтағы пайдаланушы кілті
  // AI_CACHE_KEY — AI нәтижесін сақтайтын кілт
  var API_BASE =
    typeof API_BASE_URL !== "undefined"
      ? API_BASE_URL
      : "https://digital-literacy-zs48.onrender.com";

  var HISTORY_KEY = "diq_test_history";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";
  var AI_CACHE_KEY = "diq_ai_result";

  //  5 компетенция блогының анықтамасы ---
  // Әр блоктың ID, атауы, түсі және SVG иконасы сақталады
  // ID-лар сервермен сәйкес болуы тиіс: information, communication,
  // content, safety, problem
  var BLOCKS = [
    {
      id: "information",
      title: "Ақпарат",
      color: "#0097a7",
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#0097a7" stroke-width="2"/><path d="m16.5 16.5 3.5 3.5" stroke="#0097a7" stroke-width="2" stroke-linecap="round"/></svg>',
    },
    {
      id: "communication",
      title: "Коммуникация",
      color: "#f57c00",
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 2C8 2 4 5 4 9c0 5 8 13 8 13s8-8 8-13c0-4-4-7-8-7Z" stroke="#f57c00" stroke-width="2"/><circle cx="12" cy="9" r="2.5" stroke="#f57c00" stroke-width="1.8"/></svg>',
    },
    {
      id: "content",
      title: "Контент",
      color: "#5e35b1",
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke="#5e35b1" stroke-width="2"/><path d="M8 20h8M12 18v2" stroke="#5e35b1" stroke-width="2" stroke-linecap="round"/></svg>',
    },
    {
      id: "safety",
      title: "Қауіпсіздік",
      color: "#c62828",
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M12 3 4 7v5c0 4.4 3.4 8.5 8 9.5 4.6-1 8-5.1 8-9.5V7l-8-4Z" stroke="#c62828" stroke-width="2"/><path d="m9 12 2 2 4-4" stroke="#c62828" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    },
    {
      id: "problem",
      title: "Проблемаларды шешу",
      color: "#2e7d32",
      icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#2e7d32" stroke-width="2"/><path d="M12 8v4l3 3" stroke="#2e7d32" stroke-width="2" stroke-linecap="round"/></svg>',
    },
  ];

  //  Жауап нұсқалары кілттері ---
  var OPTION_KEYS = ["A", "B", "C", "D"];

  //  Деңгей сипаттамалары ---
  // 1 — Төмен, 2 — Орташа, 3 — Жоғары
  // Нәтиже бетінде әр блоктың астында көрсетіледі
  var LEVEL_DESCS = {
    1: "Цифрлық дағдылар әлі дамып келе жатыр. Негізгі цифрлық құралдармен жұмыс жасауды жалғастыру ұсынылады.",
    2: "Цифрлық сауаттылық орта деңгейде. Жаңа технологияларды үйрену арқылы білімді тереңдетуге болады.",
    3: "Цифрлық дағдылар жоғары деңгейде. Күрделі цифрлық міндеттерді еркін шеше алатын деңгей.",
  };

  //  Groq API кілті ---
  // window.GROQ_API_KEY глобалды айнымалыдан алынады
  // Табылмаса "YOUR_API_KEY" орнына қойылады
  var GROQ_API_KEY =
    typeof window !== "undefined" && window.GROQ_API_KEY
      ? window.GROQ_API_KEY
      : "YOUR_API_KEY";

  //  Тест күйі (state) ---
  // current — ағымдағы сұрақ индексі
  // answers — барлық жауаптар массиві (null = жауапсыз)
  // questions — серверден алынған сұрақтар
  // userInfo — аты, жасы, білімі
  // started — тест басталды ма
  var state = {
    current: 0,
    answers: [],
    questions: [],
    userInfo: null,
    started: false,
  };

  //  DOM элементтерін алу ---
  // Барлық экрандар мен батырмалар бір рет алынады
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

  //  Инициализация ---
  // Пайдаланушы жоқ болса — index.html-ге бағыттайды
  // Пайдаланушы аты intro формасына алдын ала жазылады
  // Барлық батырмаларға оқиға тыңдаушылар тіркеледі
  // sessionStorage-де бұрынғы нәтиже бар болса — нәтиже экранын көрсетеді
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

    try {
      var savedResult = sessionStorage.getItem("diq_last_result");
      if (savedResult) {
        var parsed = JSON.parse(savedResult);
        state.userInfo = parsed.userInfo || { name: "Пайдаланушы" };
        showScreen("result");
        renderResult(parsed.scores, parsed.total, parsed.maxScore);
        return;
      }
    } catch (_) {}

    showScreen("intro");
  }

  //  Экранды ауыстыру ---
  // Барлық экрандарға hidden класы қосады
  // Тек сұралған экраннан hidden жояды
  // Анимация қайта іске қосу үшін offsetWidth trick қолданылады
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

  //  Жүктеу күйін көрсету ---
  // startBtn-ды блоктайды немесе қайта белсендіреді
  function showLoading(show) {
    startBtn.disabled = show;
    startBtn.innerHTML = show
      ? "Жүктелуде..."
      : 'Сынақты бастау <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M5 12h14M13 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>';
  }

  //  Тестті бастау ---
  // Аты міндетті — бос болса қызыл жиек береді
  // state.userInfo-ға аты, жасы, білімі сақталады
  // POST /test/questions — сервердан 20 сұрақ алады
  // Жауаптар массивін null-дармен толтырады
  // Қате болса alert шығарады
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

    state.userInfo = {
      name: name,
      age: age || "таңдалмаған",
      education: edu || "таңдалмаған",
    };
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

  //  Блок ақпаратын алу ---
  // competency ID бойынша BLOCKS массивінен блок объектін іздейді
  // Табылмаса бірінші блокты қайтарады
  function getBlockInfo(competency) {
    return (
      BLOCKS.find(function (b) {
        return b.id === competency;
      }) || BLOCKS[0]
    );
  }

  //  Сұрақты экранға шығару ---
  // Прогресс жолағы мен санауышты жаңартады
  // Ағымдағы блок иконасы мен атауын көрсетеді
  // Блок ішіндегі сұрақ нөмірін есептейді
  // 4 жауап нұсқасын батырма ретінде жасайды
  // Бұрын таңдалған жауап болса — selected класы береді
  // Соңғы сұрақта "Аяқтау" батырмасы, жоқ болса "Келесі" батырмасы
  function renderQuestion() {
    var idx = state.current;
    var q = state.questions[idx];
    var saved = state.answers[idx];
    var total = state.questions.length;
    var block = getBlockInfo(q.competency);

    var pct = (idx / total) * 100;
    progressFill.style.width = pct + "%";
    if (topbarCounter) topbarCounter.textContent = idx + 1 + " / " + total;

    blockIcon.innerHTML = block.icon;
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

  //  Жауап таңдау ---
  // state.answers массивіне таңдалған кілт жазылады
  // Барлық батырмалардан selected класы алынады
  // Таңдалған батырмаға selected класы беріледі
  // nextBtn белсенді болады
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

  //  Навигация батырмалары ---
  // onPrev() — алдыңғы сұраққа оралады
  // onNext() — соңғы сұрақта finishQuiz() шақырады,
  //            жоқ болса келесі сұраққа өтеді
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

  //  Тестті аяқтау ---
  // Жауаптар массивін { question_id, answer } форматына түрлендіреді
  // POST /test/submit — серверге жіберіп нәтиже алады
  // Балл ×5 коэффициентімен масштабталады (DB-да 0-20, UI-да 0-100)
  // Қате болса — computeLocalScores() арқылы жергілікті есептеу жасалады
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

  //  Жергілікті балл есептеу ---
  // Сервер қолжетімсіз болса резервтік есептеу
  // Сұрақтардың correct_answer өрісімен салыстырады
  // Әр дұрыс жауап үшін ×5 баллды қолдана есептейді
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

  //  Тест тарихын сақтау ---
  // diq_test_history кілтіне JSON массиві ретінде сақталады
  // Ең жаңа нәтиже алдына қойылады (unshift)
  // Максимум 10 жазба сақталады (артығы кесіледі)
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

  //  Деңгей анықтау ---
  // Пайызды есептеп 3 деңгейден біреуін қайтарады:
  // < 34% — Төмен (қызыл), < 67% — Орташа (сары), >= 67% — Жоғары (жасыл)
  function getLevelForScore(score, maxScore) {
    var max = maxScore !== undefined ? maxScore : 20;
    var pct = max > 0 ? (score / max) * 100 : 0;
    if (pct < 34) return { num: 1, kk: "Төмен", color: "#ef5350" };
    if (pct < 67) return { num: 2, kk: "Орташа", color: "#f9a825" };
    return { num: 3, kk: "Жоғары", color: "#1b8a4e" };
  }

  //  Нәтиже экранын көрсету ---
  // Жалпы деңгей мәтіні, нөмірі, баллы орнатылады
  // 3 сегменттен тұратын деңгей индикаторы жасалады
  // Әр блок үшін деңгей, балл, сипаттама жолы жасалады
  // Жолды басқанда is-open класы ауысады (аккордеон эффект)
  // saveResultsToStorage() — нәтижені localStorage-ге сақтайды
  // initAI() — AI талдауы батырмасын белсендіреді
  // sessionStorage-ге нәтиже сақталады (бет жаңарту үшін)
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

    try {
      sessionStorage.setItem(
        "diq_last_result",
        JSON.stringify({
          scores: scores,
          total: total,
          maxScore: maxScore,
          userInfo: state.userInfo,
        }),
      );
    } catch (_) {}
  }

  //  Нәтижені localStorage-ге сақтау ---
  // diq_block_results кілтіне сақталады
  // Әр блок үшін score, total, date сақталады
  // _lastTest — жалпы нәтиже туралы мета-ақпарат
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

  //  Тестті қайталау ---
  // sessionStorage-ден бұрынғы нәтиже жойылады
  // state күйі тазартылады
  // Intro экранына оралады
  function onRetake() {
    try {
      sessionStorage.removeItem("diq_last_result");
    } catch (_) {}
    state.current = 0;
    state.answers = [];
    state.questions = [];
    state.started = false;
    progressFill.style.width = "0%";
    showScreen("intro");
  }

  //  PDF есепті жүктеу ---
  // Ағымдағы нәтижелер немесе sessionStorage-дегі нәтижені пайдаланады
  // HTML мазмұны жасалады (блок бойынша, жалпы нәтиже)
  // html2canvas арқылы HTML суретке айналдырылады
  // jsPDF арқылы PDF файл жасалады
  // Файл аты: digcomp-{аты}-{күні}.pdf форматында
  // Егер кескін A4-тен асып кетсе — бірнеше бетке бөлінеді
  function onDownload() {
    var scores = {};
    var total = 0;
    var maxScore = 100;
    var perBlock = Math.floor(maxScore / BLOCKS.length);

    var savedResult = null;
    try {
      savedResult = JSON.parse(sessionStorage.getItem("diq_last_result"));
    } catch (_) {}

    if (state.questions && state.questions.length > 0) {
      state.questions.forEach(function (q, i) {
        if (!scores[q.competency]) scores[q.competency] = 0;
        if (state.answers[i] === q.correct_answer) {
          scores[q.competency] += 5;
          total += 5;
        }
      });
    } else if (savedResult) {
      scores = savedResult.scores || {};
      total = savedResult.total || 0;
      maxScore = savedResult.maxScore || 100;
    } else {
      alert("Нәтиже табылмады. Тестті қайта тапсырыңыз.");
      return;
    }

    var overallLvl = getLevelForScore(total, maxScore);
    var savedUserInfo = (savedResult && savedResult.userInfo) || {};
    var name =
      (state.userInfo && state.userInfo.name) ||
      savedUserInfo.name ||
      "Пайдаланушы";
    var age =
      (state.userInfo && state.userInfo.age) || savedUserInfo.age || "—";
    var edu =
      (state.userInfo && state.userInfo.education) ||
      savedUserInfo.education ||
      "—";
    var dateStr = formatDate(new Date().toISOString());
    var pct = Math.round((total / maxScore) * 100);

    if (downloadBtn) {
      downloadBtn.disabled = true;
      downloadBtn.textContent = "⏳ Жасалуда...";
    }

    var blocksRowsHtml = BLOCKS.map(function (block) {
      var score = scores[block.id] || 0;
      var lvl = getLevelForScore(score, perBlock);
      var bpct = Math.round((score / perBlock) * 100);
      var barFill = Math.max(4, bpct) + "%";
      return (
        '<div style="display:flex;align-items:center;padding:12px 16px;border-bottom:1px solid #eef0f8;">' +
        '<div style="width:4px;height:42px;border-radius:2px;background:' +
        block.color +
        ';margin-right:14px;flex-shrink:0"></div>' +
        '<div style="flex:1;min-width:0">' +
        '<div style="font-size:14px;font-weight:700;color:' +
        block.color +
        ';margin-bottom:3px">' +
        block.title +
        "</div>" +
        '<div style="background:#e8eaf0;border-radius:4px;height:6px;width:100%;max-width:220px">' +
        '<div style="background:' +
        lvl.color +
        ";width:" +
        barFill +
        ';height:6px;border-radius:4px"></div></div>' +
        "</div>" +
        '<div style="text-align:right;margin-left:12px">' +
        '<div style="font-size:15px;font-weight:800;color:' +
        lvl.color +
        '">' +
        score +
        '<span style="font-size:11px;color:#9ba3c9">/' +
        perBlock +
        "</span></div>" +
        '<div style="font-size:11px;color:' +
        lvl.color +
        ';font-weight:600">' +
        lvl.kk +
        " · " +
        bpct +
        "%</div>" +
        "</div></div>"
      );
    }).join("");

    var overallBarFill = Math.max(4, pct) + "%";

    var html =
      '<div id="pdf-content" style="width:680px;font-family:Arial,Helvetica,sans-serif;color:#1a1f36;background:#fff">' +
      '<div style="background:' +
      overallLvl.color +
      ';padding:28px 32px 22px;color:#fff">' +
      '<div style="font-size:11px;letter-spacing:0.08em;opacity:0.85;margin-bottom:6px">ЦИФРЛЫҚ САУАТТЫЛЫҚТЫ БАҒАЛАУ</div>' +
      '<div style="font-size:22px;font-weight:900;margin-bottom:4px">Тест нәтижелері: ' +
      name +
      "</div>" +
      '<div style="font-size:12px;opacity:0.85">DigComp 2.2 негізінде &nbsp;|&nbsp; ' +
      dateStr +
      " &nbsp;|&nbsp; Жасы: " +
      age +
      " &nbsp;|&nbsp; Білімі: " +
      edu +
      "</div>" +
      "</div>" +
      '<div style="background:#f8f9ff;border-left:5px solid ' +
      overallLvl.color +
      ';padding:20px 32px;display:flex;justify-content:space-between;align-items:center">' +
      "<div>" +
      '<div style="font-size:11px;color:#9ba3c9;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:4px">Жалпы деңгей</div>' +
      '<div style="font-size:26px;font-weight:900;color:' +
      overallLvl.color +
      ';line-height:1">' +
      overallLvl.kk +
      "</div>" +
      '<div style="font-size:13px;color:#5c6690;margin-top:4px">' +
      total +
      " / " +
      maxScore +
      " балл</div>" +
      "</div>" +
      '<div style="text-align:right">' +
      '<div style="font-size:32px;font-weight:900;color:' +
      overallLvl.color +
      '">' +
      pct +
      "%</div>" +
      '<div style="background:#e0e3f0;border-radius:6px;height:8px;width:160px;margin-top:6px">' +
      '<div style="background:' +
      overallLvl.color +
      ";width:" +
      overallBarFill +
      ';height:8px;border-radius:6px"></div></div>' +
      "</div></div>" +
      '<div style="padding:20px 32px 8px">' +
      '<div style="font-size:13px;font-weight:700;color:#1a1f36;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.05em">Құзыреттілік блоктары бойынша нәтижелер</div>' +
      '<div style="border:1px solid #eef0f8;border-radius:8px;overflow:hidden">' +
      blocksRowsHtml +
      "</div></div>" +
      '<div style="padding:14px 32px;border-top:1px solid #eef0f8;display:flex;justify-content:space-between;font-size:10px;color:#9ba3c9">' +
      "<span>Бұл ресми тест емес және сертификатқа әкелмейді. DigComp 2.2 халықаралық стандарты негізінде.</span>" +
      "<span>" +
      name +
      " &nbsp;|&nbsp; " +
      dateStr +
      "</span>" +
      "</div></div>";

    var container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;z-index:-1";
    container.innerHTML = html;
    document.body.appendChild(container);

    var el = container.querySelector("#pdf-content");

    window
      .html2canvas(el, { scale: 2, useCORS: true, backgroundColor: "#ffffff" })
      .then(function (canvas) {
        var jsPDFLib = window.jspdf && window.jspdf.jsPDF;
        if (!jsPDFLib) throw new Error("jsPDF жүктелмеді");

        var imgData = canvas.toDataURL("image/png");
        var doc = new jsPDFLib({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });
        var pw = 210;
        var ph = 297;
        var imgW = pw;
        var imgH = (canvas.height * pw) / canvas.width;

        if (imgH <= ph) {
          doc.addImage(imgData, "PNG", 0, 0, imgW, imgH);
        } else {
          var pageH = ph;
          var totalH = imgH;
          var yPos = 0;
          while (yPos < totalH) {
            if (yPos > 0) doc.addPage();
            doc.addImage(imgData, "PNG", 0, -yPos, imgW, totalH);
            yPos += pageH;
          }
        }

        var fileName =
          "digcomp-" +
          name.replace(/\s+/g, "-") +
          "-" +
          dateStr.replace(/\./g, "-") +
          ".pdf";
        doc.save(fileName);
        document.body.removeChild(container);

        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.textContent = "📥 Есепті жүктеу";
        }
      })
      .catch(function (err) {
        alert("PDF жасау кезінде қате: " + (err.message || err));
        document.body.removeChild(container);
        if (downloadBtn) {
          downloadBtn.disabled = false;
          downloadBtn.textContent = "📥 Есепті жүктеу";
        }
      });
  }

  //  AI модулін инициализациялау ---
  // _aiScores, _aiTotal, _aiMax глобалды айнымалыларға нәтижелер сақталады
  // aiBtn, aiRetryBtn, aiErrorRetryBtn батырмаларына runAIAnalysis тіркеледі
  var _aiScores = null;
  var _aiTotal = null;
  var _aiMax = null;

  //  AI нәтижесін localStorage-ге сақтау ---
  // diq_ai_result кілтіне HTML мазмұны мен күні сақталады
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

  //  AI күйін басқару ---
  // loading / result / error / (бастапқы) күйлерден біреуін көрсетеді
  // Тиісті элементтерден hidden класын алып/қосады
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

  //  AI промпт жасау ---
  // Пайдаланушы деректері: аты, жасы, білімі
  // Блок бойынша баллдар, деңгейлер, пайыздар
  // Ең күшті және ең әлсіз 2 блок анықталады
  // 5 бөлімнен тұратын нұсқаулық берілді:
  //   1) Жалпы баға, 2) Блок профилі, 3) Күшті жақтар,
  //   4) Дамыту керек бағыттар, 5) 30 күндік жоспар
  function buildPrompt(scores, total, maxScore) {
    var name = (state.userInfo && state.userInfo.name) || "Пайдаланушы";
    var age = (state.userInfo && state.userInfo.age) || "таңдалмаған";
    var edu = (state.userInfo && state.userInfo.education) || "таңдалмаған";

    // Жас пен білімді адамға лайықты форматта жазу
    var ageStr =
      age && age !== "таңдалмаған" ? age + " жас тобы" : "жас тобы таңдалмаған";
    var eduStr =
      edu && edu !== "таңдалмаған"
        ? edu + " білімі"
        : "білім деңгейі таңдалмаған";

    var perBlock = Math.floor(maxScore / BLOCKS.length);
    var overallPct = Math.round((total / maxScore) * 100);

    // Блок деректерін жинақтап, деңгейін анықтау
    var blockData = BLOCKS.map(function (b) {
      var sc = scores[b.id] || 0;
      var pct = Math.round((sc / perBlock) * 100);
      var tag = pct >= 67 ? "ЖОҒАРЫ" : pct >= 34 ? "ОРТАША" : "ТӨМЕН";
      return { title: b.title, sc: sc, perBlock: perBlock, pct: pct, tag: tag };
    });

    // Ең жоғары 2 және ең төмен 2 блокты анықтау
    var sorted = blockData.slice().sort(function (a, b) {
      return b.pct - a.pct;
    });
    var top2 = sorted
      .slice(0, 2)
      .map(function (b) {
        return b.title;
      })
      .join(", ");
    var low2 = sorted
      .slice(-2)
      .map(function (b) {
        return b.title;
      })
      .join(", ");

    var blockLines = blockData
      .map(function (b) {
        return (
          "- " +
          b.title +
          ": " +
          b.sc +
          "/" +
          b.perBlock +
          " балл (" +
          b.pct +
          "%) — " +
          b.tag
        );
      })
      .join("\n");

    var levelWord =
      overallPct >= 67 ? "Жоғары" : overallPct >= 34 ? "Орташа" : "Төмен";

    return (
      "Сен DigComp 2.2 халықаралық фреймворкі бойынша цифрлық сауаттылық сарапшысысың.\n\n" +
      "Пайдаланушы: " +
      name +
      ", " +
      ageStr +
      ", " +
      eduStr +
      "\n\n" +
      "Тест нәтижелері (әр блок максимум " +
      perBlock +
      " балл, жалпы максимум " +
      maxScore +
      " балл):\n" +
      blockLines +
      "\n" +
      "Жалпы: " +
      total +
      "/" +
      maxScore +
      " балл (" +
      overallPct +
      "%) — " +
      levelWord +
      " деңгей\n\n" +
      "Күшті блоктар (ең жоғары балл): " +
      top2 +
      "\n" +
      "Дамыту керек блоктар (ең төмен балл): " +
      low2 +
      "\n\n" +
      "Осы НАҚТЫ сандарға сүйеніп " +
      name +
      "-ға арналған толыққанды талдау жаз.\n" +
      "МІНДЕТТІ ТАЛАПТАР:\n" +
      "1. Жалпы баға: " +
      overallPct +
      "% нәтижені DigComp 2.2 тұрғысынан бағала, нақты балл санын атап өт\n" +
      "2. Блок профилі: барлық 5 блокты нақты балдармен салыстырып талда\n" +
      "3. Күшті жақтар: тек " +
      top2 +
      " блоктарын талда, күнделікті өмірден нақты мысалдар келтір\n" +
      "4. Дамыту керек бағыттар: тек " +
      low2 +
      " блоктарына арнайы, тегін онлайн ресурстар ұсын\n" +
      "5. 30 күндік жоспар: тек " +
      low2 +
      " блоктарын дамытуға арналған жоспар жаз. Күшті блоктарға уақыт бөлме\n\n" +
      "ТЫЙЫМДАР: ** және ## таңбаларын қолданба. Бір ойды екі рет қайталама. Тек қазақ тілінде жаз."
    );
  }

  //  AI жауабын HTML-ге айналдыру ---
  // 5 бөлімді  мәтіннен іздейді
  // Тізім мәтін (-, •, 1.) болса — <ul><li> форматына айналдырады
  // Қалған мәтін <p> тегіне оралады
  // Бөлімнің түсі аты бойынша белгіленеді
  function parseAIResponse(text) {
    var paragraphs = text.split("\n").filter(function (l) {
      return l.trim();
    });

    return paragraphs
      .map(function (line) {
        var t = line.trim();
        if (/^[-•]\s+/.test(t)) {
          return "<li>" + t.replace(/^[-•]\s+/, "") + "</li>";
        }
        if (/^\d+[\.\)]\s+/.test(t)) {
          return "<li>" + t.replace(/^\d+[\.\)]\s+/, "") + "</li>";
        }
        return "<p>" + t + "</p>";
      })
      .join("");
  }

  //  AI талдауын іске қосу ---
  // Groq API-ға POST сұраныс жіберіледі
  // stream: true — жауап бөлшектеп (chunk) келеді
  // ReadableStream + TextDecoder арқылы chunk-тар оқылады
  // "data: " жолдары JSON ретінде талданады
  // delta.content алынып fullText-ке қосылады
  // Әр chunk-та parseAIResponse() шақырылып UI жаңартылады
  // Аяқталғанда saveAIResult() арқылы localStorage-ге сақталады
  // Қате болса aiErrorText элементіне хабар жазылады
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

  //  Күн форматтауы ---
  // ISO форматтағы күнді ДД.АА.ЖЖЖЖ форматына айналдырады
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

  //  DOMContentLoaded тексеру ---
  // Бет жүктелу аяқталса — init() тікелей шақырылады
  // Жүктелуде болса — DOMContentLoaded оқиғасын күтеді
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
