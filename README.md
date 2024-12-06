# project_2# Emergency Department Database System (Project 2)

## Overview
This project simulates an Emergency Department (ED) database system, incorporating patient and provider data, visits, prescriptions, and audit trails. It uses Node.js, Express, and a MySQL database, and provides separate web interfaces for patients and providers. Patients can view and update their personal information, while providers can view patient visits and manage prescriptions.

## Features
- **User Authentication:** Patients and providers log in with credentials stored in the database.  
- **Role-Based Access:**  
  - **Patients:** Can view their info, update email/address/phone, and see prescriptions.  
  - **Providers:** Can view their patients’ visits and manage prescriptions (add, update, delete).
- **Stored Procedures:** Central logic for updating patient info and managing prescriptions is encapsulated in MySQL stored procedures.
- **Audit Trail:** Every data access or modification via the GUI is logged, detailing who made the change, when, and what changed.
- **Views:** Predefined database views for simplified data retrieval and reporting.

## Project Structure

project_2/
├─ server.js                # Node.js/Express server
├─ project2Tables.sql       # SQL for creating tables
├─ project2Views.sql        # SQL for creating views
├─ project2Procedures.sql   # SQL for creating stored procedures
├─ project2TestData.sql     # SQL for inserting initial test data
├─ package.json
├─ package-lock.json
├─ node_modules/
└─ public/
   ├─ index.html            # Login page
   ├─ patient_dashboard.html # Patient dashboard
   ├─ provider_dashboard.html # Provider dashboard

## Prerequisites
- **Node.js** (v14+ recommended)
- **MySQL** or **MariaDB**
- **npm** (comes with Node.js)

You need a MySQL user with permissions to create databases, tables, procedures, and views.

## Database Setup

1. **Create the Database:**
   ```bash
   mysql -u root -p

once login 
   ```sql 
      CREATE DATABASE Emergency_Department;
      USE Emergency_Department;

2. **Import SQL Files in Order:**

SOURCE /path/to/project2Tables.sql;
SOURCE /path/to/project2Views.sql;
SOURCE /path/to/project2Procedures.sql;
SOURCE /path/to/project2TestData.sql;
 
 this will  
 * Create all tables, views, and stored procedures.
 * Insert sample data including patients, providers, and visits.

3. **Verify**
 ```sql 
    SHOW TABLES;
    PROCEDURE STATUS WHERE Db='Emergency_Department'; ```

## Configuration

In server.js, ensure the database credentials match your MySQL setup:

  ```javascript

  const dbConfig = {
    host: "localhost",
    user: "root",
    password: "your_password_here",
    database: "Emergency_Department"
  }; ```

If you change credentials or database names, update these accordingly.

## Installing and Running ##

1. **Install Dependencies:**
   ```bash
   cd project_2
   npm install
   `
2. Start the Server:
   ```bash 
   node server.js
   `
 The server typically runs on http://localhost:3000. Adjust the port in server.js if necessary.

3. Access the Application:
* Open your browser and visit:
http://localhost:3000
* Use the provided test credentials (from project2TestData.sql) to log in as a patient or a provider.
## Usage

* Login (index.html): Enter your username and password (check Users table from test data).
* Patient Dashboard (patient_dashboard.html):
- View personal data.
- Update email, address, phone number.
- View prescriptions.
* Provider Dashboard (provider_dashboard.html):
- View visits associated with the provider.
- Add, update, or delete prescriptions for 
patients under care.

All updates and database accesses are logged in the AuditTrail table.

## Security and Auditing

* Passwords are stored as hashes (SHA-256).
* Access is controlled by role-based logic.
* The AuditTrail table logs SELECTs, INSERTs, UPDATEs, and DELETEs triggered by the GUI.

## Customization

* Add more stored procedures or views as needed.
* Adjust the HTML/CSS for a more polished UI.
* Integrate HTTPS or run behind Nginx/Apache if deploying to production.

## References

* MySQL Documentation: https://dev.mysql.com/doc/
* Node.js: https://nodejs.org/
* Express.js: https://expressjs.com/