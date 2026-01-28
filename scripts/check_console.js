// Set HOME environment variable to avoid Playwright installation errors
process.env.HOME = '/tmp';

const { chromium } = require('playwright');

/**
 * Console Error Checker
 * Captures and reports all console errors, warnings, and network issues
 */
async function checkConsoleErrors() {
    console.log('🔍 Starting console error check...\n');

    // Arrays to store different types of errors
    const consoleErrors = [];
    const consoleWarnings = [];
    const pageErrors = [];
    const networkErrors = [];

    let browser;
    let page;

    try {
        // Launch browser
        console.log('🌐 Launching browser...');
        browser = await chromium.launch({
            headless: true, // Run in headless mode
        });

        page = await browser.newPage();

        // Listen to console messages
        page.on('console', (msg) => {
            const type = msg.type();
            const text = msg.text();

            if (type === 'error') {
                consoleErrors.push({
                    type: 'Console Error',
                    message: text,
                    location: msg.location(),
                });
            } else if (type === 'warning') {
                consoleWarnings.push({
                    type: 'Console Warning',
                    message: text,
                    location: msg.location(),
                });
            }
        });

        // Listen to page errors (uncaught exceptions)
        page.on('pageerror', (error) => {
            pageErrors.push({
                type: 'Uncaught Exception',
                message: error.message,
                stack: error.stack,
            });
        });

        // Listen to failed requests
        page.on('requestfailed', (request) => {
            const failure = request.failure();
            networkErrors.push({
                type: 'Network Error',
                url: request.url(),
                method: request.method(),
                errorText: failure ? failure.errorText : 'Unknown error',
            });
        });

        // Navigate to the target URL
        const targetUrl = process.env.TARGET_URL || 'http://localhost:3000';
        console.log(`📄 Navigating to ${targetUrl}...`);

        await page.goto(targetUrl, {
            waitUntil: 'networkidle',
            timeout: 30000,
        });

        console.log('✅ Page loaded successfully\n');

        // Wait a bit to capture any delayed errors
        console.log('⏳ Waiting 3 seconds to capture delayed errors...\n');
        await page.waitForTimeout(3000);

        // Print results
        printResults({
            consoleErrors,
            consoleWarnings,
            pageErrors,
            networkErrors,
        });

    } catch (error) {
        console.error('❌ Error during execution:', error.message);
        process.exit(1);
    } finally {
        if (browser) {
            await browser.close();
            console.log('\n🔒 Browser closed');
        }
    }
}

/**
 * Print all collected errors in a formatted way
 */
function printResults({ consoleErrors, consoleWarnings, pageErrors, networkErrors }) {
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                    ERROR REPORT                           ');
    console.log('═══════════════════════════════════════════════════════════\n');

    // Console Errors
    if (consoleErrors.length > 0) {
        console.log('🔴 CONSOLE ERRORS (' + consoleErrors.length + ')');
        console.log('─────────────────────────────────────────────────────────');
        consoleErrors.forEach((error, index) => {
            console.log(`\n${index + 1}. ${error.message}`);
            if (error.location && error.location.url) {
                console.log(`   Location: ${error.location.url}:${error.location.lineNumber}`);
            }
        });
        console.log('\n');
    } else {
        console.log('✅ No console errors found\n');
    }

    // Console Warnings
    if (consoleWarnings.length > 0) {
        console.log('⚠️  CONSOLE WARNINGS (' + consoleWarnings.length + ')');
        console.log('─────────────────────────────────────────────────────────');
        consoleWarnings.forEach((warning, index) => {
            console.log(`\n${index + 1}. ${warning.message}`);
            if (warning.location && warning.location.url) {
                console.log(`   Location: ${warning.location.url}:${warning.location.lineNumber}`);
            }
        });
        console.log('\n');
    } else {
        console.log('✅ No console warnings found\n');
    }

    // Page Errors (Uncaught Exceptions)
    if (pageErrors.length > 0) {
        console.log('💥 UNCAUGHT EXCEPTIONS (' + pageErrors.length + ')');
        console.log('─────────────────────────────────────────────────────────');
        pageErrors.forEach((error, index) => {
            console.log(`\n${index + 1}. ${error.message}`);
            if (error.stack) {
                console.log(`   Stack trace:\n${error.stack}`);
            }
        });
        console.log('\n');
    } else {
        console.log('✅ No uncaught exceptions found\n');
    }

    // Network Errors
    if (networkErrors.length > 0) {
        console.log('🌐 NETWORK ERRORS (' + networkErrors.length + ')');
        console.log('─────────────────────────────────────────────────────────');
        networkErrors.forEach((error, index) => {
            console.log(`\n${index + 1}. ${error.method} ${error.url}`);
            console.log(`   Error: ${error.errorText}`);
        });
        console.log('\n');
    } else {
        console.log('✅ No network errors found\n');
    }

    // Summary
    console.log('═══════════════════════════════════════════════════════════');
    console.log('                       SUMMARY                             ');
    console.log('═══════════════════════════════════════════════════════════');

    const totalErrors = consoleErrors.length + pageErrors.length + networkErrors.length;
    const totalWarnings = consoleWarnings.length;

    console.log(`Total Errors:   ${totalErrors}`);
    console.log(`Total Warnings: ${totalWarnings}`);

    if (totalErrors === 0 && totalWarnings === 0) {
        console.log('\n🎉 SUCCESS! No errors or warnings detected!\n');
        process.exit(0);
    } else if (totalErrors === 0) {
        console.log('\n⚠️  No errors, but warnings were detected.\n');
        process.exit(0);
    } else {
        console.log('\n❌ FAILED! Errors were detected.\n');
        process.exit(1);
    }
}

// Run the checker
checkConsoleErrors();
