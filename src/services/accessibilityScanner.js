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

        // Esperar a que el contenido se cargue completamente
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        // Inyectar axe-core y ejecutar el análisis
        await page.evaluate(axeCore.source);

        const results = await page.evaluate(() => {
            return new Promise((resolve, reject) => {
                window.axe.run(document, {
                    runOnly: {
                        type: 'tag',
                        values: ['wcag2a', 'wcag2aa', 'wcag2aaa', 'best-practice', 'accessibility']
                    }
                })
                .then(results => {
                    const simplifiedResults = {
                        violations: results.violations.map(violation => ({
                            description: violation.description,
                            impact: violation.impact,
                            nodes: violation.nodes.length,
                            wcag_reference: violation.helpUrl || "No disponible",
                            suggested_fix: violation.help || "Sugerencia no disponible",
                            affected_nodes: violation.nodes.map(node => ({
                                html: node.html,
                                node_details: {
                                    tag: node.target[0].split(' ')[0],
                                    location: node.target[0],
                                    text_content: node.html
                                }
                            }))
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
