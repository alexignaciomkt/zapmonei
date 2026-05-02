
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://ugwsiqhzmvtdkdlrthek.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnd3NpcWh6bXZ0ZGtkbHJ0aGVrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzIyMTU2MywiZXhwIjoyMDkyNzk3NTYzfQ.RnpqrRZumS3o-0nFynuKrbUEJ-kCfbYw1SDwWfetz48';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkTables() {
  const tables = ['users', 'categories', 'transactions', 'attachments', 'messages', 'audits'];
  console.log('Checking tables...');
  
  for (const table of tables) {
    const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
    if (error) {
      console.log(`❌ Table "${table}" error: ${error.message}`);
    } else {
      console.log(`✅ Table "${table}" exists.`);
    }
  }
}

checkTables();
