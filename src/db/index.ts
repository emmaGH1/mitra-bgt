import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pkg;

// Helper to determine if the PostgreSQL database variables are fully configured
export function isDbConfigured(): boolean {
  return !!(
    process.env.SQL_HOST &&
    process.env.SQL_USER &&
    process.env.SQL_PASSWORD &&
    process.env.SQL_DB_NAME
  );
}

let dbInstance: any = null;
let poolInstance: any = null;

export function getDb() {
  if (!isDbConfigured()) {
    return null;
  }

  if (!dbInstance) {
    try {
      poolInstance = new Pool({
        host: process.env.SQL_HOST,
        user: process.env.SQL_USER,
        password: process.env.SQL_PASSWORD,
        database: process.env.SQL_DB_NAME,
        connectionTimeoutMillis: 15000,
      });

      poolInstance.on('error', (err: any) => {
        console.error('Unexpected error on idle SQL pool client:', err);
      });

      dbInstance = drizzle(poolInstance, { schema });
      console.log('Successfully connected to Cloud SQL via Drizzle');
    } catch (error) {
      console.error('Failed to initialize Drizzle database connection:', error);
      dbInstance = null;
    }
  }

  return dbInstance;
}

export { schema };
