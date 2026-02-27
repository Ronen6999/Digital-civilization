const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class StabilitySystem {
  getDefaultState() {
    return {
      political: 0.8,
      social: 0.75,
      economic: 0.85,
      overall: 0.8,
      cohesion: 0.7,
      volatility: 0.2,
      resilience: 0.6,
      stressLevel: 0.3,
      confidenceIndex: 0.75,
      institutionalStrength: 0.8,
      publicTrust: 0.65
    };
  }

  async update(currentState, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update political stability based on various factors
    const politicalChange = 
      (currentState.economic * 0.2) +           // Economic impact
      (currentState.social * 0.2) +             // Social impact
      (currentState.confidenceIndex * 0.1) +    // Confidence impact
      Random.range(-0.05, 0.05);                // Random fluctuation
    
    newState.political = MathUtils.clamp(
      currentState.political * 0.9 + politicalChange * 0.1,
      0.05, 0.95
    );
    
    // Update social stability based on inequality, happiness, and cohesion
    const socialChange = 
      (currentState.cohesion * 0.3) +                    // Cohesion impact
      (currentState.publicTrust * 0.2) +                 // Trust impact
      (1 - currentState.stressLevel) * 0.2 +             // Low stress helps
      Random.range(-0.05, 0.05);                         // Random fluctuation
    
    newState.social = MathUtils.clamp(
      currentState.social * 0.9 + socialChange * 0.1,
      0.05, 0.95
    );
    
    // Update economic stability based on growth, inflation, and confidence
    const economicChange = 
      (currentState.confidenceIndex * 0.3) +    // Confidence impact
      (currentState.institutionalStrength * 0.2) + // Institutional impact
      Random.range(-0.05, 0.05);                // Random fluctuation
    
    newState.economic = MathUtils.clamp(
      currentState.economic * 0.9 + economicChange * 0.1,
      0.05, 0.95
    );
    
    // Calculate overall stability as weighted average
    newState.overall = (
      newState.political * 0.3 +
      newState.social * 0.25 +
      newState.economic * 0.25 +
      newState.cohesion * 0.2
    );
    
    // Update cohesion based on political and social factors
    newState.cohesion = MathUtils.clamp(
      currentState.cohesion * 0.9 + 
      (newState.political * 0.2 + newState.social * 0.3) * 0.1 +
      Random.range(-0.03, 0.03),
      0.1, 0.9
    );
    
    // Update volatility (inverse relationship with stability)
    newState.volatility = MathUtils.clamp(
      currentState.volatility * 0.8 + 
      (1 - newState.overall) * 0.2 + 
      Random.range(-0.02, 0.02),
      0.05, 0.8
    );
    
    // Update resilience based on institutional strength and overall stability
    newState.resilience = MathUtils.clamp(
      currentState.resilience * 0.95 + 
      (newState.institutionalStrength * 0.4 + newState.overall * 0.3) * 0.05 +
      Random.range(-0.01, 0.02),
      0.1, 0.9
    );
    
    // Update stress level (inverse of stability)
    newState.stressLevel = MathUtils.clamp(
      currentState.stressLevel * 0.8 + 
      (1 - newState.overall) * 0.2 +
      Random.range(-0.03, 0.03),
      0.05, 0.9
    );
    
    // Update confidence index based on overall stability and institutional strength
    newState.confidenceIndex = MathUtils.clamp(
      currentState.confidenceIndex * 0.85 + 
      (newState.overall * 0.4 + newState.institutionalStrength * 0.25) * 0.15 +
      Random.range(-0.04, 0.04),
      0.1, 0.95
    );
    
    // Update institutional strength based on political stability and resilience
    newState.institutionalStrength = MathUtils.clamp(
      currentState.institutionalStrength * 0.95 + 
      (newState.political * 0.4 + newState.resilience * 0.3) * 0.05 +
      Random.range(-0.02, 0.02),
      0.1, 0.95
    );
    
    // Update public trust based on social stability and institutional strength
    newState.publicTrust = MathUtils.clamp(
      currentState.publicTrust * 0.9 + 
      (newState.social * 0.4 + newState.institutionalStrength * 0.3) * 0.1 +
      Random.range(-0.03, 0.03),
      0.1, 0.9
    );
    
    // Calculate changes for reporting
    const changes = {
      politicalChange: newState.political - currentState.political,
      socialChange: newState.social - currentState.social,
      economicChange: newState.economic - currentState.economic,
      overallChange: newState.overall - currentState.overall,
      cohesionChange: newState.cohesion - currentState.cohesion,
      volatilityChange: newState.volatility - currentState.volatility,
      resilienceChange: newState.resilience - currentState.resilience
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { StabilitySystem };