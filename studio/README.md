# ANYMYN Autonomous Video Studio

Welcome to the **ANYMYN** autonomous production environment for short-form financial education mini-documentaries.

## Studio Architecture

```text
studio/
├── animation-engine/       # Isolated Node.js environment powered by Remotion
│   ├── package.json        # Exactly pinned Remotion 4.0.541 & React 19.3.1
│   ├── package-lock.json   # Deterministic reproducible lockfile
│   ├── remotion.config.ts  # Remotion CLI configuration
│   ├── tsconfig.json       # TypeScript configuration
│   ├── public/audio/       # Synchronized voiceover and audio stems
│   └── src/
│       ├── Root.tsx        # Composition definitions
│       ├── index.ts        # Remotion bundle registration
│       └── compositions/   # Scene animation components
├── python-tools/           # Isolated Python virtual environment (.venv)
│   ├── math/               # Financial modeling and SVG coordinate generators
│   └── requirements.txt
├── assets/                 # Shared data models and brand vectors
├── audio/                  # Raw and normalized neural voiceover tracks
├── config/                 # Render profiles and resolution standards
├── qc/                     # Quality inspection contact sheets and sampled frames
└── renders/                # Final broadcast-ready MP4 deliverables
```

---

## Production Pipeline V6: ElevenLabs Voiceover-First Workflow

All production follows the linear voiceover-first pipeline:
```text
RESEARCH ➔ SCRIPT ➔ STORYBOARD ➔ ELEVENLABS HANDOFF ➔ [HUMAN GENERATES VOICE] ➔ [HUMAN RETURNS AUDIO] ➔ AUDIO VERIFICATION ➔ SCENE TIMING ADJUSTMENT ➔ ANIMATION ➔ EDITING ➔ AUDIO MIXING ➔ FINAL RENDER ➔ QUALITY CONTROL ➔ DELIVERY
```

### 1. Mathematical Data Generation (Python)
```bash
python3 videos/<video-slug>/research/verify_calculations.py
```

### 2. ElevenLabs Voiceover Handoff (Mandatory Human Approval Gate)
- Agent prepares `videos/<video-slug>/voiceover/elevenlabs_script.txt` (clean spoken text, numbers spelled out).
- Agent presents handoff package in chat and **stops production**.
- User generates voiceover in ElevenLabs and exports voice-only track (`voiceover_elevenlabs.wav` or `.mp3`).
- Audio is returned to `videos/<video-slug>/audio/voiceover_elevenlabs_original.<ext>`.

### 3. Scene Timing Synchronization (Audio = Source of Truth)
- Scene frame durations are calculated directly from sentence boundaries and natural pauses in the real ElevenLabs recording.

### 4. Remotion Studio (Interactive Preview)
```bash
cd studio/animation-engine && npm run preview
```

### 5. Headless Video Render (Remotion CLI)
```bash
cd studio/animation-engine
npx remotion render <CompositionId> ../../videos/<video-slug>/renders/<video-slug>_master.mp4
```

### 6. Quality Inspection (FFprobe & Contact Sheet)
```bash
# Stream metadata inspection
ffprobe -v error -show_format -show_streams -of json videos/<video-slug>/renders/<video-slug>_master.mp4

# EBU R128 loudness check (-16.5 LUFS target)
ffmpeg -i videos/<video-slug>/renders/<video-slug>_master.mp4 -filter:a ebur128 -f null -
```
