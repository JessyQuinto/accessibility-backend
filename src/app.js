const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const analyzeRoutes = require('./routes/analyze');
require('dotenv').config();

const app = express();

// Middleware básico
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Rutas
app.use('/api', analyzeRoutes);

// Endpoint de salud
app.get('/', (req, res) => {
    res.send('API de accesibilidad funcionando');
});

// Manejador de errores básico
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: 'error',
        message: 'Error interno del servidor'
    });
});

module.exports = app;
