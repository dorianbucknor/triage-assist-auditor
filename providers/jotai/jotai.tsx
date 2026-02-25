"use client";

import { atomWithStorage, useHydrateAtoms } from "jotai/utils";
import { atom, createStore } from "jotai/vanilla";
import { Provider, useAtom } from "jotai";
import React from "react";
import { ClinicalGrading, Scenario, User, UserData } from "@/lib/types";
import { supabaseClient } from "../supabase/client";

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
//creates global atom of scenarios with local storage
const scenariosAtom = atomWithStorage<Scenario[] | null>("scenarios", []);
//creates global atom of user
const userAtom = atom<User | null>(null);

//default stirage location
const store = createStore();

export default function StoreProvider({
	children,
	userAuth,
}: {
	children: React.ReactNode;
	userAuth: User | null;
}) {
	supabaseClient.auth.onAuthStateChange(async (event, session) => {
		switch (event) {
			case "SIGNED_IN":
				if (session) {
					store.set(userAtom, {
						data: await getUserData(session.user.id),
						session,
					});
				} else {
					store.set(userAtom, null);
				}
				break;
			case "SIGNED_OUT":
				store.set(userAtom, null);
				break;
		}
	});

	return <Provider store={store}>{children}</Provider>;
}

export {
	currentScenarioGradingAtom,
	currentScenarioAtom,
	scenariosAtom,
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
