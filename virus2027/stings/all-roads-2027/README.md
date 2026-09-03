# ALL ROADS → 2027 · sting

Fifteen seconds, 9:16, no voice. One orange line runs from the first frame to
the last and everything else hangs off it.

| | |
|---|---|
| **Master** | `out/VIRUS2027_STING_all-roads-2027_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_STING_all-roads-2027_upload.mp4` |
| **Audio** | `audio/mix.wav` — drone, node ticks, riser, hit. −14 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 15.0 s (450 frames) |
| **Runtime engine** | Remotion — locked at proposal, both engines were available |

---

## The one line

There is literally one polyline in this film. It lives in a 6000 px world in
`geom.ts`, the camera slides along it, and the stroke is revealed by dash
offset — never a new line per section, never a cut. That is the whole
structural idea and everything else defers to it.

Nodes are **indices into that point list**, not frame numbers and not x
coordinates. `NODES = [1, 4, 7, 10, 13]`. The copy, the camera keyframes and
the sound cues all address the same five indices, which is why they cannot
drift apart: move a node in `PATH` and the picture, the timing and the score
follow it.

Two details keep it from reading as a price chart, which the brief rules out:

- **It undulates.** Each leg drifts thirty to seventy pixels off the baseline.
  A dead-straight line reads as an axis.
- **It is ticked, not plotted.** Faint perpendicular marks every 96 world px,
  taller on every fifth, with no numbers on them. It measures time, not value.

A ghost of the full path sits underneath at 8.5% opacity. It costs nothing and
it does two jobs: the frame is composed before the stroke arrives, and you can
see the line is going somewhere specific.

### The camera

`HEAD_X = 620` — the head of the line stays at the same place in frame for the
whole film, so the world moves and the subject doesn't. At the last node the
camera stops (`CAMERA_MAX`) while the line keeps going, which is what lets the
stroke shoot out of the top of the frame instead of the frame chasing it.

| t | Node | On screen |
|---|---|---|
| 0:00–0:03 | 1 | `08.2026 // SIGNAL ORIGIN` · the token floating at the first node |
| 0:03–0:06 | 2 | `ON-CHAIN TRACE` · fixed supply / no mint / burn active · the V being scanned |
| 0:06–0:09 | 3 | `PREDICTIONS GO ON-CHAIN` · `PULSE // multiple markets` · four faint fragments |
| 0:09–0:12 | 4 | `DIFFERENT SIGNALS.` → `SAME DATE.` · faint lines leaning in · Vira watching |
| 0:12–0:13.4 | 5 | `ALL ROADS LEAD TO 2027`, everything else stepped back |
| 0:13.4–0:13.6 | — | the line turns vertical and leaves the frame, analogue tear |
| 0:13.6–0:15 | — | V mark · `2027` · `SOMETHING IS COMING.` · `$VIRUS2027` |

The four possibilities in section three — `AI?` `MARKETS?` `DISCLOSURE?`
`2027?` — top out at 16% opacity and never resolve. They are questions the
brand is asking, not claims it is making, and the opacity is the only thing
enforcing that.

---

## The two brand marks

Neither is redrawn, recoloured or reproportioned. `prep_assets.py` only
removes background.

**The V** arrived as a PNG that already carried a correct alpha channel. The
first pass here keyed it off luminance anyway, which was wrong twice over: it
would have pasted an opaque black square over the composition, and any keyer
touching the colour channels risks shifting the ivory. The stage now uses the
source alpha untouched and only trims. Trimming needed care too — the mark's
distressed paper has stray specks in the far corners, so a plain alpha bbox
never trims. Projecting alpha onto each axis and keeping rows and columns with
a real run of ink finds the glyph and leaves the specks outside the crop.
841 × 496, ink still rgb(235, 225, 210).

**The coin** is luma-keyed, not feather-cropped. It was photographed on dark
velvet that is close to but not the same as the film's ground, so a
rectangular feather put a faint square around it; keying on brightness
follows the actual silhouette including the milled edge. It floats rather
than rests — a coin sitting on the timeline reads as a prop, and this one is
the subject of the line being spoken over it. A gleam sweeps across it,
masked to its own alpha so the light never spills past the rim.

**Vira** is a feathered crop of the original render rather than a matte. His
plate background is near-black and the film's ground is `#090806`, so the
feather disappears into it — and unlike a luma matte it cannot eat his dark
legs and shoes. The window holds every spike and both feet, which the manual
fixes as his silhouette. He stands *on* the line at the convergence beat; his feet
are placed against the path's own y, not against a guessed baseline. He used
to open the film too, but the first line is about the token arriving
on-chain, so the token opens it and he keeps the beat where somebody is
watching something happen.

The scan plate in section two is anchored to the **frame**, not to the node's
world position. Section two spends its whole length travelling *toward* node
two, so a world-anchored plate sat off the right edge for all but the last
half second of it. Parked just ahead of the head of the line, it rides along
with the scan and stays in shot.

---

## Analogue layer

Everything in `fx.tsx` sits on top and none of it darkens the edges — the
ground is already `#090806` and a vignette on that only closes the frame in.

Grain scrolls from a seamless tile at 14% overlay. Scan lines are a 3 px
repeating gradient drifting a third of a pixel per frame so they never lock to
the pixel grid. CRT flicker is a continuous ±5% wobble plus an occasional
deeper dip. Dust is seven specks resampled every four frames, with a hair of a
scratch about one bucket in five. The tear at 13.4 s splits chroma and offsets
five horizontal slices; a much smaller version of it fires at random about 3%
of frames, which is what keeps the picture feeling carried by something old.

---

## Score

Four synthesised sounds, no samples and no voice — nothing here reaches a
sample library and a fifteen-second sting only needs four.

`bed` three detuned sines beating against each other, swelling toward the
end · `tick` a soft wooden knock per node landing · `riser` a tonal glide up
through a harmonic stack, 1.7 s into the hit · `hit` pitch-dropping thump
with a mid-range transient.

**There is no broadband noise anywhere in the score, deliberately.** The
first version built its air, its node clicks, its riser and the crack on the
hit all out of white noise. Individually each was defensible; stacked, they
read as fifteen seconds of hiss sitting right where the ear is most
sensitive. Every one is a tuned partial now and the master rolls off above
8 kHz, which took energy over 6 kHz from −23 dB to −75 dB. If a future cue
needs grit, shape it from a low partial and drive, not from a noise
generator.

The cue list mirrors `KEYS` in `Sting.tsx`. There is a 160 ms duck to 22%
right before the hit — the silence is what makes it land.

Loudness needed a third pass. Two-pass `loudnorm` still left this bed about a
unit light (its gating and a slowly swelling bed disagree), so the stage
measures what actually came out and closes the gap with a plain gain behind
the limiter.

---

## Rebuild

```bash
python build/prep_assets.py     # cut out the marks, emit the grain plate
python build/sound_design.py    # score + master
cd remotion && npm install
cp ../assets/{grain,logo-v,mascot-plate}.png ../audio/mix.wav public/
npx remotion render src/index.tsx Sting \
  ../out/VIRUS2027_STING_all-roads-2027_1080x1920.mp4 --codec h264 --crf 17
```

To retime the tour, move the second column of `KEYS` in `Sting.tsx` and the
matching entry in `NODES` in `sound_design.py`. To reshape the road, edit
`PATH` in `geom.ts` — ticks, camera, node markers and progress all derive from
it.

---

## Known gaps

| Gap | Why | Fix |
|---|---|---|
| 1:1 version not built | The brief was corrected to 9:16 mid-message | `W`/`H` in `theme.ts` plus new y positions for the copy; the line geometry is width-independent |
| Marks are raster, not vector | Supplied as PNG | Drop in an SVG and `Logo` takes it unchanged |
