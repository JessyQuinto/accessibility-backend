const fs = require('fs');
const PDFDocument = require('pdfkit');
const PDFKit = require('pdfkit');

exports.generatePDF = async (results, outputPath) => {
    return new Promise((resolve, reject) => {
        try {
            const doc = new PDFKit({
                margin: 50,
                size: 'A4'
            });

            const stream = fs.createWriteStream(outputPath);
            stream.on('error', reject);
            doc.pipe(stream);

            doc.fontSize(20).text('Informe de Accesibilidad', { align: 'center' });
            doc.moveDown();

            doc.fontSize(12).text(`Puntuación general: ${results.violations.length} problemas detectados`);
            doc.moveDown();

            results.violations.forEach((violation) => {
                doc.fontSize(14).text(`Problema: ${violation.description}`);
                doc.fontSize(12).text(`Impacto: ${violation.impact}`);
                doc.text(`Nodos afectados: ${violation.nodes.length}`);
                doc.moveDown();
            });

            doc.end();
            stream.on('finish', resolve);
        } catch (error) {
            reject(error);
        }
    });
};