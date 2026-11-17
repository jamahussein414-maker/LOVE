import json
vo = json.load(open("vo.json"))
starts = [0.45, 2.2, 7.75, 10.35, 15.55, 20.8, 22.65, 24.4, 28.45, 35.0, 39.75, 41.55]
END = 45.0
for v, s in zip(vo, starts):
    v["start"] = s; v["end"] = round(s + v["dur"], 3)
for i, v in enumerate(vo):
    if i + 1 < len(vo): assert v["end"] < vo[i + 1]["start"] - 0.1, (i, v["end"], vo[i + 1]["start"])
for i, v in enumerate(vo):
    nxt = vo[i + 1]["start"] if i + 1 < len(vo) else END
    v["capIn"] = round(v["start"] - 0.1, 3); v["capOut"] = round(min(nxt - 0.2, v["end"] + 0.55), 3)
json.dump({"end": END, "vo": vo}, open("src/timeline.json", "w"), indent=1)
for v in vo: print(v["start"], v["end"], v["caption"])
