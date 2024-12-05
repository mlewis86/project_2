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
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, httpOnly: true, maxAge: 1000 * 60 * 60 }
  })
);

// Database configuration
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
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword === user.password_hash) {
      req.session.userId = user.username;
      req.session.role = user.role;
      req.session.associatedId = user.associated_id;
      return res.redirect(
        user.role === "patient"
          ? "/patient_dashboard.html"
          : "/provider_dashboard.html"
      );
    } else {
      return res.status(401).send("Invalid username or password.");
    }
  });
});

// Fetch provider data
app.get("/provider-data", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res.status(401).send("Unauthorized.");
  }

  const providerId = req.session.associatedId;
  const query = `
    SELECT first_name, last_name, specialty, phone_number, email, facility_id
    FROM Providers WHERE provider_id = ?;
  `;
  db.query(query, [providerId], (err, results) => {
    if (err) {
      console.error("Error fetching provider data:", err.message);
      return res.status(500).json({ error: "Database error." });
    }
    res.json(results);
  });
});

// Fetch visits for provider
app.get("/provider-visits", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res.status(401).send("Unauthorized.");
  }

  const providerId = req.session.associatedId;
  const query = `
    SELECT visit_id, patient_id, visit_time, discharge_time, reason_for_visit, triage_level, facility_id, billing_id
    FROM Visits WHERE provider_id = ?;
  `;
  db.query(query, [providerId], (err, results) => {
    if (err) {
      console.error("Error fetching visits:", err.message);
      return res.status(500).json({ error: "Database error." });
    }
    res.json(results);
  });
});

// Fetch prescriptions for a patient
app.get("/prescriptions", (req, res) => {
  const patientId = req.query.patient_id;
  const providerId = req.session.associatedId;

  const query = `
    SELECT Prescriptions.prescription_id, Prescriptions.medication_name, Prescriptions.dosage,
           Providers.first_name AS provider_first_name, Providers.last_name AS provider_last_name,
           Visits.visit_time, Visits.reason_for_visit
    FROM Prescriptions
    JOIN Visits ON Prescriptions.visit_id = Visits.visit_id
    JOIN Providers ON Prescriptions.provider_id = Providers.provider_id
    WHERE Visits.patient_id = ? AND Providers.provider_id = ?;
  `;
  db.query(query, [patientId, providerId], (err, results) => {
    if (err) {
      console.error("Error fetching prescriptions:", err.message);
      return res.status(500).json({ error: "Database error." });
    }
    res.json(results);
  });
});

// Add a new prescription
app.post("/prescriptions", (req, res) => {
  const { visit_id, medication_name, dosage } = req.body;
  const providerId = req.session.associatedId;

  const query = `
    SELECT * FROM Visits WHERE visit_id = ? AND provider_id = ?;
  `;
  db.query(query, [visit_id, providerId], (err, results) => {
    if (err) {
      console.error("Error verifying visit:", err.message);
      return res.status(500).send("Database error.");
    }

    if (results.length === 0) {
      return res
        .status(403)
        .send("Unauthorized to add prescription for this visit.");
    }

    const insertQuery = `
      INSERT INTO Prescriptions (visit_id, provider_id, medication_name, dosage)
      VALUES (?, ?, ?, ?);
    `;
    db.query(
      insertQuery,
      [visit_id, providerId, medication_name, dosage],
      err => {
        if (err) {
          console.error("Error adding prescription:", err.message);
          return res.status(500).send("Failed to add prescription.");
        }
        res.send("Prescription added successfully.");
      }
    );
  });
});

// Update prescription
app.put("/prescriptions/:id", (req, res) => {
  const prescriptionId = req.params.id;
  const { medication_name, dosage } = req.body;
  const providerId = req.session.associatedId;

  const query = `
    SELECT * FROM Prescriptions WHERE prescription_id = ? AND provider_id = ?;
  `;
  db.query(query, [prescriptionId, providerId], (err, results) => {
    if (err) {
      console.error("Error verifying prescription:", err.message);
      return res.status(500).send("Database error.");
    }

    if (results.length === 0) {
      return res.status(403).send("Unauthorized to update this prescription.");
    }

    const updateQuery = `
      UPDATE Prescriptions SET medication_name = ?, dosage = ? WHERE prescription_id = ?;
    `;
    db.query(updateQuery, [medication_name, dosage, prescriptionId], err => {
      if (err) {
        console.error("Error updating prescription:", err.message);
        return res.status(500).send("Failed to update prescription.");
      }
      res.send("Prescription updated successfully.");
    });
  });
});

// Delete prescription
app.delete("/prescriptions/:id", (req, res) => {
  const prescriptionId = req.params.id;
  const providerId = req.session.associatedId;

  const query = `
    SELECT * FROM Prescriptions WHERE prescription_id = ? AND provider_id = ?;
  `;
  db.query(query, [prescriptionId, providerId], (err, results) => {
    if (err) {
      console.error("Error verifying prescription:", err.message);
      return res.status(500).send("Database error.");
    }

    if (results.length === 0) {
      return res.status(403).send("Unauthorized to delete this prescription.");
    }

    const deleteQuery = `
      DELETE FROM Prescriptions WHERE prescription_id = ?;
    `;
    db.query(deleteQuery, [prescriptionId], err => {
      if (err) {
        console.error("Error deleting prescription:", err.message);
        return res.status(500).send("Failed to delete prescription.");
      }
      res.send("Prescription deleted successfully.");
    });
  });
});

app.post("/logout", (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send("Failed to log out.");
    }
    res.redirect("/");
  });
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
