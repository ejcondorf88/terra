import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { UserEntity } from './users/user.entity';

const databaseUrl = process.env.DATABASE_URL;

export default new DataSource(
  databaseUrl
    ? {
        type: 'postgres',
        url: databaseUrl,
        entities: [UserEntity],
        migrations: ['src/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: false,
      }
    : {
        type: 'postgres',
        host: process.env.POSTGRES_HOST || 'localhost',
        port: Number(process.env.POSTGRES_PORT) || 5432,
        username: process.env.POSTGRES_USER || 'postgres',
        password: process.env.POSTGRES_PASSWORD || 'postgres',
        database: process.env.POSTGRES_DB || 'terra_go',
        entities: [UserEntity],
        migrations: ['src/migrations/*{.ts,.js}'],
        synchronize: false,
        logging: false,
      },
);
