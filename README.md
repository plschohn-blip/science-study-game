# 🧪 Element Study Game

A browser-based flashcard game for memorising chemical element names and symbols. Hear the element name spoken aloud, then type the name and symbol to score points. Progress is tracked per element with a spaced-repetition-style weighting system.

---

## Project Structure

```
element-study-game/
├── index.html            # App shell and all HTML markup
├── css/
│   └── styles.css        # All visual styles
└── js/
    ├── elements-data.js  # Periodic table data (atomic number → name/symbol/IPA)
    ├── study-sets.js     # Study set definitions, localStorage persistence, parsing
    ├── audio.js          # Web Speech Synthesis wrapper (voice loading + TTS)
    ├── game.js           # Core game logic (state, scoring, element selection)
    ├── ui.js             # Screen navigation and dynamic HTML rendering
    └── main.js           # Entry point: initialisation and event listeners
```

Scripts are loaded in dependency order at the bottom of `index.html`.

---

## How to Run

Open `index.html` in any modern browser — no build step or server required.

> **Tip:** Some browsers restrict Speech Synthesis on `file://` URLs. If the audio button does nothing, serve the folder with a simple HTTP server:
> ```bash
> npx serve .
> # or
> python3 -m http.server 8080
> ```

---

## Gameplay

### Study Mode
- 🔊 The element name is read aloud automatically.
- Type the **element name** and **symbol**, then press **Submit** (or hit Enter twice).
- Use **Hint** to reveal first letters, or **Show Answer** to see the full answer (counts as a miss).
- An element is **mastered** after **2 consecutive correct answers**.

### Test Mode
- Same as Study Mode, but the Hint and Show Answer buttons are hidden.
- An element is mastered after **1 correct answer**.

### Scoring & Weighting
The next element is chosen via weighted random selection:
- **Unseen elements** get a higher chance of appearing early.
- **Elements with high error rates** are prioritised.
- **Recently seen elements** are suppressed for ~30 seconds to prevent repetition.

---

## Study Sets

| Set | Contents |
|-----|----------|
| **Mr. Swamy Quiz #1** | 79 elements (the default quiz set) |
| *(custom)* | Any set you create |

### Creating a Custom Set
1. From the main menu click **Study → Add New Study Set**.
2. Enter a name, optional description, and element numbers.
3. Ranges are supported: `1-20, 24-36, 42, 92-95`

Custom sets are stored in `localStorage` and persist between sessions.

---

## Progress Report

The **Progress Report** shows per-set stats:
- **Mastered** — elements with ≥ 2 consecutive correct answers
- **Learning** — attempted at least once but not yet mastered
- **Not Started** — never attempted
- **Accuracy** — overall correct / total attempts
- **Readiness meter** — colour-coded bar from 🔴 to 🟢

---

## Voice Selection

The app uses the [Web Speech Synthesis API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechSynthesisUtterance). Available voices depend on your OS and browser. The game auto-selects the highest-quality English voice it finds, but you can switch voices using the dropdown in the game screen.

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core game | ✅ | ✅ | ✅ | ✅ |
| Text-to-speech | ✅ | ✅ | ✅ | ✅ |
| localStorage | ✅ | ✅ | ✅ | ✅ |

---

## Adding More Elements / Editing Data

All element data lives in `js/elements-data.js` as a plain JavaScript object keyed by atomic number. Each entry has:

```js
42: { name: 'Molybdenum', symbol: 'Mo', ipa: 'məˈlɪbdənəm' },
```

The `ipa` field is stored but not currently displayed — it's available for future pronunciation-guide features.

---

## Extending the Game

| Goal | Where to look |
|------|---------------|
| Add a new default study set | `js/study-sets.js` → `DEFAULT_STUDY_SETS` |
| Change mastery thresholds | `js/game.js` → `getMasteryThreshold()` |
| Adjust weighting algorithm | `js/game.js` → `selectNextElement()` |
| Add a new screen | `js/ui.js` + `index.html` + add the ID to `SCREENS` array |
| Change visual theme | `css/styles.css` — all colours use plain CSS values |
