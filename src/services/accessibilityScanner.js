const puppeteer = require('puppeteer');
const axeCore = require('axe-core');

exports.scanPage = async (url) => {
    let browser = null;
    
    try {
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage'
            ]
        });
        
        const page = await browser.newPage();
        
        // Set reasonable timeout
        await page.setDefaultNavigationTimeout(30000);
        await page.setDefaultTimeout(30000);

        // Navigate to URL with error handling
        await page.goto(url, { 
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Inject and run axe-core
        await page.evaluate(axeCore.source);
        
        const results = await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                window.axe.run(document, {
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa']
                    }
                })
                .then(resolve)
                .catch(reject);
            });
        });

        return results;
    } catch (err) {
        throw new Error(`Error al analizar la página: ${err.message}`);
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
