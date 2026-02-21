#!/usr/bin/env node

// Playwright Chrome CLI Tool
// This script demonstrates using Playwright Chrome skill via CLI

const PlaywrightChromeSkill = require('./playwright-chrome-skill');

async function main() {
  const skill = new PlaywrightChromeSkill();

  console.log('🚀 Starting Playwright Chrome Skill...');

  try {
    // Open Chrome browser
    console.log('🌐 Opening Chrome browser...');
    await skill.openChrome('https://www.google.com', false);

    // Get page title
    const title = await skill.getPageTitle();
    console.log(`📄 Page title: ${title}`);

    // Get current URL
    const url = await skill.getCurrentUrl();
    console.log(`🔗 Current URL: ${url}`);

    // Take screenshot
    console.log('📸 Taking screenshot...');
    await skill.takeScreenshot('screenshot.png');

    // Close browser
    console.log('🧹 Closing browser...');
    await skill.closeChrome();

    console.log('✅ All done!');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Run the main function if this file is executed directly
if (require.main === module) {
  main();
}

module.exports = { main };