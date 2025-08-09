
import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xhuyuhmeiipdvcllzccb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhodXl1aG1laWlwZHZjbGx6Y2NiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ1MzQ4MjIsImV4cCI6MjA3MDExMDgyMn0.PsOL2GbAr0mgK9j5fa1UoBCA-1TX8xDGlAV_2N6Uwjs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
