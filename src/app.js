// C:\Users\Jessy\source\repos\accessibility-backend\src\app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const analyzeRoutes = require('./routes/analyze');
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

// Rutas
app.use('/api', analyzeRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('API de accesibilidad funcionando');
});

// Basic error handler
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor',
        details: err.message
    });
});

module.exports = app;
