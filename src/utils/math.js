class MathUtils {
  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  static normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  static denormalize(normalizedValue, min, max) {
    return min + normalizedValue * (max - min);
  }

  static gaussianRandom(mean = 0, stdDev = 1) {
    // Box-Muller transform
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    const z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    return z * stdDev + mean;
  }

  static sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
  }

  static relu(x) {
    return Math.max(0, x);
  }

  static softmax(values) {
    const maxVal = Math.max(...values);
    const expValues = values.map(v => Math.exp(v - maxVal));
    const sumExp = expValues.reduce((a, b) => a + b, 0);
    return expValues.map(v => v / sumExp);
  }

  static distance(point1, point2) {
    return Math.sqrt(
      Math.pow(point2.x - point1.x, 2) +
      Math.pow(point2.y - point1.y, 2)
    );
  }

  static euclideanDistance(arr1, arr2) {
    if (arr1.length !== arr2.length) {
      throw new Error('Arrays must have the same length');
    }
    
    const sum = arr1.reduce((acc, val, i) => acc + Math.pow(val - arr2[i], 2), 0);
    return Math.sqrt(sum);
  }

  static dotProduct(vec1, vec2) {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }
    
    return vec1.reduce((sum, val, i) => sum + val * vec2[i], 0);
  }

  static magnitude(vector) {
    return Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
  }

  static cosineSimilarity(vec1, vec2) {
    const dotProd = this.dotProduct(vec1, vec2);
    const mag1 = this.magnitude(vec1);
    const mag2 = this.magnitude(vec2);
    
    if (mag1 === 0 || mag2 === 0) {
      return 0;
    }
    
    return dotProd / (mag1 * mag2);
  }
}

module.exports = { MathUtils };