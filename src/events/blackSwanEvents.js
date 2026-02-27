const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class BlackSwanEvents {
  constructor() {
    this.eventTypes = [
      {
        name: 'Global Pandemic',
        probability: 0.001,
        impact: {
          population: { health: -0.3, happiness: -0.25 },
          economy: { growthRate: -0.15, marketConfidence: -0.4 },
          stability: { social: -0.2, overall: -0.18 }
        },
        duration: 20
      },
      {
        name: 'Technological Singularity',
        probability: 0.0005,
        impact: {
          technology: { level: 0.5, innovationRate: 0.2 },
          economy: { productivity: 0.4, growthRate: 0.1 },
          society: { adaptability: 0.3 }
        },
        duration: 50
      },
      {
        name: 'Economic Collapse',
        probability: 0.005,
        impact: {
          economy: { resources: -0.4, marketConfidence: -0.5, employment: -0.3 },
          population: { happiness: -0.3, health: -0.1 },
          stability: { economic: -0.4, overall: -0.3 }
        },
        duration: 30
      },
      {
        name: 'Natural Disaster',
        probability: 0.02,
        impact: {
          population: { count: -0.05, happiness: -0.2 },
          economy: { resources: -0.15, tradeVolume: -0.2 },
          infrastructure: { damage: 0.3 }
        },
        duration: 10
      },
      {
        name: 'Revolution',
        probability: 0.01,
        impact: {
          stability: { political: -0.4, social: -0.3, overall: -0.35 },
          population: { happiness: -0.2, trust: -0.3 },
          economy: { marketConfidence: -0.3 }
        },
        duration: 15
      },
      {
        name: 'Resource Discovery',
        probability: 0.015,
        impact: {
          economy: { resources: 0.3, growthRate: 0.1 },
          technology: { researchInvestment: 0.2 },
          population: { happiness: 0.15 }
        },
        duration: 25
      },
      {
        name: 'AI Breakthrough',
        probability: 0.01,
        impact: {
          technology: { level: 0.2, innovationRate: 0.15 },
          economy: { productivity: 0.2, employment: -0.1 }, // Mixed effect
          society: { adaptability: 0.2 }
        },
        duration: 40
      }
    ];
    
    this.activeEvents = new Map();
  }

  generateEvent(worldState, cycleNumber) {
    // Adjust probabilities based on current world state
    const adjustedEvents = this.adjustProbabilities(worldState);
    
    // Check for each event type based on its adjusted probability
    for (const eventType of adjustedEvents) {
      if (Random.random() < eventType.adjustedProbability) {
        // Event triggered!
        const eventId = `${eventType.name.toLowerCase().replace(/\s+/g, '_')}_${cycleNumber}_${Date.now()}`;
        
        const event = {
          id: eventId,
          name: eventType.name,
          type: 'black_swan',
          timestamp: new Date().toISOString(),
          cycleTriggered: cycleNumber,
          impact: { ...eventType.impact },
          duration: eventType.duration,
          remainingDuration: eventType.duration,
          severity: Random.range(0.7, 1.3) // Random severity multiplier
        };
        
        // Apply severity multiplier to impacts
        this.multiplyImpact(event.impact, event.severity);
        
        // Add to active events
        this.activeEvents.set(eventId, event);
        
        return event;
      }
    }
    
    return null; // No event triggered
  }

  multiplyImpact(impact, multiplier) {
    for (const [system, changes] of Object.entries(impact)) {
      for (const [param, value] of Object.entries(changes)) {
        changes[param] = value * multiplier;
      }
    }
  }

  getActiveEvents() {
    return Array.from(this.activeEvents.values());
  }

  updateActiveEvents() {
    // Update durations and remove expired events
    for (const [eventId, event] of this.activeEvents.entries()) {
      event.remainingDuration--;
      
      if (event.remainingDuration <= 0) {
        this.activeEvents.delete(eventId);
      }
    }
  }

  getEventImpact(cycleNumber) {
    const totalImpact = {};
    
    for (const event of this.activeEvents.values()) {
      for (const [system, changes] of Object.entries(event.impact)) {
        if (!totalImpact[system]) {
          totalImpact[system] = {};
        }
        
        for (const [param, value] of Object.entries(changes)) {
          if (!totalImpact[system][param]) {
            totalImpact[system][param] = 0;
          }
          totalImpact[system][param] += value;
        }
      }
    }
    
    return totalImpact;
  }

  adjustProbabilities(worldState) {
    // Adjust probabilities based on current world state
    // For example, unstable societies might have higher revolution probability
    const adjustedEvents = this.eventTypes.map(event => {
      let adjustedProbability = event.probability;
      
      // Increase revolution probability if stability is low
      if (event.name === 'Revolution' && worldState.systems?.stability) {
        const stabilityOverall = worldState.systems.stability.overall || 0.8;
        adjustedProbability *= (1.5 - stabilityOverall); // Lower stability = higher probability
      }
      
      // Increase pandemic probability if population density is high
      if (event.name === 'Global Pandemic' && worldState.systems?.population) {
        const urbanization = worldState.systems.population.urbanization || 0.6;
        adjustedProbability *= (0.8 + urbanization * 0.5); // More urbanized = higher probability
      }
      
      // Increase economic collapse probability if economy is unstable
      if (event.name === 'Economic Collapse' && worldState.systems?.economy) {
        const marketConfidence = worldState.systems.economy.marketConfidence || 0.8;
        const inflation = worldState.systems.economy.inflation || 0.02;
        adjustedProbability *= (1.5 - marketConfidence + inflation * 5);
      }
      
      return {
        ...event,
        adjustedProbability: MathUtils.clamp(adjustedProbability, 0, event.probability * 3)
      };
    });
    
    return adjustedEvents;
  }
}

module.exports = { BlackSwanEvents };