// Global setup for Playwright tests
async function globalSetup(config) {  
  // Create necessary directories
  const fs = require('fs');
  const path = require('path');
  
  const directories = [
    'test-results',
    'test-results/screenshots',
    'test-results/downloads',
    'playwright-report'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // Set environment variables
  process.env.TEST_ENV = 'automation';
  process.env.BASE_URL = 'https://binaytara.org';

}

module.exports = globalSetup;
