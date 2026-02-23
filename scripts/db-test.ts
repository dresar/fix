
import { Pool, neonConfig } from '@neondatabase/serverless';
import dotenv from 'dotenv';
import path from 'path';
import ws from 'ws';

// Required for Node.js environment
neonConfig.webSocketConstructor = ws;

// Load .env from project root
dotenv.config({ path: path.join(process.cwd(), '.env') });

async function testConnection() {
  const DB_URL = process.env.DATABASE_URL;
  if (!DB_URL) {
    console.error('DATABASE_URL is not set in .env');
    process.exit(1);
  }

  console.log('Testing connection with @neondatabase/serverless to:', DB_URL.replace(/:[^:@]+@/, ':****@'));

  const pool = new Pool({ connectionString: DB_URL });

  try {
    console.log('Connecting...');
    const client = await pool.connect();
    console.log('Connected successfully!');
    
    try {
        const res = await client.query('SELECT current_user, version()');
        console.log('User:', res.rows[0].current_user);
        console.log('Version:', res.rows[0].version);
        
        // Check tables
        const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        ORDER BY table_name
        `);
        
        console.log('Tables in public schema:', tables.rows.map(r => r.table_name));

        // Check skills
        const skills = await client.query('SELECT id, name, "categoryId", logo_url FROM skill ORDER BY id DESC LIMIT 5');
        console.log('Recent Skills:', skills.rows);
    } finally {
        client.release();
    }
  } catch (err: any) {
    console.error('Connection failed:', err.message);
    if (err.code) console.error('Error code:', err.code);
    if (err.stack) console.error('Stack:', err.stack);
  } finally {
    await pool.end();
  }
}

testConnection();
