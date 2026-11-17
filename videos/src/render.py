import json, math, subprocess, sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter

W, H, FPS = 1080, 1920, 30
TL = json.load(open("timeline.json"))
SEG = TL["segs"]; TOTAL = TL["total"]
F = "/usr/share/fonts/opentype/inter/"
def font(w, s): return ImageFont.truetype(F + f"Inter-{w}.otf", s)
fBold = lambda s: font("Bold", s)
fSemi = lambda s: font("SemiBold", s)
fReg = lambda s: font("Regular", s)
fXB = lambda s: font("ExtraBold", s)

BG1, BG2 = (14, 16, 30), (34, 22, 58)
IN_BUB = (44, 46, 62); OUT_BUB = (52, 120, 246); BAD = (120, 52, 60)
WHITE = (245, 245, 250); MUTED = (150, 152, 172); ACCENT = (255, 205, 90)

def ease(x): x = max(0, min(1, x)); return 1 - (1 - x) ** 3
def prog(t, a, b): return ease((t - a) / (b - a)) if b > a else float(t >= a)
def S(i): return SEG[i]["start"]
def E(i): return SEG[i]["end"]

# background gradient (static)
bg = Image.new("RGB", (W, H))
bd = ImageDraw.Draw(bg)
for y in range(H):
    k = y / H
    bd.line([(0, y), (W, y)], fill=tuple(int(BG1[c] + (BG2[c] - BG1[c]) * k) for c in range(3)))
glow = Image.new("L", (W, H), 0); ImageDraw.Draw(glow).ellipse((-200, 300, 900, 1300), fill=70)
glow = glow.filter(ImageFilter.GaussianBlur(160))
bg = Image.composite(Image.new("RGB", (W, H), (90, 60, 180)), bg, glow)

def wrap(d, text, f, maxw):
    words, lines, cur = text.split(), [], ""
    for w in words:
        tst = (cur + " " + w).strip()
        if d.textlength(tst, font=f) <= maxw: cur = tst
        else: lines.append(cur); cur = w
    if cur: lines.append(cur)
    return lines

def bubble(img, text, side, y, color, alpha=1.0, scale=1.0, highlight=None, strike=0.0):
    """Draw a chat bubble; returns bottom y."""
    if alpha <= 0: return y
    f = fSemi(46); pad = 34; maxw = 680
    tmp = ImageDraw.Draw(img)
    lines = wrap(tmp, text, f, maxw - 2 * pad)
    lh = 62
    tw = max(tmp.textlength(l, font=f) for l in lines)
    bw, bh = int(tw + 2 * pad), int(len(lines) * lh + 2 * pad - 8)
    layer = Image.new("RGBA", (bw + 40, bh + 40), (0, 0, 0, 0))
    ld = ImageDraw.Draw(layer)
    ld.rounded_rectangle((20, 20, 20 + bw, 20 + bh), 44, fill=color + (255,))
    ty = 20 + pad - 6
    hl_left = list(highlight[0].split()) if highlight else []
    for l in lines:
        x = 20 + pad
        if highlight and highlight[1] > 0:
            for wd in l.split():
                ww = ld.textlength(wd, font=f)
                on = bool(hl_left) and wd == hl_left[0]
                if on: hl_left.pop(0)
                if on:
                    ld.rounded_rectangle((x - 6, ty + 2, x + 6 + ww * highlight[1], ty + 58), 12, fill=ACCENT + (255,))
                ld.text((x, ty), wd, font=f, fill=(30, 30, 40) if on and highlight[1] > 0.5 else WHITE)
                x += ld.textlength(wd + " ", font=f)
            x = 20 + pad
        else:
            ld.text((x, ty), l, font=f, fill=WHITE)
        if strike > 0:
            lw = ld.textlength(l, font=f)
            ld.line((x - 6, ty + 32, x - 6 + (lw + 12) * strike, ty + 32), fill=(255, 90, 90), width=7)
        ty += lh
    if scale != 1.0:
        layer = layer.resize((max(1, int(layer.width * scale)), max(1, int(layer.height * scale))), Image.LANCZOS)
    if alpha < 1:
        a = layer.getchannel("A").point(lambda v: int(v * alpha)); layer.putalpha(a)
    x = 60 if side == "L" else W - 60 - layer.width + 20
    img.paste(layer, (x - 20, int(y) - 20), layer)
    return y + bh

def center_text(d, text, y, f, fill):
    w = d.textlength(text, font=f); d.text(((W - w) / 2, y), text, font=f, fill=fill)

def caption(img, t):
    # sentence caption with word-by-word karaoke highlight
    for s in SEG:
        if s["start"] - 0.05 <= t <= s["end"] + 0.3:
            d = ImageDraw.Draw(img)
            f = fXB(54)
            words = s["text"].split()
            k = (t - s["start"]) / (s["end"] - s["start"])
            lens = [len(w) for w in words]; tot = sum(lens)
            lines = wrap(d, s["text"], f, 920)
            y = 1560 - (len(lines) - 1) * 36
            box_h = len(lines) * 74 + 40
            ov = Image.new("RGBA", (W, H), (0, 0, 0, 0))
            ImageDraw.Draw(ov).rounded_rectangle((60, y - 22, W - 60, y - 22 + box_h), 30, fill=(0, 0, 0, 150))
            img.alpha_composite(ov)
            d = ImageDraw.Draw(img)
            idx = 0; acc = 0
            for l in lines:
                lw_ = l.split(); x = (W - d.textlength(l, font=f)) / 2
                for w in lw_:
                    spoken = (acc / tot) <= k
                    d.text((x, y), w, font=f, fill=ACCENT if spoken else WHITE,
                           stroke_width=3, stroke_fill=(0, 0, 0))
                    x += d.textlength(w + " ", font=f); acc += lens[idx]; idx += 1
                y += 74
            return

def typed(text, t, a, b):
    n = int(len(text) * prog(t, a, b) ** 0.6 + 0.0001) if t >= a else 0
    return text[:n]

INCOMING = "I had a really good time tonight :)"
BADDRAFT = "omg same!! i mean yeah haha..."
GOOD = "Me too. I'd love to see you again. Are you free next week?"
FAKE_DRAFTS = ["haha same", "omg yes!!", "I mean... yeah", "lol ok", "me tooo", "same!!! :))"]

def frame(t):
    img = bg.copy().convert("RGBA")
    d = ImageDraw.Draw(img)
    # header: fake chat app bar
    d.rounded_rectangle((40, 70, W - 40, 230), 40, fill=(255, 255, 255, 18) if False else (30, 32, 50))
    d.ellipse((80, 100, 180, 200), fill=(120, 90, 200))
    center = fBold(44); d.text((112, 120), "A", font=fBold(52), fill=WHITE)
    d.text((210, 108), "Alex", font=fBold(46), fill=WHITE)
    d.text((210, 162), "fictional chat", font=fReg(30), fill=MUTED)
    d.text((W - 300, 130), "ReplyRight", font=fSemi(36), fill=ACCENT)

    # HOOK title (0 - ~3s), large, then shrinks away
    hook_a = 1 - prog(t, 2.9, 3.4)
    if hook_a > 0:
        p = prog(t, 0.0, 0.45)
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        f1 = fXB(104)
        y0 = 360 + (1 - p) * 60
        for i, line in enumerate(["One text.", "Fifteen deleted", "replies."]):
            w = od.textlength(line, font=f1)
            col = ACCENT if i == 1 else WHITE
            od.text(((W - w) / 2, y0 + i * 124), line, font=f1, fill=col + (int(255 * p * hook_a),))
        img.alpha_composite(ov)
        # deleted counter ticking 0 -> 15
        n = min(15, int(15 * prog(t, 0.3, 2.6)))
        d = ImageDraw.Draw(img)
        if hook_a > 0.5:
            txt = f"Deleted drafts: {n}"
            f2 = fBold(48); w = d.textlength(txt, font=f2)
            d.rounded_rectangle(((W - w) / 2 - 30, 790, (W + w) / 2 + 30, 870), 40, fill=(200, 60, 70))
            d.text(((W - w) / 2, 802), txt, font=f2, fill=WHITE)

    # chat area
    y = 300
    in_p = prog(t, S(1) - 0.1, S(1) + 0.35)
    if in_p > 0:
        y = bubble(img, INCOMING, "L", 300 + (1 - in_p) * 40, IN_BUB, alpha=in_p, scale=0.9 + 0.1 * in_p) + 40
    sent_p = prog(t, E(3) - 0.2, E(3) + 0.3)
    if sent_p > 0:
        hl = prog(t, S(4), S(4) + 0.8)
        bubble(img, GOOD, "R", y + (1 - sent_p) * 300, OUT_BUB, alpha=sent_p, highlight=("see you again.", hl))

    # composer input box
    d = ImageDraw.Draw(img)
    by = 1250
    d.rounded_rectangle((50, by, W - 50, by + 150), 75, fill=(36, 38, 56), outline=(70, 72, 96), width=3)
    d.ellipse((W - 170, by + 25, W - 70, by + 125), fill=OUT_BUB)
    d.polygon([(W - 138, by + 50), (W - 138, by + 100), (W - 92, by + 75)], fill=WHITE)
    fi = fSemi(42)
    cur_text, col = "", WHITE
    if t < S(1):
        # flashing fake drafts typed & deleted
        k = prog(t, 0.3, 2.6) * len(FAKE_DRAFTS)
        i = min(int(k), len(FAKE_DRAFTS) - 1); fr = k - int(k)
        s_ = FAKE_DRAFTS[i]
        m = int(len(s_) * (fr * 2 if fr < 0.5 else (1 - fr) * 2))
        cur_text = s_[:m]
    elif t < S(3):
        cur_text = typed(BADDRAFT, t, S(1) + 0.6, S(2) - 0.2)
        if t > S(2) + 1.2:  # delete it
            dp = prog(t, S(2) + 1.2, S(3) - 0.05)
            cur_text = BADDRAFT[:int(len(BADDRAFT) * (1 - dp))]
        col = (255, 170, 170)
    elif t < E(3) - 0.2:
        cur_text = typed(GOOD, t, S(3) + 0.1, E(3) - 0.5)
    # show tail of text that fits
    shown = cur_text
    while d.textlength(shown, font=fi) > W - 300 and len(shown) > 1: shown = shown[1:]
    if not cur_text:
        d.text((110, by + 50), "Message...", font=fi, fill=MUTED)
    d.text((110, by + 50), shown, font=fi, fill=col)
    if int(t * 2.5) % 2 == 0:
        cx = 110 + (d.textlength(shown, font=fi) if cur_text else 0) + 4
        d.rectangle((cx, by + 45, cx + 5, by + 105), fill=ACCENT)

    # "three-paragraph" label on the bad draft
    lab = prog(t, S(2), S(2) + 0.3) * (1 - prog(t, S(3) - 0.2, S(3)))
    if lab > 0:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        txt = "Overthinking it"
        f3 = fBold(44); w = od.textlength(txt, font=f3)
        od.rounded_rectangle((60, by - 100, 60 + w + 60, by - 20), 40, fill=(200, 60, 70, int(255 * lab)))
        od.text((90, by - 88), txt, font=f3, fill=(255, 255, 255, int(255 * lab)))
        img.alpha_composite(ov)

    # Simple / Warm / Moves forward chips
    chips = [("Simple", S(4)), ("Warm", S(4) + 0.55), ("Moves it forward", S(4) + 1.2)]
    end_fade = 1 - prog(t, S(5) - 0.1, S(5) + 0.2)
    cx = 0; d = ImageDraw.Draw(img)
    fc = fBold(46)
    widths = [d.textlength(c[0], font=fc) + 70 for c in chips]
    x0 = (W - (sum(widths) + 30 * 2)) / 2
    for (c, st), w in zip(chips, widths):
        p = prog(t, st, st + 0.3) * end_fade
        if p > 0:
            ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
            yy = 1100 + (1 - p) * 30
            od.rounded_rectangle((x0, yy, x0 + w, yy + 90), 45, fill=ACCENT + (int(255 * p),))
            od.text((x0 + 35, yy + 18), "✓ " [0:0] + c, font=fc, fill=(30, 30, 40, int(255 * p)))
            img.alpha_composite(ov)
        x0 += w + 30

    # End card: Would you send this?
    ep = prog(t, S(5) - 0.1, S(5) + 0.35)
    if ep > 0:
        ov = Image.new("RGBA", (W, H), (0, 0, 0, 0)); od = ImageDraw.Draw(ov)
        f4 = fXB(80); txt = "Would you send this?"
        w = od.textlength(txt, font=f4)
        yy = 1050 + (1 - ep) * 40
        od.text(((W - w) / 2, yy), txt, font=f4, fill=WHITE + (int(255 * ep),), stroke_width=4, stroke_fill=(0, 0, 0, int(200 * ep)))
        for i, (lbl, colr) in enumerate([("YES", (60, 190, 110)), ("I'd change it", (90, 92, 120))]):
            f5 = fBold(46); lw = od.textlength(lbl, font=f5) + 80
            bx = W / 2 - 20 - lw if i == 0 else W / 2 + 20
            od.rounded_rectangle((bx, yy + 120, bx + lw, yy + 210), 45, fill=colr + (int(255 * ep),))
            od.text((bx + 40, yy + 138), lbl, font=f5, fill=(255, 255, 255, int(255 * ep)))
        img.alpha_composite(ov)

    caption(img, t)
    d = ImageDraw.Draw(img)
    center_text(d, "Fictional example. ReplyRight early concept.", H - 90, fReg(28), MUTED)
    return img.convert("RGB")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "stills":
        for t in [1.5, 4.5, 6.8, 10.5, 13.8, 16.6]:
            frame(t).save(f"still_{t}.png")
        sys.exit()
    n = int(TOTAL * FPS)
    p = subprocess.Popen(["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
                          "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-i", "vo.wav",
                          "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "20", "-preset", "medium",
                          "-c:a", "aac", "-b:a", "160k", "-shortest", "-movflags", "+faststart", "out.mp4"],
                         stdin=subprocess.PIPE)
    for i in range(n):
        p.stdin.write(frame(i / FPS).tobytes())
    p.stdin.close(); p.wait()
    print("done", n, "frames")
