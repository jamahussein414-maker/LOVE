# ReplyRight Reel 01: First Date Text

- File: replyright_reel_01.mp4 (1080x1920, 30 fps, H.264 + AAC 48 kHz, 39.2 s)
- Voice: Kokoro TTS v1.0, voice `am_michael` (US male), speed 0.9
- Music: original ambient pad generated in code (no third-party music)
- Subtitles: burned in; also replyright_reel_01.srt

## Instagram caption
That tiny pause before you hit send... we've all been there.

"I had a really good time tonight :)" shouldn't take 15 minutes to answer.

We're building ReplyRight: paste their message, pick your tone, and get a reply that still sounds like you.

Comment REPLY and we'll send you early access.

#textingtips #datingadvice #firstdate #overthinking #communication

## Cover text
Why is THIS text so hard to answer?

## Rebuild
pip install kokoro-onnx soundfile scipy pillow numpy
Download kokoro-v1.0.onnx + voices-v1.0.bin (github.com/thewh1teagle/kokoro-onnx releases)
python3 videos/src/reel01/tts.py <model_dir> am_michael 0.9
python3 videos/src/reel01/reel01.py
