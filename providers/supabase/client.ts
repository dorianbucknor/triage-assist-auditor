// import { createClient } from "@supabase/supabase-js";

import { createBrowserClient } from "@supabase/ssr";

function createClient() {
	return createBrowserClient(
		process.env.NEXT_PUBLIC_SUPABASE_URL!,
		process.env.NEXT_PUBLIC_SUPABASE_KEY!,
		{ isSingleton: true },
	);
}

export const supabaseClient = createClient();
