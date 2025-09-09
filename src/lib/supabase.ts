import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://bcbqnkycjroiskwqcftc.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJjYnFua3ljanJvaXNrd3FjZnRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDM3MzcsImV4cCI6MjA3MjQ3OTczN30.EPU1xSh7K4MzNl2DgCAuITBgb8ywh-ePBDmpVewKRoA"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
