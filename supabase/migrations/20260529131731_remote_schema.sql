SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE SCHEMA IF NOT EXISTS "ai_auditing";


ALTER SCHEMA "ai_auditing" OWNER TO "postgres";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE SCHEMA IF NOT EXISTS "user_info";


ALTER SCHEMA "user_info" OWNER TO "postgres";


CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";

CREATE ROLE admin;




CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'owner',
    'admin',
    'editor',
    'viewer',
    'user'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "user_info"."append_graded_by"("row_id" "uuid", "user_id" "text") RETURNS "void"
    LANGUAGE "sql"
    AS $$
update ai_auditing.scenarios
set graded_by = array_append(graded_by, user_id)
where id = row_id;
$$;


ALTER FUNCTION "user_info"."append_graded_by"("row_id" "uuid", "user_id" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "user_info"."authorize"("requested_permission" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  bind_permissions INT;
  user_role TEXT;
BEGIN
  -- Fetch user role once
  SELECT (auth.jwt() ->> 'user_role')::text INTO user_role;

  -- Constrain user_role to the allowed list; if not allowed, deny
  IF user_role NOT IN (
    'user.insert', 'user.read', 'user.update',
    'clinician.delete', 'clinician.insert', 'clinician.read', 'clinician.update',
    'grading.delete', 'grading.insert', 'grading.read', 'grading.update'
  ) THEN
    RETURN false;
  END IF;

  SELECT COUNT(*) INTO bind_permissions
  FROM public.role_permissions
  WHERE role_permissions.permission = requested_permission
    AND role_permissions.role = user_role;

  RETURN bind_permissions > 0;
END;$$;


ALTER FUNCTION "user_info"."authorize"("requested_permission" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "user_info"."get_claim"("claim" "text") RETURNS "text"
    LANGUAGE "sql" STABLE
    AS $$
  select nullif(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> claim, '')::text;
$$;


ALTER FUNCTION "user_info"."get_claim"("claim" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "user_info"."pub_sch_user_claim_role_hook"("event" "jsonb") RETURNS "jsonb"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$DECLARE
  claims jsonb := '{}'::jsonb;
  user_role text;
BEGIN
  -- Fetch the user role in the user_roles table
  SELECT role INTO user_role
  FROM user_info.user_roles
  WHERE user_id = (event->>'user_id')::uuid;

  claims := coalesce(event->'claims', '{}'::jsonb);

  IF user_role IS NOT NULL THEN
    -- Set the claim (create path if missing)
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role), true);
  ELSE
    -- Set JSON null (not the string "null")
    claims := jsonb_set(claims, '{user_role}', 'null'::jsonb, true);
  END IF;

  -- Update the 'claims' object in the original event
  event := jsonb_set(event, '{claims}', claims, true);

  -- Return the modified or original event
  RETURN event;
END;$$;


ALTER FUNCTION "user_info"."pub_sch_user_claim_role_hook"("event" "jsonb") OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "ai_auditing"."ai_diagnosis_responses" (
    "id" "uuid" NOT NULL,
    "primary" "text" DEFAULT ''::"text" NOT NULL,
    "reason" "text" DEFAULT ''::"text" NOT NULL,
    "confidence" real DEFAULT '0'::real NOT NULL
);


ALTER TABLE "ai_auditing"."ai_diagnosis_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."ai_scenario_responses" (
    "id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "ai_model_used" "text" DEFAULT ''::"text",
    "public" boolean DEFAULT true NOT NULL
);


ALTER TABLE "ai_auditing"."ai_scenario_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."ai_treatment_responses" (
    "id" "uuid" NOT NULL,
    "recommendations" "text"[] NOT NULL,
    "reason" "text" DEFAULT ''::"text" NOT NULL,
    "confidence" real NOT NULL
);


ALTER TABLE "ai_auditing"."ai_treatment_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."ai_triage_responses" (
    "id" "uuid" NOT NULL,
    "level" smallint NOT NULL,
    "confidence" real NOT NULL,
    "reason" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "ai_auditing"."ai_triage_responses" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."scenario_chief_complaints" (
    "id" "uuid" NOT NULL,
    "title" "text" DEFAULT ''::"text" NOT NULL,
    "description" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "ai_auditing"."scenario_chief_complaints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."scenario_content" (
    "id" "uuid" NOT NULL,
    "extras" "jsonb",
    "age" smallint,
    "height" real,
    "weight" real,
    "gender" "text",
    "medical_history_summary" "text"[],
    "urinanalysis" "jsonb",
    "other_labs" "jsonb",
    "public" boolean DEFAULT true NOT NULL,
    "labs_summary" "text",
    "subject_id" "text" DEFAULT ''::"text" NOT NULL
);


ALTER TABLE "ai_auditing"."scenario_content" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."scenario_gradings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "author_id" "uuid",
    "scenario_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "triage_grading" smallint DEFAULT '3'::smallint NOT NULL,
    "diagnosis_grading" smallint DEFAULT '3'::smallint NOT NULL,
    "treatment_grading" smallint DEFAULT '3'::smallint NOT NULL,
    "triage_feedback" "text",
    "diagnosis_feedback" "text",
    "treatment_feedback" "text",
    "additional_notes" "text",
    "extras" json,
    "exclude" boolean DEFAULT false NOT NULL,
    "score" real,
    "public" boolean DEFAULT true NOT NULL
);


ALTER TABLE "ai_auditing"."scenario_gradings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."scenario_vitals" (
    "id" "uuid" NOT NULL,
    "blood_pressure" "text",
    "pulse" smallint,
    "respiratory_rate" smallint,
    "temperature" real,
    "oxygen_saturation" real,
    "glucose" real,
    "bhcg" "text",
    "other_vitals" "jsonb"
);


ALTER TABLE "ai_auditing"."scenario_vitals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."scenarios" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "metadata" json,
    "is_synthetic" boolean DEFAULT false NOT NULL,
    "graded_by" "text"[] DEFAULT '{}'::"text"[] NOT NULL,
    "editable" boolean DEFAULT true NOT NULL,
    "public" boolean DEFAULT true NOT NULL
);


ALTER TABLE "ai_auditing"."scenarios" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."triage_chief_complaints" (
    "id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "details" "text" NOT NULL
);


ALTER TABLE "ai_auditing"."triage_chief_complaints" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."triage_forms" (
    "id" "uuid" NOT NULL,
    "extras" json,
    "age" smallint,
    "height" smallint,
    "weight" smallint,
    "gender" "text",
    "chief_complaint" "text",
    "complaint_details" "text",
    "medical_history" json,
    "other_labs" json,
    "vitals" json,
    "urinalysis" json,
    "author_id" "uuid",
    "scenario_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "processed_at" timestamp with time zone
);


ALTER TABLE "ai_auditing"."triage_forms" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "ai_auditing"."triage_vitals" (
    "id" "uuid" NOT NULL,
    "blood_pressure" "text",
    "pulse" smallint,
    "respiratory_rate" smallint,
    "temperature" real,
    "oxygen_saturation" real,
    "glucose_level" real,
    "bhcg" "text",
    "other_vitals" "jsonb"
);


ALTER TABLE "ai_auditing"."triage_vitals" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."access_requests" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "institution" "text" NOT NULL,
    "registration_status" "text" DEFAULT 'unverified'::"text" NOT NULL,
    "professional_role" "text" NOT NULL,
    "registration_number" "text" DEFAULT ''::"text" NOT NULL,
    "speciality" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "first_name" "text" NOT NULL,
    "last_name" "text" NOT NULL,
    "approved" boolean DEFAULT false NOT NULL,
    "tos_accepted" boolean DEFAULT false NOT NULL,
    "tos_accepted_at" timestamp with time zone,
    "email_verified" boolean DEFAULT false NOT NULL,
    "email" "text" NOT NULL,
    "approved_at" timestamp with time zone,
    "denied" boolean DEFAULT false NOT NULL,
    "denial_reason" "text",
    "years_of_experience" integer
);


ALTER TABLE "public"."access_requests" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "user_info"."clinician_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "institution_id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "registration_status" "text" DEFAULT 'unverified'::"text" NOT NULL,
    "professional_role" "text",
    "registration_number" "text" DEFAULT ''::"text" NOT NULL,
    "speciality" "text",
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "user_info"."clinician_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "user_info"."user_profiles" (
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text" DEFAULT ''::"text",
    "last_name" "text" DEFAULT ''::"text",
    "tos_accepted" boolean DEFAULT false NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "tos_accepted_at" timestamp with time zone,
    "email" "text" NOT NULL,
    "email_verified" boolean DEFAULT false NOT NULL,
    "disabled" boolean DEFAULT false NOT NULL,
    "role" "text",
    "isClinician" boolean DEFAULT false NOT NULL
);


ALTER TABLE "user_info"."user_profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "user_info"."full_user_profiles" WITH ("security_invoker"='true') AS
 SELECT "u"."created_at",
    "u"."id",
    "u"."first_name",
    "u"."last_name",
    "u"."tos_accepted",
    "u"."updated_at",
    "u"."tos_accepted_at",
    "u"."email",
    "u"."email_verified",
    "u"."disabled",
    "u"."role",
    "u"."isClinician",
        CASE
            WHEN ("c"."id" IS NOT NULL) THEN "jsonb_build_object"('professionalRole', "c"."professional_role", 'registrationNumber', "c"."registration_number", 'institution', "c"."institution_id", 'speciality', "c"."speciality")
            ELSE NULL::"jsonb"
        END AS "clinician_details"
   FROM ("user_info"."user_profiles" "u"
     LEFT JOIN "user_info"."clinician_profiles" "c" ON (("u"."id" = "c"."user_id")));


ALTER VIEW "user_info"."full_user_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "user_info"."role_permissions" (
    "id" bigint NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "permission" "text" NOT NULL,
    CONSTRAINT "app_permission" CHECK (("permission" = ANY (ARRAY['user.insert'::"text", 'user.read'::"text", 'user.update'::"text", 'clinician.delete'::"text", 'clinician.insert'::"text", 'clinician.read'::"text", 'clinician.update'::"text", 'grading.delete'::"text", 'grading.insert'::"text", 'grading.read'::"text", 'grading.update'::"text"]))),
    CONSTRAINT "role_permissions_permission_check" CHECK (("permission" = ANY (ARRAY['user.insert'::"text", 'user.read'::"text", 'user.update'::"text", 'clinician.delete'::"text", 'clinician.insert'::"text", 'clinician.read'::"text", 'clinician.update'::"text", 'grading.delete'::"text", 'grading.insert'::"text", 'grading.read'::"text", 'grading.update'::"text"])))
);


ALTER TABLE "user_info"."role_permissions" OWNER TO "postgres";


COMMENT ON TABLE "user_info"."role_permissions" IS 'Application permissions for each role.';



ALTER TABLE "user_info"."role_permissions" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "user_info"."role_permissions_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "user_info"."user_metrics" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "scenarios_added" integer DEFAULT 0 NOT NULL,
    "number_of_gradings" integer DEFAULT 0 NOT NULL,
    "log_ins" integer DEFAULT 0 NOT NULL,
    "referrals" integer DEFAULT 0
);


ALTER TABLE "user_info"."user_metrics" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "user_info"."user_roles" (
    "id" bigint NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "text" NOT NULL,
    CONSTRAINT "role_type" CHECK (("role" = ANY (ARRAY['owner'::"text", 'admin'::"text", 'editor'::"text", 'viewer'::"text", 'user'::"text"])))
);


ALTER TABLE "user_info"."user_roles" OWNER TO "postgres";


COMMENT ON TABLE "user_info"."user_roles" IS 'Application roles for each user.';



ALTER TABLE "user_info"."user_roles" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "user_info"."user_roles_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "ai_auditing"."ai_diagnosis_responses"
    ADD CONSTRAINT "ai_diagnosis_response_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."ai_scenario_responses"
    ADD CONSTRAINT "ai_scenario_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."ai_treatment_responses"
    ADD CONSTRAINT "ai_treatment_responses_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."ai_triage_responses"
    ADD CONSTRAINT "ai_triage_response_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."scenario_gradings"
    ADD CONSTRAINT "gradings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."scenario_chief_complaints"
    ADD CONSTRAINT "scenario_chief_complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."scenario_content"
    ADD CONSTRAINT "scenario_content_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."scenario_vitals"
    ADD CONSTRAINT "scenario_vitals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."scenarios"
    ADD CONSTRAINT "scenarios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."triage_chief_complaints"
    ADD CONSTRAINT "triage_chief_complaints_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."triage_forms"
    ADD CONSTRAINT "triage_forms_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "ai_auditing"."triage_vitals"
    ADD CONSTRAINT "triage_vitals_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."access_requests"
    ADD CONSTRAINT "access_requests_registration_number_key" UNIQUE ("registration_number");



ALTER TABLE ONLY "user_info"."clinician_profiles"
    ADD CONSTRAINT "clinician_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "user_info"."clinician_profiles"
    ADD CONSTRAINT "clinician_data_registration_number_key" UNIQUE ("registration_number");



ALTER TABLE ONLY "user_info"."clinician_profiles"
    ADD CONSTRAINT "clinician_data_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "user_info"."clinician_profiles"
    ADD CONSTRAINT "clinician_profiles_institution_id_key" UNIQUE ("institution_id");



ALTER TABLE ONLY "user_info"."role_permissions"
    ADD CONSTRAINT "role_permissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "user_info"."role_permissions"
    ADD CONSTRAINT "role_permissions_role_permission_key" UNIQUE ("role", "permission");



ALTER TABLE ONLY "user_info"."user_profiles"
    ADD CONSTRAINT "user_data_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "user_info"."user_metrics"
    ADD CONSTRAINT "user_metrics_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "user_info"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "user_info"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "user_info"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "user_info"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "ai_auditing"."ai_diagnosis_responses"
    ADD CONSTRAINT "ai_diagnosis_response_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."ai_scenario_responses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."ai_scenario_responses"
    ADD CONSTRAINT "ai_scenario_responses_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."ai_treatment_responses"
    ADD CONSTRAINT "ai_treatment_responses_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."ai_scenario_responses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."ai_triage_responses"
    ADD CONSTRAINT "ai_triage_response_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."ai_scenario_responses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."scenario_gradings"
    ADD CONSTRAINT "gradings_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "ai_auditing"."scenario_gradings"
    ADD CONSTRAINT "gradings_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "ai_auditing"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."scenario_chief_complaints"
    ADD CONSTRAINT "scenario_chief_complaints_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."scenario_content"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."scenario_content"
    ADD CONSTRAINT "scenario_content_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."scenario_vitals"
    ADD CONSTRAINT "scenario_vitals_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."scenario_content"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."scenarios"
    ADD CONSTRAINT "scenarios_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_info"."user_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "ai_auditing"."scenarios"
    ADD CONSTRAINT "scenarios_author_id_fkey1" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "ai_auditing"."triage_chief_complaints"
    ADD CONSTRAINT "triage_chief_complaints_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."ai_scenario_responses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."triage_forms"
    ADD CONSTRAINT "triage_forms_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "user_info"."user_profiles"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "ai_auditing"."triage_forms"
    ADD CONSTRAINT "triage_forms_author_id_fkey1" FOREIGN KEY ("author_id") REFERENCES "auth"."users"("id") ON DELETE RESTRICT;



ALTER TABLE ONLY "ai_auditing"."triage_forms"
    ADD CONSTRAINT "triage_forms_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."scenarios"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "ai_auditing"."triage_forms"
    ADD CONSTRAINT "triage_forms_scenario_id_fkey" FOREIGN KEY ("scenario_id") REFERENCES "ai_auditing"."scenarios"("id");



ALTER TABLE ONLY "ai_auditing"."triage_vitals"
    ADD CONSTRAINT "triage_vitals_id_fkey" FOREIGN KEY ("id") REFERENCES "ai_auditing"."ai_scenario_responses"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "user_info"."clinician_profiles"
    ADD CONSTRAINT "clinician_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "user_info"."user_profiles"("id");



ALTER TABLE ONLY "user_info"."user_metrics"
    ADD CONSTRAINT "user_metrics_id_fkey" FOREIGN KEY ("id") REFERENCES "user_info"."user_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "user_info"."user_metrics"
    ADD CONSTRAINT "user_metrics_id_fkey1" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "user_info"."user_profiles"
    ADD CONSTRAINT "user_profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "user_info"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "user_info"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey1" FOREIGN KEY ("user_id") REFERENCES "user_info"."user_profiles"("id");



CREATE POLICY "Allow authenticated SELECT on public rows" ON "ai_auditing"."ai_scenario_responses" FOR SELECT TO "authenticated" USING (("public" = true));



CREATE POLICY "Allow authenticated SELECT on public rows" ON "ai_auditing"."scenario_content" FOR SELECT TO "authenticated" USING (("public" = true));



CREATE POLICY "Allow authenticated SELECT on public rows" ON "ai_auditing"."scenario_gradings" FOR SELECT TO "authenticated" USING (("public" = true));



CREATE POLICY "Allow authenticated SELECT on public rows" ON "ai_auditing"."scenarios" FOR SELECT TO "authenticated" USING (("public" = true));



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."ai_diagnosis_responses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."ai_scenario_responses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."ai_treatment_responses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."ai_triage_responses" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."scenario_chief_complaints" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."scenario_content" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."scenario_gradings" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."scenario_vitals" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."scenarios" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."triage_chief_complaints" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."triage_forms" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "ai_auditing"."triage_vitals" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all auth users" ON "ai_auditing"."scenario_vitals" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "ai_auditing"."ai_diagnosis_responses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "ai_auditing"."ai_treatment_responses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "ai_auditing"."ai_triage_responses" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "ai_auditing"."scenario_chief_complaints" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable read access for all users" ON "ai_auditing"."triage_chief_complaints" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "ai_auditing"."triage_vitals" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "ai_auditing"."triage_forms" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "ai_auditing"."ai_diagnosis_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."ai_scenario_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."ai_treatment_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."ai_triage_responses" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."scenario_chief_complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."scenario_content" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."scenario_gradings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."scenario_vitals" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."scenarios" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."triage_chief_complaints" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."triage_forms" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "ai_auditing"."triage_vitals" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Enable insert access for all users" ON "public"."access_requests" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable users to view their own data only" ON "public"."access_requests" FOR SELECT TO "authenticated" USING (true);



ALTER TABLE "public"."access_requests" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "Enable insert for authenticated users only" ON "user_info"."user_profiles" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable read access for all users" ON "user_info"."role_permissions" FOR SELECT USING (true);



CREATE POLICY "Enable read access for all users" ON "user_info"."user_roles" FOR SELECT USING (true);



CREATE POLICY "Enable read access for authenticated users" ON "user_info"."user_profiles" FOR SELECT TO "authenticated", "supabase_admin" USING (true);



CREATE POLICY "Enable users to view their own data only" ON "user_info"."clinician_profiles" FOR SELECT TO "authenticated", "supabase_admin" USING ((( SELECT "auth"."uid"() AS "uid") = "user_id"));



ALTER TABLE "user_info"."clinician_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "user_info"."role_permissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "user_info"."user_metrics" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "user_info"."user_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "user_info"."user_roles" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "ai_auditing" TO "anon";
GRANT USAGE ON SCHEMA "ai_auditing" TO "admin";
GRANT USAGE ON SCHEMA "ai_auditing" TO "authenticated";
GRANT USAGE ON SCHEMA "ai_auditing" TO "service_role";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";
GRANT USAGE ON SCHEMA "public" TO "supabase_auth_admin";



GRANT USAGE ON SCHEMA "user_info" TO "anon";
GRANT USAGE ON SCHEMA "user_info" TO "admin";
GRANT USAGE ON SCHEMA "user_info" TO "authenticated";
GRANT USAGE ON SCHEMA "user_info" TO "service_role";
GRANT USAGE ON SCHEMA "user_info" TO "supabase_auth_admin";






















































































































































GRANT ALL ON FUNCTION "user_info"."append_graded_by"("row_id" "uuid", "user_id" "text") TO "anon";
GRANT ALL ON FUNCTION "user_info"."append_graded_by"("row_id" "uuid", "user_id" "text") TO "authenticated";
GRANT ALL ON FUNCTION "user_info"."append_graded_by"("row_id" "uuid", "user_id" "text") TO "service_role";



GRANT ALL ON FUNCTION "user_info"."authorize"("requested_permission" "text") TO "anon";
GRANT ALL ON FUNCTION "user_info"."authorize"("requested_permission" "text") TO "authenticated";
GRANT ALL ON FUNCTION "user_info"."authorize"("requested_permission" "text") TO "service_role";



GRANT ALL ON FUNCTION "user_info"."get_claim"("claim" "text") TO "anon";
GRANT ALL ON FUNCTION "user_info"."get_claim"("claim" "text") TO "authenticated";
GRANT ALL ON FUNCTION "user_info"."get_claim"("claim" "text") TO "service_role";



REVOKE ALL ON FUNCTION "user_info"."pub_sch_user_claim_role_hook"("event" "jsonb") FROM PUBLIC;
GRANT ALL ON FUNCTION "user_info"."pub_sch_user_claim_role_hook"("event" "jsonb") TO "service_role";
GRANT ALL ON FUNCTION "user_info"."pub_sch_user_claim_role_hook"("event" "jsonb") TO "supabase_auth_admin";












GRANT ALL ON TABLE "ai_auditing"."ai_diagnosis_responses" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."ai_diagnosis_responses" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."ai_diagnosis_responses" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."ai_diagnosis_responses" TO "admin";



GRANT ALL ON TABLE "ai_auditing"."ai_scenario_responses" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."ai_scenario_responses" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."ai_scenario_responses" TO "admin";
GRANT ALL ON TABLE "ai_auditing"."ai_scenario_responses" TO "service_role";



GRANT ALL ON TABLE "ai_auditing"."ai_treatment_responses" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."ai_treatment_responses" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."ai_treatment_responses" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."ai_treatment_responses" TO "admin";



GRANT ALL ON TABLE "ai_auditing"."ai_triage_responses" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."ai_triage_responses" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."ai_triage_responses" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."ai_triage_responses" TO "admin";



GRANT ALL ON TABLE "ai_auditing"."scenario_chief_complaints" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."scenario_chief_complaints" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."scenario_chief_complaints" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."scenario_chief_complaints" TO "admin";



GRANT ALL ON TABLE "ai_auditing"."scenario_content" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."scenario_content" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."scenario_content" TO "admin";
GRANT ALL ON TABLE "ai_auditing"."scenario_content" TO "service_role";



GRANT ALL ON TABLE "ai_auditing"."scenario_gradings" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."scenario_gradings" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."scenario_gradings" TO "admin";
GRANT ALL ON TABLE "ai_auditing"."scenario_gradings" TO "service_role";



GRANT ALL ON TABLE "ai_auditing"."scenario_vitals" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."scenario_vitals" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."scenario_vitals" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."scenario_vitals" TO "admin";



GRANT ALL ON TABLE "ai_auditing"."scenarios" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."scenarios" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."scenarios" TO "admin";
GRANT ALL ON TABLE "ai_auditing"."scenarios" TO "service_role";



GRANT ALL ON TABLE "ai_auditing"."triage_chief_complaints" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."triage_chief_complaints" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."triage_chief_complaints" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."triage_chief_complaints" TO "admin";



GRANT ALL ON TABLE "ai_auditing"."triage_forms" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."triage_forms" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."triage_forms" TO "admin";
GRANT ALL ON TABLE "ai_auditing"."triage_forms" TO "service_role";



GRANT ALL ON TABLE "ai_auditing"."triage_vitals" TO "anon";
GRANT ALL ON TABLE "ai_auditing"."triage_vitals" TO "authenticated";
GRANT ALL ON TABLE "ai_auditing"."triage_vitals" TO "service_role";
GRANT ALL ON TABLE "ai_auditing"."triage_vitals" TO "admin";









GRANT ALL ON TABLE "public"."access_requests" TO "anon";
GRANT ALL ON TABLE "public"."access_requests" TO "authenticated";
GRANT ALL ON TABLE "public"."access_requests" TO "service_role";



GRANT ALL ON TABLE "user_info"."clinician_profiles" TO "anon";
GRANT ALL ON TABLE "user_info"."clinician_profiles" TO "authenticated";
GRANT ALL ON TABLE "user_info"."clinician_profiles" TO "admin";
GRANT ALL ON TABLE "user_info"."clinician_profiles" TO "service_role";



GRANT ALL ON TABLE "user_info"."user_profiles" TO "anon";
GRANT ALL ON TABLE "user_info"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "user_info"."user_profiles" TO "admin";
GRANT ALL ON TABLE "user_info"."user_profiles" TO "service_role";



GRANT ALL ON TABLE "user_info"."full_user_profiles" TO "anon";
GRANT ALL ON TABLE "user_info"."full_user_profiles" TO "authenticated";
GRANT ALL ON TABLE "user_info"."full_user_profiles" TO "service_role";
GRANT ALL ON TABLE "user_info"."full_user_profiles" TO "admin";



GRANT ALL ON TABLE "user_info"."role_permissions" TO "anon";
GRANT ALL ON TABLE "user_info"."role_permissions" TO "authenticated";
GRANT ALL ON TABLE "user_info"."role_permissions" TO "service_role";



GRANT ALL ON SEQUENCE "user_info"."role_permissions_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "user_info"."role_permissions_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "user_info"."role_permissions_id_seq" TO "service_role";



GRANT ALL ON TABLE "user_info"."user_metrics" TO "anon";
GRANT ALL ON TABLE "user_info"."user_metrics" TO "authenticated";
GRANT ALL ON TABLE "user_info"."user_metrics" TO "admin";
GRANT ALL ON TABLE "user_info"."user_metrics" TO "service_role";



GRANT ALL ON TABLE "user_info"."user_roles" TO "anon";
GRANT ALL ON TABLE "user_info"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "user_info"."user_roles" TO "service_role";



GRANT ALL ON SEQUENCE "user_info"."user_roles_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "user_info"."user_roles_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "user_info"."user_roles_id_seq" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON SEQUENCES TO "admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON FUNCTIONS TO "admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON TABLES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "ai_auditing" GRANT ALL ON TABLES TO "admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON SEQUENCES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON SEQUENCES TO "admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON FUNCTIONS TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON FUNCTIONS TO "admin";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON TABLES TO "service_role";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "user_info" GRANT ALL ON TABLES TO "admin";




























