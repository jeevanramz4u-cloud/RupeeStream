import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

// Global database availability flag
export let isDatabaseAvailable = false;

// Configure WebSocket for serverless environment
neonConfig.webSocketConstructor = ws;

let pool: Pool | null = null;
let db: any = null;

// Initialize database connection only if DATABASE_URL is available
if (process.env.DATABASE_URL) {
  try {
    // Create connection pool with enhanced error handling
    pool = new Pool({ 
      connectionString: process.env.DATABASE_URL,
      max: 3, // Minimal pool size to prevent overload
      idleTimeoutMillis: 10000, // Short timeout
      connectionTimeoutMillis: 3000, // Very short timeout
      allowExitOnIdle: true, // Allow graceful shutdown
    });

    // Enhanced error handling for database connection
    pool.on('error', (err: Error) => {
      console.log('Database pool error - switching to demo mode:', err.message);
      isDatabaseAvailable = false;
    });

    db = drizzle({ client: pool, schema });
    console.log('Database connection initialized');
  } catch (error) {
    console.log('Database initialization failed - using demo mode');
    isDatabaseAvailable = false;
  }
} else {
  console.log('No DATABASE_URL found - using demo mode');
  isDatabaseAvailable = false;
}

export { db };

// Test connection and handle gracefully  
export async function testConnection() {
  if (!pool || !db) {
    console.log('Database not initialized - using demo mode');
    isDatabaseAvailable = false;
    return false;
  }

  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    console.log('✅ Database connection successful');
    isDatabaseAvailable = true;
    return true;
  } catch (error) {
    console.log('❌ Database connection failed - continuing with demo mode');
    isDatabaseAvailable = false;
    return false;
  }
}

// Safe database wrapper that prevents crashes
export async function safeDbOperation<T>(operation: () => Promise<T>, fallback: T): Promise<T> {
  if (!isDatabaseAvailable) {
    return fallback;
  }
  
  try {
    return await operation();
  } catch (error) {
    console.log('Database operation failed, using fallback');
    isDatabaseAvailable = false; // Mark as unavailable for future operations
    return fallback;
  }
}