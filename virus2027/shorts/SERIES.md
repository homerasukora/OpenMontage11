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

## Four formats

All share the script → timing → picture pipeline. Pick per episode.

| | **A · Dossier** (`ep01`) | **B · Archive cut** (`ep02`) | **C · Gallery tour** (`ep00`) | **D · Reversal** (`ep03`) |
|---|---|---|---|---|
| Frame | Drawn graphics only | Graded photographs + overlays | One camera move across brand artwork | Screenshots and documents, played small |
| Reads as | A file you found | A cut of found material | A walk through the project's own world | An argument answered |
| Best for | Cold, unsettling episodes | News beats and hooks | Evergreen: who we are, what a thing means | A theory we will not endorse |
| Cost of a new episode | rewrite `script.json` + scenes | rewrite `script.json` + `beats.json` | same, plus panorama coordinates | same, plus sourcing the record |

**B is the workhorse.** It is the cheapest to iterate and the easiest to feed
— drop photographs in a folder and add a line of JSON.

**C exists because a pinned video has a different job.** It is not competing
for a scroll; it is explaining. A continuous camera move through one piece of
artwork carries an explanation better than a cut every two seconds, and it
makes the brand world feel like a place rather than a mood board.

**D is the release valve.** Some theories are too good a hook to skip and too
damaging to repeat — the ones that name a living person and treat their
illness, their face or their absence as evidence. D takes the hook and turns
it over: the theory gets the first twenty seconds told straight, in its own
order and with its own exhibits, then the film answers every exhibit with
something on the record. Same retention curve, opposite payload. The rule that
makes the series work — *never argue the conspiracy, argue the paper trail* —
is just louder here. `ep03` is the reference cut.

Two constraints are structural in D, not stylistic. Every claim before the
turn is attributed out loud (*"the internet has decided"*, *"people pulled
up"*), and every claim after it is documented. If the second half cannot be
sourced, the episode does not get made.

An earlier version of B animated a presenter's photograph as a 2D face puppet
(`ep02/build/face_rig.py`). It was dropped: without a real lip-sync model the
mouth cannot hit phonemes, and a near-real face that moves almost right is
worse than no face. The rig is kept for the day a real lip-sync render is
available.

### The element track (formats B and C)

`beats.json` maps script line ids to overlays:

```json
{ "at": "L12", "lead": 0.95, "dur": 2.70, "type": "bigtext",
  "text": "Manipulated", "accent": true }
```

Overlay types: `tag` (stackable in slots) · `stamp` · `bigtext` · `quote`
(two lines of display type) · `row` (indexed list) · `reticle` · `dossier` ·
`genome` · `redact` · `contract`.

Picture types in `shots`: `band` (photo at native aspect, full width, blurred
fill behind) · `hero` (full bleed) · `void` (textured ground) · `pano` (a pan
and zoom across a panorama, given as a normalised x and a rendered width).

Shots tile — each runs until the next begins — so no shot carries a duration
and a retimed read can never open a black gap. Every anchor is a line id plus
a seconds offset, never a frame number, so retiming the read retimes every
graphic and every sound cue with it.

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
| 00 | **Who We Are** ✅ (format C) | The pinned welcome film — why 2027, who Vira is, what the token actually is | Says outright that nobody knows what happens |
| 01 | **The Drawer** ✅ (format A) | DIA assessment 27 Mar 2020; NCMI genomic study; the Aug 2021 briefing; FOIA release 2026 | Low confidence; consensus is still natural spillover |
| 02 | **They Admitted It** ✅ (format B) | The published US lab-origin position, then the March 2020 DIA file underneath it | Low confidence, stated on screen |
| 03 | **The Eleventh Seat** | Which forecasting and risk bodies actually met before a given crisis, and what the minutes say | Committees meet constantly; most meetings mean nothing |
| 04 | **The Cancelled Exercise** | Pandemic-preparedness simulations run months before real events — dates and participants only | Simulations are routine and that is *why* they keep landing near the event |
| 05 | **Manufactured Evidence** | The Pentagon contractor report on Wuhan that was taken apart line by line (see `RESEARCH.md`) | The debunk is the episode — this is the self-ironic one |
| 06 | **The Retraction** | A major scientific letter, who organised it, and what the released emails showed | Scientists correcting themselves is the system working |
| 07 | **Low Confidence** | What intelligence confidence ratings actually mean, using real assessments | Explainer disguised as lore; the most re-shareable of the set |
| 08 | **Declassified On Schedule** | Documents released on statutory timers and what surfaced on the day | Nothing hidden — just nobody reading on time |

Episode 05 is the pressure valve for the whole series. Running it early buys
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
