# TRANSMISSION 01 · "THE DRAWER" — production sheet

`9:16 · 1080×1920 · 30 fps · 63.5 s (EN) / 70.3 s (RU)`
TikTok · Instagram Reels · YouTube Shorts — one shoot, three uploads.

---

## 1. Structure

Six beats, and the retention job of each one:

| Beat | Time (EN) | Job |
|---|---|---|
| **HOOK** | 0:00–0:04 | A number and a missing name. No context, no logo, no "hey guys". |
| **SETUP** | 0:04–0:13 | Make the document physical. A date, a title, a stamp. |
| **EVIDENCE** | 0:13–0:26 | Three facts, indexed. Rhythm accelerates. |
| **TURN** | 0:26–0:40 | The genome, the verdict, the empty chair. |
| **HONESTY** | 0:40–0:49 | Concede everything. This is where the sceptic is converted, not lost. |
| **PAYOFF** | 0:49–1:03 | Reframe: the virus was never the story. Land on 2027. |

The pivot is at **0:40**. Everything before it builds a case; everything after
it admits the case is weak and argues that the *weakness is not the point.*
That reversal is the reason to watch to the end.

---

## 2. Shot list

Times are EN. RU runs ~11% longer; every mark is derived from the actual
voiceover render, so the RU cut re-times itself from `build/timing_ru.json`.

| # | In–Out | Scene | On screen | Motion |
|---|---|---|---|---|
| 01 | 0:00–0:04.6 | **HOOK** | Mono tag `11 MAR 2020 — PANDEMIC DECLARED`. Giant `16` / `DAYS LATER`. Orange rule draws. `SUSPECT:` + redaction bar with orange corner brackets. | Slow 1.00→1.055 push. Bar wipes L→R. |
| 02 | 0:04.6–0:13.4 | **DOSSIER** | Document card on a blurred wall of redacted officials. `U.S. DEFENSE INTELLIGENCE AGENCY` / `27 MAR 2020` in orange. Display `AUTHORITATIVE ASSESSMENT`. Six redaction bars fill in. Stamp `INTERNAL DISTRIBUTION ONLY` rotates in at 0:11. | Card lifts 22px. Bars wipe in sequence, 5f apart. Stamp scales 0.86→1.0 at −3.5°. |
| 03 | 0:13.4–0:17.8 | **TARGET** | Coordinate grid. Expanding crosshair, pulsing orange dot. `30.5428° N / 114.3428° E`. Display `ONE LAB.` `RESEARCHER:` + redaction. | Reticle grows over 22f. Dot pulses at 6 Hz. |
| 04 | 0:17.8–0:26.2 | **THREE FACTS** | Tag `WHAT THE ASSESSMENT LISTED`. Indexed rows `01 BAT CORONAVIRUS BANK` · `02 INFECTIOUS CLONE CAPABILITY` · `03 CHIMERIC SPIKE GENES`, hairline under each. | Each row keyed to its own VO line — snaps in +26px with the word. |
| 05 | 0:26.2–0:33.3 | **GENOME** | Tag `NCMI · GENOMIC ASSESSMENT · JUN 2020`. Scrolling A/C/G/T field with an orange scan bar. At 0:30 the field dims and `MANIPULATED` slams in over an orange rule. Sub-label `CONCLUSION OF THREE STAFF SCIENTISTS`. | Field scrolls 2.6 px/f. Scan bar sweeps every 1.5 s. |
| 06 | 0:33.3–0:40.6 | **THE EMPTY SEAT** | Reframed brand key art: redacted leaders, empty chair centre. `AUG 2021 · THE BRIEFING` / `ONE CONCLUSION NEVER ARRIVES.` At 0:37 a redaction bar wipes across. `REPORTED · THE WALL STREET JOURNAL`. | 1.02→1.15 push-in over the whole scene. |
| 07 | 0:40.6–0:49.6 | **HONESTY** | `LOW CONFIDENCE` in warm grey with an orange strike drawing through it. `CIA · DOE · FBI · ODNI`. `MOST SCIENTISTS STILL SAY: NATURE.` **Mascot rises bottom-right at 0:41.7** and idles. | Strike draws over 18f. Mascot slides up 130px, then bobs ±7px. |
| 08 | 0:49.6–0:54.3 | **THE DRAWER** | `6 YEARS` / `IN A DRAWER`. A cabinet; the tray slides out revealing three redacted files. Stamp `RELEASED 2026`. `FOIA LITIGATION · COURT-ORDERED PRODUCTION`. | Tray travels 92px over 26f. Stamp lands at −4°. |
| 09 | 0:54.3–0:58.1 | **THE QUESTION** | `THE QUESTION WAS NEVER WHAT HAPPENED.` in muted grey. Rule. Then `IT'S WHO ALREADY` **`KNEW.`** — the last word orange. | Almost still. This is the one scene that does not move. |
| 10 | 0:58.1–1:03.5 | **BRAND** | Giant `2027`, **mascot perched on the `0`** exactly as in the key art. `NOT JUST A DATE.` `@VIRUS2027` / `FOLLOW THE SIGNAL`. | 2027 masks up. Mascot drops in and bobs. Handle fades at 1:00. |

### Language

Two cuts from one build. The Russian version is not a subtitle swap — the
display-face copy is localised in `remotion/src/copy.ts`, while agency names,
document titles, stamps and source citations stay in English because they are
quotations from American files. Cyrillic display type is set at 88% to match
Barlow's optical weight in Oswald, and the hook's unit line drops 26px to clear
Oswald's deeper descenders.

### Persistent layers

- **Ground** — near-black `#090806`, warm radial light field, concentric technical circles, drifting grain (7.5% soft-light), radial vignette, and a soft scan sweep every 7.5 s.
- **Chrome** — top rule with `VIRUS2027` / `TRANSMISSION 01`; bottom rule with a live timecode and a blinking `● ACCESS: PARTIAL`.
- **Read progress** — a 2px orange hairline above the bottom rule that fills across the video. A quiet "you are nearly there" cue.
- **Cut flash** — a 2-frame 5% white lift on every scene boundary. Punctuation, not a glitch effect.

---

## 3. Voiceover

- **EN** — Piper `en-US-ryan-high`, length-scale 0.99.
- **RU** — Piper `ru-irinia-medium`, length-scale 0.80, pauses scaled to 78%.
- Chain: `HPF 85 Hz → −3.2 dB @ 240 → +2.6 dB @ 2.6 k → +1.4 dB @ 7.2 k → comp 3.4:1 → exciter → 24 ms slap → limiter → EBU R128 −16 LUFS`.
- Per-line stems in `audio/<lang>/lines/` so any line can be re-cut without re-rendering the rest.

**Delivery direction is per line in `script.json`.** The register is *bored
authority* — someone reading a file they have read before. Never announce,
never sell. Three lines carry the piece:

- `L10 "Manipulated."` — drop pitch, isolate, let the room take it.
- `L12 "That conclusion, reportedly, never enters the room."` — the quietest line in the video. Throw it away.
- `L17 "It's who already knew."` — full stop before it. No push.

> **Upgrade path.** Piper is the zero-cost placeholder and it is genuinely
> usable. For the published cut, run the same `script.json` through ElevenLabs
> (a low, dry, mid-40s male read) and re-run `build/tts_build.py` with the new
> stems — every downstream timing, subtitle and animation mark re-derives
> automatically.

---

## 4. Subtitles

Burned in, because 75–85% of short-form is watched muted and platform
auto-captions will not honour the brand.

- Condensed display, 800 weight, uppercase, 66–82px auto-stepped by chunk length.
- 1–4 words per chunk, max 26 characters, chunks never cross a voiceover line.
- Active word in signal orange `#FF531F`; the rest warm off-white `#E8E3DB`.
- Baseline y≈1400 — clear of the TikTok caption block, the right-hand rail and the Shorts progress bar.
- `0 4px 26px rgba(0,0,0,0.92)` shadow so they hold over the archival plates.

Also shipped as `out/subs_en.srt` / `out/subs_ru.srt` — one cue per spoken
line — for platform upload, YouTube chapters and repurposing.

---

## 5. Sound design (to add — not in the current render)

The render carries voice only. Layer these under it:

| Element | Where | Note |
|---|---|---|
| Sub drone | 0:00–1:03 | 45–55 Hz, rising ~2 dB across the video. −26 LUFS. |
| Room tone / tape hiss | throughout | −34 dB. Sells "recording", not "video". |
| Low impact | every scene cut | Short, dry thud. No cinematic whoosh. |
| Servo / shutter tick | redaction wipes, stamps | 3–5 ticks total. Sparse. |
| Reverse riser | 0:47.5–0:49.6 | Into the drawer scene. |
| **Full silence** | 0:55.9–0:56.3 | Cut everything for 0.4 s before *"It's who already knew."* The single most effective tool in the format. |
| Tail | 0:58 → out | Drone resolves, one last tick on `@VIRUS2027`. |

No melody, no beat, no trending audio. Texture only. The brand is a
transmission, not a track.

---

## 6. Publishing

| Field | Value |
|---|---|
| Master | `out/VIRUS2027_T01_the-drawer_EN_1080x1920.mp4` |
| Codec | H.264 High, CRF 17, yuv420p, 30 fps |
| Audio | AAC 48 kHz, −16 LUFS integrated, −1.5 dBTP |
| Cover frame | 0:56.6 (`IT'S WHO ALREADY KNEW.`) or 0:59.5 (2027 + mascot) |

Post the same master to all three platforms. Do not re-encode per platform;
do not add a platform watermark. Per the scaling slide, this is **one
distribution loop, not three strategies.**
