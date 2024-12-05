DELIMITER //

CREATE PROCEDURE UpdatePatientEmail(
    IN patientId INT,
    IN newEmail VARCHAR(100)
)
BEGIN
    UPDATE Patients
    SET email = newEmail
    WHERE patient_id = patientId;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE UpdatePatientAddress(
    IN patientId INT,
    IN newAddress VARCHAR(255)
)
BEGIN
    UPDATE Patients
    SET address = newAddress
    WHERE patient_id = patientId;
END //

DELIMITER ;

DELIMITER //

CREATE PROCEDURE UpdatePatientPhoneNumber(
    IN patientId INT,
    IN newPhoneNumber VARCHAR(15)
)
BEGIN
    UPDATE Patients
    SET phone_number = newPhoneNumber
    WHERE patient_id = patientId;
END //

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE GetPrescriptionsByPatientAndProvider(
    IN patientId INT,
    IN providerId INT
)
BEGIN
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
    IN dosage VARCHAR(50)
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
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE UpdatePrescription(
    IN prescriptionId INT,
    IN providerId INT,
    IN medicationName VARCHAR(100),
    IN dosage VARCHAR(50)
)
BEGIN
    DECLARE authorized INT;

    -- Check if the prescription belongs to the provider
    SELECT COUNT(*) INTO authorized
    FROM Prescriptions
    WHERE prescription_id = prescriptionId AND provider_id = providerId;

    IF authorized = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unauthorized to update this prescription.';
    ELSE
        -- Update the prescription
        UPDATE Prescriptions
        SET medication_name = medicationName, dosage = dosage
        WHERE prescription_id = prescriptionId;
    END IF;
END$$

DELIMITER ;

DELIMITER $$

CREATE PROCEDURE DeletePrescription(
    IN prescriptionId INT,
    IN providerId INT
)
BEGIN
    DECLARE authorized INT;

    -- Check if the prescription belongs to the provider
    SELECT COUNT(*) INTO authorized
    FROM Prescriptions
    WHERE prescription_id = prescriptionId AND provider_id = providerId;

    IF authorized = 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Unauthorized to delete this prescription.';
    ELSE
        -- Delete the prescription
        DELETE FROM Prescriptions
        WHERE prescription_id = prescriptionId;
    END IF;
END$$

DELIMITER ;




