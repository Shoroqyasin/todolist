import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  "https://khjhobnfcihpmvpkwurr.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoamhvYm5mY2locG12cGt3dXJyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjczMDI0MywiZXhwIjoyMDYyMzA2MjQzfQ.A7XrgNeYcUG0iP2K8YIgTqwm0v5AHK842-YyrRohf0E" // your service role key
);

export async function GET(request) {
  // fetch all users from Auth via the Admin API
  const { data, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
    });
  }

  // map to just id + display_name
  const users = data.users.map((u) => ({
    id: u.id,
    display_name: u.user_metadata.display_name || u.email,
  }));

  return new Response(JSON.stringify({ users }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
