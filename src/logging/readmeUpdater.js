const fs = require('fs-extra');
const path = require('path');

class ReadmeUpdater {
  constructor(options = {}) {
    this.options = {
      readmePath: options.readmePath || path.join(__dirname, '../../README.md'),
      dataDir: options.dataDir || path.join(__dirname, '../../data'),
      ...options
    };
  }

  async updateReadme() {
    try {
      // Read the current README
      let readmeContent = await fs.readFile(this.options.readmePath, 'utf8');
      
      // Extract the static parts of the README (before and after the dynamic section)
      const startMarker = '<!-- START:CYCLE_STATS -->';
      const endMarker = '<!-- END:CYCLE_STATS -->';
      
      // Generate the statistics section
      const statsSection = await this.generateStatsSection();

      let newReadmeContent = readmeContent;
      if (readmeContent.includes(startMarker) && readmeContent.includes(endMarker)) {
        const startIndex = readmeContent.indexOf(startMarker);
        const endIndex = readmeContent.indexOf(endMarker);

        const before = readmeContent.substring(0, startIndex);
        const after = readmeContent.substring(endIndex + endMarker.length);

        newReadmeContent = [
          before.trimEnd(),
          startMarker,
          statsSection.trim(),
          endMarker,
          after.trimStart()
        ].join('\n') + '\n';
      } else {
        // If markers don't exist, insert them after the title/intro (or append)
        newReadmeContent = readmeContent.trimEnd() + '\n\n' + [
          startMarker,
          statsSection.trim(),
          endMarker
        ].join('\n') + '\n';
      }
      
      // Write the updated README
      await fs.writeFile(this.options.readmePath, newReadmeContent, 'utf8');
      
      console.log('README.md updated with latest statistics');
    } catch (error) {
      console.error('Error updating README:', error);
      throw error;
    }
  }

  async generateStatsSection() {
    try {
      // Load world and machine data
      const worldPath = path.join(this.options.dataDir, 'world.json');
      const machinePath = path.join(this.options.dataDir, 'machine.json');
      const metadataPath = path.join(this.options.dataDir, 'metadata.json');
      
      let worldData = {};
      let machineData = {};
      let metadata = {};
      
      if (await fs.pathExists(worldPath)) {
        worldData = await fs.readJson(worldPath);
      }
      
      if (await fs.pathExists(machinePath)) {
        machineData = await fs.readJson(machinePath);
      }
      
      if (await fs.pathExists(metadataPath)) {
        metadata = await fs.readJson(metadataPath);
      }
      
      // Count cycle files
      const cyclesDir = path.join(this.options.dataDir, 'cycles', 'raw');
      let cycleCount = 0;
      if (await fs.pathExists(cyclesDir)) {
        const cycleFiles = await fs.readdir(cyclesDir);
        cycleCount = cycleFiles.filter(file => file.startsWith('cycle-') && file.endsWith('.json')).length;
      }
      
      // Determine civilization phase
      const civilizationPhase = this.determineCivilizationPhase(worldData, machineData);

      const latest = await this.getLatestCycleSummary();
      
      // Build stats content
      const statsContent = `
## Simulation Statistics

<details>
<summary>📊 Current Stats (click to expand)</summary>

- **Current Cycle**: ${worldData.cycle !== undefined ? worldData.cycle : 'N/A'}
- **Total Cycles Logged**: ${cycleCount}
- **World Timestamp**: ${worldData.timestamp || 'N/A'}
- **Machine Timestamp**: ${machineData.timestamp || 'N/A'}
- **Last Run**: ${metadata.lastSimulationRun || 'Never'}
- **Total Runs**: ${metadata.totalCyclesRun || 0}

### Civilization Phase: **${civilizationPhase}**

</details>

<details>
<summary>🌍 World Systems Status (click to expand)</summary>

- **Economy Resources**: ${(worldData.systems?.economy?.resources || 0).toFixed(2)}
- **Population Count**: ${(worldData.systems?.population?.count || 0).toLocaleString()}
- **Technology Level**: ${(worldData.systems?.technology?.level || 0).toFixed(2)}
- **Overall Stability**: ${(worldData.systems?.stability?.overall || 0).toFixed(2)}
- **Entropy Level**: ${(worldData.systems?.entropy?.current || 0).toFixed(2)}
- **Legitimacy Level**: ${(worldData.systems?.legitimacy?.overallLegitimacy || 0).toFixed(2)}

</details>

<details>
<summary>🤖 Machine Intelligence Status (click to expand)</summary>

- **Belief Confidence**: ${(machineData.beliefSystem?.confidence || 0).toFixed(2)}
- **Exploration Tendency**: ${(machineData.emotionSystem?.exploration?.curiosity || 0).toFixed(2)}
- **Prediction Accuracy**: ${(machineData.predictionEngine?.accuracy || 0).toFixed(2)}
- **Self Awareness**: ${(machineData.introspectionEngine?.selfAwareness || 0).toFixed(2)}
- **Knowledge Decay**: ${(machineData.knowledgeDecay || 0).toFixed(3)}

</details>

<details>
<summary>📝 Latest Cycle Summary (click to expand)</summary>

- **Latest Summary File**: ${latest ? `\`${latest.relativePath}\`` : 'N/A'}

${latest?.snippet ? latest.snippet : 'No summary snippet available.'}

</details>`;
      
      return statsContent;
    } catch (error) {
      console.error('Error generating stats section:', error);
      return `## Simulation Statistics

<details>
<summary>📊 Simulation Stats (click to expand)</summary>

Failed to load statistics: ${error.message}

</details>`;
    }
  }

  async updateSimulationProgress(currentCycle, maxCycles) {
    try {
      let readmeContent = await fs.readFile(this.options.readmePath, 'utf8');
      
      // Define markers for progress section
      const startMarker = '<!-- START:PROGRESS -->';
      const endMarker = '<!-- END:PROGRESS -->';

      // Create progress bar
      const progressBar = this.createProgressBar(currentCycle, maxCycles);
      
      // Combine everything
      const progressSection = [
        `## Simulation Progress`,
        progressBar,
        `**Current Cycle**: ${currentCycle} | **Max Total Cycles**: ${maxCycles}`,
        ''
      ].join('\n');

      let newReadmeContent = readmeContent;
      if (readmeContent.includes(startMarker) && readmeContent.includes(endMarker)) {
        const startIndex = readmeContent.indexOf(startMarker);
        const endIndex = readmeContent.indexOf(endMarker);

        const before = readmeContent.substring(0, startIndex);
        const after = readmeContent.substring(endIndex + endMarker.length);

        newReadmeContent = [
          before.trimEnd(),
          startMarker,
          progressSection.trim(),
          endMarker,
          after.trimStart()
        ].join('\n') + '\n';
      } else {
        newReadmeContent = readmeContent.trimEnd() + '\n\n' + [
          startMarker,
          progressSection.trim(),
          endMarker
        ].join('\n') + '\n';
      }

      await fs.writeFile(this.options.readmePath, newReadmeContent, 'utf8');
      
      console.log(`Simulation progress updated: ${currentCycle}/${maxCycles}`);
    } catch (error) {
      console.error('Error updating simulation progress:', error);
      throw error;
    }
  }

  createProgressBar(current, max) {
    const percentage = max > 0 ? Math.round((current / max) * 100) : 0;
    const barLength = 30;
    const filledLength = Math.round((current / max) * barLength);
    const emptyLength = barLength - filledLength;
    
    const bar = `[${'█'.repeat(filledLength)}${'░'.repeat(emptyLength)}]`;
    return `${bar} ${percentage}% (${current}/${max})`;
  }

  determineCivilizationPhase(worldData, machineData) {
    // Determine the civilization phase based on various factors
    const techLevel = worldData.systems?.technology?.level || 1.0;
    const stability = worldData.systems?.stability?.overall || 0.8;
    const entropy = worldData.systems?.entropy?.current || 0.1;
    const machineInfluence = machineData.introspectionEngine?.selfAwareness || 0.5; // Proxy for machine influence
    const legitimacy = worldData.systems?.legitimacy?.overallLegitimacy || 0.5;
    
    // Define phase criteria
    if (techLevel < 2.0 && stability > 0.7 && entropy < 0.3) {
      return 'Early Expansion';
    } else if (techLevel >= 2.0 && techLevel < 5.0 && stability > 0.6 && entropy < 0.4) {
      return 'Industrial Acceleration';
    } else if (machineInfluence > 0.6 && legitimacy > 0.6 && stability > 0.5) {
      return 'Machine Symbiosis';
    } else if (machineInfluence > 0.7 && stability > 0.7 && legitimacy > 0.5) {
      return 'Technocratic Dominance';
    } else if (entropy > 0.7 || stability < 0.3) {
      return 'Collapse Risk';
    } else if (techLevel > 5.0 && entropy > 0.5) {
      return 'Post-Singularity Chaos';
    } else {
      return 'Balanced Development';
    }
  }

  async getLatestCycleSummary() {
    try {
      const summariesDir = path.join(this.options.dataDir, 'cycles', 'summaries');
      if (!(await fs.pathExists(summariesDir))) return null;

      const files = (await fs.readdir(summariesDir))
        .filter(f => /^cycle-\d{4}\.md$/.test(f))
        .sort();
      if (files.length === 0) return null;

      const latestFile = files[files.length - 1];
      const absolutePath = path.join(summariesDir, latestFile);
      const content = await fs.readFile(absolutePath, 'utf8');

      const snippet = this.extractSummarySnippet(content);
      return {
        fileName: latestFile,
        relativePath: path.join('data', 'cycles', 'summaries', latestFile).replace(/\\/g, '/'),
        snippet
      };
    } catch (error) {
      console.warn('Failed to load latest cycle summary:', error.message);
      return null;
    }
  }

  extractSummarySnippet(markdown) {
    if (!markdown || typeof markdown !== 'string') return '';

    const section = (heading) => {
      const start = markdown.indexOf(`## ${heading}`);
      if (start === -1) return '';
      const rest = markdown.slice(start);
      const next = rest.slice(3).indexOf('\n## ');
      const chunk = next === -1 ? rest : rest.slice(0, next + 3);
      return chunk.trim();
    };

    const keyEvents = section('Key Events');
    const ai = section('AI Analysis');

    const parts = [];
    if (keyEvents) parts.push(keyEvents);
    if (ai) parts.push(ai);

    const combined = parts.join('\n\n').trim();
    const lines = combined.split('\n').slice(0, 30).join('\n').trim();
    return lines;
  }
}

module.exports = { ReadmeUpdater };