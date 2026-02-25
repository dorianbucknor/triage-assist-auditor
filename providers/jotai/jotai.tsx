"use client";

import { atomWithStorage } from "jotai/utils";
import { atom, createStore } from "jotai/vanilla";
import { Provider, useAtom } from "jotai";
import React from "react";
import { ClinicalGrading, Scenario, User } from "@/lib/types";

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
	const [_, setUser] = useAtom(userAtom, { store: store });

	React.useEffect(() => {
		setUser(userAuth);
	}, [setUser, userAuth]);

	return <Provider store={store}>{children}</Provider>;
}

export { currentScenarioGradingAtom , currentScenarioAtom , scenariosAtom , userAtom  };
