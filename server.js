const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const crypto = require("crypto");

const app = express();
const port = 3000;

const session = require("express-session");

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "your_secret_key", // Replace with a secure key for production
    resave: false, // Prevent resaving session if unmodified
    saveUninitialized: false, // Don't save uninitialized sessions
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true, // Prevent client-side JS from accessing the cookie
      maxAge: 1000 * 60 * 60 // 1 hour
    }
  })
);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const dbConfig = {
  host: "localhost",
  user: "root",
  password: "password",
  database: "Emergency_Department"
};

const db = mysql.createConnection(dbConfig);

db.connect(err => {
  if (err) {
    console.error("Error connecting to the database:", err.message);
    process.exit(1);
  } else {
    console.log("Connected to the database.");
  }
});

app.get("/patients", (req, res) => {
  if (!req.session || !req.session.userId) {
    return res.status(401).send("Unauthorized: Please log in first.");
  }

  const query = "SELECT * FROM Patients";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      res.status(500).json({ error: "Database query error" });
    } else {
      res.json(results);
    }
  });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  const query = "SELECT * FROM Users WHERE username = ?";
  db.query(query, [username], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      return res.status(500).send("Internal Server Error");
    }

    if (results.length === 0) {
      return res.status(401).send("Invalid username or password.");
    }

    const user = results[0];

    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword === user.password_hash) {
      // Initialize session
      req.session.userId = user.username; // Use `username` if no `userId` field
      req.session.role = user.role;
      req.session.associatedId = user.associated_id;

      console.log(`User ${username} logged in as ${user.role}.`);
      return res.redirect("/patients");
    } else {
      return res.status(401).send("Invalid username or password.");
    }
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Failed to log out");
    }
    res.redirect("/"); // Redirect to the login page
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
