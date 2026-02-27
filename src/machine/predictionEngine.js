const { Random } = require('../utils/random');
const { MathUtils } = require('../utils/math');

class PredictionEngine {
  constructor() {
    this.models = new Map();
  }

  getDefaultState() {
    return {
      accuracy: 0.75,
      predictionHorizon: 10,
      confidence: 0.8,
      models: [],
      predictionQueue: [],
      forecastAccuracy: 0.7
    };
  }

  async update(currentState, worldChanges, cycleNumber) {
    // Create a copy of the current state to modify
    const newState = { ...currentState };
    
    // Update existing models with new data
    const updatedModels = [...currentState.models];
    
    // Process world changes to update models
    for (const [systemName, changes] of Object.entries(worldChanges)) {
      if (systemName === 'timestamp' || systemName === 'cycle') continue;
      
      for (const [changeName, changeValue] of Object.entries(changes)) {
        const modelName = `${systemName}.${changeName}`;
        let model = updatedModels.find(m => m.name === modelName);
        
        if (!model) {
          // Create new model for this parameter
          model = this.createModel(modelName, changeValue);
          updatedModels.push(model);
        } else {
          // Update existing model with new data point
          model.dataPoints.push({
            cycle: cycleNumber,
            value: changeValue,
            timestamp: new Date().toISOString()
          });
          
          // Keep only the last N data points to prevent unbounded growth
          if (model.dataPoints.length > 50) {
            model.dataPoints = model.dataPoints.slice(-50);
          }
          
          // Update model parameters based on new data
          this.updateModelParameters(model);
        }
      }
    }
    
    newState.models = updatedModels;
    
    // Generate new predictions
    const predictions = this.generatePredictions(newState, cycleNumber);
    newState.predictionQueue = [...predictions];
    
    // Update accuracy based on previous predictions
    newState.forecastAccuracy = this.updateForecastAccuracy(newState, worldChanges);
    
    // Update overall accuracy and confidence
    newState.accuracy = MathUtils.clamp(
      newState.accuracy * 0.8 + newState.forecastAccuracy * 0.2 + Random.range(-0.02, 0.02),
      0.1, 1
    );
    
    newState.confidence = MathUtils.clamp(
      newState.accuracy * 0.7 + (newState.predictionHorizon / 20) * 0.3 + Random.range(-0.05, 0.05),
      0.1, 1
    );
    
    // Calculate changes for reporting
    const changes = {
      accuracyChange: newState.accuracy - currentState.accuracy,
      confidenceChange: newState.confidence - currentState.confidence,
      modelCountChange: newState.models.length - currentState.models.length,
      forecastAccuracyChange: newState.forecastAccuracy - currentState.forecastAccuracy
    };

    // Calculate actions based on predictions
    const actions = {
      predictions: predictions,
      modelUpdates: this.getModelUpdates(currentState.models, newState.models),
      riskAssessments: this.assessRisks(predictions)
    };

    return {
      newState,
      changes,
      actions
    };
  }

  createModel(name, initialValue) {
    return {
      name,
      type: 'linear_trend',
      parameters: {
        slope: 0,
        intercept: initialValue,
        variance: 0.1
      },
      dataPoints: [{
        cycle: 0,
        value: initialValue,
        timestamp: new Date().toISOString()
      }],
      lastUpdated: 0,
      predictionCount: 0,
      accuracyHistory: []
    };
  }

  updateModelParameters(model) {
    if (model.dataPoints.length < 2) return;
    
    // Simple linear regression to update model parameters
    const n = model.dataPoints.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
    
    for (let i = 0; i < n; i++) {
      const point = model.dataPoints[i];
      const x = point.cycle;
      const y = point.value;
      
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    }
    
    const denominator = n * sumXX - sumX * sumX;
    if (denominator !== 0) {
      model.parameters.slope = (n * sumXY - sumX * sumY) / denominator;
      model.parameters.intercept = (sumY - model.parameters.slope * sumX) / n;
    }
    
    // Calculate variance
    let sumSquaredErrors = 0;
    for (let i = 0; i < n; i++) {
      const point = model.dataPoints[i];
      const predicted = model.parameters.slope * point.cycle + model.parameters.intercept;
      sumSquaredErrors += Math.pow(point.value - predicted, 2);
    }
    model.parameters.variance = sumSquaredErrors / n;
  }

  generatePredictions(state, currentCycle) {
    const predictions = [];
    
    for (const model of state.models) {
      const modelPredictions = [];
      
      for (let i = 1; i <= state.predictionHorizon; i++) {
        const futureCycle = currentCycle + i;
        const predictedValue = model.parameters.slope * futureCycle + model.parameters.intercept;
        
        // Add uncertainty based on model variance
        const uncertainty = Math.sqrt(model.parameters.variance) * MathUtils.gaussianRandom(0, 1);
        const finalPrediction = predictedValue + uncertainty;
        
        modelPredictions.push({
          cycle: futureCycle,
          value: finalPrediction,
          model: model.name,
          confidence: state.confidence * (1 - (i / state.predictionHorizon * 0.5)), // Lower confidence for further predictions
          timestamp: new Date(Date.now() + i * 1000).toISOString() // Approximate timestamp
        });
      }
      
      predictions.push({
        model: model.name,
        predictions: modelPredictions,
        confidence: state.confidence
      });
    }
    
    return predictions;
  }

  updateForecastAccuracy(state, actualChanges) {
    // Compare previous predictions with actual outcomes to update accuracy
    let correctPredictions = 0;
    let totalPredictions = 0;
    
    // For simplicity, we'll use a moving average of recent accuracy
    // In a real implementation, we would compare actual outcomes with predictions
    const baseAccuracy = state.forecastAccuracy || 0.7;
    
    // Apply some randomness to simulate the inherent uncertainty in predictions
    return MathUtils.clamp(
      baseAccuracy * 0.9 + Random.range(-0.05, 0.1),
      0.1, 1
    );
  }

  getModelUpdates(oldModels, newModels) {
    const updates = [];
    
    for (const newModel of newModels) {
      const oldModel = oldModels.find(m => m.name === newModel.name);
      
      if (!oldModel) {
        updates.push({ type: 'created', modelName: newModel.name });
      } else {
        // Check if parameters changed significantly
        const paramDiff = Math.abs(newModel.parameters.slope - oldModel.parameters.slope);
        if (paramDiff > 0.01) {
          updates.push({ 
            type: 'updated', 
            modelName: newModel.name, 
            oldParams: oldModel.parameters,
            newParams: newModel.parameters
          });
        }
      }
    }
    
    return updates;
  }

  assessRisks(predictions) {
    const risks = [];
    
    for (const predGroup of predictions) {
      for (const prediction of predGroup.predictions) {
        // Identify potentially risky predictions (extreme values, high volatility, etc.)
        if (Math.abs(prediction.value) > 0.5 || prediction.confidence < 0.5) {
          risks.push({
            model: prediction.model,
            cycle: prediction.cycle,
            value: prediction.value,
            confidence: prediction.confidence,
            riskLevel: prediction.confidence < 0.3 ? 'high' : 
                      prediction.confidence < 0.6 ? 'medium' : 'low',
            description: `Unusual prediction for ${prediction.model} at cycle ${prediction.cycle}`
          });
        }
      }
    }
    
    return risks;
  }
}

module.exports = { PredictionEngine };