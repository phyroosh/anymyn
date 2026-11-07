# ANYMYN — "The Invisible Cost: Inflation Simplified" (V5.1)

## Executive Summary
This directory contains the production package for **Visual Identity V5.1** of "The Invisible Cost: Inflation Simplified". 

V5.1 establishes ANYMYN's signature **Unified Ivory Grid Studio** environment: an unbroken, continuous light theme with subtle perspective floor grid lines, warm spotlight illumination, and cardless physical object analogies.

---

## Deliverables & Directory Structure
```
videos/the-invisible-cost-v5/
├── renders/
│   └── the_invisible_cost_v5_master.mp4   # 69.0s Broadcast-Ready Master (1080x1920, 30fps)
├── qc/
│   ├── contact_sheet.png                  # 4x3 Tiled Visual QC Contact Sheet (12 Milestones)
│   ├── qc_report.md                       # Comprehensive Quality & Audio Audit Report
│   ├── contact_frames/                    # 12 Extracted QC Still Frames
│   └── frames/                            # Remotion Still Frame Tests
├── script/
│   └── script.md                          # Full Spoken Narration Ledger & Shot Timings
├── storyboard/
│   └── storyboard.md                      # Shot-by-Shot Visual Dynamics & Prop Specifications
├── research/
│   ├── verify_calculations.py             # Python Decimal High-Precision Financial Engine
│   └── verified_calculations.json         # Authoritative 20-Year Inflation Schedule
├── audio/
│   ├── master_audio.mp3                   # Final Master Audio Mix (-16.5 LUFS)
│   ├── soundtrack_master.mp3              # Original Cinematic Background Music
│   └── scene1_vo.mp3 ... scene6_vo.mp3    # Discrete Spoken Narration Stems
├── src/                                   # Mirrored Source Code
└── production_manifest.json               # Machine-Readable Production Manifest
```

---

## Technical Specifications
- **Format:** 9:16 Vertical Video (1080 × 1920)
- **Framerate:** 30.00 fps constant
- **Duration:** 69.000 seconds (2,070 frames)
- **Video Codec:** H.264 High Profile (bitrate ~1.3 Mbps)
- **Audio Codec:** AAC Stereo (48,000 Hz, integrated loudness -16.5 LUFS, LRA 4.8 LU)
- **Engine:** Remotion 4.0.541 on React 19.3.1 with TypeScript 5.8.2
- **Master Composition:** `TheInvisibleCostV5Master`

---

## How to Playback / Verify
```bash
# Play rendered master video
ffplay videos/the-invisible-cost-v5/renders/the_invisible_cost_v5_master.mp4

# Run audio loudness check
ffmpeg -i videos/the-invisible-cost-v5/renders/the_invisible_cost_v5_master.mp4 -filter:a ebur128 -f null -
```
