(function () {
  const USER_KEY = "diq_user";
  const LEGACY_USER_KEY = "user";
  const RESULTS_KEY = "diq_block_results";

  const MAX_PER_BLOCK = 5;
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
    const avgEl = document.getElementById("profileStatsAvg");
    const bestEl = document.getElementById("profileStatsBestBlock");
    const worstEl = document.getElementById("profileStatsWorstBlock");
    const lastEl = document.getElementById("profileStatsLastActivity");
    const totalScoreEl = document.getElementById("profileStatsTotalScore");
    const completionEl = document.getElementById("profileStatsCompletion");

    if (avgEl) avgEl.textContent = aggregates.avgPercent + "%";

    const best = BLOCKS.find(function (b) {
      return b.id === aggregates.bestBlockId;
    });
    if (bestEl) bestEl.textContent = best ? best.name : "—";

    const worst = BLOCKS.find(function (b) {
      return b.id === aggregates.worstBlockId;
    });
    if (worstEl) worstEl.textContent = worst ? worst.name : "—";

    if (lastEl) {
      lastEl.textContent = aggregates.lastActivityDate
        ? formatDate(aggregates.lastActivityDate.toISOString())
        : "—";
    }

    if (totalScoreEl) {
      totalScoreEl.textContent =
        aggregates.totalScore + " / " + MAX_PER_BLOCK * BLOCKS.length;
    }

    if (completionEl) {
      completionEl.textContent =
        aggregates.completedCount + " / " + BLOCKS.length + " блок";
    }
  }

  function fillAiRecommendations(results, aggregates) {
    const list = document.getElementById("profileAiList");
    if (!list) return;

    list.innerHTML = "";

    const items = [];

    const lowBlocks = BLOCKS.filter(function (b) {
      const entry = results[b.id];
      if (!entry) return false;
      const score = Number(entry.score) || 0;
      return score < 3;
    });

    if (lowBlocks.length > 0) {
      const target = lowBlocks[0];
      items.push({
        icon: "📚",
        text: target.name + " блогын қайталауды ұсынамыз.",
      });
    }

    const allCompleted = aggregates.completedCount === BLOCKS.length;
    if (allCompleted) {
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
      const row = document.createElement("div");
      row.className = "profile-ai-item";

      const icon = document.createElement("div");
      icon.className = "profile-ai-item-icon";
      icon.textContent = item.icon;

      const text = document.createElement("div");
      text.className = "profile-ai-item-text";
      text.textContent = item.text;

      row.appendChild(icon);
      row.appendChild(text);
      list.appendChild(row);
    });
  }

  function fillActivityHistory(results) {
    const container = document.getElementById("profileActivityList");
    if (!container) return;

    const events = [];

    BLOCKS.forEach(function (block) {
      const entry = results[block.id];
      if (!entry) return;
      const date = entry.date ? new Date(entry.date) : null;
      if (!date || Number.isNaN(date.getTime())) return;
      events.push({
        blockId: block.id,
        blockName: block.name,
        color: block.color,
        date: date,
        action: "Тест тапсырды",
      });
    });

    events.sort(function (a, b) {
      return b.date.getTime() - a.date.getTime();
    });

    const lastFive = events.slice(0, 5);

    if (!lastFive.length) {
      container.innerHTML = "";
      const wrap = document.createElement("div");
      wrap.className = "profile-activity-empty";
      const icon = document.createElement("div");
      icon.className = "profile-activity-empty-icon";
      icon.textContent = "🕒";
      const text = document.createElement("div");
      text.textContent = "Әлі белсенділік жоқ";
      wrap.appendChild(icon);
      wrap.appendChild(text);
      container.appendChild(wrap);
      return;
    }

    container.innerHTML = "";
    lastFive.forEach(function (ev) {
      const row = document.createElement("div");
      row.className = "profile-activity-row";

      const dot = document.createElement("div");
      dot.className = "profile-activity-dot";
      dot.style.backgroundColor = ev.color;

      const text = document.createElement("div");
      text.className = "profile-activity-text";
      text.textContent = ev.blockName + " — " + ev.action;

      const date = document.createElement("div");
      date.className = "profile-activity-date";
      date.textContent = formatDate(ev.date.toISOString());

      row.appendChild(dot);
      row.appendChild(text);
      row.appendChild(date);
      container.appendChild(row);
    });
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
