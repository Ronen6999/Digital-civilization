const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class EconomySystem {
  getDefaultState() {
    return {
      growthRate: 0.02,
      resources: 1000,
      tradeVolume: 500,
      inflation: 0.01,
      employment: 0.95,
      productivity: 1.0,
      marketConfidence: 0.8
    };
  }

  async update(currentState, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Simulate economic fluctuations
    const randomFactor = Random.range(-0.02, 0.02);  // -2% to +2% fluctuation
    
    // Update growth rate with some randomness but tend toward stability
    newState.growthRate = MathUtils.clamp(
      newState.growthRate + randomFactor * 0.1, 
      -0.1, 0.1
    );
    
    // Update resources based on growth
    newState.resources *= (1 + newState.growthRate);
    
    // Update trade volume influenced by growth and confidence
    const tradeFactor = 0.95 + (newState.marketConfidence * 0.1);
    newState.tradeVolume = newState.tradeVolume * tradeFactor + Random.range(-50, 50);
    
    // Update inflation based on growth and resources
    const inflationPressure = Math.max(0, newState.growthRate * 0.5);
    newState.inflation = MathUtils.clamp(
      newState.inflation * 0.9 + inflationPressure * 0.1 + Random.range(-0.005, 0.005),
      0,
      0.2
    );
    
    // Update employment based on growth and productivity
    const employmentChange = newState.growthRate * 0.1 + (newState.productivity - 1) * 0.05;
    newState.employment = MathUtils.clamp(
      newState.employment + employmentChange + Random.range(-0.01, 0.01),
      0.5,
      1.0
    );
    
    // Update productivity with gradual improvements
    newState.productivity = Math.max(
      0.8, 
      newState.productivity * (1 + Random.range(0.0001, 0.001))
    );
    
    // Update market confidence based on various factors
    const performanceScore = (
      (newState.growthRate + 0.1) * 0.3 +
      (newState.employment - 0.8) * 0.3 +
      (0.1 - newState.inflation) * 0.2 +
      (newState.productivity - 1) * 0.2
    );
    newState.marketConfidence = MathUtils.clamp(
      newState.marketConfidence * 0.8 + performanceScore * 0.2 + Random.range(-0.05, 0.05),
      0,
      1
    );

    // Calculate changes for reporting
    const changes = {
      growthRate: newState.growthRate - currentState.growthRate,
      resources: newState.resources - currentState.resources,
      tradeVolume: newState.tradeVolume - currentState.tradeVolume,
      inflation: newState.inflation - currentState.inflation,
      employment: newState.employment - currentState.employment,
      productivity: newState.productivity - currentState.productivity,
      marketConfidence: newState.marketConfidence - currentState.marketConfidence
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { EconomySystem };