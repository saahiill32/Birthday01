/* ===========
  Editable content (replace later if needed)
=========== */

const BIRTHDAY_MESSAGES = [
  "Happy birthday baby😘🎂",
  "Enjoy your special day and stay with me forever and ever.",
  "And thanks to endure me🥺"
];

/* ===========
  Helpers
=========== */

const $ = (sel) => document.querySelector(sel);

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatTime(sec) {
  if (!Number.isFinite(sec) || sec < 0) sec = 0;
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${pad2(s)}`;
}

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function fadeVolume(audioEl, target, durationMs = 600) {
  if (!audioEl) return;
  const from = audioEl.volume;
  const to = Math.max(0, Math.min(1, target));

  if (audioEl._fadeRaf) cancelAnimationFrame(audioEl._fadeRaf);

  const start = performance.now();
  const easeInOutQuad = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

  const step = (now) => {
    const t = clamp01((now - start) / durationMs);
    const eased = easeInOutQuad(t);
    audioEl.volume = from + (to - from) * eased;
    if (t < 1) audioEl._fadeRaf = requestAnimationFrame(step);
  };

  audioEl._fadeRaf = requestAnimationFrame(step);
}

/* ===========
  Date logic
=========== */

function getTargetDateLocal() {
  const now = new Date();
  const year = now.getFullYear();
  return new Date(year, 0, 18, 0, 0, 0, 0);
}

function getDiffParts(ms) {
  const total = Math.max(0, ms);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((total / (1000 * 60)) % 60);
  const seconds = Math.floor((total / 1000) % 60);
  return { days, hours, minutes, seconds };
}

/* ===========
  Confetti + sparkles
=========== */

function runHeavyConfetti() {
  if (typeof confetti !== "function") return;

  const end = Date.now() + 2200;
  const colors = ["#d4af37", "#f0d98c", "#ffffff"];

  (function frame() {
    confetti({ particleCount: 10, angle: 60, spread: 70, origin: { x: 0, y: 0.75 }, colors });
    confetti({ particleCount: 10, angle: 120, spread: 70, origin: { x: 1, y: 0.75 }, colors });
    confetti({ particleCount: 12, spread: 90, startVelocity: 45, origin: { x: 0.5, y: 0.6 }, colors });

    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

function runSparkleBurst() {
  if (typeof confetti !== "function") return;

  confetti({
    particleCount: 26,
    spread: 45,
    startVelocity: 26,
    gravity: 1.05,
    scalar: 0.85,
    ticks: 140,
    origin: { x: 0.5, y: 0.42 },
    colors: ["#d4af37", "#f0d98c", "#ffffff"]
  });
}

/* ===========
  Audio helper
=========== */

async function tryPlayAudio(audioEl) {
  if (!audioEl) return { ok: false, reason: "no-element" };

  try {
    const p = audioEl.play();
    if (p && typeof p.then === "function") await p;
    return { ok: true };
  } catch (err) {
    return { ok: false, reason: err?.name || "play-failed" };
  }
}

/* ===========
  Coachmark (after messages)
=========== */

let coachmarkTimer = null;
let coachmarkShownThisRun = false;

function showCoachmark() {
  const cm = $("#coachmark");
  if (!cm) return;

  cm.classList.remove("is-hidden");

  const hide = () => {
    cm.classList.add("is-hidden");
    if (coachmarkTimer) {
      clearTimeout(coachmarkTimer);
      coachmarkTimer = null;
    }
  };

  window.addEventListener("scroll", hide, { once: true, passive: true });
  coachmarkTimer = setTimeout(hide, 5000);
}

/* ===========
  Scroll reveal (fade-only)
=========== */

function setupScrollReveal() {
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

  const targets = [
    "#countdownSection .container",
    "#celebrationSection .container",
    "#gallerySection .container",
    "#loveLetterSection .container",
    "#voiceSection .container",
    "#timelineSection .container",
    "#closingSection .container"
  ]
    .map((sel) => document.querySelector(sel))
    .filter(Boolean);

  targets.forEach((el) => el.classList.add("reveal"));

  if (prefersReduced) {
    targets.forEach((el) => el.classList.add("is-inview"));
    return;
  }

  requestAnimationFrame(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => entry.target.classList.toggle("is-inview", entry.isIntersecting));
      },
      { threshold: 0.35 }
    );

    targets.forEach((el) => io.observe(el));
  });
}

/* ===========
  Messages
=========== */

async function playMessagesOneByOne() {
  const messageText = $("#messageText");
  messageText.textContent = "";

  for (let i = 0; i < BIRTHDAY_MESSAGES.length; i++) {
    messageText.classList.remove("is-show");
    await wait(180);

    messageText.textContent = BIRTHDAY_MESSAGES[i];
    await wait(40);
    messageText.classList.add("is-show");

    await wait(4200);
  }

  await wait(450);
}

/* ===========
  Love letter: per-word ink + handwritten first 2 lines
=========== */

function tokenizePreserveWhitespace(text) {
  return text.match(/\S+|\s+/g) || [];
}

function revealInkPerWordWithHandTopLines(el, fullText, { wordDelayMs = 170, handLines = 2 } = {}) {
  el.innerHTML = "";

  const tokens = tokenizePreserveWhitespace(fullText);

  let wordIndex = 0;
  let currentLine = 1;

  for (const t of tokens) {
    // Track line breaks (works with \n from pasted text)
    if (t.includes("\n")) {
      // append token as plain text node so spacing remains exact
      el.appendChild(document.createTextNode(t));
      // Count how many newlines in this token
      const nlCount = (t.match(/\n/g) || []).length;
      currentLine += nlCount;
      continue;
    }

    if (!t.trim()) {
      el.appendChild(document.createTextNode(t));
      continue;
    }

    const span = document.createElement("span");
    span.className = "ink-word";
    if (currentLine <= handLines) span.classList.add("ink-word--hand");
    span.textContent = t;
    span.style.animationDelay = `${wordIndex * wordDelayMs}ms`;
    el.appendChild(span);
    wordIndex++;
  }
}

/* ===========
  Envelope open + seal interactions
=========== */

let flashFiredThisRun = false;
let signatureInkedThisRun = false;

function fireGalleryFlashOnce() {
  if (flashFiredThisRun) return;
  flashFiredThisRun = true;

  const flash = $("#galleryFlash");
  if (!flash) return;

  flash.classList.remove("is-fire");
  // restart animation
  void flash.offsetWidth;
  flash.classList.add("is-fire");
}

function setupGalleryFlashOnView() {
  const gallery = $("#gallerySection");
  if (!gallery) return;

  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (prefersReduced) return; // avoid surprise flashes for reduced-motion users

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fireGalleryFlashOnce();
          io.disconnect(); // once per run
        }
      });
    },
    { threshold: 0.2 } // T1: 20% visible
  );

  io.observe(gallery);
}

function setupEnvelopeSeal({ paperSfx }) {
  const envelope = $("#envelope");
  const flap = $("#envelopeFlap");
  const btn = $("#breakSealBtn");
  const wax = document.querySelector("#envelopeFlap .seal__wax");

  const content = $("#letterContent");
  const letterEl = $("#loveLetterText");
  const fullLetter = letterEl?.textContent ?? "";

  if (!envelope || !flap || !btn || !content) return;

  btn.addEventListener("click", async () => {
    // Haptics (30ms)
    if (navigator.vibrate) navigator.vibrate(30);

    // Micro sparkle + paper sound
    runSparkleBurst();

    if (paperSfx) {
      try {
        paperSfx.currentTime = 0;
        paperSfx.volume = 0.18;
        await tryPlayAudio(paperSfx);
      } catch (_) {}
    }

    // Wax micro-pop (uses existing .is-pop animation)
    if (wax) {
      wax.classList.remove("is-pop");
      void wax.offsetWidth;
      wax.classList.add("is-pop");
      setTimeout(() => wax.classList.remove("is-pop"), 420);
    }

    // Open envelope flap
    envelope.classList.add("is-open");

    // Prepare letter content
    if (letterEl) letterEl.textContent = "";
    content.classList.remove("is-locked");
    content.setAttribute("aria-hidden", "false");

    // Wait until flap is sufficiently open, then ink reveal
    await wait(850);

    if (letterEl && fullLetter) {
      // Signature ink reveal (once per run)
const sig = $("#signatureLine");
if (sig && !signatureInkedThisRun) {
  signatureInkedThisRun = true;
  sig.classList.add("is-inked");
}
      revealInkPerWordWithHandTopLines(letterEl, fullLetter, { wordDelayMs: 170, handLines: 2 });
    }

    // Disable button after open (prevents repeated clicks)
    btn.disabled = true;
    btn.style.pointerEvents = "none";
  });
}

/* ===========
  Lightbox (still works with gallery wrappers)
=========== */

function setupLightbox() {
  const lightbox = $("#lightbox");
  const lbImg = $("#lightboxImg");
  const lbCaption = $("#lightboxCaption");
  const btnClose = $("#lightboxClose");
  const btnPrev = $("#lightboxPrev");
  const btnNext = $("#lightboxNext");

  const thumbs = Array.from(document.querySelectorAll("#galleryGrid .gallery__img"));
  const figure = document.querySelector(".lightbox__figure");

  if (!lightbox || !lbImg || !lbCaption || !btnClose || !btnPrev || !btnNext || thumbs.length === 0) return;

  let currentIndex = 0;
  let isSwitching = false;

  function render() {
    const t = thumbs[currentIndex];
    lbImg.src = t.src;
    lbImg.alt = t.alt || "Selected photo";
    lbCaption.textContent = t.dataset.caption || "";
  }

  async function switchTo(idx) {
    if (isSwitching) return;
    isSwitching = true;

    currentIndex = ((idx % thumbs.length) + thumbs.length) % thumbs.length;

    if (figure) figure.classList.add("is-switching");
    await wait(175);
    render();
    await wait(175);
    if (figure) figure.classList.remove("is-switching");

    isSwitching = false;
  }

  function openAt(idx) {
    currentIndex = ((idx % thumbs.length) + thumbs.length) % thumbs.length;
    render();
    if (figure) figure.classList.remove("is-switching");
    lightbox.classList.remove("is-hidden");
    document.body.style.overflow = "hidden";
  }

  function close() {
    lightbox.classList.add("is-hidden");
    document.body.style.overflow = "";
    lbImg.removeAttribute("src");
  }

  function prev() { switchTo(currentIndex - 1); }
  function next() { switchTo(currentIndex + 1); }

  thumbs.forEach((img, idx) => img.addEventListener("click", () => openAt(idx)));
  btnClose.addEventListener("click", close);
  btnPrev.addEventListener("click", prev);
  btnNext.addEventListener("click", next);

  // Swipe (mobile)
  let startX = 0;
  let startY = 0;

  lbImg.addEventListener(
    "touchstart",
    (e) => {
      if (e.touches.length !== 1) return;
      startX = e.touches[0].clientX;
      startY = e.touches[0].clientY;
    },
    { passive: true }
  );

  lbImg.addEventListener(
    "touchend",
    (e) => {
      if (!e.changedTouches || e.changedTouches.length === 0) return;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;

      const dx = endX - startX;
      const dy = endY - startY;

      if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        if (dx < 0) next();
        else prev();
      }
    },
    { passive: true }
  );
}

/* ===========
  Voice player
=========== */

function setupVoicePlayer({ voiceAudio, bgMusic }) {
  const playBtn = $("#voicePlayBtn");
  const progress = $("#voiceProgress");
  const current = $("#voiceCurrent");
  const duration = $("#voiceDuration");
  const hint = $("#voiceAutoplayHint");

  function setPausedUI(isPlaying) {
    playBtn.classList.toggle("is-paused", isPlaying);
    playBtn.setAttribute("aria-label", isPlaying ? "Pause voice note" : "Play voice note");
  }

  function duckBackground(duck) {
    if (!bgMusic) return;
    fadeVolume(bgMusic, duck ? 0.10 : 0.55, 600);
  }

  voiceAudio.addEventListener("loadedmetadata", () => {
    duration.textContent = formatTime(voiceAudio.duration);
  });

  voiceAudio.addEventListener("timeupdate", () => {
    current.textContent = formatTime(voiceAudio.currentTime);
    const pct = voiceAudio.duration ? (voiceAudio.currentTime / voiceAudio.duration) * 100 : 0;
    progress.value = String(pct);
  });

  voiceAudio.addEventListener("play", () => {
    setPausedUI(true);
    duckBackground(true);
  });

  voiceAudio.addEventListener("pause", () => {
    setPausedUI(false);
    duckBackground(false);
  });

  voiceAudio.addEventListener("ended", () => {
    setPausedUI(false);
    duckBackground(false);
  });

  playBtn.addEventListener("click", async () => {
    hint.classList.add("is-hidden");
    if (voiceAudio.paused) {
      const res = await tryPlayAudio(voiceAudio);
      if (!res.ok) hint.classList.remove("is-hidden");
    } else {
      voiceAudio.pause();
    }
  });

  progress.addEventListener("input", () => {
    if (!voiceAudio.duration) return;
    const pct = Number(progress.value) / 100;
    voiceAudio.currentTime = voiceAudio.duration * pct;
  });

  setPausedUI(false);
  current.textContent = "0:00";
  duration.textContent = "0:00";
}

/* ===========
  Flow controller
=========== */

async function startBirthdayMoment({ voiceAudio }) {
  $("#countdownSection").classList.add("is-hidden");
  $("#celebrationSection").classList.remove("is-hidden");

  runHeavyConfetti();
  await playMessagesOneByOne();

  if (!coachmarkShownThisRun) {
    coachmarkShownThisRun = true;
    showCoachmark();
  }

// Show gallery + flash once (slight delay so it paints reliably)
$("#gallerySection").classList.remove("is-hidden");
await wait(450);

  $("#loveLetterSection").classList.remove("is-hidden");
  await wait(450);

  $("#voiceSection").classList.remove("is-hidden");
  await wait(450);

  const timeline = $("#timelineSection");
  if (timeline) timeline.classList.remove("is-hidden");
  await wait(300);

  const closing = $("#closingSection");
  if (closing) closing.classList.remove("is-hidden");
}

/* ===========
  Countdown
=========== */

function startCountdownOrBirthdayNow({ voiceAudio }) {
  const target = getTargetDateLocal();
  const now = new Date();

  if (now > target) {
    startBirthdayMoment({ voiceAudio });
    return;
  }

  const cdDays = $("#cdDays");
  const cdHours = $("#cdHours");
  const cdMinutes = $("#cdMinutes");
  const cdSeconds = $("#cdSeconds");

  function tick() {
    const diff = target.getTime() - Date.now();
    const { days, hours, minutes, seconds } = getDiffParts(diff);

    cdDays.textContent = String(days);
    cdHours.textContent = pad2(hours);
    cdMinutes.textContent = pad2(minutes);
    cdSeconds.textContent = pad2(seconds);

    if (diff <= 0) {
      clearInterval(timer);
      startBirthdayMoment({ voiceAudio });
    }
  }

  tick();
  const timer = setInterval(tick, 1000);
}

/* ===========
  Tap-to-start Intro
=========== */

let experienceStarted = false;

async function startExperience() {
  if (experienceStarted) return;
  experienceStarted = true;

  // Reset per-run flags
  coachmarkShownThisRun = false;
  flashFiredThisRun = false;
signatureInkedThisRun = false;

  const intro = $("#intro");
  if (intro) {
    intro.style.display = "none";
    intro.setAttribute("aria-hidden", "true");
  }

  document.body.style.overflow = "";

  const bgMusic = $("#bgMusic");
  const voiceAudio = $("#voiceAudio");
  const paperSfx = $("#paperSfx");

  if (bgMusic) {
    bgMusic.volume = 0.55;
    await tryPlayAudio(bgMusic);
  }

  setupScrollReveal();
  setupVoicePlayer({ voiceAudio, bgMusic });
  setupEnvelopeSeal({ paperSfx });
  setupLightbox();
  setupGalleryFlashOnView();

  startCountdownOrBirthdayNow({ voiceAudio });
}

document.addEventListener("DOMContentLoaded", () => {
  document.body.style.overflow = "hidden";
  const btn = $("#introBeginBtn");
  if (btn) btn.addEventListener("click", startExperience);
});
