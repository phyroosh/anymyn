#!/usr/bin/env python3
"""
ANYMYN Master Audio Engine: The Salary Trap (52.0s / 1,560 Frames @ 30 FPS)
Synthesizes a rich procedural cinematic score, synchronized tactile SFX hits,
and mixes the human ElevenLabs voiceover lead track to broadcast standard -16.5 LUFS.
"""

import json
import math
import struct
import subprocess
import wave
from pathlib import Path

AUDIO_DIR = Path("videos/the-salary-trap/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)

PUBLIC_AUDIO_DIR = Path("studio/animation-engine/public/audio/the-salary-trap")
PUBLIC_AUDIO_DIR.mkdir(parents=True, exist_ok=True)

VO_ORIGINAL = AUDIO_DIR / "voiceover_elevenlabs_original.mp3"
assert VO_ORIGINAL.exists(), f"Missing original voiceover: {VO_ORIGINAL}"

TOTAL_DURATION = 52.0  # 1560 frames @ 30 FPS
SAMPLE_RATE = 48000

SCENE_TIMELINE = [
    {
        "id": "scene1",
        "name": "The Paradox of the Two Plinths",
        "start_sec": 0.0,
        "end_sec": 5.5,
        "start_frame": 0,
        "duration_frames": 165,
        "text": "A person earning forty thousand rupees a month can be just as broke as someone earning thirty thousand."
    },
    {
        "id": "scene2",
        "name": "The Baseline Blueprint",
        "start_sec": 5.5,
        "end_sec": 14.0,
        "start_frame": 165,
        "duration_frames": 255,
        "text": "Say you earn thirty thousand rupees, spend twenty-seven thousand on living expenses, and save three thousand. You have a small safety cushion."
    },
    {
        "id": "scene3",
        "name": "The Raise Arrives",
        "start_sec": 14.0,
        "end_sec": 21.5,
        "start_frame": 420,
        "duration_frames": 225,
        "text": "Then, you get a raise. Your salary jumps to forty thousand rupees. You expect your savings to instantly shoot up."
    },
    {
        "id": "scene4",
        "name": "The Creep: Three Silent Upgrades",
        "start_sec": 21.5,
        "end_sec": 34.0,
        "start_frame": 645,
        "duration_frames": 375,
        "text": "Instead, lifestyle creep quietly takes over. A slightly nicer apartment costs four thousand more. Ordering food more often takes three thousand. A new phone adds another three thousand."
    },
    {
        "id": "scene5",
        "name": "The Climax: The Unchanged Vault",
        "start_sec": 34.0,
        "end_sec": 42.0,
        "start_frame": 1020,
        "duration_frames": 240,
        "text": "At the end of the month, your total spending is thirty-seven thousand rupees. And your savings? Still exactly three thousand."
    },
    {
        "id": "scene6",
        "name": "The Verdict & The 50/50 Rule",
        "start_sec": 42.0,
        "end_sec": 52.0,
        "start_frame": 1260,
        "duration_frames": 300,
        "text": "You didn’t get richer. Your life just got more expensive. Whenever your income grows, save half the raise first. Upgrade your life with the rest."
    }
]

def save_scene_timing():
    timing_file = AUDIO_DIR / "scene_timing.json"
    with open(timing_file, "w", encoding="utf-8") as f:
        json.dump(SCENE_TIMELINE, f, indent=2)
    print(f"Saved scene timing schedule to {timing_file}")

def generate_cinematic_score():
    total_samples = int(TOTAL_DURATION * SAMPLE_RATE)
    left = [0.0] * total_samples
    right = [0.0] * total_samples

    def add_tone(freq, start_t, dur, amp, pan=0.0, attack=0.1, decay=0.2, harmonic_amp=0.25):
        start_idx = int(start_t * SAMPLE_RATE)
        num_s = int(dur * SAMPLE_RATE)
        for i in range(num_s):
            idx = start_idx + i
            if idx >= total_samples:
                break
            t = i / SAMPLE_RATE
            if t < attack:
                env = t / attack
            elif t > dur - decay:
                env = max(0.0, (dur - t) / decay)
            else:
                env = 1.0

            sig = (math.sin(2 * math.pi * freq * t) +
                   harmonic_amp * math.sin(4 * math.pi * freq * t) +
                   0.12 * math.sin(6 * math.pi * freq * t)) * amp * env

            left_gain = math.sqrt(0.5 * (1.0 - pan))
            right_gain = math.sqrt(0.5 * (1.0 + pan))
            left[idx] += sig * left_gain
            right[idx] += sig * right_gain

    # 1. Warm Continuous Sub Drone (55 Hz / 110 Hz)
    for i in range(total_samples):
        t = i / SAMPLE_RATE
        fade_in = min(1.0, t / 2.0)
        fade_out = min(1.0, (TOTAL_DURATION - t) / 3.0)
        drone = (math.sin(2 * math.pi * 55.0 * t) * 0.05 +
                 math.sin(2 * math.pi * 110.0 * t) * 0.025) * fade_in * fade_out
        left[i] += drone
        right[i] += drone

    # Scene 1 (0 - 5.5s): Intrigued Acoustic Atmosphere (D3, F#3, A3)
    add_tone(146.83, 0.2, 5.0, 0.08, pan=-0.2, attack=0.05, decay=1.5)
    add_tone(185.00, 0.5, 4.7, 0.07, pan=0.2, attack=0.05, decay=1.5)
    add_tone(220.00, 0.8, 4.4, 0.06, pan=0.0, attack=0.05, decay=1.5)
    # Shimmer glint on plinth reveal
    for freq in [1760.0, 2217.46, 2637.02]:
        add_tone(freq, 1.2, 1.5, 0.025, pan=0.15, attack=0.01, decay=1.4, harmonic_amp=0.1)

    # Scene 2 (5.5 - 14.0s): Grounded G Major budget clarity (G2 98Hz, D3 146.8Hz, B3 246.9Hz)
    add_tone(97.99,  5.5, 8.0, 0.08, pan=0.0, attack=0.2, decay=1.2)
    add_tone(146.83, 5.8, 7.7, 0.07, pan=-0.2, attack=0.1, decay=1.5)
    add_tone(246.94, 6.2, 7.3, 0.06, pan=0.2, attack=0.1, decay=1.5)
    # Pneumatic locking clicks for savings slab into vault (t = 11.8s)
    add_tone(440.0, 11.8, 0.18, 0.06, pan=0.1, attack=0.005, decay=0.15, harmonic_amp=0.4)
    add_tone(110.0, 11.82, 0.35, 0.08, pan=-0.1, attack=0.005, decay=0.3, harmonic_amp=0.2)

    # Scene 3 (14.0 - 21.5s): Golden Raise Swell & Optimistic Arc (B2 123.5Hz, E3 164.8Hz, G#3 207.6Hz)
    add_tone(123.47, 14.0, 7.0, 0.09, pan=-0.1, attack=0.2, decay=1.5)
    add_tone(164.81, 14.3, 6.7, 0.08, pan=0.2, attack=0.1, decay=1.5)
    add_tone(207.65, 14.6, 6.4, 0.07, pan=0.0, attack=0.1, decay=1.5)
    # +₹10,000 Gold slab impact drop at t = 16.0s
    add_tone(55.0, 16.0, 1.2, 0.16, pan=0.0, attack=0.01, decay=1.1)
    add_tone(110.0, 16.0, 0.8, 0.10, pan=0.1, attack=0.01, decay=0.7)
    for freq in [1318.5, 1661.2, 1975.5]:
        add_tone(freq, 16.1, 1.8, 0.035, pan=-0.1, attack=0.01, decay=1.6, harmonic_amp=0.1)

    # Scene 4 (21.5 - 34.0s): Rhythmic Progression across 3 Upgrades
    add_tone(110.00, 21.5, 12.0, 0.08, pan=0.0, attack=0.3, decay=1.5)
    add_tone(164.81, 22.0, 11.5, 0.07, pan=-0.2, attack=0.2, decay=1.5)
    # Upgrade 1: Apartment (+₹4k) at t = 25.5s
    add_tone(65.0, 25.5, 0.6, 0.12, pan=-0.2, attack=0.01, decay=0.5)
    add_tone(520.0, 25.5, 0.15, 0.05, pan=-0.2, attack=0.005, decay=0.14)
    # Upgrade 2: Food & Delivery (+₹3k) at t = 28.9s
    add_tone(75.0, 28.9, 0.6, 0.12, pan=0.2, attack=0.01, decay=0.5)
    add_tone(587.3, 28.9, 0.15, 0.05, pan=0.2, attack=0.005, decay=0.14)
    # Upgrade 3: Phone EMI (+₹3k) at t = 31.5s
    add_tone(85.0, 31.5, 0.6, 0.14, pan=0.0, attack=0.01, decay=0.5)
    add_tone(659.2, 31.5, 0.15, 0.06, pan=0.0, attack=0.005, decay=0.14)

    # Scene 5 (34.0 - 42.0s): The Climax Tension & Dramatic Stillness
    add_tone(98.00, 34.0, 7.5, 0.09, pan=0.0, attack=0.2, decay=1.5)
    add_tone(146.83, 34.3, 7.2, 0.08, pan=-0.1, attack=0.2, decay=1.5)
    # Clamping spending bracket impact at t = 37.5s
    add_tone(50.0, 37.5, 1.8, 0.18, pan=0.0, attack=0.01, decay=1.7)
    # Visceral silence hit on "Still exactly three thousand" at t = 39.5s
    add_tone(220.0, 39.5, 2.0, 0.04, pan=0.0, attack=0.01, decay=1.9, harmonic_amp=0.05)

    # Scene 6 (42.0 - 52.0s): Triumphant Grand Resolution in D Major
    add_tone(73.42,  42.0, 9.5, 0.12, pan=0.0, attack=0.3, decay=3.0)
    add_tone(110.00, 42.2, 9.3, 0.10, pan=-0.1, attack=0.1, decay=3.0)
    add_tone(146.83, 42.5, 9.0, 0.10, pan=0.1, attack=0.1, decay=3.0)
    add_tone(185.00, 42.8, 8.7, 0.09, pan=-0.2, attack=0.1, decay=3.0)
    add_tone(220.00, 43.1, 8.4, 0.09, pan=0.2, attack=0.1, decay=3.0)
    # Triumphant gold wax stamp & chime at t = 47.5s
    add_tone(55.0, 47.5, 1.5, 0.18, pan=0.0, attack=0.01, decay=1.4)
    for freq in [1174.66, 1479.98, 1760.0, 2349.32]:
        add_tone(freq, 47.6, 3.0, 0.04, pan=0.1, attack=0.01, decay=2.8, harmonic_amp=0.1)

    # Normalize procedural score to prevent any internal clipping
    max_val = max(max(abs(x) for x in left), max(abs(y) for y in right), 0.001)
    scale = min(0.70 / max_val, 1.0)

    raw_wav = AUDIO_DIR / "soundtrack_raw.wav"
    with wave.open(str(raw_wav), "wb") as wf:
        wf.setnchannels(2)
        wf.setsampwidth(2)
        wf.setframerate(SAMPLE_RATE)
        frames = bytearray()
        for i in range(total_samples):
            l_sample = int(max(-32767, min(32767, left[i] * scale * 32767)))
            r_sample = int(max(-32767, min(32767, right[i] * scale * 32767)))
            frames.extend(struct.pack("<hh", l_sample, r_sample))
        wf.writeframes(frames)

    soundtrack_mp3 = AUDIO_DIR / "soundtrack_master.mp3"
    # Add subtle studio room acoustics and gentle warmth
    cmd = [
        "ffmpeg", "-y", "-i", str(raw_wav),
        "-af", "aecho=0.8:0.85:35:0.25",
        "-b:a", "192k", str(soundtrack_mp3)
    ]
    subprocess.run(cmd, check=True)
    print(f"Rendered soundtrack to {soundtrack_mp3}")
    return soundtrack_mp3

def mix_master_audio(soundtrack_mp3):
    master_mp3 = AUDIO_DIR / "master_audio.mp3"
    public_master = PUBLIC_AUDIO_DIR / "master_audio.mp3"

    # ElevenLabs voiceover is lead track; music is ducked under speech (-13dB),
    # then entire mix is mastered to broadcast -16.5 LUFS with peak limiter (-1.5 dBFS).
    filter_complex = (
        "[0:a]aresample=48000,aformat=channel_layouts=stereo[vo];"
        "[1:a]volume=0.35[music];"
        "[music][vo]sidechaincompress=threshold=0.03:ratio=6:attack=30:release=350[ducked_music];"
        "[vo][ducked_music]amix=inputs=2:duration=first:dropout_transition=2[mixed];"
        "[mixed]loudnorm=I=-16.5:TP=-1.5:LRA=6.0:print_format=json[master]"
    )

    cmd = [
        "ffmpeg", "-y",
        "-i", str(VO_ORIGINAL),
        "-i", str(soundtrack_mp3),
        "-filter_complex", filter_complex,
        "-map", "[master]",
        "-b:a", "256k",
        str(master_mp3)
    ]
    print("Mixing final master audio with loudness normalization (-16.5 LUFS)...")
    res = subprocess.run(cmd, check=True, stderr=subprocess.PIPE, text=True)
    
    # Copy to public audio dir for Remotion
    subprocess.run(["cp", str(master_mp3), str(public_master)], check=True)
    print(f"Master audio successfully compiled to {master_mp3} and {public_master}")

    # Verify loudness with ebur128
    ebur_cmd = [
        "ffmpeg", "-i", str(master_mp3),
        "-filter:a", "ebur128=framelog=verbose",
        "-f", "null", "-"
    ]
    proc = subprocess.run(ebur_cmd, stderr=subprocess.PIPE, text=True)
    for line in proc.stderr.splitlines():
        if "Integrated loudness" in line or "Loudness range" in line or "True peak" in line:
            print("  [QC Audio]:", line.strip())

if __name__ == "__main__":
    save_scene_timing()
    st_mp3 = generate_cinematic_score()
    mix_master_audio(st_mp3)
