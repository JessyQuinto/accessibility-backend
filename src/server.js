require('dotenv').config();
const express = require('express');
const cors = require('cors');
const documentAnalysisRoutes = require('./routes/documentAnalysis');

const app = express();

// Middleware
app.use(cors({
    origin: process.env.ALLOWED_ORIGINS.split(','),
    credentials: true
}));
app.use(express.json());

// Rutas
app.use('/api', documentAnalysisRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});