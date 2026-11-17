"""ReplyRight Reel 01 v4 - iOS dark-mode iMessage look + redesigned tone picker.
Reuses timing/audio helpers from ../v02/render.py. Run in a folder holding segs.json + s*.wav."""
import os, sys, math, subprocess
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v02"))
import render as B
from render import W, H, FPS, F, S, E, segs, back, P, wrap, paste_alpha, big_text, typed
from PIL import Image, ImageDraw, ImageFilter

TOTAL = B.TOTAL + 0.6; B.TOTAL = TOTAL
WHITE = (255, 255, 255); GRAYT = (142, 142, 147); YEL = (255, 224, 64); RED = (255, 59, 48)
IN_COL = (38, 38, 40); OUT_COL = (27, 138, 255); GLASS = (30, 30, 32); GLASS_LINE = (62, 62, 66)
KB_BG = (28, 28, 30); KEY = (70, 70, 74); KEY2 = (52, 52, 56)
PURPLE, PINK = (124, 77, 255), (255, 64, 150)

INCOMING = "I had a really good time tonight :)"
TONES = [
    ("Flirty", "playful", ((255, 55, 140), (255, 120, 90)), "heart",
     "Me too. Same time next week? This time, you pick the place."),
    ("Warm", "kind & clear", ((255, 149, 0), (255, 210, 40)), "sun",
     "Me too. I'd love to see you again. Are you free next week?"),
    ("Professional", "polished", ((10, 132, 255), (110, 92, 240)), "case",
     "Thank you for your time. Let's schedule a follow-up next week."),
]
CHOSEN = TONES[0][4]
DRAFTS = ["omg yes!!", "haha same", "me tooo :))", "I mean... yeah", "lol same", "ok so"]
REPLY = "Deal. Friday?"

KB_H = 760; KB_TOP = H - KB_H
COMP_UP = KB_TOP - 150; COMP_DOWN = H - 200

# ---- timing ----
T_OPEN = S(2) + 0.05; T_PANEL = T_OPEN + 0.15
T_CARDS = [T_PANEL + 0.3, T_PANEL + 0.5, T_PANEL + 0.7]
L3 = segs[3]["end"] - segs[3]["start"]
T_SAY = [segs[3]["start"], segs[3]["start"] + L3 * 0.30, segs[3]["start"] + L3 * 0.62]
T_PICK = S(4) + 0.15; T_INSERT = (T_PICK + 0.3, T_PICK + 0.9)
T_SENDTAP = E(4) + 0.05; T_SEND = T_SENDTAP + 0.12
T_TYPING = S(5) + 0.6; T_REPLY = S(5) + 2.2

# ---------- helpers ----------
def grad(size, c1, c2, diag=True):
    w, h = size
    gx = Image.linear_gradient("L").rotate(-45 if diag else 0, expand=True).resize((w, h))
    return Image.composite(Image.new("RGB", (w, h), c2), Image.new("RGB", (w, h), c1), gx)

def rr_mask(size, r, inset=0):
    m = Image.new("L", size, 0)
    ImageDraw.Draw(m).rounded_rectangle((inset, inset, size[0] - 1 - inset, size[1] - 1 - inset), r - inset, fill=255)
    return m

def glass(img, box, r):
    x0, y0, x1, y1 = [int(v) for v in box]
    d = ImageDraw.Draw(img)
    d.rounded_rectangle(box, r, fill=GLASS, outline=GLASS_LINE, width=2)
    # soft top sheen
    sh = Image.new("RGBA", (x1 - x0, y1 - y0), (0, 0, 0, 0))
    ImageDraw.Draw(sh).rounded_rectangle((3, 3, x1 - x0 - 4, (y1 - y0) // 2), r - 3, fill=(255, 255, 255, 10))
    img.alpha_composite(sh, (x0, y0))

def logo(img, cx, cy, r):
    g = grad((2 * r, 2 * r), PURPLE, PINK).convert("RGBA")
    m = Image.new("L", (2 * r, 2 * r), 0); ImageDraw.Draw(m).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255)
    g.putalpha(m); img.alpha_composite(g, (int(cx - r), int(cy - r)))
    d = ImageDraw.Draw(img); f = F("Black", int(r * 1.15)); w = d.textlength("R", font=f)
    d.text((cx - w / 2, cy - r * 0.72), "R", font=f, fill=WHITE)

# ---------- header (status bar + nav) ----------
def header():
    im = Image.new("RGBA", (W, 420), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    # fade so messages scroll under it like iOS
    for y in range(420):
        a = 255 if y < 330 else int(255 * (1 - (y - 330) / 90))
        d.line((0, y, W, y), fill=(0, 0, 0, a))
    d.text((108, 62), "23.48", font=F("SemiBold", 48), fill=WHITE)
    # bell-slash
    bx = 262
    d.chord((bx, 66, bx + 34, 104), 180, 360, fill=WHITE); d.rectangle((bx, 84, bx + 34, 98), fill=WHITE)
    d.polygon([(bx - 5, 98), (bx + 39, 98), (bx + 34, 92), (bx, 92)], fill=WHITE)
    d.ellipse((bx + 11, 100, bx + 23, 110), fill=WHITE)
    d.line((bx - 4, 64, bx + 40, 110), fill=(0, 0, 0), width=9); d.line((bx - 4, 64, bx + 40, 110), fill=WHITE, width=4)
    # signal (dotted iOS style)
    for i in range(4):
        x = 774 + i * 15; top = 100 - 8 - i * 8
        for yy in range(top, 102, 9): d.ellipse((x, yy, x + 8, yy + 7), fill=WHITE)
    d.text((842, 64), "5G", font=F("SemiBold", 40), fill=WHITE)
    d.rounded_rectangle((912, 68, 978, 104), 12, fill=(120, 120, 124))
    d.rounded_rectangle((912, 68, 912 + int(66 * 0.43), 104), 12, fill=WHITE)
    d.rounded_rectangle((981, 79, 987, 94), 3, fill=(120, 120, 124))
    f = F("Black", 28); w = d.textlength("43", font=f); d.text((945 - w / 2, 70), "43", font=f, fill=(0, 0, 0))
    # back pill
    glass(im, (45, 168, 264, 282), 57)
    d = ImageDraw.Draw(im)
    d.line([(116, 196), (90, 225), (116, 254)], fill=WHITE, width=10, joint="curve")
    d.rounded_rectangle((141, 200, 220, 252), 26, fill=WHITE)
    f = F("Bold", 34); w = d.textlength("3", font=f); d.text((180 - w / 2, 205), "3", font=f, fill=(0, 0, 0))
    # video button
    glass(im, (920, 167, 1036, 283), 58); d = ImageDraw.Draw(im)
    d.rounded_rectangle((944, 205, 994, 245), 10, outline=WHITE, width=5)
    d.polygon([(996, 225), (1014, 208), (1014, 242)], outline=WHITE, fill=None, width=5)
    # avatar
    r = 81; av = grad((2 * r, 2 * r), (98, 84, 140), (52, 44, 78), diag=False).convert("RGBA")
    m = Image.new("L", (2 * r, 2 * r), 0); ImageDraw.Draw(m).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255); av.putalpha(m)
    im.alpha_composite(av, (540 - r, 247 - r)); d = ImageDraw.Draw(im)
    f = F("Bold", 70); w = d.textlength("AM", font=f); d.text((540 - w / 2, 205), "AM", font=f, fill=WHITE)
    # name pill
    glass(im, (440, 315, 640, 405), 45); d = ImageDraw.Draw(im)
    f = F("Bold", 46); w = d.textlength("Alex", font=f); d.text((468, 330), "Alex", font=f, fill=WHITE)
    d.line([(476 + w + 8, 345), (476 + w + 18, 360), (476 + w + 8, 375)], fill=GRAYT, width=5)
    return im
HEADER = header()

# ---------- keyboard ----------
ROWS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"]
KW, KHT, GX = 92, 108, 14
def key_rects():
    rects = {}; y = 62
    for row in ROWS:
        n = len(row); x0 = (W - (n * KW + (n - 1) * GX)) / 2
        for i, ch in enumerate(row): rects[ch] = (x0 + i * (KW + GX), y, x0 + i * (KW + GX) + KW, y + KHT)
        y += KHT + 28
    rects[" "] = (290, y, 790, y + KHT)
    return rects
KR = key_rects()
def keyboard():
    im = Image.new("RGBA", (W, KB_H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, W - 1, KB_H + 80), 64, fill=KB_BG)
    d.line((60, 1, W - 60, 1), fill=(60, 60, 64), width=2)
    f = F("SemiBold", 54)
    for ch, (a, b, c, e) in KR.items():
        d.rounded_rectangle((a, b, c, e), 22, fill=KEY)
        if ch != " ":
            w = d.textlength(ch, font=f); d.text(((a + c) / 2 - w / 2, b + 22), ch, font=f, fill=WHITE)
    y = KR["Z"][1]
    d.rounded_rectangle((20, y, 140, y + KHT), 22, fill=KEY)          # shift
    d.polygon([(80, y + 26), (52, y + 58), (68, y + 58), (68, y + 82), (92, y + 82), (92, y + 58), (108, y + 58)], fill=WHITE)
    d.rounded_rectangle((940, y, 1060, y + KHT), 22, fill=KEY)        # delete
    d.polygon([(966, y + 54), (986, y + 32), (1034, y + 32), (1034, y + 76), (986, y + 76)], outline=WHITE, width=5)
    d.line((1000, y + 42, 1020, y + 66), fill=WHITE, width=5); d.line((1020, y + 42, 1000, y + 66), fill=WHITE, width=5)
    y = KR[" "][1]
    d.rounded_rectangle((20, y, 140, y + KHT), 22, fill=KEY)
    f2 = F("SemiBold", 44); w = d.textlength("123", font=f2); d.text((80 - w / 2, y + 28), "123", font=f2, fill=WHITE)
    d.rounded_rectangle((156, y, 274, y + KHT), 22, fill=KEY)
    d.ellipse((190, y + 28, 240, y + 78), fill=WHITE)                 # emoji face
    d.ellipse((203, y + 42, 211, y + 52), fill=KEY); d.ellipse((219, y + 42, 227, y + 52), fill=KEY)
    d.arc((199, y + 40, 231, y + 70), 20, 160, fill=KEY, width=5)
    d.rounded_rectangle((806, y, 1060, y + KHT), 22, fill=KEY)        # return
    d.line([(960, y + 36), (960, y + 64), (900, y + 64)], fill=WHITE, width=6)
    d.line([(916, y + 50), (898, y + 64), (916, y + 78)], fill=WHITE, width=6)
    # globe + mic row
    gy = 655
    d.ellipse((76, gy - 34, 144, gy + 34), outline=WHITE, width=5)
    d.ellipse((96, gy - 34, 124, gy + 34), outline=WHITE, width=4); d.line((76, gy, 144, gy), fill=WHITE, width=4)
    d.line((80, gy - 17, 140, gy - 17), fill=WHITE, width=3); d.line((80, gy + 17, 140, gy + 17), fill=WHITE, width=3)
    d.rounded_rectangle((950, gy - 38, 978, gy + 6), 14, outline=WHITE, width=5)
    d.arc((938, gy - 18, 990, gy + 22), 0, 180, fill=WHITE, width=5); d.line((964, gy + 22, 964, gy + 36), fill=WHITE, width=5)
    d.line((946, gy + 38, 982, gy + 38), fill=WHITE, width=5)
    return im
KB = keyboard()

# ---------- tone picker panel ----------
def icon(kind, r, cols):
    g = grad((2 * r, 2 * r), *cols).convert("RGBA")
    m = Image.new("L", (2 * r, 2 * r), 0); ImageDraw.Draw(m).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255); g.putalpha(m)
    d = ImageDraw.Draw(g); c = r
    if kind == "heart":
        s = r * 0.32
        d.ellipse((c - 2 * s, c - 1.4 * s, c, c + 0.4 * s), fill=WHITE); d.ellipse((c, c - 1.4 * s, c + 2 * s, c + 0.4 * s), fill=WHITE)
        d.polygon([(c - 1.93 * s, c - 0.2 * s), (c + 1.93 * s, c - 0.2 * s), (c, c + 1.9 * s)], fill=WHITE)
    elif kind == "sun":
        d.ellipse((c - r * 0.3, c - r * 0.3, c + r * 0.3, c + r * 0.3), fill=WHITE)
        for k in range(8):
            a = k * math.pi / 4
            d.line((c + math.cos(a) * r * 0.45, c + math.sin(a) * r * 0.45, c + math.cos(a) * r * 0.65, c + math.sin(a) * r * 0.65), fill=WHITE, width=6)
    else:
        d.rounded_rectangle((c - r * 0.55, c - r * 0.25, c + r * 0.55, c + r * 0.5), 8, fill=WHITE)
        d.rounded_rectangle((c - r * 0.22, c - r * 0.48, c + r * 0.22, c - r * 0.15), 7, outline=WHITE, width=6)
        d.line((c - r * 0.55, c + r * 0.05, c + r * 0.55, c + r * 0.05), fill=cols[0], width=4)
    return g

CW, CH = W - 60, 176
CARD_Y = [178, 372, 566]
def card(i, state):
    name, sub, cols, kind, text = TONES[i]
    pad = 40
    im = Image.new("RGBA", (CW + 2 * pad, CH + 2 * pad), (0, 0, 0, 0))
    if state == "sel":  # glow
        gl = Image.new("RGBA", im.size, (0, 0, 0, 0))
        ImageDraw.Draw(gl).rounded_rectangle((pad + 6, pad + 10, pad + CW - 6, pad + CH), 40, fill=cols[0] + (150,))
        im.alpha_composite(gl.filter(ImageFilter.GaussianBlur(22)))
    body = Image.new("RGBA", (CW, CH), (44, 44, 48, 255))
    if state == "sel":
        tint = grad((CW, CH), cols[0], cols[1]).convert("RGBA"); tint.putalpha(46)
        body.alpha_composite(tint)
    if state in ("hl", "sel"):
        ring = grad((CW, CH), cols[0], cols[1]).convert("RGBA")
        rm = rr_mask((CW, CH), 38); inner = rr_mask((CW, CH), 38, inset=5)
        ring.putalpha(Image.fromarray(__import__("numpy").clip(__import__("numpy").array(rm, int) - __import__("numpy").array(inner, int), 0, 255).astype("uint8")))
        body.alpha_composite(ring)
    else:
        ImageDraw.Draw(body).rounded_rectangle((0, 0, CW - 1, CH - 1), 38, outline=(64, 64, 70), width=2)
    body.putalpha(Image.fromarray(__import__("numpy").minimum(__import__("numpy").array(body.getchannel("A")), __import__("numpy").array(rr_mask((CW, CH), 38)))))
    d = ImageDraw.Draw(body)
    body.alpha_composite(icon(kind, 40, cols), (26, 28))
    tf = F("Bold", 38); d.text((126, 26), name, font=tf, fill=WHITE)
    tw = d.textlength(name, font=tf)
    sf = F("Medium", 28); sw = d.textlength(sub, font=sf)
    d.rounded_rectangle((126 + tw + 16, 32, 126 + tw + 16 + sw + 28, 72), 20, fill=(66, 66, 72))
    d.text((126 + tw + 30, 36), sub, font=sf, fill=(200, 200, 206))
    bf = F("Medium", 33); yy = 84
    for ln in wrap(d, text, bf, CW - 160):
        d.text((126, yy), ln, font=bf, fill=(235, 235, 240)); yy += 42
    if state == "sel":
        ck = grad((52, 52), cols[0], cols[1]).convert("RGBA")
        m = Image.new("L", (52, 52), 0); ImageDraw.Draw(m).ellipse((0, 0, 51, 51), fill=255); ck.putalpha(m)
        ImageDraw.Draw(ck).line([(14, 27), (23, 36), (39, 17)], fill=WHITE, width=6)
        body.alpha_composite(ck, (CW - 74, 26))
    im.alpha_composite(body, (pad, pad))
    return im
CARDS = [{s: card(i, s) for s in ("n", "hl", "sel")} for i in range(3)]

def panel_base():
    im = Image.new("RGBA", (W, KB_H), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    d.rounded_rectangle((0, 0, W - 1, KB_H + 80), 64, fill=(22, 22, 24))
    glow = Image.new("RGBA", (W, KB_H), (0, 0, 0, 0))
    ImageDraw.Draw(glow).ellipse((-200, -260, W + 200, 160), fill=PURPLE + (70,))
    glow = glow.filter(ImageFilter.GaussianBlur(70))
    m = rr_mask((W, KB_H + 80), 64).crop((0, 0, W, KB_H))
    glow.putalpha(Image.fromarray(__import__("numpy").minimum(__import__("numpy").array(glow.getchannel("A")), __import__("numpy").array(m))))
    im.alpha_composite(glow)
    d = ImageDraw.Draw(im)
    d.line((60, 1, W - 60, 1), fill=(80, 70, 120), width=2)
    logo(im, 74, 66, 34); d = ImageDraw.Draw(im)
    d.text((124, 40), "ReplyRight", font=F("Bold", 42), fill=WHITE)
    lbl = "Pick a vibe"; f = F("SemiBold", 30); w = d.textlength(lbl, font=f)
    d.rounded_rectangle((W - 40 - w - 44, 40, W - 40, 92), 26, fill=(58, 54, 74))
    d.text((W - 40 - 22 - w, 48), lbl, font=f, fill=(220, 220, 230))
    q = 'Replying to "I had a really good time tonight :)"'
    d.text((44, 116), q, font=F("Regular", 29), fill=GRAYT)
    return im
PANEL = panel_base()

def panel(t):
    im = PANEL.copy(); picked = t >= T_PICK
    for i in range(3):
        ap = P(t, T_CARDS[i], T_CARDS[i] + 0.28)
        if ap <= 0: continue
        hl = P(t, T_SAY[i], T_SAY[i] + 0.15) * (1 - P(t, T_SAY[i] + 0.55, T_SAY[i] + 0.8))
        sel = P(t, T_PICK, T_PICK + 0.2) if i == 0 else 0
        dim = 0.35 if picked and i != 0 else 1.0
        sc = 0.92 + 0.08 * back(ap)
        if sel > 0: sc *= 1 + 0.02 * sel
        x = 30 - 40 - (sc - 1) * CW / 2; y = CARD_Y[i] - 40 + (1 - ap) * 50
        for key, a in (("n", 1.0), ("hl", hl * (1 - sel)), ("sel", sel)):
            if a > 0.01: paste_alpha(im, CARDS[i][key], (x, y), alpha=min(1, ap) * dim * a, scale=sc)
    return im

# ---------- bubbles ----------
BF = F("Medium", 46)
def bubble_img(text, out, marks=(), mark_p=0.0):
    tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    lines = wrap(tmp, text, BF, 660); lh = 60; padx, pady = 36, 26
    tw = max(tmp.textlength(l, font=BF) for l in lines)
    bw, bh = int(tw + 2 * padx), int(len(lines) * lh + 2 * pady)
    im = Image.new("RGBA", (bw + 40, bh + 10), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    col = OUT_COL if out else IN_COL; ox = 20
    d.rounded_rectangle((ox, 0, ox + bw, bh), 52, fill=col)
    if out: d.ellipse((ox + bw - 40, bh - 44, ox + bw + 14, bh), fill=col)
    else: d.ellipse((ox - 14, bh - 44, ox + 40, bh), fill=col)
    a = im.getchannel("A"); ad = ImageDraw.Draw(a)
    if out: ad.ellipse((ox + bw + 2, bh - 60, ox + bw + 44, bh - 6), fill=0)
    else: ad.ellipse((ox - 44, bh - 60, ox - 2, bh - 6), fill=0)
    im.putalpha(a); d = ImageDraw.Draw(im)
    y = pady - 4; ml = list(marks)
    for l in lines:
        x = ox + padx
        for wd in l.split():
            ww = d.textlength(wd, font=BF); on = bool(ml) and wd == ml[0]
            if on: ml.pop(0)
            if on and mark_p > 0:
                d.rounded_rectangle((x - 6, y + 4, x - 6 + (ww + 12) * mark_p, y + 58), 12, fill=YEL)
                d.text((x, y), wd, font=BF, fill=(0, 0, 0) if mark_p > 0.4 else WHITE)
            else:
                d.text((x, y), wd, font=BF, fill=WHITE)
            x += d.textlength(wd + " ", font=BF)
        y += lh
    return im, bh

def tap(img, t, t0, x, y):
    if not (t0 <= t < t0 + 0.45): return
    k = (t - t0) / 0.45; r = 34 + 36 * k
    ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
    od.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(70 * (1 - k))), outline=(255, 255, 255, int(220 * (1 - k))), width=5)
    od.ellipse((x - 24, y - 24, x + 24, y + 24), fill=(255, 255, 255, int(160 * (1 - k))))
    img.alpha_composite(ov)

def composer_text(t):
    if t < S(2):
        a, b = 0.15, S(2) - 0.15; k = (t - a) / (b - a) * len(DRAFTS)
        if k < 0: return DRAFTS[0][:5]
        i = min(int(k), len(DRAFTS) - 1); fr = k - int(k); s = DRAFTS[i]
        return s[:int(round(len(s) * (min(1, fr / 0.6) if fr < 0.6 else 1 - (fr - 0.6) / 0.4)))]
    if t < T_INSERT[0]: return ""
    if t < T_SEND: return typed(CHOSEN, t, *T_INSERT)
    return ""

def draw_caption(base, t, y):
    for gi, g in enumerate(B.CAPS):
        st = g[0]["t"]; seg = segs[g[0]["seg"]]
        nxt = B.CAPS[gi + 1] if gi + 1 < len(B.CAPS) else None
        en = nxt[0]["t"] if nxt and nxt[0]["seg"] == g[0]["seg"] else seg["end"] + 0.15
        if st <= t < en:
            if g[0]["seg"] in (0, 5): return
            d = ImageDraw.Draw(base); txt = " ".join(w["w"] for w in g).upper()
            f = F("ExtraBold", max(10, int(70 * (0.85 + 0.15 * back(min(1, (t - st) / 0.16))))))
            x = (W - d.textlength(txt, font=f)) / 2
            for w in g:
                s = w["w"].upper()
                d.text((x, y), s, font=f, fill=YEL if w["t"] <= t else WHITE, stroke_width=7, stroke_fill=(0, 0, 0))
                x += d.textlength(s + " ", font=f)
            return

def frame(t):
    img = Image.new("RGBA", (W, H), (0, 0, 0, 255)); d = ImageDraw.Draw(img)
    f1, f2 = F("Bold", 32), F("Medium", 32)
    tw = d.textlength("Today ", font=f1) + d.textlength("23.48", font=f2); x = (W - tw) / 2
    d.text((x, 430), "Today ", font=f1, fill=GRAYT); d.text((x + d.textlength("Today ", font=f1), 430), "23.48", font=f2, fill=GRAYT)
    y = 490
    mark = P(t, S(1) + 0.9, S(1) + 1.5) * (1 - P(t, S(2), S(2) + 0.3))
    inc, ih = bubble_img(INCOMING, False, marks=("really", "good", "time"), mark_p=mark)
    paste_alpha(img, inc, (24, y)); y += ih + 40
    if t >= T_SEND:
        p = P(t, T_SEND, T_SEND + 0.28); g, gh = bubble_img(CHOSEN, True)
        paste_alpha(img, g, (W - 24, y + (1 - p) * 500), alpha=min(1, p * 1.5), anchor="tr"); y += gh + 14
        if t >= T_SEND + 0.5:
            if t >= T_TYPING:
                fa, fb = F("Bold", 30), F("Medium", 30); w = d.textlength("Read ", font=fa) + d.textlength("23.49", font=fb)
                d.text((W - 60 - w, y), "Read ", font=fa, fill=GRAYT); d.text((W - 60 - w + d.textlength("Read ", font=fa), y), "23.49", font=fb, fill=GRAYT)
            else:
                f = F("Bold", 30); w = d.textlength("Delivered", font=f); d.text((W - 60 - w, y), "Delivered", font=f, fill=GRAYT)
        y += 64
    if T_TYPING <= t < T_REPLY:
        p = back(min(1, (t - T_TYPING) / 0.25))
        tb = Image.new("RGBA", (230, 120), (0, 0, 0, 0)); td = ImageDraw.Draw(tb)
        td.rounded_rectangle((20, 0, 200, 100), 50, fill=IN_COL)
        td.ellipse((6, 78, 34, 106), fill=IN_COL); td.ellipse((-4, 102, 12, 118), fill=IN_COL)
        for i in range(3):
            b = 0.45 + 0.55 * max(0, math.sin(((t * 3.2 - i * 0.22) % 1.0) * math.pi)); c = int(110 + 90 * b)
            td.ellipse((58 + i * 44 - 13, 37 - 6 * b, 58 + i * 44 + 13, 63 - 6 * b), fill=(c, c, c))
        paste_alpha(img, tb, (24, y + 10), scale=max(0.01, p))
    if t >= T_REPLY:
        p = P(t, T_REPLY, T_REPLY + 0.25); r, _ = bubble_img(REPLY, False)
        paste_alpha(img, r, (24, y + 10 + (1 - p) * 40), alpha=p)

    # ---- composer + keyboard / panel ----
    down = P(t, T_SEND, T_SEND + 0.35); up = P(t, T_PANEL, T_PANEL + 0.3)
    kb_y = int(KB_TOP + down * (KB_H + 40))
    cy = int(COMP_UP * (1 - down) + COMP_DOWN * down)
    d = ImageDraw.Draw(img)
    # left button: ReplyRight logo in a glass circle (replaces "+")
    glass(img, (42, cy, 150, cy + 108), 54); logo(img, 96, cy + 54, 34)
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((176, cy - 2, 1040, cy + 110), 56, fill=(10, 10, 12), outline=(52, 52, 56), width=3)
    ct = composer_text(t); fc = F("Regular", 46)
    if ct:
        shown = ct
        while d.textlength(shown, font=fc) > 700 and len(shown) > 1: shown = shown[1:]
        d.text((218, cy + 26), shown, font=fc, fill=WHITE); cx = 218 + d.textlength(shown, font=fc) + 3
        d.ellipse((958, cy + 16, 1030, cy + 88), fill=OUT_COL)
        d.line((994, cy + 72, 994, cy + 34), fill=WHITE, width=8)
        d.line([(974, cy + 52), (994, cy + 32), (1014, cy + 52)], fill=WHITE, width=8)
    else:
        d.text((218, cy + 26), "iMessage", font=fc, fill=(110, 110, 116)); cx = 214
        d.rounded_rectangle((968, cy + 28, 988, cy + 62), 10, outline=(110, 110, 116), width=4)
        d.arc((958, cy + 40, 998, cy + 76), 0, 180, fill=(110, 110, 116), width=4)
        d.line((978, cy + 76, 978, cy + 86), fill=(110, 110, 116), width=4)
    if down < 1 and int(t * 2.2) % 2 == 0:
        d.rounded_rectangle((cx, cy + 20, cx + 5, cy + 90), 2, fill=OUT_COL)
    if down < 1:
        img.alpha_composite(KB, (0, kb_y))
        prev = composer_text(t - 1 / FPS)
        if t < S(2) and len(ct) > len(prev) and ct[-1].upper() in KR and ct[-1] != " ":
            ch = ct[-1].upper(); a, b, c, e = KR[ch]
            d.rounded_rectangle((a - 16, kb_y + b - 136, c + 16, kb_y + e), 24, fill=(102, 102, 108))
            fk = F("SemiBold", 72); d.text(((a + c) / 2 - d.textlength(ch, font=fk) / 2, kb_y + b - 120), ch, font=fk, fill=WHITE)
        if up > 0:
            img.alpha_composite(panel(t), (0, int(kb_y + (1 - up) * KB_H)))
    img.alpha_composite(HEADER, (0, 0))
    tap(img, t, T_OPEN, 96, COMP_UP + 54)
    tap(img, t, T_PICK, W / 2 + 220, KB_TOP + CARD_Y[0] + 100)
    tap(img, t, T_SENDTAP, 994, COMP_UP + 52)

    # ---- overlays ----
    ha = 1 - P(t, E(0) + 0.15, E(0) + 0.35)
    if ha > 0:
        big_text(img, ["DON'T REPLY", "TO THIS TEXT", "YET"], 640, 104, alpha=ha, colors=[YEL, WHITE, WHITE])
        ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
        txt = "15 replies deleted"; f = F("Black", 46); w = od.textlength(txt, font=f)
        od.rounded_rectangle(((W - w) / 2 - 38, 990, (W + w) / 2 + 38, 1072), 41, fill=RED + (int(255 * ha),))
        od.text(((W - w) / 2, 1002), txt, font=f, fill=(255, 255, 255, int(255 * ha)))
        img.alpha_composite(ov)
    if t >= S(5):
        p = back(min(1, (t - S(5)) / 0.25))
        big_text(img, ["YOUR WORDS,", "JUST BETTER."], 1250, 104, scale=max(0.05, p), colors=[WHITE, YEL])
        if t >= S(5) + 1.35:
            q = back(min(1, (t - S(5) - 1.35) / 0.25))
            ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
            txt = 'Comment "WORDS" for early access'; f = F("Black", max(8, int(46 * q))); w = od.textlength(txt, font=f)
            bw_, bh_ = int(w + 72), max(2, int(96 * q))
            pill = grad((bw_, bh_), PURPLE, PINK).convert("RGBA"); pill.putalpha(rr_mask((bw_, bh_), bh_ // 2))
            ov.alpha_composite(pill, (int((W - bw_) / 2), 1510))
            od.text(((W - w) / 2, 1510 + 20 * q), txt, font=f, fill=WHITE)
            img.alpha_composite(ov)
    if t < S(5):
        draw_caption(img, t, 1560 if down >= 1 else COMP_UP - 112)
    z = 1 + 0.10 * (1 - P(t, 0.03, 0.45)) if t > 0 else 1.0
    out = img.convert("RGB")
    if z > 1.001:
        cw, ch = W / z, H / z; cyy = 760
        out = out.crop((int(W / 2 - cw / 2), int(cyy - ch / 2), int(W / 2 + cw / 2), int(cyy + ch / 2))).resize((W, H), Image.LANCZOS)
    return out, ct

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        ts = [float(x) for x in sys.argv[2:]] or [0.0, S(1) + 1.8, T_PANEL + 0.9, T_SAY[1] + 0.3, T_PICK + 0.3, T_INSERT[1] + 0.5, T_SEND + 0.9, TOTAL - 0.3]
        for x in ts: frame(x)[0].save(f"still_{x:.2f}.png")
        ims = [frame(x)[0].resize((270, 480)) for x in ts]
        c = Image.new("RGB", (270 * len(ims), 480)); [c.paste(im, (i * 270, 0)) for i, im in enumerate(ims)]
        c.save("contact.png"); frame(0.0)[0].save("cover.png"); sys.exit()
    n = int(TOTAL * FPS)
    events = [("impact", 0.0), ("pop", T_OPEN), ("pop", T_PICK), ("pop", T_SENDTAP), ("send", T_SEND), ("ding", T_REPLY),
              ("send", T_INSERT[0] - 0.05)]
    events += [("pop", x) for x in T_SAY] + [("pop", S(5)), ("pop", S(5) + 1.35)]
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                          "-preset", "medium", "video.mp4"], stdin=subprocess.PIPE)
    prev = ""
    for i in range(n):
        tt = i / FPS; im, ct = frame(tt)
        if ct != prev and tt < S(2): events.append(("click", tt))
        prev = ct; p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait()
    B.build_audio(events)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video.mp4", "-i", "mix.wav", "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-ar", "44100", "-shortest", "-movflags", "+faststart", "out.mp4"], check=True)
    frame(0.0)[0].save("cover.png")
    print("done", n, "frames", round(TOTAL, 2), "s")
