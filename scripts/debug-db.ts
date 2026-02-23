import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL?.includes('neon.tech') ? { rejectUnauthorized: false } : undefined,
});

async function check() {
  console.log('Connecting to DB...');
  try {
    const client = await pool.connect();
    console.log('Connected!');
    
    try {
      console.log('Checking tables...');
      const res = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'`);
      console.log('Tables:', res.rows.map(r => r.table_name));
      
      console.log('Checking columns in project...');
      const cols = await client.query(`SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'project'`);
      console.log('Columns:', cols.rows);
      
      console.log('Attempting ALTER TABLE...');
      await client.query(`ALTER TABLE project ADD COLUMN IF NOT EXISTS "summaries" text DEFAULT '[]'`);
      console.log('ALTER TABLE success!');
      
    } catch (e) {
      console.error('Query failed:', e);
    } finally {
      client.release();
    }
  } catch (e) {
    console.error('Connection failed:', e);
  } finally {
    await pool.end();
  }
}

check();
