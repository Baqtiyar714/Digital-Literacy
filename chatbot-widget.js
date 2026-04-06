(function () {
  function getCurrentPage() {
    var path = window.location.pathname;
    if (path.indexOf("test.html") !== -1) return "test";
    if (path.indexOf("quiz.html") !== -1) return "quiz";
    if (path.indexOf("dashboard.html") !== -1) return "dashboard";
    if (path.indexOf("profile.html") !== -1) return "profile";
    return "other";
  }

  function handleClick() {
    var page = getCurrentPage();
    if (page === "test") {
      var aiSection =
        document.getElementById("aiBtn") || document.getElementById("aiResult");
      if (aiSection) {
        aiSection.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    } else {
      window.location.href = "test.html#ai";
    }
  }

  function injectStyles() {
    var style = document.createElement("style");
    style.textContent =
      "#diq-ai-fab{" +
      "position:fixed;" +
      "bottom:28px;" +
      "right:28px;" +
      "width:62px;" +
      "height:62px;" +
      "border-radius:50%;" +
      "background:#1a237e;" +
      "border:3px solid rgba(255,255,255,0.25);" +
      "cursor:pointer;" +
      "box-shadow:0 4px 18px rgba(26,35,126,0.45);" +
      "z-index:9998;" +
      "display:flex;" +
      "align-items:center;" +
      "justify-content:center;" +
      "padding:0;" +
      "overflow:hidden;" +
      "transition:transform 0.18s,box-shadow 0.18s;" +
      "}" +
      "#diq-ai-fab:hover{" +
      "transform:scale(1.1);" +
      "box-shadow:0 7px 26px rgba(26,35,126,0.55);" +
      "}" +
      "#diq-ai-fab img{" +
      "width:42px;" +
      "height:42px;" +
      "object-fit:contain;" +
      "}" +
      "#diq-ai-fab-tooltip{" +
      "position:fixed;" +
      "bottom:100px;" +
      "right:20px;" +
      "background:#1a237e;" +
      "color:#fff;" +
      "font-family:'Plus Jakarta Sans',sans-serif;" +
      "font-size:0.75rem;" +
      "font-weight:500;" +
      "padding:6px 12px;" +
      "border-radius:8px;" +
      "box-shadow:0 3px 12px rgba(0,0,0,0.2);" +
      "white-space:nowrap;" +
      "z-index:9997;" +
      "opacity:0;" +
      "pointer-events:none;" +
      "transition:opacity 0.2s;" +
      "}" +
      "#diq-ai-fab-tooltip::after{" +
      "content:'';" +
      "position:absolute;" +
      "bottom:-6px;" +
      "right:20px;" +
      "border-width:6px 6px 0;" +
      "border-style:solid;" +
      "border-color:#1a237e transparent transparent;" +
      "}" +
      "#diq-ai-fab:hover ~ #diq-ai-fab-tooltip{opacity:1;}";
    document.head.appendChild(style);
  }

  function scrollToAIOnLoad() {
    if (window.location.hash === "#ai") {
      var aiSection =
        document.getElementById("aiBtn") || document.getElementById("aiResult");
      if (aiSection) {
        setTimeout(function () {
          aiSection.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 500);
      }
    }
  }

  function init() {
    injectStyles();

    var btn = document.createElement("button");
    btn.id = "diq-ai-fab";
    btn.setAttribute("aria-label", "AI талдауға өту");
    btn.innerHTML = '<img src="robot.png" alt="AI талдау">';
    btn.addEventListener("click", handleClick);

    var tooltip = document.createElement("div");
    tooltip.id = "diq-ai-fab-tooltip";
    tooltip.textContent = "AI талдауды көру";

    document.body.appendChild(btn);
    document.body.appendChild(tooltip);

    scrollToAIOnLoad();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
