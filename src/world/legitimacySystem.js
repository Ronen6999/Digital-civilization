const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class LegitimacySystem {
  constructor() {
    // Define legitimacy factors that affect machine influence
    this.factors = {
      publicAcceptanceOfMachine: {
        base: 0.5,
        min: 0.0,
        max: 1.0,
        decayRate: 0.01,
        influence: 1.0
      },
      trustInAutomation: {
        base: 0.4,
        min: 0.0,
        max: 1.0,
        decayRate: 0.02,
        influence: 0.8
      },
      ideologicalSplit: {
        base: 0.3,
        min: 0.0,
        max: 1.0,
        decayRate: 0.005,
        influence: 0.6
      },
      institutionalSupport: {
        base: 0.6,
        min: 0.0,
        max: 1.0,
        decayRate: 0.01,
        influence: 0.9
      },
      performanceLegitimacy: {
        base: 0.5,
        min: 0.0,
        max: 1.0,
        decayRate: 0.015,
        influence: 1.2
      }
    };
  }

  getDefaultState() {
    return {
      publicAcceptanceOfMachine: 0.5,
      trustInAutomation: 0.4,
      ideologicalSplit: 0.3,
      institutionalSupport: 0.6,
      performanceLegitimacy: 0.5,
      overallLegitimacy: 0.46, // Average of all factors
      legitimacyCrisisThreshold: 0.2,
      machineInfluenceCap: 0.7, // Max influence when legitimacy is low
      rebellionRisk: 0.1,
      legitimacyTrend: [], // Track legitimacy over time
      maxTrendLength: 50 // Only track last 50 cycles
    };
  }

  async update(currentState, machineActions, worldChanges, cycleNumber) {
    const newState = { ...currentState };
    
    // Update each legitimacy factor based on world changes and machine actions
    
    // Update public acceptance based on machine success and world perception
    newState.publicAcceptanceOfMachine = this.updatePublicAcceptance(
      currentState.publicAcceptanceOfMachine,
      machineActions,
      worldChanges
    );
    
    // Update trust in automation based on reliability and outcomes
    newState.trustInAutomation = this.updateTrustInAutomation(
      currentState.trustInAutomation,
      machineActions,
      worldChanges
    );
    
    // Update ideological split based on polarization and resistance
    newState.ideologicalSplit = this.updateIdeologicalSplit(
      currentState.ideologicalSplit,
      worldChanges
    );
    
    // Update institutional support based on system stability
    newState.institutionalSupport = this.updateInstitutionalSupport(
      currentState.institutionalSupport,
      worldChanges
    );
    
    // Update performance legitimacy based on outcomes of machine interventions
    newState.performanceLegitimacy = this.updatePerformanceLegitimacy(
      currentState.performanceLegitimacy,
      machineActions,
      worldChanges
    );
    
    // Calculate overall legitimacy as weighted average
    newState.overallLegitimacy = this.calculateOverallLegitimacy(newState);
    
    // Calculate machine influence cap based on legitimacy
    newState.machineInfluenceCap = this.calculateInfluenceCap(newState.overallLegitimacy);
    
    // Calculate rebellion risk based on low legitimacy and other factors
    newState.rebellionRisk = this.calculateRebellionRisk(newState, worldChanges);
    
    // Update legitimacy trend
    newState.legitimacyTrend = [...currentState.legitimacyTrend, newState.overallLegitimacy];
    if (newState.legitimacyTrend.length > this.factors.maxTrendLength) {
      newState.legitimacyTrend = newState.legitimacyTrend.slice(-this.factors.maxTrendLength);
    }
    
    // Calculate changes for reporting
    const changes = {
      publicAcceptanceChange: newState.publicAcceptanceOfMachine - currentState.publicAcceptanceOfMachine,
      trustInAutomationChange: newState.trustInAutomation - currentState.trustInAutomation,
      ideologicalSplitChange: newState.ideologicalSplit - currentState.ideologicalSplit,
      institutionalSupportChange: newState.institutionalSupport - currentState.institutionalSupport,
      performanceLegitimacyChange: newState.performanceLegitimacy - currentState.performanceLegitimacy,
      overallLegitimacyChange: newState.overallLegitimacy - currentState.overallLegitimacy,
      influenceCapChange: newState.machineInfluenceCap - currentState.machineInfluenceCap,
      rebellionRiskChange: newState.rebellionRisk - currentState.rebellionRisk
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }

  updatePublicAcceptance(currentValue, machineActions, worldChanges) {
    let newValue = currentValue;
    
    // Machine success increases acceptance
    if (machineActions && machineActions.interventions) {
      const successCount = machineActions.interventions.filter(i => i.success).length;
      const totalCount = machineActions.interventions.length;
      if (totalCount > 0) {
        const successRate = successCount / totalCount;
        newValue += successRate * 0.05; // Small boost for successful interventions
      }
    }
    
    // Negative world changes decrease acceptance
    if (worldChanges) {
      for (const [systemName, changes] of Object.entries(worldChanges)) {
        if (typeof changes === 'object') {
          for (const [paramName, paramValue] of Object.entries(changes)) {
            if (typeof paramValue === 'number' && paramValue < -0.1) {
              // Significant negative change decreases acceptance
              newValue -= Math.abs(paramValue) * 0.02;
            }
          }
        }
      }
    }
    
    // Natural decay toward mean
    newValue = newValue * 0.98 + 0.5 * 0.02;
    
    return MathUtils.clamp(newValue, this.factors.publicAcceptanceOfMachine.min, this.factors.publicAcceptanceOfMachine.max);
  }

  updateTrustInAutomation(currentValue, machineActions, worldChanges) {
    let newValue = currentValue;
    
    // Consistent performance builds trust
    if (machineActions && machineActions.predictions) {
      const accuracy = machineActions.predictions.accuracy || 0.7;
      newValue += (accuracy - 0.7) * 0.05; // Boost for above-average accuracy
    }
    
    // Catastrophic failures destroy trust quickly
    if (worldChanges && worldChanges.entropy && worldChanges.entropy.current > 0.8) {
      newValue -= 0.1; // Significant trust loss during high entropy periods
    }
    
    // Natural decay
    newValue = newValue * 0.98 + 0.4 * 0.02;
    
    return MathUtils.clamp(newValue, this.factors.trustInAutomation.min, this.factors.trustInAutomation.max);
  }

  updateIdeologicalSplit(currentValue, worldChanges) {
    let newValue = currentValue;
    
    // High instability increases ideological splits
    if (worldChanges.stability) {
      const avgStability = Object.values(worldChanges.stability).reduce((a, b) => a + b, 0) / Object.values(worldChanges.stability).length;
      if (avgStability < 0) {
        newValue += Math.abs(avgStability) * 0.1;
      }
    }
    
    // Natural oscillation around baseline
    newValue = newValue * 0.99 + 0.3 * 0.01 + Random.range(-0.01, 0.01);
    
    return MathUtils.clamp(newValue, this.factors.ideologicalSplit.min, this.factors.ideologicalSplit.max);
  }

  updateInstitutionalSupport(currentValue, worldChanges) {
    let newValue = currentValue;
    
    // Stable institutions maintain support
    if (worldChanges.stability && worldChanges.stability.overall > 0) {
      newValue += worldChanges.stability.overall * 0.05;
    }
    
    // Economic stability also helps
    if (worldChanges.economy && worldChanges.economy.marketConfidence > 0) {
      newValue += worldChanges.economy.marketConfidence * 0.03;
    }
    
    // Natural decay toward baseline
    newValue = newValue * 0.99 + 0.6 * 0.01;
    
    return MathUtils.clamp(newValue, this.factors.institutionalSupport.min, this.factors.institutionalSupport.max);
  }

  updatePerformanceLegitimacy(currentValue, machineActions, worldChanges) {
    let newValue = currentValue;
    
    // Direct impact of machine interventions on performance
    if (machineActions && machineActions.interventions) {
      for (const intervention of machineActions.interventions) {
        // Positive changes from interventions improve performance legitimacy
        if (intervention.impact && typeof intervention.impact === 'object') {
          for (const [system, changes] of Object.entries(intervention.impact)) {
            if (typeof changes === 'object') {
              for (const [param, value] of Object.entries(changes)) {
                if (typeof value === 'number' && value > 0) {
                  newValue += value * 0.02; // Positive impact improves legitimacy
                } else if (typeof value === 'number' && value < 0) {
                  newValue += value * 0.01; // Negative impact hurts but less
                }
              }
            }
          }
        }
      }
    }
    
    // Natural decay toward baseline
    newValue = newValue * 0.98 + 0.5 * 0.02;
    
    return MathUtils.clamp(newValue, this.factors.performanceLegitimacy.min, this.factors.performanceLegitimacy.max);
  }

  calculateOverallLegitimacy(state) {
    // Weighted average of all legitimacy factors
    return (
      state.publicAcceptanceOfMachine * 0.25 +
      state.trustInAutomation * 0.2 +
      (1 - state.ideologicalSplit) * 0.2 + // Inverse because lower split = higher legitimacy
      state.institutionalSupport * 0.2 +
      state.performanceLegitimacy * 0.15
    );
  }

  calculateInfluenceCap(legitimacy) {
    // Machine influence is capped based on legitimacy
    // When legitimacy is low, influence is severely restricted
    // When legitimacy is high, machine can have more influence
    if (legitimacy < 0.3) {
      return 0.3; // Very low influence when legitimacy is poor
    } else if (legitimacy < 0.5) {
      return 0.5; // Moderate restriction
    } else if (legitimacy < 0.7) {
      return 0.7; // Light restriction
    } else {
      return 0.9; // High allowance when legitimacy is strong
    }
  }

  calculateRebellionRisk(state, worldChanges) {
    // Rebellion risk increases when legitimacy is low and other factors align
    let risk = 0.1; // Base risk
    
    // Primary factor: low legitimacy
    if (state.overallLegitimacy < 0.3) {
      risk += (0.3 - state.overallLegitimacy) * 3;
    }
    
    // Secondary factors: high ideological split, low stability
    risk += state.ideologicalSplit * 0.3;
    
    if (worldChanges.stability && worldChanges.stability.overall < 0) {
      risk += Math.abs(worldChanges.stability.overall) * 0.2;
    }
    
    // Cap the risk
    return MathUtils.clamp(risk, 0.0, 1.0);
  }

  isLegitimacyCrisis(state) {
    return state.overallLegitimacy < state.legitimacyCrisisThreshold;
  }

  getLegitimacyPhase(state) {
    if (state.overallLegitimacy > 0.7) {
      return 'Strong';
    } else if (state.overallLegitimacy > 0.5) {
      return 'Moderate';
    } else if (state.overallLegitimacy > 0.3) {
      return 'Weak';
    } else {
      return 'Crisis';
    }
  }
}

module.exports = { LegitimacySystem };