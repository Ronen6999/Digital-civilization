const fs = require('fs-extra');
const path = require('path');
const { WorldEngine } = require('./worldEngine');
const { MachineEngine } = require('./machineEngine');
const { Scheduler } = require('./scheduler');
const { CycleLogger } = require('../logging/cycleLogger');
const { ReadmeUpdater } = require('../logging/readmeUpdater');
const { StateLoader } = require('../state/stateLoader');
const { StateSaver } = require('../state/stateSaver');

class SimulationRunner {
  constructor(options = {}) {
    this.options = {
      // Global hard cap for cycle index
      maxTotalCycles: options.maxTotalCycles ?? 10000,
      // Cycles to run per execution/session
      cyclesPerRun: options.cyclesPerRun ?? (options.maxCycles ?? 1),
      cycleInterval: options.cycleInterval || 1000, // milliseconds
      saveFrequency: options.saveFrequency || 10,
      ...options
    };
    
    this.worldEngine = new WorldEngine();
    this.machineEngine = new MachineEngine();
    this.scheduler = new Scheduler();
    this.logger = new CycleLogger();
    this.readmeUpdater = new ReadmeUpdater();
    this.stateLoader = new StateLoader();
    this.stateSaver = new StateSaver();
    
    this.currentCycle = 0;
    this.isRunning = false;
    this.intervalId = null;
    this.runStartCycle = 0;
    this.runTargetCycle = 0;
  }

  async initialize() {
    console.log('Initializing simulation...');
    
    // Load initial state
    await this.loadState();
    
    // Initialize engines
    await this.worldEngine.initialize();
    await this.machineEngine.initialize();
    
    console.log('Simulation initialized successfully.');
  }

  async loadState() {
    try {
      const worldState = await this.stateLoader.loadWorldState();
      const machineState = await this.stateLoader.loadMachineState();
      
      this.worldEngine.setState(worldState);
      this.machineEngine.setState(machineState);
      
      // Determine next cycle index. Prefer logged history, but also use evolution_count.json
      // so that cycle numbering continues even if cycle files are cleaned up.
      const lastLoggedCycle = await this.getLastLoggedCycleNumber();
      const evolutionCount = await this.getEvolutionCount(); // count = number of cycles generated so far

      const candidates = [
        Math.max(worldState.cycle || 0, machineState.cycle || 0),
        evolutionCount, // next cycle index (0-based)
        lastLoggedCycle !== null ? lastLoggedCycle + 1 : 0
      ];

      this.currentCycle = Math.min(Math.max(...candidates), this.options.maxTotalCycles);
    } catch (error) {
      console.warn('Could not load existing state, starting fresh:', error.message);
      // Initialize with defaults
      this.currentCycle = 0;
    }
  }

  async getEvolutionCount() {
    try {
      const evoPath = path.join(__dirname, '../../data/evolution_count.json');
      if (!(await fs.pathExists(evoPath))) return 0;
      const evo = await fs.readJson(evoPath);
      const count = typeof evo?.count === 'number' ? evo.count : 0;
      return Number.isFinite(count) && count >= 0 ? count : 0;
    } catch {
      return 0;
    }
  }

  async getLastLoggedCycleNumber() {
    try {
      const rawDir = path.join(__dirname, '../../data/cycles/raw');
      let max = null;

      if (await fs.pathExists(rawDir)) {
        const files = await fs.readdir(rawDir);

        for (const f of files) {
          const m = /^cycle-(\d{4})\.json$/.exec(f);
          if (!m) continue;
          const n = Number(m[1]);
          if (!Number.isFinite(n)) continue;
          if (max === null || n > max) max = n;
        }
      }

      // Also use evolution_count.json as a backup cycle counter.
      // evolutionCount increments once per generated summary; when count=1, last cycle was 0.
      try {
        const evoPath = path.join(__dirname, '../../data/evolution_count.json');
        if (await fs.pathExists(evoPath)) {
          const evo = await fs.readJson(evoPath);
          const count = typeof evo?.count === 'number' ? evo.count : null;
          if (count !== null && Number.isFinite(count) && count > 0) {
            const evoLast = count - 1;
            if (max === null || evoLast > max) max = evoLast;
          }
        }
      } catch {
        // ignore
      }

      return max;
    } catch {
      return null;
    }
  }

  async saveState() {
    try {
      // Persist the "next cycle index" so the next run continues properly.
      const worldState = { ...this.worldEngine.getState(), cycle: this.currentCycle };
      const machineState = { ...this.machineEngine.getState(), cycle: this.currentCycle };
      
      await this.stateSaver.saveWorldState(worldState);
      await this.stateSaver.saveMachineState(machineState);
      
      console.log(`State saved at cycle ${this.currentCycle}`);
    } catch (error) {
      console.error('Error saving state:', error);
    }
  }

  async runCycle() {
    console.log(`Running cycle ${this.currentCycle}...`);
    
    // Process world changes
    const worldState = this.worldEngine.getState();
    const worldChanges = await this.worldEngine.processCycle(this.currentCycle);
    
    // Process machine intelligence
    const machineActions = await this.machineEngine.processCycle(
      this.currentCycle, 
      worldState
    );
    
    // Apply machine interventions to world
    if (machineActions.interventions && machineActions.interventions.length > 0) {
      // Check legitimacy constraints before applying interventions
      const filteredInterventions = this.filterInterventionsByLegitimacy(
        machineActions.interventions, 
        this.worldEngine.getState().systems.legitimacy
      );
      
      if (filteredInterventions.length > 0) {
        await this.worldEngine.applyInterventions(filteredInterventions);
      }
    }
    
    // Log the cycle
    await this.logger.logCycle(this.currentCycle, {
      world: this.worldEngine.getState(),
      machine: this.machineEngine.getState(),
      changes: worldChanges,
      actions: machineActions,
      legitimacy: this.worldEngine.getState().systems.legitimacy
    });
    
    // Update cycle counter
    this.currentCycle++;

    // Update README with latest stats/summary (after advancing counter)
    await this.readmeUpdater.updateReadme();
    await this.readmeUpdater.updateSimulationProgress(this.currentCycle, this.options.maxTotalCycles);
    
    // Save state periodically
    if (this.currentCycle % this.options.saveFrequency === 0) {
      await this.saveState();
    }
    
    console.log(`Completed cycle ${this.currentCycle - 1}`);
  }

  filterInterventionsByLegitimacy(interventions, legitimacyState) {
    // Apply legitimacy constraints to interventions
    if (!legitimacyState) return interventions;
    
    const filteredInterventions = [];
    
    for (const intervention of interventions) {
      // Scale intervention impact based on legitimacy
      const scaledIntervention = { ...intervention };
      
      // If legitimacy is low, scale down intervention impact
      if (legitimacyState.overallLegitimacy < legitimacyState.machineInfluenceCap) {
        if (scaledIntervention.changes) {
          for (const [key, value] of Object.entries(scaledIntervention.changes)) {
            if (typeof value === 'number') {
              // Scale the change based on legitimacy
              scaledIntervention.changes[key] = value * legitimacyState.overallLegitimacy;
            }
          }
        }
      }
      
      // Only add intervention if it still has meaningful impact
      if (this.hasMeaningfulImpact(scaledIntervention)) {
        filteredInterventions.push(scaledIntervention);
      }
    }
    
    return filteredInterventions;
  }

  hasMeaningfulImpact(intervention) {
    // Check if an intervention still has meaningful impact after scaling
    if (!intervention.changes) return false;
    
    for (const [key, value] of Object.entries(intervention.changes)) {
      if (typeof value === 'number' && Math.abs(value) > 0.001) { // Threshold for meaningful impact
        return true;
      }
    }
    
    return false;
  }

  async run() {
    if (this.isRunning) {
      console.log('Simulation is already running.');
      return;
    }
    
    this.isRunning = true;
    this.runStartCycle = this.currentCycle;
    this.runTargetCycle = Math.min(
      this.currentCycle + (this.options.cyclesPerRun || 0),
      this.options.maxTotalCycles
    );
    console.log(`Starting simulation for ${this.options.cyclesPerRun} cycle(s)...`);
    
    try {
      while (this.currentCycle < this.runTargetCycle && this.isRunning) {
        await this.runCycle();
        
        // Small delay to prevent blocking
        await new Promise(resolve => setTimeout(resolve, 10));
      }
    } catch (error) {
      console.error('Error during simulation:', error);
    } finally {
      await this.stop();
    }
  }

  async stop() {
    this.isRunning = false;
    console.log('Simulation stopped.');
    
    // Save final state
    await this.saveState();
  }

  async togglePause() {
    this.isRunning = !this.isRunning;
    console.log(this.isRunning ? 'Simulation resumed.' : 'Simulation paused.');
  }
}

module.exports = { SimulationRunner };