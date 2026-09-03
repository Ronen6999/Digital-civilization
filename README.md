# Digital Civilization Simulation

A complex simulation of digital civilization with world dynamics, machine intelligence, and cyclical evolution.
## Simulation Statistics

<details>
<summary>📊 Current Stats (click to expand)</summary>

- **Current Cycle**: 201
- **Total Cycles Logged**: 202
- **World Timestamp**: 2026-06-06T04:40:45.049Z
- **Machine Timestamp**: 2026-06-06T04:40:45.072Z
- **Last Run**: Never
- **Total Runs**: 0

### Civilization Phase: **Collapse Risk**

</details>

<details>
<summary>🌍 World Systems Status (click to expand)</summary>

- **Economy Resources**: 1341.33
- **Population Count**: 1,000
- **Technology Level**: 518465263352524.25
- **Overall Stability**: 0.07
- **Entropy Level**: 1.00
- **Legitimacy Level**: 0.43

</details>

<details>
<summary>🤖 Machine Intelligence Status (click to expand)</summary>

- **Belief Confidence**: 0.39
- **Exploration Tendency**: 0.80
- **Prediction Accuracy**: 0.10
- **Self Awareness**: 0.63
- **Knowledge Decay**: 0.100

</details>

<details>
<summary>📝 Latest Cycle Summary (click to expand)</summary>

- **Latest Summary File**: `data/cycles/summaries/cycle-0201.md`

## Key Events
Economy resources changed significantly: 1.3548
- Economy tradeVolume changed significantly: 12.4711
- Technology levelChange changed significantly: 95451319639531.2500
- Technology researchInvestmentChange changed significantly: 238514082180.4277
- Machine intervention in technology: {"innovation":0.021494668676112102,"knowledgeBase":0.042989337352224204}

## AI Analysis
Civilization system (world):
- Growth is very small, and trade remains negative, keeping markets tense.
- People show mid‑level happiness, but stability is extremely low.
- Tech levels are huge, yet entropy is at its maximum, stressing the system.
- Compared to last cycle: trade improved slightly, but confidence slipped again.
- Resources rose a little, though resistance and legitimacy stay weak.
Civilization summary: World is strained but holding together with small gains.
Machine system:
- Machine status is: Activated (intervening).
- It begins knowledge‑checking actions to steady weak areas.
- Machine activation: employment is already at threshold (interventions can start now).
- Low budget limits its reach, so actions stay small and targeted.
Machine summary: Machine acts lightly due to tight limits.

---
*Generated at 2026-06-06T14:19:25.845Z*

</details>

## Overview

This project is a **math + probability driven simulation** of a digital civilization. Each cycle updates world-state variables (economy, population, technology, stability, entropy, resistance, legitimacy) using **bounded equations**, **weighted averages**, and **random noise**. The “machine system” is a rule-based controller that can intervene when thresholds are hit.

**Important:** No AI model is used to run the simulation itself. AI is only used to **summarize already-generated logs** into short markdown reports.

## How the simulation works

### State and cycles
- **State**: stored in `data/world.json` and `data/machine.json`
- **Cycle logs**: every cycle produces:
  - `data/cycles/raw/cycle-XXXX.json` (full raw snapshot + deltas)
  - `data/cycles/summaries/cycle-XXXX.md` (human-readable summary)
- **Cycle counter**: `data/evolution_count.json` tracks how many cycle summaries have been generated (next cycle index).
- **Default run behavior**: `node src/index.js` runs **1 cycle per execution**, continuing from the last cycle (up to 10,000 total).

### Core math patterns (used across systems)
- **Noise / uncertainty**: most updates add uniform noise via `Random.range(min, max)`
- **Clamping**: many variables are bounded with `MathUtils.clamp(x, min, max)` (common for \(0 \ldots 1\) signals)
- **Smoothing / inertia**: many updates blend old and new values, e.g. \(x_{t+1} = 0.9x_t + 0.1\Delta\)

### World systems (examples of the actual equations)
These are simplified descriptions of what the code does in `src/world/*.js`.

- **Economy** (`src/world/economySystem.js`)
  - Resources compound with growth:
    - \(resources_{t+1} = resources_t \cdot (1 + growthRate_{t+1})\)
  - Trade reacts to confidence and noise:
    - \(trade_{t+1} = trade_t \cdot (0.95 + 0.1\cdot confidence) + U(-50, 50)\)
  - Inflation, employment, confidence update via weighted factors + noise, then clamp to ranges.

- **Population** (`src/world/populationSystem.js`)
  - Net growth mixes baseline + effects of happiness/health/education + noise:
    - \(netGrowth = base + 0.2(happiness-0.5) + 0.1(health-0.5) + 0.05(education-0.5) + U(-0.005, 0.005)\)
  - Count updates multiplicatively:
    - \(count_{t+1} = \max(1000,\ \text{round}(count_t \cdot (1 + netGrowth)))\)
  - Happiness is a smoothed weighted blend of economy/health/education/urbanization + noise, clamped to \(0..1\).

- **Stability** (`src/world/stabilitySystem.js`)
  - Political/social/economic sub-stabilities update with inertia + weighted drivers + noise.
  - Overall stability is a weighted average:
    - \(overall = 0.3\cdot political + 0.25\cdot social + 0.25\cdot economic + 0.2\cdot cohesion\)

- **Technology** (`src/world/technologySystem.js`)
  - Tech level grows based on innovation and adoption:
    - \(level_{t+1} = level_t \cdot (1 + innovationBoost \cdot adoptionFactor)\)
  - Breakthrough probability is computed from innovation rate and research investment (bounded to a sensible range).

- **Entropy** (`src/world/entropySystem.js`)
  - Entropy is a net balance of “sources” minus “sinks” with random perturbations:
    - \(current_{t+1} = clamp(current_t + production - reduction,\ 0.01,\ max)\)
  - Higher entropy reduces predictability and increases disorder/chaos potential.

### Causal effects graph (system-to-system coupling)
After each system updates independently, the simulation applies a **causal graph** (`src/world/worldModelGraph.js`) that propagates changes using weighted relationships, for example:
- economy.resources → population.growthRate (weight 0.4)
- population.happiness → stability.social (weight 0.5)
- entropy.current → stability.overall (weight -0.4)

This creates feedback loops and cross-system effects without hard-coding every interaction into every system.

### Thresholds and “events”
The causal graph also defines thresholds that flag dangerous regimes (e.g., low stability or runaway entropy). These are recorded in logs as “threshold violations”.

## Machine system (rule-based, not an AI model)
The machine system (`src/machine/*`) is a **deterministic + stochastic controller** that maintains internal state (beliefs, emotions, predictions, introspection) and may produce **interventions** when thresholds are hit.

- **Perception**: transforms the world into a machine-perceived state with relevance/noise filters (`src/core/perceptionLayer.js`).
- **Interventions**: generated from simple rules + priorities + a budget constraint (`src/machine/interventionEngine.js`).
  - Interventions only occur if priority exceeds a threshold and the machine has enough budget.
- **Legitimacy constraints**: world legitimacy can scale down intervention strength (`src/world/legitimacySystem.js` + `src/core/simulationRunner.js`).

## Where AI is used (summaries only)
AI is **not used** to compute economy/population/stability/etc. The only AI call is in the logger to turn cycle logs into a short human-readable narrative:
- `src/logging/summaryGenerator.js` calls an external API to produce the markdown text under `## AI Analysis`.
  - If you remove/disable that call, the simulation still runs and logs raw data normally.

## Structure

- `data/` - Contains world state, machine state, and cycle logs
- `src/core/` - Core simulation engines and schedulers
- `src/world/` - World system implementations
- `src/machine/` - Machine intelligence components
- `src/events/` - Event handling systems
- `src/logging/` - Logging and summary generation
- `src/state/` - State loading/saving utilities
- `src/utils/` - Helper utilities

## Getting Started

1. Install dependencies: `npm install`
2. Initialize the world: `node scripts/initializeWorld.js`
3. Run the simulation: `node scripts/manualRun.js`
4. Monitor cycles in `data/cycles/`
<!-- START:PROGRESS -->
## Simulation Progress
[█░░░░░░░░░░░░░░░░░░░░░░░░░░░░░] 4% (379/10000)
**Current Cycle**: 379 | **Max Total Cycles**: 10000
<!-- END:PROGRESS -->
<!-- START:CYCLE_STATS -->
## Simulation Statistics

<details>
<summary>📊 Current Stats (click to expand)</summary>

- **Current Cycle**: 378
- **Total Cycles Logged**: 379
- **World Timestamp**: 2026-09-02T16:55:37.685Z
- **Machine Timestamp**: 2026-09-02T16:55:37.722Z
- **Last Run**: Never
- **Total Runs**: 0

### Civilization Phase: **Collapse Risk**

</details>

<details>
<summary>🌍 World Systems Status (click to expand)</summary>

- **Economy Resources**: 8342.24
- **Population Count**: 1,000
- **Technology Level**: 2.373731802009141e+27
- **Overall Stability**: 0.07
- **Entropy Level**: 1.00
- **Legitimacy Level**: 0.43

</details>

<details>
<summary>🤖 Machine Intelligence Status (click to expand)</summary>

- **Belief Confidence**: 0.37
- **Exploration Tendency**: 0.80
- **Prediction Accuracy**: 0.20
- **Self Awareness**: 0.70
- **Knowledge Decay**: 0.100

</details>

<details>
<summary>📝 Latest Cycle Summary (click to expand)</summary>

- **Latest Summary File**: `data/cycles/summaries/cycle-0378.md`

## Key Events
Economy resources changed significantly: 42.6207
- Economy tradeVolume changed significantly: 23.9415
- Technology levelChange changed significantly: 4.411004557448106e+26
- Technology researchInvestmentChange changed significantly: 317241205448691679232.0000
- Machine intervention in technology: {"innovation":0.021656052020630787,"knowledgeBase":0.043312104041261575}

## AI Analysis
AI analysis failed to generate. Reason: Request failed with status code 404

---
*Generated at 2026-09-03T05:01:58.489Z*

</details>
<!-- END:CYCLE_STATS -->


