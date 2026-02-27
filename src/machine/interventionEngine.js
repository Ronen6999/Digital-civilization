const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class InterventionEngine {
  constructor() {
    this.interventionStrategies = new Map();
    this.initiativeThreshold = 0.6;
  }

  getDefaultState() {
    return {
      activeInterventions: [],
      interventionThreshold: 0.6,
      successRate: 0.0,
      initiativeLevel: 0.5,
      interventionBudget: 100, // Resource units available for interventions
      recentInterventions: [],
      interventionCooldowns: {}
    };
  }

  async update(currentState, inputData, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update cooldowns
    const updatedCooldowns = { ...currentState.interventionCooldowns };
    for (const [key, cooldown] of Object.entries(updatedCooldowns)) {
      updatedCooldowns[key]--;
      if (updatedCooldowns[key] <= 0) {
        delete updatedCooldowns[key];
      }
    }
    
    newState.interventionCooldowns = updatedCooldowns;
    
    // Evaluate potential interventions based on world changes and other inputs
    const potentialInterventions = this.evaluateInterventions(
      inputData, 
      cycleNumber,
      newState
    );
    
    // Filter interventions based on threshold and cooldown
    const viableInterventions = potentialInterventions.filter(intervention => {
      return intervention.priority > newState.interventionThreshold && 
             !newState.interventionCooldowns[intervention.id];
    });
    
    // Select interventions based on available budget and priority
    const selectedInterventions = this.selectInterventions(
      viableInterventions, 
      newState.interventionBudget
    );
    
    // Apply selected interventions
    newState.activeInterventions = [...selectedInterventions];
    
    // Update budget based on interventions applied
    const totalCost = selectedInterventions.reduce((sum, intervention) => sum + (intervention.cost || 10), 0);
    newState.interventionBudget = Math.max(0, newState.interventionBudget - totalCost);
    
    // Regenerate budget over time
    newState.interventionBudget = Math.min(
      100, // Max budget
      newState.interventionBudget + 5 // Regeneration rate
    );
    
    // Update initiative level based on interventions taken
    newState.initiativeLevel = MathUtils.clamp(
      newState.initiativeLevel * 0.7 + (selectedInterventions.length > 0 ? 0.8 : 0.2) * 0.3,
      0.1, 1
    );
    
    // Update success rate based on effectiveness of interventions
    newState.successRate = this.updateSuccessRate(newState, inputData, cycleNumber);
    
    // Record recent interventions
    if (selectedInterventions.length > 0) {
      newState.recentInterventions.push({
        cycle: cycleNumber,
        interventions: selectedInterventions,
        timestamp: new Date().toISOString()
      });
      
      // Keep only the last 10 interventions
      if (newState.recentInterventions.length > 10) {
        newState.recentInterventions = newState.recentInterventions.slice(-10);
      }
    }
    
    // Calculate changes for reporting
    const changes = {
      activeInterventionsChange: newState.activeInterventions.length - currentState.activeInterventions.length,
      budgetChange: newState.interventionBudget - currentState.interventionBudget,
      initiativeChange: newState.initiativeLevel - currentState.initiativeLevel,
      successRateChange: newState.successRate - currentState.successRate
    };

    // Calculate actions based on interventions
    const actions = [...newState.activeInterventions]; // Return the interventions as actions

    return {
      newState,
      changes,
      actions
    };
  }

  evaluateInterventions(inputData, cycleNumber, state) {
    const interventions = [];
    
    // Evaluate interventions based on world system changes
    if (inputData.economy) {
      // Economic interventions
      if (inputData.economy.inflation > 0.05) {
        // High inflation intervention
        interventions.push({
          id: `econ-inflation-${cycleNumber}`,
          targetSystem: 'economy',
          type: 'stabilize_inflation',
          changes: { inflation: -0.02, marketConfidence: -0.05 },
          priority: 0.8,
          cost: 15,
          description: 'Attempt to reduce high inflation'
        });
      }
      
      if (inputData.economy.employment < 0.8) {
        // Low employment intervention
        interventions.push({
          id: `econ-employment-${cycleNumber}`,
          targetSystem: 'economy',
          type: 'boost_employment',
          changes: { employment: 0.03, growthRate: 0.005 },
          priority: 0.75,
          cost: 20,
          description: 'Attempt to boost employment'
        });
      }
    }
    
    if (inputData.population) {
      // Population interventions
      if (inputData.population.happiness < 0.5) {
        interventions.push({
          id: `pop-happiness-${cycleNumber}`,
          targetSystem: 'population',
          type: 'improve_happiness',
          changes: { happiness: 0.1, health: 0.05 },
          priority: 0.85,
          cost: 25,
          description: 'Attempt to improve population happiness'
        });
      }
      
      if (inputData.population.health < 0.6) {
        interventions.push({
          id: `pop-health-${cycleNumber}`,
          targetSystem: 'population',
          type: 'health_initiative',
          changes: { health: 0.1, educationLevel: 0.03 },
          priority: 0.7,
          cost: 30,
          description: 'Attempt to improve population health'
        });
      }
    }
    
    if (inputData.stability) {
      // Stability interventions
      if (inputData.stability.overall < 0.6) {
        interventions.push({
          id: `stability-${cycleNumber}`,
          targetSystem: 'stability',
          type: 'stability_enhancement',
          changes: { overall: 0.1, political: 0.05, social: 0.05 },
          priority: 0.9,
          cost: 35,
          description: 'Attempt to enhance overall stability'
        });
      }
    }
    
    if (inputData.entropy) {
      // Entropy interventions
      if (inputData.entropy.current > 0.7) {
        interventions.push({
          id: `entropy-${cycleNumber}`,
          targetSystem: 'entropy',
          type: 'reduce_entropy',
          changes: { current: -0.1 },
          priority: 0.8,
          cost: 40,
          description: 'Attempt to reduce system entropy'
        });
      }
    }
    
    // Evaluate interventions based on machine's own state
    if (inputData.beliefs && inputData.beliefs.confidence < 0.6) {
      interventions.push({
        id: `belief-confidence-${cycleNumber}`,
        targetSystem: 'technology',  // Use technology system instead of non-existent beliefSystem
        type: 'knowledge_verification',
        changes: { innovation: 0.05, knowledgeBase: 0.1 },
        priority: 0.65,
        cost: 10,
        description: 'Verify and strengthen knowledge base'
      });
    }
    
    // Evaluate interventions based on emotional state
    if (inputData.emotions && inputData.emotions.mood === 'negative' && inputData.emotions.regulation < 0.5) {
      interventions.push({
        id: `emotion-regulation-${cycleNumber}`,
        targetSystem: 'population',  // Use population system instead of non-existent emotionSystem
        type: 'wellness_program',
        changes: { happiness: 0.1, health: 0.05 },
        priority: 0.6,
        cost: 12,
        description: 'Improve population wellness'
      });
    }
    
    // Sort interventions by priority
    interventions.sort((a, b) => b.priority - a.priority);
    
    return interventions;
  }

  selectInterventions(potentialInterventions, budget) {
    const selected = [];
    let remainingBudget = budget;
    
    for (const intervention of potentialInterventions) {
      const cost = intervention.cost || 10;
      
      if (cost <= remainingBudget) {
        selected.push(intervention);
        remainingBudget -= cost;
        
        // Add cooldown for this intervention type to prevent spam
        // This is just for demonstration - in a real implementation you'd track this differently
      }
    }
    
    return selected;
  }

  updateSuccessRate(state, inputData, cycleNumber) {
    // Calculate success rate based on effectiveness of recent interventions
    // This is a simplified calculation - in reality, measuring intervention success would be more complex
    
    // Base success rate with some randomness
    const baseSuccess = 0.6;
    const randomness = Random.range(-0.1, 0.1);
    
    // Adjust based on initiative level and budget utilization
    const initiativeFactor = state.initiativeLevel * 0.2;
    const budgetUtilization = (100 - state.interventionBudget) / 100; // Higher utilization may mean more active
    const utilizationFactor = budgetUtilization * 0.1;
    
    // Overall success rate
    const calculatedSuccess = baseSuccess + randomness + initiativeFactor + utilizationFactor;
    
    // Use a weighted average with the previous success rate
    return MathUtils.clamp(
      state.successRate * 0.8 + calculatedSuccess * 0.2,
      0.1, 1
    );
  }
}

module.exports = { InterventionEngine };