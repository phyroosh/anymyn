"""
ANYMYN Financial Verification Script
Topic: The Compound Effect — 30-Year Wealth Accumulation ($10,000 @ 10% CAGR)
Validates all mathematical and quantitative claims with standard library Decimal.
"""

from decimal import Decimal, ROUND_HALF_UP
import json
from pathlib import Path

def calculate_compounding(principal: Decimal, rate: Decimal, years: int):
    results = []
    compound_bal = principal
    simple_bal = principal
    
    for t in range(years + 1):
        if t == 0:
            annual_return_compound = Decimal("0.00")
            annual_return_simple = Decimal("0.00")
        else:
            prev_compound = compound_bal
            compound_bal = (compound_bal * (Decimal("1.00") + rate)).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            annual_return_compound = compound_bal - prev_compound
            
            prev_simple = simple_bal
            simple_bal = (principal * (Decimal("1.00") + rate * Decimal(str(t)))).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
            annual_return_simple = simple_bal - prev_simple
            
        growth_compound = compound_bal - principal
        growth_simple = simple_bal - principal
        
        results.append({
            "year": t,
            "compound_balance": float(compound_bal),
            "compound_growth": float(growth_compound),
            "compound_annual_return": float(annual_return_compound),
            "simple_balance": float(simple_bal),
            "simple_growth": float(growth_simple),
            "simple_annual_return": float(annual_return_simple),
            "multiplier_vs_principal": float((compound_bal / principal).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)),
            "multiplier_vs_simple": float((compound_bal / simple_bal).quantize(Decimal("0.01"), rounding=ROUND_HALF_UP))
        })
        
    return results

def main():
    p = Decimal("10000.00")
    r = Decimal("0.10")
    years = 30
    
    data = calculate_compounding(p, r, years)
    
    # Assert critical milestones
    # Year 0
    assert data[0]["compound_balance"] == 10000.00
    assert data[0]["simple_balance"] == 10000.00
    
    # Year 1
    assert data[1]["compound_balance"] == 11000.00
    assert data[1]["compound_annual_return"] == 1000.00
    
    # Year 2
    assert data[2]["compound_balance"] == 12100.00
    assert data[2]["compound_annual_return"] == 1100.00
    
    # Year 10
    assert round(data[10]["compound_balance"]) == 25937
    assert data[10]["simple_balance"] == 20000.00
    
    # Year 15: Cumulative growth ($31,772) > 3x initial principal ($10,000)
    assert round(data[15]["compound_balance"]) == 41772
    assert round(data[15]["compound_growth"]) == 31772
    assert data[15]["compound_growth"] > 3 * float(p)
    # Annual return in Year 15 is $3,797.50 (nearly 38% of initial principal in a single year)
    assert round(data[15]["compound_annual_return"]) == 3798
    # By Year 16, annual return ($4,177.25) exceeds 40% of original principal
    assert data[16]["compound_annual_return"] > 4000.00
    
    # Year 20
    assert round(data[20]["compound_balance"]) == 67275
    assert data[20]["simple_balance"] == 30000.00
    
    # Year 30
    assert round(data[30]["compound_balance"]) == 174494
    assert data[30]["simple_balance"] == 40000.00
    # Multiplier vs simple ending balance
    assert round(data[30]["multiplier_vs_simple"], 2) == 4.36
    assert round(data[30]["multiplier_vs_principal"], 2) == 17.45
    
    print("✅ All financial milestone assertions passed with 100% precision!")
    print(f"Year 0:  ${data[0]['compound_balance']:,.2f}")
    print(f"Year 10: Compound ${data[10]['compound_balance']:,.2f} vs Simple ${data[10]['simple_balance']:,.2f}")
    print(f"Year 15: Compound ${data[15]['compound_balance']:,.2f} (Growth: ${data[15]['compound_growth']:,.2f}, Annual: ${data[15]['compound_annual_return']:,.2f})")
    print(f"Year 20: Compound ${data[20]['compound_balance']:,.2f} vs Simple ${data[20]['simple_balance']:,.2f}")
    print(f"Year 30: Compound ${data[30]['compound_balance']:,.2f} vs Simple ${data[30]['simple_balance']:,.2f}")
    print(f"Divergence ratio: {data[30]['compound_balance'] / data[30]['simple_balance']:.4f}x (~4.36x)")
    
    # Write claim ledger JSON
    ledger = {
        "metadata": {
            "title": "The Compound Effect: 30-Year Wealth Accumulation",
            "principal": 10000.00,
            "rate": 0.10,
            "duration_years": 30,
            "compounding_frequency": "Annual",
            "formula_compound": "A = P * (1 + r)^t",
            "formula_simple": "A = P * (1 + r * t)",
            "disclaimer": "Hypothetical mathematical illustration. Excludes taxes, fees, and market volatility. Not financial advice."
        },
        "milestones": {
            "year_0": {"compound": data[0]["compound_balance"], "simple": data[0]["simple_balance"]},
            "year_1": {"compound": data[1]["compound_balance"], "return": data[1]["compound_annual_return"]},
            "year_2": {"compound": data[2]["compound_balance"], "return": data[2]["compound_annual_return"]},
            "year_10": {"compound": data[10]["compound_balance"], "simple": data[10]["simple_balance"]},
            "year_15": {
                "compound": data[15]["compound_balance"],
                "cumulative_growth": data[15]["compound_growth"],
                "annual_return": data[15]["compound_annual_return"],
                "simple": data[15]["simple_balance"]
            },
            "year_20": {"compound": data[20]["compound_balance"], "simple": data[20]["simple_balance"]},
            "year_30": {
                "compound": data[30]["compound_balance"],
                "simple": data[30]["simple_balance"],
                "ratio_compound_to_simple": round(data[30]["compound_balance"] / data[30]["simple_balance"], 2),
                "multiplier_vs_principal": round(data[30]["compound_balance"] / 10000.00, 2)
            }
        },
        "yearly_data": data
    }
    
    out_path = Path("videos/the-compound-effect/research/claim_ledger.json")
    out_path.write_text(json.dumps(ledger, indent=2))
    print(f"Wrote claim ledger to {out_path}")
    
    assets_data = Path("videos/the-compound-effect/assets/compounding_data.json")
    assets_data.write_text(json.dumps(ledger, indent=2))
    print(f"Wrote assets copy to {assets_data}")

if __name__ == "__main__":
    main()
