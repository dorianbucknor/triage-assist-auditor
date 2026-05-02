import "server-only";

import { cache } from "react";
import { createServerClient } from "@/providers/supabase/server";
import { decodeJwt } from "jose";
import { UserData } from "@/lib/types";
import { Session, User } from "@supabase/supabase-js";

async function supabaseClient() {
	return await createServerClient();
}

export const getUser = cache(async () => {
	const session = await verifySession();
	if (!session) return null;

	try {
		const dbRequest = await (await supabaseClient())
			.schema("user_info")
			.from("full_user_profiles")
			.select("*")
			.eq("id", session.userId)
			.limit(1)
			.single();

		const user = dbRequest.data;

		if (!user) {
			return null;
		}

		const data = {
			id: user["id"],
			firstName: user["first_name"],
			lastName: user["last_name"],
			email: user["email"],
			role: "user",
			tosAccepted: user["tos_accepted"],
			emailVerified: user["email_verified"],
			disabled: user["disabled"],
			updatedAt: user["updated_at"],
			createdAt: user["created_at"],
			clinicianProfile: user["clinician_details"] && {
				professionalRole:
					user["clinician_details"]["professional_role"],
				registrationNumber:
					user["clinician_details"]["registration_number"],
				institution: user["clinician_details"]["institution"],
				speciality: user["clinician_details"]["speciality"],
			},
		} as UserData;

		return data;
	} catch (error) {
		console.log("Failed to fetch user", error);
		return null;
	}
});

export type SessionResponse = {
	loggedIn: boolean;
	userId: string | null;
	session: Session | null;
	userRole: string | null;
	user: User | null;
    userData?: UserData | null;
};

export const verifySession = cache(async () => {
	const {
		data: { session },
	} = await (await supabaseClient()).auth.getSession();

	const {
		data: { user },
	} = await (await supabaseClient()).auth.getUser();

	if (!user) {
		await (await supabaseClient()).auth.signOut();

		return {
			loggedIn: false,
			userId: null,
			session: null,
			userRole: null,
			user: null,
		} as SessionResponse;
	}

	const cookie = session
		? decodeJwt(session.access_token)
		: { user_role: null };

	return {
		loggedIn: session && user ? true : false,
		userId: user.id,
		session,
		userRole: cookie["user_role"],
		user,
	} as SessionResponse;
});
