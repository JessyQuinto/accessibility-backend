const { scanPage } = require('../services/accessibilityScanner');
const { uploadJsonToBlob } = require('../services/blobOperations');
const axios = require('axios');
require('dotenv').config();

exports.analyzeURL = async (req, res, next) => {
    console.log('Solicitud recibida para analizar URL:', req.body.url);
    const { url } = req.body;

    if (!url) {
        console.log('Error: URL no proporcionada');
        return res.status(400).json({
            status: 'error',
            message: 'URL no proporcionada',
            code: 'URL_REQUIRED'
        });
    }

    // Validate URL format
    try {
        new URL(url);
    } catch (err) {
        console.log('Error: URL inválida:', url);
        return res.status(400).json({
            status: 'error',
            message: 'URL inválida',
            code: 'INVALID_URL_FORMAT'
        });
    }

    try {
        console.log('Iniciando escaneo de página:', url);
        const scanResults = await scanPage(url);
        
        // Estructurar los datos en el formato requerido
        const formattedResults = {
            status: 'success',
            data: {
                violations: scanResults.violations
            }
        };

        // Generate blob name based on URL and timestamp
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const urlSafe = url.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 50);
        const blobName = `report_${urlSafe}_${timestamp}.json`;

        // Upload formatted results to blob storage
        console.log('Subiendo resultados a Blob Storage:', blobName);
        await uploadJsonToBlob(
            process.env.CONTAINER_REPORT_NAME,
            blobName,
            formattedResults
        );

        // Send report name to Azure Function and get recommendations
        console.log('Enviando nombre del reporte a Azure Function:', blobName);
        let recommendations = null;
        try {
            const functionResponse = await axios.post(
                'https://wcag-audit.azurewebsites.net/api/wcag_recommendation',
                {
                    report_id: blobName
                },
                {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );
            console.log('Respuesta de Azure Function recibida:', functionResponse.data);
            recommendations = functionResponse.data;
        } catch (functionError) {
            console.error('Error al obtener recomendaciones de Azure Function:', functionError);
            recommendations = {
                error: 'No se pudieron obtener las recomendaciones',
                details: functionError.message
            };
        }

        // Combinar los resultados del análisis con las recomendaciones
        const finalResponse = {
            status: 'success',
            data: {
                violations: scanResults.violations,
                recommendations: recommendations,
                reportId: blobName
            }
        };

        console.log('Escaneo completado y resultados almacenados');
        res.status(200).json(finalResponse);
    } catch (err) {
        console.error('Error durante el proceso:', err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Error interno del servidor',
            code: 'PROCESS_ERROR',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};