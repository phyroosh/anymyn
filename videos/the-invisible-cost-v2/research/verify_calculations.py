"""
ANYMYN Financial Verification Engine: The Invisible Cost V2
Strict decimal validation for 20-year inflation model at 3% annual compound rate.
Validates all on-screen numbers and narrative claims.
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
    # Benchmark tests
    y0 = table[0]
    assert y0["basket_cost"] == 100.00, f"Year 0 basket cost mismatch: {y0['basket_cost']}"
    assert y0["purchasing_power"] == 100.00, f"Year 0 purchasing power mismatch: {y0['purchasing_power']}"
    
    y6 = table[6]
    assert y6["basket_cost"] == 119.41, f"Year 6 basket cost mismatch: {y6['basket_cost']}"
    assert y6["purchasing_power"] == 83.75, f"Year 6 purchasing power mismatch: {y6['purchasing_power']}"
    
    y10 = table[10]
    assert y10["basket_cost"] == 134.39, f"Year 10 basket cost mismatch: {y10['basket_cost']}"
    assert y10["purchasing_power"] == 74.41, f"Year 10 purchasing power mismatch: {y10['purchasing_power']}"
    
    y20 = table[20]
    assert y20["basket_cost"] == 180.61, f"Year 20 basket cost mismatch: {y20['basket_cost']}"
    assert y20["purchasing_power"] == 55.37, f"Year 20 purchasing power mismatch: {y20['purchasing_power']}"
    assert y20["pct_loss"] == 44.6, f"Year 20 pct loss mismatch: {y20['pct_loss']}"
    assert y20["pct_retained"] == 55.4, f"Year 20 pct retained mismatch: {y20['pct_retained']}"
    
    # Assert that value does NOT cut in half (55.4% remains, loss is 44.6%)
    assert y20["purchasing_power"] > 50.00, "Purchasing power should not be cut in half at 3% over 20 years"
    print("All mathematical checkpoints successfully verified against Decimal precision!")

def main():
    table = calculate_inflation_table()
    verify_checkpoints(table)
    
    research_dir = Path("videos/the-invisible-cost-v2/research")
    
    with open(research_dir / "verified_calculations.json", "w") as f:
        json.dump(table, f, indent=2)
        
    claim_ledger = {
        "model": "Hypothetical annual compounding at 3.0% constant rate over 20 years",
        "initial_banknote": "$100.00",
        "initial_basket_cost": "$100.00",
        "year_6_basket": "$119.41",
        "year_6_power": "$83.75",
        "year_10_basket": "$134.39",
        "year_10_power": "$74.41",
        "year_20_basket": "$180.61",
        "year_20_power": "$55.37",
        "year_20_power_retained_pct": "55.4%",
        "year_20_power_lost_pct": "44.6%",
        "approximate_conversational_claims": {
            "basket_future_cost": "About 181 dollars ($180.61 exact)",
            "basket_purchasing_power": "About 55% of that basket (55.4% exact)",
            "negative_check": "Strictly NOT 'cut in half'; purchasing power is 55.4%, loss is 44.6%"
        }
    }
    
    with open(research_dir / "claim_ledger.json", "w") as f:
        json.dump(claim_ledger, f, indent=2)
        
    print("Exported verified_calculations.json and claim_ledger.json.")

if __name__ == "__main__":
    main()
