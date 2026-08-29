# TRANSMISSION 00 · "WHO WE ARE"

The pinned welcome film. Forty seconds, one camera move through the brand
gallery, and a plain answer to *what is this and who is the orange thing*.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T00_who-we-are_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T00_who-we-are_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + drone bed + hits, −14 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 40.3 s |

---

## How it's written

You asked for no AI cadence — no chains of one-word fragments. So the script
is built out of sentences that actually run on, with the hedges left in:

> *"We're not going to tell you what happens, because nobody knows, and we'd
> rather ask the question than pretend we have the answer."*

That line is the centre of the film. It's the only honest position the brand
can take, it's the one the lore manual asks for (*coincidence, prediction or
warning?*), and it's what stops a welcome video from sounding like a pitch.

The staccato is not gone entirely — it moved to the **screen**, where the
brand's own lines live: `EVERY PREDICTION LEADS TO 2027`, `YOU DON'T FIND
VIRA. VIRA FINDS YOU.` Those are quotations from the manual, set as type. The
voice stays conversational throughout.

Nothing in the read promises a price, a listing or an outcome. The only
claims are the ones the manual marks as fixed.

---

## The camera

The whole film is one journey across the gallery panorama, cut with three
brand plates. `Pano` is a real camera: you give it a normalised point of the
artwork to park at frame centre (`x`) and the panorama's rendered width in
frame pixels (`bw`, which doubles as zoom), and it eases between two of them.

Anchors in the artwork: **Vira 0.165 · the 2027 frame 0.495 · Mona Lisa 0.845.**

| t | Line | Camera |
|---|---|---|
| 0:00 | *…it keeps landing on the same year.* | tight on the 2027 painting, slow push (bw 3150→3480) |
| 0:05 | *Twenty twenty-seven.* | the push tightens (bw 3480→3880) |
| 0:06.5 | *AI timelines, disclosure files, geopolitics…* | cut to the three-emblem plate; `01 ·` `02 ·` `03 ·` stack up |
| 0:11.6 | *We're not going to tell you what happens…* | **pull all the way back — the whole gallery** (bw 1080) |
| 0:14.9 | | wide, drifting left (x .52→.46) |
| 0:18.1 | *That's what VIRUS2027 is built on.* | **travel left to Vira** (x .46→.165, bw 1400→2450) |
| 0:21.3 | *And this is Vira…* | settle on him in the gallery |
| 0:23.4 | | cut to the mascot plate |
| 0:25.3 | *Underneath the mystery, the mechanics are boring…* | cut to the burn plate |
| 0:27.6 | | the fact rows land on the ground |
| 0:30.1 | *It runs on Pulse prediction markets…* | cut to Mona Lisa, slow push (bw 2380→2680) |
| 0:35 | *Follow the signal, and remember the date.* | **pull back out into the room** (bw 2680→1320) |
| 0:37.1 | | 2027, mascot, handle, site, contract |

The order is the one you asked for: why 2027 first, then the mascot, then the
token.

---

## Two brand rules the build had to respect

**Vira's silhouette is fixed.** A 9:16 crop of the mascot render clipped his
outer spikes, which the manual forbids. He plays as a full plate instead,
pushed down the frame so the quote has somewhere to sit above him.

**The artwork is already in the palette.** These are brand renders, not stock,
so the grade is almost a no-op — 92% of their own colour kept, a little
contrast, matching grain and a vignette. Desaturating them would have removed
the one thing they already had right.

---

## What's on screen vs what's spoken

The verifiable facts are typography, not voiceover. It keeps the read human
and it puts the numbers somewhere a viewer can pause on them:

- `1,000,000,000 fixed` · `No mint function` · `80% to the community`
- `POWERED BY PULSE · PREDICTION MARKETS`
- `BEP-20 · BNB SMART CHAIN · PANCAKESWAP V2`
- the contract address, on the end card

Wording follows the manual exactly — *traded on* PancakeSwap V2, *powered by*
Pulse, never *partnered with* or *backed by*.

---

## Rebuild

```bash
python build/tts_build.py en        # voiceover, timings, SRT
python build/prep_assets.py         # grade plates, backdrops, panorama
python build/sound_design.py        # score + master mix
cd remotion && npm install
cp ../build/timing_en.json ../beats.json src/data/
cp ../assets/{grain,mascot-plate}.png ../assets/panorama*.jpg public/
cp ../assets/broll/*.jpg public/broll/
cp ../audio/en/mix_master.wav public/mix_en.wav
npm run render:en
```

Everything derives from `script.json`: rewrite a line, re-run the build, and
every camera move, overlay and sound cue re-times itself. Nothing is keyed to
a frame number.

### Changing the tour

`beats.json` holds two tracks. `shots` is the camera and tiles continuously —
each shot runs until the next begins, so you never set a duration and a
retimed read can't open a black gap. `beats` are the overlays. To linger
somewhere new in the panorama, add:

```json
{ "at": "L06", "lead": 0.0, "type": "pano",
  "x0": 0.845, "x1": 0.845, "bw0": 2400, "bw1": 2700 }
```

Keep `bw` at or under about 3900 — the panorama is 1942 px wide, and past
that the upscale starts to show.

---

## Known gaps

| Gap | Why | Fix |
|---|---|---|
| Voice is Piper, not a real read | No TTS key reachable here | Re-run `tts_build.py` against ElevenLabs stems; every timing re-derives |
| Russian version not built | English first, as agreed | Add `ru` strings to `script.json` and the element text, then re-run |
| No live burn / holder figures | The manual says those must be re-checked on-chain before every publish, so they are deliberately not baked into a pinned video | Leave them out — the pinned film should stay true for months |
