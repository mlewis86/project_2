-- Add test data to Insurance table
INSERT INTO Insurance (insurance_provider, policy_number)
VALUES 
    ('Aetna', 'AA789356'),
	('Blue Cross Blue Shield', 'BC430023'),
	('Aetna', 'AA123877'),
    ('Medicare', 'MC123098'),
    ('Medicaid', 'ME544321'),
    ('Blue Cross Blue Shield', 'BC475890'),
    ('United Healthcare', 'UH123456'),
    ('Medicare', 'MC000008'),
	('United Healthcare', 'UH234321'),
    ('Cigna', 'CI345671'),
	('Medicaid', 'ME444555'),
    ('Cigna', 'CI456789');

-- Add test data to Facility table
INSERT INTO Facility (facility_name)
VALUES
	('Emergency Department 1');

-- Add test data to Patients table
INSERT INTO Patients (first_name, last_name, date_of_birth, sex, address, phone_number, email, policy_number)
VALUES 
    ('Jared', 'Johnson', '1965-07-12', 'M', '123 Elm St', '456-1234', 'jjohn@gmail.com', 'AA789356'),
    ('Sharon', 'Smith', '2000-12-10', 'F', '456 Kyle St', '565-1679', 'ssmith@yahoo.com', 'BC430023'),
    ('Michael', 'Jordan', '1958-09-02', 'M', '789 Lakewood St', '123-4355', 'mjordan@gmail.com', 'AA123877'),
    ('Nick', 'Williams', '1988-06-25', 'M', '165 Rich Lane', '654-2314', 'nwilliams@yahoo.com', 'MC123098'),
    ('Hazel', 'Matthews', '1990-01-17', 'F', '246 Palm Dr', '123-4567', 'hmatthews@gmail.com', 'ME544321'),
    ('Haley', 'James', '1973-03-29', 'F', '208 Jones Dr', '345-8560', 'hjames@gmail.com', 'BC475890'),
    ('Ella', 'Roberts', '2015-05-20', 'F', '123 Maple St', '555-9876', 'eroberts@gmail.com', 'UH123456'),
    ('Tom', 'Harris', '1982-08-11', 'M', '456 Cedar St', '444-3210', 'tharris@gmail.com', 'MC000008'),
    ('Kate', 'Brown', '1975-04-30', 'F', '789 Birch St', '333-7654', 'kbrown@gmail.com', 'UH234321'),
    ('Chris', 'Davis', '1990-11-01', 'M', '321 Oak St', '222-1234', 'cdavis@gmail.com', 'CI345671'),
    ('Julia', 'White', '1985-07-14', 'F', '654 Pine St', '111-0000', 'jwhite@gmail.com', 'ME444555'),
    ('Rick', 'Black', '1969-02-25', 'M', '987 Spruce St', '666-8888', 'rblack@gmail.com', 'CI456789');

-- Add test data to Providers table
INSERT INTO Providers (first_name, last_name, specialty, phone_number, email, facility_id)
VALUES 
    ('Allie', 'White', 'Pediatrics', '321-5432', 'awhite@yahoo.com', 1),
    ('Stewart', 'James', 'Cardiology', '321-1234', 'sjames@gmail.com', 1),
    ('Cathy', 'Curtis', 'Neurology', '987-4321', 'ccurtis@gmail.com', 1),
	('Frank', 'Neal', 'Emergency Medicine', '335-4476', 'fneal@gmail.com', 1),
	('Hannah', 'Johnston', 'Surgery', '111-2576', 'hjohnston@gmail.com', 1),
	('David', 'Beal', 'Emergency Medicine', '432-1111', 'dbeal@yahoo.com', 1),
    ('Michael', 'Thompson', 'Cardiology', '321-9876', 'mthompson@yahoo.com', 1),
    ('Emily', 'Clark', 'Surgery', '987-6543', 'eclark@gmail.com', 1);
    
-- Add test data to Billing table
INSERT INTO Billing (total_cost, insurance_covered_amount, amount_due) VALUES 
    (550.00, 400.00, 150.00),
    (320.00, 250.00, 70.00),
    (700.00, 500.00, 200.00),
    (450.00, 350.00, 100.00),
    (600.00, 500.00, 100.00),
    (300.00, 250.00, 50.00),
    (250.00, 200.00, 50.00),
    (420.00, 300.00, 120.00),
    (360.00, 280.00, 80.00),
    (480.00, 400.00, 80.00),
    (500.00, 450.00, 50.00),
    (300.00, 250.00, 50.00),
    (300.00, 250.00, 50.00),
    (700.00, 600.00, 100.00);
    
    
-- Add test data to Visits table
INSERT INTO Visits (patient_id, provider_id, visit_time, discharge_time, reason_for_visit, triage_level, facility_id, billing_id) 
VALUES 
    (1, 2, '2024-10-01 12:00:00', '2024-10-01 14:45:00', 'Chest pain', 'High', 1, 1),
    (2, 4, '2024-10-02 03:15:00', '2024-10-02 06:00:00', 'Shortness of breath', 'Medium', 1, 2),
    (3, 3, '2024-10-03 12:45:00', '2024-10-03 13:30:00', 'Severe headache', 'Low', 1, 3),
    (4, 2, '2024-10-04 14:00:00', '2024-10-04 18:15:00', 'Chest pain', 'High', 1, 4),
    (5, 5, '2024-10-05 09:15:00', '2024-10-05 15:00:00', 'Broken arm', 'High', 1, 5),
    (6, 2, '2024-10-06 17:45:00', '2024-10-06 21:00:00', 'Chest pain', 'High', 1, 6),
    (7, 1, '2024-10-01 09:00:00', '2024-10-01 11:00:00', 'Panic attack', 'Low', 1, 7),
    (9, 4, '2024-10-01 12:30:00', '2024-10-01 15:00:00', 'Chest discomfort', 'Medium', 1, 8),
    (8, 7, '2024-10-02 10:00:00', '2024-10-02 12:00:00', 'Chest discomfort', 'Medium', 1, 9),
    (12, 4, '2024-10-02 14:00:00', '2024-10-02 16:30:00', 'Anxiety', 'Low', 1, 10),
    (10, 6, '2024-10-03 11:30:00', '2024-10-03 13:15:00', 'Back pain', 'Medium', 1, 11),
    (11, 6, '2024-10-03 15:00:00', '2024-10-03 17:00:00', 'Knee pain', 'High', 1, 12),
    (1, 8, '2024-10-04 09:15:00', '2024-10-04 10:45:00', 'Broken arm', 'High', 1, 13),
    (7, 1, '2024-10-04 11:00:00', '2024-10-04 12:30:00', 'Breathing issues', 'High', 1, 14);

-- Add test data to Beds table
INSERT INTO Beds (bed_status, patient_id, facility_id)
VALUES 
    ('Occupied', 1, 1),
    ('Occupied', 2, 1),
    ('Available', NULL, 1),
    ('Available', NULL, 1),
    ('Occupied', 3, 1),
    ('Occupied', 4, 1),
    ('Occupied', 5, 1),
    ('Available', NULL, 1),
    ('Occupied', 6, 1);

-- Add test data to Billing table
INSERT INTO Billing (total_cost, insurance_covered_amount, amount_due) VALUES 
    (550.00, 400.00, 150.00),
    (320.00, 250.00, 70.00),
    (700.00, 500.00, 200.00),
    (450.00, 350.00, 100.00),
    (600.00, 500.00, 100.00),
    (300.00, 250.00, 50.00),
    (250.00, 200.00, 50.00),
    (420.00, 300.00, 120.00),
    (360.00, 280.00, 80.00),
    (480.00, 400.00, 80.00),
    (500.00, 450.00, 50.00),
    (300.00, 250.00, 50.00),
    (300.00, 250.00, 50.00),
    (700.00, 600.00, 100.00);
    
-- Add test data to Test_and_Procedure table
INSERT INTO Test_and_Procedure (visit_id, provider_id, test_name, status, results)
VALUES 
    (1, 2, 'ECG', 'Completed', 'Normal'),
    (2, 4, 'Chest X-Ray', 'Completed', 'Clear'),
    (3, 3, 'MRI Brain', 'Completed', 'Normal'),
    (4, 2, 'Blood Test', 'Completed', 'Normal'),
    (5, 5, 'X-Ray', 'Completed', 'Fracture detected'),
    (6, 2, 'ECG', 'Completed', 'Normal'),
    (7, 1, 'Blood Test', 'Completed', 'Normal'),
    (8, 4, 'ECG', 'Completed', 'Normal'),
    (9, 7, 'CT Scan', 'Completed', 'Anxiety confirmed'),
    (10, 4, 'X-Ray', 'Completed', 'No abnormalities'),
    (11, 6, 'MRI', 'Completed', 'Normal'),
    (12, 6, 'Pulmonary Function Test', 'Completed', 'Mild obstruction'),
	(13, 8, 'X-Ray', 'Completed', 'Fracture detected'),
	(14, 1, 'Pulmonary Function Test', 'Completed', 'No abnormalities');

-- Add test data to Prescriptions table
INSERT INTO Prescriptions (visit_id, provider_id, medication_name, dosage)
VALUES 
    (1, 2, 'Aspirin', '100mg'),
    (2, 4, 'Albuterol', '2 puffs'),
    (3, 3, 'Ibuprofen', '200mg'),
    (4, 2, 'Lisinopril', '10mg'),
    (5, 5, 'Acetaminophen', '500mg'),
    (6, 2, 'Nitroglycerin', '0.4mg'),
    (8, 4, 'Albuterol', '2 puffs'),
    (9, 7, 'Sertraline', '50mg'),
    (10, 4, 'Ibuprofen', '400mg'),
    (11, 6, 'Lisinopril', '10mg'),
    (12, 6, 'Prednisone', '5mg'),
    (13, 8, 'Ibuprofen', '50mg'),
    (14, 1, 'Sertraline', '25mg');

-- Add test data to Symptoms table
INSERT INTO Symptoms (visit_id, symptom)
VALUES 
    (1, 'Sharp chest pain'),
    (2, 'Shortness of breath'),
    (2, 'Coughing'),
    (3, 'Throbbing headache'),
    (4, 'Chest pain'),
    (5, 'Severe pain in arm'),
    (6, 'Persistent chest discomfort'),
	(7, 'Anxiety'),
    (7, 'Chest pain'),
    (8, 'Chest tightness'),
    (8, 'Shortness of breath'),
    (9, 'Anxiety'),
    (9, 'Palpitations'),
    (10, 'Knee pain and swelling'),
    (11, 'Back pain and stiffness'),
    (12, 'Difficulty breathing'),
    (12, 'Anxiety'),
    (13, 'Severe pain in arm'),
    (14, 'Difficulty breathing');

-- Add test data to Supplies table
INSERT INTO Supplies (supply_name, quantity_available, facility_id)
VALUES 
    ('Syringe', 500, 1),
    ('Bandage', 1000, 1),
    ('Gloves', 2000, 1),
    ('Scalpel', 300, 1),
    ('Gauze', 800, 1),
    ('Thermometer', 150, 1);

-- Add test data to Diagnoses table
INSERT INTO Diagnoses (visit_id, provider_id, diagnosis_code, diagnosis_description)
VALUES 
    (1, 2, 'I20', 'Stable angina'),
    (2, 4, 'J45', 'Asthma'),
    (3, 3, 'G43', 'Migraine'),
    (4, 2, 'I25', 'Coronary artery disease'),
    (5, 5, 'S42', 'Fracture of humerus'),
    (6, 2, 'I20', 'Angina pectoris'),
    (7, 1, 'Z00', 'No diagnosis'),
    (8, 4, 'I20', 'Stable angina'),
    (9, 7, 'F41', 'Generalized anxiety disorder'),
    (10, 4, 'M17', 'Osteoarthritis of the knee'),
    (11, 6, 'M54', 'Dorsalgia'),
    (12, 6, 'J44', 'Chronic obstructive pulmonary disease'),
    (13, 8, 'M54', 'Fracture of humerus'),
    (14, 1, 'F41', 'Generalized anxiety disorder');
    
-- Insert a user row for an existing patient
INSERT INTO Users (username, password_hash, role, associated_id)
VALUES
    ('jared_johnson', SHA2('securepassword123', 256), 'patient', 1); 

-- Insert a user row for an existing provider
INSERT INTO Users (username, password_hash, role, associated_id)
VALUES
    ('allie_white', SHA2('securepassword456', 256), 'provider', 1); 
