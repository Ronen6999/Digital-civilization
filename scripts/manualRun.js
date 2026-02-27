const { SimulationRunner } = require('../src/core/simulationRunner');

async function manualRun() {
  console.log('Starting manual simulation run...');

  const options = {
    // Run ONE cycle per execution by default (pass a number to run more)
    cyclesPerRun: process.argv[2] ? parseInt(process.argv[2]) : 1,
    maxTotalCycles: 10000,
    cycleInterval: 100, // 100ms between cycles for manual runs
    saveFrequency: 5 // Save every 5 cycles
  };

  console.log(`Running simulation for ${options.cyclesPerRun} cycle(s)...`);

  try {
    const simulation = new SimulationRunner(options);
    await simulation.initialize();
    await simulation.run();

    console.log('Manual simulation run completed!');
  } catch (error) {
    console.error('Error during manual run:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  manualRun();
}

module.exports = { manualRun };