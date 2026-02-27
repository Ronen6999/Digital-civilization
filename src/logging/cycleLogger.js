const fs = require('fs-extra');
const path = require('path');
const { SummaryGenerator } = require('./summaryGenerator');

class CycleLogger {
  constructor(options = {}) {
    this.options = {
      logDir: options.logDir || path.join(__dirname, '../../data/cycles'),
      rawDir: path.join(options.logDir || path.join(__dirname, '../../data/cycles'), 'raw'),
      summaryDir: path.join(options.logDir || path.join(__dirname, '../../data/cycles'), 'summaries'),
      archiveDir: path.join(__dirname, '../../data/archives'),
      maxLogSize: options.maxLogSize || 10 * 1024 * 1024, // 10MB
      ...options
    };
    
    this.summaryGenerator = new SummaryGenerator();
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    fs.ensureDirSync(this.options.rawDir);
    fs.ensureDirSync(this.options.summaryDir);
    fs.ensureDirSync(this.options.archiveDir);
  }

  async logCycle(cycleNumber, data) {
    try {
      // Log raw data
      await this.logRawData(cycleNumber, data);
      
      // Generate and save summary
      await this.generateSummary(cycleNumber, data);
      
      console.log(`Logged cycle ${cycleNumber}`);
    } catch (error) {
      console.error(`Error logging cycle ${cycleNumber}:`, error);
      throw error;
    }
  }

  async logRawData(cycleNumber, data) {
    const fileName = `cycle-${String(cycleNumber).padStart(4, '0')}.json`;
    const filePath = path.join(this.options.rawDir, fileName);
    
    // Add metadata to the data
    const logData = {
      cycle: cycleNumber,
      timestamp: new Date().toISOString(),
      ...data
    };
    
    await fs.writeJson(filePath, logData, { spaces: 2 });
  }

  async generateSummary(cycleNumber, data) {
    const summary = await this.summaryGenerator.generate(data, cycleNumber);
    const fileName = `cycle-${String(cycleNumber).padStart(4, '0')}.md`;
    const filePath = path.join(this.options.summaryDir, fileName);
    
    await fs.writeFile(filePath, summary);
  }

  async archiveLogs(month) {
    const archiveFileName = `month-${month.toString().padStart(2, '0')}.json`;
    const archivePath = path.join(this.options.archiveDir, archiveFileName);
    
    // Get all cycle logs from the month
    const cycleFiles = await fs.readdir(this.options.rawDir);
    const monthlyData = [];
    
    for (const file of cycleFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(this.options.rawDir, file);
        const fileData = await fs.readJson(filePath);
        
        // For simplicity, we'll just collect recent cycles
        // In a real implementation, you'd filter by date
        monthlyData.push(fileData);
      }
    }
    
    await fs.writeJson(archivePath, {
      month,
      cycles: monthlyData,
      archivedAt: new Date().toISOString()
    }, { spaces: 2 });
    
    return archivePath;
  }

  async cleanupOldLogs(retentionDays = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const cycleFiles = await fs.readdir(this.options.rawDir);
    
    for (const file of cycleFiles) {
      if (file.endsWith('.json')) {
        const filePath = path.join(this.options.rawDir, file);
        const stats = await fs.stat(filePath);
        
        if (stats.birthtime < cutoffDate) {
          await fs.remove(filePath);
        }
      }
    }
  }
}

module.exports = { CycleLogger };