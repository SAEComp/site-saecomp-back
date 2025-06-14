import { OpenApiGeneratorV31 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

import { registerAdminAnswerRoutesDocs } from './openapi/adminAnswer.openapi';
import { registerAdminQuestionRoutesDocs } from './openapi/adminQuestion.openapi';
import { registerPublicAnswerRoutesDocs } from './openapi/answer.openapi';
import { registerEvaluationRoutesDocs } from './openapi/evaluation.openapi';

registry.registerComponent('securitySchemes', 'bearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
});


registerAdminAnswerRoutesDocs();
registerAdminQuestionRoutesDocs();
registerPublicAnswerRoutesDocs();
registerEvaluationRoutesDocs();

const generator = new OpenApiGeneratorV31(registry.definitions);

export const openApiDoc = generator.generateDocument({
    openapi: '3.1.0',
    info: {
        title: 'Teacher Evaluation API',
        version: '1.0.0',
    },
    servers: [
        { url: '/api/evaluation' }
    ],
    security: [
        {
            bearerAuth: [],
        },
    ],
});
