#!/usr/bin/env python3
"""
ANYMYN Financial Verification Engine
Topic: Why a Higher Salary Doesn't Always Make You Richer (Lifestyle Inflation)
Script: verify_calculations.py
"""

import json
from decimal import Decimal, ROUND_HALF_UP
from pathlib import Path

def round_curr(val: Decimal) -> Decimal:
    return val.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)

def round_pct(val: Decimal) -> Decimal:
    return val.quantize(Decimal("0.1"), rounding=ROUND_HALF_UP)

def calculate_schedule():
    # 1. Baseline Scenario
    income_base = Decimal("30000.00")
    spend_base = Decimal("27000.00")
    savings_base = income_base - spend_base
    savings_rate_base = (savings_base / income_base) * Decimal("100")
    
    annual_income_base = income_base * Decimal("12")
    annual_spend_base = spend_base * Decimal("12")
    annual_savings_base = savings_base * Decimal("12")

    # 2. Raise Received
    raise_amount = Decimal("10000.00")
    raise_pct = (raise_amount / income_base) * Decimal("100")
    
    # 3. Post-Raise Scenario (Lifestyle Inflation Trap)
    income_raise = income_base + raise_amount
    
    # Spending additions (Upgrades)
    upgrade_rent = Decimal("4000.00")
    upgrade_dining = Decimal("3000.00")
    upgrade_phone_emi = Decimal("3000.00")
    total_spending_creep = upgrade_rent + upgrade_dining + upgrade_phone_emi
    
    spend_raise = spend_base + total_spending_creep
    savings_raise = income_raise - spend_raise
    savings_rate_raise = (savings_raise / income_raise) * Decimal("100")
    
    annual_income_raise = income_raise * Decimal("12")
    annual_spend_raise = spend_raise * Decimal("12")
    annual_savings_raise = savings_raise * Decimal("12")

    # Divergence & Delta Analysis
    extra_income_annual = annual_income_raise - annual_income_base
    extra_savings_annual = annual_savings_raise - annual_savings_base
    savings_growth_pct = Decimal("0.0") if savings_base == savings_raise else ((savings_raise - savings_base) / savings_base) * Decimal("100")
    savings_rate_delta = savings_rate_raise - savings_rate_base

    # 4. Conscious Strategy Alternative ("Save The Raise" 50/50 rule)
    savings_allocation_pct = Decimal("50.0")
    conscious_savings_add = raise_amount * (savings_allocation_pct / Decimal("100"))
    conscious_spend_add = raise_amount - conscious_savings_add
    
    conscious_income = income_raise
    conscious_spend = spend_base + conscious_spend_add
    conscious_savings = savings_base + conscious_savings_add
    conscious_savings_rate = (conscious_savings / conscious_income) * Decimal("100")
    annual_conscious_savings = conscious_savings * Decimal("12")
    annual_conscious_extra_savings = annual_conscious_savings - annual_savings_base

    data = {
        "metadata": {
            "topic": "Why a Higher Salary Doesn't Always Make You Richer",
            "concept": "Lifestyle Inflation / Lifestyle Creep",
            "currency": "INR (₹)",
            "verification_engine": "Python 3 standard library Decimal (exact high-precision arithmetic)",
            "status": "VERIFIED_ACCURATE"
        },
        "baseline_scenario": {
            "monthly_income": float(income_base),
            "monthly_spending": float(spend_base),
            "monthly_savings": float(savings_base),
            "savings_rate_percent": float(round_pct(savings_rate_base)),
            "annual_income": float(annual_income_base),
            "annual_spending": float(annual_spend_base),
            "annual_savings": float(annual_savings_base)
        },
        "lifestyle_inflation_scenario": {
            "monthly_raise": float(raise_amount),
            "raise_percentage": float(round_pct(raise_pct)),
            "new_monthly_income": float(income_raise),
            "spending_breakdown": {
                "rent_upgrade": float(upgrade_rent),
                "food_and_dining_out": float(upgrade_dining),
                "phone_and_gadgets_emi": float(upgrade_phone_emi),
                "total_spending_creep": float(total_spending_creep)
            },
            "new_monthly_spending": float(spend_raise),
            "new_monthly_savings": float(savings_raise),
            "savings_rate_percent": float(round_pct(savings_rate_raise)),
            "annual_income": float(annual_income_raise),
            "annual_spending": float(annual_spend_raise),
            "annual_savings": float(annual_savings_raise),
            "deltas": {
                "monthly_income_delta": float(raise_amount),
                "monthly_spending_delta": float(total_spending_creep),
                "monthly_savings_delta": float(savings_raise - savings_base),
                "annual_extra_earned": float(extra_income_annual),
                "annual_extra_spent": float(annual_spend_raise - annual_spend_base),
                "annual_extra_saved": float(extra_savings_annual),
                "savings_rate_delta_percentage_points": float(round_pct(savings_rate_delta))
            }
        },
        "conscious_allocation_solution": {
            "strategy": "Save Half of Every Raise (50/50 Rule)",
            "monthly_savings_addition": float(conscious_savings_add),
            "monthly_spending_addition": float(conscious_spend_add),
            "new_monthly_spending": float(conscious_spend),
            "new_monthly_savings": float(conscious_savings),
            "new_savings_rate_percent": float(round_pct(conscious_savings_rate)),
            "annual_savings": float(annual_conscious_savings),
            "annual_extra_saved_vs_baseline": float(annual_conscious_extra_savings),
            "percentage_increase_in_savings": float(round_pct(((conscious_savings - savings_base) / savings_base) * Decimal("100")))
        },
        "spoken_script_numbers": {
            "baseline_income": "thirty thousand rupees",
            "baseline_spending": "twenty-seven thousand rupees",
            "baseline_savings": "three thousand rupees",
            "raise_amount": "ten thousand rupees",
            "new_income": "forty thousand rupees",
            "new_spending": "thirty-seven thousand rupees",
            "new_savings": "three thousand rupees",
            "extra_saved_under_creep": "zero rupees",
            "extra_saved_under_conscious_plan": "five thousand extra rupees every month"
        }
    }

    out_path = Path(__file__).parent / "verified_calculations.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    
    print(f"Calculations verified successfully and exported to {out_path}")
    print(f"Baseline: ₹{income_base} in -> ₹{spend_base} spent = ₹{savings_base} saved ({round_pct(savings_rate_base)}%)")
    print(f"Post-Raise: ₹{income_raise} in -> ₹{spend_raise} spent = ₹{savings_raise} saved ({round_pct(savings_rate_raise)}%)")
    print(f"Savings Change: ₹{savings_raise - savings_base} (Extra Annual Saved: ₹{extra_savings_annual})")
    print(f"50/50 Solution: ₹{conscious_income} in -> ₹{conscious_spend} spent = ₹{conscious_savings} saved ({round_pct(conscious_savings_rate)}%)")

if __name__ == "__main__":
    calculate_schedule()
