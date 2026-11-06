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
│       ├── assets/         # Typed curve datasets and JSON models
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

## Production Commands

### 1. Mathematical Data Generation (Python)
```bash
studio/python-tools/.venv/bin/python studio/python-tools/math/compounding_curve.py
```

### 2. Voiceover Generation (Edge TTS)
```bash
edge-tts --voice en-US-ChristopherNeural --text "<narration>" --write-media studio/audio/narration.mp3
```

### 3. Remotion Studio (Interactive Preview)
```bash
cd studio/animation-engine && npm run preview
```

### 4. Headless Video Render (Remotion CLI)
```bash
cd studio/animation-engine
./node_modules/.bin/remotion render src/index.ts CompoundingProof ../renders/compounding_proof.mp4
```

### 5. Quality Inspection (FFprobe & Contact Sheet)
```bash
ffprobe -v error -show_format -show_streams -of json studio/renders/compounding_proof.mp4
ffmpeg -y -i studio/renders/compounding_proof.mp4 -vf "select='eq(n\,15)+eq(n\,60)+eq(n\,120)+eq(n\,165)+eq(n\,220)+eq(n\,260)'" -vsync vfr studio/qc/frames/proof_frame_%03d.png
ffmpeg -y -i studio/qc/frames/proof_frame_%03d.png -vf "scale=360:640,tile=3x2:margin=10:padding=10:color=black" studio/qc/contact_sheet.png
```
