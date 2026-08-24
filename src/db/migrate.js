const db = require('./database');

const migrations = [
  // Users table
  `CREATE TABLE IF NOT EXISTS users (
    id ${db.isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT ${db.isPostgres ? 'NOW()' : "CURRENT_TIMESTAMP"}
  )`,

  // Index on email
  `CREATE INDEX IF NOT EXISTS idx_email ON users(email)`,

  // Todos table
  `CREATE TABLE IF NOT EXISTS todos (
    id ${db.isPostgres ? 'SERIAL PRIMARY KEY' : 'INTEGER PRIMARY KEY AUTOINCREMENT'},
    user_id INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL CHECK (length(title) > 0 AND length(title) <= 255),
    description TEXT,
    completed BOOLEAN DEFAULT ${db.isPostgres ? 'FALSE' : '0'},
    priority VARCHAR(20) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    created_at TIMESTAMP DEFAULT ${db.isPostgres ? 'NOW()' : "CURRENT_TIMESTAMP"},
    updated_at TIMESTAMP DEFAULT ${db.isPostgres ? 'NOW()' : "CURRENT_TIMESTAMP"},
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Indexes for todos
  `CREATE INDEX IF NOT EXISTS idx_user_id ON todos(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_completed ON todos(completed)`,
  `CREATE INDEX IF NOT EXISTS idx_priority ON todos(priority)`,
  `CREATE INDEX IF NOT EXISTS idx_created_at ON todos(created_at)`
];

async function migrate() {
  console.log('Running migrations...');

  try {
    for (const migration of migrations) {
      await db.run(migration);
      console.log('✓ Migration executed');
    }
    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await db.close();
  }
}

// Run migrations if this file is executed directly
if (require.main === module) {
  migrate();
}

module.exports = { migrate };
