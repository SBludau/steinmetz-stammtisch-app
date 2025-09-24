--
-- PostgreSQL database dump
--

\restrict fnvdvz99tVqGIlEapQa20afXiTdllEg8gyhJOZrPty0xmta6QH91e1yVNuWqhRZ

-- Dumped from database version 17.4
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

DROP EVENT TRIGGER IF EXISTS pgrst_drop_watch;
DROP EVENT TRIGGER IF EXISTS pgrst_ddl_watch;
DROP EVENT TRIGGER IF EXISTS issue_pg_net_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_graphql_access;
DROP EVENT TRIGGER IF EXISTS issue_pg_cron_access;
DROP EVENT TRIGGER IF EXISTS issue_graphql_placeholder;
DROP PUBLICATION IF EXISTS supabase_realtime_messages_publication;
DROP PUBLICATION IF EXISTS supabase_realtime;
DROP POLICY IF EXISTS image_write_own_folder ON storage.objects;
DROP POLICY IF EXISTS image_update_own ON storage.objects;
DROP POLICY IF EXISTS image_read_authed ON storage.objects;
DROP POLICY IF EXISTS image_delete_own ON storage.objects;
DROP POLICY IF EXISTS avatars_update_own ON storage.objects;
DROP POLICY IF EXISTS avatars_read_public ON storage.objects;
DROP POLICY IF EXISTS avatars_insert_own ON storage.objects;
DROP POLICY IF EXISTS avatars_delete_own ON storage.objects;
DROP POLICY IF EXISTS update_own_profile ON public.profiles;
DROP POLICY IF EXISTS stammtisch_update_own ON public.stammtisch;
DROP POLICY IF EXISTS stammtisch_update_legacy ON public.stammtisch;
DROP POLICY IF EXISTS stammtisch_read_all_authed ON public.stammtisch;
DROP POLICY IF EXISTS stammtisch_insert_own ON public.stammtisch;
DROP POLICY IF EXISTS stammtisch_delete_own ON public.stammtisch;
DROP POLICY IF EXISTS stammtisch_delete_legacy ON public.stammtisch;
DROP POLICY IF EXISTS spul_update ON public.stammtisch_participants_unlinked;
DROP POLICY IF EXISTS spul_select ON public.stammtisch_participants_unlinked;
DROP POLICY IF EXISTS spul_insert ON public.stammtisch_participants_unlinked;
DROP POLICY IF EXISTS spul_delete ON public.stammtisch_participants_unlinked;
DROP POLICY IF EXISTS sp_update_all ON public.stammtisch_participants;
DROP POLICY IF EXISTS sp_select_all ON public.stammtisch_participants;
DROP POLICY IF EXISTS sp_insert_all ON public.stammtisch_participants;
DROP POLICY IF EXISTS sp_delete_all ON public.stammtisch_participants;
DROP POLICY IF EXISTS read_own_profile ON public.profiles;
DROP POLICY IF EXISTS "read events public" ON public.stammtisch;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_upd_own_row ON public.profiles;
DROP POLICY IF EXISTS profiles_upd_admin_any ON public.profiles;
DROP POLICY IF EXISTS profiles_sel_unlinked ON public.profiles;
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
DROP POLICY IF EXISTS profiles_read_all_authed ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profile_claims_upd_super ON public.profile_claims;
DROP POLICY IF EXISTS profile_claims_upd_cancel_own ON public.profile_claims;
DROP POLICY IF EXISTS profile_claims_sel_super ON public.profile_claims;
DROP POLICY IF EXISTS profile_claims_sel_own ON public.profile_claims;
DROP POLICY IF EXISTS profile_claims_ins_member ON public.profile_claims;
DROP POLICY IF EXISTS participants_write_self ON public.stammtisch_participants;
DROP POLICY IF EXISTS participants_read_authed ON public.stammtisch_participants;
DROP POLICY IF EXISTS insert_own_profile ON public.profiles;
DROP POLICY IF EXISTS br_update_all ON public.birthday_rounds;
DROP POLICY IF EXISTS br_select_all ON public.birthday_rounds;
DROP POLICY IF EXISTS br_insert_all ON public.birthday_rounds;
DROP POLICY IF EXISTS app_settings_update_admin ON public.app_settings;
DROP POLICY IF EXISTS app_settings_select_vegas ON public.app_settings;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_upload_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_bucket_id_fkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS "prefixes_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS "objects_bucketId_fkey";
ALTER TABLE IF EXISTS ONLY public.stammtisch_participants_unlinked DROP CONSTRAINT IF EXISTS stammtisch_participants_unlinked_stammtisch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stammtisch_participants_unlinked DROP CONSTRAINT IF EXISTS stammtisch_participants_unlinked_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stammtisch_participants DROP CONSTRAINT IF EXISTS stammtisch_participants_stammtisch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.stammtisch_participants DROP CONSTRAINT IF EXISTS stammtisch_participants_auth_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_auth_fk;
ALTER TABLE IF EXISTS ONLY public.profile_claims DROP CONSTRAINT IF EXISTS profile_claims_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profile_claims DROP CONSTRAINT IF EXISTS profile_claims_claimant_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.profile_claims DROP CONSTRAINT IF EXISTS profile_claims_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_settled_stammtisch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_profile_id_fkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_first_due_stammtisch_id_fkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_auth_user_id_fkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_approved_by_fkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_flow_state_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_sso_provider_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_user_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_auth_factor_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_fkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_user_id_fkey;
DROP TRIGGER IF EXISTS update_objects_updated_at ON storage.objects;
DROP TRIGGER IF EXISTS prefixes_delete_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS prefixes_create_hierarchy ON storage.prefixes;
DROP TRIGGER IF EXISTS objects_update_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_insert_create_prefix ON storage.objects;
DROP TRIGGER IF EXISTS objects_delete_delete_prefix ON storage.objects;
DROP TRIGGER IF EXISTS enforce_bucket_name_length_trigger ON storage.buckets;
DROP TRIGGER IF EXISTS tr_check_filters ON realtime.subscription;
DROP TRIGGER IF EXISTS trg_profiles_member_column_guard ON public.profiles;
DROP TRIGGER IF EXISTS trg_profile_claims_apply_on_approve ON public.profile_claims;
DROP TRIGGER IF EXISTS trg_app_settings_set_updated_at ON public.app_settings;
DROP TRIGGER IF EXISTS set_owner_before_insert ON public.stammtisch;
DROP TRIGGER IF EXISTS set_created_by_stammtisch ON public.stammtisch;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP INDEX IF EXISTS storage.objects_bucket_id_level_idx;
DROP INDEX IF EXISTS storage.name_prefix_search;
DROP INDEX IF EXISTS storage.idx_prefixes_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_lower_name;
DROP INDEX IF EXISTS storage.idx_objects_bucket_id_name;
DROP INDEX IF EXISTS storage.idx_name_bucket_level_unique;
DROP INDEX IF EXISTS storage.idx_multipart_uploads_list;
DROP INDEX IF EXISTS storage.bucketid_objname;
DROP INDEX IF EXISTS storage.bname;
DROP INDEX IF EXISTS realtime.subscription_subscription_id_entity_filters_key;
DROP INDEX IF EXISTS realtime.ix_realtime_subscription_entity;
DROP INDEX IF EXISTS public.idx_stammtisch_date;
DROP INDEX IF EXISTS public.idx_stammtisch_created_by;
DROP INDEX IF EXISTS public.idx_profile_claims_unique_user_profile;
DROP INDEX IF EXISTS public.idx_profile_claims_one_active_per_profile;
DROP INDEX IF EXISTS public.birthday_rounds_profile_month_uq;
DROP INDEX IF EXISTS public.birthday_rounds_profile_due_uq;
DROP INDEX IF EXISTS public.birthday_rounds_due_month_idx;
DROP INDEX IF EXISTS public.birthday_rounds_auth_user_idx;
DROP INDEX IF EXISTS public.birthday_rounds_auth_due_uq;
DROP INDEX IF EXISTS auth.users_is_anonymous_idx;
DROP INDEX IF EXISTS auth.users_instance_id_idx;
DROP INDEX IF EXISTS auth.users_instance_id_email_idx;
DROP INDEX IF EXISTS auth.users_email_partial_key;
DROP INDEX IF EXISTS auth.user_id_created_at_idx;
DROP INDEX IF EXISTS auth.unique_phone_factor_per_user;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_pattern_idx;
DROP INDEX IF EXISTS auth.sso_providers_resource_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.sso_domains_domain_idx;
DROP INDEX IF EXISTS auth.sessions_user_id_idx;
DROP INDEX IF EXISTS auth.sessions_not_after_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_for_email_idx;
DROP INDEX IF EXISTS auth.saml_relay_states_created_at_idx;
DROP INDEX IF EXISTS auth.saml_providers_sso_provider_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_updated_at_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_session_id_revoked_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_parent_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_user_id_idx;
DROP INDEX IF EXISTS auth.refresh_tokens_instance_id_idx;
DROP INDEX IF EXISTS auth.recovery_token_idx;
DROP INDEX IF EXISTS auth.reauthentication_token_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_user_id_token_type_key;
DROP INDEX IF EXISTS auth.one_time_tokens_token_hash_hash_idx;
DROP INDEX IF EXISTS auth.one_time_tokens_relates_to_hash_idx;
DROP INDEX IF EXISTS auth.oauth_clients_deleted_at_idx;
DROP INDEX IF EXISTS auth.oauth_clients_client_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_id_idx;
DROP INDEX IF EXISTS auth.mfa_factors_user_friendly_name_unique;
DROP INDEX IF EXISTS auth.mfa_challenge_created_at_idx;
DROP INDEX IF EXISTS auth.idx_user_id_auth_method;
DROP INDEX IF EXISTS auth.idx_auth_code;
DROP INDEX IF EXISTS auth.identities_user_id_idx;
DROP INDEX IF EXISTS auth.identities_email_idx;
DROP INDEX IF EXISTS auth.flow_state_created_at_idx;
DROP INDEX IF EXISTS auth.factor_id_created_at_idx;
DROP INDEX IF EXISTS auth.email_change_token_new_idx;
DROP INDEX IF EXISTS auth.email_change_token_current_idx;
DROP INDEX IF EXISTS auth.confirmation_token_idx;
DROP INDEX IF EXISTS auth.audit_logs_instance_id_idx;
ALTER TABLE IF EXISTS ONLY supabase_migrations.seed_files DROP CONSTRAINT IF EXISTS seed_files_pkey;
ALTER TABLE IF EXISTS ONLY supabase_migrations.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads DROP CONSTRAINT IF EXISTS s3_multipart_uploads_pkey;
ALTER TABLE IF EXISTS ONLY storage.s3_multipart_uploads_parts DROP CONSTRAINT IF EXISTS s3_multipart_uploads_parts_pkey;
ALTER TABLE IF EXISTS ONLY storage.prefixes DROP CONSTRAINT IF EXISTS prefixes_pkey;
ALTER TABLE IF EXISTS ONLY storage.objects DROP CONSTRAINT IF EXISTS objects_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_pkey;
ALTER TABLE IF EXISTS ONLY storage.migrations DROP CONSTRAINT IF EXISTS migrations_name_key;
ALTER TABLE IF EXISTS ONLY storage.buckets DROP CONSTRAINT IF EXISTS buckets_pkey;
ALTER TABLE IF EXISTS ONLY storage.buckets_analytics DROP CONSTRAINT IF EXISTS buckets_analytics_pkey;
ALTER TABLE IF EXISTS ONLY realtime.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY realtime.subscription DROP CONSTRAINT IF EXISTS pk_subscription;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_23 DROP CONSTRAINT IF EXISTS messages_2025_09_23_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_22 DROP CONSTRAINT IF EXISTS messages_2025_09_22_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_21 DROP CONSTRAINT IF EXISTS messages_2025_09_21_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_20 DROP CONSTRAINT IF EXISTS messages_2025_09_20_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_19 DROP CONSTRAINT IF EXISTS messages_2025_09_19_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_18 DROP CONSTRAINT IF EXISTS messages_2025_09_18_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages_2025_09_17 DROP CONSTRAINT IF EXISTS messages_2025_09_17_pkey;
ALTER TABLE IF EXISTS ONLY realtime.messages DROP CONSTRAINT IF EXISTS messages_pkey;
ALTER TABLE IF EXISTS ONLY public.stammtisch DROP CONSTRAINT IF EXISTS stammtisch_pkey;
ALTER TABLE IF EXISTS ONLY public.stammtisch_participants_unlinked DROP CONSTRAINT IF EXISTS stammtisch_participants_unlinked_pkey;
ALTER TABLE IF EXISTS ONLY public.stammtisch_participants DROP CONSTRAINT IF EXISTS stammtisch_participants_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_pkey;
ALTER TABLE IF EXISTS ONLY public.profiles DROP CONSTRAINT IF EXISTS profiles_auth_user_id_key;
ALTER TABLE IF EXISTS ONLY public.profile_claims DROP CONSTRAINT IF EXISTS profile_claims_pkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_pkey;
ALTER TABLE IF EXISTS ONLY public.birthday_rounds DROP CONSTRAINT IF EXISTS birthday_rounds_auth_due_uniq;
ALTER TABLE IF EXISTS ONLY public.app_settings DROP CONSTRAINT IF EXISTS app_settings_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_pkey;
ALTER TABLE IF EXISTS ONLY auth.users DROP CONSTRAINT IF EXISTS users_phone_key;
ALTER TABLE IF EXISTS ONLY auth.sso_providers DROP CONSTRAINT IF EXISTS sso_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.sso_domains DROP CONSTRAINT IF EXISTS sso_domains_pkey;
ALTER TABLE IF EXISTS ONLY auth.sessions DROP CONSTRAINT IF EXISTS sessions_pkey;
ALTER TABLE IF EXISTS ONLY auth.schema_migrations DROP CONSTRAINT IF EXISTS schema_migrations_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_relay_states DROP CONSTRAINT IF EXISTS saml_relay_states_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_pkey;
ALTER TABLE IF EXISTS ONLY auth.saml_providers DROP CONSTRAINT IF EXISTS saml_providers_entity_id_key;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_token_unique;
ALTER TABLE IF EXISTS ONLY auth.refresh_tokens DROP CONSTRAINT IF EXISTS refresh_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.one_time_tokens DROP CONSTRAINT IF EXISTS one_time_tokens_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_pkey;
ALTER TABLE IF EXISTS ONLY auth.oauth_clients DROP CONSTRAINT IF EXISTS oauth_clients_client_id_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_factors DROP CONSTRAINT IF EXISTS mfa_factors_last_challenged_at_key;
ALTER TABLE IF EXISTS ONLY auth.mfa_challenges DROP CONSTRAINT IF EXISTS mfa_challenges_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS mfa_amr_claims_session_id_authentication_method_pkey;
ALTER TABLE IF EXISTS ONLY auth.instances DROP CONSTRAINT IF EXISTS instances_pkey;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_provider_id_provider_unique;
ALTER TABLE IF EXISTS ONLY auth.identities DROP CONSTRAINT IF EXISTS identities_pkey;
ALTER TABLE IF EXISTS ONLY auth.flow_state DROP CONSTRAINT IF EXISTS flow_state_pkey;
ALTER TABLE IF EXISTS ONLY auth.audit_log_entries DROP CONSTRAINT IF EXISTS audit_log_entries_pkey;
ALTER TABLE IF EXISTS ONLY auth.mfa_amr_claims DROP CONSTRAINT IF EXISTS amr_id_pk;
ALTER TABLE IF EXISTS public.stammtisch ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.profiles ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.profile_claims ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS public.birthday_rounds ALTER COLUMN id DROP DEFAULT;
ALTER TABLE IF EXISTS auth.refresh_tokens ALTER COLUMN id DROP DEFAULT;
DROP TABLE IF EXISTS supabase_migrations.seed_files;
DROP TABLE IF EXISTS supabase_migrations.schema_migrations;
DROP TABLE IF EXISTS storage.s3_multipart_uploads_parts;
DROP TABLE IF EXISTS storage.s3_multipart_uploads;
DROP TABLE IF EXISTS storage.prefixes;
DROP TABLE IF EXISTS storage.objects;
DROP TABLE IF EXISTS storage.migrations;
DROP TABLE IF EXISTS storage.buckets_analytics;
DROP TABLE IF EXISTS storage.buckets;
DROP TABLE IF EXISTS realtime.subscription;
DROP TABLE IF EXISTS realtime.schema_migrations;
DROP TABLE IF EXISTS realtime.messages_2025_09_23;
DROP TABLE IF EXISTS realtime.messages_2025_09_22;
DROP TABLE IF EXISTS realtime.messages_2025_09_21;
DROP TABLE IF EXISTS realtime.messages_2025_09_20;
DROP TABLE IF EXISTS realtime.messages_2025_09_19;
DROP TABLE IF EXISTS realtime.messages_2025_09_18;
DROP TABLE IF EXISTS realtime.messages_2025_09_17;
DROP TABLE IF EXISTS realtime.messages;
DROP TABLE IF EXISTS public.stammtisch_participants_unlinked;
DROP TABLE IF EXISTS public.stammtisch_participants;
DROP SEQUENCE IF EXISTS public.stammtisch_id_seq;
DROP TABLE IF EXISTS public.stammtisch;
DROP SEQUENCE IF EXISTS public.profiles_id_seq;
DROP TABLE IF EXISTS public.profiles;
DROP SEQUENCE IF EXISTS public.profile_claims_id_seq;
DROP TABLE IF EXISTS public.profile_claims;
DROP SEQUENCE IF EXISTS public.birthday_rounds_id_seq;
DROP TABLE IF EXISTS public.birthday_rounds;
DROP TABLE IF EXISTS public.app_settings;
DROP TABLE IF EXISTS auth.users;
DROP TABLE IF EXISTS auth.sso_providers;
DROP TABLE IF EXISTS auth.sso_domains;
DROP TABLE IF EXISTS auth.sessions;
DROP TABLE IF EXISTS auth.schema_migrations;
DROP TABLE IF EXISTS auth.saml_relay_states;
DROP TABLE IF EXISTS auth.saml_providers;
DROP SEQUENCE IF EXISTS auth.refresh_tokens_id_seq;
DROP TABLE IF EXISTS auth.refresh_tokens;
DROP TABLE IF EXISTS auth.one_time_tokens;
DROP TABLE IF EXISTS auth.oauth_clients;
DROP TABLE IF EXISTS auth.mfa_factors;
DROP TABLE IF EXISTS auth.mfa_challenges;
DROP TABLE IF EXISTS auth.mfa_amr_claims;
DROP TABLE IF EXISTS auth.instances;
DROP TABLE IF EXISTS auth.identities;
DROP TABLE IF EXISTS auth.flow_state;
DROP TABLE IF EXISTS auth.audit_log_entries;
DROP FUNCTION IF EXISTS storage.update_updated_at_column();
DROP FUNCTION IF EXISTS storage.search_v2(prefix text, bucket_name text, limits integer, levels integer, start_after text);
DROP FUNCTION IF EXISTS storage.search_v1_optimised(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search_legacy_v1(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.search(prefix text, bucketname text, limits integer, levels integer, offsets integer, search text, sortcolumn text, sortorder text);
DROP FUNCTION IF EXISTS storage.prefixes_insert_trigger();
DROP FUNCTION IF EXISTS storage.operation();
DROP FUNCTION IF EXISTS storage.objects_update_prefix_trigger();
DROP FUNCTION IF EXISTS storage.objects_insert_prefix_trigger();
DROP FUNCTION IF EXISTS storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, start_after text, next_token text);
DROP FUNCTION IF EXISTS storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer, next_key_token text, next_upload_token text);
DROP FUNCTION IF EXISTS storage.get_size_by_bucket();
DROP FUNCTION IF EXISTS storage.get_prefixes(name text);
DROP FUNCTION IF EXISTS storage.get_prefix(name text);
DROP FUNCTION IF EXISTS storage.get_level(name text);
DROP FUNCTION IF EXISTS storage.foldername(name text);
DROP FUNCTION IF EXISTS storage.filename(name text);
DROP FUNCTION IF EXISTS storage.extension(name text);
DROP FUNCTION IF EXISTS storage.enforce_bucket_name_length();
DROP FUNCTION IF EXISTS storage.delete_prefix_hierarchy_trigger();
DROP FUNCTION IF EXISTS storage.delete_prefix(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb);
DROP FUNCTION IF EXISTS storage.add_prefixes(_bucket_id text, _name text);
DROP FUNCTION IF EXISTS realtime.topic();
DROP FUNCTION IF EXISTS realtime.to_regrole(role_name text);
DROP FUNCTION IF EXISTS realtime.subscription_check_filters();
DROP FUNCTION IF EXISTS realtime.send(payload jsonb, event text, topic text, private boolean);
DROP FUNCTION IF EXISTS realtime.quote_wal2json(entity regclass);
DROP FUNCTION IF EXISTS realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer);
DROP FUNCTION IF EXISTS realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]);
DROP FUNCTION IF EXISTS realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text);
DROP FUNCTION IF EXISTS realtime."cast"(val text, type_ regtype);
DROP FUNCTION IF EXISTS realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]);
DROP FUNCTION IF EXISTS realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text);
DROP FUNCTION IF EXISTS realtime.apply_rls(wal jsonb, max_record_bytes integer);
DROP FUNCTION IF EXISTS public.tg_app_settings_set_updated_at();
DROP FUNCTION IF EXISTS public.stammtisch_set_owner();
DROP FUNCTION IF EXISTS public.set_vegas_settings_bootstrap(p_start_amount numeric, p_start_date date);
DROP FUNCTION IF EXISTS public.set_vegas_settings(p_start_amount numeric, p_start_date date);
DROP FUNCTION IF EXISTS public.set_created_by();
DROP FUNCTION IF EXISTS public.seed_birthday_rounds(p_due_month date, p_stammtisch_id bigint);
DROP FUNCTION IF EXISTS public.public_get_google_avatars(p_user_ids uuid[]);
DROP FUNCTION IF EXISTS public.profiles_member_column_guard();
DROP FUNCTION IF EXISTS public.profile_claims_apply_on_approve();
DROP FUNCTION IF EXISTS public.is_superuser();
DROP FUNCTION IF EXISTS public.is_current_user_admin();
DROP FUNCTION IF EXISTS public.is_admin_current_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.current_profile_role();
DROP FUNCTION IF EXISTS public.confirm_profile_claim(p_profile_id bigint, p_user uuid);
DROP FUNCTION IF EXISTS public.admin_unlink_profile(p_profile_id bigint);
DROP FUNCTION IF EXISTS public.admin_set_role(p_profile_id bigint, p_role public.profile_role);
DROP FUNCTION IF EXISTS public.admin_give_unlinked_birthday_round(p_profile_id bigint, p_stammtisch_id bigint, p_due_month date);
DROP FUNCTION IF EXISTS public.admin_delete_stammtisch(p_id integer);
DROP FUNCTION IF EXISTS public.admin_delete_round(p_id bigint);
DROP FUNCTION IF EXISTS public.admin_delete_profile(p_profile_id bigint);
DROP FUNCTION IF EXISTS public.admin_approve_round(p_id bigint);
DROP FUNCTION IF EXISTS pgbouncer.get_auth(p_usename text);
DROP FUNCTION IF EXISTS extensions.set_graphql_placeholder();
DROP FUNCTION IF EXISTS extensions.pgrst_drop_watch();
DROP FUNCTION IF EXISTS extensions.pgrst_ddl_watch();
DROP FUNCTION IF EXISTS extensions.grant_pg_net_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_graphql_access();
DROP FUNCTION IF EXISTS extensions.grant_pg_cron_access();
DROP FUNCTION IF EXISTS auth.uid();
DROP FUNCTION IF EXISTS auth.role();
DROP FUNCTION IF EXISTS auth.jwt();
DROP FUNCTION IF EXISTS auth.email();
DROP TYPE IF EXISTS storage.buckettype;
DROP TYPE IF EXISTS realtime.wal_rls;
DROP TYPE IF EXISTS realtime.wal_column;
DROP TYPE IF EXISTS realtime.user_defined_filter;
DROP TYPE IF EXISTS realtime.equality_op;
DROP TYPE IF EXISTS realtime.action;
DROP TYPE IF EXISTS public.profile_role;
DROP TYPE IF EXISTS public.claim_status;
DROP TYPE IF EXISTS public.academic_degree;
DROP TYPE IF EXISTS auth.one_time_token_type;
DROP TYPE IF EXISTS auth.oauth_registration_type;
DROP TYPE IF EXISTS auth.factor_type;
DROP TYPE IF EXISTS auth.factor_status;
DROP TYPE IF EXISTS auth.code_challenge_method;
DROP TYPE IF EXISTS auth.aal_level;
DROP EXTENSION IF EXISTS "uuid-ossp";
DROP EXTENSION IF EXISTS supabase_vault;
DROP EXTENSION IF EXISTS pgcrypto;
DROP EXTENSION IF EXISTS pg_stat_statements;
DROP EXTENSION IF EXISTS pg_graphql;
DROP SCHEMA IF EXISTS vault;
DROP SCHEMA IF EXISTS supabase_migrations;
DROP SCHEMA IF EXISTS storage;
DROP SCHEMA IF EXISTS realtime;
DROP SCHEMA IF EXISTS pgbouncer;
DROP SCHEMA IF EXISTS graphql_public;
DROP SCHEMA IF EXISTS graphql;
DROP SCHEMA IF EXISTS extensions;
DROP SCHEMA IF EXISTS auth;
--
-- Name: auth; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA auth;


--
-- Name: extensions; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA extensions;


--
-- Name: graphql; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql;


--
-- Name: graphql_public; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA graphql_public;


--
-- Name: pgbouncer; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA pgbouncer;


--
-- Name: realtime; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA realtime;


--
-- Name: storage; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA storage;


--
-- Name: supabase_migrations; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA supabase_migrations;


--
-- Name: vault; Type: SCHEMA; Schema: -; Owner: -
--

CREATE SCHEMA vault;


--
-- Name: pg_graphql; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_graphql WITH SCHEMA graphql;


--
-- Name: EXTENSION pg_graphql; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_graphql IS 'pg_graphql: GraphQL support';


--
-- Name: pg_stat_statements; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pg_stat_statements WITH SCHEMA extensions;


--
-- Name: EXTENSION pg_stat_statements; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pg_stat_statements IS 'track planning and execution statistics of all SQL statements executed';


--
-- Name: pgcrypto; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;


--
-- Name: EXTENSION pgcrypto; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION pgcrypto IS 'cryptographic functions';


--
-- Name: supabase_vault; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS supabase_vault WITH SCHEMA vault;


--
-- Name: EXTENSION supabase_vault; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION supabase_vault IS 'Supabase Vault Extension';


--
-- Name: uuid-ossp; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA extensions;


--
-- Name: EXTENSION "uuid-ossp"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON EXTENSION "uuid-ossp" IS 'generate universally unique identifiers (UUIDs)';


--
-- Name: aal_level; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.aal_level AS ENUM (
    'aal1',
    'aal2',
    'aal3'
);


--
-- Name: code_challenge_method; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.code_challenge_method AS ENUM (
    's256',
    'plain'
);


--
-- Name: factor_status; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_status AS ENUM (
    'unverified',
    'verified'
);


--
-- Name: factor_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.factor_type AS ENUM (
    'totp',
    'webauthn',
    'phone'
);


--
-- Name: oauth_registration_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.oauth_registration_type AS ENUM (
    'dynamic',
    'manual'
);


--
-- Name: one_time_token_type; Type: TYPE; Schema: auth; Owner: -
--

CREATE TYPE auth.one_time_token_type AS ENUM (
    'confirmation_token',
    'reauthentication_token',
    'recovery_token',
    'email_change_token_new',
    'email_change_token_current',
    'phone_change_token'
);


--
-- Name: academic_degree; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.academic_degree AS ENUM (
    'none',
    'dr',
    'prof'
);


--
-- Name: claim_status; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.claim_status AS ENUM (
    'pending',
    'approved',
    'rejected',
    'cancelled'
);


--
-- Name: profile_role; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public.profile_role AS ENUM (
    'member',
    'superuser',
    'admin'
);


--
-- Name: action; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.action AS ENUM (
    'INSERT',
    'UPDATE',
    'DELETE',
    'TRUNCATE',
    'ERROR'
);


--
-- Name: equality_op; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.equality_op AS ENUM (
    'eq',
    'neq',
    'lt',
    'lte',
    'gt',
    'gte',
    'in'
);


--
-- Name: user_defined_filter; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.user_defined_filter AS (
	column_name text,
	op realtime.equality_op,
	value text
);


--
-- Name: wal_column; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_column AS (
	name text,
	type_name text,
	type_oid oid,
	value jsonb,
	is_pkey boolean,
	is_selectable boolean
);


--
-- Name: wal_rls; Type: TYPE; Schema: realtime; Owner: -
--

CREATE TYPE realtime.wal_rls AS (
	wal jsonb,
	is_rls_enabled boolean,
	subscription_ids uuid[],
	errors text[]
);


--
-- Name: buckettype; Type: TYPE; Schema: storage; Owner: -
--

CREATE TYPE storage.buckettype AS ENUM (
    'STANDARD',
    'ANALYTICS'
);


--
-- Name: email(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.email() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.email', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'email')
  )::text
$$;


--
-- Name: FUNCTION email(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.email() IS 'Deprecated. Use auth.jwt() -> ''email'' instead.';


--
-- Name: jwt(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.jwt() RETURNS jsonb
    LANGUAGE sql STABLE
    AS $$
  select 
    coalesce(
        nullif(current_setting('request.jwt.claim', true), ''),
        nullif(current_setting('request.jwt.claims', true), '')
    )::jsonb
$$;


--
-- Name: role(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.role() RETURNS text
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.role', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role')
  )::text
$$;


--
-- Name: FUNCTION role(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.role() IS 'Deprecated. Use auth.jwt() -> ''role'' instead.';


--
-- Name: uid(); Type: FUNCTION; Schema: auth; Owner: -
--

CREATE FUNCTION auth.uid() RETURNS uuid
    LANGUAGE sql STABLE
    AS $$
  select 
  coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;


--
-- Name: FUNCTION uid(); Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON FUNCTION auth.uid() IS 'Deprecated. Use auth.jwt() -> ''sub'' instead.';


--
-- Name: grant_pg_cron_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_cron_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_cron'
  )
  THEN
    grant usage on schema cron to postgres with grant option;

    alter default privileges in schema cron grant all on tables to postgres with grant option;
    alter default privileges in schema cron grant all on functions to postgres with grant option;
    alter default privileges in schema cron grant all on sequences to postgres with grant option;

    alter default privileges for user supabase_admin in schema cron grant all
        on sequences to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on tables to postgres with grant option;
    alter default privileges for user supabase_admin in schema cron grant all
        on functions to postgres with grant option;

    grant all privileges on all tables in schema cron to postgres with grant option;
    revoke all on table cron.job from postgres;
    grant select on table cron.job to postgres with grant option;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_cron_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_cron_access() IS 'Grants access to pg_cron';


--
-- Name: grant_pg_graphql_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_graphql_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
DECLARE
    func_is_graphql_resolve bool;
BEGIN
    func_is_graphql_resolve = (
        SELECT n.proname = 'resolve'
        FROM pg_event_trigger_ddl_commands() AS ev
        LEFT JOIN pg_catalog.pg_proc AS n
        ON ev.objid = n.oid
    );

    IF func_is_graphql_resolve
    THEN
        -- Update public wrapper to pass all arguments through to the pg_graphql resolve func
        DROP FUNCTION IF EXISTS graphql_public.graphql;
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language sql
        as $$
            select graphql.resolve(
                query := query,
                variables := coalesce(variables, '{}'),
                "operationName" := "operationName",
                extensions := extensions
            );
        $$;

        -- This hook executes when `graphql.resolve` is created. That is not necessarily the last
        -- function in the extension so we need to grant permissions on existing entities AND
        -- update default permissions to any others that are created after `graphql.resolve`
        grant usage on schema graphql to postgres, anon, authenticated, service_role;
        grant select on all tables in schema graphql to postgres, anon, authenticated, service_role;
        grant execute on all functions in schema graphql to postgres, anon, authenticated, service_role;
        grant all on all sequences in schema graphql to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on tables to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on functions to postgres, anon, authenticated, service_role;
        alter default privileges in schema graphql grant all on sequences to postgres, anon, authenticated, service_role;

        -- Allow postgres role to allow granting usage on graphql and graphql_public schemas to custom roles
        grant usage on schema graphql_public to postgres with grant option;
        grant usage on schema graphql to postgres with grant option;
    END IF;

END;
$_$;


--
-- Name: FUNCTION grant_pg_graphql_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_graphql_access() IS 'Grants access to pg_graphql';


--
-- Name: grant_pg_net_access(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.grant_pg_net_access() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_event_trigger_ddl_commands() AS ev
    JOIN pg_extension AS ext
    ON ev.objid = ext.oid
    WHERE ext.extname = 'pg_net'
  )
  THEN
    IF NOT EXISTS (
      SELECT 1
      FROM pg_roles
      WHERE rolname = 'supabase_functions_admin'
    )
    THEN
      CREATE USER supabase_functions_admin NOINHERIT CREATEROLE LOGIN NOREPLICATION;
    END IF;

    GRANT USAGE ON SCHEMA net TO supabase_functions_admin, postgres, anon, authenticated, service_role;

    IF EXISTS (
      SELECT FROM pg_extension
      WHERE extname = 'pg_net'
      -- all versions in use on existing projects as of 2025-02-20
      -- version 0.12.0 onwards don't need these applied
      AND extversion IN ('0.2', '0.6', '0.7', '0.7.1', '0.8', '0.10.0', '0.11.0')
    ) THEN
      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SECURITY DEFINER;

      ALTER function net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;
      ALTER function net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) SET search_path = net;

      REVOKE ALL ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;
      REVOKE ALL ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) FROM PUBLIC;

      GRANT EXECUTE ON FUNCTION net.http_get(url text, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
      GRANT EXECUTE ON FUNCTION net.http_post(url text, body jsonb, params jsonb, headers jsonb, timeout_milliseconds integer) TO supabase_functions_admin, postgres, anon, authenticated, service_role;
    END IF;
  END IF;
END;
$$;


--
-- Name: FUNCTION grant_pg_net_access(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.grant_pg_net_access() IS 'Grants access to pg_net';


--
-- Name: pgrst_ddl_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_ddl_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN SELECT * FROM pg_event_trigger_ddl_commands()
  LOOP
    IF cmd.command_tag IN (
      'CREATE SCHEMA', 'ALTER SCHEMA'
    , 'CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO', 'ALTER TABLE'
    , 'CREATE FOREIGN TABLE', 'ALTER FOREIGN TABLE'
    , 'CREATE VIEW', 'ALTER VIEW'
    , 'CREATE MATERIALIZED VIEW', 'ALTER MATERIALIZED VIEW'
    , 'CREATE FUNCTION', 'ALTER FUNCTION'
    , 'CREATE TRIGGER'
    , 'CREATE TYPE', 'ALTER TYPE'
    , 'CREATE RULE'
    , 'COMMENT'
    )
    -- don't notify in case of CREATE TEMP table or other objects created on pg_temp
    AND cmd.schema_name is distinct from 'pg_temp'
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: pgrst_drop_watch(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.pgrst_drop_watch() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
  obj record;
BEGIN
  FOR obj IN SELECT * FROM pg_event_trigger_dropped_objects()
  LOOP
    IF obj.object_type IN (
      'schema'
    , 'table'
    , 'foreign table'
    , 'view'
    , 'materialized view'
    , 'function'
    , 'trigger'
    , 'type'
    , 'rule'
    )
    AND obj.is_temporary IS false -- no pg_temp objects
    THEN
      NOTIFY pgrst, 'reload schema';
    END IF;
  END LOOP;
END; $$;


--
-- Name: set_graphql_placeholder(); Type: FUNCTION; Schema: extensions; Owner: -
--

CREATE FUNCTION extensions.set_graphql_placeholder() RETURNS event_trigger
    LANGUAGE plpgsql
    AS $_$
    DECLARE
    graphql_is_dropped bool;
    BEGIN
    graphql_is_dropped = (
        SELECT ev.schema_name = 'graphql_public'
        FROM pg_event_trigger_dropped_objects() AS ev
        WHERE ev.schema_name = 'graphql_public'
    );

    IF graphql_is_dropped
    THEN
        create or replace function graphql_public.graphql(
            "operationName" text default null,
            query text default null,
            variables jsonb default null,
            extensions jsonb default null
        )
            returns jsonb
            language plpgsql
        as $$
            DECLARE
                server_version float;
            BEGIN
                server_version = (SELECT (SPLIT_PART((select version()), ' ', 2))::float);

                IF server_version >= 14 THEN
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql extension is not enabled.'
                            )
                        )
                    );
                ELSE
                    RETURN jsonb_build_object(
                        'errors', jsonb_build_array(
                            jsonb_build_object(
                                'message', 'pg_graphql is only available on projects running Postgres 14 onwards.'
                            )
                        )
                    );
                END IF;
            END;
        $$;
    END IF;

    END;
$_$;


--
-- Name: FUNCTION set_graphql_placeholder(); Type: COMMENT; Schema: extensions; Owner: -
--

COMMENT ON FUNCTION extensions.set_graphql_placeholder() IS 'Reintroduces placeholder function for graphql_public.graphql';


--
-- Name: get_auth(text); Type: FUNCTION; Schema: pgbouncer; Owner: -
--

CREATE FUNCTION pgbouncer.get_auth(p_usename text) RETURNS TABLE(username text, password text)
    LANGUAGE plpgsql SECURITY DEFINER
    AS $_$
begin
    raise debug 'PgBouncer auth request: %', p_usename;

    return query
    select 
        rolname::text, 
        case when rolvaliduntil < now() 
            then null 
            else rolpassword::text 
        end 
    from pg_authid 
    where rolname=$1 and rolcanlogin;
end;
$_$;


--
-- Name: admin_approve_round(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_approve_round(p_id bigint) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  if not public.is_admin_current_user() then
    raise exception 'not allowed';
  end if;

  update public.birthday_rounds
     set approved_by = auth.uid(),
         approved_at = now()
   where id = p_id;
end;
$$;


--
-- Name: admin_delete_profile(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_profile(p_profile_id bigint) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not allowed: admin only';
  END IF;

  DELETE FROM public.profiles
  WHERE id = p_profile_id;
END;
$$;


--
-- Name: admin_delete_round(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_round(p_id bigint) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  if not public.is_admin_current_user() then
    raise exception 'not allowed';
  end if;

  delete from public.birthday_rounds
   where id = p_id;
end;
$$;


--
-- Name: admin_delete_stammtisch(integer); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_delete_stammtisch(p_id integer) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
declare
  v_part int := 0;
  v_part_unlinked int := 0;
  v_rounds_cleared int := 0;
  v_st_del int := 0;
begin
  -- Teilnehmer (linked/unlinked) löschen
  delete from public.stammtisch_participants where stammtisch_id = p_id;
  get diagnostics v_part = row_count;

  delete from public.stammtisch_participants_unlinked where stammtisch_id = p_id;
  get diagnostics v_part_unlinked = row_count;

  -- Referenzen in birthday_rounds lösen
  update public.birthday_rounds
     set settled_stammtisch_id = null,
         settled_at = null,
         approved_at = null
   where settled_stammtisch_id = p_id;
  get diagnostics v_rounds_cleared = row_count;

  -- Stammtisch löschen
  delete from public.stammtisch where id = p_id;
  get diagnostics v_st_del = row_count;

  return json_build_object(
    'participants_deleted', v_part,
    'participants_unlinked_deleted', v_part_unlinked,
    'round_refs_cleared', v_rounds_cleared,
    'stammtisch_deleted', v_st_del
  );
end $$;


--
-- Name: admin_give_unlinked_birthday_round(bigint, bigint, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_give_unlinked_birthday_round(p_profile_id bigint, p_stammtisch_id bigint, p_due_month date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'pg_temp'
    AS $$
DECLARE
  v_caller_uid  uuid := auth.uid();
  v_caller_role text;
  v_auth_id     public.profiles.auth_user_id%TYPE;
  v_due         date := date_trunc('month', p_due_month)::date;
BEGIN
  -- nur admin/superuser
  SELECT role INTO v_caller_role
  FROM public.profiles
  WHERE auth_user_id = v_caller_uid;

  IF COALESCE(v_caller_role,'') NOT IN ('admin','superuser') THEN
    RAISE EXCEPTION 'Not allowed: requires admin/superuser.';
  END IF;

  -- Profil laden
  SELECT auth_user_id INTO v_auth_id
  FROM public.profiles
  WHERE id = p_profile_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Profile % not found.', p_profile_id;
  END IF;

  IF v_auth_id IS NOT NULL THEN
    -- verknüpft: Upsert über benannten UNIQUE-Constraint
    INSERT INTO public.birthday_rounds (auth_user_id, due_month, settled_stammtisch_id, settled_at)
    VALUES (v_auth_id, v_due, p_stammtisch_id, NOW())
    ON CONFLICT ON CONSTRAINT birthday_rounds_auth_due_uniq
    DO UPDATE SET
      settled_stammtisch_id = EXCLUDED.settled_stammtisch_id,
      settled_at            = EXCLUDED.settled_at;
  ELSE
    -- unverknüpft: auth_user_id = NULL zulässig (kein Konflikt)
    INSERT INTO public.birthday_rounds (auth_user_id, due_month, settled_stammtisch_id, settled_at)
    VALUES (NULL, v_due, p_stammtisch_id, NOW());
  END IF;
END;
$$;


--
-- Name: admin_set_role(bigint, public.profile_role); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_set_role(p_profile_id bigint, p_role public.profile_role) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not allowed: admin only';
  END IF;

  UPDATE public.profiles
  SET role = p_role
  WHERE id = p_profile_id;
END;
$$;


--
-- Name: admin_unlink_profile(bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.admin_unlink_profile(p_profile_id bigint) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_row public.profiles%ROWTYPE;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'not allowed: admin only';
  END IF;

  SELECT * INTO v_row
  FROM public.profiles
  WHERE id = p_profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile % not found', p_profile_id;
  END IF;

  -- offene Anfragen zurückziehen
  UPDATE public.profile_claims
  SET status = 'cancelled'
  WHERE profile_id = p_profile_id
    AND status = 'pending';

  -- Profil entkoppeln & deaktivieren
  UPDATE public.profiles
  SET auth_user_id = NULL,
      self_check  = FALSE,
      is_active   = FALSE
  WHERE id = p_profile_id;
END;
$$;


--
-- Name: confirm_profile_claim(bigint, uuid); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.confirm_profile_claim(p_profile_id bigint, p_user uuid) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_role_is_super boolean;
  v_row public.profiles%ROWTYPE;
BEGIN
  -- Optional, aber empfehlenswert: sicherstellen, dass wir das richtige Schema sehen
  PERFORM set_config('search_path', 'public, auth', false);

  -- Nur Admin/Superuser dürfen bestätigen
  v_role_is_super := public.is_superuser();
  IF NOT v_role_is_super THEN
    RAISE EXCEPTION 'not allowed: requires superuser/admin';
  END IF;

  -- Ziel-Profil exklusiv sperren
  SELECT *
  INTO v_row
  FROM public.profiles
  WHERE id = p_profile_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'profile % not found', p_profile_id;
  END IF;

  -- Wenn bereits mit anderem User verknüpft: blockieren
  IF v_row.auth_user_id IS NOT NULL AND v_row.auth_user_id <> p_user THEN
    RAISE EXCEPTION 'profile % already linked to a different user', p_profile_id;
  END IF;

  -- Optional: prüfen, ob der User existiert (in auth.users)
  PERFORM 1 FROM auth.users WHERE id = p_user;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'user % not found in auth.users', p_user;
  END IF;

  -- Update: verknüpfen & bestätigen
  UPDATE public.profiles
  SET auth_user_id = COALESCE(v_row.auth_user_id, p_user),
      self_check   = TRUE,
      is_active    = TRUE  -- (zur Sicherheit; Trigger setzt es ohnehin bei self_check=TRUE)
  WHERE id = p_profile_id;

  -- fertig
  RETURN;
END;
$$;


--
-- Name: current_profile_role(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.current_profile_role() RETURNS public.profile_role
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT p.role
  FROM public.profiles p
  WHERE p.auth_user_id = auth.uid()
  LIMIT 1
$$;


--
-- Name: handle_new_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.handle_new_user() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (auth_user_id)
  VALUES (NEW.id)
  ON CONFLICT (auth_user_id) DO NOTHING;
  RETURN NEW;
END;
$$;


--
-- Name: is_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(public.current_profile_role() = 'admin', false)
$$;


--
-- Name: is_admin_current_user(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_admin_current_user() RETURNS boolean
    LANGUAGE sql STABLE
    AS $$
  select exists (
    select 1
    from public.profiles p
    where p.auth_user_id = auth.uid()
      and (p.is_admin = true or p.role in ('admin','superuser'))
  );
$$;


--
-- Name: is_current_user_admin(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_current_user_admin() RETURNS boolean
    LANGUAGE sql SECURITY DEFINER
    AS $$
  select coalesce(
    (select p.is_admin from public.profiles p where p.auth_user_id = auth.uid()),
    false
  );
$$;


--
-- Name: is_superuser(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.is_superuser() RETURNS boolean
    LANGUAGE sql STABLE SECURITY DEFINER
    AS $$
  SELECT COALESCE(public.current_profile_role() IN ('admin','superuser'), false)
$$;


--
-- Name: profile_claims_apply_on_approve(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.profile_claims_apply_on_approve() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
  v_is_super boolean;
BEGIN
  -- Nur SuperUser/Admin dürfen effektiv genehmigen
  v_is_super := public.is_superuser();
  IF NOT v_is_super THEN
    RAISE EXCEPTION 'not allowed: requires superuser/admin to approve';
  END IF;

  -- Wenn Status von nicht-approved -> approved wechselt:
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    -- verknüpfen & bestätigen (setzt self_check=true, is_active=true)
    PERFORM public.confirm_profile_claim(NEW.profile_id, NEW.claimant_user_id);
    NEW.approved_by := auth.uid();
    NEW.approved_at := now();
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: profiles_member_column_guard(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.profiles_member_column_guard() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  -- Admin/Superuser dürfen alles
  IF public.is_superuser() THEN
    RETURN NEW;
  END IF;

  -- Nicht-Superuser: nur eigenes Profil (RLS stellt das auch sicher)
  IF auth.uid() IS DISTINCT FROM OLD.auth_user_id THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- Verbotene Spaltenänderungen blocken
  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'members cannot change role';
  END IF;
  IF NEW.middle_name IS DISTINCT FROM OLD.middle_name THEN
    RAISE EXCEPTION 'only admins can change middle_name';
  END IF;
  IF NEW.self_check IS DISTINCT FROM OLD.self_check THEN
    RAISE EXCEPTION 'self_check can only be set by admin/superuser';
  END IF;
  IF NEW.auth_user_id IS DISTINCT FROM OLD.auth_user_id THEN
    RAISE EXCEPTION 'auth_user_id cannot be modified';
  END IF;

  RETURN NEW;
END;
$$;


--
-- Name: public_get_google_avatars(uuid[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.public_get_google_avatars(p_user_ids uuid[]) RETURNS TABLE(auth_user_id uuid, avatar_url text)
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public', 'auth'
    AS $$
begin
  return query
  select
    i.user_id as auth_user_id,
    coalesce(
      nullif(trim(both from i.identity_data->>'avatar_url'), ''),
      nullif(trim(both from i.identity_data->>'picture'), ''),
      nullif(trim(both from u.raw_user_meta_data->>'avatar_url'), '')
    ) as avatar_url
  from auth.identities i
  left join auth.users u on u.id = i.user_id
  where i.user_id = any(p_user_ids)
    and i.provider = 'google'
    and exists (select 1 from public.profiles p where p.auth_user_id = i.user_id);
end;
$$;


--
-- Name: seed_birthday_rounds(date, bigint); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.seed_birthday_rounds(p_due_month date, p_stammtisch_id bigint DEFAULT NULL::bigint) RETURNS integer
    LANGUAGE sql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
  with params as (
    select
      date_trunc('month', p_due_month)::date as due_month,
      (date_trunc('month', p_due_month) - interval '1 month')::date as prev_month
  ),
  eligible as (
    select
      pr.auth_user_id,
      pr.id as profile_id,
      p.due_month
    from params p
    join public.profiles pr on pr.birthday is not null
    where p.due_month >= date '2025-10-01'
      and extract(month from pr.birthday) = extract(month from p.prev_month)
  ),
  ins as (
    insert into public.birthday_rounds (auth_user_id, profile_id, due_month, first_due_stammtisch_id)
    select
      e.auth_user_id,
      e.profile_id,
      e.due_month,
      p_stammtisch_id
    from eligible e
    on conflict do nothing
    returning 1
  )
  select count(*)::int from ins;
$$;


--
-- Name: set_created_by(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_created_by() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
begin
  if new.created_by is null then
    new.created_by := auth.uid();
  end if;
  return new;
end;
$$;


--
-- Name: set_vegas_settings(numeric, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_vegas_settings(p_start_amount numeric, p_start_date date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  -- Admin-Check
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.auth_user_id = auth.uid() AND p.is_admin = true
  ) THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  INSERT INTO public.app_settings(key, value)
  VALUES ('vegas', jsonb_build_object(
      'start_amount', p_start_amount,
      'start_date', to_char(p_start_date, 'YYYY-MM-DD')
  ))
  ON CONFLICT (key) DO UPDATE
  SET value = EXCLUDED.value,
      updated_at = now();
END;
$$;


--
-- Name: set_vegas_settings_bootstrap(numeric, date); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.set_vegas_settings_bootstrap(p_start_amount numeric, p_start_date date) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    SET search_path TO 'public'
    AS $$
begin
  -- NUR dieser User darf das (deine UID aus dem Debug!)
  if auth.uid()::text <> '89a6927b-bf21-4d09-90a2-353a3d93ed07' then
    raise exception 'not allowed';
  end if;

  insert into public.app_settings(key, value)
  values ('vegas', jsonb_build_object(
    'start_amount', p_start_amount,
    'start_date', to_char(p_start_date, 'YYYY-MM-DD')
  ))
  on conflict (key) do update
    set value = excluded.value,
        updated_at = now();
end;
$$;


--
-- Name: stammtisch_set_owner(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.stammtisch_set_owner() RETURNS trigger
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
  IF NEW.created_by IS NULL THEN
    NEW.created_by := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;


--
-- Name: tg_app_settings_set_updated_at(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION public.tg_app_settings_set_updated_at() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END; $$;


--
-- Name: apply_rls(jsonb, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.apply_rls(wal jsonb, max_record_bytes integer DEFAULT (1024 * 1024)) RETURNS SETOF realtime.wal_rls
    LANGUAGE plpgsql
    AS $$
declare
-- Regclass of the table e.g. public.notes
entity_ regclass = (quote_ident(wal ->> 'schema') || '.' || quote_ident(wal ->> 'table'))::regclass;

-- I, U, D, T: insert, update ...
action realtime.action = (
    case wal ->> 'action'
        when 'I' then 'INSERT'
        when 'U' then 'UPDATE'
        when 'D' then 'DELETE'
        else 'ERROR'
    end
);

-- Is row level security enabled for the table
is_rls_enabled bool = relrowsecurity from pg_class where oid = entity_;

subscriptions realtime.subscription[] = array_agg(subs)
    from
        realtime.subscription subs
    where
        subs.entity = entity_;

-- Subscription vars
roles regrole[] = array_agg(distinct us.claims_role::text)
    from
        unnest(subscriptions) us;

working_role regrole;
claimed_role regrole;
claims jsonb;

subscription_id uuid;
subscription_has_access bool;
visible_to_subscription_ids uuid[] = '{}';

-- structured info for wal's columns
columns realtime.wal_column[];
-- previous identity values for update/delete
old_columns realtime.wal_column[];

error_record_exceeds_max_size boolean = octet_length(wal::text) > max_record_bytes;

-- Primary jsonb output for record
output jsonb;

begin
perform set_config('role', null, true);

columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'columns') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

old_columns =
    array_agg(
        (
            x->>'name',
            x->>'type',
            x->>'typeoid',
            realtime.cast(
                (x->'value') #>> '{}',
                coalesce(
                    (x->>'typeoid')::regtype, -- null when wal2json version <= 2.4
                    (x->>'type')::regtype
                )
            ),
            (pks ->> 'name') is not null,
            true
        )::realtime.wal_column
    )
    from
        jsonb_array_elements(wal -> 'identity') x
        left join jsonb_array_elements(wal -> 'pk') pks
            on (x ->> 'name') = (pks ->> 'name');

for working_role in select * from unnest(roles) loop

    -- Update `is_selectable` for columns and old_columns
    columns =
        array_agg(
            (
                c.name,
                c.type_name,
                c.type_oid,
                c.value,
                c.is_pkey,
                pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
            )::realtime.wal_column
        )
        from
            unnest(columns) c;

    old_columns =
            array_agg(
                (
                    c.name,
                    c.type_name,
                    c.type_oid,
                    c.value,
                    c.is_pkey,
                    pg_catalog.has_column_privilege(working_role, entity_, c.name, 'SELECT')
                )::realtime.wal_column
            )
            from
                unnest(old_columns) c;

    if action <> 'DELETE' and count(1) = 0 from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            -- subscriptions is already filtered by entity
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 400: Bad Request, no primary key']
        )::realtime.wal_rls;

    -- The claims role does not have SELECT permission to the primary key of entity
    elsif action <> 'DELETE' and sum(c.is_selectable::int) <> count(1) from unnest(columns) c where c.is_pkey then
        return next (
            jsonb_build_object(
                'schema', wal ->> 'schema',
                'table', wal ->> 'table',
                'type', action
            ),
            is_rls_enabled,
            (select array_agg(s.subscription_id) from unnest(subscriptions) as s where claims_role = working_role),
            array['Error 401: Unauthorized']
        )::realtime.wal_rls;

    else
        output = jsonb_build_object(
            'schema', wal ->> 'schema',
            'table', wal ->> 'table',
            'type', action,
            'commit_timestamp', to_char(
                ((wal ->> 'timestamp')::timestamptz at time zone 'utc'),
                'YYYY-MM-DD"T"HH24:MI:SS.MS"Z"'
            ),
            'columns', (
                select
                    jsonb_agg(
                        jsonb_build_object(
                            'name', pa.attname,
                            'type', pt.typname
                        )
                        order by pa.attnum asc
                    )
                from
                    pg_attribute pa
                    join pg_type pt
                        on pa.atttypid = pt.oid
                where
                    attrelid = entity_
                    and attnum > 0
                    and pg_catalog.has_column_privilege(working_role, entity_, pa.attname, 'SELECT')
            )
        )
        -- Add "record" key for insert and update
        || case
            when action in ('INSERT', 'UPDATE') then
                jsonb_build_object(
                    'record',
                    (
                        select
                            jsonb_object_agg(
                                -- if unchanged toast, get column name and value from old record
                                coalesce((c).name, (oc).name),
                                case
                                    when (c).name is null then (oc).value
                                    else (c).value
                                end
                            )
                        from
                            unnest(columns) c
                            full outer join unnest(old_columns) oc
                                on (c).name = (oc).name
                        where
                            coalesce((c).is_selectable, (oc).is_selectable)
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                    )
                )
            else '{}'::jsonb
        end
        -- Add "old_record" key for update and delete
        || case
            when action = 'UPDATE' then
                jsonb_build_object(
                        'old_record',
                        (
                            select jsonb_object_agg((c).name, (c).value)
                            from unnest(old_columns) c
                            where
                                (c).is_selectable
                                and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                        )
                    )
            when action = 'DELETE' then
                jsonb_build_object(
                    'old_record',
                    (
                        select jsonb_object_agg((c).name, (c).value)
                        from unnest(old_columns) c
                        where
                            (c).is_selectable
                            and ( not error_record_exceeds_max_size or (octet_length((c).value::text) <= 64))
                            and ( not is_rls_enabled or (c).is_pkey ) -- if RLS enabled, we can't secure deletes so filter to pkey
                    )
                )
            else '{}'::jsonb
        end;

        -- Create the prepared statement
        if is_rls_enabled and action <> 'DELETE' then
            if (select 1 from pg_prepared_statements where name = 'walrus_rls_stmt' limit 1) > 0 then
                deallocate walrus_rls_stmt;
            end if;
            execute realtime.build_prepared_statement_sql('walrus_rls_stmt', entity_, columns);
        end if;

        visible_to_subscription_ids = '{}';

        for subscription_id, claims in (
                select
                    subs.subscription_id,
                    subs.claims
                from
                    unnest(subscriptions) subs
                where
                    subs.entity = entity_
                    and subs.claims_role = working_role
                    and (
                        realtime.is_visible_through_filters(columns, subs.filters)
                        or (
                          action = 'DELETE'
                          and realtime.is_visible_through_filters(old_columns, subs.filters)
                        )
                    )
        ) loop

            if not is_rls_enabled or action = 'DELETE' then
                visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
            else
                -- Check if RLS allows the role to see the record
                perform
                    -- Trim leading and trailing quotes from working_role because set_config
                    -- doesn't recognize the role as valid if they are included
                    set_config('role', trim(both '"' from working_role::text), true),
                    set_config('request.jwt.claims', claims::text, true);

                execute 'execute walrus_rls_stmt' into subscription_has_access;

                if subscription_has_access then
                    visible_to_subscription_ids = visible_to_subscription_ids || subscription_id;
                end if;
            end if;
        end loop;

        perform set_config('role', null, true);

        return next (
            output,
            is_rls_enabled,
            visible_to_subscription_ids,
            case
                when error_record_exceeds_max_size then array['Error 413: Payload Too Large']
                else '{}'
            end
        )::realtime.wal_rls;

    end if;
end loop;

perform set_config('role', null, true);
end;
$$;


--
-- Name: broadcast_changes(text, text, text, text, text, record, record, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.broadcast_changes(topic_name text, event_name text, operation text, table_name text, table_schema text, new record, old record, level text DEFAULT 'ROW'::text) RETURNS void
    LANGUAGE plpgsql
    AS $$
DECLARE
    -- Declare a variable to hold the JSONB representation of the row
    row_data jsonb := '{}'::jsonb;
BEGIN
    IF level = 'STATEMENT' THEN
        RAISE EXCEPTION 'function can only be triggered for each row, not for each statement';
    END IF;
    -- Check the operation type and handle accordingly
    IF operation = 'INSERT' OR operation = 'UPDATE' OR operation = 'DELETE' THEN
        row_data := jsonb_build_object('old_record', OLD, 'record', NEW, 'operation', operation, 'table', table_name, 'schema', table_schema);
        PERFORM realtime.send (row_data, event_name, topic_name);
    ELSE
        RAISE EXCEPTION 'Unexpected operation type: %', operation;
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE EXCEPTION 'Failed to process the row: %', SQLERRM;
END;

$$;


--
-- Name: build_prepared_statement_sql(text, regclass, realtime.wal_column[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.build_prepared_statement_sql(prepared_statement_name text, entity regclass, columns realtime.wal_column[]) RETURNS text
    LANGUAGE sql
    AS $$
      /*
      Builds a sql string that, if executed, creates a prepared statement to
      tests retrive a row from *entity* by its primary key columns.
      Example
          select realtime.build_prepared_statement_sql('public.notes', '{"id"}'::text[], '{"bigint"}'::text[])
      */
          select
      'prepare ' || prepared_statement_name || ' as
          select
              exists(
                  select
                      1
                  from
                      ' || entity || '
                  where
                      ' || string_agg(quote_ident(pkc.name) || '=' || quote_nullable(pkc.value #>> '{}') , ' and ') || '
              )'
          from
              unnest(columns) pkc
          where
              pkc.is_pkey
          group by
              entity
      $$;


--
-- Name: cast(text, regtype); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime."cast"(val text, type_ regtype) RETURNS jsonb
    LANGUAGE plpgsql IMMUTABLE
    AS $$
    declare
      res jsonb;
    begin
      execute format('select to_jsonb(%L::'|| type_::text || ')', val)  into res;
      return res;
    end
    $$;


--
-- Name: check_equality_op(realtime.equality_op, regtype, text, text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.check_equality_op(op realtime.equality_op, type_ regtype, val_1 text, val_2 text) RETURNS boolean
    LANGUAGE plpgsql IMMUTABLE
    AS $$
      /*
      Casts *val_1* and *val_2* as type *type_* and check the *op* condition for truthiness
      */
      declare
          op_symbol text = (
              case
                  when op = 'eq' then '='
                  when op = 'neq' then '!='
                  when op = 'lt' then '<'
                  when op = 'lte' then '<='
                  when op = 'gt' then '>'
                  when op = 'gte' then '>='
                  when op = 'in' then '= any'
                  else 'UNKNOWN OP'
              end
          );
          res boolean;
      begin
          execute format(
              'select %L::'|| type_::text || ' ' || op_symbol
              || ' ( %L::'
              || (
                  case
                      when op = 'in' then type_::text || '[]'
                      else type_::text end
              )
              || ')', val_1, val_2) into res;
          return res;
      end;
      $$;


--
-- Name: is_visible_through_filters(realtime.wal_column[], realtime.user_defined_filter[]); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.is_visible_through_filters(columns realtime.wal_column[], filters realtime.user_defined_filter[]) RETURNS boolean
    LANGUAGE sql IMMUTABLE
    AS $_$
    /*
    Should the record be visible (true) or filtered out (false) after *filters* are applied
    */
        select
            -- Default to allowed when no filters present
            $2 is null -- no filters. this should not happen because subscriptions has a default
            or array_length($2, 1) is null -- array length of an empty array is null
            or bool_and(
                coalesce(
                    realtime.check_equality_op(
                        op:=f.op,
                        type_:=coalesce(
                            col.type_oid::regtype, -- null when wal2json version <= 2.4
                            col.type_name::regtype
                        ),
                        -- cast jsonb to text
                        val_1:=col.value #>> '{}',
                        val_2:=f.value
                    ),
                    false -- if null, filter does not match
                )
            )
        from
            unnest(filters) f
            join unnest(columns) col
                on f.column_name = col.name;
    $_$;


--
-- Name: list_changes(name, name, integer, integer); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.list_changes(publication name, slot_name name, max_changes integer, max_record_bytes integer) RETURNS SETOF realtime.wal_rls
    LANGUAGE sql
    SET log_min_messages TO 'fatal'
    AS $$
      with pub as (
        select
          concat_ws(
            ',',
            case when bool_or(pubinsert) then 'insert' else null end,
            case when bool_or(pubupdate) then 'update' else null end,
            case when bool_or(pubdelete) then 'delete' else null end
          ) as w2j_actions,
          coalesce(
            string_agg(
              realtime.quote_wal2json(format('%I.%I', schemaname, tablename)::regclass),
              ','
            ) filter (where ppt.tablename is not null and ppt.tablename not like '% %'),
            ''
          ) w2j_add_tables
        from
          pg_publication pp
          left join pg_publication_tables ppt
            on pp.pubname = ppt.pubname
        where
          pp.pubname = publication
        group by
          pp.pubname
        limit 1
      ),
      w2j as (
        select
          x.*, pub.w2j_add_tables
        from
          pub,
          pg_logical_slot_get_changes(
            slot_name, null, max_changes,
            'include-pk', 'true',
            'include-transaction', 'false',
            'include-timestamp', 'true',
            'include-type-oids', 'true',
            'format-version', '2',
            'actions', pub.w2j_actions,
            'add-tables', pub.w2j_add_tables
          ) x
      )
      select
        xyz.wal,
        xyz.is_rls_enabled,
        xyz.subscription_ids,
        xyz.errors
      from
        w2j,
        realtime.apply_rls(
          wal := w2j.data::jsonb,
          max_record_bytes := max_record_bytes
        ) xyz(wal, is_rls_enabled, subscription_ids, errors)
      where
        w2j.w2j_add_tables <> ''
        and xyz.subscription_ids[1] is not null
    $$;


--
-- Name: quote_wal2json(regclass); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.quote_wal2json(entity regclass) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
      select
        (
          select string_agg('' || ch,'')
          from unnest(string_to_array(nsp.nspname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
        )
        || '.'
        || (
          select string_agg('' || ch,'')
          from unnest(string_to_array(pc.relname::text, null)) with ordinality x(ch, idx)
          where
            not (x.idx = 1 and x.ch = '"')
            and not (
              x.idx = array_length(string_to_array(nsp.nspname::text, null), 1)
              and x.ch = '"'
            )
          )
      from
        pg_class pc
        join pg_namespace nsp
          on pc.relnamespace = nsp.oid
      where
        pc.oid = entity
    $$;


--
-- Name: send(jsonb, text, text, boolean); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.send(payload jsonb, event text, topic text, private boolean DEFAULT true) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  BEGIN
    -- Set the topic configuration
    EXECUTE format('SET LOCAL realtime.topic TO %L', topic);

    -- Attempt to insert the message
    INSERT INTO realtime.messages (payload, event, topic, private, extension)
    VALUES (payload, event, topic, private, 'broadcast');
  EXCEPTION
    WHEN OTHERS THEN
      -- Capture and notify the error
      RAISE WARNING 'ErrorSendingBroadcastMessage: %', SQLERRM;
  END;
END;
$$;


--
-- Name: subscription_check_filters(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.subscription_check_filters() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
    /*
    Validates that the user defined filters for a subscription:
    - refer to valid columns that the claimed role may access
    - values are coercable to the correct column type
    */
    declare
        col_names text[] = coalesce(
                array_agg(c.column_name order by c.ordinal_position),
                '{}'::text[]
            )
            from
                information_schema.columns c
            where
                format('%I.%I', c.table_schema, c.table_name)::regclass = new.entity
                and pg_catalog.has_column_privilege(
                    (new.claims ->> 'role'),
                    format('%I.%I', c.table_schema, c.table_name)::regclass,
                    c.column_name,
                    'SELECT'
                );
        filter realtime.user_defined_filter;
        col_type regtype;

        in_val jsonb;
    begin
        for filter in select * from unnest(new.filters) loop
            -- Filtered column is valid
            if not filter.column_name = any(col_names) then
                raise exception 'invalid column for filter %', filter.column_name;
            end if;

            -- Type is sanitized and safe for string interpolation
            col_type = (
                select atttypid::regtype
                from pg_catalog.pg_attribute
                where attrelid = new.entity
                      and attname = filter.column_name
            );
            if col_type is null then
                raise exception 'failed to lookup type for column %', filter.column_name;
            end if;

            -- Set maximum number of entries for in filter
            if filter.op = 'in'::realtime.equality_op then
                in_val = realtime.cast(filter.value, (col_type::text || '[]')::regtype);
                if coalesce(jsonb_array_length(in_val), 0) > 100 then
                    raise exception 'too many values for `in` filter. Maximum 100';
                end if;
            else
                -- raises an exception if value is not coercable to type
                perform realtime.cast(filter.value, col_type);
            end if;

        end loop;

        -- Apply consistent order to filters so the unique constraint on
        -- (subscription_id, entity, filters) can't be tricked by a different filter order
        new.filters = coalesce(
            array_agg(f order by f.column_name, f.op, f.value),
            '{}'
        ) from unnest(new.filters) f;

        return new;
    end;
    $$;


--
-- Name: to_regrole(text); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.to_regrole(role_name text) RETURNS regrole
    LANGUAGE sql IMMUTABLE
    AS $$ select role_name::regrole $$;


--
-- Name: topic(); Type: FUNCTION; Schema: realtime; Owner: -
--

CREATE FUNCTION realtime.topic() RETURNS text
    LANGUAGE sql STABLE
    AS $$
select nullif(current_setting('realtime.topic', true), '')::text;
$$;


--
-- Name: add_prefixes(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.add_prefixes(_bucket_id text, _name text) RETURNS void
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
DECLARE
    prefixes text[];
BEGIN
    prefixes := "storage"."get_prefixes"("_name");

    IF array_length(prefixes, 1) > 0 THEN
        INSERT INTO storage.prefixes (name, bucket_id)
        SELECT UNNEST(prefixes) as name, "_bucket_id" ON CONFLICT DO NOTHING;
    END IF;
END;
$$;


--
-- Name: can_insert_object(text, text, uuid, jsonb); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.can_insert_object(bucketid text, name text, owner uuid, metadata jsonb) RETURNS void
    LANGUAGE plpgsql
    AS $$
BEGIN
  INSERT INTO "storage"."objects" ("bucket_id", "name", "owner", "metadata") VALUES (bucketid, name, owner, metadata);
  -- hack to rollback the successful insert
  RAISE sqlstate 'PT200' using
  message = 'ROLLBACK',
  detail = 'rollback successful insert';
END
$$;


--
-- Name: delete_prefix(text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix(_bucket_id text, _name text) RETURNS boolean
    LANGUAGE plpgsql SECURITY DEFINER
    AS $$
BEGIN
    -- Check if we can delete the prefix
    IF EXISTS(
        SELECT FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name") + 1
          AND "prefixes"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    )
    OR EXISTS(
        SELECT FROM "storage"."objects"
        WHERE "objects"."bucket_id" = "_bucket_id"
          AND "storage"."get_level"("objects"."name") = "storage"."get_level"("_name") + 1
          AND "objects"."name" COLLATE "C" LIKE "_name" || '/%'
        LIMIT 1
    ) THEN
    -- There are sub-objects, skip deletion
    RETURN false;
    ELSE
        DELETE FROM "storage"."prefixes"
        WHERE "prefixes"."bucket_id" = "_bucket_id"
          AND level = "storage"."get_level"("_name")
          AND "prefixes"."name" = "_name";
        RETURN true;
    END IF;
END;
$$;


--
-- Name: delete_prefix_hierarchy_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.delete_prefix_hierarchy_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    prefix text;
BEGIN
    prefix := "storage"."get_prefix"(OLD."name");

    IF coalesce(prefix, '') != '' THEN
        PERFORM "storage"."delete_prefix"(OLD."bucket_id", prefix);
    END IF;

    RETURN OLD;
END;
$$;


--
-- Name: enforce_bucket_name_length(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.enforce_bucket_name_length() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
begin
    if length(new.name) > 100 then
        raise exception 'bucket name "%" is too long (% characters). Max is 100.', new.name, length(new.name);
    end if;
    return new;
end;
$$;


--
-- Name: extension(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.extension(name text) RETURNS text
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
    _filename text;
BEGIN
    SELECT string_to_array(name, '/') INTO _parts;
    SELECT _parts[array_length(_parts,1)] INTO _filename;
    RETURN reverse(split_part(reverse(_filename), '.', 1));
END
$$;


--
-- Name: filename(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.filename(name text) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
_parts text[];
BEGIN
	select string_to_array(name, '/') into _parts;
	return _parts[array_length(_parts,1)];
END
$$;


--
-- Name: foldername(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.foldername(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE
    AS $$
DECLARE
    _parts text[];
BEGIN
    -- Split on "/" to get path segments
    SELECT string_to_array(name, '/') INTO _parts;
    -- Return everything except the last segment
    RETURN _parts[1 : array_length(_parts,1) - 1];
END
$$;


--
-- Name: get_level(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_level(name text) RETURNS integer
    LANGUAGE sql IMMUTABLE STRICT
    AS $$
SELECT array_length(string_to_array("name", '/'), 1);
$$;


--
-- Name: get_prefix(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefix(name text) RETURNS text
    LANGUAGE sql IMMUTABLE STRICT
    AS $_$
SELECT
    CASE WHEN strpos("name", '/') > 0 THEN
             regexp_replace("name", '[\/]{1}[^\/]+\/?$', '')
         ELSE
             ''
        END;
$_$;


--
-- Name: get_prefixes(text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_prefixes(name text) RETURNS text[]
    LANGUAGE plpgsql IMMUTABLE STRICT
    AS $$
DECLARE
    parts text[];
    prefixes text[];
    prefix text;
BEGIN
    -- Split the name into parts by '/'
    parts := string_to_array("name", '/');
    prefixes := '{}';

    -- Construct the prefixes, stopping one level below the last part
    FOR i IN 1..array_length(parts, 1) - 1 LOOP
            prefix := array_to_string(parts[1:i], '/');
            prefixes := array_append(prefixes, prefix);
    END LOOP;

    RETURN prefixes;
END;
$$;


--
-- Name: get_size_by_bucket(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.get_size_by_bucket() RETURNS TABLE(size bigint, bucket_id text)
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    return query
        select sum((metadata->>'size')::bigint) as size, obj.bucket_id
        from "storage".objects as obj
        group by obj.bucket_id;
END
$$;


--
-- Name: list_multipart_uploads_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_multipart_uploads_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, next_key_token text DEFAULT ''::text, next_upload_token text DEFAULT ''::text) RETURNS TABLE(key text, id text, created_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(key COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                        substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1)))
                    ELSE
                        key
                END AS key, id, created_at
            FROM
                storage.s3_multipart_uploads
            WHERE
                bucket_id = $5 AND
                key ILIKE $1 || ''%'' AND
                CASE
                    WHEN $4 != '''' AND $6 = '''' THEN
                        CASE
                            WHEN position($2 IN substring(key from length($1) + 1)) > 0 THEN
                                substring(key from 1 for length($1) + position($2 IN substring(key from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                key COLLATE "C" > $4
                            END
                    ELSE
                        true
                END AND
                CASE
                    WHEN $6 != '''' THEN
                        id COLLATE "C" > $6
                    ELSE
                        true
                    END
            ORDER BY
                key COLLATE "C" ASC, created_at ASC) as e order by key COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_key_token, bucket_id, next_upload_token;
END;
$_$;


--
-- Name: list_objects_with_delimiter(text, text, text, integer, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.list_objects_with_delimiter(bucket_id text, prefix_param text, delimiter_param text, max_keys integer DEFAULT 100, start_after text DEFAULT ''::text, next_token text DEFAULT ''::text) RETURNS TABLE(name text, id uuid, metadata jsonb, updated_at timestamp with time zone)
    LANGUAGE plpgsql
    AS $_$
BEGIN
    RETURN QUERY EXECUTE
        'SELECT DISTINCT ON(name COLLATE "C") * from (
            SELECT
                CASE
                    WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                        substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1)))
                    ELSE
                        name
                END AS name, id, metadata, updated_at
            FROM
                storage.objects
            WHERE
                bucket_id = $5 AND
                name ILIKE $1 || ''%'' AND
                CASE
                    WHEN $6 != '''' THEN
                    name COLLATE "C" > $6
                ELSE true END
                AND CASE
                    WHEN $4 != '''' THEN
                        CASE
                            WHEN position($2 IN substring(name from length($1) + 1)) > 0 THEN
                                substring(name from 1 for length($1) + position($2 IN substring(name from length($1) + 1))) COLLATE "C" > $4
                            ELSE
                                name COLLATE "C" > $4
                            END
                    ELSE
                        true
                END
            ORDER BY
                name COLLATE "C" ASC) as e order by name COLLATE "C" LIMIT $3'
        USING prefix_param, delimiter_param, max_keys, next_token, bucket_id, start_after;
END;
$_$;


--
-- Name: objects_insert_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_insert_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    NEW.level := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: objects_update_prefix_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.objects_update_prefix_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    old_prefixes TEXT[];
BEGIN
    -- Ensure this is an update operation and the name has changed
    IF TG_OP = 'UPDATE' AND (NEW."name" <> OLD."name" OR NEW."bucket_id" <> OLD."bucket_id") THEN
        -- Retrieve old prefixes
        old_prefixes := "storage"."get_prefixes"(OLD."name");

        -- Remove old prefixes that are only used by this object
        WITH all_prefixes as (
            SELECT unnest(old_prefixes) as prefix
        ),
        can_delete_prefixes as (
             SELECT prefix
             FROM all_prefixes
             WHERE NOT EXISTS (
                 SELECT 1 FROM "storage"."objects"
                 WHERE "bucket_id" = OLD."bucket_id"
                   AND "name" <> OLD."name"
                   AND "name" LIKE (prefix || '%')
             )
         )
        DELETE FROM "storage"."prefixes" WHERE name IN (SELECT prefix FROM can_delete_prefixes);

        -- Add new prefixes
        PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    END IF;
    -- Set the new level
    NEW."level" := "storage"."get_level"(NEW."name");

    RETURN NEW;
END;
$$;


--
-- Name: operation(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.operation() RETURNS text
    LANGUAGE plpgsql STABLE
    AS $$
BEGIN
    RETURN current_setting('storage.operation', true);
END;
$$;


--
-- Name: prefixes_insert_trigger(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.prefixes_insert_trigger() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    PERFORM "storage"."add_prefixes"(NEW."bucket_id", NEW."name");
    RETURN NEW;
END;
$$;


--
-- Name: search(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql
    AS $$
declare
    can_bypass_rls BOOLEAN;
begin
    SELECT rolbypassrls
    INTO can_bypass_rls
    FROM pg_roles
    WHERE rolname = coalesce(nullif(current_setting('role', true), 'none'), current_user);

    IF can_bypass_rls THEN
        RETURN QUERY SELECT * FROM storage.search_v1_optimised(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    ELSE
        RETURN QUERY SELECT * FROM storage.search_legacy_v1(prefix, bucketname, limits, levels, offsets, search, sortcolumn, sortorder);
    END IF;
end;
$$;


--
-- Name: search_legacy_v1(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_legacy_v1(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select path_tokens[$1] as folder
           from storage.objects
             where objects.name ilike $2 || $3 || ''%''
               and bucket_id = $4
               and array_length(objects.path_tokens, 1) <> $1
           group by folder
           order by folder ' || v_sort_order || '
     )
     (select folder as "name",
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[$1] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where objects.name ilike $2 || $3 || ''%''
       and bucket_id = $4
       and array_length(objects.path_tokens, 1) = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v1_optimised(text, text, integer, integer, integer, text, text, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v1_optimised(prefix text, bucketname text, limits integer DEFAULT 100, levels integer DEFAULT 1, offsets integer DEFAULT 0, search text DEFAULT ''::text, sortcolumn text DEFAULT 'name'::text, sortorder text DEFAULT 'asc'::text) RETURNS TABLE(name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, last_accessed_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
declare
    v_order_by text;
    v_sort_order text;
begin
    case
        when sortcolumn = 'name' then
            v_order_by = 'name';
        when sortcolumn = 'updated_at' then
            v_order_by = 'updated_at';
        when sortcolumn = 'created_at' then
            v_order_by = 'created_at';
        when sortcolumn = 'last_accessed_at' then
            v_order_by = 'last_accessed_at';
        else
            v_order_by = 'name';
        end case;

    case
        when sortorder = 'asc' then
            v_sort_order = 'asc';
        when sortorder = 'desc' then
            v_sort_order = 'desc';
        else
            v_sort_order = 'asc';
        end case;

    v_order_by = v_order_by || ' ' || v_sort_order;

    return query execute
        'with folders as (
           select (string_to_array(name, ''/''))[level] as name
           from storage.prefixes
             where lower(prefixes.name) like lower($2 || $3) || ''%''
               and bucket_id = $4
               and level = $1
           order by name ' || v_sort_order || '
     )
     (select name,
            null as id,
            null as updated_at,
            null as created_at,
            null as last_accessed_at,
            null as metadata from folders)
     union all
     (select path_tokens[level] as "name",
            id,
            updated_at,
            created_at,
            last_accessed_at,
            metadata
     from storage.objects
     where lower(objects.name) like lower($2 || $3) || ''%''
       and bucket_id = $4
       and level = $1
     order by ' || v_order_by || ')
     limit $5
     offset $6' using levels, prefix, search, bucketname, limits, offsets;
end;
$_$;


--
-- Name: search_v2(text, text, integer, integer, text); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.search_v2(prefix text, bucket_name text, limits integer DEFAULT 100, levels integer DEFAULT 1, start_after text DEFAULT ''::text) RETURNS TABLE(key text, name text, id uuid, updated_at timestamp with time zone, created_at timestamp with time zone, metadata jsonb)
    LANGUAGE plpgsql STABLE
    AS $_$
BEGIN
    RETURN query EXECUTE
        $sql$
        SELECT * FROM (
            (
                SELECT
                    split_part(name, '/', $4) AS key,
                    name || '/' AS name,
                    NULL::uuid AS id,
                    NULL::timestamptz AS updated_at,
                    NULL::timestamptz AS created_at,
                    NULL::jsonb AS metadata
                FROM storage.prefixes
                WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
                ORDER BY prefixes.name COLLATE "C" LIMIT $3
            )
            UNION ALL
            (SELECT split_part(name, '/', $4) AS key,
                name,
                id,
                updated_at,
                created_at,
                metadata
            FROM storage.objects
            WHERE name COLLATE "C" LIKE $1 || '%'
                AND bucket_id = $2
                AND level = $4
                AND name COLLATE "C" > $5
            ORDER BY name COLLATE "C" LIMIT $3)
        ) obj
        ORDER BY name COLLATE "C" LIMIT $3;
        $sql$
        USING prefix, bucket_name, limits, levels, start_after;
END;
$_$;


--
-- Name: update_updated_at_column(); Type: FUNCTION; Schema: storage; Owner: -
--

CREATE FUNCTION storage.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: audit_log_entries; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.audit_log_entries (
    instance_id uuid,
    id uuid NOT NULL,
    payload json,
    created_at timestamp with time zone,
    ip_address character varying(64) DEFAULT ''::character varying NOT NULL
);


--
-- Name: TABLE audit_log_entries; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.audit_log_entries IS 'Auth: Audit trail for user actions.';


--
-- Name: flow_state; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.flow_state (
    id uuid NOT NULL,
    user_id uuid,
    auth_code text NOT NULL,
    code_challenge_method auth.code_challenge_method NOT NULL,
    code_challenge text NOT NULL,
    provider_type text NOT NULL,
    provider_access_token text,
    provider_refresh_token text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    authentication_method text NOT NULL,
    auth_code_issued_at timestamp with time zone
);


--
-- Name: TABLE flow_state; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.flow_state IS 'stores metadata for pkce logins';


--
-- Name: identities; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.identities (
    provider_id text NOT NULL,
    user_id uuid NOT NULL,
    identity_data jsonb NOT NULL,
    provider text NOT NULL,
    last_sign_in_at timestamp with time zone,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    email text GENERATED ALWAYS AS (lower((identity_data ->> 'email'::text))) STORED,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: TABLE identities; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.identities IS 'Auth: Stores identities associated to a user.';


--
-- Name: COLUMN identities.email; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.identities.email IS 'Auth: Email is a generated column that references the optional email property in the identity_data';


--
-- Name: instances; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.instances (
    id uuid NOT NULL,
    uuid uuid,
    raw_base_config text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone
);


--
-- Name: TABLE instances; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.instances IS 'Auth: Manages users across multiple sites.';


--
-- Name: mfa_amr_claims; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_amr_claims (
    session_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    authentication_method text NOT NULL,
    id uuid NOT NULL
);


--
-- Name: TABLE mfa_amr_claims; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_amr_claims IS 'auth: stores authenticator method reference claims for multi factor authentication';


--
-- Name: mfa_challenges; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_challenges (
    id uuid NOT NULL,
    factor_id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL,
    verified_at timestamp with time zone,
    ip_address inet NOT NULL,
    otp_code text,
    web_authn_session_data jsonb
);


--
-- Name: TABLE mfa_challenges; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_challenges IS 'auth: stores metadata about challenge requests made';


--
-- Name: mfa_factors; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.mfa_factors (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    friendly_name text,
    factor_type auth.factor_type NOT NULL,
    status auth.factor_status NOT NULL,
    created_at timestamp with time zone NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    secret text,
    phone text,
    last_challenged_at timestamp with time zone,
    web_authn_credential jsonb,
    web_authn_aaguid uuid
);


--
-- Name: TABLE mfa_factors; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.mfa_factors IS 'auth: stores metadata about factors';


--
-- Name: oauth_clients; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.oauth_clients (
    id uuid NOT NULL,
    client_id text NOT NULL,
    client_secret_hash text NOT NULL,
    registration_type auth.oauth_registration_type NOT NULL,
    redirect_uris text NOT NULL,
    grant_types text NOT NULL,
    client_name text,
    client_uri text,
    logo_uri text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone,
    CONSTRAINT oauth_clients_client_name_length CHECK ((char_length(client_name) <= 1024)),
    CONSTRAINT oauth_clients_client_uri_length CHECK ((char_length(client_uri) <= 2048)),
    CONSTRAINT oauth_clients_logo_uri_length CHECK ((char_length(logo_uri) <= 2048))
);


--
-- Name: one_time_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.one_time_tokens (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    token_type auth.one_time_token_type NOT NULL,
    token_hash text NOT NULL,
    relates_to text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    CONSTRAINT one_time_tokens_token_hash_check CHECK ((char_length(token_hash) > 0))
);


--
-- Name: refresh_tokens; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.refresh_tokens (
    instance_id uuid,
    id bigint NOT NULL,
    token character varying(255),
    user_id character varying(255),
    revoked boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    parent character varying(255),
    session_id uuid
);


--
-- Name: TABLE refresh_tokens; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.refresh_tokens IS 'Auth: Store of tokens used to refresh JWT tokens once they expire.';


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE; Schema: auth; Owner: -
--

CREATE SEQUENCE auth.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE OWNED BY; Schema: auth; Owner: -
--

ALTER SEQUENCE auth.refresh_tokens_id_seq OWNED BY auth.refresh_tokens.id;


--
-- Name: saml_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_providers (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    entity_id text NOT NULL,
    metadata_xml text NOT NULL,
    metadata_url text,
    attribute_mapping jsonb,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    name_id_format text,
    CONSTRAINT "entity_id not empty" CHECK ((char_length(entity_id) > 0)),
    CONSTRAINT "metadata_url not empty" CHECK (((metadata_url = NULL::text) OR (char_length(metadata_url) > 0))),
    CONSTRAINT "metadata_xml not empty" CHECK ((char_length(metadata_xml) > 0))
);


--
-- Name: TABLE saml_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_providers IS 'Auth: Manages SAML Identity Provider connections.';


--
-- Name: saml_relay_states; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.saml_relay_states (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    request_id text NOT NULL,
    for_email text,
    redirect_to text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    flow_state_id uuid,
    CONSTRAINT "request_id not empty" CHECK ((char_length(request_id) > 0))
);


--
-- Name: TABLE saml_relay_states; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.saml_relay_states IS 'Auth: Contains SAML Relay State information for each Service Provider initiated login.';


--
-- Name: schema_migrations; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.schema_migrations (
    version character varying(255) NOT NULL
);


--
-- Name: TABLE schema_migrations; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.schema_migrations IS 'Auth: Manages updates to the auth system.';


--
-- Name: sessions; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sessions (
    id uuid NOT NULL,
    user_id uuid NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    factor_id uuid,
    aal auth.aal_level,
    not_after timestamp with time zone,
    refreshed_at timestamp without time zone,
    user_agent text,
    ip inet,
    tag text
);


--
-- Name: TABLE sessions; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sessions IS 'Auth: Stores session data associated to a user.';


--
-- Name: COLUMN sessions.not_after; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sessions.not_after IS 'Auth: Not after is a nullable column that contains a timestamp after which the session should be regarded as expired.';


--
-- Name: sso_domains; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_domains (
    id uuid NOT NULL,
    sso_provider_id uuid NOT NULL,
    domain text NOT NULL,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    CONSTRAINT "domain not empty" CHECK ((char_length(domain) > 0))
);


--
-- Name: TABLE sso_domains; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_domains IS 'Auth: Manages SSO email address domain mapping to an SSO Identity Provider.';


--
-- Name: sso_providers; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.sso_providers (
    id uuid NOT NULL,
    resource_id text,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    disabled boolean,
    CONSTRAINT "resource_id not empty" CHECK (((resource_id = NULL::text) OR (char_length(resource_id) > 0)))
);


--
-- Name: TABLE sso_providers; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.sso_providers IS 'Auth: Manages SSO identity provider information; see saml_providers for SAML.';


--
-- Name: COLUMN sso_providers.resource_id; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.sso_providers.resource_id IS 'Auth: Uniquely identifies a SSO provider according to a user-chosen resource ID (case insensitive), useful in infrastructure as code.';


--
-- Name: users; Type: TABLE; Schema: auth; Owner: -
--

CREATE TABLE auth.users (
    instance_id uuid,
    id uuid NOT NULL,
    aud character varying(255),
    role character varying(255),
    email character varying(255),
    encrypted_password character varying(255),
    email_confirmed_at timestamp with time zone,
    invited_at timestamp with time zone,
    confirmation_token character varying(255),
    confirmation_sent_at timestamp with time zone,
    recovery_token character varying(255),
    recovery_sent_at timestamp with time zone,
    email_change_token_new character varying(255),
    email_change character varying(255),
    email_change_sent_at timestamp with time zone,
    last_sign_in_at timestamp with time zone,
    raw_app_meta_data jsonb,
    raw_user_meta_data jsonb,
    is_super_admin boolean,
    created_at timestamp with time zone,
    updated_at timestamp with time zone,
    phone text DEFAULT NULL::character varying,
    phone_confirmed_at timestamp with time zone,
    phone_change text DEFAULT ''::character varying,
    phone_change_token character varying(255) DEFAULT ''::character varying,
    phone_change_sent_at timestamp with time zone,
    confirmed_at timestamp with time zone GENERATED ALWAYS AS (LEAST(email_confirmed_at, phone_confirmed_at)) STORED,
    email_change_token_current character varying(255) DEFAULT ''::character varying,
    email_change_confirm_status smallint DEFAULT 0,
    banned_until timestamp with time zone,
    reauthentication_token character varying(255) DEFAULT ''::character varying,
    reauthentication_sent_at timestamp with time zone,
    is_sso_user boolean DEFAULT false NOT NULL,
    deleted_at timestamp with time zone,
    is_anonymous boolean DEFAULT false NOT NULL,
    CONSTRAINT users_email_change_confirm_status_check CHECK (((email_change_confirm_status >= 0) AND (email_change_confirm_status <= 2)))
);


--
-- Name: TABLE users; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON TABLE auth.users IS 'Auth: Stores user login data within a secure schema.';


--
-- Name: COLUMN users.is_sso_user; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON COLUMN auth.users.is_sso_user IS 'Auth: Set this column to true when the account comes from SSO. These accounts can have duplicate emails.';


--
-- Name: app_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.app_settings (
    key text NOT NULL,
    value jsonb NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: birthday_rounds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.birthday_rounds (
    id bigint NOT NULL,
    auth_user_id uuid,
    due_month date NOT NULL,
    first_due_stammtisch_id bigint,
    settled_stammtisch_id bigint,
    settled_at timestamp with time zone,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    profile_id bigint
);


--
-- Name: birthday_rounds_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.birthday_rounds_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: birthday_rounds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.birthday_rounds_id_seq OWNED BY public.birthday_rounds.id;


--
-- Name: profile_claims; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profile_claims (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    profile_id bigint NOT NULL,
    claimant_user_id uuid NOT NULL,
    status public.claim_status DEFAULT 'pending'::public.claim_status NOT NULL,
    approved_by uuid,
    approved_at timestamp with time zone,
    note text
);


--
-- Name: profile_claims_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profile_claims_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profile_claims_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profile_claims_id_seq OWNED BY public.profile_claims.id;


--
-- Name: profiles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.profiles (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    auth_user_id uuid,
    first_name text,
    last_name text,
    title text,
    birthday date,
    quote text,
    avatar_url text,
    middle_name text,
    role public.profile_role DEFAULT 'member'::public.profile_role NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    self_check boolean DEFAULT false NOT NULL,
    degree public.academic_degree DEFAULT 'none'::public.academic_degree NOT NULL,
    standing_order boolean DEFAULT false NOT NULL,
    is_admin boolean DEFAULT false NOT NULL
);


--
-- Name: profiles_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.profiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: profiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.profiles_id_seq OWNED BY public.profiles.id;


--
-- Name: stammtisch; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stammtisch (
    id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    date date NOT NULL,
    location text NOT NULL,
    notes text,
    created_by uuid
);

ALTER TABLE ONLY public.stammtisch REPLICA IDENTITY FULL;


--
-- Name: stammtisch_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.stammtisch_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: stammtisch_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.stammtisch_id_seq OWNED BY public.stammtisch.id;


--
-- Name: stammtisch_participants; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stammtisch_participants (
    stammtisch_id bigint NOT NULL,
    auth_user_id uuid NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stammtisch_participants_status_check CHECK ((status = ANY (ARRAY['going'::text, 'maybe'::text, 'declined'::text])))
);


--
-- Name: stammtisch_participants_unlinked; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.stammtisch_participants_unlinked (
    stammtisch_id bigint NOT NULL,
    profile_id bigint NOT NULL,
    status text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT stammtisch_participants_unlinked_status_check CHECK ((status = ANY (ARRAY['going'::text, 'maybe'::text, 'declined'::text])))
);


--
-- Name: messages; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
)
PARTITION BY RANGE (inserted_at);


--
-- Name: messages_2025_09_17; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_17 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_18; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_18 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_19; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_19 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_20; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_20 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_21; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_21 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_22; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_22 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: messages_2025_09_23; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.messages_2025_09_23 (
    topic text NOT NULL,
    extension text NOT NULL,
    payload jsonb,
    event text,
    private boolean DEFAULT false,
    updated_at timestamp without time zone DEFAULT now() NOT NULL,
    inserted_at timestamp without time zone DEFAULT now() NOT NULL,
    id uuid DEFAULT gen_random_uuid() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.schema_migrations (
    version bigint NOT NULL,
    inserted_at timestamp(0) without time zone
);


--
-- Name: subscription; Type: TABLE; Schema: realtime; Owner: -
--

CREATE TABLE realtime.subscription (
    id bigint NOT NULL,
    subscription_id uuid NOT NULL,
    entity regclass NOT NULL,
    filters realtime.user_defined_filter[] DEFAULT '{}'::realtime.user_defined_filter[] NOT NULL,
    claims jsonb NOT NULL,
    claims_role regrole GENERATED ALWAYS AS (realtime.to_regrole((claims ->> 'role'::text))) STORED NOT NULL,
    created_at timestamp without time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


--
-- Name: subscription_id_seq; Type: SEQUENCE; Schema: realtime; Owner: -
--

ALTER TABLE realtime.subscription ALTER COLUMN id ADD GENERATED ALWAYS AS IDENTITY (
    SEQUENCE NAME realtime.subscription_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: buckets; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets (
    id text NOT NULL,
    name text NOT NULL,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    public boolean DEFAULT false,
    avif_autodetection boolean DEFAULT false,
    file_size_limit bigint,
    allowed_mime_types text[],
    owner_id text,
    type storage.buckettype DEFAULT 'STANDARD'::storage.buckettype NOT NULL
);


--
-- Name: COLUMN buckets.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.buckets.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: buckets_analytics; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.buckets_analytics (
    id text NOT NULL,
    type storage.buckettype DEFAULT 'ANALYTICS'::storage.buckettype NOT NULL,
    format text DEFAULT 'ICEBERG'::text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    updated_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: migrations; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.migrations (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    hash character varying(40) NOT NULL,
    executed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


--
-- Name: objects; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.objects (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    bucket_id text,
    name text,
    owner uuid,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    last_accessed_at timestamp with time zone DEFAULT now(),
    metadata jsonb,
    path_tokens text[] GENERATED ALWAYS AS (string_to_array(name, '/'::text)) STORED,
    version text,
    owner_id text,
    user_metadata jsonb,
    level integer
);


--
-- Name: COLUMN objects.owner; Type: COMMENT; Schema: storage; Owner: -
--

COMMENT ON COLUMN storage.objects.owner IS 'Field is deprecated, use owner_id instead';


--
-- Name: prefixes; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.prefixes (
    bucket_id text NOT NULL,
    name text NOT NULL COLLATE pg_catalog."C",
    level integer GENERATED ALWAYS AS (storage.get_level(name)) STORED NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now()
);


--
-- Name: s3_multipart_uploads; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads (
    id text NOT NULL,
    in_progress_size bigint DEFAULT 0 NOT NULL,
    upload_signature text NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    version text NOT NULL,
    owner_id text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    user_metadata jsonb
);


--
-- Name: s3_multipart_uploads_parts; Type: TABLE; Schema: storage; Owner: -
--

CREATE TABLE storage.s3_multipart_uploads_parts (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    upload_id text NOT NULL,
    size bigint DEFAULT 0 NOT NULL,
    part_number integer NOT NULL,
    bucket_id text NOT NULL,
    key text NOT NULL COLLATE pg_catalog."C",
    etag text NOT NULL,
    owner_id text,
    version text NOT NULL,
    created_at timestamp with time zone DEFAULT now() NOT NULL
);


--
-- Name: schema_migrations; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.schema_migrations (
    version text NOT NULL,
    statements text[],
    name text
);


--
-- Name: seed_files; Type: TABLE; Schema: supabase_migrations; Owner: -
--

CREATE TABLE supabase_migrations.seed_files (
    path text NOT NULL,
    hash text NOT NULL
);


--
-- Name: messages_2025_09_17; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_17 FOR VALUES FROM ('2025-09-17 00:00:00') TO ('2025-09-18 00:00:00');


--
-- Name: messages_2025_09_18; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_18 FOR VALUES FROM ('2025-09-18 00:00:00') TO ('2025-09-19 00:00:00');


--
-- Name: messages_2025_09_19; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_19 FOR VALUES FROM ('2025-09-19 00:00:00') TO ('2025-09-20 00:00:00');


--
-- Name: messages_2025_09_20; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_20 FOR VALUES FROM ('2025-09-20 00:00:00') TO ('2025-09-21 00:00:00');


--
-- Name: messages_2025_09_21; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_21 FOR VALUES FROM ('2025-09-21 00:00:00') TO ('2025-09-22 00:00:00');


--
-- Name: messages_2025_09_22; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_22 FOR VALUES FROM ('2025-09-22 00:00:00') TO ('2025-09-23 00:00:00');


--
-- Name: messages_2025_09_23; Type: TABLE ATTACH; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages ATTACH PARTITION realtime.messages_2025_09_23 FOR VALUES FROM ('2025-09-23 00:00:00') TO ('2025-09-24 00:00:00');


--
-- Name: refresh_tokens id; Type: DEFAULT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('auth.refresh_tokens_id_seq'::regclass);


--
-- Name: birthday_rounds id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds ALTER COLUMN id SET DEFAULT nextval('public.birthday_rounds_id_seq'::regclass);


--
-- Name: profile_claims id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_claims ALTER COLUMN id SET DEFAULT nextval('public.profile_claims_id_seq'::regclass);


--
-- Name: profiles id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles ALTER COLUMN id SET DEFAULT nextval('public.profiles_id_seq'::regclass);


--
-- Name: stammtisch id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch ALTER COLUMN id SET DEFAULT nextval('public.stammtisch_id_seq'::regclass);


--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.audit_log_entries (instance_id, id, payload, created_at, ip_address) FROM stdin;
00000000-0000-0000-0000-000000000000	55d8b709-0e49-4288-8897-c66489391890	{"action":"user_confirmation_requested","actor_id":"9fb5a337-bd61-4b9a-9286-4639bbb3fa3f","actor_username":"s.bludau@fz-juelich.de","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-04 12:01:30.359221+00	
00000000-0000-0000-0000-000000000000	a78cc05d-a527-42b8-8d05-c5f9565045a3	{"action":"user_signedup","actor_id":"9fb5a337-bd61-4b9a-9286-4639bbb3fa3f","actor_username":"s.bludau@fz-juelich.de","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-04 12:01:53.426271+00	
00000000-0000-0000-0000-000000000000	d37ed075-883b-4f99-b13e-d6a723efa1ca	{"action":"login","actor_id":"9fb5a337-bd61-4b9a-9286-4639bbb3fa3f","actor_username":"s.bludau@fz-juelich.de","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}	2025-09-04 12:02:18.700672+00	
00000000-0000-0000-0000-000000000000	e30ebcd9-9423-415c-9dfe-c1a53fd477fd	{"action":"user_signedup","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"google"}}	2025-09-04 12:39:50.084722+00	
00000000-0000-0000-0000-000000000000	7f46f931-0580-4615-9a93-d2ee1114e269	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-04 12:41:24.415968+00	
00000000-0000-0000-0000-000000000000	7f800fd2-c393-4621-99e2-23c94a174083	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 05:50:32.005704+00	
00000000-0000-0000-0000-000000000000	a71e0db6-fb3c-4866-b8f8-bf97afc9258c	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 05:50:32.026682+00	
00000000-0000-0000-0000-000000000000	3a48001f-38c2-45e7-b5a3-5688741ef530	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 06:49:40.390506+00	
00000000-0000-0000-0000-000000000000	922b53c8-bff9-4375-a1bb-09d61bcdb4bb	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 06:49:40.409601+00	
00000000-0000-0000-0000-000000000000	4583cf42-33b0-496f-8230-dee34af2b38b	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 07:48:18.169467+00	
00000000-0000-0000-0000-000000000000	5307489d-b917-4b4b-82fd-5526aed752e0	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 07:48:18.186905+00	
00000000-0000-0000-0000-000000000000	c0747b42-799e-4630-b669-2570537cd0f4	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 08:47:15.53366+00	
00000000-0000-0000-0000-000000000000	d4b694f6-fac2-4d14-9122-4bf4eeec19c5	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 08:47:15.550188+00	
00000000-0000-0000-0000-000000000000	f6d94521-e804-4b1a-9daf-34a68e744c08	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-05 09:42:56.013765+00	
00000000-0000-0000-0000-000000000000	fdc039af-007f-4d77-a798-b798ad6e149a	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 10:41:40.310639+00	
00000000-0000-0000-0000-000000000000	ecd53887-8d95-453a-a974-6775179193db	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-05 10:41:40.323012+00	
00000000-0000-0000-0000-000000000000	9ac033b6-78d5-406d-80fe-2a8bd6159a4b	{"action":"user_repeated_signup","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-05 11:09:43.318816+00	
00000000-0000-0000-0000-000000000000	0e610221-e1b7-40a5-9fa6-17348680f1d5	{"action":"user_confirmation_requested","actor_id":"adaaff09-3051-43b4-a961-e44d67602e5f","actor_username":"timo.glantschnig@gmx.de","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-05 11:09:59.986199+00	
00000000-0000-0000-0000-000000000000	002093c6-5546-4ccd-870f-f026679c5b08	{"action":"user_signedup","actor_id":"adaaff09-3051-43b4-a961-e44d67602e5f","actor_username":"timo.glantschnig@gmx.de","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}	2025-09-05 11:10:22.595605+00	
00000000-0000-0000-0000-000000000000	0d12ada7-f5c1-4aab-80fa-f5aaa0f03571	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 06:14:56.345504+00	
00000000-0000-0000-0000-000000000000	c03874cd-ec2b-4207-a628-dc983a825c38	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 06:14:56.370046+00	
00000000-0000-0000-0000-000000000000	87e417c0-b98c-45d1-940a-e18046748931	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 07:13:32.648498+00	
00000000-0000-0000-0000-000000000000	600d8873-941d-4443-85a5-bf89a2ac6e8a	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 07:13:32.656898+00	
00000000-0000-0000-0000-000000000000	41e4dffc-9d4a-4704-80a1-c153b4286d80	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:12:32.655546+00	
00000000-0000-0000-0000-000000000000	1fdc346c-ad6f-4148-a0eb-34c516d9ba6f	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 08:12:32.672417+00	
00000000-0000-0000-0000-000000000000	5d9faeb3-2773-454d-b9a3-147a7195bed2	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 09:11:04.607835+00	
00000000-0000-0000-0000-000000000000	7c0e8463-3f57-44a1-a29a-fa9585d0b55c	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-08 09:11:04.624732+00	
00000000-0000-0000-0000-000000000000	cf1fcb41-c96f-4232-b058-9daa8b8fa65d	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 07:18:04.542037+00	
00000000-0000-0000-0000-000000000000	19743886-2a0a-46b0-936c-7c6f2b68c34e	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 07:18:04.564882+00	
00000000-0000-0000-0000-000000000000	cffd5054-a5f7-46df-b12c-bd942994f67d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:08:03.71737+00	
00000000-0000-0000-0000-000000000000	9b2cacdd-74e9-4b05-b5f1-22d26ec6a2dd	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:09:50.138797+00	
00000000-0000-0000-0000-000000000000	0de6c636-b14f-4324-9270-b5941beeb87d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:18:35.606442+00	
00000000-0000-0000-0000-000000000000	6951c92e-da23-4ac1-9fa6-dc7671b2f16f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:18:49.102254+00	
00000000-0000-0000-0000-000000000000	8a043256-843b-448b-a126-2b3ba2388e2c	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:19:13.377758+00	
00000000-0000-0000-0000-000000000000	71d6d6fd-8b19-4584-b25e-b43cd6326aa8	{"action":"user_repeated_signup","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"user","traits":{"provider":"email"}}	2025-09-09 12:20:31.558587+00	
00000000-0000-0000-0000-000000000000	80bfa316-c980-41e6-a151-d5dfcce93a72	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:23:56.721838+00	
00000000-0000-0000-0000-000000000000	c4816276-afcf-4627-bb23-6c2a7fe60739	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:32:31.093315+00	
00000000-0000-0000-0000-000000000000	192bcf49-8e4e-4012-a9c9-96e42a4cf1bb	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:40:24.785129+00	
00000000-0000-0000-0000-000000000000	4679f290-d881-4480-bdc2-267bf1b774e3	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 12:43:28.529365+00	
00000000-0000-0000-0000-000000000000	2d81b7de-31e7-4bd2-95f4-e2802ae013ca	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 12:43:28.53423+00	
00000000-0000-0000-0000-000000000000	800eec7b-3241-436c-8e30-66dc5ae30522	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:56:36.186565+00	
00000000-0000-0000-0000-000000000000	fcd8565c-5449-4dee-b636-a7587fbc1d58	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 12:57:42.672527+00	
00000000-0000-0000-0000-000000000000	dfe6ec56-9ed8-48b3-8df3-c3ed76fffae3	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 13:42:13.317481+00	
00000000-0000-0000-0000-000000000000	a6ed9672-749f-45e1-9e85-25a4a4cbb044	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-09 13:42:13.336766+00	
00000000-0000-0000-0000-000000000000	0345c62a-977f-420c-a252-9459cb2bb44b	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 14:05:52.055014+00	
00000000-0000-0000-0000-000000000000	33d3b519-862c-46e8-82e7-81e50bf73bb3	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 14:09:15.253048+00	
00000000-0000-0000-0000-000000000000	28ad5ad8-59fa-4322-a2b9-9f48a15b7421	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 14:11:22.36639+00	
00000000-0000-0000-0000-000000000000	3260b800-74fa-4450-8a64-bc1d7443e473	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 14:22:19.331747+00	
00000000-0000-0000-0000-000000000000	5d9bf1fc-95bb-4557-b838-ab483b1cdac9	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-09 14:28:52.599149+00	
00000000-0000-0000-0000-000000000000	1d5aafaa-b557-4a29-84eb-5157e2b9202b	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 06:28:34.230791+00	
00000000-0000-0000-0000-000000000000	814292d0-f006-41fe-a9a8-f875674f7d9d	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 06:28:34.25925+00	
00000000-0000-0000-0000-000000000000	d1b90d31-3984-46df-b2b1-f1b276287620	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 06:51:25.304145+00	
00000000-0000-0000-0000-000000000000	8577955e-f4d3-4db3-9cd2-20fe0805c345	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 06:51:51.880334+00	
00000000-0000-0000-0000-000000000000	971fdbb6-50a2-4ee8-920a-3d6736a2b528	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 06:54:08.424223+00	
00000000-0000-0000-0000-000000000000	3a2a3311-13c8-41ce-a1b9-b6af1d2bc118	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 06:56:06.126016+00	
00000000-0000-0000-0000-000000000000	212b86d4-3298-4a39-a8fd-957a2bceb51f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 06:56:17.036951+00	
00000000-0000-0000-0000-000000000000	0c6d969f-6b87-4550-84c2-3aaf276283de	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:07:37.731039+00	
00000000-0000-0000-0000-000000000000	088bd372-2f24-4d6d-b9ac-17cca2ff9db8	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:16:28.795115+00	
00000000-0000-0000-0000-000000000000	1e29ad05-f415-49b2-85f2-d401ae36b7f2	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:17:02.847028+00	
00000000-0000-0000-0000-000000000000	591e7949-8ccb-413c-8670-7740f7a61d47	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:17:06.0227+00	
00000000-0000-0000-0000-000000000000	05ccda13-ff85-4466-8601-797dcb298fae	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:17:28.403121+00	
00000000-0000-0000-0000-000000000000	52aa6abb-ecc0-41fb-bcce-3be801469bd8	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:28:40.843528+00	
00000000-0000-0000-0000-000000000000	68fcf031-f5e0-4a9a-9f8e-a531bcb1cde2	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:30:56.680483+00	
00000000-0000-0000-0000-000000000000	e5419f51-2d35-42d9-83ba-8194aca2dc94	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 07:30:56.681527+00	
00000000-0000-0000-0000-000000000000	0d859732-76b2-4cbe-9202-121a77aba809	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:31:01.433186+00	
00000000-0000-0000-0000-000000000000	e628b31f-986b-4130-888e-d7c96c85b320	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:41:53.87264+00	
00000000-0000-0000-0000-000000000000	82d62226-638e-42ef-a5f1-52ca6b397d05	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 07:58:01.587427+00	
00000000-0000-0000-0000-000000000000	d4802224-1136-47d8-87ff-63fbf5f7ca02	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 08:07:21.275852+00	
00000000-0000-0000-0000-000000000000	98991117-fd6c-4984-88be-e628b687a87d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 08:14:02.906193+00	
00000000-0000-0000-0000-000000000000	cc73a342-0928-4870-9d49-22ce4d7df96b	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 08:14:20.763868+00	
00000000-0000-0000-0000-000000000000	657193dc-c1e5-4b7c-ad11-7b9bec74c90e	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 08:14:38.82097+00	
00000000-0000-0000-0000-000000000000	56ba5cb6-c86c-4a39-bdc3-533d899cffe2	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:44:50.577525+00	
00000000-0000-0000-0000-000000000000	7291a4e9-b093-487b-83a5-b50ba3e6f871	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 08:44:50.588828+00	
00000000-0000-0000-0000-000000000000	e0280f7c-6c97-4ccb-9252-0bb547314b36	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:11:19.492492+00	
00000000-0000-0000-0000-000000000000	50e312bf-b0a3-4e05-88bc-88c4ce6808fb	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:11:43.505782+00	
00000000-0000-0000-0000-000000000000	8b746af8-90df-4364-a78b-05f1e14f0c77	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:15:10.262612+00	
00000000-0000-0000-0000-000000000000	4316d5fc-64ac-41fa-95d1-47f987534f0c	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:15:22.314744+00	
00000000-0000-0000-0000-000000000000	32e94532-09ee-4866-b448-06c98bf8d6b7	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:22:35.357069+00	
00000000-0000-0000-0000-000000000000	e054523a-608d-4ac6-81e4-ac41aaf72372	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:22:45.415274+00	
00000000-0000-0000-0000-000000000000	62657f1a-bb4f-4e4e-885b-cc809a6bfac2	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:29:10.379244+00	
00000000-0000-0000-0000-000000000000	50fbda16-a8fd-4dc5-bf84-58703b2aee95	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:29:15.066622+00	
00000000-0000-0000-0000-000000000000	e1028d4c-6986-4f32-b01b-8a5a7f15425d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:34:28.512389+00	
00000000-0000-0000-0000-000000000000	8f3f6311-22a5-48d3-9b20-661e236dfdf0	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:34:32.505137+00	
00000000-0000-0000-0000-000000000000	ecc67208-4e8f-40b7-bf00-7cf1ccbd46d4	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:37:25.447251+00	
00000000-0000-0000-0000-000000000000	bc7d6d50-62ad-4a7b-a748-3699972b3a4d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:37:29.708114+00	
00000000-0000-0000-0000-000000000000	ff3a662e-0ee4-405b-ba99-92a2aa211f50	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:44:35.746425+00	
00000000-0000-0000-0000-000000000000	a78f764d-b398-4a0a-9f0c-c899d524b3ae	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 09:44:35.754521+00	
00000000-0000-0000-0000-000000000000	8750cea5-1925-429c-b8dd-dc6832b7a487	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:44:45.547632+00	
00000000-0000-0000-0000-000000000000	e72acf01-f7ab-46de-bcc6-e86f22c80ca3	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:44:49.514839+00	
00000000-0000-0000-0000-000000000000	4b7af9cc-7fef-480c-9335-e59ff5bf0b45	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:47:34.336313+00	
00000000-0000-0000-0000-000000000000	df6c3abd-9538-4ad2-985b-f8f1af7c7a17	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:47:37.690225+00	
00000000-0000-0000-0000-000000000000	0fcc18bd-e38d-4760-8e84-d4724bfc2fed	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:53:53.440838+00	
00000000-0000-0000-0000-000000000000	f40bb8d5-4313-4dc9-80c0-22cd3142cc91	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 09:53:56.752031+00	
00000000-0000-0000-0000-000000000000	528337fc-fad3-48d5-84a3-fc4107c191c2	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:04:26.46234+00	
00000000-0000-0000-0000-000000000000	4bee7cad-7d84-4bdd-8944-dd09ddeb2d3a	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:04:30.316863+00	
00000000-0000-0000-0000-000000000000	44408815-04f7-4794-8d4e-cfc25bfe266e	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:06:25.061471+00	
00000000-0000-0000-0000-000000000000	a7b0af55-d53a-49e0-b1c3-04a16dfb6419	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:06:31.77446+00	
00000000-0000-0000-0000-000000000000	a6d8d450-44c4-46df-904e-5227973b8aae	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:09:20.57981+00	
00000000-0000-0000-0000-000000000000	93f6f5c4-f091-4d62-b21e-7cf439cb0263	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:09:25.223048+00	
00000000-0000-0000-0000-000000000000	360644f3-a509-45a7-ae82-1e00ed876eca	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:17:11.587761+00	
00000000-0000-0000-0000-000000000000	fcefc291-c39b-4c28-8b3d-9487678c4470	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:17:15.553269+00	
00000000-0000-0000-0000-000000000000	9f0b802d-08f8-45e0-9b93-9b975566df59	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:23:50.254566+00	
00000000-0000-0000-0000-000000000000	fd448464-1864-4efa-a851-3dae146f61e8	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:23:54.165255+00	
00000000-0000-0000-0000-000000000000	14aac90a-5a01-45a9-b81b-15f3d025f821	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 10:42:22.251995+00	
00000000-0000-0000-0000-000000000000	09dd8566-9cf8-497c-839c-58935647f1de	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 11:36:45.607372+00	
00000000-0000-0000-0000-000000000000	56740d22-1139-4bf1-86cb-13766e4f4869	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 12:18:35.656686+00	
00000000-0000-0000-0000-000000000000	c8e77344-7fde-4c53-be67-bc3bcc8ff7cd	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 13:17:02.276625+00	
00000000-0000-0000-0000-000000000000	b0931174-4fa4-4969-bb43-b7207a32b5d5	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 13:17:02.288+00	
00000000-0000-0000-0000-000000000000	a19e8a90-93c1-4ee1-9e39-b0a83eb4f2c1	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 13:17:27.556777+00	
00000000-0000-0000-0000-000000000000	03815ac7-4b30-4dfe-8ec2-381130a24d0c	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 13:28:07.467383+00	
00000000-0000-0000-0000-000000000000	d7e2cbd7-7c60-4569-95be-8f3599ced2de	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 13:41:37.150062+00	
00000000-0000-0000-0000-000000000000	cf76a094-48d6-4cbe-a6b3-f5e6af699a76	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 14:42:22.94002+00	
00000000-0000-0000-0000-000000000000	0f9ca901-48ed-42f6-9931-5ce57c64f5c7	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 14:54:17.572222+00	
00000000-0000-0000-0000-000000000000	88d8614f-0876-49d9-8c9e-19256448bd1d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 14:59:09.103437+00	
00000000-0000-0000-0000-000000000000	83e5a63e-96dc-49b4-82d3-f58ff65dc3db	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 15:06:53.23019+00	
00000000-0000-0000-0000-000000000000	8b4b3e92-a0cd-42ae-87a5-575a769a47f9	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:05:21.972721+00	
00000000-0000-0000-0000-000000000000	1c19698b-c9d9-404d-9c3d-2bbbae179f28	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 16:05:21.988322+00	
00000000-0000-0000-0000-000000000000	1423afe2-ce45-4a2c-8dca-4903f3fbcbd6	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:03:23.941672+00	
00000000-0000-0000-0000-000000000000	b04a9ae4-e1b0-4c35-83ca-dacb1129e878	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 17:03:23.95524+00	
00000000-0000-0000-0000-000000000000	fd682fc2-fb3b-49c7-8880-6b9206b3abcc	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:01:25.948245+00	
00000000-0000-0000-0000-000000000000	05e2e417-2887-4e12-9272-d40eb330abc9	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:01:25.97363+00	
00000000-0000-0000-0000-000000000000	471dcf9c-08ad-412a-869e-e130341afc27	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:59:27.845895+00	
00000000-0000-0000-0000-000000000000	98009d15-d4f4-4460-a6e4-4ebb1172b18e	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-10 18:59:27.859846+00	
00000000-0000-0000-0000-000000000000	3b01914a-eeaf-472a-8b7d-540a359e98ef	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-10 19:14:12.056755+00	
00000000-0000-0000-0000-000000000000	a529ead5-7ddd-4734-89dd-663630b8ce3b	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-11 05:06:22.234542+00	
00000000-0000-0000-0000-000000000000	b0f99e1d-148a-4cfe-95c7-a4561cd3298f	{"action":"user_signedup","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"google"}}	2025-09-11 05:12:29.060143+00	
00000000-0000-0000-0000-000000000000	f85af63b-7234-472e-a7fb-9a199642af6a	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-11 05:31:11.657347+00	
00000000-0000-0000-0000-000000000000	be3bc621-9529-42e7-9c84-fc41d1f068f0	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:07:31.285355+00	
00000000-0000-0000-0000-000000000000	6479ed64-9291-44a8-8510-0019b78af9e3	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 07:07:31.311193+00	
00000000-0000-0000-0000-000000000000	b69a0b9c-36e3-4708-ad7d-4bff64bcc0ae	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-11 07:24:06.380867+00	
00000000-0000-0000-0000-000000000000	8d751c03-4d12-4d0d-87af-9dea4486d84c	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:06:02.514063+00	
00000000-0000-0000-0000-000000000000	e2478c23-39fe-4247-83d7-c424940bc70b	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 08:06:02.534831+00	
00000000-0000-0000-0000-000000000000	8ba9827d-df79-476c-a6d0-fffdedf8f046	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:11:04.540085+00	
00000000-0000-0000-0000-000000000000	4c824878-a6e6-4b6c-af63-9fb29bf3b379	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 09:11:04.56053+00	
00000000-0000-0000-0000-000000000000	fa91d672-bf67-4239-a4de-d4a13b46ed00	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:10:21.129155+00	
00000000-0000-0000-0000-000000000000	227fee2f-bb8f-44f8-923e-64b520a6b936	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 10:10:21.13916+00	
00000000-0000-0000-0000-000000000000	08f49237-ae34-415f-8a54-896d0f101646	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"timo.glantschnig@gmx.de","user_id":"adaaff09-3051-43b4-a961-e44d67602e5f","user_phone":""}}	2025-09-11 11:14:00.168195+00	
00000000-0000-0000-0000-000000000000	bfaa6671-1c4d-4b9c-a50b-7a47a5b048aa	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"s.bludau@fz-juelich.de","user_id":"9fb5a337-bd61-4b9a-9286-4639bbb3fa3f","user_phone":""}}	2025-09-11 11:14:00.167132+00	
00000000-0000-0000-0000-000000000000	b9a806bb-20cb-45d8-8cc8-f094814f10b7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"viola.roth22@example.com","user_id":"e8f9f98d-a5fd-45d5-ae01-bcbec1f57b88","user_phone":""}}	2025-09-11 11:14:27.949598+00	
00000000-0000-0000-0000-000000000000	e4c07604-adc0-4124-a2c2-7eb19a1268ea	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"uwe.krause21@example.com","user_id":"5fa22eff-6664-4be7-ade9-9d204325019a","user_phone":""}}	2025-09-11 11:14:27.971826+00	
00000000-0000-0000-0000-000000000000	2d8dba4d-d050-4a16-957b-467c30abc4d7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"paul.lehmann16@example.com","user_id":"35139924-784a-4841-9c91-c2044d968f94","user_phone":""}}	2025-09-11 11:14:28.022631+00	
00000000-0000-0000-0000-000000000000	98b1e8db-eb4a-4253-87f2-a4337cb3650a	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"willi.brandt23@example.com","user_id":"c21ecc9e-8886-4e3e-99fd-57846ad9b813","user_phone":""}}	2025-09-11 11:14:28.03282+00	
00000000-0000-0000-0000-000000000000	048d8cfe-eef9-4fea-8f4a-fbfcb1dd9f33	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"greta.hoffmann07@example.com","user_id":"634c095e-c706-4619-bad0-d3abdc08b198","user_phone":""}}	2025-09-11 11:14:46.271079+00	
00000000-0000-0000-0000-000000000000	81212523-4c5f-4df8-bd5b-e9a52ff4bd64	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"eva.weber05@example.com","user_id":"cbdfd4e4-b853-4243-b09c-d2eb914bb570","user_phone":""}}	2025-09-11 11:14:46.321549+00	
00000000-0000-0000-0000-000000000000	8200c7ee-e4fb-4aa1-8b0b-2a7407bc9b18	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"hans.keller08@example.com","user_id":"a01fc0b2-f240-4caf-8773-f5f18bd2cf74","user_phone":""}}	2025-09-11 11:14:46.400595+00	
00000000-0000-0000-0000-000000000000	58e51ad4-4ad3-4959-871c-53edeb84168d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"carla.fischer03@example.com","user_id":"c7099d67-d262-42ab-8900-d3209548b283","user_phone":""}}	2025-09-11 11:14:46.406549+00	
00000000-0000-0000-0000-000000000000	19f7fb5b-30d9-44fa-8977-8f8c1def3996	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ben.mueller02@example.com","user_id":"11659713-9457-420b-a8cf-83c9ef92c34f","user_phone":""}}	2025-09-11 11:14:46.453722+00	
00000000-0000-0000-0000-000000000000	3ce8871c-cdaf-4fe5-8358-fab8945096ca	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"felix.becker06@example.com","user_id":"6743c25d-6dbf-424d-a0a0-2cacb6de39e1","user_phone":""}}	2025-09-11 11:14:46.46017+00	
00000000-0000-0000-0000-000000000000	561119ab-8819-4d25-8c1c-5c2023cbd44b	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:15:02.061339+00	
00000000-0000-0000-0000-000000000000	9774aca1-b003-4470-a1da-69bbd8ce277f	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 11:15:02.062442+00	
00000000-0000-0000-0000-000000000000	9af648f9-2be9-4731-95f2-928dbe4a871b	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"tina.busch20@example.com","user_id":"c37150fb-7102-4691-bedb-6de52e8150df","user_phone":""}}	2025-09-11 11:14:28.04009+00	
00000000-0000-0000-0000-000000000000	1e85b4a9-2f31-4b81-b2a2-be6a6e16a800	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"quirin.boehm17@example.com","user_id":"338a2a02-a158-4ece-9754-80e320849193","user_phone":""}}	2025-09-11 11:14:28.050261+00	
00000000-0000-0000-0000-000000000000	f30cc87d-f30c-4a77-97e3-46b97c1465dd	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"samuel.hartmann19@example.com","user_id":"f6013654-4f04-40f4-946b-2a99fe9d2750","user_phone":""}}	2025-09-11 11:14:28.11023+00	
00000000-0000-0000-0000-000000000000	74877a24-aa25-4f50-aa68-3920d287a318	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rosa.fuchs18@example.com","user_id":"280d2f1f-1b35-451f-b0ed-367a266a83bd","user_phone":""}}	2025-09-11 11:14:28.155678+00	
00000000-0000-0000-0000-000000000000	3007286f-0799-43cf-9dcf-4e4ef78ea427	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"david.wagner04@example.com","user_id":"9a1f8ca7-eed2-4531-8652-dd8352fbe067","user_phone":""}}	2025-09-11 11:14:46.26965+00	
00000000-0000-0000-0000-000000000000	32dd6c9d-4f08-4816-b487-599e2e70c07e	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:15:18.509693+00	
00000000-0000-0000-0000-000000000000	ed013e85-346e-4d0d-aacc-cfcad2f9baeb	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 12:15:18.53465+00	
00000000-0000-0000-0000-000000000000	2d056158-4ac7-476b-8b90-6c2a23b800d7	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"lukas.neumann12@example.com","user_id":"df98f9de-8677-4784-b9f8-c642c5dae9dd","user_phone":""}}	2025-09-11 12:38:05.827547+00	
00000000-0000-0000-0000-000000000000	d69ed630-b664-4ba3-babc-f54d1f0c4dae	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"iris.koenig09@example.com","user_id":"bee3dfd8-5c6e-473f-8f9c-ec256e0c32da","user_phone":""}}	2025-09-11 12:38:50.796959+00	
00000000-0000-0000-0000-000000000000	3cda251e-8992-482e-a114-aecd06fa8935	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"yannick.arnold25@example.com","user_id":"4fcf2fa5-afd9-46a6-b92f-fd2ce04896d3","user_phone":""}}	2025-09-11 12:38:50.808651+00	
00000000-0000-0000-0000-000000000000	15f47cbe-5b20-44a7-a913-f7c79c14906d	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"olivia.schaefer15@example.com","user_id":"556d144a-1c0c-442d-a0fa-d5049220e7f8","user_phone":""}}	2025-09-11 12:38:50.812049+00	
00000000-0000-0000-0000-000000000000	febfd3df-57ab-4790-9a76-968fb0207224	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"klara.braun11@example.com","user_id":"4b6cb202-9cc5-4f1b-b1cd-c3c9ba92b0bf","user_phone":""}}	2025-09-11 12:38:50.869728+00	
00000000-0000-0000-0000-000000000000	f294618b-18bc-45f2-9f09-1e1ed605feb6	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jonas.wolf10@example.com","user_id":"eaf4e425-6546-4a71-a18f-f337035bff19","user_phone":""}}	2025-09-11 12:38:50.875483+00	
00000000-0000-0000-0000-000000000000	b1b487e9-3de9-4a9e-9dc4-dad0a4b782a6	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"noah.krueger14@example.com","user_id":"3d7dbd2d-674b-4483-84d3-31b37884985b","user_phone":""}}	2025-09-11 12:38:50.963935+00	
00000000-0000-0000-0000-000000000000	b30e8014-9dda-40b4-8a76-15f9d958c137	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"anna.schmidt01@example.com","user_id":"0e80fc9c-e7d9-44ed-a970-74e07e558c02","user_phone":""}}	2025-09-11 12:38:51.085819+00	
00000000-0000-0000-0000-000000000000	0f8680ab-4f8e-4845-9e08-4278ede1b463	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"xenia.adler24@example.com","user_id":"65ddf1b6-b329-47e1-a438-3b723f700939","user_phone":""}}	2025-09-11 12:38:51.540372+00	
00000000-0000-0000-0000-000000000000	9331edfc-b7f2-44d9-8023-bfc1104f390d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-11 12:52:20.954262+00	
00000000-0000-0000-0000-000000000000	00f7a0f3-05e4-4f73-a9e1-28ed72ac07c9	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:14:02.501028+00	
00000000-0000-0000-0000-000000000000	1cb42307-f3c9-48ba-8c51-4a2c73be730a	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 13:14:02.528844+00	
00000000-0000-0000-0000-000000000000	b8226433-68a9-48a4-85c1-24a1c419c768	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:12:36.460941+00	
00000000-0000-0000-0000-000000000000	2e41dd9d-f5db-444a-ab01-eece614fdad7	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 14:12:36.47111+00	
00000000-0000-0000-0000-000000000000	fe8c2aa4-70cb-4bfd-b12f-2e5e6cddcb02	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:12:02.552329+00	
00000000-0000-0000-0000-000000000000	538860ad-cda9-4458-913a-6835fcc1e201	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 15:12:02.574001+00	
00000000-0000-0000-0000-000000000000	3ecf0d6d-19b9-4759-a4b5-7c7cd72c79a3	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:47:00.712118+00	
00000000-0000-0000-0000-000000000000	f491af01-385a-4d2e-853e-747799d012a9	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 18:47:00.733085+00	
00000000-0000-0000-0000-000000000000	8e4fbfc8-c661-4e5b-b302-a477e28ff025	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:45:06.247068+00	
00000000-0000-0000-0000-000000000000	74d265df-473e-4443-845e-dd0e88ba669e	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-11 19:45:06.261889+00	
00000000-0000-0000-0000-000000000000	c08039f9-feff-41b5-948e-122466e011cf	{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mia.scholz13@example.com","user_id":"6eadb8c2-b552-45dd-82e1-b822dc4fe7e6","user_phone":""}}	2025-09-11 20:01:03.918415+00	
00000000-0000-0000-0000-000000000000	02d7f19a-afba-4e98-a70a-bfa38ccdd4bc	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 05:25:09.013549+00	
00000000-0000-0000-0000-000000000000	8de85e29-4c70-4d12-aa9d-5742c49fa85e	{"action":"login","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 05:35:47.670835+00	
00000000-0000-0000-0000-000000000000	a92688c3-7af1-4d5d-ada8-1d03a1b40bd9	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 05:56:51.944968+00	
00000000-0000-0000-0000-000000000000	8457dc74-3cd5-4955-9469-a3a97fcc5cbc	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 06:33:49.354677+00	
00000000-0000-0000-0000-000000000000	71deed4f-ba72-48ca-aff1-78a61cbdf8d3	{"action":"token_refreshed","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:14:53.680989+00	
00000000-0000-0000-0000-000000000000	e4544ee1-0fc6-4928-92d9-097519bd6375	{"action":"token_revoked","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 07:14:53.701804+00	
00000000-0000-0000-0000-000000000000	6e2ccb94-d305-4590-8105-36cba208bfa8	{"action":"token_refreshed","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:27:16.151972+00	
00000000-0000-0000-0000-000000000000	914e0c33-434a-410c-9fc8-8b95598d3bd1	{"action":"token_revoked","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 08:27:16.168932+00	
00000000-0000-0000-0000-000000000000	a0e7d61e-a690-43d3-a657-12c8c63fae11	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:26:00.302053+00	
00000000-0000-0000-0000-000000000000	56e92b45-bc84-41c8-b966-8e83f1c18f73	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:27:17.095446+00	
00000000-0000-0000-0000-000000000000	672cd300-53b8-4074-a007-e73c88a8e1ef	{"action":"token_refreshed","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:30:33.809632+00	
00000000-0000-0000-0000-000000000000	584f46c3-e28d-40a3-bebf-2cdabbf603a9	{"action":"token_revoked","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:30:33.812453+00	
00000000-0000-0000-0000-000000000000	4551490c-f7b0-4171-ad66-50b4d4280acc	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:32:23.371902+00	
00000000-0000-0000-0000-000000000000	97b16cc1-ba52-42ac-b714-7da4ecf7949a	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:33:04.909142+00	
00000000-0000-0000-0000-000000000000	3d72582a-afd0-4813-8b73-9db07f7f7dcf	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:34:37.565315+00	
00000000-0000-0000-0000-000000000000	0254394d-e078-425c-ad30-d90f0181e91f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:40:28.814058+00	
00000000-0000-0000-0000-000000000000	ad342263-d4b8-458b-af7d-fd73db4c0f6c	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 09:48:44.383546+00	
00000000-0000-0000-0000-000000000000	fde36e87-b563-4006-8374-23385f353452	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:50:00.10595+00	
00000000-0000-0000-0000-000000000000	7e4d71c8-ac21-4cf7-af08-8da7168888a1	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 09:50:00.106864+00	
00000000-0000-0000-0000-000000000000	f7273be0-3b4f-44e6-a906-48bb0660814c	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 10:07:53.507371+00	
00000000-0000-0000-0000-000000000000	0f605d01-09fa-4e42-ade2-8d2826a1ac59	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:52:37.129467+00	
00000000-0000-0000-0000-000000000000	d1ea2ff5-d9d4-4eeb-866d-4a179d5a7889	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 10:52:37.143199+00	
00000000-0000-0000-0000-000000000000	a330c88b-6ac7-4373-a619-3a5557f0ca45	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:28:09.141647+00	
00000000-0000-0000-0000-000000000000	0924e55d-0af1-41e2-822c-9ded6de94e28	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 12:28:09.165176+00	
00000000-0000-0000-0000-000000000000	c606be8b-115a-430f-87dd-30fabaae4baa	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 13:09:48.754321+00	
00000000-0000-0000-0000-000000000000	2d6d3d49-09c6-4008-9cab-760fecaccbb9	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 13:12:53.737005+00	
00000000-0000-0000-0000-000000000000	1125dc4c-8283-4322-9914-296ea790e86b	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:26:12.03781+00	
00000000-0000-0000-0000-000000000000	57d59123-b3b4-4727-9859-65ce30212be2	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-12 13:26:12.065769+00	
00000000-0000-0000-0000-000000000000	913bcf56-d47b-475a-8567-40f5478f9718	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 13:58:08.422936+00	
00000000-0000-0000-0000-000000000000	92d06a57-62a1-4c51-ab99-523d7448a44f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 14:01:40.203687+00	
00000000-0000-0000-0000-000000000000	34de49bf-5c40-4410-bb8f-384663ed262f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 14:08:42.898119+00	
00000000-0000-0000-0000-000000000000	6166d0b0-0bdc-44a4-a96f-3fcb05ab756d	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 14:13:46.338424+00	
00000000-0000-0000-0000-000000000000	a6254b11-0c13-4519-9d3b-8890b451c77c	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 14:18:14.410928+00	
00000000-0000-0000-0000-000000000000	62cc23f3-cbde-4870-b110-68f2bfb9bc3c	{"action":"login","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 17:02:17.485416+00	
00000000-0000-0000-0000-000000000000	ea4da3a5-5c8c-467d-880d-0d433e8a9f7b	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-12 18:26:17.599223+00	
00000000-0000-0000-0000-000000000000	2231caad-ebde-4190-824a-c95ffb5677e0	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 07:47:12.14171+00	
00000000-0000-0000-0000-000000000000	7588f165-8773-4748-88f6-8b4a63c32c6b	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 07:47:12.168164+00	
00000000-0000-0000-0000-000000000000	ba09017d-03af-4228-98a7-0b592e39d8dd	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-13 07:49:17.751368+00	
00000000-0000-0000-0000-000000000000	f8e36010-ef19-4eb9-b3e5-500967f47842	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 08:47:38.97357+00	
00000000-0000-0000-0000-000000000000	315c50ba-d84c-4871-9d40-3bfd2d0e6461	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 08:47:38.991524+00	
00000000-0000-0000-0000-000000000000	296cb2fe-66cb-42a4-b116-cc371d8ae301	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-13 09:13:54.623152+00	
00000000-0000-0000-0000-000000000000	696d5fc8-fea0-4779-a99c-90ba7080ee8a	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-13 09:34:01.315384+00	
00000000-0000-0000-0000-000000000000	a1ae7d80-7a29-40ef-b0cf-8a6cf63c31b4	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 09:46:10.893491+00	
00000000-0000-0000-0000-000000000000	dec9c15b-149e-4899-8bc4-87e708be8f18	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 09:46:10.907295+00	
00000000-0000-0000-0000-000000000000	b316290b-c240-405a-8f30-17a78b5fadc5	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 10:44:42.657009+00	
00000000-0000-0000-0000-000000000000	4a10642e-8742-48ff-9a09-cc34026632eb	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 10:44:42.678815+00	
00000000-0000-0000-0000-000000000000	a7bd1362-c824-4acb-bb4d-ef18e8f49a4e	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 11:43:14.723988+00	
00000000-0000-0000-0000-000000000000	51eab1a8-02db-4c7c-9c04-c3efc89ec9e6	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 11:43:14.744174+00	
00000000-0000-0000-0000-000000000000	71c3713b-4fd2-4dea-9328-f8d111a79065	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 12:41:46.742348+00	
00000000-0000-0000-0000-000000000000	6c650dad-23da-46e6-aa06-bfce55a42210	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 12:41:46.758741+00	
00000000-0000-0000-0000-000000000000	b8f32218-3bc4-430c-a352-a83b2009d127	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 13:40:18.595075+00	
00000000-0000-0000-0000-000000000000	034e9e93-c3fa-4480-9e1f-254a1cd29d8b	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 13:40:18.610705+00	
00000000-0000-0000-0000-000000000000	42dfaea0-f8d6-418b-ab47-807eea50fb59	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 14:38:34.267124+00	
00000000-0000-0000-0000-000000000000	b1d75a87-3e7b-48a7-a694-124177699502	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-13 14:38:34.28366+00	
00000000-0000-0000-0000-000000000000	c3eab919-040a-4ca2-bfee-807726ac6b0f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-13 15:52:06.317673+00	
00000000-0000-0000-0000-000000000000	5b6e9f76-b2fe-4e8e-a59a-66bb7a058a49	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-13 19:47:58.940806+00	
00000000-0000-0000-0000-000000000000	e870f536-bff8-4a60-9693-395a8db81b02	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-16 18:22:14.174092+00	
00000000-0000-0000-0000-000000000000	455899f8-0064-47f5-9d0a-6b88c429407e	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-16 18:36:29.514072+00	
00000000-0000-0000-0000-000000000000	580ff97d-2c49-43ce-8264-7343a0bc6130	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 19:30:38.684287+00	
00000000-0000-0000-0000-000000000000	c77c6d29-ed48-4a35-941b-abf15a01bf02	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 19:30:38.701041+00	
00000000-0000-0000-0000-000000000000	5b293292-da55-43c8-85d0-4dc4858b5329	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 19:34:32.572177+00	
00000000-0000-0000-0000-000000000000	ae46a053-b64c-4d32-8c30-c5fc2eabcae4	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-16 19:34:32.573085+00	
00000000-0000-0000-0000-000000000000	c29e3da8-4f07-440f-9c92-3fee2d0f656f	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-17 05:46:46.713631+00	
00000000-0000-0000-0000-000000000000	9dc78b6f-d0e6-4939-afce-ae996484d7a0	{"action":"login","actor_id":"48fd43aa-0ec2-475d-80c0-ffc946ec66b2","actor_name":"Timo Glantschnig","actor_username":"timo.glantschnig@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-17 06:11:54.981154+00	
00000000-0000-0000-0000-000000000000	9cead1c8-8a25-4eb9-bb87-d0b697022b0e	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-17 17:24:19.23534+00	
00000000-0000-0000-0000-000000000000	14e0a80e-d2c7-4128-8f83-f768813bdf22	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-18 15:30:54.276378+00	
00000000-0000-0000-0000-000000000000	fce101a6-6b30-418d-bf12-10c981227956	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-19 12:20:05.45875+00	
00000000-0000-0000-0000-000000000000	cce984f9-b5fd-40ba-8750-9fd929562208	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 13:18:30.241523+00	
00000000-0000-0000-0000-000000000000	0ea4e6ea-81e3-4761-aec6-e47c1aea2837	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 13:18:30.263821+00	
00000000-0000-0000-0000-000000000000	a4eb1d97-848d-4668-a1f2-24dd0f505997	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 14:16:32.148257+00	
00000000-0000-0000-0000-000000000000	e6280091-fd84-42fe-acda-ae183dd8cd6d	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 14:16:32.169565+00	
00000000-0000-0000-0000-000000000000	d1d1e94a-030b-47c3-9587-b5cee6c9b8d7	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-19 14:33:14.283756+00	
00000000-0000-0000-0000-000000000000	bb1ebdfd-267c-4a63-8572-e5c88325cc88	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 15:14:33.821706+00	
00000000-0000-0000-0000-000000000000	d0fa820d-850c-4062-95f5-2f4bd4462cba	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 15:14:33.835081+00	
00000000-0000-0000-0000-000000000000	233da6d7-c0c4-4cbb-bc68-4c5f3711d997	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 16:12:35.530565+00	
00000000-0000-0000-0000-000000000000	f7298f23-c3aa-49ba-9591-6b59bea14ce2	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 16:12:35.547372+00	
00000000-0000-0000-0000-000000000000	75d20e25-c411-4d55-819c-fad7ba7c5cba	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 17:10:37.764842+00	
00000000-0000-0000-0000-000000000000	b4c02132-9ea9-49c4-9a22-e8b96411b65a	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 17:10:37.794828+00	
00000000-0000-0000-0000-000000000000	82771a45-68e9-4824-b03c-7e8f31eb9376	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-19 17:41:41.547802+00	
00000000-0000-0000-0000-000000000000	d0e4ad43-9b9e-437b-a214-c87e5d46e7b6	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-19 17:46:57.637109+00	
00000000-0000-0000-0000-000000000000	c039a36e-c6d2-41d0-a5c3-6e1b0dcc678d	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 19:46:55.836051+00	
00000000-0000-0000-0000-000000000000	b8a880a4-8418-4188-bdc9-73770026a362	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-19 19:46:55.863911+00	
00000000-0000-0000-0000-000000000000	d0530a58-6cc6-409f-9cc0-205eacac4e4d	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 12:52:55.839825+00	
00000000-0000-0000-0000-000000000000	cb737ea3-dcda-4c22-bedf-d180b886fef9	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 12:52:55.852102+00	
00000000-0000-0000-0000-000000000000	ed519108-0334-4e60-874a-24347a04a5b2	{"action":"login","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"google"}}	2025-09-20 13:54:47.774818+00	
00000000-0000-0000-0000-000000000000	08004cba-92d5-4afe-88da-7ef6a74389a2	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 13:56:34.972169+00	
00000000-0000-0000-0000-000000000000	91f1ea13-37e8-4e71-807b-55fecd1cf5e8	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 13:56:34.973136+00	
00000000-0000-0000-0000-000000000000	08f3b7e5-79f6-491a-8c1b-3838fb52dcc1	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:20:29.661153+00	
00000000-0000-0000-0000-000000000000	c154ce98-64f3-495a-9c0f-910882b5d287	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 16:20:29.689341+00	
00000000-0000-0000-0000-000000000000	9e1c8c18-73d4-47f1-b7f8-121f0eb228e9	{"action":"token_refreshed","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 20:46:52.140372+00	
00000000-0000-0000-0000-000000000000	e58c9326-2dc0-48c8-8faf-6dafdfb5eadc	{"action":"token_revoked","actor_id":"89a6927b-bf21-4d09-90a2-353a3d93ed07","actor_name":"Sebastian Bludau","actor_username":"s.bludau@gmail.com","actor_via_sso":false,"log_type":"token"}	2025-09-20 20:46:52.161992+00	
\.


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.flow_state (id, user_id, auth_code, code_challenge_method, code_challenge, provider_type, provider_access_token, provider_refresh_token, created_at, updated_at, authentication_method, auth_code_issued_at) FROM stdin;
\.


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.identities (provider_id, user_id, identity_data, provider, last_sign_in_at, created_at, updated_at, id) FROM stdin;
101345360200873217657	89a6927b-bf21-4d09-90a2-353a3d93ed07	{"iss": "https://accounts.google.com", "sub": "101345360200873217657", "name": "Sebastian Bludau", "email": "s.bludau@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLyi8G2l3cFi8hBg0jbH-LKw6y5geUfBvIbUv3Sbc0KBknTKEdfXA=s96-c", "full_name": "Sebastian Bludau", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLyi8G2l3cFi8hBg0jbH-LKw6y5geUfBvIbUv3Sbc0KBknTKEdfXA=s96-c", "provider_id": "101345360200873217657", "email_verified": true, "phone_verified": false}	google	2025-09-04 12:39:50.079556+00	2025-09-04 12:39:50.079611+00	2025-09-20 13:54:47.740049+00	dbaea87f-e5cb-48ab-8247-db1df504fe82
114625133205069592698	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	{"iss": "https://accounts.google.com", "sub": "114625133205069592698", "name": "Timo Glantschnig", "email": "timo.glantschnig@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJmcAg-GWsTV7Ve6ni5Fu6-3OsWNcWVehqtIrbfpl39NGBbZSGQxg=s96-c", "full_name": "Timo Glantschnig", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJmcAg-GWsTV7Ve6ni5Fu6-3OsWNcWVehqtIrbfpl39NGBbZSGQxg=s96-c", "provider_id": "114625133205069592698", "email_verified": true, "phone_verified": false}	google	2025-09-11 05:12:29.052998+00	2025-09-11 05:12:29.053055+00	2025-09-17 06:11:54.95728+00	74808b69-a1a6-49ea-aace-3f6aa5b01f8f
\.


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.instances (id, uuid, raw_base_config, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_amr_claims (session_id, created_at, updated_at, authentication_method, id) FROM stdin;
0a3705d0-8140-4481-8a37-db98fcae0dd1	2025-09-04 12:39:50.11505+00	2025-09-04 12:39:50.11505+00	oauth	6497755f-d7f5-4163-80b1-389bd206ebe2
2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1	2025-09-04 12:41:24.467473+00	2025-09-04 12:41:24.467473+00	oauth	ba5901d4-f440-4321-aafe-dfe5439cca1b
f6e8e38d-315a-446a-abb4-059e5a6b742f	2025-09-05 09:42:56.045074+00	2025-09-05 09:42:56.045074+00	oauth	43f74d29-9427-42c2-9242-6f1c68b58728
8698ce28-21dc-4cd5-b1d9-6fad38e1b67b	2025-09-09 12:08:03.785173+00	2025-09-09 12:08:03.785173+00	oauth	07793845-ac80-4676-9e19-5b56fa12a293
3da4576d-d8f3-4831-88fc-868d221a1ca9	2025-09-09 12:09:50.143814+00	2025-09-09 12:09:50.143814+00	oauth	a4ac25c4-0cf1-4abb-b17b-1ac0d6ae2728
c15cf675-0dcf-4b76-b016-efb63f186790	2025-09-09 12:18:35.617799+00	2025-09-09 12:18:35.617799+00	oauth	7e32e92b-8940-4571-b9aa-5abd02698df5
603eab92-5806-4cd7-8c4a-76a174b15e14	2025-09-09 12:18:49.105538+00	2025-09-09 12:18:49.105538+00	oauth	0155f749-462c-4a68-91ce-54b3608d4ffb
f180377b-76f0-47f9-9b88-b32e1f17cf9d	2025-09-09 12:19:13.380356+00	2025-09-09 12:19:13.380356+00	oauth	ff7b1905-3e1a-4db9-8d3f-dfd83b13e6df
86da52b2-1fcf-41b8-881b-ebc298b5c907	2025-09-09 12:23:56.741565+00	2025-09-09 12:23:56.741565+00	oauth	8febef89-9148-4856-b320-1cdf17ec559a
85798295-c86e-489c-beaf-59698297c6a6	2025-09-09 12:32:31.107545+00	2025-09-09 12:32:31.107545+00	oauth	12e29ced-0215-4a0c-a121-de362318496e
6cdf0ae7-562c-492c-91d3-f43edfc0b748	2025-09-09 12:40:24.791531+00	2025-09-09 12:40:24.791531+00	oauth	67280a50-6c33-4fcc-8ec0-4433c88121c1
0562b163-8a6b-4c79-b0d0-cf61ae505127	2025-09-09 12:56:36.202481+00	2025-09-09 12:56:36.202481+00	oauth	452e3174-9bfd-45a8-badb-a81b3485eac3
c62f9816-0b97-4b56-84b6-2f81ab7fea2a	2025-09-09 12:57:42.680949+00	2025-09-09 12:57:42.680949+00	oauth	eb332ea8-8af2-4acb-9a50-90e2d01a4e4d
7ff9374b-11bb-4244-89c6-118a23955a57	2025-09-09 14:05:52.090895+00	2025-09-09 14:05:52.090895+00	oauth	d6651344-c2cb-417d-a29e-c84df32abf5a
f0d10d5e-19f9-4943-a52a-9bd3c570dea5	2025-09-09 14:09:15.258993+00	2025-09-09 14:09:15.258993+00	oauth	e5e320f9-5ab7-4cff-9fe5-7b8e44ded599
68c45bc4-3f04-4482-851c-bf6d5e613153	2025-09-09 14:11:22.381914+00	2025-09-09 14:11:22.381914+00	oauth	061f0283-dbff-4fc5-8a2d-67020a3d3351
3deda4a2-7105-4cc1-a086-c3baefbf6c40	2025-09-09 14:22:19.361851+00	2025-09-09 14:22:19.361851+00	oauth	1f23265e-dc9f-4c27-9092-1ad1c4b545bc
162aeeca-db34-40d2-890b-266e861119aa	2025-09-09 14:28:52.608609+00	2025-09-09 14:28:52.608609+00	oauth	1927aa4e-b4ba-4f9b-a386-4dba49ad089a
5d9d7f58-cb0d-483d-8f11-cc2d3ab14a02	2025-09-10 06:51:25.336654+00	2025-09-10 06:51:25.336654+00	oauth	4b7fbc62-6f3b-406f-9699-7a531ddf3942
9eba46cb-3d8f-4e24-a8eb-de7cc9d8d795	2025-09-10 06:51:51.883587+00	2025-09-10 06:51:51.883587+00	oauth	b558603c-70b8-4d78-9c43-654a68623ed5
9453dcec-f3ad-4482-9e56-ef5fbc30a60f	2025-09-10 06:54:08.429819+00	2025-09-10 06:54:08.429819+00	oauth	5ea6f29f-358e-4ca2-9d64-742109decd59
0f63bbb5-a978-442c-be9b-8b2a7b9117ad	2025-09-10 06:56:06.132241+00	2025-09-10 06:56:06.132241+00	oauth	ee4ade88-ab1c-40b9-92d8-8108685eee97
782eb562-0c30-429d-aab4-22e0425d8e21	2025-09-10 06:56:17.040695+00	2025-09-10 06:56:17.040695+00	oauth	fddadaff-9b6a-487e-aabd-c81bfff38d33
e7dafe4d-161f-438d-8158-2c925a96852c	2025-09-10 07:07:37.740795+00	2025-09-10 07:07:37.740795+00	oauth	67c2730e-810b-4850-92e1-734d3e76678b
6292b1b1-a4f6-42d0-b995-4e36e44c55ef	2025-09-10 07:16:28.814284+00	2025-09-10 07:16:28.814284+00	oauth	08bd2f3d-e4e4-45ed-8284-678aa3e3a4f9
f4b0d65b-6363-4ff6-8554-7e6ca353544e	2025-09-10 07:17:02.850652+00	2025-09-10 07:17:02.850652+00	oauth	d1fad8d4-2cce-4df2-8320-f13575457e55
97257909-efbd-4c63-ad47-21184e2a4101	2025-09-10 07:17:06.026413+00	2025-09-10 07:17:06.026413+00	oauth	a82621f6-70af-4d07-9a66-972a9f09fc2b
04400b9a-7094-4fd6-bb2c-0e872cbae98c	2025-09-10 07:17:28.407272+00	2025-09-10 07:17:28.407272+00	oauth	ad3adba0-b66c-440b-b247-6b47da67fdf1
e8b690fa-a8d3-4047-9e83-f071d26509f8	2025-09-10 07:28:40.876552+00	2025-09-10 07:28:40.876552+00	oauth	efcd4d5a-cc1d-4a8b-9a37-3d5363232618
62c8206f-e89f-4aa0-ae3a-a3f84b2be815	2025-09-10 07:31:01.435892+00	2025-09-10 07:31:01.435892+00	oauth	fd6ebff4-5cf3-4c97-a3ab-10807852ffd1
c03dce7c-3a2a-4836-82ce-e3835591b190	2025-09-10 07:41:53.883144+00	2025-09-10 07:41:53.883144+00	oauth	a2dc0fa9-5f1d-4b71-b62e-a90deef2f7cb
c07fffa0-997e-4896-ab8f-fbdd18365ce2	2025-09-10 07:58:01.613382+00	2025-09-10 07:58:01.613382+00	oauth	bd5e1e75-a298-4c67-a49c-af7638657290
e8dac447-d0de-4e39-9f29-cbe78e2416d5	2025-09-10 08:07:21.287863+00	2025-09-10 08:07:21.287863+00	oauth	3ed2e2ce-a602-4609-a3ef-bc894fc96196
439184a7-15de-4057-8eeb-3e7d58738687	2025-09-10 08:14:02.919662+00	2025-09-10 08:14:02.919662+00	oauth	d76ec1cf-7112-473c-92fa-4aabd6d25bda
e10db4af-03c9-42dc-ae55-4978add58f6d	2025-09-10 08:14:20.76744+00	2025-09-10 08:14:20.76744+00	oauth	2e5d2757-d034-4e38-a97a-7c714334fefd
7093ebc5-3745-4e9a-a363-ede945c5bf6f	2025-09-10 08:14:38.831423+00	2025-09-10 08:14:38.831423+00	oauth	425b85fb-d26b-44cf-8508-806c69e2b7f9
c2e0aa88-f307-4c02-90fd-f0d00ea90db7	2025-09-10 09:11:19.513512+00	2025-09-10 09:11:19.513512+00	oauth	af510722-49ca-41b1-b611-36e9071b8625
c0922be0-3e34-4715-853d-249b3c739412	2025-09-10 09:11:43.508788+00	2025-09-10 09:11:43.508788+00	oauth	edb62f4c-ec21-4a63-a24b-78425da9faf9
a05a57ad-8ae1-45a8-ae2c-42ecbd0ad99e	2025-09-10 09:15:10.289508+00	2025-09-10 09:15:10.289508+00	oauth	e9cfd9c2-bf9b-4110-bf81-fd10fe107da2
0654126b-919f-4456-a579-a2c09253ed62	2025-09-10 09:15:22.317631+00	2025-09-10 09:15:22.317631+00	oauth	9c9fc21a-c325-4d99-929c-087611244821
32b66bce-c3cb-458a-8711-1d965983a6f6	2025-09-10 09:22:35.390571+00	2025-09-10 09:22:35.390571+00	oauth	8ad2b291-0427-4904-ab20-256f9fb9b8d5
88e6930d-b8cc-41cf-bb28-7164a31500d4	2025-09-10 09:22:45.431199+00	2025-09-10 09:22:45.431199+00	oauth	6d132e31-2b26-43d5-a63e-48f66a1cd1c7
ea3c5f6e-d923-4132-9280-e85ffe89c475	2025-09-10 09:29:10.385987+00	2025-09-10 09:29:10.385987+00	oauth	78c6776f-7757-4fd2-b774-e14440b5d9d1
f2c3858a-0078-49ce-8826-b6e84ce7f2d4	2025-09-10 09:29:15.069261+00	2025-09-10 09:29:15.069261+00	oauth	e89ec42b-852d-4b81-9b88-f2a1c9b3e97e
a833571e-4076-4347-af59-c2275a56c8c7	2025-09-10 09:34:28.555394+00	2025-09-10 09:34:28.555394+00	oauth	07b47aa5-155c-419c-aa78-e5d953ea48be
e2c1b92c-5422-4b56-a93e-49c845ad608c	2025-09-10 09:34:32.509948+00	2025-09-10 09:34:32.509948+00	oauth	00a2fd02-ebb0-4e8a-8e47-3b3bc4274963
ea8dc2e2-1958-4926-8f24-7e7bb1bdc977	2025-09-10 09:37:25.45457+00	2025-09-10 09:37:25.45457+00	oauth	da68e749-a79b-4ef5-8f8d-6fdd3a62065e
2f21cf1c-b371-4fa2-aa2b-e661b6809122	2025-09-10 09:37:29.710733+00	2025-09-10 09:37:29.710733+00	oauth	0f2762e8-c562-4dd1-a867-0e390039bd69
0738c11f-3587-44b7-9a4b-be6386dcbbfa	2025-09-10 09:44:45.553+00	2025-09-10 09:44:45.553+00	oauth	d13f1403-5156-4b6a-bdf0-3f81d445184e
64aced40-3e05-4d55-a077-c3ed17925106	2025-09-10 09:44:49.520112+00	2025-09-10 09:44:49.520112+00	oauth	1b88114e-26b8-4279-918b-5dc94f5258d4
587cb413-0516-451f-bbad-4db4377375b2	2025-09-10 09:47:34.342921+00	2025-09-10 09:47:34.342921+00	oauth	b36c6dea-f921-4a41-87f9-062d626a6453
71a3fa8b-2626-4672-b9db-3d7d9b0bf0a2	2025-09-10 09:47:37.693021+00	2025-09-10 09:47:37.693021+00	oauth	264cbf42-9253-4456-8bc9-670ffaad1033
e94426fd-936f-4e1e-b965-586d4599584d	2025-09-10 09:53:53.459808+00	2025-09-10 09:53:53.459808+00	oauth	f7bc7212-30c3-4ff8-8f9f-295beb997a62
b783a31b-93f4-4739-b1c7-b0db4f6cda6d	2025-09-10 09:53:56.760245+00	2025-09-10 09:53:56.760245+00	oauth	98117602-cdfc-494d-8a65-b6ed80bbeae5
90dd5007-d70e-48da-a590-a868bd9a3d26	2025-09-10 10:04:26.481567+00	2025-09-10 10:04:26.481567+00	oauth	097009dc-b559-44b0-9366-dcc2704aef75
062feae9-2f55-4235-8613-c712d45fdbb3	2025-09-10 10:04:30.323251+00	2025-09-10 10:04:30.323251+00	oauth	67c19b7f-75ba-4e5b-a247-fd1df4c93ab8
b415a724-6b6d-4b09-93a0-3ae0dbf8f750	2025-09-10 10:06:25.065458+00	2025-09-10 10:06:25.065458+00	oauth	fdcfd898-6772-4b43-84ef-9d02a4232282
701659a8-f283-4d6a-82ea-5c080b149684	2025-09-10 10:06:31.777248+00	2025-09-10 10:06:31.777248+00	oauth	d11e1f09-e8a7-4254-9a8d-6e4ca4d1af01
4cddfeae-1884-4c35-b9a9-5c6dac2edd9f	2025-09-10 10:09:20.586653+00	2025-09-10 10:09:20.586653+00	oauth	a270ee2e-71a7-41af-9113-326c42b754b6
bbe24cc5-5e01-48b1-9feb-23ce3a1e7348	2025-09-10 10:09:25.225814+00	2025-09-10 10:09:25.225814+00	oauth	ddd50c39-ee98-404e-bb8c-bf174a2076b3
99d65efd-c81b-4353-ad4a-aff46bd30955	2025-09-10 10:17:11.597156+00	2025-09-10 10:17:11.597156+00	oauth	d27d7679-1bbf-426c-bb2b-fac1cf9a9e97
c89f0e40-8a4c-47cc-a5ca-c5ce586d3960	2025-09-10 10:17:15.556816+00	2025-09-10 10:17:15.556816+00	oauth	9d2abc79-46b2-4f24-8bfb-c2ec7570da05
673fdce0-4192-4344-bfaa-ac00cd25b041	2025-09-10 10:23:50.296909+00	2025-09-10 10:23:50.296909+00	oauth	599a98f4-5da6-4f99-a51d-44e7eb260fa9
df9dcaf3-6355-4106-a14b-bef0279a2eff	2025-09-10 10:23:54.177196+00	2025-09-10 10:23:54.177196+00	oauth	88ad34ca-6912-46d3-8aca-b2a648403473
31e5f56c-f266-4e78-919a-0fe494e8c694	2025-09-10 10:42:22.31105+00	2025-09-10 10:42:22.31105+00	oauth	f9717116-fc7f-4a0d-bf1b-436530d13ca5
a658fe8f-ae26-48a9-bfd1-9891ca9245ad	2025-09-10 11:36:45.657284+00	2025-09-10 11:36:45.657284+00	oauth	f69ad703-8360-4b2b-b8c5-8fbc458d494e
ca1499c3-6aad-4fc3-81db-6e4ce1d89fea	2025-09-10 12:18:35.699656+00	2025-09-10 12:18:35.699656+00	oauth	0578d613-5e77-41c0-9c8f-b839f5b8b635
a5ddea17-ca91-43ad-a27b-43fb420674a6	2025-09-10 13:17:27.569313+00	2025-09-10 13:17:27.569313+00	oauth	8b76e07c-efbc-43df-bc5a-01b67e49bec2
62dead2e-7a67-4ddc-8ecb-f1d93660ccf9	2025-09-10 13:28:07.491041+00	2025-09-10 13:28:07.491041+00	oauth	4731f460-f776-478a-86e1-3ac4cae5d36e
d4b3f525-7830-47e1-8c43-0bb191ceeb8c	2025-09-10 13:41:37.175982+00	2025-09-10 13:41:37.175982+00	oauth	e1d7df6e-3318-48c7-b45e-5196ea610455
c9c10cce-a572-4864-874e-adbc329e2649	2025-09-10 14:42:23.012341+00	2025-09-10 14:42:23.012341+00	oauth	7c053935-f1d8-4305-942f-8b63368b87eb
fdb2aba4-0c95-4fed-bf5d-7b5299aae8fe	2025-09-10 14:54:17.609062+00	2025-09-10 14:54:17.609062+00	oauth	d1454f95-f38d-4ab6-b520-32d4961db881
873379fa-dabb-496c-a80e-001ff6984f40	2025-09-10 14:59:09.115919+00	2025-09-10 14:59:09.115919+00	oauth	acafcd06-d149-4918-8076-a165221a33d3
4c892597-09d9-4d7c-b82f-55c70e26a961	2025-09-10 15:06:53.248065+00	2025-09-10 15:06:53.248065+00	oauth	72c2a4e6-9a2a-4daa-a883-edc04ecf2b2d
642f2009-6916-4a14-94be-bfb2aaf5ccc6	2025-09-10 19:14:12.099196+00	2025-09-10 19:14:12.099196+00	oauth	201e5771-009c-471d-ba3d-77d6d80b475d
a29a4b51-4855-4ff4-90b8-159a550fde35	2025-09-11 05:06:22.279518+00	2025-09-11 05:06:22.279518+00	oauth	c0e67b87-1454-4f5b-be7b-410a21e670f2
b1f5775f-f096-47fb-88cb-f933dbdf59b1	2025-09-11 05:12:29.072971+00	2025-09-11 05:12:29.072971+00	oauth	7654a18b-ec76-42d9-9e5b-1c7400defea9
5cedfd09-c347-4a35-ada2-c8f68ccae7e5	2025-09-11 05:31:11.702602+00	2025-09-11 05:31:11.702602+00	oauth	d881bdfe-6b31-4644-a7a4-29a302f1f4ac
223f2520-c70c-4824-9b0f-ca47529b0872	2025-09-11 07:24:06.407158+00	2025-09-11 07:24:06.407158+00	oauth	cf27cee9-b138-4fc4-b145-ba06edcff984
8a5e1ef9-74c3-46a0-a246-564a57661439	2025-09-11 12:52:20.993045+00	2025-09-11 12:52:20.993045+00	oauth	e198e778-3cb3-416f-a903-654d4091e613
4eb4839e-0c1c-4bc7-8985-0d87e872640d	2025-09-12 05:25:09.085038+00	2025-09-12 05:25:09.085038+00	oauth	8c7cfbad-7380-4083-9e09-60e001eba876
949f15de-65a8-4129-88f3-158b32ca75a5	2025-09-12 05:35:47.687409+00	2025-09-12 05:35:47.687409+00	oauth	9570d4c5-1f86-4870-9dc0-092910af115a
f0e8bac0-9bdf-4f14-9b7b-be95881d15f9	2025-09-12 05:56:51.981779+00	2025-09-12 05:56:51.981779+00	oauth	5c75d750-3430-45af-80cd-bbf720ac39d6
3ecacd8a-6c36-4350-be40-3b30eeb75a81	2025-09-12 06:33:49.417135+00	2025-09-12 06:33:49.417135+00	oauth	77c1a697-a1d7-46cb-8346-602553287773
d3e8e587-4dce-4b2f-84ef-e286d887b8a9	2025-09-12 09:26:00.362901+00	2025-09-12 09:26:00.362901+00	oauth	076c823e-cdc7-4137-86d4-79873d6bf127
05269081-658a-4a04-a350-d7b846331340	2025-09-12 09:27:17.103531+00	2025-09-12 09:27:17.103531+00	oauth	3c7ca181-fb9b-4eb6-8c62-aa40561be4a6
d6bbc662-49a7-4176-8c6f-3a0c68fce8bb	2025-09-12 09:32:23.378573+00	2025-09-12 09:32:23.378573+00	oauth	d16d4a3c-e5cb-4d9c-944c-e6f16af2b624
7dafb77a-b7c4-4bf7-b83d-720b0917d40e	2025-09-12 09:33:04.912714+00	2025-09-12 09:33:04.912714+00	oauth	f7bc9cd2-6e0e-4191-ab0a-b9778301d0ca
2f5c41f0-e868-4fb9-9f9d-9c539f56b6c5	2025-09-12 09:34:37.599158+00	2025-09-12 09:34:37.599158+00	oauth	3b802b36-15cb-42bd-9c2c-d0e584e108d2
1256b3d5-18d2-439f-9bc3-ef13a1941159	2025-09-12 09:40:28.823852+00	2025-09-12 09:40:28.823852+00	oauth	6c0337c7-a21c-4455-906b-d781dc56cbaf
245a187c-ade6-4aa8-95f0-dbb9fa719f17	2025-09-12 09:48:44.391095+00	2025-09-12 09:48:44.391095+00	oauth	9bbb1c93-a2a5-4521-908f-3fba0bbaec29
3d151b60-814b-494d-a4d1-4ade883af0bc	2025-09-12 10:07:53.526536+00	2025-09-12 10:07:53.526536+00	oauth	755dbd1a-de6a-4b4d-bcd1-7e0cecabdfdd
cd25add9-570c-4066-a843-05d583a90e4d	2025-09-12 13:09:48.788269+00	2025-09-12 13:09:48.788269+00	oauth	783c366a-5e7c-4187-b0a1-d47b6a386601
cb6249d4-aaf8-4607-b115-b0cf28c8e217	2025-09-12 13:12:53.740773+00	2025-09-12 13:12:53.740773+00	oauth	effde370-51bd-431c-8435-d61e6074ce44
9a4501c7-09f5-41e8-9001-5984b27c2b87	2025-09-12 13:58:08.472438+00	2025-09-12 13:58:08.472438+00	oauth	26f4b4e8-0ce0-4e53-9199-465ff387f988
f974a96b-ef83-4736-94d6-381ebff1048f	2025-09-12 14:01:40.223615+00	2025-09-12 14:01:40.223615+00	oauth	91b3bd98-bb9e-46b3-8fd1-2dffbcac1342
1695e108-4a7d-4cb3-a839-c61990d654d1	2025-09-12 14:08:42.919963+00	2025-09-12 14:08:42.919963+00	oauth	2a3e48d4-774c-44ce-b631-6583798f82be
65cd1f13-a2df-4500-a300-6ff988540979	2025-09-12 14:13:46.352127+00	2025-09-12 14:13:46.352127+00	oauth	b9f3e7b6-894b-4f0b-9422-44f879fb8b6c
693648e4-86a7-488b-8973-b28f323027a3	2025-09-12 14:18:14.416736+00	2025-09-12 14:18:14.416736+00	oauth	6a97c37a-b217-4936-bbd9-b8f3296eb55f
c3414518-8057-4edb-85f6-0c24b7331882	2025-09-12 17:02:17.54449+00	2025-09-12 17:02:17.54449+00	oauth	58068908-7bc9-4adb-8e38-61d04d8ea879
453ad9c6-b310-43d1-8edc-1ff77594210f	2025-09-12 18:26:17.644644+00	2025-09-12 18:26:17.644644+00	oauth	a2373adc-6825-4ea0-9d38-6a422351c7d7
74a0d405-644a-461a-8986-2ba1da0a913b	2025-09-13 07:49:17.763809+00	2025-09-13 07:49:17.763809+00	oauth	5653b979-f3f7-409d-bee5-151879618d73
6b172418-72ca-4fce-bd80-2d776a8172f6	2025-09-13 09:13:54.676458+00	2025-09-13 09:13:54.676458+00	oauth	1b5dbc8c-475b-4dc9-8b12-21bef97bf360
90737492-469f-4756-a07d-86e8fe852c83	2025-09-13 09:34:01.364369+00	2025-09-13 09:34:01.364369+00	oauth	9d08de9a-f259-4985-be0b-1f20e3d6d965
31deae5a-99c9-44a5-ba46-600f2e97c0ff	2025-09-13 15:52:06.398728+00	2025-09-13 15:52:06.398728+00	oauth	5380328e-4001-47b4-8e3b-c2f6ccadc642
1cd4c387-f548-40b3-b77d-dcc7352a939a	2025-09-13 19:47:59.015393+00	2025-09-13 19:47:59.015393+00	oauth	977b393f-d7e4-4949-bedc-415fafefbc2c
8cce0526-a7ea-47db-b7d5-7e7139619ae8	2025-09-16 18:22:14.256299+00	2025-09-16 18:22:14.256299+00	oauth	47ba7447-508e-4298-bf29-452a0f09940c
cfe36b6f-e785-4841-ae72-40f548e98691	2025-09-16 18:36:29.573028+00	2025-09-16 18:36:29.573028+00	oauth	b8446cdb-e570-4ef3-b95b-27925001404f
4d824afd-7893-406a-a8bf-ced6da398a80	2025-09-17 05:46:46.795486+00	2025-09-17 05:46:46.795486+00	oauth	bb1b851d-29ae-4591-a675-6468edb417ef
39eee4b9-117a-438a-af18-bae2c06aa153	2025-09-17 06:11:55.014142+00	2025-09-17 06:11:55.014142+00	oauth	55fe25f3-51ef-4ca2-a1a2-3a9703e2284c
7d6db38e-b86f-4f75-800b-7f70c7015c0e	2025-09-17 17:24:19.312618+00	2025-09-17 17:24:19.312618+00	oauth	67d477c8-75fb-48c6-bb40-b1bc0c6f7694
d07a582f-450d-4ce8-b30d-52e6514ab5bf	2025-09-18 15:30:54.355738+00	2025-09-18 15:30:54.355738+00	oauth	73dc77f5-99ae-4846-9cee-f5f841d7b25d
8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331	2025-09-19 12:20:05.534671+00	2025-09-19 12:20:05.534671+00	oauth	8a949e13-473f-47a1-b526-1ece44e289c3
404b9b77-28fe-42cf-adb2-45b25e8085b3	2025-09-19 14:33:14.325078+00	2025-09-19 14:33:14.325078+00	oauth	af48f17e-1b6d-4739-8796-689bb0c72aea
0f0069c6-5233-437d-85e4-8ebe44807dd1	2025-09-19 17:41:41.590103+00	2025-09-19 17:41:41.590103+00	oauth	982d230c-71b8-4a45-a004-b8f85f14a98e
89adf630-55dd-4b17-8e68-43c7c669cce3	2025-09-19 17:46:57.667888+00	2025-09-19 17:46:57.667888+00	oauth	5b67e405-e4c5-4648-918d-1986ca2ac8a6
c9b68373-d816-4e56-8c60-d66828c2caab	2025-09-20 13:54:47.853278+00	2025-09-20 13:54:47.853278+00	oauth	b58ff03d-af01-431a-8e71-d2aa64e12b4f
\.


--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_challenges (id, factor_id, created_at, verified_at, ip_address, otp_code, web_authn_session_data) FROM stdin;
\.


--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.mfa_factors (id, user_id, friendly_name, factor_type, status, created_at, updated_at, secret, phone, last_challenged_at, web_authn_credential, web_authn_aaguid) FROM stdin;
\.


--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.oauth_clients (id, client_id, client_secret_hash, registration_type, redirect_uris, grant_types, client_name, client_uri, logo_uri, created_at, updated_at, deleted_at) FROM stdin;
\.


--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.one_time_tokens (id, user_id, token_type, token_hash, relates_to, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.refresh_tokens (instance_id, id, token, user_id, revoked, created_at, updated_at, parent, session_id) FROM stdin;
00000000-0000-0000-0000-000000000000	3	bndef4j6if3n	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-04 12:39:50.102335+00	2025-09-04 12:39:50.102335+00	\N	0a3705d0-8140-4481-8a37-db98fcae0dd1
00000000-0000-0000-0000-000000000000	4	g5jmbjpqauqx	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-04 12:41:24.443407+00	2025-09-05 05:50:32.029797+00	\N	2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1
00000000-0000-0000-0000-000000000000	5	26h3umnanoro	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-05 05:50:32.05459+00	2025-09-05 06:49:40.411438+00	g5jmbjpqauqx	2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1
00000000-0000-0000-0000-000000000000	6	kkpwc2nurgwh	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-05 06:49:40.421139+00	2025-09-05 07:48:18.188154+00	26h3umnanoro	2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1
00000000-0000-0000-0000-000000000000	7	gjedpd4uocd3	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-05 07:48:18.19836+00	2025-09-05 08:47:15.55271+00	kkpwc2nurgwh	2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1
00000000-0000-0000-0000-000000000000	8	kkkyaainfklf	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-05 08:47:15.565503+00	2025-09-05 08:47:15.565503+00	gjedpd4uocd3	2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1
00000000-0000-0000-0000-000000000000	9	ss6py3sxl5wf	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-05 09:42:56.031887+00	2025-09-05 10:41:40.324802+00	\N	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	10	dap6nnn6ifsf	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-05 10:41:40.336848+00	2025-09-08 06:14:56.370769+00	ss6py3sxl5wf	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	12	chxklstbvxst	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-08 06:14:56.394901+00	2025-09-08 07:13:32.657552+00	dap6nnn6ifsf	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	13	6bynbrzmto5e	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-08 07:13:32.66816+00	2025-09-08 08:12:32.673133+00	chxklstbvxst	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	14	2un3bka5ifb6	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-08 08:12:32.683061+00	2025-09-08 09:11:04.626039+00	6bynbrzmto5e	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	15	6y525w2phbid	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-08 09:11:04.634784+00	2025-09-09 07:18:04.565566+00	2un3bka5ifb6	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	17	3lpl3ruxyvcc	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:08:03.757991+00	2025-09-09 12:08:03.757991+00	\N	8698ce28-21dc-4cd5-b1d9-6fad38e1b67b
00000000-0000-0000-0000-000000000000	18	v4lb2duleutw	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:09:50.14102+00	2025-09-09 12:09:50.14102+00	\N	3da4576d-d8f3-4831-88fc-868d221a1ca9
00000000-0000-0000-0000-000000000000	19	ff6kydhr6trg	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:18:35.611124+00	2025-09-09 12:18:35.611124+00	\N	c15cf675-0dcf-4b76-b016-efb63f186790
00000000-0000-0000-0000-000000000000	20	efwl4dlmysrc	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:18:49.103778+00	2025-09-09 12:18:49.103778+00	\N	603eab92-5806-4cd7-8c4a-76a174b15e14
00000000-0000-0000-0000-000000000000	21	k7q3os32s5vt	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:19:13.379185+00	2025-09-09 12:19:13.379185+00	\N	f180377b-76f0-47f9-9b88-b32e1f17cf9d
00000000-0000-0000-0000-000000000000	22	jcdhbkin2zvq	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:23:56.730661+00	2025-09-09 12:23:56.730661+00	\N	86da52b2-1fcf-41b8-881b-ebc298b5c907
00000000-0000-0000-0000-000000000000	23	q5urde4cyaoy	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:32:31.101494+00	2025-09-09 12:32:31.101494+00	\N	85798295-c86e-489c-beaf-59698297c6a6
00000000-0000-0000-0000-000000000000	24	ozem4wk36byt	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:40:24.788156+00	2025-09-09 12:40:24.788156+00	\N	6cdf0ae7-562c-492c-91d3-f43edfc0b748
00000000-0000-0000-0000-000000000000	16	jlcnbbv25x75	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-09 07:18:04.590629+00	2025-09-09 12:43:28.534958+00	6y525w2phbid	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	26	uqcymnr4zfjl	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:56:36.196968+00	2025-09-09 12:56:36.196968+00	\N	0562b163-8a6b-4c79-b0d0-cf61ae505127
00000000-0000-0000-0000-000000000000	27	s25tgmbqqp6i	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 12:57:42.676408+00	2025-09-09 12:57:42.676408+00	\N	c62f9816-0b97-4b56-84b6-2f81ab7fea2a
00000000-0000-0000-0000-000000000000	25	y6ncw6kwinnv	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-09 12:43:28.541495+00	2025-09-09 13:42:13.339434+00	jlcnbbv25x75	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	29	b3jmeudzuh3i	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 14:05:52.079461+00	2025-09-09 14:05:52.079461+00	\N	7ff9374b-11bb-4244-89c6-118a23955a57
00000000-0000-0000-0000-000000000000	30	jeaa66e2og5j	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 14:09:15.256402+00	2025-09-09 14:09:15.256402+00	\N	f0d10d5e-19f9-4943-a52a-9bd3c570dea5
00000000-0000-0000-0000-000000000000	31	u5wg2npb7ivc	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 14:11:22.373995+00	2025-09-09 14:11:22.373995+00	\N	68c45bc4-3f04-4482-851c-bf6d5e613153
00000000-0000-0000-0000-000000000000	32	epqgyzdbztiv	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 14:22:19.351324+00	2025-09-09 14:22:19.351324+00	\N	3deda4a2-7105-4cc1-a086-c3baefbf6c40
00000000-0000-0000-0000-000000000000	33	4kdvkluu7sez	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-09 14:28:52.603183+00	2025-09-09 14:28:52.603183+00	\N	162aeeca-db34-40d2-890b-266e861119aa
00000000-0000-0000-0000-000000000000	28	fhajxl3yksrm	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-09 13:42:13.355655+00	2025-09-10 06:28:34.259985+00	y6ncw6kwinnv	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	35	mqsuolir43pt	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 06:51:25.32434+00	2025-09-10 06:51:25.32434+00	\N	5d9d7f58-cb0d-483d-8f11-cc2d3ab14a02
00000000-0000-0000-0000-000000000000	36	nadp7qjbi5qf	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 06:51:51.88184+00	2025-09-10 06:51:51.88184+00	\N	9eba46cb-3d8f-4e24-a8eb-de7cc9d8d795
00000000-0000-0000-0000-000000000000	37	ochqhyxk3r7a	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 06:54:08.427286+00	2025-09-10 06:54:08.427286+00	\N	9453dcec-f3ad-4482-9e56-ef5fbc30a60f
00000000-0000-0000-0000-000000000000	38	b5whtvwidmvu	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 06:56:06.130518+00	2025-09-10 06:56:06.130518+00	\N	0f63bbb5-a978-442c-be9b-8b2a7b9117ad
00000000-0000-0000-0000-000000000000	39	actzzyc6rnxu	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 06:56:17.039468+00	2025-09-10 06:56:17.039468+00	\N	782eb562-0c30-429d-aab4-22e0425d8e21
00000000-0000-0000-0000-000000000000	40	cirepq5lmf37	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:07:37.737671+00	2025-09-10 07:07:37.737671+00	\N	e7dafe4d-161f-438d-8158-2c925a96852c
00000000-0000-0000-0000-000000000000	34	sqjilekxfil2	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 06:28:34.285308+00	2025-09-10 07:30:56.682103+00	fhajxl3yksrm	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	41	hhvckntog6mc	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:16:28.80481+00	2025-09-10 07:16:28.80481+00	\N	6292b1b1-a4f6-42d0-b995-4e36e44c55ef
00000000-0000-0000-0000-000000000000	42	rjpbievjc6bm	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:17:02.849357+00	2025-09-10 07:17:02.849357+00	\N	f4b0d65b-6363-4ff6-8554-7e6ca353544e
00000000-0000-0000-0000-000000000000	43	yor2qdn256xa	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:17:06.02519+00	2025-09-10 07:17:06.02519+00	\N	97257909-efbd-4c63-ad47-21184e2a4101
00000000-0000-0000-0000-000000000000	44	4glqf2kf7xts	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:17:28.405297+00	2025-09-10 07:17:28.405297+00	\N	04400b9a-7094-4fd6-bb2c-0e872cbae98c
00000000-0000-0000-0000-000000000000	45	bcoawqgjxcgw	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:28:40.861047+00	2025-09-10 07:28:40.861047+00	\N	e8b690fa-a8d3-4047-9e83-f071d26509f8
00000000-0000-0000-0000-000000000000	47	66wsbb3zeucl	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:31:01.434711+00	2025-09-10 07:31:01.434711+00	\N	62c8206f-e89f-4aa0-ae3a-a3f84b2be815
00000000-0000-0000-0000-000000000000	48	snkbfrmiqrnz	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:41:53.877403+00	2025-09-10 07:41:53.877403+00	\N	c03dce7c-3a2a-4836-82ce-e3835591b190
00000000-0000-0000-0000-000000000000	49	kybzow43rhon	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 07:58:01.602531+00	2025-09-10 07:58:01.602531+00	\N	c07fffa0-997e-4896-ab8f-fbdd18365ce2
00000000-0000-0000-0000-000000000000	50	lcgzyf4infdh	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 08:07:21.282644+00	2025-09-10 08:07:21.282644+00	\N	e8dac447-d0de-4e39-9f29-cbe78e2416d5
00000000-0000-0000-0000-000000000000	51	d7ky62nr7kqm	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 08:14:02.912788+00	2025-09-10 08:14:02.912788+00	\N	439184a7-15de-4057-8eeb-3e7d58738687
00000000-0000-0000-0000-000000000000	52	pdogorqagjxo	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 08:14:20.766113+00	2025-09-10 08:14:20.766113+00	\N	e10db4af-03c9-42dc-ae55-4978add58f6d
00000000-0000-0000-0000-000000000000	53	mkhjvxe5hof4	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 08:14:38.83006+00	2025-09-10 08:14:38.83006+00	\N	7093ebc5-3745-4e9a-a363-ede945c5bf6f
00000000-0000-0000-0000-000000000000	46	x7jo7by7jhni	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 07:30:56.683483+00	2025-09-10 08:44:50.590103+00	sqjilekxfil2	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	55	rc7i425lj6j7	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:11:19.505847+00	2025-09-10 09:11:19.505847+00	\N	c2e0aa88-f307-4c02-90fd-f0d00ea90db7
00000000-0000-0000-0000-000000000000	56	idirotv4hogq	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:11:43.507518+00	2025-09-10 09:11:43.507518+00	\N	c0922be0-3e34-4715-853d-249b3c739412
00000000-0000-0000-0000-000000000000	57	2caxjdqxeuzt	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:15:10.278454+00	2025-09-10 09:15:10.278454+00	\N	a05a57ad-8ae1-45a8-ae2c-42ecbd0ad99e
00000000-0000-0000-0000-000000000000	58	klyb4vn2felz	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:15:22.316355+00	2025-09-10 09:15:22.316355+00	\N	0654126b-919f-4456-a579-a2c09253ed62
00000000-0000-0000-0000-000000000000	59	jt4h7eujvrl2	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:22:35.377422+00	2025-09-10 09:22:35.377422+00	\N	32b66bce-c3cb-458a-8711-1d965983a6f6
00000000-0000-0000-0000-000000000000	60	ek46mb67a4mi	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:22:45.429996+00	2025-09-10 09:22:45.429996+00	\N	88e6930d-b8cc-41cf-bb28-7164a31500d4
00000000-0000-0000-0000-000000000000	61	clm2gik2zekv	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:29:10.382064+00	2025-09-10 09:29:10.382064+00	\N	ea3c5f6e-d923-4132-9280-e85ffe89c475
00000000-0000-0000-0000-000000000000	62	r5wwmbgjpqmp	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:29:15.06808+00	2025-09-10 09:29:15.06808+00	\N	f2c3858a-0078-49ce-8826-b6e84ce7f2d4
00000000-0000-0000-0000-000000000000	63	4ryxcoqtmrso	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:34:28.536306+00	2025-09-10 09:34:28.536306+00	\N	a833571e-4076-4347-af59-c2275a56c8c7
00000000-0000-0000-0000-000000000000	64	w3b24ypknyne	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:34:32.508718+00	2025-09-10 09:34:32.508718+00	\N	e2c1b92c-5422-4b56-a93e-49c845ad608c
00000000-0000-0000-0000-000000000000	65	rozu7oytnu6c	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:37:25.450803+00	2025-09-10 09:37:25.450803+00	\N	ea8dc2e2-1958-4926-8f24-7e7bb1bdc977
00000000-0000-0000-0000-000000000000	66	4motld475oh7	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:37:29.70954+00	2025-09-10 09:37:29.70954+00	\N	2f21cf1c-b371-4fa2-aa2b-e661b6809122
00000000-0000-0000-0000-000000000000	54	y2t6m2rg5pzu	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 08:44:50.600572+00	2025-09-10 09:44:35.755272+00	x7jo7by7jhni	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	68	y7emo3mup4ms	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:44:45.550696+00	2025-09-10 09:44:45.550696+00	\N	0738c11f-3587-44b7-9a4b-be6386dcbbfa
00000000-0000-0000-0000-000000000000	69	omtyxhk67fzq	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:44:49.518785+00	2025-09-10 09:44:49.518785+00	\N	64aced40-3e05-4d55-a077-c3ed17925106
00000000-0000-0000-0000-000000000000	70	mk5uzqrdjuda	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:47:34.340016+00	2025-09-10 09:47:34.340016+00	\N	587cb413-0516-451f-bbad-4db4377375b2
00000000-0000-0000-0000-000000000000	71	lwmgyo3xnkkk	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:47:37.69182+00	2025-09-10 09:47:37.69182+00	\N	71a3fa8b-2626-4672-b9db-3d7d9b0bf0a2
00000000-0000-0000-0000-000000000000	72	wntzl2dipu6n	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:53:53.44915+00	2025-09-10 09:53:53.44915+00	\N	e94426fd-936f-4e1e-b965-586d4599584d
00000000-0000-0000-0000-000000000000	73	s6n4jf4ly3j4	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 09:53:56.754598+00	2025-09-10 09:53:56.754598+00	\N	b783a31b-93f4-4739-b1c7-b0db4f6cda6d
00000000-0000-0000-0000-000000000000	74	utvtdqgjtise	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:04:26.474114+00	2025-09-10 10:04:26.474114+00	\N	90dd5007-d70e-48da-a590-a868bd9a3d26
00000000-0000-0000-0000-000000000000	75	vdn5e2ixofge	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:04:30.318509+00	2025-09-10 10:04:30.318509+00	\N	062feae9-2f55-4235-8613-c712d45fdbb3
00000000-0000-0000-0000-000000000000	76	6emtq6fnhfve	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:06:25.063657+00	2025-09-10 10:06:25.063657+00	\N	b415a724-6b6d-4b09-93a0-3ae0dbf8f750
00000000-0000-0000-0000-000000000000	77	ojhrjignoxom	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:06:31.776008+00	2025-09-10 10:06:31.776008+00	\N	701659a8-f283-4d6a-82ea-5c080b149684
00000000-0000-0000-0000-000000000000	78	cd63btu6veis	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:09:20.582929+00	2025-09-10 10:09:20.582929+00	\N	4cddfeae-1884-4c35-b9a9-5c6dac2edd9f
00000000-0000-0000-0000-000000000000	79	2zwqxfg3e672	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:09:25.224562+00	2025-09-10 10:09:25.224562+00	\N	bbe24cc5-5e01-48b1-9feb-23ce3a1e7348
00000000-0000-0000-0000-000000000000	80	jtotn6rjwsbg	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:17:11.593658+00	2025-09-10 10:17:11.593658+00	\N	99d65efd-c81b-4353-ad4a-aff46bd30955
00000000-0000-0000-0000-000000000000	81	i3piqfo7nojy	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:17:15.555631+00	2025-09-10 10:17:15.555631+00	\N	c89f0e40-8a4c-47cc-a5ca-c5ce586d3960
00000000-0000-0000-0000-000000000000	82	5vfmq5rl4sso	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:23:50.279349+00	2025-09-10 10:23:50.279349+00	\N	673fdce0-4192-4344-bfaa-ac00cd25b041
00000000-0000-0000-0000-000000000000	83	nfpnbvqu7g5a	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:23:54.167796+00	2025-09-10 10:23:54.167796+00	\N	df9dcaf3-6355-4106-a14b-bef0279a2eff
00000000-0000-0000-0000-000000000000	84	h6khddo7imdf	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 10:42:22.284247+00	2025-09-10 10:42:22.284247+00	\N	31e5f56c-f266-4e78-919a-0fe494e8c694
00000000-0000-0000-0000-000000000000	85	vjipdeixxw27	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 11:36:45.629406+00	2025-09-10 11:36:45.629406+00	\N	a658fe8f-ae26-48a9-bfd1-9891ca9245ad
00000000-0000-0000-0000-000000000000	86	6b7pguyxhp6b	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 12:18:35.68186+00	2025-09-10 13:17:02.288677+00	\N	ca1499c3-6aad-4fc3-81db-6e4ce1d89fea
00000000-0000-0000-0000-000000000000	87	qt6ml6mxw55v	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 13:17:02.297804+00	2025-09-10 13:17:02.297804+00	6b7pguyxhp6b	ca1499c3-6aad-4fc3-81db-6e4ce1d89fea
00000000-0000-0000-0000-000000000000	88	eh33df2ssjsp	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 13:17:27.565514+00	2025-09-10 13:17:27.565514+00	\N	a5ddea17-ca91-43ad-a27b-43fb420674a6
00000000-0000-0000-0000-000000000000	89	uvl3zw7eifce	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 13:28:07.481174+00	2025-09-10 13:28:07.481174+00	\N	62dead2e-7a67-4ddc-8ecb-f1d93660ccf9
00000000-0000-0000-0000-000000000000	90	n3yfifrotvy3	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 13:41:37.166768+00	2025-09-10 13:41:37.166768+00	\N	d4b3f525-7830-47e1-8c43-0bb191ceeb8c
00000000-0000-0000-0000-000000000000	91	zqqej6xkquny	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 14:42:22.978449+00	2025-09-10 14:42:22.978449+00	\N	c9c10cce-a572-4864-874e-adbc329e2649
00000000-0000-0000-0000-000000000000	67	a47wpevmyreb	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 09:44:35.763322+00	2025-09-11 07:07:31.313557+00	y2t6m2rg5pzu	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	92	zp5meybxjbg5	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 14:54:17.590796+00	2025-09-10 14:54:17.590796+00	\N	fdb2aba4-0c95-4fed-bf5d-7b5299aae8fe
00000000-0000-0000-0000-000000000000	93	d2sd3ay2on54	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 14:59:09.112248+00	2025-09-10 14:59:09.112248+00	\N	873379fa-dabb-496c-a80e-001ff6984f40
00000000-0000-0000-0000-000000000000	94	jpn6kg5obof3	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 15:06:53.238628+00	2025-09-10 16:05:21.990644+00	\N	4c892597-09d9-4d7c-b82f-55c70e26a961
00000000-0000-0000-0000-000000000000	95	hzmnwpvs3gfm	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 16:05:22.005541+00	2025-09-10 17:03:23.956684+00	jpn6kg5obof3	4c892597-09d9-4d7c-b82f-55c70e26a961
00000000-0000-0000-0000-000000000000	96	mx5vbgre7qbp	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 17:03:23.965726+00	2025-09-10 18:01:25.97716+00	hzmnwpvs3gfm	4c892597-09d9-4d7c-b82f-55c70e26a961
00000000-0000-0000-0000-000000000000	97	ovszwirk2c2n	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-10 18:01:25.996304+00	2025-09-10 18:59:27.861091+00	mx5vbgre7qbp	4c892597-09d9-4d7c-b82f-55c70e26a961
00000000-0000-0000-0000-000000000000	98	oyog2a6qdiye	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 18:59:27.868021+00	2025-09-10 18:59:27.868021+00	ovszwirk2c2n	4c892597-09d9-4d7c-b82f-55c70e26a961
00000000-0000-0000-0000-000000000000	99	zaqx2j2sh5x3	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-10 19:14:12.082844+00	2025-09-10 19:14:12.082844+00	\N	642f2009-6916-4a14-94be-bfb2aaf5ccc6
00000000-0000-0000-0000-000000000000	100	bgkxzypt3c3w	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-11 05:06:22.258011+00	2025-09-11 05:06:22.258011+00	\N	a29a4b51-4855-4ff4-90b8-159a550fde35
00000000-0000-0000-0000-000000000000	101	bbfv3hgmzo7o	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	f	2025-09-11 05:12:29.069011+00	2025-09-11 05:12:29.069011+00	\N	b1f5775f-f096-47fb-88cb-f933dbdf59b1
00000000-0000-0000-0000-000000000000	102	kylgppcj2rxp	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-11 05:31:11.684587+00	2025-09-11 05:31:11.684587+00	\N	5cedfd09-c347-4a35-ada2-c8f68ccae7e5
00000000-0000-0000-0000-000000000000	104	nnou5b44ovfh	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-11 07:24:06.397317+00	2025-09-11 07:24:06.397317+00	\N	223f2520-c70c-4824-9b0f-ca47529b0872
00000000-0000-0000-0000-000000000000	103	xtwxo2t3hfbt	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 07:07:31.337733+00	2025-09-11 08:06:02.537065+00	a47wpevmyreb	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	105	xjcb2emjxo3f	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 08:06:02.555548+00	2025-09-11 09:11:04.561279+00	xtwxo2t3hfbt	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	106	5s5jnywf2nhg	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 09:11:04.580809+00	2025-09-11 10:10:21.139841+00	xjcb2emjxo3f	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	107	rduo5yxvksff	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 10:10:21.147724+00	2025-09-11 11:15:02.063089+00	5s5jnywf2nhg	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	108	uxevmr6ovday	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 11:15:02.071903+00	2025-09-11 12:15:18.53674+00	rduo5yxvksff	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	110	zus3i7kc3p3a	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-11 12:52:20.961596+00	2025-09-11 12:52:20.961596+00	\N	8a5e1ef9-74c3-46a0-a246-564a57661439
00000000-0000-0000-0000-000000000000	109	hfbzhjmhvn56	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 12:15:18.556663+00	2025-09-11 13:14:02.529911+00	uxevmr6ovday	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	111	w7vyxa7kuei6	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 13:14:02.548021+00	2025-09-11 14:12:36.472464+00	hfbzhjmhvn56	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	112	mrkha2nq6gu3	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 14:12:36.484417+00	2025-09-11 15:12:02.574752+00	w7vyxa7kuei6	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	113	z6futsmqs4ty	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 15:12:02.591096+00	2025-09-11 18:47:00.735101+00	mrkha2nq6gu3	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	114	iaj7r5jq6ew5	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 18:47:00.754057+00	2025-09-11 19:45:06.270268+00	z6futsmqs4ty	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	116	y35brvh2wax7	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 05:25:09.057085+00	2025-09-12 05:25:09.057085+00	\N	4eb4839e-0c1c-4bc7-8985-0d87e872640d
00000000-0000-0000-0000-000000000000	118	lgp45slkvcof	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 05:56:51.960726+00	2025-09-12 05:56:51.960726+00	\N	f0e8bac0-9bdf-4f14-9b7b-be95881d15f9
00000000-0000-0000-0000-000000000000	119	mkuisw6oqyz3	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 06:33:49.388061+00	2025-09-12 06:33:49.388061+00	\N	3ecacd8a-6c36-4350-be40-3b30eeb75a81
00000000-0000-0000-0000-000000000000	117	wiq6mzx36ga4	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	t	2025-09-12 05:35:47.679573+00	2025-09-12 07:14:53.703112+00	\N	949f15de-65a8-4129-88f3-158b32ca75a5
00000000-0000-0000-0000-000000000000	120	43vhmbkpvpqy	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	t	2025-09-12 07:14:53.722976+00	2025-09-12 08:27:16.169612+00	wiq6mzx36ga4	949f15de-65a8-4129-88f3-158b32ca75a5
00000000-0000-0000-0000-000000000000	122	kq5gtodxzq6g	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:26:00.341175+00	2025-09-12 09:26:00.341175+00	\N	d3e8e587-4dce-4b2f-84ef-e286d887b8a9
00000000-0000-0000-0000-000000000000	123	wdbcps6eugyx	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:27:17.098919+00	2025-09-12 09:27:17.098919+00	\N	05269081-658a-4a04-a350-d7b846331340
00000000-0000-0000-0000-000000000000	121	3ciaqg3ocoeu	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	t	2025-09-12 08:27:16.181024+00	2025-09-12 09:30:33.81319+00	43vhmbkpvpqy	949f15de-65a8-4129-88f3-158b32ca75a5
00000000-0000-0000-0000-000000000000	124	tctzzc46irn2	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	f	2025-09-12 09:30:33.816651+00	2025-09-12 09:30:33.816651+00	3ciaqg3ocoeu	949f15de-65a8-4129-88f3-158b32ca75a5
00000000-0000-0000-0000-000000000000	125	7uysy23zsq4l	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:32:23.375206+00	2025-09-12 09:32:23.375206+00	\N	d6bbc662-49a7-4176-8c6f-3a0c68fce8bb
00000000-0000-0000-0000-000000000000	126	sedippqmro3e	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:33:04.91138+00	2025-09-12 09:33:04.91138+00	\N	7dafb77a-b7c4-4bf7-b83d-720b0917d40e
00000000-0000-0000-0000-000000000000	127	2ajabpqqzsli	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:34:37.580515+00	2025-09-12 09:34:37.580515+00	\N	2f5c41f0-e868-4fb9-9f9d-9c539f56b6c5
00000000-0000-0000-0000-000000000000	128	7xp62d3ncwb3	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:40:28.818763+00	2025-09-12 09:40:28.818763+00	\N	1256b3d5-18d2-439f-9bc3-ef13a1941159
00000000-0000-0000-0000-000000000000	129	f7w7n3hqezuw	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 09:48:44.387746+00	2025-09-12 09:48:44.387746+00	\N	245a187c-ade6-4aa8-95f0-dbb9fa719f17
00000000-0000-0000-0000-000000000000	115	hafxg7lw3e5k	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-11 19:45:06.28368+00	2025-09-12 09:50:00.107501+00	iaj7r5jq6ew5	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	131	mj2c7kgrc3ww	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 10:07:53.517279+00	2025-09-12 10:07:53.517279+00	\N	3d151b60-814b-494d-a4d1-4ade883af0bc
00000000-0000-0000-0000-000000000000	130	6f7txil4zzbr	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-12 09:50:00.109851+00	2025-09-12 10:52:37.146029+00	hafxg7lw3e5k	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	132	dnaxt7pnbzgw	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-12 10:52:37.159235+00	2025-09-12 12:28:09.168083+00	6f7txil4zzbr	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	134	rc3nd5qcaonp	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 13:09:48.774885+00	2025-09-12 13:09:48.774885+00	\N	cd25add9-570c-4066-a843-05d583a90e4d
00000000-0000-0000-0000-000000000000	135	dh4qcsz4oczw	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 13:12:53.739019+00	2025-09-12 13:12:53.739019+00	\N	cb6249d4-aaf8-4607-b115-b0cf28c8e217
00000000-0000-0000-0000-000000000000	133	3tg7c6wcb72k	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-12 12:28:09.199596+00	2025-09-12 13:26:12.067733+00	dnaxt7pnbzgw	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	136	uuz5i6vgrkqe	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 13:26:12.08052+00	2025-09-12 13:26:12.08052+00	3tg7c6wcb72k	f6e8e38d-315a-446a-abb4-059e5a6b742f
00000000-0000-0000-0000-000000000000	137	r7w46iywfhrm	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 13:58:08.447246+00	2025-09-12 13:58:08.447246+00	\N	9a4501c7-09f5-41e8-9001-5984b27c2b87
00000000-0000-0000-0000-000000000000	138	a3x5z563nlwl	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 14:01:40.216529+00	2025-09-12 14:01:40.216529+00	\N	f974a96b-ef83-4736-94d6-381ebff1048f
00000000-0000-0000-0000-000000000000	139	4omkicxae2om	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 14:08:42.907102+00	2025-09-12 14:08:42.907102+00	\N	1695e108-4a7d-4cb3-a839-c61990d654d1
00000000-0000-0000-0000-000000000000	140	2qkyajwg4oen	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 14:13:46.346439+00	2025-09-12 14:13:46.346439+00	\N	65cd1f13-a2df-4500-a300-6ff988540979
00000000-0000-0000-0000-000000000000	142	m2v7fonhfnra	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	f	2025-09-12 17:02:17.523091+00	2025-09-12 17:02:17.523091+00	\N	c3414518-8057-4edb-85f6-0c24b7331882
00000000-0000-0000-0000-000000000000	143	q5y7zycc676c	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-12 18:26:17.625384+00	2025-09-12 18:26:17.625384+00	\N	453ad9c6-b310-43d1-8edc-1ff77594210f
00000000-0000-0000-0000-000000000000	141	tvcaciluhbcq	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-12 14:18:14.413576+00	2025-09-13 07:47:12.170715+00	\N	693648e4-86a7-488b-8973-b28f323027a3
00000000-0000-0000-0000-000000000000	144	qsnxkvqi72y5	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-13 07:47:12.199701+00	2025-09-13 07:47:12.199701+00	tvcaciluhbcq	693648e4-86a7-488b-8973-b28f323027a3
00000000-0000-0000-0000-000000000000	145	poalmmv2d7zt	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 07:49:17.759831+00	2025-09-13 08:47:38.993847+00	\N	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	147	ixkhjti6eajb	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-13 09:13:54.652564+00	2025-09-13 09:13:54.652564+00	\N	6b172418-72ca-4fce-bd80-2d776a8172f6
00000000-0000-0000-0000-000000000000	148	zy6axls5d74t	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-13 09:34:01.341852+00	2025-09-13 09:34:01.341852+00	\N	90737492-469f-4756-a07d-86e8fe852c83
00000000-0000-0000-0000-000000000000	146	zayhdbmc4ll6	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 08:47:39.010684+00	2025-09-13 09:46:10.907997+00	poalmmv2d7zt	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	149	2dkue63xvsak	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 09:46:10.925947+00	2025-09-13 10:44:42.680636+00	zayhdbmc4ll6	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	150	2oweteg6nzzi	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 10:44:42.703532+00	2025-09-13 11:43:14.745432+00	2dkue63xvsak	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	151	zxkbny574mtv	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 11:43:14.759894+00	2025-09-13 12:41:46.762268+00	2oweteg6nzzi	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	152	aarglgluioxz	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 12:41:46.774779+00	2025-09-13 13:40:18.611948+00	zxkbny574mtv	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	153	d3aggiawax3i	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-13 13:40:18.622354+00	2025-09-13 14:38:34.284967+00	aarglgluioxz	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	154	ufoajea2dvxv	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-13 14:38:34.296927+00	2025-09-13 14:38:34.296927+00	d3aggiawax3i	74a0d405-644a-461a-8986-2ba1da0a913b
00000000-0000-0000-0000-000000000000	155	tchpuvubwb26	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-13 15:52:06.36377+00	2025-09-13 15:52:06.36377+00	\N	31deae5a-99c9-44a5-ba46-600f2e97c0ff
00000000-0000-0000-0000-000000000000	156	z3zantsqzk65	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-13 19:47:58.98813+00	2025-09-13 19:47:58.98813+00	\N	1cd4c387-f548-40b3-b77d-dcc7352a939a
00000000-0000-0000-0000-000000000000	157	3nd5lu64g6qc	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-16 18:22:14.222325+00	2025-09-16 19:30:38.701805+00	\N	8cce0526-a7ea-47db-b7d5-7e7139619ae8
00000000-0000-0000-0000-000000000000	159	loel6sorzjmr	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-16 19:30:38.716436+00	2025-09-16 19:30:38.716436+00	3nd5lu64g6qc	8cce0526-a7ea-47db-b7d5-7e7139619ae8
00000000-0000-0000-0000-000000000000	158	giqfouympwk5	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-16 18:36:29.542821+00	2025-09-16 19:34:32.573818+00	\N	cfe36b6f-e785-4841-ae72-40f548e98691
00000000-0000-0000-0000-000000000000	160	f42ngpji2rlg	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-16 19:34:32.574574+00	2025-09-16 19:34:32.574574+00	giqfouympwk5	cfe36b6f-e785-4841-ae72-40f548e98691
00000000-0000-0000-0000-000000000000	161	w5bjeixvlyhz	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-17 05:46:46.756316+00	2025-09-17 05:46:46.756316+00	\N	4d824afd-7893-406a-a8bf-ced6da398a80
00000000-0000-0000-0000-000000000000	162	2tcbri647odd	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	f	2025-09-17 06:11:54.999967+00	2025-09-17 06:11:54.999967+00	\N	39eee4b9-117a-438a-af18-bae2c06aa153
00000000-0000-0000-0000-000000000000	163	j4tcmiqrki4b	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-17 17:24:19.282246+00	2025-09-17 17:24:19.282246+00	\N	7d6db38e-b86f-4f75-800b-7f70c7015c0e
00000000-0000-0000-0000-000000000000	164	s2sl3brwvwuu	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-18 15:30:54.322452+00	2025-09-18 15:30:54.322452+00	\N	d07a582f-450d-4ce8-b30d-52e6514ab5bf
00000000-0000-0000-0000-000000000000	165	bbo2cbhyayfn	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 12:20:05.500668+00	2025-09-19 13:18:30.266158+00	\N	8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331
00000000-0000-0000-0000-000000000000	166	57ig4b5pdpon	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 13:18:30.282476+00	2025-09-19 14:16:32.171702+00	bbo2cbhyayfn	8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331
00000000-0000-0000-0000-000000000000	168	ta63w36vmsb3	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-19 14:33:14.304531+00	2025-09-19 14:33:14.304531+00	\N	404b9b77-28fe-42cf-adb2-45b25e8085b3
00000000-0000-0000-0000-000000000000	167	qnuakmaovxc4	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 14:16:32.18609+00	2025-09-19 15:14:33.838862+00	57ig4b5pdpon	8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331
00000000-0000-0000-0000-000000000000	169	cvp3lqpkgsly	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 15:14:33.852337+00	2025-09-19 16:12:35.548086+00	qnuakmaovxc4	8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331
00000000-0000-0000-0000-000000000000	170	uod2u5uzt7ii	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 16:12:35.560952+00	2025-09-19 17:10:37.79619+00	cvp3lqpkgsly	8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331
00000000-0000-0000-0000-000000000000	171	ieu2zd2zolza	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-19 17:10:37.826832+00	2025-09-19 17:10:37.826832+00	uod2u5uzt7ii	8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331
00000000-0000-0000-0000-000000000000	172	l5e42u7frtpf	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-19 17:41:41.563906+00	2025-09-19 17:41:41.563906+00	\N	0f0069c6-5233-437d-85e4-8ebe44807dd1
00000000-0000-0000-0000-000000000000	173	lfbqapvkgsit	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 17:46:57.652762+00	2025-09-19 19:46:55.864617+00	\N	89adf630-55dd-4b17-8e68-43c7c669cce3
00000000-0000-0000-0000-000000000000	174	vubynimlt4hq	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-19 19:46:55.884516+00	2025-09-20 12:52:55.852873+00	lfbqapvkgsit	89adf630-55dd-4b17-8e68-43c7c669cce3
00000000-0000-0000-0000-000000000000	175	au2xe7dst62e	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-20 12:52:55.871764+00	2025-09-20 13:56:34.973752+00	vubynimlt4hq	89adf630-55dd-4b17-8e68-43c7c669cce3
00000000-0000-0000-0000-000000000000	176	xuwrvr6y5fra	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-20 13:54:47.822718+00	2025-09-20 16:20:29.692009+00	\N	c9b68373-d816-4e56-8c60-d66828c2caab
00000000-0000-0000-0000-000000000000	178	e7pea2ouenij	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-20 16:20:29.71228+00	2025-09-20 16:20:29.71228+00	xuwrvr6y5fra	c9b68373-d816-4e56-8c60-d66828c2caab
00000000-0000-0000-0000-000000000000	177	57uw4o5rgn5i	89a6927b-bf21-4d09-90a2-353a3d93ed07	t	2025-09-20 13:56:34.975051+00	2025-09-20 20:46:52.163272+00	au2xe7dst62e	89adf630-55dd-4b17-8e68-43c7c669cce3
00000000-0000-0000-0000-000000000000	179	dsaxe2lmldrr	89a6927b-bf21-4d09-90a2-353a3d93ed07	f	2025-09-20 20:46:52.184282+00	2025-09-20 20:46:52.184282+00	57uw4o5rgn5i	89adf630-55dd-4b17-8e68-43c7c669cce3
\.


--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_providers (id, sso_provider_id, entity_id, metadata_xml, metadata_url, attribute_mapping, created_at, updated_at, name_id_format) FROM stdin;
\.


--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.saml_relay_states (id, sso_provider_id, request_id, for_email, redirect_to, created_at, updated_at, flow_state_id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.schema_migrations (version) FROM stdin;
20171026211738
20171026211808
20171026211834
20180103212743
20180108183307
20180119214651
20180125194653
00
20210710035447
20210722035447
20210730183235
20210909172000
20210927181326
20211122151130
20211124214934
20211202183645
20220114185221
20220114185340
20220224000811
20220323170000
20220429102000
20220531120530
20220614074223
20220811173540
20221003041349
20221003041400
20221011041400
20221020193600
20221021073300
20221021082433
20221027105023
20221114143122
20221114143410
20221125140132
20221208132122
20221215195500
20221215195800
20221215195900
20230116124310
20230116124412
20230131181311
20230322519590
20230402418590
20230411005111
20230508135423
20230523124323
20230818113222
20230914180801
20231027141322
20231114161723
20231117164230
20240115144230
20240214120130
20240306115329
20240314092811
20240427152123
20240612123726
20240729123726
20240802193726
20240806073726
20241009103726
20250717082212
20250731150234
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sessions (id, user_id, created_at, updated_at, factor_id, aal, not_after, refreshed_at, user_agent, ip, tag) FROM stdin;
0a3705d0-8140-4481-8a37-db98fcae0dd1	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-04 12:39:50.095646+00	2025-09-04 12:39:50.095646+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	134.94.10.177	\N
9eba46cb-3d8f-4e24-a8eb-de7cc9d8d795	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 06:51:51.881103+00	2025-09-10 06:51:51.881103+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
9453dcec-f3ad-4482-9e56-ef5fbc30a60f	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 06:54:08.425685+00	2025-09-10 06:54:08.425685+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
0f63bbb5-a978-442c-be9b-8b2a7b9117ad	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 06:56:06.128427+00	2025-09-10 06:56:06.128427+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
2a199ecb-6e6f-4de6-8c80-bcbb7f0f02a1	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-04 12:41:24.428516+00	2025-09-05 08:47:15.580033+00	\N	aal1	\N	2025-09-05 08:47:15.57994	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.136.130	\N
782eb562-0c30-429d-aab4-22e0425d8e21	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 06:56:17.038681+00	2025-09-10 06:56:17.038681+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
e7dafe4d-161f-438d-8158-2c925a96852c	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:07:37.735206+00	2025-09-10 07:07:37.735206+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
6292b1b1-a4f6-42d0-b995-4e36e44c55ef	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:16:28.800916+00	2025-09-10 07:16:28.800916+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
f4b0d65b-6363-4ff6-8554-7e6ca353544e	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:17:02.848165+00	2025-09-10 07:17:02.848165+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
97257909-efbd-4c63-ad47-21184e2a4101	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:17:06.024456+00	2025-09-10 07:17:06.024456+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
04400b9a-7094-4fd6-bb2c-0e872cbae98c	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:17:28.40382+00	2025-09-10 07:17:28.40382+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
8698ce28-21dc-4cd5-b1d9-6fad38e1b67b	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:08:03.743248+00	2025-09-09 12:08:03.743248+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
3da4576d-d8f3-4831-88fc-868d221a1ca9	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:09:50.139822+00	2025-09-09 12:09:50.139822+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
c15cf675-0dcf-4b76-b016-efb63f186790	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:18:35.60941+00	2025-09-09 12:18:35.60941+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
603eab92-5806-4cd7-8c4a-76a174b15e14	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:18:49.103066+00	2025-09-09 12:18:49.103066+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
f180377b-76f0-47f9-9b88-b32e1f17cf9d	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:19:13.378478+00	2025-09-09 12:19:13.378478+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
86da52b2-1fcf-41b8-881b-ebc298b5c907	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:23:56.725244+00	2025-09-09 12:23:56.725244+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
85798295-c86e-489c-beaf-59698297c6a6	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:32:31.097589+00	2025-09-09 12:32:31.097589+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
6cdf0ae7-562c-492c-91d3-f43edfc0b748	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:40:24.78686+00	2025-09-09 12:40:24.78686+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
e8b690fa-a8d3-4047-9e83-f071d26509f8	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:28:40.851761+00	2025-09-10 07:28:40.851761+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
0562b163-8a6b-4c79-b0d0-cf61ae505127	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:56:36.193133+00	2025-09-09 12:56:36.193133+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
c62f9816-0b97-4b56-84b6-2f81ab7fea2a	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 12:57:42.674041+00	2025-09-09 12:57:42.674041+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
7ff9374b-11bb-4244-89c6-118a23955a57	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 14:05:52.069528+00	2025-09-09 14:05:52.069528+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
f0d10d5e-19f9-4943-a52a-9bd3c570dea5	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 14:09:15.254551+00	2025-09-09 14:09:15.254551+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
68c45bc4-3f04-4482-851c-bf6d5e613153	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 14:11:22.369083+00	2025-09-09 14:11:22.369083+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
3deda4a2-7105-4cc1-a086-c3baefbf6c40	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 14:22:19.342731+00	2025-09-09 14:22:19.342731+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
162aeeca-db34-40d2-890b-266e861119aa	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-09 14:28:52.600816+00	2025-09-09 14:28:52.600816+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.10.177	\N
c07fffa0-997e-4896-ab8f-fbdd18365ce2	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:58:01.594582+00	2025-09-10 07:58:01.594582+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.52.126	\N
5d9d7f58-cb0d-483d-8f11-cc2d3ab14a02	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 06:51:25.314588+00	2025-09-10 06:51:25.314588+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
62c8206f-e89f-4aa0-ae3a-a3f84b2be815	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:31:01.433827+00	2025-09-10 07:31:01.433827+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
c03dce7c-3a2a-4836-82ce-e3835591b190	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 07:41:53.87431+00	2025-09-10 07:41:53.87431+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.52.126	\N
e8dac447-d0de-4e39-9f29-cbe78e2416d5	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 08:07:21.278754+00	2025-09-10 08:07:21.278754+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	134.94.52.126	\N
439184a7-15de-4057-8eeb-3e7d58738687	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 08:14:02.908486+00	2025-09-10 08:14:02.908486+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	134.94.52.126	\N
e10db4af-03c9-42dc-ae55-4978add58f6d	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 08:14:20.764988+00	2025-09-10 08:14:20.764988+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	134.94.52.126	\N
7093ebc5-3745-4e9a-a363-ede945c5bf6f	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 08:14:38.822231+00	2025-09-10 08:14:38.822231+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	134.94.52.126	\N
c2e0aa88-f307-4c02-90fd-f0d00ea90db7	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:11:19.500035+00	2025-09-10 09:11:19.500035+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
c0922be0-3e34-4715-853d-249b3c739412	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:11:43.506616+00	2025-09-10 09:11:43.506616+00	\N	aal1	\N	\N	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/139.0.0.0 Safari/537.36	92.117.138.196	\N
a05a57ad-8ae1-45a8-ae2c-42ecbd0ad99e	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:15:10.270288+00	2025-09-10 09:15:10.270288+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
0654126b-919f-4456-a579-a2c09253ed62	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:15:22.315559+00	2025-09-10 09:15:22.315559+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
32b66bce-c3cb-458a-8711-1d965983a6f6	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:22:35.369531+00	2025-09-10 09:22:35.369531+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
88e6930d-b8cc-41cf-bb28-7164a31500d4	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:22:45.416534+00	2025-09-10 09:22:45.416534+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
ea3c5f6e-d923-4132-9280-e85ffe89c475	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:29:10.380927+00	2025-09-10 09:29:10.380927+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
f2c3858a-0078-49ce-8826-b6e84ce7f2d4	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:29:15.067339+00	2025-09-10 09:29:15.067339+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
a833571e-4076-4347-af59-c2275a56c8c7	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:34:28.525141+00	2025-09-10 09:34:28.525141+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
e2c1b92c-5422-4b56-a93e-49c845ad608c	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:34:32.506567+00	2025-09-10 09:34:32.506567+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
ea8dc2e2-1958-4926-8f24-7e7bb1bdc977	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:37:25.448891+00	2025-09-10 09:37:25.448891+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
2f21cf1c-b371-4fa2-aa2b-e661b6809122	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:37:29.708776+00	2025-09-10 09:37:29.708776+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
0738c11f-3587-44b7-9a4b-be6386dcbbfa	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:44:45.54834+00	2025-09-10 09:44:45.54834+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
64aced40-3e05-4d55-a077-c3ed17925106	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:44:49.515464+00	2025-09-10 09:44:49.515464+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
587cb413-0516-451f-bbad-4db4377375b2	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:47:34.337916+00	2025-09-10 09:47:34.337916+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
71a3fa8b-2626-4672-b9db-3d7d9b0bf0a2	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:47:37.69101+00	2025-09-10 09:47:37.69101+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
e94426fd-936f-4e1e-b965-586d4599584d	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:53:53.444469+00	2025-09-10 09:53:53.444469+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
b783a31b-93f4-4739-b1c7-b0db4f6cda6d	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 09:53:56.752716+00	2025-09-10 09:53:56.752716+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
90dd5007-d70e-48da-a590-a868bd9a3d26	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:04:26.465991+00	2025-09-10 10:04:26.465991+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
062feae9-2f55-4235-8613-c712d45fdbb3	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:04:30.317683+00	2025-09-10 10:04:30.317683+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
b415a724-6b6d-4b09-93a0-3ae0dbf8f750	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:06:25.062512+00	2025-09-10 10:06:25.062512+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
701659a8-f283-4d6a-82ea-5c080b149684	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:06:31.7751+00	2025-09-10 10:06:31.7751+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
4cddfeae-1884-4c35-b9a9-5c6dac2edd9f	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:09:20.581304+00	2025-09-10 10:09:20.581304+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
bbe24cc5-5e01-48b1-9feb-23ce3a1e7348	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:09:25.22382+00	2025-09-10 10:09:25.22382+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
99d65efd-c81b-4353-ad4a-aff46bd30955	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:17:11.591533+00	2025-09-10 10:17:11.591533+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
c89f0e40-8a4c-47cc-a5ca-c5ce586d3960	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:17:15.553929+00	2025-09-10 10:17:15.553929+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
673fdce0-4192-4344-bfaa-ac00cd25b041	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:23:50.265475+00	2025-09-10 10:23:50.265475+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
df9dcaf3-6355-4106-a14b-bef0279a2eff	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:23:54.166151+00	2025-09-10 10:23:54.166151+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
31e5f56c-f266-4e78-919a-0fe494e8c694	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 10:42:22.263+00	2025-09-10 10:42:22.263+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
a658fe8f-ae26-48a9-bfd1-9891ca9245ad	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 11:36:45.616015+00	2025-09-10 11:36:45.616015+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
ca1499c3-6aad-4fc3-81db-6e4ce1d89fea	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 12:18:35.666844+00	2025-09-10 13:17:02.310694+00	\N	aal1	\N	2025-09-10 13:17:02.310612	okhttp/4.9.2	92.117.138.196	\N
a5ddea17-ca91-43ad-a27b-43fb420674a6	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 13:17:27.558523+00	2025-09-10 13:17:27.558523+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
62dead2e-7a67-4ddc-8ecb-f1d93660ccf9	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 13:28:07.471708+00	2025-09-10 13:28:07.471708+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
d4b3f525-7830-47e1-8c43-0bb191ceeb8c	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 13:41:37.159533+00	2025-09-10 13:41:37.159533+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
c9c10cce-a572-4864-874e-adbc329e2649	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 14:42:22.956344+00	2025-09-10 14:42:22.956344+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
fdb2aba4-0c95-4fed-bf5d-7b5299aae8fe	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 14:54:17.583561+00	2025-09-10 14:54:17.583561+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
873379fa-dabb-496c-a80e-001ff6984f40	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 14:59:09.107808+00	2025-09-10 14:59:09.107808+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
3d151b60-814b-494d-a4d1-4ade883af0bc	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 10:07:53.513258+00	2025-09-12 10:07:53.513258+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
6b172418-72ca-4fce-bd80-2d776a8172f6	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-13 09:13:54.635724+00	2025-09-13 09:13:54.635724+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
4c892597-09d9-4d7c-b82f-55c70e26a961	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 15:06:53.234053+00	2025-09-10 18:59:27.887745+00	\N	aal1	\N	2025-09-10 18:59:27.886468	okhttp/4.9.2	92.117.138.196	\N
642f2009-6916-4a14-94be-bfb2aaf5ccc6	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-10 19:14:12.067746+00	2025-09-10 19:14:12.067746+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
a29a4b51-4855-4ff4-90b8-159a550fde35	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-11 05:06:22.245034+00	2025-09-11 05:06:22.245034+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
b1f5775f-f096-47fb-88cb-f933dbdf59b1	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	2025-09-11 05:12:29.066922+00	2025-09-11 05:12:29.066922+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36	217.82.198.136	\N
5cedfd09-c347-4a35-ada2-c8f68ccae7e5	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-11 05:31:11.669799+00	2025-09-11 05:31:11.669799+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	176.1.13.44	\N
223f2520-c70c-4824-9b0f-ca47529b0872	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-11 07:24:06.386198+00	2025-09-11 07:24:06.386198+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	134.94.2.243	\N
90737492-469f-4756-a07d-86e8fe852c83	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-13 09:34:01.332649+00	2025-09-13 09:34:01.332649+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	217.82.205.254	\N
cd25add9-570c-4066-a843-05d583a90e4d	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 13:09:48.765075+00	2025-09-12 13:09:48.765075+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
cb6249d4-aaf8-4607-b115-b0cf28c8e217	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 13:12:53.737937+00	2025-09-12 13:12:53.737937+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
f6e8e38d-315a-446a-abb4-059e5a6b742f	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-05 09:42:56.023983+00	2025-09-12 13:26:12.097051+00	\N	aal1	\N	2025-09-12 13:26:12.09696	Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36	92.117.138.196	\N
9a4501c7-09f5-41e8-9001-5984b27c2b87	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 13:58:08.437175+00	2025-09-12 13:58:08.437175+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
8a5e1ef9-74c3-46a0-a246-564a57661439	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-11 12:52:20.956025+00	2025-09-11 12:52:20.956025+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	134.94.2.243	\N
f974a96b-ef83-4736-94d6-381ebff1048f	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 14:01:40.212388+00	2025-09-12 14:01:40.212388+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
1695e108-4a7d-4cb3-a839-c61990d654d1	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 14:08:42.901691+00	2025-09-12 14:08:42.901691+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
65cd1f13-a2df-4500-a300-6ff988540979	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 14:13:46.343312+00	2025-09-12 14:13:46.343312+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
74a0d405-644a-461a-8986-2ba1da0a913b	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-13 07:49:17.753659+00	2025-09-13 14:38:34.308854+00	\N	aal1	\N	2025-09-13 14:38:34.308779	okhttp/4.9.2	92.117.138.196	\N
4eb4839e-0c1c-4bc7-8985-0d87e872640d	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 05:25:09.037612+00	2025-09-12 05:25:09.037612+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
f0e8bac0-9bdf-4f14-9b7b-be95881d15f9	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 05:56:51.953558+00	2025-09-12 05:56:51.953558+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
3ecacd8a-6c36-4350-be40-3b30eeb75a81	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 06:33:49.36713+00	2025-09-12 06:33:49.36713+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
c3414518-8057-4edb-85f6-0c24b7331882	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	2025-09-12 17:02:17.503059+00	2025-09-12 17:02:17.503059+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36	176.1.11.12	\N
453ad9c6-b310-43d1-8edc-1ff77594210f	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 18:26:17.613156+00	2025-09-12 18:26:17.613156+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
d3e8e587-4dce-4b2f-84ef-e286d887b8a9	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:26:00.319911+00	2025-09-12 09:26:00.319911+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
05269081-658a-4a04-a350-d7b846331340	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:27:17.09692+00	2025-09-12 09:27:17.09692+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
949f15de-65a8-4129-88f3-158b32ca75a5	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	2025-09-12 05:35:47.674788+00	2025-09-12 09:30:33.819424+00	\N	aal1	\N	2025-09-12 09:30:33.819351	okhttp/4.9.2	217.82.198.136	\N
d6bbc662-49a7-4176-8c6f-3a0c68fce8bb	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:32:23.372855+00	2025-09-12 09:32:23.372855+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
7dafb77a-b7c4-4bf7-b83d-720b0917d40e	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:33:04.910592+00	2025-09-12 09:33:04.910592+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
2f5c41f0-e868-4fb9-9f9d-9c539f56b6c5	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:34:37.574669+00	2025-09-12 09:34:37.574669+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
1256b3d5-18d2-439f-9bc3-ef13a1941159	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:40:28.816269+00	2025-09-12 09:40:28.816269+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
245a187c-ade6-4aa8-95f0-dbb9fa719f17	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 09:48:44.385451+00	2025-09-12 09:48:44.385451+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
693648e4-86a7-488b-8973-b28f323027a3	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 14:18:14.411886+00	2025-09-13 07:47:12.232253+00	\N	aal1	\N	2025-09-13 07:47:12.231566	okhttp/4.9.2	92.117.138.196	\N
31deae5a-99c9-44a5-ba46-600f2e97c0ff	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-13 15:52:06.340548+00	2025-09-13 15:52:06.340548+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.138.196	\N
1cd4c387-f548-40b3-b77d-dcc7352a939a	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-13 19:47:58.964277+00	2025-09-13 19:47:58.964277+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	176.1.6.156	\N
8cce0526-a7ea-47db-b7d5-7e7139619ae8	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-16 18:22:14.19761+00	2025-09-16 19:30:38.731778+00	\N	aal1	\N	2025-09-16 19:30:38.731693	okhttp/4.9.2	92.117.159.33	\N
cfe36b6f-e785-4841-ae72-40f548e98691	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-16 18:36:29.527174+00	2025-09-16 19:34:32.57943+00	\N	aal1	\N	2025-09-16 19:34:32.579355	okhttp/4.9.2	92.117.159.33	\N
4d824afd-7893-406a-a8bf-ced6da398a80	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-17 05:46:46.735222+00	2025-09-17 05:46:46.735222+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.157.234	\N
39eee4b9-117a-438a-af18-bae2c06aa153	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	2025-09-17 06:11:54.992794+00	2025-09-17 06:11:54.992794+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/28.0 Chrome/130.0.0.0 Mobile Safari/537.36	217.82.198.136	\N
7d6db38e-b86f-4f75-800b-7f70c7015c0e	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-17 17:24:19.258625+00	2025-09-17 17:24:19.258625+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	176.1.7.161	\N
d07a582f-450d-4ce8-b30d-52e6514ab5bf	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-18 15:30:54.296542+00	2025-09-18 15:30:54.296542+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	134.94.2.243	\N
404b9b77-28fe-42cf-adb2-45b25e8085b3	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-19 14:33:14.296991+00	2025-09-19 14:33:14.296991+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.137.21	\N
8fe4ad52-9ac1-4e6c-b4ac-da3728c3b331	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-19 12:20:05.481994+00	2025-09-19 17:10:37.847811+00	\N	aal1	\N	2025-09-19 17:10:37.847724	okhttp/4.9.2	92.117.137.21	\N
0f0069c6-5233-437d-85e4-8ebe44807dd1	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-19 17:41:41.557506+00	2025-09-19 17:41:41.557506+00	\N	aal1	\N	\N	Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36	92.117.137.21	\N
c9b68373-d816-4e56-8c60-d66828c2caab	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-20 13:54:47.802492+00	2025-09-20 16:20:29.728738+00	\N	aal1	\N	2025-09-20 16:20:29.728652	okhttp/4.9.2	176.1.16.170	\N
89adf630-55dd-4b17-8e68-43c7c669cce3	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-19 17:46:57.645131+00	2025-09-20 20:46:52.202536+00	\N	aal1	\N	2025-09-20 20:46:52.201927	okhttp/4.9.2	92.117.137.21	\N
\.


--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_domains (id, sso_provider_id, domain, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.sso_providers (id, resource_id, created_at, updated_at, disabled) FROM stdin;
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: -
--

COPY auth.users (instance_id, id, aud, role, email, encrypted_password, email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at, recovery_token, recovery_sent_at, email_change_token_new, email_change, email_change_sent_at, last_sign_in_at, raw_app_meta_data, raw_user_meta_data, is_super_admin, created_at, updated_at, phone, phone_confirmed_at, phone_change, phone_change_token, phone_change_sent_at, email_change_token_current, email_change_confirm_status, banned_until, reauthentication_token, reauthentication_sent_at, is_sso_user, deleted_at, is_anonymous) FROM stdin;
00000000-0000-0000-0000-000000000000	89a6927b-bf21-4d09-90a2-353a3d93ed07	authenticated	authenticated	s.bludau@gmail.com	\N	2025-09-04 12:39:50.091596+00	\N		\N		\N			\N	2025-09-20 13:54:47.80238+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "101345360200873217657", "name": "Sebastian Bludau", "email": "s.bludau@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocLyi8G2l3cFi8hBg0jbH-LKw6y5geUfBvIbUv3Sbc0KBknTKEdfXA=s96-c", "full_name": "Sebastian Bludau", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocLyi8G2l3cFi8hBg0jbH-LKw6y5geUfBvIbUv3Sbc0KBknTKEdfXA=s96-c", "provider_id": "101345360200873217657", "email_verified": true, "phone_verified": false}	\N	2025-09-04 12:39:50.051813+00	2025-09-20 20:46:52.192885+00	\N	\N			\N		0	\N		\N	f	\N	f
00000000-0000-0000-0000-000000000000	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	authenticated	authenticated	timo.glantschnig@gmail.com	\N	2025-09-11 05:12:29.061854+00	\N		\N		\N			\N	2025-09-17 06:11:54.992676+00	{"provider": "google", "providers": ["google"]}	{"iss": "https://accounts.google.com", "sub": "114625133205069592698", "name": "Timo Glantschnig", "email": "timo.glantschnig@gmail.com", "picture": "https://lh3.googleusercontent.com/a/ACg8ocJmcAg-GWsTV7Ve6ni5Fu6-3OsWNcWVehqtIrbfpl39NGBbZSGQxg=s96-c", "full_name": "Timo Glantschnig", "avatar_url": "https://lh3.googleusercontent.com/a/ACg8ocJmcAg-GWsTV7Ve6ni5Fu6-3OsWNcWVehqtIrbfpl39NGBbZSGQxg=s96-c", "provider_id": "114625133205069592698", "email_verified": true, "phone_verified": false}	\N	2025-09-11 05:12:29.036146+00	2025-09-17 06:11:55.013576+00	\N	\N			\N		0	\N		\N	f	\N	f
\.


--
-- Data for Name: app_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.app_settings (key, value, created_at, updated_at) FROM stdin;
vegas	{"start_date": "2025-09-13", "start_amount": 851}	2025-09-12 09:45:14.401293+00	2025-09-13 19:51:39.396386+00
\.


--
-- Data for Name: birthday_rounds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.birthday_rounds (id, auth_user_id, due_month, first_due_stammtisch_id, settled_stammtisch_id, settled_at, created_at, approved_by, approved_at, profile_id) FROM stdin;
392	\N	2024-10-01	15	\N	\N	2025-09-19 17:47:06.682623+00	\N	\N	\N
393	89a6927b-bf21-4d09-90a2-353a3d93ed07	2024-12-01	15	\N	\N	2025-09-19 17:47:07.094834+00	\N	\N	\N
394	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	2025-04-01	15	\N	\N	2025-09-19 17:47:07.506528+00	\N	\N	\N
396	\N	2024-10-01	15	\N	\N	2025-09-19 17:47:28.454337+00	\N	\N	\N
395	\N	2025-09-01	\N	15	2025-09-19 17:47:28.211626+00	2025-09-19 17:47:28.211626+00	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-19 17:47:39.057429+00	\N
\.


--
-- Data for Name: profile_claims; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profile_claims (id, created_at, profile_id, claimant_user_id, status, approved_by, approved_at, note) FROM stdin;
28	2025-09-11 09:27:07.448852+00	57	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	approved	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-11 10:14:01.498252+00	\N
29	2025-09-11 09:27:07.448852+00	2	89a6927b-bf21-4d09-90a2-353a3d93ed07	approved	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-11 10:14:24.849345+00	\N
\.


--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.profiles (id, created_at, auth_user_id, first_name, last_name, title, birthday, quote, avatar_url, middle_name, role, is_active, self_check, degree, standing_order, is_admin) FROM stdin;
85	2025-09-13 08:26:26.196015+00	\N	Andi	Fröge	\N	\N	\N	\N	\N	member	t	f	none	t	f
86	2025-09-13 08:26:26.196015+00	\N	Fobbs	XX	\N	\N	\N	\N	\N	member	t	f	none	t	f
87	2025-09-13 08:26:26.196015+00	\N	Bert	Konijnenberg	\N	\N	\N	\N	Käse	member	t	f	none	t	f
88	2025-09-13 08:26:26.196015+00	\N	Marcel	Neumann	\N	\N	\N	\N	\N	member	t	f	none	t	f
89	2025-09-13 08:26:26.196015+00	\N	Ingo	Mass	\N	\N	\N	\N	\N	member	t	f	none	f	f
90	2025-09-13 08:26:26.196015+00	\N	Torben	Meiss	\N	\N	\N	\N	MOTU	member	f	f	none	f	f
92	2025-09-13 08:26:26.196015+00	\N	Dani	Schulte	\N	\N	\N	\N	\N	member	f	f	none	f	f
93	2025-09-13 08:26:26.196015+00	\N	Mathi	Düllmann	\N	\N	\N	\N	Eigentor	member	t	f	none	t	f
94	2025-09-13 08:26:26.196015+00	\N	Thorsten	Eberhartinger	\N	\N	\N	\N	Äbbey	member	f	f	none	f	f
95	2025-09-13 08:26:26.196015+00	\N	Markus	Hochheiser	\N	\N	\N	\N	Hochi	member	f	f	none	f	f
96	2025-09-13 08:26:26.196015+00	\N	Torben	Katzmann	\N	\N	\N	\N	\N	member	t	f	none	t	f
2	2025-09-04 12:39:50.039478+00	89a6927b-bf21-4d09-90a2-353a3d93ed07	Sebastian	Bludau	Waffenkämmerer	1978-11-02	Prost!\nNeues KOmmentar	89a6927b-bf21-4d09-90a2-353a3d93ed07/1758088078933.jpeg	\N	admin	t	t	dr	t	f
57	2025-09-11 05:12:29.030905+00	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	Timo	Glantschnig	\N	1979-03-08	\N	\N	\N	superuser	t	t	dr	t	f
91	2025-09-13 08:26:26.196015+00	\N	Martin	Maas	\N	1977-09-13	\N	\N	\N	member	t	f	dr	t	f
\.


--
-- Data for Name: stammtisch; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stammtisch (id, created_at, date, location, notes, created_by) FROM stdin;
15	2025-09-04 11:27:17.325228+00	2025-09-13	Martin	Geburtstags Stammtisch\n\nTest\n\ntest	\N
27	2025-09-16 19:23:31.861263+00	2025-11-14	Vluyner Stuben	\N	89a6927b-bf21-4d09-90a2-353a3d93ed07
28	2025-09-16 19:24:05.540142+00	2025-12-12	Vluyner Stuben	\N	89a6927b-bf21-4d09-90a2-353a3d93ed07
26	2025-09-16 18:40:37.825018+00	2025-10-10	Vluyner Stuben		89a6927b-bf21-4d09-90a2-353a3d93ed07
\.


--
-- Data for Name: stammtisch_participants; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stammtisch_participants (stammtisch_id, auth_user_id, status, created_at) FROM stdin;
26	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	going	2025-09-19 14:46:50.237476+00
26	89a6927b-bf21-4d09-90a2-353a3d93ed07	going	2025-09-19 14:46:52.111367+00
15	89a6927b-bf21-4d09-90a2-353a3d93ed07	going	2025-09-11 13:42:15.928169+00
15	48fd43aa-0ec2-475d-80c0-ffc946ec66b2	going	2025-09-11 13:42:17.854611+00
\.


--
-- Data for Name: stammtisch_participants_unlinked; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.stammtisch_participants_unlinked (stammtisch_id, profile_id, status, created_at) FROM stdin;
15	93	going	2025-09-13 14:40:48.78625+00
15	96	going	2025-09-13 14:40:50.984687+00
15	91	going	2025-09-13 16:01:28.222628+00
15	89	going	2025-09-13 16:01:29.790191+00
15	88	going	2025-09-13 16:01:30.50525+00
15	86	going	2025-09-13 16:01:31.089817+00
26	93	going	2025-09-19 14:46:52.769685+00
\.


--
-- Data for Name: messages_2025_09_17; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_17 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_18; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_18 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_19; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_19 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_20; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_20 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_21; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_21 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_22; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_22 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: messages_2025_09_23; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.messages_2025_09_23 (topic, extension, payload, event, private, updated_at, inserted_at, id) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.schema_migrations (version, inserted_at) FROM stdin;
20211116024918	2025-09-03 12:50:38
20211116045059	2025-09-03 12:50:40
20211116050929	2025-09-03 12:50:42
20211116051442	2025-09-03 12:50:44
20211116212300	2025-09-03 12:50:46
20211116213355	2025-09-03 12:50:47
20211116213934	2025-09-03 12:50:49
20211116214523	2025-09-03 12:50:51
20211122062447	2025-09-03 12:50:53
20211124070109	2025-09-03 12:50:55
20211202204204	2025-09-03 12:50:56
20211202204605	2025-09-03 12:50:58
20211210212804	2025-09-03 12:51:03
20211228014915	2025-09-03 12:51:05
20220107221237	2025-09-03 12:51:06
20220228202821	2025-09-03 12:51:08
20220312004840	2025-09-03 12:51:10
20220603231003	2025-09-03 12:51:12
20220603232444	2025-09-03 12:51:14
20220615214548	2025-09-03 12:51:16
20220712093339	2025-09-03 12:51:18
20220908172859	2025-09-03 12:51:19
20220916233421	2025-09-03 12:51:21
20230119133233	2025-09-03 12:51:23
20230128025114	2025-09-03 12:51:25
20230128025212	2025-09-03 12:51:27
20230227211149	2025-09-03 12:51:28
20230228184745	2025-09-03 12:51:30
20230308225145	2025-09-03 12:51:31
20230328144023	2025-09-03 12:51:33
20231018144023	2025-09-03 12:51:35
20231204144023	2025-09-03 12:51:38
20231204144024	2025-09-03 12:51:39
20231204144025	2025-09-03 12:51:41
20240108234812	2025-09-03 12:51:43
20240109165339	2025-09-03 12:51:44
20240227174441	2025-09-03 12:51:47
20240311171622	2025-09-03 12:51:50
20240321100241	2025-09-03 12:51:53
20240401105812	2025-09-03 12:51:58
20240418121054	2025-09-03 12:52:00
20240523004032	2025-09-03 12:52:06
20240618124746	2025-09-03 12:52:08
20240801235015	2025-09-03 12:52:09
20240805133720	2025-09-03 12:52:11
20240827160934	2025-09-03 12:52:13
20240919163303	2025-09-03 12:52:15
20240919163305	2025-09-03 12:52:17
20241019105805	2025-09-03 12:52:18
20241030150047	2025-09-03 12:52:25
20241108114728	2025-09-03 12:52:27
20241121104152	2025-09-03 12:52:29
20241130184212	2025-09-03 12:52:31
20241220035512	2025-09-03 12:52:32
20241220123912	2025-09-03 12:52:34
20241224161212	2025-09-03 12:52:36
20250107150512	2025-09-03 12:52:37
20250110162412	2025-09-03 12:52:39
20250123174212	2025-09-03 12:52:40
20250128220012	2025-09-03 12:52:42
20250506224012	2025-09-03 12:52:43
20250523164012	2025-09-03 12:52:45
20250714121412	2025-09-03 12:52:47
\.


--
-- Data for Name: subscription; Type: TABLE DATA; Schema: realtime; Owner: -
--

COPY realtime.subscription (id, subscription_id, entity, filters, claims, created_at) FROM stdin;
\.


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets (id, name, owner, created_at, updated_at, public, avif_autodetection, file_size_limit, allowed_mime_types, owner_id, type) FROM stdin;
images	images	\N	2025-09-03 13:38:13.634427+00	2025-09-03 13:38:13.634427+00	f	f	\N	\N	\N	STANDARD
avatars	avatars	\N	2025-09-04 12:56:36.003606+00	2025-09-04 12:56:36.003606+00	t	f	5242880	{image/*}	\N	STANDARD
\.


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.buckets_analytics (id, type, format, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: migrations; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.migrations (id, name, hash, executed_at) FROM stdin;
0	create-migrations-table	e18db593bcde2aca2a408c4d1100f6abba2195df	2025-09-03 12:49:54.373054
1	initialmigration	6ab16121fbaa08bbd11b712d05f358f9b555d777	2025-09-03 12:49:54.395408
2	storage-schema	5c7968fd083fcea04050c1b7f6253c9771b99011	2025-09-03 12:49:54.402839
3	pathtoken-column	2cb1b0004b817b29d5b0a971af16bafeede4b70d	2025-09-03 12:49:54.448822
4	add-migrations-rls	427c5b63fe1c5937495d9c635c263ee7a5905058	2025-09-03 12:49:54.504198
5	add-size-functions	79e081a1455b63666c1294a440f8ad4b1e6a7f84	2025-09-03 12:49:54.510166
6	change-column-name-in-get-size	f93f62afdf6613ee5e7e815b30d02dc990201044	2025-09-03 12:49:54.51681
7	add-rls-to-buckets	e7e7f86adbc51049f341dfe8d30256c1abca17aa	2025-09-03 12:49:54.522323
8	add-public-to-buckets	fd670db39ed65f9d08b01db09d6202503ca2bab3	2025-09-03 12:49:54.527068
9	fix-search-function	3a0af29f42e35a4d101c259ed955b67e1bee6825	2025-09-03 12:49:54.532027
10	search-files-search-function	68dc14822daad0ffac3746a502234f486182ef6e	2025-09-03 12:49:54.537297
11	add-trigger-to-auto-update-updated_at-column	7425bdb14366d1739fa8a18c83100636d74dcaa2	2025-09-03 12:49:54.54302
12	add-automatic-avif-detection-flag	8e92e1266eb29518b6a4c5313ab8f29dd0d08df9	2025-09-03 12:49:54.55241
13	add-bucket-custom-limits	cce962054138135cd9a8c4bcd531598684b25e7d	2025-09-03 12:49:54.558105
14	use-bytes-for-max-size	941c41b346f9802b411f06f30e972ad4744dad27	2025-09-03 12:49:54.563282
15	add-can-insert-object-function	934146bc38ead475f4ef4b555c524ee5d66799e5	2025-09-03 12:49:54.593366
16	add-version	76debf38d3fd07dcfc747ca49096457d95b1221b	2025-09-03 12:49:54.599851
17	drop-owner-foreign-key	f1cbb288f1b7a4c1eb8c38504b80ae2a0153d101	2025-09-03 12:49:54.605042
18	add_owner_id_column_deprecate_owner	e7a511b379110b08e2f214be852c35414749fe66	2025-09-03 12:49:54.612627
19	alter-default-value-objects-id	02e5e22a78626187e00d173dc45f58fa66a4f043	2025-09-03 12:49:54.621246
20	list-objects-with-delimiter	cd694ae708e51ba82bf012bba00caf4f3b6393b7	2025-09-03 12:49:54.626162
21	s3-multipart-uploads	8c804d4a566c40cd1e4cc5b3725a664a9303657f	2025-09-03 12:49:54.634951
22	s3-multipart-uploads-big-ints	9737dc258d2397953c9953d9b86920b8be0cdb73	2025-09-03 12:49:54.651282
23	optimize-search-function	9d7e604cddc4b56a5422dc68c9313f4a1b6f132c	2025-09-03 12:49:54.663612
24	operation-function	8312e37c2bf9e76bbe841aa5fda889206d2bf8aa	2025-09-03 12:49:54.66929
25	custom-metadata	d974c6057c3db1c1f847afa0e291e6165693b990	2025-09-03 12:49:54.675417
26	objects-prefixes	ef3f7871121cdc47a65308e6702519e853422ae2	2025-09-04 13:00:23.102411
27	search-v2	33b8f2a7ae53105f028e13e9fcda9dc4f356b4a2	2025-09-04 13:00:23.685517
28	object-bucket-name-sorting	ba85ec41b62c6a30a3f136788227ee47f311c436	2025-09-04 13:00:24.288113
29	create-prefixes	a7b1a22c0dc3ab630e3055bfec7ce7d2045c5b7b	2025-09-04 13:00:24.293941
30	update-object-levels	6c6f6cc9430d570f26284a24cf7b210599032db7	2025-09-04 13:00:24.297803
31	objects-level-index	33f1fef7ec7fea08bb892222f4f0f5d79bab5eb8	2025-09-04 13:00:24.305998
32	backward-compatible-index-on-objects	2d51eeb437a96868b36fcdfb1ddefdf13bef1647	2025-09-04 13:00:24.385922
33	backward-compatible-index-on-prefixes	fe473390e1b8c407434c0e470655945b110507bf	2025-09-04 13:00:24.395317
34	optimize-search-function-v1	82b0e469a00e8ebce495e29bfa70a0797f7ebd2c	2025-09-04 13:00:24.397237
35	add-insert-trigger-prefixes	63bb9fd05deb3dc5e9fa66c83e82b152f0caf589	2025-09-04 13:00:24.405435
36	optimise-existing-functions	81cf92eb0c36612865a18016a38496c530443899	2025-09-04 13:00:24.409986
37	add-bucket-name-length-trigger	3944135b4e3e8b22d6d4cbb568fe3b0b51df15c1	2025-09-04 13:00:24.417944
38	iceberg-catalog-flag-on-buckets	19a8bd89d5dfa69af7f222a46c726b7c41e462c5	2025-09-04 13:00:24.48948
\.


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.objects (id, bucket_id, name, owner, created_at, updated_at, last_accessed_at, metadata, version, owner_id, user_metadata, level) FROM stdin;
8f462a7c-9319-4522-8d09-b814a5388b6f	avatars	89a6927b-bf21-4d09-90a2-353a3d93ed07/1756991124556.png	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-04 13:05:24.626185+00	2025-09-04 13:05:24.626185+00	2025-09-04 13:05:24.626185+00	{"eTag": "\\"54f6e3fa1bd4191b1de18747dafadb3b\\"", "size": 1473001, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-09-04T13:05:25.000Z", "contentLength": 1473001, "httpStatusCode": 200}	83476b45-4054-4696-8f1a-c93ec90a0d47	89a6927b-bf21-4d09-90a2-353a3d93ed07	{}	2
aa217f17-fa2c-4d4f-8c3b-af7ae674da57	avatars	89a6927b-bf21-4d09-90a2-353a3d93ed07/1757671841213.png	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-12 10:10:41.161799+00	2025-09-12 10:10:41.161799+00	2025-09-12 10:10:41.161799+00	{"eTag": "\\"8a4d0e5b845044e56e3b2df627d01cfd\\"", "size": 21252, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-09-12T10:10:42.000Z", "contentLength": 21252, "httpStatusCode": 200}	072fcb2d-de81-4c14-ac97-7f0b27e6a224	89a6927b-bf21-4d09-90a2-353a3d93ed07	{}	2
fc162f41-dc10-4286-aa1a-ba759cfcf23f	avatars	89a6927b-bf21-4d09-90a2-353a3d93ed07/1758047987821.png	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-16 18:39:51.767484+00	2025-09-16 18:39:51.767484+00	2025-09-16 18:39:51.767484+00	{"eTag": "\\"1dcff3585035b71132f331601e849ece\\"", "size": 93145, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-09-16T18:39:52.000Z", "contentLength": 93145, "httpStatusCode": 200}	06ca2298-ebcd-4e75-b13e-b90c5cb7c3f5	89a6927b-bf21-4d09-90a2-353a3d93ed07	{}	2
6fbd64c3-f720-40e7-89a6-b00263e6986b	avatars	89a6927b-bf21-4d09-90a2-353a3d93ed07/1758088034434.jpeg	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-17 05:47:15.47735+00	2025-09-17 05:47:15.47735+00	2025-09-17 05:47:15.47735+00	{"eTag": "\\"a92513315bf3f4a5d8c585cc45d91ad6\\"", "size": 1573262, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-09-17T05:47:16.000Z", "contentLength": 1573262, "httpStatusCode": 200}	bb379005-adf8-4471-a609-0ebadc05e5a8	89a6927b-bf21-4d09-90a2-353a3d93ed07	{}	2
7c78d28c-e17b-4c99-ba4e-2c20cc0e6381	avatars	89a6927b-bf21-4d09-90a2-353a3d93ed07/1758088078933.jpeg	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-17 05:47:59.006498+00	2025-09-17 05:47:59.006498+00	2025-09-17 05:47:59.006498+00	{"eTag": "\\"aeff30f31676403b1649f7e294b01e96\\"", "size": 115869, "mimetype": "image/jpeg", "cacheControl": "max-age=3600", "lastModified": "2025-09-17T05:47:59.000Z", "contentLength": 115869, "httpStatusCode": 200}	9b5f38d1-ad90-4058-b4f7-ad0067927576	89a6927b-bf21-4d09-90a2-353a3d93ed07	{}	2
\.


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.prefixes (bucket_id, name, created_at, updated_at) FROM stdin;
avatars	89a6927b-bf21-4d09-90a2-353a3d93ed07	2025-09-04 13:05:24.626185+00	2025-09-04 13:05:24.626185+00
\.


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads (id, in_progress_size, upload_signature, bucket_id, key, version, owner_id, created_at, user_metadata) FROM stdin;
\.


--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: -
--

COPY storage.s3_multipart_uploads_parts (id, upload_id, size, part_number, bucket_id, key, etag, owner_id, version, created_at) FROM stdin;
\.


--
-- Data for Name: schema_migrations; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.schema_migrations (version, statements, name) FROM stdin;
\.


--
-- Data for Name: seed_files; Type: TABLE DATA; Schema: supabase_migrations; Owner: -
--

COPY supabase_migrations.seed_files (path, hash) FROM stdin;
\.


--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: -
--

COPY vault.secrets (id, name, description, secret, key_id, nonce, created_at, updated_at) FROM stdin;
\.


--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: -
--

SELECT pg_catalog.setval('auth.refresh_tokens_id_seq', 179, true);


--
-- Name: birthday_rounds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.birthday_rounds_id_seq', 398, true);


--
-- Name: profile_claims_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profile_claims_id_seq', 29, true);


--
-- Name: profiles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.profiles_id_seq', 102, true);


--
-- Name: stammtisch_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.stammtisch_id_seq', 28, true);


--
-- Name: subscription_id_seq; Type: SEQUENCE SET; Schema: realtime; Owner: -
--

SELECT pg_catalog.setval('realtime.subscription_id_seq', 1511, true);


--
-- Name: mfa_amr_claims amr_id_pk; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT amr_id_pk PRIMARY KEY (id);


--
-- Name: audit_log_entries audit_log_entries_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.audit_log_entries
    ADD CONSTRAINT audit_log_entries_pkey PRIMARY KEY (id);


--
-- Name: flow_state flow_state_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.flow_state
    ADD CONSTRAINT flow_state_pkey PRIMARY KEY (id);


--
-- Name: identities identities_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_pkey PRIMARY KEY (id);


--
-- Name: identities identities_provider_id_provider_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_provider_id_provider_unique UNIQUE (provider_id, provider);


--
-- Name: instances instances_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.instances
    ADD CONSTRAINT instances_pkey PRIMARY KEY (id);


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_authentication_method_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_authentication_method_pkey UNIQUE (session_id, authentication_method);


--
-- Name: mfa_challenges mfa_challenges_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_pkey PRIMARY KEY (id);


--
-- Name: mfa_factors mfa_factors_last_challenged_at_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_last_challenged_at_key UNIQUE (last_challenged_at);


--
-- Name: mfa_factors mfa_factors_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_pkey PRIMARY KEY (id);


--
-- Name: oauth_clients oauth_clients_client_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_client_id_key UNIQUE (client_id);


--
-- Name: oauth_clients oauth_clients_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.oauth_clients
    ADD CONSTRAINT oauth_clients_pkey PRIMARY KEY (id);


--
-- Name: one_time_tokens one_time_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);


--
-- Name: refresh_tokens refresh_tokens_token_unique; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_token_unique UNIQUE (token);


--
-- Name: saml_providers saml_providers_entity_id_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_entity_id_key UNIQUE (entity_id);


--
-- Name: saml_providers saml_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_pkey PRIMARY KEY (id);


--
-- Name: saml_relay_states saml_relay_states_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: sso_domains sso_domains_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_pkey PRIMARY KEY (id);


--
-- Name: sso_providers sso_providers_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_providers
    ADD CONSTRAINT sso_providers_pkey PRIMARY KEY (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: app_settings app_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.app_settings
    ADD CONSTRAINT app_settings_pkey PRIMARY KEY (key);


--
-- Name: birthday_rounds birthday_rounds_auth_due_uniq; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_auth_due_uniq UNIQUE (auth_user_id, due_month);


--
-- Name: birthday_rounds birthday_rounds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_pkey PRIMARY KEY (id);


--
-- Name: profile_claims profile_claims_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_claims
    ADD CONSTRAINT profile_claims_pkey PRIMARY KEY (id);


--
-- Name: profiles profiles_auth_user_id_key; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_auth_user_id_key UNIQUE (auth_user_id);


--
-- Name: profiles profiles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);


--
-- Name: stammtisch_participants stammtisch_participants_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch_participants
    ADD CONSTRAINT stammtisch_participants_pkey PRIMARY KEY (stammtisch_id, auth_user_id);


--
-- Name: stammtisch_participants_unlinked stammtisch_participants_unlinked_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch_participants_unlinked
    ADD CONSTRAINT stammtisch_participants_unlinked_pkey PRIMARY KEY (stammtisch_id, profile_id);


--
-- Name: stammtisch stammtisch_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch
    ADD CONSTRAINT stammtisch_pkey PRIMARY KEY (id);


--
-- Name: messages messages_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_17 messages_2025_09_17_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_17
    ADD CONSTRAINT messages_2025_09_17_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_18 messages_2025_09_18_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_18
    ADD CONSTRAINT messages_2025_09_18_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_19 messages_2025_09_19_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_19
    ADD CONSTRAINT messages_2025_09_19_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_20 messages_2025_09_20_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_20
    ADD CONSTRAINT messages_2025_09_20_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_21 messages_2025_09_21_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_21
    ADD CONSTRAINT messages_2025_09_21_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_22 messages_2025_09_22_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_22
    ADD CONSTRAINT messages_2025_09_22_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: messages_2025_09_23 messages_2025_09_23_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.messages_2025_09_23
    ADD CONSTRAINT messages_2025_09_23_pkey PRIMARY KEY (id, inserted_at);


--
-- Name: subscription pk_subscription; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.subscription
    ADD CONSTRAINT pk_subscription PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: realtime; Owner: -
--

ALTER TABLE ONLY realtime.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: buckets_analytics buckets_analytics_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets_analytics
    ADD CONSTRAINT buckets_analytics_pkey PRIMARY KEY (id);


--
-- Name: buckets buckets_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.buckets
    ADD CONSTRAINT buckets_pkey PRIMARY KEY (id);


--
-- Name: migrations migrations_name_key; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_name_key UNIQUE (name);


--
-- Name: migrations migrations_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.migrations
    ADD CONSTRAINT migrations_pkey PRIMARY KEY (id);


--
-- Name: objects objects_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT objects_pkey PRIMARY KEY (id);


--
-- Name: prefixes prefixes_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT prefixes_pkey PRIMARY KEY (bucket_id, level, name);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_pkey PRIMARY KEY (id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_pkey; Type: CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_pkey PRIMARY KEY (id);


--
-- Name: schema_migrations schema_migrations_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.schema_migrations
    ADD CONSTRAINT schema_migrations_pkey PRIMARY KEY (version);


--
-- Name: seed_files seed_files_pkey; Type: CONSTRAINT; Schema: supabase_migrations; Owner: -
--

ALTER TABLE ONLY supabase_migrations.seed_files
    ADD CONSTRAINT seed_files_pkey PRIMARY KEY (path);


--
-- Name: audit_logs_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX audit_logs_instance_id_idx ON auth.audit_log_entries USING btree (instance_id);


--
-- Name: confirmation_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX confirmation_token_idx ON auth.users USING btree (confirmation_token) WHERE ((confirmation_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_current_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_current_idx ON auth.users USING btree (email_change_token_current) WHERE ((email_change_token_current)::text !~ '^[0-9 ]*$'::text);


--
-- Name: email_change_token_new_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX email_change_token_new_idx ON auth.users USING btree (email_change_token_new) WHERE ((email_change_token_new)::text !~ '^[0-9 ]*$'::text);


--
-- Name: factor_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX factor_id_created_at_idx ON auth.mfa_factors USING btree (user_id, created_at);


--
-- Name: flow_state_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX flow_state_created_at_idx ON auth.flow_state USING btree (created_at DESC);


--
-- Name: identities_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_email_idx ON auth.identities USING btree (email text_pattern_ops);


--
-- Name: INDEX identities_email_idx; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.identities_email_idx IS 'Auth: Ensures indexed queries on the email column';


--
-- Name: identities_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX identities_user_id_idx ON auth.identities USING btree (user_id);


--
-- Name: idx_auth_code; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_auth_code ON auth.flow_state USING btree (auth_code);


--
-- Name: idx_user_id_auth_method; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX idx_user_id_auth_method ON auth.flow_state USING btree (user_id, authentication_method);


--
-- Name: mfa_challenge_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_challenge_created_at_idx ON auth.mfa_challenges USING btree (created_at DESC);


--
-- Name: mfa_factors_user_friendly_name_unique; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX mfa_factors_user_friendly_name_unique ON auth.mfa_factors USING btree (friendly_name, user_id) WHERE (TRIM(BOTH FROM friendly_name) <> ''::text);


--
-- Name: mfa_factors_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX mfa_factors_user_id_idx ON auth.mfa_factors USING btree (user_id);


--
-- Name: oauth_clients_client_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_client_id_idx ON auth.oauth_clients USING btree (client_id);


--
-- Name: oauth_clients_deleted_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX oauth_clients_deleted_at_idx ON auth.oauth_clients USING btree (deleted_at);


--
-- Name: one_time_tokens_relates_to_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_relates_to_hash_idx ON auth.one_time_tokens USING hash (relates_to);


--
-- Name: one_time_tokens_token_hash_hash_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX one_time_tokens_token_hash_hash_idx ON auth.one_time_tokens USING hash (token_hash);


--
-- Name: one_time_tokens_user_id_token_type_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX one_time_tokens_user_id_token_type_key ON auth.one_time_tokens USING btree (user_id, token_type);


--
-- Name: reauthentication_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX reauthentication_token_idx ON auth.users USING btree (reauthentication_token) WHERE ((reauthentication_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: recovery_token_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX recovery_token_idx ON auth.users USING btree (recovery_token) WHERE ((recovery_token)::text !~ '^[0-9 ]*$'::text);


--
-- Name: refresh_tokens_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_idx ON auth.refresh_tokens USING btree (instance_id);


--
-- Name: refresh_tokens_instance_id_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_instance_id_user_id_idx ON auth.refresh_tokens USING btree (instance_id, user_id);


--
-- Name: refresh_tokens_parent_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_parent_idx ON auth.refresh_tokens USING btree (parent);


--
-- Name: refresh_tokens_session_id_revoked_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_session_id_revoked_idx ON auth.refresh_tokens USING btree (session_id, revoked);


--
-- Name: refresh_tokens_updated_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX refresh_tokens_updated_at_idx ON auth.refresh_tokens USING btree (updated_at DESC);


--
-- Name: saml_providers_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_providers_sso_provider_id_idx ON auth.saml_providers USING btree (sso_provider_id);


--
-- Name: saml_relay_states_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_created_at_idx ON auth.saml_relay_states USING btree (created_at DESC);


--
-- Name: saml_relay_states_for_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_for_email_idx ON auth.saml_relay_states USING btree (for_email);


--
-- Name: saml_relay_states_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX saml_relay_states_sso_provider_id_idx ON auth.saml_relay_states USING btree (sso_provider_id);


--
-- Name: sessions_not_after_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_not_after_idx ON auth.sessions USING btree (not_after DESC);


--
-- Name: sessions_user_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sessions_user_id_idx ON auth.sessions USING btree (user_id);


--
-- Name: sso_domains_domain_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_domains_domain_idx ON auth.sso_domains USING btree (lower(domain));


--
-- Name: sso_domains_sso_provider_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_domains_sso_provider_id_idx ON auth.sso_domains USING btree (sso_provider_id);


--
-- Name: sso_providers_resource_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX sso_providers_resource_id_idx ON auth.sso_providers USING btree (lower(resource_id));


--
-- Name: sso_providers_resource_id_pattern_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX sso_providers_resource_id_pattern_idx ON auth.sso_providers USING btree (resource_id text_pattern_ops);


--
-- Name: unique_phone_factor_per_user; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX unique_phone_factor_per_user ON auth.mfa_factors USING btree (user_id, phone);


--
-- Name: user_id_created_at_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX user_id_created_at_idx ON auth.sessions USING btree (user_id, created_at);


--
-- Name: users_email_partial_key; Type: INDEX; Schema: auth; Owner: -
--

CREATE UNIQUE INDEX users_email_partial_key ON auth.users USING btree (email) WHERE (is_sso_user = false);


--
-- Name: INDEX users_email_partial_key; Type: COMMENT; Schema: auth; Owner: -
--

COMMENT ON INDEX auth.users_email_partial_key IS 'Auth: A partial unique index that applies only when is_sso_user is false';


--
-- Name: users_instance_id_email_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_email_idx ON auth.users USING btree (instance_id, lower((email)::text));


--
-- Name: users_instance_id_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_instance_id_idx ON auth.users USING btree (instance_id);


--
-- Name: users_is_anonymous_idx; Type: INDEX; Schema: auth; Owner: -
--

CREATE INDEX users_is_anonymous_idx ON auth.users USING btree (is_anonymous);


--
-- Name: birthday_rounds_auth_due_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX birthday_rounds_auth_due_uq ON public.birthday_rounds USING btree (auth_user_id, due_month) WHERE (auth_user_id IS NOT NULL);


--
-- Name: birthday_rounds_auth_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX birthday_rounds_auth_user_idx ON public.birthday_rounds USING btree (auth_user_id);


--
-- Name: birthday_rounds_due_month_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX birthday_rounds_due_month_idx ON public.birthday_rounds USING btree (due_month);


--
-- Name: birthday_rounds_profile_due_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX birthday_rounds_profile_due_uq ON public.birthday_rounds USING btree (profile_id, due_month) WHERE (profile_id IS NOT NULL);


--
-- Name: birthday_rounds_profile_month_uq; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX birthday_rounds_profile_month_uq ON public.birthday_rounds USING btree (profile_id, due_month) WHERE (profile_id IS NOT NULL);


--
-- Name: idx_profile_claims_one_active_per_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_profile_claims_one_active_per_profile ON public.profile_claims USING btree (profile_id) WHERE (status = ANY (ARRAY['pending'::public.claim_status, 'approved'::public.claim_status]));


--
-- Name: idx_profile_claims_unique_user_profile; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX idx_profile_claims_unique_user_profile ON public.profile_claims USING btree (claimant_user_id, profile_id) WHERE (status = ANY (ARRAY['pending'::public.claim_status, 'approved'::public.claim_status]));


--
-- Name: idx_stammtisch_created_by; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stammtisch_created_by ON public.stammtisch USING btree (created_by);


--
-- Name: idx_stammtisch_date; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX idx_stammtisch_date ON public.stammtisch USING btree (date);


--
-- Name: ix_realtime_subscription_entity; Type: INDEX; Schema: realtime; Owner: -
--

CREATE INDEX ix_realtime_subscription_entity ON realtime.subscription USING btree (entity);


--
-- Name: subscription_subscription_id_entity_filters_key; Type: INDEX; Schema: realtime; Owner: -
--

CREATE UNIQUE INDEX subscription_subscription_id_entity_filters_key ON realtime.subscription USING btree (subscription_id, entity, filters);


--
-- Name: bname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bname ON storage.buckets USING btree (name);


--
-- Name: bucketid_objname; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX bucketid_objname ON storage.objects USING btree (bucket_id, name);


--
-- Name: idx_multipart_uploads_list; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_multipart_uploads_list ON storage.s3_multipart_uploads USING btree (bucket_id, key, created_at);


--
-- Name: idx_name_bucket_level_unique; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX idx_name_bucket_level_unique ON storage.objects USING btree (name COLLATE "C", bucket_id, level);


--
-- Name: idx_objects_bucket_id_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_bucket_id_name ON storage.objects USING btree (bucket_id, name COLLATE "C");


--
-- Name: idx_objects_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_objects_lower_name ON storage.objects USING btree ((path_tokens[level]), lower(name) text_pattern_ops, bucket_id, level);


--
-- Name: idx_prefixes_lower_name; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX idx_prefixes_lower_name ON storage.prefixes USING btree (bucket_id, level, ((string_to_array(name, '/'::text))[level]), lower(name) text_pattern_ops);


--
-- Name: name_prefix_search; Type: INDEX; Schema: storage; Owner: -
--

CREATE INDEX name_prefix_search ON storage.objects USING btree (name text_pattern_ops);


--
-- Name: objects_bucket_id_level_idx; Type: INDEX; Schema: storage; Owner: -
--

CREATE UNIQUE INDEX objects_bucket_id_level_idx ON storage.objects USING btree (bucket_id, level, name COLLATE "C");


--
-- Name: messages_2025_09_17_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_17_pkey;


--
-- Name: messages_2025_09_18_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_18_pkey;


--
-- Name: messages_2025_09_19_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_19_pkey;


--
-- Name: messages_2025_09_20_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_20_pkey;


--
-- Name: messages_2025_09_21_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_21_pkey;


--
-- Name: messages_2025_09_22_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_22_pkey;


--
-- Name: messages_2025_09_23_pkey; Type: INDEX ATTACH; Schema: realtime; Owner: -
--

ALTER INDEX realtime.messages_pkey ATTACH PARTITION realtime.messages_2025_09_23_pkey;


--
-- Name: users on_auth_user_created; Type: TRIGGER; Schema: auth; Owner: -
--

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


--
-- Name: stammtisch set_created_by_stammtisch; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_created_by_stammtisch BEFORE INSERT ON public.stammtisch FOR EACH ROW EXECUTE FUNCTION public.set_created_by();


--
-- Name: stammtisch set_owner_before_insert; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER set_owner_before_insert BEFORE INSERT ON public.stammtisch FOR EACH ROW EXECUTE FUNCTION public.stammtisch_set_owner();


--
-- Name: app_settings trg_app_settings_set_updated_at; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_app_settings_set_updated_at BEFORE UPDATE ON public.app_settings FOR EACH ROW EXECUTE FUNCTION public.tg_app_settings_set_updated_at();


--
-- Name: profile_claims trg_profile_claims_apply_on_approve; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_profile_claims_apply_on_approve BEFORE UPDATE ON public.profile_claims FOR EACH ROW EXECUTE FUNCTION public.profile_claims_apply_on_approve();


--
-- Name: profiles trg_profiles_member_column_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER trg_profiles_member_column_guard BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.profiles_member_column_guard();


--
-- Name: subscription tr_check_filters; Type: TRIGGER; Schema: realtime; Owner: -
--

CREATE TRIGGER tr_check_filters BEFORE INSERT OR UPDATE ON realtime.subscription FOR EACH ROW EXECUTE FUNCTION realtime.subscription_check_filters();


--
-- Name: buckets enforce_bucket_name_length_trigger; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER enforce_bucket_name_length_trigger BEFORE INSERT OR UPDATE OF name ON storage.buckets FOR EACH ROW EXECUTE FUNCTION storage.enforce_bucket_name_length();


--
-- Name: objects objects_delete_delete_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_delete_delete_prefix AFTER DELETE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects objects_insert_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_insert_create_prefix BEFORE INSERT ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.objects_insert_prefix_trigger();


--
-- Name: objects objects_update_create_prefix; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER objects_update_create_prefix BEFORE UPDATE ON storage.objects FOR EACH ROW WHEN (((new.name <> old.name) OR (new.bucket_id <> old.bucket_id))) EXECUTE FUNCTION storage.objects_update_prefix_trigger();


--
-- Name: prefixes prefixes_create_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_create_hierarchy BEFORE INSERT ON storage.prefixes FOR EACH ROW WHEN ((pg_trigger_depth() < 1)) EXECUTE FUNCTION storage.prefixes_insert_trigger();


--
-- Name: prefixes prefixes_delete_hierarchy; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER prefixes_delete_hierarchy AFTER DELETE ON storage.prefixes FOR EACH ROW EXECUTE FUNCTION storage.delete_prefix_hierarchy_trigger();


--
-- Name: objects update_objects_updated_at; Type: TRIGGER; Schema: storage; Owner: -
--

CREATE TRIGGER update_objects_updated_at BEFORE UPDATE ON storage.objects FOR EACH ROW EXECUTE FUNCTION storage.update_updated_at_column();


--
-- Name: identities identities_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.identities
    ADD CONSTRAINT identities_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: mfa_amr_claims mfa_amr_claims_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_amr_claims
    ADD CONSTRAINT mfa_amr_claims_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: mfa_challenges mfa_challenges_auth_factor_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_challenges
    ADD CONSTRAINT mfa_challenges_auth_factor_id_fkey FOREIGN KEY (factor_id) REFERENCES auth.mfa_factors(id) ON DELETE CASCADE;


--
-- Name: mfa_factors mfa_factors_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.mfa_factors
    ADD CONSTRAINT mfa_factors_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: one_time_tokens one_time_tokens_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.one_time_tokens
    ADD CONSTRAINT one_time_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: refresh_tokens refresh_tokens_session_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.refresh_tokens
    ADD CONSTRAINT refresh_tokens_session_id_fkey FOREIGN KEY (session_id) REFERENCES auth.sessions(id) ON DELETE CASCADE;


--
-- Name: saml_providers saml_providers_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_providers
    ADD CONSTRAINT saml_providers_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_flow_state_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_flow_state_id_fkey FOREIGN KEY (flow_state_id) REFERENCES auth.flow_state(id) ON DELETE CASCADE;


--
-- Name: saml_relay_states saml_relay_states_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.saml_relay_states
    ADD CONSTRAINT saml_relay_states_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: sessions sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sessions
    ADD CONSTRAINT sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: sso_domains sso_domains_sso_provider_id_fkey; Type: FK CONSTRAINT; Schema: auth; Owner: -
--

ALTER TABLE ONLY auth.sso_domains
    ADD CONSTRAINT sso_domains_sso_provider_id_fkey FOREIGN KEY (sso_provider_id) REFERENCES auth.sso_providers(id) ON DELETE CASCADE;


--
-- Name: birthday_rounds birthday_rounds_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: birthday_rounds birthday_rounds_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: birthday_rounds birthday_rounds_first_due_stammtisch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_first_due_stammtisch_id_fkey FOREIGN KEY (first_due_stammtisch_id) REFERENCES public.stammtisch(id) ON DELETE SET NULL;


--
-- Name: birthday_rounds birthday_rounds_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE SET NULL;


--
-- Name: birthday_rounds birthday_rounds_settled_stammtisch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.birthday_rounds
    ADD CONSTRAINT birthday_rounds_settled_stammtisch_id_fkey FOREIGN KEY (settled_stammtisch_id) REFERENCES public.stammtisch(id) ON DELETE SET NULL;


--
-- Name: profile_claims profile_claims_approved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_claims
    ADD CONSTRAINT profile_claims_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES auth.users(id);


--
-- Name: profile_claims profile_claims_claimant_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_claims
    ADD CONSTRAINT profile_claims_claimant_user_id_fkey FOREIGN KEY (claimant_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: profile_claims profile_claims_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profile_claims
    ADD CONSTRAINT profile_claims_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: profiles profiles_auth_fk; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.profiles
    ADD CONSTRAINT profiles_auth_fk FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: stammtisch_participants stammtisch_participants_auth_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch_participants
    ADD CONSTRAINT stammtisch_participants_auth_user_id_fkey FOREIGN KEY (auth_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


--
-- Name: stammtisch_participants stammtisch_participants_stammtisch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch_participants
    ADD CONSTRAINT stammtisch_participants_stammtisch_id_fkey FOREIGN KEY (stammtisch_id) REFERENCES public.stammtisch(id) ON DELETE CASCADE;


--
-- Name: stammtisch_participants_unlinked stammtisch_participants_unlinked_profile_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch_participants_unlinked
    ADD CONSTRAINT stammtisch_participants_unlinked_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id) ON DELETE CASCADE;


--
-- Name: stammtisch_participants_unlinked stammtisch_participants_unlinked_stammtisch_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.stammtisch_participants_unlinked
    ADD CONSTRAINT stammtisch_participants_unlinked_stammtisch_id_fkey FOREIGN KEY (stammtisch_id) REFERENCES public.stammtisch(id) ON DELETE CASCADE;


--
-- Name: objects objects_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.objects
    ADD CONSTRAINT "objects_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: prefixes prefixes_bucketId_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.prefixes
    ADD CONSTRAINT "prefixes_bucketId_fkey" FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads s3_multipart_uploads_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads
    ADD CONSTRAINT s3_multipart_uploads_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_bucket_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_bucket_id_fkey FOREIGN KEY (bucket_id) REFERENCES storage.buckets(id);


--
-- Name: s3_multipart_uploads_parts s3_multipart_uploads_parts_upload_id_fkey; Type: FK CONSTRAINT; Schema: storage; Owner: -
--

ALTER TABLE ONLY storage.s3_multipart_uploads_parts
    ADD CONSTRAINT s3_multipart_uploads_parts_upload_id_fkey FOREIGN KEY (upload_id) REFERENCES storage.s3_multipart_uploads(id) ON DELETE CASCADE;


--
-- Name: audit_log_entries; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.audit_log_entries ENABLE ROW LEVEL SECURITY;

--
-- Name: flow_state; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.flow_state ENABLE ROW LEVEL SECURITY;

--
-- Name: identities; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY;

--
-- Name: instances; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.instances ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_amr_claims; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_amr_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_challenges; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_challenges ENABLE ROW LEVEL SECURITY;

--
-- Name: mfa_factors; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.mfa_factors ENABLE ROW LEVEL SECURITY;

--
-- Name: one_time_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.one_time_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: refresh_tokens; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.refresh_tokens ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: saml_relay_states; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.saml_relay_states ENABLE ROW LEVEL SECURITY;

--
-- Name: schema_migrations; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.schema_migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: sessions; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sessions ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_domains; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_domains ENABLE ROW LEVEL SECURITY;

--
-- Name: sso_providers; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.sso_providers ENABLE ROW LEVEL SECURITY;

--
-- Name: users; Type: ROW SECURITY; Schema: auth; Owner: -
--

ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY;

--
-- Name: app_settings; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

--
-- Name: app_settings app_settings_select_vegas; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_settings_select_vegas ON public.app_settings FOR SELECT TO authenticated USING ((key = 'vegas'::text));


--
-- Name: app_settings app_settings_update_admin; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY app_settings_update_admin ON public.app_settings FOR UPDATE TO authenticated USING (((key = 'vegas'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.auth_user_id = auth.uid()) AND (p.is_admin = true)))))) WITH CHECK (((key = 'vegas'::text) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.auth_user_id = auth.uid()) AND (p.is_admin = true))))));


--
-- Name: birthday_rounds; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.birthday_rounds ENABLE ROW LEVEL SECURITY;

--
-- Name: birthday_rounds br_insert_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY br_insert_all ON public.birthday_rounds FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: birthday_rounds br_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY br_select_all ON public.birthday_rounds FOR SELECT TO authenticated USING (true);


--
-- Name: birthday_rounds br_update_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY br_update_all ON public.birthday_rounds FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: profiles insert_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY insert_own_profile ON public.profiles FOR INSERT WITH CHECK ((auth.uid() = auth_user_id));


--
-- Name: stammtisch_participants participants_read_authed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY participants_read_authed ON public.stammtisch_participants FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: stammtisch_participants participants_write_self; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY participants_write_self ON public.stammtisch_participants USING ((auth.uid() = auth_user_id)) WITH CHECK ((auth.uid() = auth_user_id));


--
-- Name: profile_claims; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profile_claims ENABLE ROW LEVEL SECURITY;

--
-- Name: profile_claims profile_claims_ins_member; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_claims_ins_member ON public.profile_claims FOR INSERT WITH CHECK (((auth.uid() = claimant_user_id) AND (status = 'pending'::public.claim_status) AND (EXISTS ( SELECT 1
   FROM public.profiles p
  WHERE ((p.id = profile_claims.profile_id) AND (p.auth_user_id IS NULL))))));


--
-- Name: profile_claims profile_claims_sel_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_claims_sel_own ON public.profile_claims FOR SELECT USING ((auth.uid() = claimant_user_id));


--
-- Name: profile_claims profile_claims_sel_super; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_claims_sel_super ON public.profile_claims FOR SELECT USING (public.is_superuser());


--
-- Name: profile_claims profile_claims_upd_cancel_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_claims_upd_cancel_own ON public.profile_claims FOR UPDATE USING ((auth.uid() = claimant_user_id)) WITH CHECK (((claimant_user_id = auth.uid()) AND (status = 'cancelled'::public.claim_status)));


--
-- Name: profile_claims profile_claims_upd_super; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profile_claims_upd_super ON public.profile_claims FOR UPDATE USING (public.is_superuser()) WITH CHECK (public.is_superuser());


--
-- Name: profiles; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

--
-- Name: profiles profiles_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_insert_own ON public.profiles FOR INSERT WITH CHECK ((auth_user_id = auth.uid()));


--
-- Name: profiles profiles_read_all_authed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_read_all_authed ON public.profiles FOR SELECT TO authenticated USING (true);


--
-- Name: profiles profiles_read_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_read_own ON public.profiles FOR SELECT USING ((auth_user_id = auth.uid()));


--
-- Name: profiles profiles_sel_unlinked; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_sel_unlinked ON public.profiles FOR SELECT USING (((auth.uid() IS NOT NULL) AND (auth_user_id IS NULL)));


--
-- Name: profiles profiles_upd_admin_any; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_upd_admin_any ON public.profiles FOR UPDATE USING (public.is_superuser()) WITH CHECK (public.is_superuser());


--
-- Name: profiles profiles_upd_own_row; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_upd_own_row ON public.profiles FOR UPDATE USING ((auth.uid() = auth_user_id)) WITH CHECK ((auth.uid() = auth_user_id));


--
-- Name: profiles profiles_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY profiles_update_own ON public.profiles FOR UPDATE USING ((auth_user_id = auth.uid()));


--
-- Name: stammtisch read events public; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY "read events public" ON public.stammtisch FOR SELECT USING (true);


--
-- Name: profiles read_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY read_own_profile ON public.profiles FOR SELECT USING ((auth.uid() = auth_user_id));


--
-- Name: stammtisch_participants sp_delete_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sp_delete_all ON public.stammtisch_participants FOR DELETE TO authenticated USING (true);


--
-- Name: stammtisch_participants sp_insert_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sp_insert_all ON public.stammtisch_participants FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: stammtisch_participants sp_select_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sp_select_all ON public.stammtisch_participants FOR SELECT TO authenticated USING (true);


--
-- Name: stammtisch_participants sp_update_all; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY sp_update_all ON public.stammtisch_participants FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: stammtisch_participants_unlinked spul_delete; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY spul_delete ON public.stammtisch_participants_unlinked FOR DELETE TO authenticated USING (true);


--
-- Name: stammtisch_participants_unlinked spul_insert; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY spul_insert ON public.stammtisch_participants_unlinked FOR INSERT TO authenticated WITH CHECK (true);


--
-- Name: stammtisch_participants_unlinked spul_select; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY spul_select ON public.stammtisch_participants_unlinked FOR SELECT TO authenticated USING (true);


--
-- Name: stammtisch_participants_unlinked spul_update; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY spul_update ON public.stammtisch_participants_unlinked FOR UPDATE TO authenticated USING (true) WITH CHECK (true);


--
-- Name: stammtisch; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stammtisch ENABLE ROW LEVEL SECURITY;

--
-- Name: stammtisch stammtisch_delete_legacy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stammtisch_delete_legacy ON public.stammtisch FOR DELETE TO authenticated USING ((created_by IS NULL));


--
-- Name: stammtisch stammtisch_delete_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stammtisch_delete_own ON public.stammtisch FOR DELETE USING ((created_by = auth.uid()));


--
-- Name: stammtisch stammtisch_insert_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stammtisch_insert_own ON public.stammtisch FOR INSERT WITH CHECK ((created_by = auth.uid()));


--
-- Name: stammtisch_participants; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stammtisch_participants ENABLE ROW LEVEL SECURITY;

--
-- Name: stammtisch_participants_unlinked; Type: ROW SECURITY; Schema: public; Owner: -
--

ALTER TABLE public.stammtisch_participants_unlinked ENABLE ROW LEVEL SECURITY;

--
-- Name: stammtisch stammtisch_read_all_authed; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stammtisch_read_all_authed ON public.stammtisch FOR SELECT USING ((auth.role() = 'authenticated'::text));


--
-- Name: stammtisch stammtisch_update_legacy; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stammtisch_update_legacy ON public.stammtisch FOR UPDATE TO authenticated USING ((created_by IS NULL)) WITH CHECK (((created_by IS NULL) OR (created_by = auth.uid())));


--
-- Name: stammtisch stammtisch_update_own; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY stammtisch_update_own ON public.stammtisch FOR UPDATE USING ((created_by = auth.uid())) WITH CHECK ((created_by = auth.uid()));


--
-- Name: profiles update_own_profile; Type: POLICY; Schema: public; Owner: -
--

CREATE POLICY update_own_profile ON public.profiles FOR UPDATE USING ((auth.uid() = auth_user_id)) WITH CHECK ((auth.uid() = auth_user_id));


--
-- Name: messages; Type: ROW SECURITY; Schema: realtime; Owner: -
--

ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

--
-- Name: objects avatars_delete_own; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatars_delete_own ON storage.objects FOR DELETE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects avatars_insert_own; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatars_insert_own ON storage.objects FOR INSERT TO authenticated WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects avatars_read_public; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatars_read_public ON storage.objects FOR SELECT USING ((bucket_id = 'avatars'::text));


--
-- Name: objects avatars_update_own; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY avatars_update_own ON storage.objects FOR UPDATE TO authenticated USING (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))) WITH CHECK (((bucket_id = 'avatars'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: buckets; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

--
-- Name: buckets_analytics; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.buckets_analytics ENABLE ROW LEVEL SECURITY;

--
-- Name: objects image_delete_own; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY image_delete_own ON storage.objects FOR DELETE USING (((bucket_id = 'images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects image_read_authed; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY image_read_authed ON storage.objects FOR SELECT USING (((bucket_id = 'images'::text) AND (auth.role() = 'authenticated'::text)));


--
-- Name: objects image_update_own; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY image_update_own ON storage.objects FOR UPDATE USING (((bucket_id = 'images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text))) WITH CHECK (((bucket_id = 'images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: objects image_write_own_folder; Type: POLICY; Schema: storage; Owner: -
--

CREATE POLICY image_write_own_folder ON storage.objects FOR INSERT WITH CHECK (((bucket_id = 'images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));


--
-- Name: migrations; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.migrations ENABLE ROW LEVEL SECURITY;

--
-- Name: objects; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

--
-- Name: prefixes; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.prefixes ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads ENABLE ROW LEVEL SECURITY;

--
-- Name: s3_multipart_uploads_parts; Type: ROW SECURITY; Schema: storage; Owner: -
--

ALTER TABLE storage.s3_multipart_uploads_parts ENABLE ROW LEVEL SECURITY;

--
-- Name: supabase_realtime; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime_messages_publication; Type: PUBLICATION; Schema: -; Owner: -
--

CREATE PUBLICATION supabase_realtime_messages_publication WITH (publish = 'insert, update, delete, truncate');


--
-- Name: supabase_realtime stammtisch; Type: PUBLICATION TABLE; Schema: public; Owner: -
--

ALTER PUBLICATION supabase_realtime ADD TABLE ONLY public.stammtisch;


--
-- Name: supabase_realtime_messages_publication messages; Type: PUBLICATION TABLE; Schema: realtime; Owner: -
--

ALTER PUBLICATION supabase_realtime_messages_publication ADD TABLE ONLY realtime.messages;


--
-- Name: issue_graphql_placeholder; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_graphql_placeholder ON sql_drop
         WHEN TAG IN ('DROP EXTENSION')
   EXECUTE FUNCTION extensions.set_graphql_placeholder();


--
-- Name: issue_pg_cron_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_cron_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_cron_access();


--
-- Name: issue_pg_graphql_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_graphql_access ON ddl_command_end
         WHEN TAG IN ('CREATE FUNCTION')
   EXECUTE FUNCTION extensions.grant_pg_graphql_access();


--
-- Name: issue_pg_net_access; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER issue_pg_net_access ON ddl_command_end
         WHEN TAG IN ('CREATE EXTENSION')
   EXECUTE FUNCTION extensions.grant_pg_net_access();


--
-- Name: pgrst_ddl_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_ddl_watch ON ddl_command_end
   EXECUTE FUNCTION extensions.pgrst_ddl_watch();


--
-- Name: pgrst_drop_watch; Type: EVENT TRIGGER; Schema: -; Owner: -
--

CREATE EVENT TRIGGER pgrst_drop_watch ON sql_drop
   EXECUTE FUNCTION extensions.pgrst_drop_watch();


--
-- PostgreSQL database dump complete
--

\unrestrict fnvdvz99tVqGIlEapQa20afXiTdllEg8gyhJOZrPty0xmta6QH91e1yVNuWqhRZ

