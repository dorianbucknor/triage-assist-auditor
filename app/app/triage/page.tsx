"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSearchParams, redirect } from "next/navigation";
import { useAtom } from "jotai";
import { store, userAtom } from "@/providers/jotai/jotai";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, AlertCircle, CheckCircle } from "lucide-react";
import type { Scenario, APIResponse, ClinicalGrading } from "@/lib/types";
import ResponseCard from "@/components/app/ai-response-card";
import TreatmentRecommendations from "@/components/app/treatment-reccommendation-card";
import GradingSection, {
	GradingSectionRef,
} from "@/components/app/clician-grading-section";
import { toast } from "sonner";
import { getUserRole } from "@/lib/utils";
import { useRouter } from "next/navigation";

async function getScenarioById(scenarioId: string): Promise<Scenario | null> {
	try {
		const res = await fetch(
			`/api/scenarios?action=GET_SCENARIO&scenarioId=${scenarioId}`,
			{
				method: "GET",
				headers: {
					"Content-Type": "application/json",
				},
			},
		);

		if (!res.ok) {
			toast.error("Failed to fetch scenario: " + res.statusText);
			return null;
		}

		const result = (await res.json()) as APIResponse<Scenario>;

		if (result.error) {
			toast.error("Failed to fetch scenario: " + result.error);
			return null;
		}

		return result.data;
	} catch (error) {
		toast.error("Failed to fetch scenario");
		console.error("Error fetching scenario:", error);
		return null;
	}
}

export default function TriageResultsPage() {
	const searchParams = useSearchParams();
	const router = useRouter();
	const [auth] = useAtom(userAtom, { store: store });
	const gradingSectionRef = useRef<GradingSectionRef>(null);
	const [scenario, setScenario] = useState<Scenario | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const scenarioId = searchParams.get("scenarioId");

	if (!auth || !auth?.loggedIn) {
		redirect("/auth/sign-in");
	}

	useEffect(() => {
		const loadScenario = async () => {
			if (!scenarioId) {
				toast.error("No scenario ID provided");
				router.push("/app");
				return;
			}

			setIsLoading(true);
			const data = await getScenarioById(scenarioId);
			if (data) {
				setScenario(data);
			} else {
				router.push("/app");
			}
			setIsLoading(false);
		};

		loadScenario();
	}, [scenarioId, router]);

	const handleGradeSubmit = async (
		grading: ClinicalGrading,
	): Promise<boolean> => {
		try {
			const response = await fetch("/api/scenarios", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "ADD_GRADING",
					data: {
						...grading,
						scenarioId: scenario?.id,
						authorId: auth?.data?.id,
					},
				}),
			});

			if (!response.ok) {
				toast.error("Failed to submit grading");
				return false;
			}

			const result = await response.json();

			if (result?.error) {
				toast.error("Failed to submit grading! " + result.error);
				return false;
			}

			toast.success("Grading submitted successfully!");
			return true;
		} catch (error) {
			toast.error("Failed to submit grading");
			console.error("Error submitting grading:", error);
			return false;
		}
	};

	const userRole = auth.session ? getUserRole(auth.session) : "user";
	const canGrade = userRole !== "user";

	if (isLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-muted-foreground">
						Loading scenario...
					</p>
				</div>
			</div>
		);
	}

	if (!scenario) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-center">
					<p className="text-lg text-muted-foreground mb-4">
						Scenario not found
					</p>
					<Button onClick={() => router.push("/app")}>
						Return to Dashboard
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen ">
			<div className="container mx-auto px-4 py-6">
				{/* Header */}
				<div className="mb-6">
					<Button
						variant="ghost"
						onClick={() => router.push("/app")}
						className="mb-4"
					>
						<ChevronLeft className="w-4 h-4 mr-2" />
						Back to Dashboard
					</Button>
					<h1 className="text-3xl font-bold">
						Triage Evaluation Results
					</h1>
					<p className="text-muted-foreground mt-1">
						Created on{" "}
						{new Date(scenario.createdAt || "").toLocaleString()}
					</p>
				</div>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
					{/* Left Column - Scenario Details (2/3) */}
					<div className="lg:col-span-2 space-y-6">
						{/* Patient Demographics */}
						<Card>
							<CardHeader>
								<h2 className="text-xl font-semibold">
									Patient Information
								</h2>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Age
										</p>
										<p className="font-semibold">
											{scenario.content?.age || "Unknown"}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Gender
										</p>
										<p className="font-semibold">
											{scenario.content?.gender
												?.split("")[0]
												.toUpperCase() || "-"}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Height
										</p>
										<p className="font-semibold">
											{scenario.content?.height || "-"} cm
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Weight
										</p>
										<p className="font-semibold">
											{scenario.content?.weight || "-"} kg
										</p>
									</div>
								</div>

								{/* Chief Complaint */}
								<div className="pt-4 border-t">
									<p className="text-sm text-muted-foreground mb-2">
										Chief Complaint
									</p>
									<p className="font-semibold text-lg mb-4">
										{
											scenario.content?.chiefComplaint
												?.title
										}
									</p>

									<p className="text-sm text-muted-foreground mb-2">
										Details
									</p>
									<p className="text-sm text-foreground">
										{
											scenario.content?.chiefComplaint
												?.description
										}
									</p>
								</div>

								{/* Medical History */}
								{scenario.content?.medicalHistorySummary && (
									<div className="pt-4 border-t">
										<p className="text-sm text-muted-foreground mb-2">
											Medical History Summary
										</p>
										<p className="text-sm text-foreground">
											{
												scenario.content
													.medicalHistorySummary
											}
										</p>
									</div>
								)}
							</CardContent>
						</Card>

						{/* AI Response Cards */}
						{scenario.aiResponse && (
							<>
								{scenario.aiResponse?.triage && (
									<ResponseCard
										title="Triage Level"
										level={
											"ESI - " +
											scenario.aiResponse.triage?.level
										}
										reasoning={
											scenario.aiResponse.triage
												?.reason || "No reason provided"
										}
										confidence={
											scenario.aiResponse.triage
												?.confidence || 0
										}
										icon={AlertCircle}
									/>
								)}
								{scenario.aiResponse?.diagnosis && (
									<ResponseCard
										title="Diagnosis"
										level={
											scenario.aiResponse.diagnosis
												.primary
										}
										reasoning={
											scenario.aiResponse.diagnosis.reason
										}
										confidence={
											scenario.aiResponse.diagnosis
												.confidence
										}
										icon={CheckCircle}
									/>
								)}
								{scenario.aiResponse?.treatment && (
									<TreatmentRecommendations
										recommendations={
											scenario.aiResponse.treatment
												.recommendations || []
										}
										reasoning={
											scenario.aiResponse.treatment
												.reason || ""
										}
										confidence={
											scenario.aiResponse.treatment
												.confidence || 0
										}
									/>
								)}
							</>
						)}
					</div>

					{/* Right Column - Grading Section (1/3) */}
					{canGrade && (
						<div className="lg:col-span-1">
							<div className="sticky top-6">
								<GradingSection
									ref={gradingSectionRef}
									onGrade={handleGradeSubmit}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
