const express = require("express");
const mysql = require("mysql2");
const path = require("path");
const crypto = require("crypto");
const session = require("express-session");

const app = express();
const port = 3000;

// Middleware to parse request body
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (like HTML and CSS)
app.use(express.static(path.join(__dirname, "public")));

// Configure session
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

// Database configuration
const dbConfig = {
  host: "localhost",
  user: "root",
  password: "Mtl-12345",
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

// Routes
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Login route
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

    // Hash the entered password and compare with the stored hash
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword === user.password_hash) {
      // Initialize session
      req.session.userId = user.username;
      req.session.role = user.role;
      req.session.associatedId = user.associated_id;

      console.log(`User ${username} logged in as ${user.role}.`);

      // Redirect based on role
      if (user.role === "patient") {
        return res.redirect("/patient_dashboard.html");
      } else {
        return res.redirect("/provider_dashboard.html");
      }
    } else {
      return res.status(401).send("Invalid username or password.");
    }
  });
});

// Patient data route (uses view in the database)
app.get("/patient-data", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res.status(401).send("Unauthorized: Access is restricted to patients.");
  }

  const patientId = req.session.associatedId;

  const query = `
    SELECT 
      first_name, 
      last_name, 
      date_of_birth, 
      sex, 
      address, 
      email,
      phone_number, 
      medication_name, 
      dosage, 
      visit_time, 
      reason_for_visit 
    FROM PatientDetails
    WHERE patient_id = ?;
  `;

  db.query(query, [patientId], (err, results) => {
    if (err) {
      console.error("Error executing query:", err.message);
      return res.status(500).json({ error: "Database query error" });
    }
    res.json(results);
  });
});
app.post("/update-email", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res.status(401).send("Unauthorized: Access is restricted to patients.");
  }

  const { newEmail } = req.body;
  const patientId = req.session.associatedId;

  if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
    return res.status(400).send("Invalid email address.");
  }

  const query = "CALL UpdatePatientEmail(?, ?)";
  db.query(query, [patientId, newEmail], (err) => {
    if (err) {
      console.error("Error executing procedure:", err.message);
      return res.status(500).send("Failed to update email.");
    }
    res.send("Email updated successfully.");
  });
});
app.post("/update-address", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res.status(401).send("Unauthorized: Access is restricted to patients.");
  }

  const { newAddress } = req.body;
  const patientId = req.session.associatedId;

  if (!newAddress || newAddress.trim().length === 0) {
    return res.status(400).send("Invalid address.");
  }

  const query = "CALL UpdatePatientAddress(?, ?)";
  db.query(query, [patientId, newAddress], (err) => {
    if (err) {
      console.error("Error executing procedure:", err.message);
      return res.status(500).send("Failed to update address.");
    }
    res.send("Address updated successfully.");
  });
});
app.post("/update-phone-number", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res.status(401).send("Unauthorized: Access is restricted to patients.");
  }

  const { newPhoneNumber } = req.body;
  const patientId = req.session.associatedId;

  if (!newPhoneNumber || !/^\+?\d{7,15}$/.test(newPhoneNumber)) {
    return res.status(400).send("Invalid phone number.");
  }

  const query = "CALL UpdatePatientPhoneNumber(?, ?)";
  db.query(query, [patientId, newPhoneNumber], (err) => {
    if (err) {
      console.error("Error executing procedure:", err.message);
      return res.status(500).send("Failed to update phone number.");
    }
    res.send("Phone number updated successfully.");
  });
});

// Logout route
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