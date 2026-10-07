// Content for GymBuddy: pets, mood lines, excuses, pep talks and tiny plans.

const SPECIES = [
  { id: "chick", emoji: "🐣", label: "Chick" },
  { id: "pup", emoji: "🐶", label: "Pup" },
  { id: "cat", emoji: "🐱", label: "Cat" },
  { id: "dino", emoji: "🦖", label: "Dino" },
];

const FUN_NAMES = [
  "Sir Lifts-a-Lot",
  "Buff Biscuit",
  "Captain Gains",
  "Sweaty Betty",
  "Dumbbell Dan",
  "Protein Pancake",
  "Squatrick",
  "Flex Mercury",
];

// Stage grows with level. Accessory is drawn next to the pet.
const STAGES = [
  { minLevel: 1, name: "Tiny Bean", scale: 0.8, accessory: "" },
  { minLevel: 3, name: "Gym Rookie", scale: 0.95, accessory: "🎀" },
  { minLevel: 6, name: "Regular", scale: 1.1, accessory: "🏋️" },
  { minLevel: 10, name: "Absolute Unit", scale: 1.25, accessory: "👑" },
];

const MOOD_LINES = {
  ecstatic: [
    "WE DID IT! I can feel my tiny muscles growing!",
    "Best. Day. Ever. Same time tomorrow?",
    "I'm so proud I could do a backflip. (I can't. Yet.)",
  ],
  happy: [
    "Feeling good! Rest is part of the plan, right?",
    "Still buzzing from last time. Let's keep it rolling!",
    "Hey buddy! Ready when you are.",
  ],
  meh: [
    "Sooo… are we going today? Just asking. Casually.",
    "My muscles are starting to forget what we did together.",
    "I did a push-up alone. It was lonely.",
  ],
  sad: [
    "I've been waiting by the door with my tiny shoes on…",
    "Remember the gym? I miss the gym. I miss you at the gym.",
    "Even 10 minutes would make my whole week. 🥺",
  ],
  sleepy: [
    "Zzz… is it gym day yet? …zzz…",
    "*yawns* Wake me up when we lift something.",
    "I've been hibernating. One visit and I'm back!",
  ],
};

const EXCUSES = [
  {
    id: "tired",
    emoji: "😴",
    label: "Too tired",
    talks: [
      "Tired is a feeling, not a fact. Movement literally gives you energy. Science said so. I said so.",
      "You're not too tired, you're under-caffeinated and over-scrolled. Let's go wake up your legs.",
      "Fun fact: the couch has never once made anyone less tired. The gym has a decent track record.",
    ],
    plan: ["5 min easy walk or bike", "2 × 10 bodyweight squats", "5 min stretching", "Leave proud 😎"],
  },
  {
    id: "time",
    emoji: "⏰",
    label: "No time",
    talks: [
      "You had time to open this app. That's like 4% of a workout already.",
      "Nobody's asking for an hour. Give me 15 minutes and I'll give you a better mood.",
      "Short workout beats no workout. Every. Single. Time.",
    ],
    plan: ["3 rounds, no rest:", "10 push-ups (knees fine!)", "15 squats", "30 sec plank", "Done in ~12 min ⚡"],
  },
  {
    id: "sore",
    emoji: "🤕",
    label: "Too sore",
    talks: [
      "Sore means it worked! Now we do a gentle day to help it heal.",
      "Light movement helps sore muscles recover faster. Your legs will thank you. Eventually.",
      "We don't skip, we switch. Sore legs? Upper body day. Sore everything? Walk + stretch.",
    ],
    plan: ["10 min easy cardio", "Foam roll the sore bits", "10 min mobility / stretching", "Hot shower = reward 🚿"],
  },
  {
    id: "weather",
    emoji: "🌧️",
    label: "Bad weather",
    talks: [
      "The gym has a roof. I checked.",
      "Rain is just the sky doing cardio. Join it. Indoors.",
      "Grey weather, bright gains. Let's go be warm and sweaty.",
    ],
    plan: ["Can't go out? Do it at home:", "20 jumping jacks", "15 lunges each leg", "10 push-ups", "Repeat 3× 🏠"],
  },
  {
    id: "clueless",
    emoji: "🤷",
    label: "Don't know what to do",
    talks: [
      "No plan? Here's one. Now you have zero excuses and one plan. 😇",
      "You don't need a perfect program, you need to show up. I've got the rest.",
      "Copy this list, do the things, collect the gains. Easy.",
    ],
    plan: ["Machine circuit, 3 × 12 each:", "Leg press", "Chest press", "Lat pulldown", "Then 10 min treadmill"],
  },
  {
    id: "crowded",
    emoji: "👥",
    label: "Gym is crowded",
    talks: [
      "Crowded means everyone else is winning. Let's go win next to them.",
      "Nobody's watching you. They're all watching themselves in the mirror.",
      "Grab some dumbbells and a corner. A corner is all a legend needs.",
    ],
    plan: ["Dumbbells only, any corner:", "3 × 10 goblet squats", "3 × 10 rows", "3 × 10 shoulder press", "In & out 🏃"],
  },
  {
    id: "mood",
    emoji: "😒",
    label: "Not in the mood",
    talks: [
      "Motivation follows action, not the other way around. Start and the mood shows up.",
      "Deal: go for 10 minutes. If you still hate it, you can leave. (You won't.)",
      "Bad mood + workout = good mood. That's just maths.",
    ],
    plan: ["Just put your shoes on", "Do 10 minutes of anything", "Decide then if you stay", "(You'll stay 😏)"],
  },
  {
    id: "tomorrow",
    emoji: "📅",
    label: "I'll go tomorrow",
    talks: [
      "Tomorrow-you is also going to say 'tomorrow'. I've met them.",
      "Today is the tomorrow you promised yesterday. Gotcha. 😼",
      "Let's make tomorrow easier by doing a little today.",
    ],
    plan: ["Mini version today:", "15 min of anything", "Pack your gym bag for tomorrow", "Double win 🏆"],
  },
];

const NOT_TODAY_LINES = [
  "Okay… I'll be here. Tomorrow, though? 🥺",
  "Rest day accepted. But I'm writing it down.",
  "Fine. I'll do some stretches for both of us.",
];

// ---------- Coach mode: David Goggins (used with permission, non-commercial) ----------
// The coach barges in when you open the Excuse Buster or skip 3+ days.

const COACH = { name: "David Goggins", tag: "COACH" };

// Optional media you have the rights to. Drop files in assets/coach/ and list them here.
// Leave empty to use the illustrated badge and the built-in hype sound bites.
const COACH_MEDIA = {
  photo: "", // e.g. "assets/coach/photo.jpg"
  clips: [], // real audio sound bites, e.g. ["assets/coach/clip1.mp3", "assets/coach/clip2.mp3"]
};

// Real quotes, always shown with attribution. Keys let excuses pick fitting ones.
const GOGGINS_QUOTES = {
  done: "Don't stop when you're tired. Stop when you're done.",
  boats: "Who's gonna carry the boats?",
  soft: "You are in danger of living a life so comfortable and soft that you will die without ever realizing your true potential.",
  forty: "When you think that you are done, you're only at 40% of what your body is capable of doing.",
  callus: "You have to build calluses on your brain just like how you build calluses on your hands.",
  obsessed: "Be more than motivated, be more than driven, become literally obsessed to the point where people think you're nuts.",
  suffering: "Suffering is the true test of life.",
  conversations: "The most important conversations you'll ever have are the ones you'll have with yourself.",
  denial: "Denial is the ultimate comfort zone.",
  greatness: "If you can get through doing things that you hate to do, on the other side is greatness.",
  schedule: "It takes relentless self-discipline to schedule suffering into your day, every day.",
  motivation: "Motivation is crap. Motivation comes and goes.",
  uncommon: "Be uncommon amongst uncommon people.",
  mindgame: "Everything in life is a mind game!",
  pain: "Pain unlocks a secret doorway in the mind, one that leads to both peak performance and beautiful silence.",
  uncomfortable: "Get comfortable being uncomfortable!",
  nobody: "No one is going to come help you. No one's coming to save you.",
  yesterday: "Nobody cares what you did yesterday. What have you done today to better yourself?",
  tugofwar: "Life is one big tug of war between mediocrity and trying to find your best self.",
  notion: "It won't always go your way, so you can't get trapped in the notion that it should.",
  greatnessstay: "Greatness is not something that if you meet it once it stays with you forever.",
};

// His catchphrases. Every pep talk ends on one, and the sound bite shouts it.
const GOGGINS_FINISHERS = ["Stay hard!", "Who's gonna carry the boats?", "They don't know me, son!"];

// Which quotes the coach throws at each excuse, plus a harder no-nonsense plan.
const COACH_EXCUSES = {
  tired: { quotes: ["forty", "done", "pain", "mindgame"], hardPlan: ["10 min warm-up, no phone", "4 × 12 goblet squats", "4 × 10 push-ups", "Finish with a 1 min plank. Then 1 more."] },
  time: { quotes: ["schedule", "denial", "yesterday", "obsessed"], hardPlan: ["EMOM for 15 min:", "Odd minutes: 15 burpees", "Even minutes: 20 air squats", "No rest beyond the minute."] },
  sore: { quotes: ["callus", "suffering", "pain", "uncomfortable"], hardPlan: ["20 min incline walk", "Mobility for every sore muscle", "3 × 15 light band work", "Sore is not injured. Show up."] },
  weather: { quotes: ["soft", "uncomfortable", "notion", "uncommon"], hardPlan: ["Home gauntlet, 5 rounds:", "20 jumping jacks", "15 lunges each leg", "15 push-ups", "30 sec wall sit"] },
  clueless: { quotes: ["conversations", "greatness", "nobody", "tugofwar"], hardPlan: ["Full-body, 4 × 10:", "Squat", "Bench or push-ups", "Row", "Then 15 min hard cardio"] },
  crowded: { quotes: ["obsessed", "uncommon", "mindgame", "uncomfortable"], hardPlan: ["Grab one set of dumbbells.", "5 rounds: 10 thrusters", "10 renegade rows", "10 walking lunges", "Own that corner."] },
  mood: { quotes: ["motivation", "greatness", "conversations", "tugofwar"], hardPlan: ["Shoes on. Out the door.", "20 min of the thing you hate most", "Then do what you like", "Discipline > mood."] },
  tomorrow: { quotes: ["soft", "denial", "yesterday", "greatnessstay"], hardPlan: ["Today. Not tomorrow.", "30 min, anything", "Pack the bag for tomorrow too", "Two days > zero days."] },
};

// Quotes for the skip takeover.
const COACH_SKIP_QUOTES = ["soft", "denial", "done", "callus", "nobody", "yesterday", "greatnessstay", "tugofwar"];

// Original UI copy (not quotes).
const COACH_TOASTS = [
  "Who's gonna carry the boats? YOU DID. 💀",
  "That's one more callus on the mind. 🔥",
  "You didn't negotiate with yourself today. Respect.",
];

const COACH_SKIP_DAYS = 3;
