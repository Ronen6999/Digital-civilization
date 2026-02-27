# Digital Civilization Simulation - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Directory Structure](#directory-structure)
3. [Core Components](#core-components)
4. [World System Modules](#world-system-modules)
5. [Machine Intelligence Modules](#machine-intelligence-modules)
6. [Event System](#event-system)
7. [Logging System](#logging-system)
8. [State Management](#state-management)
9. [Utility Functions](#utility-functions)
10. [Data Files](#data-files)
11. [Scripts](#scripts)
12. [Configuration](#configuration)

## Project Overview

The Digital Civilization Simulation is a complex system designed to simulate the evolution of a digital civilization with interconnected world dynamics and machine intelligence. The simulation operates in cycles, with each cycle updating various world systems and machine behaviors.

### Key Concepts
- **Cyclical Processing**: The simulation advances in discrete time cycles
- **World Systems**: Various interconnected systems (economy, population, technology, etc.)
- **Machine Intelligence**: AI-like entity that observes, predicts, and intervenes
- **Event Handling**: Random events that can significantly impact the simulation
- **State Persistence**: All simulation data is saved and loaded between sessions

## Directory Structure

```
├── README.md
├── DOCUMENTATION.md (this file)
├── package.json
├── package-lock.json
├── .github/
│   └── workflows/
│       └── simulation.yml
├── data/
│   ├── world.json
│   ├── machine.json
│   ├── metadata.json
│   ├── cycles/
│   │   ├── raw/
│   │   └── summaries/
│   └── archives/
├── src/
│   ├── index.js
│   ├── core/
│   │   ├── simulationRunner.js
│   │   ├── worldEngine.js
│   │   ├── machineEngine.js
│   │   └── scheduler.js
│   ├── world/
│   │   ├── economySystem.js
│   │   ├── populationSystem.js
│   │   ├── technologySystem.js
│   │   ├── stabilitySystem.js
│   │   ├── entropySystem.js
│   │   └── resistanceSystem.js
│   ├── machine/
│   │   ├── beliefEngine.js
│   │   ├── emotionEngine.js
│   │   ├── predictionEngine.js
│   │   ├── interventionEngine.js
│   │   └── introspectionEngine.js
│   ├── events/
│   │   ├── blackSwanEvents.js
│   │   └── eventDispatcher.js
│   ├── logging/
│   │   ├── cycleLogger.js
│   │   ├── summaryGenerator.js
│   │   └── readmeUpdater.js
│   ├── state/
│   │   ├── stateLoader.js
│   │   └── stateSaver.js
│   └── utils/
│       ├── random.js
│       ├── math.js
│       └── time.js
└── scripts/
    ├── initializeWorld.js
    └── manualRun.js
```

## Core Components

### 1. simulationRunner.js
**Location**: `src/core/simulationRunner.js`

The central orchestrator of the simulation. It manages the execution flow, coordinates between world and machine engines, and handles state persistence.

#### Properties:
- `maxCycles`: Maximum number of cycles to run (default: 1000)
- `cycleInterval`: Interval between cycles in milliseconds (default: 1000)
- `saveFrequency`: How often to save state (default: every 10 cycles)

#### Methods:
- `initialize()`: Sets up the simulation with initial state
- `loadState()`: Loads world and machine states from data files
- `saveState()`: Saves current state to data files
- `runCycle()`: Executes a single simulation cycle
- `run()`: Starts the simulation loop
- `stop()`: Stops the simulation
- `togglePause()`: Pauses/resumes the simulation

#### Dependencies:
- WorldEngine, MachineEngine, Scheduler, CycleLogger, StateLoader, StateSaver

---

### 2. worldEngine.js
**Location**: `src/core/worldEngine.js`

Manages all world systems and their interactions. Coordinates updates across economy, population, technology, stability, entropy, and resistance systems.

#### Properties:
- `economySystem`: Manages economic indicators
- `populationSystem`: Manages population dynamics
- `technologySystem`: Manages technological advancement
- `stabilitySystem`: Manages political/social/economic stability
- `entropySystem`: Manages disorder and complexity
- `resistanceSystem`: Manages resistance to change

#### Methods:
- `initialize()`: Initializes all world systems
- `setState(newState)`: Updates the current state
- `getState()`: Returns current state
- `processCycle(cycleNumber)`: Processes updates for all systems
- `applyInterventions(interventions)`: Applies machine interventions

#### Dependencies:
- All system modules in `src/world/`

---

### 3. machineEngine.js
**Location**: `src/core/machineEngine.js`

Manages the machine intelligence that observes the world, makes predictions, and takes actions through interventions.

#### Properties:
- `beliefEngine`: Manages the machine's belief system
- `emotionEngine`: Manages the machine's emotional responses
- `predictionEngine`: Makes predictions about future states
- `interventionEngine`: Decides when and how to intervene
- `introspectionEngine`: Self-reflective capabilities

#### Methods:
- `initialize()`: Initializes all machine components
- `setState(newState)`: Updates the current state
- `getState()`: Returns current state
- `processCycle(cycleNumber, worldChanges)`: Processes world changes and generates actions

#### Dependencies:
- All engine modules in `src/machine/`

---

### 4. scheduler.js
**Location**: `src/core/scheduler.js`

Handles scheduling of periodic tasks and events within the simulation.

#### Properties:
- `tasks`: Array of scheduled tasks
- `runningTasks`: Map of currently executing tasks
- `isRunning`: Boolean indicating if scheduler is active

#### Methods:
- `addTask(taskFunction, intervalMs, taskName)`: Adds a new scheduled task
- `removeTask(taskId)`: Removes a scheduled task
- `pauseTask(taskId)`: Pauses a task
- `resumeTask(taskId)`: Resumes a paused task
- `run()`: Starts the scheduler loop
- `stop()`: Stops the scheduler

---

## World System Modules

### 1. economySystem.js
**Location**: `src/world/economySystem.js`

Manages economic indicators and dynamics.

#### Properties and Thresholds:
- `growthRate`: Economic growth rate (-0.1 to 0.1)
- `resources`: Available resources (min: 0)
- `tradeVolume`: Trade activity (no fixed bounds)
- `inflation`: Inflation rate (0 to 0.2)
- `employment`: Employment rate (0.5 to 1.0)
- `productivity`: Productivity level (min: 0.8)
- `marketConfidence`: Market confidence (0 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, cycleNumber)`: Updates economic indicators

---

### 2. populationSystem.js
**Location**: `src/world/populationSystem.js`

Manages population dynamics and demographics.

#### Properties and Thresholds:
- `count`: Population count (min: 1000)
- `growthRate`: Population growth rate (-0.05 to 0.05)
- `urbanization`: Urban population ratio (0.1 to 0.99)
- `happiness`: Happiness level (0 to 1)
- `educationLevel`: Education level (0.1 to 1)
- `health`: Health level (0.1 to 1)
- `diversity`: Diversity level (0.1 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, cycleNumber)`: Updates population indicators

---

### 3. technologySystem.js
**Location**: `src/world/technologySystem.js`

Manages technological advancement and innovation.

#### Properties and Thresholds:
- `level`: Technology level (min: 0.1)
- `innovationRate`: Innovation rate (0.01 to 0.5)
- `adoptionRate`: Adoption rate (0.1 to 1.0)
- `researchInvestment`: Research investment (min: 50)
- `technologicalGap`: Gap to technology frontier (0.05 to 1)
- `innovationCapacity`: Innovation capacity (0.1 to 1)
- `techDebt`: Technical debt (0 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, cycleNumber)`: Updates technology indicators

---

### 4. stabilitySystem.js
**Location**: `src/world/stabilitySystem.js`

Manages political, social, and economic stability.

#### Properties and Thresholds:
- `political`: Political stability (0.05 to 0.95)
- `social`: Social stability (0.05 to 0.95)
- `economic`: Economic stability (0.05 to 0.95)
- `overall`: Overall stability (calculated value)
- `cohesion`: Social cohesion (0.1 to 0.9)
- `volatility`: System volatility (0.05 to 0.8)
- `resilience`: System resilience (0.1 to 0.9)
- `stressLevel`: Stress level (0.05 to 0.9)
- `confidenceIndex`: Confidence index (0.1 to 0.95)
- `institutionalStrength`: Institutional strength (0.1 to 0.95)
- `publicTrust`: Public trust level (0.1 to 0.9)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, cycleNumber)`: Updates stability indicators

---

### 5. entropySystem.js
**Location**: `src/world/entropySystem.js`

Manages disorder, chaos, and complexity in the system.

#### Properties and Thresholds:
- `current`: Current entropy level (0.01 to max value)
- `max`: Maximum entropy level (1.0 default)
- `rateOfIncrease`: Rate of entropy increase (0.0005 to 0.01)
- `disorderLevel`: Disorder level (0.05 to 0.95)
- `chaosPotential`: Chaos potential (0.05 to 0.95)
- `complexity`: System complexity (0.1 to 0.95)
- `predictability`: Predictability level (0.05 to 0.95)
- `orderMaintenance`: Order maintenance effort (0.1 to 0.95)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, cycleNumber)`: Updates entropy indicators

---

### 6. resistanceSystem.js
**Location**: `src/world/resistanceSystem.js`

Manages resistance to change, innovation, and external influences.

#### Properties and Thresholds:
- `toChange`: Resistance to change (0.05 to 0.95)
- `toInnovation`: Resistance to innovation (0.05 to 0.95)
- `toTechnology`: Resistance to technology (0.05 to 0.9)
- `toExternalInfluence`: Resistance to external influence (0.05 to 0.95)
- `toGovernmentPolicy`: Resistance to government policy (0.05 to 0.95)
- `adaptiveCapacity`: Adaptive capacity (0.05 to 0.95)
- `institutionalRigidity`: Institutional rigidity (0.1 to 0.9)
- `culturalConservatism`: Cultural conservatism (0.1 to 0.95)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, cycleNumber)`: Updates resistance indicators

---

## Machine Intelligence Modules

### 1. beliefEngine.js
**Location**: `src/machine/beliefEngine.js`

Manages the machine's belief system and updates beliefs based on world changes.

#### Properties and Thresholds:
- `confidence`: Overall belief confidence (0.1 to 1)
- `certaintyThreshold`: Threshold for considering beliefs certain (default: 0.7)
- `updateRate`: Rate of belief updates (0.01 to 0.5)
- `coherence`: Belief system coherence (0.1 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, worldChanges, cycleNumber)`: Updates beliefs based on world changes

---

### 2. emotionEngine.js
**Location**: `src/machine/emotionEngine.js`

Manages the machine's emotional responses to world changes.

#### Properties and Thresholds:
- `currentEmotions`: Object containing emotion values (each 0 to 1)
  - `curiosity`: Curiosity level
  - `caution`: Caution level
  - `optimism`: Optimism level
  - `fear`: Fear level
  - `surprise`: Surprise level
  - `trust`: Trust level
  - `anticipation`: Anticipation level
  - `joy`: Joy level
- `intensity`: Overall emotional intensity (0 to 1)
- `regulation`: Emotional regulation (0.1 to 1)
- `emotionalStability`: Emotional stability (0.1 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, worldChanges, cycleNumber)`: Updates emotional states

---

### 3. predictionEngine.js
**Location**: `src/machine/predictionEngine.js`

Makes predictions about future world states and trends.

#### Properties and Thresholds:
- `accuracy`: Prediction accuracy (0.1 to 1)
- `predictionHorizon`: Number of cycles to predict ahead (default: 10)
- `confidence`: Confidence in predictions (0.1 to 1)
- `forecastAccuracy`: Accuracy of previous predictions (0.1 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, worldChanges, cycleNumber)`: Updates prediction models

---

### 4. interventionEngine.js
**Location**: `src/machine/interventionEngine.js`

Decides when and how to intervene in world systems.

#### Properties and Thresholds:
- `interventionThreshold`: Threshold for taking interventions (default: 0.6)
- `successRate`: Success rate of interventions (0.1 to 1)
- `initiativeLevel`: Willingness to take action (0.1 to 1)
- `interventionBudget`: Available resources for interventions (0 to 100)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, inputData, cycleNumber)`: Evaluates and executes interventions

---

### 5. introspectionEngine.js
**Location**: `src/machine/introspectionEngine.js`

Provides self-reflective capabilities for the machine.

#### Properties and Thresholds:
- `selfAwareness`: Level of self-awareness (0.1 to 1)
- `reflectionDepth`: Depth of reflection (0.1 to 1)
- `learningRate`: Rate of learning (0.01 to 0.5)
- `cognitiveDissonance`: Level of internal conflict (0.05 to 0.95)
- `metacognitiveAwareness`: Awareness of own thinking (0.1 to 1)
- `selfConsistency`: Consistency of internal states (0.1 to 0.99)
- `insightGenerationRate`: Rate of insight generation (0.1 to 1)

#### Methods:
- `getDefaultState()`: Returns initial state values
- `update(currentState, inputData, cycleNumber)`: Performs self-reflection

---

## Event System

### 1. blackSwanEvents.js
**Location**: `src/events/blackSwanEvents.js`

Generates rare, high-impact events that can significantly affect the simulation.

#### Event Types and Probabilities:
- Global Pandemic: 0.001 probability, affects population and economy
- Technological Singularity: 0.0005 probability, major technology boost
- Economic Collapse: 0.005 probability, affects economy and stability
- Natural Disaster: 0.02 probability, affects population and resources
- Revolution: 0.01 probability, affects stability and population
- Resource Discovery: 0.015 probability, positive economic impact
- AI Breakthrough: 0.01 probability, mixed technology/economy effects

#### Properties:
- `activeEvents`: Map of currently active events
- `eventTypes`: Array of possible event types

#### Methods:
- `generateEvent(worldState, cycleNumber)`: Checks for and generates events
- `updateActiveEvents()`: Updates durations of active events
- `getEventImpact(cycleNumber)`: Gets cumulative impact of active events

---

### 2. eventDispatcher.js
**Location**: `src/events/eventDispatcher.js`

Manages the event system and notifies subscribers of events.

#### Properties:
- `subscribers`: Map of event type to callback functions
- `eventQueue`: Queue of events to process
- `eventHistory`: History of processed events

#### Methods:
- `subscribe(eventType, callback)`: Subscribes to events
- `unsubscribe(eventType, callback)`: Unsubscribes from events
- `emit(event)`: Emits an event to subscribers
- `processEventQueue()`: Processes queued events
- `checkForBlackSwanEvents(worldState, cycleNumber)`: Checks for black swan events

---

## Logging System

### 1. cycleLogger.js
**Location**: `src/logging/cycleLogger.js`

Handles logging of each simulation cycle to data files.

#### Properties:
- `logDir`: Directory for log files (default: data/cycles/)
- `rawDir`: Directory for raw data (default: data/cycles/raw/)
- `summaryDir`: Directory for summaries (default: data/cycles/summaries/)
- `archiveDir`: Directory for archives (default: data/archives/)

#### Methods:
- `logCycle(cycleNumber, data)`: Logs a complete cycle
- `logRawData(cycleNumber, data)`: Logs raw cycle data
- `generateSummary(cycleNumber, data)`: Generates and saves summary
- `archiveLogs(month)`: Archives logs by month
- `cleanupOldLogs(retentionDays)`: Cleans up old logs

---

### 2. summaryGenerator.js
**Location**: `src/logging/summaryGenerator.js`

Generates human-readable summaries of simulation cycles.

#### Properties:
- `summaryTemplate`: Template for summary format

#### Methods:
- `generate(cycleData, cycleNumber)`: Generates a summary for a cycle
- `formatWorldChanges(changes)`: Formats world system changes
- `formatMachineActions(actions)`: Formats machine actions
- `extractKeyEvents(cycleData)`: Extracts significant events

---

### 3. readmeUpdater.js
**Location**: `src/logging/readmeUpdater.js`

Automatically updates the README with simulation statistics.

#### Properties:
- `readmePath`: Path to README file (default: README.md)
- `dataDir`: Directory containing data files (default: data/)

#### Methods:
- `updateReadme()`: Updates README with current statistics
- `generateStatsSection()`: Generates statistics section
- `updateSimulationProgress(currentCycle, maxCycles)`: Updates progress indicator
- `createProgressBar(current, max)`: Creates progress bar string

---

## State Management

### 1. stateLoader.js
**Location**: `src/state/stateLoader.js`

Loads simulation state from data files.

#### Properties:
- `dataDir`: Directory containing data files (default: data/)

#### Methods:
- `loadWorldState()`: Loads world state from world.json
- `loadMachineState()`: Loads machine state from machine.json
- `getDefaultWorldState()`: Returns default world state
- `getDefaultMachineState()`: Returns default machine state

---

### 2. stateSaver.js
**Location**: `src/state/stateSaver.js`

Saves simulation state to data files.

#### Properties:
- `dataDir`: Directory for data files (default: data/)
- `backupOnSave`: Whether to create backups (default: true)

#### Methods:
- `saveWorldState(state)`: Saves world state to world.json
- `saveMachineState(state)`: Saves machine state to machine.json
- `saveMetadata(metadata)`: Saves metadata to metadata.json

---

## Utility Functions

### 1. random.js
**Location**: `src/utils/random.js`

Provides various random number generation functions.

#### Methods:
- `seed(seedValue)`: Sets seed for reproducible random numbers
- `random()`: Returns random number between 0 and 1
- `range(min, max)`: Returns random number in range
- `intRange(min, max)`: Returns random integer in range
- `choice(array)`: Returns random element from array
- `shuffle(array)`: Shuffles array randomly
- `weightedChoice(itemsWithWeights)`: Weighted random selection
- `normalize(value, min, max)`: Normalizes value to 0-1 range
- `denormalize(normalizedValue, min, max)`: Converts normalized value back

---

### 2. math.js
**Location**: `src/utils/math.js`

Provides mathematical utility functions.

#### Methods:
- `clamp(value, min, max)`: Clamps value to range
- `lerp(start, end, factor)`: Linear interpolation
- `normalize(value, min, max)`: Normalizes to 0-1 range
- `denormalize(normalizedValue, min, max)`: Denormalizes from 0-1 range
- `gaussianRandom(mean, stdDev)`: Gaussian distribution random
- `sigmoid(x)`: Sigmoid function
- `relu(x)`: ReLU activation function
- `softmax(values)`: Softmax normalization
- `distance(point1, point2)`: Euclidean distance
- `euclideanDistance(arr1, arr2)`: Distance between arrays
- `dotProduct(vec1, vec2)`: Dot product of vectors
- `magnitude(vector)`: Magnitude of vector
- `cosineSimilarity(vec1, vec2)`: Cosine similarity

---

### 3. time.js
**Location**: `src/utils/time.js`

Provides time-related utility functions.

#### Methods:
- `getCurrentTimestamp()`: Returns ISO timestamp string
- `formatDuration(milliseconds)`: Formats duration in human-readable form
- `parseDuration(durationString)`: Parses duration string to milliseconds
- `sleep(milliseconds)`: Async sleep function
- `waitForCondition(conditionFn, timeoutMs, intervalMs)`: Waits for condition
- `calculateTimeAgo(date)`: Calculates time elapsed
- `getDayOfYear(date)`: Gets day of year
- `getWeekNumber(date)`: Gets week number
- `isLeapYear(year)`: Checks if year is leap year
- `addTime(date, amount, unit)`: Adds time to date
- `timeSince(start)`: Calculates time elapsed since start
- `measureExecution(fn)`: Measures function execution time

---

## Data Files

### 1. world.json
**Location**: `data/world.json`

Contains the current state of all world systems.

#### Structure:
```json
{
  "timestamp": "ISO date string",
  "cycle": 0,
  "systems": {
    "economy": {...},
    "population": {...},
    "technology": {...},
    "stability": {...},
    "entropy": {...},
    "resistance": {...}
  },
  "events": [],
  "history": []
}
```

### 2. machine.json
**Location**: `data/machine.json`

Contains the current state of the machine intelligence.

#### Structure:
```json
{
  "timestamp": "ISO date string",
  "cycle": 0,
  "beliefSystem": {...},
  "emotionSystem": {...},
  "predictionEngine": {...},
  "interventionEngine": {...},
  "introspectionEngine": {...},
  "behaviorHistory": [],
  "knowledgeBase": {}
}
```

### 3. metadata.json
**Location**: `data/metadata.json`

Contains simulation metadata and configuration.

#### Structure:
```json
{
  "projectName": "Digital Civilization Simulation",
  "version": "1.0.0",
  "creationDate": "ISO date string",
  "lastSimulationRun": null,
  "totalCyclesRun": 0,
  "dataFormatVersion": "1.0",
  "authors": ["Digital Civilization Project"],
  "description": "Metadata for the digital civilization simulation project",
  "config": {
    "simulationSpeed": 1,
    "saveFrequency": 10,
    "logLevel": "info",
    "enableEvents": true,
    "maxEntropy": 1.0
  }
}
```

### 4. Cycle Data Files
**Location**: `data/cycles/raw/cycle-XXXX.json`

Each cycle creates a JSON file with complete state data for that cycle.

### 5. Cycle Summary Files
**Location**: `data/cycles/summaries/cycle-XXXX.md`

Each cycle creates a markdown summary file with key events and changes.

### 6. Archive Files
**Location**: `data/archives/month-XX.json`

Monthly archives contain aggregated data from multiple cycles.

---

## Scripts

### 1. initializeWorld.js
**Location**: `scripts/initializeWorld.js`

Initializes the simulation with default starting values.

#### Functionality:
- Creates default world state
- Creates default machine state
- Creates default metadata
- Ensures required directories exist

### 2. manualRun.js
**Location**: `scripts/manualRun.js`

Runs the simulation manually for a specified number of cycles.

#### Usage:
```bash
node scripts/manualRun.js [number_of_cycles]
```

Default is 10 cycles if no argument provided.

---

## Configuration

### Package.json Dependencies:
- `fs-extra`: Enhanced file system operations
- `lodash`: Utility functions
- `nodemon`: Development server (dev dependency)

### GitHub Actions Workflow:
- Runs simulation hourly
- Commits results back to repository
- Preserves simulation continuity

### Configuration Options:
Most configuration is in metadata.json, but key parameters can be adjusted in:
- SimulationRunner constructor options
- Individual system configuration
- Event probability adjustments

---

## How Everything Works Together

1. **Initialization**: `initializeWorld.js` sets up initial states
2. **Execution**: `simulationRunner.js` orchestrates the main loop
3. **World Update**: `worldEngine.js` updates all world systems
4. **Machine Processing**: `machineEngine.js` processes world changes and generates actions
5. **Event Checking**: `eventDispatcher.js` checks for and handles events
6. **Logging**: `cycleLogger.js` records all changes
7. **State Saving**: Periodic state persistence
8. **Output**: README is updated with statistics

The system creates a continuous feedback loop where the machine observes world changes, forms beliefs, experiences emotions, makes predictions, and potentially intervenes in world systems, which then affects the next cycle.