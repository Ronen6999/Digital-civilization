const { BlackSwanEvents } = require('./blackSwanEvents');

class EventDispatcher {
  constructor() {
    this.subscribers = new Map();
    this.blackSwanEvents = new BlackSwanEvents();
    this.eventQueue = [];
    this.eventHistory = [];
    this.maxHistorySize = 1000;
  }

  subscribe(eventType, callback) {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType).push(callback);
    return () => this.unsubscribe(eventType, callback);
  }

  unsubscribe(eventType, callback) {
    if (this.subscribers.has(eventType)) {
      const callbacks = this.subscribers.get(eventType);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit(event) {
    // Add timestamp if not present
    if (!event.timestamp) {
      event.timestamp = new Date().toISOString();
    }
    
    // Add to queue for processing
    this.eventQueue.push(event);
    
    // Also add to history
    this.addToHistory(event);
    
    // Notify subscribers immediately
    this.notifySubscribers(event);
  }

  addToHistory(event) {
    this.eventHistory.push({ ...event });
    
    // Maintain max history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  notifySubscribers(event) {
    // Notify general subscribers (any event)
    if (this.subscribers.has('*')) {
      for (const callback of this.subscribers.get('*')) {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event subscriber:`, error);
        }
      }
    }
    
    // Notify specific event type subscribers
    if (this.subscribers.has(event.type)) {
      for (const callback of this.subscribers.get(event.type)) {
        try {
          callback(event);
        } catch (error) {
          console.error(`Error in event subscriber:`, error);
        }
      }
    }
  }

  async processEventQueue() {
    const eventsToProcess = [...this.eventQueue];
    this.eventQueue = []; // Clear the queue
    
    for (const event of eventsToProcess) {
      await this.handleEvent(event);
    }
  }

  async handleEvent(event) {
    switch (event.type) {
      case 'black_swarm':
      case 'black_swan':
        // Handle black swan events
        this.handleBlackSwanEvent(event);
        break;
        
      case 'world_change':
        // Handle world system changes
        this.handleWorldChangeEvent(event);
        break;
        
      case 'machine_action':
        // Handle machine intelligence actions
        this.handleMachineActionEvent(event);
        break;
        
      case 'intervention':
        // Handle interventions
        this.handleInterventionEvent(event);
        break;
        
      case 'system_alert':
        // Handle system alerts
        this.handleSystemAlertEvent(event);
        break;
        
      default:
        // For unknown event types, just emit to subscribers
        this.emit(event);
    }
  }

  handleBlackSwanEvent(event) {
    // Black swan events are already handled by the BlackSwanEvents class
    // This method exists to handle dispatched black swan events specifically
    console.log(`Black Swan Event: ${event.name} occurred at cycle ${event.cycleTriggered}`);
    
    // Could trigger additional logic here if needed
  }

  handleWorldChangeEvent(event) {
    // Process world change event
    console.log(`World change detected: ${event.system} changed by ${event.delta}`);
    
    // Could trigger additional logic here if needed
  }

  handleMachineActionEvent(event) {
    // Process machine action event
    console.log(`Machine action: ${event.actionType} performed`);
    
    // Could trigger additional logic here if needed
  }

  handleInterventionEvent(event) {
    // Process intervention event
    console.log(`Intervention applied: ${event.interventionType} to ${event.targetSystem}`);
    
    // Could trigger additional logic here if needed
  }

  handleSystemAlertEvent(event) {
    // Process system alert event
    console.log(`System Alert: ${event.alertType} - ${event.message}`);
    
    // Could trigger additional logic here if needed
  }

  async checkForBlackSwanEvents(worldState, cycleNumber) {
    // Check if any black swan events should occur
    const blackSwanEvent = this.blackSwanEvents.generateEvent(worldState, cycleNumber);
    
    if (blackSwanEvent) {
      this.emit(blackSwanEvent);
      return blackSwanEvent;
    }
    
    return null;
  }

  updateActiveEvents() {
    // Update active events (decrease duration, remove expired)
    this.blackSwanEvents.updateActiveEvents();
  }

  getActiveEvents() {
    return this.blackSwanEvents.getActiveEvents();
  }

  getEventImpact(cycleNumber) {
    return this.blackSwanEvents.getEventImpact(cycleNumber);
  }

  getRecentEvents(limit = 10) {
    return this.eventHistory.slice(-limit).reverse();
  }

  getEventsByType(type, limit = 10) {
    return this.eventHistory
      .filter(event => event.type === type)
      .slice(-limit)
      .reverse();
  }

  clearQueue() {
    this.eventQueue = [];
  }

  async processAllQueuedEvents() {
    while (this.eventQueue.length > 0) {
      await this.processEventQueue();
      // Small delay to prevent blocking
      await new Promise(resolve => setTimeout(resolve, 0));
    }
  }
}

module.exports = { EventDispatcher };