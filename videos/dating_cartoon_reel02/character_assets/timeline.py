import json, re
L = {l["id"]: l for l in json.load(open("lines.json"))}
starts = {"a1": 0.35, "b1": 3.75, "a2": 6.55, "b2": 12.05, "a3": 16.35}
END = 26.0
lines = []
for k, s in starts.items():
    l = L[k]; l["start"] = s; l["end"] = round(s + l["dur"], 3)
    # word timing ~ proportional to letters (plus a beat for "..." pauses)
    words = l["caption"].split(); w = [len(re.sub(r"[^\w']", "", x)) + 1.5 + (3 if "…" in x else 0) for x in words]
    tot = sum(w); acc = 0; wt = []
    for x, ww in zip(words, w): wt.append({"w": x, "t": round(s + 0.05 + (l["dur"] - 0.15) * acc / tot, 3)}); acc += ww
    l["words"] = wt; lines.append(l)
json.dump({"end": END, "lines": lines}, open("src/timeline.json", "w"))
for l in lines: print(l["id"], l["start"], l["end"])
