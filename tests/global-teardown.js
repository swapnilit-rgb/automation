// Global teardown for Playwright tests
async function globalTeardown(config) {
  console.log('Starting global test ...');
  
  // Clean up temporary files if needed
  const fs = require('fs');
  const path = require('path');
  
  // Optional: Clean up old screenshots (keep last 10)
  try {
    const screenshotsDir = 'test-results/screenshots';
    if (fs.existsSync(screenshotsDir)) {
      const files = fs.readdirSync(screenshotsDir);
      if (files.length > 10) {
        // Sort by modification time and remove oldest
        const sortedFiles = files
          .map(file => ({
            name: file,
            time: fs.statSync(path.join(screenshotsDir, file)).mtime
          }))
          .sort((a, b) => a.time - b.time);
        
        const filesToDelete = sortedFiles.slice(0, files.length - 10);
        filesToDelete.forEach(file => {
          fs.unlinkSync(path.join(screenshotsDir, file.name));
        });
        
        console.log(`🗑️ Cleaned up ${filesToDelete.length} old screenshots`);
      }
    }
  } catch (error) {
    console.log('⚠️ Could not clean up old screenshots:', error.message);
  }
  
  console.log('✅ Global teardown completed');
}

module.exports = globalTeardown;
