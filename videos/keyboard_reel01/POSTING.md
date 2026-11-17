# ReplyRight Keyboard Reel 01: "They asked you out"

- File: replyright_keyboard_reel_01.mp4 (1080x1920, 60 fps, H.264 + AAC 48 kHz stereo, 45.0 s)
- Built with Remotion 4.0.544 (React components) and FFmpeg; audio mixed in Python
- Voice: Kokoro TTS v1.0 (Apache-2.0), voice `am_michael` (US English male), speed 0.84
- Music: original ambient pad generated in code (no third-party music)
- Emoji: Noto Color Emoji images (Apache-2.0) via emoji-datasource-google (MIT)
- Loudness: -14 LUFS integrated
- Subtitles: burned in; also replyright_keyboard_reel_01.srt

## Instagram caption
They asked you out. You've typed and deleted three replies. 😅

ReplyRight is a keyboard we're building for exactly this moment: copy their message, pick a vibe (flirty, warm, funny, confident) and drop a reply that still sounds like you, right inside the app you're already using.

No switching to another app. No explaining the whole conversation.

Comment REPLY for early access 👇

Concept preview. The app is in development.

#datingtips #textingtips #hinge #iphone #ai

## Thumbnail text
Main: "They asked you out… now what?"
Alternative: "The keyboard that knows what to say"

## Rebuild
cd videos/src/keyboard_reel01
npm i
python3 tts.py <kokoro_model_dir> am_michael 0.84   # voice lines -> public/vo
python3 timeline.py                                 # src/timeline.json
node render.mjs video                               # out/video.mp4 (60 fps)
python3 audio.py                                    # out/master.wav + .srt
ffmpeg -i out/video.mp4 -i out/master.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart replyright_keyboard_reel_01.mp4
