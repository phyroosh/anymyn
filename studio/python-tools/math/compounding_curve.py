#!/usr/bin/env python3
"""
ANYMYN Financial Mathematics: The Power of Compounding (V2 Editorial Redesign)
Generates verified financial curves and coordinates for 9:16 vertical layout (1080x1920).
Assumptions:
- Principal: $10,000
- Annual Rate: 10% (0.10)
- Horizon: 30 Years
- Compounding: Annual
- Simple Interest: A = 10,000 * (1 + 0.10 * t)
- Compound Interest: A = 10,000 * (1.10)^t
"""
import json
import math
from decimal import Decimal

def generate_curve_data(width=1080, height=1920, steps=180):
    P = Decimal("10000")
    r = Decimal("0.10")
    years = 30
    
    # Graph viewport bounds (Zone B)
    # Generous width: 130px to 960px (width: 830px)
    # Vertical range: 1380px (baseline $10k) to 580px (terminal $174.5k) (height: 800px)
    x_min, x_max = 130.0, 960.0
    y_baseline = 1380.0
    y_peak = 580.0
    y_range = y_baseline - y_peak # 800.0 px
    
    # Mathematical values at year 0 and 30
    min_val = float(P) # 10,000
    max_val = float(P) * math.pow(1.0 + float(r), years) # 174,494.02268
    val_span = max_val - min_val # 164,494.02268
    
    points_linear = []
    points_compound = []
    frames_data = []
    
    for i in range(steps + 1):
        t = (i / steps) * years
        linear_v = float(P) * (1.0 + float(r) * t)
        compound_v = float(P) * math.pow(1.0 + float(r), t)
        
        x = x_min + (i / steps) * (x_max - x_min)
        y_linear = y_baseline - ((linear_v - min_val) / val_span) * y_range
        y_compound = y_baseline - ((compound_v - min_val) / val_span) * y_range
        
        points_linear.append((round(x, 2), round(y_linear, 2)))
        points_compound.append((round(x, 2), round(y_compound, 2)))
        
        frames_data.append({
            "step": i,
            "progress": round(i / steps, 4),
            "year": round(t, 2),
            "linear_val": round(linear_v, 2),
            "compound_val": round(compound_v, 2),
            "x": round(x, 2),
            "y_linear": round(y_linear, 2),
            "y_compound": round(y_compound, 2)
        })
        
    path_linear = "M " + " L ".join(f"{x},{y}" for x, y in points_linear)
    path_compound = "M " + " L ".join(f"{x},{y}" for x, y in points_compound)
    area_compound = f"{path_compound} L {x_max},{y_baseline} L {x_min},{y_baseline} Z"
    
    # Key verified checkpoints
    checkpoints = [
        {"year": 0, "simple": 10000, "compound": 10000, "x": round(x_min, 2), "y": round(y_baseline, 2)},
        {"year": 10, "simple": 20000, "compound": round(float(P) * (1.10**10)), 
         "x": round(x_min + (10/30)*(x_max - x_min), 2), 
         "y_simple": round(y_baseline - ((20000 - min_val)/val_span)*y_range, 2),
         "y_compound": round(y_baseline - (((float(P)*(1.10**10)) - min_val)/val_span)*y_range, 2)},
        {"year": 20, "simple": 30000, "compound": round(float(P) * (1.10**20)), 
         "x": round(x_min + (20/30)*(x_max - x_min), 2),
         "y_simple": round(y_baseline - ((30000 - min_val)/val_span)*y_range, 2),
         "y_compound": round(y_baseline - (((float(P)*(1.10**20)) - min_val)/val_span)*y_range, 2)},
        {"year": 30, "simple": 40000, "compound": round(max_val), 
         "x": round(x_max, 2),
         "y_simple": round(y_baseline - ((40000 - min_val)/val_span)*y_range, 2),
         "y_compound": round(y_peak, 2)}
    ]
    
    # Y-axis ticks for honest scale
    # $10k (baseline), $50k, $100k, $150k, $174.5k (peak)
    ticks_y = [
        {"val": "$10k", "y": round(y_baseline, 2)},
        {"val": "$50k", "y": round(y_baseline - ((50000 - min_val)/val_span)*y_range, 2)},
        {"val": "$100k", "y": round(y_baseline - ((100000 - min_val)/val_span)*y_range, 2)},
        {"val": "$150k", "y": round(y_baseline - ((150000 - min_val)/val_span)*y_range, 2)},
        {"val": "$175k", "y": round(y_peak, 2)}
    ]
    
    result = {
        "metadata": {
            "principal": 10000,
            "annual_rate": 0.10,
            "years": 30,
            "final_simple": 40000,
            "final_compound": 174494,
            "multiplier_capital": round(max_val / float(P), 2),  # 17.45x
            "multiplier_simple": round(max_val / 40000.0, 2)     # 4.36x
        },
        "viewport": {
            "width": width,
            "height": height,
            "x_min": x_min,
            "x_max": x_max,
            "y_baseline": y_baseline,
            "y_peak": y_peak
        },
        "ticks_y": ticks_y,
        "checkpoints": checkpoints,
        "paths": {
            "linear": path_linear,
            "compound": path_compound,
            "compound_area": area_compound
        },
        "steps": frames_data
    }
    return result

if __name__ == "__main__":
    data = generate_curve_data()
    out_file = "studio/assets/compounding_data.json"
    with open(out_file, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print(f"Generated verified V2 editorial curve data -> {out_file}")
    for cp in data["checkpoints"]:
        print(f"Year {cp['year']:2d} -> Simple: ${cp['simple']:,} | Compound: ${cp.get('compound', cp.get('compound')):,}")
    print(f"Capital Multiplier: {data['metadata']['multiplier_capital']}x")
    print(f"Simple Multiplier: {data['metadata']['multiplier_simple']}x")
