const { MathUtils } = require('../utils/math');

class PerceptionLayer {
  constructor() {
    // Define what the machine perceives and how it filters raw world data
    this.perceptionFilters = {
      // How the machine interprets economic data
      economy: {
        relevance: 0.8,
        noiseFactor: 0.1, // How much noise is added to perception
        aggregationWindow: 3, // Cycles to smooth data
        importanceWeight: 0.25
      },
      // How the machine interprets population data
      population: {
        relevance: 0.7,
        noiseFactor: 0.15,
        aggregationWindow: 5,
        importanceWeight: 0.2
      },
      // How the machine interprets technology data
      technology: {
        relevance: 0.9,
        noiseFactor: 0.05,
        aggregationWindow: 2,
        importanceWeight: 0.2
      },
      // How the machine interprets stability data
      stability: {
        relevance: 0.95,
        noiseFactor: 0.08,
        aggregationWindow: 2,
        importanceWeight: 0.25
      },
      // How the machine interprets entropy data
      entropy: {
        relevance: 0.85,
        noiseFactor: 0.12,
        aggregationWindow: 3,
        importanceWeight: 0.15
      },
      // How the machine interprets resistance data
      resistance: {
        relevance: 0.6,
        noiseFactor: 0.2,
        aggregationWindow: 4,
        importanceWeight: 0.15
      },
      // How the machine interprets its own influence
      machineInfluence: {
        relevance: 1.0,
        noiseFactor: 0.05,
        aggregationWindow: 1,
        importanceWeight: 0.3
      }
    };

    // Store historical data for smoothing
    this.historicalData = new Map();
    
    // Store trends for each system
    this.trends = {
      economy: [],
      population: [],
      technology: [],
      stability: [],
      entropy: [],
      resistance: [],
      maxTrendLength: 20
    };
  }

  /**
   * Convert raw world state into machine-perceivable format
   */
  perceiveWorldState(rawWorldState, machineState, cycleNumber) {
    // Apply perception filters to raw world data
    const perceivedState = {
      timestamp: rawWorldState.timestamp,
      cycle: rawWorldState.cycle,
      systems: {},
      trends: this.calculateTrends(rawWorldState),
      anomalies: this.detectAnomalies(rawWorldState),
      confidence: this.calculatePerceptionConfidence(rawWorldState, machineState)
    };

    // Process each system through perception filters
    for (const [systemName, systemData] of Object.entries(rawWorldState.systems)) {
      perceivedState.systems[systemName] = this.filterSystemData(systemName, systemData, cycleNumber);
    }

    // Add machine-specific perceptions
    perceivedState.machineInfluence = this.calculateMachineInfluencePerception(machineState);

    return perceivedState;
  }

  /**
   * Apply perception filters to system data
   */
  filterSystemData(systemName, systemData, cycleNumber) {
    const filter = this.perceptionFilters[systemName] || {
      relevance: 0.5,
      noiseFactor: 0.1,
      aggregationWindow: 3,
      importanceWeight: 0.1
    };

    let filteredData = {};

    // Apply noise and relevance filtering to each parameter
    for (const [paramName, paramValue] of Object.entries(systemData)) {
      // Add perception noise
      const noise = (Math.random() - 0.5) * 2 * filter.noiseFactor;
      const noisyValue = paramValue + noise;

      // Apply relevance weighting
      const perceivedValue = noisyValue * filter.relevance;

      filteredData[paramName] = perceivedValue;
    }

    // Apply smoothing if aggregation window is greater than 1
    if (filter.aggregationWindow > 1) {
      filteredData = this.applyTemporalSmoothing(systemName, filteredData, cycleNumber, filter.aggregationWindow);
    }

    return filteredData;
  }

  /**
   * Apply temporal smoothing to reduce noise over time
   */
  applyTemporalSmoothing(systemName, currentData, cycleNumber, windowSize) {
    const systemKey = `temporal_${systemName}`;
    
    if (!this.historicalData.has(systemKey)) {
      this.historicalData.set(systemKey, []);
    }

    const history = this.historicalData.get(systemKey);
    history.push({ cycle: cycleNumber, data: currentData });

    // Keep only the last windowSize entries
    if (history.length > windowSize) {
      history.shift();
    }

    // Calculate smoothed values
    const smoothedData = {};
    for (const paramName in currentData) {
      const values = history.map(entry => entry.data[paramName]);
      smoothedData[paramName] = values.reduce((sum, val) => sum + val, 0) / values.length;
    }

    return smoothedData;
  }

  /**
   * Calculate trends based on historical data
   */
  calculateTrends(rawWorldState) {
    const trends = {};

    for (const [systemName, systemData] of Object.entries(rawWorldState.systems)) {
      trends[systemName] = {};

      for (const [paramName, paramValue] of Object.entries(systemData)) {
        const trendKey = `${systemName}.${paramName}`;
        
        if (!this.trends[trendKey]) {
          this.trends[trendKey] = [];
        }

        // Add current value to trend history
        this.trends[trendKey].push({
          value: paramValue,
          timestamp: rawWorldState.timestamp
        });

        // Limit trend history
        if (this.trends[trendKey].length > this.trends.maxTrendLength) {
          this.trends[trendKey].shift();
        }

        // Calculate trend metrics
        trends[systemName][paramName] = this.calculateTrendMetrics(this.trends[trendKey]);
      }
    }

    return trends;
  }

  /**
   * Calculate trend metrics (slope, momentum, acceleration)
   */
  calculateTrendMetrics(history) {
    if (history.length < 2) {
      return {
        direction: 0,
        momentum: 0,
        acceleration: 0,
        strength: 0
      };
    }

    // Calculate simple linear trend (direction and momentum)
    const oldest = history[0].value;
    const newest = history[history.length - 1].value;
    const direction = newest - oldest;
    const momentum = direction / history.length;

    // Calculate acceleration if we have enough data
    let acceleration = 0;
    if (history.length >= 3) {
      const middle = history[Math.floor(history.length / 2)].value;
      const firstHalf = (middle - oldest) / (history.length / 2);
      const secondHalf = (newest - middle) / (history.length - Math.floor(history.length / 2));
      acceleration = secondHalf - firstHalf;
    }

    // Calculate trend strength (how consistent the trend is)
    let strength = 0;
    if (history.length > 1) {
      let consistentChanges = 0;
      for (let i = 1; i < history.length; i++) {
        const prev = history[i - 1].value;
        const curr = history[i].value;
        const change = curr - prev;
        
        // Check if direction is consistent with overall trend
        if ((direction > 0 && change > 0) || (direction < 0 && change < 0)) {
          consistentChanges++;
        }
      }
      strength = consistentChanges / (history.length - 1);
    }

    return {
      direction,
      momentum,
      acceleration,
      strength
    };
  }

  /**
   * Detect anomalies in the world state
   */
  detectAnomalies(rawWorldState) {
    const anomalies = [];

    for (const [systemName, systemData] of Object.entries(rawWorldState.systems)) {
      for (const [paramName, paramValue] of Object.entries(systemData)) {
        const trendKey = `${systemName}.${paramName}`;
        const history = this.trends[trendKey] || [];

        if (history.length > 1) {
          // Calculate expected value based on trend
          const recentValues = history.slice(-3).map(h => h.value);
          const avgRecent = recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
          
          // Calculate deviation from expected
          const deviation = Math.abs(paramValue - avgRecent);
          
          // Define anomaly threshold (this could be configurable)
          const threshold = 0.1; // 10% of typical value range
          
          if (deviation > threshold) {
            anomalies.push({
              system: systemName,
              parameter: paramName,
              actualValue: paramValue,
              expectedValue: avgRecent,
              deviation,
              severity: deviation > threshold * 2 ? 'high' : 'medium'
            });
          }
        }
      }
    }

    return anomalies;
  }

  /**
   * Calculate how confident the machine should be in its perception
   */
  calculatePerceptionConfidence(rawWorldState, machineState) {
    // Confidence depends on several factors:
    // 1. Data consistency
    // 2. Machine's own belief confidence
    // 3. System stability
    // 4. Noise levels in perception

    let baseConfidence = 0.7; // Base confidence level

    // Adjust for system stability
    if (rawWorldState.systems.stability) {
      baseConfidence += (rawWorldState.systems.stability.overall - 0.5) * 0.2;
    }

    // Adjust for entropy (more entropy = less confidence)
    if (rawWorldState.systems.entropy) {
      baseConfidence -= rawWorldState.systems.entropy.current * 0.3;
    }

    // Adjust for machine's belief confidence
    if (machineState.beliefSystem && machineState.beliefSystem.confidence) {
      baseConfidence += (machineState.beliefSystem.confidence - 0.7) * 0.1;
    }

    // Apply bounds
    return MathUtils.clamp(baseConfidence, 0.1, 1.0);
  }

  /**
   * Calculate how the machine perceives its own influence
   */
  calculateMachineInfluencePerception(machineState) {
    // The machine's perception of its influence may differ from actual influence
    const perceivedInfluence = {
      actualInterventions: machineState.interventionEngine?.activeInterventions?.length || 0,
      perceivedEffectiveness: machineState.interventionEngine?.successRate || 0.5,
      beliefInOwnCapabilities: machineState.beliefSystem?.confidence || 0.5,
      emotionalCertainty: machineState.emotionSystem?.regulation || 0.5,
      introspectiveClarity: machineState.introspectionEngine?.selfAwareness || 0.5
    };

    return perceivedInfluence;
  }

  /**
   * Get derived metrics that summarize the world state
   */
  getDerivedMetrics(perceivedState) {
    const metrics = {
      overallStability: perceivedState.systems.stability?.overall || 0.5,
      systemicRisk: this.calculateSystemicRisk(perceivedState),
      changeVelocity: this.calculateChangeVelocity(perceivedState),
      coherence: this.calculateCoherence(perceivedState),
      opportunityLevel: this.calculateOpportunityLevel(perceivedState)
    };

    return metrics;
  }

  /**
   * Calculate systemic risk based on various factors
   */
  calculateSystemicRisk(perceivedState) {
    let risk = 0;

    // High entropy increases risk
    if (perceivedState.systems.entropy) {
      risk += perceivedState.systems.entropy.current * 0.4;
    }

    // Low stability increases risk
    if (perceivedState.systems.stability) {
      risk += (1 - perceivedState.systems.stability.overall) * 0.3;
    }

    // High resistance can create risk
    if (perceivedState.systems.resistance) {
      risk += perceivedState.systems.resistance.toChange * 0.2;
    }

    // Anomalies indicate potential risk
    risk += Math.min(0.1, perceivedState.anomalies.length * 0.05);

    return MathUtils.clamp(risk, 0, 1);
  }

  /**
   * Calculate velocity of change across systems
   */
  calculateChangeVelocity(perceivedState) {
    let velocity = 0;
    let systemCount = 0;

    for (const [systemName, systemData] of Object.entries(perceivedState.systems)) {
      if (perceivedState.trends && perceivedState.trends[systemName]) {
        for (const [paramName, trendData] of Object.entries(perceivedState.trends[systemName])) {
          velocity += Math.abs(trendData.momentum);
          systemCount++;
        }
      }
    }

    return systemCount > 0 ? velocity / systemCount : 0;
  }

  /**
   * Calculate coherence across systems
   */
  calculateCoherence(perceivedState) {
    // Coherence measures how aligned different systems are in their trends
    const trendDirections = [];

    for (const [systemName, systemTrends] of Object.entries(perceivedState.trends)) {
      for (const [paramName, trendData] of Object.entries(systemTrends)) {
        if (typeof trendData.direction === 'number') {
          trendDirections.push(trendData.direction);
        }
      }
    }

    if (trendDirections.length === 0) return 0.5;

    // Calculate how many trends are moving in the same direction
    const positiveTrends = trendDirections.filter(dir => dir > 0).length;
    const negativeTrends = trendDirections.filter(dir => dir < 0).length;
    
    const alignment = Math.max(positiveTrends, negativeTrends) / trendDirections.length;
    return alignment;
  }

  /**
   * Calculate opportunity level based on change and stability
   */
  calculateOpportunityLevel(perceivedState) {
    // Opportunities exist when there's moderate change in a stable environment
    const change = this.calculateChangeVelocity(perceivedState);
    const stability = perceivedState.systems.stability?.overall || 0.5;
    
    // Optimal opportunities when there's some change but not chaos
    if (change > 0.3 || stability < 0.3) {
      return Math.min(change * stability * 2, 1); // Reduce opportunities in chaos
    } else {
      return change * stability * 1.5; // Amplify opportunities in stable change
    }
  }
}

module.exports = { PerceptionLayer };