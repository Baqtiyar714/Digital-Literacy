(function () {
  "use strict";

  var RESULTS_KEY = "diq_block_results";
  var HISTORY_KEY = "diq_test_history";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";

  // var GROQ_API_KEY = "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";

  var BLOCKS = [
    {
      id: "info-search",
      title: "Ақпарат іздеу",
      color: "#0097a7",
      icon: "🔍",
      desc: "Интернеттен дұрыс ақпарат табу және бағалау",
    },
    {
      id: "financial-security",
      title: "Қаржылық қауіпсіздік",
      color: "#f57c00",
      icon: "🛡️",
      desc: "Онлайн алаяқтық пен тәуекелдерден қорғану",
    },
    {
      id: "egov",
      title: "eGov қызметтері",
      color: "#5e35b1",
      icon: "🏛️",
      desc: "Мемлекеттік порталдар мен ЭЦҚ пайдалану",
    },
    {
      id: "network-culture",
      title: "Желі мәдениеті",
      color: "#c62828",
      icon: "💬",
      desc: "Желідегі мінез-құлық нормалары мен этика",
    },
    {
      id: "device-care",
      title: "Құрылғыларды күту",
      color: "#2e7d32",
      icon: "⚙️",
      desc: "Гаджеттерді дұрыс пайдалану және қорғау",
    },
  ];

  var LEVEL_DESCS = {
    1: "Қарапайым жағдайларды көмекпен шешесіз.",
    2: "Қарапайым жағдайларды өздігіңізбен шешесіз.",
    3: "Тікелей жағдайларды өздігіңізбен шешесіз.",
    4: "Болжанбайтын жағдайларды тәуелсіз шешесіз.",
    5: "Шешімдер тауып, басқаларға қолдау көрсетесіз.",
    6: "Күрделі жағдайларда шешімдер жасайсыз.",
    7: "Ең күрделі жағдайларда шешімдер жасайсыз.",
    8: "Жоғары мамандандырылған деңгейде жұмыс жасайсыз.",
  };

  function getLevelForScore(score, maxScore) {
    var max = maxScore !== undefined ? maxScore : 18;
    var pct = max > 0 ? (score / max) * 100 : 0;
    if (pct <= 20) return { num: 1, kk: "Іргетас", color: "#ef5350" };
    if (pct <= 35) return { num: 2, kk: "Іргетас", color: "#ef5350" };
    if (pct <= 50) return { num: 3, kk: "Орташа", color: "#f9a825" };
    if (pct <= 65) return { num: 4, kk: "Орташа", color: "#f9a825" };
    if (pct <= 75) return { num: 5, kk: "Кеңейтілген", color: "#1b8a4e" };
    if (pct <= 85) return { num: 6, kk: "Кеңейтілген", color: "#1b8a4e" };
    if (pct <= 94)
      return { num: 7, kk: "Жоғары мамандандырылған", color: "#1565c0" };
    return { num: 8, kk: "Жоғары мамандандырылған", color: "#1565c0" };
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

  function renderResults() {
    var overallCard = document.getElementById("overallCard");
    var blockRows = document.getElementById("blockRows");
    if (!overallCard || !blockRows) return;

    var raw, results;
    try {
      raw = localStorage.getItem(RESULTS_KEY);
      results = raw ? JSON.parse(raw) : {};
    } catch (_) {
      results = {};
    }

    var completed = 0,
      totalScore = 0,
      lastDate = null;
    BLOCKS.forEach(function (b) {
      var e = results[b.id];
      if (e) {
        completed++;
        totalScore += e.score || 0;
        var d = e.date ? new Date(e.date) : null;
        if (d && (!lastDate || d > lastDate)) lastDate = d;
      }
    });

    if (completed === 0) {
      overallCard.innerHTML =
        '<div class="tr-empty"><div class="tr-empty__icon">📋</div><div class="tr-empty__title">Әлі тест тапсырылмаған</div><div class="tr-empty__desc">Жоғарыдағы батырманы басып тестті бастаңыз</div><a href="quiz.html" class="tr-empty__btn">→ Сынақты бастау</a></div>';
      blockRows.innerHTML = "";
      var aiBtn = document.getElementById("aiBtn");
      if (aiBtn) {
        aiBtn.disabled = true;
        aiBtn.title = "Алдымен тест тапсырыңыз";
      }
      return;
    }

    var overallLvl = getLevelForScore(totalScore);
    var segHtml = "";
    for (var i = 1; i <= 8; i++) {
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
      '<div class="tr-overall__left"><div class="tr-overall__label">Жалпы балл</div>' +
      '<div class="tr-overall__score">' +
      totalScore +
      "<span> / 90</span></div>" +
      '<div class="tr-overall__level" style="color:' +
      overallLvl.color +
      '">' +
      overallLvl.num +
      "-деңгей · " +
      overallLvl.kk +
      "</div></div>" +
      '<div class="tr-overall__right"><div class="tr-segs">' +
      segHtml +
      "</div>" +
      '<div class="tr-overall__date">' +
      (lastDate ? formatDate(lastDate.toISOString()) : "—") +
      "</div>" +
      '<div style="font-size:.78rem;color:#9ba3c9">' +
      completed +
      " / 5 блок аяқталды</div></div></div>";

    blockRows.innerHTML = "";
    BLOCKS.forEach(function (block) {
      var entry = results[block.id];
      var score = entry ? entry.score || 0 : null;
      var lvl = score !== null ? getLevelForScore(score) : null;
      var wrap = document.createElement("div");
      wrap.className = "tr-block-wrap";
      var bSegHtml = "";
      for (var n = 1; n <= 8; n++) {
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
            lvl.num +
            "-деңгей · " +
            lvl.kk +
            '</div><div class="tr-block__score">' +
            score +
            " / 18 балл</div>"
          : '<div class="tr-block__score" style="color:#9ba3c9">Тапсырылмаған</div>') +
        "</div></div>" +
        '<div class="tr-block-detail">' +
        (lvl
          ? (LEVEL_DESCS[lvl.num] || "") +
            ' <span style="color:' +
            block.color +
            ';font-weight:600">' +
            block.desc +
            "</span>"
          : 'Бұл блокты тапсыру үшін жоғарыдағы "Сынақты бастау" батырмасын басыңыз.') +
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

  function initAI() {
    var aiBtn = document.getElementById("aiBtn");
    var aiRetryBtn = document.getElementById("aiRetryBtn");
    var aiErrorRetry = document.getElementById("aiErrorRetryBtn");
    if (aiBtn) aiBtn.addEventListener("click", runAI);
    if (aiRetryBtn) aiRetryBtn.addEventListener("click", runAI);
    if (aiErrorRetry) aiErrorRetry.addEventListener("click", runAI);

    var cached = loadAIResult();
    if (cached && cached.html) {
      var resultBodyEl = document.getElementById("aiResultBody");
      if (resultBodyEl) resultBodyEl.innerHTML = cached.html;

      var footer = document.querySelector(".tr-ai__result-footer");
      if (footer && cached.date) {
        var dateStr = formatDate(cached.date);
        var dateEl = document.createElement("div");
        dateEl.style.cssText = "font-size:.75rem;color:#9ba3c9;margin-top:6px;";
        dateEl.textContent = "Сақталған: " + dateStr;
        footer.appendChild(dateEl);
      }
      showAIState("result");
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
    var user = null;
    try {
      var raw =
        localStorage.getItem(USER_KEY) || localStorage.getItem(LEGACY_KEY);
      user = raw ? JSON.parse(raw) : null;
    } catch (_) {}
    var field = "белгісіз",
      age = "белгісіз",
      edu = "белгісіз",
      name = "Пайдаланушы";
    try {
      var hist = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      if (hist.length && hist[0].userInfo) {
        var ui = hist[0].userInfo;
        name = ui.name || name;
        age = ui.age || age;
        edu = ui.education || edu;
        field = ui.field || field;
      }
    } catch (_) {}
    if (user && user.name) name = user.name;

    var totalScore = 0;
    var blockLines = BLOCKS.map(function (b) {
      var e = results[b.id];
      var sc = e ? e.score || 0 : 0;
      totalScore += sc;
      var lvl = getLevelForScore(sc);
      return (
        "- " +
        b.title +
        ": " +
        sc +
        "/18 балл (" +
        lvl.num +
        "-деңгей, " +
        lvl.kk +
        ")"
      );
    }).join("\n");
    var overallLvl = getLevelForScore(totalScore);

    return (
      "Сен цифрлық сауаттылық бойынша кәсіби кеңесшісің. Тек қазақ тілінде жауап бер.\n\n" +
      "Пайдаланушы: " +
      name +
      ", жасы: " +
      age +
      ", білімі: " +
      edu +
      ", саласы: " +
      field +
      "\n\n" +
      "DigComp тест нәтижелері (макс 18 балл/блок, 90 жалпы):\n" +
      blockLines +
      "\n" +
      "Жалпы: " +
      totalScore +
      "/90 — " +
      overallLvl.num +
      "-деңгей, " +
      overallLvl.kk +
      "\n\n" +
      "4 бөлімнен тұратын жеке талдау жаз:\n\n" +
      "🎯 Жалпы баға\n(2-3 сөйлем, " +
      field +
      " саласы үшін баға)\n\n" +
      "💪 Күшті жақтарыңыз\n(жоғары балл алған блоктар, мамандыққа байланыстыра, 2-3 тармақ)\n\n" +
      "📚 Дамыту керек бағыттар\n(нашар блоктар, " +
      field +
      " мамандығына арналған мысалдармен, 3 тармақ)\n\n" +
      "🗓️ 30 күнге оқу жоспары\n(4-5 нақты қадам, ресурс атауларымен)\n\n" +
      "Маңызды: тек қазақ тілінде, ** немесе ## таңбалар жоқ, нақты және мотивациялық болсын."
    );
  }

  function parseAI(text) {
    var sections = [
      { key: "🎯 Жалпы баға", color: "#1565c0" },
      { key: "💪 Күшті жақтарыңыз", color: "#1b8a4e" },
      { key: "📚 Дамыту керек бағыттар", color: "#f57c00" },
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
        return /^[-•]/.test(l.trim());
      });
      var bodyHtml = isListy
        ? "<ul>" +
          lines
            .map(function (l) {
              var c = l.trim().replace(/^[-•]\s*/, "");
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
        '">' +
        sec.key +
        "</div>" +
        bodyHtml;
    });
    return html || "<p>" + text.replace(/\n/g, "<br>") + "</p>";
  }

  async function runAI() {
    var raw, results;
    try {
      raw = localStorage.getItem(RESULTS_KEY);
      results = raw ? JSON.parse(raw) : {};
    } catch (_) {
      results = {};
    }

    var aiBtn = document.getElementById("aiBtn");
    if (aiBtn) aiBtn.disabled = true;
    showAIState("loading");

    try {
      var resp = await fetch(
        "https://api.groq.com/openai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + GROQ_API_KEY,
          },
          body: JSON.stringify({
            model: "llama-3.3-70b-versatile",
            max_tokens: 1024,
            messages: [{ role: "user", content: buildPrompt(results) }],
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

      var data = await resp.json();
      var text =
        data.choices &&
        data.choices[0] &&
        data.choices[0].message &&
        data.choices[0].message.content
          ? data.choices[0].message.content
          : "";
      if (!text) throw new Error("Жауап бос келді");

      var parsedHtml = parseAI(text);
      document.getElementById("aiResultBody").innerHTML = parsedHtml;
      saveAIResult(parsedHtml);
      showAIState("result");
    } catch (err) {
      var errEl = document.getElementById("aiErrorText");
      if (errEl)
        errEl.textContent = "Қате: " + (err.message || "Белгісіз қате");
      showAIState("error");
      if (aiBtn) aiBtn.disabled = false;
    }
  }

  function init() {
    if (!initAuth()) return;
    renderResults();
    initAI();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
