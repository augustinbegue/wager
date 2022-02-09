import dotenv from 'dotenv';
dotenv.config();

// Firebase Admin SDK
import { initializeApp } from 'firebase-admin/app';
import { credential } from 'firebase-admin';
import serviceAccount from '../../wager-80a1f-firebase-adminsdk-agk6x-aaba3ec123.json'
initializeApp({
    credential: credential.cert(serviceAccount as any)
});

// Express and dependencies
import express from 'express';
import path from 'path';
import routers from './routes';
import cors from 'cors';
import bodyParser from 'body-parser';

// Swagger
import swaggerUi from 'swagger-ui-express';
import swaggerJsDoc from 'swagger-jsdoc';
import { demoLogger } from './middlewares/logger';
const options: swaggerJsDoc.Options = {
    definition: {
        openapi: '3.0.0',
        info: {
            title: 'Wager API',
            version: '0.1.0',
            description: 'Wager API',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            }
        ],
    },
    apis: ['./src/routes/*.ts'],
}
const specs = swaggerJsDoc(options);
// TODO: Add swagger documentation (https://blog.logrocket.com/documenting-your-express-api-with-swagger/)

export const app = express();

// Middlewares
app.use(demoLogger);
app.use(cors());
app.use(bodyParser.json());
app.use('/docs', swaggerUi.serve, swaggerUi.setup(specs, { explorer: true, customSiteTitle: 'Wager API' }));

app.use('/matches', routers.matchesRouter);
app.use('/competitions', routers.competitionsRouter);

// Static Assets
app.use('/static', express.static(path.join(__dirname, '../public')));

app.get("/", (req, res) => {
    res.redirect('https://wager.ga');
});

app.get("*", (req, res) => {
    res.status(404).json({ message: "What are you looking for ?" });
});

app.listen(3000, '0.0.0.0', () => {
    console.log("Listening on port 3000");
});