

BEGIN;

-- ---------------------------------------------------------------------
-- Clean slate (order matters without CASCADE, but CASCADE covers FKs too)
-- ---------------------------------------------------------------------
TRUNCATE TABLE
  tasks,
  ai_analyses,
  notifications,
  audit_logs,
  document_access,
  routing_events,
  document_text,
  documents,
  users,
  organizations
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------
-- ORGANIZATIONS (3)
-- ---------------------------------------------------------------------
INSERT INTO organizations (id, name, org_code, type, created_at) VALUES
  ('a0000000-0000-4000-8000-000000000001', 'St. Mercy Clinic',           'ORG-STMERCY',   'clinic',   now() - interval '30 days'),
  ('a0000000-0000-4000-8000-000000000002', 'Riverside Cardiology',       'ORG-RIVERSIDE', 'clinic',   now() - interval '28 days'),
  ('a0000000-0000-4000-8000-000000000003', 'Metro General Hospital',     'ORG-METRO',     'hospital', now() - interval '25 days');

-- ---------------------------------------------------------------------
-- USERS (6) — 2 per organization
-- ---------------------------------------------------------------------
INSERT INTO users (id, cognito_id, organization_id, email, full_name, role, is_active, last_login, created_at) VALUES
  ('b0000000-0000-4000-8000-000000000001', 'cognito-sub-0001', 'a0000000-0000-4000-8000-000000000001', 'j.rivera@stmercy.org',        'Dr. James Rivera', 'physician',            true, now() - interval '1 day',  now() - interval '29 days'),
  ('b0000000-0000-4000-8000-000000000002', 'cognito-sub-0002', 'a0000000-0000-4000-8000-000000000001', 'maria.santos@stmercy.org',    'Maria Santos',     'referral_coordinator', true, now() - interval '2 hours', now() - interval '29 days'),
  ('b0000000-0000-4000-8000-000000000003', 'cognito-sub-0003', 'a0000000-0000-4000-8000-000000000002', 'sarah.chen@riverside.org',    'Dr. Sarah Chen',   'specialist',           true, now() - interval '5 hours', now() - interval '27 days'),
  ('b0000000-0000-4000-8000-000000000004', 'cognito-sub-0004', 'a0000000-0000-4000-8000-000000000002', 'emily.wong@riverside.org',    'Emily Wong',       'admin',                true, now() - interval '1 day',  now() - interval '27 days'),
  ('b0000000-0000-4000-8000-000000000005', 'cognito-sub-0005', 'a0000000-0000-4000-8000-000000000003', 'michael.osei@metrogeneral.org','Dr. Michael Osei','physician',            true, now() - interval '3 hours', now() - interval '24 days'),
  ('b0000000-0000-4000-8000-000000000006', 'cognito-sub-0006', 'a0000000-0000-4000-8000-000000000003', 'linda.park@metrogeneral.org', 'Linda Park',       'admin',                true, now() - interval '6 hours', now() - interval '24 days');

-- ---------------------------------------------------------------------
-- DOCUMENTS (10) — covering every document_type, priority, and pipeline status
-- ---------------------------------------------------------------------
INSERT INTO documents (id, tx_ref, sender_org_id, recipient_org_id, uploaded_by_user_id, file_s3_key, original_filename, file_size, document_type, subject, priority, status, notes, created_at, delivered_at, read_at) VALUES
  ('c0000000-0000-4000-8000-000000000001', 'TX-1001',
    'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
    'documents/TX-1001.pdf', 'referral_john_doe.pdf', 184320, 'referral', 'Cardiology referral for John Doe', 'normal', 'delivered',
    'Routine cardiology referral.', now() - interval '6 days', now() - interval '5 days', now() - interval '4 days'),

  ('c0000000-0000-4000-8000-000000000002', 'TX-1002',
    'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003',
    'documents/TX-1002.pdf', 'lipid_panel_results.pdf', 92160, 'lab_result', 'Lipid panel results', 'urgent', 'delivered',
    'Abnormal LDL flagged.', now() - interval '5 days', now() - interval '4 days', now() - interval '3 days'),

  ('c0000000-0000-4000-8000-000000000003', 'TX-1003',
    'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002',
    'documents/TX-1003.pdf', 'discharge_summary_jane_smith.pdf', 261120, 'discharge_summary', 'Discharge summary — Jane Smith', 'normal', 'routed',
    NULL, now() - interval '4 days', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000004', 'TX-1004',
    'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005',
    'documents/TX-1004.pdf', 'insurance_authorization_request.pdf', 143360, 'insurance_form', 'Insurance authorization request', 'routine', 'routed',
    NULL, now() - interval '3 days', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000005', 'TX-1005',
    'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004',
    'documents/TX-1005.pdf', 'echocardiogram_results.pdf', 512000, 'imaging', 'Echocardiogram results', 'normal', 'classified',
    NULL, now() - interval '2 days', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000006', 'TX-1006',
    'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000006',
    'documents/TX-1006.pdf', 'referral_robert_lee.pdf', 176128, 'referral', 'Referral to cardiology — Robert Lee', 'urgent', 'classified',
    'Chest pain, needs prompt review.', now() - interval '2 days', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000007', 'TX-1007',
    'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
    'documents/TX-1007.pdf', 'cbc_results.pdf', 71680, 'lab_result', 'CBC results', 'normal', 'ocr_complete',
    NULL, now() - interval '1 day', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000008', 'TX-1008',
    'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003',
    'documents/TX-1008.pdf', 'post_op_discharge_notes.pdf', 204800, 'discharge_summary', 'Post-op discharge notes', 'normal', 'ocr_complete',
    NULL, now() - interval '1 day', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000009', 'TX-1009',
    'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005',
    'documents/TX-1009.pdf', 'prior_auth_mri.pdf', 133120, 'insurance_form', 'Prior authorization — MRI', 'routine', 'uploaded',
    NULL, now() - interval '5 hours', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000010', 'TX-1010',
    'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002',
    'documents/TX-1010.pdf', 'urgent_referral_chest_pain.pdf', 158720, 'referral', 'Urgent referral — chest pain', 'urgent', 'uploaded',
    'Send to ER intake team on arrival.', now() - interval '1 hour', NULL, NULL);

-- ---------------------------------------------------------------------
-- DOCUMENT_TEXT — OCR output for docs at ocr_complete stage or beyond (D1-D8)
-- ---------------------------------------------------------------------
INSERT INTO document_text (id, document_id, extracted_text, ocr_status, ocr_completed_at) VALUES
  ('d0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'Patient: John Doe. Reason for referral: evaluation for suspected arrhythmia. Requesting cardiology consult.', 'complete', now() - interval '6 days' + interval '2 hours'),
  ('d0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'Lipid panel: Total cholesterol 245 mg/dL, LDL 165 mg/dL, HDL 38 mg/dL, Triglycerides 210 mg/dL.', 'complete', now() - interval '5 days' + interval '1 hour'),
  ('d0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'Discharge summary for Jane Smith. Admitted for pneumonia, treated with IV antibiotics, discharged stable on oral course.', 'complete', now() - interval '4 days' + interval '3 hours'),
  ('d0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', 'Prior authorization request for outpatient physical therapy, 12 sessions, post-surgical rehabilitation.', 'complete', now() - interval '3 days' + interval '2 hours'),
  ('d0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000005', 'Echocardiogram: Ejection fraction 55%, no wall motion abnormalities, mild mitral regurgitation.', 'complete', now() - interval '2 days' + interval '4 hours'),
  ('d0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000006', 'Patient: Robert Lee. Reason for referral: recurring chest pain on exertion, rule out coronary artery disease.', 'complete', now() - interval '2 days' + interval '1 hour'),
  ('d0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000007', 'CBC: WBC 7.2, Hemoglobin 13.8, Hematocrit 41%, Platelets 250,000. All values within normal range.', 'complete', now() - interval '1 day' + interval '2 hours'),
  ('d0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000008', 'Post-operative discharge notes following elective knee arthroscopy. Patient tolerated procedure well.', 'complete', now() - interval '1 day' + interval '1 hour');

-- ---------------------------------------------------------------------
-- ROUTING_EVENTS — for docs that reached routed/delivered (D1-D4)
-- ---------------------------------------------------------------------
INSERT INTO routing_events (id, document_id, from_org_id, to_org_id, routed_by_user_id, status, created_at) VALUES
  ('e0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'routed',    now() - interval '5 days' - interval '3 hours'),
  ('e0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'delivered', now() - interval '5 days'),
  ('e0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'routed',    now() - interval '4 days' - interval '2 hours'),
  ('e0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'delivered', now() - interval '4 days'),
  ('e0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'routed',    now() - interval '3 days'),
  ('e0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005', 'routed',    now() - interval '2 days' - interval '20 hours');

-- ---------------------------------------------------------------------
-- DOCUMENT_ACCESS — recipient org granted read access once routed/delivered (D1-D4)
-- ---------------------------------------------------------------------
INSERT INTO document_access (id, document_id, organization_id, access_level, granted_at) VALUES
  ('f0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'read', now() - interval '5 days' - interval '3 hours'),
  ('f0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'read', now() - interval '4 days' - interval '2 hours'),
  ('f0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000003', 'read', now() - interval '3 days'),
  ('f0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000001', 'read', now() - interval '2 days' - interval '20 hours');

-- ---------------------------------------------------------------------
-- AUDIT_LOGS — upload event for every document, plus routing/delivery events
-- ---------------------------------------------------------------------
INSERT INTO audit_logs (id, event_id, document_id, user_id, organization_id, event_type, action, details, ip_address, hash, created_at) VALUES
  ('11110000-0000-4000-8000-000000000001', 'EVT-000001', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1001"}'::jsonb, '10.0.4.12', 'hash0001', now() - interval '6 days'),
  ('11110000-0000-4000-8000-000000000002', 'EVT-000002', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'document_sent',    'Document routed to Riverside Cardiology', '{"tx_ref":"TX-1001"}'::jsonb, '10.0.4.12', 'hash0002', now() - interval '5 days' - interval '3 hours'),
  ('11110000-0000-4000-8000-000000000003', 'EVT-000003', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'document_received','Document delivered and read', '{"tx_ref":"TX-1001"}'::jsonb, '10.0.7.24', 'hash0003', now() - interval '4 days'),
  ('11110000-0000-4000-8000-000000000004', 'EVT-000004', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1002"}'::jsonb, '10.0.7.24', 'hash0004', now() - interval '5 days'),
  ('11110000-0000-4000-8000-000000000005', 'EVT-000005', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000002', 'ai_processing',    'AI classification completed: lab_result, urgency detected', '{"tx_ref":"TX-1002"}'::jsonb, '10.0.7.24', 'hash0005', now() - interval '5 days' + interval '30 minutes'),
  ('11110000-0000-4000-8000-000000000006', 'EVT-000006', 'c0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1003"}'::jsonb, '10.0.4.12', 'hash0006', now() - interval '4 days'),
  ('11110000-0000-4000-8000-000000000007', 'EVT-000007', 'c0000000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1005"}'::jsonb, '10.0.9.33', 'hash0007', now() - interval '2 days'),
  ('11110000-0000-4000-8000-000000000008', 'EVT-000008', 'c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'a0000000-0000-4000-8000-000000000003', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1006"}'::jsonb, '10.0.2.19', 'hash0008', now() - interval '2 days'),
  ('11110000-0000-4000-8000-000000000009', 'EVT-000009', 'c0000000-0000-4000-8000-000000000009', 'b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1009"}'::jsonb, '10.0.2.19', 'hash0009', now() - interval '5 hours'),
  ('11110000-0000-4000-8000-000000000010', 'EVT-000010', 'c0000000-0000-4000-8000-000000000010', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1010"}'::jsonb, '10.0.4.12', 'hash0010', now() - interval '1 hour');

-- ---------------------------------------------------------------------
-- NOTIFICATIONS — recipient-side alerts
-- ---------------------------------------------------------------------
INSERT INTO notifications (id, user_id, document_id, type, message, is_read, created_at) VALUES
  ('22220000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'new_document',      'New referral received from St. Mercy Clinic.', true,  now() - interval '5 days' - interval '3 hours'),
  ('22220000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'urgent',            'Urgent lab result received: Lipid panel flagged abnormal.', true, now() - interval '4 days' - interval '2 hours'),
  ('22220000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000003', 'new_document',      'New discharge summary routed to your organization.', false, now() - interval '3 days'),
  ('22220000-0000-4000-8000-000000000004', 'b0000000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000004', 'new_document',      'New insurance form routed to your organization.', false, now() - interval '2 days' - interval '20 hours'),
  ('22220000-0000-4000-8000-000000000005', 'b0000000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000005', 'ai_complete',       'AI classification complete for echocardiogram results.', false, now() - interval '2 days' + interval '4 hours'),
  ('22220000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000006', 'urgent',            'Urgent referral classified: possible coronary artery disease.', false, now() - interval '2 days' + interval '1 hour');

-- ---------------------------------------------------------------------
-- AI_ANALYSES — for docs at classified/routed/delivered stage (D1-D6)
-- ---------------------------------------------------------------------
INSERT INTO ai_analyses (id, document_id, document_type, summary, tags, recommendation_text, recommendation_type, urgency_detected, confidence_score, processing_time_ms, model_used, status, created_at) VALUES
  ('33330000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000001', 'referral',          'Referral for cardiology evaluation of suspected arrhythmia.', ARRAY['cardiology','referral','arrhythmia'], 'Schedule follow-up appointment with cardiology.', 'schedule_followup', false, 96.40, 842, 'claude-haiku-4-5', 'complete', now() - interval '5 days' + interval '20 minutes'),
  ('33330000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000002', 'lab_result',        'Lipid panel showing elevated LDL and triglycerides.', ARRAY['lab','lipid_panel','abnormal'], 'Review abnormal lab results with patient.', 'review_results', true, 94.10, 765, 'claude-haiku-4-5', 'complete', now() - interval '5 days' + interval '30 minutes'),
  ('33330000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000003', 'discharge_summary', 'Discharge summary for pneumonia treatment, stable on discharge.', ARRAY['discharge','pneumonia'], NULL, NULL, false, 91.75, 910, 'claude-haiku-4-5', 'complete', now() - interval '4 days' + interval '10 minutes'),
  ('33330000-0000-4000-8000-000000000004', 'c0000000-0000-4000-8000-000000000004', 'insurance_form',    'Prior authorization request for outpatient physical therapy.', ARRAY['insurance','prior_auth','physical_therapy'], NULL, NULL, false, 89.30, 700, 'claude-haiku-4-5', 'complete', now() - interval '3 days' + interval '15 minutes'),
  ('33330000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000005', 'imaging',           'Echocardiogram within normal limits, mild mitral regurgitation.', ARRAY['imaging','echocardiogram','cardiology'], NULL, NULL, false, 93.20, 1020, 'claude-haiku-4-5', 'complete', now() - interval '2 days' + interval '25 minutes'),
  ('33330000-0000-4000-8000-000000000006', 'c0000000-0000-4000-8000-000000000006', 'referral',          'Referral for chest pain on exertion, rule out CAD.', ARRAY['cardiology','referral','chest_pain','urgent'], 'Contact referring provider to confirm urgency.', 'contact_provider', true, 97.05, 880, 'claude-haiku-4-5', 'complete', now() - interval '2 days' + interval '15 minutes');

-- ---------------------------------------------------------------------
-- TASKS — AI-generated follow-up recommendations turned into actionable tasks
-- ---------------------------------------------------------------------
INSERT INTO tasks (id, document_id, assigned_to_user_id, created_by_user_id, title, status, due_date, created_at) VALUES
  ('44440000-0000-4000-8000-000000000001', 'c0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000003', 'Review abnormal lipid panel results with patient', 'open',        now() + interval '2 days', now() - interval '4 days' + interval '35 minutes'),
  ('44440000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000006', 'b0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000006', 'Contact referring provider — possible CAD, urgent',  'in_progress', now() + interval '1 day', now() - interval '2 days' + interval '18 minutes'),
  ('44440000-0000-4000-8000-000000000003', 'c0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000002', 'Schedule cardiology follow-up appointment for John Doe', 'completed', now() - interval '2 days', now() - interval '5 days' + interval '25 minutes');


INSERT INTO documents (id, tx_ref, sender_org_id, recipient_org_id, uploaded_by_user_id, file_s3_key, original_filename, file_size, document_type, subject, priority, status, notes, created_at, delivered_at, read_at) VALUES
  ('c0000000-0000-4000-8000-000000000011', 'TX-1011',
    'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002',
    'documents/TX-1011.pdf', 'insurance_form_duplicate.pdf', 121344, 'insurance_form', 'Insurance authorization — duplicate submission', 'routine', 'rejected',
    'Rejected by recipient: duplicate submission, original already on file (TX-1004).', now() - interval '3 days', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000012', 'TX-1012',
    'a0000000-0000-4000-8000-000000000003', 'a0000000-0000-4000-8000-000000000001', 'b0000000-0000-4000-8000-000000000005',
    'documents/TX-1012.pdf', 'lab_result_scan_corrupted.pdf', 45056, 'lab_result', 'CBC results — scanned copy', 'urgent', 'ocr_failed',
    'OCR pipeline failed: corrupted PDF / unreadable scan quality. Awaiting re-upload.', now() - interval '3 hours', NULL, NULL),

  ('c0000000-0000-4000-8000-000000000013', 'TX-1013',
    'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004',
    'documents/TX-1013.pdf', 'discharge_summary_confidential.pdf', 187392, 'discharge_summary', 'Discharge summary — confidential, restricted access', 'normal', 'routed',
    'Routed to Metro General only; unauthorized access attempt logged from St. Mercy Clinic.', now() - interval '1 day', NULL, NULL);

-- document_text: OCR completed for TX-1011 before rejection; failed OCR row
-- for TX-1012 (no extracted text); completed OCR for TX-1013.
INSERT INTO document_text (id, document_id, extracted_text, ocr_status, ocr_completed_at) VALUES
  ('d0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000011', 'Prior authorization request for outpatient physical therapy, 12 sessions, post-surgical rehabilitation. Duplicate of TX-1004.', 'complete', now() - interval '3 days' + interval '1 hour'),
  ('d0000000-0000-4000-8000-000000000010', 'c0000000-0000-4000-8000-000000000012', NULL, 'failed', NULL),
  ('d0000000-0000-4000-8000-000000000011', 'c0000000-0000-4000-8000-000000000013', 'Discharge summary following elective procedure. Confidential — restricted distribution.', 'complete', now() - interval '1 day' + interval '2 hours');

-- routing_events: TX-1011 routed then rejected by the recipient;
-- TX-1013 routed to its sole authorized recipient.
INSERT INTO routing_events (id, document_id, from_org_id, to_org_id, routed_by_user_id, status, created_at) VALUES
  ('e0000000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000002', 'routed',   now() - interval '3 days' + interval '30 minutes'),
  ('e0000000-0000-4000-8000-000000000008', 'c0000000-0000-4000-8000-000000000011', 'a0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000002', 'b0000000-0000-4000-8000-000000000004', 'rejected', now() - interval '2 days' - interval '12 hours'),
  ('e0000000-0000-4000-8000-000000000009', 'c0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000003', 'b0000000-0000-4000-8000-000000000004', 'routed',   now() - interval '1 day' + interval '10 minutes');

-- document_access: TX-1013 access granted ONLY to the intended recipient
-- (Metro General). St. Mercy is deliberately NOT granted access here, so a
-- request from that org should be denied — see the auth_failure audit_log
-- entry below, which is the record Bella's endpoint tests should trigger.
INSERT INTO document_access (id, document_id, organization_id, access_level, granted_at) VALUES
  ('f0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000013', 'a0000000-0000-4000-8000-000000000003', 'read', now() - interval '1 day' + interval '10 minutes');

-- ai_analyses: TX-1011 was classified normally before the recipient rejected it.
INSERT INTO ai_analyses (id, document_id, document_type, summary, tags, recommendation_text, recommendation_type, urgency_detected, confidence_score, processing_time_ms, model_used, status, created_at) VALUES
  ('33330000-0000-4000-8000-000000000007', 'c0000000-0000-4000-8000-000000000011', 'insurance_form', 'Prior authorization request, flagged as likely duplicate of an existing submission.', ARRAY['insurance','prior_auth','duplicate'], 'Verify against existing submissions before processing.', 'review_results', false, 88.60, 730, 'claude-haiku-4-5', 'complete', now() - interval '3 days' + interval '45 minutes');

-- audit_logs: rejection event, OCR failure event, and unauthorized-access
-- attempt (auth_failure) for the permission-denied test case.
INSERT INTO audit_logs (id, event_id, document_id, user_id, organization_id, event_type, action, details, ip_address, hash, created_at) VALUES
  ('11110000-0000-4000-8000-000000000011', 'EVT-000011', 'c0000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000002', 'a0000000-0000-4000-8000-000000000001', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1011"}'::jsonb, '10.0.4.12', 'hash0011', now() - interval '3 days'),
  ('11110000-0000-4000-8000-000000000012', 'EVT-000012', 'c0000000-0000-4000-8000-000000000011', 'b0000000-0000-4000-8000-000000000004', 'a0000000-0000-4000-8000-000000000002', 'document_rejected','Document rejected by recipient: duplicate submission', '{"tx_ref":"TX-1011","reason":"duplicate"}'::jsonb, '10.0.7.30', 'hash0012', now() - interval '2 days' - interval '12 hours'),
  ('11110000-0000-4000-8000-000000000013', 'EVT-000013', 'c0000000-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'file_upload',      'Document uploaded', '{"tx_ref":"TX-1012"}'::jsonb, '10.0.2.19', 'hash0013', now() - interval '3 hours'),
  ('11110000-0000-4000-8000-000000000014', 'EVT-000014', 'c0000000-0000-4000-8000-000000000012', 'b0000000-0000-4000-8000-000000000005', 'a0000000-0000-4000-8000-000000000003', 'ai_processing',    'OCR extraction failed: corrupted PDF, low image quality', '{"tx_ref":"TX-1012","error":"OCR_ENGINE_ERROR"}'::jsonb, '10.0.2.19', 'hash0014', now() - interval '3 hours' + interval '5 minutes'),
  ('11110000-0000-4000-8000-000000000015', 'EVT-000015', 'c0000000-0000-4000-8000-000000000013', 'b0000000-0000-4000-8000-000000000001', 'a0000000-0000-4000-8000-000000000001', 'auth_failure',     'Access denied: user organization not authorized for this document', '{"tx_ref":"TX-1013","reason":"organization_mismatch"}'::jsonb, '10.0.4.50', 'hash0015', now() - interval '20 hours');

-- notifications: rejection notice to the sender, OCR-failure alert to the uploader.
INSERT INTO notifications (id, user_id, document_id, type, message, is_read, created_at) VALUES
  ('22220000-0000-4000-8000-000000000007', 'b0000000-0000-4000-8000-000000000002', 'c0000000-0000-4000-8000-000000000011', 'document_rejected', 'Your insurance form was rejected by Riverside Cardiology: duplicate submission.', false, now() - interval '2 days' - interval '12 hours'),
  ('22220000-0000-4000-8000-000000000008', 'b0000000-0000-4000-8000-000000000005', 'c0000000-0000-4000-8000-000000000012', 'processing_error',  'OCR failed for your CBC results upload. Please re-scan and re-upload.', false, now() - interval '3 hours' + interval '5 minutes');

COMMIT;

