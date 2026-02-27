const fs = require('fs-extra');
const path = require('path');

class StateSaver {
  constructor(options = {}) {
    this.options = {
      dataDir: options.dataDir || path.join(__dirname, '../../data'),
      backupOnSave: options.backupOnSave !== false, // default to true
      ...options
    };
  }

  async saveWorldState(state) {
    const worldPath = path.join(this.options.dataDir, 'world.json');
    
    try {
      // Create backup if option is enabled
      if (this.options.backupOnSave && await fs.pathExists(worldPath)) {
        const backupPath = `${worldPath}.backup`;
        await fs.copy(worldPath, backupPath);
      }
      
      // Update timestamp before saving
      const stateToSave = {
        ...state,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(worldPath, stateToSave, { spaces: 2 });
      console.log(`World state saved to ${worldPath}`);
    } catch (error) {
      console.error(`Error saving world state: ${error.message}`);
      throw error;
    }
  }

  async saveMachineState(state) {
    const machinePath = path.join(this.options.dataDir, 'machine.json');
    
    try {
      // Create backup if option is enabled
      if (this.options.backupOnSave && await fs.pathExists(machinePath)) {
        const backupPath = `${machinePath}.backup`;
        await fs.copy(machinePath, backupPath);
      }
      
      // Update timestamp before saving
      const stateToSave = {
        ...state,
        timestamp: new Date().toISOString()
      };
      
      await fs.writeJson(machinePath, stateToSave, { spaces: 2 });
      console.log(`Machine state saved to ${machinePath}`);
    } catch (error) {
      console.error(`Error saving machine state: ${error.message}`);
      throw error;
    }
  }

  async saveMetadata(metadata) {
    const metadataPath = path.join(this.options.dataDir, 'metadata.json');
    
    try {
      // Create backup if option is enabled
      if (this.options.backupOnSave && await fs.pathExists(metadataPath)) {
        const backupPath = `${metadataPath}.backup`;
        await fs.copy(metadataPath, backupPath);
      }
      
      await fs.writeJson(metadataPath, metadata, { spaces: 2 });
      console.log(`Metadata saved to ${metadataPath}`);
    } catch (error) {
      console.error(`Error saving metadata: ${error.message}`);
      throw error;
    }
  }
}

module.exports = { StateSaver };