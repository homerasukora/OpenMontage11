# TRANSMISSION 01 · "THE DRAWER"

The first VIRUS2027 short. 9:16, ~63 s, English and Russian, rendered end to
end from this folder — voiceover, subtitles and picture.

> **Sixteen days after the world shut down, the Pentagon already had a suspect.**
> Officially the answer stayed "unknown" for six years. It took a court order
> to open the drawer.

| | |
|---|---|
| **Masters** | `out/VIRUS2027_T01_the-drawer_EN_1080x1920.mp4` · `..._RU_...mp4` |
| **Subtitles** | `out/subs_en.srt` · `out/subs_ru.srt` (burned in as well) |
| **Voiceover** | `audio/en/vo_full.wav` · `audio/ru/vo_full.wav` + per-line stems |
| **Format** | 1080×1920 · 30 fps · H.264 CRF 17 · AAC 48 kHz · −16 LUFS |
| **Runtime** | 63.5 s (EN) · 70.3 s (RU) |

---

## Read these in order

1. **[`RESEARCH.md`](RESEARCH.md)** — every claim, what it rests on, what the video deliberately does *not* say, and the sources. Read before approving anything.
2. **[`PRODUCTION.md`](PRODUCTION.md)** — shot list with timings, voiceover direction, subtitle spec, sound-design sheet, publishing settings.
3. **[`PUBLISHING.md`](PUBLISHING.md)** — captions, hashtags, the pinned source comment, hook A/B variants, comment playbook.
4. **[`../SERIES.md`](../SERIES.md)** — the reusable format and the episode backlog.
5. **[`ASSET-PROMPTS.md`](ASSET-PROMPTS.md)** — generation prompts if you want to replace the graphic scenes with real archival plates.

---

## What is actually in the render

Everything is built from the brand's own material: the mascot, the *Eleventh
Seat* key art, the `2027` key art, plus type, redaction bars and geometry.
No stock footage, no AI-generated imagery, no external assets.

The style follows the web guide directly — near-black `#090806`, warm off-white
`#E8E3DB`, signal orange `#FF531F` held under ~7% of frame, Barlow Condensed
display, IBM Plex Mono technical labels, film grain, redactions, timecodes,
zero corner radius.

Two deliberate departures, both documented in `PRODUCTION.md`:

- **Barlow Condensed has no Cyrillic**, so the RU cut uses **Oswald** — the closest condensed grotesque on Google Fonts with a Cyrillic cut. Latin stays on Barlow, and Cyrillic display type is set 12% smaller to match its optical weight.
- **The web guide bans virus and pandemic imagery.** That rule protects a landing page from looking like a health scare; it cannot apply to a brand whose mascot is a virus and whose first episode is about a pandemic-origins file. The mascot appears once, at the concession beat, and there is no medical, biohazard or victim imagery anywhere in the video. Worth a decision from you either way.

### How the Russian cut is localised

Not everything on screen is translated, and the split is deliberate
(`remotion/src/copy.ts`):

- **Translated** — every line in the display face where the narrator is
  speaking: `16 ДНЕЙ СПУСТЯ`, `ОДНА ЛАБОРАТОРИЯ.`, `ИЗМЕНЁН`, `НИЗКАЯ
  УВЕРЕННОСТЬ`, `6 ЛЕТ / В ЯЩИКЕ СТОЛА`, `ВОПРОС — КТО УЖЕ ЗНАЛ.`,
  `НЕ ПРОСТО ДАТА.`
- **Left in English** — everything quoting the artefact: `U.S. DEFENSE
  INTELLIGENCE AGENCY`, `27 MAR 2020`, `AUTHORITATIVE ASSESSMENT`, `INTERNAL
  DISTRIBUTION ONLY`, `RELEASED 2026`, `NCMI · GENOMIC ASSESSMENT · JUN 2020`,
  `CIA · DOE · FBI · ODNI`.

A Russian-language stamp on an American file would read as a forgery, not a
translation. Keeping the document in its own language is what makes the frame
look like evidence.

### The token is not in this video

Deliberate. The orange coin from the key art, the ticker, the contract and the
word "token" appear nowhere in the read or on screen. Rule 1 of the growth
deck is that a viewer gets interested in the mystery first and learns the value
second, and the funnel is video → profile → link in bio. The only ask here is
`FOLLOW THE SIGNAL`.

If you want the coin on the end card anyway, say so — it crops out of
`assets/keyart-2027.png` and drops into `SceneBrand` in a few minutes. It is
your call, not a technical constraint.

The `V` emblem is **not** in the render. The guide says never to redraw it and
the vector was not supplied — drop `logo-v27-signal.svg` into
`remotion/public/` and it can be added to the end card in a minute.

---

## Rebuild

Prerequisites: Python venv at repo root, Node 18+, FFmpeg, and the Piper voices
(`en-us-ryan-high`, `ru-irinia-medium`) — see `build/tts_build.py` for paths.

```bash
# 1. voiceover, per-line timings, SRT  (edit script.json first)
python build/tts_build.py en ru

# 2. mascot matte, framed plates, grain, archive wall
python build/prep_assets.py

# 3. picture
cd remotion && npm install
cp ../build/timing_*.json src/data/
cp ../assets/{mascot-plate,seat-916,wall-officials,grain}.png public/
cp ../audio/en/vo_full.wav public/vo_en.wav
cp ../audio/ru/vo_full.wav public/vo_ru.wav
npm run render:en
npm run render:ru
```

`npx remotion studio src/index.tsx` opens the visual editor with a scrubbable
timeline if you want to nudge anything by eye.

### The one thing worth understanding

**Nothing is keyed to a frame number.** `script.json` is the single source of
truth: the TTS build measures the real duration of every synthesised line and
writes `build/timing_<lang>.json`, and the composition derives scene cuts,
caption chunks and animation marks from that. Rewrite a line, re-run the build,
and the whole video re-times itself. That is what makes this a series template
and not one video.

---

## Known gaps

| Gap | Why | Fix |
|---|---|---|
| Voiceover is Piper (local, free) | No TTS API key in this environment | Run `script.json` through ElevenLabs, drop the stems in, re-run the build — all timings re-derive |
| No music or sound design | Out of scope for the picture render | Sheet is in `PRODUCTION.md` §5; the 0.4 s silence before the last line matters most |
| No `V` emblem on the end card | Vector not supplied, and the guide forbids redrawing it | Add `logo-v27-signal.svg` to `remotion/public/` |
| Archival plates are graphic, not photographic | No image-generation key available | `ASSET-PROMPTS.md` has per-scene prompts |
