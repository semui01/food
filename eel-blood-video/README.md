# Why Eel Is Never Served Raw — 1:08 motion short

A narrated motion-graphics explainer about the eel-blood toxin ichthyohemotoxin. It follows one drop of eel blood, tagged **DROP #001**, and then one toxin molecule, **TOXIN #001**, from the sushi counter to the grill.

| Chapter | Time | What's on screen |
|---|---|---|
| 01 · The Rule | 0:00 | Sushi counter: salmon and tuna are marked RAW ✓, eel gets an OFF LIMITS stamp. An x-ray of the eel shows its blood. The name ICHTHYO·HEMO·TOXIN is broken down as FISH·BLOOD·POISON. |
| 02 · The Drop | 0:12 | DROP #001 falls from a knife into a tiny cut on a chef's hand. The camera zooms ×250,000 into the serum, where spiked toxin molecules float among the oval, nucleated fish red blood cells. |
| 03 · The Attack | 0:25 | Split screen: a typical poison works only if swallowed, this toxin works on contact. Then a skin cross-section shows the toxin binding inside the wound, followed by burning, swelling and pain. |
| 04 · The Weakness | 0:41 | A threat profile scan ends on HEAT. The thermometer reaches 60 °C, a 5-minute timer runs, and the protein unravels and breaks apart (DENATURED). |
| 05 · The Grill | 0:52 | One drop causes extreme pain, and the whole fish turns out to be built from drops: PASSIVE HAZARD. On the grill, toxin dots are destroyed from the outside in, TOXIN #001 goes last, and the fillet is marked SAFE TO EAT. End card. |

## Files
- `out/` holds the finished videos: 16:9 and 9:16, with and without voiceover. `_hq` copies are about 86 MB and `_chat` copies are about 27 MB.
- `script.txt` is the narration. A `*word*` is a caption highlight, and `shown || spoken` is used where the caption and the speech differ.
- `film/` is the animation. It is a deterministic canvas engine with `render(t)` as a pure function of time. Open `film/index.html?play` for 16:9 or `?play&v` for 9:16. Use `?t=12.5` to view a single frame.
- `audio/score.py` is the synthesized score and SFX, timed from `audio/events.json`, which the film exports. It writes `mix.wav` (with VO) and `mix_novo.wav` (without). Voice: Kokoro `am_michael`.

## Notes
- The script's spelling "ichthohetoxin" was corrected to **ichthyohemotoxin**.
- One sentence fragment was joined into the next ("…if swallowed, this protein attacks…").
- The narration says "sixty degrees", and the captions show 60°C.
- The 60 °C / 5 min figure comes from the script. Older literature reports the toxin losing its potency from about 58 °C.
- The molecule and tissue scenes are schematic and not to scale. The heating timelapse is labelled as a simulation.
- The grill temperatures and the toxin-remaining percentages are illustrative.
