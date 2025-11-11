import { BasePage } from './BasePage.js';
import { testData } from '../test-data.js';

export class ConferencesPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Conference listing elements
    this.conferenceCards = page.locator('.conference-card, [data-testid*="conference"], .event-card');
    this.conferenceTitles = page.locator('h2, h3, .conference-title, .event-title');
    this.conferenceDates = page.locator('.conference-date, .event-date, [data-testid*="date"]');
    this.conferenceLocations = page.locator('.conference-location, .event-location, [data-testid*="location"]');
    
    // Registration elements
    this.registerButtons = page.locator('button:has-text("Register"), a:has-text("Register"), .register-btn');
    this.registrationForm = page.locator('.registration-form, [data-testid="registration-form"]');
    
    // Filter and search elements
    this.yearFilter = page.locator('select[name*="year"], .year-filter select');
    this.locationFilter = page.locator('select[name*="location"], .location-filter select');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="conference"]');
    
    // CME information elements
    this.cmeCredits = page.locator('.cme-credits, [data-testid*="cme"]');
    this.cmeDetails = page.locator('.cme-details, .credit-info');
  }

  // Navigation methods
  async navigateToConferences() {
    await this.goto('/conferences');
    await this.expectTitle(testData.navigation.expectedTitles.conferences);
  }

  // Conference listing methods
  async getConferenceCount() {
    return await this.conferenceCards.count();
  }

  async getConferenceTitles() {
    const titles = [];
    const count = await this.conferenceTitles.count();
    for (let i = 0; i < count; i++) {
      const title = await this.conferenceTitles.nth(i).textContent();
      titles.push(title);
    }
    return titles;
  }

  async clickConferenceByTitle(title) {
    await this.conferenceTitles.filter({ hasText: title }).first().click();
  }

  async clickFirstConference() {
    await this.conferenceCards.first().click();
  }

  // Registration methods
  async startRegistration(conferenceIndex = 0) {
    await this.registerButtons.nth(conferenceIndex).click();
    await this.expectElementVisible(this.registrationForm);
  }

  async fillRegistrationForm(userData = testData.users.valid) {
    // Fill basic information
    await this.fillInput('input[name="firstName"], input[name="first_name"]', userData.firstName);
    await this.fillInput('input[name="lastName"], input[name="last_name"]', userData.lastName);
    await this.fillInput('input[name="email"]', userData.email);
    await this.fillInput('input[name="phone"], input[name="phone_number"]', userData.phone);
    await this.fillInput('input[name="organization"], input[name="institution"]', userData.organization);
    await this.fillInput('input[name="title"], input[name="job_title"]', userData.title);
  }

  async selectRegistrationOptions() {
    // Select dietary preferences if available
    const dietarySelect = this.page.locator('select[name*="dietary"], select[name*="meal"]');
    if (await dietarySelect.isVisible()) {
      await this.selectOption(dietarySelect, 'Vegetarian');
    }

    // Select accommodation if available
    const accommodationSelect = this.page.locator('select[name*="accommodation"], select[name*="hotel"]');
    if (await accommodationSelect.isVisible()) {
      await this.selectOption(accommodationSelect, 'Standard');
    }
  }

  async submitRegistration() {
    const submitButton = this.page.locator('button[type="submit"], button:has-text("Submit"), button:has-text("Register")');
    await submitButton.click();
  }

  // Filter and search methods
  async filterByYear(year) {
    if (await this.yearFilter.isVisible()) {
      await this.selectOption(this.yearFilter, year.toString());
      await this.waitForTimeout(2000); // Wait for results to load
    }
  }

  async filterByLocation(location) {
    if (await this.locationFilter.isVisible()) {
      await this.selectOption(this.locationFilter, location);
      await this.waitForTimeout(2000);
    }
  }

  async searchConferences(searchTerm) {
    if (await this.searchInput.isVisible()) {
      await this.fillInput(this.searchInput, searchTerm);
      await this.page.keyboard.press('Enter');
      await this.waitForTimeout(2000);
    }
  }

  // CME information methods
  async getCMECredits() {
    const credits = [];
    const count = await this.cmeCredits.count();
    for (let i = 0; i < count; i++) {
      const credit = await this.cmeCredits.nth(i).textContent();
      credits.push(credit);
    }
    return credits;
  }

  async viewCMEDetails() {
    await this.cmeDetails.first().click();
  }

  // Validation methods
  async validateConferenceListing() {
    const count = await this.getConferenceCount();
    return count > 0;
  }

  async validateConferenceDetails() {
    const hasTitle = await this.conferenceTitles.first().isVisible();
    const hasDate = await this.conferenceDates.first().isVisible();
    const hasLocation = await this.conferenceLocations.first().isVisible();
    
    return hasTitle && hasDate && hasLocation;
  }

  async validateRegistrationForm() {
    return await this.registrationForm.isVisible();
  }

  // Performance testing
  async measureConferencePageLoad() {
    const startTime = Date.now();
    await this.navigateToConferences();
    const loadTime = Date.now() - startTime;
    console.log(`Conferences page load time: ${loadTime}ms`);
    return loadTime;
  }

  // Accessibility testing
  async testKeyboardNavigation() {
    // Test tab navigation through conference cards
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  // Error handling
  async handleRegistrationError() {
    const errorMessage = this.page.locator('.error-message, .alert-danger, [data-testid*="error"]');
    if (await errorMessage.isVisible()) {
      const errorText = await errorMessage.textContent();
      console.log(`Registration error: ${errorText}`);
      return errorText;
    }
    return null;
  }
}
