(function () {
  const USER_KEY = "diq_user";
  const LEGACY_USER_KEY = "user";
  const RESULTS_KEY = "diq_block_results";

  const MAX_PER_BLOCK = 18;
  const BLOCKS = [
    {
      id: "info-search",
      name: "Ақпарат іздеу",
      shortLabel: "Ақпарат",
      color: "#0097a7",
      icon: "🔍",
    },
    {
      id: "financial-security",
      name: "Қаржылық қауіпсіздік",
      shortLabel: "Қаржы",
      color: "#f57c00",
      icon: "🛡️",
    },
    {
      id: "egov",
      name: "eGov қызметтері",
      shortLabel: "eGov",
      color: "#5e35b1",
      icon: "🏛️",
    },
    {
      id: "network-culture",
      name: "Желі мәдениеті",
      shortLabel: "Желі",
      color: "#c62828",
      icon: "💬",
    },
    {
      id: "device-care",
      name: "Құрылғыларды күту",
      shortLabel: "Құрылғы",
      color: "#2e7d32",
      icon: "⚙️",
    },
  ];

  function ensureUser() {
    try {
      const existing = localStorage.getItem(USER_KEY);
      if (existing) {
        return JSON.parse(existing);
      }
      const legacy = localStorage.getItem(LEGACY_USER_KEY);
      if (legacy) {
        const legacyUser = JSON.parse(legacy);
        const diqUser = {
          name: legacyUser.name || "",
          email: legacyUser.email || "",
          registeredDate: legacyUser.registeredDate || new Date().toISOString(),
        };
        localStorage.setItem(USER_KEY, JSON.stringify(diqUser));
        return diqUser;
      }
    } catch (_e) {}
    window.location.href = "login.html";
    return null;
  }

  function formatDate(dateStr) {
    if (!dateStr) return "--.--.----";
    try {
      const d = new Date(dateStr);
      if (Number.isNaN(d.getTime())) return "--.--.----";
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      return dd + "." + mm + "." + yyyy;
    } catch (_e) {
      return "--.--.----";
    }
  }

  function loadResults() {
    try {
      const raw = localStorage.getItem(RESULTS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_e) {
      return {};
    }
  }

  function getLevelForScore(score, maxScore) {
    var max = maxScore !== undefined ? maxScore : 18;
    var pct = max > 0 ? (score / max) * 100 : 0;
    if (pct <= 20)
      return { num: 1, kk: "Іргетас", en: "Foundation", color: "#ef5350" };
    if (pct <= 35)
      return { num: 2, kk: "Іргетас", en: "Foundation", color: "#ef5350" };
    if (pct <= 50)
      return { num: 3, kk: "Орташа", en: "Intermediate", color: "#f9a825" };
    if (pct <= 65)
      return { num: 4, kk: "Орташа", en: "Intermediate", color: "#f9a825" };
    if (pct <= 75)
      return { num: 5, kk: "Кеңейтілген", en: "Advanced", color: "#1b8a4e" };
    if (pct <= 85)
      return { num: 6, kk: "Кеңейтілген", en: "Advanced", color: "#1b8a4e" };
    if (pct <= 94)
      return {
        num: 7,
        kk: "Жоғары көрсеткіш",
        en: "Highly specialised",
        color: "#1565c0",
      };
    return {
      num: 8,
      kk: "Жоғары деңгей",
      en: "Highly specialised",
      color: "#1565c0",
    };
  }

  function levelFromScore(score) {
    return getLevelForScore(score, 18);
  }

  function levelLabel(level) {
    if (typeof level === "object") return level.kk;
    return level && level.kk ? level.kk : "Іргетас";
  }

  function levelLabelWithEmoji(level) {
    if (typeof level === "object") {
      var emojis = {
        1: "🌱",
        2: "🌱",
        3: "⚡",
        4: "⚡",
        5: "🌟",
        6: "🌟",
        7: "🏆",
        8: "🏆",
      };
      return level.kk + " " + (emojis[level.num] || "");
    }
    return "Іргетас 🌱";
  }

  function computeAggregates(results) {
    let completedCount = 0;
    let totalScore = 0;

    let bestBlockId = null;
    let bestScore = -1;
    let worstBlockId = null;
    let worstScore = Number.POSITIVE_INFINITY;
    let lastActivityDate = null;

    BLOCKS.forEach(function (block) {
      const entry = results[block.id];
      if (!entry) return;
      const score = Number(entry.score) || 0;
      const total = Number(entry.total) || MAX_PER_BLOCK;
      if (total <= 0) return;

      totalScore += score;
      completedCount += 1;

      if (score > bestScore) {
        bestScore = score;
        bestBlockId = block.id;
      }
      if (score < worstScore) {
        worstScore = score;
        worstBlockId = block.id;
      }

      if (entry.date) {
        const d = new Date(entry.date);
        if (!Number.isNaN(d.getTime())) {
          if (!lastActivityDate || d > lastActivityDate) {
            lastActivityDate = d;
          }
        }
      }
    });

    const totalMax = MAX_PER_BLOCK * BLOCKS.length;
    if (totalScore > totalMax) totalScore = totalMax;
    const avgPercent =
      totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    return {
      completedCount: completedCount,
      totalScore: totalScore,
      avgPercent: avgPercent,
      bestBlockId: bestBlockId,
      worstBlockId: completedCount > 0 ? worstBlockId : null,
      lastActivityDate: lastActivityDate,
    };
  }

  function fillHero(user, aggregates) {
    const initialsEl = document.getElementById("profileAvatarInitials");
    const nameEl = document.getElementById("profileName");
    const emailEl = document.getElementById("profileEmail");
    const regEl = document.getElementById("profileRegistered");
    const levelBadgeEl = document.getElementById("profileLevelBadge");
    const totalScoreChipEl = document.getElementById("profileTotalScoreChip");

    const name = (user && user.name) || "Пайдаланушы";
    const email = (user && user.email) || "—";

    if (initialsEl) {
      const parts = name.trim().split(/\s+/);
      let initials = "";
      if (parts.length >= 2) {
        initials = (parts[0][0] || "") + (parts[1][0] || "");
      } else if (parts.length === 1) {
        initials = (parts[0][0] || "") + (parts[0][1] || "");
      }
      initialsEl.textContent = initials.toUpperCase();
    }
    if (nameEl) nameEl.textContent = name;
    if (emailEl) emailEl.textContent = email;

    const regDateStr =
      (user && user.registeredDate) || new Date().toISOString();
    if (regEl) {
      regEl.textContent = "Тіркелген: " + formatDate(regDateStr);
    }

    const level = levelFromScore(aggregates.totalScore);
    if (levelBadgeEl) {
      levelBadgeEl.textContent = levelLabelWithEmoji(level);
      levelBadgeEl.classList.remove(
        "profile-level-badge--beginner",
        "profile-level-badge--intermediate",
        "profile-level-badge--advanced",
      );
      const lnum = level.num || 1;
      if (lnum <= 2) {
        levelBadgeEl.classList.add("profile-level-badge--beginner");
      } else if (lnum <= 4) {
        levelBadgeEl.classList.add("profile-level-badge--intermediate");
      } else {
        levelBadgeEl.classList.add("profile-level-badge--advanced");
      }
      levelBadgeEl.style.background = (level.color || "#ef5350") + "22";
      levelBadgeEl.style.color = level.color || "#ef5350";
    }

    if (totalScoreChipEl) {
      totalScoreChipEl.textContent =
        aggregates.totalScore + " / " + MAX_PER_BLOCK * BLOCKS.length + " балл";
    }
  }

  function fillStatsRow(aggregates, results) {
    const completedEl = document.getElementById("profileStatCompleted");
    const totalScoreEl = document.getElementById("profileStatTotalScore");
    const avgEl = document.getElementById("profileStatAverage");
    const bestBlockEl = document.getElementById("profileStatBestBlock");

    if (completedEl) {
      completedEl.textContent =
        aggregates.completedCount + " / " + BLOCKS.length;
    }
    if (totalScoreEl) {
      totalScoreEl.textContent =
        aggregates.totalScore + " / " + MAX_PER_BLOCK * BLOCKS.length;
    }
    if (avgEl) {
      avgEl.textContent = aggregates.avgPercent + "%";
      avgEl.classList.remove(
        "profile-avg-low",
        "profile-avg-medium",
        "profile-avg-high",
      );
      if (aggregates.avgPercent === 0) {
      } else if (aggregates.avgPercent < 40) {
        avgEl.classList.add("profile-avg-low");
      } else if (aggregates.avgPercent < 75) {
        avgEl.classList.add("profile-avg-medium");
      } else {
        avgEl.classList.add("profile-avg-high");
      }
    }
    if (bestBlockEl) {
      const block =
        BLOCKS.find(function (b) {
          return b.id === aggregates.bestBlockId;
        }) || null;
      bestBlockEl.textContent = block ? block.name : "—";
    }
  }

  function fillLevelAndAchievements(aggregates, results) {
    const levelLabelEl = document.getElementById("profileLevelLabel");
    const levelScoreLabelEl = document.getElementById("profileLevelScoreLabel");
    const progressFillEl = document.getElementById("profileLevelProgressFill");
    const levelHintEl = document.getElementById("profileLevelHint");

    const level = levelFromScore(aggregates.totalScore);
    const totalMax = MAX_PER_BLOCK * BLOCKS.length;

    if (levelLabelEl) {
      levelLabelEl.textContent = levelLabel(level);
    }
    if (levelScoreLabelEl) {
      levelScoreLabelEl.textContent =
        aggregates.totalScore + " / " + totalMax + " балл";
    }

    if (progressFillEl) {
      progressFillEl.classList.remove(
        "level-beginner",
        "level-intermediate",
        "level-advanced",
      );
      const pct = totalMax > 0 ? (aggregates.totalScore / totalMax) * 100 : 0;
      const lnum = level.num || 1;
      if (lnum <= 2) {
        progressFillEl.classList.add("level-beginner");
      } else if (lnum <= 4) {
        progressFillEl.classList.add("level-intermediate");
      } else {
        progressFillEl.classList.add("level-advanced");
      }
      progressFillEl.style.background = level.color || "#ef5350";
      progressFillEl.style.width = "0";
      setTimeout(function () {
        progressFillEl.style.width = pct.toFixed(1) + "%";
      }, 300);
    }

    if (levelHintEl) {
      if (aggregates.totalScore >= totalMax) {
        levelHintEl.textContent = "🏆 Максималды деңгей!";
      } else {
        const missing = Math.max(0, totalMax - aggregates.totalScore);
        levelHintEl.textContent =
          "Озат деңгейіне " + missing + " балл жетіспейді";
      }
    }

    const completedIds = Object.keys(results).filter(function (id) {
      const entry = results[id];
      return entry && Number(entry.score) >= 0;
    });

    document
      .querySelectorAll(".profile-achievement-badge")
      .forEach(function (badge) {
        const id = badge.getAttribute("data-block-id") || "";
        const circle = badge.querySelector(".profile-achievement-circle");
        const meta = BLOCKS.find(function (b) {
          return b.id === id;
        });
        if (!circle || !meta) return;

        const isCompleted = completedIds.indexOf(id) !== -1;
        circle.classList.remove("is-completed");
        if (isCompleted) {
          circle.classList.add("is-completed");
          circle.style.background = meta.color;
          circle.style.color = "#ffffff";
        } else {
          circle.style.background = "var(--clr-bg)";
          circle.style.color = "var(--clr-muted)";
        }
      });
  }

  function fillResults(results) {
    const container = document.getElementById("profileResultsContainer");
    if (!container) return;

    container.innerHTML = "";

    BLOCKS.forEach(function (block) {
      const entry = results[block.id];
      const row = document.createElement("div");
      row.className = "test-row";
      if (!entry) {
        row.classList.add("profile-result-row--empty");
      }
      row.dataset.blockId = block.id;

      const iconBox = document.createElement("div");
      iconBox.className = "profile-result-icon-box";
      iconBox.style.backgroundColor = block.color + "1A";
      iconBox.style.color = block.color;
      iconBox.textContent = block.icon;

      const main = document.createElement("div");
      main.className = "profile-result-main";
      const nameEl = document.createElement("div");
      nameEl.className = "profile-result-name";
      nameEl.textContent = block.name;
      const dateEl = document.createElement("div");
      dateEl.className = "profile-result-date";
      dateEl.textContent = entry ? formatDate(entry.date) : "--.--.----";
      main.appendChild(nameEl);
      main.appendChild(dateEl);

      const progressCol = document.createElement("div");
      progressCol.className = "progress-col";
      const progress = document.createElement("div");
      progress.className = "profile-result-progress";
      const progressFill = document.createElement("div");
      progressFill.className = "profile-result-progress-fill";
      progressFill.style.backgroundColor = block.color;
      progress.appendChild(progressFill);
      progressCol.appendChild(progress);

      const scoreSpan = document.createElement("span");
      scoreSpan.className = "profile-result-score";

      let scoreText = "— / " + MAX_PER_BLOCK;
      let isCompleted = false;
      let isPartial = false;

      if (entry) {
        const score = Number(entry.score) || 0;
        const total = Number(entry.total) || MAX_PER_BLOCK;
        scoreText = score + " / " + total;
        isCompleted = score >= 0;
        isPartial = score > 0 && score < total;

        const pct = total > 0 ? (score / total) * 100 : 0;
        setTimeout(function () {
          progressFill.style.width = pct.toFixed(1) + "%";
        }, 300);
      } else {
        scoreSpan.classList.add("profile-result-score--empty");
      }

      scoreSpan.textContent = scoreText;

      const btn = document.createElement("a");
      btn.href = "test.html";
      btn.className = "profile-result-btn";
      if (isCompleted || isPartial) {
        btn.textContent = "Қайталау →";
      } else {
        btn.textContent = "Тапсыру →";
      }

      row.appendChild(iconBox);
      row.appendChild(main);
      row.appendChild(progressCol);
      row.appendChild(scoreSpan);
      row.appendChild(btn);

      container.appendChild(row);
    });
  }

  function fillStatsCard(aggregates) {
    var avgEl = document.getElementById("profileStatsAvg");
    var bestEl = document.getElementById("profileStatsBestBlock");
    var worstEl = document.getElementById("profileStatsWorstBlock");
    var lastEl = document.getElementById("profileStatsLastActivity");
    var totalScoreEl = document.getElementById("profileStatsTotalScore");
    var completionEl = document.getElementById("profileStatsCompletion");

    if (avgEl) avgEl.textContent = aggregates.avgPercent + "%";

    var best = BLOCKS.find(function (b) {
      return b.id === aggregates.bestBlockId;
    });
    if (bestEl) bestEl.textContent = best ? best.name : "\u2014";

    var worst = BLOCKS.find(function (b) {
      return b.id === aggregates.worstBlockId;
    });
    if (worstEl) worstEl.textContent = worst ? worst.name : "\u2014";

    if (lastEl) {
      lastEl.textContent = aggregates.lastActivityDate
        ? formatDate(aggregates.lastActivityDate.toISOString())
        : "\u2014";
    }

    var totalMax = MAX_PER_BLOCK * BLOCKS.length;
    if (totalScoreEl)
      totalScoreEl.textContent = aggregates.totalScore + " / " + totalMax;
    if (completionEl)
      completionEl.textContent =
        aggregates.completedCount +
        " / " +
        BLOCKS.length +
        " \u0431\u043b\u043e\u043a";
  }
  function fillAiRecommendations(results, aggregates) {
    var list = document.getElementById("profileAiList");
    var footerBtn = document.querySelector(".profile-ai-button");
    if (!list) return;
    list.innerHTML = "";

    var cached = null;
    try {
      var rawAi = localStorage.getItem("diq_ai_result");
      cached = rawAi ? JSON.parse(rawAi) : null;
    } catch (_e) {}

    if (cached && cached.html) {
      var dateStr = cached.date ? formatDate(cached.date) : "";
      var header = document.createElement("div");
      header.style.cssText =
        "display:flex;align-items:center;gap:8px;margin-bottom:10px;";
      header.innerHTML =
        '<span style="font-size:1rem;">🤖</span>' +
        '<span style="font-size:0.88rem;font-weight:700;color:#1a1f36;">AI талдауы</span>' +
        (dateStr
          ? '<span style="font-size:0.75rem;color:#9ba3c9;margin-left:auto;">Сақталған: ' +
            dateStr +
            "</span>"
          : "");
      list.appendChild(header);
      var body = document.createElement("div");
      body.style.cssText = "font-size:0.85rem;color:#1a1f36;line-height:1.7;";
      body.innerHTML = cached.html;
      list.appendChild(body);
      if (footerBtn) {
        footerBtn.disabled = false;
        footerBtn.style.cssText =
          "width:100%;padding:10px 14px;border-radius:999px;border:1.5px solid #c5cae9;background:#e8eaf6;color:#3949ab;font-size:0.85rem;font-weight:600;cursor:pointer;margin-top:10px;";
        footerBtn.textContent = "🔄 Жаңа талдау алу — тест бетінде";
        footerBtn.onclick = function () {
          window.location.href = "test.html";
        };
      }
      return;
    }

    var items = [];
    var lowBlocks = BLOCKS.filter(function (b) {
      var entry = results[b.id];
      if (!entry) return false;
      return (Number(entry.score) || 0) < 9;
    });
    if (lowBlocks.length > 0) {
      items.push({
        icon: "📚",
        text: lowBlocks[0].name + " блоктын қайталауды ұсынамыз.",
      });
    }
    if (aggregates.completedCount === BLOCKS.length) {
      items.push({
        icon: "🏆",
        text: "Барлық блоктарды аяқтадыңыз! Керемет нәтиже.",
      });
    } else if (!lowBlocks.length) {
      items.push({
        icon: "📚",
        text: "Қалған блоктарды аяқтау арқылы нәтижеңізді арттыра аласыз.",
      });
    }
    items.push({
      icon: "💡",
      text: "Күн сайын жаттықсаңыз, нәтижеңіз 30%-ға артады.",
    });
    items.slice(0, 3).forEach(function (item) {
      var row = document.createElement("div");
      row.className = "profile-ai-item";
      var icon = document.createElement("div");
      icon.className = "profile-ai-item-icon";
      icon.textContent = item.icon;
      var text = document.createElement("div");
      text.className = "profile-ai-item-text";
      text.textContent = item.text;
      row.appendChild(icon);
      row.appendChild(text);
      list.appendChild(row);
    });
    if (footerBtn) {
      footerBtn.disabled = false;
      footerBtn.style.cssText =
        "width:100%;padding:10px 14px;border-radius:999px;border:1.5px solid #c5cae9;background:#e8eaf6;color:#3949ab;font-size:0.85rem;font-weight:600;cursor:pointer;margin-top:10px;";
      footerBtn.textContent = "🤖 AI талдауын алу — тест бетінде";
      footerBtn.onclick = function () {
        window.location.href = "test.html";
      };
    }
  }
  function fillActivityHistory(results) {
    var container = document.getElementById("profileActivityList");
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
      var entry = null;
      BLOCKS.forEach(function (b) {
        var e = results[b.id];
        if (e && e.date) {
          if (!entry || new Date(e.date) > new Date(entry.date)) entry = e;
        }
      });

      if (!entry) {
        container.innerHTML = "";
        var wrap = document.createElement("div");
        wrap.className = "profile-activity-empty";
        var icon = document.createElement("div");
        icon.className = "profile-activity-empty-icon";
        icon.textContent = "\u{1F550}";
        var text = document.createElement("div");
        text.textContent =
          "\u04d8\u043b\u0456 \u0431\u0435\u043b\u0441\u0435\u043d\u0434\u0456\u043b\u0456\u043a \u0436\u043e\u049b";
        wrap.appendChild(icon);
        wrap.appendChild(text);
        container.appendChild(wrap);
        return;
      }
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
        return "\u2014";
      }
    }

    function renderList(items) {
      container.innerHTML = "";

      items.forEach(function (ev) {
        var row = document.createElement("div");
        row.className = "profile-activity-row";

        var dot = document.createElement("div");
        dot.className = "profile-activity-dot";
        dot.style.backgroundColor = "#3949ab";

        var text = document.createElement("div");
        text.className = "profile-activity-text";
        var lvlText = ev.levelKk
          ? " \u2014 " +
            ev.levelNum +
            "-\u0434\u0435\u04a3\u0433\u0435\u0439, " +
            ev.levelKk
          : "";
        text.textContent =
          "\u0422\u0435\u0441\u0442 \u0442\u0430\u043f\u0441\u044b\u0440\u0434\u044b" +
          lvlText +
          " (" +
          ev.totalScore +
          "/90)";

        var date = document.createElement("div");
        date.className = "profile-activity-date";
        date.textContent = formatDateTime(ev.date);

        row.appendChild(dot);
        row.appendChild(text);
        row.appendChild(date);
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
        "\u{1F4CB} \u0422\u043e\u043b\u044b\u0493\u044b\u0440\u0430\u049b (" +
        (limited.length - showCount) +
        " \u0442\u0430\u0493\u044b)";
      var expanded = false;
      moreBtn.addEventListener("click", function () {
        if (!expanded) {
          renderList(limited);
          container.appendChild(moreBtn);
          moreBtn.textContent = "\u25b2 \u0416\u0438\u044e";
          expanded = true;
        } else {
          renderList(first5);
          container.appendChild(moreBtn);
          moreBtn.textContent =
            "\u{1F4CB} \u0422\u043e\u043b\u044b\u0493\u044b\u0440\u0430\u049b (" +
            (limited.length - showCount) +
            " \u0442\u0430\u0493\u044b)";
          expanded = false;
        }
      });
      container.appendChild(moreBtn);
    }
  }
  function initLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
      } catch (_e) {}
      window.location.href = "login.html";
    });
  }

  function initEditModal() {
    var editBtn = document.getElementById("profileEditBtn");
    var modal = document.getElementById("profileEditModal");
    var closeBtn = document.getElementById("profileEditClose");
    var form = document.getElementById("profileEditForm");
    var msgEl = document.getElementById("profileEditMsg");
    var newPassInput = document.getElementById("editNewPassword");
    var curPassWrap = document.getElementById("editCurrentPasswordWrap");

    if (!editBtn || !modal) return;

    editBtn.addEventListener("click", function () {
      var user = null;
      try {
        user = JSON.parse(
          localStorage.getItem("diq_user") ||
            localStorage.getItem("user") ||
            "{}",
        );
      } catch (_) {}
      document.getElementById("editName").value = user.name || "";
      document.getElementById("editCurrentPassword").value = "";
      document.getElementById("editNewPassword").value = "";
      document.getElementById("editConfirmPassword").value = "";
      if (msgEl) {
        msgEl.textContent = "";
        msgEl.style.color = "";
      }
      curPassWrap.style.display = "none";
      modal.style.display = "flex";
    });

    if (newPassInput) {
      newPassInput.addEventListener("input", function () {
        curPassWrap.style.display = newPassInput.value ? "block" : "none";
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        modal.style.display = "none";
      });
    }

    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.style.display = "none";
    });

    if (form) {
      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (msgEl) {
          msgEl.textContent = "";
        }

        var user = null;
        try {
          user = JSON.parse(
            localStorage.getItem("diq_user") ||
              localStorage.getItem("user") ||
              "{}",
          );
        } catch (_) {}

        var name = document.getElementById("editName").value.trim();
        var currentPassword = document.getElementById(
          "editCurrentPassword",
        ).value;
        var newPassword = document.getElementById("editNewPassword").value;
        var confirmPassword = document.getElementById(
          "editConfirmPassword",
        ).value;

        if (!name) {
          if (msgEl) {
            msgEl.textContent = "Атыңызды енгізіңіз";
            msgEl.style.color = "#e53935";
          }
          return;
        }

        if (newPassword && newPassword !== confirmPassword) {
          if (msgEl) {
            msgEl.textContent = "Жаңа құпия сөздер сәйкес келмейді";
            msgEl.style.color = "#e53935";
          }
          return;
        }

        var submitBtn = form.querySelector("button[type=submit]");
        if (submitBtn) {
          submitBtn.disabled = true;
          submitBtn.textContent = "Сақталуда...";
        }

        try {
          if (newPassword) {
            var reqBody = {
              name: name,
              currentPassword: currentPassword,
              newPassword: newPassword,
            };
            if (user.id) reqBody.id = user.id;
            else if (user.email) reqBody.email = user.email;
            var resp = await fetch("http://localhost:5000/profile", {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(reqBody),
            });
            var data = await resp.json();
            if (!data.success) {
              if (msgEl) {
                msgEl.textContent = data.message || "Қате шықты";
                msgEl.style.color = "#e53935";
              }
              if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = "Сақтау";
              }
              return;
            }
          }

          var updated = Object.assign({}, user, { name: name });
          localStorage.setItem("diq_user", JSON.stringify(updated));
          localStorage.setItem("user", JSON.stringify(updated));

          var nameEl = document.getElementById("profileName");
          if (nameEl) nameEl.textContent = name;
          var initialsEl = document.getElementById("profileAvatarInitials");
          if (initialsEl) {
            var parts = name.trim().split(/\s+/);
            initialsEl.textContent =
              parts.length >= 2
                ? (parts[0][0] + parts[1][0]).toUpperCase()
                : (name[0] + (name[1] || "")).toUpperCase();
          }

          if (msgEl) {
            msgEl.textContent = "Сәтті сақталды!";
            msgEl.style.color = "#1b8a4e";
          }
          setTimeout(function () {
            modal.style.display = "none";
          }, 1200);
        } catch (err) {
          if (msgEl) {
            msgEl.textContent = "Сервермен байланыс жоқ";
            msgEl.style.color = "#e53935";
          }
        }

        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = "Сақтау";
        }
      });
    }
  }

  function init() {
    const user = ensureUser();
    if (!user) return;

    const results = loadResults();
    const aggregates = computeAggregates(results);

    fillHero(user, aggregates);
    fillStatsRow(aggregates, results);
    fillLevelAndAchievements(aggregates, results);
    fillResults(results);
    fillStatsCard(aggregates);
    fillAiRecommendations(results, aggregates);
    fillActivityHistory(results);
    initLogout();
    initEditModal();

    if (typeof applyTranslations === "function") {
      applyTranslations();
    }
    if (typeof initLangDropdown === "function") {
      initLangDropdown();
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
