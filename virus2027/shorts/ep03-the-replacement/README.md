# TRANSMISSION 03 · "THE REPLACEMENT"

Format C — the reversal. The theory gets forty seconds of the best case it
has, and then the record answers it. Nobody watching is left holding the
theory.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T03_the-replacement_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T03_the-replacement_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + bed + hits, −14 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 44.9 s · no end card |

---

## Why this cut exists

The brief was a video about the theory that Selena Gomez died in 2017 and was
replaced. That version isn't in this repo and isn't going to be: she is
alive, and the "evidence" the theory runs on is a photograph of her face
during treatment for an autoimmune disease.

What is here keeps the hook and changes the payload. The first twenty
seconds are the theory told straight, in the order its own posts tell it,
using its own exhibits. At `L05` it turns, and the second half answers each
exhibit with something on the public record. Retention comes from the same
place it always did; the viewer just leaves with an answer instead of a
suspicion.

**Nothing in the first half is stated as fact.** Every claim is attributed —
*"the internet has decided"*, *"people pulled up photos"*. Nothing in the
second half is anything but documented.

| The theory says | The record says |
|---|---|
| An email people say is Epstein's, dated July 2017, reads *"he has decided on Selena Gomez"* | The screenshot has never been verified — the press coverage the theory generated says so in its own headline, and the image misspells *decided* |
| She vanished for months in 2017 | She was in hospital; in September her friend Francia Raisa donated a kidney |
| She came back with a different face | She has lupus, diagnosed 2015; the corticosteroid that controls it swells the face |
| The hospital photo proves something was hidden | She published that photo herself, with a caption explaining the transplant |

---

## The edit

| t | Line | On screen |
|---|---|---|
| 0:00 | *The internet has decided that Selena Gomez died in 2017…* | the before/after comparison — the theory in one frame |
| 0:06.3 | *It starts with a screenshot people say is an Epstein email…* | the email screenshot |
| 0:09.7 | | tight on the quote line |
| 0:13.8 | *…came back with a face that didn't match.* | her own TikTok, moving |
| 0:16.4 | *People pulled up photos from 2010…* | the beauty-mark post, red circle and all |
| 0:21.0 | **Here's what gets left out.** | void |
| 0:22.8 | *…her friend Francia Raisa gave her a kidney.* | the hospital photograph |
| 0:27.9 | *She has lupus, and the steroid… swells your face.* | **the before/after again** |
| 0:31.5 | *…is one she posted herself.* | her Instagram post, caption legible |
| 0:34.8 | *…has never been verified…* | the press headline |
| 0:37.2 | *…it even spells decided wrong.* | back to the quote line |
| 0:39.9 | *…and she's still posting.* | her own TikTok again, and the film ends there |

**The before/after plate plays twice on purpose.** At `L01` it is the theory's
proof that two different women are in the picture. At `L07` it is the same
image explaining itself. That rhyme is the whole film in one cut, and it costs
nothing but a repeat.

**Two shots are live footage, and they bracket the argument.** `L03` is the
theory's claim about her face; `L10` is the answer. Both are her own posts,
cut from the same thirty seconds of it, so the film opens and closes its case
on the same source. `Clip` was added to the shot vocabulary for them.

**The source's own end card is cut out.** Her clip runs a TikTok
follow-screen from 10.25 s; both cuts stop before it, so no other platform's
furniture appears in our frame.

**This episode has no brand card.** Every other film in the series ends on
`2027 / Not just a date`; this one ends on her, mid-sentence in her own video.
A logo laid over this particular argument would read as using her, which is
the thing the cut exists to avoid. `brand_at` is now optional in
`beats.json` — leave it out and the last shot simply runs to the end.

---

## Handling the source material

Three of the exhibits were lifted out of somebody's phone-shot commentary
clip. Two rules governed that:

**No part of the original video's presenters is in this film** — not their
faces, not their voices, not their edit. Only the exhibits they had on screen,
cropped out and re-graded.

**Their handle is not in our frame.** `prep_assets.scrub()` paints the
uploader's watermark out using the median colour of the strip beside it,
following the local gradient — a blur leaves a visible rectangle wherever the
background is flat, which is exactly where these watermarks sit.

**The grade is the lightest in the series.** These are documents, and a
screenshot that has obviously been colour-graded stops working as a
screenshot: 86–92% of each source's own colour survives. Most plates also
render narrower than the frame (`width` on `Band`), because the sources are
340–580 px wide and a full-width blow-up turns their type to mush. Playing
them small keeps them sharp and makes them read as pinned evidence.

---

## Rebuild

```bash
python build/tts_build.py en        # voiceover, timings, SRT
python build/prep_assets.py         # crop, scrub, grade, backdrops
python build/sound_design.py        # score + master mix
cd remotion && npm install
cp ../build/timing_en.json ../beats.json src/data/
cp ../assets/grain.png ../assets/mascot-plate.png public/
cp ../assets/broll/*.jpg public/broll/ && cp ../assets/broll/theory_bg.jpg public/
cp ../assets/she_posts.mp4 public/
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
| Russian version not built | English first, as agreed | Add `ru` strings to `script.json`, then re-run |
| The press card is a screengrab of a screengrab | It was the only copy in the supplied material | Re-shoot from the outlet's own page before publishing, if a cleaner one is wanted |
