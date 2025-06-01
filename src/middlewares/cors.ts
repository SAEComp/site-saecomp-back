import cors from 'cors';

const allowedOrigins = [
    "http://localhost:5173",
    "http://saecomp.icmc.usp.br",
    "https://saecomp.icmc.usp.br",
];

const corsMiddleware = cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    }
});

export default corsMiddleware;
