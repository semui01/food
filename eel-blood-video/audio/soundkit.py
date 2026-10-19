"""Tiny synthesis kit for scoring a motion graphic: music bed + SFX timed to visual events, mixed under narration.

Usage in a per-film score.py:
    import sys; sys.path.insert(0, '<skill>/scripts'); from soundkit import *
    sk = Kit(duration=74)
    sk.pad([50, 53, 57, 62], t0=0, d=4, g=.5)          # MIDI notes; Dm
    sk.whoosh(5.0); sk.boom(9.0); sk.click(31.2)
    sk.mix('vo_full.wav', 'mix.wav')                    # with narration (music ducks under the voice)
    sk.mix(None, 'mix_novo.wav')                         # music-forward version without narration
Events should come from the film's window.EVENTS (stills.js with EV=1) so sound and picture share one clock.
"""
import numpy as np, soundfile as sf
from scipy.signal import butter, sosfilt, fftconvolve

SR = 48000
def mf(m): return 440 * 2 ** ((m - 69) / 12)
def tt(d): return np.arange(int(d * SR)) / SR
def lp(x, f, o=2): return sosfilt(butter(o, f, 'low', fs=SR, output='sos'), x)
def hp(x, f, o=2): return sosfilt(butter(o, f, 'high', fs=SR, output='sos'), x)
def bp(x, a, b, o=2): return sosfilt(butter(o, [a, b], 'band', fs=SR, output='sos'), x)
def env(n, a, r, curve=1.0):
    e = np.ones(n); na = max(1, int(a * SR)); nr = max(1, int(r * SR))
    e[:na] = np.linspace(0, 1, na) ** curve; e[-nr:] *= np.linspace(1, 0, nr) ** curve; return e
def sweep_lp(x, f0, f1, blk=480):
    out = np.zeros_like(x); zi = None; nb = len(x) // blk + 1
    for k in range(nb):
        seg = x[k * blk:(k + 1) * blk]
        if not len(seg): break
        sos = butter(2, min(f0 * (f1 / f0) ** (k / max(1, nb - 1)), SR / 2.2), 'low', fs=SR, output='sos')
        if zi is None: zi = np.zeros((sos.shape[0], 2))
        y, zi = sosfilt(sos, seg, zi=zi); out[k * blk:k * blk + len(seg)] = y
    return out

class Kit:
    def __init__(self, duration, seed=4):
        self.N = int(duration * SR); self.dur = duration
        self.mus = np.zeros((self.N, 2)); self.sfx = np.zeros((self.N, 2)); self.rng = np.random.default_rng(seed)
    def noise(self, d): return self.rng.standard_normal(int(d * SR))
    def put(self, buf, t0, sig, pan=0.0, g=1.0):
        buf = self.mus if buf == 'mus' else self.sfx if buf == 'sfx' else buf
        i = int(t0 * SR)
        if sig.ndim == 1:
            sig = np.stack([sig * np.cos((pan + 1) * np.pi / 4), sig * np.sin((pan + 1) * np.pi / 4)], 1) * 1.414
        if i < 0: sig = sig[-i:]; i = 0
        n = min(len(sig), self.N - i)
        if n > 0: buf[i:i + n] += sig[:n] * g

    # ---------------- music
    def pad(self, notes, t0, d, g=.5, bright=1800, att=1.2, rel=1.6, spread=.5):
        t = tt(d); L = np.zeros(len(t)); R = np.zeros(len(t))
        for m in notes:
            for k, det in enumerate((-.09, 0, .09)):
                f = mf(m) * 2 ** (det / 12); ph = self.rng.random() * 6.28
                s = sum(np.sin(2 * np.pi * f * h * t + ph * h) / h for h in range(1, 8)); p = (k - 1) * spread
                L += s * (1 - p); R += s * (1 + p)
        e = env(len(t), att, rel, 1.5)
        self.put('mus', t0, np.stack([lp(L, bright) * e, lp(R, bright) * e], 1) / (len(notes) * 6), g=g)
    def pluck(self, m, t0, d=.4, g=.3, cut=1200, pan=0):
        t = tt(d); f = mf(m); s = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 10))
        self.put('mus', t0, lp(s, cut) * np.exp(-t * 7), pan, g)
    def bell(self, m, t0, g=.08, pan=0, d=2.5, buf='mus'):
        t = tt(d); f = mf(m)
        s = np.sin(2 * np.pi * f * t) + .5 * np.sin(2 * np.pi * f * 2.76 * t) * np.exp(-t * 3) + .3 * np.sin(2 * np.pi * f * 5.4 * t) * np.exp(-t * 6)
        self.put(buf, t0, s * np.exp(-t * 1.6) * env(len(t), .004, .2), pan, g)
    def kick(self, t0, g=.45):
        t = tt(.5); f = 45 + 90 * np.exp(-t * 30)
        self.put('mus', t0, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8), 0, g)
    def hat(self, t0, g=.05, pan=0):
        self.put('mus', t0, hp(self.noise(.06), 7000) * np.exp(-tt(.06) * 70), pan, g)
    def progression(self, chords, t0, t1, bpm=90, pulse=True, kick_from=None, hats_from=None, bright=1600, pad_g=.5):
        """Chords (lists of MIDI notes, root first) one bar each from t0 to t1, with optional 8th-note bass pulse, kick and hats."""
        bar = 240 / bpm; beat = bar / 4; t = t0; i = 0
        while t < t1:
            ch = chords[i % len(chords)]; self.pad(ch, t, bar + 1.4, pad_g, bright=bright); r = ch[0] - 12
            for b in range(8):
                tb = t + b * beat / 2
                if tb >= t1: break
                if pulse: self.pluck(r, tb, .4, .3 if b % 2 == 0 else .2, cut=900)
                if kick_from is not None and tb >= kick_from and b % 2 == 0: self.kick(tb)
                if hats_from is not None and tb >= hats_from: self.hat(tb + beat / 4, pan=.3)
            t += bar; i += 1

    # ---------------- sfx
    def whoosh(self, t0, d=.9, g=.5, up=True):
        n = self.noise(d); s = sweep_lp(n, *((300, 6000) if up else (6000, 200))) * np.sin(np.linspace(0, np.pi, len(n))) ** 2
        self.put('sfx', t0 - d / 2, np.stack([s * np.linspace(1.2, .8, len(s)), s * np.linspace(.8, 1.2, len(s))], 1), g=g)
    def boom(self, t0, g=1.0, d=2.5):
        t = tt(d); f = 32 + 60 * np.exp(-t * 6)
        s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2) + lp(self.noise(d), 400) * np.exp(-t * 5) * .6
        self.put('sfx', t0, s * env(len(s), .002, .3), g=g)
    def click(self, t0, g=.3, f=2500, d=.03, pan=0):
        t = tt(d); s = np.sin(2 * np.pi * f * t) * np.exp(-t * 200) + hp(self.noise(d), 3000) * np.exp(-t * 300) * .5
        self.put('sfx', t0, s, pan, g)
    def blip(self, t0, g=.15, f=1320, d=.12, pan=.2):
        t = tt(d); self.put('sfx', t0, (np.sin(2 * np.pi * f * t) + .4 * np.sin(4 * np.pi * f * t)) * np.exp(-t * 35), pan, g)
    def ticks(self, t0, t1, g=.12, start_gap=.16, accel=.93):
        """Accelerating counter ticks."""
        t, k = t0, 0
        while t < t1: self.click(t, g, 3200, pan=.5); k += 1; t += max(.035, start_gap * accel ** k)
    def sparkle(self, t0, d=1.3, n=140, g=.03):
        for _ in range(n): self.blip(t0 + self.rng.random() ** 1.5 * d, g, self.rng.uniform(2500, 7000), .05, self.rng.uniform(-.9, .9))
    def crackle(self, t0, d=2.0, n=260, g=.2):
        for _ in range(n): self.put('sfx', t0 + self.rng.random() ** .7 * d, hp(self.noise(.008), 4000) * np.exp(-tt(.008) * 500), self.rng.uniform(-.9, .9), g)
    def beeps(self, t0, t1, f=880, every=.5, g=.07):
        for k in range(int((t1 - t0) / every)):
            t = tt(.16); self.put('sfx', t0 + k * every, np.sign(np.sin(2 * np.pi * f * t)) * env(len(t), .005, .02) * .5, .3, g)
    def rumble(self, t0, t1, g=1.0, cut=140):
        d = t1 - t0; self.put('sfx', t0, lp(self.noise(d), cut) * np.linspace(0, 1, int(d * SR)) ** 2, 0, g)
    def bed(self, t0, d, cut=900, g=.25):
        """Wind / room tone."""
        w = lp(self.noise(d), cut) * (0.6 + .4 * np.sin(tt(d) * .9)) * env(int(d * SR), 1.5, 2); self.put('sfx', t0, w, 0, g)
    def hum(self, t0, d, f=58, g=.18, cut=600):
        t = tt(d); s = sum(np.sin(2 * np.pi * f * h * t) / h for h in range(1, 6)) * (0.7 + .3 * np.sin(2 * np.pi * 7 * t))
        self.put('sfx', t0, lp(s, cut) * env(len(s), .6, 1.5), 0, g)
    def tape(self, t0, d, g=.12, rev_from=None, src_span=None):
        """Rewind/fast-forward: band noise plus (optionally) the music from src_span played backwards at speed."""
        self.put('sfx', t0, bp(self.noise(d), 800, 5000) * env(int(d * SR), .05, .2), 0, g)
        if src_span:
            a, b = src_span; snip = self.mus[int(a * SR):int(b * SR)]
            if rev_from: snip = snip[::-1]
            idx = np.arange(0, len(snip) - 1, (b - a) / d); i0 = idx.astype(int); fr = (idx - i0)[:, None]
            r = snip[i0] * (1 - fr) + snip[i0 + 1] * fr; r = r[:int(d * SR)]
            self.mus[int(t0 * SR):int((t0 + d) * SR)] *= .15
            self.put('mus', t0, r * env(len(r), .05, .2)[:, None])

    # ---------------- mix
    def mix(self, vo_path, out, music_gain=None, sfx_gain=None, reverb=(.35, .22), fade_out=1.2):
        N = self.N
        ir_t = tt(2.6); ir = np.stack([self.rng.standard_normal(len(ir_t)) * np.exp(-ir_t * 2.4) for _ in range(2)], 1)
        ir[:int(.01 * SR)] = 0; ir /= np.sqrt((ir ** 2).sum(0))
        rv = lambda x, w: x + np.stack([fftconvolve(x[:, c], ir[:, c])[:N] for c in range(2)], 1) * w
        mus = rv(self.mus, reverb[0]); sfx = rv(self.sfx, reverb[1])
        mus /= np.max(np.abs(mus)) + 1e-9; sfx /= np.max(np.abs(sfx)) + 1e-9
        if vo_path:
            vo, vsr = sf.read(vo_path)
            if vo.ndim > 1: vo = vo.mean(1)
            vo = np.interp(np.arange(N) / SR, np.arange(len(vo)) / vsr, vo, right=0)
            vo = hp(vo, 70); vo = vo / (np.max(np.abs(vo)) + 1e-9) * .8
            venv = lp(np.abs(vo), 8); duck = 1 - .55 * np.clip(venv / (venv.max() * .35), 0, 1)
            m = np.stack([vo, vo], 1) + mus * (music_gain or .32) * duck[:, None] + sfx * (sfx_gain or .55)
        else:
            m = mus * (music_gain or .62) + sfx * (sfx_gain or .6)
        f = np.ones(N); nf = int(fade_out * SR); f[-nf:] = np.linspace(1, 0, nf) ** 1.5; f[:int(.05 * SR)] = np.linspace(0, 1, int(.05 * SR))
        m *= f[:, None]; m = np.tanh(m * 1.1) / np.tanh(1.1); m *= .93 / np.max(np.abs(m))
        sf.write(out, m.astype(np.float32), SR, subtype='FLOAT'); print('wrote', out)
