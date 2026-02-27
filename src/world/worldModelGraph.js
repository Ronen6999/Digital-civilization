/**
 * World Model Graph - Defines explicit causal relationships between world systems
 * This creates a structured dependency map instead of implicit interactions
 */

class WorldModelGraph {
  constructor() {
    // Define explicit causal relationships with weights
    this.causalRelationships = [
      // Economy -> Population
      { from: 'economy.resources', to: 'population.growthRate', weight: 0.4 },
      { from: 'economy.employment', to: 'population.happiness', weight: 0.3 },
      { from: 'economy.marketConfidence', to: 'population.happiness', weight: 0.2 },
      
      // Stability -> Economy
      { from: 'stability.overall', to: 'economy.marketConfidence', weight: 0.6 },
      { from: 'stability.political', to: 'economy.growthRate', weight: 0.3 },
      { from: 'stability.economic', to: 'economy.marketConfidence', weight: 0.5 },
      
      // Technology -> Other Systems
      { from: 'technology.level', to: 'economy.productivity', weight: 0.5 },
      { from: 'technology.level', to: 'population.educationLevel', weight: 0.4 },
      { from: 'technology.level', to: 'stability.overall', weight: 0.2 }, // Can be destabilizing initially
      
      // Entropy -> Stability
      { from: 'entropy.current', to: 'stability.volatility', weight: 0.7 },
      { from: 'entropy.current', to: 'stability.overall', weight: -0.4 },
      { from: 'entropy.current', to: 'resistance.toChange', weight: 0.3 },
      
      // Population -> Other Systems
      { from: 'population.happiness', to: 'stability.social', weight: 0.5 },
      { from: 'population.educationLevel', to: 'technology.innovationRate', weight: 0.3 },
      { from: 'population.urbanization', to: 'entropy.current', weight: 0.2 },
      
      // Resistance -> Other Systems
      { from: 'resistance.toInnovation', to: 'technology.innovationRate', weight: -0.6 },
      { from: 'resistance.toChange', to: 'stability.overall', weight: 0.4 }, // Paradoxically stabilizing
      { from: 'resistance.toTechnology', to: 'technology.adoptionRate', weight: -0.5 },
      
      // External feedback loops
      { from: 'stability.overall', to: 'resistance.toGovernmentPolicy', weight: -0.3 }, // More stable = less resistance to policies
      { from: 'population.count', to: 'economy.resources', weight: 0.1 }, // More people = more economic activity
    ];
    
    // Define system thresholds that trigger special behaviors
    this.thresholds = {
      // Population collapse threshold
      'population.count': { min: 100, trigger: 'population_collapse' },
      
      // Stability collapse threshold
      'stability.overall': { min: 0.2, trigger: 'stability_collapse' },
      
      // Entropy runaway threshold
      'entropy.current': { max: 0.9, trigger: 'entropy_runaway' },
      
      // Economic depression threshold - when growth falls below -0.1
      'economy.growthRate': { min: -0.1, trigger: 'economic_depression' },
      
      // Technology singularity threshold - when tech level exceeds 10
      'technology.level': { max: 10.0, trigger: 'tech_singularity' },
    };
  }

  /**
   * Apply causal relationships to propagate changes through systems
   */
  applyCausalEffects(worldState, changeLog) {
    const newState = JSON.parse(JSON.stringify(worldState)); // Deep clone
    const effectsApplied = [];
    
    // For each change in the changelog, apply causal effects
    for (const [changedPath, changeValue] of Object.entries(changeLog)) {
      // Find all relationships affected by this change
      const affectedRelationships = this.causalRelationships.filter(rel => rel.from === changedPath);
      
      for (const relationship of affectedRelationships) {
        // Get the original value to normalize the effect
        const originalValue = this.getValueFromPath(worldState, relationship.from);
        
        // Calculate the propagated effect based on relative change
        // For values that are likely to be large, we need to normalize
        let propagatedEffect;
        
        // Check if this is an absolute value that shouldn't be directly multiplied
        if (originalValue && Math.abs(originalValue) > 100) {  // For large absolute values like population count
          // Use a normalized approach to avoid explosion
          const normalizedChange = changeValue / originalValue; // Get relative change
          const baseEffect = normalizedChange * relationship.weight;
          // Scale the effect to a reasonable range
          propagatedEffect = baseEffect * Math.min(Math.abs(originalValue), 1000); // Cap the multiplier
        } else {
          // For smaller values, use the original approach
          propagatedEffect = changeValue * relationship.weight;
        }
        
        // Apply the effect to the target system
        this.applyEffect(newState, relationship.to, propagatedEffect);
        
        effectsApplied.push({
          from: relationship.from,
          to: relationship.to,
          weight: relationship.weight,
          originalChange: changeValue,
          propagatedEffect: propagatedEffect
        });
      }
    }
    
    return { newState, effectsApplied };
  }

  /**
   * Apply a single effect to a target path in the world state
   */
  applyEffect(worldState, targetPath, effectValue) {
    const pathParts = targetPath.split('.');
    let current = worldState;
    
    // Navigate to the target property
    for (let i = 0; i < pathParts.length - 1; i++) {
      current = current[pathParts[i]];
      if (!current) return; // Path doesn't exist
    }
    
    const targetProperty = pathParts[pathParts.length - 1];
    
    // Apply the effect, clamping to reasonable bounds
    if (typeof current[targetProperty] === 'number') {
      // For bounded values (0-1 range), use clamped addition
      if (this.isBoundedValue(targetProperty)) {
        current[targetProperty] = Math.max(0, Math.min(1, current[targetProperty] + effectValue));
      } else {
        // For unbounded values, just add
        current[targetProperty] += effectValue;
      }
    }
  }

  /**
   * Check if a property name suggests it should be bounded (0-1)
   */
  isBoundedValue(propertyName) {
    const boundedPatterns = [
      'confidence', 'rate', 'level', 'ratio', 'proportion', 'probability',
      'happiness', 'stability', 'volatility', 'resilience', 'acceptance',
      'trust', 'cohesion', 'effectiveness', 'efficiency', 'quality'
    ];
    
    return boundedPatterns.some(pattern => 
      propertyName.toLowerCase().includes(pattern)
    );
  }

  /**
   * Check for threshold violations
   */
  checkThresholdViolations(worldState) {
    const violations = [];
    
    for (const [path, thresholdConfig] of Object.entries(this.thresholds)) {
      const value = this.getValueFromPath(worldState, path);
      if (value !== undefined) {
        // Min violation: value falls below minimum acceptable value
        if (thresholdConfig.min !== undefined && value < thresholdConfig.min) {
          violations.push({
            path,
            value,
            threshold: thresholdConfig.min,
            type: 'min_violation',
            trigger: thresholdConfig.trigger
          });
        }
        // Max violation: value exceeds maximum acceptable value
        if (thresholdConfig.max !== undefined && value > thresholdConfig.max) {
          violations.push({
            path,
            value,
            threshold: thresholdConfig.max,
            type: 'max_violation',
            trigger: thresholdConfig.trigger
          });
        }
      }
    }
    
    return violations;
  }

  /**
   * Get a value from a nested object using dot notation path
   */
  getValueFromPath(obj, path) {
    return path.split('.').reduce((current, part) => {
      return current && current[part] !== undefined ? current[part] : undefined;
    }, obj);
  }

  /**
   * Get direct dependencies of a given system property
   */
  getDependencies(propertyPath) {
    return this.causalRelationships
      .filter(rel => rel.to === propertyPath)
      .map(rel => ({
        source: rel.from,
        weight: rel.weight
      }));
  }

  /**
   * Get properties affected by a given system property
   */
  getAffectedBy(propertyPath) {
    return this.causalRelationships
      .filter(rel => rel.from === propertyPath)
      .map(rel => ({
        target: rel.to,
        weight: rel.weight
      }));
  }

  /**
   * Get the full dependency graph for visualization/debugging
   */
  getFullGraph() {
    return {
      relationships: this.causalRelationships,
      thresholds: this.thresholds
    };
  }
}

module.exports = { WorldModelGraph };