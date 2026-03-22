(function () {
  var RESULTS_KEY = "diq_block_results";
  var MAX_PER_BLOCK = 18;
  var BLOCK_IDS = [
    "info-search",
    "financial-security",
    "egov",
    "network-culture",
    "device-care",
  ];
  var TOTAL_BLOCKS = BLOCK_IDS.length;
  var TOTAL_MAX = MAX_PER_BLOCK * TOTAL_BLOCKS;

  var BLOCK_META = {
    "info-search": { title: "Ақпарат іздеу", icon: "🔍", color: "#0097a7" },
    "financial-security": {
      title: "Қаржылық қауіпсіздік",
      icon: "🛡️",
      color: "#f57c00",
    },
    egov: { title: "eGov қызметтері", icon: "🏛️", color: "#5e35b1" },
    "network-culture": {
      title: "Желі мәдениеті",
      icon: "💬",
      color: "#c62828",
    },
    "device-care": { title: "Құрылғыларды күту", icon: "⚙️", color: "#2e7d32" },
  };

  function loadResults() {
    try {
      var raw = localStorage.getItem(RESULTS_KEY);
      if (!raw) return {};
      var parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_e) {
      return {};
    }
  }

  function computeAggregates(results) {
    var completedCount = 0;
    var totalScore = 0;

    BLOCK_IDS.forEach(function (id) {
      var entry = results[id];
      if (!entry) return;
      var score = Number(entry.score) || 0;
      var total = Number(entry.total) || MAX_PER_BLOCK;
      if (total <= 0) return;

      totalScore += score;
      if (score >= 0) {
        completedCount += 1;
      }
    });

    if (completedCount > TOTAL_BLOCKS) completedCount = TOTAL_BLOCKS;
    if (totalScore > TOTAL_MAX) totalScore = TOTAL_MAX;

    var avgPercent = 0;
    if (TOTAL_MAX > 0) {
      avgPercent = Math.round((totalScore / TOTAL_MAX) * 100);
    }

    return {
      completedCount: completedCount,
      totalScore: totalScore,
      avgPercent: avgPercent,
    };
  }

  function levelFromScore(score) {
    if (score <= 8) return "beginner";
    if (score <= 17) return "intermediate";
    return "advanced";
  }

  function levelLabel(level) {
    if (level === "intermediate") return "Орташа";
    if (level === "advanced") return "Озат";
    return "Бастаушы";
  }

  function levelLabelWithEmoji(level) {
    if (level === "intermediate") return "Орташа ⚡";
    if (level === "advanced") return "Озат 🏆";
    return "Бастаушы 🌱";
  }

  function renderStats(aggregates) {
    var completedText = aggregates.completedCount + " / " + TOTAL_BLOCKS;
    var totalScoreText = aggregates.totalScore + " / " + TOTAL_MAX;
    var avgText = aggregates.avgPercent + "%";
    var level = levelFromScore(aggregates.totalScore);

    var completedEl = document.getElementById("statsCompleted");
    var totalScoreEl = document.getElementById("statsTotalScore");
    var avgEl = document.getElementById("statsAverage");
    var levelEl = document.getElementById("statsLevel");
    var welcomeLevelEl = document.getElementById("welcomeLevelBadge");

    if (completedEl) completedEl.textContent = completedText;
    if (totalScoreEl) totalScoreEl.textContent = totalScoreText;
    if (avgEl) avgEl.textContent = avgText;
    if (levelEl) levelEl.textContent = levelLabel(level);
    if (welcomeLevelEl) welcomeLevelEl.textContent = levelLabelWithEmoji(level);
  }

  function renderOverallProgress(aggregates, results) {
    var progressFill = document.getElementById("overallProgressFill");
    var blocksText = document.getElementById("overallBlocksText");
    var dotsContainer = document.getElementById("overallDots");

    if (blocksText) {
      blocksText.textContent =
        aggregates.completedCount + " / " + TOTAL_BLOCKS + " блок аяқталды";
    }

    if (progressFill) {
      progressFill.style.width = "0";
      setTimeout(function () {
        var width = (aggregates.completedCount / TOTAL_BLOCKS) * 100;
        progressFill.style.width = width.toFixed(1) + "%";
      }, 300);
    }

    if (dotsContainer) {
      var dots = dotsContainer.querySelectorAll(".progress-dot");
      dots.forEach(function (dot) {
        var id = dot.getAttribute("data-block-id") || "";
        var isCompleted = !!results[id];
        if (isCompleted) {
          dot.classList.add("is-completed");
        } else {
          dot.classList.remove("is-completed");
        }
      });
    }
  }

  function renderMotivation(aggregates) {
    var textEl = document.getElementById("motivationText");
    if (!textEl) return;

    var completed = aggregates.completedCount;
    var score = aggregates.totalScore;
    var message =
      "🚀 Бастайық! Алғашқы тестті тапсырып, деңгейіңізді анықтаңыз.";

    if (completed === 0) {
      message = "🚀 Бастайық! Алғашқы тестті тапсырып, деңгейіңізді анықтаңыз.";
    } else if (completed <= 2) {
      message =
        "💪 Жақсы бастама! Жалғастырыңыз — тағы бірнеше блок сізді күтіп тұр.";
    } else if (completed <= 4) {
      var missing = 18 - score;
      if (missing < 0) missing = 0;
      if (missing === 0) {
        message =
          "🔥 Озат деңгейіне өте жақынсыз! Тағы бір блокты аяқтап көріңіз.";
      } else {
        message = "🔥 Озатқа аз қалды! " + missing + " балл жетіспейді.";
      }
    } else if (completed >= TOTAL_BLOCKS) {
      message = "🏆 Керемет! Барлық тесттерді аяқтадыңыз.";
    }

    textEl.textContent = message;
  }

  function renderActivity(results) {
    var container = document.getElementById("activityList");
    if (!container) return;

    var HISTORY_KEY = "diq_test_history";
    var allHistory = [];
    try {
      var raw = localStorage.getItem(HISTORY_KEY);
      allHistory = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(allHistory)) allHistory = [];
    } catch (_e) {
      allHistory = [];
    }

    if (!allHistory.length) {
      container.innerHTML =
        '<p class="activity-empty">Әлі тест тапсырылмаған. Бастаңыз! →</p>';
      return;
    }

    function formatDateTime(iso) {
      try {
        var d = new Date(iso);
        var dd = String(d.getDate()).padStart(2, "0");
        var mm = String(d.getMonth() + 1).padStart(2, "0");
        var yyyy = d.getFullYear();
        var hh = String(d.getHours()).padStart(2, "0");
        var min = String(d.getMinutes()).padStart(2, "0");
        return dd + "." + mm + "." + yyyy + " " + hh + ":" + min;
      } catch (_e) {
        return "—";
      }
    }

    function renderList(items) {
      container.innerHTML = "";
      items.forEach(function (ev) {
        var row = document.createElement("div");
        row.className = "activity-list-item";

        var main = document.createElement("div");
        main.className = "activity-main";

        var dot = document.createElement("div");
        dot.style.cssText =
          "width:10px;height:10px;border-radius:999px;background:#3949ab;flex-shrink:0;";

        var name = document.createElement("div");
        name.className = "activity-name";
        var lvlText = ev.levelKk
          ? " — " + ev.levelNum + "-деңгей, " + ev.levelKk
          : "";
        name.textContent =
          "Тест тапсырды" + lvlText + " (" + ev.totalScore + "/90)";

        main.appendChild(dot);
        main.appendChild(name);

        var meta = document.createElement("div");
        meta.className = "activity-meta";

        var dateEl = document.createElement("div");
        dateEl.className = "activity-date";
        dateEl.textContent = formatDateTime(ev.date);

        meta.appendChild(dateEl);
        row.appendChild(main);
        row.appendChild(meta);
        container.appendChild(row);
      });
    }

    var showCount = 5;
    var maxCount = 20;
    var limited = allHistory.slice(0, maxCount);
    var first5 = limited.slice(0, showCount);

    renderList(first5);

    if (limited.length > showCount) {
      var moreBtn = document.createElement("button");
      moreBtn.style.cssText =
        "margin-top:10px;width:100%;padding:8px 16px;border-radius:999px;border:1px solid #dde1f5;background:#f0f4ff;color:#3949ab;font-size:0.82rem;font-weight:600;cursor:pointer;";
      moreBtn.textContent =
        "📋 Толығырақ (" + (limited.length - showCount) + " тағы)";
      var expanded = false;
      moreBtn.addEventListener("click", function () {
        if (!expanded) {
          renderList(limited);
          container.appendChild(moreBtn);
          moreBtn.textContent = "▲ Жию";
          expanded = true;
        } else {
          renderList(first5);
          container.appendChild(moreBtn);
          moreBtn.textContent =
            "📋 Толығырақ (" + (limited.length - showCount) + " тағы)";
          expanded = false;
        }
      });
      container.appendChild(moreBtn);
    }
  }
  function initAccordion() {
    var cards = Array.prototype.slice.call(
      document.querySelectorAll(".literacy-card"),
    );
    if (!cards.length) return;

    function closeCard(card) {
      card.classList.remove("is-open");
      var body = card.querySelector(".literacy-card__body");
      if (body) {
        body.style.maxHeight = "0px";
      }
    }

    function openCard(card) {
      card.classList.add("is-open");
      var body = card.querySelector(".literacy-card__body");
      if (body) {
        body.style.maxHeight = body.scrollHeight + "px";
      }
    }

    cards.forEach(function (card) {
      var header = card.querySelector(".literacy-card__header");
      var body = card.querySelector(".literacy-card__body");
      if (!header || !body) return;

      body.style.maxHeight = "0px";

      header.addEventListener("click", function () {
        var isOpen = card.classList.contains("is-open");

        cards.forEach(function (c) {
          if (c !== card) closeCard(c);
        });

        if (isOpen) {
          closeCard(card);
        } else {
          openCard(card);
        }
      });
    });
  }

  function initDigcompAccordion() {
    var root = document.getElementById("digcompAccordion");
    if (!root) return;

    var items = Array.prototype.slice.call(
      root.querySelectorAll(".digcomp-item"),
    );
    if (!items.length) return;

    function closeItem(item) {
      item.classList.remove("digcomp-item--active");
      var body = item.querySelector(".digcomp-body");
      var icon = item.querySelector(".digcomp-toggle-icon");
      if (body) body.style.maxHeight = "0px";
      if (icon) icon.textContent = "+";
    }

    function openItem(item) {
      var color = item.getAttribute("data-color") || "#3949ab";
      items.forEach(function (it) {
        if (it !== item) closeItem(it);
      });
      item.classList.add("digcomp-item--active");
      item.style.setProperty("--dc-color-active", color);
      var body = item.querySelector(".digcomp-body");
      var icon = item.querySelector(".digcomp-toggle-icon");
      if (body) body.style.maxHeight = body.scrollHeight + "px";
      if (icon) icon.textContent = "−";
    }

    items.forEach(function (item, index) {
      var header = item.querySelector(".digcomp-header");
      var body = item.querySelector(".digcomp-body");
      var icon = item.querySelector(".digcomp-toggle-icon");
      if (!header || !body || !icon) return;

      body.style.maxHeight = "0px";

      header.addEventListener("click", function () {
        var isActive = item.classList.contains("digcomp-item--active");
        if (isActive) {
          closeItem(item);
        } else {
          openItem(item);
        }
      });
      if (index === 0) {
        openItem(item);
      }
    });
  }

  function initAuthAndName() {
    try {
      var userStr =
        localStorage.getItem("diq_user") || localStorage.getItem("user");
      if (!userStr) {
        window.location.href = "index.html";
        return false;
      }
      var user = JSON.parse(userStr);
      var nameEl = document.getElementById("userName");
      if (nameEl && user && user.name) {
        nameEl.textContent = user.name;
      }
    } catch (_e) {}

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        try {
          localStorage.removeItem("user");
        } catch (_e) {
          /* ignore */
        }
        window.location.href = "index.html";
      });
    }

    return true;
  }

  function init() {
    if (!initAuthAndName()) return;

    var results = loadResults();
    var aggregates = computeAggregates(results);

    renderStats(aggregates);
    renderOverallProgress(aggregates, results);
    renderMotivation(aggregates);
    renderActivity(results);
    initAccordion();
    initDigcompAccordion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
