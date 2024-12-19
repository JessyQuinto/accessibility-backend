// src/services/accessibilityValidator.js
module.exports = {
    validate: (analysisResults) => {
        const issues = [];

        analysisResults.pages.forEach(page => {
            page.tables.forEach(table => {
                if (!table.rows || !table.columns) {
                    issues.push(`Tabla en la página ${page.number} no tiene etiquetas adecuadas.`);
                }
            });

            if (page.hasHandwrittenContent) {
                issues.push(`Contenido manuscrito detectado en la página ${page.number}, lo que puede dificultar la accesibilidad.`);
            }
        });

        return issues;
    }
};