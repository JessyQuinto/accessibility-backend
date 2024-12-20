const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const analyzeRoutes = require('./routes/analyze');
const documentRoutes = require('./routes/document');
require('dotenv').config();

const app = express();

// Configuración de CORS
const allowedOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8080'];
const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error('Origen no permitido por CORS'));
        }
    },
    credentials: true,
};

// Middleware
app.use(helmet());
app.use(cors(corsOptions));
app.use(bodyParser.json());

// Aumentar el límite de tamaño para archivos
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

// Rutas
app.use('/api', analyzeRoutes);
app.use('/api', documentRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('API de accesibilidad y análisis de documentos funcionando');
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    
    // Manejar errores específicos de multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            status: 'error',
            message: 'El archivo es demasiado grande',
            details: 'El tamaño máximo permitido es 50MB'
        });
    }
    
    // Manejar errores de Azure Document Intelligence
    if (err.code && err.code.includes('Azure')) {
        return res.status(400).json({
            status: 'error',
            message: 'Error en el análisis del documento',
            details: err.message
        });
    }

    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: err.message
    });
});

module.exports = app;