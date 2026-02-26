-- Add missing FK indexes on lien_waiver_tracking flagged by Supabase advisor
CREATE INDEX IF NOT EXISTS idx_lien_waiver_tracking_job_id ON lien_waiver_tracking (job_id);
CREATE INDEX IF NOT EXISTS idx_lien_waiver_tracking_vendor_id ON lien_waiver_tracking (vendor_id);
