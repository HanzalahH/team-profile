/* Rootline: digital rain, terminal typing, scroll reveal */
(function () {
  "use strict";

  /* ---------- full-page digital rain (dim red, sparse, slow) ---------- */
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
    ctx.fillStyle = "rgba(10, 10, 10, 0.14)";
    ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
    for (var i = 0; i < columns; i++) {
      var ch = chars[Math.floor(Math.random() * chars.length)];
      // mostly dim red, occasional brighter head
      ctx.fillStyle = Math.random() < 0.08 ? "rgba(255, 107, 107, 0.55)" : "rgba(255, 46, 46, 0.20)";
      ctx.fillText(ch, i * fontSize, drops[i] * fontSize);
      if (drops[i] * fontSize > window.innerHeight && Math.random() > 0.985) {
        drops[i] = Math.floor(Math.random() * -40);
      }
      drops[i] += 0.35; // slow fall
    }
  }
  setInterval(drawRain, 66);

  /* ---------- terminal typing: behaves like a real session ----------
     Each command is typed at a live prompt, stays visible with its
     output in the scrollback, and a fresh prompt appears below.
     whoami prints the user, cat prints file contents with no prefix. */
  var termBody = document.getElementById("term-body");
  var PROMPT = "root@rootline:~# ";
  var lines = [
    { cmd: "whoami", out: ["root"] },
    { cmd: "cat scope.txt", out: ["target: web app + api", "in scope: agreed in writing", "out of scope: third-party systems"] },
    { cmd: "nmap -sV app.example.com", out: ["443/tcp open  https", "80/tcp open   http"] },
    { cmd: "./engage.sh", out: ["status: available for engagements", "proof for every finding. fixed prices."] }
  ];
  var lineIdx = 0, charIdx = 0, curLine = null, curTyped = null, curCursor = null;

  function trimScrollback() {
    while (termBody.children.length > 12) termBody.removeChild(termBody.firstChild);
  }
  function newPromptLine() {
    curLine = document.createElement("div");
    curLine.className = "term-line";
    var p = document.createElement("span");
    p.className = "prompt";
    p.textContent = PROMPT;
    curTyped = document.createElement("span");
    curCursor = document.createElement("span");
    curCursor.className = "block-cursor";
    curLine.appendChild(p);
    curLine.appendChild(curTyped);
    curLine.appendChild(curCursor);
    termBody.appendChild(curLine);
    trimScrollback();
  }
  function typeStep() {
    var line = lines[lineIdx];
    if (!curLine) newPromptLine();
    if (charIdx < line.cmd.length) {
      charIdx++;
      curTyped.textContent = line.cmd.slice(0, charIdx);
      setTimeout(typeStep, 65);
      return;
    }
    // command finished: freeze it, print its output, open a fresh prompt
    curLine.removeChild(curCursor);
    line.out.forEach(function (text) {
      var div = document.createElement("div");
      div.className = "term-out";
      div.textContent = text;
      termBody.appendChild(div);
    });
    trimScrollback();
    curLine = null;
    lineIdx = (lineIdx + 1) % lines.length;
    charIdx = 0;
    setTimeout(typeStep, 2400);
  }
  if (termBody) {
    newPromptLine();
    setTimeout(typeStep, 600);
  }

  /* ---------- certifications marquee: duplicate each track once for a seamless loop ---------- */
  document.querySelectorAll(".marquee-track").forEach(function (track) {
    track.innerHTML += track.innerHTML;
  });

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
