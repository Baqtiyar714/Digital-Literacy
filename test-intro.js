(function () {
  "use strict";

  var RESULTS_KEY = "diq_block_results";
  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";

  var LEVELS = [
    { min: 0, max: 8, num: 1, kk: "Іргетас" },
    { min: 9, max: 18, num: 2, kk: "Іргетас" },
    { min: 19, max: 27, num: 3, kk: "Орташа" },
    { min: 28, max: 36, num: 4, kk: "Орташа" },
    { min: 37, max: 45, num: 5, kk: "Кеңейтілген" },
    { min: 46, max: 54, num: 6, kk: "Кеңейтілген" },
    { min: 55, max: 63, num: 7, kk: "Жоғары" },
    { min: 64, max: 90, num: 8, kk: "Жоғары" },
  ];

  function getLevelForScore(score) {
    for (var i = 0; i < LEVELS.length; i++) {
      if (score >= LEVELS[i].min && score <= LEVELS[i].max) return LEVELS[i];
    }
    return LEVELS[LEVELS.length - 1];
  }

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

    var logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        try {
          localStorage.removeItem(USER_KEY);
          localStorage.removeItem(LEGACY_KEY);
        } catch (_) {}
        window.location.href = "index.html";
      });
    }

    try {
      var raw = localStorage.getItem(RESULTS_KEY);
      var results = raw ? JSON.parse(raw) : {};
      var completed = 0;
      var totalScore = 0;

      var BLOCK_IDS = [
        "info-search",
        "financial-security",
        "egov",
        "network-culture",
        "device-care",
      ];
      BLOCK_IDS.forEach(function (id) {
        var entry = results[id];
        if (entry) {
          completed++;
          totalScore += entry.score || 0;
        }
      });

      var statCompleted = document.getElementById("statCompleted");
      var statLevel = document.getElementById("statLevel");

      if (statCompleted) statCompleted.textContent = completed + " / 5";

      if (statLevel && completed > 0) {
        var lvl = getLevelForScore(totalScore);
        statLevel.textContent = lvl.num + "-деңгей";
        statLevel.style.color = [
          "#ef5350",
          "#ef5350",
          "#f9a825",
          "#f9a825",
          "#1b8a4e",
          "#1b8a4e",
          "#1565c0",
          "#1565c0",
        ][lvl.num - 1];
      }
    } catch (_) {}
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
