import { BasePage } from './BasePage.js';
import { testData } from '../test-data.js';

export class HomePage extends BasePage {
  constructor(page) {
    super(page); 
  
    this.aboutUsLink = page.getByRole('link', { name: 'About Us' });
    this.cmeConferencesLink = page.getByRole('link', { name: 'CME Conferences' });
    this.projectsLink = page.getByRole('link', { name: 'Projects', exact: true }); 
    this.getInvolvedLink = page.getByRole('link', { name: 'Get Involved' });
    this.newsLink = page.getByRole('link', { name: 'News', exact: true });
    
    this.subscribeButton = page.getByRole('button', { name: 'Subscribe Now' });
    this.newsletterIframe = page.locator('iframe[title="Newsletter Signup"]');
  }

  // Navigation methods
  /**
   * Navigate to home page
   * @returns {Promise<{response: Response|null, is404: boolean, status: number|null}>}
   */
  async navigateToHome() {
    const navResult = await this.goto('/', { waitUntil: 'domcontentloaded', timeout: 30000 });
    
    // If not 404, wait for key element to ensure page is interactive
    if (!navResult.is404) {
      await this.subscribeButton.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {});
    }
    
    return navResult;
  }

  async navigateToAboutUs() {
    await this.aboutUsLink.click();
    await this.expectTitle(testData.navigation.expectedTitles.about);
  }

  async navigateToConferences() {
    await this.cmeConferencesLink.click();
    await this.expectTitle(testData.navigation.expectedTitles.conferences);
  }

  async returnToHomeFromConferences() {
    // Navigate back to home page after visiting conferences
    await this.navigateToHome();
    await this.validateHomePageElements();
  }

  async navigateToProjects() {
    await this.projectsLink.click();
    await this.expectTitle(testData.navigation.expectedTitles.projects);
  }

  async navigateToGetInvolved() {
    await this.getInvolvedLink.click();
  }

  async navigateToNews() {
    await this.newsLink.click();
  }

  // Newsletter subscription methods
  async openNewsletterSubscription() {
    await this.subscribeButton.click();
    await this.waitForElement('iframe[title="Newsletter Signup"]');
  }

  async fillNewsletterForm(userData = testData.users.newsletter) {
    const iframe = this.newsletterIframe.contentFrame();
    
    if (!iframe) {
      throw new Error('Newsletter iframe not found or not loaded');
    }
    
    await iframe.locator('input[type="email"]').fill(userData.email);
    await iframe.locator('div').filter({ hasText: /^First Name$/ }).getByRole('textbox').fill(userData.firstName);
    await iframe.locator('div').filter({ hasText: /^Last Name$/ }).getByRole('textbox').fill(userData.lastName);
    
    // Handle dropdown selections
    await iframe.locator('div').filter({ hasText: /^How did you hear about us\?-$/ }).getByRole('combobox').click();
    await iframe.getByRole('option', { name: 'Facebook' }).locator('div').nth(2).click();
    
    await iframe.getByText('-').click();
    await iframe.getByRole('option', { name: 'Advocacy / Cancer Health Disparities' }).locator('div').nth(2).click();
  }

  async submitNewsletterForm() {
    const iframe = this.newsletterIframe.contentFrame();
    
    if (!iframe) {
      throw new Error('Newsletter iframe not found or not loaded');
    }
    
    await iframe.getByRole('button', { name: 'Submit' }).click();
  }


  // Page validation methods
  async validateHomePageElements() {
    const elements = [
      this.aboutUsLink,
      this.cmeConferencesLink,
      this.projectsLink,
      this.getInvolvedLink,
      this.newsLink,
      this.subscribeButton
    ];

    // Wait for all elements in parallel instead of sequentially
    await Promise.all(
      elements.map(element => 
        element.waitFor({ state: 'visible', timeout: 10000 })
      )
    );
  }

  async validatePageTitle() {
    await this.expectTitle(testData.navigation.expectedTitles.home);
  }

  async validatePageHeading() {
    // Assert that the page has a heading (h1)
    await this.assertPageHeading();
  }

}
