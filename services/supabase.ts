import { createClient, SupabaseClient } from '@supabase/supabase-js';

// TODO: Replace with your project's Supabase URL and Anon Key
const supabaseUrl: string = 'https://zhzkbhzhyadoylhozfvw.supabase.co';
const supabaseAnonKey: string = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpoemtiaHpoeWFkb3lsaG96ZnZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyNjIyMTgsImV4cCI6MjA3ODgzODIxOH0.hWxSGQRNW46h77a_6quh4VAil7dLdwyttEgkr4s9XEc';

export const isSupabaseConfigured = 
    !supabaseUrl.includes('YOUR_SUPABASE_URL') && 
    !supabaseAnonKey.includes('YOUR_SUPABASE_ANON_KEY') && 
    supabaseUrl.trim().length > 0 && 
    supabaseAnonKey.trim().length > 0;

if (!isSupabaseConfigured) {
    console.warn(
        `Supabase credentials are not set. Please update them in services/supabase.ts.
        Without them, database and authentication features will not work.
        You can get these from your Supabase project settings in the API section.`
    );
}

// Safely export the client. If configuration is invalid, export null to avoid crash during import.
// Consumers must check for null before usage.
export const supabase: SupabaseClient | null = isSupabaseConfigured 
    ? createClient(supabaseUrl, supabaseAnonKey) 
    : null;