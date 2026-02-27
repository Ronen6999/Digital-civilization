const fs = require('fs-extra');
const path = require('path');

class StateLoader {
  constructor(options = {}) {
    this.options = {
      dataDir: options.dataDir || path.join(__dirname, '../../data'),
      ...options
    };
  }

  async loadWorldState() {
    const worldPath = path.join(this.options.dataDir, 'world.json');
    
    try {
      if (await fs.pathExists(worldPath)) {
        return await fs.readJson(worldPath);
      } else {
        // Return default state if file doesn't exist
        return this.getDefaultWorldState();
      }
    } catch (error) {
      console.warn(`Could not load world state: ${error.message}`);
      return this.getDefaultWorldState();
    }
  }

  async loadMachineState() {
    const machinePath = path.join(this.options.dataDir, 'machine.json');
    
    try {
      if (await fs.pathExists(machinePath)) {
        return await fs.readJson(machinePath);
      } else {
        // Return default state if file doesn't exist
        return this.getDefaultMachineState();
      }
    } catch (error) {
      console.warn(`Could not load machine state: ${error.message}`);
      return this.getDefaultMachineState();
    }
  }

  getDefaultWorldState() {
    return {
      timestamp: new Date().toISOString(),
      cycle: 0,
      systems: {
        economy: {
          growthRate: 0.02,
          resources: 1000,
          tradeVolume: 500,
          inflation: 0.01,
          employment: 0.95,
          productivity: 1.0,
          marketConfidence: 0.8
        },
        population: {
          count: 1000000,
          growthRate: 0.015,
          urbanization: 0.6,
          happiness: 0.7,
          educationLevel: 0.6,
          health: 0.8,
          diversity: 0.7
        },
        technology: {
          level: 1.0,
          innovationRate: 0.05,
          adoptionRate: 0.8,
          researchInvestment: 100
        },
        stability: {
          political: 0.8,
          social: 0.75,
          economic: 0.85,
          overall: 0.8
        },
        entropy: {
          current: 0.1,
          max: 1.0,
          rateOfIncrease: 0.001
        },
        resistance: {
          toChange: 0.3,
          toInnovation: 0.4,
          toTechnology: 0.25
        }
      },
      events: [],
      history: []
    };
  }

  getDefaultMachineState() {
    return {
      timestamp: new Date().toISOString(),
      cycle: 0,
      beliefSystem: {
        confidence: 0.8,
        certaintyThreshold: 0.7,
        beliefs: [],
        updateRate: 0.1,
        coherence: 0.9
      },
      emotionSystem: {
        currentEmotions: {
          curiosity: 0.8,
          caution: 0.3,
          optimism: 0.6,
          fear: 0.2
        },
        intensity: 0.5,
        regulation: 0.7
      },
      predictionEngine: {
        accuracy: 0.75,
        predictionHorizon: 10,
        confidence: 0.8,
        models: []
      },
      interventionEngine: {
        activeInterventions: [],
        interventionThreshold: 0.6,
        successRate: 0.0
      },
      introspectionEngine: {
        selfAwareness: 0.5,
        reflectionDepth: 0.6,
        learningRate: 0.1
      },
      behaviorHistory: [],
      knowledgeBase: {}
    };
  }
}

module.exports = { StateLoader };