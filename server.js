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
    // console.log(results[0]);
    const hashedPassword = crypto
      .createHash("sha256")
      .update(password)
      .digest("hex");

    if (hashedPassword === user.password_hash) {
      req.session.actualUserId = user.user_id;
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

app.get("/patient-data", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to patients.");
  }

  const patientId = req.session.associatedId;
  const userId = req.session.actualUserId; // Assuming userId is stored in the session

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

    // Log the access to the AuditTrail table
    const auditQuery = `
      INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
      VALUES (?, ?, ?, ?, ?);
    `;
    const auditValues = [
      "PatientDetails", // Table/view name
      "SELECT", // Operation type
      `Patient ID: ${patientId}`, // Old value (context)
      null, // No new value for SELECT
      userId // The user accessing the data
    ];

    db.query(auditQuery, auditValues, auditErr => {
      if (auditErr) {
        console.error("Error logging access to AuditTrail:", auditErr.message);
        return res
          .status(500)
          .json({ error: "Failed to log access in audit trail" });
      }

      // Return the patient data
      res.json(results);
    });
  });
});

app.post("/update-email", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to patients.");
  }

  const { newEmail } = req.body;
  const patientId = req.session.associatedId;
  const userId = req.session.actualUserId;

  if (!newEmail || !/\S+@\S+\.\S+/.test(newEmail)) {
    return res.status(400).send("Invalid email address.");
  }

  const query = "CALL UpdatePatientEmail(?, ?, ?)";
  db.query(query, [patientId, newEmail, userId], err => {
    if (err) {
      console.error("Error executing procedure:", err.message);
      return res.status(500).send("Failed to update email.");
    }
    res.send("Email updated successfully.");
  });
});
app.post("/update-address", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to patients.");
  }

  const { newAddress } = req.body;
  const patientId = req.session.associatedId;
  const userId = req.session.actualUserId;

  if (!newAddress || newAddress.trim().length === 0) {
    return res.status(400).send("Invalid address.");
  }

  const query = "CALL UpdatePatientAddress(?, ?, ?)";
  db.query(query, [patientId, newAddress, userId], err => {
    if (err) {
      console.error("Error executing procedure:", err.message);
      return res.status(500).send("Failed to update address.");
    }
    res.send("Address updated successfully.");
  });
});
app.post("/update-phone-number", (req, res) => {
  if (!req.session || req.session.role !== "patient") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to patients.");
  }

  const { newPhoneNumber } = req.body;
  const patientId = req.session.associatedId;
  const userId = req.session.actualUserId;

  if (!newPhoneNumber || !/^\+?\d{7,15}$/.test(newPhoneNumber)) {
    return res.status(400).send("Invalid phone number.");
  }

  const query = "CALL UpdatePatientPhoneNumber(?, ?, ?)";
  db.query(query, [patientId, newPhoneNumber, userId], err => {
    if (err) {
      console.error("Error executing procedure:", err.message);
      return res.status(500).send("Failed to update phone number.");
    }
    res.send("Phone number updated successfully.");
  });
});

// Fetch provider data
app.get("/provider-data", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res.status(401).send("Unauthorized.");
  }

  const providerId = req.session.associatedId;
  const userId = req.session.actualUserId; // Assuming userId is stored in the session

  const query = `
    SELECT first_name, last_name, specialty, phone_number, email, facility_id
    FROM Providers WHERE provider_id = ?;
  `;

  db.query(query, [providerId], (err, results) => {
    if (err) {
      console.error("Error fetching provider data:", err.message);
      return res.status(500).json({ error: "Database error." });
    }

    // Log the access to the AuditTrail table
    const auditQuery = `
      INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
      VALUES (?, ?, ?, ?, ?);
    `;
    const auditValues = [
      "Providers", // Table name
      "SELECT", // Operation type
      `Provider ID: ${providerId}`, // Old value (context)
      null, // No new value for SELECT
      userId // The user accessing the data
    ];

    db.query(auditQuery, auditValues, auditErr => {
      if (auditErr) {
        console.error("Error logging access to AuditTrail:", auditErr.message);
        return res
          .status(500)
          .json({ error: "Failed to log access in audit trail" });
      }

      // Return the provider data
      res.json(results);
    });
  });
});

app.get("/provider-visits", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res.status(401).send("Unauthorized.");
  }

  const providerId = req.session.associatedId;
  const userId = req.session.actualUserId; // Assuming userId is stored in the session

  const query = `
    SELECT visit_id, patient_id, visit_time, discharge_time, reason_for_visit, triage_level, facility_id, billing_id
    FROM Visits WHERE provider_id = ?;
  `;

  db.query(query, [providerId], (err, results) => {
    if (err) {
      console.error("Error fetching visits:", err.message);
      return res.status(500).json({ error: "Database error." });
    }

    // Log the access to the AuditTrail table
    const auditQuery = `
      INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
      VALUES (?, ?, ?, ?, ?);
    `;
    const auditValues = [
      "Visits", // Table name
      "SELECT", // Operation type
      `Provider ID: ${providerId}`, // Old value (context)
      null, // No new value for SELECT
      userId // The user accessing the data
    ];

    db.query(auditQuery, auditValues, auditErr => {
      if (auditErr) {
        console.error("Error logging access to AuditTrail:", auditErr.message);
        return res
          .status(500)
          .json({ error: "Failed to log access in audit trail" });
      }

      // Return the visit data
      res.json(results);
    });
  });
});

// Fetch prescriptions for a patient
app.get("/prescriptions", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to providers.");
  }

  const patientId = req.query.patient_id;
  const providerId = req.session.associatedId;
  const userId = req.session.actualUserId;

  if (!patientId) {
    return res.status(400).send("Patient ID is required.");
  }

  const query = "CALL GetPrescriptionsByPatientAndProvider(?, ?, ?)";

  db.query(query, [patientId, providerId, userId], (err, results) => {
    if (err) {
      console.error("Error fetching prescriptions:", err.message);
      return res.status(500).json({ error: "Database error." });
    }

    // Stored procedures return results in an array, first index contains the result set
    res.json(results[0]);
  });
});

// Add a new prescription
app.post("/prescriptions", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to providers.");
  }

  const { visit_id, medication_name, dosage } = req.body;
  const providerId = req.session.associatedId;
  const userId = req.session.actualUserId;

  if (!visit_id || !medication_name || !dosage) {
    return res
      .status(400)
      .send("Visit ID, medication name, and dosage are required.");
  }

  const query = "CALL AddPrescription(?, ?, ?, ?, ?)";

  db.query(
    query,
    [visit_id, providerId, medication_name, dosage, userId],
    (err, results) => {
      if (err) {
        console.error("Error adding prescription:", err.message);
        if (err.code === "ER_SIGNAL_EXCEPTION") {
          return res.status(403).send(err.sqlMessage);
        }
        return res.status(500).send("Failed to add prescription.");
      }
      res.send("Prescription added successfully.");
    }
  );
});

// Update prescription
app.put("/prescriptions/:id", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to providers.");
  }

  const prescriptionId = req.params.id;
  const { medication_name, dosage } = req.body;
  const providerId = req.session.associatedId;
  const userId = req.session.actualUserId;

  if (!medication_name || !dosage) {
    return res.status(400).send("Medication name and dosage are required.");
  }

  const query = "CALL UpdatePrescription(?, ?, ?, ?, ?)";

  db.query(
    query,
    [prescriptionId, providerId, medication_name, dosage, userId],
    (err, results) => {
      if (err) {
        console.error("Error updating prescription:", err.message);

        // Handle custom error from SIGNAL
        if (err.code === "ER_SIGNAL_EXCEPTION") {
          return res.status(403).send(err.sqlMessage);
        }

        return res.status(500).send("Failed to update prescription.");
      }

      res.send("Prescription updated successfully.");
    }
  );
});

// Delete prescription
app.delete("/prescriptions/:id", (req, res) => {
  if (!req.session || req.session.role !== "provider") {
    return res
      .status(401)
      .send("Unauthorized: Access is restricted to providers.");
  }

  const prescriptionId = req.params.id;
  const providerId = req.session.associatedId;
  const userId = req.session.actualUserId;

  const query = "CALL DeletePrescription(?, ?, ?)";

  db.query(query, [prescriptionId, providerId, userId], err => {
    if (err) {
      console.error("Error deleting prescription:", err.message);

      // Handle custom error from SIGNAL
      if (err.code === "ER_SIGNAL_EXCEPTION") {
        return res.status(403).send(err.sqlMessage);
      }

      return res.status(500).send("Failed to delete prescription.");
    }

    res.send("Prescription deleted successfully.");
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
