# ANYMYN Storyboard — "The Invisible Cost: Inflation Simplified" (V5.1)

## Continuous Visual Environment: Ivory Grid Studio
All six shots exist within an unbroken, continuous light studio environment:
- **Studio Wall:** Warm ivory gradient (`#FAF7F0` spotlight core, `#F3EFE5` body).
- **Perspective Floor:** Compressed horizon at $Y = 860\text{px}$, exponential transversal floor lines (`rgba(117, 106, 91, 0.09)`), longitudinal lines fanning to bottom edge, and radial vignette edge dissolve.
- **Master Parallax:** Camera glides continuously from left to right across the 69.0s sequence, completely eliminating environment jump cuts.

---

## Visual Storyboard Grid (6 Shots / 12 Key Milestones)

| Shot # | Time / Frames | Primary Physical Prop | Typography / Value | Lighting & Spatial Dynamics |
| :--- | :--- | :--- | :--- | :--- |
| **01** | `0.0s – 8.0s`<br/>(0 – 240) | **3D $100 Federal Reserve Note**<br/>Guilloché security ribbon, metallic glint. | `THIS IS $100.`<br/>(92px Serif, `#241F19`) | Radial spotlight centered at 50% X. Contact shadow oval at note base. |
| **02** | `8.0s – 18.0s`<br/>(240 – 540) | **Wicker Grocery Basket (100% Fill)**<br/>Bread, milk, oats, apples, eggs. | `TODAY, IT BUYS THIS.`<br/>`$100 ➔ 100% OF THIS BASKET` | Camera drifts +12px right. Floor shadow softens. Basket settles on floor. |
| **03** | `18.0s – 35.0s`<br/>(540 – 1050) | **Polished Brass Balance Scale**<br/>Unchanged $100 note on left pan, expanding price mass on right. | `PRICES RISE. THE BILL DOESN'T.`<br/>`YEAR 0 ➔ 20 OF 20` | Central fulcrum anchored on horizon. Beam tilts 12° over 17 seconds. |
| **04** | `35.0s – 47.0s`<br/>(1050 – 1410) | **Exact Same Grocery Basket**<br/>Attached swinging parchment price tag with amber border. | `THE SAME BASKET NOW COSTS MORE.`<br/>`$100.00 ➔ $180.61` (114px) | Swinging tag damped harmonic motion ($\pm 6^\circ$). Price counters roll up. |
| **05** | `47.0s – 59.0s`<br/>(1410 – 1770) | **Exact Same Basket (55.4% Capacity)**<br/>44.6% of items visibly ghosted/transparent. | `YOUR $100 NOW BUYS ABOUT 55%.`<br/>`55.4% OF BASKET ($55.37 VALUE)` | Empty volume in basket communicates purchasing loss directly without UI cards. |
| **06** | `59.0s – 69.0s`<br/>(1770 – 2070) | **Sculptural Monetary Medallion**<br/>Concentric guilloché rings with balance scale emblem. | Phase 1: `THE NUMBER STAYED THE SAME.`<br/>Phase 2: `WHAT IT CAN BUY CHANGED.` | Elegant slow floating oscillation ($\pm 6\text{px}$). 24px mobile legal disclaimer. |

---

## Physical Continuity Principle
A critical architectural triumph of V5.1 is **Asset Reuse**:
1. Rather than drawing different baskets or introducing abstract graphs in Shot 4 and Shot 5, the exact same `GroceryBasketProp.tsx` component is re-used across Shots 2, 4, and 5.
2. In Shot 5, setting `fillPercent={55.4}` uses SVG dashed-stroke ghosting to show empty space where bread, cereal, and eggs used to sit, making inflation a physical, tangible reality.
