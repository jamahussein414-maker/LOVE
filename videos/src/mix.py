import json, wave, numpy as np
segs=json.load(open("segs.json"))
gaps=[0.35,0.5,0.45,0.6,0.55,0.4]   # pause after each sentence
lead=0.25
sr=None; parts=[]; t=lead; timeline=[]
for s,g in zip(segs,gaps):
    with wave.open(s["file"]) as w:
        sr=w.getframerate(); a=np.frombuffer(w.readframes(w.getnframes()),dtype=np.int16)
    timeline.append({"text":s["text"],"start":round(t,3),"end":round(t+s["dur"],3)})
    parts.append(a); parts.append(np.zeros(int(g*sr),np.int16)); t+=s["dur"]+g
audio=np.concatenate([np.zeros(int(lead*sr),np.int16)]+parts+[np.zeros(int(0.8*sr),np.int16)])
with wave.open("vo.wav","wb") as w:
    w.setnchannels(1); w.setsampwidth(2); w.setframerate(sr); w.writeframes(audio.tobytes())
total=len(audio)/sr
json.dump({"segs":timeline,"total":total},open("timeline.json","w"),indent=1)
print(json.dumps(timeline,indent=1), total)
