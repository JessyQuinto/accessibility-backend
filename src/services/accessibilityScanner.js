//C:\Users\Jessy\source\repos\accessibility-backend\src\services\accessibilityScanner.js
const puppeteer = require('puppeteer');
const axeCore = require('axe-core');

exports.scanPage = async (url) => {
    let browser = null;

    try {
        console.log('Iniciando navegador puppeteer');
        browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--disable-dev-shm-usage',
                '--disable-gpu',
                '--window-size=1920,1080'
            ]
        });

        console.log('Creando nueva página');
        const page = await browser.newPage();
        
        // Establecer viewport
        await page.setViewport({ width: 1920, height: 1080 });

        // Manejar errores de página
        page.on('error', err => {
            console.error('Error en la página:', err);
        });

        page.on('pageerror', err => {
            console.error('Error de JavaScript en la página:', err);
        });

        console.log('Navegando a:', url);
        await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
        });

        console.log('Inyectando axe-core');
        await page.evaluate(axeCore.source);

        console.log('Ejecutando análisis de accesibilidad');
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
                .catch(error => {
                    console.error('Error en axe.run:', error);
                    reject(error);
                });
            });
        });

        console.log('Análisis completado exitosamente');
        return results;
    } catch (err) {
        console.error('Error en scanPage:', err);
        throw new Error(`Error al analizar la página: ${err.message}`);
    } finally {
        if (browser) {
            console.log('Cerrando navegador');
            await browser.close();
        }
    }
};