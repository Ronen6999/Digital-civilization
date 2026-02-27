const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

class SummaryGenerator {
  constructor() {
    this.summaryTemplate = `# Cycle {cycleNumber} Summary

**Timestamp:** {timestamp}

## World Changes
{worldChanges}

## Machine Actions
{machineActions}

## Key Events
{keyEvents}

## AI Analysis
{aiAnalysis}

---
*Generated at {generationTime}*`;
    
    // Evolution tracking
    this.evolutionCount = this.loadEvolutionCount();
  }

  async generate(cycleData, cycleNumber) {
    // Increment evolution count
    this.evolutionCount++;
    this.saveEvolutionCount();
    
    const worldChanges = this.formatWorldChanges(cycleData.changes);
    const machineActions = this.formatMachineActions(cycleData.actions, cycleData.machine, cycleData.world);
    const keyEvents = this.extractKeyEvents(cycleData);
    
    // Generate AI analysis using the API
    const aiAnalysis = await this.generateAIAnalysis(cycleData, cycleNumber);
    
    return this.summaryTemplate
      .replace('{cycleNumber}', String(cycleNumber).padStart(4, '0'))
      .replace('{timestamp}', cycleData.timestamp || new Date().toISOString())
      .replace('{worldChanges}', worldChanges)
      .replace('{machineActions}', machineActions)
      .replace('{keyEvents}', keyEvents)
      .replace('{aiAnalysis}', aiAnalysis)
      .replace('{generationTime}', new Date().toISOString());
  }
  
  async generateAIAnalysis(cycleData, cycleNumber) {
    try {
      // Prepare data for the AI analysis
      const worldState = cycleData.world;
      const changes = cycleData.changes;
      const actions = cycleData.actions;
      const machineState = cycleData.machine;
      
      // Create a prompt for the AI
      const deltaSummary = this.summarizeCycleDeltas(changes);
      const activationEstimate = this.estimateMachineActivation(worldState, changes);
      const machineStatus = this.getMachineStatus(actions, machineState, worldState);
      const prompt = `You are generating a short simulation report for cycle ${cycleNumber} (evolution ${this.evolutionCount}). Use simple everyday words. You MUST output exactly two sections in this order, each with bullets and one short summary line.

Civilization system (world):
- Provide 3-5 bullets about the current world state (economy, people, stability).
- Include exactly one bullet that starts with "Compared to last cycle:" and says what improved/worsened.
- Then output ONE plain text line (not a bullet) starting with "Civilization summary:" (<= 18 words).

Machine system:
- Machine status is: ${machineStatus.status}.
- Provide 2-4 bullets about what the machine is doing right now.
- If machine is NOT activated, say "Machine not activated" and mention why (thresholds not met OR budget too low).
- If machine IS activated, describe its interventions/actions and what they would change.
- Include exactly one bullet that starts with "Machine activation:" using this estimate: ${activationEstimate}.
- Then output ONE plain text line (not a bullet) starting with "Machine summary:" (<= 18 words).

Hard limits: max 170 words total, no headings other than the exact section labels "Civilization system (world):" and "Machine system:". No emoji. No questions. No future predictions.

Data: World now: economy growth ${(Math.round((worldState.systems?.economy?.growthRate || 0) * 1000) / 10).toFixed(1)}%, resources ${Math.round(worldState.systems?.economy?.resources || 0)}, trade ${Math.round(worldState.systems?.economy?.tradeVolume || 0)}; population ${Math.round(worldState.systems?.population?.count || 0)}, happiness ${Math.round((worldState.systems?.population?.happiness || 0) * 100)}%; tech ${Math.round((worldState.systems?.technology?.level || 0) * 100)}%; stability ${Math.round((worldState.systems?.stability?.overall || 0) * 100)}%; entropy ${Math.round((worldState.systems?.entropy?.current || 0) * 100)}%; resistance ${Math.round((worldState.systems?.resistance?.overall || 0) * 100)}%; legitimacy ${Math.round((worldState.systems?.legitimacy?.overallLegitimacy || 0) * 100)}%. Compared to last cycle deltas: ${deltaSummary}. Machine notes: ${machineStatus.notes}.`;
      
      // Call the AI API with no timeout
      const response = await axios.get('https://api-rebix.vercel.app/api/gpt-5', {
        params: {
          q: prompt
        },
        timeout: 0 // No timeout - wait indefinitely for response
      });
      
      // Return the AI's response from the results field
      return this.normalizeAIAnalysis(response.data.results) || 'AI analysis is temporarily unavailable.';
    } catch (error) {
      console.error('Error generating AI analysis:', error.message);
      return 'AI analysis failed to generate. Reason: ' + error.message;
    }
  }

  normalizeAIAnalysis(text) {
    if (!text || typeof text !== 'string') return '';

    const cleaned = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .trim();

    if (!cleaned) return '';

    const lines = cleaned
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    let out = lines.slice(0, 24).join('\n').trim();
    const maxChars = 1400;
    if (out.length > maxChars) out = out.slice(0, maxChars).trimEnd() + '…';
    return out;
  }

  getMachineStatus(actions, machineState, worldState) {
    const interventions = Array.isArray(actions?.interventions) ? actions.interventions : [];
    const interventionCount = interventions.length;

    const budget = machineState?.interventionEngine?.interventionBudget;
    const initiative = machineState?.interventionEngine?.initiativeLevel;
    const selfAwareness = machineState?.introspectionEngine?.selfAwareness;
    const curiosity = machineState?.emotionSystem?.exploration?.curiosity ?? machineState?.emotionSystem?.currentEmotions?.curiosity;
    const beliefConfidence = machineState?.beliefSystem?.confidence;

    const thresholds = this.checkInterventionThresholds(worldState?.systems);
    const thresholdsHit = thresholds.filter(t => t.hit);

    const minCostToAct = this.getMinInterventionCostForThresholds(thresholdsHit);
    const budgetNum = (typeof budget === 'number' && Number.isFinite(budget)) ? budget : null;
    const budgetBlocking = thresholdsHit.length > 0 && budgetNum !== null && minCostToAct !== null && budgetNum < minCostToAct;

    const status =
      interventionCount > 0 ? 'Activated (intervening)'
      : thresholdsHit.length === 0 ? 'Standby (not activated)'
      : budgetBlocking ? 'Ready but budget-limited'
      : 'Ready (threshold met, but no intervention selected)';

    const notesParts = [];
    if (interventionCount > 0) {
      const types = [...new Set(interventions.map(i => i.type).filter(Boolean))].slice(0, 3);
      notesParts.push(`interventions=${interventionCount}${types.length ? ` types=${types.join(',')}` : ''}`);
    } else {
      notesParts.push(`no interventions selected`);
    }

    if (typeof budget === 'number') notesParts.push(`budget=${Math.round(budget)}`);
    if (typeof initiative === 'number') notesParts.push(`initiative=${initiative.toFixed(2)}`);
    if (typeof selfAwareness === 'number') notesParts.push(`selfAwareness=${selfAwareness.toFixed(2)}`);
    if (typeof curiosity === 'number') notesParts.push(`curiosity=${curiosity.toFixed(2)}`);
    if (typeof beliefConfidence === 'number') notesParts.push(`beliefConfidence=${beliefConfidence.toFixed(2)}`);

    if (thresholdsHit.length > 0) {
      notesParts.push(`thresholdsHit=${thresholdsHit.map(t => t.name).join(',')}`);
    } else {
      notesParts.push(`thresholdsHit=none`);
    }

    if (minCostToAct !== null) notesParts.push(`minCostToAct=${minCostToAct}`);
    if (budgetBlocking && budgetNum !== null) notesParts.push(`reason=budget ${Math.round(budgetNum)} < ${minCostToAct}`);

    return { status, notes: notesParts.join('; ') };
  }

  getMinInterventionCostForThresholds(thresholdsHit) {
    if (!Array.isArray(thresholdsHit) || thresholdsHit.length === 0) return null;

    // These costs mirror InterventionEngine.evaluateInterventions()
    const costByThreshold = {
      inflation: 15,
      employment: 20,
      happiness: 25,
      health: 30,
      stability: 35,
      entropy: 40
    };

    let min = null;
    for (const t of thresholdsHit) {
      const name = t?.name;
      const cost = costByThreshold[name];
      if (typeof cost !== 'number') continue;
      if (min === null || cost < min) min = cost;
    }
    return min;
  }

  checkInterventionThresholds(systems) {
    const econ = systems?.economy || {};
    const pop = systems?.population || {};
    const stab = systems?.stability || {};
    const ent = systems?.entropy || {};

    const safe = (n) => (typeof n === 'number' && Number.isFinite(n) ? n : null);

    const inflation = safe(econ.inflation);
    const employment = safe(econ.employment);
    const happiness = safe(pop.happiness);
    const health = safe(pop.health);
    const stability = safe(stab.overall);
    const entropy = safe(ent.current);

    return [
      { name: 'inflation', hit: inflation !== null && inflation > 0.05 },
      { name: 'employment', hit: employment !== null && employment < 0.8 },
      { name: 'happiness', hit: happiness !== null && happiness < 0.5 },
      { name: 'health', hit: health !== null && health < 0.6 },
      { name: 'stability', hit: stability !== null && stability < 0.6 },
      { name: 'entropy', hit: entropy !== null && entropy > 0.7 }
    ];
  }

  estimateMachineActivation(worldState, changes) {
    const w = worldState?.systems || {};
    const c = changes || {};
    const econ = w.economy || {};
    const pop = w.population || {};
    const stab = w.stability || {};
    const ent = w.entropy || {};

    const econD = c.economy || {};
    const popD = c.population || {};
    const stabD = c.stability || {};
    const entD = c.entropy || {};

    const safe = (n) => (typeof n === 'number' && Number.isFinite(n) ? n : null);
    const candidates = [];

    // inflation > 0.05 (needs to rise)
    {
      const cur = safe(econ.inflation);
      const d = safe(econD.inflation);
      const threshold = 0.05;
      if (cur !== null) {
        if (cur >= threshold) candidates.push({ name: 'inflation', cycles: 0 });
        else if (d !== null && d > 0) candidates.push({ name: 'inflation', cycles: Math.ceil((threshold - cur) / d) });
      }
    }

    // employment < 0.8 (needs to fall)
    {
      const cur = safe(econ.employment);
      const d = safe(econD.employment);
      const threshold = 0.8;
      if (cur !== null) {
        if (cur <= threshold) candidates.push({ name: 'employment', cycles: 0 });
        else if (d !== null && d < 0) candidates.push({ name: 'employment', cycles: Math.ceil((cur - threshold) / (-d)) });
      }
    }

    // happiness < 0.5 (needs to fall)
    {
      const cur = safe(pop.happiness);
      const d = safe(popD.happiness);
      const threshold = 0.5;
      if (cur !== null) {
        if (cur <= threshold) candidates.push({ name: 'happiness', cycles: 0 });
        else if (d !== null && d < 0) candidates.push({ name: 'happiness', cycles: Math.ceil((cur - threshold) / (-d)) });
      }
    }

    // health < 0.6 (needs to fall)
    {
      const cur = safe(pop.health);
      const d = safe(popD.health);
      const threshold = 0.6;
      if (cur !== null) {
        if (cur <= threshold) candidates.push({ name: 'health', cycles: 0 });
        else if (d !== null && d < 0) candidates.push({ name: 'health', cycles: Math.ceil((cur - threshold) / (-d)) });
      }
    }

    // stability.overall < 0.6 (needs to fall)
    {
      const cur = safe(stab.overall);
      const d = safe(stabD.overallChange ?? stabD.overall);
      const threshold = 0.6;
      if (cur !== null) {
        if (cur <= threshold) candidates.push({ name: 'stability', cycles: 0 });
        else if (d !== null && d < 0) candidates.push({ name: 'stability', cycles: Math.ceil((cur - threshold) / (-d)) });
      }
    }

    // entropy.current > 0.7 (needs to rise)
    {
      const cur = safe(ent.current);
      const d = safe(entD.entropyChange ?? entD.current);
      const threshold = 0.7;
      if (cur !== null) {
        if (cur >= threshold) candidates.push({ name: 'entropy', cycles: 0 });
        else if (d !== null && d > 0) candidates.push({ name: 'entropy', cycles: Math.ceil((threshold - cur) / d) });
      }
    }

    if (candidates.length === 0) return 'no clear trigger is trending toward a threshold right now';
    candidates.sort((a, b) => a.cycles - b.cycles);
    const best = candidates[0];
    if (best.cycles === 0) return `${best.name} is already at threshold (interventions can start now)`;
    if (best.cycles > 500) return `${best.name} is the closest trigger, but it looks far away`;
    return `about ${best.cycles} cycles (closest trigger: ${best.name})`;
  }

  summarizeCycleDeltas(changes) {
    if (!changes || typeof changes !== 'object') return 'no change data available';

    const safe = (n) => (typeof n === 'number' && Number.isFinite(n) ? n : null);
    const fmt = (n, digits = 2) => (n === null ? null : (Math.round(n * (10 ** digits)) / (10 ** digits)).toFixed(digits));

    const parts = [];

    // Economy
    const econ = changes.economy || {};
    const res = safe(econ.resources);
    if (res !== null) parts.push(`resources ${res >= 0 ? '+' : ''}${fmt(res, 2)}`);
    const trade = safe(econ.tradeVolume);
    if (trade !== null) parts.push(`trade ${trade >= 0 ? '+' : ''}${fmt(trade, 2)}`);
    const conf = safe(econ.marketConfidence);
    if (conf !== null) parts.push(`confidence ${conf >= 0 ? '+' : ''}${fmt(conf, 3)}`);

    // Population
    const pop = changes.population || {};
    const popCount = safe(pop.count);
    if (popCount !== null) parts.push(`population ${popCount >= 0 ? '+' : ''}${Math.round(popCount).toLocaleString()}`);
    const happy = safe(pop.happiness);
    if (happy !== null) parts.push(`happiness ${happy >= 0 ? '+' : ''}${fmt(happy * 100, 2)}%`);

    // Tech / Stability / Entropy / Resistance / Legitimacy (use common change field names)
    const tech = changes.technology || {};
    const techDelta = safe(tech.levelChange ?? tech.level);
    if (techDelta !== null) parts.push(`tech ${techDelta >= 0 ? '+' : ''}${fmt(techDelta, 3)}`);

    const stab = changes.stability || {};
    const stabDelta = safe(stab.overallChange ?? stab.overall);
    if (stabDelta !== null) parts.push(`stability ${stabDelta >= 0 ? '+' : ''}${fmt(stabDelta, 3)}`);

    const ent = changes.entropy || {};
    const entDelta = safe(ent.entropyChange ?? ent.current);
    if (entDelta !== null) parts.push(`entropy ${entDelta >= 0 ? '+' : ''}${fmt(entDelta, 3)}`);

    const leg = changes.legitimacy || {};
    const legDelta = safe(leg.overallLegitimacyChange ?? leg.overallLegitimacy);
    if (legDelta !== null) parts.push(`legitimacy ${legDelta >= 0 ? '+' : ''}${fmt(legDelta, 3)}`);

    if (parts.length === 0) return 'small shifts across systems';
    return parts.slice(0, 6).join(', ');
  }
  
  loadEvolutionCount() {
    try {
      const countPath = path.join(__dirname, '../../data/evolution_count.json');
      if (fs.existsSync(countPath)) {
        const data = fs.readJsonSync(countPath);
        return data.count || 0;
      }
      return 0; // Default to 0 if file doesn't exist
    } catch (error) {
      console.error('Error loading evolution count:', error);
      return 0;
    }
  }
  
  saveEvolutionCount() {
    try {
      const countPath = path.join(__dirname, '../../data/evolution_count.json');
      fs.writeJsonSync(countPath, { count: this.evolutionCount }, { spaces: 2 });
    } catch (error) {
      console.error('Error saving evolution count:', error);
    }
  }

  formatWorldChanges(changes) {
    if (!changes) return 'No significant changes';

    let result = '';
    
    for (const [systemName, systemChanges] of Object.entries(changes)) {
      if (['timestamp', 'cycle', 'causalEffects', 'thresholdViolations'].includes(systemName)) continue;
      
      result += `### ${this.capitalize(systemName)}\n`;
      
      for (const [paramName, paramChange] of Object.entries(systemChanges)) {
        if (typeof paramChange === 'number') {
          result += `- **${this.toTitleCase(paramName)}**: ${paramChange.toFixed(4)}\n`;
        } else {
          result += `- **${this.toTitleCase(paramName)}**: ${JSON.stringify(paramChange)}\n`;
        }
      }
      result += '\n';
    }
    
    // Add causal effects if present
    if (changes.causalEffects && changes.causalEffects.length > 0) {
      result += '### Causal Effects\n';
      for (const effect of changes.causalEffects) {
        result += `- **${effect.from}** → **${effect.to}**: ${effect.propagatedEffect.toFixed(4)} (weight: ${effect.weight})\n`;
      }
      result += '\n';
    }
    
    // Add threshold violations if present
    if (changes.thresholdViolations && changes.thresholdViolations.length > 0) {
      result += '### Threshold Violations\n';
      for (const violation of changes.thresholdViolations) {
        result += `- **${violation.path}**: ${violation.value.toFixed(4)} (threshold: ${violation.threshold})\n`;
      }
      result += '\n';
    }
    
    return result || 'No changes';
  }

  formatMachineActions(actions, machineState, worldState) {
    if (!actions) return 'No actions taken';

    let result = '';

    const interventions = actions?.interventions || actions?.actions?.interventions || [];
    const beliefFormations = actions?.beliefs?.beliefFormations || actions?.beliefFormations || [];

    if (worldState && machineState) {
      const status = this.getMachineStatus(actions, machineState, worldState);
      const thresholds = this.checkInterventionThresholds(worldState.systems);
      const thresholdsHit = thresholds.filter(t => t.hit).map(t => t.name);

      result += '### Status\n';
      result += `- **Mode**: ${status.status}\n`;
      result += `- **ThresholdsHit**: ${thresholdsHit.length ? thresholdsHit.join(', ') : 'none'}\n`;
      result += `- **InterventionsThisCycle**: ${Array.isArray(interventions) ? interventions.length : 0}\n`;

      const budget = machineState?.interventionEngine?.interventionBudget;
      const initiative = machineState?.interventionEngine?.initiativeLevel;
      const selfAwareness = machineState?.introspectionEngine?.selfAwareness;

      if (typeof budget === 'number' && Number.isFinite(budget)) result += `- **Budget**: ${Math.round(budget)}\n`;
      if (typeof initiative === 'number' && Number.isFinite(initiative)) result += `- **Initiative**: ${initiative.toFixed(2)}\n`;
      if (typeof selfAwareness === 'number' && Number.isFinite(selfAwareness)) result += `- **SelfAwareness**: ${selfAwareness.toFixed(2)}\n`;

      result += '\n';
    }
    
    if (beliefFormations.length > 0) {
      result += '### Belief Formations\n';
      for (const formation of beliefFormations) {
        result += `- **${formation.topic}**: strength=${formation.strength.toFixed(3)}, confidence=${formation.confidence.toFixed(3)}\n`;
      }
      result += '\n';
    }
    
    if (Array.isArray(interventions) && interventions.length > 0) {
      result += '### Interventions\n';
      for (const intervention of interventions) {
        result += `- **${intervention.targetSystem}**: ${JSON.stringify(intervention.changes)}\n`;
      }
      result += '\n';
    }
    
    return result || 'No specific actions';
  }

  extractKeyEvents(cycleData) {
    const events = [];
    
    // Look for significant changes
    if (cycleData.changes) {
      for (const [systemName, systemChanges] of Object.entries(cycleData.changes)) {
        if (['timestamp', 'cycle'].includes(systemName)) continue;
        
        for (const [paramName, paramChange] of Object.entries(systemChanges)) {
          if (typeof paramChange === 'number' && Math.abs(paramChange) > 0.1) {
            events.push(`${this.toTitleCase(systemName)} ${paramName} changed significantly: ${paramChange.toFixed(4)}`);
          }
        }
      }
    }
    
    // Look for machine interventions
    if (cycleData.actions && cycleData.actions.interventions) {
      for (const intervention of cycleData.actions.interventions) {
        events.push(`Machine intervention in ${intervention.targetSystem}: ${JSON.stringify(intervention.changes)}`);
      }
    }
    
    return events.length > 0 ? events.join('\n- ') : 'No significant events';
  }

  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  toTitleCase(str) {
    return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
  }
}

module.exports = { SummaryGenerator };