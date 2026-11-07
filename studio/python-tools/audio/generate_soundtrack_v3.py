import math
import struct
import wave
import subprocess

SAMPLE_RATE = 48000
TOTAL_DURATION = 14.0
TOTAL_SAMPLES = int(SAMPLE_RATE * TOTAL_DURATION)

# Stereo buffers
left_channel = [0.0] * TOTAL_SAMPLES
right_channel = [0.0] * TOTAL_SAMPLES

def add_tone(freq, start_sec, duration_sec, amplitude, pan=0.0, harmonics=[(1.0, 1.0), (2.0, 0.4), (3.0, 0.15)]):
    start_sample = int(start_sec * SAMPLE_RATE)
    num_samples = int(duration_sec * SAMPLE_RATE)
    
    for i in range(num_samples):
        idx = start_sample + i
        if idx >= TOTAL_SAMPLES:
            break
        t = i / SAMPLE_RATE
        # ADSR envelope: fast attack, exponential decay
        env = math.exp(-2.2 * t / duration_sec) * min(1.0, i / (0.04 * SAMPLE_RATE))
        
        sample_val = 0.0
        for mult, weight in harmonics:
            sample_val += weight * math.sin(2.0 * math.pi * freq * mult * t)
        
        sample_val *= amplitude * env
        
        # Panning (-1.0 = left, 1.0 = right)
        left_gain = math.cos((pan + 1.0) * math.pi / 4.0)
        right_gain = math.sin((pan + 1.0) * math.pi / 4.0)
        
        left_channel[idx] += sample_val * left_gain
        right_channel[idx] += sample_val * right_gain

def add_noise_hit(start_sec, duration_sec, amplitude, pan=0.0):
    start_sample = int(start_sec * SAMPLE_RATE)
    num_samples = int(duration_sec * SAMPLE_RATE)
    import random
    for i in range(num_samples):
        idx = start_sample + i
        if idx >= TOTAL_SAMPLES:
            break
        t = i / SAMPLE_RATE
        env = math.exp(-6.0 * t / duration_sec) * min(1.0, i / (0.01 * SAMPLE_RATE))
        val = (random.random() * 2.0 - 1.0) * amplitude * env
        
        left_gain = math.cos((pan + 1.0) * math.pi / 4.0)
        right_gain = math.sin((pan + 1.0) * math.pi / 4.0)
        left_channel[idx] += val * left_gain
        right_channel[idx] += val * right_gain

def add_sweep(start_freq, end_freq, start_sec, duration_sec, amplitude):
    start_sample = int(start_sec * SAMPLE_RATE)
    num_samples = int(duration_sec * SAMPLE_RATE)
    phase = 0.0
    for i in range(num_samples):
        idx = start_sample + i
        if idx >= TOTAL_SAMPLES:
            break
        progress = i / num_samples
        freq = start_freq + (end_freq - start_freq) * (progress ** 2)
        phase += 2.0 * math.pi * freq / SAMPLE_RATE
        env = math.sin(math.pi * progress) * amplitude
        sample = math.sin(phase) * env
        left_channel[idx] += sample * 0.7
        right_channel[idx] += sample * 0.7

print("Generating musical chords...")
# Note frequencies (Hz)
notes = {
    'D2': 73.42, 'G2': 98.00, 'A2': 110.00, 'B2': 123.47,
    'D3': 146.83, 'F#3': 185.00, 'G3': 196.00, 'A3': 220.00, 'B3': 246.94, 'C#4': 277.18,
    'D4': 293.66, 'E4': 329.63, 'F#4': 369.99, 'G4': 392.00, 'A4': 440.00, 'C#5': 554.37, 'D5': 587.33
}

# Progression:
# Bar 1 (0.0s - 3.2s): D Maj 9 (Opening Warmth)
add_tone(notes['D3'], 0.1, 3.1, 0.22, pan=-0.2)
add_tone(notes['F#3'], 0.15, 3.0, 0.18, pan=0.2)
add_tone(notes['A3'], 0.2, 3.0, 0.16, pan=-0.1)
add_tone(notes['C#4'], 0.25, 2.9, 0.14, pan=0.3)
add_tone(notes['E4'], 0.3, 2.8, 0.12, pan=0.1)

# Bar 2 (3.2s - 6.8s): G Maj 7 (Kinetic Re-investment)
add_tone(notes['G2'], 3.2, 3.6, 0.26, pan=0.0)
add_tone(notes['D3'], 3.25, 3.5, 0.20, pan=-0.2)
add_tone(notes['G3'], 3.3, 3.4, 0.18, pan=0.2)
add_tone(notes['B3'], 3.35, 3.3, 0.16, pan=-0.1)
add_tone(notes['F#4'], 3.4, 3.2, 0.14, pan=0.3)

# Bar 3 (6.8s - 10.4s): B Min 9 (Accelerating Surge)
add_tone(notes['B2'], 6.8, 3.6, 0.28, pan=0.0)
add_tone(notes['F#3'], 6.85, 3.5, 0.22, pan=-0.3)
add_tone(notes['A3'], 6.9, 3.4, 0.18, pan=0.1)
add_tone(notes['D4'], 6.95, 3.3, 0.16, pan=0.3)
add_tone(notes['C#5'], 7.0, 3.2, 0.13, pan=-0.2)

# Bar 4 (10.4s - 14.0s): D Major Grand Resolution (Monumental Payoff)
add_tone(notes['D2'], 10.4, 3.6, 0.32, pan=0.0)
add_tone(notes['A2'], 10.45, 3.5, 0.26, pan=-0.1)
add_tone(notes['D3'], 10.5, 3.4, 0.22, pan=0.1)
add_tone(notes['F#3'], 10.55, 3.3, 0.18, pan=-0.2)
add_tone(notes['A3'], 10.6, 3.2, 0.16, pan=0.2)
add_tone(notes['D4'], 10.65, 3.1, 0.15, pan=0.0)

print("Synthesizing visual synchronization sound effects...")
# SFX 1 (t = 1.2s): Crystal chime on coin specular highlight sweep
add_tone(1864.66, 1.20, 1.6, 0.15, pan=0.25, harmonics=[(1.0, 1.0), (2.05, 0.5), (3.08, 0.25)])
add_tone(2793.83, 1.22, 1.2, 0.08, pan=-0.25, harmonics=[(1.0, 1.0)])

# SFX 2 (t = 4.8s): Hydraulic docking thud for Cycle 1 ($1,000 docks)
add_tone(82.4, 4.80, 0.6, 0.28, pan=0.0, harmonics=[(1.0, 1.0), (1.5, 0.3)])
add_noise_hit(4.80, 0.12, 0.12, pan=0.0)

# SFX 3 (t = 6.2s): Second hydraulic docking thud for Cycle 2 ($1,100 docks)
add_tone(92.5, 6.20, 0.7, 0.32, pan=0.0, harmonics=[(1.0, 1.0), (1.5, 0.4)])
add_noise_hit(6.20, 0.15, 0.14, pan=0.0)

# SFX 4 (t = 8.5s - 10.2s): Exponential rising energy whoosh
add_sweep(120, 480, 8.50, 1.8, 0.16)

# SFX 5 (t = 11.2s): Deep cinematic sub-bass impact on $174,494 reveal
add_tone(46.25, 11.20, 2.5, 0.38, pan=0.0, harmonics=[(1.0, 1.0), (2.0, 0.3)])
add_noise_hit(11.20, 0.25, 0.20, pan=0.0)

# Normalize and export to raw 16-bit WAV
print("Writing intermediate master WAV...")
wav_path = "/home/phyroosh/anymyn/studio/audio/soundtrack_v3_raw.wav"
with wave.open(wav_path, 'wb') as wav:
    wav.setnchannels(2)
    wav.setsampwidth(2)
    wav.setframerate(SAMPLE_RATE)
    
    max_amp = max(max(abs(x) for x in left_channel), max(abs(x) for x in right_channel), 0.001)
    scale = 32767.0 * 0.85 / max_amp
    
    interleaved = bytearray()
    for l, r in zip(left_channel, right_channel):
        il = int(max(-32768, min(32767, l * scale)))
        ir = int(max(-32768, min(32767, r * scale)))
        interleaved.extend(struct.pack('<hh', il, ir))
    wav.writeframes(interleaved)

print(f"Master WAV written: {wav_path}")
