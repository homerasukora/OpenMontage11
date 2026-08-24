# TRANSMISSION 02 · "THEY ADMITTED IT"

Photo-led 9:16 short. Graded archive plates, large kinetic captions, brand
overlays, voiceover and a synthesised score. No presenter.

> **COVID did not come from an animal. The United States just admitted it.**
> — and that is not the disturbing part.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T02_they-admitted-it_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T02_they-admitted-it_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + drone bed + hits, −14 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 45.5 s |

---

## The hook

You asked for maximum trigger. It is the first thing said, with the denial
before the admission:

> *"COVID did not come from an animal. The United States just admitted it."*

That rests on what is actually published — the White House's *Lab Leak: The
True Origins of Covid-19* page and the CIA's January 2025 shift to "lab origin
more likely". The video says **came out of a lab**, never *created
artificially* or *engineered as a weapon*: those are the two phrasings a reply
could kill the video with, and they are not what the government said. Same
punch, no exposed flank.

The honesty beat is on screen at 0:38 as a muted tag —
`ALL LAB ASSESSMENTS: LOW CONFIDENCE`. Sources go in the pinned comment
(`PUBLISHING.md`).

---

## Why there is no presenter any more

The previous cut animated a photograph of a person as a 2D puppet
(`build/face_rig.py` — MediaPipe landmarks, Delaunay mesh, amplitude-driven
jaw). It worked technically and looked wrong: without a real lip-sync model
the mouth cannot hit phonemes, and a near-real face that moves almost right is
worse than no face at all.

The rig is left in the repo rather than deleted, because it becomes viable the
moment a real lip-sync render is available — but nothing in the current cut
uses it.

---

## Structure

Seventeen lines, eleven picture shots, 45 seconds.

| t | Line | Picture | Overlay |
|---|---|---|---|
| 0:00 | *COVID did not come from an animal.* | coronavirus plate | tag `SARS-CoV-2` |
| 0:02 | *The United States just admitted it.* | Liberty + flag | tag `OFFICIAL POSITION · UNITED STATES`, stamp `ORIGIN: LABORATORY` |
| 0:04 | *That is not the disturbing part.* | **void** | — the frame empties on the retention line |
| 0:05.7 | *Sixteen days after the world shut down,* | medics | tag `11 MAR 2020 — PANDEMIC DECLARED` |
| 0:08 | *…the Pentagon's own intelligence agency writes a document.* | void | dossier: `U.S. DEFENSE INTELLIGENCE AGENCY` / `27 MAR 2020` |
| 0:11.5 | *Subject: one lab in Wuhan.* | **Wuhan, full bleed** | coordinate reticle, `RESEARCHER: ███` |
| 0:13.5 | *Bat coronaviruses. Infectious clones.* | bat → lab | tags `01 ·` and `02 ·` |
| 0:16.2 | *Chimeric spike genes, already engineered.* | lab | tag `03 · CHIMERIC SPIKE GENES` |
| 0:19 | *June. They run the genome… manipulated.* | void | genome readout, then `MANIPULATED` |
| 0:23.3 | *August 2021. The President is briefed.* | the empty seat | tag `AUG 2021 · THE BRIEFING` |
| 0:26 | *That conclusion, reportedly, never enters the room.* | the empty seat | censor bar wipes across, `REPORTED · WSJ` |
| 0:29 | *For six years the answer stayed one word. Unknown.* | void | `UNKNOWN` with an orange strike |
| 0:32.2 | *It took a court order to get those pages out.* | void | stamp `RELEASED 2026`, FOIA tag |
| 0:34.5 | *They didn't discover anything. They caught up to their own file.* | void | compact dossier `27 MAR 2020 / MONTH ONE` |
| 0:37.9 | *The question was never what happened.* | void | the low-confidence note |
| 0:39.8 | *It's who already knew.* | void | `WHO ALREADY KNEW?` |
| 0:41.4 | *2027.* | brand | `2027`, mascot on the zero, `@VIRUS2027` |

---

## How the pictures are treated

Every source is 650–3450 px wide. A 9:16 cover crop would have meant a 2.5–4×
upscale and visible mush, so photographs are shown as **full-width bands at
their native aspect** — 1.66× upscale at worst — with a heavily blurred,
darkened copy of the same frame filling the 9:16 ground behind them. The band
stays sharp and owns the eye; the frame is never empty. Only Wuhan has the
resolution for a full-bleed hero, so only Wuhan gets one.

The grade keeps a little of each photo's own colour so it still reads as a
photograph — 62% on the coronavirus render, which is already brand orange, and
5–14% on everything else, because clinical blue and a purple dusk are both off
palette. Then warm monochrome, contrast, grain and a vignette pull them into
one world.

Void shots are not flat black: a drifting, blurred archive wall sits under
them at 22%.

---

## Captions

Captions are the hero typography, not a subtitle track: condensed 800 weight,
uppercase, up to 108px, one to three words at a time, analytically fitted so a
line can never run off the safe edge. The live word turns signal orange and
lifts three pixels — readable even when a chunk is only on screen for 300 ms.

Baseline sits at y 1382, clear of the TikTok caption block and the right-hand
rail. Also shipped as `out/subs_en.srt`.

---

## Sound

Synthesised from noise and sine in `build/sound_design.py` — no sample library
is reachable here:

- Sub drone 46 / 69.5 / 92 Hz, 24 dB under the voice
- An impact and a whoosh on **every picture cut**, so the edit is felt as well as seen
- Ticks on tags and stamps, a pitch-swept impact on each headline
- A 1.7 s riser into the payoff
- **A hard 0.36 s mute** before *"It's who already knew"*

Cue times read from the same timing and beat files as the picture.

---

## Rebuild

```bash
python build/tts_build.py en        # voiceover, timings, SRT
python build/prep_assets.py         # grade plates + blurred backdrops
python build/sound_design.py        # score + master mix
cd remotion && npm install
cp ../build/timing_en.json ../beats.json src/data/
cp ../assets/{grain,mascot-plate,wall-officials}.png public/
cp ../assets/broll/*.jpg public/broll/
cp ../audio/en/mix_master.wav public/mix_en.wav
npm run render:en
```

## Adding more b-roll

External image hosts are blocked by this environment's egress proxy, so the
video uses only the photographs you supplied plus brand plates. To add more:
drop files into `assets/broll_src/`, run `python build/prep_assets.py` (same
grade, backdrop generated automatically), then add a shot:

```json
{ "at": "L05", "lead": 0.0, "type": "band", "src": "broll/pentagon.jpg" }
```

Shots tile automatically — each runs until the next begins, so there is never
a black gap and you never set a duration. Still wanted for this script: the
Pentagon exterior, the Wuhan Institute of Virology building, an empty
locked-down street, a White House podium, a stack of declassified files.

---

## Known gaps

| Gap | Why | Fix |
|---|---|---|
| Voice is Piper, not a real read | No TTS key reachable here | Re-run `tts_build.py` against ElevenLabs stems; every timing re-derives |
| Seven photographs only | Every image host is blocked | Drop files in `assets/broll_src/` as above |
| Russian version not built | You asked for EN first | Add `ru` strings to `script.json` and the element text, then re-run |
