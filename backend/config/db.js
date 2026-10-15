import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';

let pool = null;

const dbState = {
  isConnectedToMySQL: false,
  engine: 'file_storage',
  connectionHost: '',
  databaseName: '',
  errorMessage: null,
};

// Storage directory for persistent fallback
const STORAGE_DIR = path.resolve(process.cwd(), '.data');
const STORAGE_FILE = path.join(STORAGE_DIR, 'tasks.json');

const INITIAL_SEED_TASKS = [
  {
    id: 'task-seed-1',
    title: 'Initialize MySQL Schema & Tables',
    description: 'Set up relational tables with indexing on status, priority, and dates.',
    priority: 'High',
    status: 'Completed',
    dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-seed-2',
    title: 'Build Express MySQL Connection Pool',
    description: 'Configure mysql2 connection pool with parameterized query execution.',
    priority: 'High',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-seed-3',
    title: 'Design Responsive Dashboard UI',
    description: 'Implement KPI stat cards, completion rates, priority distribution, and clean tabular layout.',
    priority: 'Medium',
    status: 'In Progress',
    dueDate: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-seed-4',
    title: 'Conduct End-to-End API and Validation Testing',
    description: 'Verify status code responses, missing title rejections, sorting algorithms, and filter states.',
    priority: 'Medium',
    status: 'Pending',
    dueDate: new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-seed-5',
    title: 'Review Overdue Project Milestones',
    description: 'Audit tasks past their expected delivery date and adjust resource allocations accordingly.',
    priority: 'High',
    status: 'Pending',
    dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: 'task-seed-6',
    title: 'Prepare Production Deployment Checklist',
    description: 'Configure environment variables, secure CORS headers, and document connection options.',
    priority: 'Low',
    status: 'Pending',
    dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
  },
];

export function readFallbackStorage() {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    if (!fs.existsSync(STORAGE_FILE)) {
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(INITIAL_SEED_TASKS, null, 2), 'utf-8');
      return INITIAL_SEED_TASKS;
    }
    const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SEED_TASKS;
  } catch (err) {
    console.error('Error reading fallback storage, using default seeds:', err);
    return INITIAL_SEED_TASKS;
  }
}

export function writeFallbackStorage(tasks) {
  try {
    if (!fs.existsSync(STORAGE_DIR)) {
      fs.mkdirSync(STORAGE_DIR, { recursive: true });
    }
    fs.writeFileSync(STORAGE_FILE, JSON.stringify(tasks, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing fallback storage:', err);
  }
}

/**
 * Initialize MySQL Connection Pool and Auto-Create Tasks Table
 */
export async function connectDB() {
  const mysqlUrl = process.env.MYSQL_URL || process.env.DATABASE_URL;
  const host = process.env.MYSQL_HOST;
  const user = process.env.MYSQL_USER;
  const password = process.env.MYSQL_PASSWORD;
  const database = process.env.MYSQL_DATABASE || 'taskflow';
  const port = parseInt(process.env.MYSQL_PORT || '3306', 10);

  // If no MySQL configuration is provided at all
  if (!mysqlUrl && !host) {
    console.log('ℹ️ MySQL configuration not found in environment. Running with local persistent storage.');
    dbState.isConnectedToMySQL = false;
    dbState.engine = 'file_storage';
    dbState.connectionHost = 'Local Persistent Storage (.data/tasks.json)';
    readFallbackStorage();
    return dbState;
  }

  try {
    console.log(`Connecting to MySQL database...`);
    const poolConfig = mysqlUrl
      ? { uri: mysqlUrl, waitForConnections: true, connectionLimit: 10, queueLimit: 0, connectTimeout: 5000 }
      : {
          host: host || 'localhost',
          user: user || 'root',
          password: password || '',
          database,
          port,
          waitForConnections: true,
          connectionLimit: 10,
          queueLimit: 0,
          connectTimeout: 5000,
        };

    pool = mysql.createPool(poolConfig);

    // Test connection with a quick query
    const [rows] = await pool.query('SELECT 1 as connected');

    // Auto-create table if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tasks (
        id VARCHAR(64) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        priority ENUM('Low', 'Medium', 'High') DEFAULT 'Medium',
        status ENUM('Pending', 'In Progress', 'Completed') DEFAULT 'Pending',
        dueDate DATETIME NULL,
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_status (status),
        INDEX idx_priority (priority),
        INDEX idx_due_date (dueDate),
        INDEX idx_created_at (createdAt)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    `);

    dbState.isConnectedToMySQL = true;
    dbState.engine = 'mysql';
    dbState.connectionHost = host || (mysqlUrl ? 'MySQL Connection URL' : 'localhost:3306');
    dbState.databaseName = database;
    dbState.errorMessage = null;

    console.log(`MySQL Connected successfully! Table 'tasks' is ready.`);
    return dbState;
  } catch (error) {
    console.error(`MySQL Connection Error: ${error.message}`);
    console.log('⚠️ Falling back to persistent local storage so the application remains operational.');
    dbState.isConnectedToMySQL = false;
    dbState.engine = 'file_storage';
    dbState.connectionHost = 'Local Persistent Storage (MySQL offline)';
    dbState.errorMessage = error.message;
    readFallbackStorage();
    return dbState;
  }
}

export function getDbStatus() {
  return { ...dbState };
}

export function getMySQLPool() {
  return pool;
}

export default connectDB;
