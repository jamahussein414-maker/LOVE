import json
vo = json.load(open("vo.json"))
starts = [0.25, 3.35, 6.3, 13.5, 15.6, 19.0, 24.1, 26.6, 28.9, 31.0, 33.5, 37.0, 38.8, 42.5, 47.3, 52.4, 54.5]
END = 58.0
for v, s in zip(vo, starts): v["start"] = s; v["end"] = round(s + v["dur"], 3)
for i in range(len(vo) - 1): assert vo[i]["end"] + 0.15 < vo[i + 1]["start"], i
for i, v in enumerate(vo):
    nxt = vo[i + 1]["start"] if i + 1 < len(vo) else END
    v["capIn"] = round(v["start"] - 0.08, 3); v["capOut"] = round(min(nxt - 0.12, v["end"] + 0.45), 3)
json.dump({"end": END, "vo": vo}, open("src/timeline.json", "w"), indent=1)
print("ok", END)
