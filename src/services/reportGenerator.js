const fs = require('fs');
const PDFDocument = require('pdfkit');

exports.generatePDF = async (results, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFDocument({
                margin: 50,
                size: 'A4'
            });

            const stream = fs.createWriteStream(outputPath);
            stream.on('error', reject);
            doc.pipe(stream);

            // Título del informe
            doc.fontSize(20).text('Informe de Accesibilidad Web', { align: 'center' });
            doc.moveDown();

            // Resumen ejecutivo
            doc.fontSize(12).text(`Total de violaciones: ${results.violations.length}`);
            doc.fontSize(12).text(`Violaciones graves: ${results.violations.filter(v => v.impact === 'serious').length}`);
            doc.moveDown();

            // Violaciones detalladas
            results.violations.forEach(violation => {
                doc.fontSize(14).text(`Problema: ${violation.description}`);
                doc.fontSize(12).text(`Impacto: ${violation.impact}`);
                doc.text(`Nodos afectados: ${violation.nodes}`);
                doc.text(`Referencia WCAG: ${violation.wcag_reference}`);
                doc.text(`Sugerencia de corrección: ${violation.suggested_fix}`);
                doc.moveDown();
            });

            doc.end();
            stream.on('finish', resolve);
        } catch (error) {
            reject(error);
        }
    });
};
