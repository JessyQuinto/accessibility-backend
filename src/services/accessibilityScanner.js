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
                .then(results => {
                    const simplifiedResults = {
                        violations: results.violations.map(violation => ({
                            description: violation.description,
                            impact: violation.impact,  // Impacto: serio, moderado, menor
                            nodes: violation.nodes.length,
                            wcag_reference: violation.helpUrl || "No disponible",  // Enlace a la documentación WCAG
                            suggested_fix: violation.help || "Sugerencia no disponible",  // Sugerencia de corrección
                            affected_nodes: violation.nodes.map(node => node.html)  // Código HTML de los nodos afectados
                        }))
                    };
                    resolve(simplifiedResults);
                })
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
