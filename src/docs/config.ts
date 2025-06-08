import swaggerJSDoc, { Options } from 'swagger-jsdoc';

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
        title: 'Teacher evaluation API',
        version: '1.0.0',
    },
    servers: [
        {
            url: '/api',
        },
    ],
    components: {
        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
    security: [
        {
            bearerAuth: [],
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