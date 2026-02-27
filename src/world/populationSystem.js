const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class PopulationSystem {
  getDefaultState() {
    return {
      count: 1000000,
      growthRate: 0.015,
      urbanization: 0.6,
      happiness: 0.7,
      educationLevel: 0.6,
      health: 0.8,
      diversity: 0.7
    };
  }

  async update(currentState, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Calculate base growth influenced by happiness and health
    const baseGrowth = currentState.growthRate;
    const happinessEffect = (currentState.happiness - 0.5) * 0.2;
    const healthEffect = (currentState.health - 0.5) * 0.1;
    const educationEffect = (currentState.educationLevel - 0.5) * 0.05;
    
    // Calculate net growth rate
    const netGrowth = baseGrowth + happinessEffect + healthEffect + educationEffect + 
                     Random.range(-0.005, 0.005);
    
    // Update population count
    newState.count = Math.max(1000, Math.round(currentState.count * (1 + netGrowth)));
    
    // Update growth rate with slight fluctuations
    newState.growthRate = MathUtils.clamp(
      baseGrowth * 0.99 + netGrowth * 0.01 + Random.range(-0.001, 0.001),
      -0.05, 0.05
    );
    
    // Update urbanization (tends to increase over time but with fluctuations)
    const urbanizationPressure = 0.001; // Gradual urbanization trend
    const happinessUrbanEffect = (currentState.happiness - 0.5) * 0.0005;
    newState.urbanization = MathUtils.clamp(
      currentState.urbanization + urbanizationPressure + happinessUrbanEffect + 
      Random.range(-0.002, 0.002),
      0.1,
      0.99
    );
    
    // Update happiness based on various factors
    const economyFactor = 0.1 * (Math.min(0.2, Math.max(-0.2, currentState.growthRate)) / 0.2);
    const healthFactor = (currentState.health - 0.5) * 0.2;
    const educationFactor = (currentState.educationLevel - 0.5) * 0.15;
    const urbanFactor = (currentState.urbanization - 0.5) * 0.05; // Mixed effect of urbanization
    
    newState.happiness = MathUtils.clamp(
      currentState.happiness * 0.8 + 
      (0.5 + economyFactor + healthFactor + educationFactor + urbanFactor) * 0.2 +
      Random.range(-0.05, 0.05),
      0,
      1
    );
    
    // Update education level (gradual improvement over time)
    const eduImprovement = 0.0005; // Base improvement
    const happinessEduEffect = (currentState.happiness - 0.5) * 0.0002;
    const resourceEduEffect = Math.min(0.001, (currentState.count / 1000000) * 0.0001);
    
    newState.educationLevel = MathUtils.clamp(
      currentState.educationLevel + eduImprovement + happinessEduEffect + resourceEduEffect +
      Random.range(-0.001, 0.001),
      0.1,
      1
    );
    
    // Update health (affected by resources, education, and happiness)
    const resourceHealthEffect = Math.min(0.1, (currentState.count / 1000000) * 0.02);
    const educationHealthEffect = (currentState.educationLevel - 0.5) * 0.1;
    const happinessHealthEffect = (currentState.happiness - 0.5) * 0.05;
    
    newState.health = MathUtils.clamp(
      currentState.health * 0.9 + 
      (0.5 + resourceHealthEffect + educationHealthEffect + happinessHealthEffect) * 0.1 +
      Random.range(-0.01, 0.01),
      0.1,
      1
    );
    
    // Update diversity (relatively stable with small fluctuations)
    newState.diversity = MathUtils.clamp(
      currentState.diversity * 0.99 + 0.5 * 0.01 + Random.range(-0.001, 0.001),
      0.1,
      1
    );

    // Calculate changes for reporting
    const changes = {
      count: newState.count - currentState.count,
      growthRate: newState.growthRate - currentState.growthRate,
      urbanization: newState.urbanization - currentState.urbanization,
      happiness: newState.happiness - currentState.happiness,
      educationLevel: newState.educationLevel - currentState.educationLevel,
      health: newState.health - currentState.health,
      diversity: newState.diversity - currentState.diversity
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { PopulationSystem };