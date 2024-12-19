const { DocumentAnalysisClient } = require('@azure/ai-form-recognizer');
const { AzureKeyCredential } = require('@azure/core-auth');
const fs = require('fs').promises;

class DocumentAnalysisService {
    constructor() {
        if (!process.env.DOCUMENT_INTELLIGENCE_ENDPOINT || !process.env.DOCUMENT_INTELLIGENCE_API_KEY) {
            throw new Error('Las credenciales de Azure Document Intelligence no están configuradas');
        }

        this.client = new DocumentAnalysisClient(
            process.env.DOCUMENT_INTELLIGENCE_ENDPOINT,
            new AzureKeyCredential(process.env.DOCUMENT_INTELLIGENCE_API_KEY)
        );
    }

    async analyzeDocument(filePath) {
        try {
            console.log('Iniciando análisis del documento:', filePath);
            const fileBuffer = await fs.readFile(filePath);
            
            console.log('Archivo leído, comenzando análisis...');
            const poller = await this.client.beginAnalyzeDocument(
                "prebuilt-layout",
                fileBuffer
            );
            
            console.log('Esperando resultados del análisis...');
            const result = await poller.pollUntilDone();
            
            console.log('Análisis completado, procesando resultados...');
            return this.processResults(result);
        } catch (error) {
            console.error('Error en analyzeDocument:', error);
            throw new Error(`Error en el análisis del documento: ${error.message}`);
        } finally {
            try {
                await fs.unlink(filePath);
                console.log('Archivo temporal eliminado:', filePath);
            } catch (error) {
                console.error('Error al eliminar archivo temporal:', error);
            }
        }
    }

    processResults(result) {
        return {
            pages: result.pages.map(page => ({
                number: page.pageNumber,
                text: page.lines?.map(line => line.content) || [],
                tables: this.extractTables(page),
                hasHandwrittenContent: this.checkHandwrittenContent(page)
            })),
            tables: this.processAllTables(result.tables)
        };
    }

    extractTables(page) {
        return page.tables?.map(table => ({
            rows: table.rowCount,
            columns: table.columnCount,
            content: table.cells?.map(cell => ({
                text: cell.content,
                rowIndex: cell.rowIndex,
                columnIndex: cell.columnIndex
            }))
        })) || [];
    }

    checkHandwrittenContent(page) {
        return page.styles?.some(style => style.isHandwritten) || false;
    }

    processAllTables(tables) {
        return tables?.map(table => ({
            rowCount: table.rowCount,
            columnCount: table.columnCount,
            cells: table.cells?.map(cell => ({
                rowIndex: cell.rowIndex,
                columnIndex: cell.columnIndex,
                content: cell.content
            }))
        })) || [];
    }
}

module.exports = new DocumentAnalysisService();
