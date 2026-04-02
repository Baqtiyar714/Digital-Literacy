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
    "info-search": { title: "Ақпарат", icon: "🔍", color: "#0097a7" },
    "financial-security": {
      title: "Коммуникация",
      icon: "🛡️",
      color: "#f57c00",
    },
    egov: { title: "Контент", icon: "🏛️", color: "#5e35b1" },
    "network-culture": {
      title: "Қауіпсіздік",
      icon: "💬",
      color: "#c62828",
    },
    "device-care": {
      title: "Проблемаларды шешу",
      icon: "⚙️",
      color: "#2e7d32",
    },
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

  function getLevelFromScore(totalScore, maxScore) {
    var pct = maxScore > 0 ? (totalScore / maxScore) * 100 : 0;
    if (pct >= 67) return { num: 3, kk: "Жоғары" };
    if (pct >= 34) return { num: 2, kk: "Орташа" };
    return { num: 1, kk: "Төмен" };
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

  function renderActivity(userId) {
    var container = document.getElementById("activityList");
    if (!container) return;

    if (!userId) {
      container.innerHTML =
        '<p class="activity-empty">Әлі тест тапсырылмаған. Бастаңыз! →</p>';
      return;
    }

    container.innerHTML = '<p class="activity-empty">Жүктелуде...</p>';

    fetch("http://localhost:5000/test/history/" + userId)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var allHistory =
          data.success && Array.isArray(data.data) ? data.data : [];

        if (!allHistory.length) {
          container.innerHTML =
            '<p class="activity-empty">Әлі тест тапсырылмаған. Бастаңыз! →</p>';
          return;
        }

        function renderList(items) {
          container.innerHTML = "";
          items.forEach(function (row) {
            var totalScore = (row.total_score || 0) * 5;
            var maxScore = (row.max_score || 20) * 5;
            var lvl = getLevelFromScore(totalScore, maxScore);

            var el = document.createElement("div");
            el.className = "activity-list-item";

            var main = document.createElement("div");
            main.className = "activity-main";

            var dot = document.createElement("div");
            dot.style.cssText =
              "width:10px;height:10px;border-radius:999px;background:#3949ab;flex-shrink:0;";

            var name = document.createElement("div");
            name.className = "activity-name";
            name.textContent =
              "Тест тапсырды — " +
              lvl.num +
              "-деңгей, " +
              lvl.kk +
              " (" +
              totalScore +
              "/" +
              maxScore +
              ")";

            main.appendChild(dot);
            main.appendChild(name);

            var meta = document.createElement("div");
            meta.className = "activity-meta";

            var dateEl = document.createElement("div");
            dateEl.className = "activity-date";
            dateEl.textContent = formatDateTime(row.created_at);

            meta.appendChild(dateEl);
            el.appendChild(main);
            el.appendChild(meta);
            container.appendChild(el);
          });
        }

        var showCount = 5;
        var first5 = allHistory.slice(0, showCount);
        renderList(first5);

        if (allHistory.length > showCount) {
          var moreBtn = document.createElement("button");
          moreBtn.style.cssText =
            "margin-top:10px;width:100%;padding:8px 16px;border-radius:999px;border:1px solid #dde1f5;background:#f0f4ff;color:#3949ab;font-size:0.82rem;font-weight:600;cursor:pointer;";
          moreBtn.textContent =
            "📋 Толығырақ (" + (allHistory.length - showCount) + " тағы)";
          var expanded = false;
          moreBtn.addEventListener("click", function () {
            if (!expanded) {
              renderList(allHistory);
              container.appendChild(moreBtn);
              moreBtn.textContent = "▲ Жию";
              expanded = true;
            } else {
              renderList(first5);
              container.appendChild(moreBtn);
              moreBtn.textContent =
                "📋 Толығырақ (" + (allHistory.length - showCount) + " тағы)";
              expanded = false;
            }
          });
          container.appendChild(moreBtn);
        }
      })
      .catch(function () {
        container.innerHTML =
          '<p class="activity-empty">Деректерді жүктеу мүмкін болмады.</p>';
      });
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
        } catch (_e) {}
        window.location.href = "index.html";
      });
    }

    return true;
  }

  function renderProfileStats(userId) {
    var lastTestEl = document.getElementById("dashProfileLastTest");
    var totalScoreEl = document.getElementById("dashProfileTotalScore");
    var avgEl = document.getElementById("dashProfileAverage");
    var bestEl = document.getElementById("dashProfileBest");

    if (!userId) return;

    fetch("http://localhost:5000/test/history/" + userId)
      .then(function (res) {
        return res.json();
      })
      .then(function (data) {
        var allHistory =
          data.success && Array.isArray(data.data) ? data.data : [];

        if (!allHistory.length) {
          if (lastTestEl) lastTestEl.textContent = "—";
          if (totalScoreEl) totalScoreEl.textContent = "— / 100";
          if (avgEl) avgEl.textContent = "—";
          if (bestEl) bestEl.textContent = "—";
          return;
        }

        var allTimeBest = 0;
        allHistory.forEach(function (h) {
          var s = (h.total_score || 0) * 5;
          if (s > allTimeBest) allTimeBest = s;
        });

        var last = allHistory[0];
        var lastTotal = (last.total_score || 0) * 5;
        var lastMax = (last.max_score || 20) * 5;
        var avgPercent =
          lastMax > 0 ? Math.round((lastTotal / lastMax) * 100) : 0;

        var lastDateStr = "—";
        try {
          var d = new Date(last.created_at);
          var dd = String(d.getDate()).padStart(2, "0");
          var mm = String(d.getMonth() + 1).padStart(2, "0");
          var yyyy = d.getFullYear();
          lastDateStr = dd + "." + mm + "." + yyyy;
        } catch (_e) {}

        if (lastTestEl) lastTestEl.textContent = lastDateStr;
        if (totalScoreEl)
          totalScoreEl.textContent = lastTotal + " / " + lastMax;
        if (avgEl) avgEl.textContent = avgPercent + "%";
        if (bestEl)
          bestEl.textContent = allTimeBest > 0 ? allTimeBest + " балл" : "—";
      })
      .catch(function () {});
  }

  function fixLegacyMaxScore() {
    try {
      var raw = localStorage.getItem("diq_test_history");
      if (!raw) return;
      var hist = JSON.parse(raw);
      if (!Array.isArray(hist)) return;
      var changed = false;
      hist.forEach(function (h) {
        if (h.maxScore && h.maxScore !== 100) {
          h.maxScore = 100;
          changed = true;
        }
      });
      if (changed)
        localStorage.setItem("diq_test_history", JSON.stringify(hist));
    } catch (_) {}
  }

  function init() {
    if (!initAuthAndName()) return;

    var userId = null;
    try {
      var userRaw =
        localStorage.getItem("diq_user") || localStorage.getItem("user");
      if (userRaw) {
        var u = JSON.parse(userRaw);
        userId = u && u.id ? u.id : null;
      }
    } catch (_e) {}

    var results = loadResults();
    var aggregates = computeAggregates(results);

    renderStats(aggregates);
    renderProfileStats(userId);
    renderOverallProgress(aggregates, results);
    renderMotivation(aggregates);
    renderActivity(userId);
    initAccordion();
    initDigcompAccordion();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
