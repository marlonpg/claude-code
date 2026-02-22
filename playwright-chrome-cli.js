#!/usr/bin/env node

// Playwright Chrome CLI Tool
// Usage:
//   node playwright-chrome-cli.js <url> [options]
//
// Options:
//   --screenshot <path>   Save a screenshot to the given path
//   --headless             Run in headless mode (default: true)
//   --no-headless          Run with visible browser
//   --viewport <WxH>      Set viewport size, e.g. 1280x720
//   --wait <ms>            Wait N milliseconds after page load before screenshot
//   --click <selector>     Click an element before taking screenshot
//   --type <selector>      Type text into an element (use with --text)
//   --text <value>         Text to type (requires --type)
//   --title                Print the page title
//   --console              Capture and print console logs
//   --keep-open            Don't close the browser (for chained commands)

const PlaywrightChromeSkill = require('./.claude/commands/playwright-chrome-skill');

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    url: null,
    screenshot: null,
    headless: true,
    viewport: null,
    wait: 1000,
    click: null,
    type: null,
    text: null,
    title: false,
    console: false,
    keepOpen: false,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--screenshot':
        opts.screenshot = args[++i];
        break;
      case '--headless':
        opts.headless = true;
        break;
      case '--no-headless':
        opts.headless = false;
        break;
      case '--viewport':
        opts.viewport = args[++i];
        break;
      case '--wait':
        opts.wait = parseInt(args[++i], 10);
        break;
      case '--click':
        opts.click = args[++i];
        break;
      case '--type':
        opts.type = args[++i];
        break;
      case '--text':
        opts.text = args[++i];
        break;
      case '--title':
        opts.title = true;
        break;
      case '--console':
        opts.console = true;
        break;
      case '--keep-open':
        opts.keepOpen = true;
        break;
      default:
        if (!args[i].startsWith('--') && !opts.url) {
          opts.url = args[i];
        }
        break;
    }
  }

  return opts;
}

async function main() {
  const opts = parseArgs(process.argv);

  if (!opts.url) {
    console.error('Usage: node playwright-chrome-cli.js <url> [options]');
    console.error('');
    console.error('Options:');
    console.error('  --screenshot <path>   Save screenshot to path');
    console.error('  --headless            Headless mode (default)');
    console.error('  --no-headless         Show browser window');
    console.error('  --viewport <WxH>      Viewport size, e.g. 1280x720');
    console.error('  --wait <ms>           Wait after load (default: 1000)');
    console.error('  --click <selector>    Click an element');
    console.error('  --type <selector>     Target element for typing');
    console.error('  --text <value>        Text to type');
    console.error('  --title               Print page title');
    console.error('  --console             Capture console logs');
    process.exit(1);
  }

  const skill = new PlaywrightChromeSkill();

  try {
    // Open browser
    await skill.openChrome(opts.url, !opts.headless);

    // Set viewport if provided
    if (opts.viewport && skill.page) {
      const [width, height] = opts.viewport.split('x').map(Number);
      await skill.page.setViewportSize({ width, height });
    }

    // Capture console logs if requested
    const consoleLogs = [];
    if (opts.console && skill.page) {
      skill.page.on('console', (msg) => {
        consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
      });
    }

    // Wait after page load
    if (opts.wait > 0) {
      await new Promise((r) => setTimeout(r, opts.wait));
    }

    // Perform click action
    if (opts.click && skill.page) {
      await skill.page.click(opts.click);
      await new Promise((r) => setTimeout(r, 500));
    }

    // Perform type action
    if (opts.type && opts.text && skill.page) {
      await skill.page.fill(opts.type, opts.text);
      await new Promise((r) => setTimeout(r, 500));
    }

    // Print title
    if (opts.title) {
      const title = await skill.getPageTitle();
      console.log(`title: ${title}`);
    }

    // Take screenshot
    if (opts.screenshot) {
      await skill.takeScreenshot(opts.screenshot);
      console.log(`screenshot: ${opts.screenshot}`);
    }

    // Print console logs
    if (opts.console && consoleLogs.length > 0) {
      console.log('--- console logs ---');
      consoleLogs.forEach((l) => console.log(l));
    }

    // Print current URL
    const currentUrl = await skill.getCurrentUrl();
    console.log(`url: ${currentUrl}`);

    // Close unless keep-open
    if (!opts.keepOpen) {
      await skill.closeChrome();
    }
  } catch (error) {
    console.error(`error: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main, parseArgs };