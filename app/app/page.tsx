"use client";

import React, { useState } from "react";
import { ChevronUp, AlertCircle, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import TriageForm from "@/components/app/scenario-form";
import type {
	AIResponse,
	APIResponse,
	ClinicalGrading,
	Scenario,
	TriageData,
} from "@/lib/types";
import ResponseCard from "@/components/app/ai-response-card";
import TreatmentRecommendations from "@/components/app/treatment-reccommendation-card";
import GradingSection from "@/components/app/clician-grading-section";
import {
	useInfiniteQuery,
	useQueryClient,
	InfiniteData,
} from "@tanstack/react-query";
import { useAtom } from "jotai";
import { store, userAtom } from "@/providers/jotai/jotai";
import { useEffect } from "react";
import { redirect } from "next/navigation";
import { toast } from "sonner";

// Types for our data structure
const PAGE_SIZE: number = 5;

async function getUngradedScenarios(
	page: number,
	limit = PAGE_SIZE,
): Promise<Scenario[]> {
	const res = await fetch(
		`/api/scenarios?action=fetch_ungraded_by_user&amount=${limit}&page=${page}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!res.ok) {
		toast.error("Failed to fetch scenarios: " + res.statusText);
	}

	const { data, error } = (await res.json()) as APIResponse<Scenario[]>;

	if (error) {
		toast.error("Failed to fetch scenarios: " + error);
		return [];
	}

	return data;
}

function getPrefetchParams(pagesCount: number): {
	queryKey: (string | number)[];
	queryFn: () => Promise<Scenario[]>;
} {
	return {
		queryKey: ["scenarios", PAGE_SIZE],
		queryFn: () => getUngradedScenarios(pagesCount, PAGE_SIZE),
	};
}

function getScenariosBatch(
	data: { pages: Scenario[][] } | undefined,
): Scenario[] {
	return data?.pages.flat() ?? [];
}

export default function TriageAssistantPage() {
	const [user] = useAtom(userAtom, { store: store });
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);

	const queryClient = useQueryClient();

	if (!user || !user.data) {
		redirect("/auth/sign-in");
	}

	const { data, fetchNextPage, isFetchingNextPage, hasNextPage } =
		useInfiniteQuery({
			queryKey: ["scenarios", PAGE_SIZE],
			queryFn: ({ pageParam = 0 }) =>
				getUngradedScenarios(pageParam, PAGE_SIZE),
			getNextPageParam: (lastPage, pages) =>
				lastPage.length < PAGE_SIZE ? undefined : pages.length,
			initialPageParam: 0,
			retry: (failureCount, error) => {
				if (failureCount >= 3) {
					console.log("Error prefeching scenarios: " + error);
					toast.error(
						"Failed to prefetch scenarios after multiple attempts. Please check your connection.",
					);
					return false; // Stop retrying after 3 attempts
				}
				return true; // Retry on other errors
			},
			retryDelay(failureCount, error) {
				const delay = Math.min(1000 * 4 * failureCount, 30000); // Exponential backoff with max delay
				console.log(
					`Retrying fetch scenarios in ${delay}ms... (Attempt ${failureCount})`,
				);
				return delay;
			},
		});

	const scenarios = getScenariosBatch(data);

	// Prefetch next page when remaining scenarios are low
	useEffect(() => {
		if (
			hasNextPage &&
			!isFetchingNextPage &&
			scenarios.length > 0 &&
			currentScenarioIndex >= scenarios.length - 2
		) {
			fetchNextPage();
		}
	}, [
		currentScenarioIndex,
		scenarios.length,
		hasNextPage,
		isFetchingNextPage,
		fetchNextPage,
	]);

	// Auto-prefetch the next page on mount
	useEffect(() => {
		if (hasNextPage && !isFetchingNextPage && data?.pages.length) {
			queryClient.prefetchInfiniteQuery({
				queryKey: ["scenarios", PAGE_SIZE],
				queryFn: ({ pageParam = data.pages.length }) =>
					getUngradedScenarios(pageParam, PAGE_SIZE),
				getNextPageParam: (
					lastPage: Scenario[],
					pages: Scenario[][],
				) => (lastPage.length < PAGE_SIZE ? undefined : pages.length),
				initialPageParam: 0,
				retry: (failureCount, error) => {
					if (failureCount >= 3) {
						console.log("Error prefeching scenarios: " + error);
						toast.error(
							"Failed to prefetch scenarios after multiple attempts. Please check your connection.",
						);
						return false; // Stop retrying after 3 attempts
					}
					return true; // Retry on other errors
				},
				retryDelay(failureCount, error) {
					const delay = Math.min(1000 * 2 ** failureCount, 30000); // Exponential backoff with max delay
					console.log(
						`Retrying fetch scenarios in ${delay}ms... (Attempt ${failureCount})`,
					);
					return delay;
				},
			});
		}
	}, [data?.pages.length, hasNextPage, isFetchingNextPage, queryClient]);

	const currentScenario =
		currentScenarioIndex < scenarios.length
			? scenarios[currentScenarioIndex]
			: null;

	const handleSkip = () => {
		if (currentScenarioIndex < scenarios!.length - 1) {
			setCurrentScenarioIndex(currentScenarioIndex + 1);
		} else {
			setCurrentScenarioIndex(0);
		}
	};

	const handleGradeSubmit = async (grading: ClinicalGrading) => {
		console.log("Grading submitted:", grading);

		const res = await fetch("/api/grade-scenario", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				scenarioId: currentScenario?.id,
				grading,
			}),
		});

		if (!res.ok) {
			toast.error("Failed to submit grading");
			return false;
		}
		const { error } = (await res.json()) as APIResponse<null>;

		if (error) {
			toast.error("Failed to submit grading! " + error);
			return false;
		}

		// Move to next scenario after grading
		if (currentScenarioIndex < scenarios!.length - 1) {
			setCurrentScenarioIndex(currentScenarioIndex + 1);
		} else {
			setCurrentScenarioIndex(0);
		}

		//Remove graded scenario from cache to avoid showing it again
		queryClient.setQueryData<InfiniteData<Scenario[]>>(
			["scenarios", PAGE_SIZE],
			(oldData) => {
				if (!oldData) return oldData;
				const newPages = oldData.pages.map((page) =>
					page.filter(
						(scenario) => scenario.id !== currentScenario?.id,
					),
				);
				return {
					...oldData,
					pages: newPages,
				};
			},
		);

		//reset grading for next scenario
		return true;
	};

	return (
		<div className="min-h-screen ">
			<div className="container mx-auto px-4 py-6">
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					<div className="lg:col-span-2 ">
						<Card className="mb-6">
							<CardHeader>
								<div className="flex flex-row justify-between items-center">
									<h2 className="text-xl font-semibold">
										Patient Scenario
									</h2>
									<div className="space-x-4">
										<Button
											variant="outline"
											onClick={handleSkip}
											disabled={
												scenarios!.length === 0 ||
												currentScenarioIndex >=
													scenarios!.length - 1
											}
										>
											Skip
										</Button>
										<Button
											onClick={() =>
												setIsDialogOpen(true)
											}
										>
											Add Scenario
										</Button>
									</div>
								</div>
							</CardHeader>
							{currentScenario && (
								<CardContent className="space-y-4">
									<div className="grid grid-cols-2 gap-4">
										<div>
											<p className="text-sm text-muted-foreground">
												Age
											</p>
											<p className="font-semibold">
												{currentScenario.triageData
													?.age || "Unknown"}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Gender
											</p>
											<p className="font-semibold">
												{
													currentScenario.content
														?.gender
												}
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Height
											</p>
											<p className="font-semibold">
												{currentScenario.content
													?.height || "-"}
												cm
											</p>
										</div>
										<div>
											<p className="text-sm text-muted-foreground">
												Weight
											</p>
											<p className="font-semibold">
												{currentScenario.content
													?.weight || "-"}{" "}
												kg
											</p>
										</div>
									</div>

									<div className="pt-4 border-t">
										<p className="text-sm text-muted-foreground mb-2">
											Chief Complaint
										</p>
										<p className="font-semibold text-lg mb-4">
											{
												currentScenario.content
													?.chiefComplaint.title
											}
										</p>

										<p className="text-sm text-muted-foreground mb-2">
											Details
										</p>
										<p className="text-sm text-foreground">
											{
												currentScenario.content
													?.chiefComplaint.description
											}
										</p>
									</div>
									<div className="pt-4 border-t">
										<p className="text-sm text-muted-foreground mb-2">
											Medical History Summary
										</p>
										<p className="text-sm text-foreground">
											{currentScenario.content?.medicalHistory?.join(
												", ",
											)}
										</p>
									</div>
									<div className="pt-4 border-t">
										<p className="text-sm text-muted-foreground mb-3">
											Vital Signs
										</p>
										<div className="grid grid-cols-2 md:grid-cols-4 gap-3">
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													BP
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals
														?.bloodPressure || "-"}
												</p>
											</div>
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													HR
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals?.pulse || "-"}
													bpm
												</p>
											</div>
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													RR
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals
														?.respiratoryRate ||
														"-"}
													/min
												</p>
											</div>
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													Temp
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals?.temperature ||
														"-"}
													°C
												</p>
											</div>
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													SpO2
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals
														?.oxygenSaturation ||
														"-"}
													%
												</p>
											</div>
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													Glucose
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals?.glucose ||
														"-"}
												</p>
											</div>
											<div className="bg-muted p-3 rounded-lg">
												<p className="text-xs text-muted-foreground">
													BHCG
												</p>
												<p className="font-semibold">
													{currentScenario.content
														?.vitals?.bhcg || "-"}
												</p>
											</div>
										</div>
									</div>
								</CardContent>
							)}
						</Card>

						{/* AI Response Section */}

						{currentScenario && (
							<div>
								<h2 className="text-xl font-semibold mb-4">
									AI Assessment
								</h2>

								<ResponseCard
									title="Triage Level"
									level={
										currentScenario.aiResponse.triageLevel
											.level
									}
									reasoning={
										currentScenario.aiResponse.triageLevel
											.reasoning
									}
									confidence={
										currentScenario.aiResponse.triageLevel
											.confidence
									}
									icon={AlertCircle}
								/>

								<ResponseCard
									title="Diagnosis"
									level={
										currentScenario.aiResponse.diagnosis
											.primary
									}
									reasoning={
										currentScenario.aiResponse.diagnosis
											.reasoning
									}
									confidence={
										currentScenario.aiResponse.diagnosis
											.confidence
									}
									icon={CheckCircle}
								/>

								<TreatmentRecommendations
									recommendations={
										currentScenario.aiResponse.treatment
											.reccommendations
									}
									reasoning={
										currentScenario.aiResponse.treatment
											.reasoning
									}
									confidence={
										currentScenario.aiResponse.treatment
											.confidence
									}
								/>
							</div>
						)}
					</div>

					{/* Right Section - Grading (Hidden on mobile, visible on desktop) */}
					{currentScenario && (
						<div className="hidden lg:block">
							<div className="sticky top-6">
								<GradingSection onGrade={handleGradeSubmit} />
							</div>
						</div>
					)}
				</div>

				{/* Mobile Bottom Sheet Trigger */}
				<Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
					<SheetTrigger asChild>
						<Button
							variant="outline"
							className="fixed bottom-4 left-4 right-4 lg:hidden rounded-lg gap-2"
						>
							<ChevronUp className="h-4 w-4" />
							Clinical Grading
						</Button>
					</SheetTrigger>
					<SheetContent
						side="bottom"
						className="max-h-[90vh] overflow-y-auto p-4"
					>
						<SheetTitle
							style={{
								position: "absolute",
								border: 0,
								width: 1,
								height: 1,
								padding: 0,
								margin: -1,
								overflow: "hidden",
								clip: "rect(0, 0, 0, 0)",
								whiteSpace: "nowrap",
								wordWrap: "normal",
							}}
						>
							Grading
						</SheetTitle>

						{currentScenario && (
							<GradingSection onGrade={handleGradeSubmit} />
						)}
					</SheetContent>
				</Sheet>

				{/* Add Scenario Dialog */}
				<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
					<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto ">
						<DialogHeader>
							<DialogTitle>Add New Scenario</DialogTitle>
							<DialogDescription>
								Fill in the patient details and clinical
								information to create a new scenario for AI
								evaluation.
							</DialogDescription>
						</DialogHeader>
						<div className="py-4">
							<TriageForm
								// onSubmit={handleAddScenario}
								onClose={() => setIsDialogOpen(false)}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
