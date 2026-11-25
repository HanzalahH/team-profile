/* Midnight Monks — digital rain, terminal typing, scroll reveal */
(function () {
  "use strict";

  /* ---------- full-page digital rain (dim teal, sparse, slow) ---------- */
  var canvas = document.getElementById("rain");
  var ctx = canvas.getContext("2d");
  var chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789%&#*$@!?<>/\\|";
  var fontSize = 15;
  var columns = 0;
  var drops = [];
  var dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = window.innerWidth + "px";
    canvas.style.height = window.innerHeight + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    columns = Math.floor(window.innerWidth / fontSize);
    drops = [];
    for (var i = 0; i < columns; i++) {
      // sparse: many columns start empty / off-screen so the rain stays subtle
      drops[i] = Math.random() < 0.45 ? Math.floor(Math.random() * -80) : Math.floor(Math.random() * (window.innerHeight / fontSize));
    }
  }
  resize();
  window.addEventListener("resize", resize);

  ctx.font = fontSize + "px 'JetBrains Mono', monospace";
  function drawRain() {
    ctx.fillStyle = "rgba(2, 9, 10, 0.12)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < columns; i++) {
      var ch = chars[Math.floor(Math.random() * chars.length)];
      // mostly dim teal, occasional brighter head
      ctx.fillStyle = Math.random() < 0.08 ? "rgba(47, 255, 208, 0.55)" : "rgba(0, 232, 200, 0.20)";
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.985) {
        drops[i] = Math.floor(Math.random() * -40);
      }
      drops[i] += 0.35; // slow fall
    }
  }
  setInterval(drawRain, 66);

  /* ---------- terminal typing ---------- */
  var target = document.getElementById("type-target");
  var out = document.getElementById("term-out");
  var lines = [
    { cmd: "whoami", out: ["rootline — independent security researchers", "web • api • mobile • cloud • ai"] },
    { cmd: "cat scope.txt", out: ["scope: agreed in writing, before anything is touched", "third-party systems: out of scope"] },
    { cmd: "./engage.sh", out: ["status: available for engagements", "proof for every finding. fixed prices."] }
  ];
  var lineIdx = 0, charIdx = 0, phase = "typing";

  function typeStep() {
    var line = lines[lineIdx];
    if (phase === "typing") {
      charIdx++;
      target.textContent = line.cmd.slice(0, charIdx);
      if (charIdx >= line.cmd.length) {
        phase = "show";
        setTimeout(typeStep, 500);
        return;
      }
      setTimeout(typeStep, 70);
    } else if (phase === "show") {
      line.out.forEach(function (text) {
        var div = document.createElement("div");
        div.textContent = text;
        out.appendChild(div);
      });
      while (out.children.length > 6) out.removeChild(out.firstChild);
      phase = "pause";
      setTimeout(typeStep, 2600);
    } else {
      // clear and move to next command
      target.textContent = "";
      lineIdx = (lineIdx + 1) % lines.length;
      phase = "typing";
      charIdx = 0;
      setTimeout(typeStep, 400);
    }
  }
  if (target && out) typeStep();

  /* ---------- reveal on scroll ---------- */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach(function (el) { io.observe(el); });
})();
