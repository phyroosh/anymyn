"""
ANYMYN Audio Generation Pipeline: The Invisible Cost V2
Synthesizes simplified, conversational voiceover stems with verified non-overlapping timing,
mixes with the preserved procedural soundtrack from V1,
and masters to -16.5 LUFS using FFmpeg loudnorm.
"""

import subprocess
import json
import shutil
from pathlib import Path

AUDIO_DIR = Path("videos/the-invisible-cost-v2/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

EDGE_TTS_BIN = "/home/phyroosh/.local/bin/edge-tts"
VOICE = "en-US-ChristopherNeural"

# Exactly calibrated 69.0s timeline (2,070 frames @ 30 FPS)
# Shot 1: 0.0s - 8.0s (240 frames)
# Shot 2: 8.0s - 18.0s (300 frames)
# Shot 3: 18.0s - 35.0s (510 frames)
# Shot 4: 35.0s - 47.0s (360 frames)
# Shot 5: 47.0s - 59.0s (360 frames)
# Shot 6: 59.0s - 69.0s (300 frames)
SCENE_TIMELINE = [
    {
        "id": "scene1",
        "start_sec": 0.0,
        "end_sec": 8.0,
        "vo_delay_sec": 0.4,
        "text": "Imagine you have one hundred dollars.",
        "rate": "+6%",
        "start_frame": 0,
        "duration_frames": 240,
    },
    {
        "id": "scene2",
        "start_sec": 8.0,
        "end_sec": 18.0,
        "vo_delay_sec": 8.5,
        "text": "Today, it can buy you a basket of things you need.",
        "rate": "+8%",
        "start_frame": 240,
        "duration_frames": 300,
    },
    {
        "id": "scene3",
        "start_sec": 18.0,
        "end_sec": 35.0,
        "vo_delay_sec": 18.4,
        "text": "Now imagine coming back twenty years later. The same basket costs much more. But your hundred-dollar note still says one hundred dollars. Why? Because prices have been rising little by little, year after year. That's inflation.",
        "rate": "+18%",
        "start_frame": 540,
        "duration_frames": 510,
    },
    {
        "id": "scene4",
        "start_sec": 35.0,
        "end_sec": 47.0,
        "vo_delay_sec": 35.4,
        "text": "Let's say prices rise by 3% every year. After twenty years, that same basket would cost about 181 dollars.",
        "rate": "+10%",
        "start_frame": 1050,
        "duration_frames": 360,
    },
    {
        "id": "scene5",
        "start_sec": 47.0,
        "end_sec": 59.0,
        "vo_delay_sec": 47.4,
        "text": "So your 100 dollars would now buy only about 55% of that basket. Your money didn't disappear. It just can't buy as much as before.",
        "rate": "+12%",
        "start_frame": 1410,
        "duration_frames": 360,
    },
    {
        "id": "scene6",
        "start_sec": 59.0,
        "end_sec": 69.0,
        "vo_delay_sec": 59.4,
        "text": "That's why the number in your wallet isn't the whole story. What that money can buy matters too.",
        "rate": "+10%",
        "start_frame": 1770,
        "duration_frames": 300,
    }
]

def copy_preserved_soundtrack():
    src_soundtrack = Path("videos/the-invisible-cost/audio/soundtrack_master.mp3")
    dst_soundtrack = AUDIO_DIR / "soundtrack_master.mp3"
    print(f"Copying preserved soundtrack from {src_soundtrack}...")
    shutil.copy2(src_soundtrack, dst_soundtrack)
    print("Soundtrack copied.")

def synthesize_voiceovers():
    results = []
    for sc in SCENE_TIMELINE:
        out_mp3 = AUDIO_DIR / f"{sc['id']}_vo.mp3"
        print(f"Synthesizing {sc['id']} voiceover...")
        cmd = [
            EDGE_TTS_BIN,
            "--voice", VOICE,
            f"--rate={sc['rate']}",
            "--text", sc["text"],
            f"--write-media={out_mp3}"
        ]
        subprocess.run(cmd, check=True)
            
        probe_cmd = [
            "ffprobe", "-v", "error", "-show_entries", "format=duration",
            "-of", "default=noprint_wrappers=1:nokey=1", str(out_mp3)
        ]
        dur = float(subprocess.check_output(probe_cmd).decode().strip())
        max_allowed = sc["end_sec"] - sc["vo_delay_sec"]
        print(f"  -> {sc['id']}: duration={dur:.2f}s (window={max_allowed:.2f}s, start={sc['vo_delay_sec']}s, end={sc['vo_delay_sec']+dur:.2f}s)")
        assert dur <= max_allowed, f"{sc['id']} audio ({dur:.2f}s) overflows window ({max_allowed:.2f}s)!"
        
        results.append({
            **sc,
            "duration_sec": dur,
            "file": str(out_mp3)
        })
        
    with open(AUDIO_DIR / "scene_timing.json", "w") as f:
        json.dump(results, f, indent=2)
    print("Saved scene_timing.json.")
    return results

def assemble_master_audio(scenes):
    print("Assembling voiceover stem timeline...")
    filter_parts = []
    
    # Generate 69.0s of silence as baseline
    filter_parts.append("aevalsrc=0:d=69.0:s=48000:c=stereo[silence]")
    
    delayed_labels = []
    for i, sc in enumerate(scenes):
        delay_ms = int(sc["vo_delay_sec"] * 1000)
        filter_parts.append(f"[{i+1}:a]adelay={delay_ms}|{delay_ms},volume=1.40[v{i}]")
        delayed_labels.append(f"[v{i}]")
        
    mix_inputs = "[silence]" + "".join(delayed_labels)
    filter_parts.append(f"{mix_inputs}amix=inputs={len(scenes)+1}:duration=first:dropout_transition=0.1[full_vo]")
    
    # Layer over preserved soundtrack (input 0)
    # Duck soundtrack slightly under VO
    filter_parts.append(
        "[0:a][full_vo]sidechaincompress=threshold=0.07:ratio=3:attack=20:release=250[bgm_ducked];"
        "[bgm_ducked][full_vo]amix=inputs=2:duration=first:weights=0.82 1.0[mix_raw];"
        "[mix_raw]loudnorm=I=-16.5:TP=-1.5:LRA=7.0[final_master]"
    )
    
    filter_complex = ";".join(filter_parts)
    
    inputs = ["-i", str(AUDIO_DIR / "soundtrack_master.mp3")]
    for sc in scenes:
        inputs.extend(["-i", sc["file"]])
        
    out_master = AUDIO_DIR / "master_audio.mp3"
    cmd = [
        "ffmpeg", "-y",
        *inputs,
        "-filter_complex", filter_complex,
        "-map", "[final_master]",
        "-c:a", "libmp3lame",
        "-b:a", "192k",
        str(out_master)
    ]
    print("Rendering master audio with FFmpeg...")
    subprocess.run(cmd, check=True)
    
    # Also copy to Remotion public audio directory
    pub_dir = Path("studio/animation-engine/public/audio/the-invisible-cost-v2")
    pub_dir.mkdir(parents=True, exist_ok=True)
    shutil.copy2(out_master, pub_dir / "master_audio.mp3")
    print(f"Master audio rendered and copied to {pub_dir / 'master_audio.mp3'}.")
    
    # Probe integrated loudness
    loud_cmd = [
        "ffmpeg", "-i", str(out_master),
        "-af", "ebur128=framelog=quiet",
        "-f", "null", "-"
    ]
    p = subprocess.run(loud_cmd, capture_output=True, text=True)
    for line in p.stderr.splitlines():
        if "Integrated loudness" in line or "Loudness range" in line or "True peak" in line:
            print(f"  {line}")

def main():
    copy_preserved_soundtrack()
    scenes = synthesize_voiceovers()
    assemble_master_audio(scenes)
    print("Audio generation complete!")

if __name__ == "__main__":
    main()
