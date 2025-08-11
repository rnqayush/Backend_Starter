const fs = require('fs');
const path = require('path');

class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.loadedModules = [];
  }

  /**
   * Load all modules from the modules directory
   */
  loadModules() {
    const modulesPath = path.join(__dirname, '../../modules');
    
    try {
      const moduleDirectories = fs.readdirSync(modulesPath, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

      for (const moduleDir of moduleDirectories) {
        this.loadModule(moduleDir);
      }

      console.log(`✅ Loaded ${this.loadedModules.length} modules:`, this.loadedModules.map(m => m.name));
    } catch (error) {
      console.error('❌ Error loading modules:', error.message);
    }
  }

  /**
   * Load a specific module
   */
  loadModule(moduleName) {
    try {
      const modulePath = path.join(__dirname, '../../modules', moduleName);
      const indexPath = path.join(modulePath, 'index.js');

      if (fs.existsSync(indexPath)) {
        const moduleConfig = require(indexPath);
        
        if (moduleConfig && moduleConfig.router) {
          this.modules.set(moduleName, moduleConfig);
          this.loadedModules.push({
            name: moduleConfig.name || moduleName,
            version: moduleConfig.version || '1.0.0',
            description: moduleConfig.description || 'No description available'
          });
          
          console.log(`📦 Module loaded: ${moduleConfig.name || moduleName}`);
        } else {
          console.warn(`⚠️  Module ${moduleName} does not export router`);
        }
      } else {
        console.warn(`⚠️  Module ${moduleName} does not have index.js file`);
      }
    } catch (error) {
      console.error(`❌ Error loading module ${moduleName}:`, error.message);
    }
  }

  /**
   * Get a specific module
   */
  getModule(moduleName) {
    return this.modules.get(moduleName);
  }

  /**
   * Get all loaded modules
   */
  getAllModules() {
    return Array.from(this.modules.values());
  }

  /**
   * Get module information
   */
  getModuleInfo() {
    return this.loadedModules;
  }

  /**
   * Register routes for all modules with an Express app
   */
  registerRoutes(app, basePath = '/api') {
    for (const [moduleName, moduleConfig] of this.modules) {
      if (moduleConfig.router) {
        app.use(basePath, moduleConfig.router);
        console.log(`🔗 Routes registered for module: ${moduleConfig.name || moduleName}`);
      }
    }
  }
}

module.exports = new ModuleRegistry();

