import express from "express";
import { Low } from "lowdb";
import { JSONFile } from "lowdb/node";
import { nanoid } from "nanoid";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Lowdb setup
const adapter = new JSONFile("db.json");
const db = new Low(adapter, { users: [] });
await db.read();

// Default data
db.data ||= { users: [] };

// 📌 Register
app.post("/register", async (req, res) => {
  const { user, email, password } = req.body;

  if (db.data.users.find(u => u.email === email)) {
    return res.status(400).json({ message: "Email allaqachon mavjud" });
  }

  const newUser = { id: nanoid(), user, email, password };
  db.data.users.push(newUser);
  await db.write();

  res.json({ message: "Ro‘yxatdan muvaffaqiyatli o‘tdingiz", user: newUser });
});

// 📌 Login
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = db.data.users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ message: "Email yoki parol xato" });
  }

  res.json({ message: "Kirish muvaffaqiyatli", user });
});

// 📌 Users ro‘yxati (test uchun)
app.get("/users", async (req, res) => {
  res.json(db.data.users);
});

app.listen(PORT, () => {
  console.log(`✅ Server http://localhost:${PORT} da ishlayapti`);
});
