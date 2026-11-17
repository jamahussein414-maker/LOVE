"""ReplyRight Reel 01 - "First Date Text" (premium cut).
Inputs in cwd: chunks.json + cNN.wav (from tts.py, Kokoro am_michael).
Outputs: video.mp4, audio_master.wav, replyright_reel_01.mp4, captions.srt, cover.png
Usage: python3 reel01.py            -> full render
       python3 reel01.py stills t.. -> preview frames"""
import json, math, sys, subprocess, wave
from multiprocessing import Pool
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
FD = "/usr/share/fonts/opentype/inter/"
_fc = {}
def F(weight, size, display=False):
    k = (weight, size, display)
    if k not in _fc:
        _fc[k] = ImageFont.truetype(FD + ("InterDisplay-" if display else "Inter-") + weight + ".otf", size)
    return _fc[k]

# ---------------- palette ----------------
WHITE = (255, 255, 255); G1 = (152, 152, 160); G2 = (98, 98, 106)
ACC = (255, 214, 107)                      # warm highlight for key words
VIOLET, PINK = (138, 92, 255), (255, 92, 160)
IN_B = (38, 38, 42); OUT_B = (24, 134, 255)

# ---------------- voice timeline ----------------
CH = json.load(open("chunks.json"))
GAPS_BEFORE0 = 0.35
GAPS_AFTER = [0.15, 1.2, 0.75, 0.7, 0.75, 0.3, 0.8, 0.35, 0.4, 1.1, 0.35, 4.0, 0.3, 2.5]
t = GAPS_BEFORE0
for c, g in zip(CH, GAPS_AFTER):
    c["start"] = round(t, 3); c["end"] = round(t + c["dur"], 3); t = c["end"] + g
TOTAL = round(t, 2)
def CS(i): return CH[i]["start"]
def CE(i): return CH[i]["end"]

CAPTION_TEXT = {7: "Imagine pasting their message into ReplyRight,", 13: "Comment REPLY."}
KEYWORDS = {1: ["really", "good", "time"], 2: ["five", "times."], 3: ["eager?"], 4: ["dry?"],
            6: ["find", "the", "words."], 7: ["ReplyRight,"], 8: ["warm", "and", "confident,"],
            9: ["sounds", "like", "you."], 13: ["REPLY."]}

# ---------------- scene clock ----------------
S2 = CE(1) + 1.1          # problem
S3 = CE(6) + 0.4          # product reveal
S4 = CE(9) + 0.8          # payoff
S5 = CE(11) + 3.7         # call to action

# product/payoff micro-timeline
T_APP_IN = S3
T_PASTE = CS(7) + 1.0
T_TONE = CS(8) + 0.55
T_GEN = CS(9) + 0.2
T_RESULT = T_GEN + 1.25
T_COPY = CE(11) + 0.35
T_BACK = T_COPY + 0.75
T_PASTE2 = T_BACK + 0.65
T_SENDTAP = T_PASTE2 + 0.75
T_SENT = T_SENDTAP + 0.1

# drafts in scene 2 (text, type_start, type_end, hold_end, delete_end, chip)
DRAFTS = [
    ("Yeah you too...", S2 + 0.2, S2 + 1.6, S2 + 2.3, S2 + 2.8, None),
    ("Haha same", S2 + 2.95, S2 + 3.55, CS(3) - 0.35, CS(3) - 0.1, None),
    ("OMG I had the BEST time!!!", CS(3) - 0.05, CS(3) + 0.9, CS(4) - 0.4, CS(4) - 0.1, ("Too eager?", (255, 159, 10))),
    ("cool.", CS(4) + 0.05, CS(4) + 0.45, CS(5) - 0.15, CS(5) + 0.1, ("Too dry?", (100, 170, 255))),
    ("I really liked...", CS(5) + 0.3, CS(5) + 1.3, CS(6) + 0.2, CS(6) + 0.7, None),
]

def ease(x):
    x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3
def ease_io(x):
    x = max(0.0, min(1.0, x)); return x * x * (3 - 2 * x)
def P(t, a, b): return ease((t - a) / (b - a)) if b > a else float(t >= a)
def PI(t, a, b): return ease_io((t - a) / (b - a)) if b > a else float(t >= a)
def back(x):
    x = max(0.0, min(1.0, x)); c = 1.4; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2

def wrap(d, text, f, maxw):
    out, cur = [], ""
    for w in text.split():
        tst = (cur + " " + w).strip()
        if d.textlength(tst, font=f) <= maxw: cur = tst
        else: out.append(cur); cur = w
    if cur: out.append(cur)
    return out

_gcache = {}
def grad(size, c1, c2, angle=-35):
    k = (size, c1, c2, angle)
    if k not in _gcache:
        w, h = size; th = math.radians(-angle)
        y, x = np.mgrid[0:h, 0:w].astype(np.float32)
        p = x * math.cos(th) + y * math.sin(th); p = (p - p.min()) / max(1e-6, p.max() - p.min())
        arr = np.array(c1, np.float32) * (1 - p[..., None]) + np.array(c2, np.float32) * p[..., None]
        _gcache[k] = Image.fromarray(arr.astype(np.uint8)).convert("RGBA")
    return _gcache[k].copy()

def rr_mask(size, r):
    m = Image.new("L", size, 0); ImageDraw.Draw(m).rounded_rectangle((0, 0, size[0] - 1, size[1] - 1), r, fill=255); return m

def with_alpha(im, a):
    if a >= 0.999: return im
    im = im.copy(); im.putalpha(im.getchannel("A").point(lambda v: int(v * a))); return im

def paste(base, im, x, y, a=1.0, scale=1.0):
    if a <= 0.003: return
    if abs(scale - 1) > 0.002:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    base.alpha_composite(with_alpha(im, a), (int(round(x)), int(round(y))))

def logo(size):
    r = size // 2
    im = grad((size, size), VIOLET, PINK)
    m = Image.new("L", (size, size), 0); ImageDraw.Draw(m).ellipse((0, 0, size - 1, size - 1), fill=255); im.putalpha(m)
    d = ImageDraw.Draw(im); f = F("Black", int(size * 0.58)); w = d.textlength("R", font=f)
    d.text((r - w / 2, size * 0.13), "R", font=f, fill=WHITE)
    return im

# ---------------- background ----------------
def make_bg():
    y, x = np.mgrid[0:H, 0:W].astype(np.float32)
    base = np.zeros((H, W, 3), np.float32)
    top, bot = np.array([24, 24, 29], np.float32), np.array([11, 11, 14], np.float32)
    k = (y / H)[..., None]; base[:] = top * (1 - k) + bot * k
    def glow(cx, cy, r, col, s):
        d = np.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / (2 * r * r)))[..., None]; return d * np.array(col, np.float32) * s
    base += glow(200, 520, 520, VIOLET, 0.10) + glow(900, 1500, 600, (60, 110, 255), 0.07)
    noise = np.random.default_rng(0).normal(0, 1.6, (H, W, 1))
    return Image.fromarray(np.clip(base + noise, 0, 255).astype(np.uint8)).convert("RGBA")
BG = make_bg()

# ---------------- phone ----------------
PW, PH = 700, 1010            # outer
PX, PY = (W - PW) // 2, 430
BZ = 14                       # bezel
SW, SH = PW - 2 * BZ, PH - 2 * BZ
def phone_shell():
    im = Image.new("RGBA", (PW + 160, PH + 160), (0, 0, 0, 0))
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0)); d = ImageDraw.Draw(sh)
    d.rounded_rectangle((90, 110, 90 + PW - 20, 110 + PH - 10), 96, fill=(0, 0, 0, 190))
    d.rounded_rectangle((120, 160, 60 + PW, 60 + PH), 96, fill=VIOLET + (40,))
    im.alpha_composite(sh.filter(ImageFilter.GaussianBlur(40)))
    d = ImageDraw.Draw(im)
    d.rounded_rectangle((80, 80, 80 + PW - 1, 80 + PH - 1), 100, fill=(28, 28, 32), outline=(74, 74, 82), width=3)
    d.rounded_rectangle((80 + 6, 80 + 6, 80 + PW - 7, 80 + PH - 7), 94, outline=(16, 16, 18), width=4)
    return im
SHELL = phone_shell()
SCREEN_MASK = rr_mask((SW, SH), 86)

def status_bar(d, light=True):
    d.text((54, 26), "11:48", font=F("SemiBold", 30), fill=WHITE)
    d.rounded_rectangle((SW // 2 - 66, 18, SW // 2 + 66, 58), 20, fill=(0, 0, 0))   # dynamic island
    for i in range(4):
        x = SW - 168 + i * 11; d.rounded_rectangle((x, 46 - 6 - i * 5, x + 7, 46), 2, fill=WHITE)
    d.rounded_rectangle((SW - 106, 28, SW - 62, 48), 6, outline=(170, 170, 176), width=2)
    d.rounded_rectangle((SW - 103, 31, SW - 78, 45), 4, fill=WHITE)
    d.rounded_rectangle((SW - 59, 34, SW - 56, 42), 1, fill=(170, 170, 176))

# --- chat screen pieces ---
BF = F("Medium", 40)
def bubble(text, out, glow=0.0):
    tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    lines = wrap(tmp, text, BF, 470); lh = 52; px, py = 30, 20
    tw = max(tmp.textlength(l, font=BF) for l in lines)
    bw, bh = int(tw + 2 * px), int(len(lines) * lh + 2 * py)
    pad = 40
    im = Image.new("RGBA", (bw + 2 * pad, bh + 2 * pad), (0, 0, 0, 0))
    col = OUT_B if out else IN_B
    if glow > 0:
        g = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(g).rounded_rectangle((pad, pad, pad + bw, pad + bh), 40, fill=ACC + (int(120 * glow),))
        im.alpha_composite(g.filter(ImageFilter.GaussianBlur(18)))
    body = Image.new("RGBA", (bw + 24, bh + 4), (0, 0, 0, 0)); d = ImageDraw.Draw(body)
    ox = 12
    d.rounded_rectangle((ox, 0, ox + bw, bh), 40, fill=col)
    a = body.getchannel("A"); ad = ImageDraw.Draw(a)
    if out:
        ad.ellipse((ox + bw - 34, bh - 36, ox + bw + 10, bh + 2), fill=255); ad.ellipse((ox + bw + 2, bh - 50, ox + bw + 34, bh - 4), fill=0)
    else:
        ad.ellipse((ox - 10, bh - 36, ox + 34, bh + 2), fill=255); ad.ellipse((ox - 34, bh - 50, ox - 2, bh - 4), fill=0)
    fill = Image.new("RGBA", body.size, col + (255,)); fill.putalpha(a); body = fill; d = ImageDraw.Draw(body)
    y = py - 3
    for l in lines:
        d.text((ox + px, y), l, font=BF, fill=WHITE); y += lh
    im.alpha_composite(body, (pad - ox, pad))
    return im, bh, pad
IN_TEXT = "I had a really good time tonight :)"
REPLY_TEXT = "I had a great time too. I'd love to see you again."
_bcache = {}
def bub(text, out, glow=0.0):
    k = (text, out, round(glow, 2))
    if k not in _bcache: _bcache[k] = bubble(text, out, glow)
    return _bcache[k]

def chat_header():
    im = Image.new("RGBA", (SW, 250), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    for y in range(250):
        a = 255 if y < 200 else int(255 * (1 - (y - 200) / 50)); d.line((0, y, SW, y), fill=(0, 0, 0, a))
    status_bar(d)
    d.rounded_rectangle((26, 92, 128, 152), 30, fill=(30, 30, 33), outline=(58, 58, 62), width=2)
    d.line([(70, 106), (56, 122), (70, 138)], fill=WHITE, width=6, joint="curve")
    d.rounded_rectangle((80, 108, 116, 136), 14, fill=WHITE)
    d.text((91, 108), "2", font=F("Bold", 22), fill=(0, 0, 0))
    av = grad((96, 96), (120, 120, 132), (72, 72, 82), angle=0)
    m = Image.new("L", (96, 96), 0); ImageDraw.Draw(m).ellipse((0, 0, 95, 95), fill=255); av.putalpha(m)
    im.alpha_composite(av, (SW // 2 - 48, 76)); d = ImageDraw.Draw(im)
    f = F("SemiBold", 44); w = d.textlength("J", font=f); d.text((SW // 2 - w / 2, 96), "J", font=f, fill=WHITE)
    f = F("SemiBold", 26); w = d.textlength("Jordan", font=f)
    d.rounded_rectangle((SW // 2 - w / 2 - 22, 182, SW // 2 + w / 2 + 34, 226), 22, fill=(30, 30, 33), outline=(58, 58, 62), width=2)
    d.text((SW // 2 - w / 2 - 4, 189), "Jordan", font=f, fill=WHITE)
    d.line([(SW // 2 + w / 2 + 8, 196), (SW // 2 + w / 2 + 15, 204), (SW // 2 + w / 2 + 8, 212)], fill=G1, width=3)
    d.rounded_rectangle((SW - 128, 92, SW - 26, 152), 30, fill=(30, 30, 33), outline=(58, 58, 62), width=2)
    d.rounded_rectangle((SW - 102, 110, SW - 66, 134), 6, outline=WHITE, width=3)
    d.polygon([(SW - 64, 122), (SW - 50, 111), (SW - 50, 133)], fill=WHITE)
    return im
CHAT_HEADER = chat_header()

def typed_count(text, t, a, b, seed=0):
    """hesitant typing: uneven per-character timing"""
    if t <= a: return 0
    if t >= b: return len(text)
    rng = np.random.default_rng(seed + len(text))
    w = rng.uniform(0.6, 1.6, len(text)); w[[i for i, c in enumerate(text) if c in " ."]] *= 1.8
    cum = np.cumsum(w) / w.sum()
    return int(np.searchsorted(cum, (t - a) / (b - a), side="right"))

def composer_state(t):
    """returns (text, chip, chip_alpha, draft_index)"""
    for i, (txt, a, b, hold, dele, chip) in enumerate(DRAFTS):
        nxt = DRAFTS[i + 1][1] if i + 1 < len(DRAFTS) else 1e9
        if a - 0.05 <= t < min(nxt, dele + 0.3):
            if t < hold: n = typed_count(txt, t, a, b, i)
            else: n = int(round(len(txt) * (1 - P(t, hold, dele))))
            ca = 0.0
            if chip:
                ca = P(t, a + 0.25, a + 0.5) * (1 - P(t, hold - 0.1, dele))
            return txt[:n], chip, ca, i
    if T_PASTE2 <= t < T_SENT:
        return REPLY_TEXT, None, 0, -1
    return "", None, 0, -1

def chat_screen(t):
    im = Image.new("RGBA", (SW, SH), (0, 0, 0, 255)); d = ImageDraw.Draw(im)
    f1, f2 = F("SemiBold", 24), F("Medium", 24)
    lbl1, lbl2 = "Today ", "11:46 PM"
    tw = d.textlength(lbl1, font=f1) + d.textlength(lbl2, font=f2)
    d.text(((SW - tw) / 2, 262), lbl1, font=f1, fill=G1); d.text(((SW - tw) / 2 + d.textlength(lbl1, font=f1), 262), lbl2, font=f2, fill=G1)
    y = 316
    # incoming typing indicator then bubble
    if t < 0.55:
        tb = Image.new("RGBA", (180, 90), (0, 0, 0, 0)); td = ImageDraw.Draw(tb)
        td.rounded_rectangle((12, 0, 150, 74), 37, fill=IN_B); td.ellipse((2, 56, 26, 80), fill=IN_B)
        for i in range(3):
            b = 0.5 + 0.5 * max(0, math.sin(((t * 2.6 - i * 0.2) % 1) * math.pi)); c = int(110 + 90 * b)
            td.ellipse((46 + i * 32 - 9, 28 - 4 * b, 46 + i * 32 + 9, 46 - 4 * b), fill=(c, c, c))
        paste(im, tb, 26, y)
    else:
        p = P(t, 0.55, 0.95)
        glow = 0.0
        if CS(1) - 0.1 <= t < S2 + 0.3: glow = round(PI(t, CS(1) - 0.1, CS(1) + 0.5) * (1 - PI(t, S2 - 0.2, S2 + 0.3)), 2)
        b, bh, pad = bub(IN_TEXT, False, glow)
        sc = 0.94 + 0.06 * back(min(1, (t - 0.55) / 0.35))
        paste(im, b, 26 - pad + 0 * (1 - sc), y - pad + (1 - p) * 14, a=p, scale=1.0 if sc > 0.999 else sc)
        y += bh + 30
    # outgoing reply after paste+send
    if t >= T_SENT:
        p = P(t, T_SENT, T_SENT + 0.35)
        b, bh, pad = bub(REPLY_TEXT, True)
        paste(im, b, SW - 26 - b.width + pad, y - pad + (1 - p) * 120, a=min(1, p * 1.4))
        y += bh + 10
        if t >= T_SENT + 0.55:
            f = F("SemiBold", 22); w = d.textlength("Delivered", font=f)
            d.text((SW - 44 - w, y), "Delivered", font=f, fill=G1)
    # composer
    txt, chip, ca, di = composer_state(t)
    cy = SH - 128
    d.ellipse((26, cy, 98, cy + 72), fill=(30, 30, 33), outline=(58, 58, 62), width=2)
    d.line((62, cy + 20, 62, cy + 52), fill=WHITE, width=4); d.line((46, cy + 36, 78, cy + 36), fill=WHITE, width=4)
    lines = wrap(d, txt, F("Regular", 32), 430) if txt else []
    nl = max(1, len(lines)); bh = 72 + (nl - 1) * 40
    top = cy + 72 - bh
    d.rounded_rectangle((116, top, SW - 26, cy + 72), 36, fill=(10, 10, 12), outline=(56, 56, 60), width=2)
    fc = F("Regular", 32)
    if txt:
        yy = top + 16
        for ln in lines:
            d.text((146, yy), ln, font=fc, fill=WHITE); yy += 40
        cx = 146 + d.textlength(lines[-1], font=fc) + 3; cyy = yy - 40
        d.ellipse((SW - 82, cy + 12, SW - 34, cy + 60), fill=OUT_B)
        d.line((SW - 58, cy + 50, SW - 58, cy + 22), fill=WHITE, width=5)
        d.line([(SW - 70, cy + 34), (SW - 58, cy + 21), (SW - 46, cy + 34)], fill=WHITE, width=5)
    else:
        d.text((146, cy + 16), "iMessage", font=fc, fill=(102, 102, 108)); cx = 144; cyy = cy + 16
    if int(t * 1.9) % 2 == 0 and t >= S2 - 0.3:
        d.rounded_rectangle((cx, cyy + 2, cx + 3, cyy + 38), 1, fill=OUT_B)
    if chip and ca > 0:
        name, col = chip
        ov = Image.new("RGBA", (SW, SH), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        f = F("Bold", 30); w = od.textlength(name, font=f)
        x0 = (SW - w) / 2 - 30; y0 = top - 92 + (1 - ca) * 12
        od.rounded_rectangle((x0, y0, x0 + w + 60, y0 + 60), 30, fill=col + (int(46 * ca),), outline=col + (int(255 * ca),), width=3)
        od.text((x0 + 30, y0 + 11), name, font=f, fill=col + (int(255 * ca),))
        im.alpha_composite(ov)
    im.alpha_composite(CHAT_HEADER, (0, 0))
    return im

# --- app (concept preview) screen ---
TONES = ["Warm & Confident", "Playful", "Casual", "Direct"]
LOGO56 = logo(56)
def app_screen(t):
    im = Image.new("RGBA", (SW, SH), (13, 13, 16, 255))
    im.alpha_composite(APP_GLOW)
    d = ImageDraw.Draw(im); status_bar(d)
    im.alpha_composite(LOGO56, (34, 92)); d = ImageDraw.Draw(im)
    d.text((104, 98), "ReplyRight", font=F("Bold", 36), fill=WHITE)
    f = F("SemiBold", 20); w = d.textlength("CONCEPT PREVIEW", font=f)
    d.rounded_rectangle((SW - 34 - w - 28, 104, SW - 34, 140), 18, outline=(120, 100, 200), width=2)
    d.text((SW - 34 - w - 14, 111), "CONCEPT PREVIEW", font=f, fill=(190, 175, 255))
    # step 1: their message
    act1 = P(t, T_APP_IN + 0.3, T_APP_IN + 0.6)
    d.text((36, 184), "THEIR MESSAGE", font=F("SemiBold", 22), fill=G1)
    d.rounded_rectangle((30, 218, SW - 30, 336), 28, fill=(28, 28, 33), outline=(52, 52, 58), width=2)
    pa = P(t, T_PASTE, T_PASTE + 0.35)
    if pa < 1:
        d.text((56, 258), "Paste a message...", font=F("Regular", 30), fill=(96, 96, 104) + (int(255 * (1 - pa)),))
        bx = SW - 30 - 150
        pill = grad((126, 54), VIOLET, PINK); pill.putalpha(rr_mask((126, 54), 27))
        paste(im, pill, bx, 250, a=1 - pa); d = ImageDraw.Draw(im)
        f = F("Bold", 26); w = d.textlength("Paste", font=f)
        ov = Image.new("RGBA", (SW, SH), (0, 0, 0, 0)); ImageDraw.Draw(ov).text((bx + 63 - w / 2, 261), "Paste", font=f, fill=(255, 255, 255, int(255 * (1 - pa))))
        im.alpha_composite(ov); d = ImageDraw.Draw(im)
    if pa > 0:
        ov = Image.new("RGBA", (SW, SH), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        od.text((56, 254 + (1 - pa) * 10), "I had a really good time tonight :)", font=F("Medium", 31), fill=(255, 255, 255, int(255 * pa)))
        im.alpha_composite(ov); d = ImageDraw.Draw(im)
    # step 2: tone
    d.text((36, 372), "TONE", font=F("SemiBold", 22), fill=G1)
    cw, chh, gx = (SW - 60 - 16) // 2, 70, 16
    sel = P(t, T_TONE, T_TONE + 0.3)
    for i, name in enumerate(TONES):
        x = 30 + (i % 2) * (cw + gx); y = 406 + (i // 2) * (chh + 14)
        base_a = 0.55 + 0.45 * P(t, CS(8) - 0.2, CS(8) + 0.2)
        if i == 0 and sel > 0:
            ch = grad((cw, chh), VIOLET, PINK); ch.putalpha(rr_mask((cw, chh), 35).point(lambda v: int(v * sel)))
            d.rounded_rectangle((x, y, x + cw, y + chh), 35, fill=(28, 28, 33), outline=(60, 60, 66), width=2)
            im.alpha_composite(ch, (x, y)); d = ImageDraw.Draw(im)
        else:
            dim = 0.5 if sel > 0.5 else 1.0
            c = tuple(int(v * base_a * dim + 13 * (1 - base_a * dim)) for v in (28, 28, 33))
            d.rounded_rectangle((x, y, x + cw, y + chh), 35, fill=c, outline=(60, 60, 66), width=2)
        f = F("SemiBold", 27); w = d.textlength(name, font=f)
        tc = WHITE if (i == 0 and sel > 0.3) else tuple(int(v * (0.5 if sel > 0.5 else base_a)) for v in (235, 235, 240))
        d.text((x + cw / 2 - w / 2, y + 19), name, font=f, fill=tc)
    # step 3: button
    by = 600
    bp = P(t, CS(9) - 0.3, CS(9))
    btn = grad((SW - 60, 92), VIOLET, PINK); btn.putalpha(rr_mask((SW - 60, 92), 46))
    paste(im, btn, 30, by, a=0.35 + 0.65 * bp); d = ImageDraw.Draw(im)
    f = F("Bold", 33); lbl = "Write my reply"; w = d.textlength(lbl, font=f)
    d.text(((SW - w) / 2, by + 24), lbl, font=f, fill=WHITE)
    # result sheet
    if t >= T_GEN + 0.15:
        sy = 724
        d.rounded_rectangle((30, sy, SW - 30, SH - 40), 34, fill=(24, 24, 29), outline=(70, 60, 120), width=2)
        d.text((60, sy + 28), "SUGGESTED REPLY", font=F("SemiBold", 22), fill=(190, 175, 255))
        if t < T_RESULT:
            for i, ww in enumerate([0.86, 0.62]):
                x1 = 60 + (SW - 180) * ww
                sh = (t * 1.3) % 1.0
                base = 40 + int(18 * math.sin((sh * 2 * math.pi) + i))
                d.rounded_rectangle((60, sy + 82 + i * 54, x1, sy + 116 + i * 54), 17, fill=(base, base, base + 6))
        else:
            rp = P(t, T_RESULT, T_RESULT + 0.5)
            ov = Image.new("RGBA", (SW, SH), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
            f = F("SemiBold", 38); yy = sy + 72
            for ln in wrap(od, REPLY_TEXT, f, SW - 130):
                od.text((60, yy + (1 - rp) * 10), ln, font=f, fill=(255, 255, 255, int(255 * rp))); yy += 48
            # copy button
            cp = P(t, T_COPY, T_COPY + 0.2)
            lbl = "Copied" if cp > 0.5 else "Copy"
            f2 = F("Bold", 26); w = od.textlength(lbl, font=f2) + (34 if cp > 0.5 else 0)
            x1 = SW - 60; x0 = x1 - w - 48; yb = SH - 40 - 84
            col = (52, 199, 89) if cp > 0.5 else (60, 60, 70)
            od.rounded_rectangle((x0, yb, x1, yb + 56), 28, fill=col + (int(255 * rp),))
            if cp > 0.5:
                od.line([(x0 + 22, yb + 29), (x0 + 31, yb + 38), (x0 + 47, yb + 19)], fill=(255, 255, 255, int(255 * rp)), width=5)
            od.text((x1 - 24 - od.textlength(lbl, font=f2), yb + 12), lbl, font=f2, fill=(255, 255, 255, int(255 * rp)))
            im.alpha_composite(ov)
    return im
APP_GLOW = Image.new("RGBA", (SW, SH), (0, 0, 0, 0))
ImageDraw.Draw(APP_GLOW).ellipse((-200, -300, SW + 200, 260), fill=VIOLET + (55,))
APP_GLOW = APP_GLOW.filter(ImageFilter.GaussianBlur(60))

def tap(im, t, t0, x, y):
    if not (t0 <= t < t0 + 0.5): return
    k = (t - t0) / 0.5; r = 26 + 30 * ease(k)
    ov = Image.new("RGBA", im.size, (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
    od.ellipse((x - r, y - r, x + r, y + r), outline=(255, 255, 255, int(200 * (1 - k))), width=4)
    od.ellipse((x - 22, y - 22, x + 22, y + 22), fill=(255, 255, 255, int(120 * (1 - k))))
    im.alpha_composite(ov)

def screen(t):
    """compose phone screen content with slide transitions"""
    if t < T_APP_IN:
        s = chat_screen(t)
    elif t < T_APP_IN + 0.6:
        k = PI(t, T_APP_IN, T_APP_IN + 0.6)
        s = Image.new("RGBA", (SW, SH), (0, 0, 0, 255))
        s.alpha_composite(chat_screen(t), (int(-SW * 0.3 * k), 0))
        a = app_screen(t); s.alpha_composite(a, (int(SW * (1 - k)), 0))
    elif t < T_BACK:
        s = app_screen(t)
    elif t < T_BACK + 0.6:
        k = PI(t, T_BACK, T_BACK + 0.6)
        s = Image.new("RGBA", (SW, SH), (0, 0, 0, 255))
        s.alpha_composite(app_screen(t), (int(SW * 0.3 * k), 0))
        s.alpha_composite(chat_screen(t), (int(-SW * (1 - k)), 0))
    else:
        s = chat_screen(t)
    tap(s, t, T_PASTE - 0.2, SW - 30 - 87, 277)
    tap(s, t, T_TONE - 0.15, 30 + (SW - 76) // 4, 441)
    tap(s, t, T_GEN - 0.1, SW // 2 + 120, 646)
    tap(s, t, T_COPY - 0.15, SW - 110, SH - 40 - 56)
    tap(s, t, T_SENDTAP - 0.1, SW - 58, SH - 128 + 36)
    out = Image.new("RGBA", (SW, SH), (0, 0, 0, 0)); out.paste(s, (0, 0), SCREEN_MASK)
    return out

# ---------------- headlines ----------------
def headline_lines(t):
    """returns list of (lines, key-word set, alpha) layers to draw in the headline zone"""
    L = []
    def seg(a, b, lines, keys, fade=0.35):
        if a - fade <= t < b + fade:
            al = PI(t, a - (0 if a == 0 else fade), a) * (1 - PI(t, b, b + fade))
            if a == 0: al = 1 - PI(t, b, b + fade)
            L.append((lines, keys, al, t - a))
    seg(0, S2 - 0.25, ["Why is THIS text", "so hard to answer?"], {"THIS"})
    n = 0
    for i, d in enumerate(DRAFTS):
        if t >= d[1] - 0.05: n = i + 1
    seg(S2, CS(6) + 0.2, [f"Rewrite #{max(1, n)}"], {f"#{max(1, n)}"})
    seg(CS(6) + 0.2, S3 - 0.2, ["Still nothing sent."], set())
    seg(S3 + 0.2, CS(8) + 0.25, ["1. Paste their message"], {"1."})
    seg(CS(8) + 0.25, T_GEN - 0.15, ["2. Pick your tone"], {"2."})
    seg(T_GEN - 0.15, S4 - 0.2, ["3. Get a reply", "that sounds like you"], {"3."})
    seg(S4, T_BACK - 0.2, ["Your words.", "Just better."], {"better."})
    seg(T_BACK, S5 - 0.25, ["Copy. Paste. Send."], {"Send."})
    return L

def draw_headline(img, t):
    for lines, keys, al, age in headline_lines(t):
        if al <= 0.003: continue
        ov = Image.new("RGBA", (W, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        f = F("Bold", 78, display=True)
        n = len(lines); y0 = 222 - n * 46 + (1 - ease(min(1, age / 0.45))) * 18
        for i, ln in enumerate(lines):
            words = ln.split(); tw = d.textlength(ln, font=f); x = (W - tw) / 2
            for w in words:
                col = ACC if w in keys else WHITE
                d.text((x, y0 + i * 92), w, font=f, fill=col + (int(255 * al),))
                x += d.textlength(w + " ", font=f)
        img.alpha_composite(ov, (0, 0))

# ---------------- captions ----------------
CAPS = []
for c in CH:
    txt = CAPTION_TEXT.get(c["i"], c["text"])
    nxt = CH[c["i"] + 1]["start"] if c["i"] + 1 < len(CH) else c["end"] + 1.5
    CAPS.append({"i": c["i"], "text": txt, "a": c["start"] - 0.1, "b": min(nxt - 0.25, c["end"] + 0.6)})
CAP_Y = 1500
def draw_caption(img, t):
    for c in CAPS:
        if c["a"] <= t < c["b"] + 0.12:
            al = PI(t, c["a"], c["a"] + 0.12) * (1 - PI(t, c["b"], c["b"] + 0.12))
            ov = Image.new("RGBA", (W, 200), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
            f = F("SemiBold", 50)
            lines = wrap(d, c["text"], f, 900)[:2]
            keys = KEYWORDS.get(c["i"], [])
            y = 20 if len(lines) == 2 else 48
            for ln in lines:
                tw = d.textlength(ln, font=f); x = (W - tw) / 2
                for w in ln.split():
                    col = ACC if w in keys else WHITE
                    d.text((x, y), w, font=f, fill=col + (int(255 * al),), stroke_width=3, stroke_fill=(0, 0, 0, int(150 * al)))
                    x += d.textlength(w + " ", font=f)
                y += 64
            img.alpha_composite(ov, (0, CAP_Y))

# ---------------- end card ----------------
LOGO96 = logo(96)
def end_card(img, t):
    a1 = P(t, S5 + 0.3, S5 + 0.9)
    if a1 <= 0: return
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    f = F("Bold", 86, display=True)
    for i, ln in enumerate(["Never struggle with", "what to say again."]):
        tw = d.textlength(ln, font=f)
        d.text(((W - tw) / 2, 700 + i * 104 + (1 - a1) * 24), ln, font=f, fill=(WHITE if i == 0 else ACC) + (int(255 * a1),))
    img.alpha_composite(ov)
    a2 = P(t, CS(13) - 0.1, CS(13) + 0.35)
    if a2 > 0:
        f = F("Bold", 46); lbl1 = "Comment "; lbl2 = "REPLY"; lbl3 = " for early access"
        tw = sum(d.textlength(s, font=f2) for s, f2 in [(lbl1, f), (lbl2, F("Black", 46)), (lbl3, f)])
        bw, bh = int(tw + 96), 112
        pill = grad((bw, bh), VIOLET, PINK); pill.putalpha(rr_mask((bw, bh), bh // 2))
        sc = 0.96 + 0.04 * back(min(1, (t - CS(13) + 0.1) / 0.4))
        x0 = (W - bw * sc) / 2; y0 = 1010
        paste(img, pill, x0, y0, a=a2, scale=sc)
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        x = (W - tw) / 2
        for s, f2 in [(lbl1, f), (lbl2, F("Black", 46)), (lbl3, f)]:
            d.text((x, y0 + 30), s, font=f2, fill=(255, 255, 255, int(255 * a2))); x += d.textlength(s, font=f2)
        img.alpha_composite(ov)
    a3 = P(t, CE(13) + 0.1, CE(13) + 0.7)
    if a3 > 0:
        f = F("Bold", 64, display=True); tw = d.textlength("ReplyRight", font=f)
        gx = (W - (96 + 24 + tw)) / 2; gy = 1240
        paste(img, LOGO96, gx, gy, a=a3)
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
        d.text((gx + 120, gy + 6), "ReplyRight", font=f, fill=(255, 255, 255, int(255 * a3)))
        s = "Early access  ·  App in development"; f2 = F("Medium", 30); tw = d.textlength(s, font=f2)
        d.text(((W - tw) / 2, gy + 130), s, font=f2, fill=G1 + (int(255 * a3),))
        img.alpha_composite(ov)

# ---------------- frame ----------------
def frame(t):
    img = BG.copy()
    draw_headline(img, t)
    # phone: gentle float, push-in on payoff, exit on CTA
    exit_k = PI(t, S5 - 0.1, S5 + 0.6)
    if exit_k < 1:
        push = PI(t, T_RESULT, T_RESULT + 1.2) * (1 - PI(t, T_COPY - 0.2, T_COPY + 0.4))
        S0 = 1.08
        sc = S0 * (1.0 + 0.04 * push)
        float_y = math.sin(t * 0.9) * 4
        scr = screen(t)
        ph = SHELL.copy(); ph.alpha_composite(scr, (80 + BZ, 80 + BZ))
        anchor_y = 0.95 * push       # zoom toward the reply sheet
        x = W / 2 - (PW + 160) * sc / 2
        y = 392 - 80 * S0 - (sc - S0) * (PH + 160) * anchor_y + float_y + exit_k * 260
        paste(img, ph, x, y, a=1 - exit_k, scale=sc)
    if t >= S5: end_card(img, t)
    draw_caption(img, t)
    return img.convert("RGB")

def render_frame(i):
    return frame(i / FPS).tobytes()

# ---------------- audio ----------------
SR = 48000
def load(fn):
    with wave.open(fn) as w:
        sr = w.getframerate(); a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
    if w.getnchannels() == 2: a = a.reshape(-1, 2).mean(1)
    if sr != SR:
        x = np.arange(0, len(a), sr / SR); a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
    return a

def build_audio(clicks):
    n = int((TOTAL + 0.2) * SR); voice = np.zeros(n, np.float32); fx = np.zeros(n, np.float32)
    def add(buf, sig, at, g=1.0):
        i = int(at * SR); j = min(n, i + len(sig)); buf[i:j] += sig[: j - i] * g
    import soundfile as sf
    for c in CH:
        a, sr = sf.read(c["file"], dtype="float32")
        if sr != SR:
            x = np.arange(0, len(a), sr / SR); a = np.interp(x, np.arange(len(a)), a).astype(np.float32)
        add(voice, a / (np.abs(a).max() + 1e-6) * 0.7, c["start"])
    rng = np.random.default_rng(7); tt = lambda d: np.arange(int(d * SR)) / SR
    def click():
        x = tt(0.025); s = rng.normal(0, 1, len(x)) * np.exp(-x * 320); s = np.diff(s, prepend=0); return s * 0.035
    def soft_pop():
        x = tt(0.18); f = 880 - 300 * x / 0.18
        return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-x * 26) * 0.07
    def receive():
        x = tt(0.6); return (np.sin(2 * np.pi * 1046.5 * x) + 0.5 * np.sin(2 * np.pi * 1568 * x)) * np.exp(-x * 9) * 0.045
    def send():
        x = tt(0.3); nz = np.convolve(rng.normal(0, 1, len(x)), np.ones(40) / 40, "same")
        return nz * np.sin(np.pi * x / 0.3) ** 2 * 0.12
    def tick():
        x = tt(0.05); return np.sin(2 * np.pi * 1800 * x) * np.exp(-x * 120) * 0.04
    for c in clicks: add(fx, click(), c)
    add(fx, receive(), 0.55)
    for at in [T_PASTE - 0.2, T_TONE - 0.15, T_GEN - 0.1, T_COPY - 0.15, T_SENDTAP - 0.1]: add(fx, tick(), at)
    add(fx, soft_pop(), T_RESULT); add(fx, send(), T_SENT); add(fx, soft_pop(), CS(13) - 0.1)
    # --- original ambient pad (synthesised here, no third-party music) ---
    x = np.arange(n) / SR
    chords = [[261.63, 329.63, 392.0, 493.88], [220.0, 261.63, 329.63, 392.0],
              [174.61, 220.0, 261.63, 329.63], [196.0, 246.94, 293.66, 392.0]]
    pad = np.zeros(n, np.float32); seg = 4.8
    for k in range(int(TOTAL / seg) + 2):
        a0 = k * seg; ch = chords[k % 4]
        i0 = int(max(0, a0 - 0.6) * SR); i1 = min(n, int((a0 + seg + 1.2) * SR))
        if i0 >= n: break
        xx = x[i0:i1] - a0
        env = np.clip((xx + 0.6) / 1.2, 0, 1) * np.clip((seg + 1.2 - xx) / 1.4, 0, 1)
        s = np.zeros(len(xx), np.float32)
        for f in ch:
            for det in (-0.6, 0.6):
                s += np.sin(2 * np.pi * (f + det) * xx) * 0.5 + 0.12 * np.sin(2 * np.pi * 2 * (f + det) * xx)
        s += 0.6 * np.sin(2 * np.pi * ch[0] / 2 * xx)
        pad[i0:i1] += (s * env).astype(np.float32)
    # gentle low-pass + normalise
    k = np.exp(-2 * np.pi * 1400 / SR)
    from scipy.signal import lfilter
    y = lfilter([1 - k], [1, -k], pad).astype(np.float32)
    y /= np.abs(y).max() + 1e-6
    fade = np.clip(x / 2.0, 0, 1) * np.clip((TOTAL + 0.2 - x) / 2.5, 0, 1)
    # duck under voice
    env = np.abs(voice); win = int(0.25 * SR)
    env = np.convolve(env, np.ones(win) / win, "same"); duck = 1 - 0.55 * np.clip(env / 0.05, 0, 1)
    music = y * fade * duck * 0.075
    mix = voice + fx + music
    mix = np.tanh(mix * 1.0) * 0.98
    sf.write("audio_premaster.wav", mix, SR, subtype="PCM_16")

def write_srt():
    def ts(s):
        ms = int(round(s * 1000)); return "%02d:%02d:%02d,%03d" % (ms // 3600000, ms // 60000 % 60, ms // 1000 % 60, ms % 1000)
    with open("captions.srt", "w") as f:
        for k, c in enumerate(CAPS, 1):
            f.write(f"{k}\n{ts(max(0, c['a']))} --> {ts(c['b'])}\n{c['text']}\n\n")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        ts_ = [float(x) for x in sys.argv[2:]]
        for x in ts_: frame(x).save(f"still_{x:05.2f}.png")
        sys.exit()
    if len(sys.argv) > 1 and sys.argv[1] == "times":
        for k in ["S2", "S3", "S4", "S5", "T_PASTE", "T_TONE", "T_GEN", "T_RESULT", "T_COPY", "T_BACK", "T_SENT", "TOTAL"]:
            print(k, round(globals()[k], 2))
        for c in CH: print(c["i"], c["start"], c["end"], c["text"])
        sys.exit()
    n = int(round(TOTAL * FPS))
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "16",
                          "-preset", "slow", "-tune", "animation", "video.mp4"], stdin=subprocess.PIPE)
    with Pool(4) as pool:
        for b in pool.imap(render_frame, range(n), chunksize=8): p.stdin.write(b)
    p.stdin.close(); p.wait()
    clicks = []; prev = ""
    for i in range(n):
        tx = composer_state(i / FPS)[0]
        if len(tx) != len(prev) and i / FPS < S3: clicks.append(i / FPS)
        prev = tx
    build_audio(clicks); write_srt()
    r = subprocess.run(["ffmpeg", "-hide_banner", "-i", "audio_premaster.wav", "-af",
                        "loudnorm=I=-14:TP=-1.5:LRA=11:print_format=json", "-f", "null", "-"], capture_output=True, text=True).stderr
    m = json.loads(r[r.rindex("{"):r.rindex("}") + 1])
    af = ("loudnorm=I=-14:TP=-1.5:LRA=11:measured_I={input_i}:measured_TP={input_tp}:measured_LRA={input_lra}:"
          "measured_thresh={input_thresh}:offset={target_offset}:linear=true").format(**m)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "audio_premaster.wav", "-af", af, "-ar", "48000",
                    "audio_master.wav"], check=True)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video.mp4", "-i", "audio_master.wav", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "256k", "-shortest", "-movflags", "+faststart", "replyright_reel_01.mp4"], check=True)
    frame(2.2).save("cover.png")
    print("done", n, "frames", TOTAL, "s")
