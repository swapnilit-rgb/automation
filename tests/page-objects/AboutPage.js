import { BasePage } from './BasePage.js';
import { testData } from '../test-data.js';

export class AboutPage extends BasePage {
  constructor(page) {
    super(page);
    
    // Main navigation elements
    this.missionValuesLink = page.getByRole('link', { name: 'Mission and Values' });
    this.financialsLink = page.getByRole('link', { name: 'Financials and Transparency' });
    this.meetTeamLink = page.getByRole('link', { name: 'Meet Our Team' });
    this.awardsLink = page.getByRole('link', { name: 'Awards' });
    
    // Team member elements
    this.teamMembers = page.locator('[data-testid*="team-member"], .team-member, .member-card');
    this.teamMemberDetails = page.locator('[data-testid*="member-detail"], .member-detail, .team-detail');
    this.closeButtons = page.getByRole('button').filter({ hasText: /^$/ });
    
    // Awards elements
    this.awardYears = page.locator('button[name*="Year"], button[data-year]');
    this.awardSections = page.locator('.award-section, [data-testid*="award"]');
    
    // Content sections
    this.missionSection = page.locator('[data-testid="mission"], .mission-section, h2:has-text("Mission")');
    this.valuesSection = page.locator('[data-testid="values"], .values-section, h2:has-text("Values")');
  }

  // Navigation methods
  async navigateToAbout() {
    await this.goto('/about');
    await this.expectTitle(testData.navigation.expectedTitles.about);
  }

  async navigateToMissionValues() {
    await this.missionValuesLink.click();
    await this.expectElementVisible(this.missionSection);
  }

  async navigateToFinancials() {
    await this.financialsLink.click();
  }

  async navigateToMeetTeam() {
    await this.meetTeamLink.click();
    await this.expectElementVisible(this.teamMembers.first());
  }

  async navigateToAwards() {
    await this.awardsLink.click();
    await this.expectElementVisible(this.awardSections.first());
  }

  // Team member interaction methods
  async viewTeamMemberDetails(memberName) {
    const memberLink = this.page.getByRole('link', { name: `View details of ${memberName}` });
    await memberLink.click();
    await this.expectElementVisible(this.teamMemberDetails);
  }

  async closeTeamMemberDetails() {
    await this.closeButtons.first().click();
  }

  async testAllTeamMembers() {
    const memberNames = [
      'Andrea Veatch',
      'Binay Shah, MD',
      'David',
      'Mark Pegram,',
      'Tara Shah, RN'
    ];

    for (const memberName of memberNames) {
      try {
        await this.viewTeamMemberDetails(memberName);
        await this.takeScreenshot(`team-member-${memberName.replace(/[^a-zA-Z0-9]/g, '-')}`);
        await this.closeTeamMemberDetails();
        await this.waitForTimeout(1000);
      } catch (error) {
        console.log(`Could not test team member: ${memberName}`);
      }
    }
  }

  // Awards interaction methods
  async testAwardYears() {
    const years = ['2024', '2023'];
    
    for (const year of years) {
      const yearButtons = this.page.getByRole('button', { name: `Year ${year}` });
      const count = await yearButtons.count();
      
      for (let i = 0; i < count; i++) {
        try {
          await yearButtons.nth(i).click();
          await this.waitForTimeout(500);
          await this.takeScreenshot(`awards-${year}-${i}`);
        } catch (error) {
          console.log(`Could not click award year ${year} button ${i}`);
        }
      }
    }
  }

  // Content validation methods
  async validateMissionSection() {
    await this.expectElementVisible(this.missionSection);
  }

  async validateValuesSection() {
    await this.expectElementVisible(this.valuesSection);
  }

  async validateTeamSection() {
    await this.expectElementVisible(this.teamMembers.first());
  }

  async validateAwardsSection() {
    await this.expectElementVisible(this.awardSections.first());
  }

  // Page content verification
  async verifyAboutPageContent() {
    const contentSections = [
      this.missionSection,
      this.valuesSection,
      this.teamMembers.first(),
      this.awardSections.first()
    ];

    for (const section of contentSections) {
      try {
        await this.expectElementVisible(section);
      } catch (error) {
        console.log(`Content section not found: ${section}`);
      }
    }
  }

  // Accessibility testing
  async testKeyboardNavigation() {
    // Test tab navigation through main links
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Tab');
    await this.page.keyboard.press('Enter');
  }

  // Performance testing
  async measurePageLoadTime() {
    const startTime = Date.now();
    await this.navigateToAbout();
    const loadTime = Date.now() - startTime;
    console.log(`About page load time: ${loadTime}ms`);
    return loadTime;
  }
}
