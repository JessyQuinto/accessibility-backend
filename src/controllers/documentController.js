// src/controllers/documentController.js
const { analyzeDocument } = require('../services/documentAnalyzer');

exports.analyzeDocumentFile = async (req, res, next) => {
    console.log('Request body:', req.body);
    console.log('Request file:', req.file);

    if (!req.file) {
        return res.status(400).json({
            status: 'error',
            message: 'No se proporcionó ningún archivo',
            code: 'FILE_REQUIRED',
            debug: {
                contentType: req.get('content-type'),
                bodyFields: Object.keys(req.body)
            }
        });
    }

    try {
        const results = await analyzeDocument(req.file.buffer);
        res.status(200).json({
            status: 'success',
            data: results
        });
    } catch (err) {
        console.error('Error in analyzeDocumentFile:', err);
        next(err);
    }
};