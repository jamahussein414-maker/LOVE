import json
vo = json.load(open("vo.json"))
starts = [0.35, 4.0, 10.6, 14.4, 16.9, 19.3, 21.3, 22.6, 25.5, 26.9, 29.8, 33.4, 35.0, 38.6, 40.3]
END = 47.0
for v, s in zip(vo, starts): v["start"] = s; v["end"] = round(s + v["dur"], 3)
for i in range(len(vo) - 1): assert vo[i]["end"] + 0.15 < vo[i + 1]["start"], i
for i, v in enumerate(vo):
    nxt = vo[i + 1]["start"] if i + 1 < len(vo) else END
    v["capIn"] = round(v["start"] - 0.08, 3); v["capOut"] = round(min(nxt - 0.12, v["end"] + 0.45), 3)
json.dump({"end": END, "vo": vo}, open("src/timeline.json", "w"), indent=1); print("ok")
