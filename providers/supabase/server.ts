import { createServerClient as sbServer } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerClient() {
	try {
		const cookieStore = await cookies();

		const serverConnection = sbServer(
			process.env.NEXT_PUBLIC_SUPABASE_URL!,
			process.env.NEXT_PUBLIC_SUPABASE_KEY!,
			{
				cookies: {
					getAll() {
						return cookieStore.getAll();
					},
					setAll(cookiesToSet) {
						try {
							cookiesToSet.forEach(({ name, value, options }) =>
								cookieStore.set(name, value, options),
							);
						} catch {
							// The `setAll` method was called from a Server Component.
							// This can be ignored if you have middleware refreshing
							// user sessions.
						}
					},
				},
			},
		);

		return serverConnection;
	} catch (error) {
		throw new Error("Failed to create Supabase client: " + error);
	}
}
