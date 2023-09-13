const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const dbPath = path.resolve(__dirname, "../database/database.sqlite");
const db = new sqlite3.Database(dbPath);
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require('cors');

//admin auth
const admin = {
  username: "admin",
  password: "admin123",
};



db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS employees (id INTEGER PRIMARY KEY, name TEXT, hourly_rate REAL)"
  );
});
const app = express();
app.use(cors());
app.use(express.json()); // For parsing JSON

// Add an employee
app.post("/add-employee", (req, res) => {
  const { name, hourly_rate } = req.body;
  db.run(
    `INSERT INTO employees (name, hourly_rate) VALUES (?, ?)`,
    [name, hourly_rate],
    function (err) {
      if (err) return res.status(400).json({ error: err.message });
      res.json({ id: this.lastID });
    }
  );
});

// Delete an employee
app.delete("/delete-employee/:id", (req, res) => {
  db.run(`DELETE FROM employees WHERE id = ?`, req.params.id, function (err) {
    if (err) return res.status(400).json({ error: err.message });
    res.json({ deleted: this.changes });
  });
});


app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
  });


// Generate JWT token
app.post("/admin-login", (req, res) => {
    const { username, password } = req.body;
    if (username === admin.username && password === admin.password) {
      const token = jwt.sign({ username }, "supersecret", { expiresIn: "1h" });
      return res.json({ token });
    } else {
      return res.status(401).json({ error: "Invalid credentials" });
    }
  });

  app.put('/update-employee/:id', (req, res) => {
    const { name, hourly_rate } = req.body;
    db.run(`UPDATE employees SET name = ?, hourly_rate = ? WHERE id = ?`, [name, hourly_rate, req.params.id], function(err) {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ changes: this.changes });
    });
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
