const fs = require('fs');
const path = require('path');

class ModuleRegistry {
  constructor() {
    this.modules = new Map();
    this.loadedModules = [];
  }

  // Load all modules from the modules directory
  loadModules() {
    const modulesPath = path.join(__dirname, '../../modules');
    
    if (!fs.existsSync(modulesPath)) {
      console.log('📁 Modules directory not found, creating...');
      fs.mkdirSync(modulesPath, { recursive: true });
      return;
    }

    const moduleDirectories = fs.readdirSync(modulesPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => dirent.name);

    console.log('🔍 Scanning for modules...');

    moduleDirectories.forEach(moduleName => {
      try {
        this.loadModule(moduleName);
      } catch (error) {
        console.error(`❌ Failed to load module ${moduleName}:`, error.message);
      }
    });

    console.log(`✅ Loaded ${this.loadedModules.length} modules:`, this.loadedModules.join(', '));
  }

  // Load a specific module
  loadModule(moduleName) {
    const modulePath = path.join(__dirname, '../../modules', moduleName);
    const routesPath = path.join(modulePath, 'routes');

    if (!fs.existsSync(routesPath)) {
      console.log(`⚠️  No routes directory found for module: ${moduleName}`);
      return;
    }

    // Get all route files in the module
    const routeFiles = fs.readdirSync(routesPath)
      .filter(file => file.endsWith('.js'))
      .map(file => file.replace('.js', ''));

    if (routeFiles.length === 0) {
      console.log(`⚠️  No route files found for module: ${moduleName}`);
      return;
    }

    // Store module info
    this.modules.set(moduleName, {
      name: moduleName,
      path: modulePath,
      routes: routeFiles,
      loaded: true,
      loadedAt: new Date().toISOString()
    });

    this.loadedModules.push(moduleName);
    console.log(`📦 Module loaded: ${moduleName} (routes: ${routeFiles.join(', ')})`);
  }

  // Register all module routes with Express app
  registerRoutes(app, basePath = '/api') {
    this.modules.forEach((moduleInfo, moduleName) => {
      moduleInfo.routes.forEach(routeName => {
        try {
          const routePath = path.join(__dirname, '../../modules', moduleName, 'routes', `${routeName}.js`);
          
          if (fs.existsSync(routePath)) {
            const router = require(routePath);
            const moduleBasePath = `${basePath}/${moduleName}`;
            
            app.use(moduleBasePath, router);
            console.log(`🛣️  Registered route: ${moduleBasePath} -> ${routeName}`);
          }
        } catch (error) {
          console.error(`❌ Failed to register route ${routeName} for module ${moduleName}:`, error.message);
        }
      });
    });
  }

  // Get information about loaded modules
  getModuleInfo() {
    const moduleInfo = {};
    
    this.modules.forEach((info, name) => {
      moduleInfo[name] = {
        loaded: info.loaded,
        routes: info.routes,
        loadedAt: info.loadedAt
      };
    });

    return moduleInfo;
  }

  // Check if a module is loaded
  isModuleLoaded(moduleName) {
    return this.modules.has(moduleName);
  }

  // Get loaded module names
  getLoadedModules() {
    return this.loadedModules;
  }

  // Reload a specific module (useful for development)
  reloadModule(moduleName) {
    if (this.modules.has(moduleName)) {
      // Clear require cache for the module
      const modulePath = path.join(__dirname, '../../modules', moduleName);
      Object.keys(require.cache).forEach(key => {
        if (key.startsWith(modulePath)) {
          delete require.cache[key];
        }
      });

      // Remove from registry
      this.modules.delete(moduleName);
      const index = this.loadedModules.indexOf(moduleName);
      if (index > -1) {
        this.loadedModules.splice(index, 1);
      }

      // Reload
      this.loadModule(moduleName);
      console.log(`🔄 Module reloaded: ${moduleName}`);
    }
  }
}

// Export singleton instance
module.exports = new ModuleRegistry();
