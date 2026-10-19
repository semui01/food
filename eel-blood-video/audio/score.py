"""Score for 'Why eel is never served raw' (68 s). Music shaped to the chapters, an SFX on every visual event.
Events come from the film itself (film exports window.EVENTS -> events.json) so sound and picture share one clock."""
import sys, json
import os; HERE = os.path.dirname(os.path.abspath(__file__)); sys.path.insert(0, HERE); os.chdir(HERE)
from soundkit import *

EV = json.load(open('events.json'))
sk = Kit(duration=68, seed=11)
r = sk.rng
Dm = [50, 53, 57, 62]; Bb = [46, 53, 58, 62]; F = [48, 53, 57, 60]; C = [48, 52, 55, 60]; Gm = [43, 50, 55, 58]; A = [45, 52, 57, 61]
Fmaj7 = [53, 57, 60, 64]; Dm9 = [50, 57, 60, 64]

# ---------------------------------------------------------------- music
# 01 THE RULE: warm sushi-counter intro, darkening at "off limits"
sk.pad(Fmaj7, 0, 3.6, .45, bright=1500, att=1.0)
sk.pad(Dm9, 3.1, 3.4, .45, bright=1300)
for k, t in enumerate(EV['pop']): sk.bell([76, 79, 84][k], t, .07, pan=[-.5, 0, .5][k])
sk.pad([38, 45], 4.9, 1.6, .35, bright=400, att=.3, rel=.8)
# eel + name: underwater drone, heartbeat lives in the sfx
sk.pad([26, 38], 5.8, 7.2, .55, bright=280, att=1.2, rel=1.5)
sk.pad([50, 53, 57, 64], 6.0, 6.8, .3, bright=800, att=1.6)
for k in range(10): sk.bell(int(r.choice([74, 77, 81, 86])), 6.4 + k * .6 + r.random() * .2, .03, pan=r.uniform(-.8, .8))
sk.bell(74, EV['letters'][0], .08); sk.bell(81, EV['letters'][0] + .5, .06, pan=.4)
# 02 THE DROP: suspense pulse, no kick yet
sk.progression([Dm, Bb, Gm, A], 12.58, 19.9, bpm=90, pulse=True, bright=1000, pad_g=.38)
# inside the drop: eerie, glassy
sk.pad([50, 57, 62, 65, 69], 19.9, 5.4, .4, bright=2400, att=.6)
for k in range(9): sk.bell(int(r.choice([81, 84, 86, 89])), 20.2 + k * .5 + r.random() * .2, .035, pan=r.uniform(-.9, .9))
# 03 THE ATTACK: driving, kick lands with the contact, hats with the wound
sk.progression([Dm, Bb, F, A], 24.88, 40.7, bpm=90, pulse=True, kick_from=EV['impact'][0] - .05, hats_from=32.16, bright=1600, pad_g=.5)
# 04 THE WEAKNESS: hush, then rise into HEAT
sk.pad([43, 50, 55, 60], 40.8, 4.2, .4, bright=900, att=.8, rel=.4)
h = EV['heat'][0]
sk.pad([46, 53, 58, 62, 65], h, 3.0, .7, bright=2600, att=.02, rel=1.5)
sk.progression([Bb, F, C, Dm], h + .02, 52.1, bpm=90, pulse=True, kick_from=h + 1.0, bright=2000, pad_g=.45)
# 05 THE GRILL: tension for the whole fish, release on the grill
sk.progression([Dm, Gm, Bb, A], 52.24, 57.5, bpm=90, pulse=True, bright=1100, pad_g=.45)
sk.progression([F, C, Dm, Bb], 57.62, 65.7, bpm=90, pulse=True, kick_from=EV['land'][0], hats_from=EV['land'][0] + 1.3, bright=2400, pad_g=.5)
for k, m in enumerate([72, 76, 79, 84]): sk.bell(m, EV['chime'][0] + k * .07, .09, pan=(k - 1.5) * .3)
# end card
sk.pad([41, 53, 57, 60, 65], 65.6, 2.4, .6, bright=2200, att=.05, rel=1.6)
sk.bell(77, 65.8, .1); sk.bell(84, 66.1, .07, pan=.4)

# ---------------------------------------------------------------- sfx
for t in EV['whoosh']: sk.whoosh(t, .9, .45)
z0, z1 = EV['zoom']; sk.whoosh((z0 + z1) / 2 + .2, z1 - z0 + .6, .6); sk.rumble(z0, z1 + .05, .5, cut=260)
for t in EV['pop']: sk.click(t, .22, 1400); sk.blip(t, .1, 660, .1)
for t in EV['check']: sk.blip(t, .12, 1760, .1, pan=.3)
for t in EV['stamp']: sk.boom(t, .55, 1.0); sk.click(t, .35, 900, .05)
s0, s1 = EV['scan']; sk.whoosh((s0 + s1) / 2, s1 - s0 + .3, .3); sk.beeps(s0, s1, f=1320, every=.25, g=.04)
for t in EV['heart']: sk.boom(t, .32, .5); sk.boom(t + .2, .2, .4)
sk.ticks(EV['letters'][0], EV['letters'][1], g=.09, start_gap=.035, accel=1.0)
for t in EV['blip']: sk.blip(t, .1, 1320, .12, pan=r.uniform(-.4, .4))
sk.blip(EV['drip'][0], .18, 620, .18); sk.whoosh(EV['drip'][1] + .5, 1.1, .2, up=False)
t = EV['splash'][0]; sk.boom(t, .45, 1.0); sk.crackle(t, .35, 80, .22); sk.whoosh(t + .1, .35, .2, up=False)
for t in EV['molpop']: sk.blip(t, .06, r.uniform(1800, 2800), .08, pan=r.uniform(-.8, .8))
g0, g1 = EV['gulp']; sk.whoosh((g0 + g1) / 2, g1 - g0, .15, up=False); sk.blip(g1, .2, 180, .25); sk.boom(g1, .2, .6)
t = EV['impact'][0]; sk.boom(t, .9, 1.8); sk.click(t, .3, 1200, .04)
for t in EV['snap']: sk.click(t, .2, 2400, pan=r.uniform(-.5, .5))
b0, b1 = EV['burn']; sk.crackle(b0, b1 - b0, 520, .16); sk.rumble(b0, b1, .45, cut=180); sk.boom(b0 + .25, .5, 1.6)
sk.whoosh(EV['swell'][0] + .6, 1.3, .22); sk.hum(EV['swell'][0], 1.6, f=55, g=.18)
for t in EV['type']: sk.click(t, .12, 3000, .02); sk.click(t + .06, .08, 3400, .02); sk.click(t + .12, .08, 2800, .02)
r0, r1 = EV['riser']; sk.rumble(r0, r1, .7, cut=200); sk.whoosh(r1 - .7, 1.6, .5)
t = EV['heat'][0]; sk.boom(t, 1.3, 3.0); sk.crackle(t, 1.6, 240, .14)
sk.ticks(EV['tick'][0], EV['tick'][1], g=.12, start_gap=.14, accel=.95)
th0, th1 = EV['thermo']; sk.whoosh((th0 + th1) / 2, th1 - th0, .18)
sk.whoosh(EV['unravel'][0] + .4, .9, .3, up=False)
t = EV['shatter'][0]; sk.sparkle(t, 1.2, 120, .035); sk.click(t, .3, 1600, .05)
t = EV['pain'][0]; sk.boom(t, .65, 1.4); sk.crackle(t, .5, 90, .2)
m0, m1 = EV['multiply']; sk.sparkle(m0, m1 - m0, 220, .025)
sk.beeps(EV['alarm'][0], EV['alarm'][1], f=880, every=.4, g=.08)
t = EV['land'][0]; sk.boom(t, .6, 1.2); sk.crackle(t, .5, 160, .22)
z0, z1 = EV['sizzle']; sk.crackle(z0, z1 - z0, 2600, .1); sk.put('sfx', z0, hp(sk.noise(z1 - z0), 3500) * env(int((z1 - z0) * SR), .4, 1.2) * .06)
for t in EV['toxpop']: sk.blip(t, .06, r.uniform(2200, 3600), .07, pan=r.uniform(-.7, .7))
t = EV['final'][0]; sk.boom(t, .45, 1.2); sk.sparkle(t, .8, 60, .03)
sk.sparkle(EV['chime'][0], 1.0, 90, .03)
sk.boom(EV['endcard'][0], .5, 2.0)

sk.mix('vo_full.wav', 'mix.wav')
sk.mix(None, 'mix_novo.wav')
