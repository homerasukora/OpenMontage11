# TRANSMISSION 07 · "THE CHEMISTS' WAR"

Not a theory. A documented federal programme that killed thousands of
Americans, told straight, closing on the only question it leaves behind.

| | |
|---|---|
| **Master** | `out/VIRUS2027_T07_chemists-war_EN_1080x1920.mp4` |
| **Upload copy** | `out/VIRUS2027_T07_chemists-war_EN_upload.mp4` |
| **Subtitles** | burned in, plus `out/subs_en.srt` |
| **Audio** | `audio/en/mix_master.wav` — voice + bed + hits, −14.6 LUFS |
| **Format** | 1080×1920 · 30 fps · H.264 · AAC 48 kHz |
| **Runtime** | 41.9 s · no end card |

---

## Why this one is the strongest hook the channel has

Every other episode in this format has to spend its second half separating a
claim from the record. This one doesn't, because the claim **is** the record.

| In the film | On the record |
|---|---|
| Industrial alcohol was laced to make it undrinkable | The 1906 Denatured Alcohol Act; the practice long predates Prohibition |
| Bootleggers paid chemists to strip it out | Renaturing was an industry — an estimated sixty million gallons a year were being diverted |
| In 1926 the Treasury ordered the formulas made deadlier | The Treasury ran the Prohibition Bureau; stronger formulas took effect from the start of 1927 |
| Methanol up to ten percent, plus benzene, kerosene, mercury salts, formaldehyde | The published denaturing formulas |
| Around seven hundred deaths in New York in a year | Charles Norris, chief medical examiner of New York City, for 1927 |
| He said it out loud | Norris publicly accused the government and went on doing so |
| *Anyone who drank it was a deliberate suicide* | Wayne Wheeler, Anti-Saloon League — near-verbatim |
| Ten thousand dead | The commonly cited national estimate by repeal in December 1933 |

Deborah Blum's *The Poisoner's Handbook* and her 2010 Slate piece are the
standard popular account.

**The closing question is earned.** *So what are we not being told about right
now?* would be cheap on top of a theory. On top of forty seconds of
documented history it is the only honest thing left to say, and it is why
this episode ends on Vira thinking rather than on an answer.

---

## The cut

Nineteen shots from six photographs and one silent newsreel — a cut every
2.2 seconds. Each photograph plays wide and then pushed in, which reads as
two shots and lets a forty-second film breathe on a handful of sources.

| t | Line | On screen |
|---|---|---|
| 0:00 | *…the American government deliberately poisoned the alcohol people were drinking.* | **newsreel: axes into barrels** · `1920–1933 · UNITED STATES` |
| 0:02.2 | | the sewer pour, wide, then close |
| 0:05.5 | *Industrial alcohol was already laced… bootleggers paid chemists to strip it out.* | a raid, the crate of bottles, **newsreel** |
| 0:11.6 | *So in 1926 the Treasury ordered the formulas made deadlier.* | the VOTE DRY parade, then the placard · `1926 · TREASURY ORDER` |
| 0:16.0 | *Methanol up to ten percent, plus benzene, kerosene, mercury salts, formaldehyde.* | `NO BOOZE SOLD HERE`, close, **newsreel** · `10%` |
| 0:21.2 | *In New York alone the medical examiner counted around seven hundred deaths in a year.* | **black** · `700` |
| 0:25.7 | *He said it out loud — the government knew, and kept going.* | the pour, then **newsreel** |
| 0:29.0 | *The Anti-Saloon League said anyone who drank it was a deliberate suicide.* | the VOTE DRY placard, then `BOOZE HOUNDS PLEASE STAY OUT` |
| 0:33.3 | *It ran until Prohibition ended in 1933…* | **WE WANT BEER** — the march that ended it |
| 0:35.3 | *…and the estimates run to ten thousand.* | the repeal celebration · `10,000` |
| 0:39.0 | *So what are we not being told about right now?* | black · Vira · and it ends there |

**The seven hundred land on black, on purpose.** There is no photograph of
them, and putting a crowd shot or a hospital under that number would be the
one dishonest frame in the film. An empty frame is the accurate one.

**The repeal celebration carries the death toll.** People raising glasses in
1933 under `10,000 · ESTIMATED DEAD` is the only editorialising in the
episode, and it is done with placement rather than words.

---

## The newsreel

The only motion in the film, and it is spread across four short bursts rather
than played once. A page of stills, however good, reads as a slideshow after
fifteen seconds; men swinging axes at barrels resets the eye without changing
the subject. One burst opens the film, so the first thing a viewer sees is
moving.

**Its cuts are letterboxed in `prep_media`, not in the composition** — onto a
blurred copy of themselves, at exactly the geometry the photographic bands
use: 1.22× frame width, centred at y 880, same warm tone. A viewer cannot
tell which shots are moving until they move, which is the point. Doing it at
prep time also means the composition needs no new shot type; the footage is
just another `clip`.

## The archive tone

These are the one set in the series that gets a real tone rather than a
polish. They arrive black and white; left neutral they drop a grey hole into
a warm film, and sepia is what an audience already reads as *archive*. So the
grade leans into it — 16% of the source's own value, the rest a warm
monochrome. That is a period treatment, not a manipulation: nothing in these
frames is changed but their colour temperature.

---

## Rebuild

```bash
python build/tts_build.py en     # voiceover, timings, SRT
python build/prep_media.py       # nine crops from five photographs, Vira
python build/sound_design.py     # score + master mix
cd remotion && npm install
cp ../build/timing_en.json ../beats.json src/data/
cp ../assets/{grain,mascot-plate}.png public/
cp ../assets/broll/*.jpg public/broll/ && cp ../assets/broll/pour_bg.jpg public/sky_city_bg.jpg
cp ../audio/en/mix_master.wav public/mix_en.wav
npm run render:en
```

---

## Known gaps

| Gap | Why | Fix |
|---|---|---|
| Voice is Piper, not a real read | No TTS key reachable here | Re-run `tts_build.py` against ElevenLabs stems; every timing re-derives |
| The celebration photo is 500 px wide | That is the source | It plays at `width: 1.04` to hold the upscale down; a larger scan would let it go full bleed |
| Russian version not built | English first, as agreed | Add `ru` strings to `script.json`, then re-run |
