# Secret AI keyboard reel: Remotion source (unbranded)

All UI is drawn on a 402 x 874 pt iPhone screen (measured from reference screenshots), scaled 2.16x into 1080x1920.

- src/lib.ts: geometry, easing, single interaction timeline
- src/components/ios.tsx: IOSStatusBar, DynamicIsland, MessagesHeader, Bubble, Timestamp, MessageComposer,
  KeyboardShell, StandardKeyboard, GlobeMicRow, MessageContextMenu, KeyboardSwitcher, Touch
- src/components/aikeyboard.tsx: AIKeyboard ("AI Writing" placeholder label, paste, tones, generate, suggested reply, Use Reply)
- src/components/scene.tsx: IPhoneScreen state machine, Device, Hook, Captions, FinalCTA, Reel

Rebuild: npm i; add Inter fonts to public/fonts; python3 tts.py <kokoro_dir> af_heart; python3 timeline.py;
node render.mjs video; python3 audio.py; mux out/video.mp4 + out/master.wav with ffmpeg.
