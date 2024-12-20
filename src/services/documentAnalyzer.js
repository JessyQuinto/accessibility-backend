// src/services/documentAnalyzer.js
const { AzureKeyCredential, DocumentAnalysisClient } = require("@azure/ai-form-recognizer");

exports.analyzeDocument = async (fileBuffer) => {
    try {
        const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT;
        const apiKey = process.env.DOCUMENT_INTELLIGENCE_API_KEY;

        if (!endpoint || !apiKey) {
            throw new Error('Faltan credenciales de Azure Document Intelligence');
        }

        console.log('Iniciando análisis de documento con Azure...');
        const client = new DocumentAnalysisClient(
            endpoint, 
            new AzureKeyCredential(apiKey)
        );

        const poller = await client.beginAnalyzeDocument(
            "prebuilt-layout",
            fileBuffer
        );

        console.log('Esperando resultados del análisis...');
        const result = await poller.pollUntilDone();
        console.log('Análisis completado');

        return {
            pageCount: result.pages.length,
            content: result.content,
            pages: result.pages.map(page => ({
                pageNumber: page.pageNumber,
                lines: page.lines.map(line => line.content),
                words: page.words.map(word => ({
                    content: word.content,
                    confidence: word.confidence
                }))
            })),
            tables: result.tables?.map(table => ({
                rowCount: table.rowCount,
                columnCount: table.columnCount,
                cells: table.cells.map(cell => ({
                    content: cell.content,
                    rowIndex: cell.rowIndex,
                    columnIndex: cell.columnIndex
                }))
            }))
        };
    } catch (error) {
        console.error('Error en analyzeDocument:', error);
        throw new Error(`Error al analizar el documento: ${error.message}`);
    }
};