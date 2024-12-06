DELIMITER //

CREATE PROCEDURE UpdatePatientEmail(
    IN patientId INT,
    IN newEmail VARCHAR(100),
    IN userId INT -- Add a parameter for the user making the change
)
BEGIN
    -- Declare a variable to hold the old email
    DECLARE oldEmail VARCHAR(100);

    -- Fetch the old email value before updating
    SELECT email INTO oldEmail
    FROM Patients
    WHERE patient_id = patientId;

    -- Update the patient's email
    UPDATE Patients
    SET email = newEmail
    WHERE patient_id = patientId;

    -- Insert into the AuditTrail table
    INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
    VALUES (
        'Patients', 
        'UPDATE', 
        oldEmail, 
        newEmail, 
        userId -- Use the input parameter for user_id
    );
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE UpdatePatientAddress(
    IN patientId INT,
    IN newAddress VARCHAR(255),
    IN userId INT -- Add a parameter for the user making the change
)
BEGIN
    -- Declare a variable to hold the old address
    DECLARE oldAddress VARCHAR(255);

    -- Fetch the old address value before updating
    SELECT address INTO oldAddress
    FROM Patients
    WHERE patient_id = patientId;

    -- Update the patient's address
    UPDATE Patients
    SET address = newAddress
    WHERE patient_id = patientId;

    -- Insert into the AuditTrail table
    INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
    VALUES (
        'Patients', 
        'UPDATE', 
        oldAddress, 
        newAddress, 
        userId -- Use the input parameter for user_id
    );
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE UpdatePatientPhoneNumber(
    IN patientId INT,
    IN newPhoneNumber VARCHAR(15),
    IN userId INT -- Add a parameter for the user making the change
)
BEGIN
    -- Declare a variable to hold the old phone number
    DECLARE oldPhoneNumber VARCHAR(15);

    -- Fetch the old phone number value before updating
    SELECT phone_number INTO oldPhoneNumber
    FROM Patients
    WHERE patient_id = patientId;

    -- Update the patient's phone number
    UPDATE Patients
    SET phone_number = newPhoneNumber
    WHERE patient_id = patientId;

    -- Insert into the AuditTrail table
    INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
    VALUES (
        'Patients', 
        'UPDATE', 
        oldPhoneNumber, 
        newPhoneNumber, 
        userId -- Use the input parameter for user_id
    );
END //

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE GetPrescriptionsByPatientAndProvider(
    IN patientId INT,
    IN providerId INT,
    IN userId INT -- Add a parameter for the user making the query
)
BEGIN
    -- Log the operation in the AuditTrail table
    INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
    VALUES (
        'Prescriptions',
        'SELECT',
        CONCAT('Patient ID: ', patientId, ', Provider ID: ', providerId),
        NULL,
        userId
    );

    -- Fetch prescriptions and related data
    SELECT Prescriptions.prescription_id, 
           Prescriptions.medication_name, 
           Prescriptions.dosage,
           Providers.first_name AS provider_first_name, 
           Providers.last_name AS provider_last_name,
           Visits.visit_time, 
           Visits.reason_for_visit
    FROM Prescriptions
    JOIN Visits ON Prescriptions.visit_id = Visits.visit_id
    JOIN Providers ON Prescriptions.provider_id = Providers.provider_id
    WHERE Visits.patient_id = patientId 
      AND Providers.provider_id = providerId;
END$$

DELIMITER ;


DELIMITER $$

CREATE PROCEDURE AddPrescription(
    IN visitId INT,
    IN providerId INT,
    IN medicationName VARCHAR(100),
    IN dosage VARCHAR(50),
    IN userId INT -- Add a parameter for the user making the change
)
BEGIN
    DECLARE visitExists INT;

    -- Check if the visit exists and is associated with the given provider
    SELECT COUNT(*) INTO visitExists
    FROM Visits
    WHERE visit_id = visitId AND provider_id = providerId;

    IF visitExists = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unauthorized to add prescription for this visit.';
    ELSE
        -- Insert the prescription
        INSERT INTO Prescriptions (visit_id, provider_id, medication_name, dosage)
        VALUES (visitId, providerId, medicationName, dosage);

        -- Insert into the AuditTrail table
        INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
        VALUES (
            'Prescriptions', 
            'INSERT', 
            NULL, 
            CONCAT('Medication Name: ', medicationName, ', Dosage: ', dosage), 
            userId -- Use the input parameter for user_id
        );
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE UpdatePrescription(
    IN prescriptionId INT,
    IN providerId INT,
    IN medicationName VARCHAR(100),
    IN dosage VARCHAR(50),
    IN userId INT -- Add a parameter for the user making the change
)
BEGIN
    DECLARE authorized INT;
    DECLARE oldMedicationName VARCHAR(100);
    DECLARE oldDosage VARCHAR(50);

    -- Check if the prescription belongs to the provider
    SELECT COUNT(*) INTO authorized
    FROM Prescriptions
    WHERE prescription_id = prescriptionId AND provider_id = providerId;

    IF authorized = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unauthorized to update this prescription.';
    ELSE
        -- Fetch the current values before updating
        SELECT medication_name, dosage INTO oldMedicationName, oldDosage
        FROM Prescriptions
        WHERE prescription_id = prescriptionId;

        -- Update the prescription
        UPDATE Prescriptions
        SET medication_name = medicationName, dosage = dosage
        WHERE prescription_id = prescriptionId;

        -- Insert into the AuditTrail table
        INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
        VALUES (
            'Prescriptions',
            'UPDATE',
            CONCAT('Medication Name: ', oldMedicationName, ', Dosage: ', oldDosage),
            CONCAT('Medication Name: ', medicationName, ', Dosage: ', dosage),
            userId -- Use the input parameter for user_id
        );
    END IF;
END$$

DELIMITER ;
DELIMITER $$

CREATE PROCEDURE DeletePrescription(
    IN prescriptionId INT,
    IN providerId INT,
    IN userId INT -- Add a parameter for the user making the change
)
BEGIN
    DECLARE authorized INT;
    DECLARE oldMedicationName VARCHAR(100);
    DECLARE oldDosage VARCHAR(50);

    -- Check if the prescription belongs to the provider
    SELECT COUNT(*) INTO authorized
    FROM Prescriptions
    WHERE prescription_id = prescriptionId AND provider_id = providerId;

    IF authorized = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unauthorized to delete this prescription.';
    ELSE
        -- Fetch the current values before deletion
        SELECT medication_name, dosage INTO oldMedicationName, oldDosage
        FROM Prescriptions
        WHERE prescription_id = prescriptionId;

        -- Delete the prescription
        DELETE FROM Prescriptions
        WHERE prescription_id = prescriptionId;

        -- Insert into the AuditTrail table
        INSERT INTO AuditTrail (table_name, operation_type, old_value, new_value, user_id)
        VALUES (
            'Prescriptions',
            'DELETE',
            CONCAT('Medication Name: ', oldMedicationName, ', Dosage: ', oldDosage),
            NULL, -- No new value since it's a delete operation
            userId -- Use the input parameter for user_id
        );
    END IF;
END$$

DELIMITER ;




