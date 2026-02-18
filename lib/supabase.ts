import { createClient } from "@supabase/supabase-js";
const supabaseUrl = "https://qbrqflsbkadrwsoxnpha.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_KEY || "";
export const supabaseClient = createClient(supabaseUrl, supabaseKey);
