require('dotenv').config()
import express from "express";
import cors from "cors";
import config from "config";
import TestRouter from "./src/routers/test";
import TeacherRouter from "./src/routers/teacher";
import swaggerJSDoc, { Options } from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

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

const swaggerSpec = swaggerJSDoc(options);



//instância da apliacação
const app = express();

//middleware - trafegar informações em json
app.use(express.json());
///middleware - cors
app.use(cors({ 
    credentials: true,
    origin: process.env.ORIGIN_URL 
}));

app.use("/api/", TeacherRouter);

app.use("/api/", TestRouter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

//importando a porta do config
const port = config.get<number>("port");

app.listen(port, async () => {
    console.log(`App running / Port: ${port}`)
});

