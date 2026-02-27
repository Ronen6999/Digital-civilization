class TimeUtils {
  static getCurrentTimestamp() {
    return new Date().toISOString();
  }

  static formatDuration(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    const remainingSeconds = seconds % 60;
    const remainingMinutes = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m ${remainingSeconds}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  static parseDuration(durationString) {
    // Parse duration strings like "1h 30m 45s" or "2 days 3 hours"
    const durationRegex = /(\d+(?:\.\d+)?)\s*(milliseconds?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)/gi;
    let match;
    let totalMilliseconds = 0;
    
    while ((match = durationRegex.exec(durationString)) !== null) {
      const value = parseFloat(match[1]);
      const unit = match[2].toLowerCase();
      
      switch (unit) {
        case 'year':
        case 'years':
        case 'yr':
        case 'yrs':
        case 'y':
          totalMilliseconds += value * 365 * 24 * 60 * 60 * 1000;
          break;
        case 'week':
        case 'weeks':
        case 'w':
          totalMilliseconds += value * 7 * 24 * 60 * 60 * 1000;
          break;
        case 'day':
        case 'days':
        case 'd':
          totalMilliseconds += value * 24 * 60 * 60 * 1000;
          break;
        case 'hour':
        case 'hours':
        case 'hr':
        case 'hrs':
        case 'h':
          totalMilliseconds += value * 60 * 60 * 1000;
          break;
        case 'minute':
        case 'minutes':
        case 'min':
        case 'mins':
        case 'm':
          totalMilliseconds += value * 60 * 1000;
          break;
        case 'second':
        case 'seconds':
        case 'sec':
        case 'secs':
        case 's':
          totalMilliseconds += value * 1000;
          break;
        case 'millisecond':
        case 'milliseconds':
        case 'ms':
          totalMilliseconds += value;
          break;
      }
    }
    
    return totalMilliseconds;
  }

  static sleep(milliseconds) {
    return new Promise(resolve => setTimeout(resolve, milliseconds));
  }

  static async waitForCondition(conditionFn, timeoutMs = 10000, intervalMs = 100) {
    const startTime = Date.now();
    
    while (Date.now() - startTime < timeoutMs) {
      if (conditionFn()) {
        return true;
      }
      await this.sleep(intervalMs);
    }
    
    return false;
  }

  static calculateTimeAgo(date) {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    
    if (diffMs < 0) {
      return 'in the future';
    }
    
    if (diffMs < 1000) {
      return 'just now';
    }
    
    const diffSecs = Math.floor(diffMs / 1000);
    if (diffSecs < 60) {
      return `${diffSecs} seconds ago`;
    }
    
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) {
      return `${diffMins} minutes ago`;
    }
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    }
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 30) {
      return `${diffDays} days ago`;
    }
    
    const diffMonths = Math.floor(diffDays / 30);
    if (diffMonths < 12) {
      return `${diffMonths} months ago`;
    }
    
    const diffYears = Math.floor(diffDays / 365);
    return `${diffYears} years ago`;
  }

  static getDayOfYear(date = new Date()) {
    const start = new Date(date.getFullYear(), 0, 0);
    const diff = date - start;
    const oneDay = 1000 * 60 * 60 * 24;
    return Math.floor(diff / oneDay);
  }

  static getWeekNumber(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  }

  static isLeapYear(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  }

  static addTime(date, amount, unit) {
    const result = new Date(date);
    
    switch (unit.toLowerCase()) {
      case 'millisecond':
      case 'milliseconds':
      case 'ms':
        result.setMilliseconds(result.getMilliseconds() + amount);
        break;
      case 'second':
      case 'seconds':
      case 's':
        result.setSeconds(result.getSeconds() + amount);
        break;
      case 'minute':
      case 'minutes':
      case 'm':
        result.setMinutes(result.getMinutes() + amount);
        break;
      case 'hour':
      case 'hours':
      case 'h':
        result.setHours(result.getHours() + amount);
        break;
      case 'day':
      case 'days':
      case 'd':
        result.setDate(result.getDate() + amount);
        break;
      case 'week':
      case 'weeks':
      case 'w':
        result.setDate(result.getDate() + (amount * 7));
        break;
      case 'month':
      case 'months':
      case 'mo':
        result.setMonth(result.getMonth() + amount);
        break;
      case 'year':
      case 'years':
      case 'y':
        result.setFullYear(result.getFullYear() + amount);
        break;
    }
    
    return result;
  }

  static timeSince(start) {
    return Date.now() - start;
  }

  static measureExecution(fn) {
    const start = performance.now();
    const result = fn();
    
    if (result instanceof Promise) {
      return result.then(resolvedResult => {
        const end = performance.now();
        return {
          result: resolvedResult,
          executionTime: end - start
        };
      });
    }
    
    const end = performance.now();
    return {
      result,
      executionTime: end - start
    };
  }
}

module.exports = { TimeUtils };