"""
ANYMYN Financial Verification Engine: The Invisible Cost V5.1
Authoritative Python Decimal calculations for 20-year inflation model (3% annual compounding).
Generates verified JSON artifact and TypeScript data source.
"""

from decimal import Decimal, ROUND_HALF_UP
import json
from pathlib import Path

def calculate_inflation_table():
    P0 = Decimal("100.00")
    rate = Decimal("0.03")
    one = Decimal("1.00")
    
    table = []
    
    for year in range(21):
        t = Decimal(year)
        growth_factor = (one + rate) ** t
        
        # Future price of today's basket: 100 * (1.03)^t
        basket_cost = (P0 * growth_factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        # Purchasing power of original $100: 100 / (1.03)^t
        purchasing_power = (P0 / growth_factor).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
        
        # Percentage loss: (100 - purchasing_power) / 100 * 100
        pct_loss = ((P0 - purchasing_power) / P0 * Decimal("100")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        
        # Percentage retained
        pct_retained = (purchasing_power / P0 * Decimal("100")).quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)
        
        entry = {
            "year": year,
            "basket_cost": float(basket_cost),
            "purchasing_power": float(purchasing_power),
            "pct_loss": float(pct_loss),
            "pct_retained": float(pct_retained),
            "growth_factor": float(growth_factor.quantize(Decimal("0.0001"), rounding=ROUND_HALF_UP))
        }
        table.append(entry)
        
    return table

def verify_checkpoints(table):
    y0 = table[0]
    assert y0["basket_cost"] == 100.00 and y0["purchasing_power"] == 100.00, f"Year 0 mismatch: {y0}"
    
    y6 = table[6]
    assert y6["basket_cost"] == 119.41 and y6["purchasing_power"] == 83.75, f"Year 6 mismatch: {y6}"
    
    y10 = table[10]
    assert y10["basket_cost"] == 134.39 and y10["purchasing_power"] == 74.41, f"Year 10 mismatch: {y10}"
    
    y18 = table[18]
    assert y18["basket_cost"] == 170.24 and y18["purchasing_power"] == 58.74, f"Year 18 mismatch: {y18}"
    
    y20 = table[20]
    assert y20["basket_cost"] == 180.61 and y20["purchasing_power"] == 55.37, f"Year 20 mismatch: {y20}"
    assert y20["pct_loss"] == 44.6, f"Year 20 loss mismatch: {y20['pct_loss']}"
    assert y20["pct_retained"] == 55.4, f"Year 20 retained mismatch: {y20['pct_retained']}"
    
    # Assert not cut in half
    assert y20["purchasing_power"] > 50.00, "Purchasing power must not fall below 50.00 at 3% over 20 years"
    print("All Phase 2 checkpoints (Years 0, 6, 10, 18, 20) verified with Decimal precision!")

def main():
    table = calculate_inflation_table()
    verify_checkpoints(table)
    
    research_dir = Path("videos/the-invisible-cost-v5/research")
    with open(research_dir / "verified_calculations.json", "w") as f:
        json.dump(table, f, indent=2)
        
    # Generate TypeScript data module
    ts_data_path = Path("studio/animation-engine/src/compositions/the-invisible-cost-v5/data/inflationData.ts")
    ts_content = f"""/**
 * Authoritative financial data source for ANYMYN V5.1
 * Generated directly from Python Decimal verification.
 * DO NOT EDIT MANUALLY.
 */

export interface InflationDataPoint {{
  year: number;
  basket_cost: number;
  purchasing_power: number;
  pct_loss: number;
  pct_retained: number;
  growth_factor: number;
}}

export const INFLATION_DATA: InflationDataPoint[] = {json.dumps(table, indent=2)};

export const CHECKPOINTS = {{
  year0: INFLATION_DATA[0],
  year6: INFLATION_DATA[6],
  year10: INFLATION_DATA[10],
  year18: INFLATION_DATA[18],
  year20: INFLATION_DATA[20],
}} as const;
"""
    with open(ts_data_path, "w") as f:
        f.write(ts_content)
        
    print(f"Exported verified_calculations.json and {ts_data_path}.")

if __name__ == "__main__":
    main()
