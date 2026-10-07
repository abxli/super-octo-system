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
  // Avoid repeating the same quote on "another pep talk".
  let talk;
  do talk = pepTalk(coach.quotes);
  while (bustTalk && talk.quote === bustTalk.quote && coach.quotes.length > 1);
  bustTalk = talk;
  $("bust-quote").textContent = talk.quote;
  $("bust-finisher").textContent = talk.finisher;
  // The tap counts as a user gesture, so the sound bite can play right away.
  playSoundBite(talk.quote, talk.finisher, $("btn-hear"), $("bust-finisher"));
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
  if (navigator.onLine) loadYouTubeApi().catch(() => {}); // warm up so the first Short starts fast
}

// A pep talk = one of his quotes + a closing catchphrase.
function pepTalk(quoteKeys) {
  return { quote: GOGGINS_QUOTES[pick(quoteKeys)], finisher: pick(GOGGINS_FINISHERS) };
}

let bustTalk = null;
let overlayTalk = null;

function exitCoachMode() {
  document.body.classList.remove("coach-mode");
  stopHype();
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
  overlayTalk = pepTalk(COACH_SKIP_QUOTES);
  $("overlay-quote").textContent = overlayTalk.quote;
  $("overlay-finisher").textContent = overlayTalk.finisher;
  $("coach-overlay").hidden = false;
  document.body.classList.add("coach-mode");
}

function closeCoach() {
  $("coach-overlay").hidden = true;
  exitCoachMode();
}

// ---------- sound: hype sound bites ----------
// A pep talk = his quote read in short punchy lines over war drums and a bass
// rumble, then a catchphrase shouted between air horns. All generated in the
// browser, so it works offline. Real audio clips in COACH_MEDIA.clips win.
let audioCtx;
let hype = null; // { timer, drone, button, finisher }

function ctx() {
  audioCtx = audioCtx || new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === "suspended") audioCtx.resume();
  return audioCtx;
}

function sting(when = 0) {
  if (!state.sound) return;
  try {
    const ac = ctx();
    const t = ac.currentTime + when;
    // Air horn: a few detuned sawtooths with a quick pitch drop.
    for (const f of [440, 443, 554]) {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(f, t);
      o.frequency.exponentialRampToValueAtTime(f * 0.92, t + 0.6);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.08, t + 0.03);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.65);
      o.connect(g).connect(ac.destination);
      o.start(t);
      o.stop(t + 0.7);
    }
  } catch {
    // No Web Audio: stay silent.
  }
}

function drum(t, gain = 0.5) {
  const ac = ctx();
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = "sine";
  o.frequency.setValueAtTime(130, t);
  o.frequency.exponentialRampToValueAtTime(40, t + 0.25);
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
  o.connect(g).connect(ac.destination);
  o.start(t);
  o.stop(t + 0.45);
}

// War-drum loop: BOOM . boom-boom . at ~100 bpm, under a low rumble.
function startBeat() {
  const ac = ctx();
  const drone = ac.createOscillator();
  const filter = ac.createBiquadFilter();
  const dg = ac.createGain();
  drone.type = "sawtooth";
  drone.frequency.value = 55;
  filter.type = "lowpass";
  filter.frequency.value = 160;
  dg.gain.setValueAtTime(0.0001, ac.currentTime);
  dg.gain.exponentialRampToValueAtTime(0.05, ac.currentTime + 1);
  drone.connect(filter).connect(dg).connect(ac.destination);
  drone.start();

  const beat = 0.6;
  let next = ac.currentTime + 0.05;
  const timer = setInterval(() => {
    while (next < ac.currentTime + 0.3) {
      drum(next, 0.55);
      drum(next + beat * 1.5, 0.3);
      drum(next + beat * 1.75, 0.35);
      next += beat * 2;
    }
  }, 100);
  return { timer, drone, dg };
}

function stopHype() {
  // Only cancel when something is queued: Safari can drop the next utterance after a cancel.
  if ("speechSynthesis" in window && (speechSynthesis.speaking || speechSynthesis.pending)) speechSynthesis.cancel();
  for (const slot of document.querySelectorAll(".yt-slot")) {
    slot.innerHTML = "";
    slot.hidden = true;
  }
  if (!hype) return;
  clearInterval(hype.beat?.timer);
  clearTimeout(hype.check);
  try {
    const t = audioCtx.currentTime;
    hype.beat.dg.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    hype.beat.drone.stop(t + 0.35);
  } catch {}
  clearTimeout(hype.failsafe);
  hype.button?.classList.remove("playing");
  hype = null;
}

// Break a quote into short shoutable lines.
function chunks(text) {
  // No regex lookbehind: older iPhones can't parse it.
  return (text.match(/[^,.!?;]+[,.!?;]*/g) || [text]).map((s) => s.trim()).filter(Boolean);
}

function pickVoice() {
  // On-device voices are the most reliable; online ones can fail silently.
  const voices = speechSynthesis.getVoices().filter((v) => /^en/i.test(v.lang));
  const local = voices.filter((v) => v.localService);
  const deep = /male|daniel|fred|alex|aaron|arthur|david|mark|guy/i;
  return local.find((v) => deep.test(v.name)) || local[0] || voices.find((v) => deep.test(v.name)) || null;
}

// Plays a full pep talk: quote lines, then the finisher.
function playSoundBite(quote, finisher, button, finisherEl) {
  if (!state.sound) return toast("Sound is off 🔇");
  stopHype();

  // Real sound bites from YouTube when online; the generated hype is the offline backup.
  const yt = COACH_MEDIA.youtube.filter((c) => /^[\w-]{11}$/.test(c.id));
  const slot = button?.nextElementSibling;
  if (yt.length && navigator.onLine && slot?.classList.contains("yt-slot")) {
    playYouTube(yt, slot, button);
    return;
  }

  if (COACH_MEDIA.clips.length) {
    const a = new Audio(pick(COACH_MEDIA.clips));
    a.play().catch(() => {});
    return;
  }

  let beat = null;
  try {
    sting();
    beat = startBeat();
  } catch {
    // No Web Audio: words only.
  }
  hype = { beat, button };
  button?.classList.add("playing");

  if (!("speechSynthesis" in window)) {
    hype.failsafe = setTimeout(() => { sting(); stopHype(); }, 3500);
    return;
  }

  const voice = pickVoice();
  let started = false;
  const say = (text, opts = {}) => {
    const u = new SpeechSynthesisUtterance(text);
    if (voice) u.voice = voice;
    u.lang = voice?.lang || "en-US";
    u.pitch = opts.pitch ?? 0.55;
    u.rate = opts.rate ?? 1.0;
    u.volume = 1;
    u.addEventListener("start", () => (started = true));
    speechSynthesis.speak(u);
    return u;
  };

  // Speak right away, inside the tap: iPhone/Safari block speech that starts
  // later (e.g. from a timer). The horn and drums run underneath.
  speechSynthesis.resume(); // Chrome can get stuck paused
  chunks(quote).forEach((line, i) => {
    const u = say(line);
    if (i === 0)
      u.addEventListener("error", (e) => {
        if (e.error !== "interrupted" && e.error !== "canceled") voiceHelp();
      });
  });
  const last = say(finisher.toUpperCase(), { pitch: 0.7, rate: 1.1 });
  last.addEventListener("start", () => {
    sting();
    finisherEl?.classList.remove("pulse");
    void finisherEl?.offsetWidth;
    finisherEl?.classList.add("pulse");
  });
  last.addEventListener("end", () => {
    sting(0.1);
    setTimeout(stopHype, 900);
  });

  // If the voice never starts, tell the user why instead of failing silently.
  hype.check = setTimeout(() => !started && hype && voiceHelp(), 4000);
  // Failsafe in case the speech engine never reports the end.
  hype.failsafe = setTimeout(stopHype, 30000);
}

// Shuffled queue so every Short plays once before any repeats.
let ytBag = [];
function nextClip(list) {
  if (!ytBag.length) ytBag = [...list].sort(() => Math.random() - 0.5);
  return ytBag.pop();
}

// The YouTube IFrame API lets us skip Shorts that were removed or don't allow embedding.
let ytApi;
function loadYouTubeApi() {
  ytApi =
    ytApi ||
    new Promise((resolve, reject) => {
      if (window.YT?.Player) return resolve(window.YT);
      const prev = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        prev?.();
        resolve(window.YT);
      };
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      tag.onerror = reject;
      document.head.appendChild(tag);
      setTimeout(() => reject(new Error("YouTube API timeout")), 6000);
    }).catch((e) => {
      ytApi = null; // try again next time
      throw e;
    });
  return ytApi;
}

function playYouTube(list, slot, button, tries = 0) {
  const clip = nextClip(list);
  const vars = { autoplay: 1, playsinline: 1, rel: 0, modestbranding: 1 };
  if (clip.start) vars.start = Math.floor(clip.start);
  if (clip.end) vars.end = Math.floor(clip.end);
  slot.innerHTML = "";
  slot.hidden = false;
  hype = { button };

  loadYouTubeApi()
    .then((YT) => {
      if (slot.hidden) return; // user already left
      const host = document.createElement("div");
      slot.innerHTML = "";
      slot.appendChild(host);
      new YT.Player(host, {
        host: "https://www.youtube-nocookie.com",
        videoId: clip.id,
        playerVars: vars,
        events: {
          onReady: (e) => e.target.playVideo(),
          // 2/5/100/101/150: bad id, can't play, removed, or embedding blocked → try another.
          onError: () => {
            if (slot.hidden) return;
            if (tries < 5) playYouTube(list, slot, button, tries + 1);
            else toast("Couldn't load a sound bite right now 😬");
          },
        },
      });
    })
    .catch(() => {
      // API blocked: plain embed (no auto-skip).
      if (slot.hidden) return;
      const frame = document.createElement("iframe");
      frame.src = `https://www.youtube-nocookie.com/embed/${clip.id}?${new URLSearchParams(vars)}`;
      frame.allow = "autoplay; encrypted-media; picture-in-picture";
      frame.referrerPolicy = "strict-origin-when-cross-origin";
      slot.innerHTML = "";
      slot.appendChild(frame);
    });
}

function voiceHelp() {
  toast("No voice? Turn the volume up, switch off silent mode, or try Chrome/Safari 🔊");
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
$("btn-hear").addEventListener("click", () =>
  bustTalk && playSoundBite(bustTalk.quote, bustTalk.finisher, $("btn-hear"), $("bust-finisher"))
);

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

$("btn-overlay-hear").addEventListener("click", () =>
  overlayTalk && playSoundBite(overlayTalk.quote, overlayTalk.finisher, $("btn-overlay-hear"), $("overlay-finisher"))
);
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
  if (!state.sound) stopHype();
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
