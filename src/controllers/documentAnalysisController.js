// src/controllers/documentAnalysisController.js
const documentAnalyzer = require('../services/documentAnalyzer');
const multer = require('multer');
const path = require('path');
const accessibilityValidator = require('../services/accessibilityValidator');
const documentExporter = require('../services/documentExporter');

// Configuración de multer
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const fileFilter = (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no soportado. Solo se permiten PDF, JPEG y PNG.'));
    }
};

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    },
    fileFilter: fileFilter
}).single('file');

const analyzeFile = async (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                status: 'error',
                message: 'Error al subir el archivo',
                code: 'UPLOAD_ERROR',
                details: err.message
            });
        } else if (err) {
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                code: 'SERVER_ERROR',
                details: err.message
            });
        }

        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No se proporcionó ningún archivo',
                code: 'FILE_REQUIRED'
            });
        }

        try {
            const analysisResults = await documentAnalyzer.analyzeDocument(req.file.path);
            const accessibilityIssues = accessibilityValidator.validate(analysisResults);

            if (accessibilityIssues.length > 0) {
                return res.status(200).json({
                    status: 'success',
                    message: 'El documento contiene problemas de accesibilidad',
                    issues: accessibilityIssues
                });
            }

            const accessibleDocumentPath = await documentExporter.exportAccessibleDocument(req.file.path, analysisResults);

            res.status(200).json({
                status: 'success',
                message: 'El documento es accesible',
                accessibleDocumentPath
            });
        } catch (err) {
            res.status(500).json({
                status: 'error',
                message: 'Error al analizar el documento',
                code: 'ANALYSIS_ERROR',
                details: err.message
            });
        }
    });
};

module.exports = {
    analyzeFile
};