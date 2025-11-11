export const testData = {
  users: {
   
    valid: {
      firstName: 'Swapnil',
      lastName: 'Lamsal',
      email: 'swapnil.it@binaytara.org',
      phone: '+1-555-123-4567',
      organization: 'Binaytara Foundation',
      title: 'QA Engineer'
    },

    newsletter: {
      firstName: 'Swapnil',
      lastName: 'Lamsal',
      email: 'swapnil.it@binaytara.org'
    },
  
    contact: {
      name: 'Swapnil Lamsal',
      email: 'swapnil.it@binaytara.org',
      phone: '+1-555-987-6543',
      subject: 'QA Engineer Inquiry',
      message: 'Test Script'
    }
  },

  validation: {
    
    invalidEmail: 'invalid-email',

    emptyFields: {
      firstName: '',
      lastName: '',
      email: ''
    },
    
    /**
     * Very long text for testing character limits
     * 1000 characters of 'A' to test max length validation
     */
    longText: 'A'.repeat(1000)
  },

  // ==================== NAVIGATION TEST DATA ====================
  
  /**
   * Expected navigation elements and page titles
   * Used to verify that navigation works correctly
   */
  navigation: {
    
    mainMenuItems: [
      'About Us',
      'CME Conferences', 
      'Projects',
      'Get Involved',
      'News'
    ],
    
    aboutSubMenu: [
      'Mission and Values',
      'Financials and Transparency',
      'Meet Our Team',
      'Awards'
    ],
    
    expectedTitles: {
      home: 'Binaytara | Global Cancer Care & Women\'s Health Leader',
      about: 'About Binaytara | Mission & Values',
      conferences: 'Premier Hematology Oncology Conferences',
      projects: 'Binaytara Projects',
      news: 'Cancer News | Binaytara'
    }
  },
    
  conferences: {
    /**
     * Current year - used for filtering current conferences
     */
    currentYear: new Date().getFullYear(),
    
    /**
     * Past year - used for testing historical conference data
     */
    pastYear: new Date().getFullYear() - 1,
    
    /**
     * Future year - used for testing upcoming conference data
     */
    futureYear: new Date().getFullYear() + 1
  },

  // ==================== CANCER NEWS TEST DATA ====================
  
  /**
   * Test data specific to Cancer News page functionality
   */
  cancerNews: {
    /**
     * Search terms for testing search functionality
     */
    searchTerms: {
      valid: ['cancer', 'oncology', 'hematology', 'treatment', 'research'],
      invalid: ['xyz123', 'nonexistent', 'invalidsearch'],
      special: ['cancer & treatment', 'oncology-research', 'hematology/leukemia']
    },
    
    /**
     * Categories for filtering news articles
     */
    categories: [
      'Research',
      'Treatment',
      'Prevention',
      'Clinical Trials',
      'Patient Stories',
      'Foundation News'
    ],
    
    /**
     * Date ranges for filtering
     */
    dateRanges: [
      'Last 7 days',
      'Last 30 days',
      'Last 3 months',
      'Last year',
      'All time'
    ],
    
    /**
     * Sort options for news articles
     */
    sortOptions: [
      'Newest first',
      'Oldest first',
      'Most popular',
      'Alphabetical'
    ],
    
    /**
     * Expected article elements
     */
    expectedElements: {
      title: 'h1, h2, h3',
      date: '.date, .published-date, .article-date',
      author: '.author, .byline, .article-author',
      summary: '.summary, .excerpt, .article-summary',
      readMore: 'a:has-text("Read More"), .read-more'
    },
    
    /**
     * Social sharing platforms
     */
    socialPlatforms: [
      'Facebook',
      'Twitter',
      'LinkedIn',
      'Email'
    ],
    
    /**
     * Newsletter subscription test data
     */
    newsletter: {
      validEmail: 'test@example.com',
      invalidEmail: 'invalid-email',
      duplicateEmail: 'existing@example.com'
    }
  },

  // ==================== TIMEOUT CONFIGURATION ====================
  
  /**
   * Various timeout values for different operations
   * These help ensure tests don't hang indefinitely
   */
  timeouts: {
    short: 3000,      // 3 seconds - for quick operations
    medium: 5000,     // 5 seconds - for moderate operations
    long: 10000,      // 10 seconds - for slow operations
    navigation: 15000 // 15 seconds - for page navigation
  }
};

// ==================== HELPER FUNCTIONS FOR TEST DATA ====================

/**
 * Helper functions for generating dynamic test data
 * These functions create unique data for each test run to avoid conflicts
 */
export const dataHelpers = {
  /**
   * Generate a unique email address using timestamp
   * @returns {string} - Unique email address
   * 
   * Uses current timestamp to ensure uniqueness across test runs
   */
  generateRandomEmail: () => `test${Date.now()}@example.com`,
  
  /**
   * Generate a random user name
   * @returns {string} - Random user name
   * 
   * Creates unique names to avoid conflicts in user registration tests
   */
  generateRandomName: () => `TestUser${Math.floor(Math.random() * 1000)}`,
  
  /**
   * Get the current year
   * @returns {number} - Current year
   * 
   * Useful for conference filtering and date-based tests
   */
  getCurrentYear: () => new Date().getFullYear(),
  
  /**
   * Generate a random phone number
   * @returns {string} - Random phone number in US format
   * 
   * Creates realistic phone numbers for form testing
   */
  getRandomPhone: () => `+1-555-${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`
};
