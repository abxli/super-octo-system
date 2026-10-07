// GymBuddy: state, pet logic, excuse buster and rendering.

const STORAGE_KEY = "gymbuddy:v1";
const XP_CHECKIN = 20;
const XP_STREAK_STEP = 5;
const XP_BUSTER_BONUS = 10;
const STREAK_GRACE_DAYS = 2; // a gap of up to 2 days keeps the streak alive

const $ = (id) => document.getElementById(id);
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

// ---------- dates ----------
function todayStr(d = new Date()) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function daysBetween(a, b) {
  const [ay, am, ad] = a.split("-").map(Number);
  const [by, bm, bd] = b.split("-").map(Number);
  return Math.round((Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)) / 86400000);
}

// ---------- state ----------
function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Storage unavailable (private mode etc.): the app still works for this visit.
  }
}

const DEFAULTS = {
  xp: 0,
  level: 1,
  streak: 0,
  lastWorkout: null,
  history: [],
  busterUsedDate: null,
  coachDismissedDate: null,
  sound: true,
};

// Merge defaults so saves from older versions pick up new fields.
let state = loadState();
if (state) state = { ...DEFAULTS, ...state };

function newState(species, name) {
  return { ...DEFAULTS, species, name };
}

// ---------- pet logic ----------
const xpForNext = (level) => level * 50;

function daysSinceWorkout() {
  return state.lastWorkout ? daysBetween(state.lastWorkout, todayStr()) : null;
}

function mood() {
  const d = daysSinceWorkout();
  if (d === null) return "happy"; // brand new buddy
  if (d === 0) return "ecstatic";
  if (d <= 2) return "happy";
  if (d <= 4) return "meh";
  if (d <= 7) return "sad";
  return "sleepy";
}

const MOOD_FACE = { ecstatic: "🤩", happy: "😊", meh: "😐", sad: "🥺", sleepy: "💤" };

function stage() {
  return [...STAGES].reverse().find((s) => state.level >= s.minLevel);
}

function currentStreak() {
  const d = daysSinceWorkout();
  return d !== null && d <= STREAK_GRACE_DAYS + 1 ? state.streak : 0;
}

function checkIn() {
  const today = todayStr();
  if (state.lastWorkout === today) return;

  state.streak = currentStreak() + 1;
  let gained = XP_CHECKIN + XP_STREAK_STEP * Math.min(state.streak, 5);
  const busted = state.busterUsedDate === today;
  if (busted) gained += XP_BUSTER_BONUS;

  state.xp += gained;
  let leveledUp = false;
  while (state.xp >= xpForNext(state.level)) {
    state.xp -= xpForNext(state.level);
    state.level += 1;
    leveledUp = true;
  }

  state.lastWorkout = today;
  state.history = [...state.history.filter((d) => d !== today), today].slice(-60);
  saveState();

  render();
  confetti();
  bounce("dance");
  if (leveledUp) toast(`LEVEL UP! ${state.name} is now level ${state.level}! 🎉`);
  else if (busted) toast(`+${gained} XP · ${pick(COACH_TOASTS)}`);
  else toast(`+${gained} XP · ${state.streak} day streak 🔥`);
}

// ---------- rendering ----------
function show(screen) {
  for (const s of document.querySelectorAll(".screen")) s.hidden = s.id !== `screen-${screen}`;
  window.scrollTo(0, 0);
}

function speciesEmoji() {
  return (SPECIES.find((s) => s.id === state.species) || SPECIES[0]).emoji;
}

function render() {
  const m = mood();
  const st = stage();
  const doneToday = state.lastWorkout === todayStr();

  $("pet-title").textContent = state.name;
  $("pet-stage").textContent = st.name;
  $("streak").textContent = currentStreak();
  $("level").textContent = state.level;
  $("xp-text").textContent = `${state.xp} / ${xpForNext(state.level)} XP`;
  $("xp-fill").style.width = `${(state.xp / xpForNext(state.level)) * 100}%`;

  $("pet-emoji").textContent = speciesEmoji();
  $("pet-accessory").textContent = st.accessory;
  $("pet-mood").textContent = MOOD_FACE[m];
  $("pet").style.setProperty("--scale", st.scale);
  $("pet").dataset.mood = m;

  $("bubble").textContent =
    state.lastWorkout === null ? `Hi! I'm ${state.name}. Take me to the gym and watch me grow! 🌱` : pick(MOOD_LINES[m]);

  const btn = $("btn-went");
  btn.disabled = doneToday;
  btn.textContent = doneToday ? "Done today ✅" : "I went! 💪";
  $("btn-excuse").hidden = doneToday;
  $("btn-sound").textContent = state.sound ? "🔊" : "🔇";

  renderWeek();
}

function renderWeek() {
  const week = $("week");
  week.innerHTML = "";
  const done = new Set(state.history);
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
    const cell = document.createElement("div");
    cell.className = "day" + (done.has(todayStr(d)) ? " done" : "") + (i === 0 ? " today" : "");
    cell.innerHTML = `<span class="dot">${done.has(todayStr(d)) ? "💪" : ""}</span><span class="dname">${
      d.toLocaleDateString(undefined, { weekday: "narrow" })
    }</span>`;
    week.appendChild(cell);
  }
}

// ---------- excuse buster ----------
let currentExcuse = null;

function renderExcuses() {
  const grid = $("excuse-grid");
  grid.innerHTML = "";
  for (const ex of EXCUSES) {
    const b = document.createElement("button");
    b.className = "chip";
    b.innerHTML = `<span class="chip-emoji">${ex.emoji}</span><span>${ex.label}</span>`;
    b.addEventListener("click", () => bust(ex));
    grid.appendChild(b);
  }
}

function bust(ex) {
  currentExcuse = ex;
  const coach = COACH_EXCUSES[ex.id];
  for (const c of document.querySelectorAll(".chip")) c.classList.toggle("active", c.textContent.includes(ex.label));
  $("bust-quote").textContent = GOGGINS_QUOTES[pick(coach.quotes)];
  $("bust-pet").textContent = speciesEmoji();
  $("bust-talk").textContent = `…what he said. ${pick(ex.talks)}`;
  $("bust-plan").innerHTML = coach.hardPlan.map((s) => `<li>${s}</li>`).join("");
  const box = $("bust");
  box.hidden = false;
  box.classList.remove("pop");
  void box.offsetWidth; // restart animation
  box.classList.add("pop");
  box.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function openExcuses() {
  currentExcuse = null;
  $("bust").hidden = true;
  for (const c of document.querySelectorAll(".chip")) c.classList.remove("active");
  enterCoachMode();
  show("excuses");
}

// ---------- coach mode ----------
function enterCoachMode() {
  document.body.classList.add("coach-mode");
  sting();
}

function exitCoachMode() {
  document.body.classList.remove("coach-mode");
  stopSpeech();
}

function renderCoachAvatars() {
  const html = COACH_MEDIA.photo
    ? `<img src="${COACH_MEDIA.photo}" alt="${COACH.name}">`
    : `<span class="badge-skull">💀</span><span class="badge-fire">🔥</span><span class="badge-ribbon">STAY HARD</span>`;
  for (const el of document.querySelectorAll(".coach-avatar")) {
    el.innerHTML = html;
    const img = el.querySelector("img");
    // Fall back to the badge if the photo is missing.
    if (img) img.onerror = () => { COACH_MEDIA.photo = ""; renderCoachAvatars(); };
  }
  for (const el of document.querySelectorAll(".coach-attr")) el.textContent = `— ${COACH.name}`;
}

function maybeShowCoach() {
  const d = daysSinceWorkout();
  const today = todayStr();
  const due = d !== null && d >= COACH_SKIP_DAYS && state.coachDismissedDate !== today && state.busterUsedDate !== today;
  if (!due || !$("coach-overlay").hidden) return;
  $("coach-title").textContent = `${d} DAYS. ${state.name.toUpperCase()} CALLED FOR BACKUP.`;
  $("overlay-quote").textContent = GOGGINS_QUOTES[pick(["soft", "boats", "denial", "done", "callus"])];
  $("coach-overlay").hidden = false;
  document.body.classList.add("coach-mode");
}

function closeCoach() {
  $("coach-overlay").hidden = true;
  exitCoachMode();
}

// ---------- sound ----------
let audioCtx;

function sting() {
  if (!state.sound) return;
  try {
    audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
    const t = audioCtx.currentTime;
    // Air-horn: a few detuned sawtooths with a quick pitch drop.
    for (const f of [440, 443, 554]) {
      const o = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.92, t + 0.6);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      o.connect(g).connect(audioCtx.destination);
      o.start(t);
      o.stop(t + 0.7);
    }
  } catch {
    // No Web Audio: stay silent.
  }
}

function stopSpeech() {
  if ("speechSynthesis" in window) speechSynthesis.cancel();
}

// Plays one of your own clips if configured, otherwise reads the quote aloud.
function playSoundBite(quote) {
  if (!state.sound) return toast("Sound is off 🔇");
  if (COACH_MEDIA.clips.length) {
    const a = new Audio(pick(COACH_MEDIA.clips));
    a.play().catch(() => speak(quote));
    return;
  }
  speak(quote);
}

function speak(text) {
  sting();
  if (!("speechSynthesis" in window)) return;
  stopSpeech();
  const u = new SpeechSynthesisUtterance(text);
  u.pitch = 0.6;
  u.rate = 0.95;
  const voices = speechSynthesis.getVoices();
  u.voice = voices.find((v) => /en/i.test(v.lang) && /male|daniel|fred|alex|google uk english male/i.test(v.name)) || null;
  setTimeout(() => speechSynthesis.speak(u), 450); // let the horn land first
}

// ---------- setup ----------
function renderSetup() {
  let chosen = null;
  const grid = $("species-grid");
  const nameInput = $("pet-name");
  nameInput.placeholder = pick(FUN_NAMES);
  grid.innerHTML = "";
  for (const sp of SPECIES) {
    const b = document.createElement("button");
    b.className = "species";
    b.innerHTML = `<span class="species-emoji">${sp.emoji}</span><span>${sp.label}</span>`;
    b.addEventListener("click", () => {
      chosen = sp.id;
      for (const el of grid.children) el.classList.toggle("active", el === b);
      $("btn-start").disabled = false;
    });
    grid.appendChild(b);
  }
  $("btn-start").onclick = () => {
    if (!chosen) return;
    state = newState(chosen, nameInput.value.trim() || nameInput.placeholder);
    saveState();
    render();
    show("home");
    bounce("dance");
  };
  show("setup");
}

// ---------- fx ----------
function bounce(cls) {
  const pet = $("pet");
  pet.classList.remove("dance", "droop");
  void pet.offsetWidth;
  pet.classList.add(cls);
}

let toastTimer;
function toast(msg) {
  const t = $("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2800);
}

function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = $("confetti");
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  ctx.scale(dpr, dpr);
  const colors = ["#ff6b4a", "#ffc93c", "#3ec98b", "#4aa8ff", "#c06bff"];
  const parts = Array.from({ length: 140 }, () => ({
    x: innerWidth / 2,
    y: innerHeight * 0.45,
    vx: (Math.random() - 0.5) * 14,
    vy: Math.random() * -14 - 4,
    r: Math.random() * 6 + 3,
    c: pick(colors),
    a: Math.random() * Math.PI,
  }));
  const start = performance.now();
  (function frame(t) {
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    for (const p of parts) {
      p.vy += 0.35;
      p.x += p.vx;
      p.y += p.vy;
      p.a += 0.2;
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.a);
      ctx.fillStyle = p.c;
      ctx.fillRect(-p.r / 2, -p.r / 2, p.r, p.r * 1.6);
      ctx.restore();
    }
    if (t - start < 2200) requestAnimationFrame(frame);
    else ctx.clearRect(0, 0, innerWidth, innerHeight);
  })(start);
}

// ---------- wiring ----------
$("btn-went").addEventListener("click", checkIn);
$("btn-excuse").addEventListener("click", openExcuses);
$("btn-back").addEventListener("click", () => {
  exitCoachMode();
  show("home");
});
$("btn-another").addEventListener("click", () => currentExcuse && bust(currentExcuse));
$("btn-hear").addEventListener("click", () => playSoundBite($("bust-quote").textContent));

function commitToGo() {
  state.busterUsedDate = todayStr();
  saveState();
  exitCoachMode();
  show("home");
  bounce("dance");
  $("bubble").textContent = "YES! Go go go! Tap “I went!” when you're done for bonus XP! 🎉";
}

$("btn-fine").addEventListener("click", commitToGo);
$("btn-nope").addEventListener("click", () => {
  exitCoachMode();
  show("home");
  bounce("droop");
  $("bubble").textContent = pick(NOT_TODAY_LINES);
});

$("btn-overlay-hear").addEventListener("click", () => playSoundBite($("overlay-quote").textContent));
$("btn-overlay-go").addEventListener("click", () => {
  closeCoach();
  commitToGo();
});
$("btn-overlay-snooze").addEventListener("click", () => {
  state.coachDismissedDate = todayStr();
  saveState();
  closeCoach();
  bounce("droop");
  $("bubble").textContent = "He'll be back tomorrow. I'm just saying. 😬";
});
$("btn-sound").addEventListener("click", () => {
  state.sound = !state.sound;
  if (!state.sound) stopSpeech();
  saveState();
  render();
});

renderExcuses();
renderCoachAvatars();
if (state) {
  render();
  show("home");
  maybeShowCoach();
} else {
  renderSetup();
}

// Re-render when the app comes back to the foreground on a new day.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden && state) {
    render();
    maybeShowCoach();
  }
});

if ("serviceWorker" in navigator && location.protocol !== "file:") {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}
