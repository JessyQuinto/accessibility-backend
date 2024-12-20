// C:\Users\Jessy\source\repos\accessibility-backend\src\controllers\analyzeController.js
const { scanPage } = require('../services/accessibilityScanner');

exports.analyzeURL = async (req, res, next) => {
    const { url } = req.body;

    if (!url) {
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
        return res.status(400).json({
            status: 'error',
            message: 'URL inválida',
            code: 'INVALID_URL_FORMAT'
        });
    }

    try {
        const results = await scanPage(url);
        res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (err) {
        next(err);
    }
};
