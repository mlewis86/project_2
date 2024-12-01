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