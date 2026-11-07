# ANYMYN — "The Invisible Cost: Inflation Simplified" (V2)

An autonomous AI financial video production explaining inflation through the core creative principle:
**ONE SHOT. ONE IDEA. ONE CLEAR VISUAL FOCUS.**

---

## 1. Quick Reproduction Runbook

### Financial Calculation & Verification:
```bash
python3 videos/the-invisible-cost-v2/research/verify_calculations.py
```

### Audio Synthesis & Mastering:
```bash
python3 videos/the-invisible-cost-v2/audio/generate_audio.py
```

### Typecheck & Remotion Render:
```bash
cd studio/animation-engine
npx tsc --noEmit
npx remotion render src/index.ts TheInvisibleCostV2Master ../renders/the_invisible_cost_v2_master.mp4 --concurrency=6 --gl=angle
```

### Frame Extraction & Contact Sheet:
```bash
ffmpeg -y -ss 00:00:02.000 -i studio/renders/the_invisible_cost_v2_master.mp4 -vframes 1 videos/the-invisible-cost-v2/qc/frames/frame_01_02.0s.png
# (see qc/qc_report.md for full frame timestamps)
montage videos/the-invisible-cost-v2/qc/frames/*.png -tile 4x3 -geometry 540x960+10+10 -background '#111315' videos/the-invisible-cost-v2/qc/contact_sheet.png
```

---

## 2. Directory Structure
```
videos/the-invisible-cost-v2/
├── research/
│   ├── verify_calculations.py
│   ├── verified_calculations.json
│   └── claim_ledger.json
├── script/
│   └── script.md
├── storyboard/
│   └── storyboard.md
├── audio/
│   ├── generate_audio.py
│   ├── scene_timing.json
│   ├── soundtrack_master.mp3 (Preserved from V1)
│   ├── scene1_vo.mp3 ... scene6_vo.mp3
│   └── master_audio.mp3
├── src/
│   ├── Shot1TheMoneyV2.tsx
│   ├── Shot2WhatItBuysV2.tsx
│   ├── Shot3TimePassesV2.tsx
│   ├── Shot4TheSameBasketV2.tsx
│   ├── Shot5TheRealizationV2.tsx
│   ├── Shot6TheConclusionV2.tsx
│   └── TheInvisibleCostV2Master.tsx
├── renders/
│   └── the_invisible_cost_v2_master.mp4
├── qc/
│   ├── frames/ (12 milestone checkpoints)
│   ├── contact_sheet.png (4x3 tiled grid)
│   └── qc_report.md
└── README.md
```
