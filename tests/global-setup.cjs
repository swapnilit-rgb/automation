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

  // Browserbase integration
  if (process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID) {
    try {
      const { Browserbase } = require('@browserbasehq/sdk');
      const bb = new Browserbase({ apiKey: process.env.BROWSERBASE_API_KEY });
      
      // Check for existing sessions and close them first
      try {
        console.log('🔍 Checking for existing Browserbase sessions...');
        const existingSessions = await bb.sessions.list({
          projectId: process.env.BROWSERBASE_PROJECT_ID,
          limit: 10
        });
        
        // Close any active sessions
        for (const session of existingSessions.data || []) {
          if (session.status === 'active' || session.status === 'running') {
            console.log(`🔌 Closing existing session: ${session.id}`);
            try {
              await bb.sessions.update(session.id, { status: 'completed' });
            } catch (err) {
              console.log(`⚠️  Could not close session ${session.id}:`, err.message);
            }
          }
        }
        
        // Wait a moment for sessions to close
        if (existingSessions.data && existingSessions.data.length > 0) {
          console.log('⏳ Waiting for sessions to close...');
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      } catch (listError) {
        console.log('ℹ️  Could not list existing sessions (this is okay):', listError.message);
      }
      
      console.log('🌐 Creating Browserbase session...');
      const session = await bb.sessions.create({
        projectId: process.env.BROWSERBASE_PROJECT_ID,
      });
      
      // Store session info for playwright config
      const sessionInfo = {
        id: session.id,
        connectUrl: session.connectUrl,
        createdAt: new Date().toISOString()
      };
      
      const sessionFile = path.join(__dirname, '..', 'test-results', 'browserbase-session.json');
      fs.writeFileSync(sessionFile, JSON.stringify(sessionInfo, null, 2));
      
      // Set environment variable for playwright config
      process.env.BROWSERBASE_CONNECT_URL = session.connectUrl;
      process.env.BROWSERBASE_SESSION_ID = session.id;
      
      console.log(`✅ Browserbase session created: ${session.id}`);
      console.log(`📺 View replay at: https://browserbase.com/sessions/${session.id}`);
    } catch (error) {
      console.error('❌ Failed to create Browserbase session:', error.message);
      
      // If it's a 429 error (rate limit), provide helpful message
      if (error.message.includes('429') || error.message.includes('concurrent sessions')) {
        console.error('\n💡 Tip: You have an active Browserbase session. Please:');
        console.error('   1. Wait for the current session to complete, or');
        console.error('   2. Close it manually in the Browserbase dashboard, or');
        console.error('   3. Contact Browserbase support to increase your session limit\n');
      }
      
      throw error;
    }
  } else {
    console.log('ℹ️  Running tests locally (Browserbase not configured)');
  }
}

module.exports = globalSetup;
