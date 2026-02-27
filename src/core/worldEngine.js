const fs = require('fs-extra');
const path = require('path');
const { EconomySystem } = require('../world/economySystem');
const { PopulationSystem } = require('../world/populationSystem');
const { TechnologySystem } = require('../world/technologySystem');
const { StabilitySystem } = require('../world/stabilitySystem');
const { EntropySystem } = require('../world/entropySystem');
const { ResistanceSystem } = require('../world/resistanceSystem');
const { LegitimacySystem } = require('../world/legitimacySystem');
const { WorldModelGraph } = require('../world/worldModelGraph');

class WorldEngine {
  constructor() {
    this.economySystem = new EconomySystem();
    this.populationSystem = new PopulationSystem();
    this.technologySystem = new TechnologySystem();
    this.stabilitySystem = new StabilitySystem();
    this.entropySystem = new EntropySystem();
    this.resistanceSystem = new ResistanceSystem();
    this.legitimacySystem = new LegitimacySystem();
    this.worldModelGraph = new WorldModelGraph();
    
    this.state = null;
    this.initialState = {
      timestamp: new Date().toISOString(),
      cycle: 0,
      systems: {
        economy: this.economySystem.getDefaultState(),
        population: this.populationSystem.getDefaultState(),
        technology: this.technologySystem.getDefaultState(),
        stability: this.stabilitySystem.getDefaultState(),
        entropy: this.entropySystem.getDefaultState(),
        resistance: this.resistanceSystem.getDefaultState(),
        legitimacy: this.legitimacySystem.getDefaultState()
      },
      events: [],
      history: [],
      trends: {}
    };
  }

  async initialize() {
    // If a state was loaded via setState(), keep it.
    if (this.state) {
      console.log('World engine initialized (loaded state).');
      return;
    }

    this.state = { ...this.initialState };
    console.log('World engine initialized.');
  }

  setState(newState) {
    this.state = this.normalizeLoadedState(newState);
  }

  getState() {
    return { ...this.state };
  }

  normalizeLoadedState(loaded) {
    const base = JSON.parse(JSON.stringify(this.initialState));
    if (!loaded || typeof loaded !== 'object') return base;

    const out = { ...base, ...loaded };

    const loadedSystems = loaded.systems && typeof loaded.systems === 'object' ? loaded.systems : {};
    out.systems = { ...base.systems, ...loadedSystems };

    for (const key of Object.keys(base.systems)) {
      const sys = out.systems[key];
      if (!sys || typeof sys !== 'object') out.systems[key] = { ...base.systems[key] };
    }

    out.events = Array.isArray(loaded.events) ? loaded.events : base.events;
    out.history = Array.isArray(loaded.history) ? loaded.history : base.history;
    out.trends = loaded.trends && typeof loaded.trends === 'object' ? loaded.trends : base.trends;

    if (typeof out.cycle !== 'number' || !Number.isFinite(out.cycle)) out.cycle = base.cycle;
    if (!out.timestamp) out.timestamp = base.timestamp;

    return out;
  }

  async processCycle(cycleNumber, machineActions = {}) {
    if (!this.state) {
      throw new Error('World engine not initialized');
    }

    // Update timestamp
    this.state.timestamp = new Date().toISOString();
    this.state.cycle = cycleNumber;

    // Create a copy of the current state to track changes
    const prevState = JSON.parse(JSON.stringify(this.state));

    // Process each system
    const economyChanges = await this.economySystem.update(
      this.state.systems.economy, 
      cycleNumber
    );
    
    const populationChanges = await this.populationSystem.update(
      this.state.systems.population, 
      cycleNumber
    );
    
    const technologyChanges = await this.technologySystem.update(
      this.state.systems.technology, 
      cycleNumber
    );
    
    const stabilityChanges = await this.stabilitySystem.update(
      this.state.systems.stability, 
      cycleNumber
    );
    
    const entropyChanges = await this.entropySystem.update(
      this.state.systems.entropy, 
      cycleNumber
    );
    
    const resistanceChanges = await this.resistanceSystem.update(
      this.state.systems.resistance, 
      cycleNumber
    );
    
    // Update state with new values
    this.state.systems.economy = economyChanges.newState;
    this.state.systems.population = populationChanges.newState;
    this.state.systems.technology = technologyChanges.newState;
    this.state.systems.stability = stabilityChanges.newState;
    this.state.systems.entropy = entropyChanges.newState;
    this.state.systems.resistance = resistanceChanges.newState;
    
    // Process legitimacy system after other systems
    const legitimacyChanges = await this.legitimacySystem.update(
      this.state.systems.legitimacy,
      machineActions,
      {
        economy: economyChanges.newState,
        population: populationChanges.newState,
        technology: technologyChanges.newState,
        stability: stabilityChanges.newState,
        entropy: entropyChanges.newState,
        resistance: resistanceChanges.newState
      },
      cycleNumber
    );
    
    this.state.systems.legitimacy = legitimacyChanges.newState;

    // Apply causal effects through the world model graph
    const worldStateCopy = JSON.parse(JSON.stringify(this.state));
    const { newState: updatedState, effectsApplied } = this.worldModelGraph.applyCausalEffects(
      worldStateCopy,
      this.collectChangeLog(economyChanges, populationChanges, technologyChanges, 
                           stabilityChanges, entropyChanges, resistanceChanges, legitimacyChanges)
    );
    
    // Apply the causally-propagated changes back to our state
    this.state.systems = updatedState.systems;
    
    // Check for threshold violations
    const violations = this.worldModelGraph.checkThresholdViolations(this.state.systems);
    if (violations.length > 0) {
      this.handleThresholdViolations(violations);
    }

    // Collect all changes
    const changes = {
      economy: economyChanges.changes,
      population: populationChanges.changes,
      technology: technologyChanges.changes,
      stability: stabilityChanges.changes,
      entropy: entropyChanges.changes,
      resistance: resistanceChanges.changes,
      legitimacy: legitimacyChanges.changes,
      timestamp: this.state.timestamp,
      cycle: cycleNumber,
      causalEffects: effectsApplied,
      thresholdViolations: violations
    };

    // Update trends
    this.updateTrends(changes);
    
    // Add to history
    this.state.history.push({
      cycle: cycleNumber,
      changes: changes,
      timestamp: this.state.timestamp
    });

    return changes;
  }

  collectChangeLog(economyChanges, populationChanges, technologyChanges, 
                   stabilityChanges, entropyChanges, resistanceChanges, legitimacyChanges) {
    const changeLog = {};
    
    // Collect economy changes
    for (const [key, value] of Object.entries(economyChanges.changes)) {
      changeLog[`economy.${key}`] = value;
    }
    
    // Collect population changes
    for (const [key, value] of Object.entries(populationChanges.changes)) {
      changeLog[`population.${key}`] = value;
    }
    
    // Collect technology changes
    for (const [key, value] of Object.entries(technologyChanges.changes)) {
      changeLog[`technology.${key}`] = value;
    }
    
    // Collect stability changes
    for (const [key, value] of Object.entries(stabilityChanges.changes)) {
      changeLog[`stability.${key}`] = value;
    }
    
    // Collect entropy changes
    for (const [key, value] of Object.entries(entropyChanges.changes)) {
      changeLog[`entropy.${key}`] = value;
    }
    
    // Collect resistance changes
    for (const [key, value] of Object.entries(resistanceChanges.changes)) {
      changeLog[`resistance.${key}`] = value;
    }
    
    // Collect legitimacy changes
    for (const [key, value] of Object.entries(legitimacyChanges.changes)) {
      changeLog[`legitimacy.${key}`] = value;
    }
    
    return changeLog;
  }

  handleThresholdViolations(violations) {
    for (const violation of violations) {
      switch (violation.trigger) {
        case 'population_collapse':
          console.warn(`THRESHOLD VIOLATION: Population collapse imminent! ${violation.path} = ${violation.value}`);
          // Trigger emergency protocols
          break;
        case 'stability_collapse':
          console.warn(`THRESHOLD VIOLATION: Stability collapse! ${violation.path} = ${violation.value}`);
          // Trigger stability measures
          break;
        case 'entropy_runaway':
          console.warn(`THRESHOLD VIOLATION: Entropy runaway! ${violation.path} = ${violation.value}`);
          // Trigger entropy controls
          break;
        case 'economic_depression':
          console.warn(`THRESHOLD VIOLATION: Economic depression! ${violation.path} = ${violation.value}`);
          // Trigger economic measures
          break;
        case 'tech_singularity':
          console.warn(`THRESHOLD VIOLATION: Technology singularity! ${violation.path} = ${violation.value}`);
          // Trigger singularity protocols
          break;
        default:
          console.warn(`THRESHOLD VIOLATION: ${violation.trigger} - ${violation.path} = ${violation.value}`);
      }
    }
  }

  updateTrends(changes) {
    // Update trend tracking for each system
    for (const [systemName, systemChanges] of Object.entries(changes)) {
      if (systemName === 'timestamp' || systemName === 'cycle' || 
          systemName === 'causalEffects' || systemName === 'thresholdViolations') {
        continue; // Skip non-system entries
      }
      
      if (!this.state.trends[systemName]) {
        this.state.trends[systemName] = {};
      }
      
      for (const [paramName, changeValue] of Object.entries(systemChanges)) {
        if (typeof changeValue === 'number') {
          if (!this.state.trends[systemName][paramName]) {
            this.state.trends[systemName][paramName] = [];
          }
          
          // Add the change to the trend history
          this.state.trends[systemName][paramName].push({
            cycle: this.state.cycle,
            value: changeValue,
            timestamp: this.state.timestamp
          });
          
          // Keep only the last 20 entries
          if (this.state.trends[systemName][paramName].length > 20) {
            this.state.trends[systemName][paramName].shift();
          }
        }
      }
    }
  }

  async applyInterventions(interventions) {
    for (const intervention of interventions) {
      switch (intervention.targetSystem) {
        case 'economy':
          this.state.systems.economy = {
            ...this.state.systems.economy,
            ...intervention.changes
          };
          break;
        case 'population':
          this.state.systems.population = {
            ...this.state.systems.population,
            ...intervention.changes
          };
          break;
        case 'technology':
          this.state.systems.technology = {
            ...this.state.systems.technology,
            ...intervention.changes
          };
          break;
        case 'stability':
          this.state.systems.stability = {
            ...this.state.systems.stability,
            ...intervention.changes
          };
          break;
        case 'entropy':
          this.state.systems.entropy = {
            ...this.state.systems.entropy,
            ...intervention.changes
          };
          break;
        case 'resistance':
          this.state.systems.resistance = {
            ...this.state.systems.resistance,
            ...intervention.changes
          };
          break;
        default:
          console.warn(`Unknown system for intervention: ${intervention.targetSystem}`);
      }
    }
  }
}

module.exports = { WorldEngine };