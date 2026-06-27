import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import * as schema from './schema.ts';

const { Pool } = pkg;

// Helper to determine if the PostgreSQL database variables are fully configured
export function isDbConfigured(): boolean {
  return !!(
    process.env.DATABASE_URL ||
    (process.env.SQL_HOST &&
      process.env.SQL_USER &&
      process.env.SQL_PASSWORD &&
      process.env.SQL_DB_NAME)
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
      const poolConfig: any = {
        connectionTimeoutMillis: 15000,
      };

      if (process.env.DATABASE_URL) {
        poolConfig.connectionString = process.env.DATABASE_URL;
        // For serverless databases like Neon, we might need SSL
        poolConfig.ssl = {
          rejectUnauthorized: false,
        };
      } else {
        poolConfig.host = process.env.SQL_HOST;
        poolConfig.user = process.env.SQL_USER;
        poolConfig.password = process.env.SQL_PASSWORD;
        poolConfig.database = process.env.SQL_DB_NAME;
      }

      poolInstance = new Pool(poolConfig);

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
