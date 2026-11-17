"""ReplyRight Reel 01 v3 - iMessage chat + ReplyRight tone picker (Flirty / Warm / Professional).
Reuses drawing helpers from ../v02/render.py. Run inside a folder holding segs.json + s*.wav."""
import os, sys, math, random, subprocess
sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "v02"))
import render as B
from render import (W, H, FPS, F, S, E, segs, ease, back, P, wrap, HEADER, KB, KR, KB_H,
                    bubble_img, paste_alpha, big_text, typed, BLUE, GRAY_B, TXT, SUB, YEL, RED)
from PIL import Image, ImageDraw

TOTAL = B.TOTAL + 0.6
B.TOTAL = TOTAL
PURPLE, PINK = (124, 77, 255), (255, 64, 150)

INCOMING = "I had a really good time tonight :)"
TONES = [
    ("Flirty", (255, 45, 120), "Me too. Same time next week? This time, you pick the place."),
    ("Warm", (255, 149, 0), "Me too. I'd love to see you again. Are you free next week?"),
    ("Professional", (10, 132, 255), "Thank you for your time. Let's schedule a follow-up next week."),
]
CHOSEN = TONES[0][2]
DRAFTS = ["omg yes!!", "haha same", "me tooo :))", "I mean... yeah", "lol same", "ok so"]
REPLY = "Deal. Friday?"

# ---- key moments ----
T_OPEN = S(2) + 0.05                 # tap ReplyRight button
T_PANEL = T_OPEN + 0.15              # panel slides up
T_CARDS = [T_PANEL + 0.35, T_PANEL + 0.55, T_PANEL + 0.75]
# highlight each tone as it is spoken in seg 3
seg3 = segs[3]; L = seg3["end"] - seg3["start"]
T_SAY = [seg3["start"], seg3["start"] + L * 0.30, seg3["start"] + L * 0.62]
T_PICK = S(4) + 0.15                 # tap Flirty
T_INSERT = (T_PICK + 0.3, T_PICK + 0.9)
T_SENDTAP = E(4) + 0.05
T_SEND = T_SENDTAP + 0.12
T_TYPING = S(5) + 0.6
T_REPLY = S(5) + 2.2

def grad_circle(d_img, cx, cy, r):
    g = Image.new("RGBA", (2 * r, 2 * r)); gd = ImageDraw.Draw(g)
    for y in range(2 * r):
        k = y / (2 * r); gd.line((0, y, 2 * r, y), fill=tuple(int(PURPLE[i] + (PINK[i] - PURPLE[i]) * k) for i in range(3)))
    m = Image.new("L", (2 * r, 2 * r), 0); ImageDraw.Draw(m).ellipse((0, 0, 2 * r - 1, 2 * r - 1), fill=255)
    d_img.paste(g, (int(cx - r), int(cy - r)), m)
    d = ImageDraw.Draw(d_img); f = F("Black", int(r * 1.15)); w = d.textlength("R", font=f)
    d.text((cx - w / 2, cy - r * 0.72), "R", font=f, fill=(255, 255, 255))

CARD_Y = [104, 280, 456]; CARD_H = 160
def panel(t):
    im = Image.new("RGBA", (W, KB_H), (242, 242, 247, 255)); d = ImageDraw.Draw(im)
    d.line((0, 0, W, 0), fill=(205, 205, 210), width=2)
    grad_circle(im, 62, 52, 30)
    d.text((106, 30), "ReplyRight", font=F("Bold", 38), fill=TXT)
    lbl = "Pick a vibe"; f = F("SemiBold", 30); d.text((W - 40 - d.textlength(lbl, font=f), 38), lbl, font=f, fill=SUB)
    picked = t >= T_PICK
    for i, (name, col, text) in enumerate(TONES):
        ap = P(t, T_CARDS[i], T_CARDS[i] + 0.25)
        if ap <= 0: continue
        hl = P(t, T_SAY[i], T_SAY[i] + 0.15) * (1 - P(t, T_SAY[i] + 0.55, T_SAY[i] + 0.8)) if i or not picked else 0
        sel = P(t, T_PICK, T_PICK + 0.2) if i == 0 else 0
        dim = 0.4 if picked and i != 0 else 1.0
        card = Image.new("RGBA", (W - 60, CARD_H), (0, 0, 0, 0)); cd = ImageDraw.Draw(card)
        h = max(hl, sel)
        cd.rounded_rectangle((0, 0, W - 61, CARD_H - 1), 30, fill=(255, 255, 255),
                             outline=col if h > 0.05 else (226, 226, 232), width=6 if h > 0.05 else 2)
        pf = F("Bold", 30); pw = cd.textlength(name, font=pf)
        tint = tuple(int(255 - (255 - c) * 0.16) for c in col)
        cd.rounded_rectangle((24, 18, 24 + pw + 40, 62), 22, fill=tint)
        cd.ellipse((36, 34, 48, 46), fill=col)
        cd.text((56, 21), name, font=pf, fill=col)
        tf = F("Regular", 34); yy = 74
        for ln in wrap(cd, text, tf, W - 140):
            cd.text((26, yy), ln, font=tf, fill=TXT); yy += 42
        if sel > 0:
            cd.ellipse((W - 128, 16, W - 80, 64), fill=col)
            cd.line([(W - 116, 40), (W - 106, 51), (W - 91, 30)], fill=(255, 255, 255), width=6)
        sc = (0.92 + 0.08 * back(ap)) * (1 + 0.025 * h)
        al = ap * dim
        paste_alpha(im, card, (30 - (sc - 1) * (W - 60) / 2, CARD_Y[i] + (1 - ap) * 40), alpha=al, scale=sc)
    return im

def tap(img, t, t0, x, y):
    if not (t0 <= t < t0 + 0.45): return
    k = (t - t0) / 0.45
    ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov); r = 34 + 36 * k
    od.ellipse((x - r, y - r, x + r, y + r), fill=(255, 255, 255, int(150 * (1 - k))), outline=(60, 60, 70, int(200 * (1 - k))), width=5)
    od.ellipse((x - 26, y - 26, x + 26, y + 26), fill=(40, 40, 50, int(110 * (1 - k))))
    img.alpha_composite(ov)

def composer_text(t):
    if t < S(2):
        a, b = 0.15, S(2) - 0.15
        k = (t - a) / (b - a) * len(DRAFTS)
        if k < 0: return DRAFTS[0][:5]
        i = min(int(k), len(DRAFTS) - 1); fr = k - int(k); s = DRAFTS[i]
        return s[:int(round(len(s) * (min(1, fr / 0.6) if fr < 0.6 else 1 - (fr - 0.6) / 0.4)))]
    if t < T_INSERT[0]: return ""
    if t < T_SEND: return typed(CHOSEN, t, *T_INSERT)
    return ""

def bottom_state(t):
    """returns (kb_down 0..1, panel_up 0..1)"""
    return P(t, T_SEND, T_SEND + 0.35), P(t, T_PANEL, T_PANEL + 0.3)

def draw_caption(base, t, y):
    for gi, g in enumerate(B.CAPS):
        st = g[0]["t"]; seg = segs[g[0]["seg"]]
        nxt = B.CAPS[gi + 1] if gi + 1 < len(B.CAPS) else None
        en = nxt[0]["t"] if nxt and nxt[0]["seg"] == g[0]["seg"] else seg["end"] + 0.15
        if st <= t < en:
            if g[0]["seg"] in (0, 5): return
            d = ImageDraw.Draw(base); txt = " ".join(w["w"] for w in g).upper()
            pop = back(min(1, (t - st) / 0.16))
            f = F("ExtraBold", max(10, int(70 * (0.85 + 0.15 * pop))))
            x = (W - d.textlength(txt, font=f)) / 2
            for w in g:
                s = w["w"].upper()
                d.text((x, y), s, font=f, fill=YEL if w["t"] <= t else (255, 255, 255), stroke_width=7, stroke_fill=(0, 0, 0))
                x += d.textlength(s + " ", font=f)
            return

def frame(t):
    img = Image.new("RGBA", (W, H), (255, 255, 255, 255)); d = ImageDraw.Draw(img)
    for txt, f, y in [("iMessage", F("SemiBold", 28), 368), ("Today 11:48 PM", F("Regular", 28), 404)]:
        d.text(((W - d.textlength(txt, font=f)) / 2, y), txt, font=f, fill=SUB)
    y = 470
    mark = P(t, S(1) + 0.9, S(1) + 1.5) * (1 - P(t, S(2), S(2) + 0.3))
    inc, ih = bubble_img(INCOMING, False, marks=("really", "good", "time"), mark_p=mark)
    paste_alpha(img, inc, (28, y)); y += ih + 34
    if t >= T_SEND:
        p = P(t, T_SEND, T_SEND + 0.28)
        g, gh = bubble_img(CHOSEN, True)
        paste_alpha(img, g, (W - 28, y + (1 - p) * 500), alpha=min(1, p * 1.5), anchor="tr")
        y += gh + 12
        if t >= T_SEND + 0.5:
            lbl = "Read 11:49 PM" if t >= T_TYPING else "Delivered"; f = F("SemiBold", 28)
            d.text((W - 50 - d.textlength(lbl, font=f), y), lbl, font=f, fill=SUB)
        y += 60
    if T_TYPING <= t < T_REPLY:
        p = back(min(1, (t - T_TYPING) / 0.25))
        tb = Image.new("RGBA", (230, 120), (0, 0, 0, 0)); td = ImageDraw.Draw(tb)
        td.rounded_rectangle((20, 0, 200, 96), 48, fill=GRAY_B)
        td.ellipse((6, 76, 34, 104), fill=GRAY_B); td.ellipse((-4, 100, 12, 116), fill=GRAY_B)
        for i in range(3):
            b = 0.45 + 0.55 * max(0, math.sin(((t * 3.2 - i * 0.22) % 1.0) * math.pi)); c = int(170 - 70 * b)
            td.ellipse((58 + i * 44 - 13, 35 - 6 * b, 58 + i * 44 + 13, 61 - 6 * b), fill=(c, c, c + 3))
        paste_alpha(img, tb, (28, y + 10), scale=max(0.01, p))
    if t >= T_REPLY:
        p = P(t, T_REPLY, T_REPLY + 0.25)
        r, _ = bubble_img(REPLY, False)
        paste_alpha(img, r, (28, y + 10 + (1 - p) * 40), alpha=p)

    # ---- composer / keyboard / ReplyRight panel ----
    down, up = bottom_state(t)
    base_top = H - KB_H
    kb_y = int(base_top + down * KB_H)
    comp_y = int((base_top - 130) * (1 - down) + (H - 170) * down)
    d = ImageDraw.Draw(img)
    d.rectangle((0, comp_y - 10, W, H), fill=(255, 255, 255))
    grad_circle(img, 70, comp_y + 54, 40)       # ReplyRight button replaces "+"
    d = ImageDraw.Draw(img)
    d.rounded_rectangle((130, comp_y + 6, W - 30, comp_y + 102), 48, outline=(200, 200, 204), width=3, fill=(255, 255, 255))
    ct = composer_text(t); fc = F("Regular", 46)
    if ct:
        shown = ct
        while d.textlength(shown, font=fc) > W - 330 and len(shown) > 1: shown = shown[1:]
        d.text((170, comp_y + 26), shown, font=fc, fill=TXT); cx = 170 + d.textlength(shown, font=fc) + 3
        d.ellipse((W - 112, comp_y + 16, W - 40, comp_y + 88), fill=BLUE)
        d.line((W - 76, comp_y + 72, W - 76, comp_y + 34), fill=(255, 255, 255), width=8)
        d.line([(W - 96, comp_y + 52), (W - 76, comp_y + 32), (W - 56, comp_y + 52)], fill=(255, 255, 255), width=8)
    else:
        d.text((170, comp_y + 26), "iMessage", font=fc, fill=(190, 190, 194)); cx = 168
    if down < 1 and int(t * 2.2) % 2 == 0:
        d.rounded_rectangle((cx, comp_y + 22, cx + 5, comp_y + 86), 2, fill=BLUE)
    if down < 1:
        img.alpha_composite(KB, (0, kb_y))
        prev = composer_text(t - 1 / FPS)
        if t < S(2) and len(ct) > len(prev) and ct[-1].lower() in KR and ct[-1] != " ":
            a, b, c, e = KR[ct[-1].lower()]
            d.rounded_rectangle((a - 14, kb_y + b - 130, c + 14, kb_y + e), 18, fill=(255, 255, 255), outline=(180, 180, 186), width=2)
            fk = F("Regular", 70); d.text(((a + c) / 2 - d.textlength(ct[-1].lower(), font=fk) / 2, kb_y + b - 112), ct[-1].lower(), font=fk, fill=TXT)
        if up > 0:
            img.alpha_composite(panel(t), (0, int(kb_y + (1 - up) * KB_H)))
    img.alpha_composite(HEADER, (0, 0))

    # taps
    tap(img, t, T_OPEN, 70, base_top - 130 + 54)
    tap(img, t, T_PICK, W / 2 + 200, base_top + CARD_Y[0] + 90)
    tap(img, t, T_SENDTAP, W - 76, base_top - 130 + 52)

    # ---- overlays ----
    ha = 1 - P(t, E(0) + 0.15, E(0) + 0.35)
    if ha > 0:
        big_text(img, ["DON'T REPLY", "TO THIS TEXT", "YET"], 660, 120, alpha=ha, colors=[YEL, (255, 255, 255), (255, 255, 255)])
        ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
        txt = "15 replies deleted"; f = F("Black", 50); w = od.textlength(txt, font=f)
        od.rounded_rectangle(((W - w) / 2 - 40, 1050, (W + w) / 2 + 40, 1140), 45, fill=RED + (int(255 * ha),))
        od.text(((W - w) / 2, 1062), txt, font=f, fill=(255, 255, 255, int(255 * ha)))
        img.alpha_composite(ov)
    if t >= S(5):
        p = back(min(1, (t - S(5)) / 0.25))
        big_text(img, ["YOUR WORDS,", "JUST BETTER."], 1230, 104, scale=max(0.05, p), colors=[(255, 255, 255), YEL])
        if t >= S(5) + 1.35:
            q = back(min(1, (t - S(5) - 1.35) / 0.25))
            ov = Image.new("RGBA", (W, H)); od = ImageDraw.Draw(ov)
            txt = 'Comment "WORDS" for early access'; f = F("Black", max(8, int(46 * q))); w = od.textlength(txt, font=f)
            od.rounded_rectangle(((W - w) / 2 - 36, 1490, (W + w) / 2 + 36, 1490 + 96 * q), 48 * q, fill=PURPLE)
            od.text(((W - w) / 2, 1490 + 20 * q), txt, font=f, fill=(255, 255, 255))
            img.alpha_composite(ov)
    if t < S(5):
        down, _ = bottom_state(t)
        draw_caption(img, t, 1590 if down >= 1 else (H - KB_H - 130) - 112)
    z = 1 + 0.10 * (1 - P(t, 0.03, 0.45)) if t > 0 else 1.0
    out = img.convert("RGB")
    if z > 1.001:
        cw, ch = W / z, H / z; cy = 760
        out = out.crop((int(W / 2 - cw / 2), int(cy - ch / 2), int(W / 2 + cw / 2), int(cy + ch / 2))).resize((W, H), Image.LANCZOS)
    return out, ct

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        ts = [0.0, S(1) + 1.8, T_PANEL + 0.9, T_SAY[1] + 0.3, T_PICK + 0.25, T_INSERT[1] + 0.8, T_SEND + 0.9, S(5) + 1.5, TOTAL - 0.3]
        ims = []
        for x in ts:
            im, _ = frame(x); ims.append(im.resize((240, 426)))
        c = Image.new("RGB", (240 * len(ims), 426)); [c.paste(im, (i * 240, 0)) for i, im in enumerate(ims)]
        c.save("contact.png"); frame(0.0)[0].save("cover.png"); sys.exit()
    n = int(TOTAL * FPS)
    events = [("impact", 0.0), ("pop", T_OPEN), ("pop", T_PICK), ("pop", T_SENDTAP), ("send", T_SEND), ("ding", T_REPLY)]
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
    events.append(("send", T_INSERT[0] - 0.05))
    B.build_audio(events)
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", "video.mp4", "-i", "mix.wav", "-c:v", "copy", "-c:a", "aac",
                    "-b:a", "192k", "-ar", "44100", "-shortest", "-movflags", "+faststart", "out.mp4"], check=True)
    frame(0.0)[0].save("cover.png")
    print("done", n, "frames", round(TOTAL, 2), "s")
