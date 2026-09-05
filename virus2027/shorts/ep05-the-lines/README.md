# TRANSMISSION 05 · "THE LINES"

Format D on found footage. The chemtrail theory gets its hook and its best
exhibit, and then the one genuinely strange thing about it turns out to have
an answer more interesting than the theory.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T05_the-lines_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T05_the-lines_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + bed + hits, −14.6 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 39.4 s |

---

## The argument

| The theory says | The record says |
|---|---|
| The lines aren't exhaust; something is being sprayed on the cities below | They're contrails — water vapour from the engines freezing into ice |
| Two planes cross the same sky and only one leaves a trail | True, and it isn't the plane |
| That difference is the proof | A contrail only persists in air already cold and wet enough to hold it, and that layer is often a few hundred metres thick — a flight level either side of it and you leave nothing |

**The official explanation is not CO₂.** CO₂ is an invisible gas and could
not make a visible line; the trail is water and ice. Getting that wrong in
the script would have handed the comments a real error to argue with, which
is the one thing this format cannot afford.

**The "some planes do, some don't" observation is not dismissed.** It is the
whole reason the theory survives, it is genuinely what people are seeing, and
it has a specific answer. The film gives it the turn at `L04` and spends the
back half on it. The closing line is the thesis: the sky is reporting
humidity, not intent.

---

## The cut

Nine shots from three phone clips and two photographs. The second half
deliberately reuses the same two clips rather than escalating to new footage
— the point being made is that the same sky explains itself.

| t | Line | On screen |
|---|---|---|
| 0:00 | *There's a theory that the lines planes leave behind aren't exhaust…* | the pine-and-sun photograph, full bleed |
| 0:02.9 | | crossing trails |
| 0:05.8 | *People have photographed them for thirty years…* | trails over a skyline |
| 0:08.5 | *…grids over airports, crosses over capitals.* | a sky full of them |
| 0:10.9 | *The official answer is contrails…* | one trail against the sun |
| 0:15.5 | **But here's what keeps the theory alive.** | void · Vira |
| 0:17.8 | *Two planes cross the same sky…* | from inside the aircraft |
| 0:21.0 | *…one leaves a trail that spreads for hours, the other leaves nothing.* | a single trail high up |
| 0:23.3 | *That really happens, and it isn't the plane.* | thin, almost-empty sky |
| 0:25.7 | *A contrail only forms where the air is already cold enough…* | the long trail again |
| 0:30.2 | *…a few hundred metres thick, so fly above it and you leave nothing.* | the wing, above the cloud layer |
| 0:34.4 | *The sky isn't showing you who's spraying — it's showing you where the water is.* | trails over open sky · Vira |
| 0:36.6 | | 2027, mascot, handle |

---

## Carrying the brand through somebody else's footage

Every frame of this episode is found material, so three things do the work
the artwork normally does.

**`TopMark`** — the V and the wordmark at the top margin, present the whole
way through rather than only on the end card. It is the one thing on screen
that is unambiguously ours.

**Vira, twice.** He is not narrating and not reacting; he stands at the edge
of frame the way he does in the gallery.

**Two removals.** The wing clip opens with burned-in text for its first three
and a half seconds, so every cut from it starts later. The third clip carries
a handle that alternates between two fixed positions; both are removed with
`delogo`, which rebuilds the patch from its border. Both boxes are cut
generously — a tight one left the `@` showing — and every window taken from
that clip is sky-dominant, because `delogo` vanishes into open sky and smears
anything with structure. The hook photograph had its own handle burned into
the right edge; the source is trimmed before the cover-crop, which costs a
roofline that was never the subject and is cleaner than patching open sky.

### Matting Vira properly

The other episodes use a feathered crop of the mascot render. That works over
the brand's near-black ground and nowhere else — over a blue sky it is a dark
rectangle. `prep_media.cut_out()` builds a real matte instead:

1. Flood the background inward from the frame border over pixels within
   tolerance of the plate colour. **A luma key is wrong here** — his legs and
   shoes are nearly as dark as the plate and a key eats them; they survive
   this because they are interior pixels, not reachable from the edge.
2. Keep only the largest connected component. The render's backdrop carries
   faint concentric rings that are not near enough to the plate colour to be
   flooded, and they otherwise survive as little islands.
3. Ramp opacity by distance from the plate colour. The flood fill decides
   which pixels are his; this decides how opaque they are, and it dissolves
   the soft shadow he is rendered in without touching his shoes.

Even matted, he is a character modelled against black: over bright sky his
shoes and shaded side still read as smudges. So the beat over open sky gives
him a dark badge card, which is honest about it and matches the document
language the series already uses. Over the void he needs nothing.

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
