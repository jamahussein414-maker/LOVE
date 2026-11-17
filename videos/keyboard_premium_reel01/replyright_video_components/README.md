# ReplyRight premium keyboard reel: source

Remotion 4.0.544 project. Everything is drawn on a 402 x 874 pt iPhone screen (measured from reference
screenshots) and scaled 2.16x into a 1080x1920 frame.

- src/lib.ts: geometry, easing, and the single interaction timeline (anchored to narration starts)
- src/components/ios.tsx: IOSStatusBar, DynamicIsland, MessagesHeader, Bubble, Timestamp, MessageComposer,
  KeyboardShell, StandardKeyboard, GlobeMicRow, MessageContextMenu, KeyboardSwitcher, Touch
- src/components/replyright.tsx: ReplyRightKeyboard (paste, ToneSelector, generate state, SuggestedReply, Use Reply)
- src/components/scene.tsx: IPhoneScreen state machine, Device, Captions, FinalCTA, Reel

Rebuild:
  npm i
  copy Inter-*.otf / InterDisplay-*.otf (SIL OFL) into public/fonts
  python3 tts.py <kokoro_model_dir> am_michael 0.78   # narration (Kokoro v1.0)
  python3 timeline.py && node render.mjs video && python3 audio.py
  ffmpeg -i out/video.mp4 -i out/master.wav -c:v copy -c:a aac -b:a 256k -shortest -movflags +faststart replyright_keyboard_premium_reel_01.mp4
