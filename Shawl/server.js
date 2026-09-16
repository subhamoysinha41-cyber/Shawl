const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const db = require("./database");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "shawl-development-secret";
const clientDist = path.join(__dirname, "client-dist");
const id = () => crypto.randomUUID();
const now = () => new Date().toISOString();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Access token missing" });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token" });
  }
}

app.get("/api/health", (req, res) =>
  res.json({ status: "ok", database: "sqlite" }),
);

app.post("/api/auth/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password)
    return res
      .status(400)
      .json({ message: "Username, email, and password are required" });
  if (password.length < 6)
    return res
      .status(400)
      .json({ message: "Password must contain at least 6 characters" });
  const exists = db
    .prepare("SELECT id FROM users WHERE email = ? OR username = ?")
    .get(email.trim(), username.trim());
  if (exists)
    return res
      .status(409)
      .json({ message: "Username or email is already registered" });

  const user = {
    id: id(),
    username: username.trim(),
    email: email.trim().toLowerCase(),
    password: await bcrypt.hash(password, 10),
    createdAt: now(),
  };
  db.prepare(
    "INSERT INTO users (id, username, email, password, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(user.id, user.username, user.email, user.password, user.createdAt);
  res.status(201).json({ message: "User account created successfully" });
});

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get((email || "").trim().toLowerCase());
  if (!user || !(await bcrypt.compare(password || "", user.password)))
    return res.status(401).json({ message: "Invalid account credentials" });
  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, {
    expiresIn: "2h",
  });
  res.json({ token, username: user.username });
});

app.get("/api/tasks", authenticateToken, (req, res) => {
  const tasks = db
    .prepare(
      "SELECT id AS _id, title, description, completed, created_at AS createdAt FROM tasks WHERE user_id = ? ORDER BY created_at DESC",
    )
    .all(req.user.id)
    .map((task) => ({ ...task, completed: Boolean(task.completed) }));
  res.json(tasks);
});

app.post("/api/tasks", authenticateToken, (req, res) => {
  const title = req.body.title?.trim();
  const description = req.body.description?.trim() || "";
  if (!title)
    return res.status(400).json({ message: "Task title is required" });
  const task = { id: id(), title, description, createdAt: now() };
  db.prepare(
    "INSERT INTO tasks (id, user_id, title, description, completed, created_at) VALUES (?, ?, ?, ?, 0, ?)",
  ).run(task.id, req.user.id, task.title, task.description, task.createdAt);
  res.status(201).json({ _id: task.id, ...task, completed: false });
});

app.put("/api/tasks/:id", authenticateToken, (req, res) => {
  const task = db
    .prepare("SELECT id FROM tasks WHERE id = ? AND user_id = ?")
    .get(req.params.id, req.user.id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  if (typeof req.body.completed === "boolean")
    db.prepare("UPDATE tasks SET completed = ? WHERE id = ?").run(
      req.body.completed ? 1 : 0,
      req.params.id,
    );
  if (typeof req.body.title === "string")
    db.prepare("UPDATE tasks SET title = ? WHERE id = ?").run(
      req.body.title.trim(),
      req.params.id,
    );
  if (typeof req.body.description === "string")
    db.prepare("UPDATE tasks SET description = ? WHERE id = ?").run(
      req.body.description.trim(),
      req.params.id,
    );
  const updated = db
    .prepare(
      "SELECT id AS _id, title, description, completed, created_at AS createdAt FROM tasks WHERE id = ?",
    )
    .get(req.params.id);
  res.json({ ...updated, completed: Boolean(updated.completed) });
});

app.delete("/api/tasks/:id", authenticateToken, (req, res) => {
  const result = db
    .prepare("DELETE FROM tasks WHERE id = ? AND user_id = ?")
    .run(req.params.id, req.user.id);
  if (!result.changes)
    return res.status(404).json({ message: "Task not found" });
  res.json({ message: "Task successfully removed" });
});

app.post("/api/messages", (req, res) => {
  const { name, email, subject, message } = req.body;
  if (!name || !email || !subject || !message)
    return res.status(400).json({ message: "All contact fields are required" });
  db.prepare(
    "INSERT INTO messages (id, name, email, subject, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
  ).run(id(), name.trim(), email.trim(), subject.trim(), message.trim(), now());
  res.status(201).json({ message: "Message sent successfully" });
});

app.post("/api/comments", (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message)
    return res
      .status(400)
      .json({ message: "Name, email, and comment are required" });
  db.prepare(
    "INSERT INTO comments (id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?)",
  ).run(id(), name.trim(), email.trim(), message.trim(), now());
  res.status(201).json({ message: "Comment posted successfully" });
});

if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get("*", (req, res) => res.sendFile(path.join(clientDist, "index.html")));
} else {
  app.use(express.static(__dirname));
}

app.listen(PORT, () =>
  console.log(`Shawl full-stack server running at http://localhost:${PORT}`),
);
