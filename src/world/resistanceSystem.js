const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class ResistanceSystem {
  getDefaultState() {
    return {
      toChange: 0.3,
      toInnovation: 0.4,
      toTechnology: 0.25,
      toExternalInfluence: 0.35,
      toGovernmentPolicy: 0.28,
      adaptiveCapacity: 0.6,
      institutionalRigidity: 0.4,
      culturalConservatism: 0.5,
      resistanceNetworks: {
        traditionalists: 0.2,
        statusQuoPreservers: 0.3,
        changeAverseGroups: 0.25,
        riskAverseIndividuals: 0.35
      },
      acceptanceFactors: {
        familiarity: 0.6,
        trust: 0.55,
        perceivedBenefit: 0.65,
        socialProof: 0.5
      },
      changeThreshold: 0.7
    };
  }

  async update(currentState, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update resistance to change based on recent changes and system state
    const recentChangePressure = 0.1; // Placeholder - in real system this would come from other systems
    newState.toChange = MathUtils.clamp(
      currentState.toChange * 0.95 + recentChangePressure * 0.05 + Random.range(-0.02, 0.03),
      0.05, 0.95
    );
    
    // Update resistance to innovation based on technology level and innovation rate
    const innovationPressure = 0.1; // Placeholder - would come from technology system
    newState.toInnovation = MathUtils.clamp(
      currentState.toInnovation * 0.95 + innovationPressure * 0.08 + Random.range(-0.03, 0.03),
      0.05, 0.95
    );
    
    // Update resistance to technology based on technological advancement
    const technologyPressure = 0.05; // Placeholder - would come from technology system
    newState.toTechnology = MathUtils.clamp(
      currentState.toTechnology * 0.97 + technologyPressure * 0.05 + Random.range(-0.02, 0.02),
      0.05, 0.9
    );
    
    // Update resistance to external influence based on stability and autonomy
    const externalPressure = 0.08; // Placeholder - would come from stability system
    newState.toExternalInfluence = MathUtils.clamp(
      currentState.toExternalInfluence * 0.96 + externalPressure * 0.06 + Random.range(-0.02, 0.03),
      0.05, 0.95
    );
    
    // Update resistance to government policy based on political stability
    const policyPressure = 1 - (currentState.political || 0.7); // Lower political stability leads to more resistance
    newState.toGovernmentPolicy = MathUtils.clamp(
      currentState.toGovernmentPolicy * 0.95 + policyPressure * 0.07 + Random.range(-0.02, 0.03),
      0.05, 0.95
    );
    
    // Update adaptive capacity (inverse relationship with resistance)
    newState.adaptiveCapacity = MathUtils.clamp(
      currentState.adaptiveCapacity * 0.97 - 
      (newState.toChange * 0.1 + newState.toInnovation * 0.1) * 0.1 + 
      Random.range(-0.01, 0.02),
      0.05, 0.95
    );
    
    // Update institutional rigidity (directly related to resistance)
    newState.institutionalRigidity = MathUtils.clamp(
      currentState.institutionalRigidity * 0.98 + 
      (newState.toChange * 0.3 + newState.toInnovation * 0.2) * 0.05 + 
      Random.range(-0.01, 0.015),
      0.1, 0.9
    );
    
    // Update cultural conservatism based on tradition and stability factors
    newState.culturalConservatism = MathUtils.clamp(
      currentState.culturalConservatism * 0.98 + 
      (newState.toChange * 0.2 + newState.traditionalists) * 0.05 + 
      Random.range(-0.01, 0.015),
      0.1, 0.95
    );
    
    // Update resistance networks
    newState.resistanceNetworks.traditionalists = MathUtils.clamp(
      currentState.resistanceNetworks.traditionalists * 0.99 + 
      Random.range(-0.01, 0.02),
      0.05, 0.8
    );
    
    newState.resistanceNetworks.statusQuoPreservers = MathUtils.clamp(
      currentState.resistanceNetworks.statusQuoPreservers * 0.99 + 
      (1 - currentState.overall || 0.7) * 0.03 + // More resistance when stability is low
      Random.range(-0.01, 0.02),
      0.05, 0.8
    );
    
    newState.resistanceNetworks.changeAverseGroups = MathUtils.clamp(
      currentState.resistanceNetworks.changeAverseGroups * 0.99 + 
      newState.toChange * 0.05 + 
      Random.range(-0.01, 0.02),
      0.05, 0.8
    );
    
    newState.resistanceNetworks.riskAverseIndividuals = MathUtils.clamp(
      currentState.resistanceNetworks.riskAverseIndividuals * 0.99 + 
      (1 - currentState.confidenceIndex || 0.7) * 0.04 + // More resistance when confidence is low
      Random.range(-0.01, 0.02),
      0.05, 0.8
    );
    
    // Update acceptance factors (these reduce resistance)
    newState.acceptanceFactors.familiarity = MathUtils.clamp(
      currentState.acceptanceFactors.familiarity * 0.98 + 
      Random.range(-0.01, 0.02),
      0.05, 0.95
    );
    
    newState.acceptanceFactors.trust = MathUtils.clamp(
      currentState.acceptanceFactors.trust * 0.98 + 
      (currentState.publicTrust || 0.6) * 0.03 + // Higher trust reduces resistance
      Random.range(-0.01, 0.02),
      0.05, 0.95
    );
    
    newState.acceptanceFactors.perceivedBenefit = MathUtils.clamp(
      currentState.acceptanceFactors.perceivedBenefit * 0.98 + 
      Random.range(-0.01, 0.03),
      0.05, 0.95
    );
    
    newState.acceptanceFactors.socialProof = MathUtils.clamp(
      currentState.acceptanceFactors.socialProof * 0.98 + 
      (currentState.cohesion || 0.6) * 0.02 + // Higher cohesion increases social proof
      Random.range(-0.01, 0.02),
      0.05, 0.95
    );
    
    // Calculate aggregate resistance index
    const aggregateResistance = (
      newState.toChange * 0.25 +
      newState.toInnovation * 0.25 +
      newState.toTechnology * 0.2 +
      newState.toExternalInfluence * 0.15 +
      newState.toGovernmentPolicy * 0.15
    );
    
    // Update overall resistance based on aggregate
    newState.overall = aggregateResistance;
    
    // Calculate changes for reporting
    const changes = {
      toChangeChange: newState.toChange - currentState.toChange,
      toInnovationChange: newState.toInnovation - currentState.toInnovation,
      toTechnologyChange: newState.toTechnology - currentState.toTechnology,
      toExternalInfluenceChange: newState.toExternalInfluence - currentState.toExternalInfluence,
      toGovernmentPolicyChange: newState.toGovernmentPolicy - currentState.toGovernmentPolicy,
      adaptiveCapacityChange: newState.adaptiveCapacity - currentState.adaptiveCapacity,
      institutionalRigidityChange: newState.institutionalRigidity - currentState.institutionalRigidity
    };

    return {
      newState,
      changes,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = { ResistanceSystem };