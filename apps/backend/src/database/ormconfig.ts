// src/database/ormconfig.ts
import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 5432),
  username: process.env.DB_USER ?? 'postgres',
  password: process.env.DB_PASS ?? 'postgres',
  database: process.env.DB_NAME ?? 'ems_db',

  entities: [join(__dirname, 'entities', '**/*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],

  synchronize: false,
  logging: true,
});

export default dataSource;
