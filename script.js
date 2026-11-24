/* ============================
   SHUBH VIVAH - CUSTOM JS
   ============================ */

/* ---------------- 1. COUNTDOWN TIMER ---------------- */
const muhuratDate = new Date("December 12, 2026 20:24:00").getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const distance = muhuratDate - now;

  if (distance < 0) {
    document.getElementById("days").innerText = "00";
    document.getElementById("hours").innerText = "00";
    document.getElementById("minutes").innerText = "00";
    document.getElementById("seconds").innerText = "00";
    return;
  }

  const days = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
  );
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  document.getElementById("days").innerText = days < 10 ? "0" + days : days;
  document.getElementById("hours").innerText = hours < 10 ? "0" + hours : hours;
  document.getElementById("minutes").innerText =
    minutes < 10 ? "0" + minutes : minutes;
  document.getElementById("seconds").innerText =
    seconds < 10 ? "0" + seconds : seconds;
}
setInterval(updateCountdown, 1000);
updateCountdown();

/* ---------------- 2. PETAL ANIMATION ---------------- */
const canvas = document.getElementById("petalCanvas");
const ctx = canvas.getContext("2d");
let animationActive = true;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener("resize", resizeCanvas);

const petals = [];
const petalCount = 30;
const petalColors = ["#FF9933", "#FFD700", "#800020", "#FF7722", "#F3D5D5"];

class IndianPetal {
  constructor() {
    this.reset();
  }
  reset() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height;
    this.size = Math.random() * 9 + 5;
    this.speedY = Math.random() * 1.2 + 0.6;
    this.speedX = Math.random() * 0.6 - 0.3;
    this.opacity = Math.random() * 0.6 + 0.4;
    this.color = petalColors[Math.floor(Math.random() * petalColors.length)];
    this.rotation = Math.random() * 360;
    this.rotSpeed = Math.random() * 1.5 - 0.75;
  }
  update() {
    this.y += this.speedY;
    this.x += this.speedX;
    this.rotation += this.rotSpeed;
    if (this.y > canvas.height) this.reset();
  }
  draw() {
    if (!animationActive) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.beginPath();
    ctx.fillStyle = this.color;
    ctx.globalAlpha = this.opacity;
    ctx.ellipse(0, 0, this.size, this.size / 1.8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
for (let i = 0; i < petalCount; i++) petals.push(new IndianPetal());

function animatePetals() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  petals.forEach((p) => {
    p.update();
    p.draw();
  });
  requestAnimationFrame(animatePetals);
}
animatePetals();

function togglePetals() {
  animationActive = !animationActive;
  const icon = document.getElementById("petalIcon");
  icon.className = animationActive
    ? "fa-solid fa-spa text-lg"
    : "fa-solid fa-circle-xmark text-lg";
}

/* ---------------- 3. FULL SONG + SHEHNAI FALLBACK ---------------- */
const bgMusic = document.getElementById("bgMusic");
let isPlaying = false;
let usingSynth = false;
let audioCtx = null;
let audioTimer = null;

// Set a comfortable default volume
if (bgMusic) bgMusic.volume = 0.6;

function setMusicUI(playing) {
  const icon = document.getElementById("musicIcon");
  const status = document.getElementById("musicStatus");

  if (playing) {
    icon.className = "fa-solid fa-volume-high text-xl";
    status.innerText = usingSynth
      ? "Playing Shehnai Melody"
      : "Playing Wedding Song";
    status.classList.remove("opacity-0");
  } else {
    icon.className = "fa-solid fa-compact-disc text-xl animate-spin-slow";
    status.innerText = "Music Paused";
    setTimeout(() => status.classList.add("opacity-0"), 2000);
  }
}

function toggleAudio() {
  if (!isPlaying) playMusic();
  else pauseMusic();
}

function playMusic() {
  if (usingSynth) {
    startShehnaiMelody();
    isPlaying = true;
    setMusicUI(true);
    return;
  }
  if (!bgMusic) {
    fallbackToSynth();
    return;
  }

  // Attempt to play the mp3; if it fails (missing file / autoplay blocked), fallback to synth
  bgMusic
    .play()
    .then(() => {
      isPlaying = true;
      setMusicUI(true);
    })
    .catch(() => fallbackToSynth());
}

function fallbackToSynth() {
  usingSynth = true;
  startShehnaiMelody();
  isPlaying = true;
  setMusicUI(true);
}

function pauseMusic() {
  if (usingSynth) stopShehnaiMelody();
  else if (bgMusic) bgMusic.pause();
  isPlaying = false;
  setMusicUI(false);
}

/* Shehnai synth (fallback if mp3 not loaded) */
function startShehnaiMelody() {
  try {
    if (!audioCtx)
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Indian Classical Raga Bhairavi tone frequencies
    const notes = [293.66, 329.63, 369.99, 392.0, 440.0, 493.88, 554.37];
    let step = 0;

    audioTimer = setInterval(() => {
      if (!isPlaying) return;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(
        notes[step % notes.length],
        audioCtx.currentTime,
      );

      gain.gain.setValueAtTime(0.04, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 0.8);
      step++;
    }, 400);
  } catch (e) {
    console.log("Audio context error:", e);
  }
}

function stopShehnaiMelody() {
  if (audioTimer) {
    clearInterval(audioTimer);
    audioTimer = null;
  }
}

/* ---------------- 4. RSVP & BLESSINGS ---------------- */
const defaultBlessings = [];

function getStoredBlessings() {
  const saved = localStorage.getItem("hindu_wedding_blessings");
  return saved ? JSON.parse(saved) : defaultBlessings;
}

function renderBlessingsList() {
  const list = getStoredBlessings();
  const container = document.getElementById("guestListContainer");
  const badge = document.getElementById("guestCountBadge");

  badge.innerText = `${list.length} Blessing${list.length !== 1 ? "s" : ""}`;

  container.innerHTML = list
    .map(
      (item) => `
        <div class="p-4 rounded-2xl border border-amber-200 bg-amber-50/50 text-xs font-sans">
            <div class="flex justify-between items-start mb-1">
                <strong class="font-cinzel text-sm text-royalCrimson font-bold">${escapeHtml(item.name)}</strong>
                <span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold ${item.status.includes("Attending") ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}">
                    ${escapeHtml(item.status)} (${escapeHtml(item.guests)})
                </span>
            </div>
            ${item.wish ? `<p class="text-gray-700 italic font-serif text-sm mt-1">"${escapeHtml(item.wish)}"</p>` : ""}
        </div>
    `,
    )
    .join("");
}

function handleRSVP(event) {
  event.preventDefault();
  const name = document.getElementById("guestName").value.trim();
  const phone = document.getElementById("guestPhone").value.trim();
  const status = document.getElementById("attendanceStatus").value;
  const plusOne = document.getElementById("plusOne").value;
  const wish = document.getElementById("guestMessage").value.trim();

  if (!name || !phone) return;

  const newEntry = { name, status, guests: plusOne, wish };
  const currentList = getStoredBlessings();
  currentList.unshift(newEntry);

  localStorage.setItem("hindu_wedding_blessings", JSON.stringify(currentList));
  renderBlessingsList();

  document.getElementById("rsvpForm").reset();

  const modalMsg = document.getElementById("rsvpModalMessage");
  modalMsg.innerText = status.includes("Attending")
    ? `Thank You ${name}! We cordially invite you to join us and bless our wedding with your gracious presence!`
    : `Thank you for your blessings, ${name}. You will be fondly missed.`;

  showModal("rsvpModal");
}

function closeRsvpModal() {
  hideModal("rsvpModal");
}

/* ---------------- 5. MODALS ---------------- */
function showModal(id) {
  const el = document.getElementById(id);
  el.classList.remove("hidden");
  el.classList.add("flex");
}
function hideModal(id) {
  const el = document.getElementById(id);
  el.classList.add("hidden");
  el.classList.remove("flex");
}

function downloadInvitationCard() {
  showModal("invitationCardModal");
}
function closeInvitationModal() {
  hideModal("invitationCardModal");
}

/* ---------------- 6. UTIL ---------------- */
function escapeHtml(str) {
  return String(str).replace(
    /[&<>"']/g,
    (m) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;",
      })[m],
  );
}

/* ---------------- 7. INIT ---------------- */
window.addEventListener("load", () => {
  renderBlessingsList();

  // If the audio file fails to load entirely, auto-switch to synth mode
  if (bgMusic) {
    bgMusic.addEventListener("error", () => {
      console.warn("Wedding song not found — using Shehnai synth fallback.");
      usingSynth = true;
    });
  }
});

/* ==========================================
   SHUBH VIVAH - GOLD WEDDING SCRATCH CARD
   ========================================== */

(function () {
  "use strict";

  const scratchCanvas = document.getElementById("scratchCanvas");
  const scratchInstruction = document.getElementById("scratchInstruction");

  // Stop if the scratch card does not exist
  if (!scratchCanvas || !scratchInstruction) {
    return;
  }

  const scratchCtx = scratchCanvas.getContext("2d");

  // Scratch card settings
  const brushSize = 30;
  const revealThreshold = 45;

  let isScratching = false;
  let isRevealed = false;
  let lastPoint = null;

  let scratchWidth = 0;
  let scratchHeight = 0;

  // ==========================================
  // 1. INITIALIZE THE GOLD SCRATCH COVER
  // ==========================================

  function initializeScratchCard() {
    if (isRevealed) return;

    const rect = scratchCanvas.getBoundingClientRect();

    if (!rect.width || !rect.height) return;

    scratchWidth = rect.width;
    scratchHeight = rect.height;

    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    scratchCanvas.width = Math.round(scratchWidth * dpr);
    scratchCanvas.height = Math.round(scratchHeight * dpr);

    scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    scratchCtx.globalCompositeOperation = "source-over";
    scratchCtx.globalAlpha = 1;

    // Metallic gold gradient
    const goldGradient = scratchCtx.createLinearGradient(
      0,
      0,
      scratchWidth,
      scratchHeight,
    );

    goldGradient.addColorStop(0, "#8a6a16");
    goldGradient.addColorStop(0.15, "#d4af37");
    goldGradient.addColorStop(0.3, "#fff2a6");
    goldGradient.addColorStop(0.5, "#c49a25");
    goldGradient.addColorStop(0.7, "#f5df83");
    goldGradient.addColorStop(0.85, "#d4af37");
    goldGradient.addColorStop(1, "#8a6a16");

    scratchCtx.fillStyle = goldGradient;

    scratchCtx.fillRect(0, 0, scratchWidth, scratchHeight);

    // Gold sparkle texture
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * scratchWidth;
      const y = Math.random() * scratchHeight;

      scratchCtx.beginPath();

      scratchCtx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);

      scratchCtx.fillStyle =
        Math.random() > 0.5
          ? "rgba(255, 255, 220, 0.8)"
          : "rgba(138, 106, 22, 0.4)";

      scratchCtx.fill();
    }

    // Decorative inner gold border
    scratchCtx.strokeStyle = "#fff2a6";
    scratchCtx.lineWidth = 2;

    scratchCtx.strokeRect(12, 12, scratchWidth - 24, scratchHeight - 24);

    // Reset scratch instruction
    scratchInstruction.style.display = "flex";
  }

  // ==========================================
  // 2. GET MOUSE OR TOUCH POSITION
  // ==========================================

  function getScratchPosition(event) {
    const rect = scratchCanvas.getBoundingClientRect();

    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  // ==========================================
  // 3. SCRATCH THE GOLD COVER
  // ==========================================

  function scratch(event) {
    if (!isScratching || isRevealed) return;

    event.preventDefault();

    const point = getScratchPosition(event);

    scratchCtx.globalCompositeOperation = "destination-out";

    scratchCtx.lineWidth = brushSize * 2;
    scratchCtx.lineCap = "round";
    scratchCtx.lineJoin = "round";

    scratchCtx.beginPath();

    if (lastPoint) {
      scratchCtx.moveTo(lastPoint.x, lastPoint.y);
    } else {
      scratchCtx.moveTo(point.x, point.y);
    }

    scratchCtx.lineTo(point.x, point.y);

    scratchCtx.stroke();

    // Save current position
    lastPoint = point;

    // Hide SCRATCH text
    scratchInstruction.style.display = "none";
  }

  // ==========================================
  // 4. CHECK SCRATCHING PROGRESS
  // ==========================================

  function checkScratchProgress() {
    if (isRevealed) return;

    const imageData = scratchCtx.getImageData(
      0,
      0,
      scratchCanvas.width,
      scratchCanvas.height,
    );

    const pixels = imageData.data;

    let transparentPixels = 0;
    let totalPixels = 0;

    // Sample every 16th pixel for performance
    for (let i = 3; i < pixels.length; i += 16) {
      totalPixels++;

      if (pixels[i] === 0) {
        transparentPixels++;
      }
    }

    const scratchPercentage = (transparentPixels / totalPixels) * 100;

    if (scratchPercentage >= revealThreshold) {
      revealNames();
    }
  }

  // ==========================================
  // GOLDEN BLAST EFFECT
  // ==========================================

  function createGoldBlast() {
    const card = scratchCanvas.parentElement;

    if (!card) return;

    // Create the particle container
    const blast = document.createElement("div");
    blast.className = "gold-blast";

    card.appendChild(blast);

    // Golden particle colors
    const colors = [
      "#ffd700",
      "#fff2a6",
      "#d4af37",
      "#f5df83",
      "#ffffff",
      "#bf953f",
      "#fff8dc",
      "#ffec8b",
      "#e6be44",
    ];
    // Create the center flash
    const flash = document.createElement("div");
    flash.className = "gold-blast-flash";

    card.appendChild(flash);

    // Create 45 exploding particles
    for (let i = 0; i < 1000; i++) {
      const particle = document.createElement("span");

      particle.className = "gold-blast-particle";

      // Some particles are sparkling stars
      // Add more visible golden stars
      if (i % 3 === 0) {
        particle.classList.add("star");

        particle.textContent = i % 2 === 0 ? "❤️" : "🌸";
      }

      // Random explosion direction
      const angle = Math.random() * Math.PI * 2;

      // Distance of each particle
      const distance = 100 + Math.random() * 220;

      const x = Math.cos(angle) * distance;
      const y = Math.sin(angle) * distance;

      // Random particle size
      const size = 3 + Math.random() * 6;

      // Random particle color
      const color = colors[Math.floor(Math.random() * colors.length)];

      // Apply particle animation properties
      particle.style.setProperty("--blast-x", `${x}px`);
      particle.style.setProperty("--blast-y", `${y}px`);

      particle.style.setProperty("--particle-size", `${size}px`);

      particle.style.setProperty("--particle-color", color);

      particle.style.setProperty(
        "--blast-rotation",
        `${Math.random() * 720}deg`,
      );

      // Different particles explode at slightly different times
      particle.style.animationDelay = `${Math.random() * 150}ms`;

      blast.appendChild(particle);
    }

    // Remove the animation elements after completion
    setTimeout(() => {
      blast.remove();
      flash.remove();
    }, 1300);
  }

  // ==========================================
  // REVEAL NAMES WITH GOLDEN BLAST
  // ==========================================

  function revealNames() {
    if (isRevealed) return;

    isRevealed = true;

    // Hide the SCRATCH instruction
    scratchInstruction.style.display = "none";

    // Trigger the golden blast
    createGoldBlast();

    // Fade out the gold scratch cover
    scratchCanvas.style.transition = "opacity 0.8s ease";
    scratchCanvas.style.opacity = "0";

    // Completely remove the cover after the animation
    setTimeout(() => {
      scratchCanvas.style.display = "none";
    }, 800);
  }

  // ==========================================
  // 6. MOUSE AND TOUCH EVENTS
  // ==========================================

  // Start scratching
  scratchCanvas.addEventListener("pointerdown", function (event) {
    if (isRevealed) return;

    isScratching = true;
    lastPoint = null;

    scratchCanvas.setPointerCapture(event.pointerId);

    scratchInstruction.style.display = "none";

    scratch(event);
  });

  // Continue scratching
  scratchCanvas.addEventListener("pointermove", scratch);

  // Stop scratching
  scratchCanvas.addEventListener("pointerup", function (event) {
    if (!isScratching) return;

    isScratching = false;
    lastPoint = null;

    checkScratchProgress();

    if (scratchCanvas.hasPointerCapture(event.pointerId)) {
      scratchCanvas.releasePointerCapture(event.pointerId);
    }
  });

  // Handle interrupted touch events
  scratchCanvas.addEventListener("pointercancel", function () {
    isScratching = false;
    lastPoint = null;
  });

  // ==========================================
  // 7. INITIALIZE THE SCRATCH CARD
  // ==========================================

  // Add these variables near your existing scratch variables
  let scratchInitialized = false;
  let hasStartedScratching = false;

  // ==========================================
  // INITIALIZE THE GOLD SCRATCH COVER
  // ==========================================

  function initializeScratchCard() {
    if (isRevealed || hasStartedScratching) return;

    const rect = scratchCanvas.getBoundingClientRect();

    // Wait until the card has a real size
    if (rect.width < 1 || rect.height < 1) return;

    scratchWidth = rect.width;
    scratchHeight = rect.height;

    const dpr = window.devicePixelRatio || 1;

    // Set canvas resolution
    scratchCanvas.width = Math.round(scratchWidth * dpr);
    scratchCanvas.height = Math.round(scratchHeight * dpr);

    scratchCtx.setTransform(dpr, 0, 0, dpr, 0, 0);

    scratchCtx.globalCompositeOperation = "source-over";
    scratchCtx.globalAlpha = 1;

    // Draw the metallic gold cover
    const goldGradient = scratchCtx.createLinearGradient(
      0,
      0,
      scratchWidth,
      scratchHeight,
    );

    goldGradient.addColorStop(0, "#8a6a16");
    goldGradient.addColorStop(0.15, "#d4af37");
    goldGradient.addColorStop(0.3, "#fff2a6");
    goldGradient.addColorStop(0.5, "#c49a25");
    goldGradient.addColorStop(0.7, "#f5df83");
    goldGradient.addColorStop(0.85, "#d4af37");
    goldGradient.addColorStop(1, "#8a6a16");

    scratchCtx.fillStyle = goldGradient;
    scratchCtx.fillRect(0, 0, scratchWidth, scratchHeight);

    // Gold sparkle texture
    for (let i = 0; i < 100; i++) {
      const x = Math.random() * scratchWidth;
      const y = Math.random() * scratchHeight;

      scratchCtx.beginPath();
      scratchCtx.arc(x, y, Math.random() * 1.5 + 0.5, 0, Math.PI * 2);

      scratchCtx.fillStyle =
        Math.random() > 0.5
          ? "rgba(255, 255, 220, 0.8)"
          : "rgba(138, 106, 22, 0.4)";

      scratchCtx.fill();
    }

    // Decorative inner border
    scratchCtx.strokeStyle = "#fff2a6";
    scratchCtx.lineWidth = 2;

    scratchCtx.strokeRect(12, 12, scratchWidth - 24, scratchHeight - 24);

    scratchCtx.globalCompositeOperation = "source-over";

    // Show the scratch instruction
    scratchInstruction.style.display = "flex";

    // Make the canvas visible
    scratchCanvas.style.display = "block";
    scratchCanvas.style.opacity = "1";
    scratchCanvas.style.transition = "none";

    scratchInitialized = true;
  }

  /* ==========================
   OPEN WEDDING INVITATION
   ========================== */

  document.addEventListener("DOMContentLoaded", () => {
    const openingInvitation = document.getElementById("openingInvitation");
    const openButton = document.getElementById("openInvitationBtn");
    const siteContent = document.getElementById("siteContent");

    if (!openingInvitation || !openButton || !siteContent) return;

    openButton.addEventListener("click", () => {
      openingInvitation.classList.add("opened");

      setTimeout(() => {
        openingInvitation.remove();

        siteContent.classList.add("invitation-opened");

        // Draw the gold scratch cover after the invitation is visible
        requestAnimationFrame(initializeScratchCard);
      }, 1000);
    });
  });
})();
