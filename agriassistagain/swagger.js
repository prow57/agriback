//swagger.js
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Agri-Assist-AI API Documentation', // Title of your API
    version: '1.0.0',
    description: 'API documentation for Agri-Assist-AI backend',
  },
  servers: [
    {
      url: 'https://agriback-plum.vercel.app', // Your API server URL (update if needed)
      description: 'Development server for Agriassist-AI by Open-TechZ, A2SV Hackathon Semifinalist',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.js'], // Location of your route files
};

const swaggerSpec = swaggerJsdoc(options);

module.exports = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
};
