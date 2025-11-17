import { defineConfig, devices } from '@playwright/test';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Check if Browserbase is configured
const isBrowserbase = !!(process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID);

export default defineConfig({

  testDir: './tests',

  fullyParallel: !isBrowserbase, // Disable parallel execution for Browserbase (single session)

  globalSetup: resolve(__dirname, './tests/global-setup.cjs'),
  globalTeardown: resolve(__dirname, './tests/global-teardown.cjs'),
  
  
  retries: process.env.CI ? 2 : 0, /*retry 2 times in CI 0 in local*/
  
  workers: isBrowserbase ? 1 : (process.env.CI ? 1 : undefined), // Single worker for Browserbase
  
  expect: {
    timeout: 30000, // 30 seconds
  },

  timeout: 90000, // 90 seconds for individual tests (increased for slow networks)
  reporter: [
    ['html'], // HTML report for easy viewing in browser
    ['json', { outputFile: 'test-results/results.json' }], // JSON for programmatic access
    ['junit', { outputFile: 'test-results/results.xml' }] // JUnit XML for CI/CD integration
  ],
  
  
  use: {
    baseURL: 'https://binaytara.org/',
    actionTimeout: 15000, // 15 seconds
    navigationTimeout: 30000, // 30 seconds
    trace: 'on-first-retry', // Collect trace only when retrying failed tests
  },

  
  projects: [

    {
      name: 'chromium',
      use: { 
        ...devices['Desktop Chrome'], // Desktop Chrome configuration
      },
    },

    /**
     * Firefox - Uncomment to test on Firefox
     * Good for cross-browser compatibility testing
     */
    /*{
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },*/

    /**
     * WebKit (Safari) - Uncomment to test on Safari
     * Important for macOS and iOS compatibility
     */
    /*{
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },*/

    /**
     * Mobile device testing - Uncomment to test on mobile devices
     * Important for responsive design validation
     */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] }, // Android device
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] }, // iOS device
    // },
    
    /**
     * Branded browser testing - Uncomment to test on specific browser versions
     * Useful for testing specific browser features or compatibility
     */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

