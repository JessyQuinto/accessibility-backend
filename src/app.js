const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const analyzeRoutes = require('./routes/analyze');
const documentAnalysisRoutes = require('./routes/documentAnalysis');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/api', analyzeRoutes);
app.use('/api/documents', documentAnalysisRoutes);

// Health check endpoint
app.get('/', (req, res) => {
    res.send('API de accesibilidad y análisis de documentos funcionando');
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