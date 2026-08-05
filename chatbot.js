(function () {
  "use strict";

  var launcher = document.getElementById("chat-launcher");
  var panel = document.getElementById("chat-panel");
  var closeBtn = document.getElementById("chat-close");
  var messages = document.getElementById("chat-messages");
  var suggestions = document.getElementById("chat-suggestions");
  var form = document.getElementById("chat-form");
  var input = document.getElementById("chat-input");
  var sendBtn = document.getElementById("chat-send");

  if (!launcher || !panel) return;

  function openPanel() {
    panel.hidden = false;
    launcher.setAttribute("aria-expanded", "true");
    input.focus();
  }

  function closePanel() {
    panel.hidden = true;
    launcher.setAttribute("aria-expanded", "false");
  }

  launcher.addEventListener("click", function () {
    if (panel.hidden) openPanel(); else closePanel();
  });
  closeBtn.addEventListener("click", closePanel);

  function addMessage(text, who) {
    var msg = document.createElement("div");
    var modifiers = who.split(" ").map(function (w) { return "chat-msg--" + w; });
    msg.className = ["chat-msg"].concat(modifiers).join(" ");
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
    return msg;
  }

  function hideSuggestions() {
    if (suggestions) suggestions.hidden = true;
  }

  function setLoading(isLoading) {
    sendBtn.disabled = isLoading;
    input.disabled = isLoading;
  }

  function sendMessage(text) {
    text = text.trim();
    if (!text) return;

    hideSuggestions();
    addMessage(text, "user");
    input.value = "";
    setLoading(true);

    var loadingMsg = addMessage("Thinking…", "bot loading");

    fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text })
    })
      .then(function (res) {
        if (!res.ok) throw new Error("Request failed");
        return res.json();
      })
      .then(function (data) {
        loadingMsg.remove();
        addMessage(data.reply || "Sorry, I don't have an answer for that.", "bot");
      })
      .catch(function () {
        loadingMsg.remove();
        addMessage("I can't generate a reply right now. Please try again in a few seconds.", "bot error");
      })
      .finally(function () {
        setLoading(false);
        input.focus();
      });
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    sendMessage(input.value);
  });

  if (suggestions) {
    suggestions.querySelectorAll(".chat-suggestion").forEach(function (btn) {
      btn.addEventListener("click", function () {
        sendMessage(btn.textContent);
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !panel.hidden) closePanel();
  });
})();
