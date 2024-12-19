// src/services/documentExporter.js
const PDFDocument = require('pdfkit');
const fs = require('fs');

module.exports = {
    exportAccessibleDocument: async (originalFilePath, analysisResults) => {
        const outputFilePath = originalFilePath.replace(/\.pdf$/, '_accessible.pdf');
        const doc = new PDFDocument();
        const writeStream = fs.createWriteStream(outputFilePath);
        doc.pipe(writeStream);

        analysisResults.pages.forEach(page => {
            doc.addPage();
            page.text.forEach(line => {
                doc.text(line);
            });

            page.tables.forEach(table => {
                doc.text(`Tabla: ${table.rows} filas, ${table.columns} columnas`);
            });
        });

        doc.end();

        return new Promise((resolve, reject) => {
            writeStream.on('finish', () => resolve(outputFilePath));
            writeStream.on('error', reject);
        });
    }
};
