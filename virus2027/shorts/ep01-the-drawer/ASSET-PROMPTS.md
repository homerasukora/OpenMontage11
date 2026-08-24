# Archival plate prompts

The shipped render is graphic — type, redactions, geometry, and the brand's own
key art. That is deliberate: it is fast, it is free, it is unmistakably
VIRUS2027, and it can never produce an accidental likeness of a real person.

If you want to upgrade individual scenes to photographic plates, generate them
with these. They target FLUX / Midjourney / Imagen. Each is written to land
inside the style guide's image rules: warm monochrome, strong but uncrushed
contrast, film grain and scan damage, visual silence around the subject, and at
most one signal-orange object per frame.

---

## Shared style suffix

Append to every prompt:

> warm monochrome, near-black `#090806` ground, warm off-white highlights, heavy film grain, photocopy texture, dust and fine scratches, scan interference, strong contrast without crushed blacks, generous negative space, one small signal-orange `#FF531F` element only, archival surveillance framing, no text, no logos, no watermark, no recognisable faces, 9:16 vertical

**Negative:** `neon, cyan, purple, teal, glossy, glassmorphism, cyberpunk, HDR, lens flare, gore, medical imagery, biohazard symbols, masks, syringes, hospital, crowds, identifiable faces, celebrity likeness, modern UI, stock-photo lighting`

---

## Per scene

**01 · HOOK** — optional plate behind the `16`
> An empty government corridor at night photographed on expired 35mm film, one fluorescent fitting failing overhead, a closed unmarked door at the far end, deep shadow filling the lower two-thirds of the frame

**02 · DOSSIER** — behind the document card
> A stack of declassified paper files on a steel desk shot from directly above, edges foxed and creased, black censor bars across the typed lines, one manila folder half open, single desk lamp raking from the left

**03 · TARGET** — behind the reticle
> A dark aerial reconnaissance photograph of a low industrial research campus, printed on grainy paper, crop marks and registration ticks at the frame edges, faint contour lines, nothing legible

**05 · GENOME** — behind the base-pair field
> A macro photograph of an early autoradiograph sequencing gel, dense horizontal bands, uneven exposure, dust and emulsion scratches, extremely shallow depth of field

**06 · SEAT** — currently the brand's *Eleventh Seat* key art. Keep it. If you must regenerate:
> A long empty boardroom table photographed from the foot end, one high-backed leather chair at the head turned slightly away, every other chair pushed in, single overhead source, the room falling to black at the edges, no people

**08 · DRAWER** — behind or instead of the graphic cabinet
> A grey steel filing cabinet drawer pulled halfway out in a dark records room, dense manila tabs inside, dust suspended in a single shaft of light, shot slightly from below on a long lens

**09 · QUESTION** — leave it black. The one still frame in the video should stay empty.

---

## House rules

- **Never** generate a recognisable public figure. The existing key art uses redaction bars over faces; anything new must not need them.
- **Never** generate victims, hospitals, protests, or real events. The style guide bans it and the platforms will too.
- One orange object per plate — a light, a tab, a marker. Not a colour grade.
- Grade every plate to `grayscale(1) sepia(0.08) contrast(1.16) brightness(0.78)` on import so plates and graphics sit in the same world.
- Generate at 1080×1920 or larger and drop into `remotion/public/`; scene components already expect `objectFit: cover` with a slow push-in.
