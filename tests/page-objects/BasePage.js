export class BasePage {
  constructor(page) {
    this.page = page;
  }

  /**
   * Helper method to delay execution without requiring the page object
   * @param {number} ms - Milliseconds to wait
   */
  async delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Navigate to a URL and return navigation result with status information
   * @param {string} url - URL to navigate to
   * @param {object} options - Navigation options
   * @returns {Promise<{response: Response|null, is404: boolean, status: number|null}>}
   */
  async goto(url = '/', options = {}) {
    const defaultOptions = {
      timeout: 30000, // 30 seconds
      waitUntil: 'domcontentloaded' // Faster than 'load', more reliable than 'networkidle'
    };
    
    const gotoOptions = { ...defaultOptions, ...options };
    
    const maxRetries = 1; // Reduced retries to avoid timeout issues
    let lastError;
    let response = null;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        // Check if page is still valid before attempting navigation
        if (this.page.isClosed()) {
          throw new Error('Page has been closed');
        }
        
        // Navigate to the page - page.goto() returns the Response object
        response = await this.page.goto(url, gotoOptions);
        
        // Store response for later use
        this._lastResponse = response;
        
        // Check status code immediately
        let status = null;
        let is404 = false;
        
        if (response) {
          try {
            status = response.status();
            is404 = status === 404;
          } catch (e) {
            // Response.status() might throw in some cases, we'll check content instead
          }
        }
        
        // Wait for page to load to check content if status wasn't available or to verify
        await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
        
        // If we couldn't get status from response, or to be thorough, check page content
        if (!is404) {
          is404 = await this.check404InContent();
          // If content check found 404 but we have a status, trust the status
          // Otherwise, if content says 404, it's likely a 404
          if (is404 && status === null) {
            status = 404; // Infer status from content
          }
        }
        
        return { response, is404, status };
      } catch (error) {
        lastError = error;
        
        // Don't retry non-retryable errors
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('net::err_name_not_resolved') || 
            errorMessage.includes('net::err_ssl') ||
            errorMessage.includes('timeout')) {
          throw error; // Non-retryable or timeout, throw immediately
        }
        
        // Don't retry if page/browser is closed
        if (errorMessage.includes('target page, context or browser has been closed') ||
            errorMessage.includes('page has been closed') ||
            this.page.isClosed()) {
          throw error; // Page closed, cannot retry
        }
        
        if (attempt < maxRetries) {
          const delay = 2000; // Simple 2s delay for single retry
          console.log(`Navigation to ${url} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
          await this.delay(delay);
          gotoOptions.timeout = 30000; // Keep same timeout on retry
        }
      }
    }
    
    // All retries exhausted
    console.error(`Navigation to ${url} failed after ${maxRetries + 1} attempts:`, lastError.message);
    throw lastError;
  }

  /**
   * Check page content for 404 indicators (helper method)
   * @returns {Promise<boolean>} - True if 404 indicators found
   */
  async check404InContent() {
    try {
      const bodyText = await this.page.locator('body').textContent().catch(() => '');
      const title = await this.page.title().catch(() => '');
      const url = this.page.url().toLowerCase();
      
      const fourOhFourIndicators = [
        '404',
        'not found',
        'page not found',
        'error 404',
        '404 error'
      ];
      
      const allText = (bodyText + ' ' + title).toLowerCase();
      const has404Indicator = fourOhFourIndicators.some(indicator => 
        allText.includes(indicator)
      );
      const urlHas404 = url.includes('404') || url.includes('not-found');
      
      return has404Indicator || urlHas404;
    } catch {
      return false;
    }
  }

  async waitForElement(selector, options = {}) {
    await this.page.waitForSelector(selector, options);
  }

  async expectTitle(expectedTitle, options = {}) {
    const timeout = options.timeout || 10000; // Reduced to 10 seconds (default)
    
    // Use Playwright's built-in title matcher which is faster and more reliable
    try {
      await this.page.waitForFunction(
        (title) => {
          const currentTitle = document.title;
          return currentTitle && currentTitle.includes(title);
        },
        expectedTitle,
        { timeout }
      );
    } catch (error) {
      // Get actual title for better error message
      let actualTitle = 'unknown';
      try {
        actualTitle = await this.page.title();
      } catch (e) {
        // Page might be closed
      }
      throw new Error(
        `Expected title to contain "${expectedTitle}" but got "${actualTitle}"`
      );
    }
  }


  /**
   * Check if the website is accessible by making a simple request
   * @param {string} url - URL to check
   * @returns {boolean} - True if accessible, false otherwise
   */
  async isWebsiteAccessible(url = '/') {
    try {
      const response = await this.page.goto(url, { 
        timeout: 15000,
        waitUntil: 'domcontentloaded'
      });
      return response && response.status() < 400;
    } catch (error) {
      console.log(`Website accessibility check failed for ${url}:`, error.message);
      return false;
    }
  }


  /**
   * Get the main heading (h1) from the page
   * @returns {Promise<string|null>} - The text content of the h1 element, or null if not found
   */
  async getPageHeading() {
    try {
      const h1 = this.page.locator('h1').first();
      const isVisible = await h1.isVisible({ timeout: 5000 }).catch(() => false);
      if (isVisible) {
        return await h1.textContent();
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Assert that the page has a heading (h1) and optionally check its content
   * @param {string|RegExp|null} expectedText - Expected text in the heading (optional)
   * @returns {Promise<string>} - The actual heading text
   * @throws {Error} - If heading is not found or doesn't match expected text
   */
  async assertPageHeading(expectedText = null) {
    const heading = await this.getPageHeading();
    if (!heading) {
      throw new Error('Page heading (h1) not found on the page');
    }
    
    if (expectedText) {
      if (typeof expectedText === 'string') {
        if (!heading.toLowerCase().includes(expectedText.toLowerCase())) {
          throw new Error(`Expected heading to contain "${expectedText}" but got "${heading}"`);
        }
      } else if (expectedText instanceof RegExp) {
        if (!expectedText.test(heading)) {
          throw new Error(`Expected heading to match ${expectedText} but got "${heading}"`);
        }
      }
    }
    
    return heading;
  }

}
