import { Pool } from 'pg';


const poolConfig = {
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5433),
  user: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASSWORD ?? 'postgres',
  database: process.env.DB_NAME ?? 'saecomp',
  ssl: false,
  max: 6
};

const pool = new Pool(poolConfig);

export default pool;