"""
ANYMYN Financial Verification Script: The Invisible Cost
Verifies the exact compound mathematics of 3% annual inflation over 20 years
using Python standard library Decimal with arbitrary precision.
"""

from decimal import Decimal, getcontext, ROUND_HALF_UP
import json
from pathlib import Path

getcontext().prec = 32

def round_cents(d: Decimal) -> Decimal:
    return d.quantize(Decimal('0.01'), rounding=ROUND_HALF_UP)

def run_verification():
    p0 = Decimal('100.00')
    annual_rate = Decimal('0.03')
    years = 20
    
    table = []
    for y in range(years + 1):
        price_factor = (Decimal('1') + annual_rate) ** y
        future_cost_of_basket = round_cents(p0 * price_factor)
        purchasing_power = round_cents(p0 / price_factor)
        pct_loss = round_cents((Decimal('1') - (Decimal('1') / price_factor)) * Decimal('100'))
        
        table.append({
            "year": y,
            "price_factor_exact": str(price_factor),
            "price_factor_rounded": float(round(price_factor, 4)),
            "cost_of_today_100_basket": float(future_cost_of_basket),
            "purchasing_power_of_100_bill": float(purchasing_power),
            "pct_purchasing_power_lost": float(pct_loss)
        })
        
    # Verify core milestones
    factor_20 = (Decimal('1') + annual_rate) ** 20
    basket_20 = round_cents(p0 * factor_20)
    pp_20 = round_cents(p0 / factor_20)
    
    assert str(round(factor_20, 3)) == "1.806", f"Factor mismatch: {round(factor_20, 3)}"
    assert basket_20 == Decimal('180.61'), f"Basket mismatch: {basket_20}"
    assert pp_20 == Decimal('55.37'), f"Purchasing power mismatch: {pp_20}"
    
    print("=== Mathematical Verification Passed ===")
    print(f"Year  0: Price Factor = 1.0000 | Purchasing Power = $100.00")
    print(f"Year  5: Price Factor = {table[5]['price_factor_rounded']:.4f} | Basket = ${table[5]['cost_of_today_100_basket']:.2f} | Purchasing Power = ${table[5]['purchasing_power_of_100_bill']:.2f}")
    print(f"Year 10: Price Factor = {table[10]['price_factor_rounded']:.4f} | Basket = ${table[10]['cost_of_today_100_basket']:.2f} | Purchasing Power = ${table[10]['purchasing_power_of_100_bill']:.2f}")
    print(f"Year 15: Price Factor = {table[15]['price_factor_rounded']:.4f} | Basket = ${table[15]['cost_of_today_100_basket']:.2f} | Purchasing Power = ${table[15]['purchasing_power_of_100_bill']:.2f}")
    print(f"Year 20: Price Factor = {table[20]['price_factor_rounded']:.4f} | Basket = ${table[20]['cost_of_today_100_basket']:.2f} | Purchasing Power = ${table[20]['purchasing_power_of_100_bill']:.2f}")
    print(f"Loss of purchasing power over 20 years: -{table[20]['pct_purchasing_power_lost']:.2f}%")
    
    output_path = Path("videos/the-invisible-cost/research/verified_calculations.json")
    output_path.write_text(json.dumps({
        "starting_principal": 100.00,
        "annual_inflation_rate": 0.03,
        "years": 20,
        "future_price_level_factor": float(round(factor_20, 4)),
        "basket_cost_year_20": float(basket_20),
        "purchasing_power_year_20": float(pp_20),
        "pct_loss_year_20": float(table[20]['pct_purchasing_power_lost']),
        "timeline": table
    }, indent=2))
    print(f"Saved verified calculation records to {output_path}")

if __name__ == "__main__":
    run_verification()
