// C:\Users\Jessy\source\repos\accessibility-backend\src\app.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const analyzeRoutes = require('./routes/analyze');
require('dotenv').config();

const app = express();

// Basic middleware
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Routes
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
        message: 'Error interno del servidor'
    });
});

module.exports = app;