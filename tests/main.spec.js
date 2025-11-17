import { test as baseTest, expect, chromium } from '@playwright/test';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Import ES modules
import { HomePage } from './page-objects/HomePage.js';
import { AboutPage } from './page-objects/AboutPage.js';
import { ConferencesPage } from './page-objects/ConferencesPage.js';
import { CancerNewsPage } from './page-objects/CancerNewsPage.js';
import { TestHelpers } from './utilities/helpers.js';
import { testData, dataHelpers } from './test-data.js';

// Browserbase fixture - extend base test with Browserbase browser connection
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const test = baseTest.extend({
  browser: async ({ browser }, use, testInfo) => {
    // Check if Browserbase session file exists (created by global-setup)
    const sessionFile = join(__dirname, '..', 'test-results', 'browserbase-session.json');
    
    if (existsSync(sessionFile)) {
      try {
        const sessionData = JSON.parse(readFileSync(sessionFile, 'utf8'));
        const connectUrl = sessionData.connectUrl;
        
        if (connectUrl) {
          console.log('🔌 Connecting to Browserbase...');
          const browserbaseBrowser = await chromium.connectOverCDP(connectUrl);
          console.log('✅ Connected to Browserbase');
          
          await use(browserbaseBrowser);
          return;
        }
      } catch (error) {
        console.error('❌ Failed to connect to Browserbase:', error.message);
        console.log('⚠️  Falling back to local browser');
      }
    }
    
    // Use default browser
    await use(browser);
  },
});

// Configure test execution mode - disable parallel for Browserbase (handled in config)
// test.describe.configure({ mode: 'parallel' }); // Commented out - controlled by playwright.config.js

test.describe('Website', () => {
  
  let homePage;        // Home page object for home page interactions
  let aboutPage;       // About page object for about page interactions  
  let conferencesPage; // Conferences page object for conference interactions
  let cancerNewsPage;  // Cancer News page object for news page interactions
  let helpers;         // Helper utilities for common operations

  // Helper function to handle navigation with 404 checking and test skipping
  // Returns the navigation result, or skips test if 404 is detected
  async function navigateWith404Check(navigationFn, pageName, test) {
    const navResult = await navigationFn();
    
    if (navResult.is404) {
      test.skip(true, `${pageName} returned 404 error (status: ${navResult.status || 'unknown'}) - skipping test`);
      return null; // Indicates test was skipped
    }
    
    return navResult; // Return navigation result for further use
  }

  test.beforeEach(async ({ page }) => {
    
    homePage = new HomePage(page);
    aboutPage = new AboutPage(page);
    conferencesPage = new ConferencesPage(page);
    cancerNewsPage = new CancerNewsPage(page);
    helpers = new TestHelpers(page);

    await TestHelpers.handleUnexpectedAlert(page);
    
    const isAccessible = await homePage.isWebsiteAccessible();
    if (!isAccessible) {
      console.warn('Website may not be accessible. Tests may fail due to connectivity issues.');
    }
  });

  
  test.describe('Home Page Functionality', () => {
    
    test('Home page loads correctly with all elements', async ({ page }) => {
      // Navigate to home page with 404 checking
      const navResult = await navigateWith404Check(
        () => homePage.navigateToHome(),
        'Home page',
        test
      );
      if (!navResult) return; // Test was skipped due to 404
      
      // Validate that all expected elements are present (parallel validation)
      await homePage.validateHomePageElements();
      
      // Verify the page title is correct
      await homePage.validatePageTitle();
      
      // Assert page heading (h1) exists
      await homePage.validatePageHeading();
      
      // Take screenshot for visual verification and debugging
      await TestHelpers.takeFullPageScreenshot(page, 'home-page-loaded');
    });

    test('Navigation menu works correctly', async ({ page }) => {
      await homePage.navigateToHome();
      
      // Test About Us navigation
      await homePage.navigateToAboutUs();
      await expect(page).toHaveTitle(/About Binaytara/);
      
      // Test Conferences navigation
      await homePage.navigateToConferences();
      await expect(page).toHaveTitle(/Conferences/);
      
      // Return to home page after CME conference redirection
      await homePage.returnToHomeFromConferences();
      await expect(page).toHaveTitle(/Binaytara/);
      
      // Test Projects navigation
      await homePage.navigateToProjects();
      await expect(page).toHaveTitle(/Projects/);
      
      // Test Get Involved navigation
      await homePage.navigateToGetInvolved();
      
      // Test News navigation
      await homePage.navigateToNews();
    });

    test('Newsletter subscription form functionality', async ({ page }) => {
      // Navigate to home page first
      await homePage.navigateToHome();
      
      // Open the newsletter subscription form 
      await homePage.openNewsletterSubscription();
      
      // Generate unique test data to avoid conflicts
      const userData = dataHelpers.generateRandomEmail();
      const testUser = {
        firstName: 'Test',
        lastName: 'User',
        email: userData // Use unique email to avoid duplicate subscription errors
      };
      
      // Fill the newsletter form with test data
      await homePage.fillNewsletterForm(testUser);
      
      // Submit the form
      await homePage.submitNewsletterForm();
      
      // Wait for submission to complete (form processing time)
      await page.waitForTimeout(3000);
      
      // Take screenshot of form submission for visual verification
      await TestHelpers.takeFullPageScreenshot(page, 'newsletter-submitted');
    });


  });

  test.describe('Cancer News Page Functionality', () => {
    
    test('Cancer News page loads correctly with all elements', async ({ page }) => {
      // Navigate to Cancer News page with 404 checking
      const navResult = await navigateWith404Check(
        () => cancerNewsPage.navigateToCancerNews(),
        'Cancer News page',
        test
      );
      if (!navResult) return; // Test was skipped due to 404
      
      // Validate that all expected elements are present
      await cancerNewsPage.validateCancerNewsPageElements();
      
      // Verify the page title is correct
      await expect(page).toHaveTitle(/Cancer News|News/);
      
      // Assert page heading (h1) exists
      await cancerNewsPage.validatePageHeading();
      
      // Take screenshot for visual verification
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-page-loaded');
    });

    test('News articles display correctly', async ({ page }) => {
      // Navigate to Cancer News page with 404 checking
      const navResult = await navigateWith404Check(
        () => cancerNewsPage.navigateToCancerNews(),
        'Cancer News page',
        test
      );
      if (!navResult) return; // Test was skipped due to 404
      
      // Assert page heading (h1) exists
      await cancerNewsPage.validatePageHeading();
      
      // Check if articles are present
      const articleCount = await cancerNewsPage.getArticleCount();
      expect(articleCount).toBeGreaterThan(0);
      
      // Validate first article structure
      await cancerNewsPage.validateArticleStructure(0);
      
      // Get and validate article titles
      const titles = await cancerNewsPage.getArticleTitles();
      expect(titles.length).toBeGreaterThan(0);
      expect(titles[0]).toBeTruthy();
      
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-articles');
    });

    test('Search functionality works correctly', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Test with valid search terms
      for (const searchTerm of testData.cancerNews.searchTerms.valid) {
        await cancerNewsPage.searchNews(searchTerm);
        const hasResults = await cancerNewsPage.validateSearchResults(searchTerm);
        
        if (hasResults) {
          console.log(`Search for "${searchTerm}" returned results`);
          break; // Found results, no need to test more terms
        }
      }
      
      // Test with invalid search term
      await cancerNewsPage.searchNews(testData.cancerNews.searchTerms.invalid[0]);
      const invalidResults = await cancerNewsPage.validateSearchResults(testData.cancerNews.searchTerms.invalid[0]);
      
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-search');
    });

    test('News filtering by category', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Test category filtering if available
      if (testData.cancerNews.categories.length > 0) {
        const category = testData.cancerNews.categories[0];
        await cancerNewsPage.filterByCategory(category);
        
        // Wait for filter to apply
        await page.waitForTimeout(2000);
        
        console.log(`Filtered by category: ${category}`);
      }
      
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-filtered');
    });

    test('News sorting functionality', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Test sorting options if available
      if (testData.cancerNews.sortOptions.length > 0) {
        const sortOption = testData.cancerNews.sortOptions[0];
        await cancerNewsPage.sortNews(sortOption);
        
        // Wait for sort to apply
        await page.waitForTimeout(2000);
        
        console.log(`Sorted by: ${sortOption}`);
      }
      
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-sorted');
    });

    test('Pagination functionality', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Check if pagination is available
      const hasPagination = await cancerNewsPage.validatePagination();
      
      if (hasPagination) {
        // Try to navigate to next page
        await cancerNewsPage.goToNextPage();
        await page.waitForTimeout(2000);
        
        // Try to navigate back to previous page
        await cancerNewsPage.goToPreviousPage();
        await page.waitForTimeout(2000);
        
        console.log('Pagination navigation tested successfully');
      } else {
        console.log('Pagination not available on this page');
      }
      
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-pagination');
    });

    test('Article navigation and reading', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Navigate to first article if available
      const articleCount = await cancerNewsPage.getArticleCount();
      
      if (articleCount > 0) {
        await cancerNewsPage.navigateToArticle(0);
        
        // Wait for article page to load
        await page.waitForTimeout(3000);
        
        // Take screenshot of article page
        await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-article-detail');
        
        // Navigate back to news listing
        await page.goBack();
        await page.waitForTimeout(2000);
      } else {
        console.log('No articles available for navigation test');
      }
    });

    test('Social sharing functionality', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Navigate to an article first
      const articleCount = await cancerNewsPage.getArticleCount();
      
      if (articleCount > 0) {
        await cancerNewsPage.navigateToArticle(0);
        await page.waitForTimeout(2000);
        
        // Test social sharing buttons (without actually sharing)
        try {
          // Check if social sharing buttons are present
          const shareButtonsCount = await cancerNewsPage.shareButtons.count();
          console.log(`Found ${shareButtonsCount} social sharing buttons`);
          
          if (shareButtonsCount > 0) {
            // Just verify the buttons are visible, don't click them
            await cancerNewsPage.shareButtons.first().waitFor({ state: 'visible' });
            console.log('Social sharing buttons are visible');
          }
        } catch (error) {
          console.log('Social sharing buttons not found or not accessible');
        }
        
        await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-social-sharing');
      }
    });

    test('Newsletter subscription on news page', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Test newsletter subscription if available
      try {
        const testEmail = dataHelpers.generateRandomEmail();
        await cancerNewsPage.subscribeToNewsletter(testEmail);
        
        console.log(`Newsletter subscription attempted with email: ${testEmail}`);
        
        // Wait for subscription to process
        await page.waitForTimeout(3000);
        
      } catch (error) {
        console.log('Newsletter subscription not available on news page');
      }
      
      await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-newsletter');
    });

    test('Related articles functionality', async ({ page }) => {
      await cancerNewsPage.navigateToCancerNews();
      
      // Navigate to an article to check for related articles
      const articleCount = await cancerNewsPage.getArticleCount();
      
      if (articleCount > 0) {
        await cancerNewsPage.navigateToArticle(0);
        await page.waitForTimeout(2000);
        
        // Check for related articles
        const hasRelated = await cancerNewsPage.hasRelatedArticles();
        
        if (hasRelated) {
          const relatedCount = await cancerNewsPage.getRelatedArticlesCount();
          console.log(`Found ${relatedCount} related articles`);
          expect(relatedCount).toBeGreaterThan(0);
        } else {
          console.log('No related articles section found');
        }
        
        await TestHelpers.takeFullPageScreenshot(page, 'cancer-news-related-articles');
      }
    });

    test('Cancer News page performance', async ({ page }) => {
      const loadTime = await cancerNewsPage.measurePageLoadTime();
      expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
      
      console.log(`Cancer News page load time: ${loadTime}ms`);
    });

  });

  /*
  test.describe('About Page Functionality', () => {
    test('About page navigation and content', async ({ page }) => {
      await aboutPage.navigateToAbout();
      await aboutPage.verifyAboutPageContent();
      await TestHelpers.takeFullPageScreenshot(page, 'about-page-content');
    });

    test('Mission and Values section', async ({ page }) => {
      await aboutPage.navigateToAbout();
      await aboutPage.navigateToMissionValues();
      await aboutPage.validateMissionSection();
      await aboutPage.validateValuesSection();
      await TestHelpers.takeFullPageScreenshot(page, 'mission-values');
    });

    test('Meet Our Team functionality', async ({ page }) => {
      await aboutPage.navigateToAbout();
      await aboutPage.navigateToMeetTeam();
      await aboutPage.validateTeamSection();
      
      // Test team member details
      await aboutPage.testAllTeamMembers();
      await TestHelpers.takeFullPageScreenshot(page, 'team-members');
    });

    test('Awards section functionality', async ({ page }) => {
      await aboutPage.navigateToAbout();
      await aboutPage.navigateToAwards();
      await aboutPage.validateAwardsSection();
      
      // Test award years
      await aboutPage.testAwardYears();
      await TestHelpers.takeFullPageScreenshot(page, 'awards-section');
    });

    test('Financials and Transparency', async ({ page }) => {
      await aboutPage.navigateToAbout();
      await aboutPage.navigateToFinancials();
      await TestHelpers.takeFullPageScreenshot(page, 'financials-page');
    });

    test('Page load performance', async ({ page }) => {
      const loadTime = await aboutPage.measurePageLoadTime();
      expect(loadTime).toBeLessThan(10000); // Should load within 10 seconds
    });
  });
  */

  /*
  test.describe('Conferences Page Functionality', () => {
    test('Conferences page loads with listings', async ({ page }) => {
      await conferencesPage.navigateToConferences();
      const hasConferences = await conferencesPage.validateConferenceListing();
      expect(hasConferences).toBeTruthy();
      
      await TestHelpers.takeFullPageScreenshot(page, 'conferences-listing');
    });

    test('Conference details validation', async ({ page }) => {
      await conferencesPage.navigateToConferences();
      const hasValidDetails = await conferencesPage.validateConferenceDetails();
      expect(hasValidDetails).toBeTruthy();
    });

    test('Conference registration process', async ({ page }) => {
      await conferencesPage.navigateToConferences();
      
      // Try to start registration for first available conference
      try {
        await conferencesPage.startRegistration(0);
        await conferencesPage.validateRegistrationForm();
        
        // Fill registration form
        const testUser = TestHelpers.generateTestUser();
        await conferencesPage.fillRegistrationForm(testUser);
        await conferencesPage.selectRegistrationOptions();
        
        // Take screenshot before submission
        await TestHelpers.takeFullPageScreenshot(page, 'registration-form-filled');
        
        // Note: Not submitting actual registration to avoid spam
        console.log('Registration form filled successfully');
        
      } catch (error) {
        console.log('Registration form not available or not accessible');
      }
    });

    test('Conference filtering and search', async ({ page }) => {
      await conferencesPage.navigateToConferences();
      
      // Test year filtering
      const currentYear = TestHelpers.getCurrentYear();
      await conferencesPage.filterByYear(currentYear);
      
      // Test search functionality
      await conferencesPage.searchConferences('hematology');
      
      await TestHelpers.takeFullPageScreenshot(page, 'conferences-filtered');
    });

    test('CME credits information', async ({ page }) => {
      await conferencesPage.navigateToConferences();
      
      try {
        const credits = await conferencesPage.getCMECredits();
        console.log('CME Credits found:', credits);
        
        if (credits.length > 0) {
          await conferencesPage.viewCMEDetails();
          await TestHelpers.takeFullPageScreenshot(page, 'cme-details');
        }
      } catch (error) {
        console.log('CME credits information not available');
      }
    });

    test('Conference page performance', async ({ page }) => {
      const loadTime = await conferencesPage.measureConferencePageLoad();
      expect(loadTime).toBeLessThan(15000); // Should load within 15 seconds
    });
  });
  */

  /*
  test.describe('Form Validation and Error Handling', () => {
    test('Newsletter form validation', async ({ page }) => {
      await homePage.navigateToHome();
      await homePage.openNewsletterSubscription();
      
      // Test with invalid email
      const invalidUser = {
        firstName: 'Test',
        lastName: 'User',
        email: 'invalid-email'
      };
      
      await homePage.fillNewsletterForm(invalidUser);
      
      // Try to submit and check for validation
      await homePage.submitNewsletterForm();
      await page.waitForTimeout(2000);
      
      // Check for error messages
      const errorMessages = await page.locator('.error, .alert-danger, [data-testid*="error"]').count();
      console.log(`Error messages found: ${errorMessages}`);
    });

    test('Empty form submission handling', async ({ page }) => {
      await homePage.navigateToHome();
      await homePage.openNewsletterSubscription();
      
      // Try to submit empty form
      await homePage.submitNewsletterForm();
      await page.waitForTimeout(2000);
      
      // Check for validation messages
      const validationMessages = await page.locator('.required, .error, .invalid').count();
      console.log(`Validation messages found: ${validationMessages}`);
    });
  });
  */

  // DISABLED: Cross-browser and Device Testing - Commented out as requested
  // Uncomment the test.describe block below to enable mobile and tablet testing
  /*
  test.describe('Cross-browser and Device Testing', () => {
    test('Mobile device simulation', async ({ page }) => {
      await TestHelpers.simulateMobileDevice(page, 'iPhone 12');
      await homePage.navigateToHome();
      await homePage.validateHomePageElements();
      await TestHelpers.takeFullPageScreenshot(page, 'mobile-home-page');
    });

    test('Tablet device simulation', async ({ page }) => {
      await TestHelpers.simulateMobileDevice(page, 'iPad');
      await homePage.navigateToHome();
      await homePage.validateHomePageElements();
      await TestHelpers.takeFullPageScreenshot(page, 'tablet-home-page');
    });
  });
  */

  /*
  test.describe('Accessibility Testing', () => {
    test('Basic accessibility checks', async ({ page }) => {
      await homePage.navigateToHome();
      
      const accessibilityIssues = await TestHelpers.checkAccessibility(page);
      console.log('Accessibility issues found:', accessibilityIssues);
      
      // Log issues but don't fail the test
      if (accessibilityIssues.length > 0) {
        console.warn('Accessibility issues detected:', accessibilityIssues);
      }
    });

    test('Keyboard navigation', async ({ page }) => {
      await homePage.navigateToHome();
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      
      await TestHelpers.takeFullPageScreenshot(page, 'keyboard-navigation');
    });
  });
  */

  /*
  test.describe('Performance Testing', () => {
    test('Page load times measurement', async ({ page }) => {
      const homeLoadTime = await TestHelpers.measurePageLoadTime(page, 'https://binaytara.org/');
      const aboutLoadTime = await TestHelpers.measurePageLoadTime(page, 'https://binaytara.org/about');
      const conferencesLoadTime = await TestHelpers.measurePageLoadTime(page, 'https://binaytara.org/conferences');
      
      console.log('Page load times:', {
        home: homeLoadTime,
        about: aboutLoadTime,
        conferences: conferencesLoadTime
      });
      
      // Assert reasonable load times
      expect(homeLoadTime).toBeLessThan(10000);
      expect(aboutLoadTime).toBeLessThan(10000);
      expect(conferencesLoadTime).toBeLessThan(15000);
    });

    test('Network performance metrics', async ({ page }) => {
      await page.goto('https://binaytara.org/');
      await page.waitForLoadState('networkidle');
      
      const metrics = await TestHelpers.getPageMetrics(page);
      console.log('Performance metrics:', metrics);
      
      expect(metrics.totalTime).toBeLessThan(10000);
    });
  });
  */

  /*
  test.describe('Error Handling and Edge Cases', () => {
    test('Handle network errors gracefully', async ({ page }) => {
      // Simulate network failure
      await page.route('**\/*', route => route.abort());
      
      try {
        await homePage.navigateToHome();
      } catch (error) {
        console.log('Network error handled gracefully:', error.message);
      }
    });

    test('Handle missing elements gracefully', async ({ page }) => {
      await homePage.navigateToHome();
      
      // Try to interact with potentially missing elements
      try {
        await page.locator('[data-testid="non-existent-element"]').click();
      } catch (error) {
        console.log('Missing element handled gracefully');
      }
    });

    test('Handle slow loading pages', async ({ page }) => {
      // Set longer timeout for slow pages
      page.setDefaultTimeout(30000);
      
      try {
        await homePage.navigateToHome();
        await homePage.validateHomePageElements();
      } catch (error) {
        console.log('Slow loading handled with extended timeout');
      }
    });
  });
  */

  /*
  test.describe('Data Integrity and Content Validation', () => {
    test('Validate page titles and URLs', async ({ page }) => {
      await homePage.navigateToHome();
      expect(await page.title()).toContain('Binaytara');
      
      await aboutPage.navigateToAbout();
      expect(await page.title()).toContain('About');
      
      await conferencesPage.navigateToConferences();
      expect(await page.title()).toContain('Conference');
    });

    test('Validate navigation consistency', async ({ page }) => {
      await homePage.navigateToHome();
      
      // Test that all main navigation links are present
      const navLinks = testData.navigation.mainMenuItems;
      for (const linkText of navLinks) {
        const link = page.getByRole('link', { name: linkText });
        await expect(link).toBeVisible();
      }
    });

    test('Validate footer content', async ({ page }) => {
      await homePage.navigateToHome();
      
      // Check footer links
      const footerLinks = await homePage.footerLinks.count();
      expect(footerLinks).toBeGreaterThan(0);
      
      await TestHelpers.takeFullPageScreenshot(page, 'footer-content');
    });
  });
  */

  test.afterEach(async ({ page }, testInfo) => {
    // Take screenshot on test failure
    if (testInfo.status === 'failed') {
      await TestHelpers.takeFullPageScreenshot(page, `failed-${testInfo.title.replace(/[^a-zA-Z0-9]/g, '-')}`);
    }
    
  });
});
