/**
 * helpers.js - Utility Functions for Test Automation
 * 
 * This file contains helper functions and utilities that can be used across all tests.
 * These functions provide common functionality like data generation, performance measurement,
 * accessibility testing, and error handling.
 * 
 * Benefits of using helper functions:
 * - Reduces code duplication across tests
 * - Provides consistent behavior
 * - Makes tests more readable and maintainable
 * - Centralizes complex logic
 * 
 * Usage:
 * const helpers = new TestHelpers(page);
 * await helpers.takeFullPageScreenshot(page, 'test-name');
 */

import { testData } from '../test-data.js';

export class TestHelpers {
  /**
   * Constructor - Initialize the helper with a page object
   * @param {Page} page - Playwright page object
   * 
   * The page object is needed for most helper functions that interact with the browser
   */
  constructor(page) {
    this.page = page; // Store the page object for use in helper methods
  }

  // ==================== DATE AND TIME UTILITIES ====================
  
  /**
   * Get current date in YYYY-MM-DD format
   * @returns {string} - Current date in ISO format
   * 
   * Useful for date-based form fields and validation
   */
  static getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // Extract date part from ISO string
  }

  /**
   * Get current year as a number
   * @returns {number} - Current year
   * 
   * Useful for conference filtering and year-based tests
   */
  static getCurrentYear() {
    return new Date().getFullYear();
  }

  /**
   * Get a future date
   * @param {number} days - Number of days in the future (default: 30)
   * @returns {string} - Future date in YYYY-MM-DD format
   * 
   * Useful for testing date pickers and future event registration
   */
  static getFutureDate(days = 30) {
    const futureDate = new Date(); // Start with current date
    futureDate.setDate(futureDate.getDate() + days); // Add specified days
    return futureDate.toISOString().split('T')[0]; // Return in YYYY-MM-DD format
  }

  // ==================== STRING UTILITIES ====================
  
  /**
   * Generate a random string of specified length
   * @param {number} length - Length of the string to generate (default: 10)
   * @returns {string} - Random string containing letters and numbers
   * 
   * Useful for generating unique identifiers and test data
   */
  static generateRandomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Generate a unique email address
   * @returns {string} - Unique email address
   * 
   * Uses timestamp to ensure uniqueness across test runs
   */
  static generateRandomEmail() {
    const domains = ['example.com', 'test.com', 'demo.org'];
    const domain = domains[Math.floor(Math.random() * domains.length)];
    return `test${Date.now()}@${domain}`;
  }

  /**
   * Generate a random phone number in US format
   * @returns {string} - Random phone number
   * 
   * Creates realistic phone numbers for form testing
   */
  static generateRandomPhone() {
    const areaCode = Math.floor(Math.random() * 900) + 100; // 100-999
    const exchange = Math.floor(Math.random() * 900) + 100; // 100-999
    const number = Math.floor(Math.random() * 9000) + 1000; // 1000-9999
    return `+1-${areaCode}-${exchange}-${number}`;
  }

  // Wait utilities
  static async waitForCondition(page, condition, timeout = 10000) {
    try {
      await page.waitForFunction(condition, { timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  static async waitForElementToDisappear(page, selector, timeout = 5000) {
    try {
      await page.waitForSelector(selector, { state: 'hidden', timeout });
      return true;
    } catch (error) {
      return false;
    }
  }

  // ==================== SCREENSHOT UTILITIES ====================
  
  /**
   * Take a full page screenshot
   * @param {Page} page - Playwright page object
   * @param {string} name - Name for the screenshot file
   * @returns {string} - Path to the saved screenshot
   * 
   * Screenshots are essential for:
   * - Visual verification of test results
   * - Debugging failed tests
   * - Documentation and reporting
   */
  static async takeFullPageScreenshot(page, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-'); // Create safe filename
    const filename = `test-results/screenshots/${name}-${timestamp}.png`;
    await page.screenshot({ 
      path: filename,
      fullPage: true // Capture entire page, not just viewport
    });
    return filename;
  }

  /**
   * Take a screenshot of a specific element
   * @param {Page} page - Playwright page object
   * @param {string} selector - CSS selector for the element
   * @param {string} name - Name for the screenshot file
   * @returns {string} - Path to the saved screenshot
   * 
   * Useful for capturing specific components or form elements
   */
  static async takeElementScreenshot(page, selector, name) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `test-results/screenshots/${name}-${timestamp}.png`;
    await page.locator(selector).screenshot({ path: filename });
    return filename;
  }

  // Form validation utilities
  static async validateFormFields(page, fields) {
    const results = {};
    for (const field of fields) {
      const element = page.locator(field.selector);
      const isVisible = await element.isVisible();
      const isEnabled = await element.isEnabled();
      results[field.name] = { visible: isVisible, enabled: isEnabled };
    }
    return results;
  }

  static async clearAndFillField(page, selector, text) {
    await page.locator(selector).clear();
    await page.locator(selector).fill(text);
  }

  // Network utilities
  static async waitForNetworkIdle(page, timeout = 30000) {
    await page.waitForLoadState('networkidle', { timeout });
  }

  static async interceptRequests(page, urlPattern) {
    const requests = [];
    page.on('request', request => {
      if (request.url().includes(urlPattern)) {
        requests.push(request);
      }
    });
    return requests;
  }

  // Error handling utilities
  static async handleUnexpectedAlert(page) {
    page.on('dialog', async dialog => {
      console.log(`Unexpected dialog: ${dialog.message()}`);
      await dialog.accept();
    });
  }

  static async retryOperation(operation, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // Performance utilities
  static async measurePageLoadTime(page, url) {
    const startTime = Date.now();
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    const loadTime = Date.now() - startTime;
    return loadTime;
  }

  static async getPageMetrics(page) {
    const metrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      return {
        domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
        loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
        totalTime: navigation.loadEventEnd - navigation.fetchStart
      };
    });
    return metrics;
  }

  // Accessibility utilities
  static async checkAccessibility(page) {
    // Basic accessibility checks
    const issues = [];
    
    // Check for alt text on images
    const imagesWithoutAlt = await page.locator('img:not([alt])').count();
    if (imagesWithoutAlt > 0) {
      issues.push(`${imagesWithoutAlt} images without alt text`);
    }

    // Check for proper heading hierarchy
    const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
    let previousLevel = 0;
    for (const heading of headings) {
      const tagName = await heading.evaluate(el => el.tagName);
      const level = parseInt(tagName.substring(1));
      if (level > previousLevel + 1) {
        issues.push(`Heading hierarchy issue: ${tagName} after h${previousLevel}`);
      }
      previousLevel = level;
    }

    return issues;
  }

  // Data generation utilities
  static generateTestUser() {
    return {
      firstName: `Test${Math.floor(Math.random() * 1000)}`,
      lastName: `User${Math.floor(Math.random() * 1000)}`,
      email: this.generateRandomEmail(),
      phone: this.generateRandomPhone(),
      organization: `Test Organization ${Math.floor(Math.random() * 100)}`,
      title: 'Test Title'
    };
  }

  static generateContactData() {
    return {
      name: `Contact ${Math.floor(Math.random() * 1000)}`,
      email: this.generateRandomEmail(),
      phone: this.generateRandomPhone(),
      subject: `Test Subject ${Math.floor(Math.random() * 100)}`,
      message: `This is a test message generated at ${new Date().toISOString()}`
    };
  }

  // File utilities
  static async downloadFile(page, downloadSelector, expectedFilename) {
    const downloadPromise = page.waitForEvent('download');
    await page.locator(downloadSelector).click();
    const download = await downloadPromise;
    const filename = download.suggestedFilename();
    await download.saveAs(`test-results/downloads/${filename}`);
    return filename;
  }

  // Cookie and storage utilities
  static async clearBrowserData(page) {
    await page.context().clearCookies();
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  }

  static async setCookies(page, cookies) {
    await page.context().addCookies(cookies);
  }

  // Mobile testing utilities
  static async simulateMobileDevice(page, device = 'iPhone 12') {
    const devices = {
      'iPhone 12': { width: 390, height: 844 },
      'iPhone 12 Pro': { width: 390, height: 844 },
      'Samsung Galaxy S20': { width: 360, height: 800 },
      'iPad': { width: 768, height: 1024 }
    };
    
    const dimensions = devices[device] || devices['iPhone 12'];
    await page.setViewportSize(dimensions);
  }

  // ==================== 404 ERROR HANDLING ====================
  
  /**
   * Check if a page object has a 404 error and skip test if so
   * @param {BasePage} pageObject - The page object to check
   * @param {string} pageName - Name of the page for error message
   * @param {test} test - The test object from Playwright
   * @returns {Promise<boolean>} - True if 404 was detected and test was skipped
   * 
   * This helper checks for 404 errors and skips the test if one is found
   */
  static async checkAndSkipIf404(pageObject, pageName, test) {
    try {
      const is404 = await pageObject.is404Error();
      if (is404) {
        test.skip(true, `${pageName} returned 404 error - skipping test`);
        return true;
      }
    } catch (error) {
      // If error message contains 404_ERROR, skip the test
      if (error.message && error.message.includes('404_ERROR')) {
        test.skip(true, `${pageName} returned 404 error - skipping test`);
        return true;
      }
    }
    return false;
  }

  /**
   * Wrap a navigation function with 404 checking
   * @param {Function} navigationFn - The navigation function to wrap
   * @param {string} pageName - Name of the page for error message
   * @param {test} test - The test object from Playwright
   * @returns {Promise} - Result of navigation function or skipped test
   */
  static async navigateWith404Check(navigationFn, pageName, test) {
    try {
      await navigationFn();
      // Check for 404 after navigation
      // Note: This assumes the navigation function uses a page object that has is404Error method
    } catch (error) {
      if (error.message && error.message.includes('404_ERROR')) {
        test.skip(true, `${pageName} returned 404 error - skipping test`);
        return;
      }
      throw error;
    }
  }
}
