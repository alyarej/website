(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = window.matchMedia("(pointer: fine)").matches;

  // --- Eyes that track the cursor (Toprak keeping an eye on things) ---
  var pupils = document.querySelectorAll(".cat-widget .pupil");
  if (pupils.length && !reduceMotion) {
    var ticking = false;
    var lastEvent = null;

    var updatePupils = function () {
      pupils.forEach(function (pupil) {
        var rect = pupil.parentElement.getBoundingClientRect();
        var cx = rect.left + rect.width / 2;
        var cy = rect.top + rect.height / 2;
        var dx = lastEvent.clientX - cx;
        var dy = lastEvent.clientY - cy;
        var dist = Math.hypot(dx, dy) || 1;
        var maxOffset = 1.1;
        var ox = (dx / dist) * maxOffset;
        var oy = (dy / dist) * maxOffset;
        pupil.setAttribute("transform", "translate(" + ox.toFixed(2) + "," + oy.toFixed(2) + ")");
      });
      ticking = false;
    };

    window.addEventListener("pointermove", function (e) {
      lastEvent = e;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updatePupils);
      }
    });
  }

  // --- Paw print trail (desktop mice only, skipped on touch and reduced motion) ---
  if (finePointer && !reduceMotion) {
    var lastX = null;
    var lastY = null;
    var minDistance = 40;

    var pawTemplate = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    pawTemplate.setAttribute("viewBox", "0 0 24 24");
    pawTemplate.setAttribute("class", "paw-print");
    pawTemplate.innerHTML =
      '<ellipse cx="12" cy="16" rx="6" ry="5" fill="#c9963f"/>' +
      '<ellipse cx="5.5" cy="8" rx="2.6" ry="3.2" fill="#c9963f"/>' +
      '<ellipse cx="11" cy="5.5" rx="2.6" ry="3.2" fill="#c9963f"/>' +
      '<ellipse cx="17" cy="6.5" rx="2.6" ry="3.2" fill="#c9963f"/>' +
      '<ellipse cx="20.5" cy="11" rx="2.4" ry="3" fill="#c9963f"/>';

    document.addEventListener("pointermove", function (e) {
      if (e.pointerType && e.pointerType !== "mouse") return;
      if (lastX !== null) {
        var moved = Math.hypot(e.clientX - lastX, e.clientY - lastY);
        if (moved < minDistance) return;
      }
      lastX = e.clientX;
      lastY = e.clientY;

      var paw = pawTemplate.cloneNode(true);
      var angle = (Math.random() * 40 - 20).toFixed(1);
      var flip = Math.random() < 0.5 ? -1 : 1;
      paw.style.left = e.clientX - 7 + "px";
      paw.style.top = e.clientY - 7 + "px";
      paw.style.transform = "rotate(" + angle + "deg) scaleX(" + flip + ")";
      document.body.appendChild(paw);
      paw.addEventListener("animationend", function () {
        paw.remove();
      });
    });
  }
})();
