import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const SUPABASE_URL = 'https://iooxijbpksbhptztceek.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlvb3hpamJwa3NiaHB0enRjZWVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1ODkwNDEsImV4cCI6MjA3MDE2NTA0MX0.dRKXo1XXGnkrvHgkPkB6-k4GyxQu6tawui3Nuw4vBPE';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
