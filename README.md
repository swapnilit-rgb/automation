# Binaytara.org Website Automation Suite

## 🎯 **Complete Website Automation System**

This project provides a comprehensive automation test suite for the Binaytara Foundation website (binaytara.org). It includes modern testing practices, comprehensive test coverage, and automated reporting.

## 📁 **Project Structure**

```
web-testing/
├── 📄 package.json                         # Project dependencies and scripts
├── 📄 playwright.config.js                 # Playwright configuration
├── 📄 README.md                            # This file
├── 📁 tests/                               # Test files
│   ├── 📄 main.spec.js                     # Main test suite (35 tests)
│   ├── 📄 global-setup.js                  # Global test setup
│   ├── 📄 global-teardown.js               # Global test teardown
│   ├── 📄 test-data.js                     # Centralized test data
│   ├── 📁 page-objects/                    # Page Object Model classes
│   │   ├── 📄 BasePage.js                  # Base page class
│   │   ├── 📄 HomePage.js                  # Home page object
│   │   ├── 📄 AboutPage.js                 # About page object
│   │   ├── 📄 ConferencesPage.js           # Conferences page object
│   │   └── 📄 index.js                     # Page objects export
│   └── 📁 utilities/                       # Helper functions
│       └── 📄 helpers.js                   # Test utilities and helpers
├── 📁 test-results/                        # Test execution results
└── 📁 playwright-report/                   # HTML test reports
```

## 🚀 **Quick Start**

### **1. Install Dependencies**
```bash
npm install
```

### **2. Run Tests**

#### **Local Testing**
```bash
# Run all tests locally
npm test

# Run tests with browser visible
npm run test:headed

# Run tests in debug mode
npm run test:debug

# View test reports
npm run test:report

# Run tests with Playwright UI
npm run test:ui
```

#### **Browserbase Cloud Testing** 🌐

This project supports running tests on Browserbase cloud infrastructure. This is useful for:
- Running tests in a consistent cloud environment
- Viewing test replays and recordings
- Running tests without local browser installation
- CI/CD integration with cloud browsers

**Setup:**

1. **Get Browserbase Credentials:**
   - Sign up at [Browserbase](https://www.browserbase.com/)
   - Get your API Key from the dashboard
   - Get your Project ID from the dashboard

2. **Set Environment Variables:**
   ```bash
   export BROWSERBASE_API_KEY="your-api-key-here"
   export BROWSERBASE_PROJECT_ID="your-project-id-here"
   ```

   Or create a `.env` file (make sure to add it to `.gitignore`):
   ```
   BROWSERBASE_API_KEY=your-api-key-here
   BROWSERBASE_PROJECT_ID=your-project-id-here
   ```

3. **Run Tests on Browserbase:**
   ```bash
   # Run tests on Browserbase
   npm run test:browserbase

   # Run tests on Browserbase with browser visible
   npm run test:browserbase:headed
   ```

   Or manually set environment variables:
   ```bash
   BROWSERBASE_API_KEY=your-key BROWSERBASE_PROJECT_ID=your-id npm test
   ```

**How It Works:**
- When `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID` are set, the global setup automatically creates a Browserbase session
- Playwright connects to the Browserbase browser via CDP (Chrome DevTools Protocol)
- Tests run in the cloud browser instead of locally
- After tests complete, you can view the replay at: `https://browserbase.com/sessions/{session-id}`
- The session ID is displayed in the console output

**Note:** When using Browserbase, tests run sequentially (single worker) to use a single browser session efficiently.

## 📊 **Test Suite Overview**

### **Test Categories (33 Total Tests)**

1. **Home Page Functionality** (5 tests)
   - Page loading and element validation
   - Navigation menu functionality
   - Newsletter subscription form
   - Responsive design testing
   - Search functionality

2. **About Page Functionality** (6 tests)
   - Page navigation and content
   - Mission and Values section
   - Meet Our Team functionality
   - Awards section
   - Financials and Transparency
   - Page load performance

3. **Conferences Page Functionality** (6 tests)
   - Conference listings
   - Conference details validation
   - Registration process
   - Filtering and search
   - CME credits information
   - Performance testing

4. **Form Validation and Error Handling** (2 tests)
   - Newsletter form validation
   - Empty form submission handling

5. **Cross-browser and Device Testing** (2 tests) - DISABLED
   - Mobile device simulation (commented out)
   - Tablet device simulation (commented out)

6. **Accessibility Testing** (2 tests)
   - Basic accessibility checks
   - Keyboard navigation

7. **Performance Testing** (2 tests)
   - Page load times measurement
   - Network performance metrics

8. **Error Handling and Edge Cases** (3 tests)
   - Network error handling
   - Missing elements handling
   - Slow loading pages

9. **Data Integrity and Content Validation** (3 tests)
   - Page titles and URLs validation
   - Navigation consistency
   - Footer content validation

### **Test Features**

- **Page Object Model**: Maintainable and reusable test code
- **Comprehensive Coverage**: All major website functionalities
- **Error Handling**: Robust error handling and recovery
- **Performance Testing**: Load time and performance metrics
- **Accessibility Testing**: Basic accessibility compliance checks
- **Responsive Testing**: Mobile and tablet device simulation
- **Data Validation**: Content and navigation consistency checks

## 🛠 **Configuration**

### **Playwright Configuration**
The `playwright.config.js` file contains:
- Browser configurations (Chromium, Firefox, WebKit)
- Timeout settings (90 seconds for tests, 30 seconds for assertions)
- Parallel test execution (disabled for Browserbase)
- HTML, JSON, and JUnit reporting
- Global setup and teardown
- **Browserbase integration** - Automatically connects to Browserbase when credentials are provided

### **Browserbase Configuration**
The Browserbase integration is handled automatically:
- **Global Setup** (`tests/global-setup.js`): Creates Browserbase session when API key is provided
- **Global Teardown** (`tests/global-teardown.js`): Cleans up Browserbase session
- **Playwright Config**: Automatically uses Browserbase connection when environment variables are set

### **Test Data**
The `test-data.js` file contains:
- User data for form testing
- Validation rules and messages
- Navigation configurations
- Conference data
- Timeout configurations

## 📈 **Test Execution**

### **Running Specific Test Categories**
```bash
# Run only home page tests
npx playwright test --grep "Home Page"

# Run only form validation tests
npx playwright test --grep "Form Validation"

# Run only performance tests
npx playwright test --grep "Performance"
```

### **Test Reports**
- **HTML Report**: `playwright-report/index.html`
- **JSON Report**: `test-results/results.json`
- **JUnit XML**: `test-results/results.xml`
- **Screenshots**: `test-results/screenshots/`

## 🔧 **Troubleshooting**

### **Common Issues**
1. **Tests timing out**: Increase timeout in `playwright.config.js`
2. **Element not found**: Check selectors in page objects
3. **Network errors**: Verify website accessibility
4. **Form submission failures**: Check form validation rules

### **Debug Mode**
```bash
# Run in debug mode to step through tests
npm run test:debug
```

## 📋 **Maintenance**

### **Regular Tasks**
- **Daily**: Run test suite to verify website functionality
- **Weekly**: Review test reports and update test data
- **Monthly**: Update dependencies and review test coverage
- **As needed**: Add new tests for new website features

## ✅ **Success Indicators**

- ✅ **33 comprehensive tests** covering all website functionality
- ✅ **Page Object Model** for maintainable code
- ✅ **Error handling** and recovery mechanisms
- ✅ **Performance testing** with load time measurements
- ✅ **Accessibility testing** for compliance
- ✅ **Responsive testing** for mobile and tablet (disabled)
- ✅ **Automated reporting** with HTML, JSON, and XML formats

## 🎯 **Next Steps**

1. **Run Tests**: Execute the test suite to verify website functionality
2. **Review Reports**: Check test results and identify any issues
3. **Add Features**: Extend tests for new website functionality as needed
4. **Maintain**: Keep tests updated with website changes

**Your comprehensive automation system is ready to use!** 🎯