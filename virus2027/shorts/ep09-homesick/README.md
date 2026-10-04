# ep09 · HOMESICK

**VIRUS2027 // TRANSMISSION 09** — 9:16, 1080×1920, 30 fps, 42.4 s, English.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T09_homesick_EN_1080x1920.mp4` — CRF 18 |
| **Upload copy** | `out/VIRUS2027_T09_homesick_EN_upload.mp4` — H.264 High 4.1, CRF 21, AAC 192k, faststart |
| **Subtitles** | burned in; sidecar at `out/subs_en.srt` |
| **Loudness** | −13.9 LUFS integrated |

A theory told straight, then the one sentence that makes it ours: the alien
question turned around, landing on the year the whole channel is about. Format
**D · Reversal**, held-open variant — no end card, Vira thinking under the
last line.

## Voice

Kokoro (`am_adam`), not Piper. The previous episodes use Piper's `ryan`, and on
this film it read as synthetic. The cause turned out not to be what it sounds
like — pitch *range* is the same (Piper 3.7 semitones of spread, Kokoro 3.3) —
but phrase shape, and one thing of ours.

What was measured, per line, on the same script:

| | Piper `ryan` | Kokoro `am_adam` |
|---|---|---|
| statements that fall at the end | 6 of 8 (two **rise**) | 8 of 8, −1.5 to −4.5 semitones |
| breaths at commas, across 8 lines | 3 | 10 |

A narrator drops the pitch at the end of a statement and breathes at a comma.
Piper did neither reliably. The other cause was the series' "analog
transmission" chain — an exciter and a 24 ms echo — which puts a comb filter on
the voice: a metallic edge on exactly the thing that needed to sound human. The
new chain is high-pass, a small low-mid cut, a little presence, gentle
compression. `am_michael` was rejected because its opening question fell 5.6
semitones, which sounds disappointed, not curious.

**This was judged on measurements, not by ear** — there is no audio output in
the environment. Kokoro is a better model than Piper for prosody, but the
number that matters is what the owner hears. `build/tts_build.py` takes the
voice as its second argument (`python build/tts_build.py en bm_george`); the
choices considered were `am_adam`, `am_michael`, `am_echo`, `bm_george`.

Other changes in the build: espeak-ng reads `1973` as "one thousand nine
hundred and seventy-three", so `script.json` has a `say` map from displayed word
to spoken form while captions keep the digits. Line edges are trimmed to 40 ms
so a line start means its first syllable. Word times are placed by syllable
weight and then each boundary is snapped to the quietest point of the real
waveform within ±90 ms. Last two lines are read slightly slower (`vo_speed`),
the rest at 1.07x. The old build is kept as `tts_build_piper.py`.

## Script

Eight lines, ~38 s of voice. Facts are in `script.json` (`editorial_note`);
the short version is that panspermia and Crick and Orgel's 1973 *Directed
Panspermia* paper are real, the "humans do not fit this planet" argument is the
theory's and not established, and the film says so in the middle (L06).

## What is new in this episode: highlights that belong to a word

The brief for this cut was that wherever the voice says something that can be
shown, the film shows it — on the word, not on the line. At "aliens" an alien
is drawn. At "backwards" a progress bar runs backwards.

**Word anchoring.** A beat or a shot may carry `"word": "aliens"` (and an
optional `"nth"` for repeats). It then starts at that word's own start time
from `timing_en.json`, plus `lead`. Matching ignores case and punctuation, so
`DNA` finds `DNA,`. **A word that is not in the line is a hard render error**:
after a script rewrite, a silent fallback to the line start would put a visual
on the wrong syllable and nobody would see it until the export. The sound
design resolves word anchors the same way, so picture and score move together.

Word times come from Piper's per-line durations distributed across words by
syllable weight, so they are good to roughly ±0.1 s, which is inside one
caption highlight. They are the same times the karaoke captions use, so a
visual and the orange caption word land together.

### The highlights

| word | element | what it is |
|---|---|---|
| "aliens" (L01) | `AlienMark` | the grey, drawn in outline — skull, almond eyes, one scan pass, two rings leaving the head |
| "arriving in a **ship**" | `Reticle` (no label) | brackets closing on the saucer in the photo |
| "coming down" | `Descent` | chevrons falling down the frame |
| "find **us**" | `Reticle` | the same brackets, now on the small figure with the torch. The film's first move is from *them* to *us* |
| "theory" | `LocationTag` | "theory · not fact". The framing, on screen |
| "backwards" | `Rewind` | a playback bar running in reverse |
| "bodies" | `BodyScan` | corner brackets and one scan line on the glowing silhouette, with a ruler |
| "planet" | `Brackets` | on the Earth flash |
| "burn" | `Figure` | UV index 11+ counting up |
| "backs give out" | `Spine` | vertebrae drawn top-down; the lumbar curve in orange is the only labelled part |
| "look at the stars" | `Constellation` | seven stars joined; the last is orange |
| "homesick" | `HomeGlyph` | a house drawn in one pass, its window lit, with a dotted line up to a star |
| "panspermia" | `WordPlate` | the word letter by letter, with its Greek halves — *pan*, everywhere; *sperma*, seed |
| "1973" | `Figure` | the year counting up |
| "Francis Crick" | `LocationTag` | name and journal |
| "DNA" | `Helix` | reused from ep08, on a scrim |
| "seeded" | `SeedTrail` | twenty seeds crossing from a small world to a larger one on a single arc |
| "aliens" (L06) | `AlienMark` + `strike` | the same alien, slashed through. Said once more, crossed out |
| "family tree" | `TreeOfLife` | Earth's tree grows by depth; one leaf, ours, is the only orange thing on it |
| "flips" | `Rewind` | the bar runs backwards a second time; the film is about one idea turned around |
| "waiting for" / "inside us" | `PulseRings` | rings contract onto the silhouette (waiting for a signal from out there), then leave it (it was inside) |
| "twenty twenty-seven" | `Figure` | 2027, "different conversations, one date" |
| "take us home" | `MascotBeat` | Vira |

`Scrim` darkens footage under a diagram so thin line work reads.
`PulseRings` gained `inward`; `Figure` gained `plain` (no thousands separator —
the year is not "2,027"); `Reticle` gained `label`; `HomeGlyph` has `flip`.

The ep08 `PulsarMap`, `Flatline` and the rest are still in `Viz.tsx`.

## Picture

Sources: three supplied clips and a photograph.

| | source | used as |
|---|---|---|
| **K** | 720×728 space montage, a new scene every 0.3–2 s | half-second flashes (sun, Earth) slowed 2x and letterboxed over a blurred copy of themselves — 1.5x upscale instead of 2.6x |
| **D** | 1920×1080 reel, **"DOTFOS" watermark** bottom centre | nine clean windows, 1.3–2.1 s, full-bleed |
| **N** | 1080×1920 reel, glowing white silhouette on a galaxy | three windows of one 9.3 s scene — the silhouette carries the three lines about bodies and about something inside us |
| **V** | 1080×2344 reel of human evolution → launch → orbit, picture letterboxed in black bars | picture cropped out (1080×640 at y 852) and used as a band at native size — no upscale. The early human on "backwards", the group under the tree of life, the rocket on "on purpose" |
| **C** | 1040×576 Earth at night from orbit, one 10.7 s scene | Earth on "planet" and again on "homesick", where the house is drawn over it |
| **F** | 1200×632 photograph, an alien and a human face to face | the first frame of the film, and again on "flips the question" — the same picture, now meaning *who is the alien*. |
| **U** | 1200×574 flying-saucer photograph | the opening of L02 and the closing shot, as a plate. It comes back at "somebody finally comes", so the film ends where it started |

**Watermark.** D's mark sits in the bottom 7% of the frame. It is removed by
cropping the bottom 8.5% before the 9:16 cover-crop rather than patched with
`delogo`: over a nebula a patch smears, a crop is exact.

**Grade.** The series rule is mono-and-orange; this is a film about the sky, so
the sky keeps some colour. D and N are hyper-saturated digital art and go to
saturation 0.30–0.34. K and the photograph are closer to natural: 0.46 and
0.58. Same warm shift on everything. N's silhouette is white and stays white.

**Scene guard.** Every window is checked in `prep_media.py` against the
detected scene boundaries of its reel and the build fails if one crosses a cut
(see ep08). K had to be detected at threshold 0.10 rather than 0.25 because it
dissolves between scenes.

Twenty-five shots over 42 s, one every ~1.7 s.

**`build/plan.py`** prints every shot with its length and the length of the
clip behind it and flags any that would run out. Run it after any change to the
script, the voice or the beat sheet. It found a real bug on first use: in
`prep_media.py` the `-t` flag sat after `-i`, which limits the *output*, so the
freeze pad was cut off and a slowed clip kept only the first 1/slow of its
window. The sun flash had been showing the first quarter-second of its source.
`-t` now precedes `-i`.

## Build

```bash
python build/prep_media.py     # trim mascot, grade, cut every window
python build/tts_build.py en   # Kokoro -> timing_en.json + SRT
python build/plan.py           # the cut: shot lengths vs clip lengths
python build/sound_design.py   # score from the same timings -> -14 LUFS
cd remotion && npx remotion render src/index.tsx TransmissionEN \
  ../out/VIRUS2027_T09_homesick_EN_1080x1920.mp4 \
  --browser-executable=$CHROME --codec=h264 --crf=17
```

Do not run `prep_media.py` while a render is in flight — it rewrites the mp4s
the renderer is reading. Fonts are self-hosted in `remotion/public/fonts/` and
load through a render-scoped hook (see ep08).

## No end card

The film ends on the saucer returning and Vira thinking under the question.
