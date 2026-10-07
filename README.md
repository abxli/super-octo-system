# 💪 GymBuddy

A tiny web app for people who need *that little push* to go to the gym. It's built so using it takes almost no effort: no sign-up and no typing, just a tap or two.

## What it does

- **Your gym buddy grows when you go.** Pick a pet (🐣 🐶 🐱 🦖) and tap **"I went! 💪"** after a workout. Your buddy gains XP, levels up, grows, and unlocks accessories (🎀 → 🏋️ → 👑). Skip too long and it gets sad, then sleepy, but it never dies.
- **Excuse Buster.** Tap **"I don't wanna… 😩"**, pick your excuse ("Too tired", "No time", "Bad weather"…), and your buddy answers with a cheeky pep talk and a tiny plan you can actually do. Tap "Fine, I'll go" and you get bonus XP when you check in.
- **Coach mode (David Goggins).** The cute vibe ends when you slack. Opening the Excuse Buster, or skipping 3+ days, brings in the coach. The screen goes dark and red, and you get a pep talk: one of 20+ real Goggins quotes (attributed), a catchphrase like "Stay hard!", and a no-excuse plan. A hype sound bite plays right away: air horn and war drums, with the quote read in short punchy lines. If you skip, a full-screen takeover asks if you're going. Quotes are used with permission, non-commercially. To use your own photo or real audio clips, see [`assets/coach/README.md`](assets/coach/README.md).
- Streaks with a forgiving 2-day grace period, a 7-day progress strip, and confetti.
- Works offline and can be installed to your home screen. All data stays on your device in `localStorage`.

## Run it

It's a plain static site with no build step and no dependencies.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

Opening `index.html` directly also works, but install and offline need it served over http(s).

## Deploy (free)

GitHub → **Settings → Pages** → Source: *Deploy from a branch* → pick the branch and `/ (root)`. That's it.

## Files

| File | What's in it |
| --- | --- |
| `index.html` | The screens: setup, buddy (home), excuse buster |
| `app.js` | State, XP/levels, mood, streaks, rendering, confetti |
| `data.js` | All the fun text: pets, mood lines, excuses, pep talks, plans, coach quotes and `COACH_MEDIA`. Edit this to add your own |
| `assets/coach/` | Optional coach photo and sound clips |
| `style.css` | Theme (light and dark) and animations |
| `sw.js`, `manifest.webmanifest`, `icon.svg` | Offline and install-to-home-screen support |
