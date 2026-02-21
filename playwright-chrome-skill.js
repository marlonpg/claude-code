// Playwright Chrome Browser Skill
// This skill provides functions for accessing Chrome browser using Playwright

const { chromium } = require('playwright');
const fs = require('fs').promises;

class PlaywrightChromeSkill {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  /**
   * Open Chrome browser with Playwright
   * @param {string} url - URL to navigate to
   * @param {boolean} headless - Whether to run in headless mode
   * @returns {Promise<Object>} Browser and page objects
   */
  async openChrome(url, headless = false) {
    try {
      // Launch Chrome browser
      this.browser = await chromium.launch({
        headless: headless,
        slowMo: 100 // Add slight delay for better visualization
      });

      // Create a new page
      this.page = await this.browser.newPage();

      // Navigate to the URL
      await this.page.goto(url);

      console.log(`✅ Successfully opened ${url} in Chrome browser`);
      return { browser: this.browser, page: this.page };
    } catch (error) {
      console.error('❌ Error opening Chrome browser:', error);
      throw error;
    }
  }

  /**
   * Close the Chrome browser
   */
  async closeChrome() {
    try {
      if (this.browser) {
        await this.browser.close();
        this.browser = null;
        this.page = null;
        console.log('✅ Chrome browser closed successfully');
      }
    } catch (error) {
      console.error('❌ Error closing Chrome browser:', error);
      throw error;
    }
  }

  /**
   * Take a screenshot of the current page
   * @param {string} filename - Name of screenshot file
   */
  async takeScreenshot(filename) {
    try {
      if (this.page) {
        await this.page.screenshot({ path: filename });
        console.log(`✅ Screenshot saved as ${filename}`);
      } else {
        console.log('❌ No active page to take screenshot of');
      }
    } catch (error) {
      console.error('❌ Error taking screenshot:', error);
      throw error;
    }
  }

  /**
   * Execute JavaScript on the current page
   * @param {string} script - JavaScript to execute
   * @returns {Promise<any>} Result of script execution
   */
  async executeScript(script) {
    try {
      if (this.page) {
        const result = await this.page.evaluate(script);
        return result;
      } else {
        console.log('❌ No active page to execute script on');
        return null;
      }
    } catch (error) {
      console.error('❌ Error executing script:', error);
      throw error;
    }
  }

  /**
   * Get page title
   * @returns {Promise<string>} Page title
   */
  async getPageTitle() {
    try {
      if (this.page) {
        const title = await this.page.title();
        return title;
      } else {
        console.log('❌ No active page to get title from');
        return '';
      }
    } catch (error) {
      console.error('❌ Error getting page title:', error);
      throw error;
    }
  }

  /**
   * Get current URL
   * @returns {Promise<string>} Current URL
   */
  async getCurrentUrl() {
    try {
      if (this.page) {
        const url = await this.page.url();
        return url;
      } else {
        console.log('❌ No active page to get URL from');
        return '';
      }
    } catch (error) {
      console.error('❌ Error getting current URL:', error);
      throw error;
    }
  }
}

// Export the skill
module.exports = PlaywrightChromeSkill;