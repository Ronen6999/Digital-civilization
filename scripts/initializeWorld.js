const fs = require('fs-extra');
const path = require('path');
const { StateSaver } = require('../src/state/stateSaver');

async function initializeWorld() {
  console.log('Initializing digital civilization world...');
  
  const stateSaver = new StateSaver();
  
  // Create default world state
  const defaultWorldState = {
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
  
  // Create default machine state
  const defaultMachineState = {
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
  
  // Create default metadata
  const defaultMetadata = {
    projectName: "Digital Civilization Simulation",
    version: "1.0.0",
    creationDate: new Date().toISOString(),
    lastSimulationRun: null,
    totalCyclesRun: 0,
    dataFormatVersion: "1.0",
    authors: [
      "Digital Civilization Project"
    ],
    description: "Metadata for the digital civilization simulation project",
    config: {
      simulationSpeed: 1,
      saveFrequency: 10,
      logLevel: "info",
      enableEvents: true,
      maxEntropy: 1.0
    }
  };
  
  try {
    // Save the initial states
    await stateSaver.saveWorldState(defaultWorldState);
    await stateSaver.saveMachineState(defaultMachineState);
    await stateSaver.saveMetadata(defaultMetadata);
    
    console.log('World initialization complete!');
    console.log('- World state saved to data/world.json');
    console.log('- Machine state saved to data/machine.json');
    console.log('- Metadata saved to data/metadata.json');
    
    // Create directories for cycles if they don't exist
    const rawDir = path.join(__dirname, '../data/cycles/raw');
    const summaryDir = path.join(__dirname, '../data/cycles/summaries');
    const archiveDir = path.join(__dirname, '../data/archives');
    
    await fs.ensureDir(rawDir);
    await fs.ensureDir(summaryDir);
    await fs.ensureDir(archiveDir);
    
    console.log('Required directories created.');
    
  } catch (error) {
    console.error('Error initializing world:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  initializeWorld();
}

module.exports = { initializeWorld };