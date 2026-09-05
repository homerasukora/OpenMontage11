# TRANSMISSION 05 · "THE LINES"

Format D held open. The chemtrail theory gets its hook and its exhibits, the
official explanation and the cloud-seeding concession are both spoken, and
the film stops on the one observation that keeps the argument going rather
than resolving it.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T05_the-lines_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T05_the-lines_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + bed + hits, −14.6 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 29.3 s · no end card |

---

## The argument

| The theory says | The record says |
|---|---|
| The lines aren't exhaust; something is being sprayed on the cities below | They're contrails — water vapour from the engines freezing into ice |
| Planes are fitted with spray equipment | True, and it is not a secret: cloud seeding is an ordinary licensed industry and US operators report every operation to NOAA |
| Two planes cross the same sky and only one leaves a trail | True — and this cut stops there, on purpose |

**The official explanation is not CO₂.** CO₂ is an invisible gas and could
not make a visible line; the trail is water and ice. Getting that wrong in
the script would have handed the comments a real error to argue with, which
is the one thing this format cannot afford.

**The concession comes early, on purpose.** `L04` gives away the strongest
reply the theory has — *planes really do spray things* — before anyone can
make it, and shows the real hardware doing it. A film that only says "no" to
that loses the argument in the comments; one that says "yes, and here is the
paperwork" keeps it.

**The ending is deliberately open, and that was an editorial decision, not an
omission.** Everything in the film is either attributed to the theory or
true — the official explanation is spoken at `L03` and the concession at
`L04` — but `L06` is left unresolved and the last line is *maybe the truth
comes out soon*.

There is an answer to `L06`, and an earlier cut of this episode carried it:
a contrail only persists in air already cold and wet enough to hold it, in a
layer often only a few hundred metres thick, so a flight level above or below
it leaves nothing. Four lines of script, about twelve seconds. It is in git
history, and putting it back is a `script.json` edit and a re-run — the
pipeline re-times the picture and the score on its own.

---

## The cut

Ten shots from three phone clips and four photographs. The second half
deliberately reuses the same two clips rather than escalating to new footage
— the point being made is that the same sky explains itself.

| t | Line | On screen |
|---|---|---|
| 0:00 | *There's a theory that the lines planes leave behind aren't exhaust…* | the pine-and-sun photograph, full bleed |
| 0:02.6 | *…but something sprayed on the cities below.* | trails over a skyline |
| 0:05.1 | *They've been photographed for thirty years…* | **the cabin photograph** — the theory's most-shared exhibit |
| 0:07.4 | *…grids over airports, crosses over capitals.* | a sky full of them |
| 0:10.1 | *The official answer is contrails…* | one trail against the sun |
| 0:14.6 | *Planes do spray things — cloud seeding is real…* | **a seeding rig on the ramp** |
| 0:19.2 | **But here's what keeps the theory alive.** | void · Vira |
| 0:21.5 | *Two planes cross the same sky…* | two trails crossing |
| 0:24.1 | *…one leaves a trail for hours, the other nothing.* | a single trail high up |
| 0:26.6 | *Maybe the truth comes out soon.* | the widest sky in the cut · Vira · and it ends there |

---

## Carrying the brand through somebody else's footage

Every frame of this episode is found material, and this cut deliberately
strips the two obvious ways of stamping it: **there is no top mark and no end
card.** The film stops on its last line the way the script does.

What is left is **Vira, twice** — once on the turn, once on the close. He is
not narrating and not reacting; he stands at the edge of frame the way he
does in the gallery. That, the type, the grain and the crop marks are the
whole brand signature here, which is a harder test of the style than a logo
bug would be.

**Two removals.** The wing clip opens with burned-in text for its first three
and a half seconds, so every cut from it starts later. The third clip carries
a handle that alternates between two fixed positions; both are removed with
`delogo`, which rebuilds the patch from its border. Both boxes are cut
generously — a tight one left the `@` showing — and every window taken from
that clip is sky-dominant, because `delogo` vanishes into open sky and smears
anything with structure. The hook photograph had its own handle burned into
the right edge; the source is trimmed before the cover-crop, which costs a
roofline that was never the subject and is cleaner than patching open sky.

### Vira

He arrives as a PNG that already carries a correct alpha channel, so nothing
here is keyed or matted and his colour is untouched — the file is only
trimmed to his silhouette so the composition can position him by his own
edges rather than by a square of empty pixels.

That replaced a flood-fill matte built from the old render, and it removed
the problem the matte existed to manage: with a real alpha he sits over open
sky as cleanly as he sits over the ground, so the beat on the closing shot
needs no card behind him.

---

## Rebuild

```bash
python build/tts_build.py en     # voiceover, timings, SRT
python build/prep_media.py       # cut the nine shots, matte Vira, grade stills
python build/sound_design.py     # score + master mix
cd remotion && npm install
cp ../build/timing_en.json ../beats.json src/data/
cp ../assets/{grain,mascot-plate,logo-v}.png public/
cp ../assets/broll/*.jpg public/broll/ && cp ../assets/broll/sky_city_bg.jpg public/
cp ../assets/clips/*.mp4 public/clips/
cp ../audio/en/mix_master.wav public/mix_en.wav
npm run render:en
```

Everything derives from `script.json`: rewrite a line and every cut, overlay
and sound cue re-times itself. Nothing is keyed to a frame number.

---

## Known gaps

| Gap | Why | Fix |
|---|---|---|
| Voice is Piper, not a real read | No TTS key reachable here | Re-run `tts_build.py` against ElevenLabs stems; every timing re-derives |
| Clips B and C are 576×1024 upscaled 1.9× | That is what the sources are | Re-cut from higher-resolution originals; `prep_media.CUTS` is the only thing that changes |
| Russian version not built | English first, as agreed | Add `ru` strings to `script.json`, then re-run |
