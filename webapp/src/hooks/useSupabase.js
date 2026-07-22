import { createClient } from '@supabase/supabase-js';
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
let client = null;
export function getSupabase() {
    if (!client && supabaseUrl && supabaseKey) {
        client = createClient(supabaseUrl, supabaseKey, {
            realtime: {
                params: { eventsPerSecond: 10 },
            },
        });
    }
    return client;
}
export function requireSupabase() {
    const sb = getSupabase();
    if (!sb)
        throw new Error('Supabase not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
    return sb;
}
