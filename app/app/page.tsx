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
import ScenarioForm from "@/components/app/scenario-form";
import type {
	AIResponse,
	ClinicalGrading,
	Scenario,
	TriageData,
} from "@/lib/types";
import ResponseCard from "@/components/app/ai-response-card";
import TreatmentRecommendations from "@/components/app/treatment-reccommendation-card";
import GradingSection from "@/components/app/clician-grading-section";

// Types for our data structure

// Sample data - replace with actual data from your backend
const sampleScenario: Scenario = {
	scenarioId: "PT-001",
	dateEntered: new Date(),
	public: true,
	triageData: {
		age: 45,
		height: 165,
		gender: "Female",
		chiefComplaint: {
			title: "Severe chest pain and shortness of breath",
			description:
				"Patient presenting with acute onset of severe chest pain radiating to left arm, accompanied by dyspnea. Pain started 2 hours ago while patient was at rest.",
		},
		vitals: {
			bloodPressure: "160/95",
			pulse: 102,
			respiratoryRate: 22,
			temperature: 37.1,
			oxygenSaturation: 94,
			glucose: 110,
			bhcg: "Negative",
		},
		medicalHistory: ["Hypertension", "Former smoker (10 pack-years)"],
		weight: undefined,
		modeOfArrival: "",
		mentalStatus: "",
		respiratoryStatus: "",
		currentMedication: [],
		smoker: null,
		alcohol: null,
		allergies: [],
		surgicalHistory: [],
		immunization: [],
		urinalysis: null,
	},
	aiResponse: {
		triageLevel: {
			level: "ESI-2",
			reasoning:
				"High-risk situation indicating need for immediate ECG and continuous monitoring. Patient presents with acute chest pain and dyspnea with tachycardia and hypertension.",
			confidence: 92,
		},
		diagnosis: {
			primary: "Acute Coronary Syndrome (ACS) - Rule out MI",
			reasoning:
				"Classic presentation of ACS with chest pain radiating to left arm, dyspnea, diaphoresis implied by vital sign elevation, and risk factors present.",
			confidence: 85,
		},
		treatment: {
			recommendations: [
				"Immediate 12-lead ECG",
				"Cardiac monitoring",
				"Aspirin 325mg (if not contraindicated)",
				"Oxygen to maintain SpO2 >94%",
				"IV access",
				"Serial troponin levels",
			],
			reasoning:
				"Standard protocol for suspected ACS requiring immediate intervention and diagnostic assessment.",
			confidence: 88,
		},
	},
};

// Helper function to generate mock AI response based on scenario
function generateMockAIResponse(formData: TriageData): AIResponse {
	const triageScores: Record<
		string,
		"ESI-1" | "ESI-2" | "ESI-3" | "ESI-4" | "ESI-5"
	> = {
		alert: "ESI-3",
		disoriented: "ESI-2",
		unresponsive: "ESI-1",
		lethargic: "ESI-2",
		"oriented ×3": "ESI-3",
	};

	const respiratoryFactors: Record<string, number> = {
		normal: 0,
		laboured: 1,
		stridor: 2,
		wheezing: 1,
		"absent resp": 3,
	};

	// Determine triage level based on mental status and respiratory status
	const mentalStatusScore = triageScores[formData.mentalStatus] || "ESI-3";
	const respiratoryScore =
		respiratoryFactors[formData.respiratoryStatus] || 0;

	const finalTriageLevel =
		respiratoryScore >= 2 || formData.mentalStatus === "unresponsive"
			? "ESI-1"
			: mentalStatusScore;

	return {
		triageLevel: {
			level: finalTriageLevel,
			reasoning: `Patient presents with mental status: ${formData.mentalStatus} and respiratory status: ${formData.respiratoryStatus}. Based on chief complaint (${formData.chiefComplaint}) and vital signs, immediate assessment recommended.`,
			confidence: 75 + Math.random() * 20,
		},
		diagnosis: {
			primary:
				formData.chiefComplaint.title.substring(0, 50) +
				(formData.chiefComplaint.title.length > 50 ? "..." : ""),
			reasoning: `Clinical assessment based on patient presentation. Chief complaint indicates potential ${formData.chiefComplaint.title.toLowerCase()}. Further diagnostic workup recommended.`,
			confidence: 70 + Math.random() * 20,
		},
		treatment: {
			recommendations: [
				"Establish IV access",
				"Continuous cardiac monitoring",
				"Pain management as appropriate",
				"Draw baseline labs and cultures if infection suspected",
				"Consider imaging studies based on presentation",
				"Oxygen therapy if SpO2 <94%",
			],
			reasoning:
				"Standard emergency department protocol for acute patient presentation with comprehensive assessment and intervention.",
			confidence: 78 + Math.random() * 15,
		},
	};
}

export default function TriageAssistantPage() {
	const [isSheetOpen, setIsSheetOpen] = useState(false);
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [scenarios, setScenarios] = useState<Scenario[]>([sampleScenario]);
	const [currentScenarioIndex, setCurrentScenarioIndex] = useState(0);

	const currentScenario = scenarios[currentScenarioIndex];

	const handleAddScenario = (formData: TriageData) => {
		// Convert form data to scenario
		const newScenario: Scenario = {
			scenarioId: `SC-${String(scenarios.length + 1).padStart(3, "0")}`,
			dateEntered: new Date(),
			public: true,
			triageData: {
				age: formData?.age || 0,
				gender: formData.gender,
				chiefComplaint: formData.chiefComplaint,
				vitals: {
					bloodPressure: `${formData.vitals.bloodPressure}`,
					pulse: formData.vitals.pulse,
					respiratoryRate: formData.vitals.respiratoryRate || 0,
					temperature: formData.vitals.temperature,
					oxygenSaturation: formData.vitals.oxygenSaturation,
					bhcg: formData.vitals.bhcg,
					glucose: formData.vitals.glucose,
				},
				medicalHistory: formData.medicalHistory,
				height: undefined,
				weight: undefined,
				modeOfArrival: "",
				mentalStatus: "",
				respiratoryStatus: "",
				currentMedication: [],
				smoker: null,
				alcohol: null,
				allergies: [],
				surgicalHistory: [],
				immunization: [],
				urinalysis: null,
			},
			aiResponse: generateMockAIResponse(formData),
		};

		setScenarios([...scenarios, newScenario]);
		setCurrentScenarioIndex(scenarios.length); // Go to the newly added scenario
		setIsDialogOpen(false);
	};

	const handleSkip = () => {
		if (currentScenarioIndex < scenarios.length - 1) {
			setCurrentScenarioIndex(currentScenarioIndex + 1);
		} else {
			setCurrentScenarioIndex(0);
		}
	};

	const handleGradeSubmit = (grading: ClinicalGrading) => {
		console.log("Grading submitted:", grading);
		// Send to backend API
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
											disabled={scenarios.length === 0}
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
							<CardContent className="space-y-4">
								<div className="grid grid-cols-2 gap-4">
									<div>
										<p className="text-sm text-muted-foreground">
											Age
										</p>
										<p className="font-semibold">
											{currentScenario.triageData.age ||
												"Unknown"}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Gender
										</p>
										<p className="font-semibold">
											{currentScenario.triageData.gender}
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Height
										</p>
										<p className="font-semibold">
											{currentScenario.triageData
												.height || "-"}{" "}
											cm
										</p>
									</div>
									<div>
										<p className="text-sm text-muted-foreground">
											Weight
										</p>
										<p className="font-semibold">
											{currentScenario.triageData
												.weight || "-"}{" "}
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
											currentScenario.triageData
												.chiefComplaint.title
										}
									</p>

									<p className="text-sm text-muted-foreground mb-2">
										Details
									</p>
									<p className="text-sm text-foreground">
										{
											currentScenario.triageData
												.chiefComplaint.description
										}
									</p>
								</div>
								<div className="pt-4 border-t">
									<p className="text-sm text-muted-foreground mb-2">
										Medical History Summary
									</p>
									<p className="text-sm text-foreground">
										{currentScenario.triageData.medicalHistory.join(
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
												{
													currentScenario.triageData
														.vitals.bloodPressure
												}
											</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-xs text-muted-foreground">
												HR
											</p>
											<p className="font-semibold">
												{
													currentScenario.triageData
														.vitals.pulse
												}{" "}
												bpm
											</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-xs text-muted-foreground">
												RR
											</p>
											<p className="font-semibold">
												{
													currentScenario.triageData
														.vitals.respiratoryRate
												}
												/min
											</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-xs text-muted-foreground">
												Temp
											</p>
											<p className="font-semibold">
												{
													currentScenario.triageData
														.vitals.temperature
												}
												°C
											</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-xs text-muted-foreground">
												SpO2
											</p>
											<p className="font-semibold">
												{
													currentScenario.triageData
														.vitals.oxygenSaturation
												}
												%
											</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-xs text-muted-foreground">
												Glucose
											</p>
											<p className="font-semibold">
												{
													currentScenario.triageData
														.vitals.temperature
												}
											</p>
										</div>
										<div className="bg-muted p-3 rounded-lg">
											<p className="text-xs text-muted-foreground">
												BHCG
											</p>
											<p className="font-semibold">
												{
													currentScenario.triageData
														.vitals.oxygenSaturation
												}
											</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>

						{/* AI Response Section */}
						<div>
							<h2 className="text-xl font-semibold mb-4">
								AI Assessment
							</h2>

							<ResponseCard
								title="Triage Level"
								level={
									currentScenario.aiResponse.triageLevel.level
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
									currentScenario.aiResponse.diagnosis.primary
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
										.recommendations
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
					</div>

					{/* Right Section - Grading (Hidden on mobile, visible on desktop) */}
					<div className="hidden lg:block">
						<div className="sticky top-6">
							<GradingSection onGrade={handleGradeSubmit} />
						</div>
					</div>
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
						className="max-h-[90vh] overflow-y-auto"
					>
						<SheetHeader className="mb-6">
							<SheetTitle>Clinical Grading</SheetTitle>
						</SheetHeader>
						<GradingSection onGrade={handleGradeSubmit} />
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
							<ScenarioForm
								onSubmit={handleAddScenario}
								onClose={() => setIsDialogOpen(false)}
							/>
						</div>
					</DialogContent>
				</Dialog>
			</div>
		</div>
	);
}
