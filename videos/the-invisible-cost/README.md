# ANYMYN — Project: The Invisible Cost
## How Inflation Steals Purchasing Power

**Duration:** 69.0 seconds (2,070 frames @ 30 FPS)  
**Format:** Vertical 9:16 (1080 × 1920) H.264 MP4 with AAC Stereo Audio  
**Master Output:** `videos/the-invisible-cost/renders/the_invisible_cost_master.mp4` (mirrored to `studio/renders/the_invisible_cost_master.mp4`)  

---

## 1. Executive Summary & Creative Direction

"The Invisible Cost" explains inflation and purchasing power through an authentic cinematic financial documentary approach. Rather than displaying generic stock charts or PowerPoint-style bullet points, this video guides the viewer through six completely distinct visual worlds:

1. **Scene 1 — The Illusion (0.0s – 10.5s)**: Warm Ivory Gallery (`#FAF8F2`). Macro camera push across an intricate 760px $100 banknote with guilloché security engraving, rolling specular light sweep, and starburst rim glint.
2. **Scene 2 — Same Money, Different World (10.5s – 24.0s)**: Environmental morph from daylight vitrine (`#EFEAE1`) to cool obsidian studio (`#0F131A`). Demonstrates that while the physical $100 bill remains unchanged, the price boundary of everyday essentials expands to $180.61, shrinking purchasable capacity to 55.4%.
3. **Scene 3 — Understanding Inflation (24.0s – 34.5s)**: Kinetic Bronze Workshop (`#110E0C`). A mechanical fulcrum balance scale physically tilts under an expanding price mass (+80.6%), visually separating nominal dollar amounts from purchasing power.
4. **Scene 4 — The Numerical Reveal (34.5s – 48.0s)**: Midnight Slate Coordinate Observatory (`#090C12`). Dynamic year-by-year calculation ticker ticking purchasing power down from $100.00 to $55.37, highlighted by the formula `(1.03)²⁰ ≈ 1.806` and a −44.6% loss pill.
5. **Scene 5 — The Visual Payoff (48.0s – 60.0s)**: Deep Ink Black Void (`#060608`). The "Invisible Dissolve": A laser slices through the $100 bill at 55.37%, with the missing 44.6% dissolving into golden vapor embers. Side-by-side monolith columns confront nominal balance ($100) with real purchasing power ($55.37).
6. **Scene 6 — The Conclusion (60.0s – 69.0s)**: Museum Ivory Resolution (`#FAF8F2`). Sculptural monetary seal and monumental typographic conclusion: *"Money is not just about how much you have. It is about what it can buy."* Accompanied by a compliant mobile-safe educational disclosure footnote.

---

## 2. Typography Direction (V4 Standards Applied)

- **Completely Eliminated**:
  - Repeated chapter headers and "VOL 01" tags.
  - Decorative upper-corner metadata ("ANYMYN EDITORIAL").
  - Small text used solely to fill empty negative space.
  - Presentation card containers and bordered boxes.
- **Adopted**:
  - Oversized kinetic typography (84–104px headlines).
  - Prominent numerical readouts (78–112px).
  - Expressive architectural layouts with text integrated into the lighting and physics of the shot.
  - Safe margins: Top > 200px, Bottom > 220px.

---

## 3. Financial & Mathematical Model

All quantitative figures verified using Python standard library `Decimal`:
- **Starting Amount**: $100.00
- **Annual Inflation Rate**: 3.0% (hypothetical model, annual compounding)
- **Duration**: 20 years
- **Price Level Factor**: \((1.03)^{20} = 1.80611123... \approx 1.806\)
- **Future Cost of Today's $100 Basket**: \(\$100 \times 1.8061 = \$180.61\)
- **Real Purchasing Power**: \(\$100 / 1.8061 = \$55.37\)
- **Loss in Purchasing Power**: \(-44.63\%\)

---

## 4. Directory Structure

```text
videos/the-invisible-cost/
├── research/
│   ├── claim_ledger.json           # Formal claims, definitions, and citations
│   ├── verified_calculations.json   # Exact 20-year decimal calculations
│   └── verify_calculations.py       # Independent mathematical verification script
├── script/
│   └── script.md                   # Complete narration with phonetics and timecodes
├── storyboard/
│   └── storyboard.md               # 6-scene shot plan, visual worlds, and motion design
├── audio/
│   ├── generate_audio.py           # TTS voiceover, procedural score & mastering script
│   ├── master_audio.mp3            # Final -17.3 LUFS master broadcast audio
│   ├── scene_timing.json           # Time offsets and durations per scene
│   └── *.mp3                       # Individual scene stems and raw audio
├── src/                            # Complete editable Remotion component sources
│   ├── Scene1TheIllusion.tsx
│   ├── Scene2DifferentWorld.tsx
│   ├── Scene3UnderstandingInflation.tsx
│   ├── Scene4NumericalReveal.tsx
│   ├── Scene5VisualPayoff.tsx
│   ├── Scene6Conclusion.tsx
│   └── TheInvisibleCostMaster.tsx
├── renders/
│   └── the_invisible_cost_master.mp4  # 69.0s 1080x1920 30fps Master MP4
├── qc/
│   ├── frames/                     # 12 extracted milestone PNG frames
│   ├── contact_sheet.png           # 4x3 tiled multimodal inspection sheet
│   └── qc_report.md                # Full technical & visual QC certification
└── README.md                       # Project runbook & documentation
```

---

## 5. How to Reproduce

1. **Verify Calculations**:
   ```bash
   python3 videos/the-invisible-cost/research/verify_calculations.py
   ```

2. **Generate Audio & Soundtrack**:
   ```bash
   python3 videos/the-invisible-cost/audio/generate_audio.py
   ```

3. **Typecheck & Render Video**:
   ```bash
   cd studio/animation-engine
   npx tsc --noEmit
   ./node_modules/.bin/remotion render src/index.ts TheInvisibleCostMaster ../../videos/the-invisible-cost/renders/the_invisible_cost_master.mp4
   ```

4. **Run QC & Contact Sheet**:
   ```bash
   ffprobe -v error -show_entries format=duration,size -show_entries stream=width,height,r_frame_rate,codec_name -of json videos/the-invisible-cost/renders/the_invisible_cost_master.mp4
   ```
