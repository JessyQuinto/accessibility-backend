// src/routes/documentAnalysis.js
const express = require('express');
const router = express.Router();
const { analyzeFile } = require('../controllers/documentAnalysisController');

// Asegúrate de que la carpeta uploads exista
const fs = require('fs');
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

router.post('/analyze-document', analyzeFile);

module.exports = router;