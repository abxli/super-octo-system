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
