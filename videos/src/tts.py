import wave, sys, json
from piper import PiperVoice
from piper.config import SynthesisConfig
v = PiperVoice.load(sys.argv[1])
lines = [
"One text. Fifteen deleted replies.",
"They said, I had a really good time tonight.",
"You don't need a three-paragraph response.",
"Try: Me too. I'd love to see you again. Are you free next week?",
"Simple. Warm. And it actually moves the conversation forward.",
"Would you send this?",
]
cfg = SynthesisConfig(length_scale=1.1)
out=[]
for i,t in enumerate(lines):
    fn=f"s{i}.wav"
    with wave.open(fn,"wb") as w:
        v.synthesize_wav(t,w,syn_config=cfg)
    with wave.open(fn) as w: d=w.getnframes()/w.getframerate()
    out.append({"text":t,"file":fn,"dur":round(d,3)})
json.dump(out,open("segs.json","w"),indent=1); print(json.dumps(out,indent=1))
