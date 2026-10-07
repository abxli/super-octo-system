# Coach media (optional)

Coach mode works without any files here. By default it shows an illustrated 💀🔥 "STAY HARD" badge and plays built-in **hype sound bites**: an air horn, war drums and a bass rumble, with the quote read in short punchy lines by the browser's built-in voice (not his) and a closing catchphrase. They're generated on the device and work offline.

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

The sound bites then play a random one of your clips instead of the generated hype.

## YouTube Shorts

When you're online, sound bites come from YouTube Shorts listed in `youtube` in `COACH_MEDIA`. They play in a small player in the coach card, because YouTube requires embedded videos to stay visible. To add one, copy the 11 characters after `shorts/` in its link:

```js
youtube: [{ id: "KHrtXxjoOrI" }, { id: "5SiPAKsJlqg" }, { id: "NEW_ID_HERE" }],
```

Offline, it falls back to your audio clips, then the generated hype.

Only add media you have permission to use, and keep in mind that a photo or recording is usually owned by whoever took or recorded it.
