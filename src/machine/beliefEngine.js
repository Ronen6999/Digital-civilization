const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class BeliefEngine {
  getDefaultState() {
    return {
      confidence: 0.8,
      certaintyThreshold: 0.7,
      beliefs: [],
      updateRate: 0.1,
      coherence: 0.9
    };
  }

  async update(currentState, worldChanges, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update beliefs based on world changes
    const updatedBeliefs = [...currentState.beliefs];
    
    // Process each world change to potentially update beliefs
    for (const [systemName, changes] of Object.entries(worldChanges)) {
      if (systemName === 'timestamp' || systemName === 'cycle') continue;
      
      for (const [changeName, changeValue] of Object.entries(changes)) {
        // Calculate significance of the change
        const absChange = Math.abs(changeValue);
        if (absChange > 0.01) { // Only significant changes affect beliefs
          const beliefExists = updatedBeliefs.find(b => b.topic === `${systemName}.${changeName}`);
          
          if (beliefExists) {
            // Update existing belief
            beliefExists.confidence = MathUtils.clamp(
              beliefExists.confidence * 0.7 + (1 - absChange) * 0.3,
              0.1, 1
            );
            beliefExists.strength += changeValue * 0.1;
            beliefExists.lastUpdated = cycleNumber;
          } else {
            // Create new belief based on the change
            updatedBeliefs.push({
              topic: `${systemName}.${changeName}`,
              strength: changeValue,
              confidence: MathUtils.clamp(absChange, 0.1, 1),
              formedAt: cycleNumber,
              lastUpdated: cycleNumber,
              category: systemName
            });
          }
        }
      }
    }
    
    // Update existing beliefs based on time and coherence
    for (const belief of updatedBeliefs) {
      // Reduce confidence over time if not reinforced
      belief.confidence *= 0.99;
      
      // Adjust strength based on coherence with other beliefs
      const coherentBeliefs = updatedBeliefs.filter(b => 
        b.category === belief.category && b !== belief
      );
      
      if (coherentBeliefs.length > 0) {
        const avgStrength = coherentBeliefs.reduce((sum, b) => sum + b.strength, 0) / coherentBeliefs.length;
        belief.strength = belief.strength * 0.8 + avgStrength * 0.2;
      }
    }
    
    // Remove beliefs that are no longer relevant (low confidence)
    newState.beliefs = updatedBeliefs.filter(belief => belief.confidence > 0.1);
    
    // Update overall confidence based on belief coherence and certainty
    const activeBeliefs = newState.beliefs.filter(b => b.confidence > currentState.certaintyThreshold);
    const avgBeliefConfidence = activeBeliefs.length > 0 
      ? activeBeliefs.reduce((sum, b) => sum + b.confidence, 0) / activeBeliefs.length
      : 0.5;
    
    newState.coherence = MathUtils.clamp(
      newState.coherence * 0.8 + (activeBeliefs.length / Math.max(1, currentState.beliefs.length)) * 0.2,
      0.1, 1
    );
    
    newState.confidence = MathUtils.clamp(
      avgBeliefConfidence * 0.6 + newState.coherence * 0.4 + Random.range(-0.05, 0.05),
      0.1, 1
    );
    
    // Update update rate based on world volatility
    const volatility = Object.values(worldChanges)
      .filter(value => typeof value === 'object')
      .flatMap(obj => Object.values(obj))
      .map(val => Math.abs(val))
      .reduce((sum, val) => sum + val, 0);
    
    newState.updateRate = MathUtils.clamp(
      newState.updateRate * 0.9 + Math.min(0.5, volatility * 0.1) * 0.1,
      0.01, 0.5
    );
    
    // Calculate actions based on beliefs
    const actions = {
      beliefFormations: updatedBeliefs.filter(b => 
        b.formedAt === cycleNumber
      ).map(b => ({
        topic: b.topic,
        strength: b.strength,
        confidence: b.confidence
      })),
      beliefReinforcements: updatedBeliefs.filter(b => 
        b.lastUpdated === cycleNumber && b.formedAt !== cycleNumber
      ).length,
      beliefDrops: currentState.beliefs.filter(oldB => 
        !newState.beliefs.find(newB => newB.topic === oldB.topic)
      ).length
    };

    return {
      newState,
      changes: {
        beliefCount: newState.beliefs.length - currentState.beliefs.length,
        confidenceChange: newState.confidence - currentState.confidence,
        coherenceChange: newState.coherence - currentState.coherence
      },
      actions
    };
  }
}

module.exports = { BeliefEngine };