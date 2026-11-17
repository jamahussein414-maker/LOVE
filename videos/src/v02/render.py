"""ReplyRight Reel 01 v2 - iMessage-style chat, hook-first, with SFX.
Usage: python3 render.py [stills]
Needs segs.json + s*.wav from tts.py in the working directory."""
import json, math, random, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
FD = "/usr/share/fonts/opentype/inter/"
def F(w, s): return ImageFont.truetype(FD + f"Inter-{w}.otf", s)

# ---------- timeline from TTS ----------
segs = json.load(open("segs.json"))
LEAD = 0.08
t = LEAD
for s in segs:
    s["start"] = t; s["end"] = t + s["dur"]; t = s["end"] + s["gap"]
TOTAL = t + 1.6
def S(i): return segs[i]["start"]
def E(i): return segs[i]["end"]

# ---------- palette ----------
BLUE = (10, 132, 255); GRAY_B = (233, 233, 235); TXT = (0, 0, 0)
SUB = (142, 142, 147); SEP = (216, 216, 220); YEL = (255, 224, 64); RED = (255, 59, 48)

def ease(x): x = max(0.0, min(1.0, x)); return 1 - (1 - x) ** 3
def back(x):  # overshoot pop
    x = max(0.0, min(1.0, x)); c = 1.9; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2
def P(t, a, b): return ease((t - a) / (b - a)) if b > a else float(t >= a)

def wrap(d, text, f, maxw):
    out, cur = [], ""
    for w in text.split():
        tst = (cur + " " + w).strip()
        if d.textlength(tst, font=f) <= maxw: cur = tst
        else: out.append(cur); cur = w
    if cur: out.append(cur)
    return out

# ---------- static pieces ----------
def status_and_nav():
    im = Image.new("RGBA", (W, 340), (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    d.rectangle((0, 0, W, 330), fill=(247, 247, 247))
    d.line((0, 330, W, 330), fill=SEP, width=2)
    d.text((95, 38), "9:41", font=F("SemiBold", 46), fill=TXT)
    # signal bars
    for i in range(4):
        x = 820 + i * 17; d.rounded_rectangle((x, 72 - 10 - i * 7, x + 11, 72), 3, fill=TXT)
    # wifi
    for r, wd in [(30, 6), (19, 6), (8, 8)]:
        d.arc((913 - r, 74 - r, 913 + r, 74 + r), 225, 315, fill=TXT, width=wd)
    # battery
    d.rounded_rectangle((955, 46, 1013, 74), 9, outline=(150, 150, 150), width=3)
    d.rounded_rectangle((960, 51, 1000, 69), 5, fill=TXT)
    d.rounded_rectangle((1016, 55, 1021, 66), 2, fill=(150, 150, 150))
    # back chevron + count
    d.line([(78, 170), (52, 196), (78, 222)], fill=BLUE, width=8, joint="curve")
    d.ellipse((96, 172, 156, 220), fill=BLUE)
    d.text((112, 175), "3", font=F("SemiBold", 34), fill=(255, 255, 255))
    # avatar
    av = Image.new("RGBA", (130, 130)); ad = ImageDraw.Draw(av)
    for y in range(130):
        k = y / 130; c = (int(168 - 30 * k), int(172 - 30 * k), int(184 - 30 * k))
        ad.line((0, y, 130, y), fill=c)
    m = Image.new("L", (130, 130), 0); ImageDraw.Draw(m).ellipse((0, 0, 129, 129), fill=255)
    im.paste(av, (W // 2 - 65, 128), m)
    f = F("SemiBold", 58); w = d.textlength("A", font=f)
    d.text((W / 2 - w / 2, 156), "A", font=f, fill=(255, 255, 255))
    f = F("Regular", 30); txt = "Alex"; w = d.textlength(txt, font=f)
    d.text((W / 2 - w / 2 - 8, 268), txt, font=f, fill=TXT)
    d.line([(W / 2 + w / 2, 276), (W / 2 + w / 2 + 9, 285), (W / 2 + w / 2, 294)], fill=SUB, width=3)
    # facetime icon
    d.rounded_rectangle((935, 178, 995, 220), 10, outline=BLUE, width=5)
    d.polygon([(998, 199), (1028, 180), (1028, 218)], fill=BLUE)
    return im
HEADER = status_and_nav()

KB_H = 640
ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"]
KEYW, KEYH, GAPX = 93, 112, 14
def key_rects():
    rects = {}
    y = 22
    for r, row in enumerate(ROWS):
        n = len(row); total = n * KEYW + (n - 1) * GAPX
        x0 = (W - total) / 2
        for i, ch in enumerate(row):
            rects[ch] = (x0 + i * (KEYW + GAPX), y, x0 + i * (KEYW + GAPX) + KEYW, y + KEYH)
        y += KEYH + 26
    rects[" "] = (250, y, 830, y + KEYH)
    return rects
KR = key_rects()
def keyboard():
    im = Image.new("RGBA", (W, KB_H), (209, 211, 217, 255)); d = ImageDraw.Draw(im)
    f = F("Regular", 52)
    for ch, (a, b, c, e) in KR.items():
        d.rounded_rectangle((a, b + 3, c, e + 3), 14, fill=(137, 138, 141))
        d.rounded_rectangle((a, b, c, e), 14, fill=(255, 255, 255))
        if ch != " ":
            w = d.textlength(ch, font=f); d.text(((a + c) / 2 - w / 2, b + 22), ch, font=f, fill=TXT)
    d.text((468, KR[" "][1] + 34), "space", font=F("Regular", 36), fill=TXT)
    y = KR["z"][1]
    for (a, c) in [(14, 128), (952, 1066)]:
        d.rounded_rectangle((a, y, c, y + KEYH), 14, fill=(171, 176, 188))
    y = KR[" "][1]
    for (a, c, lbl) in [(14, 236, "123"), (844, 1066, "return")]:
        d.rounded_rectangle((a, y, c, y + KEYH), 14, fill=(171, 176, 188))
        w = d.textlength(lbl, font=F("Regular", 36)); d.text(((a + c) / 2 - w / 2, y + 34), lbl, font=F("Regular", 36), fill=TXT)
    d.rounded_rectangle((W / 2 - 140, KB_H - 30, W / 2 + 140, KB_H - 20), 5, fill=TXT)
    return im
KB = keyboard()

# ---------- bubbles ----------
BF = F("Regular", 50)
def bubble_img(text, out, marks=(), mark_p=0.0):
    tmp = ImageDraw.Draw(Image.new("RGB", (1, 1)))
    lines = wrap(tmp, text, BF, 640)
    lh = 64; padx, pady = 36, 22
    tw = max(tmp.textlength(l, font=BF) for l in lines)
    bw, bh = int(tw + 2 * padx), int(len(lines) * lh + 2 * pady)
    im = Image.new("RGBA", (bw + 40, bh + 10), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
    col = BLUE if out else GRAY_B
    ox = 20
    d.rounded_rectangle((ox, 0, ox + bw, bh), 46, fill=col)
    # tail
    if out:
        d.ellipse((ox + bw - 40, bh - 44, ox + bw + 14, bh), fill=col)
        d.ellipse((ox + bw + 2, bh - 58, ox + bw + 40, bh - 4), fill=(0, 0, 0, 0))
        im2 = im.copy(); d2 = ImageDraw.Draw(im2)
    else:
        d.ellipse((ox - 14, bh - 44, ox + 40, bh), fill=col)
        d.ellipse((ox - 40, bh - 58, ox - 2, bh - 4), fill=(0, 0, 0, 0))
    # carve tails (transparent ellipse draw doesn't erase) -> mask approach
    a = im.getchannel("A")
    ad = ImageDraw.Draw(a)
    if out: ad.ellipse((ox + bw + 2, bh - 60, ox + bw + 44, bh - 6), fill=0)
    else: ad.ellipse((ox - 44, bh - 60, ox - 2, bh - 6), fill=0)
    im.putalpha(a); d = ImageDraw.Draw(im)
    y = pady - 4
    fg = (255, 255, 255) if out else TXT
    ml = list(marks)
    for l in lines:
        x = ox + padx
        for wd in l.split():
            ww = d.textlength(wd, font=BF)
            on = bool(ml) and wd == ml[0]
            if on and mark_p > 0:
                ml.pop(0)
                d.rounded_rectangle((x - 6, y + 4, x - 6 + (ww + 12) * mark_p, y + 62), 12, fill=YEL)
                d.text((x, y), wd, font=BF, fill=TXT if mark_p > 0.4 else fg)
            else:
                if on: ml.pop(0)
                d.text((x, y), wd, font=BF, fill=fg)
            x += d.textlength(wd + " ", font=BF)
        y += lh
    return im, bh

def paste_alpha(base, im, xy, alpha=1.0, scale=1.0, anchor="tl"):
    if alpha <= 0: return
    if scale != 1.0:
        im = im.resize((max(1, int(im.width * scale)), max(1, int(im.height * scale))), Image.LANCZOS)
    if alpha < 1:
        a = im.getchannel("A").point(lambda v: int(v * alpha)); im = im.copy(); im.putalpha(a)
    x, y = xy
    if anchor == "tr": x -= im.width
    base.alpha_composite(im, (int(x), int(y)))

def big_text(base, lines, y, size, alpha=1.0, scale=1.0, colors=None, stroke=8):
    ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(ov)
    f = F("ExtraBold", int(size * scale))
    for i, l in enumerate(lines):
        w = d.textlength(l, font=f)
        col = (colors[i] if colors else (255, 255, 255))
        d.text(((W - w) / 2, y + i * size * 1.08 * scale), l, font=f, fill=col + (int(255 * alpha),),
               stroke_width=stroke, stroke_fill=(0, 0, 0, int(255 * alpha)))
    base.alpha_composite(ov)

# ---------- composer state ----------
INCOMING = "I had a really good time tonight :)"
BADMSG = "omg same!! haha"
GOOD = "Me too. I'd love to see you again. Are you free next week?"
DRAFTS = ["omg yes!!", "haha same", "me tooo :))", "I mean... yeah", "lol same", "ok so"]

def typed(text, t, a, b):
    if t < a: return ""
    return text[:int(round(len(text) * min(1, (t - a) / (b - a))))]

T_BADSEND = S(2) + 1.75
T_STAMP = S(2) + 2.55
T_UNSEND = S(2) + 4.15
T_GOODSEND = E(3) + 0.05
T_KBDOWN = T_GOODSEND + 0.05
T_TYPING = S(5) + 0.2

def composer_text(t):
    if t < S(2):
        a, b = 0.15, S(2) - 0.15
        k = (t - a) / (b - a) * len(DRAFTS)
        if k < 0: return DRAFTS[0][:5]
        i = min(int(k), len(DRAFTS) - 1); fr = k - int(k)
        s = DRAFTS[i]
        return s[:int(round(len(s) * (min(1, fr / 0.6) if fr < 0.6 else 1 - (fr - 0.6) / 0.4)))]
    if t < T_BADSEND: return typed(BADMSG, t, S(2) + 0.35, T_BADSEND - 0.25)
    if t < S(3) + 0.25: return ""
    if t < T_GOODSEND: return typed(GOOD, t, S(3) + 0.25, T_GOODSEND - 0.3)
    return ""

def kb_offset(t):  # 0 = fully up, 1 = fully down
    return P(t, T_KBDOWN, T_KBDOWN + 0.35)

# ---------- captions ----------
def caption_words():
    out = []
    for i, s in enumerate(segs):
        words = s["text"].split(); lens = [len(w) + 1 for w in words]; tot = sum(lens); acc = 0
        for w, l in zip(words, lens):
            a = s["start"] + (s["end"] - s["start"]) * acc / tot; acc += l
            out.append({"w": w, "t": a, "seg": i})
    # group into chunks of <=3 words, break after punctuation
    groups, cur = [], []
    for wd in out:
        cur.append(wd)
        if len(cur) == 3 or wd["w"][-1] in ".,?!" :
            groups.append(cur); cur = []
    if cur: groups.append(cur)
    return groups
CAPS = caption_words()

def draw_caption(base, t, y):
    for gi, g in enumerate(CAPS):
        st = g[0]["t"]; seg = segs[g[0]["seg"]]
        en = CAPS[gi + 1][0]["t"] if gi + 1 < len(CAPS) and CAPS[gi + 1][0]["seg"] == g[0]["seg"] else seg["end"] + 0.15
        if st <= t < en:
            if g[0]["seg"] in (0, 4): return  # hook has its own big text
            f = F("Black", 72)
            d = ImageDraw.Draw(base)
            txt = " ".join(w["w"] for w in g).upper()
            pop = back(min(1, (t - st) / 0.16))
            f = F("ExtraBold", max(10, int(70 * (0.85 + 0.15 * pop))))
            total = d.textlength(txt, font=f); x = (W - total) / 2
            for w in g:
                s = w["w"].upper()
                col = YEL if w["t"] <= t else (255, 255, 255)
                d.text((x, y), s, font=f, fill=col, stroke_width=7, stroke_fill=(0, 0, 0))
                x += d.textlength(s + " ", font=f)
            return

# ---------- frame ----------
IN_IMG, IN_H = bubble_img(INCOMING, False)
BAD_IMG, BAD_H = bubble_img(BADMSG, True)

def frame(t, rnd=random.Random(1)):
    img = Image.new("RGBA", (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(img)
    # timestamp
    f1, f2 = F("SemiBold", 28), F("Regular", 28)
    for txt, f, y in [("iMessage", f1, 368), ("Today 11:48 PM", f2, 404)]:
        w = d.textlength(txt, font=f); d.text(((W - w) / 2, y), txt, font=f, fill=SUB)
    y = 470
    # incoming bubble (present from frame 0 so the cover shows it)
    mark = P(t, S(1) + 0.9, S(1) + 1.5)
    inc, ih = bubble_img(INCOMING, False, marks=("really", "good", "time"), mark_p=mark * (1 - P(t, S(2), S(2) + 0.3)))
    paste_alpha(img, inc, (28, y))
    y += ih + 34
    # bad message: sent, stamped, unsent
    if t >= T_BADSEND:
        if t < T_UNSEND + 0.35:
            p = P(t, T_BADSEND, T_BADSEND + 0.25)
            dy = (1 - p) * 120
            sc = 1.0
            al = 1.0
            if t >= T_UNSEND:
                q = P(t, T_UNSEND, T_UNSEND + 0.35); sc = 1 - 0.6 * q; al = 1 - q
            sx = rnd.randint(-10, 10) if T_STAMP <= t < T_STAMP + 0.3 else 0
            paste_alpha(img, BAD_IMG, (W - 28 + sx, y + dy), alpha=al, scale=sc, anchor="tr")
            if t >= T_STAMP:
                sp = back(min(1, (t - T_STAMP) / 0.22)) * (1 - P(t, T_UNSEND - 0.1, T_UNSEND + 0.2))
                if sp > 0:
                    st = Image.new("RGBA", (560, 150), (0, 0, 0, 0)); sd = ImageDraw.Draw(st)
                    sd.rounded_rectangle((8, 8, 552, 142), 22, outline=RED, width=10)
                    fw = F("Black", 82); w = sd.textlength("NERVOUS", font=fw)
                    sd.text(((560 - w) / 2, 22), "NERVOUS", font=fw, fill=RED)
                    st = st.rotate(-8, expand=True, resample=Image.BICUBIC)
                    s2 = 1.6 - 0.6 * min(1, (t - T_STAMP) / 0.18)
                    paste_alpha(img, st, (W / 2 - 330 - (s2 - 1) * 300, y + BAD_H + 30 - (s2 - 1) * 80), alpha=min(1, sp), scale=s2)
        if t >= T_UNSEND + 0.2:
            a = P(t, T_UNSEND + 0.2, T_UNSEND + 0.45)
            txt = "You unsent a message."
            f = F("Regular", 30); w = d.textlength(txt, font=f)
            ov = Image.new("RGBA", (W, H)); ImageDraw.Draw(ov).text(((W - w) / 2, y + 20), txt, font=f, fill=SUB + (int(255 * a),))
            img.alpha_composite(ov)
            y += 90
        else:
            y += BAD_H + 34
    # good message
    if t >= T_GOODSEND:
        p = P(t, T_GOODSEND, T_GOODSEND + 0.28)
        mk = P(t, S(4) + 0.1, S(4) + 0.7)
        gim, gh = bubble_img(GOOD, True, marks=("see", "you", "again.", "free", "next", "week?"), mark_p=mk)
        paste_alpha(img, gim, (W - 28, y + (1 - p) * 500), alpha=min(1, p * 1.5), anchor="tr")
        y += gh + 12
        if t >= T_GOODSEND + 0.5:
            dlbl = "Read 11:49 PM" if t >= T_TYPING else "Delivered"
            f = F("SemiBold", 28); w = d.textlength(dlbl, font=f)
            d.text((W - 50 - w, y), dlbl, font=f, fill=SUB)
        y += 60
    # typing indicator from Alex (cliffhanger)
    if t >= T_TYPING:
        p = back(min(1, (t - T_TYPING) / 0.25))
        tb = Image.new("RGBA", (230, 120), (0, 0, 0, 0)); td = ImageDraw.Draw(tb)
        td.rounded_rectangle((20, 0, 200, 96), 48, fill=GRAY_B)
        td.ellipse((6, 76, 34, 104), fill=GRAY_B); td.ellipse((-4, 100, 12, 116), fill=GRAY_B)
        for i in range(3):
            ph = (t * 3.2 - i * 0.22) % 1.0
            b = 0.45 + 0.55 * max(0, math.sin(ph * math.pi))
            c = int(170 - 70 * b)
            td.ellipse((58 + i * 44 - 13, 48 - 13 - 6 * b, 58 + i * 44 + 13, 48 + 13 - 6 * b), fill=(c, c, c + 3))
        paste_alpha(img, tb, (28, y + 10), scale=max(0.01, p))

    # composer + keyboard
    off = kb_offset(t)
    kb_y = int(H - KB_H + off * KB_H)
    comp_y = kb_y - 130 if off < 1 else H - 170
    comp_y = int((H - KB_H - 130) * (1 - off) + (H - 170) * off)
    d = ImageDraw.Draw(img)
    d.rectangle((0, comp_y - 10, W, H), fill=(255, 255, 255))
    d.ellipse((30, comp_y + 14, 110, comp_y + 94), fill=(233, 233, 235))
    d.line((70, comp_y + 34, 70, comp_y + 74), fill=SUB, width=6); d.line((50, comp_y + 54, 90, comp_y + 54), fill=SUB, width=6)
    d.rounded_rectangle((130, comp_y + 6, W - 30, comp_y + 102), 48, outline=(200, 200, 204), width=3, fill=(255, 255, 255))
    ct = composer_text(t)
    fc = F("Regular", 46)
    if ct:
        shown = ct
        while d.textlength(shown, font=fc) > W - 330 and len(shown) > 1: shown = shown[1:]
        d.text((170, comp_y + 26), shown, font=fc, fill=TXT)
        cx = 170 + d.textlength(shown, font=fc) + 3
        d.ellipse((W - 112, comp_y + 16, W - 40, comp_y + 88), fill=BLUE)
        d.line((W - 76, comp_y + 72, W - 76, comp_y + 34), fill=(255, 255, 255), width=8)
        d.line([(W - 96, comp_y + 52), (W - 76, comp_y + 32), (W - 56, comp_y + 52)], fill=(255, 255, 255), width=8)
    else:
        d.text((170, comp_y + 26), "iMessage", font=fc, fill=(190, 190, 194)); cx = 168
    if off < 1 and int(t * 2.2) % 2 == 0:
        d.rounded_rectangle((cx, comp_y + 22, cx + 5, comp_y + 86), 2, fill=BLUE)
    if off < 1:
        img.alpha_composite(KB, (0, kb_y))
        # key popup for last typed char
        prev = composer_text(t - 1 / FPS)
        if len(ct) > len(prev):
            ch = ct[-1].lower()
            if ch in KR:
                a, b, c, e = KR[ch]
                if ch == " ":
                    d.rounded_rectangle((a, kb_y + b, c, kb_y + e), 14, fill=(171, 176, 188))
                else:
                    d.rounded_rectangle((a - 14, kb_y + b - 130, c + 14, kb_y + e), 18, fill=(255, 255, 255), outline=(180, 180, 186), width=2)
                    fk = F("Regular", 70); w = d.textlength(ch, font=fk)
                    d.text(((a + c) / 2 - w / 2, kb_y + b - 112), ch, font=fk, fill=TXT)
    img.alpha_composite(HEADER, (0, 0))

    # ---- overlays ----
    # HOOK (visible on frame 0 = cover)
    ha = 1 - P(t, E(0) + 0.15, E(0) + 0.35)
    if ha > 0:
        sc = 1.0 if t < 0.05 else 1.0  # cover frame already full size
        big_text(img, ["DON'T REPLY", "TO THIS TEXT", "YET"], 660, 120, alpha=ha, colors=[YEL, (255, 255, 255), (255, 255, 255)])
        # deleted-drafts badge
        bd = ImageDraw.Draw(img)
        txt = "15 replies deleted"
        f = F("Black", 50); w = bd.textlength(txt, font=f)
        ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
        od.rounded_rectangle(((W - w) / 2 - 40, 1050, (W + w) / 2 + 40, 1140), 45, fill=RED + (int(255 * ha),))
        od.text(((W - w) / 2, 1062), txt, font=f, fill=(255, 255, 255, int(255 * ha)))
        img.alpha_composite(ov)
    # SIMPLE / WARM / MAKES A PLAN
    words = [("SIMPLE.", S(4) + 0.05), ("WARM.", S(4) + 0.6), ("MAKES A PLAN.", S(4) + 1.55)]
    fade = 1 - P(t, S(5) - 0.15, S(5) + 0.1)
    for i, (wd, st) in enumerate(words):
        if t >= st and fade > 0:
            p = back(min(1, (t - st) / 0.2))
            big_text(img, [wd], 1150 + i * 120, 104, alpha=fade, scale=max(0.05, p), colors=[YEL if i == 2 else (255, 255, 255)], stroke=8)
    # end question
    if t >= S(5):
        p = back(min(1, (t - S(5)) / 0.25))
        big_text(img, ["WOULD YOU", "SEND IT?"], 1210, 116, scale=max(0.05, p), colors=[(255, 255, 255), YEL])
        if t >= S(5) + 1.0:
            q = back(min(1, (t - S(5) - 1.0) / 0.25))
            ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
            for i, (lbl, col) in enumerate([("YES", (52, 199, 89)), ("NO", RED)]):
                f = F("Black", int(64 * q)); bw = 250 * q; bx = W / 2 - 280 + i * 310
                od.rounded_rectangle((bx, 1480, bx + bw, 1480 + 110 * q), 55 * q, fill=col)
                w = od.textlength(lbl, font=f); od.text((bx + bw / 2 - w / 2, 1480 + 20 * q), lbl, font=f, fill=(255, 255, 255))
            img.alpha_composite(ov)
    # captions sit above the composer
    cap_y = 1590 if kb_offset(t) >= 1 else (H - KB_H - 130) - 112
    if not (t >= S(5)):
        draw_caption(img, t, cap_y)
    # punch-in camera at the very start, after the cover frame
    z = 1 + 0.10 * (1 - P(t, 0.03, 0.45)) if t > 0.0 else 1.0
    out = img.convert("RGB")
    if z > 1.001:
        cw, ch = W / z, H / z
        cx, cy = W / 2, 760
        box = (cx - cw / 2, max(0, cy - ch / 2), cx + cw / 2, max(0, cy - ch / 2) + ch)
        out = out.crop(tuple(int(v) for v in box)).resize((W, H), Image.LANCZOS)
    return out, ct

# ---------- audio ----------
def build_audio(events):
    sr = 22050
    n = int(TOTAL * sr); mix = np.zeros(n, np.float32)
    def add(sig, at, gain=1.0):
        i = int(at * sr); j = min(n, i + len(sig)); mix[i:j] += sig[: j - i] * gain
    for s in segs:
        with wave.open(s["file"]) as w:
            a = np.frombuffer(w.readframes(w.getnframes()), np.int16).astype(np.float32) / 32768
        add(a / (np.abs(a).max() + 1e-6) * 0.85, s["start"])
    rng = np.random.default_rng(3)
    def tt(d): return np.arange(int(d * sr)) / sr
    def click():
        x = tt(0.03); s = rng.normal(0, 1, len(x)) * np.exp(-x * 260); s = np.diff(s, prepend=0); return s * 0.10
    def swoosh(up=True):
        x = tt(0.32); f = (500 + 1400 * x / 0.32) if up else (1600 - 1300 * x / 0.32)
        tone = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-x * 9) * 0.10
        nz = np.convolve(rng.normal(0, 1, len(x)), np.ones(12) / 12, "same") * np.sin(np.pi * x / 0.32) * 0.18
        return tone + nz
    def impact():
        x = tt(0.6); return (np.sin(2 * np.pi * 55 * x) * np.exp(-x * 7) * 0.55 +
                             rng.normal(0, 1, len(x)) * np.exp(-x * 30) * 0.12)
    def pop():
        x = tt(0.09); f = 900 - 500 * x / 0.09; return np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-x * 40) * 0.22
    def stamp():
        x = tt(0.25); return (np.sin(2 * np.pi * 90 * x) * np.exp(-x * 20) * 0.5 + rng.normal(0, 1, len(x)) * np.exp(-x * 45) * 0.2)
    def ding():
        x = tt(0.5); return (np.sin(2 * np.pi * 1320 * x) + 0.6 * np.sin(2 * np.pi * 1980 * x)) * np.exp(-x * 9) * 0.06
    lib = {"click": click, "send": lambda: swoosh(True), "unsend": lambda: swoosh(False),
           "impact": impact, "pop": pop, "stamp": stamp, "ding": ding}
    for name, at in events: add(lib[name](), at)
    mix = np.tanh(mix * 1.1) * 0.95
    with wave.open("mix.wav", "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr)
        w.writeframes((mix * 32767).astype(np.int16).tobytes())

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        ts = [0.0, 0.25, S(1) + 1.6, T_STAMP + 0.3, T_UNSEND + 0.6, S(3) + 2.0, S(4) + 1.9, S(5) + 1.6]
        ims = []
        for x in ts:
            im, _ = frame(x); im.save(f"still_{x:.2f}.png"); ims.append(im.resize((270, 480)))
        c = Image.new("RGB", (270 * len(ims), 480)); [c.paste(im, (i * 270, 0)) for i, im in enumerate(ims)]
        c.save("contact.png"); frame(0.0)[0].save("cover.png"); sys.exit()
    n = int(TOTAL * FPS)
    events = [("impact", 0.0), ("send", T_BADSEND), ("stamp", T_STAMP), ("unsend", T_UNSEND),
              ("send", T_GOODSEND), ("ding", T_TYPING)]
    events += [("pop", st) for st in [S(4) + 0.05, S(4) + 0.6, S(4) + 1.55, S(5), S(5) + 1.0]]
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}",
                          "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
                          "-preset", "medium", "video.mp4"], stdin=subprocess.PIPE)
    prev = ""
    for i in range(n):
        tt_ = i / FPS
        im, ct = frame(tt_)
        if ct != prev: events.append(("click", tt_))
        prev = ct
        p.stdin.write(im.tobytes())
    p.stdin.close(); p.wait()
    build_audio(events)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video.mp4", "-i", "mix.wav", "-c:v", "copy",
                    "-c:a", "aac", "-b:a", "192k", "-ar", "44100", "-shortest", "-movflags", "+faststart", "out.mp4"], check=True)
    frame(0.0)[0].save("cover.png")
    print("done", n, "frames", round(TOTAL, 2), "s")
