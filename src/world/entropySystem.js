const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class EntropySystem {
  getDefaultState() {
    return {
      current: 0.1,
      max: 1.0,
      rateOfIncrease: 0.001,
      disorderLevel: 0.2,
      chaosPotential: 0.15,
      complexity: 0.3,
      predictability: 0.8,
      orderMaintenance: 0.7,
      entropySources: {
        population: 0.05,
        technology: 0.08,
        economy: 0.06,
        politics: 0.07,
        environment: 0.04
      },
      entropySinks: {
        institutions: 0.1,
        technology: 0.05,
        governance: 0.08,
        culture: 0.06
      },
      phaseTransitionThreshold: 0.8
    };
  }

  async update(currentState, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Calculate entropy production from various sources
    let entropyProduction = 0;
    for (const [source, contribution] of Object.entries(newState.entropySources)) {
      entropyProduction += contribution * (1 + Random.range(-0.1, 0.1));
    }
    
    // Calculate entropy reduction from sinks (order-maintaining forces)
    let entropyReduction = 0;
    for (const [sink, reduction] of Object.entries(newState.entropySinks)) {
      entropyReduction += reduction * (1 + Random.range(-0.05, 0.05));
    }
    
    // Net entropy change
    const netEntropyChange = entropyProduction - entropyReduction;
    
    // Update current entropy with bounds checking
    newState.current = MathUtils.clamp(
      currentState.current + netEntropyChange,
      0.01, // Minimum entropy
      newState.max
    );
    
    // Update rate of increase based on current entropy level
    // Higher entropy increases the rate of increase (positive feedback)
    newState.rateOfIncrease = MathUtils.clamp(
      currentState.rateOfIncrease * (1 + currentState.current * 0.1) + Random.range(-0.0001, 0.0002),
      0.0005, // Minimum rate
      0.01    // Maximum rate
    );
    
    // Update disorder level (related to entropy)
    newState.disorderLevel = MathUtils.clamp(
      currentState.disorderLevel * 0.95 + currentState.current * 0.05 + Random.range(-0.01, 0.02),
      0.05, 0.95
    );
    
    // Update chaos potential based on disorder and entropy
    newState.chaosPotential = MathUtils.clamp(
      currentState.chaosPotential * 0.9 + currentState.disorderLevel * 0.1 + currentState.current * 0.05,
      0.05, 0.95
    );
    
    // Update complexity (higher entropy generally increases complexity)
    newState.complexity = MathUtils.clamp(
      currentState.complexity * 0.97 + currentState.current * 0.03 + Random.range(-0.01, 0.015),
      0.1, 0.95
    );
    
    // Update predictability (inverse relationship with entropy)
    newState.predictability = MathUtils.clamp(
      currentState.predictability * 0.98 - currentState.current * 0.02 + Random.range(-0.01, 0.01),
      0.05, 0.95
    );
    
    // Update order maintenance (effort to reduce entropy)
    newState.orderMaintenance = MathUtils.clamp(
      currentState.orderMaintenance * 0.98 + 
      (1 - currentState.current) * 0.02 + 
      Random.range(-0.01, 0.02),
      0.1, 0.95
    );
    
    // Update entropy sources based on system interactions
    newState.entropySources.population = MathUtils.clamp(
      currentState.entropySources.population * 0.98 + Random.range(-0.005, 0.01),
      0.01, 0.2
    );
    
    newState.entropySources.technology = MathUtils.clamp(
      currentState.entropySources.technology * 0.98 + 
      (currentState.technology * 0.02 || 0) + // From technology system if available
      Random.range(-0.005, 0.015),
      0.01, 0.25
    );
    
    newState.entropySources.economy = MathUtils.clamp(
      currentState.entropySources.economy * 0.98 + Random.range(-0.005, 0.01),
      0.01, 0.2
    );
    
    newState.entropySources.politics = MathUtils.clamp(
      currentState.entropySources.politics * 0.98 + 
      (1 - currentState.political || 0) * 0.03 + // From stability system if available
      Random.range(-0.005, 0.01),
      0.01, 0.2
    );
    
    // Update entropy sinks based on institutional strength
    newState.entropySinks.institutions = MathUtils.clamp(
      currentState.entropySinks.institutions * 0.98 + 
      (currentState.institutionalStrength || 0.5) * 0.02 + // From stability system if available
      Random.range(-0.005, 0.01),
      0.01, 0.2
    );
    
    newState.entropySinks.governance = MathUtils.clamp(
      currentState.entropySinks.governance * 0.98 + 
      (currentState.institutionalStrength || 0.5) * 0.015 + // From stability system if available
      Random.range(-0.005, 0.01),
      0.01, 0.2
    );
    
    // Check for phase transition if entropy approaches threshold
    if (currentState.current > currentState.phaseTransitionThreshold) {
      // Increase chaos and disorder temporarily
      newState.disorderLevel = Math.min(0.95, newState.disorderLevel * 1.1);
      newState.chaosPotential = Math.min(0.95, newState.chaosPotential * 1.05);
    }
    
    // Calculate changes for reporting
    const changes = {
      entropyChange: newState.current - currentState.current,
      rateOfIncreaseChange: newState.rateOfIncrease - currentState.rateOfIncrease,
      disorderChange: newState.disorderLevel - currentState.disorderLevel,
      complexityChange: newState.complexity - currentState.complexity,
      predictabilityChange: newState.predictability - currentState.predictability,
      orderMaintenanceChange: newState.orderMaintenance - currentState.orderMaintenance
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { EntropySystem };