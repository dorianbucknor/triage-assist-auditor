SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict zOOv6L8RSsARCDrry1REi1UBfpJHmJTvugqXQ9JhUq8ov0AkCajs87LMF2sGMVs

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', 'authenticated', 'authenticated', 'matthewmiller1820@gmail.com', '$2a$10$RxQUvl9sCDV/C/frKnQnR.dTlKPwCu0pPxdBxDNFP/OPh589/sea6', '2026-05-02 14:32:28.85736+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-06 16:38:29.353115+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-05-02 14:32:28.834553+00', '2026-05-10 01:02:17.700845+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', 'authenticated', 'authenticated', 'tamara6clarke@gmail.com', '$2a$10$a7w66Eoo4gehohG9SB81YOHFqHznxCSsX9nfbhyw9VPy46G2vE6kK', '2026-03-19 02:02:40.800863+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-06 16:31:47.375784+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-03-19 02:02:40.751969+00', '2026-05-12 01:57:47.497384+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a334e1f2-f030-4915-8039-1045d795775f', 'authenticated', 'authenticated', 'dorianwbucknor@gmail.com', '$2a$10$rRL1esukgpz0SlW.spvkNeG0M2w9/ShAQE90SptkiEfVoNxOhlNuG', '2026-05-26 02:31:56.389379+00', NULL, '', '2026-05-26 02:30:06.494797+00', '', '2026-05-26 02:37:54.308704+00', '', '', NULL, '2026-05-26 02:38:46.269017+00', '{"provider": "email", "providers": ["email"]}', '{"sub": "a334e1f2-f030-4915-8039-1045d795775f", "email": "dorianwbucknor@gmail.com", "email_verified": true, "phone_verified": false}', NULL, '2026-05-26 02:10:46.19402+00', '2026-05-26 02:38:46.308597+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bcada175-0819-49ba-a140-8de10b8bd38c', 'authenticated', 'authenticated', 'keontilerain246@gmail.com', '$2a$10$nDX.kbn.Z72plNhjV6qf..Iw9xzOTxtcORT2dQVFPkP4GocnPw1Ja', '2026-05-04 15:18:49.567011+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-05-04 15:18:49.56052+00', '2026-05-04 15:18:49.56777+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a9a4237b-d914-4498-8ec9-7f482102fd44', 'authenticated', 'authenticated', 'triageassist.ai@gmail.com', '$2a$10$njEOthCRUnyzZnu4uwZwTOe3hi6gmPzpqF69mX5eD/1nWHEy6O62y', '2026-05-15 13:54:18.271035+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-15 16:47:26.423104+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-05-15 13:54:18.245789+00', '2026-05-16 14:25:35.367861+00', NULL, NULL, '', '', NULL, '', 0, '2026-06-13 14:25:35.367004+00', '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd190eb32-b837-4ca3-9acb-12b141752b46', 'authenticated', 'authenticated', 'rclarke@utech.edu.jm', '$2a$10$D2mWh8r/Zt9ra/JSEHv8fekDK.T62qLFEWFpwCtWd2vV4c9QPOLn.', '2026-05-12 23:56:06.157654+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-13 00:13:31.39239+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-05-12 23:56:06.140583+00', '2026-05-13 00:13:31.440192+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'd18cdacb-268f-4247-a687-e490746fee65', 'authenticated', 'authenticated', 'nicholas.smith1552@gmail.com', '$2a$10$GKKfKcW5Hw/c2EW/jDbQ1eKzXdFNyt4IE2YcBkFXbXU6wLmAlF36q', '2026-05-04 15:18:07.055383+00', NULL, '', NULL, '', NULL, '', '', NULL, '2026-05-04 23:41:34.379171+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-05-04 15:18:07.027729+00', '2026-05-13 01:37:27.941804+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0459b283-1572-41b7-b379-475fba156787', 'authenticated', 'authenticated', 'dorianbucknor@gmail.com', '$2a$10$xgo9BBQCx/c6f6ZBZ/XEYe2Mh.ss9QQRZXx8U8dKiTntw61QKvBma', NULL, NULL, 'pkce_3dfe8b83b0a6c20d0a7a6fd5cdd7607463be03c41268744559cf0cae', '2026-05-26 02:39:35.689113+00', '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"sub": "0459b283-1572-41b7-b379-475fba156787", "email": "dorianbucknor@gmail.com", "email_verified": false, "phone_verified": false}', NULL, '2026-05-26 02:39:35.678686+00', '2026-05-26 02:39:37.247425+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c40697b0-bf76-4840-94a8-a101ace3c437', 'authenticated', 'authenticated', 'bucknor.dorian@gmail.com', '$2a$10$h9eugxmTQtrhdL5.Z2w8L.u9Kh70KD/dUjfV.Cr883HmeuP3enrz2', '2026-02-23 10:12:09.792095+00', NULL, '', NULL, '', '2026-04-28 02:19:51.675508+00', '', '', NULL, '2026-05-26 04:23:03.853013+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2026-02-23 10:12:09.724267+00', '2026-05-27 02:02:30.610392+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: user_profiles; Type: TABLE DATA; Schema: user_info; Owner: postgres
--

INSERT INTO "user_info"."user_profiles" ("created_at", "id", "first_name", "last_name", "tos_accepted", "updated_at", "tos_accepted_at", "email", "email_verified", "disabled", "role", "isClinician") VALUES
	('2026-02-23 15:09:37+00', 'c40697b0-bf76-4840-94a8-a101ace3c437', 'Dorian', 'Bucknor', true, '2026-02-23 15:09:42+00', '2026-02-23 15:09:48+00', 'bucknor.dorian@gmail.com', true, false, 'admin', false),
	('2026-03-19 02:03:28+00', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', 'Tamara', 'Clarke', true, '2026-03-19 02:03:33+00', '2026-03-19 02:03:52+00', 'Tamara6clarke@gmail.com ', true, false, 'admin', false),
	('2026-05-02 14:34:39+00', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', 'Matthew', 'Miller', true, '2026-05-02 14:34:49+00', '2026-05-02 14:35:13+00', 'matthewmiller1820@gmail.com', true, false, '', false),
	('2026-05-04 15:20:51+00', 'bcada175-0819-49ba-a140-8de10b8bd38c', 'Otis', 'Dayes', true, '2026-05-04 15:20:59+00', '2026-05-04 15:21:49+00', 'keontilerain246@gmail.com', true, false, NULL, false),
	('2026-05-04 15:22:43+00', 'd18cdacb-268f-4247-a687-e490746fee65', 'Nicholas', 'Smith', true, '2026-05-04 15:22:38+00', '2026-05-04 15:23:30+00', 'nicholas.smith1552@gmail.com', true, false, NULL, false),
	('2026-05-12 23:57:03+00', 'd190eb32-b837-4ca3-9acb-12b141752b46', 'Rarron', 'Clarke', true, '2026-05-12 23:57:26+00', '2026-05-12 23:58:22+00', 'rclarke@utech.edu.jm', true, false, 'admin', false),
	('2026-05-15 13:54:49+00', 'a9a4237b-d914-4498-8ec9-7f482102fd44', 'User', 'Test', true, '2026-05-15 13:54:53+00', '2026-05-15 13:55:22+00', 'triageassist.ai@gmail.com', true, false, 'user', true);


--
-- Data for Name: scenarios; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."scenarios" ("id", "created_at", "author_id", "updated_at", "metadata", "is_synthetic", "graded_by", "editable", "public") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', '2026-04-26 06:39:00.599+00', 'c40697b0-bf76-4840-94a8-a101ace3c437', '2026-04-26 06:39:10.642038+00', NULL, true, '{}', false, true),
	('b355d602-51e8-4258-9c3d-77245440424d', '2026-05-05 05:43:59.018+00', 'c40697b0-bf76-4840-94a8-a101ace3c437', '2026-05-05 05:43:59.189525+00', NULL, true, '{}', false, true),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', '2026-05-05 05:53:14.941+00', 'c40697b0-bf76-4840-94a8-a101ace3c437', '2026-05-05 05:53:15.348406+00', NULL, true, '{}', false, true),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', '2026-05-06 16:44:43.533+00', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', '2026-05-06 16:44:43.57563+00', NULL, true, '{}', false, true),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', '2026-05-06 16:51:02.426+00', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', '2026-05-06 16:51:02.613946+00', NULL, true, '{}', false, true),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', '2026-05-13 00:42:28.551+00', 'd18cdacb-268f-4247-a687-e490746fee65', '2026-05-13 00:42:28.615748+00', NULL, true, '{}', false, true),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', '2026-05-15 16:47:20.653+00', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:47:20.68622+00', NULL, true, '{}', false, true),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', '2026-05-15 16:49:58.907+00', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:49:58.977003+00', NULL, true, '{}', false, true),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', '2026-05-15 16:51:33.154+00', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:51:33.186488+00', NULL, true, '{}', false, true),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', '2026-05-15 16:52:41.458+00', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:52:41.675719+00', NULL, true, '{}', false, true);


--
-- Data for Name: ai_scenario_responses; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."ai_scenario_responses" ("id", "created_at", "updated_at", "ai_model_used", "public") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', '2026-04-26 06:39:06.842+00', '2026-04-26 06:39:17.398328+00', 'unsloth/medgemma-27b-it', true),
	('b355d602-51e8-4258-9c3d-77245440424d', '2026-05-05 05:44:07.644+00', '2026-05-05 05:44:07.688936+00', 'unsloth/medgemma-27b-it', true),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', '2026-05-05 05:53:22.542+00', '2026-05-05 05:53:22.581959+00', 'unsloth/medgemma-27b-it', true),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', '2026-05-06 16:44:50.467+00', '2026-05-06 16:44:50.494393+00', 'unsloth/medgemma-27b-it', true),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', '2026-05-06 16:51:09.163+00', '2026-05-06 16:51:09.218772+00', 'unsloth/medgemma-27b-it', true),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', '2026-05-13 00:42:37.01+00', '2026-05-13 00:42:37.046726+00', 'unsloth/medgemma-27b-it', true),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', '2026-05-15 16:47:27.492+00', '2026-05-15 16:47:27.507857+00', 'unsloth/medgemma-27b-it', true),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', '2026-05-15 16:50:04.382+00', '2026-05-15 16:50:04.405223+00', 'unsloth/medgemma-27b-it', true),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', '2026-05-15 16:51:38.533+00', '2026-05-15 16:51:38.550246+00', 'unsloth/medgemma-27b-it', true),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', '2026-05-15 16:52:47.617+00', '2026-05-15 16:52:47.642054+00', 'unsloth/medgemma-27b-it', true);


--
-- Data for Name: ai_diagnosis_responses; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."ai_diagnosis_responses" ("id", "primary", "reason", "confidence") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', 'Ankle Sprain', 'Patient reports inversion injury while playing football, consistent with ankle sprain mechanism. Pain level is 3/10.', 0.95),
	('b355d602-51e8-4258-9c3d-77245440424d', 'Gastroenteritis', 'Patient presents with vomiting, nausea, stomach aches, and sweating. Dehydration is also mentioned. These symptoms are classic for gastroenteritis, especially in an elderly patient.', 0.75),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', 'Acute Decompensated Heart Failure (ADHF)', 'Patient presents with shortness of breath, swollen leg (edema), lightheadedness upon standing (orthostatic hypotension), tachycardia (pulse 118), tachypnea (RR 26), hypotension (BP 105/65), and hypoxia (SpO2 89%). These signs and symptoms are highly suggestive of ADHF, potentially exacerbated by volume overload and/or reduced cardiac output.', 0.95),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', 'Gastroenteritis', 'Patient presents with vomiting, diarrhea, and headache. Vitals are stable, but symptoms suggest a likely infectious or inflammatory process affecting the gastrointestinal tract.', 0.85),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', 'Pregnancy', 'Positive beta-hCG indicates pregnancy. The patient is male, which is biologically impossible, suggesting a potential error in the input data or a complex medical situation requiring further investigation (e.g., transgender male, false positive, etc.). However, based solely on the provided data, the positive bhcg is the strongest indicator.', 0.95),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', 'Status Epilepticus', 'Patient presents with recurrent epilepsy attacks occurring every 5 minutes, indicating a state of continuous seizure activity or rapidly recurring seizures without recovery between them.', 0.95),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', 'Headache', 'Patient presents with a chief complaint of sharp, stabbing pain behind the eyes. While the description is non-specific, headache is the primary symptom reported.', 0.8),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', 'Possible Pulmonary Embolism', 'Sudden onset shortness of breath, elevated respiratory rate (24), slightly elevated heart rate (92), and positive BHCG (suggesting pregnancy, a risk factor for PE). Oxygen saturation is borderline low (94%).', 0.75),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', 'Subarachnoid Hemorrhage (SAH)', 'Sudden onset of severe headache described as ''worst headache of my life'' is a classic symptom of SAH. Elevated blood pressure (140/90) can be associated with SAH, although it can also be a reaction to pain. Other vitals are relatively stable, but the chief complaint is highly concerning.', 0.85),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', 'Influenza', 'Patient presents with fever (40°C), headache, runny nose, congestion, joint pain, which are classic symptoms of influenza. The high fever is particularly indicative.', 0.85);


--
-- Data for Name: ai_treatment_responses; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."ai_treatment_responses" ("id", "recommendations", "reason", "confidence") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', '{"RICE (Rest, Ice, Compression, Elevation)","Pain management (e.g., NSAIDs or acetaminophen)","Weight-bearing as tolerated","Follow-up with primary care physician or orthopedics if symptoms persist or worsen","Consider imaging (X-ray) if fracture is suspected (e.g., inability to bear weight, significant deformity, bony tenderness)"}', 'Standard treatment for ankle sprains includes RICE therapy and pain control. Further evaluation or imaging may be needed depending on the severity and clinical suspicion of fracture.', 0.9),
	('b355d602-51e8-4258-9c3d-77245440424d', '{"Administer IV fluids for dehydration","Administer antiemetics (e.g., ondansetron)","Monitor vital signs closely, especially respiratory rate and oxygen saturation","Consider electrolyte panel and renal function tests","Rule out other causes of vomiting in the elderly (e.g., medication side effects, obstruction)"}', 'The patient is elderly and presenting with severe vomiting and signs suggestive of dehydration. IV fluids are indicated to correct dehydration. Antiemetics can help control the vomiting. Close monitoring is crucial due to age and potential for rapid deterioration. Further investigations are needed to rule out other causes and assess electrolyte/renal status.', 0.9),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', '{"Administer supplemental oxygen to maintain SpO2 >90%","Obtain ECG to rule out acute coronary syndrome or arrhythmia","Administer IV diuretics (e.g., furosemide) to reduce volume overload","Consider IV fluids cautiously if hypotension is severe and not due to volume overload","Obtain BNP/NT-proBNP levels","Continuous cardiac monitoring","Chest X-ray to assess for pulmonary edema and cardiomegaly"}', 'Treatment recommendations are based on the suspected diagnosis of ADHF. Oxygen is needed for hypoxia. Diuretics are indicated for volume overload. ECG and BNP are needed for further diagnosis and risk stratification. Monitoring is crucial due to hemodynamic instability.', 0.9),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', '{"Administer antiemetics (e.g., ondansetron) for vomiting.","Provide intravenous or oral rehydration therapy to address dehydration from vomiting and diarrhea.","Administer analgesics (e.g., acetaminophen) for headache.","Monitor vital signs and symptoms for worsening or complications.","Consider stool studies if diarrhea persists or is severe."}', 'Treatment focuses on symptom management (vomiting, diarrhea, headache) and preventing/treating dehydration, which is a common complication of gastroenteritis. Monitoring is crucial to detect any deterioration.', 0.95),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', '{"Confirm pregnancy status with further testing (e.g., repeat bhcg, ultrasound).","Evaluate the patient''s gender identity and medical history thoroughly.","Monitor vital signs.","Provide counseling and support based on the confirmed diagnosis and patient''s needs."}', 'The positive bhcg requires confirmation. The patient''s gender mismatch with pregnancy necessitates careful evaluation. Monitoring is prudent given the slightly low vitals. Counseling is essential regardless of the outcome.', 0.85),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', '{"Administer benzodiazepines (e.g., lorazepam, diazepam) intravenously.","If seizures persist, consider second-line agents (e.g., phenytoin, fosphenytoin, levetiracetam, valproic acid).","If seizures continue despite second-line agents, initiate anesthesia with agents like propofol or midazolam.","Monitor vital signs closely, including oxygen saturation, blood pressure, and cardiac rhythm.","Establish intravenous access and obtain blood samples for electrolytes, glucose, toxicology screen, and anticonvulsant levels if known.","Consider intubation and mechanical ventilation if respiratory compromise occurs.","Identify and treat any underlying precipitating factors (e.g., hypoglycemia, electrolyte imbalance, infection, drug withdrawal).","Continuous EEG monitoring may be helpful to confirm status epilepticus and guide treatment."}', 'Treatment recommendations are based on standard protocols for managing status epilepticus, aiming to rapidly terminate seizure activity and prevent complications. The specific agents and sequence may vary based on local protocols and patient factors.', 0.9),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', '{"Obtain complete vital signs (temperature, respiratory rate, blood pressure).","Perform a focused neurological examination.","Administer pain medication as appropriate.","Consider further investigation based on examination findings (e.g., imaging if red flags are present)."}', 'Initial management should focus on completing the assessment, providing symptomatic relief, and ruling out serious underlying causes based on the patient''s presentation and examination.', 0.9),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', '{"Administer supplemental oxygen to maintain SpO2 > 94%","Obtain ECG","Obtain D-dimer","Consider CT Pulmonary Angiogram (CTPA) or V/Q scan based on risk stratification and D-dimer results","Consult Obstetrics/Gynecology due to positive BHCG"}', 'Based on the suspected diagnosis of PE and the patient''s presentation, immediate supportive care (oxygen) and diagnostic workup are necessary. Pregnancy requires specific consideration in diagnostic and treatment planning.', 0.9),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', '{"Immediate neurological evaluation","Non-contrast head CT scan","Lumbar puncture (if CT is negative but suspicion remains high)","Blood pressure management","Pain management","NPO status"}', 'Based on the high suspicion for SAH, urgent diagnostic imaging (CT scan) and potential lumbar puncture are necessary. Supportive care including blood pressure control, pain relief, and NPO status are also indicated pending diagnosis.', 0.9),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', '{"Antipyretics (e.g., acetaminophen or ibuprofen) for fever and pain","Rest and hydration","Consider antiviral medication (e.g., oseltamivir) if within 48 hours of symptom onset and indicated based on risk factors/local guidelines","Monitor for worsening symptoms (e.g., shortness of breath, chest pain, severe dehydration)"}', 'Treatment recommendations are based on the likely diagnosis of influenza. Antipyretics address the high fever and pain. Rest and hydration are supportive measures. Antivirals may be considered. Monitoring is crucial to detect complications.', 0.95);


--
-- Data for Name: ai_triage_responses; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."ai_triage_responses" ("id", "level", "confidence", "reason") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', 3, 0.9, 'Patient presents with a sprained ankle, which is typically a non-life-threatening condition. Vitals are stable. ESI level 3 is appropriate for conditions requiring evaluation and treatment but not immediately life-threatening.'),
	('b355d602-51e8-4258-9c3d-77245440424d', 3, 0.8, 'Patient is 89 years old, presenting with severe vomiting and complaints of dehydration. While vitals are relatively stable (BP 115/75, Pulse 86), the age and symptoms of severe vomiting and potential dehydration warrant a higher level of concern than a level 4 or 5, but not emergent like level 1 or 2. The respiratory rate and oxygen saturation are missing, which is concerning, but based on available data, level 3 seems appropriate for further evaluation and potential IV fluids.'),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', 2, 0.9, 'Patient presents with significant respiratory distress (SOB, RR 26, SpO2 89%), tachycardia, hypotension, and signs of potential organ dysfunction (lightheadedness). While not immediately life-threatening like a level 1, these vital signs indicate a high-risk condition requiring urgent evaluation and intervention.'),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', 3, 0.9, 'Patient is stable (normal vitals, negative pregnancy test) but has multiple concerning symptoms (vomiting, diarrhea, headache) causing distress. ESI level 3 is appropriate for patients who need medical evaluation but are not in immediate danger.'),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', 4, 0.75, 'While the patient presents with a positive pregnancy test, the vitals (temperature, pulse, respiratory rate, blood pressure, oxygen saturation, glucose) are all within normal limits or slightly low (pulse, RR, O2 sat, glucose). The chief complaint is vague (''Feeling obnoxious''). Given the potential for pregnancy complications or the need to confirm the pregnancy status and address the biological discrepancy, a non-urgent triage level is appropriate, but requires follow-up. The low vitals might indicate a need for monitoring but don''t suggest immediate life threat.'),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', 1, 0.98, 'The patient is experiencing status epilepticus, a life-threatening neurological emergency requiring immediate intervention to prevent brain damage and systemic complications. The high frequency of seizures (every 5 minutes) necessitates the highest priority.'),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', 3, 0.7, 'Patient presents with headache. Vitals are largely missing or zero, but pulse and oxygen saturation are within normal limits. No immediate life threats are apparent based on the limited information. ESI level 3 is appropriate for patients with significant distress or potential for serious conditions requiring evaluation but not immediate life-saving intervention.'),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', 2, 0.85, 'Patient presents with acute shortness of breath, elevated respiratory rate, and borderline oxygen saturation. While vital signs are not critically unstable, the sudden onset and potential underlying cause (PE, pregnancy) warrant urgent evaluation.'),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', 1, 0.95, 'The patient presents with a ''worst headache of my life'', a red flag symptom highly suggestive of a life-threatening condition like subarachnoid hemorrhage. Immediate evaluation is required.'),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', 2, 0.9, 'Patient has a high fever (40°C) and systemic symptoms (headache, joint pain) but vital signs (pulse 75, BP 150/90) are relatively stable, and respiratory rate and oxygen saturation are missing but assumed normal given the context. ESI level 2 is appropriate for patients with significant symptoms but who are not in immediate danger.');


--
-- Data for Name: scenario_content; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."scenario_content" ("id", "extras", "age", "height", "weight", "gender", "medical_history_summary", "urinanalysis", "other_labs", "public", "labs_summary", "subject_id") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', NULL, 22, 180, 75, 'male', '{}', NULL, '"{\"pain\":3,\"race\":\"WHITE\"}"', true, '', '40091123'),
	('b355d602-51e8-4258-9c3d-77245440424d', NULL, 89, 180.34, 80, 'female', '{}', NULL, NULL, true, '', ''),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', NULL, 64, 180.34, 0, 'male', '{}', NULL, NULL, true, '', ''),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', NULL, 22, 0, 56, 'female', '{}', NULL, NULL, true, '', ''),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', NULL, 56, 172, 157, 'male', '{}', NULL, NULL, true, '', ''),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', NULL, 26, 170.18, 90.3, 'male', '{}', NULL, NULL, true, '', ''),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', NULL, 55, 150, 86, 'female', '{}', NULL, NULL, true, '', ''),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', NULL, 1981, 191, 92.5, 'male', '{}', NULL, NULL, true, '', ''),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', NULL, 29, 167, 78, 'male', '{}', NULL, NULL, true, '', ''),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', NULL, 55, 150, 80, 'female', '{}', NULL, NULL, true, '', '');


--
-- Data for Name: scenario_chief_complaints; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."scenario_chief_complaints" ("id", "title", "description") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', 'Sprained Ankle', 'Inversion injury while playing football'),
	('b355d602-51e8-4258-9c3d-77245440424d', 'Vomiting and Nausea', 'patient presents with severe vomiting. complains of dehydration, stomach aches and sweating'),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', 'Short of breath', 'patient reports sob and swollen leg that has been swollen from the day started. no chest pain but feels light headed when standing up'),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', 'Vomiting, diarrhea, and headache ', 'Everything the patient eat he/she throw up back, his/her belly keeps running and he/she has a terrible headache for over 3 hours.'),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', 'Fever', 'Feeling obnoxious'),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', 'Epilepsy Attack', 'Epilepsy attacks every 5 minutes'),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', 'Headache', 'Sharpe stabbing pain behind eyes'),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', 'Shortness of Breath', 'Sudden onset of difficulty breathing while gardening'),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', 'Severe headache', 'Worst headache of my life. Started 2 hours ago.'),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', 'Headache', 'Runny nose
Congestion
Dull headache
Fever
Joint Pain');


--
-- Data for Name: scenario_gradings; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."scenario_gradings" ("id", "created_at", "updated_at", "author_id", "scenario_id", "triage_grading", "diagnosis_grading", "treatment_grading", "triage_feedback", "diagnosis_feedback", "treatment_feedback", "additional_notes", "extras", "exclude", "score", "public") VALUES
	('86e43e04-0742-433e-bc39-14c63187cc44', '2026-05-06 16:51:11.115+00', '2026-05-06 16:51:11.115+00', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', '8525c890-25de-40ad-b921-e1c4029fe0f0', 5, 5, 5, '', '', '', '', NULL, false, 5, true);


--
-- Data for Name: scenario_vitals; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--

INSERT INTO "ai_auditing"."scenario_vitals" ("id", "blood_pressure", "pulse", "respiratory_rate", "temperature", "oxygen_saturation", "glucose", "bhcg", "other_vitals") VALUES
	('53e0d8f9-1fdd-4ba7-bc18-5e5d730760fd', '120/80', 68, 14, 36.6, 99, NULL, NULL, NULL),
	('b355d602-51e8-4258-9c3d-77245440424d', '115/75', 86, 0, 77, 0, 0, 'negative', NULL),
	('9627e29e-8c22-4d9c-a308-0e02d4714e98', '105/65', 118, 26, 37.4, 89, 0, 'negative', NULL),
	('8c862b60-fee3-4e5a-bb94-6014847f46cd', '119/80', 75, 18, 36.7, 98, 100, 'negative', NULL),
	('8525c890-25de-40ad-b921-e1c4029fe0f0', '110/70', 9, 8, 20, 12, 10, 'positive', NULL),
	('b75e18ec-efc1-443f-bfbe-c926e1abad4f', '120/80', 125, 16, 36.6, 98, 100, 'positive', NULL),
	('c80fdd34-4e68-4509-b09f-77e13b7f91dc', '', 80, 0, 0, 0, 0, '', NULL),
	('5179ae2b-9f4c-4fa7-8174-bf2a2312036a', '135/85', 92, 24, 37.1, 94, 110, 'positive', NULL),
	('8eb8b9b8-349f-42d0-a7a7-369e6422858f', '140/90', 88, 18, 37.5, 99, 95, 'negative', NULL),
	('871f25d7-8473-4c6a-86ab-34de66f28e3c', '150/90', 75, 0, 40, 0, 0, '', NULL);


--
-- Data for Name: triage_chief_complaints; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--



--
-- Data for Name: triage_forms; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--



--
-- Data for Name: triage_vitals; Type: TABLE DATA; Schema: ai_auditing; Owner: postgres
--



--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: custom_oauth_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."flow_state" ("id", "user_id", "auth_code", "code_challenge_method", "code_challenge", "provider_type", "provider_access_token", "provider_refresh_token", "created_at", "updated_at", "authentication_method", "auth_code_issued_at", "invite_token", "referrer", "oauth_client_state_id", "linking_target_id", "email_optional") VALUES
	('62fcf8be-6b7a-4a53-9dd9-50b4da10842d', 'c40697b0-bf76-4840-94a8-a101ace3c437', 'e2d2f16b-3856-43a5-b8d2-e963b6f531b2', 's256', 'kNTpbaHRo1SDVOcHoras-Tsq8FYTcy1ZBYmNqWKUWcg', 'magiclink', '', '', '2026-04-28 01:02:35.962196+00', '2026-04-28 01:02:35.962196+00', 'magiclink', NULL, NULL, NULL, NULL, NULL, false),
	('b5989ee7-90b6-4cce-bded-063e9fb7f442', 'c40697b0-bf76-4840-94a8-a101ace3c437', '06d35eee-1e4b-47f8-b3d0-5c3ca9bae902', 's256', 'VT6IyadDgdHheszGXtvAwEq_Hs04do6TQumoqpBz11s', 'magiclink', '', '', '2026-04-28 01:05:32.433813+00', '2026-04-28 01:05:32.433813+00', 'magiclink', NULL, NULL, NULL, NULL, NULL, false),
	('5474508b-2b00-4313-8594-e2c3de5e4e6e', 'c40697b0-bf76-4840-94a8-a101ace3c437', 'c2a83b71-6cf6-475a-96fb-79f9c3b4fd1e', 's256', 'ND9c7RoXDIgR-LkkLXKCf2xUryn49Kv7CUO4TrKxcUk', 'magiclink', '', '', '2026-04-28 01:48:47.914163+00', '2026-04-28 01:48:47.914163+00', 'magiclink', NULL, NULL, NULL, NULL, NULL, false),
	('01ea4474-9986-4518-a922-ce8b5f590707', 'c40697b0-bf76-4840-94a8-a101ace3c437', 'aa6f2eb3-2a67-468c-88c8-f3f0971aac77', 's256', 'Jk0Mh7JE8MoXvqtqYz29eLJDLCQxE98JFEAaM54cq8A', 'magiclink', '', '', '2026-04-28 02:19:51.647835+00', '2026-04-28 02:19:51.647835+00', 'magiclink', NULL, NULL, NULL, NULL, NULL, false),
	('a38c54d5-7f7a-4a53-a6c9-7126098f8939', '27eac8e7-faf1-4a8d-b5da-c5107e78ec5c', 'ae673267-b896-486f-9269-975172fb0207', 's256', '8VDEqo7zwejeLW0jksz6s8dwoBVHuLA6g6c8yix3S8c', 'email', '', '', '2026-04-28 02:46:31.847225+00', '2026-04-28 02:46:31.847225+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('41710d4f-a0d1-4f69-b31f-e5d36d95db52', 'a334e1f2-f030-4915-8039-1045d795775f', 'b90d0fc4-c622-4b0f-a191-0f4bcaa359fb', 's256', 'yc5k40Kn5LdgRopinrQcf4rOEyL_VmTKHbL-nBknBa4', 'email', '', '', '2026-05-26 02:10:46.21346+00', '2026-05-26 02:10:46.21346+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('62e5f75b-12cb-4e1b-9c2f-78716121dc55', 'a334e1f2-f030-4915-8039-1045d795775f', 'ce62fb6b-678c-4906-9c6c-39c451e784cf', 's256', 'ArVSrYBWesEaWSqxqv5TEp0mW7BKL2ogiYqK1sTyu4A', 'email', '', '', '2026-05-26 02:17:03.502247+00', '2026-05-26 02:17:03.502247+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false),
	('8cf61a31-75ff-444d-88cf-9e5c85888e1b', 'a334e1f2-f030-4915-8039-1045d795775f', '618d58f8-5858-4fd6-b949-ca10d8833b39', 's256', 'bdDDvB5yrpEf6guRhUVr_KxnITlg4uHJP6ly11DEHfg', 'email', '', '', '2026-05-26 02:30:06.477701+00', '2026-05-26 02:31:56.418912+00', 'email/signup', '2026-05-26 02:31:56.418862+00', NULL, NULL, NULL, NULL, false),
	('f2ceb031-94e5-46ab-9521-5e5d90a61686', 'a334e1f2-f030-4915-8039-1045d795775f', '931f8968-443a-4f0f-8d73-b70da81f0993', 's256', 'DI2OkV1kB6fVFff2NDED47Wfsfgh14MNi-Q00irw2VA', 'magiclink', '', '', '2026-05-26 02:37:54.296514+00', '2026-05-26 02:37:54.296514+00', 'magiclink', NULL, NULL, NULL, NULL, NULL, false),
	('b78bb170-84e4-4d94-a68b-8514deef4932', '0459b283-1572-41b7-b379-475fba156787', 'a5bb54dd-8934-4136-ab57-3c7d144fe5d9', 's256', 'ZSRUqL2rdiHQ3eAhuRwQjOF-TZwCU_D0QBXXSOnk46M', 'email', '', '', '2026-05-26 02:39:35.688116+00', '2026-05-26 02:39:35.688116+00', 'email/signup', NULL, NULL, NULL, NULL, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('c40697b0-bf76-4840-94a8-a101ace3c437', 'c40697b0-bf76-4840-94a8-a101ace3c437', '{"sub": "c40697b0-bf76-4840-94a8-a101ace3c437", "email": "bucknor.dorian@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-02-23 10:12:09.776453+00', '2026-02-23 10:12:09.77652+00', '2026-02-23 10:12:09.77652+00', 'c34a42f0-6c70-4ddf-9134-a7942f760c50'),
	('c4c37ed0-eb15-41d6-aa20-0f6652d93763', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', '{"sub": "c4c37ed0-eb15-41d6-aa20-0f6652d93763", "email": "tamara6clarke@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-03-19 02:02:40.791729+00', '2026-03-19 02:02:40.791792+00', '2026-03-19 02:02:40.791792+00', '8fd8af70-b8f9-4a7e-bff7-5d67f17f5de0'),
	('eab3324d-c0f4-4f05-8256-b26cae4f317e', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', '{"sub": "eab3324d-c0f4-4f05-8256-b26cae4f317e", "email": "matthewmiller1820@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-02 14:32:28.852126+00', '2026-05-02 14:32:28.852184+00', '2026-05-02 14:32:28.852184+00', 'c87a30c4-abb0-48b9-8140-c28e41f0c4eb'),
	('d18cdacb-268f-4247-a687-e490746fee65', 'd18cdacb-268f-4247-a687-e490746fee65', '{"sub": "d18cdacb-268f-4247-a687-e490746fee65", "email": "nicholas.smith1552@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-04 15:18:07.045004+00', '2026-05-04 15:18:07.045061+00', '2026-05-04 15:18:07.045061+00', '258b2a6e-a14b-4af5-aa2a-78c759d44a63'),
	('bcada175-0819-49ba-a140-8de10b8bd38c', 'bcada175-0819-49ba-a140-8de10b8bd38c', '{"sub": "bcada175-0819-49ba-a140-8de10b8bd38c", "email": "keontilerain246@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-04 15:18:49.56293+00', '2026-05-04 15:18:49.564385+00', '2026-05-04 15:18:49.564385+00', 'f9bf8968-1b57-48f8-a36f-dc8072bfcbeb'),
	('d190eb32-b837-4ca3-9acb-12b141752b46', 'd190eb32-b837-4ca3-9acb-12b141752b46', '{"sub": "d190eb32-b837-4ca3-9acb-12b141752b46", "email": "rclarke@utech.edu.jm", "email_verified": false, "phone_verified": false}', 'email', '2026-05-12 23:56:06.151928+00', '2026-05-12 23:56:06.151983+00', '2026-05-12 23:56:06.151983+00', '3290df7f-ad9a-4d03-af33-446ecdb2a771'),
	('a9a4237b-d914-4498-8ec9-7f482102fd44', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '{"sub": "a9a4237b-d914-4498-8ec9-7f482102fd44", "email": "triageassist.ai@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-15 13:54:18.263629+00', '2026-05-15 13:54:18.265104+00', '2026-05-15 13:54:18.265104+00', 'e73594ba-25d7-4da4-8038-dd9a9fe9def6'),
	('a334e1f2-f030-4915-8039-1045d795775f', 'a334e1f2-f030-4915-8039-1045d795775f', '{"sub": "a334e1f2-f030-4915-8039-1045d795775f", "email": "dorianwbucknor@gmail.com", "email_verified": true, "phone_verified": false}', 'email', '2026-05-26 02:10:46.209256+00', '2026-05-26 02:10:46.20931+00', '2026-05-26 02:10:46.20931+00', 'f12c4a22-0a8e-4e21-b4d8-e2db680a11f6'),
	('0459b283-1572-41b7-b379-475fba156787', '0459b283-1572-41b7-b379-475fba156787', '{"sub": "0459b283-1572-41b7-b379-475fba156787", "email": "dorianbucknor@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2026-05-26 02:39:35.682982+00', '2026-05-26 02:39:35.683027+00', '2026-05-26 02:39:35.683027+00', 'bef69797-6b7c-4b00-ad57-dd7afd7d28d5');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag", "oauth_client_id", "refresh_token_hmac_key", "refresh_token_counter", "scopes") VALUES
	('ae20acd9-0eae-40c1-9146-d6d3cb47eaeb', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:44:43.045452+00', '2026-05-15 16:44:43.045452+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36', '200.9.115.202', NULL, NULL, NULL, NULL, NULL),
	('ea985674-8dea-4a15-a70c-592c2ee659cf', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:44:55.653738+00', '2026-05-15 16:44:55.653738+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '200.9.115.202', NULL, NULL, NULL, NULL, NULL),
	('9a6d119f-ecfa-4c59-9962-b815244cd78e', 'd190eb32-b837-4ca3-9acb-12b141752b46', '2026-05-13 00:13:31.393208+00', '2026-05-13 00:13:31.393208+00', NULL, 'aal1', NULL, NULL, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '200.9.115.202', NULL, NULL, NULL, NULL, NULL),
	('fb90aed5-3e77-414c-a4f4-a2d5d0e7e2be', 'a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 16:47:26.424922+00', '2026-05-15 22:31:31.191739+00', NULL, 'aal1', NULL, '2026-05-15 22:31:31.191619', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '162.246.1.24', NULL, NULL, NULL, NULL, NULL),
	('25ed5fab-902b-41dc-8375-41a53ed1b4a5', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', '2026-05-06 16:31:47.378088+00', '2026-05-27 13:07:32.461121+00', NULL, 'aal1', NULL, '2026-05-27 13:07:32.461016', 'node', '44.220.60.32', NULL, NULL, NULL, NULL, NULL),
	('173ab9e1-f805-48a3-8aee-088c77f3cf14', 'd18cdacb-268f-4247-a687-e490746fee65', '2026-05-04 23:41:34.380388+00', '2026-05-13 01:37:28.000489+00', NULL, 'aal1', NULL, '2026-05-13 01:37:28.000383', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36', '104.28.153.55', NULL, NULL, NULL, NULL, NULL),
	('b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', '2026-03-28 18:54:14.164125+00', '2026-05-02 22:41:39.944058+00', NULL, 'aal1', NULL, '2026-05-02 22:41:39.943943', 'node', '54.91.188.45', NULL, NULL, NULL, NULL, NULL),
	('e3819cc0-7cfa-4e86-aa87-f6675b23af7d', 'c40697b0-bf76-4840-94a8-a101ace3c437', '2026-05-26 04:23:03.858181+00', '2026-05-27 21:46:39.377609+00', NULL, 'aal1', NULL, '2026-05-27 21:46:39.37751', 'node', '35.175.187.214', NULL, NULL, NULL, NULL, NULL),
	('280719a7-019d-4321-964a-d1fc175ecef8', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', '2026-05-06 16:38:29.353203+00', '2026-05-10 01:02:17.750447+00', NULL, 'aal1', NULL, '2026-05-10 01:02:17.750312', 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/147.0.0.0 Mobile Safari/537.36', '63.143.95.246', NULL, NULL, NULL, NULL, NULL),
	('d7564079-672e-4074-8095-3fb82411b4aa', 'a334e1f2-f030-4915-8039-1045d795775f', '2026-05-26 02:38:46.27013+00', '2026-05-26 02:38:46.27013+00', NULL, 'aal1', NULL, NULL, 'node', '72.27.33.42', NULL, NULL, NULL, NULL, NULL),
	('bafe6717-db81-45f8-a21f-8b5cec5d823e', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', '2026-04-21 12:45:18.246877+00', '2026-05-12 01:57:48.248591+00', NULL, 'aal1', NULL, '2026-05-12 01:57:48.248494', 'node', '52.91.11.152', NULL, NULL, NULL, NULL, NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('9a6d119f-ecfa-4c59-9962-b815244cd78e', '2026-05-13 00:13:31.446081+00', '2026-05-13 00:13:31.446081+00', 'password', '8169e26b-d1a0-4169-9ed7-6cc7bb76c2bf'),
	('ae20acd9-0eae-40c1-9146-d6d3cb47eaeb', '2026-05-15 16:44:43.048455+00', '2026-05-15 16:44:43.048455+00', 'password', 'e8ca46f2-c58d-400a-8153-f33e1db977e0'),
	('ea985674-8dea-4a15-a70c-592c2ee659cf', '2026-05-15 16:44:55.657473+00', '2026-05-15 16:44:55.657473+00', 'password', 'bed6e2b3-c66e-4aaa-a390-adb295d18a40'),
	('fb90aed5-3e77-414c-a4f4-a2d5d0e7e2be', '2026-05-15 16:47:26.429966+00', '2026-05-15 16:47:26.429966+00', 'password', 'c94a280d-ee21-4814-8e32-103d4df540e5'),
	('d7564079-672e-4074-8095-3fb82411b4aa', '2026-05-26 02:38:46.309091+00', '2026-05-26 02:38:46.309091+00', 'otp', 'b89cb507-28c8-41af-a863-198eb5ba1846'),
	('e3819cc0-7cfa-4e86-aa87-f6675b23af7d', '2026-05-26 04:23:03.931176+00', '2026-05-26 04:23:03.931176+00', 'password', 'd3fb81ce-537d-42e9-84a1-e5fa39bdd5a5'),
	('b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7', '2026-03-28 18:54:14.253677+00', '2026-03-28 18:54:14.253677+00', 'password', '8cd609d3-6dc3-49a6-a4b2-22fe4407e830'),
	('bafe6717-db81-45f8-a21f-8b5cec5d823e', '2026-04-21 12:45:18.322181+00', '2026-04-21 12:45:18.322181+00', 'password', '1cb435f5-56aa-4749-a388-ffcc55744cdc'),
	('173ab9e1-f805-48a3-8aee-088c77f3cf14', '2026-05-04 23:41:34.405939+00', '2026-05-04 23:41:34.405939+00', 'password', '7d4db6e6-77d8-4c7e-9ff2-38b6e8e1723b'),
	('25ed5fab-902b-41dc-8375-41a53ed1b4a5', '2026-05-06 16:31:47.41787+00', '2026-05-06 16:31:47.41787+00', 'password', '42d45f58-4aab-4572-85b5-8e0e239c0c76'),
	('280719a7-019d-4321-964a-d1fc175ecef8', '2026-05-06 16:38:29.357596+00', '2026-05-06 16:38:29.357596+00', 'password', '2ae482f0-6bef-4a7b-8f03-85ee21f8f849');


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_client_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."one_time_tokens" ("id", "user_id", "token_type", "token_hash", "relates_to", "created_at", "updated_at") VALUES
	('b3f424e7-fafc-4c7c-af54-031a2e04577a', '0459b283-1572-41b7-b379-475fba156787', 'confirmation_token', 'pkce_3dfe8b83b0a6c20d0a7a6fd5cdd7607463be03c41268744559cf0cae', 'dorianbucknor@gmail.com', '2026-05-26 02:39:37.248518', '2026-05-26 02:39:37.248518');


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 188, 'mlckiiq7ldej', 'd190eb32-b837-4ca3-9acb-12b141752b46', false, '2026-05-13 00:13:31.424536+00', '2026-05-13 00:13:31.424536+00', NULL, '9a6d119f-ecfa-4c59-9962-b815244cd78e'),
	('00000000-0000-0000-0000-000000000000', 160, 'iv7cvfppkcum', 'd18cdacb-268f-4247-a687-e490746fee65', true, '2026-05-05 02:38:54.392112+00', '2026-05-13 00:35:15.440003+00', 'xgek2qv33krz', '173ab9e1-f805-48a3-8aee-088c77f3cf14'),
	('00000000-0000-0000-0000-000000000000', 189, 'k4wwqbkkacho', 'd18cdacb-268f-4247-a687-e490746fee65', true, '2026-05-13 00:35:15.463337+00', '2026-05-13 01:37:27.89553+00', 'iv7cvfppkcum', '173ab9e1-f805-48a3-8aee-088c77f3cf14'),
	('00000000-0000-0000-0000-000000000000', 190, 'xavdandmzliy', 'd18cdacb-268f-4247-a687-e490746fee65', false, '2026-05-13 01:37:27.927388+00', '2026-05-13 01:37:27.927388+00', 'k4wwqbkkacho', '173ab9e1-f805-48a3-8aee-088c77f3cf14'),
	('00000000-0000-0000-0000-000000000000', 102, 'r3qvesgxhkw3', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-04-21 12:45:18.28421+00', '2026-04-21 23:00:41.263764+00', NULL, 'bafe6717-db81-45f8-a21f-8b5cec5d823e'),
	('00000000-0000-0000-0000-000000000000', 103, 'doji6drt7rxk', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-04-21 13:22:23.323466+00', '2026-04-22 02:26:41.779239+00', 'z5nyh2tqq32v', 'b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7'),
	('00000000-0000-0000-0000-000000000000', 114, 'gjrqf4rikacl', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-04-22 02:26:41.79506+00', '2026-05-02 22:41:39.85376+00', 'doji6drt7rxk', 'b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7'),
	('00000000-0000-0000-0000-000000000000', 153, 'gskiq3nh5lti', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', false, '2026-05-02 22:41:39.883856+00', '2026-05-02 22:41:39.883856+00', 'gjrqf4rikacl', 'b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7'),
	('00000000-0000-0000-0000-000000000000', 156, 'hvmcwzum7kb3', 'd18cdacb-268f-4247-a687-e490746fee65', true, '2026-05-04 23:41:34.398965+00', '2026-05-05 01:30:39.251404+00', NULL, '173ab9e1-f805-48a3-8aee-088c77f3cf14'),
	('00000000-0000-0000-0000-000000000000', 159, 'xgek2qv33krz', 'd18cdacb-268f-4247-a687-e490746fee65', true, '2026-05-05 01:30:39.289063+00', '2026-05-05 02:38:54.37391+00', 'hvmcwzum7kb3', '173ab9e1-f805-48a3-8aee-088c77f3cf14'),
	('00000000-0000-0000-0000-000000000000', 96, 'azam23qlbeaf', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-03-28 18:54:14.213228+00', '2026-04-01 17:57:49.192314+00', NULL, 'b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7'),
	('00000000-0000-0000-0000-000000000000', 206, 'adhtdwmucugl', 'a9a4237b-d914-4498-8ec9-7f482102fd44', false, '2026-05-15 16:44:43.046539+00', '2026-05-15 16:44:43.046539+00', NULL, 'ae20acd9-0eae-40c1-9146-d6d3cb47eaeb'),
	('00000000-0000-0000-0000-000000000000', 207, 'yns3plsqcqtk', 'a9a4237b-d914-4498-8ec9-7f482102fd44', false, '2026-05-15 16:44:55.65547+00', '2026-05-15 16:44:55.65547+00', NULL, 'ea985674-8dea-4a15-a70c-592c2ee659cf'),
	('00000000-0000-0000-0000-000000000000', 208, 'eoyastextw6z', 'a9a4237b-d914-4498-8ec9-7f482102fd44', true, '2026-05-15 16:47:26.427986+00', '2026-05-15 22:31:31.083547+00', NULL, 'fb90aed5-3e77-414c-a4f4-a2d5d0e7e2be'),
	('00000000-0000-0000-0000-000000000000', 209, 'dr7ikhhjxaqc', 'a9a4237b-d914-4498-8ec9-7f482102fd44', false, '2026-05-15 22:31:31.115879+00', '2026-05-15 22:31:31.115879+00', 'eoyastextw6z', 'fb90aed5-3e77-414c-a4f4-a2d5d0e7e2be'),
	('00000000-0000-0000-0000-000000000000', 97, 's5bv2qmjuluh', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-04-01 17:57:49.223871+00', '2026-04-21 12:20:14.673334+00', 'azam23qlbeaf', 'b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7'),
	('00000000-0000-0000-0000-000000000000', 101, 'z5nyh2tqq32v', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-04-21 12:20:14.709642+00', '2026-04-21 13:22:23.298093+00', 's5bv2qmjuluh', 'b7a6cbdc-9ca6-4669-9a2a-81d61750e5d7'),
	('00000000-0000-0000-0000-000000000000', 171, 'emcou6srkrls', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', true, '2026-05-06 16:38:29.355627+00', '2026-05-06 19:23:04.284912+00', NULL, '280719a7-019d-4321-964a-d1fc175ecef8'),
	('00000000-0000-0000-0000-000000000000', 172, '6slcgp2bxjxa', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', true, '2026-05-06 19:23:04.316895+00', '2026-05-07 06:13:26.321265+00', 'emcou6srkrls', '280719a7-019d-4321-964a-d1fc175ecef8'),
	('00000000-0000-0000-0000-000000000000', 170, 'vr4pxxf6gnjn', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-05-06 16:31:47.396618+00', '2026-05-08 11:33:01.337605+00', NULL, '25ed5fab-902b-41dc-8375-41a53ed1b4a5'),
	('00000000-0000-0000-0000-000000000000', 177, 'rrbmzstzcsry', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', false, '2026-05-08 11:33:01.356899+00', '2026-05-08 11:33:01.356899+00', 'vr4pxxf6gnjn', '25ed5fab-902b-41dc-8375-41a53ed1b4a5'),
	('00000000-0000-0000-0000-000000000000', 173, 'w5fjbfw3phnp', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', true, '2026-05-07 06:13:26.347387+00', '2026-05-09 02:59:23.392328+00', '6slcgp2bxjxa', '280719a7-019d-4321-964a-d1fc175ecef8'),
	('00000000-0000-0000-0000-000000000000', 180, 'n5zu45atn6qy', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', true, '2026-05-09 02:59:23.41887+00', '2026-05-10 01:02:17.651698+00', 'w5fjbfw3phnp', '280719a7-019d-4321-964a-d1fc175ecef8'),
	('00000000-0000-0000-0000-000000000000', 181, 'axtgsenad73j', 'eab3324d-c0f4-4f05-8256-b26cae4f317e', false, '2026-05-10 01:02:17.682325+00', '2026-05-10 01:02:17.682325+00', 'n5zu45atn6qy', '280719a7-019d-4321-964a-d1fc175ecef8'),
	('00000000-0000-0000-0000-000000000000', 113, 'myjmrpkqumqh', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-04-21 23:00:41.293763+00', '2026-05-11 21:14:44.218589+00', 'r3qvesgxhkw3', 'bafe6717-db81-45f8-a21f-8b5cec5d823e'),
	('00000000-0000-0000-0000-000000000000', 227, 'kamibwivvydn', 'a334e1f2-f030-4915-8039-1045d795775f', false, '2026-05-26 02:38:46.288707+00', '2026-05-26 02:38:46.288707+00', NULL, 'd7564079-672e-4074-8095-3fb82411b4aa'),
	('00000000-0000-0000-0000-000000000000', 183, '2tlmivexgwy7', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', true, '2026-05-11 21:14:44.250599+00', '2026-05-12 01:57:47.456384+00', 'myjmrpkqumqh', 'bafe6717-db81-45f8-a21f-8b5cec5d823e'),
	('00000000-0000-0000-0000-000000000000', 184, 'h7bofded2mx2', 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', false, '2026-05-12 01:57:47.481806+00', '2026-05-12 01:57:47.481806+00', '2tlmivexgwy7', 'bafe6717-db81-45f8-a21f-8b5cec5d823e'),
	('00000000-0000-0000-0000-000000000000', 228, '4mrungghuwn3', 'c40697b0-bf76-4840-94a8-a101ace3c437', true, '2026-05-26 04:23:03.900715+00', '2026-05-27 02:02:30.564211+00', NULL, 'e3819cc0-7cfa-4e86-aa87-f6675b23af7d'),
	('00000000-0000-0000-0000-000000000000', 229, 'iadm3zorkskr', 'c40697b0-bf76-4840-94a8-a101ace3c437', false, '2026-05-27 02:02:30.59292+00', '2026-05-27 02:02:30.59292+00', '4mrungghuwn3', 'e3819cc0-7cfa-4e86-aa87-f6675b23af7d');


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: webauthn_credentials; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: access_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."access_requests" ("id", "created_at", "institution", "registration_status", "professional_role", "registration_number", "speciality", "updated_at", "first_name", "last_name", "approved", "tos_accepted", "tos_accepted_at", "email_verified", "email", "approved_at", "denied", "denial_reason", "years_of_experience") VALUES
	('1fb66fc3-18fc-48f3-8943-7a0fa9042c7f', '2026-02-23 09:30:52.687406+00', 'uhwi', 'pending', 'doctor', '123456', NULL, '2026-02-23 09:30:52.687406+00', 'Dorian', 'Bucknor', false, true, '2026-02-23 09:30:54.738+00', false, 'bucknor.dorian@gmail.com', NULL, false, NULL, NULL),
	('e5811c75-66b1-4b2e-96af-df42bb25b395', '2026-05-26 02:39:17.353116+00', 'uhwi', 'pending', 'nurse', '', NULL, '2026-05-26 02:39:17.353116+00', 'Dorian', 'Bucknor', false, true, '2026-05-26 02:39:17.197+00', false, 'dorianwbucknor@gmail.com', NULL, false, NULL, NULL);


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: clinician_profiles; Type: TABLE DATA; Schema: user_info; Owner: postgres
--

INSERT INTO "user_info"."clinician_profiles" ("id", "created_at", "user_id", "institution_id", "registration_status", "professional_role", "registration_number", "speciality", "updated_at") VALUES
	('a9a4237b-d914-4498-8ec9-7f482102fd44', '2026-05-15 13:55:59+00', 'a9a4237b-d914-4498-8ec9-7f482102fd44', 'df10915b-56d3-4de4-bf7b-6348f7a0bd0a', 'approved', 'doctor', 'MOH12345678', 'general', '2026-05-15 13:56:31+00');


--
-- Data for Name: role_permissions; Type: TABLE DATA; Schema: user_info; Owner: postgres
--



--
-- Data for Name: user_metrics; Type: TABLE DATA; Schema: user_info; Owner: postgres
--



--
-- Data for Name: user_roles; Type: TABLE DATA; Schema: user_info; Owner: postgres
--

INSERT INTO "user_info"."user_roles" ("id", "user_id", "role") VALUES
	(3, 'c40697b0-bf76-4840-94a8-a101ace3c437', 'owner'),
	(4, 'c4c37ed0-eb15-41d6-aa20-0f6652d93763', 'admin'),
	(6, 'eab3324d-c0f4-4f05-8256-b26cae4f317e', 'admin'),
	(7, 'bcada175-0819-49ba-a140-8de10b8bd38c', 'admin'),
	(8, 'd18cdacb-268f-4247-a687-e490746fee65', 'admin'),
	(9, 'd190eb32-b837-4ca3-9acb-12b141752b46', 'admin'),
	(10, 'a9a4237b-d914-4498-8ec9-7f482102fd44', 'user');


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 229, true);


--
-- Name: role_permissions_id_seq; Type: SEQUENCE SET; Schema: user_info; Owner: postgres
--

SELECT pg_catalog.setval('"user_info"."role_permissions_id_seq"', 13, true);


--
-- Name: user_roles_id_seq; Type: SEQUENCE SET; Schema: user_info; Owner: postgres
--

SELECT pg_catalog.setval('"user_info"."user_roles_id_seq"', 10, true);


--
-- PostgreSQL database dump complete
--

-- \unrestrict zOOv6L8RSsARCDrry1REi1UBfpJHmJTvugqXQ9JhUq8ov0AkCajs87LMF2sGMVs

RESET ALL;
