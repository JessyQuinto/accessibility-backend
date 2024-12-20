// src/routes/document.js
const express = require('express');
const multer = require('multer');
const router = express.Router();

// Configuración básica de multer
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB
    }
}).any(); // Cambiado a .any() para ver todos los campos que llegan

router.post('/analyze-document', (req, res) => {
    upload(req, res, function(err) {
        // Logging detallado
        console.log('=== DEBUG INFO ===');
        console.log('Headers:', req.headers);
        console.log('Content-Type:', req.get('content-type'));
        console.log('Body:', req.body);
        console.log('Files:', req.files);
        console.log('File Fields:', req.files ? req.files.map(f => ({
            fieldname: f.fieldname,
            originalname: f.originalname,
            mimetype: f.mimetype,
            size: f.size
        })) : 'No files');
        console.log('=== END DEBUG INFO ===');

        if (err instanceof multer.MulterError) {
            return res.status(400).json({
                status: 'error',
                message: `Error de Multer: ${err.message}`,
                code: err.code,
                details: {
                    contentType: req.get('content-type'),
                    availableFields: req.body ? Object.keys(req.body) : []
                }
            });
        } else if (err) {
            return res.status(500).json({
                status: 'error',
                message: `Error general: ${err.message}`
            });
        }

        // Obtener el primer archivo
        const file = req.files && req.files[0];

        if (!file) {
            return res.status(400).json({
                status: 'error',
                message: 'No se recibió ningún archivo',
                debug: {
                    contentType: req.get('content-type'),
                    fields: req.body ? Object.keys(req.body) : [],
                    files: req.files ? req.files.length : 0
                }
            });
        }

        // Verificar el tipo de archivo
        if (!['application/pdf', 'image/png'].includes(file.mimetype)) {
            return res.status(400).json({
                status: 'error',
                message: 'Tipo de archivo no soportado. Solo se permiten PDF y PNG',
                receivedType: file.mimetype
            });
        }

        // Si todo está bien, responder con éxito
        res.status(200).json({
            status: 'success',
            message: 'Archivo recibido correctamente',
            file: {
                fieldname: file.fieldname,
                originalname: file.originalname,
                mimetype: file.mimetype,
                size: file.size
            }
        });
    });
});

module.exports = router;