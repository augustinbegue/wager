import swaggerUi from 'swagger-ui-express';
import { swMatchesRouter } from '../routes/matches';

export const swagger: swaggerUi.JsonObject = {
    openapi: '3.0.0',
    info: {
        title: 'Wager API',
        version: '0.1.0',
        description: 'Wager API',
    },
    servers: [
        {
            url: 'http://localhost',
            description: 'Development server',
        }
    ],
    paths: {
        ...swMatchesRouter,
    }
};
