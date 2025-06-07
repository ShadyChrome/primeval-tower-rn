# Primeval Tower - Game Design (English)

## Game Overview

* **Game Title:** Primeval Tower
* **Core Mechanic:** Player fights with "Primes" in consecutive arena battles within the Tower to ascend levels.

## Primes

* **Acquisition:** Primes hatch from Eggs that can be purchased using Gems.
* **Rarity:** Common, Uncommon, Rare, Epic, Legendary
* **Element Affiliation:** Ignis, Vitae, Azur, Geo, Tempest, Aeris
* **Abilities:** Each Prime can have up to four Abilities. Abilities have levels that increase when duplicate Primes are hatched.
* **Uniqueness:** A player can only ever own one Prime with the same name.
* **Rarity Bonus:** Higher rarity Primes begin with higher base levels of their abilities.
* **Duplicate Mechanic:**

  * If a new Prime hatches that is already owned in the same or higher rarity, it is immediately consumed to grant Ability XP to the existing Prime.
  * If a Prime hatches in a higher rarity than the one currently owned, the existing Prime evolves to that new rarity, refunding previously invested Ability XP.

## Elements

* **Categorization:**

  * Lower Elements: Ignis, Vitae, Azur, Geo
  * Higher Elements: Tempest, Aeris
* **Effectiveness:**

  * Vitae is strong against Azur & Geo
  * Azur is strong against Ignis
  * Ignis is strong against Vitae
  * Geo is strong against Tempest
  * Tempest is strong against Azur & Aeris
  * Aeris is strong against Geo & Ignis

## Eggs & Hatching

* **Egg Rarity:** Eggs have their own rarity tier.
* **Unlock Conditions:** Higher-tier Eggs are unlocked after significant progress through Tower stages.
* **Chance for Higher-Rarity Hatch:**

  * 90% same rarity as Egg
  * 9% one tier higher
  * 0.9% two tiers higher
  * 0.09% three tiers higher
  * 0.009% four tiers higher
  * Legendary always caps at maximum
* **Enhancers Before Hatching:** Multiple can be applied:

  * Element Enhancer: Increases chance to hatch a Prime of a specified element by 1%
  * Rarity Amplifier: Decreases chance to hatch same rarity by 1% and increases +1 rarity chance by 1%
  * Rainbow Enhancer: Decreases chance to hatch same rarity by 1% and increases +1 rarity by 0.9%, +2 rarity by 0.09%, +3 rarity by 0.009%, +4 rarity by 0.0009% (Legendary remains cap)
* **Element Determination After Hatching:**

  1. Based on Rarity of hatched Prime:

     * Common: 80% Lower, 20% Higher
     * Uncommon: 70% Lower, 30% Higher
     * Rare: 60% Lower, 40% Higher
     * Epic: 50% Lower, 50% Higher
     * Legendary: 40% Lower, 60% Higher
  2. Uniform distribution among chosen elements.
  3. A Prime of that element is selected to hatch.

## Gems (Currency)

* Primary currency used to purchase Eggs.
* Acts as premium currency: can be bought with real money in the Shop.
* Earned through progression and special hardcore/veteran challenges.
* Awarded via Milestones (achievement-like account progression).
* Free-to-Play players receive immersive rewards for watching ads.

## Shop

* **Unified Interface:** No separation between in-game and real-money purchases.
* **Offer Design:**

  * Avoid clutter of meaningless offers.
  * Include low-cost offers (cent-range) to entice initial purchases.

## Combat Mechanics

* **Prime Statistics:**

  * Visible Stats: Attack (ATK), Defense (DEF), Speed (SPD), Stamina (STA), Courage (COU), Precision (PRC)
  * Hidden Stats: Health (HP), Critical Chance (CC), Critical Damage (CD), Threat (TH), Status Chance (SC), Status Damage (SD)
* **Battle Flow:**

  * Primes can perform general actions (e.g., Rest to recover STA) or use their Abilities.
  * Each action has parameters like power (magnitude of effects: damage and healing), STA cost, etc.
* **Status Effects:**

  * ATK & DEF directly amplify an action’s power.
  * SPD determines initiative and move order.
  * COU calculates Threat imposed by a Prime, which can trigger automatic enemy targeting or focus.

    * Threat is based on raw power (damage & healing), not elemental effectiveness.
    * Uncertainty whether Status Damage generates Threat (no backtracking!).
  * PRC influences Critical Chance, Status Chance, and Status Damage.

    * PRC can be specialized into one of these three categories.
  * CD is not amplified by Prime statistics; acquired through Runes or specific Abilities.
  * No Abilities grant buffs/debuffs requiring tracking of the originator.
* **Combat Style:**

  * Stamina-based combat, similar to Temtem.
  * Initiative-based speed system, similar to Summoners War / Ulala.
  * Damage formula analogous to Pokémon.

## Runes

* **Equipment:** Each Prime can equip up to 6 Runes.
* **Rune Rarity:** Same tiering as Eggs and Primes; increases base stats.
* **Attributes:** Each Rune provides a primary stat and a Synergy.
* **Synergy Effect:** Grants additional stat boost, depending on other equipped Runes sharing that Synergy.
* **Set Combinations:**

  * Standard: 2+2+2, 3+3, 4+2, 6+0
  * Exception: Some Runes only synergize with themselves, allowing combinations like 5+1


## UI

* **Look and Feel**
  * warm, relaxing, chilling ui 
  * pastel colored theme
  * modern, flat
* **Main UI structure**
  * bottom tab navigation
    * Hatching
    * Primes
    * Home
    * Bag
    * Shop
  * Header component always visible indepent from selected tab
    * show player name
    * show player level
    * show player experience bar
    * show player resources
