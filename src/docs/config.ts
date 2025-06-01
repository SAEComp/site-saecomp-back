import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Feedback API',
        version: '1.0.0',
    },
    servers: [
        {
            url: '/api',
        },
    ],
};

const options: Options = {
    swaggerDefinition,
    apis: [
        './src/controllers/*.ts',
        './src/routers/*.ts'
    ],
};

export const swaggerSpec = swaggerJSDoc(options);