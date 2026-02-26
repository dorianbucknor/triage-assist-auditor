/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import {
	atomWithStorage,
	loadable,
	unwrap,
	useHydrateAtoms,
} from "jotai/utils";
import { atom, createStore } from "jotai/vanilla";
import { Provider, useAtom, useStore } from "jotai";
import React, { useEffect } from "react";
import { ClinicalGrading, Scenario, User, UserData } from "@/lib/types";
import { supabaseClient } from "../supabase/client";
import { Session } from "@supabase/supabase-js";

//creates global atom of currentScenarioGrading with local storage
const currentScenarioGradingAtom = atomWithStorage<ClinicalGrading | null>(
	"currentScenarioGrading",
	null,
);
//creates global atom of currentScenario with local storage
const currentScenarioAtom = atomWithStorage<Scenario | null>(
	"currentScenario",
	null,
);


//creates global atom of user
const userAtom = atom<User | null>(null);

//default stirage location
export const store = createStore();

export default function StoreProvider({
	children,
	userAuth,
}: {
	children: React.ReactNode;
	userAuth: User | null;
}) {
	useHydrateAtoms([[userAtom, userAuth]], { store });

	return (
		<Provider>
			<DataLoad>{children}</DataLoad>
		</Provider>
	);
}

function DataLoad({ children }: { children: React.ReactNode }) {
	// const store = useStore({store});
	// const [user] = useAtom(userAtom, { store });

	useEffect(() => {
		// 1. Define the update logic in a reusable function
		const updateUserData = async (session: Session) => {
			if (session) {
				try {
					const profile = await getUserData(session.user.id);
					store.set(userAtom, {
						data: profile,
						session,
					});
				} catch (error) {
					console.error("Failed to fetch profile:", error);
					// Handle error: maybe set user to null or show a toast
				}
			} else {
				store.set(userAtom, null);
			}
		};

		// 3. Listen for all relevant state changes
		const {
			data: { subscription },
		} = supabaseClient.auth.onAuthStateChange(async (event, session) => {
			switch (event) {
				case "INITIAL_SESSION":
				case "SIGNED_IN":
				case "TOKEN_REFRESHED":
					if (!session) return;
					await updateUserData(session);
					break;
				case "SIGNED_OUT":
				case "USER_UPDATED": // Good to handle if they change email/pass
					store.set(userAtom, null);
					break;
			}
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	return <>{children}</>;
}

export {
	currentScenarioGradingAtom,
	currentScenarioAtom,
	userAtom,
};

export const getUserData = async (id: string) => {
	try {
		const dbRequest = await supabaseClient
			.schema("user_info")
			.from("full_user_profiles")
			.select("*")
			.eq("id", id)
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
};
