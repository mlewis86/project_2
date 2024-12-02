CREATE VIEW PatientDetails AS
SELECT 
    p.patient_id,
    p.first_name,
    p.last_name,
    p.date_of_birth,
    p.sex,
    p.address,
    p.email,
    p.phone_number,
    pr.medication_name,
    pr.dosage,
    v.visit_time,
    v.reason_for_visit
FROM Patients p
LEFT JOIN Visits v ON p.patient_id = v.patient_id
LEFT JOIN Prescriptions pr ON v.visit_id = pr.visit_id;