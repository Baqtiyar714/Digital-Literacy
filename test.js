(function () {
  "use strict";

  /* ═══════════════════════════════════════════════════════
       КОНСТАНТАЛАР
    ═══════════════════════════════════════════════════════ */
  var RESULTS_KEY = "diq_block_results";
  var HISTORY_KEY = "diq_test_history";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";

  var LEVELS = [
    {
      min: 0,
      max: 8,
      num: 1,
      kk: "Іргетас",
      en: "Foundation",
      color: "#ef5350",
    },
    {
      min: 9,
      max: 18,
      num: 2,
      kk: "Іргетас",
      en: "Foundation",
      color: "#ef5350",
    },
    {
      min: 19,
      max: 27,
      num: 3,
      kk: "Орташа",
      en: "Intermediate",
      color: "#f9a825",
    },
    {
      min: 28,
      max: 36,
      num: 4,
      kk: "Орташа",
      en: "Intermediate",
      color: "#f9a825",
    },
    {
      min: 37,
      max: 45,
      num: 5,
      kk: "Кеңейтілген",
      en: "Advanced",
      color: "#1b8a4e",
    },
    {
      min: 46,
      max: 54,
      num: 6,
      kk: "Кеңейтілген",
      en: "Advanced",
      color: "#1b8a4e",
    },
    {
      min: 55,
      max: 63,
      num: 7,
      kk: "Жоғары мамандандырылған",
      en: "Highly specialised",
      color: "#1565c0",
    },
    {
      min: 64,
      max: 90,
      num: 8,
      kk: "Жоғары мамандандырылған",
      en: "Highly specialised",
      color: "#1565c0",
    },
  ];

  /* ═══════════════════════════════════════════════════════
       БЛОКТАР
    ═══════════════════════════════════════════════════════ */
  var BLOCKS = [
    {
      id: "info-search",
      title: "Ақпарат іздеу",
      titleEn: "Information and data literacy",
      color: "#0097a7",
      icon: "🔍",
      description: "Интернеттен дұрыс ақпарат табу және бағалау дағдылары",
    },
    {
      id: "financial-security",
      title: "Қаржылық қауіпсіздік",
      titleEn: "Safety",
      color: "#f57c00",
      icon: "🛡️",
      description: "Онлайн алаяқтық пен қаржылық тәуекелдерден қорғану",
    },
    {
      id: "egov",
      title: "eGov қызметтері",
      titleEn: "Communication and collaboration",
      color: "#5e35b1",
      icon: "🏛️",
      description:
        "Мемлекеттік порталдар мен электрондық қызметтерді пайдалану",
    },
    {
      id: "network-culture",
      title: "Желі мәдениеті",
      titleEn: "Digital content creation",
      color: "#c62828",
      icon: "💬",
      description: "Әлеуметтік желідегі мінез-құлық нормалары мен этика",
    },
    {
      id: "device-care",
      title: "Құрылғыларды күту",
      titleEn: "Problem solving",
      color: "#2e7d32",
      icon: "⚙️",
      description: "Смартфон, компьютер және гаджеттерді дұрыс пайдалану",
    },
  ];

  /* ═══════════════════════════════════════════════════════
       4-ДЕҢГЕЙЛІ ЖАУАП НҰСҚАЛАРЫ (Europass стилі)
    ═══════════════════════════════════════════════════════ */
  var ANSWER_OPTIONS = [
    {
      score: 0,
      label: "Білмеймін",
      desc: "Мен мұны қалай істейтінімді білмеймін",
      color: "#ef5350",
      icon: "🔴",
    },
    {
      score: 1,
      label: "Көмекпен",
      desc: "Мен мұны көмекпен немесе нұсқаулық арқылы жасай аламын",
      color: "#f9a825",
      icon: "🟡",
    },
    {
      score: 2,
      label: "Өзім жасаймын",
      desc: "Мен мұны өздігімнен жасай аламын",
      color: "#1b8a4e",
      icon: "🟢",
    },
    {
      score: 3,
      label: "Үйрете аламын",
      desc: "Мен мұны сенімділікпен жасаймын және қажет болса басқаларды үйрете аламын",
      color: "#1565c0",
      icon: "💎",
    },
  ];

  /* ═══════════════════════════════════════════════════════
       30 СҰРАҚ (әр блокта 6)
    ═══════════════════════════════════════════════════════ */
  var QUESTIONS = {
    "info-search": [
      {
        text: "Мен интернетте керекті ақпаратты табу үшін дұрыс кілт сөздерді таңдай аламын (мысалы, Google немесе құжат ішінде іздеу).",
      },
      {
        text: "Мен әртүрлі іздеу жүйелерінің (Google, Bing, Yandex) нәтижелері әртүрлі болуы мүмкін екенін түсінемін.",
      },
      {
        text: "Мен онлайн табылған ақпараттың сенімді не сенімсіз екенін тексере аламын (деректің көзі, авторы, күні).",
      },
      {
        text: "Мен файлдарды (суреттер, бейнелер, құжаттар) қалталарға сақтап, кейін оңай таба аламын.",
      },
      {
        text: "Мен fake news (жалған жаңалықтар) мен шынайы ақпаратты ажырата аламын.",
      },
      {
        text: "Мен деректерді кестелер, диаграммалар немесе графиктер арқылы оқып талдай аламын.",
      },
    ],
    "financial-security": [
      {
        text: "Мен фишинг (жеке деректерді ұрлауға бағытталған жалған хабарламалар) шабуылдарын анықтай аламын.",
      },
      {
        text: "Мен онлайн банкинг немесе төлем жасау кезінде сайттың қауіпсіздігін тексере аламын (https, сертификат).",
      },
      {
        text: "Мен әр сайт үшін күшті және бірегей пароль жасап, оны қауіпсіз сақтай аламын.",
      },
      {
        text: "Мен смартфон, компьютер немесе планшетімде антивирус орнатып, жаңартып отыра аламын.",
      },
      {
        text: "Мен жеке деректерімді (ЖСН, банк карточкасы, пароль) онлайнда қорғай аламын.",
      },
      {
        text: "Мен онлайн алаяқтыққа тап болсам, тиісті органдарға хабарлай аламын.",
      },
    ],
    egov: [
      {
        text: "Мен egov.kz порталы арқылы мемлекеттік қызметтерге онлайн өтініш бере аламын.",
      },
      {
        text: "Мен электрондық цифрлық қолтаңба (ЭЦҚ) арқылы құжаттарды растай аламын.",
      },
      {
        text: "Мен email, мессенджер немесе бейнеконференция арқылы ресми байланыс жүргізе аламын.",
      },
      {
        text: "Мен онлайн платформа арқылы жұмысқа өтініш бере аламын (форма толтыру, CV жүктеу).",
      },
      {
        text: "Мен ортақ онлайн құжаттарды (Google Docs, OneDrive) бірлесіп өңдей аламын.",
      },
      {
        text: "Мен жағдайға қарай онлайнда қалай мінез-құлық ету керек екенін (ресми/бейресми) білемін.",
      },
    ],
    "network-culture": [
      {
        text: "Мен мәтін, сурет, аудио немесе бейне форматында сандық контент жасай аламын.",
      },
      {
        text: "Мен басқалар жасаған сандық контентті өңдеп, жаңасын жасай аламын (мысалы, суретке мәтін қосу).",
      },
      {
        text: "Мен заңды және заңсыз онлайн контентті (бағдарламалық жасақтама, музыка, фильм) ажырата аламын.",
      },
      {
        text: "Мен авторлық құқық пен лицензиялар туралы негізгі ережелерді білемін.",
      },
      {
        text: "Мен Python, Java немесе Visual Basic сияқты бағдарламалау тілдері бар екенін және олардың мақсатын түсінемін.",
      },
      {
        text: "Мен кибербуллинг (желідегі қудалау) жағдайында дұрыс әрекет ете аламын.",
      },
    ],
    "device-care": [
      {
        text: "Мен техникалық мәселеге тап болсам, интернеттен шешімін таба аламын.",
      },
      {
        text: "Мен белгілі бір тапсырмаға сәйкес дұрыс құрал, құрылғы немесе қызметті таңдай аламын.",
      },
      {
        text: "Мен сандық технологияны шығармашылық мақсатта пайдалана аламын (бейне, инфографика, блог).",
      },
      {
        text: "Мен онлайн оқу ресурстары (YouTube, онлайн курс) арқылы жаңа сандық дағдыларды үйрене аламын.",
      },
      {
        text: "Мен смартфон немесе компьютерімдегі деректерді резервтік көшірмесін жасай аламын (backup).",
      },
      {
        text: "Мен қолданбалар мен операциялық жүйені жаңартып отырудың маңыздылығын түсінемін.",
      },
    ],
  };

  /* ═══════════════════════════════════════════════════════
       УТИЛИТАЛАР
    ═══════════════════════════════════════════════════════ */
  function getUser() {
    try {
      var r =
        localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_KEY);
      return r ? JSON.parse(r) : null;
    } catch (_) {
      return null;
    }
  }

  function saveResults(blockScores) {
    try {
      var all = {};
      BLOCKS.forEach(function (b) {
        var s = blockScores[b.id] || 0;
        all[b.id] = { score: s, total: 18, date: new Date().toISOString() };
      });
      localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch (_) {}
  }

  function saveHistory(entry) {
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      var hist = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(hist)) hist = [];
      hist.unshift(entry);
      if (hist.length > 10) hist = hist.slice(0, 10);
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
    } catch (_) {}
  }

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
        d.getDate() +
        "." +
        String(d.getMonth() + 1).padStart(2, "0") +
        "." +
        d.getFullYear()
      );
    } catch (_) {
      return "—";
    }
  }

  /* ═══════════════════════════════════════════════════════
       AUTH
    ═══════════════════════════════════════════════════════ */
  function initAuth() {
    try {
      if (
        !localStorage.getItem(USER_KEY) &&
        !localStorage.getItem(LEGACY_KEY)
      ) {
        window.location.href = "index.html";
        return false;
      }
    } catch (_) {}
    var btn = document.getElementById("logoutBtn");
    if (btn)
      btn.addEventListener("click", function () {
        try {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(LEGACY_KEY);
        } catch (_) {}
        window.location.href = "index.html";
      });
    return true;
  }

  /* ═══════════════════════════════════════════════════════
       ICON SVG
    ═══════════════════════════════════════════════════════ */
  function getIconSvg(id) {
    var icons = {
      "info-search":
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M10.5 4a6.5 6.5 0 0 1 5.17 10.46l3.93 3.94a1 1 0 0 1-1.42 1.4l-3.93-3.92A6.5 6.5 0 1 1 10.5 4Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z"/></svg>',
      "financial-security":
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3.1 6 5.2v5.2c0 3.7 2.55 7.16 6 8.5 3.45-1.34 6-4.8 6-8.5V5.2L12 3.1Zm0 2.06 4 1.45v3.8c0 2.79-1.8 5.41-4 6.47-2.2-1.06-4-3.68-4-6.47v-3.8l4-1.45Z"/></svg>',
      egov: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M12 3 4 7v2h16V7l-8-4Zm-7 8v8h2v-8H5Zm5 0v8h2v-8h-2Zm5 0v8h2v-8h-2Zm-9 10v2h16v-2H6Z"/></svg>',
      "network-culture":
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M5 4h14a2 2 0 0 1 2 2v9.5a1.5 1.5 0 0 1-1.5 1.5H8.4L5.3 19.9A1 1 0 0 1 4 19.1V6a2 2 0 0 1 2-2Zm2 4v2h10V8H7Zm0 4v2h6v-2H7Z"/></svg>',
      "device-care":
        '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="currentColor" d="M9 2h6v3h-2v2h-2V5H9V2Zm0 17v3h6v-3h-2v-2h-2v2H9Zm10-7h3v-2h-3v-2h-2v2h-2v2h2v2h2v-2ZM12 8a5 5 0 1 0 0 10A5 5 0 0 0 12 8Z"/></svg>',
    };
    return icons[id] || "";
  }

  /* ═══════════════════════════════════════════════════════
       QUIZ STATE
    ═══════════════════════════════════════════════════════ */
  var quiz = null;
  /*
      quiz = {
        userInfo: { name, age, education, field },
        blockIdx: 0,          // қай блок
        questionIdx: 0,       // блок ішіндегі сұрақ
        blockScores: {},      // { blockId: totalScore }
        allAnswers: {},       // { blockId: [0,2,1,...] }
      }
    */

  /* ═══════════════════════════════════════════════════════
       БЛОКТАРДЫ РЕНДЕРЛЕУ (тест таңдау беті)
    ═══════════════════════════════════════════════════════ */
  function renderBlocks() {
    var container = document.getElementById("blocksList");
    if (!container) return;
    container.innerHTML = "";

    try {
      var raw = localStorage.getItem(RESULTS_KEY);
      var saved = raw ? JSON.parse(raw) : {};
    } catch (_) {
      var saved = {};
    }

    BLOCKS.forEach(function (block) {
      var entry = saved[block.id];
      var isCompleted = !!entry;
      var score = entry ? entry.score : null;

      var card = document.createElement("article");
      card.className =
        "test-card" + (isCompleted ? " test-card--completed" : "");
      card.style.setProperty("--card-accent", block.color);

      var levelHtml = "";
      if (isCompleted && score !== null) {
        var lvl = getLevelForScore(score);
        levelHtml =
          '<span class="score-chip" style="background:' +
          lvl.color +
          "22;color:" +
          lvl.color +
          ";border-color:" +
          lvl.color +
          '44">' +
          lvl.num +
          "-деңгей · " +
          lvl.kk +
          "</span>";
      }

      card.innerHTML =
        '<div class="test-card__icon-col">' +
        '  <div class="test-card__icon-wrap">' +
        getIconSvg(block.id) +
        "</div>" +
        "</div>" +
        '<div class="test-card__info-col">' +
        '  <div class="test-card__title-row">' +
        '    <h2 class="test-card__title">' +
        block.title +
        "</h2>" +
        '    <div class="test-card__meta">6 сұрақ · ~5 мин</div>' +
        "  </div>" +
        '  <p class="test-card__description">' +
        block.description +
        "</p>" +
        "</div>" +
        '<div class="test-card__status-col">' +
        '  <div class="status-row">' +
        (isCompleted
          ? '<span class="status-badge status-badge--completed">✓ Аяқталды</span>' +
            levelHtml
          : '<span class="status-badge status-badge--not-started">Басталмады</span>') +
        "  </div>" +
        '  <button type="button" class="' +
        (isCompleted ? "btn btn-ghost-secondary" : "btn btn-primary") +
        ' test-card__action-button">' +
        (isCompleted ? "Қайталау" : "Бастау →") +
        "  </button>" +
        "</div>";

      card
        .querySelector(".test-card__action-button")
        .addEventListener("click", function () {
          openIntroModal(block);
        });

      container.appendChild(card);
    });
  }

  function updateSummary() {
    try {
      var raw = localStorage.getItem(RESULTS_KEY);
      var saved = raw ? JSON.parse(raw) : {};
    } catch (_) {
      var saved = {};
    }

    var completed = 0,
      totalScore = 0;
    BLOCKS.forEach(function (b) {
      var e = saved[b.id];
      if (e) {
        completed++;
        totalScore += e.score || 0;
      }
    });

    var countEl = document.getElementById("overallCompletedCount");
    if (countEl) countEl.textContent = completed;

    var barEl = document.getElementById("overallProgressBar");
    if (barEl) barEl.style.width = (completed / BLOCKS.length) * 100 + "%";

    var scoreEl = document.getElementById("totalScore");
    if (scoreEl) scoreEl.textContent = totalScore;

    var maxScore = BLOCKS.length * 18;
    var pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;

    var sBar = document.getElementById("summaryProgressBar");
    if (sBar) {
      sBar.classList.remove(
        "summary-progress__bar-fill--low",
        "summary-progress__bar-fill--medium",
        "summary-progress__bar-fill--high",
      );
      if (pct < 40) sBar.classList.add("summary-progress__bar-fill--low");
      else if (pct < 75)
        sBar.classList.add("summary-progress__bar-fill--medium");
      else sBar.classList.add("summary-progress__bar-fill--high");
      sBar.style.width = pct.toFixed(1) + "%";
    }

    var lvlBadge = document.getElementById("levelBadge");
    if (lvlBadge) {
      var lvl = getLevelForScore(totalScore);
      lvlBadge.className = "level-badge";
      lvlBadge.textContent = lvl.num + "-деңгей · " + lvl.kk;
      lvlBadge.style.background = lvl.color + "22";
      lvlBadge.style.color = lvl.color;
    }
  }

  /* ═══════════════════════════════════════════════════════
       MODAL УТИЛИТАЛАРЫ
    ═══════════════════════════════════════════════════════ */
  function getModal() {
    return document.getElementById("testModal");
  }

  function setModalContent(html) {
    var m = getModal();
    if (m) m.innerHTML = html;
  }

  function openModal() {
    var m = getModal();
    if (!m) return;
    m.classList.add("is-open");
    m.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    var m = getModal();
    if (!m) return;
    m.classList.remove("is-open");
    m.setAttribute("aria-hidden", "true");
    quiz = null;
  }

  /* ═══════════════════════════════════════════════════════
       1-ҚАДАМ: КІРІСПЕ ФОРМА
    ═══════════════════════════════════════════════════════ */
  function openIntroModal(block) {
    var user = getUser();
    var name = user && user.name ? user.name.split(" ")[0] : "";

    setModalContent(
      '<div class="modal">' +
        '  <div class="modal__header" style="border-bottom:3px solid ' +
        block.color +
        '">' +
        '    <div class="modal__block-info">' +
        '      <span class="modal__block-icon" style="background:' +
        block.color +
        "22;color:" +
        block.color +
        '">' +
        getIconSvg(block.id) +
        "</span>" +
        '      <span class="modal__block-title">' +
        block.title +
        "</span>" +
        "    </div>" +
        '    <button class="modal__close-btn" id="introCancelBtn">✕</button>' +
        "  </div>" +
        '  <div class="modal__body">' +
        '    <p class="modal__intro-desc">Тест басталмас бұрын бірнеше сұрақ. Нәтижеңіз осы деректер негізінде дербес болады.</p>' +
        '    <div class="modal__form">' +
        '      <div class="modal__form-row">' +
        '        <label class="modal__form-label">Атыңыз</label>' +
        '        <input class="modal__form-input" type="text" id="introName" placeholder="Атыңызды енгізіңіз" value="' +
        name +
        '">' +
        "      </div>" +
        '      <div class="modal__form-row">' +
        '        <label class="modal__form-label">Жас тобы</label>' +
        '        <select class="modal__form-select" id="introAge">' +
        '          <option value="">Таңдаңыз</option>' +
        '          <option value="18-25">18–25</option>' +
        '          <option value="26-35">26–35</option>' +
        '          <option value="36-50">36–50</option>' +
        '          <option value="50+">50+</option>' +
        "        </select>" +
        "      </div>" +
        '      <div class="modal__form-row">' +
        '        <label class="modal__form-label">Білім деңгейі</label>' +
        '        <select class="modal__form-select" id="introEducation">' +
        '          <option value="">Таңдаңыз</option>' +
        '          <option value="Орта">Орта мектеп</option>' +
        '          <option value="Техникалық">Техникалық/кәсіптік</option>' +
        '          <option value="Жоғары">Жоғары (бакалавр)</option>' +
        '          <option value="Магистр">Магистр/PhD</option>' +
        "        </select>" +
        "      </div>" +
        '      <div class="modal__form-row">' +
        '        <label class="modal__form-label">Мамандық саласы</label>' +
        '        <select class="modal__form-select" id="introField">' +
        '          <option value="">Таңдаңыз</option>' +
        '          <option value="Білім">Білім беру</option>' +
        '          <option value="Медицина">Медицина/денсаулық</option>' +
        '          <option value="IT">IT/технология</option>' +
        '          <option value="Бизнес">Бизнес/сауда</option>' +
        '          <option value="Мемлекет">Мемлекеттік қызмет</option>' +
        '          <option value="Студент">Студент</option>' +
        '          <option value="Басқа">Басқа</option>' +
        "        </select>" +
        "      </div>" +
        "    </div>" +
        '    <div class="modal__intro-info">' +
        "      <span>📋</span>" +
        "      <span>6 сұрақ · Өзін-өзі бағалау · ~5 минут</span>" +
        "    </div>" +
        "  </div>" +
        '  <div class="modal__footer">' +
        '    <button type="button" class="btn btn-ghost-secondary" id="introCancelBtn2">Бас тарту</button>' +
        '    <button type="button" class="btn btn-primary" id="introStartBtn" style="background:' +
        block.color +
        ";border-color:" +
        block.color +
        '">Тестті бастау →</button>' +
        "  </div>" +
        "</div>",
    );

    openModal();

    document
      .getElementById("introCancelBtn")
      .addEventListener("click", closeModal);
    document
      .getElementById("introCancelBtn2")
      .addEventListener("click", closeModal);
    document
      .getElementById("introStartBtn")
      .addEventListener("click", function () {
        var name = (document.getElementById("introName").value || "").trim();
        var age = document.getElementById("introAge").value;
        var edu = document.getElementById("introEducation").value;
        var field = document.getElementById("introField").value;

        if (!name) {
          alert("Атыңызды енгізіңіз");
          return;
        }

        quiz = {
          block: block,
          userInfo: { name: name, age: age, education: edu, field: field },
          questionIdx: 0,
          blockScore: 0,
          answers: [],
        };
        renderQuestion();
      });
  }

  /* ═══════════════════════════════════════════════════════
       2-ҚАДАМ: СҰРАҚ ЭКРАНЫ
    ═══════════════════════════════════════════════════════ */
  function renderQuestion() {
    if (!quiz) return;

    var block = quiz.block;
    var qList = QUESTIONS[block.id];
    var idx = quiz.questionIdx;
    var total = qList.length;
    var q = qList[idx];
    var pct = (idx / total) * 100;

    setModalContent(
      '<div class="modal">' +
        '  <div class="modal__header" style="border-bottom:3px solid ' +
        block.color +
        '">' +
        '    <div class="modal__block-info">' +
        '      <span class="modal__block-icon" style="background:' +
        block.color +
        "22;color:" +
        block.color +
        '">' +
        getIconSvg(block.id) +
        "</span>" +
        '      <span class="modal__block-title">' +
        block.title +
        "</span>" +
        "    </div>" +
        '    <button class="modal__close-btn" id="qCloseBtn">✕</button>' +
        "  </div>" +
        '  <div class="modal__progress">' +
        '    <div class="modal__progress-bar"><div class="modal__progress-fill" style="width:' +
        pct +
        "%;background:" +
        block.color +
        '"></div></div>' +
        '    <span class="modal__progress-text">' +
        (idx + 1) +
        " / " +
        total +
        "</span>" +
        "  </div>" +
        '  <div class="modal__body">' +
        '    <p class="modal__question-statement">Төмендегі тұжырымды оқып, өзіңізге сәйкес жауапты таңдаңыз:</p>' +
        '    <p class="modal__question">"' +
        q.text +
        '"</p>' +
        '    <div class="modal__options" id="quizOptions">' +
        ANSWER_OPTIONS.map(function (opt, i) {
          return (
            '<button type="button" class="modal__option modal__option--self" data-score="' +
            opt.score +
            '">' +
            '<span class="modal__option-icon">' +
            opt.icon +
            "</span>" +
            '<div class="modal__option-body">' +
            '<span class="modal__option-label">' +
            opt.label +
            "</span>" +
            '<span class="modal__option-desc">' +
            opt.desc +
            "</span>" +
            "</div>" +
            "</button>"
          );
        }).join("") +
        "    </div>" +
        "  </div>" +
        "</div>",
    );

    document.getElementById("qCloseBtn").addEventListener("click", closeModal);

    document.querySelectorAll(".modal__option--self").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var score = Number(btn.getAttribute("data-score"));
        handleSelfAnswer(score, btn);
      });
    });
  }

  function handleSelfAnswer(score, btn) {
    if (!quiz) return;

    // Таңдалған батырманы белгіле
    document.querySelectorAll(".modal__option--self").forEach(function (b) {
      b.disabled = true;
      b.classList.remove("modal__option--selected");
    });
    btn.classList.add("modal__option--selected");

    quiz.blockScore += score;
    quiz.answers.push(score);

    setTimeout(function () {
      quiz.questionIdx++;
      if (quiz.questionIdx < QUESTIONS[quiz.block.id].length) {
        renderQuestion();
      } else {
        showBlockResult();
      }
    }, 600);
  }

  /* ═══════════════════════════════════════════════════════
       3-ҚАДАМ: БЛОК НӘТИЖЕСІ
    ═══════════════════════════════════════════════════════ */
  function showBlockResult() {
    if (!quiz) return;

    var block = quiz.block;
    var score = quiz.blockScore;
    var lvl = getLevelForScore(score);
    var maxPct = Math.round((score / 18) * 100);

    // Нәтижені сақта
    try {
      var raw = localStorage.getItem(RESULTS_KEY);
      var all = raw ? JSON.parse(raw) : {};
      all[block.id] = {
        score: score,
        total: 18,
        date: new Date().toISOString(),
      };
      localStorage.setItem(RESULTS_KEY, JSON.stringify(all));
    } catch (_) {}

    // Тарихқа қос
    saveHistory({
      date: new Date().toISOString(),
      blockId: block.id,
      blockTitle: block.title,
      score: score,
      levelNum: lvl.num,
      levelKk: lvl.kk,
      userInfo: quiz.userInfo,
    });

    // Деңгей сипаттамасы
    var levelDescs = {
      1: "Бұл деңгейде сіз қарапайым жағдайларды өзіңіз немесе көмекпен шеше аласыз.",
      2: "Бұл деңгейде сіз қарапайым жағдайларды өзіңіз шеше аласыз.",
      3: "Бұл деңгейде сіз тікелей және кейбір болжанбайтын жағдайларды өзіңіз шеше аласыз.",
      4: "Бұл деңгейде сіз тікелей және болжанбайтын жағдайларды тәуелсіз шеше аласыз.",
      5: "Бұл деңгейде сіз өз қажеттіліктеріңіз үшін шешімдер таба аласыз және басқаларға қолдау көрсете аласыз.",
      6: "Бұл деңгейде сіз күрделі жағдайларда өзіңіз бен басқалар үшін шешімдер таба аласыз.",
      7: "Бұл деңгейде сіз ең күрделі жағдайларда шешімдерді жасай аласыз.",
      8: "Бұл деңгейде сіз жоғары мамандандырылған деңгейде жұмыс жасайсыз.",
    };

    // Жауаптар шолу
    var answersHtml = QUESTIONS[block.id]
      .map(function (q, i) {
        var s = quiz.answers[i] || 0;
        var opt = ANSWER_OPTIONS[s];
        return (
          '<div class="result__self-row">' +
          '<span class="result__self-icon">' +
          opt.icon +
          "</span>" +
          '<div class="result__self-body">' +
          '<div class="result__self-q">' +
          q.text +
          "</div>" +
          '<div class="result__self-ans" style="color:' +
          opt.color +
          '">' +
          opt.label +
          "</div>" +
          "</div>" +
          "</div>"
        );
      })
      .join("");

    setModalContent(
      '<div class="modal modal--result">' +
        '  <div class="modal__header" style="border-bottom:3px solid ' +
        block.color +
        '">' +
        '    <span class="modal__block-title">Нәтиже — ' +
        block.title +
        "</span>" +
        '    <button class="modal__close-btn" id="resultCloseBtn">✕</button>' +
        "  </div>" +
        '  <div class="modal__body modal__body--result">' +
        /* Score */
        '    <div class="result__score-wrap">' +
        '      <div class="result__score-circle" style="--c:' +
        lvl.color +
        '">' +
        '        <span class="result__level-num">' +
        lvl.num +
        "-деңгей</span>" +
        '        <span class="result__level-kk">' +
        lvl.kk +
        "</span>" +
        '        <span class="result__score-pct">' +
        maxPct +
        "%</span>" +
        "      </div>" +
        '      <div class="result__level-info">' +
        '        <div class="result__level-bar-wrap">' +
        '          <div class="result__level-bar-track">' +
        [1, 2, 3, 4, 5, 6, 7, 8]
          .map(function (n) {
            var filled = n <= lvl.num;
            return (
              '<div class="result__level-bar-seg' +
              (filled ? ' filled" style="background:' + lvl.color + '"' : '"') +
              "></div>"
            );
          })
          .join("") +
        "          </div>" +
        '          <span class="result__level-bar-label">' +
        score +
        " / 18 балл</span>" +
        "        </div>" +
        '        <p class="result__level-desc">' +
        (levelDescs[lvl.num] || "") +
        "</p>" +
        "      </div>" +
        "    </div>" +
        /* Answers */
        '    <div class="result__answers">' +
        '      <h3 class="result__answers-title">Жауаптарыңыз</h3>' +
        answersHtml +
        "    </div>" +
        "  </div>" +
        '  <div class="modal__footer">' +
        '    <button type="button" class="btn btn-ghost-secondary" id="resultRepeatBtn">Қайталау</button>' +
        '    <button type="button" class="btn btn-primary" id="resultDownloadBtn" style="background:' +
        block.color +
        ";border-color:" +
        block.color +
        '">📥 Есепті жүктеу</button>' +
        '    <button type="button" class="btn btn-primary" id="resultDoneBtn" style="background:#1b8a4e;border-color:#1b8a4e">Аяқтау ✓</button>' +
        "  </div>" +
        "</div>",
    );

    var _block = block;
    var _score = score;
    var _lvl = lvl;
    var _quiz = quiz;

    document
      .getElementById("resultCloseBtn")
      .addEventListener("click", function () {
        finishQuiz();
      });
    document
      .getElementById("resultDoneBtn")
      .addEventListener("click", function () {
        finishQuiz();
      });
    document
      .getElementById("resultRepeatBtn")
      .addEventListener("click", function () {
        closeModal();
        openIntroModal(_block);
      });
    document
      .getElementById("resultDownloadBtn")
      .addEventListener("click", function () {
        downloadReport(_block, _score, _lvl, _quiz);
      });
  }

  function finishQuiz() {
    closeModal();
    renderBlocks();
    updateSummary();
  }

  /* ═══════════════════════════════════════════════════════
       ЕСЕПТІ ЖҮКТЕУ (HTML → браузерден PDF)
    ═══════════════════════════════════════════════════════ */
  function downloadReport(block, score, lvl, quizData) {
    var name = (quizData.userInfo && quizData.userInfo.name) || "Пайдаланушы";
    var age = (quizData.userInfo && quizData.userInfo.age) || "—";
    var edu = (quizData.userInfo && quizData.userInfo.education) || "—";
    var field = (quizData.userInfo && quizData.userInfo.field) || "—";
    var dateStr = formatDate(new Date().toISOString());
    var maxPct = Math.round((score / 18) * 100);

    var levelDescs = {
      1: "Бұл деңгейде сіз қарапайым жағдайларды өзіңіз немесе көмекпен шеше аласыз.",
      2: "Бұл деңгейде сіз қарапайым жағdайларды өзіңіз шеше аласыз.",
      3: "Бұл деңгейде сіз тікелей және кейбір болжанбайтын жағдайларды өзіңіз шеше аласыз.",
      4: "Бұл деңгейде сіз тікелей және болжанбайтын жағdайларды тәуелсіз шеше аласыз.",
      5: "Бұл деңгейде сіз өз қажеттіліктеріңіз үшін шешімдер таба аласыз және басқаларға қолдау көрсете аласыз.",
      6: "Бұл деңгейде сіз күрделі жағdайларда өзіңіз бен басқалар үшін шешімдер таба аласыз.",
      7: "Бұл деңгейде сіз ең күрделі жағdайларда шешімдерді жасай аласыз.",
      8: "Бұл деңгейде сіз жоғары мамандандырылған деңгейде жұмыс жасайсыз.",
    };

    var examplesMap = {
      "info-search": [
        "Ақпаратты тез табу үшін дұрыс кілт сөздерді білу",
        "Әртүрлі іздеу жүйелері әртүрлі нәтиже беруі мүмкін екенін түсіну",
        "Онлайнда табылған ақпараттың сенімді екенін тексеру",
        "Мазмұнды қалталар немесе тег арқылы ұйымдастыру",
      ],
      "financial-security": [
        "Фишинг хабарламаларды анықтау",
        "Қауіпсіз онлайн төлем жасау",
        "Күшті пароль жасау және сақтау",
        "Антивирус орнату және жаңарту",
      ],
      egov: [
        "egov.kz арқылы мемлекеттік қызмет алу",
        "ЭЦҚ арқылы құжат растау",
        "Онлайн платформа арқылы жұмысқа өтініш беру",
        "Ортақ онлайн құжаттарды бірлесіп өңдеу",
      ],
      "network-culture": [
        "Мәтін, сурет немесе бейне форматында сандық контент жасау",
        "Авторлық құқық пен лицензияларды түсіну",
        "Кибербуллингге қарсы дұрыс әрекет ету",
        "Онлайнда жағдайға сәйкес мінез-құлық ережесін сақтау",
      ],
      "device-care": [
        "Техникалық мәселенің шешімін интернеттен табу",
        "Тапсырмаға сәйкес дұрыс құрал немесе қызметті таңдау",
        "Сандық технологияны шығармашылық мақсатта пайдалану",
        "Онлайн оқу ресурстары арқылы жаңа дағдыларды үйрену",
      ],
    };

    var examples = examplesMap[block.id] || [];
    var exHtml = examples
      .map(function (e) {
        return "<li>" + e + "</li>";
      })
      .join("");

    var segHtml = [1, 2, 3, 4, 5, 6, 7, 8]
      .map(function (n) {
        return (
          '<div style="width:28px;height:10px;border-radius:2px;background:' +
          (n <= lvl.num ? lvl.color : "#e0e0e0") +
          '"></div>'
        );
      })
      .join("");

    var html =
      '<!DOCTYPE html><html lang="kk"><head><meta charset="UTF-8">' +
      "<title>Сандық дағдылар есебі — " +
      name +
      "</title>" +
      "<style>" +
      "body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;padding:0 24px;color:#1a1f36}" +
      "h1{font-size:1.5rem;margin-bottom:4px}" +
      ".header-line{height:4px;background:" +
      lvl.color +
      ";margin-bottom:24px;border-radius:2px}" +
      ".level-big{font-size:2.8rem;font-weight:900;color:#1a1f36;margin:0}" +
      ".level-sub{font-size:1.2rem;color:" +
      lvl.color +
      ";font-weight:700}" +
      ".meta{font-size:.85rem;color:#9ba3c9;margin-bottom:24px}" +
      ".block-title{font-size:1.4rem;font-weight:700;border-left:4px solid " +
      block.color +
      ";padding-left:12px;margin:24px 0 6px}" +
      ".block-level{font-size:.9rem;color:" +
      lvl.color +
      ";font-weight:700;margin-bottom:4px}" +
      ".segs{display:flex;gap:4px;margin-bottom:8px}" +
      ".desc{font-size:.9rem;line-height:1.6;margin-bottom:8px}" +
      "ul{font-size:.88rem;line-height:1.8;padding-left:20px}" +
      ".footer{margin-top:40px;padding-top:16px;border-top:1px solid #dde1f5;display:flex;justify-content:space-between;font-size:.8rem;color:#9ba3c9}" +
      ".score-chip{display:inline-block;padding:4px 12px;border-radius:999px;font-size:.85rem;font-weight:700;background:" +
      lvl.color +
      "22;color:" +
      lvl.color +
      ";margin-left:10px}" +
      "@media print{button{display:none}}" +
      "</style></head><body>" +
      "<h1>Сандық дағдыларды өзін-өзі бағалау: тест нәтижелері</h1>" +
      '<div class="header-line"></div>' +
      '<p class="meta">Бұл ресми тест емес және сертификатқа әкелмейді. DigComp 2.2 негізінде</p>' +
      '<p class="level-big">' +
      lvl.num +
      "-деңгей</p>" +
      '<p class="level-sub">' +
      lvl.kk +
      ' <span class="score-chip">' +
      score +
      " / 18 балл · " +
      maxPct +
      "%</span></p>" +
      '<p class="meta">Аты: <strong>' +
      name +
      "</strong> &nbsp;|&nbsp; Жасы: " +
      age +
      " &nbsp;|&nbsp; Білімі: " +
      edu +
      " &nbsp;|&nbsp; Сала: " +
      field +
      "</p>" +
      '<div class="block-title">' +
      block.title +
      "</div>" +
      '<div class="block-level">' +
      lvl.kk +
      " — " +
      lvl.num +
      "-деңгей</div>" +
      '<div class="segs">' +
      segHtml +
      "</div>" +
      '<p class="desc">' +
      (levelDescs[lvl.num] || "") +
      "</p>" +
      "<p><strong>Осы салада мысалдар:</strong></p>" +
      "<ul>" +
      exHtml +
      "</ul>" +
      '<div class="footer"><span>' +
      name +
      "</span><span>Күні: " +
      dateStr +
      "</span></div>" +
      '<br><button onclick="window.print()" style="padding:10px 24px;background:' +
      lvl.color +
      ';color:#fff;border:none;border-radius:8px;font-size:1rem;cursor:pointer;margin-top:16px">🖨️ PDF ретінде сақтау</button>' +
      "</body></html>";

    var blob = new Blob([html], { type: "text/html;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download =
      "digcomp-report-" + name + "-" + dateStr.replace(/\./g, "-") + ".html";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /* ═══════════════════════════════════════════════════════
       CSS ИНЪЕКЦИЯ
    ═══════════════════════════════════════════════════════ */
  function injectStyles() {
    if (document.getElementById("quiz-styles")) return;
    var s = document.createElement("style");
    s.id = "quiz-styles";
    s.textContent = [
      /* Backdrop */
      "#testModal{display:none;position:fixed;inset:0;background:rgba(10,14,40,.55);backdrop-filter:blur(4px);z-index:900;align-items:center;justify-content:center;padding:16px}",
      "#testModal.is-open{display:flex;animation:mFadeIn .2s ease}",
      "@keyframes mFadeIn{from{opacity:0}to{opacity:1}}",

      /* Box */
      ".modal{background:#fff;border-radius:20px;width:100%;max-width:580px;max-height:92vh;overflow-y:auto;box-shadow:0 24px 64px rgba(10,14,40,.25);display:flex;flex-direction:column;animation:mUp .25s ease}",
      "@keyframes mUp{from{transform:translateY(20px);opacity:0}to{transform:translateY(0);opacity:1}}",

      /* Header */
      ".modal__header{display:flex;align-items:center;justify-content:space-between;padding:16px 20px;gap:12px;flex-shrink:0}",
      ".modal__block-info{display:flex;align-items:center;gap:10px}",
      ".modal__block-icon{width:32px;height:32px;border-radius:8px;display:grid;place-items:center;flex-shrink:0}",
      ".modal__block-icon svg{width:18px;height:18px}",
      ".modal__block-title{font-size:.95rem;font-weight:700;color:#1a1f36}",
      ".modal__close-btn{background:none;border:none;font-size:1.1rem;color:#9ba3c9;cursor:pointer;padding:4px 8px;border-radius:8px}",
      ".modal__close-btn:hover{background:#f0f4ff;color:#3949ab}",

      /* Progress */
      ".modal__progress{padding:0 20px 10px;display:flex;align-items:center;gap:10px;flex-shrink:0}",
      ".modal__progress-bar{flex:1;height:6px;background:#e3e7ff;border-radius:999px;overflow:hidden}",
      ".modal__progress-fill{height:100%;border-radius:inherit;transition:width .3s}",
      ".modal__progress-text{font-family:'DM Mono',monospace;font-size:.78rem;color:#9ba3c9;white-space:nowrap}",

      /* Body */
      ".modal__body{padding:8px 20px 16px;flex:1;min-height:0}",
      ".modal__intro-desc{font-size:.9rem;color:#5c6690;margin-bottom:16px;line-height:1.6}",
      ".modal__question-statement{font-size:.82rem;color:#9ba3c9;margin-bottom:8px;font-style:italic}",
      ".modal__question{font-size:1.05rem;font-weight:600;color:#1a1f36;line-height:1.5;margin-bottom:16px;padding:14px 16px;background:#f8f9ff;border-radius:10px;border-left:3px solid #3949ab}",

      /* Form */
      ".modal__form{display:flex;flex-direction:column;gap:12px;margin-bottom:16px}",
      ".modal__form-row{display:flex;flex-direction:column;gap:4px}",
      ".modal__form-label{font-size:.8rem;font-weight:600;color:#5c6690;text-transform:uppercase;letter-spacing:.06em}",
      ".modal__form-input,.modal__form-select{height:44px;border:1.5px solid #dde1f5;border-radius:10px;padding:0 12px;font-family:'Plus Jakarta Sans',sans-serif;font-size:.9rem;color:#1a1f36;background:#f5f7ff;outline:none}",
      ".modal__form-input:focus,.modal__form-select:focus{border-color:#3949ab;background:#fff;box-shadow:0 0 0 3px rgba(57,73,171,.12)}",
      ".modal__intro-info{display:flex;align-items:center;gap:8px;padding:10px 14px;background:#e8eaf6;border-radius:10px;font-size:.85rem;color:#3949ab;font-weight:500}",

      /* Self-assessment options */
      ".modal__options{display:flex;flex-direction:column;gap:8px}",
      ".modal__option--self{display:flex;align-items:center;gap:14px;padding:12px 16px;border:1.5px solid #dde1f5;border-radius:12px;background:#fff;cursor:pointer;text-align:left;transition:all .15s}",
      ".modal__option--self:hover:not(:disabled){border-color:#3949ab;background:#f0f4ff;transform:translateX(4px)}",
      ".modal__option--self:disabled{cursor:default}",
      ".modal__option--self.modal__option--selected{border-color:#3949ab;background:#e8eaf6}",
      ".modal__option-icon{font-size:1.4rem;flex-shrink:0;width:32px;text-align:center}",
      ".modal__option-body{display:flex;flex-direction:column;gap:2px}",
      ".modal__option-label{font-size:.9rem;font-weight:700;color:#1a1f36}",
      ".modal__option-desc{font-size:.78rem;color:#5c6690;line-height:1.4}",

      /* Result */
      ".modal--result .modal__body--result{padding:16px 20px}",
      ".result__score-wrap{display:grid;grid-template-columns:auto 1fr;gap:20px;align-items:center;margin-bottom:20px}",
      ".result__score-circle{width:110px;height:110px;border-radius:50%;border:4px solid var(--c,#3949ab);display:flex;flex-direction:column;align-items:center;justify-content:center;background:#f8f9ff;flex-shrink:0}",
      ".result__level-num{font-size:1.2rem;font-weight:800;color:#1a1f36;line-height:1.1}",
      ".result__level-kk{font-size:.75rem;font-weight:600;color:#5c6690}",
      ".result__score-pct{font-family:'DM Mono',monospace;font-size:.85rem;color:#9ba3c9}",
      ".result__level-bar-wrap{display:flex;align-items:center;gap:10px;margin-bottom:8px}",
      ".result__level-bar-track{display:flex;gap:3px}",
      ".result__level-bar-seg{width:20px;height:8px;border-radius:2px;background:#e3e7ff}",
      ".result__level-bar-label{font-family:'DM Mono',monospace;font-size:.78rem;color:#9ba3c9;white-space:nowrap}",
      ".result__level-desc{font-size:.83rem;color:#5c6690;line-height:1.6}",
      ".result__answers{margin-top:4px}",
      ".result__answers-title{font-size:.9rem;font-weight:700;color:#1a1f36;margin-bottom:10px}",
      ".result__self-row{display:flex;gap:10px;padding:8px 10px;border-radius:8px;margin-bottom:6px;background:#f8f9ff;align-items:flex-start}",
      ".result__self-icon{font-size:1.1rem;flex-shrink:0;margin-top:2px}",
      ".result__self-q{font-size:.82rem;color:#1a1f36;margin-bottom:2px;line-height:1.4}",
      ".result__self-ans{font-size:.78rem;font-weight:700}",

      /* Footer */
      ".modal__footer{padding:12px 20px;border-top:1px solid #f0f4ff;display:flex;gap:8px;justify-content:flex-end;flex-shrink:0;flex-wrap:wrap}",
    ].join("");
    document.head.appendChild(s);
  }

  /* ═══════════════════════════════════════════════════════
       INIT
    ═══════════════════════════════════════════════════════ */
  function init() {
    if (!initAuth()) return;
    injectStyles();
    renderBlocks();
    updateSummary();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
