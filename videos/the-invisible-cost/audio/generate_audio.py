"""
ANYMYN Audio Generation Pipeline: The Invisible Cost (69.0s Master / 2,070 Frames @ 30 FPS)
Synthesizes neural voiceovers for 6 distinct scenes with verified non-overlapping timing,
generates a rich multi-track procedural soundtrack with synchronized tactile SFX hits,
and masters to -16.5 LUFS using FFmpeg loudnorm.
"""

import subprocess
import json
import math
import wave
import struct
from pathlib import Path

AUDIO_DIR = Path("videos/the-invisible-cost/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

EDGE_TTS_BIN = "/home/phyroosh/.local/bin/edge-tts"
VOICE = "en-US-ChristopherNeural"

# Exactly calibrated 69.0s timeline (2,070 frames @ 30 FPS)
SCENE_TIMELINE = [
    {
        "id": "scene1",
        "start_sec": 0.0,
        "end_sec": 10.5,
        "vo_delay_sec": 0.2,
        "text": "Look at a one-hundred-dollar bill. It feels solid. Permanent. But beneath the surface... an invisible force is quietly eroding what it can buy.",
        "rate": "+16%",
        "start_frame": 0,
        "duration_frames": 315,
    },
    {
        "id": "scene2",
        "start_sec": 10.5,
        "end_sec": 24.0,
        "vo_delay_sec": 10.7,
        "text": "Imagine holding one hundred dollars today. It buys a full basket of goods. Step twenty years ahead: the bill is physically unchanged, but the prices around it have surged. It cannot buy that same basket.",
        "rate": "+18%",
        "start_frame": 315,
        "duration_frames": 405,
    },
    {
        "id": "scene3",
        "start_sec": 24.0,
        "end_sec": 34.5,
        "vo_delay_sec": 24.2,
        "text": "This is inflation: a persistent rise in the general price level. While your account shows the exact same nominal number, each dollar commands fewer real goods in the marketplace.",
        "rate": "+18%",
        "start_frame": 720,
        "duration_frames": 315,
    },
    {
        "id": "scene4",
        "start_sec": 34.5,
        "end_sec": 48.0,
        "vo_delay_sec": 34.7,
        "text": "At three percent annual inflation, twenty years pushes prices up eighty percent. What cost one hundred dollars now costs one hundred and eighty. Your hundred-dollar bill now buys just fifty-five dollars and thirty-seven cents.",
        "rate": "+18%",
        "start_frame": 1035,
        "duration_frames": 405,
    },
    {
        "id": "scene5",
        "start_sec": 48.0,
        "end_sec": 60.0,
        "vo_delay_sec": 48.2,
        "text": "Here is the invisible cost. Your bank balance did not drop. But nearly half of its real purchasing power quietly dissolved into thin air. Inflation takes what your money can do.",
        "rate": "+18%",
        "start_frame": 1440,
        "duration_frames": 360,
    },
    {
        "id": "scene6",
        "start_sec": 60.0,
        "end_sec": 69.0,
        "vo_delay_sec": 60.2,
        "text": "True wealth is not measured in the paper you hold. It is measured in what that paper can buy. Never mistake the number for the power.",
        "rate": "+14%",
        "start_frame": 1800,
        "duration_frames": 270,
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

def generate_procedural_score(total_duration=69.0, sample_rate=48000):
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
        fade_out = min(1.0, (total_duration - t) / 3.0)
        drone = (math.sin(2 * math.pi * 55.0 * t) * 0.08 +
                 math.sin(2 * math.pi * 110.0 * t) * 0.04) * fade_in * fade_out
        left[i] += drone
        right[i] += drone

    # Scene 1 (0-10.5s): Atmospheric C Minor chords (C3, Eb3, G3, C4)
    add_tone(130.81, 0.2, 9.5, 0.12, pan=-0.2, attack=0.1, decay=2.5) # C3
    add_tone(155.56, 0.5, 9.2, 0.10, pan=0.2, attack=0.1, decay=2.5)  # Eb3
    add_tone(196.00, 0.8, 8.8, 0.10, pan=0.0, attack=0.1, decay=2.5)  # G3
    add_tone(261.63, 1.2, 8.4, 0.13, pan=-0.1, attack=0.1, decay=2.0) # C4
    # Crystal chime on rim starburst at t = 2.0s
    for freq in [1760.0, 2093.0, 2637.0, 3136.0]:
        add_tone(freq, 2.0, 2.2, 0.04, pan=0.2, attack=0.01, decay=2.0, harmonic_amp=0.1)

    # Scene 2 (10.5-24.0s): Temporal shift into Ab Major / F Minor
    add_tone(103.83, 10.5, 12.5, 0.13, pan=0.0, attack=0.3, decay=1.5)  # Ab2
    add_tone(155.56, 10.8, 12.2, 0.10, pan=-0.2, attack=0.2, decay=2.0) # Eb3
    add_tone(207.65, 11.2, 11.8, 0.09, pan=0.2, attack=0.2, decay=2.0)  # Ab3
    add_tone(261.63, 11.6, 11.4, 0.08, pan=-0.1, attack=0.2, decay=2.0) # C4
    # Environmental air sweep & vitrine chime at t = 14.5s
    for freq in [880.0, 1174.66, 1760.0]:
        add_tone(freq, 14.5, 1.8, 0.05, pan=0.15, attack=0.05, decay=1.6)

    # Scene 3 (24.0-34.5s): Kinetic G Minor / Mechanical Weight
    add_tone(98.00,  24.0, 10.0, 0.14, pan=0.0, attack=0.2, decay=1.5) # G2
    add_tone(146.83, 24.3, 9.7,  0.11, pan=-0.2, attack=0.2, decay=2.0) # D3
    add_tone(233.08, 24.7, 9.3,  0.10, pan=0.2, attack=0.2, decay=2.0)  # Bb3
    add_tone(293.66, 25.2, 8.8,  0.09, pan=-0.1, attack=0.2, decay=2.0) # D4
    # Mechanical ratchet clicks (t = 26.0s, 27.0s, 28.0s)
    for click_t in [26.0, 27.0, 28.0]:
        add_tone(784.0, click_t, 0.12, 0.06, pan=0.1, attack=0.005, decay=0.1, harmonic_amp=0.4)
        add_tone(196.0, click_t, 0.20, 0.07, pan=-0.1, attack=0.005, decay=0.18, harmonic_amp=0.2)
    # Fulcrum scale thud at t = 29.0s
    add_tone(65.0, 29.0, 0.9, 0.22, pan=0.0, attack=0.01, decay=0.8)
    add_tone(130.0, 29.0, 0.6, 0.14, pan=0.1, attack=0.01, decay=0.5)

    # Scene 4 (34.5-48.0s): Dark Coordinate Observatory / Ticking countdown
    add_tone(82.41,  34.5, 13.0, 0.14, pan=0.0, attack=0.3, decay=1.5) # E2
    add_tone(123.47, 34.8, 12.7, 0.11, pan=-0.2, attack=0.2, decay=1.5) # B2
    add_tone(164.81, 35.2, 12.3, 0.10, pan=0.2, attack=0.2, decay=2.0)  # E3
    # Countdown ticker pulses at 5-year checkpoints (37.0s, 39.0s, 41.0s, 43.0s)
    for tick_t in [37.0, 39.0, 41.0, 43.0]:
        add_tone(1046.5, tick_t, 0.10, 0.05, pan=-0.1, attack=0.005, decay=0.08)
    # Riser sweep from 39.0s to 43.5s
    for r_i in range(12):
        rt = 39.0 + r_i * 0.38
        rf = 196.0 * (1.09 ** r_i)
        add_tone(rf, rt, 0.6, 0.04 + 0.003 * r_i, pan=(r_i%2)*0.4 - 0.2, attack=0.04, decay=0.5)
    # Numerical reveal impact on $55.37 at t = 44.0s
    add_tone(55.0, 44.0, 2.0, 0.24, pan=0.0, attack=0.01, decay=1.9)
    add_tone(110.0, 44.0, 1.5, 0.15, pan=0.1, attack=0.01, decay=1.4)

    # Scene 5 (48.0-60.0s): Erosion & Dissolution Climax
    add_tone(73.42,  48.0, 11.5, 0.15, pan=0.0, attack=0.2, decay=1.5) # D2
    add_tone(110.00, 48.3, 11.2, 0.12, pan=-0.2, attack=0.2, decay=2.0) # A2
    add_tone(164.81, 48.7, 10.8, 0.11, pan=0.2, attack=0.2, decay=2.0) # E3
    # Cinematic Sub-Bass Impact on the Dissolve at t = 52.5s
    add_tone(41.20, 52.5, 2.6, 0.30, pan=0.0, attack=0.01, decay=2.5) # E1 sub
    add_tone(82.41, 52.5, 2.0, 0.18, pan=0.0, attack=0.01, decay=1.9)
    add_tone(164.81, 52.5, 1.2, 0.12, pan=-0.1, attack=0.01, decay=1.1)
    # Dissolution crystalline shimmer (52.7s - 55.5s)
    for sh_i in range(8):
        st = 52.7 + sh_i * 0.35
        sf = 2093.0 + (sh_i * 220.0)
        add_tone(sf, st, 0.8, 0.03, pan=(sh_i%2)*0.6 - 0.3, attack=0.05, decay=0.7, harmonic_amp=0.05)

    # Scene 6 (60.0-69.0s): Grand Resolution in C Major
    add_tone(65.41,  60.0, 8.8, 0.18, pan=0.0, attack=0.2, decay=3.0)  # C2
    add_tone(98.00,  60.2, 8.6, 0.15, pan=-0.1, attack=0.1, decay=3.0) # G2
    add_tone(130.81, 60.5, 8.3, 0.14, pan=0.1, attack=0.1, decay=3.0)  # C3
    add_tone(164.81, 60.8, 8.0, 0.12, pan=-0.2, attack=0.1, decay=3.0) # E3
    add_tone(196.00, 61.1, 7.7, 0.12, pan=0.2, attack=0.1, decay=3.0)  # G3
    add_tone(261.63, 61.4, 7.4, 0.10, pan=0.0, attack=0.1, decay=3.0)  # C4

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
    
    print("\n=== Step 2: Synthesizing Procedural 69.0s Soundtrack ===")
    soundtrack = generate_procedural_score(total_duration=69.0)
    
    print("\n=== Step 3: Mixing Master Audio & Loudness Normalization ===")
    assemble_master_audio(scene_data, soundtrack)
    print("\n✅ Audio generation & timing alignment complete!")

if __name__ == "__main__":
    main()
