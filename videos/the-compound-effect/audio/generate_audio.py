"""
ANYMYN Audio Generation Pipeline (76.0s Master / 2,280 Frames @ 30 FPS)
Synthesizes neural voiceovers for 6 distinct scenes with verified non-overlapping timing,
generates a rich multi-track procedural soundtrack, and masters to -16.5 LUFS.
"""

import subprocess
import json
import math
import wave
import struct
from pathlib import Path

AUDIO_DIR = Path("videos/the-compound-effect/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

EDGE_TTS_BIN = "/home/phyroosh/.local/bin/edge-tts"
VOICE = "en-US-ChristopherNeural"

# Exactly calibrated 76.0s timeline (2,280 frames @ 30 FPS)
SCENE_TIMELINE = [
    {
        "id": "scene1",
        "start_sec": 0.0,
        "end_sec": 8.5,
        "vo_delay_sec": 0.3,
        "text": "What if your money could earn money? Not just once... but over and over again, until the returns begin working for you?",
        "rate": "+2%",
        "start_frame": 0,
        "duration_frames": 255,
    },
    {
        "id": "scene2",
        "start_sec": 8.5,
        "end_sec": 19.5,
        "vo_delay_sec": 8.8,
        "text": "Imagine ten thousand dollars. Left alone in a vault, it remains static. But invested at ten percent, a powerful transformation begins.",
        "rate": "+10%",
        "start_frame": 255,
        "duration_frames": 330,
    },
    {
        "id": "scene3",
        "start_sec": 19.5,
        "end_sec": 33.5,
        "vo_delay_sec": 19.8,
        "text": "In year one, your capital generates one thousand dollars. Leave it invested, and your working base becomes eleven thousand. In year two, you earn eleven hundred. The return itself has become capital.",
        "rate": "+14%",
        "start_frame": 585,
        "duration_frames": 420,
    },
    {
        "id": "scene4",
        "start_sec": 33.5,
        "end_sec": 47.5,
        "vo_delay_sec": 33.8,
        "text": "Early on, progress feels quiet. After ten years, you have twenty-six thousand dollars. But by year fifteen, capital has quadrupled to forty-one thousand—and every single year now adds thousands more.",
        "rate": "+14%",
        "start_frame": 1005,
        "duration_frames": 420,
    },
    {
        "id": "scene5",
        "start_sec": 47.5,
        "end_sec": 62.5,
        "vo_delay_sec": 47.8,
        "text": "Here is the divergence. Simple interest pays only on your original deposit—a flat climb to forty thousand dollars. But compounding pays on everything you have ever earned. That divergence creates a four-point-three-six times explosion.",
        "rate": "+14%",
        "start_frame": 1425,
        "duration_frames": 450,
    },
    {
        "id": "scene6",
        "start_sec": 62.5,
        "end_sec": 76.0,
        "vo_delay_sec": 62.8,
        "text": "Thirty years. Ten thousand dollars becomes over one hundred and seventy-four thousand. In finance, time is not just a waiting room. When returns become capital... time is the multiplier.",
        "rate": "+14%",
        "start_frame": 1875,
        "duration_frames": 405,
    }
]

def synthesize_voiceover():
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
        
    return results

def generate_procedural_score(total_duration=76.0, sample_rate=48000):
    total_samples = int(total_duration * sample_rate)
    left = [0.0] * total_samples
    right = [0.0] * total_samples
    
    def add_tone(freq, start_t, dur, amp, pan=0.0, attack=0.1, decay=0.2, harmonic_amp=0.3):
        start_idx = int(start_t * sample_rate)
        num_s = int(dur * sample_rate)
        for i in range(num_s):
            idx = start_idx + i
            if idx >= total_samples:
                break
            t = i / sample_rate
            if t < attack:
                env = t / attack
            elif t > dur - decay:
                env = max(0.0, (dur - t) / decay)
            else:
                env = 1.0
                
            sig = (math.sin(2 * math.pi * freq * t) +
                   harmonic_amp * math.sin(4 * math.pi * freq * t) +
                   0.15 * math.sin(6 * math.pi * freq * t)) * amp * env
                   
            left_gain = math.sqrt(0.5 * (1.0 - pan))
            right_gain = math.sqrt(0.5 * (1.0 + pan))
            left[idx] += sig * left_gain
            right[idx] += sig * right_gain

    # Continuous warm sub drone (55Hz / 110Hz)
    for i in range(total_samples):
        t = i / sample_rate
        fade_in = min(1.0, t / 2.5)
        fade_out = min(1.0, (total_duration - t) / 3.5)
        drone = (math.sin(2 * math.pi * 55.0 * t) * 0.08 +
                 math.sin(2 * math.pi * 110.0 * t) * 0.04) * fade_in * fade_out
        left[i] += drone
        right[i] += drone

    # Scene 1 (0-8.5s): Acoustic piano chords (D3, F#3, A3, D4)
    add_tone(146.83, 0.2, 8.0, 0.12, pan=-0.2, attack=0.05, decay=2.5) # D3
    add_tone(185.00, 0.4, 7.8, 0.10, pan=0.2, attack=0.05, decay=2.5)  # F#3
    add_tone(220.00, 0.6, 7.6, 0.10, pan=0.0, attack=0.05, decay=2.5)  # A3
    add_tone(293.66, 1.2, 7.0, 0.14, pan=-0.1, attack=0.05, decay=2.0) # D4
    add_tone(369.99, 3.5, 4.8, 0.10, pan=0.3, attack=0.05, decay=2.0)  # F#4
    # Crystal chime on rim glint at t = 2.0s
    for freq in [1760.0, 2217.46, 2637.02, 3520.0]:
        add_tone(freq, 2.0, 2.2, 0.04, pan=0.2, attack=0.01, decay=2.0, harmonic_amp=0.1)

    # Scene 2 (8.5-19.5s): G Major warmth (G2 98Hz, D3 146.8Hz, B3 246.9Hz, G4 392Hz)
    add_tone(97.99,  8.5, 10.8, 0.12, pan=0.0, attack=0.3, decay=1.5)
    add_tone(146.83, 8.8, 10.5, 0.10, pan=-0.2, attack=0.1, decay=2.0)
    add_tone(246.94, 9.2, 10.1, 0.09, pan=0.2, attack=0.1, decay=2.0)
    add_tone(392.00, 9.8, 9.5, 0.08, pan=-0.1, attack=0.1, decay=2.0)
    # Tactile ingot alignment clicks (t = 11.0s, 13.0s, 15.0s, 17.5s)
    for click_t in [11.0, 13.0, 15.0, 17.5]:
        add_tone(880.0, click_t, 0.15, 0.06, pan=0.1, attack=0.005, decay=0.12, harmonic_amp=0.5)
        add_tone(220.0, click_t, 0.25, 0.08, pan=-0.1, attack=0.005, decay=0.2, harmonic_amp=0.2)

    # Scene 3 (19.5-33.5s): Kinetic B Minor (B2 123.47Hz, F#3 185Hz, D4 293.66Hz)
    add_tone(123.47, 19.5, 13.8, 0.14, pan=-0.1, attack=0.2, decay=1.5)
    add_tone(185.00, 19.8, 13.5, 0.11, pan=0.2, attack=0.1, decay=2.0)
    add_tone(293.66, 20.2, 13.0, 0.10, pan=-0.2, attack=0.1, decay=2.0)
    # Hydraulic press docking thuds at t = 24.5s and t = 30.0s
    for thud_t in [24.5, 30.0]:
        add_tone(65.0, thud_t, 0.8, 0.22, pan=0.0, attack=0.01, decay=0.7)
        add_tone(130.0, thud_t, 0.5, 0.15, pan=0.1, attack=0.01, decay=0.4)
        add_tone(520.0, thud_t, 0.2, 0.08, pan=-0.1, attack=0.005, decay=0.18)

    # Scene 4 (33.5-47.5s): E Minor / G Major rising accumulation
    add_tone(82.41,  33.5, 13.8, 0.14, pan=0.0, attack=0.3, decay=1.5)
    add_tone(123.47, 33.8, 13.5, 0.11, pan=-0.2, attack=0.2, decay=1.5)
    add_tone(196.00, 34.2, 13.0, 0.10, pan=0.2, attack=0.2, decay=2.0)
    add_tone(329.63, 36.0, 11.0, 0.09, pan=0.0, attack=0.5, decay=2.0)
    # Year 15 milestone reveal swell (t = 41.5s)
    add_tone(392.00, 41.5, 5.5, 0.12, pan=-0.2, attack=0.1, decay=2.0)
    add_tone(587.33, 41.7, 5.3, 0.08, pan=0.2, attack=0.1, decay=2.0)

    # Scene 5 (47.5-62.5s): A Major -> Divergence Surge
    add_tone(110.00, 47.5, 14.8, 0.15, pan=0.0, attack=0.2, decay=1.5)
    add_tone(164.81, 47.8, 14.5, 0.12, pan=-0.2, attack=0.2, decay=2.0)
    add_tone(220.00, 48.2, 14.0, 0.11, pan=0.2, attack=0.2, decay=2.0)
    # Tension riser sweep from 52s to 57.5s
    for r_i in range(16):
        rt = 52.0 + r_i * 0.35
        rf = 220.0 * (1.08 ** r_i)
        add_tone(rf, rt, 0.8, 0.05 + 0.003 * r_i, pan=(r_i%2)*0.4 - 0.2, attack=0.05, decay=0.6)
    # Cinematic Sub-Bass Impact on the $174,494 reveal & Divergence peak (t = 57.5s)
    add_tone(45.0, 57.5, 2.5, 0.28, pan=0.0, attack=0.01, decay=2.4)
    add_tone(90.0, 57.5, 2.0, 0.18, pan=0.0, attack=0.01, decay=1.9)
    add_tone(180.0, 57.5, 1.2, 0.12, pan=-0.1, attack=0.01, decay=1.1)

    # Scene 6 (62.5-76.0s): Grand Resolution in D Major
    add_tone(73.42,  62.5, 13.0, 0.18, pan=0.0, attack=0.2, decay=3.5)
    add_tone(110.00, 62.7, 12.8, 0.15, pan=-0.1, attack=0.1, decay=3.5)
    add_tone(146.83, 63.0, 12.5, 0.14, pan=0.1, attack=0.1, decay=3.5)
    add_tone(185.00, 63.3, 12.2, 0.12, pan=-0.2, attack=0.1, decay=3.5)
    add_tone(220.00, 63.6, 12.0, 0.12, pan=0.2, attack=0.1, decay=3.5)
    add_tone(293.66, 63.9, 11.8, 0.10, pan=0.0, attack=0.1, decay=3.5)

    # Master limiter & clipping protection
    max_val = max(max(abs(x) for x in left), max(abs(y) for y in right), 0.001)
    scale = min(0.85 / max_val, 1.0)
    
    raw_wav = AUDIO_DIR / "soundtrack_raw.wav"
    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(sample_rate)
        
        frames = bytearray()
        for i in range(total_samples):
            l_sample = int(max(-32767, min(32767, left[i] * scale * 32767)))
            r_sample = int(max(-32767, min(32767, right[i] * scale * 32767)))
            frames.extend(struct.pack("<hh", l_sample, r_sample))
            
        wf.writeframes(frames)
        
    out_mp3 = AUDIO_DIR / "soundtrack_master.mp3"
    ffmpeg_cmd = [
        "ffmpeg", "-y", "-i", str(raw_wav),
        "-af", "aecho=0.8:0.88:40:0.3",
        "-b:a", "192k", str(out_mp3)
    ]
    subprocess.run(ffmpeg_cmd, check=True)
    print(f"Master soundtrack processed to {out_mp3}")
    return str(out_mp3)

def assemble_master_audio(scene_data, soundtrack_path):
    filter_inputs = []
    filter_mix = []
    inputs = []
    
    for i, sc in enumerate(scene_data):
        inputs.extend(["-i", sc["file"]])
        delay_ms = int(sc["vo_delay_sec"] * 1000)
        filter_inputs.append(f"[{i}]adelay={delay_ms}|{delay_ms}[v{i}];")
        filter_mix.append(f"[v{i}]")
        
    mix_filter = "".join(filter_inputs) + "".join(filter_mix) + f"amix=inputs={len(scene_data)}:dropout_transition=0:normalize=0[vo_all]"
    
    combined_vo = AUDIO_DIR / "voiceover_full.mp3"
    cmd_vo = ["ffmpeg", "-y"] + inputs + ["-filter_complex", mix_filter, "-map", "[vo_all]", "-b:a", "192k", str(combined_vo)]
    subprocess.run(cmd_vo, check=True)
    print(f"Combined complete voiceover track: {combined_vo}")
    
    master_audio = AUDIO_DIR / "master_audio.mp3"
    mix_cmd = [
        "ffmpeg", "-y",
        "-i", str(combined_vo),
        "-i", str(soundtrack_path),
        "-filter_complex",
        "[0:a]volume=1.35[vo];[1:a]volume=0.42[bg];[vo][bg]amix=inputs=2:duration=first:dropout_transition=0,loudnorm=I=-16.5:TP=-1.5:LRA=7[master]",
        "-map", "[master]",
        "-b:a", "192k",
        str(master_audio)
    ]
    subprocess.run(mix_cmd, check=True)
    print(f"Master normalized audio generated: {master_audio}")
    
    timing_json = AUDIO_DIR / "scene_timing.json"
    timing_json.write_text(json.dumps(scene_data, indent=2))
    print(f"Wrote scene timing metadata to {timing_json}")

def main():
    print("=== Step 1: Synthesizing Non-Overlapping Scene Voiceovers ===")
    scene_data = synthesize_voiceover()
    
    print("\n=== Step 2: Synthesizing Procedural 76.0s Soundtrack ===")
    soundtrack = generate_procedural_score(total_duration=76.0)
    
    print("\n=== Step 3: Mixing Master Audio & Loudness Normalization ===")
    assemble_master_audio(scene_data, soundtrack)
    print("\n✅ Audio generation & timing alignment complete!")

if __name__ == "__main__":
    main()
