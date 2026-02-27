const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class TechnologySystem {
  getDefaultState() {
    return {
      level: 1.0,
      innovationRate: 0.05,
      adoptionRate: 0.8,
      researchInvestment: 100,
      technologicalGap: 0.2,
      innovationCapacity: 0.7,
      knowledgeBase: 0.6,
      technologyTree: {
        computing: 1.0,
        biotech: 0.8,
        energy: 0.9,
        materials: 0.7,
        transportation: 0.85
      },
      techDebt: 0.1,
      breakthroughProbability: 0.02
    };
  }

  async update(currentState, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update technology level with innovation and random factors
    const innovationBoost = newState.innovationRate * (1 + Random.range(-0.1, 0.2));
    const adoptionFactor = newState.adoptionRate * (1 + Random.range(-0.05, 0.1));
    
    // Calculate base growth
    const baseGrowth = innovationBoost * adoptionFactor;
    
    // Update technology level
    newState.level = Math.max(0.1, newState.level * (1 + baseGrowth));
    
    // Update innovation rate based on current level and investment
    const investmentEffect = Math.min(0.2, newState.researchInvestment / 1000);
    newState.innovationRate = MathUtils.clamp(
      newState.innovationRate * 0.9 + investmentEffect * 0.1 + Random.range(-0.01, 0.02),
      0.01, 0.5
    );
    
    // Update adoption rate based on infrastructure and education
    newState.adoptionRate = MathUtils.clamp(
      newState.adoptionRate * 0.95 + (0.7 + Random.range(-0.1, 0.1)) * 0.05,
      0.1, 1.0
    );
    
    // Update research investment based on economic factors and tech level
    const economicFactor = 0.1; // Placeholder - in a real system this would come from economy
    newState.researchInvestment = Math.max(
      50, 
      newState.researchInvestment * (1 + (newState.innovationRate - 0.05) * 0.5 + economicFactor * 0.3)
    );
    
    // Update technological gap (difference between current state and frontier)
    newState.technologicalGap = MathUtils.clamp(
      newState.technologicalGap * 0.9 + (1 - newState.level / 10) * 0.1,
      0.05, 1
    );
    
    // Update innovation capacity based on education and infrastructure
    newState.innovationCapacity = MathUtils.clamp(
      newState.innovationCapacity * 0.97 + 
      (newState.innovationRate * 0.3) + 
      (newState.researchInvestment / 1000 * 0.2) + 
      Random.range(-0.01, 0.02),
      0.1, 1
    );
    
    // Update technology tree with individual tech developments
    for (const [techName, techLevel] of Object.entries(newState.technologyTree)) {
      const randomInfluence = Random.range(-0.02, 0.05);
      const innovationEffect = newState.innovationRate * 0.3;
      
      newState.technologyTree[techName] = Math.max(
        0.1, 
        techLevel * (1 + innovationEffect + randomInfluence)
      );
    }
    
    // Update tech debt (accumulates with rapid innovation)
    newState.techDebt = MathUtils.clamp(
      newState.techDebt * 0.95 + newState.innovationRate * 0.05,
      0, 1
    );
    
    // Update breakthrough probability based on research investment and innovation rate
    newState.breakthroughProbability = MathUtils.clamp(
      newState.innovationRate * 0.1 + newState.researchInvestment / 5000,
      0.001, 0.1
    );
    
    // Update knowledge base based on innovation and research
    newState.knowledgeBase = MathUtils.clamp(
      newState.knowledgeBase * 0.9 + newState.innovationRate * 0.1 + newState.researchInvestment / 2000 * 0.1,
      0.1, 1.0
    );
    
    // Calculate changes for reporting
    const changes = {
      levelChange: newState.level - currentState.level,
      innovationRateChange: newState.innovationRate - currentState.innovationRate,
      adoptionRateChange: newState.adoptionRate - currentState.adoptionRate,
      researchInvestmentChange: newState.researchInvestment - currentState.researchInvestment,
      technologicalGapChange: newState.technologicalGap - currentState.technologicalGap,
      innovationCapacityChange: newState.innovationCapacity - currentState.innovationCapacity,
      knowledgeBaseChange: newState.knowledgeBase - currentState.knowledgeBase
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { TechnologySystem };