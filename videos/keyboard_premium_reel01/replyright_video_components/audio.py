import json, subprocess, numpy as np, soundfile as sf
from scipy.signal import lfilter
TL = json.load(open("src/timeline.json")); END = TL["end"]; SR = 48000
V = [v["start"] for v in TL["vo"]]
T = dict(incoming=1.3, composerTap1=5.6, dismissTap=18.45, longPress=V[5] + 3.6, menuOpen=V[5] + 4.15, copyTap=V[6] + 0.45,
         composerTap2=25.9, globeDown=V[7] + 0.1, globeUp=V[7] + 1.4, swapA=V[7] + 1.42, pasteTap=V[8] + 0.5, flirtyTap=V[10] + 1.05,
         generateTap=V[10] + 2.1, genB=V[10] + 3.3, useTap=V[13] + 0.5, inserted=V[13] + 0.62, endA=V[15] - 1.2)
DRAFTS = [("haha maybe saturday?", 6.5, 8.6, 9.3, 9.85), ("whenever you want 😂", 10.2, 12.0, 12.7, 13.15)]
def char_times(text, a, b, seed):
    s = seed * 9301 + 49297
    def rnd():
        nonlocal s; s = (s * 9301 + 49297) % 233280; return s / 233280
    w = [1.6 if c == " " else 0.65 + rnd() * 1.0 for c in text]
    tot = sum(w); acc = 0; out = []
    for v in w: acc += v; out.append(a + (acc - v * 0.5) / tot * (b - a))
    return out
clicks = []
for i, (txt, a, b, hold, dele) in enumerate(DRAFTS):
    clicks += char_times(txt, a, b, i + 5)
    n0 = len(txt); prev = n0
    for f in range(int(hold * 60), int(dele * 60) + 1):
        k = min(1, max(0, (f / 60 - hold) / (dele - hold))); n = round(n0 * (1 - k))
        if n != prev: clicks.append(f / 60); prev = n
n = int((END + 0.1) * SR); x = np.arange(n) / SR
voice = np.zeros(n, np.float32); fx = np.zeros(n, np.float32)
def add(buf, sig, at, g=1.0):
    i = int(at * SR); j = min(n, i + len(sig))
    if i < n: buf[i:j] += sig[: j - i] * g
for v in TL["vo"]:
    a, sr = sf.read(v["file"], dtype="float32")
    a = np.interp(np.arange(0, len(a), sr / SR), np.arange(len(a)), a).astype(np.float32)
    add(voice, a / (np.abs(a).max() + 1e-6) * 0.72, v["start"])
rng = np.random.default_rng(11); tt = lambda d: np.arange(int(d * SR)) / SR
def click():
    t = tt(0.03); s = rng.normal(0, 1, len(t)) * np.exp(-t * 380); s = lfilter([1, -0.95], [1], s); return s * 0.022
def tick(f=1500, g=0.035):
    t = tt(0.06); return np.sin(2 * np.pi * f * t) * np.exp(-t * 90) * g
def whoosh(d=0.6, g=0.05, up=True):
    t = tt(d); nz = rng.normal(0, 1, len(t))
    fc = np.linspace(600, 3500, len(t)) if up else np.linspace(3500, 600, len(t)); y = np.zeros_like(nz); acc = 0.0
    a = np.exp(-2 * np.pi * fc / SR)
    for i in range(len(nz)): acc = a[i] * acc + (1 - a[i]) * nz[i]; y[i] = acc
    return y * np.sin(np.pi * t / d) ** 2 * g * 6
def chime(fs=(1318.5, 1975.5), g=0.03, d=1.2):
    t = tt(d); return sum(np.sin(2 * np.pi * f * t) for f in fs) * np.exp(-t * 4.5) * g
for c in clicks: add(fx, click(), c)
add(fx, chime((1046.5, 1568.0), 0.022, 0.7), T["incoming"])
for k in ["composerTap1", "dismissTap", "copyTap", "composerTap2", "pasteTap", "flirtyTap", "generateTap", "useTap"]: add(fx, tick(1400, 0.03), T[k])
add(fx, tick(900, 0.02), T["menuOpen"]); add(fx, tick(900, 0.02), T["swapA"])
add(fx, chime((1318.5, 1975.5), 0.016, 0.9), T["genB"]); add(fx, whoosh(0.35, 0.025), T["inserted"] - 0.05)
add(fx, chime((1046.5, 1568.0, 2093.0), 0.018, 1.6), T["endA"] + 0.5)
# original ambient pad (generated here)
chords = [[261.63, 329.63, 392.0, 493.88], [220.0, 261.63, 329.63, 392.0], [174.61, 220.0, 261.63, 329.63], [196.0, 246.94, 293.66, 392.0]]
pad = np.zeros(n, np.float32); seg = 5.0
for k in range(int(END / seg) + 2):
    a0 = k * seg; ch = chords[k % 4]; i0 = int(max(0, a0 - 0.8) * SR); i1 = min(n, int((a0 + seg + 1.5) * SR))
    if i0 >= n: break
    xx = x[i0:i1] - a0; env = np.clip((xx + 0.8) / 1.6, 0, 1) * np.clip((seg + 1.5 - xx) / 1.8, 0, 1)
    s = sum(np.sin(2 * np.pi * (f + d) * xx) * 0.5 + 0.1 * np.sin(4 * np.pi * (f + d) * xx) for f in ch for d in (-0.5, 0.5))
    s = s + 0.5 * np.sin(2 * np.pi * ch[0] / 2 * xx); pad[i0:i1] += (s * env).astype(np.float32)
kk = np.exp(-2 * np.pi * 1200 / SR); pad = lfilter([1 - kk], [1, -kk], pad).astype(np.float32); pad /= np.abs(pad).max()
env = np.convolve(np.abs(voice), np.ones(int(0.3 * SR)) / int(0.3 * SR), "same"); duck = 1 - 0.55 * np.clip(env / 0.05, 0, 1)
fade = np.clip(x / 2.0, 0, 1) * np.clip((END - x) / 3.0, 0, 1)
mix = voice + fx + pad * duck * fade * 0.05
sf.write("out/replyright_voiceover.wav", (voice / max(1e-6, np.abs(voice).max()) * 0.89).astype(np.float32), SR, subtype="PCM_24")
sf.write("out/premaster.wav", mix.astype(np.float32), SR, subtype="FLOAT")
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/premaster.wav", "-af", "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m = json.loads(r[r.rindex("{"): r.rindex("}") + 1])
gain = -14.0 - float(m["input_i"]) + 0.6
af = f"volume={gain:.2f}dB,alimiter=limit=0.82:attack=2:release=50:level=false"
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/premaster.wav", "-af", af, "-ar", "48000", "-ac", "2", "out/master.wav"], check=True)
def ts(s):
    ms = int(round(s * 1000)); return "%02d:%02d:%02d,%03d" % (ms // 3600000, ms // 60000 % 60, ms // 1000 % 60, ms % 1000)
with open("out/replyright_keyboard_premium_reel_01.srt", "w") as f:
    for k, v in enumerate(TL["vo"], 1): f.write(f"{k}\n{ts(v['capIn'])} --> {ts(v['capOut'] + 0.15)}\n{v['caption']}\n\n")
print("clicks", len(clicks), "audio ok")
# second pass: correct residual loudness error
r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "out/master.wav", "-af", "loudnorm=print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
m2 = json.loads(r[r.rindex("{"): r.rindex("}") + 1]); g2 = -14.0 - float(m2["input_i"])
subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "out/master.wav", "-af", f"volume={g2:.2f}dB,alimiter=limit=0.82:attack=2:release=50:level=false",
                "-ar", "48000", "out/master2.wav"], check=True)
import os; os.replace("out/master2.wav", "out/master.wav"); print("trim gain", round(g2, 2))
