# ANYMYN: The Salary Trap — Why a Higher Salary Doesn't Always Make You Richer

An original 52.0-second (1,560 frames @ 30 FPS, 1080×1920 vertical) financial explainer documentary produced autonomously by **ANYMYN** following Pipeline V7 (Retention Engineering & ElevenLabs Voiceover-First Studio Standard).

---

## 1. Executive & Creative Summary

Lifestyle inflation (lifestyle creep) is often presented through dry budget charts or preachy financial lectures. This production elevates the concept into a miniature financial documentary across **six distinct, beautifully art-directed visual beats**:

1. **Scene 1 — The Paradox of the Two Plinths (0.0s – 5.5s):** Warm ivory architectural gallery, directional morning light, and two comparative limestone plinths (₹30,000 baseline vs ₹40,000 raise) connected by a caliper measurement arc revealing identical ₹3,000 savings.
2. **Scene 2 — The Baseline Blueprint (5.5s – 14.0s):** Monolithic budget column dividing into a 90% taupe living expense base (₹27,000) with granular line items (rent, groceries, transit) and a 10% minted gold savings block (₹3,000) locking into a secure glass vault (`✓ SAFETY CUSHION`).
3. **Scene 3 — The Raise Arrives (14.0s – 21.5s):** A minted +₹10,000 gold income slab descends with weight, rolling the salary counter from ₹30,000 to ₹40,000 while a translucent phantom golden tower pulses upward, illustrating the human expectation of savings surging to ₹13,000 (+333%).
4. **Scene 4 — The Creep: Three Silent Upgrades (21.5s – 34.0s):** Progressive disclosure as three tangible upgrade modules arrive sequentially: an architectural apartment window (+₹4,000), a culinary dining cloche (+₹3,000), and a flagship smartphone (+₹3,000), dynamically swelling monthly spending to ₹37,000 in real time.
5. **Scene 5 — The Month-End Reality (34.0s – 42.0s):** The visceral confrontation: side-by-side comparative cards showing ₹37,000 spent (92.5%) against the lonely ₹3,000 savings vault (7.5%), capped by a monumental black and red verdict callout: `EXTRA MONEY SAVED: EXACTLY ₹0`.
6. **Scene 6 — The Verdict & The 50/50 Rule (42.0s – 52.0s):** Monumental serif statement: *"You didn't get richer. Your life just got more expensive."* The ₹10,000 raise splits cleanly into two equal golden discs (+₹5,000 automated to savings [2.66× baseline] and +₹5,000 for guilt-free lifestyle upgrades) sealed with a gold stamp: `✨ SAVE THE RAISE FIRST`.

---

## 2. Directory Structure & Deliverables

```text
videos/the-salary-trap/
├── renders/
│   └── the_salary_trap_master.mp4         # 52.0s Broadcast Master (1080x1920, 30fps H.264/AAC)
├── qc/
│   ├── contact_sheet.png                  # 4x3 Tiled Visual QC Contact Sheet (12 Milestones)
│   ├── qc_report.md                       # Comprehensive Quality & Audio Audit Report
│   ├── milestones/                        # 12 Extracted QC Still Frames
│   └── frames/                            # Remotion Still Frame Tests
├── voiceover/
│   ├── elevenlabs_script.txt              # Clean Spoken Narration (Text Only, Spoken Numbers)
│   ├── voiceover_direction.md             # Detailed Vocal Direction & ElevenLabs Parameters
│   ├── scene_narration_map.md             # Provisional to Real Audio Timeline Mapping
│   └── pronunciation_notes.md             # Dedicated Phonetic Pronunciation Guide
├── audio/
│   ├── voiceover_elevenlabs_original.mp3  # Original Human ElevenLabs Voiceover Recording
│   ├── soundtrack_raw.wav                 # Procedural Stereo Musical Score & SFX Hits
│   ├── soundtrack_master.mp3              # Acoustic Reverb Mastered Soundtrack
│   ├── master_audio.mp3                   # Broadcast Audio Mix (-17.1 LUFS, Peak -1.5 dBFS)
│   ├── scene_timing.json                  # Locked Frame Duration Schedule
│   └── generate_master_audio.py           # Audio Generation & EBU R128 Loudness Pipeline
├── research/
│   ├── verify_calculations.py             # Python Decimal High-Precision Financial Engine
│   ├── verified_calculations.json         # Authoritative Quantitative Proof & Deltas
│   └── research_notes.md                  # Behavioral Economics Grounding & Audience Modeling
├── storyboard/
│   └── storyboard.md                      # Shot-by-Shot Visual Dynamics & Hook Evaluation Matrix
├── retention_map.md                       # 9-Column Retention Beat Ledger & Open Loop Tracker
└── README.md                              # Production Runbook & Documentation
```

---

## 3. Financial Accuracy & Mathematical Ledger

- **Currency:** Indian Rupee (₹ / INR)
- **Baseline Scenario:** Income = ₹30,000 | Spending = ₹27,000 (90.0%) | Savings = ₹3,000 (10.0%)
- **Raise Received:** +₹10,000 (+33.33% raise) $\rightarrow$ New Income = ₹40,000
- **Lifestyle Creep Absorbed:**
  - Nicer Apartment: +₹4,000
  - Dining Out & Deliveries: +₹3,000
  - New Phone EMI: +₹3,000
  - Total New Spending: ₹37,000 (92.5% of income)
- **Ending Savings:** ₹3,000 (7.5% of income)
- **Net Savings Increase:** **₹0.00**
- **The 50/50 Solution:**
  - +50% of raise to Savings: +₹5,000 $\rightarrow$ New Monthly Savings = ₹8,000 (20.0% savings rate, 2.66× baseline!)
  - +50% of raise to Lifestyle: +₹5,000 $\rightarrow$ New Monthly Spending = ₹32,000 (guilt-free lifestyle upgrade)

---

## 4. How to Reproduce

### Prerequisites
- Node.js >= 18, npm
- Python >= 3.10
- FFmpeg & FFprobe

### Reproduction Steps
1. **Verify Financial Math:**
   ```bash
   ./studio/python-tools/.venv/bin/python videos/the-salary-trap/research/verify_calculations.py
   ```
2. **Synthesize Soundtrack & Master Audio Mix:**
   ```bash
   ./studio/python-tools/.venv/bin/python videos/the-salary-trap/audio/generate_master_audio.py
   ```
3. **Render Master Video:**
   ```bash
   cd studio/animation-engine
   npx remotion render TheSalaryTrapMaster ../../videos/the-salary-trap/renders/the_salary_trap_master.mp4
   ```
