// db.js - run `node db.js` or `npm run migrate`
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const env = require('dotenv').config();
const DB_FILE = process.env.DB_FILE || './data/olma.db';
const MIGRATION_SQL = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf8');

const dir = path.dirname(DB_FILE);
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

const db = new Database(DB_FILE);
db.exec(MIGRATION_SQL);

console.log('Database initialized at', DB_FILE);
db.close();
