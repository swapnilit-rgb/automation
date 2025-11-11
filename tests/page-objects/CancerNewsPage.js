import { BasePage } from './BasePage.js';
import { testData } from '../test-data.js';

export class CancerNewsPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Navigation elements
    this.newsLink = page.getByRole('link', { name: 'News', exact: true });
    this.cancerNewsLink = page.getByRole('link', { name: /cancer news/i });
    
    // Page header and title elements
    this.pageTitle = page.locator('h1, .page-title, .news-title');
    this.pageSubtitle = page.locator('h2, .page-subtitle, .news-subtitle');
    
    // News article elements
    this.newsArticles = page.locator('.news-article, .article-card, [data-testid*="article"]');
    this.articleTitles = page.locator('.article-title, h3, .news-item h3');
    this.articleDates = page.locator('.article-date, .news-date, .published-date');
    this.articleAuthors = page.locator('.article-author, .news-author, .byline');
    this.articleSummaries = page.locator('.article-summary, .news-summary, .excerpt');
    this.readMoreLinks = page.locator('a:has-text("Read More"), .read-more, [data-testid*="read-more"]');
    
    // Search and filter elements
    this.searchInput = page.locator('input[type="search"], input[placeholder*="search"], .search-input');
    this.searchButton = page.locator('button[type="submit"], .search-button, [data-testid*="search"]');
    this.categoryFilter = page.locator('select[name*="category"], .category-filter select');
    this.dateFilter = page.locator('select[name*="date"], .date-filter select');
    this.sortDropdown = page.locator('select[name*="sort"], .sort-dropdown select');
    
    // Pagination elements
    this.paginationContainer = page.locator('.pagination, .page-navigation, [data-testid*="pagination"]');
    this.nextPageButton = page.locator('a:has-text("Next"), .next-page, [data-testid*="next"]');
    this.previousPageButton = page.locator('a:has-text("Previous"), .prev-page, [data-testid*="previous"]');
    this.pageNumbers = page.locator('.page-number, .pagination a');
    
    // Social sharing elements
    this.shareButtons = page.locator('.share-button, [data-testid*="share"], .social-share');
    this.facebookShare = page.locator('a[href*="facebook"], .facebook-share');
    this.twitterShare = page.locator('a[href*="twitter"], .twitter-share');
    this.linkedinShare = page.locator('a[href*="linkedin"], .linkedin-share');
    
    // Newsletter subscription elements
    this.newsletterSignup = page.locator('.newsletter-signup, .newsletter-form');
    this.newsletterEmail = page.locator('input[type="email"], .newsletter-email');
    this.newsletterSubmit = page.locator('button:has-text("Subscribe"), .newsletter-submit');
    
    // Related articles section
    this.relatedArticles = page.locator('.related-articles, .related-news, [data-testid*="related"]');
    this.relatedArticleLinks = page.locator('.related-articles a, .related-news a');
    
    // Tags and categories
    this.articleTags = page.locator('.article-tags, .news-tags, .tag-list');
    this.tagLinks = page.locator('.tag, .news-tag, a[href*="tag"]');
  }

  // ==================== NAVIGATION METHODS ====================
  
  /**
   * Navigate to the Cancer News page
   * @returns {Promise<{response: Response|null, is404: boolean, status: number|null}>}
   */
  async navigateToCancerNews() {
    try {
      const navResult = await this.goto('/news');
      
      // If not 404, verify title
      if (!navResult.is404) {
        await this.expectTitle(testData.navigation.expectedTitles.news);
      }
      
      return navResult;
    } catch (error) {
      console.log('Cancer News page navigation failed, trying alternative approach...');
      
      // Fallback: try clicking the News link from home page
      try {
        await this.newsLink.click();
        await this.waitForPageLoad();
        
        // Check for 404 after fallback navigation
        const is404 = await this.is404Error();
        return { response: null, is404, status: is404 ? 404 : null };
      } catch (fallbackError) {
        console.error('Cancer News page navigation failed with fallback:', fallbackError.message);
        // Return result indicating failure (not necessarily 404)
        return { response: null, is404: false, status: null };
      }
    }
  }

  /**
   * Navigate to a specific news article
   * @param {number} articleIndex - Index of the article to navigate to (0-based)
   */
  async navigateToArticle(articleIndex = 0) {
    const article = this.newsArticles.nth(articleIndex);
    await article.click();
    await this.waitForPageLoad();
  }

  // ==================== SEARCH AND FILTER METHODS ====================
  
  /**
   * Search for news articles
   * @param {string} searchTerm - Term to search for
   */
  async searchNews(searchTerm) {
    await this.searchInput.fill(searchTerm);
    await this.searchButton.click();
    await this.waitForPageLoad();
  }

  /**
   * Filter news by category
   * @param {string} category - Category to filter by
   */
  async filterByCategory(category) {
    if (await this.categoryFilter.isVisible()) {
      await this.categoryFilter.selectOption(category);
      await this.waitForPageLoad();
    }
  }

  /**
   * Filter news by date range
   * @param {string} dateRange - Date range to filter by
   */
  async filterByDate(dateRange) {
    if (await this.dateFilter.isVisible()) {
      await this.dateFilter.selectOption(dateRange);
      await this.waitForPageLoad();
    }
  }

  /**
   * Sort news articles
   * @param {string} sortOption - Sort option (e.g., 'newest', 'oldest', 'most-popular')
   */
  async sortNews(sortOption) {
    if (await this.sortDropdown.isVisible()) {
      await this.sortDropdown.selectOption(sortOption);
      await this.waitForPageLoad();
    }
  }

  // ==================== PAGINATION METHODS ====================
  
  /**
   * Navigate to next page
   */
  async goToNextPage() {
    if (await this.nextPageButton.isVisible()) {
      await this.nextPageButton.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Navigate to previous page
   */
  async goToPreviousPage() {
    if (await this.previousPageButton.isVisible()) {
      await this.previousPageButton.click();
      await this.waitForPageLoad();
    }
  }

  /**
   * Navigate to specific page number
   * @param {number} pageNumber - Page number to navigate to
   */
  async goToPage(pageNumber) {
    const pageLink = this.pageNumbers.filter({ hasText: pageNumber.toString() });
    if (await pageLink.isVisible()) {
      await pageLink.click();
      await this.waitForPageLoad();
    }
  }

  // ==================== SOCIAL SHARING METHODS ====================
  
  /**
   * Share article on Facebook
   */
  async shareOnFacebook() {
    if (await this.facebookShare.isVisible()) {
      await this.facebookShare.click();
    }
  }

  /**
   * Share article on Twitter
   */
  async shareOnTwitter() {
    if (await this.twitterShare.isVisible()) {
      await this.twitterShare.click();
    }
  }

  /**
   * Share article on LinkedIn
   */
  async shareOnLinkedIn() {
    if (await this.linkedinShare.isVisible()) {
      await this.linkedinShare.click();
    }
  }

  // ==================== NEWSLETTER METHODS ====================
  
  /**
   * Subscribe to newsletter
   * @param {string} email - Email address for subscription
   */
  async subscribeToNewsletter(email) {
    if (await this.newsletterSignup.isVisible()) {
      await this.newsletterEmail.fill(email);
      await this.newsletterSubmit.click();
      await this.waitForTimeout(2000); // Wait for subscription to process
    }
  }

  // ==================== VALIDATION METHODS ====================
  
  /**
   * Validate that the Cancer News page loaded correctly
   */
  async validateCancerNewsPageElements() {
    const elements = [
      this.pageTitle,
      this.newsArticles.first()
    ];

    for (const element of elements) {
      await this.expectElementVisible(element);
    }
  }

  /**
   * Validate page heading (h1)
   */
  async validatePageHeading() {
    // Assert that the page has a heading (h1)
    await this.assertPageHeading();
  }

  /**
   * Validate news article structure
   * @param {number} articleIndex - Index of article to validate
   */
  async validateArticleStructure(articleIndex = 0) {
    const article = this.newsArticles.nth(articleIndex);
    const title = this.articleTitles.nth(articleIndex);
    const date = this.articleDates.nth(articleIndex);
    
    await this.expectElementVisible(article);
    await this.expectElementVisible(title);
    
    // Date might not always be present, so check conditionally
    if (await date.isVisible()) {
      await this.expectElementVisible(date);
    }
  }

  /**
   * Validate search functionality
   * @param {string} searchTerm - Search term to validate
   */
  async validateSearchResults(searchTerm) {
    const results = await this.newsArticles.count();
    console.log(`Found ${results} articles for search term: ${searchTerm}`);
    
    // Check if search results contain the search term
    if (results > 0) {
      const firstResult = this.articleTitles.first();
      const titleText = await firstResult.textContent();
      return titleText.toLowerCase().includes(searchTerm.toLowerCase());
    }
    return false;
  }

  /**
   * Validate pagination functionality
   */
  async validatePagination() {
    if (await this.paginationContainer.isVisible()) {
      const pageCount = await this.pageNumbers.count();
      console.log(`Found ${pageCount} pagination pages`);
      return pageCount > 0;
    }
    return false;
  }

  /**
   * Get article count on current page
   */
  async getArticleCount() {
    return await this.newsArticles.count();
  }

  /**
   * Get article titles on current page
   */
  async getArticleTitles() {
    const titles = [];
    const count = await this.articleTitles.count();
    
    for (let i = 0; i < count; i++) {
      const title = await this.articleTitles.nth(i).textContent();
      titles.push(title);
    }
    
    return titles;
  }

  /**
   * Get article dates on current page
   */
  async getArticleDates() {
    const dates = [];
    const count = await this.articleDates.count();
    
    for (let i = 0; i < count; i++) {
      const date = await this.articleDates.nth(i).textContent();
      dates.push(date);
    }
    
    return dates;
  }

  /**
   * Check if related articles section is present
   */
  async hasRelatedArticles() {
    return await this.relatedArticles.isVisible();
  }

  /**
   * Get related articles count
   */
  async getRelatedArticlesCount() {
    if (await this.hasRelatedArticles()) {
      return await this.relatedArticleLinks.count();
    }
    return 0;
  }

  /**
   * Measure page load time for performance testing
   */
  async measurePageLoadTime() {
    const startTime = Date.now();
    await this.navigateToCancerNews();
    await this.waitForPageLoad();
    const endTime = Date.now();
    return endTime - startTime;
  }
}
