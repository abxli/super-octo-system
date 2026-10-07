# Coach media (optional)

Coach mode works without any files here. By default it shows an illustrated 💀🔥 "STAY HARD" badge, plays an air-horn sting, and reads the quote aloud in the browser's built-in voice.

If you have the rights to use them, you can drop in your own media:

1. Put the files in this folder, for example:
   - `photo.jpg`: a square-ish photo for the coach avatar (shown grayscale with a red tint)
   - `clip1.mp3`, `clip2.mp3`, …: short sound bites (a few seconds each works best)
2. List them in `COACH_MEDIA` at the bottom of `data.js`:

   ```js
   const COACH_MEDIA = {
     photo: "assets/coach/photo.jpg",
     clips: ["assets/coach/clip1.mp3", "assets/coach/clip2.mp3"],
   };
   ```

"▶ Hear it" then plays a random clip instead of the read-aloud.

## YouTube sound bites

You can also play clips straight from YouTube with an embedded player. Nothing is downloaded, and it needs an internet connection.

1. Open a video or Short on **his official channel**, not a re-upload, and copy its ID: the 11 characters after `shorts/` or `watch?v=`.
2. Add it to `youtube` in `COACH_MEDIA`:

   ```js
   youtube: [
     { id: "AbCdEfGhIjK" },                                  // a Short, plays whole
     { id: "XyZ12345678", start: 95, end: 110, wide: true }, // seconds 95-110 of a regular video
   ],
   ```

When you're online, YouTube clips play first, then your own audio files, then the read-aloud.

Only add media you have permission to use, and keep in mind that a photo or recording is usually owned by whoever took or recorded it.
