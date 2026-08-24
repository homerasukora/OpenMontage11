# VIRUS2027 // TRANSMISSION — short-form format

One shoot, three platforms. TikTok, Instagram Reels, YouTube Shorts, 9:16,
45–65 seconds. This is the 80% mystery layer from the growth deck, turned into
a repeatable weekly object.

---

## The rule that makes the format work

**Never argue the conspiracy. Argue the paper trail.**

Every episode is built the same way: find a theory people already half-believe,
then find the *documented* thing underneath it — a dated file, a lawsuit, a
retraction, a redaction, a gap between what was known and what was said. Tell
that. Concede everything the sceptics would say, out loud, in the middle of the
video. Then reframe.

This is what "a mystery you can believe in" actually looks like in a script.
Anyone can post *"they lied to you."* Almost nobody posts *"here is the
document, here is why it proves less than you want, and here is why it is still
strange."* The second one is more shareable, survives the comments, and is the
only version compatible with a brand that also runs a verifiable token.

The brand thesis falls out of it for free: **the gap between when something is
known and when it is announced is the thing a prediction market prices.** Never
say that in the video. Let the format say it.

---

## The six-beat skeleton

| Beat | Share | Job |
|---|---|---|
| **HOOK** | 0:00–0:04 | One number, one missing name. No intro, no logo, no greeting. |
| **SETUP** | ~15% | Make the artefact physical: a date, a title, a stamp. |
| **EVIDENCE** | ~25% | Three indexed facts. Rhythm tightens. |
| **TURN** | ~20% | The thing that does not fit. |
| **HONESTY** | ~15% | Concede. Rate the confidence. Name the boring explanation. |
| **PAYOFF** | ~20% | Reframe to a question nobody asked. Land on `2027`. |

Hard constraints:

- The **HONESTY** beat is not optional and never goes last. Mid-video, ~65% in.
- No living person is named in the voiceover or shown unredacted.
- No price, no ticker, no contract, no "link in bio" in the read.
- Every episode ends on the year, and on a question that is not answered.
- Sources go in the pinned comment, always, before the first reply lands.

---

## Reusable machinery

`ep01-the-drawer/` is the working template. To make episode 02, copy the folder
and change two files:

1. **`script.json`** — 16–20 lines, each with `en`, `ru`, a `beat` tag, a
   `vo_direction` note and a `gap_after` in seconds.
2. **`remotion/src/scenes/index.tsx`** — the scene bodies.

Everything else derives itself:

```
build/tts_build.py      → voiceover stems, assembled dub, per-word timings, SRT
build/prep_assets.py    → matted mascot, framed plates, grain, archive walls
remotion/src/Transmission.tsx
                        → scene cut points read straight off the voiceover
```

Scene boundaries are declared as *which line each scene opens on* (the `CUTS`
array). Rewrite a line, re-run the build, and every cut, caption and animation
mark re-times itself. Nothing is hand-keyed to a frame number.

### Scene components already built and reusable

`SceneDossier` (document + redactions + stamp) · `SceneTarget` (coordinate
reticle) · `SceneFacts` (indexed evidence rows) · `SceneGenome` (data readout +
verdict slam) · `SceneSeat` (archival plate + push-in) · `SceneHonesty`
(concession + mascot cameo) · `SceneDrawer` (object reveal) · `SceneQuestion`
(the still frame) · `SceneBrand` (2027 lockup).

Most future episodes are a re-order of these with new copy.

---

## Craft notes

- **The mascot appears once, at the concession.** He is the self-irony valve the tone-of-voice deck asks for. If he shows up during the evidence, the evidence stops being evidence.
- **One scene must not move.** In episode 01 it is `THE QUESTION`. After 50 seconds of motion, stillness is the loudest thing available.
- **Cut the audio completely for 0.4 s** before the final line. Nothing else in short-form buys that much attention for free.
- **Orange stays under ~7% of frame.** It marks the active caption word, one index number, one stamp, one rule. When everything is signal, nothing is.
- **The visual layer must not repeat the caption.** Captions carry the words; the frame carries artefacts — dates, file numbers, redactions, coordinates. The two together imply a document the viewer is not being shown.

---

## Episode backlog

Ordered by how well the paper trail holds up, which is the only ordering that matters.

| # | Working title | The documented spine | Concession |
|---|---|---|---|
| 01 | **The Drawer** ✅ | DIA assessment 27 Mar 2020; NCMI genomic study; the Aug 2021 briefing; FOIA release 2026 | Low confidence; consensus is still natural spillover |
| 02 | **The Eleventh Seat** | Which forecasting and risk bodies actually met before a given crisis, and what the minutes say | Committees meet constantly; most meetings mean nothing |
| 03 | **The Cancelled Exercise** | Pandemic-preparedness simulations run months before real events — dates and participants only | Simulations are routine and that is *why* they keep landing near the event |
| 04 | **Manufactured Evidence** | The Pentagon contractor report on Wuhan that was taken apart line by line (see `RESEARCH.md`) | The debunk is the episode — this is the self-ironic one |
| 05 | **The Retraction** | A major scientific letter, who organised it, and what the released emails showed | Scientists correcting themselves is the system working |
| 06 | **Low Confidence** | What intelligence confidence ratings actually mean, using real assessments | Explainer disguised as lore; the most re-shareable of the set |
| 07 | **Declassified On Schedule** | Documents released on statutory timers and what surfaced on the day | Nothing hidden — just nobody reading on time |

Episode 04 is the pressure valve for the whole series. Running it early buys
credibility for everything after it.

### Live thread

ODNI was reported in June 2026 to be preparing a COVID-origins release. If it
lands, cut **01-B** on the same file rather than opening a new one. Serialising
one document beats starting a new theory every week.

---

## Collaboration hook

The deck's Харитон-the-forecasting-cat idea plugs straight in: the cat picks
the answer to the episode's unanswered question. The short poses it, the collab
"answers" it, and the answer is worth nothing — which is the joke, and which is
also exactly how a prediction market feels from the outside.
