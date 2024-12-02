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

CREATE VIEW ProviderDetails AS
SELECT 
    provider_id,
    first_name,
    last_name,
    specialty,
    phone_number,
    email,
    facility_id
FROM Providers;


CREATE VIEW ProviderVisits AS
SELECT 
    v.visit_id,
    v.patient_id,
    v.provider_id,
    v.visit_time,
    v.discharge_time,
    v.reason_for_visit,
    v.triage_level,
    v.facility_id,
    v.billing_id
FROM Visits v;