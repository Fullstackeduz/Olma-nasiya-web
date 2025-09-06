// server.js
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const Database = require('better-sqlite3');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const PORT = process.env.PORT || 3000;
const DB_FILE = process.env.DB_FILE || './data/olma.db';
const JWT_SECRET = process.env.JWT_SECRET || 'replace_this_secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

const db = new Database(DB_FILE);

// ensure tables exist if not migrated
const migration = fs.readFileSync(path.join(__dirname, 'migrations', 'init.sql'), 'utf8');
db.exec(migration);

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// helper: create token
function createToken(user) {
  return jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

// middleware: verify token
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'No token' });
  const token = authHeader.split(' ')[1];
  try {
    const data = jwt.verify(token, JWT_SECRET);
    req.user = data;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

/* ========== AUTH ========== */

// register
app.post('/api/auth/register', async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).json({ error: 'Missing fields' });
  const exists = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
  if (exists) return res.status(400).json({ error: 'Email already used' });
  const hash = await bcrypt.hash(password, 10);
  const stmt = db.prepare('INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)');
  const info = stmt.run(username, email, hash);
  const user = { id: info.lastInsertRowid, username, email };
  const token = createToken(user);
  res.json({ user, token });
});

// login
app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Missing fields' });
  const user = db.prepare('SELECT id, username, email, password_hash FROM users WHERE email = ?').get(email);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(400).json({ error: 'Invalid credentials' });
  const token = createToken(user);
  res.json({ user: { id: user.id, username: user.username, email: user.email }, token });
});

/* ========== DEBTORS (qarzdorlar) ========== */

// create debtor
app.post('/api/debtors', authMiddleware, (req, res) => {
  const { name, phone, amount, note, due_date } = req.body;
  if (!name || !amount) return res.status(400).json({ error: 'Missing fields' });
  const stmt = db.prepare('INSERT INTO debtors (user_id, name, phone, amount, note, due_date) VALUES (?, ?, ?, ?, ?, ?)');
  const info = stmt.run(req.user.id, name, phone || '', amount, note || '', due_date || '');
  const debtor = db.prepare('SELECT * FROM debtors WHERE id = ?').get(info.lastInsertRowid);
  res.json({ debtor });
});

// list debtors for user
app.get('/api/debtors', authMiddleware, (req, res) => {
  const rows = db.prepare('SELECT * FROM debtors WHERE user_id = ? ORDER BY created_at DESC').all(req.user.id);
  res.json({ debtors: rows });
});

// update debtor (e.g., mark paid or update amount)
app.put('/api/debtors/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const { name, phone, amount, note, due_date, status } = req.body;
  const d = db.prepare('SELECT * FROM debtors WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  db.prepare(`UPDATE debtors SET
    name = COALESCE(?, name),
    phone = COALESCE(?, phone),
    amount = COALESCE(?, amount),
    note = COALESCE(?, note),
    due_date = COALESCE(?, due_date),
    status = COALESCE(?, status)
    WHERE id = ?`).run(name, phone, amount, note, due_date, status, id);
  const updated = db.prepare('SELECT * FROM debtors WHERE id = ?').get(id);
  res.json({ debtor: updated });
});

// delete debtor
app.delete('/api/debtors/:id', authMiddleware, (req, res) => {
  const id = req.params.id;
  const d = db.prepare('SELECT * FROM debtors WHERE id = ? AND user_id = ?').get(id, req.user.id);
  if (!d) return res.status(404).json({ error: 'Not found' });
  db.prepare('DELETE FROM debtors WHERE id = ?').run(id);
  res.json({ success: true });
});

/* ========== OPTIONAL - statistics endpoint ========== */
app.get('/api/stats', authMiddleware, (req, res) => {
  const totalGiven = db.prepare('SELECT SUM(amount) as sum FROM debtors WHERE user_id = ?').get(req.user.id).sum || 0;
  const totalPaid = db.prepare('SELECT SUM(amount) as sum FROM debtors WHERE user_id = ? AND status = ?').get(req.user.id, 'paid').sum || 0;
  res.json({ totalGiven, totalPaid, outstanding: totalGiven - totalPaid });
});

/* ========== SPA fallback: serve public files ========= */
app.get('*', (req, res) => {
  // If path starts with /api, skip
  if (req.path.startsWith('/api')) return res.status(404).json({ error: 'Not found' });
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
