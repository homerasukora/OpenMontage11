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

> *"We're not going to tell you what happens, because nobody knows — we'd
> rather ask than pretend we have the answer."*

That line is the centre of the film. It's the only honest position the brand
can take, it's the one the lore manual asks for (*coincidence, prediction or
warning?*), and it's what stops a welcome video from sounding like a pitch.

Nothing in the read promises a price, a listing or an outcome. The only
claims are the ones the manual marks as fixed.

---

## The camera

The whole film is one journey across the gallery panorama, cut with three
brand plates. `Pano` is a real camera: you give it a normalised point of the
artwork to park at frame centre (`x`) and the panorama's rendered width in
frame pixels (`bw`, which doubles as zoom), and it eases between two of them.

Anchors in the artwork: **Vira 0.165 · the 2027 frame 0.495 · Mona Lisa 0.845.**

Every cut is placed so the spoken line agrees with the label already burned
into the artwork underneath it.

| t | Line | Camera | Label on screen |
|---|---|---|---|
| 0:00 | *…it keeps landing on the same year.* | tight on the centre painting, slow push (bw 3150→3480) | `WHY 2027?` |
| 0:05 | *Twenty twenty-seven.* | the push tightens (bw 3480→3880) | `WHY 2027?` |
| 0:06.5 | *AI timelines, disclosure files, geopolitics…* | cut to the three-emblem plate | — |
| 0:11.7 | *We're not going to tell you what happens…* | **pull all the way back — the whole gallery** (bw 1080) | the room |
| 0:14.6 | | wide, drifting left | |
| 0:17.4 | *That's what VIRUS2027 is built on.* | still in the room | |
| 0:20.5 | *And this is Vira…* | **travel left, arriving as he is named** (x .50→.165) | `WHO IS VIRA?` |
| 0:22.9 | | cut to the mascot plate | |
| 0:24.5 | *…the mechanics are boring, and the supply only shrinks.* | cut to the burn plate | `THE SUPPLY ONLY SHRINKS` |
| 0:28.9 | *It's a BNB Chain token running on Pulse…* | cut to Mona Lisa (bw 1820→1980) | `TOKENOMIC` |
| 0:29.5 | | the three token facts land above the plate | |
| 0:34.5 | *Follow the signal, and remember the date.* | **pull back out into the room** (bw 1980→1240) | |
| 0:36.7 | | 2027, mascot, handle | |

The order is the one you asked for: why 2027 first, then the mascot, then the
token. Two script lines were rewritten to make the last two land on their
labels — the supply line now says *"the supply only shrinks"* over the plate
that says exactly that, and the token line says *"a BNB Chain token"* over
`TOKENOMIC`.

---

## No edge darkening, and no captions of my own

Two things were stripped out of this cut:

**Every vignette and gradient is gone** — the prep-stage vignette, the blurred
backdrop's vignette, the top and bottom gradients over each plate, the void's
radial falloff and the ground vignette. The artwork already falls off into
black at its own borders; a second darkening on top was closing the frame in.
`vignette()` survives in `prep_assets.py` as a no-op so the pipeline still
reads the same as the other episodes.

**The only text I add is the three token facts.** No file numbers, no
timecode, no `ACCESS: PARTIAL`, no shot index, no section tags, no pull
quotes. Everything else on screen is either a spoken subtitle or type that
was already painted into the artwork. The brand end card keeps `2027`, the
slogan and the handle; the site and contract moved to the pinned comment,
where they can be corrected without re-rendering.

## Two brand rules the build had to respect

**Vira's silhouette is fixed.** A 9:16 crop of the mascot render clipped his
outer spikes, which the manual forbids. He plays as a full plate instead, with
the whole character in frame.

**The artwork is already in the palette.** These are brand renders, not stock,
so the grade is almost a no-op — 92% of their own colour kept, a little
contrast and matching grain, no vignette. Desaturating them would have removed
the one thing they already had right.

---

## What's on screen vs what's spoken

Three numbers are typography rather than voiceover — it keeps the read human
and puts them somewhere a viewer can pause on:

`1,000,000,000 fixed` · `No mint function` · `80% to the community`

They land on the `TOKENOMIC` plate, which is the one moment in the film where
words, artwork label and numbers all say the same thing. The chain, the DEX
and the contract are spoken or left to the pinned comment; wording follows the
manual exactly — *traded on* PancakeSwap V2, *powered by* Pulse, never
*partnered with* or *backed by*.

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
