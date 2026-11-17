import wave, sys, json
from piper import PiperVoice
from piper.config import SynthesisConfig
v = PiperVoice.load(sys.argv[1])
lines = [
"Don't reply to this text yet.",
"They said, I had a really good time tonight. And you've already deleted fifteen replies.",
"Here's the mistake. Omg same, haha. It sounds nervous, and it goes nowhere.",
"Send this instead. Me too. I'd love to see you again. Are you free next week?",
"Simple. Warm. And it actually makes a plan.",
"Would you send it? Yes or no, in the comments.",
]
gaps=[0.25,0.35,0.3,0.4,0.3,0.0]
out=[]
for i,t in enumerate(lines):
    fn=f"s{i}.wav"
    ls = 0.92 if i==0 else 1.0
    with wave.open(fn,"wb") as w:
        v.synthesize_wav(t,w,syn_config=SynthesisConfig(length_scale=ls))
    with wave.open(fn) as w: d=w.getnframes()/w.getframerate()
    out.append({"text":t,"file":fn,"dur":round(d,3),"gap":gaps[i]})
json.dump(out,open("segs.json","w"),indent=1)
for o in out: print(o["dur"], o["text"])
