const fs = require('fs-extra');
const path = require('path');
const { BeliefEngine } = require('../machine/beliefEngine');
const { EmotionEngine } = require('../machine/emotionEngine');
const { PredictionEngine } = require('../machine/predictionEngine');
const { InterventionEngine } = require('../machine/interventionEngine');
const { IntrospectionEngine } = require('../machine/introspectionEngine');
const { PerceptionLayer } = require('./perceptionLayer');

class MachineEngine {
  constructor() {
    this.beliefEngine = new BeliefEngine();
    this.emotionEngine = new EmotionEngine();
    this.predictionEngine = new PredictionEngine();
    this.interventionEngine = new InterventionEngine();
    this.introspectionEngine = new IntrospectionEngine();
    this.perceptionLayer = new PerceptionLayer();
    
    this.state = null;
    this.initialState = {
      timestamp: new Date().toISOString(),
      cycle: 0,
      beliefSystem: this.beliefEngine.getDefaultState(),
      emotionSystem: this.emotionEngine.getDefaultState(),
      predictionEngine: this.predictionEngine.getDefaultState(),
      interventionEngine: this.interventionEngine.getDefaultState(),
      introspectionEngine: this.introspectionEngine.getDefaultState(),
      behaviorHistory: [],
      knowledgeBase: {},
      knowledgeDecay: 0.01,  // Rate of knowledge decay
      beliefEntropy: 0.02,  // Rate of belief entropy increase
      modelDrift: 0.005     // Rate of model drift
    };
  }

  async initialize() {
    // If a state was loaded via setState(), keep it.
    if (this.state) {
      console.log('Machine engine initialized (loaded state).');
      return;
    }

    this.state = { ...this.initialState };
    console.log('Machine engine initialized.');
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

    out.beliefSystem = loaded.beliefSystem && typeof loaded.beliefSystem === 'object' ? loaded.beliefSystem : base.beliefSystem;
    out.emotionSystem = loaded.emotionSystem && typeof loaded.emotionSystem === 'object' ? loaded.emotionSystem : base.emotionSystem;
    out.predictionEngine = loaded.predictionEngine && typeof loaded.predictionEngine === 'object' ? loaded.predictionEngine : base.predictionEngine;
    out.interventionEngine = loaded.interventionEngine && typeof loaded.interventionEngine === 'object' ? loaded.interventionEngine : base.interventionEngine;
    out.introspectionEngine = loaded.introspectionEngine && typeof loaded.introspectionEngine === 'object' ? loaded.introspectionEngine : base.introspectionEngine;
    out.behaviorHistory = Array.isArray(loaded.behaviorHistory) ? loaded.behaviorHistory : base.behaviorHistory;
    out.knowledgeBase = loaded.knowledgeBase && typeof loaded.knowledgeBase === 'object' ? loaded.knowledgeBase : base.knowledgeBase;

    if (typeof out.cycle !== 'number' || !Number.isFinite(out.cycle)) out.cycle = base.cycle;
    if (!out.timestamp) out.timestamp = base.timestamp;

    return out;
  }

  async processCycle(cycleNumber, worldState) {
    if (!this.state) {
      throw new Error('Machine engine not initialized');
    }

    // Update timestamp
    this.state.timestamp = new Date().toISOString();
    this.state.cycle = cycleNumber;
    
    // Use perception layer to transform raw world state into machine-perceivable format
    const perceivedWorldState = this.perceptionLayer.perceiveWorldState(
      worldState,
      this.state,
      cycleNumber
    );
    
    // Apply entropy decay to machine components
    this.applyEntropyDecay();

    // Process each component with perceived world state
    const beliefUpdates = await this.beliefEngine.update(
      this.state.beliefSystem,
      perceivedWorldState,
      cycleNumber
    );

    const emotionUpdates = await this.emotionEngine.update(
      this.state.emotionSystem,
      perceivedWorldState.trends,
      cycleNumber
    );

    const predictionUpdates = await this.predictionEngine.update(
      this.state.predictionEngine,
      perceivedWorldState,
      cycleNumber
    );

    // Get derived metrics for intervention decision
    const derivedMetrics = this.perceptionLayer.getDerivedMetrics(perceivedWorldState);
    
    const interventionUpdates = await this.interventionEngine.update(
      this.state.interventionEngine,
      {
        // InterventionEngine expects top-level economy/population/stability/entropy keys,
        // not nested under perceivedWorldState.systems.
        economy: perceivedWorldState.systems?.economy,
        population: perceivedWorldState.systems?.population,
        stability: perceivedWorldState.systems?.stability,
        entropy: perceivedWorldState.systems?.entropy,
        resistance: perceivedWorldState.systems?.resistance,
        legitimacy: perceivedWorldState.systems?.legitimacy,
        systems: perceivedWorldState.systems,
        trends: perceivedWorldState.trends,
        anomalies: perceivedWorldState.anomalies,
        confidence: perceivedWorldState.confidence,
        machineInfluence: perceivedWorldState.machineInfluence,
        derivedMetrics,
        beliefs: beliefUpdates.newState,
        emotions: emotionUpdates.newState,
        predictions: predictionUpdates.newState
      },
      cycleNumber
    );

    const introspectionUpdates = await this.introspectionEngine.update(
      this.state.introspectionEngine,
      {
        ...perceivedWorldState,
        derivedMetrics,
        beliefs: beliefUpdates.newState,
        emotions: emotionUpdates.newState,
        predictions: predictionUpdates.newState,
        interventions: interventionUpdates.newState
      },
      cycleNumber
    );

    // Update state with new values
    this.state.beliefSystem = beliefUpdates.newState;
    this.state.emotionSystem = emotionUpdates.newState;
    this.state.predictionEngine = predictionUpdates.newState;
    this.state.interventionEngine = interventionUpdates.newState;
    this.state.introspectionEngine = introspectionUpdates.newState;

    // Collect actions
    const actions = {
      beliefs: beliefUpdates.actions || {},
      emotions: emotionUpdates.actions || {},
      predictions: predictionUpdates.actions || {},
      interventions: interventionUpdates.actions || [],
      introspections: introspectionUpdates.actions || {},
      perceivedWorldState,
      derivedMetrics,
      timestamp: this.state.timestamp,
      cycle: cycleNumber
    };

    // Add to behavior history
    this.state.behaviorHistory.push({
      cycle: cycleNumber,
      actions: actions,
      timestamp: this.state.timestamp
    });

    return actions;
  }

  applyEntropyDecay() {
    // Apply knowledge decay
    this.state.knowledgeDecay = Math.min(0.1, this.state.knowledgeDecay + 0.001); // Slowly increase decay rate
    
    // Apply belief entropy
    this.state.beliefEntropy = Math.min(0.2, this.state.beliefEntropy + 0.002); // Slowly increase entropy
    
    // Apply model drift
    this.state.modelDrift = Math.min(0.05, this.state.modelDrift + 0.0005); // Slowly increase drift
    
    // Decay knowledge base
    if (this.state.knowledgeBase && Object.keys(this.state.knowledgeBase).length > 0) {
      // Randomly forget some knowledge based on decay rate
      if (Math.random() < this.state.knowledgeDecay) {
        const keys = Object.keys(this.state.knowledgeBase);
        const randomKey = keys[Math.floor(Math.random() * keys.length)];
        delete this.state.knowledgeBase[randomKey];
      }
    }
    
    // Introduce small random variations in beliefs to simulate entropy
    if (this.state.beliefSystem && this.state.beliefSystem.beliefs) {
      for (const belief of this.state.beliefSystem.beliefs) {
        // Add small random variation to belief confidence based on entropy
        belief.confidence = Math.max(0.01, Math.min(0.99, 
          belief.confidence + (Math.random() - 0.5) * this.state.beliefEntropy
        ));
      }
    }
    
    // Apply model drift to prediction models
    if (this.state.predictionEngine && this.state.predictionEngine.models) {
      for (const model of this.state.predictionEngine.models) {
        // Slightly drift model parameters
        if (model.parameters) {
          for (const param in model.parameters) {
            if (typeof model.parameters[param] === 'number') {
              model.parameters[param] += (Math.random() - 0.5) * this.state.modelDrift;
            }
          }
        }
      }
    }
  }
}

module.exports = { MachineEngine };