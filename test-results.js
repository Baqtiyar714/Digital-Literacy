(function () {
  "use strict";

  var API_BASE =
    typeof API_BASE_URL !== "undefined"
      ? API_BASE_URL
      : "https://digital-literacy-zs48.onrender.com";
  var HISTORY_KEY = "diq_test_history";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";

  var BLOCKS_META = [
    { id: "information", color: "#0097a7", icon: "📚" },
    { id: "communication", color: "#f57c00", icon: "🤝" },
    { id: "content", color: "#5e35b1", icon: "✏️" },
    { id: "safety", color: "#c62828", icon: "🛡️" },
    { id: "problem", color: "#2e7d32", icon: "💡" },
  ];

  var BLOCK_TITLES = {
    kk: {
      information: "Ақпарат",
      communication: "Коммуникация",
      content: "Контент",
      safety: "Қауіпсіздік",
      problem: "Проблемаларды шешу",
    },
    ru: {
      information: "Информация",
      communication: "Коммуникация",
      content: "Контент",
      safety: "Безопасность",
      problem: "Решение проблем",
    },
    en: {
      information: "Information",
      communication: "Communication",
      content: "Content",
      safety: "Safety",
      problem: "Problem solving",
    },
  };

  function getBlocks() {
    var lang =
      (typeof currentLanguage !== "undefined" ? currentLanguage : null) ||
      localStorage.getItem("language") ||
      "kk";
    var titles = BLOCK_TITLES[lang] || BLOCK_TITLES.kk;
    return BLOCKS_META.map(function (m) {
      return { id: m.id, title: titles[m.id], color: m.color, icon: m.icon };
    });
  }

  var BLOCKS = BLOCKS_META.map(function (m) {
    return { id: m.id, title: m.id, color: m.color, icon: m.icon };
  });

  function getLevelDesc(num) {
    var lang =
      (typeof currentLanguage !== "undefined" ? currentLanguage : null) ||
      localStorage.getItem("language") ||
      "kk";
    var t =
      typeof translations !== "undefined" &&
      translations[lang] &&
      translations[lang].test
        ? translations[lang].test
        : null;
    if (t) return t["levelDesc" + num] || "";
    var fallback = {
      1: "Цифрлық дағдыларды дамыту қажет.",
      2: "Орташа деңгейдегі цифрлық сауаттылық.",
      3: "Жоғары деңгейдегі цифрлық сауаттылық.",
    };
    return fallback[num] || "";
  }

  var LEVEL_NAMES = {
    kk: { 1: "Төмен", 2: "Орташа", 3: "Жоғары" },
    ru: { 1: "Низкий", 2: "Средний", 3: "Высокий" },
    en: { 1: "Low", 2: "Average", 3: "High" },
  };

  function getLevelForScore(score, maxScore) {
    var max = maxScore !== undefined ? maxScore : 20;
    var pct = max > 0 ? (score / max) * 100 : 0;
    var lang =
      (typeof currentLanguage !== "undefined" ? currentLanguage : null) ||
      localStorage.getItem("language") ||
      "kk";
    var names = LEVEL_NAMES[lang] || LEVEL_NAMES.kk;
    if (pct <= 33) return { num: 1, kk: names[1], color: "#ef5350" };
    if (pct <= 66) return { num: 2, kk: names[2], color: "#f9a825" };
    return { num: 3, kk: names[3], color: "#1b8a4e" };
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

  function getUser() {
    try {
      var raw =
        localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function initAuth() {
    var user = getUser();
    var btn = document.getElementById("logoutBtn");
    if (btn) {
      if (user) {
        btn.style.display = "inline-flex";
        btn.addEventListener("click", function () {
          try {
            localStorage.removeItem(USER_KEY);
            localStorage.removeItem(LEGACY_KEY);
          } catch (_) {}
          window.location.href = "index.html";
        });
      } else {
        btn.style.display = "none";
      }
    }
    return !!user;
  }

  function buildResultsFromAPI(row) {
    return {
      information: {
        score: (row.information_score || 0) * 5,
        date: row.created_at,
      },
      communication: {
        score: (row.communication_score || 0) * 5,
        date: row.created_at,
      },
      content: { score: (row.content_score || 0) * 5, date: row.created_at },
      safety: { score: (row.safety_score || 0) * 5, date: row.created_at },
      problem: { score: (row.problem_score || 0) * 5, date: row.created_at },
    };
  }

  function getT(key, fallback) {
    try {
      var lang =
        (typeof currentLanguage !== "undefined" ? currentLanguage : null) ||
        localStorage.getItem("language") ||
        "kk";
      return translations[lang].test[key] || fallback;
    } catch (_) {
      return fallback;
    }
  }

  function renderResults(results, lastDate) {
    var overallCard = document.getElementById("overallCard");
    var blockRows = document.getElementById("blockRows");
    if (!overallCard || !blockRows) return;

    var BLOCKS = getBlocks();
    var completed = 0;
    var totalScore = 0;

    BLOCKS.forEach(function (b) {
      var e = results[b.id];
      if (e) {
        completed++;
        totalScore += e.score || 0;
      }
    });

    if (completed === 0) {
      overallCard.innerHTML =
        '<div class="tr-empty"><div class="tr-empty__icon">📋</div>' +
        '<div class="tr-empty__title">' +
        getT("emptyTitle", "Әлі тест тапсырылмаған") +
        "</div>" +
        '<div class="tr-empty__desc">' +
        getT("emptyDesc", "Жоғарыдағы батырманы басып тестті бастаңыз") +
        "</div>" +
        '<a href="quiz.html" class="tr-empty__btn">' +
        getT("emptyBtn", "→ Сынақты бастау") +
        "</a></div>";
      blockRows.innerHTML = "";
      return;
    }

    var maxTotal = completed * 20;
    var overallLvl = getLevelForScore(totalScore, maxTotal);
    var segHtml = "";
    for (var i = 1; i <= 3; i++) {
      segHtml +=
        '<div class="tr-seg' +
        (i <= overallLvl.num
          ? ' on" style="background:' + overallLvl.color + '"'
          : '"') +
        "></div>";
    }

    overallCard.innerHTML =
      '<div class="tr-overall" style="border-left:4px solid ' +
      overallLvl.color +
      '">' +
      '<div class="tr-overall__left"><div class="tr-overall__label">' +
      getT("overallLabel", "Жалпы балл") +
      "</div>" +
      '<div class="tr-overall__score">' +
      totalScore +
      "<span> / " +
      maxTotal +
      "</span></div>" +
      '<div class="tr-overall__level" style="color:' +
      overallLvl.color +
      '">' +
      overallLvl.kk +
      "</div></div>" +
      '<div class="tr-overall__right"><div class="tr-segs">' +
      segHtml +
      "</div>" +
      '<div class="tr-overall__date">' +
      (lastDate ? formatDate(lastDate) : "—") +
      "</div>" +
      '<div style="font-size:.78rem;color:#9ba3c9">' +
      completed +
      " " +
      getT("blocksCompleted", "/ 5 блок аяқталды") +
      "</div></div></div>";

    blockRows.innerHTML = "";
    BLOCKS.forEach(function (block) {
      var entry = results[block.id];
      var score = entry ? entry.score || 0 : null;
      var lvl = score !== null ? getLevelForScore(score, 20) : null;
      var wrap = document.createElement("div");
      wrap.className = "tr-block-wrap";
      var bSegHtml = "";
      for (var n = 1; n <= 3; n++) {
        bSegHtml +=
          '<div class="tr-block__seg' +
          (lvl && n <= lvl.num
            ? ' on" style="background:' + block.color + '"'
            : '"') +
          "></div>";
      }
      wrap.innerHTML =
        '<div class="tr-block" style="--bc:' +
        block.color +
        '">' +
        '<div class="tr-block__icon">' +
        block.icon +
        "</div><div>" +
        '<div class="tr-block__name">' +
        block.title +
        "</div>" +
        '<div class="tr-block__segs">' +
        bSegHtml +
        "</div></div>" +
        '<div class="tr-block__right">' +
        (lvl
          ? '<div class="tr-block__lvl">' +
            lvl.kk +
            '</div><div class="tr-block__score">' +
            score +
            " / 20</div>"
          : '<div class="tr-block__score" style="color:#9ba3c9">' +
            getT("notTaken", "Тапсырылмаған") +
            "</div>") +
        "</div></div>" +
        '<div class="tr-block-detail">' +
        (lvl
          ? getLevelDesc(lvl.num) +
            ' <span style="color:' +
            block.color +
            ';font-weight:600">' +
            block.title +
            "</span>"
          : getT("emptyDesc", "Жоғарыдағы батырманы басып тестті бастаңыз")) +
        "</div>";
      wrap.querySelector(".tr-block").addEventListener("click", function () {
        var isOpen = wrap.classList.contains("is-open");
        document
          .querySelectorAll(".tr-block-wrap.is-open")
          .forEach(function (w) {
            w.classList.remove("is-open");
          });
        if (!isOpen) wrap.classList.add("is-open");
      });
      blockRows.appendChild(wrap);
    });
  }

  async function loadAndRender() {
    var overallCard = document.getElementById("overallCard");
    var blockRows = document.getElementById("blockRows");
    if (!overallCard || !blockRows) return;

    overallCard.innerHTML =
      '<div class="tr-empty"><div class="tr-empty__icon" style="font-size:2rem">⏳</div><div class="tr-empty__title">' +
      getT("loading", "Жүктелуде...") +
      "</div></div>";

    var user = getUser();
    if (!user || !user.id) {
      renderResults({}, null);
      return;
    }

    try {
      var resp = await fetch(API_BASE + "/test/results/" + user.id);
      var data = await resp.json();

      if (!data.success || !data.data) {
        renderResults({}, null);
        initAI({});
        return;
      }

      var row = data.data;
      var results = buildResultsFromAPI(row);
      renderResults(results, row.created_at);
      initAI(results);
    } catch (_) {
      renderResults({}, null);
      initAI({});
    }
  }

  var AI_CACHE_KEY = "diq_ai_result";

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

  function loadAIResult() {
    try {
      var raw = localStorage.getItem(AI_CACHE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (_) {
      return null;
    }
  }

  function initAI(results) {
    var aiBtn = document.getElementById("aiBtn");
    var aiErrorRetry = document.getElementById("aiErrorRetryBtn");
    var aiDesc = document.querySelector(".tr-ai__desc");

    if (aiErrorRetry)
      aiErrorRetry.addEventListener("click", function () {
        runAI(results);
      });

    var cached = loadAIResult();

    var hasResults = Object.keys(results).length > 0;

    var lastTestDate = null;
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (hist.length && hist[0].date) lastTestDate = new Date(hist[0].date);
    } catch (_) {}

    var lastAiDate = cached && cached.date ? new Date(cached.date) : null;
    var canAnalyze =
      hasResults &&
      (!lastAiDate || (lastTestDate && lastTestDate > lastAiDate));

    if (aiBtn) {
      if (canAnalyze) {
        aiBtn.disabled = false;
        aiBtn.style.opacity = "";
        aiBtn.style.cursor = "";
        aiBtn.title = "";
        aiBtn.addEventListener("click", function () {
          runAI(results);
        });
        if (aiDesc)
          aiDesc.textContent = getT(
            "aiCardDesc",
            "Барлық блоктар бойынша нәтижеңізді талдап, оқу жоспары жасайды",
          );
      } else if (!hasResults) {
        aiBtn.disabled = true;
        aiBtn.style.opacity = "0.5";
        aiBtn.style.cursor = "not-allowed";
        if (aiDesc)
          aiDesc.textContent = getT(
            "aiCardDesc",
            "Талдау алу үшін алдымен тестті тапсырыңыз",
          );
      } else {
        aiBtn.disabled = true;
        aiBtn.style.opacity = "0.5";
        aiBtn.style.cursor = "not-allowed";
        if (aiDesc) {
          var aiDateStr = lastAiDate
            ? formatDate(lastAiDate.toISOString())
            : "";
          aiDesc.textContent = getT("aiSaved", "Сақталған:") + " " + aiDateStr;
        }
      }
    }

    if (cached && cached.html) {
      var resultBodyEl = document.getElementById("aiResultBody");
      if (resultBodyEl) resultBodyEl.innerHTML = cached.html;
      var dateEl = document.getElementById("aiResultDate");
      if (dateEl && cached.date)
        dateEl.textContent =
          getT("aiSaved", "Сақталған:") + " " + formatDate(cached.date);
      showAIState("result");
      if (canAnalyze) {
        var triggerEl = document.getElementById("aiTrigger");
        if (triggerEl) triggerEl.style.display = "";
      }
    }

    // #ai hash болса — AI бөліміне scroll жаса (chatbot-widget redirect)
    if (window.location.hash === "#ai") {
      setTimeout(function () {
        var target =
          document.getElementById("aiTrigger") ||
          document.getElementById("aiResult") ||
          document.getElementById("aiBtn");
        if (target) {
          target.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }, 300);
    }
  }

  function showAIState(s) {
    document
      .getElementById("aiLoading")
      .classList.toggle("show", s === "loading");
    document
      .getElementById("aiResult")
      .classList.toggle("show", s === "result");
    document.getElementById("aiError").classList.toggle("show", s === "error");
    var trigger = document.getElementById("aiTrigger");
    if (trigger) trigger.style.display = s === "idle" ? "" : "none";
  }

  function buildPrompt(results) {
    var user = getUser();
    var age = "белгісіз",
      edu = "белгісіз",
      name = "Пайдаланушы";
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (hist.length && hist[0].userInfo) {
        var ui = hist[0].userInfo;
        name = ui.name || name;
        age = ui.age || age;
        edu = ui.education || edu;
      }
    } catch (_) {}
    if (user && user.name) name = user.name;

    var BLOCKS = getBlocks();
    var totalScore = 0;
    var scores = {};
    var blockLines = BLOCKS.map(function (b) {
      var e = results[b.id];
      var sc = e ? e.score || 0 : 0;
      scores[b.id] = sc;
      totalScore += sc;
      var lvl = getLevelForScore(sc, 20);
      var pct = Math.round((sc / 20) * 100);
      return (
        "- " +
        b.title +
        " блогы: " +
        sc +
        "/20 балл (" +
        pct +
        "%, " +
        lvl.num +
        "-деңгей — " +
        lvl.kk +
        ")"
      );
    }).join("\n");

    var sortedBlocks = BLOCKS.slice().sort(function (a, b) {
      return (scores[b.id] || 0) - (scores[a.id] || 0);
    });
    var strongest = sortedBlocks
      .slice(0, 2)
      .map(function (b) {
        return b.title + " (" + scores[b.id] + "/20)";
      })
      .join(", ");
    var weakest = sortedBlocks
      .slice(-2)
      .reverse()
      .map(function (b) {
        return b.title + " (" + scores[b.id] + "/20)";
      })
      .join(", ");

    var overallLvl = getLevelForScore(totalScore, 100);
    var overallPct = Math.round((totalScore / 100) * 100);

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
      "\n" +
      "\n" +
      "ТЕСТ НӘТИЖЕЛЕРІ (DigComp 2.2, макс 20 балл/блок, 100 жалпы):\n" +
      blockLines +
      "\n" +
      "Жалпы: " +
      totalScore +
      "/100 балл (" +
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
      totalScore +
      "/100 нәтижесін DigComp 2.2 стандарты тұрғысынан бағала. " +
      "Бұл деңгейдің күнделікті өмірдегі практикалық мәнін 3-4 сөйлеммен түсіндір. " +
      "Осы нәтиже " +
      age +
      " жастағы " +
      edu +
      " білімді адам үшін қандай деңгейде екенін нақты айт.\n\n" +
      "📊 Блок профилі\n" +
      "Барлық 5 блокты салыстырмалы талда. Қай блоктарда үйлесімдік бар, қайсысында алшақтық бар — нақты мысалмен түсіндір. " +
      "Жалпы профиль туралы 3-4 сөйлем жаз.\n\n" +
      "💪 Күшті жақтарыңыз\n" +
      "Ең жоғары балл алған блоктарды (" +
      strongest +
      ") талда. " +
      "Осы дағдылар күнделікті өмірде қалай пайдаланылатынын 2 нақты мысалмен көрсет. " +
      "Бұл күшті жақтарды одан әрі дамытудың 1 жолын ұсын.\n\n" +
      "⚠️ Дамыту керек бағыттар\n" +
      "Ең төмен балл алған блоктарды (" +
      weakest +
      ") жан-жақты талда. " +
      "Неге бұл блоктар маңызды, осы олқылықтар күнделікті өмірде қандай тәуекел туғызады — нақты сценарий арқылы түсіндір. " +
      "Әр әлсіз блок үшін бір нақты тегін онлайн ресурс атауын жаз (мысалы: Coursera, Google Digital Garage, Kaspersky Academy, Khan Academy).\n\n" +
      "🗓️ 30 күнге оқу жоспары\n" +
      name +
      "-ға арналған НАҚТЫ апталық жоспар жаз. Тек " +
      weakest +
      " блоктарына бағытта.\n" +
      "1-7 күн: күніне нақты қанша минут, қай сайтта (атын жаз), қандай тақырып — нақты жаз.\n" +
      "8-14 күн: алдыңғы аптаға негізделген келесі қадам, нақты тапсырма мен ресурс атауы.\n" +
      "15-21 күн: практикалық жаттығу немесе өзін-өзі тексеру тапсырмасы, нақты қалай орындайды.\n" +
      "22-30 күн: нәтижені бекіту — нақты мысал немесе қолдану тапсырмасы.\n" +
      "ТАЛАП: жалпы кеңес емес — НЕ ІСТЕЙДІ, ҚАЙ РЕСУРС (атын жаз), ҚАНША УАҚЫТ — барлығы нақты болуы керек.\n\n" +
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

  function parseAI(text) {
    var sections = [
      { key: "🎯 Жалпы баға", color: "#1565c0" },
      { key: "📊 Блок профилі", color: "#0097a7" },
      { key: "💪 Күшті жақтарыңыз", color: "#1b8a4e" },
      { key: "⚠️ Дамыту керек бағыттар", color: "#e65100" },
      { key: "🗓️ 30 күнге оқу жоспары", color: "#5e35b1" },
    ];
    var html = "";
    sections.forEach(function (sec, idx) {
      var start = text.indexOf(sec.key);
      if (start === -1) return;
      var end = text.length;
      for (var ni = idx + 1; ni < sections.length; ni++) {
        var np = text.indexOf(sections[ni].key);
        if (np !== -1 && np > start) {
          end = np;
          break;
        }
      }
      var body = text.slice(start + sec.key.length, end).trim();
      var lines = body.split("\n").filter(function (l) {
        return l.trim();
      });
      var isListy = lines.some(function (l) {
        return /^[-•\d]/.test(l.trim());
      });
      var bodyHtml = isListy
        ? "<ul>" +
          lines
            .map(function (l) {
              var c = l
                .trim()
                .replace(/^[-•]\s*/, "")
                .replace(/^\d+[\.\)]\s*/, "");
              return c ? "<li>" + c + "</li>" : "";
            })
            .filter(Boolean)
            .join("") +
          "</ul>"
        : lines
            .map(function (l) {
              return "<p>" + l.trim() + "</p>";
            })
            .join("");
      html +=
        '<div class="ai-h" style="color:' +
        sec.color +
        ';margin-top:14px;margin-bottom:6px;font-weight:700;font-size:0.95rem">' +
        sec.key +
        "</div>" +
        bodyHtml;
    });
    return html || "<p>" + text.replace(/\n/g, "<br>") + "</p>";
  }

  async function runAI(results) {
    var aiBtn = document.getElementById("aiBtn");
    var resultBodyEl = document.getElementById("aiResultBody");
    if (aiBtn) aiBtn.disabled = true;
    showAIState("loading");

    try {
      var GROQ_KEY =
        typeof window !== "undefined" && window.GROQ_API_KEY
          ? window.GROQ_API_KEY
          : "";

      // Егер key жоқ болса серверден ал
      if (!GROQ_KEY) {
        try {
          var cfgResp = await fetch("/config");
          var cfg = await cfgResp.json();
          GROQ_KEY = cfg.GROQ_API_KEY || "";
        } catch (e) {}
      }

      var resp = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GROQ_KEY,
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
              { role: "user", content: buildPrompt(results) },
            ],
          }),
        },
      );

      if (!resp.ok) {
        var e = await resp.json().catch(function () {
          return {};
        });
        throw new Error(
          e.error && e.error.message
            ? e.error.message
            : "API қате: " + resp.status,
        );
      }

      showAIState("result");
      if (resultBodyEl) resultBodyEl.innerHTML = "";

      var reader = resp.body.getReader();
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
                if (resultBodyEl) resultBodyEl.innerHTML = parseAI(fullText);
              }
            } catch (_) {}
          }
        }
      }

      if (!fullText) throw new Error("Жауап бос келді");

      var finalHtml = parseAI(fullText);
      if (resultBodyEl) resultBodyEl.innerHTML = finalHtml;
      saveAIResult(finalHtml);

      var dateEl = document.getElementById("aiResultDate");
      if (dateEl)
        dateEl.textContent =
          getT("aiSaved", "Сақталған:") +
          " " +
          formatDate(new Date().toISOString());
    } catch (err) {
      var errEl = document.getElementById("aiErrorText");
      if (errEl)
        errEl.textContent =
          getT("aiError", "Қате шықты. Қайталап көріңіз.") +
          " (" +
          (err.message || "") +
          ")";
      showAIState("error");
      if (aiBtn) aiBtn.disabled = false;
    }
  }

  function init() {
    var isLoggedIn = initAuth();
    if (isLoggedIn) {
      loadAndRender();
    }
    window.__testResultsRerender = function () {
      if (isLoggedIn) {
        loadAndRender();
      }
    };
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
