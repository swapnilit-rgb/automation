// Global teardown for Playwright tests
async function globalTeardown(config) {
  console.log('Starting global teardown');
  
  // Clean up temporary files if needed
  const fs = require('fs');
  const path = require('path');
  
  // Clean up Browserbase session
  if (process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_SESSION_ID) {
    try {
      const { Browserbase } = require('@browserbasehq/sdk');
      const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });
      
      const sessionId = process.env.BROWSERBASE_SESSION_ID;
      console.log(`🔌 Closing Browserbase session: ${sessionId}`);
      
      // Mark session as completed
      try {
        await bb.sessions.update(sessionId, { 
          status: 'completed',
          projectId: process.env.BROWSERBASE_PROJECT_ID
        });
        console.log('✅ Browserbase session marked as completed');
      } catch (updateError) {
        console.log('⚠️ Could not update session status (may already be closed):', updateError.message);
      }
    } catch (error) {
      console.log('⚠️ Could not close Browserbase session:', error.message);
    }
    
    // Clean up session file
    try {
      const sessionFile = path.join(__dirname, '..', 'test-results', 'browserbase-session.json');
      if (fs.existsSync(sessionFile)) {
        fs.unlinkSync(sessionFile);
        console.log('🗑️ Cleaned up Browserbase session file');
      }
    } catch (error) {
      console.log('⚠️ Could not clean up session file:', error.message);
    }
  }
  
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
