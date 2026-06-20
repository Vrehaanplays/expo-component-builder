import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://juqnddhyrzmnxhyimyxu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp1cW5kZGh5cnptbnhoeWlteXh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjU0NzEsImV4cCI6MjA5NDk0MTQ3MX0.D0JWfu9myUKJQSNgMrqaFNQurhoxZv9-kHORlpmnYOk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  console.log("Checking gym_sessions table...");
  const { data, error } = await supabase.from('gym_sessions').select('*').limit(1);
  if (error) {
    console.log("Error querying gym_sessions:", error.message);
  } else {
    console.log("gym_sessions exists! Data:", data);
  }

  console.log("Checking scenario_feedback_cache table...");
  const { data: cacheData, error: cacheError } = await supabase.from('scenario_feedback_cache').select('*').limit(1);
  if (cacheError) {
    console.log("Error querying scenario_feedback_cache:", cacheError.message);
  } else {
    console.log("scenario_feedback_cache exists! Data:", cacheData);
  }
}

checkTables();
