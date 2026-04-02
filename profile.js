// profile.js — Профиль беті логикасы
// Пайдаланушы деректерін, тест нәтижелерін,
// AI ұсыныстарын және белсенділік тарихын көрсетеді

(function () {
  // localStorage кілттері ---
  // diq_user — ағымдағы пайдаланушы деректері
  // user — ескі форматтағы пайдаланушы деректері (legacy)
  // diq_block_results — блок бойынша тест нәтижелері
  const USER_KEY = "diq_user";
  const LEGACY_USER_KEY = "user";
  const RESULTS_KEY = "diq_block_results";

  // Константалар мен блоктар анықтамасы ---
  // MAX_PER_BLOCK — әр блоктың максималды баллы (20)
  // BLOCKS — 5 компетенция блогының ID, атауы, түсі және иконасы
  const MAX_PER_BLOCK = 20;
  const BLOCKS = [
    {
      id: "information",
      name: "Ақпарат",
      shortLabel: "Ақпарат",
      color: "#0097a7",
      icon: "📚",
    },
    {
      id: "communication",
      name: "Коммуникация",
      shortLabel: "Коммуникация",
      color: "#f57c00",
      icon: "🤝",
    },
    {
      id: "content",
      name: "Контент",
      shortLabel: "Контент",
      color: "#5e35b1",
      icon: "✏️",
    },
    {
      id: "safety",
      name: "Қауіпсіздік",
      shortLabel: "Қауіпсіздік",
      color: "#c62828",
      icon: "🛡️",
    },
    {
      id: "problem",
      name: "Проблемаларды шешу",
      shortLabel: "Проблема",
      color: "#2e7d32",
      icon: "💡",
    },
  ];

  // Пайдаланушыны тексеру ---
  // localStorage-ден diq_user немесе ескі "user" кілтін оқиды
  // Ескі форматты жаңа форматқа түрлендіреді
  // Пайдаланушы жоқ болса — login.html бетіне бағыттайды
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

  //  Күн форматтауы ---
  // ISO форматтағы күнді ДД.АА.ЖЖЖЖ форматына айналдырады
  // Жарамсыз күн болса "--.--.----" қайтарады
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

  //  Нәтижелерді localStorage-ден оқу ---
  // diq_block_results кілтінен блок нәтижелерін алады
  // Жазба жоқ болса немесе қате болса бос объект қайтарады
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

  //  Балл бойынша деңгей анықтау ---
  // Пайызды есептеп 3 деңгейден біреуін қайтарады:
  // Төмен (0-33%), Орташа (34-66%), Жоғары (67-100%)
  function getLevelForScore(score, maxScore) {
    var max = maxScore !== undefined ? maxScore : 20;
    var pct = max > 0 ? (score / max) * 100 : 0;
    if (pct < 34) return { num: 1, kk: "Төмен", color: "#ef5350" };
    if (pct < 67) return { num: 2, kk: "Орташа", color: "#f9a825" };
    return { num: 3, kk: "Жоғары", color: "#1b8a4e" };
  }

  //  Жалпы балл бойынша деңгей ---
  // Жалпы максималды балл = MAX_PER_BLOCK × BLOCKS саны = 20 × 5 = 100
  function levelFromScore(score) {
    return getLevelForScore(score, MAX_PER_BLOCK * BLOCKS.length);
  }

  //  Деңгей белгісін шығару функциялары ---
  // levelLabel() — тек мәтін қайтарады (Төмен/Орташа/Жоғары)
  // levelLabelWithEmoji() — мәтін + эмодзи қайтарады
  function levelLabel(level) {
    if (typeof level === "object") return level.kk;
    return level && level.kk ? level.kk : "Іргетас";
  }

  function levelLabelWithEmoji(level) {
    if (typeof level === "object") {
      var emojis = { 1: "📉", 2: "⚡", 3: "🏆" };
      return level.kk + " " + (emojis[level.num] || "");
    }
    return "Төмен 📉";
  }

  //  Жалпы статистикаларды есептеу ---
  // Барлық блоктардың нәтижелерін қорытындылайды:
  // completedCount — аяқталған блоктар саны
  // totalScore — жалпы балл, bestBlockId — ең жоғары блок
  // worstBlockId — ең төмен блок, lastActivityDate — соңғы белсенділік
  // diq_test_history-дан allTimeBest (ең жоғары балл) алады
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
          if (!lastActivityDate || d > lastActivityDate) lastActivityDate = d;
        }
      }
    });

    const totalMax = MAX_PER_BLOCK * BLOCKS.length;
    if (totalScore > totalMax) totalScore = totalMax;
    const avgPercent =
      totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;

    const lastTest = results._lastTest || null;
    const lastTotal = lastTest ? lastTest.total || 0 : 0;
    const lastMaxScore = lastTest ? lastTest.maxScore || 100 : 100;
    const lastDate = lastTest ? lastTest.date : null;

    let lastDateFormatted = "—";
    if (lastDate) {
      try {
        const d = new Date(lastDate);
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, "0");
        const min = String(d.getMinutes()).padStart(2, "0");
        lastDateFormatted = dd + "." + mm + "." + yyyy + " " + hh + ":" + min;
      } catch (_) {}
    }

    const HISTORY_KEY = "diq_test_history";
    let allTimeBest = 0;
    try {
      const raw = localStorage.getItem(HISTORY_KEY);
      const hist = raw ? JSON.parse(raw) : [];
      if (Array.isArray(hist)) {
        hist.forEach(function (h) {
          if (h.totalScore && h.totalScore > allTimeBest)
            allTimeBest = h.totalScore;
        });
      }
    } catch (_) {}

    return {
      completedCount,
      totalScore,
      avgPercent,
      bestBlockId,
      worstBlockId: completedCount > 0 ? worstBlockId : null,
      lastActivityDate,
      lastTotal,
      lastMaxScore,
      lastDate,
      lastDateFormatted,
      allTimeBest,
    };
  }

  //  Профиль hero бөлімін толтыру ---
  // Пайдаланушының аты, email, тіркелген күні, деңгей белгісі
  // Аттың бірінші әріптерінен аватар инициалдарын жасайды
  // Деңгейге сәйкес түс пен CSS класс қолданады
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

    const level = levelFromScore(aggregates.lastTotal);
    if (levelBadgeEl) {
      levelBadgeEl.textContent = levelLabelWithEmoji(level);
      levelBadgeEl.classList.remove(
        "profile-level-badge--beginner",
        "profile-level-badge--intermediate",
        "profile-level-badge--advanced",
      );
      if (level.num === 1) {
        levelBadgeEl.classList.add("profile-level-badge--beginner");
      } else if (level.num === 2) {
        levelBadgeEl.classList.add("profile-level-badge--intermediate");
      } else {
        levelBadgeEl.classList.add("profile-level-badge--advanced");
      }
      levelBadgeEl.style.background = (level.color || "#ef5350") + "22";
      levelBadgeEl.style.color = level.color || "#ef5350";
    }

    if (totalScoreChipEl) {
      if (aggregates.lastTotal > 0) {
        totalScoreChipEl.textContent =
          aggregates.lastTotal + " / " + aggregates.lastMaxScore + " балл";
      } else {
        totalScoreChipEl.textContent = "0 / 100 балл";
      }
    }
  }

  //  Статистика жолын толтыру ---
  // Соңғы тест күні, жалпы балл, пайыз, рекорд баллды көрсетеді
  // diq_test_history-дан резервтік деректер алады (lastTotal жоқ болса)
  // Пайызға сәйкес CSS класс қолданады (low/medium/high)
  function fillStatsRow(aggregates, results) {
    const completedEl = document.getElementById("profileStatCompleted");
    const totalScoreEl = document.getElementById("profileStatTotalScore");
    const avgEl = document.getElementById("profileStatAverage");
    const bestBlockEl = document.getElementById("profileStatBestBlock");

    let lastTotal = aggregates.lastTotal;
    let lastMaxScore = aggregates.lastMaxScore;
    let lastDate = aggregates.lastDate;
    let lastDateFormatted = aggregates.lastDateFormatted;

    if (!lastTotal || lastTotal <= 0) {
      try {
        const raw = localStorage.getItem("diq_test_history");
        const hist = raw ? JSON.parse(raw) : [];
        if (Array.isArray(hist) && hist.length > 0) {
          const last = hist[0];
          lastTotal = last.totalScore || 0;
          lastMaxScore = last.maxScore || 100;
          lastDate = last.date || null;
          if (lastDate) {
            try {
              const d = new Date(lastDate);
              const dd = String(d.getDate()).padStart(2, "0");
              const mm = String(d.getMonth() + 1).padStart(2, "0");
              const yyyy = d.getFullYear();
              const hh = String(d.getHours()).padStart(2, "0");
              const min = String(d.getMinutes()).padStart(2, "0");
              lastDateFormatted =
                dd + "." + mm + "." + yyyy + " " + hh + ":" + min;
            } catch (_) {}
          }
        }
      } catch (_) {}
    }

    if (completedEl) {
      completedEl.textContent = lastDate ? lastDateFormatted : "—";
    }
    if (totalScoreEl) {
      totalScoreEl.textContent =
        lastTotal > 0 ? lastTotal + " / " + lastMaxScore : "— / 100";
    }
    if (avgEl) {
      if (lastTotal > 0) {
        const pct =
          lastMaxScore > 0 ? Math.round((lastTotal / lastMaxScore) * 100) : 0;
        avgEl.textContent = pct + "%";
        avgEl.classList.remove(
          "profile-avg-low",
          "profile-avg-medium",
          "profile-avg-high",
        );
        if (pct < 34) avgEl.classList.add("profile-avg-low");
        else if (pct < 67) avgEl.classList.add("profile-avg-medium");
        else avgEl.classList.add("profile-avg-high");
      } else {
        avgEl.textContent = "—";
      }
    }
    if (bestBlockEl) {
      if (aggregates.allTimeBest > 0) {
        bestBlockEl.textContent = aggregates.allTimeBest + " балл";
      } else {
        bestBlockEl.textContent = "—";
      }
    }
  }

  //  Деңгей және жетістіктер белгілерін толтыру ---
  // Соңғы тест нәтижесінде аяқталған блоктарды анықтайды
  // Аяқталған блоктың белгісіне is-completed класы мен түс беріледі
  function fillLevelAndAchievements(aggregates, results) {
    const lastTest = results._lastTest || null;
    const completedIds =
      lastTest && lastTest.blockScores
        ? Object.keys(lastTest.blockScores).filter(function (id) {
            return lastTest.blockScores[id] >= 0;
          })
        : [];

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

  //  Блок нәтижелерін көрсету ---
  // Әр блок үшін иконка, атау, күн, прогресс жолағы, балл, батырма жасайды
  // Нәтиже жоқ блоктарға empty класы беріледі
  // setTimeout 300мс — прогресс жолағы анимация үшін кешіктіру
  function fillResults(results) {
    const container = document.getElementById("profileResultsContainer");
    if (!container) return;

    container.innerHTML = "";

    const lastTest = results._lastTest || null;
    const lastBlockScores = lastTest ? lastTest.blockScores || {} : null;
    const perBlock = lastTest
      ? lastTest.perBlock || MAX_PER_BLOCK
      : MAX_PER_BLOCK;

    BLOCKS.forEach(function (block) {
      const row = document.createElement("div");
      row.className = "test-row";

      const hasResult =
        lastBlockScores && lastBlockScores[block.id] !== undefined;
      if (!hasResult) row.classList.add("profile-result-row--empty");
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
      dateEl.textContent =
        lastTest && lastTest.date ? formatDate(lastTest.date) : "--.--.----";
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

      if (hasResult) {
        const score = Number(lastBlockScores[block.id]) || 0;
        scoreSpan.textContent = score + " / " + perBlock + " балл";
        const pct = perBlock > 0 ? (score / perBlock) * 100 : 0;
        setTimeout(function () {
          progressFill.style.width = pct.toFixed(1) + "%";
        }, 300);
      } else {
        scoreSpan.textContent = "— / " + perBlock + " балл";
        scoreSpan.classList.add("profile-result-score--empty");
      }

      const btn = document.createElement("a");
      btn.href = "test.html";
      btn.className = "profile-result-btn";
      btn.textContent = hasResult ? "Қайталау →" : "Тапсыру →";

      row.appendChild(iconBox);
      row.appendChild(main);
      row.appendChild(progressCol);
      row.appendChild(scoreSpan);
      row.appendChild(btn);

      container.appendChild(row);
    });
  }

  //  Статистика картасын толтыру ---
  // Соңғы тест деңгейі, соңғы белсенділік күні, жалпы балл көрсетіледі
  function fillStatsCard(aggregates) {
    var avgEl = document.getElementById("profileStatsAvg");
    var lastEl = document.getElementById("profileStatsLastActivity");
    var totalScoreEl = document.getElementById("profileStatsTotalScore");

    if (avgEl) {
      if (aggregates.lastTotal > 0) {
        const lvl = getLevelForScore(
          aggregates.lastTotal,
          aggregates.lastMaxScore,
        );
        avgEl.textContent = lvl.kk;
      } else {
        avgEl.textContent = "—";
      }
    }

    if (lastEl) {
      lastEl.textContent = aggregates.lastDateFormatted || "—";
    }

    if (totalScoreEl) {
      totalScoreEl.textContent =
        aggregates.lastTotal > 0
          ? aggregates.lastTotal + " / " + aggregates.lastMaxScore
          : "— / 100";
    }
  }

  //  AI ұсыныстарын толтыру ---
  // diq_ai_result кілтінен сақталған AI талдауын оқиды
  // Сақталған талдау бар болса — оны көрсетеді (күнімен)
  // Жоқ болса — блок нәтижелеріне негізделген қарапайым ұсыныстар жасайды
  // Ең төмен блоктарды (балл < 9) анықтап ұсыныс береді
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

  //  Белсенділік тарихын толтыру ---
  // GET /test/history/:user_id — серверден соңғы 20 тест нәтижесін алады
  // total_score мен max_score-ны ×5 коэффициентімен масштабтайды
  // Алғашқы 5 жазба көрсетіледі, "Толығырақ" батырмасымен ашылады
  // userId жоқ болса немесе нәтиже жоқ болса — бос хабар көрсетіледі
  function fillActivityHistory(results, userId) {
    var container = document.getElementById("profileActivityList");
    if (!container) return;

    container.innerHTML =
      '<div style="color:#9ba3c9;font-size:0.85rem;padding:8px 0">Жүктелуде...</div>';

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

    function getLvlForRow(totalScore, maxScore) {
      var max = maxScore || 100;
      var pct = max > 0 ? (totalScore / max) * 100 : 0;
      if (pct < 34) return { num: 1, kk: "Төмен" };
      if (pct < 67) return { num: 2, kk: "Орташа" };
      return { num: 3, kk: "Жоғары" };
    }

    function renderList(items) {
      container.innerHTML = "";
      items.forEach(function (row) {
        var totalScore = (row.total_score || 0) * 5;
        var maxScore = (row.max_score || 20) * 5;
        var lvl = getLvlForRow(totalScore, maxScore);

        var el = document.createElement("div");
        el.className = "profile-activity-row";

        var dot = document.createElement("div");
        dot.className = "profile-activity-dot";
        dot.style.backgroundColor = "#3949ab";

        var text = document.createElement("div");
        text.className = "profile-activity-text";
        text.textContent =
          "Тест тапсырды — " +
          lvl.num +
          "-деңгей, " +
          lvl.kk +
          " (" +
          totalScore +
          "/" +
          maxScore +
          ")";

        var date = document.createElement("div");
        date.className = "profile-activity-date";
        date.textContent = formatDateTime(row.created_at);

        el.appendChild(dot);
        el.appendChild(text);
        el.appendChild(date);
        container.appendChild(el);
      });
    }

    function showEmpty() {
      container.innerHTML = "";
      var wrap = document.createElement("div");
      wrap.className = "profile-activity-empty";
      var icon = document.createElement("div");
      icon.className = "profile-activity-empty-icon";
      icon.textContent = "🕐";
      var text = document.createElement("div");
      text.textContent = "Әлі белсенділік жоқ";
      wrap.appendChild(icon);
      wrap.appendChild(text);
      container.appendChild(wrap);
    }

    if (!userId) {
      showEmpty();
      return;
    }

    fetch("http://localhost:5000/test/history/" + userId)
      .then(function (resp) {
        return resp.json();
      })
      .then(function (data) {
        if (!data.success || !data.data || data.data.length === 0) {
          showEmpty();
          return;
        }
        var limited = data.data.slice(0, 20);
        var showCount = 5;
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
      })
      .catch(function () {
        showEmpty();
      });
  }

  //  Жүйеден шығу ---
  // logoutBtn батырмасын тыңдайды
  // localStorage-ден пайдаланушы деректерін жояды
  // login.html бетіне бағыттайды
  function initLogout() {
    const btn = document.getElementById("logoutBtn");
    if (!btn) return;
    btn.addEventListener("click", function () {
      try {
        localStorage.removeItem(USER_KEY);
        localStorage.removeItem(LEGACY_USER_KEY);
        localStorage.removeItem("diq_test_history");
        localStorage.removeItem("diq_block_results");
        localStorage.removeItem("diq_ai_result");
      } catch (_e) {}
      window.location.href = "login.html";
    });
  }

  //  Профиль өңдеу модалы ---
  // profileEditBtn басылғанда модал ашылады
  // Жаңа құпия сөз енгізілгенде ескі құпия сөз өрісі пайда болады
  // Форм жіберілгенде:
  //   - Аты міндетті өріс
  //   - Жаңа және растау құпия сөздер сәйкестігі тексеріледі
  //   - Құпия сөз өзгерсе — PUT /profile сұранысы жіберіледі
  //   - localStorage-дегі пайдаланушы деректері жаңартылады
  //   - Бет UI дереу жаңартылады (at, инициалдар)
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

  //  Ескі maxScore деректерін түзету ---
  // diq_test_history-дағы maxScore 100-ден өзгеше болса 100-ге түзетеді
  // Бұрын сақталған қате деректерді түзету үшін қолданылады
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

  //  Инициализация функциясы ---
  // Барлық функцияларды кезекпен шақырады:
  // 1. ensureUser() — пайдаланушыны тексеру
  // 2. fixLegacyMaxScore() — ескі деректерді түзету
  // 3. loadResults() — нәтижелерді оқу
  // 4. computeAggregates() — жалпы статистиканы есептеу
  // 5. fillHero(), fillStatsRow(), fillLevelAndAchievements() — UI толтыру
  // 6. fillResults(), fillStatsCard(), fillAiRecommendations() — UI толтыру
  // 7. fillActivityHistory() — тарихты жүктеу
  // 8. initLogout(), initEditModal() — оқиғаларды тіркеу
  // DOMContentLoaded болмаса тікелей іске қосылады
  function init() {
    const user = ensureUser();
    if (!user) return;

    fixLegacyMaxScore();

    const results = loadResults();
    const aggregates = computeAggregates(results);

    fillHero(user, aggregates);
    fillStatsRow(aggregates, results);
    fillLevelAndAchievements(aggregates, results);
    fillResults(results);
    fillStatsCard(aggregates);
    fillAiRecommendations(results, aggregates);
    fillActivityHistory(results, user.id);
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
