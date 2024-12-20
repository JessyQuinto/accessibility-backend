const { scanPage } = require('../services/accessibilityScanner');

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
        const results = await scanPage(url);
        console.log('Escaneo completado exitosamente');
        res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (err) {
        console.error('Error durante el escaneo:', err);
        res.status(500).json({
            status: 'error',
            message: err.message || 'Error interno del servidor',
            code: 'SCAN_ERROR',
            details: process.env.NODE_ENV === 'development' ? err.stack : undefined
        });
    }
};