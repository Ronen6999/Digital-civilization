const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class IntrospectionEngine {
  constructor() {
    this.selfReflectionHistory = [];
  }

  getDefaultState() {
    return {
      selfAwareness: 0.5,
      reflectionDepth: 0.6,
      learningRate: 0.1,
      cognitiveDissonance: 0.2,
      metacognitiveAwareness: 0.4,
      selfConsistency: 0.7,
      introspectionHistory: [],
      insightGenerationRate: 0.3,
      selfModel: {
        beliefs: {},
        goals: {},
        preferences: {},
        capabilities: {},
        limitations: {}
      }
    };
  }

  async update(currentState, inputData, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Perform self-reflection based on inputs
    const reflectionResult = this.performSelfReflection(newState, inputData, cycleNumber);
    
    // Update self-awareness based on reflection quality
    newState.selfAwareness = MathUtils.clamp(
      newState.selfAwareness * 0.8 + reflectionResult.reflectionQuality * 0.2 + Random.range(-0.03, 0.03),
      0.1, 1
    );
    
    // Update reflection depth based on complexity of thoughts
    newState.reflectionDepth = MathUtils.clamp(
      newState.reflectionDepth * 0.9 + reflectionResult.thoughtComplexity * 0.1 + Random.range(-0.02, 0.02),
      0.1, 1
    );
    
    // Update cognitive dissonance based on conflicting beliefs/actions
    newState.cognitiveDissonance = this.calculateCognitiveDissonance(newState, inputData);
    
    // Update self-consistency based on alignment of beliefs, emotions, and actions
    newState.selfConsistency = this.calculateSelfConsistency(newState, inputData);
    
    // Update metacognitive awareness based on self-monitoring
    newState.metacognitiveAwareness = MathUtils.clamp(
      newState.metacognitiveAwareness * 0.85 + newState.selfAwareness * 0.15,
      0.1, 1
    );
    
    // Update learning rate based on successful insights
    newState.learningRate = MathUtils.clamp(
      newState.learningRate * 0.9 + reflectionResult.insightfulness * 0.1,
      0.01, 0.5
    );
    
    // Update insight generation rate based on reflection activity
    newState.insightGenerationRate = MathUtils.clamp(
      newState.insightGenerationRate * 0.9 + reflectionResult.novelty * 0.1,
      0.1, 1
    );
    
    // Update self-model based on reflections
    newState.selfModel = this.updateSelfModel(newState.selfModel, inputData, reflectionResult);
    
    // Record introspection
    const introspectionRecord = {
      cycle: cycleNumber,
      timestamp: new Date().toISOString(),
      selfAwareness: newState.selfAwareness,
      reflectionDepth: newState.reflectionDepth,
      cognitiveDissonance: newState.cognitiveDissonance,
      selfConsistency: newState.selfConsistency,
      insights: reflectionResult.insights,
      selfAssessment: reflectionResult.selfAssessment
    };
    
    newState.introspectionHistory.push(introspectionRecord);
    
    // Keep only the last N introspections to prevent unbounded growth
    if (newState.introspectionHistory.length > 50) {
      newState.introspectionHistory = newState.introspectionHistory.slice(-50);
    }
    
    // Calculate changes for reporting
    const changes = {
      selfAwarenessChange: newState.selfAwareness - currentState.selfAwareness,
      reflectionDepthChange: newState.reflectionDepth - currentState.reflectionDepth,
      cognitiveDissonanceChange: newState.cognitiveDissonance - currentState.cognitiveDissonance,
      selfConsistencyChange: newState.selfConsistency - currentState.selfConsistency,
      metacognitiveAwarenessChange: newState.metacognitiveAwareness - currentState.metacognitiveAwareness
    };

    // Calculate actions based on introspection
    const actions = {
      insights: reflectionResult.insights,
      selfAdjustments: reflectionResult.selfAdjustments,
      goalRealignments: reflectionResult.goalRealignments,
      behavioralRecommendations: reflectionResult.behavioralRecommendations
    };

    return {
      newState,
      changes,
      actions
    };
  }

  performSelfReflection(state, inputData, cycleNumber) {
    // Analyze internal state vs external observations
    const internalConsistency = this.checkInternalConsistency(state, inputData);
    
    // Generate insights based on discrepancies
    const insights = this.generateInsights(state, inputData, internalConsistency);
    
    // Assess self based on performance and alignment
    const selfAssessment = this.performSelfAssessment(state, inputData);
    
    // Generate self-adjustments based on reflection
    const selfAdjustments = this.generateSelfAdjustments(state, inputData);
    
    // Realign goals if needed
    const goalRealignments = this.checkGoalAlignment(state, inputData);
    
    // Generate behavioral recommendations
    const behavioralRecommendations = this.generateBehavioralRecommendations(state, inputData);
    
    // Calculate metrics for reflection quality
    const reflectionQuality = MathUtils.clamp(
      (internalConsistency.alignment + selfAssessment.acuity) / 2,
      0.1, 1
    );
    
    const thoughtComplexity = MathUtils.clamp(
      (insights.length * 0.3) + (selfAssessment.depth * 0.4) + (selfAdjustments.length * 0.3),
      0.1, 1
    );
    
    const insightfulness = insights.length > 0 ? 
      insights.reduce((sum, insight) => sum + insight.significance, 0) / insights.length : 0;
    
    const novelty = this.calculateNovelty(insights, state.introspectionHistory);
    
    return {
      reflectionQuality,
      thoughtComplexity,
      insightfulness,
      novelty,
      internalConsistency,
      insights,
      selfAssessment,
      selfAdjustments,
      goalRealignments,
      behavioralRecommendations
    };
  }

  checkInternalConsistency(state, inputData) {
    // Check consistency between beliefs, emotions, and actions
    const beliefEmotionAlignment = this.calculateCorrelation(
      state.selfModel.beliefs, 
      inputData.emotions?.currentEmotions || {}
    );
    
    const beliefActionAlignment = this.calculateCorrelation(
      state.selfModel.beliefs, 
      inputData.interventions || []
    );
    
    const emotionActionAlignment = this.calculateEmotionActionAlignment(
      inputData.emotions?.currentEmotions || {},
      inputData.interventions || []
    );
    
    return {
      beliefEmotionAlignment,
      beliefActionAlignment,
      emotionActionAlignment,
      alignment: (beliefEmotionAlignment + beliefActionAlignment + emotionActionAlignment) / 3
    };
  }

  calculateCorrelation(data1, data2) {
    // Simplified correlation calculation
    // In a real implementation, this would be more sophisticated
    if (!data1 || !data2) return 0.5;
    
    // Just return a random value for now as a placeholder
    return Random.range(0.3, 0.9);
  }

  calculateEmotionActionAlignment(emotions, actions) {
    // Check if emotional state aligns with actions taken
    if (!emotions || !actions || actions.length === 0) return 0.5;
    
    // Placeholder implementation
    return Random.range(0.4, 0.8);
  }

  generateInsights(state, inputData, internalConsistency) {
    const insights = [];
    
    // Generate insights based on low consistency scores
    if (internalConsistency.alignment < 0.5) {
      insights.push({
        type: 'consistency_issue',
        description: 'Detected inconsistency between beliefs, emotions, and actions',
        significance: 0.8,
        suggestedAction: 'Review belief-emotion-action alignment'
      });
    }
    
    // Generate insights based on world changes
    for (const [systemName, changes] of Object.entries(inputData)) {
      if (['beliefs', 'emotions', 'predictions', 'interventions', 'timestamp', 'cycle'].includes(systemName)) continue;
      
      for (const [changeName, changeValue] of Object.entries(changes)) {
        if (Math.abs(changeValue) > 0.1) { // Significant change
          insights.push({
            type: 'world_observation',
            description: `Significant change in ${systemName}.${changeName}: ${changeValue.toFixed(3)}`,
            significance: Math.abs(changeValue),
            suggestedAction: `Consider updating beliefs about ${systemName}.${changeName}`
          });
        }
      }
    }
    
    // Generate insights about own performance
    if (state.cognitiveDissonance > 0.6) {
      insights.push({
        type: 'self_performance',
        description: 'High cognitive dissonance detected',
        significance: 0.7,
        suggestedAction: 'Resolve conflicting beliefs or adjust expectations'
      });
    }
    
    if (state.selfConsistency < 0.5) {
      insights.push({
        type: 'self_performance',
        description: 'Low self-consistency detected',
        significance: 0.6,
        suggestedAction: 'Align beliefs, emotions, and actions'
      });
    }
    
    return insights;
  }

  performSelfAssessment(state, inputData) {
    // Assess own performance across dimensions
    const acuity = MathUtils.clamp(
      (state.selfAwareness + state.reflectionDepth + state.metacognitiveAwareness) / 3,
      0.1, 1
    );
    
    const depth = state.reflectionDepth;
    
    const capabilityAssessment = {
      predictionAccuracy: inputData.predictions?.forecastAccuracy || 0.7,
      interventionSuccess: inputData.interventions?.successRate || 0.5,
      beliefCoherence: inputData.beliefs?.coherence || 0.8
    };
    
    return {
      acuity,
      depth,
      capabilityAssessment
    };
  }

  generateSelfAdjustments(state, inputData) {
    const adjustments = [];
    
    // Suggest adjustments based on assessment
    if (state.selfAwareness < 0.6) {
      adjustments.push({
        target: 'selfAwareness',
        adjustment: 'increase',
        reason: 'Low self-awareness detected',
        magnitude: 0.1
      });
    }
    
    if (state.cognitiveDissonance > 0.6) {
      adjustments.push({
        target: 'beliefSystem',
        adjustment: 'harmonize',
        reason: 'High cognitive dissonance detected',
        magnitude: 0.15
      });
    }
    
    if (state.reflectionDepth < 0.5) {
      adjustments.push({
        target: 'reflectionProcess',
        adjustment: 'deepen',
        reason: 'Shallow reflection detected',
        magnitude: 0.2
      });
    }
    
    return adjustments;
  }

  checkGoalAlignment(state, inputData) {
    // Check if current goals align with observed outcomes
    const realignments = [];
    
    // Placeholder implementation
    if (Random.random() > 0.8) { // Occasionally suggest goal realignment
      realignments.push({
        goalType: 'interventionStrategy',
        suggestedChange: 'Focus more on stability if entropy is increasing',
        confidence: 0.7
      });
    }
    
    return realignments;
  }

  generateBehavioralRecommendations(state, inputData) {
    const recommendations = [];
    
    // Generate recommendations based on current state
    if (state.cognitiveDissonance > 0.6) {
      recommendations.push({
        behavior: 'reflective_pause',
        urgency: 'high',
        reason: 'High cognitive dissonance requires reflection',
        duration: 2 // cycles
      });
    }
    
    if (state.selfAwareness < 0.5) {
      recommendations.push({
        behavior: 'increased_monitoring',
        urgency: 'medium',
        reason: 'Low self-awareness requires more self-monitoring',
        duration: 5 // cycles
      });
    }
    
    // Based on world conditions
    if (inputData.entropy?.current > 0.7) {
      recommendations.push({
        behavior: 'stabilizing_interventions',
        urgency: 'high',
        reason: 'High entropy in world systems',
        duration: 3 // cycles
      });
    }
    
    return recommendations;
  }

  calculateCognitiveDissonance(state, inputData) {
    // Calculate cognitive dissonance based on inconsistencies
    // This is a simplified model
    const beliefActionMismatch = inputData.interventions 
      ? Math.abs(inputData.beliefs?.confidence - inputData.interventions?.successRate) * 0.3
      : 0.1;
      
    const emotionActionMismatch = inputData.interventions 
      ? Math.abs(inputData.emotions?.regulation - inputData.interventions?.initiativeLevel) * 0.2
      : 0.1;
      
    const predictionRealityMismatch = Math.abs(state.selfModel.beliefs?.accuracy || 0.7 - 0.7) * 0.5;
    
    // Combine and normalize
    const rawDissonance = (beliefActionMismatch + emotionActionMismatch + predictionRealityMismatch) / 3;
    
    return MathUtils.clamp(rawDissonance + Random.range(-0.05, 0.05), 0.05, 0.95);
  }

  calculateSelfConsistency(state, inputData) {
    // Calculate self-consistency based on alignment of internal states
    const beliefEmotionAlignment = inputData.beliefs && inputData.emotions 
      ? Math.abs(inputData.beliefs.confidence - (Object.values(inputData.emotions.currentEmotions || {}).reduce((a, b) => a + b, 0) / Object.keys(inputData.emotions.currentEmotions || {}).length))
      : 0.5;
      
    const beliefActionAlignment = inputData.beliefs && inputData.interventions 
      ? Math.abs(inputData.beliefs.confidence - inputData.interventions.initiativeLevel)
      : 0.5;
      
    const emotionActionAlignment = inputData.emotions && inputData.interventions 
      ? Math.abs((Object.values(inputData.emotions.currentEmotions || {}).reduce((a, b) => a + b, 0) / Object.keys(inputData.emotions.currentEmotions || {}).length) - inputData.interventions.initiativeLevel)
      : 0.5;
    
    const consistencyScore = 1 - ((beliefEmotionAlignment + beliefActionAlignment + emotionActionAlignment) / 3);
    
    return MathUtils.clamp(consistencyScore + Random.range(-0.05, 0.05), 0.1, 0.99);
  }

  updateSelfModel(selfModel, inputData, reflectionResult) {
    // Update the self-model based on new information
    const updatedModel = { ...selfModel };
    
    // Update beliefs about own capabilities
    updatedModel.capabilities = {
      ...updatedModel.capabilities,
      prediction: inputData.predictions?.accuracy || 0.7,
      intervention: inputData.interventions?.successRate || 0.5,
      emotional: inputData.emotions?.regulation || 0.6,
      reflective: reflectionResult.reflectionQuality || 0.6
    };
    
    // Update beliefs about own limitations
    updatedModel.limitations = {
      ...updatedModel.limitations,
      cognitiveDissonance: inputData.cognitiveDissonance || 0.3,
      predictionHorizon: inputData.predictions?.predictionHorizon || 10,
      emotionalRegulation: inputData.emotions?.regulation || 0.6
    };
    
    // Update goals based on insights
    if (reflectionResult.insights.length > 0) {
      updatedModel.goals = {
        ...updatedModel.goals,
        consistency: inputData.selfConsistency || 0.7,
        stability: inputData.stability?.overall || 0.8,
        adaptation: reflectionResult.thoughtComplexity || 0.5
      };
    }
    
    return updatedModel;
  }

  calculateNovelty(insights, history) {
    // Calculate how novel the current insights are compared to previous ones
    if (history.length === 0 || insights.length === 0) {
      return 0.5; // Default novelty if no history
    }
    
    // Simple novelty calculation - in practice, this would be more sophisticated
    return Random.range(0.3, 0.9);
  }
}

module.exports = { IntrospectionEngine };