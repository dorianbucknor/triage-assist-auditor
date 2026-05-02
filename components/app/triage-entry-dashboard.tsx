"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAtom } from "jotai";
import { store, userAtom } from "@/providers/jotai/jotai";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, FileText, ClipboardList } from "lucide-react";
import TriageFormDialog from "@/components/app/triage-form-dialog";
import PreviousEntriesModal from "@/components/app/previous-entries-modal";
import { getUserRole } from "@/lib/utils";

export default function TriageEntryDashboard() {
	const router = useRouter();
	const [user] = useAtom(userAtom, { store: store });
	const [isFormDialogOpen, setIsFormDialogOpen] = useState(false);
	const [isPreviousEntriesOpen, setIsPreviousEntriesOpen] = useState(false);
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setMounted(true);
	}, [user]);

	if (!mounted) {
		return null;
	}

	const userRole = user?.session ? getUserRole(user.session) : "user";
	const canCreateTriage =
		(!!user?.data?.clinicianProfile?.professionalRole &&
			!user?.data?.disabled) ||
		userRole !== "user";
	const userName =
		user?.data?.firstName ||
		user?.data?.email?.split("@")[0] ||
		"Clinician";

	return (
		<>
			<div className="min-h-screen ">
				<div className="container mx-auto px-4 py-8">
					{/* Welcome Section */}
					<div className="mb-12">
						<h1 className="text-5xl font-bold mb-2">
							Welcome back, {userName}!
						</h1>
						<p className="text-lg text-muted-foreground">
							Manage triage entries, review AI evaluations, and
							access the clinical evaluation dashboard.
						</p>
					</div>

					{/* Action Cards Grid */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{/* New Triage Card */}
						{canCreateTriage && (
							<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
								<CardHeader className="pb-3">
									<div className="flex items-center gap-3 mb-2">
										<div className="p-2 bg-blue-100 rounded-lg">
											<Stethoscope className="w-6 h-6 text-blue-600" />
										</div>
										<CardTitle className="text-xl">
											New Triage Entry
										</CardTitle>
									</div>
								</CardHeader>
								<CardContent className="space-y-4">
									<p className="text-sm text-muted-foreground">
										Create a new triage entry with patient
										information. The AI will provide an ESI
										level, diagnosis, and treatment
										recommendations.
									</p>
									<Button
										onClick={() =>
											setIsFormDialogOpen(true)
										}
										className="w-full"
									>
										Create New Entry
									</Button>
								</CardContent>
							</Card>
						)}

						{/* View Previous Card */}
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-2 bg-green-100 rounded-lg">
										<FileText className="w-6 h-6 text-green-600" />
									</div>
									<CardTitle className="text-xl">
										View Previous Entries
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Browse and review your previously created
									triage entries along with their AI
									evaluations and responses.
								</p>
								<Button
									onClick={() =>
										setIsPreviousEntriesOpen(true)
									}
									variant="outline"
									className="w-full"
								>
									View Entries
								</Button>
							</CardContent>
						</Card>

						{/* AI Evaluator Card */}
						<Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
							<CardHeader className="pb-3">
								<div className="flex items-center gap-3 mb-2">
									<div className="p-2 bg-purple-100 rounded-lg">
										<ClipboardList className="w-6 h-6 text-purple-600" />
									</div>
									<CardTitle className="text-xl">
										AI Evaluator
									</CardTitle>
								</div>
							</CardHeader>
							<CardContent className="space-y-4">
								<p className="text-sm text-muted-foreground">
									Access the clinical grading dashboard to
									review ungraded scenarios and provide
									clinical feedback.
								</p>
								<Button
									onClick={() =>
										router.push("/app/ai-evaluator")
									}
									variant="outline"
									className="w-full"
								>
									Go to Evaluator
								</Button>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>

			{/* Dialogs */}
			<TriageFormDialog
				open={isFormDialogOpen}
				onOpenChange={setIsFormDialogOpen}
			/>
			<PreviousEntriesModal
				open={isPreviousEntriesOpen}
				onOpenChange={setIsPreviousEntriesOpen}
			/>
		</>
	);
}
