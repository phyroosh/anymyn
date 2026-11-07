# ANYMYN: The Compound Effect — How Money Multiplies Over Time

An original 76-second (2,280 frames @ 30 FPS, 1080×1920 vertical) financial explainer documentary produced autonomously by **ANYMYN**.

---

## 1. Executive & Creative Summary

Compound interest is frequently reduced to a sterile formula or a dry line graph. This production elevates the concept into a miniature financial documentary across **six distinct, non-repetitive visual worlds**:

1. **Scene 1 — The Museum Opening (0.0s – 8.5s):** Warm ivory architectural gallery, directional morning light, and a macro camera sweep across a 520px minted $10,000 gold bullion medallion with 72 milled edge tick marks, concentric guilloché engravings, rolling specular sheen, and a sharp caustic starburst flare at t = 2.0s.
2. **Scene 2 — The Tactile Foundation (8.5s – 19.5s):** Tactile limestone plinth where ten $1,000 precision-milled gold ingots arrive from opposing sides, locking into an interlocking grid and compressing into a monolithic $10,000 foundation slab.
3. **Scene 3 — The Feedback Engine (19.5s – 33.5s):** Deep bronze & graphite kinetic workshop with an overhead warm spotlight. An isometric 3D capital turbine where Year 1 returns ($1,000) and Year 2 returns ($1,100) orbit and physically dock into the core well, triggering hydraulic shockwaves that swell the foundation cylinder and expand its capacity.
4. **Scene 4 — The Time Observatory (33.5s – 47.5s):** Atmospheric platinum & midnight observatory with volumetric light columns and an isometric mathematical grid. A dynamic perspective camera tracks the 30-year accumulation curve, revealing a radiant golden monument at Year 15 ($41,772 balance, cumulative growth exceeds 3× principal).
5. **Scene 5 — The Visceral Divergence (47.5s – 62.5s):** Direct physical confrontation between two paths: a flat, linear industrial steel rail (Simple Interest crawling to $40,000) versus an exponential glowing ribbon (Compound Interest rocketing to $174,494), connected by a vertical measurement bracket highlighting the 4.36× chasm.
6. **Scene 6 — The Monumental Verdict (62.5s – 76.0s):** Museum obsidian canvas with ambient gold glow. Monumental $174,494 reveal, 17.45× capital multiplier badge, 4.36× leverage lockup, and the central thesis: *"Your returns can become the foundation for your next returns."* Includes fully compliant mobile safe-area disclaimer.

---

## 2. Directory Structure

```text
videos/the-compound-effect/
├── research/
│   ├── verify_calculations.py   # Python verification script with standard library Decimal
│   └── claim_ledger.json        # 30-year quantitative proof and milestone records
├── script/
│   └── script.md                # Narrative script with phonetics, timings, and scene notes
├── storyboard/
│   └── storyboard.md            # Detailed 6-scene shot plan and art direction
├── audio/
│   ├── generate_audio.py        # Automated neural TTS, score synthesis & mastering pipeline
│   ├── scene_timing.json        # Verified timeline offsets and frame allocations
│   ├── scene1_vo.mp3 ...        # Per-scene neural voiceover stems (Christopher Neural)
│   ├── voiceover_full.mp3       # Assembled complete voiceover track
│   ├── soundtrack_raw.wav       # Multi-track procedural stereo score & SFX hits
│   ├── soundtrack_master.mp3    # Master musical score with acoustic reverb
│   └── master_audio.mp3         # Final broadcast mix (-16.5 LUFS)
├── renders/
│   └── the_compound_effect_master.mp4 # Final 1080x1920 30fps H.264/AAC master video
├── qc/
│   ├── frames/                  # Extracted milestone frames across all 6 scenes
│   ├── contact_sheet.png        # 12-frame contact sheet for multimodal inspection
│   └── qc_report.md             # Quality control inspection report
└── README.md                    # Production runbook and documentation
```

---

## 3. Financial Accuracy & Mathematical Ledger

- **Starting Capital \( P \):** \$10,000.00 USD
- **Annual Rate \( r \):** 10.0% effective annual return (\( r = 0.10 \))
- **Duration \( t \):** 30 Years
- **Compounding Frequency:** Annual compounding (\( A = P(1 + r)^t \))
- **Simple Interest Formula:** \( A = P(1 + r \cdot t) \)

### Key Milestones:
- **Year 0:** Both balances = \$10,000.00
- **Year 1:** Compound = \$11,000.00 (+\$1,000 annual return)
- **Year 2:** Compound = \$12,100.00 (+\$1,100 annual return)
- **Year 10:** Compound = \$25,937.43 vs. Simple = \$20,000.00
- **Year 15:** Compound = \$41,772.49 (cumulative growth = \$31,772 > 3× principal; annual yield = \$3,797.50) vs. Simple = \$25,000.00
- **Year 20:** Compound = \$67,275.01 vs. Simple = \$30,000.00
- **Year 30:** Compound = \$174,494.06 vs. Simple = \$40,000.00
- **Divergence Ratio:** \( \frac{\$174,494.06}{\$40,000.00} = 4.3624\times \) (4.36× simple interest ending balance)
- **Capital Multiplier:** \( \frac{\$174,494.06}{\$10,000.00} = 17.45\times \)

---

## 4. How to Reproduce

### Prerequisites
- Node.js >= 18, npm
- Python >= 3.10
- FFmpeg & FFprobe

### Steps
1. **Verify Financial Math:**
   ```bash
   ./studio/python-tools/.venv/bin/python videos/the-compound-effect/research/verify_calculations.py
   ```
2. **Synthesize Voiceover & Master Audio:**
   ```bash
   ./studio/python-tools/.venv/bin/python videos/the-compound-effect/audio/generate_audio.py
   cp videos/the-compound-effect/audio/master_audio.mp3 studio/animation-engine/public/audio/the-compound-effect/
   ```
3. **Render Master Video:**
   ```bash
   cd studio/animation-engine
   npx remotion render TheCompoundEffectMaster ../../videos/the-compound-effect/renders/the_compound_effect_master.mp4
   ```
