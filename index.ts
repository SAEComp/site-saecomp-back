require('@dotenvx/dotenvx').config();
import express from "express";
import cors from "cors";
import config from "config";
import TestRouter from "./src/routes/test";
import TeacherRouter from "./src/routes/teacher";

//instância da apliacação
const app = express();

//middleware - trafegar informações em json
app.use(express.json());
///middleware - cors
app.use(cors({ 
    credentials: true,
    origin: process.env.ORIGIN_URL 
}));

app.use("/api/", TestRouter);
app.use("/api/teacher", TeacherRouter);

//importando a porta do config
const port = config.get<number>("port");

app.listen(port, async () => {
    console.log(`App running / Port: ${port}`)
});

