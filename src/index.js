const fs = require('fs-extra');
const path = require('path');
const { SimulationRunner } = require('./core/simulationRunner');

async function main() {
  console.log('Starting Digital Civilization Simulation...');

  try {
    // Configure simulation to run just one cycle per execution
    const simulation = new SimulationRunner({ cyclesPerRun: 1, maxTotalCycles: 10000 });
    await simulation.initialize();
    await simulation.run();
  } catch (error) {
    console.error('Error running simulation:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };