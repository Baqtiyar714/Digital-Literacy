(function () {
  "use strict";

  var USER_KEY = "diq_user";
  var LEGACY_KEY = "user";

  function clearUserData() {
    try {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(LEGACY_KEY);
      localStorage.removeItem("diq_test_history");
      localStorage.removeItem("diq_block_results");
      localStorage.removeItem("diq_ai_result");
    } catch (_) {}
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
        clearUserData();
        window.location.href = "index.html";
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
