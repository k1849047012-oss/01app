import { createClient } from "@supabase/supabase-js";

async function verifySupabase() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) {
    console.error("Status: Not Connected");
    console.error("Reason: Missing environment variables (SUPABASE_URL or SUPABASE_ANON_KEY)");
    process.exit(1);
  }

  const supabase = createClient(url, key);

  try {
    // A simple public query that doesn't require a specific table to exist
    // to check if the client can communicate with the Supabase API
    const { data, error } = await supabase.from("_non_existent_table_").select("*").limit(1);
    
    // 404 is actually a good sign - it means we reached the server
    // 401/403 would mean bad keys
    // Connection errors would throw or have specific error codes
    if (error && error.code === "PGRST116") {
        // This is a "no rows" error, usually means connected but empty
        console.log("Status: Connected");
        console.log("Reason: Successfully communicated with Supabase API");
        process.exit(0);
    }

    if (error && error.message.includes("failed to fetch")) {
      console.error("Status: Not Connected");
      console.error("Reason: Network Error - " + error.message);
      process.exit(1);
    }

    // If we get an error that isn't about missing tables, it might be auth
    if (error && error.code !== "42P01") { // 42P01 is "relation does not exist"
        console.log("Status: Not Connected");
        console.log("Reason: API Error (" + error.code + ") - " + error.message);
        process.exit(1);
    }

    console.log("Status: Connected");
    console.log("Reason: Successfully reached Supabase API (received expected table-not-found response)");
    process.exit(0);
  } catch (err: any) {
    console.error("Status: Not Connected");
    console.error("Reason: Connection Exception - " + err.message);
    process.exit(1);
  }
}

verifySupabase();
