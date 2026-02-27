const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class EmotionEngine {
  getDefaultState() {
    return {
      exploration: {
        curiosity: 0.8,  // Exploration tendency
        caution: 0.2     // Risk aversion
      },
      control: {
        dominance: 0.5,  // Control-seeking
        passivity: 0.5   // Acceptance of external control
      },
      stability: {
        riskSeeking: 0.4,    // Preference for change
        preservation: 0.6    // Preference for stability
      },
      intensity: 0.5,
      regulation: 0.7,
      emotionalStability: 0.8,
      strategicTension: 0.0  // Balance between exploration/control/stability
    };
  }

  async update(currentState, worldChanges, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update exploration dimension
    newState.exploration = this.updateExplorationDimension(
      currentState.exploration, 
      worldChanges
    );
    
    // Update control dimension
    newState.control = this.updateControlDimension(
      currentState.control, 
      worldChanges
    );
    
    // Update stability dimension
    newState.stability = this.updateStabilityDimension(
      currentState.stability, 
      worldChanges
    );
    
    // Update overall intensity based on dimension tensions
    const explorationTension = Math.abs(newState.exploration.curiosity - newState.exploration.caution);
    const controlTension = Math.abs(newState.control.dominance - newState.control.passivity);
    const stabilityTension = Math.abs(newState.stability.riskSeeking - newState.stability.preservation);
    
    newState.intensity = (explorationTension + controlTension + stabilityTension) / 3;
    
    // Update regulation based on tension levels
    newState.regulation = MathUtils.clamp(
      newState.regulation * 0.9 + (1 - newState.intensity) * 0.1 + Random.range(-0.02, 0.02),
      0.1, 1
    );
    
    // Update emotional stability based on dimension consistency
    newState.emotionalStability = MathUtils.clamp(
      1 - (explorationTension + controlTension + stabilityTension) / 3,
      0.1, 1
    );
    
    // Calculate strategic tension (conflict between dimensions)
    newState.strategicTension = this.calculateStrategicTension(newState);
    
    // Calculate changes for reporting
    const changes = {
      intensityChange: newState.intensity - currentState.intensity,
      regulationChange: newState.regulation - currentState.regulation,
      stabilityChange: newState.emotionalStability - currentState.emotionalStability,
      strategicTensionChange: newState.strategicTension - (currentState.strategicTension || 0)
    };

    // Calculate actions based on emotional state
    const actions = {
      explorationBias: this.getExplorationBias(newState),
      controlBias: this.getControlBias(newState),
      stabilityBias: this.getStabilityBias(newState),
      strategicDirection: this.getStrategicDirection(newState)
    };

    return {
      newState,
      changes,
      actions
    };
  }

  updateExplorationDimension(currentExploration, worldChanges) {
    let newExploration = { ...currentExploration };
    
    // Process world changes to influence exploration vs caution
    for (const [systemName, changes] of Object.entries(worldChanges)) {
      if (systemName === 'timestamp' || systemName === 'cycle') continue;
      
      for (const [changeName, changeValue] of Object.entries(changes)) {
        const absChange = Math.abs(changeValue);
        if (absChange > 0.02) {
          // Novel situations increase curiosity
          if (Math.abs(changeValue) > 0.1) {
            newExploration.curiosity = MathUtils.clamp(newExploration.curiosity + absChange * 0.1, 0, 1);
          }
          
          // Volatile situations increase caution
          if (systemName === 'stability' || systemName === 'entropy') {
            newExploration.caution = MathUtils.clamp(newExploration.caution + absChange * 0.05, 0, 1);
          }
        }
      }
    }
    
    // Natural balance between exploration and caution
    const total = newExploration.curiosity + newExploration.caution;
    if (total > 1.2) {
      newExploration.curiosity *= 0.9;
      newExploration.caution *= 0.9;
    }
    
    return newExploration;
  }

  updateControlDimension(currentControl, worldChanges) {
    let newControl = { ...currentControl };
    
    // Process world changes to influence control preferences
    for (const [systemName, changes] of Object.entries(worldChanges)) {
      if (systemName === 'timestamp' || systemName === 'cycle') continue;
      
      for (const [changeName, changeValue] of Object.entries(changes)) {
        const absChange = Math.abs(changeValue);
        if (absChange > 0.02) {
          // Large changes may trigger dominance desires
          if (absChange > 0.05) {
            newControl.dominance = MathUtils.clamp(newControl.dominance + changeValue * 0.02, 0, 1);
          }
          
          // Uncontrollable changes may increase passivity
          if (systemName === 'entropy' || systemName === 'blackSwanEvents') {
            newControl.passivity = MathUtils.clamp(newControl.passivity + absChange * 0.03, 0, 1);
          }
        }
      }
    }
    
    // Balance control dimensions
    const total = newControl.dominance + newControl.passivity;
    if (total > 1.2) {
      newControl.dominance = MathUtils.clamp(newControl.dominance * 0.9, 0, 1);
      newControl.passivity = MathUtils.clamp(newControl.passivity * 0.9, 0, 1);
    }
    
    return newControl;
  }

  updateStabilityDimension(currentStability, worldChanges) {
    let newStability = { ...currentStability };
    
    // Process world changes to influence stability preferences
    for (const [systemName, changes] of Object.entries(worldChanges)) {
      if (systemName === 'timestamp' || systemName === 'cycle') continue;
      
      for (const [changeName, changeValue] of Object.entries(changes)) {
        const absChange = Math.abs(changeValue);
        if (absChange > 0.02) {
          // Rapid changes may increase risk-seeking
          if (absChange > 0.08) {
            newStability.riskSeeking = MathUtils.clamp(newStability.riskSeeking + absChange * 0.04, 0, 1);
          }
          
          // Unstable systems may increase preservation desire
          if (systemName === 'stability' || systemName === 'entropy') {
            newStability.preservation = MathUtils.clamp(newStability.preservation + absChange * 0.05, 0, 1);
          }
        }
      }
    }
    
    // Balance stability dimensions
    const total = newStability.riskSeeking + newStability.preservation;
    if (total > 1.2) {
      newStability.riskSeeking = MathUtils.clamp(newStability.riskSeeking * 0.9, 0, 1);
      newStability.preservation = MathUtils.clamp(newStability.preservation * 0.9, 0, 1);
    }
    
    return newStability;
  }

  calculateStrategicTension(state) {
    // Calculate tension between different dimensions
    const explorationControlTension = Math.abs(
      (state.exploration.curiosity - state.exploration.caution) - 
      (state.control.dominance - state.control.passivity)
    );
    
    const explorationStabilityTension = Math.abs(
      (state.exploration.curiosity - state.exploration.caution) - 
      (state.stability.riskSeeking - state.stability.preservation)
    );
    
    const controlStabilityTension = Math.abs(
      (state.control.dominance - state.control.passivity) - 
      (state.stability.riskSeeking - state.stability.preservation)
    );
    
    return (explorationControlTension + explorationStabilityTension + controlStabilityTension) / 3;
  }

  getExplorationBias(state) {
    return state.exploration.curiosity - state.exploration.caution;
  }

  getControlBias(state) {
    return state.control.dominance - state.control.passivity;
  }

  getStabilityBias(state) {
    return state.stability.riskSeeking - state.stability.preservation;
  }

  getStrategicDirection(state) {
    const exploration = this.getExplorationBias(state);
    const control = this.getControlBias(state);
    const stability = this.getStabilityBias(state);
    
    return {
      exploration,
      control,
      stability,
      overallTendency: (exploration + control + stability) / 3
    };
  }

}

module.exports = { EmotionEngine };