import { createClient } from '@supabase/supabase-js';

// TODO: Replace with your project's Supabase URL and Anon Key
const supabaseUrl = 'https://zhzkbhzhyadoylhozfvw.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemtiaHpoeWFkb3lsaG96ZnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjIyMTgsImV4cCI6MjA3ODgzODIxOH0.hWxSGQRNW46h77a_6quh4VAil7dLdwyttEgkr4s9XEc';

if (supabaseUrl.includes('YOUR_SUPABASE_URL') || supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY')) {
    console.warn(
        `Supabase credentials are not set. Please update them in services/supabase.ts.
        Without them, database and authentication features will not work.
        You can get these from your Supabase project settings in the API section.`
    );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);