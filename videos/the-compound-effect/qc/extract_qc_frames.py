"""
ANYMYN Quality Control Frame Extractor
Extracts representative milestone frames across all 6 distinct scenes
and compiles a tiled contact sheet for multimodal visual inspection.
"""

import subprocess
from pathlib import Path

QC_DIR = Path("videos/the-compound-effect/qc")
FRAMES_DIR = QC_DIR / "frames"
FRAMES_DIR.mkdir(parents=True, exist_ok=True)

VIDEO_PATH = Path("videos/the-compound-effect/renders/the_compound_effect_master.mp4")

CHECKPOINTS = [
    {"frame": 60,   "sec": 2.00,  "name": "s1_glint_starburst"},
    {"frame": 180,  "sec": 6.00,  "name": "s1_bullion_macro"},
    {"frame": 360,  "sec": 12.00, "name": "s2_ingot_assembly"},
    {"frame": 520,  "sec": 17.33, "name": "s2_plinth_consolidated"},
    {"frame": 720,  "sec": 24.00, "name": "s3_cycle1_return_orbit"},
    {"frame": 900,  "sec": 30.00, "name": "s3_cycle2_docked_base"},
    {"frame": 1150, "sec": 38.33, "name": "s4_trajectory_yr10"},
    {"frame": 1320, "sec": 44.00, "name": "s4_milestone_yr15"},
    {"frame": 1550, "sec": 51.66, "name": "s5_divergence_surge"},
    {"frame": 1780, "sec": 59.33, "name": "s5_verdict_436x"},
    {"frame": 1980, "sec": 66.00, "name": "s6_monumental_174k"},
    {"frame": 2180, "sec": 72.66, "name": "s6_thesis_disclaimer"}
]

def extract_frames():
    extracted = []
    for cp in CHECKPOINTS:
        out_png = FRAMES_DIR / f"frame_{cp['frame']:04d}_{cp['name']}.png"
        cmd = [
            "ffmpeg", "-y",
            "-ss", f"{cp['sec']:.3f}",
            "-i", str(VIDEO_PATH),
            "-vframes", "1",
            "-q:v", "2",
            str(out_png)
        ]
        subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        extracted.append(out_png)
        print(f"Extracted Frame {cp['frame']} (t={cp['sec']:.2f}s): {out_png.name}")
        
    return extracted

def build_contact_sheet(extracted):
    # 4 rows x 3 columns contact sheet
    # Each image scaled to 360x640 (total contact sheet: 1080 x 2560)
    contact_sheet = QC_DIR / "contact_sheet.png"
    
    # Use ffmpeg xstack filter to create a clean 4x3 grid
    # Row 0: 0, 1, 2
    # Row 1: 3, 4, 5
    # Row 2: 6, 7, 8
    # Row 3: 9, 10, 11
    
    inputs = []
    for p in extracted:
        inputs.extend(["-i", str(p)])
        
    scale_filters = []
    for i in range(12):
        scale_filters.append(f"[{i}:v]scale=360:640[v{i}];")
        
    grid_layout = (
        "0_0|360_0|720_0|"
        "0_640|360_640|720_640|"
        "0_1280|360_1280|720_1280|"
        "0_1920|360_1920|720_1920"
    )
    
    stack_filter = "".join(scale_filters) + "".join(f"[v{i}]" for i in range(12)) + f"xstack=inputs=12:layout={grid_layout}[out]"
    
    cmd = ["ffmpeg", "-y"] + inputs + ["-filter_complex", stack_filter, "-map", "[out]", str(contact_sheet)]
    subprocess.run(cmd, check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    print(f"✅ Generated 12-frame contact sheet: {contact_sheet}")

def main():
    print("=== Extracting Milestone QC Frames ===")
    extracted = extract_frames()
    print("\n=== Generating Tiled Contact Sheet ===")
    build_contact_sheet(extracted)

if __name__ == "__main__":
    main()
