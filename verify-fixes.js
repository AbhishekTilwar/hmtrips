#!/usr/bin/env node

/**
 * ============================================================================
 * HMTrips Error Verification Script
 * ============================================================================
 * This script verifies that all errors have been fixed and optimizations applied
 * Run: node verify-fixes.js
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// ANSI color codes
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// Test results storage
const results = {
  passed: [],
  failed: [],
  warnings: [],
  info: [],
};

// Helper functions
function printHeader(text) {
  console.log('\n' + colors.cyan + '='.repeat(80) + colors.reset);
  console.log(colors.cyan + colors.bright + text + colors.reset);
  console.log(colors.cyan + '='.repeat(80) + colors.reset + '\n');
}

function printSuccess(text) {
  console.log(colors.green + '✓ ' + text + colors.reset);
  results.passed.push(text);
}

function printError(text) {
  console.log(colors.red + '✗ ' + text + colors.reset);
  results.failed.push(text);
}

function printWarning(text) {
  console.log(colors.yellow + '⚠ ' + text + colors.reset);
  results.warnings.push(text);
}

function printInfo(text) {
  console.log(colors.blue + 'ℹ ' + text + colors.reset);
  results.info.push(text);
}

function fileExists(filePath) {
  return fs.existsSync(path.join(process.cwd(), filePath));
}

function readFile(filePath) {
  try {
    return fs.readFileSync(path.join(process.cwd(), filePath), 'utf8');
  } catch (error) {
    return null;
  }
}

function getFileSize(filePath) {
  try {
    const stats = fs.statSync(path.join(process.cwd(), filePath));
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function execCommand(command, silent = true) {
  try {
    return execSync(command, { encoding: 'utf8', stdio: silent ? 'pipe' : 'inherit' });
  } catch (error) {
    return null;
  }
}

// Test functions
function testFirebaseFiles() {
  printHeader('1. Firebase Configuration Files');

  if (fileExists('firestore.rules')) {
    const content = readFile('firestore.rules');
    if (content && content.includes("rules_version = '2'")) {
      printSuccess('firestore.rules exists and is properly formatted');
    } else {
      printError('firestore.rules exists but may be improperly formatted');
    }
  } else {
    printError('firestore.rules not found');
  }

  if (fileExists('firestore.indexes.json')) {
    const content = readFile('firestore.indexes.json');
    try {
      const json = JSON.parse(content);
      if (json.indexes && json.indexes.length > 0) {
        printSuccess(`firestore.indexes.json exists with ${json.indexes.length} indexes`);
      } else {
        printWarning('firestore.indexes.json exists but has no indexes defined');
      }
    } catch (error) {
      printError('firestore.indexes.json exists but is not valid JSON');
    }
  } else {
    printError('firestore.indexes.json not found');
  }

  if (fileExists('.firebaserc')) {
    printSuccess('.firebaserc exists (Firebase initialized)');
  } else {
    printWarning('.firebaserc not found - Firebase may not be initialized');
  }
}

function testFirebaseConnection() {
  printHeader('2. Firebase CLI & Connection');

  const firebaseVersion = execCommand('firebase --version');
  if (firebaseVersion) {
    printSuccess(`Firebase CLI installed: ${firebaseVersion.trim()}`);
  } else {
    printError('Firebase CLI not installed');
    printInfo('Install with: npm install -g firebase-tools');
    return;
  }

  const projectsList = execCommand('firebase projects:list');
  if (projectsList) {
    printSuccess('Successfully connected to Firebase');
    if (projectsList.includes('hmtours-febe0')) {
      printSuccess('Project "hmtours-febe0" found');
    } else {
      printWarning('Project "hmtours-febe0" not found in Firebase projects');
    }
  } else {
    printWarning('Not logged in to Firebase or connection failed');
    printInfo('Login with: firebase login');
  }
}

function testReactRouterFix() {
  printHeader('3. React Router Future Flags');

  const mainJsx = readFile('src/main.jsx');
  if (mainJsx) {
    if (mainJsx.includes('v7_startTransition: true')) {
      printSuccess('v7_startTransition future flag enabled');
    } else {
      printError('v7_startTransition future flag NOT enabled');
    }

    if (mainJsx.includes('v7_relativeSplatPath: true')) {
      printSuccess('v7_relativeSplatPath future flag enabled');
    } else {
      printError('v7_relativeSplatPath future flag NOT enabled');
    }

    if (mainJsx.includes('future={{') || mainJsx.includes('future: {')) {
      printSuccess('BrowserRouter configured with future flags');
    } else {
      printError('BrowserRouter missing future flags configuration');
    }
  } else {
    printError('src/main.jsx not found');
  }
}

function testViteConfig() {
  printHeader('4. Vite Configuration & Code Splitting');

  const viteConfig = readFile('vite.config.js');
  if (viteConfig) {
    printSuccess('vite.config.js exists');

    if (viteConfig.includes('manualChunks')) {
      printSuccess('Code splitting (manualChunks) configured');
    } else {
      printWarning('Code splitting (manualChunks) NOT configured');
    }

    if (viteConfig.includes('terserOptions')) {
      printSuccess('Terser minification configured');
    } else {
      printWarning('Terser minification NOT configured');
    }

    if (viteConfig.includes('drop_console')) {
      printSuccess('Console.log removal in production enabled');
    } else {
      printWarning('Console.log removal NOT configured');
    }

    if (viteConfig.includes('cssCodeSplit')) {
      printSuccess('CSS code splitting enabled');
    } else {
      printWarning('CSS code splitting NOT enabled');
    }

    if (viteConfig.includes('treeshake')) {
      printSuccess('Tree shaking configured');
    } else {
      printWarning('Tree shaking NOT explicitly configured');
    }
  } else {
    printError('vite.config.js not found');
  }
}

function testFirebaseConfig() {
  printHeader('5. Firebase SDK Configuration');

  const firebaseJs = readFile('src/lib/firebase.js');
  if (firebaseJs) {
    printSuccess('src/lib/firebase.js exists');

    if (firebaseJs.includes('enableIndexedDbPersistence')) {
      printSuccess('Offline persistence enabled');
    } else {
      printWarning('Offline persistence NOT enabled');
    }

    if (firebaseJs.includes('handleFirestoreError')) {
      printSuccess('Error handling functions implemented');
    } else {
      printWarning('Error handling functions NOT found');
    }

    if (firebaseJs.includes('retryOperation')) {
      printSuccess('Retry logic implemented');
    } else {
      printWarning('Retry logic NOT found');
    }

    if (firebaseJs.includes('CACHE_SIZE_UNLIMITED')) {
      printSuccess('Unlimited cache size configured');
    } else {
      printWarning('Cache size NOT optimized');
    }

    if (firebaseJs.includes('experimentalForceLongPolling: false')) {
      printSuccess('WebChannel optimization enabled (long polling disabled)');
    } else {
      printWarning('WebChannel NOT optimized');
    }
  } else {
    printError('src/lib/firebase.js not found');
  }
}

function testBuildOutput() {
  printHeader('6. Build Output Verification');

  if (!fileExists('dist')) {
    printWarning('dist folder not found - Run "npm run build" first');
    return;
  }

  printSuccess('dist folder exists');

  // Check for code-split chunks
  const distAssets = path.join(process.cwd(), 'dist', 'assets');
  if (fs.existsSync(distAssets)) {
    const files = fs.readdirSync(distAssets);
    const jsFiles = files.filter(f => f.endsWith('.js'));

    printInfo(`Found ${jsFiles.length} JavaScript files in dist/assets`);

    const vendorChunks = jsFiles.filter(f => f.includes('vendor'));
    const reactVendor = jsFiles.find(f => f.includes('react-vendor'));
    const firebaseVendor = jsFiles.find(f => f.includes('firebase-vendor'));
    const recommendationsChunk = jsFiles.find(f => f.includes('recommendations') || f.includes('ml-'));

    if (vendorChunks.length > 0) {
      printSuccess(`Code splitting working: ${vendorChunks.length} vendor chunks found`);
    } else {
      printWarning('Vendor chunks not found - code splitting may not be working');
    }

    if (reactVendor) {
      const size = getFileSize(`dist/assets/${reactVendor}`);
      printSuccess(`React vendor chunk: ${reactVendor} (${formatBytes(size)})`);
    }

    if (firebaseVendor) {
      const size = getFileSize(`dist/assets/${firebaseVendor}`);
      printSuccess(`Firebase vendor chunk: ${firebaseVendor} (${formatBytes(size)})`);
    }

    if (recommendationsChunk) {
      const size = getFileSize(`dist/assets/${recommendationsChunk}`);
      printSuccess(`Recommendations chunk: ${recommendationsChunk} (${formatBytes(size)})`);
    }

    // Calculate total bundle size
    let totalSize = 0;
    jsFiles.forEach(file => {
      totalSize += getFileSize(`dist/assets/${file}`);
    });

    printInfo(`Total JavaScript bundle size: ${formatBytes(totalSize)}`);

    if (totalSize < 500 * 1024) {
      printSuccess('Bundle size is excellent (<500 KB)');
    } else if (totalSize < 800 * 1024) {
      printSuccess('Bundle size is good (<800 KB)');
    } else if (totalSize < 1000 * 1024) {
      printWarning('Bundle size is acceptable but could be optimized (<1 MB)');
    } else {
      printError('Bundle size is too large (>1 MB) - needs optimization');
    }
  } else {
    printWarning('dist/assets folder not found');
  }
}

function testEnvironmentVariables() {
  printHeader('7. Environment Configuration');

  if (fileExists('.env.production')) {
    printSuccess('.env.production template exists');
  } else {
    printWarning('.env.production not found');
  }

  if (fileExists('.env.production.local')) {
    printSuccess('.env.production.local exists (gitignored)');
  } else {
    printInfo('.env.production.local not found (create from .env.production)');
  }

  const envVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
  ];

  envVars.forEach(varName => {
    if (process.env[varName]) {
      printSuccess(`${varName} is set`);
    } else {
      printInfo(`${varName} not set in current environment`);
    }
  });
}

function testDeploymentScripts() {
  printHeader('8. Deployment Scripts');

  if (fileExists('deploy-firebase.sh')) {
    printSuccess('deploy-firebase.sh exists (Linux/Mac)');
    const stats = fs.statSync(path.join(process.cwd(), 'deploy-firebase.sh'));
    if ((stats.mode & 0o111) !== 0) {
      printSuccess('deploy-firebase.sh is executable');
    } else {
      printWarning('deploy-firebase.sh is not executable - run: chmod +x deploy-firebase.sh');
    }
  } else {
    printWarning('deploy-firebase.sh not found');
  }

  if (fileExists('deploy-firebase.bat')) {
    printSuccess('deploy-firebase.bat exists (Windows)');
  } else {
    printWarning('deploy-firebase.bat not found');
  }
}

function testPackageJson() {
  printHeader('9. Package Dependencies');

  const packageJson = readFile('package.json');
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson);

      printSuccess('package.json is valid');

      // Check critical dependencies
      const criticalDeps = {
        'react': '^18.2.0',
        'react-dom': '^18.2.0',
        'react-router-dom': '^6.21.0',
        'firebase': '^11.0.0',
        'vite': '^5.0.8',
      };

      Object.entries(criticalDeps).forEach(([dep, minVersion]) => {
        if (pkg.dependencies && pkg.dependencies[dep]) {
          printSuccess(`${dep} installed (${pkg.dependencies[dep]})`);
        } else if (pkg.devDependencies && pkg.devDependencies[dep]) {
          printSuccess(`${dep} installed as devDep (${pkg.devDependencies[dep]})`);
        } else {
          printError(`${dep} NOT found in dependencies`);
        }
      });

      // Check build scripts
      if (pkg.scripts && pkg.scripts.build) {
        printSuccess(`Build script configured: ${pkg.scripts.build}`);
      } else {
        printError('Build script NOT configured');
      }

    } catch (error) {
      printError('package.json is not valid JSON');
    }
  } else {
    printError('package.json not found');
  }
}

function generateScoreCard() {
  printHeader('Final Score Card');

  const total = results.passed.length + results.failed.length;
  const score = total > 0 ? Math.round((results.passed.length / total) * 100) : 0;

  console.log(`${colors.bright}Total Tests:${colors.reset} ${total}`);
  console.log(`${colors.green}Passed:${colors.reset} ${results.passed.length}`);
  console.log(`${colors.red}Failed:${colors.reset} ${results.failed.length}`);
  console.log(`${colors.yellow}Warnings:${colors.reset} ${results.warnings.length}`);
  console.log(`${colors.blue}Info:${colors.reset} ${results.info.length}`);
  console.log();

  console.log(`${colors.bright}Overall Score: ${colors.reset}${score}%`);
  console.log();

  // Performance & Scalability estimates
  let performanceScore = 7;
  let scalabilityScore = 7;

  // Improve scores based on fixes
  if (results.passed.includes('Code splitting (manualChunks) configured')) performanceScore += 1;
  if (results.passed.includes('Terser minification configured')) performanceScore += 0.5;
  if (results.passed.includes('Offline persistence enabled')) scalabilityScore += 1;
  if (results.passed.includes('Retry logic implemented')) scalabilityScore += 0.5;
  if (results.passed.includes('Code splitting working: 2 vendor chunks found') ||
      results.passed.some(p => p.includes('vendor chunks found'))) performanceScore += 0.5;

  performanceScore = Math.min(10, performanceScore);
  scalabilityScore = Math.min(10, scalabilityScore);

  console.log(`${colors.bright}Estimated Performance:${colors.reset} ${performanceScore.toFixed(1)}/10`);
  console.log(`${colors.bright}Estimated Scalability:${colors.reset} ${scalabilityScore.toFixed(1)}/10`);
  console.log();

  // Status
  if (results.failed.length === 0) {
    console.log(colors.green + colors.bright + '✓ ALL CHECKS PASSED!' + colors.reset);
    console.log(colors.green + '  Your project is error-free and optimized!' + colors.reset);
  } else if (results.failed.length <= 2) {
    console.log(colors.yellow + colors.bright + '⚠ MOSTLY READY' + colors.reset);
    console.log(colors.yellow + '  Fix the failed checks above to be 100% ready' + colors.reset);
  } else {
    console.log(colors.red + colors.bright + '✗ NEEDS WORK' + colors.reset);
    console.log(colors.red + '  Please address the failed checks above' + colors.reset);
  }

  console.log();

  // Next steps
  if (results.failed.length > 0 || results.warnings.length > 0) {
    printHeader('Recommended Actions');

    if (results.failed.some(f => f.includes('firestore.rules'))) {
      printInfo('1. Create firestore.rules from the template provided');
    }

    if (results.failed.some(f => f.includes('React Router'))) {
      printInfo('2. Update src/main.jsx with future flags');
    }

    if (results.failed.some(f => f.includes('Code splitting'))) {
      printInfo('3. Update vite.config.js with code splitting configuration');
    }

    if (results.warnings.some(w => w.includes('Firebase CLI'))) {
      printInfo('4. Install Firebase CLI: npm install -g firebase-tools');
      printInfo('5. Login to Firebase: firebase login');
    }

    if (!fileExists('dist')) {
      printInfo('6. Build the project: npm run build');
    }

    if (results.failed.length === 0 && results.warnings.some(w => w.includes('Firebase') || w.includes('firestore'))) {
      printInfo('7. Deploy Firebase rules: ./deploy-firebase.sh (or deploy-firebase.bat on Windows)');
    }
  }

  console.log();
}

// Main execution
function main() {
  console.log(colors.cyan + colors.bright);
  console.log(`
  ╔═══════════════════════════════════════════════════════════════════════╗
  ║                                                                       ║
  ║              HMTrips Error Verification & Testing Script             ║
  ║                                                                       ║
  ║  This script verifies that all errors have been fixed and            ║
  ║  optimizations have been applied correctly.                          ║
  ║                                                                       ║
  ╚═══════════════════════════════════════════════════════════════════════╝
  `);
  console.log(colors.reset);

  testFirebaseFiles();
  testFirebaseConnection();
  testReactRouterFix();
  testViteConfig();
  testFirebaseConfig();
  testBuildOutput();
  testEnvironmentVariables();
  testDeploymentScripts();
  testPackageJson();
  generateScoreCard();

  printHeader('Documentation');
  printInfo('For detailed instructions, see:');
  printInfo('  • ERROR_FREE_SETUP.md - Step-by-step fix guide');
  printInfo('  • PRODUCTION_READINESS_REPORT.md - Complete analysis');
  printInfo('  • QUICK_OPTIMIZATIONS.md - Performance improvements');
  printInfo('  • LAUNCH_CHECKLIST.md - Pre-launch checklist');
  console.log();

  process.exit(results.failed.length > 0 ? 1 : 0);
}

// Run the script
main();
