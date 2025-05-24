import { createClient } from '@supabase/supabase-js';

    const supabaseUrl = 'https://woubtbfmryzpvwyjbtnf.supabase.co';
    const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndvdWJ0YmZtcnl6cHZ3eWpidG5mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgwNjg0MjAsImV4cCI6MjA2MzY0NDQyMH0.sJoa1rk3THp2onq_f8DIiyntxTe_i9DxwjuMJ6L2Whg';

    export const supabase = createClient(supabaseUrl, supabaseAnonKey);