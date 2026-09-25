# ep08 · THE DARK FOREST

**VIRUS2027 // TRANSMISSION 08** — 9:16, 1080×1920, 30 fps, 39.66 s, English.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T08_the-dark-forest_EN_1080x1920.mp4` — CRF 17, 26 MB |
| **Upload copy** | `out/VIRUS2027_T08_the-dark-forest_EN_upload.mp4` — H.264 High 4.1, CRF 19, AAC 192k, faststart, 20 MB |
| **Subtitles** | burned in; sidecar at `out/subs_en.srt` |
| **Loudness** | −14.5 LUFS integrated |

A theory told straight, using our own record as the exhibit. The film does not
claim anything is out there. It claims that if the theory is right, we have
already done the one thing it warns against — and then shows the receipts,
all of which are ours.

## The name

The brief called this "Black Forest Theory". The reference video, and the
literature, call it the **Dark Forest** theory, after Liu Cixin's 2008 novel
of that name — the second book of *Remembrance of Earth's Past* (English
translation 2015). Titled and written as Dark Forest throughout, and credited
on screen at 0:04.

The credit is for the name and the strong form, not for the idea. Civilisations
staying quiet for fear of a lurking threat was already in David Brin's 1983
paper "The Great Silence". What is Liu's is the harder claim that pre-emptive
destruction is the *rational* move rather than merely that hiding is prudent —
which is the version the film describes. Written up anywhere else, say
"named after" or "popularised by", never "originated with".

## Script

Nine lines, 38.32 s of voice. Format **D · Reversal**, "held open" variant —
the theory is stated, the record answers it, and the film closes on a question
rather than a verdict.

| | t | line |
|---|---|---|
| L01 | 0.00 | There is a theory that the universe is silent because everyone out there is hiding. |
| L02 | 4.03 | It is called the dark forest, and the moment you reveal yourself, something comes for you. |
| L03 | 8.63 | So silence is the strategy, and anything old enough to find us already knows that. |
| L04 | 13.49 | We did the opposite. We have been leaking radio into space for about a century. |
| L05 | 17.82 | In 1977 we bolted a golden record to Voyager and sent it past the planets. |
| L06 | 23.20 | On the cover is a map of our star, drawn against fourteen pulsars. |
| L07 | 27.28 | Inside are photographs of us, and diagrams of how a human body is built. |
| L08 | 32.02 | To us that was reaching out. In the theory, it reads as bait. |
| L09 | 35.81 | So what if the food chain does not stop at Earth? |

## What is checkable

The theory is fiction-born and unfalsifiable, so it is framed as a theory in
the first four words and never asserted. Everything used as evidence is real:

- Radio has been leaving this planet for about a century, and the 100 LY on
  screen at 0:16 is the wavefront distance — the standard popular figure.
  **It is a headline number and the notes have to carry two caveats.** First,
  1920s AM sits around 1 MHz, below the ionospheric plasma cutoff, so most of
  it reflects back down rather than escaping; the signals that genuinely get
  out are VHF and up — FM, television, radar — which puts the real escaping
  edge in the 1940s–50s and nearer 75–85 light-years. Second, almost none of
  it is *detectable* at that range: ordinary broadcast leakage is far too
  faint, and only high-power narrowband sources (planetary radar, large
  military radars) are plausibly audible at interstellar distances. The
  spoken line says only "leaking radio into space for about a century", which
  survives both caveats; the pinned comment carries the physics.
- Voyager 1 and 2 launched in 1977 — Voyager 2 first, on 20 August, Voyager 1
  on 5 September — each carrying an identical Golden Record. Voyager 1 crossed
  the heliopause into interstellar space on 25 August 2012.
  **Do not write that Voyager 1 passed Neptune's orbit in 1989.** That date is
  Voyager *2*'s Neptune flyby. Voyager 1 never went near Neptune: after Saturn
  in November 1980 it was deflected about 35° out of the ecliptic, and it
  crossed Neptune's orbital distance around 1987. NASA's own FAQ has a loose
  collective line about "the Voyagers" passing Neptune's orbit in August 1989
  — that sentence is anchored on V2's flyby and is not evidence about V1.
- The record's cover is etched with a pulsar map locating the Sun against
  **fourteen** pulsars by their periods, written in binary against the hydrogen
  hyperfine transition so it decodes without knowing anything about us. A
  fifteenth, longer ray points at the centre of the galaxy.
- The 115 encoded images include human anatomical diagrams, a fetus, DNA
  structure, and photographs of people.
- The 1972 and 1973 Pioneer plaques carry the same pulsar map plus the nude
  figures.

None of this is disputed. That is the point of the episode.

## Picture

Sixteen shots across thirty-eight seconds — a change roughly every 2.5 s.

Sources: two supplied vertical space reels (one 1080×1920 nebula art, one
576×1024 planet flyby) and five stills, including an aerial of a deep-space
communication array and a dish transmitting to a star.

**The grade** is the one real decision. The series is mono-and-orange, and the
literal reading of that rule here would be to strip these sources to grey.
That would be wrong: this is the one episode whose subject is the sky, and the
sky is what the viewer came for. So saturation comes down to a little under
half and the whole range is pushed warm — blues fall back to steel, and the
two genuinely orange sources in the footage (the accretion disk at 0:08, the
lava-fracture planet) land on the brand accent without being pushed there.

The reels do not take the same pull. Reel A is hyper-saturated digital nebula
art and needs `sat=0.30`; reel B is close to natural and takes `sat=0.52`. The
two hot shots are held up at `sat=0.86` on purpose. See `build/prep_media.py`.

## The drawn exhibits

This episode has a problem the others did not: its evidence is not
photographable. There is no stock shot of "the pulsar map on the Voyager
record", and the two things the script actually accuses us of sending are line
drawings or nothing. So they are drawn in the frame, in the brand's own
geometry, and each one draws itself while the line is spoken — which is also
the honest thing to do. Four new components in `remotion/src/Viz.tsx`:

| element | where | what it is |
|---|---|---|
| `Flatline` | L01 | a listening trace that stays flat. The small kicks never become a carrier — that is the whole content of the sentence over it. |
| `PulsarMap` | L06 | the Golden Record cover. Fourteen ticked rays counting on one at a time, then the long orange ray to the galactic centre. Structure and count are right; the angles are a drawing of the diagram, not a working copy. |
| `Helix` | L07 | DNA, drawing downward and turning. Also on the record, and the closest thing the disc carries to the line spoken over it. |
| `Reticle` | L08 | four brackets closing on the planet, measured to its actual centroid in the plate. No flashing and no red — the argument is that being found is quiet. |

Reused from earlier episodes: `PulseRings` and `Figure` (the 100 LY count at
0:16), `LocationTag`, `Brackets`, `NodeField`, `MascotBeat`, `PlaybackBar`,
`CropMarks`.

The film goes to a near-black `void` shot twice, both times so a diagram can
be read. It is the one repeated gesture in the cut.

## Sound

Sparser than ep07 — the subject is silence, so the edit does not thud its way
through it. Shot transients are down about 20%. The pulsar map gets its own
cue: fourteen small dry ticks, one per ray, which is the sound of something
being catalogued and the only busy moment in the mix. The hard 0.36 s mute
before the last line is inherited from the series and earns its keep here.

Mastered to −14 LUFS.

## Build

```bash
python build/prep_media.py     # grade and cut everything to 1080x1920
python build/tts_build.py en   # Piper -> timing_en.json (+ word timings) + SRT
python build/sound_design.py   # score from the same timings -> -14 LUFS
cd remotion && npx remotion render src/index.tsx TransmissionEN \
  ../out/VIRUS2027_T08_the-dark-forest_EN_1080x1920.mp4 --browser-executable=$CHROME --codec=h264 --crf=17
```

Nothing is keyed to a frame number. `beats.json` addresses lines by id with a
lead in seconds, and shots tile — each runs until the next begins — so a script
rewrite re-times picture and score together and cannot open a black gap.

**Fonts are self-hosted** (`remotion/public/fonts/`) rather than fetched
through `@remotion/google-fonts`. The render runs behind an inspecting proxy
whose CA headless Chrome does not trust, so every gstatic request fails and
takes the render with it. Shipping the five woff2 files is the right answer
anyway: a film that needs the internet to typeset itself is not reproducible.

## No end card

Per standing note, the film ends on the question with Vira thinking under it.
No 2027 plate.
