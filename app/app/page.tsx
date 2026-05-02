import TriageEntryDashboard from "@/components/app/triage-entry-dashboard";
import { verifySession } from "@/lib/dal";
import { redirect } from "next/navigation";
import React from "react";

export default async function Page() {
	const { user, loggedIn } = await verifySession();

	if (!loggedIn) {
		redirect("/auth/sign-in?redirect=/app");
	}

	return (
		<div>
			<TriageEntryDashboard />
		</div>
	);
}
