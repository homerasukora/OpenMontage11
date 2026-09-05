# TRANSMISSION 06 · "THE DOORS"

Format D held open. Three real building programmes laid end to end and left
standing there — private American silos, Finland's public shelter network,
and quiet land in Patagonia — closing on the question rather than an answer.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T06_the-doors_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T06_the-doors_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + bed + hits, −14.5 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 41.8 s · no end card |

---

## Everything in it is on the record

There is no secret in this film, which is the point: it is three ordinary,
documented facts put next to each other, and the discomfort comes from the
adjacency rather than from any claim.

| On screen | Source |
|---|---|
| *apocalypse insurance* | Reid Hoffman's own phrase, from the 2017 New Yorker piece on doomsday prep among the super-rich |
| Underground shelter in Hawaii | Reported at Zuckerberg's Kauai compound in 2023 |
| Land bought in New Zealand | Thiel's holdings are a matter of public record |
| A floor of a converted missile silo | The Survival Condo, Kansas — the price bracket is the one quoted in the source footage |
| 50,000+ shelters, room for ~4.5 million | Finland's civil defence network, against a population of about 5.5 million |
| Ready in seventy-two hours | The statutory readiness requirement under Finnish law |
| Patagonian land by the hundred thousand hectares | Benetton, Lewis and Turner holdings are all documented at that scale |

**The dome compound is shown without an owner attached.** I could not verify
whose it is, so the film says only that *things get built out there that
nobody puts a name to* — which is true of the photograph itself, and is the
strongest honest version of the shot. Naming a family would have been the
one sentence in this episode that could not be defended.

**The Finnish shelters are not a panic.** They are a Cold War programme
written into building law and maintained ever since. The film doesn't say
otherwise; it just doesn't stop to explain, because the closing question is
the deliverable and explaining would answer it.

---

## The cut

| t | Line | On screen |
|---|---|---|
| 0:00 | *Billionaires are building bunkers…* | a silo cap in an ordinary field |
| 0:03.7 | *Underground shelters in Hawaii, land bought up in New Zealand…* | the surface entrance |
| 0:07.1 | *…one Silicon Valley founder called it apocalypse insurance.* | a host walking past a painted beach, underground |
| 0:10.2 | *A few million dollars gets you a floor of a converted missile silo…* | the condo interior · `$5M` |
| 0:12.8 | *…and they show you round it like a condo.* | the hosts touring the hall |
| 0:16.2 | **But the biggest one isn't private.** | void · Vira |
| 0:17.3 | *Finland has more than fifty thousand civil defence shelters…* | a shelter door on a Helsinki street · `50,000` |
| 0:20.5 | *…room for around four and a half million people. That is almost everyone in the country.* | a shelter cut into rock · `4,500,000` |
| 0:25.1 | *Under Helsinki there are car parks, swimming pools and sports halls…* | the underground hall, wide |
| 0:28.6 | *…that become a shelter in seventy-two hours.* | the same hall, pushed in · `72 H` |
| 0:32.3 | *Then there's Patagonia, where foreign billionaires have quietly bought…* | the domes |
| 0:34.9 | *…land by the hundred thousand hectares.* | the trucks below them |
| 0:37.6 | *And things get built out there that nobody puts a name to.* | tight on the domes |
| 0:40.6 | *What are they preparing for?* | back to the field · Vira · and it ends there |

The last shot returns to the first: the same ordinary ground with something
under it. That bookend is the only rhetorical device in the film.

---

## The information layer

Two things the footage cannot say on its own, so they are drawn.

**A location tag opens each country.** The film crosses three of them in
forty seconds and a shelter door could be anywhere — `KANSAS · UNITED
STATES`, `HELSINKI · FINLAND`, `PATAGONIA · ARGENTINA`. Four words, an
orange tick, a hairline that draws out, then it leaves.

**The figures count up.** Fifty thousand and four and a half million are
just noises inside a spoken sentence; on screen, running from zero, they are
the thing the viewer keeps. Four of them — `$5M` per floor, `50,000`
shelters, `4,500,000` places out of five and a half million, `72 H` from
order to ready. The count is eased rather than linear so each one settles
instead of stopping dead, and they sit at the top of frame, clear of both the
plates and the subtitles.

Neither is decoration: every number on screen is one the voiceover is saying
at that moment, and the tag is the only thing telling you which country you
are looking at.

---

## Working with the source

**One tour clip, six cuts, two problems.** The footage carries the
uploader's subtitles in a fixed band across the bottom fifth and a title card
over the first four seconds. Neither can be patched — the frames behind them
are busy interiors, where any interpolated patch smears — so both are cropped
past: every cut starts after the title clears, and the frame is trimmed to
the caption-free region and re-framed to 9:16 from inside it. That costs a
quarter of the width and a 1.4× scale on a 1080p source, which is the cheaper
of the two prices.

**Every window is a single full-frame shot.** The tour runs a stacked
two-shot for long stretches, which does not survive being re-framed to 9:16;
several passes of cuts caught those, plus one window that landed on a rack of
rifles. Choosing windows is most of the work on material like this.

**The hosts stay in frame from 0:07 to 0:15.** An earlier cut filled that
stretch with a plant room and a climbing wall and it played as stock
footage. What makes a doomsday condo unsettling is that somebody is showing
you round one, so the two men touring it carry the middle of the first act,
and the script line moved to meet them — *they show you round it like a
condo* is now what the picture is doing.

**Three stills are used twice, wide then pushed in.** A single photograph
held for six seconds dies on screen; the same photograph surveyed reads as
two shots, and nothing is added — the camera just moves.

**The landscape stills bleed past the frame edge** (`width: 1.22`). At frame
width a 16:10 photograph leaves seven hundred pixels of dead ground under it
in a 9:16 frame. The Helsinki street door stays at frame width instead: its
source is only 600 px across and any more is a visible upscale.

---

## Rebuild

```bash
python build/tts_build.py en     # voiceover, timings, SRT
python build/prep_media.py       # six cuts, six stills, Vira
python build/sound_design.py     # score + master mix
cd remotion && npm install
cp ../build/timing_en.json ../beats.json src/data/
cp ../assets/{grain,mascot-plate}.png public/
cp ../assets/broll/*.jpg public/broll/ && cp ../assets/clips/*.mp4 public/clips/
cp ../assets/broll/ar_domes_bg.jpg public/sky_city_bg.jpg
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
| The dome compound is unattributed | Could not verify the owner | If a sourced attribution turns up, it is one line of script |
| Russian version not built | English first, as agreed | Add `ru` strings to `script.json`, then re-run |
