import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import lfilter
TL = json.load(open("src/timeline.json")); END = TL["end"]; SR = 48000
n = int(END * SR); x = np.arange(n) / SR
voice = np.zeros(n, np.float32); fx = np.zeros(n, np.float32); music = np.zeros(n, np.float32)
rng = np.random.default_rng(5)
def add(buf, sig, at, g=1.0):
    i = int(at * SR); j = min(n, i + len(sig))
    if 0 <= i < n: buf[i:j] += (sig[: j - i] * g).astype(np.float32)
tt = lambda d: np.arange(int(d * SR)) / SR
def lp(sig, fc):
    if np.ndim(fc) == 0:
        k = np.exp(-2 * np.pi * fc / SR); return lfilter([1 - k], [1, -k], sig)
    k = np.exp(-2 * np.pi * np.asarray(fc) / SR); y = np.zeros_like(sig); acc = 0.0
    for i in range(len(sig)): acc = k[i] * acc + (1 - k[i]) * sig[i]; y[i] = acc
    return y
# ---- dialogue ----
for l in TL["lines"]:
    a, sr = sf.read(l["file"], dtype="float32")
    a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a).astype(np.float32)
    add(voice, a / (np.abs(a).max() + 1e-6) * {"a3": 0.62, "b1": 0.9, "b2": 1.0}.get(l["id"], 0.8), l["start"])
# ---- lo-fi cafe bed (original) ----
def ep(f, d):   # soft electric-piano-ish note
    t = tt(d); env = np.exp(-t * 2.2) * np.clip(t / 0.01, 0, 1)
    return (np.sin(2 * np.pi * f * t) + 0.35 * np.sin(4 * np.pi * f * t) + 0.12 * np.sin(6 * np.pi * f * t)) * env
chords = [[174.6, 220.0, 261.6, 329.6], [164.8, 196.0, 246.9, 293.7], [146.8, 174.6, 220.0, 261.6], [130.8, 164.8, 196.0, 246.9]]
bpm = 84; beat = 60 / bpm; bar = 4 * beat
bed = np.zeros(n, np.float32)
for k in range(int(END / bar) + 1):
    t0 = k * bar; ch = chords[k % 4]
    for i, f in enumerate(ch): add(bed, ep(f, 2.6) * 0.16, t0 + i * 0.018)
    add(bed, ep(ch[0] / 2, 2.0) * 0.22, t0)
    for b in range(4):
        kt = tt(0.25); add(bed, np.sin(2 * np.pi * (55 + 60 * np.exp(-kt * 30)) * kt) * np.exp(-kt * 14) * 0.35, t0 + b * beat) if b in (0, 2) else None
        h = rng.normal(0, 1, int(0.04 * SR)) * np.exp(-tt(0.04) * 90); add(bed, np.diff(h, prepend=0) * 0.05, t0 + b * beat + beat / 2)
bed = lp(bed, 3500).astype(np.float32)
gate = np.zeros(n, np.float32)
gate[(x < 9.85)] = 1; gate[(x >= 19.0)] = 1
gate = np.convolve(gate, np.ones(int(0.04 * SR)) / int(0.04 * SR), "same")
# tape-stop at 9.85: last 0.35 s of bed slows down
i0 = int(9.5 * SR); seg = bed[i0:int(9.85 * SR)].copy(); m = len(seg)
idx = np.cumsum(np.linspace(1, 0.15, int(m * 1.6))); idx = idx[idx < m - 1]
add(fx, np.interp(idx, np.arange(m), seg) * np.linspace(1, 0, len(idx)), 9.85)
music += bed * gate
# ---- sound effects (all synthesised) ----
def pop(f=700, d=0.12, g=0.25):
    t = tt(d); return np.sin(2 * np.pi * np.cumsum(f * (1 + 0.6 * np.exp(-t * 40))) / SR) * np.exp(-t * 30) * g
def whoosh(d=0.35, g=0.3):
    t = tt(d); s = lp(rng.normal(0, 1, len(t)), 2500) * np.sin(np.pi * t / d) ** 2; return s * g * 2
def impact():
    t = tt(0.5); return (np.sin(2 * np.pi * 60 * t) * np.exp(-t * 9) * 0.6 + lp(rng.normal(0, 1, len(t)), 900) * np.exp(-t * 25) * 0.5)
def cricket():
    t = tt(0.32); s = np.sin(2 * np.pi * 4300 * t) * (0.5 + 0.5 * np.sign(np.sin(2 * np.pi * 28 * t))) * np.exp(-((t - 0.16) / 0.12) ** 2)
    return s * 0.05
def sad_horn():
    out = []
    for f, d in [(392.0, 0.42), (370.0, 0.42), (349.2, 0.42), (329.6, 1.1)]:
        t = tt(d); vib = 1 + (0.012 * np.sin(2 * np.pi * 6 * t) if d > 1 else 0)
        ph = np.cumsum(f * vib) / SR; saw = 2 * (ph % 1) - 1
        wah = np.clip(t / 0.08, 0, 1) * (0.6 + 0.4 * np.sin(np.pi * np.clip(t / d, 0, 1)))
        s = lp(saw * wah, 900 + 700 * np.sin(np.pi * np.clip(t / d, 0, 1))) * np.minimum(1, (d - t) / 0.08)
        out.append(s)
    return np.concatenate(out) * 0.12
def click():
    t = tt(0.03); s = rng.normal(0, 1, len(t)) * np.exp(-t * 300); return np.diff(s, prepend=0) * 0.05
def chime(fs, g=0.05, d=1.0):
    t = tt(d); return sum(np.sin(2 * np.pi * f * t) for f in fs) * np.exp(-t * 4) * g
add(fx, pop(780), 0.3); add(fx, pop(660), 6.65)
for c in [10.45, 10.85, 11.45]: add(fx, cricket(), c)
add(fx, whoosh(0.22, 0.25), 11.92); add(fx, impact(), 12.02)
add(fx, whoosh(0.18, 0.15), 15.28); add(fx, sad_horn(), 17.95)
add(fx, whoosh(0.3, 0.18), 18.95)
for k in range(28): add(fx, click(), 20.85 + k * 1.2 / 28)
add(fx, chime((1318.5, 1975.5, 2637.0), 0.04, 1.2), 22.05); add(fx, whoosh(0.3, 0.2), 22.3)
add(fx, pop(820, 0.14, 0.28), 23.55); add(fx, chime((1046.5, 1568.0), 0.035, 1.5), 23.05)
# cafe room tone (very low), present even in the awkward pause
room = lp(rng.normal(0, 1, n), 700) * 0.012
for c in [1.6, 5.4, 8.8, 14.2, 20.4, 24.6]: add(fx, chime((2900, 4100), 0.006, 0.4), c)
# duck music under dialogue
env = np.convolve(np.abs(voice), np.ones(int(0.25 * SR)) / int(0.25 * SR), "same"); duck = 1 - 0.6 * np.clip(env / 0.04, 0, 1)
mix = voice + fx + room + music * duck * 0.55
sf.write("out/dating_cartoon_voiceover.wav", (voice / np.abs(voice).max() * 0.89).astype(np.float32), SR, subtype="PCM_24")
sf.write("out/premaster.wav", mix.astype(np.float32), SR, subtype="FLOAT")
def meas(f):
    r_ = subprocess.run(["ffmpeg", "-hide_banner", "-i", f, "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    return float(json.loads(r_[r_.rindex("{"): r_.rindex("}") + 1])["input_i"])
g = -14.0 - meas("out/premaster.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/premaster.wav", "-af", f"volume={g:.2f}dB,alimiter=limit=0.84:attack=2:release=50:level=false", "-ar", "48000", "-ac", "2", "out/master.wav"], check=True)
g2 = -14.0 - meas("out/master.wav")
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/master.wav", "-af", f"volume={g2:.2f}dB,alimiter=limit=0.84:attack=2:release=50:level=false", "out/master2.wav"], check=True)
import os; os.replace("out/master2.wav", "out/master.wav"); print("audio ok")
