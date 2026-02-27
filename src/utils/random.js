class Random {
  static seed(seedValue) {
    // Simple seeded random generator
    this.seedValue = seedValue;
  }

  static random() {
    if (this.seedValue !== undefined) {
      // Seeded random using Mulberry32 algorithm
      let t = this.seedValue += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
    return Math.random();
  }

  static range(min, max) {
    return min + this.random() * (max - min);
  }

  static intRange(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  static choice(array) {
    if (array.length === 0) return undefined;
    return array[this.intRange(0, array.length - 1)];
  }

  static shuffle(array) {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
      const j = this.intRange(0, i);
      [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
  }

  static weightedChoice(itemsWithWeights) {
    const totalWeight = itemsWithWeights.reduce((sum, item) => sum + item.weight, 0);
    let random = this.random() * totalWeight;
    
    for (const item of itemsWithWeights) {
      random -= item.weight;
      if (random <= 0) {
        return item.value;
      }
    }
    
    // Fallback to last item
    return itemsWithWeights[itemsWithWeights.length - 1].value;
  }

  static normalize(value, min, max) {
    return (value - min) / (max - min);
  }

  static denormalize(normalizedValue, min, max) {
    return min + normalizedValue * (max - min);
  }
}

module.exports = { Random };