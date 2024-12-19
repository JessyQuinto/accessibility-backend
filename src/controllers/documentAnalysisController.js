// src/controllers/documentAnalysisController.js
const documentAnalyzer = require('../services/documentAnalyzer');
const multer = require('multer');
const path = require('path');

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
}).single('file'); // Asegúrate de que esto coincida con el nombre del campo en tu petición

const analyzeFile = async (req, res) => {
    upload(req, res, async function(err) {
        if (err instanceof multer.MulterError) {
            // Error de Multer
            return res.status(400).json({
                status: 'error',
                message: 'Error al subir el archivo',
                code: 'UPLOAD_ERROR',
                details: err.message
            });
        } else if (err) {
            // Otro tipo de error
            return res.status(500).json({
                status: 'error',
                message: 'Error interno del servidor',
                code: 'SERVER_ERROR',
                details: err.message
            });
        }

        // Verificar si hay archivo
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No se proporcionó ningún archivo',
                code: 'FILE_REQUIRED'
            });
        }

        try {
            console.log('Iniciando análisis del archivo:', req.file.path);
            const results = await documentAnalyzer.analyzeDocument(req.file.path);
            
            res.status(200).json({
                status: 'success',
                data: results
            });
        } catch (err) {
            console.error('Error en analyzeFile:', err);
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