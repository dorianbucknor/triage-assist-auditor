"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Field,
	FieldDescription,
	FieldGroup,
	FieldLabel,
	FieldLegend,
	FieldSet,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TriageData as TriageData } from "@/types/scenario";
import { Plus } from "lucide-react";
import { ButtonGroup } from "./ui/button-group";
import AddChipInput from "./ui/chip-add-input";
import Chip from "./ui/chip";

const PMH_OPTIONS = [
	"Diabetes",
	"Hypertension",
	"Asthma",
	"Sickle Cell",
	"Epilepsy",
	"Rheumatoid Arthritis",
	"Heart Disease",
	"Rheumatic fever",
	"Congestive Cardiac Failure",
	"Kidney Disease",
	"Anaemia",
	"Lupus",
	"Breast Cancer",
	"Prostate Cancer",
];

const initialFormData: TriageData = {
	age: null,
	gender: "",
	height: null,
	weight: null,
	chiefComplaint: { title: "", description: "" },
	modeOfArrival: "",
	mentalStatus: "",
	respiratoryStatus: "",
	medicalHistory: [],
	currentMedication: [],
	smoker: "",
	alcohol: "",
	allergies: [],
	surgicalHistory: [],
	immunization: [],
	vitals: {
		temperature: null,
		pulse: null,
		respiratoryRate: null,
		bloodPressure: "",
		oxygenSaturation: null,
		glucose: null,
		bhcg: "",
	},
	urinalysis: {
		blood: "",
		nitrites: "",
		protein: "",
		bilirubin: "",
		glucose: "",
		pH: "",
		wbc: "",
		ketones: "",
	},
};

function ScenarioForm({
	onSubmit,
	onClose,
}: {
	onSubmit?: (data: TriageData) => void;
	onClose?: () => void;
}) {
	const [formData, setFormData] = useState<TriageData>(initialFormData);

	const handleInputChange = (field: string, value: string) => {
		// Handle nested fields like "vitals.temperature" or "urinalysis.blood"
		if (field.includes(".")) {
			const [section, key] = field.split(".");
			setFormData((prev) => ({
				...prev,
				[section]: {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					...(prev as any)[section],
					[key]: value,
				},
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		}
	};

	const handleListChange = (field: string, value: string) => {
		setFormData((prev) => ({
			...prev,
			[field]: value.split(",").map((v) => v.trim()),
		}));
	};

	const handlePMHChange = (value: string, checked: boolean) => {
		setFormData((prev) => ({
			...prev,
			medicalHistory: checked
				? [...prev.medicalHistory, value]
				: prev.medicalHistory.filter((item) => item !== value),
		}));
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		console.log("Form Data:", formData);
		// Call the onSubmit callback if provided
		if (onSubmit) {
			onSubmit(formData);
		}
		// Reset form and close dialog
		setFormData(initialFormData);
		if (onClose) {
			onClose();
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			onKeyDown={(e) => {
				if (e.key === "Enter") {
					e.preventDefault();
				}
			}}
			className="space-y-6"
		>
			{/* Demographics Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Demographics</h2>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
						<Field>
							<FieldLabel htmlFor="age">Age</FieldLabel>
							<Input
								id="age"
								type="number"
								placeholder="Years"
								value={formData.age ?? ""}
								onChange={(e) =>
									handleInputChange("age", e.target.value)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="gender">Gender</FieldLabel>
							<Select
								value={formData.gender}
								onValueChange={(value) =>
									handleInputChange("gender", value)
								}
							>
								<SelectTrigger id="gender">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Male">Male</SelectItem>
									<SelectItem value="Female">
										Female
									</SelectItem>
								</SelectContent>
							</Select>
						</Field>
						<Field>
							<FieldLabel htmlFor="height">Height</FieldLabel>
							<Input
								id="height"
								type="number"
								placeholder="cm"
								value={formData.height ?? ""}
								onChange={(e) =>
									handleInputChange("height", e.target.value)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="weight">Weight</FieldLabel>
							<Input
								id="weight"
								type="number"
								placeholder="kg"
								value={formData.weight ?? ""}
								onChange={(e) =>
									handleInputChange("weight", e.target.value)
								}
							/>
						</Field>
					</div>
				</CardContent>
			</Card>

			{/* Chief Complaint Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Chief Complaint</h2>
				</CardHeader>
				<CardContent className="space-y-4">
					<Field>
						<Input
							type="text"
							placeholder="General description..."
							onChange={(e) =>
								handleInputChange(
									"chiefComplaint.title",
									e.target.value,
								)
							}
						/>
					</Field>
					<Field>
						<Textarea
							id="complaint"
							placeholder="Detailed description of the patient's complaint..."
							rows={6}
							value={formData.chiefComplaint.description}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.stopPropagation();
								}
							}}
							onChange={(e) =>
								handleInputChange(
									"chiefComplaint",
									e.target.value,
								)
							}
						/>
					</Field>
				</CardContent>
			</Card>

			{/* Presentation Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Presentation</h2>
				</CardHeader>
				<CardContent className="space-y-6">
					<FieldSet>
						<FieldLegend className="text-muted-foreground">
							Mode of Arrival
						</FieldLegend>
						<RadioGroup
							value={formData.modeOfArrival}
							onValueChange={(value) =>
								handleInputChange("modeOfArrival", value)
							}
						>
							<FieldGroup>
								{[
									"Ambulated",
									"Wheelchair",
									"Stretcher",
									"Carried",
								].map((mode) => (
									<Field key={mode} orientation="horizontal">
										<RadioGroupItem
											value={mode}
											id={`arrival-${mode}`}
										/>
										<FieldLabel htmlFor={`arrival-${mode}`}>
											{mode}
										</FieldLabel>
									</Field>
								))}
							</FieldGroup>
						</RadioGroup>
					</FieldSet>

					<FieldSet>
						<FieldLegend className="text-muted-foreground">
							Mental Status
						</FieldLegend>
						<RadioGroup
							value={formData.mentalStatus}
							onValueChange={(value) =>
								handleInputChange("mentalStatus", value)
							}
						>
							<FieldGroup>
								{[
									"Alert",
									"Oriented ×3",
									"Disoriented",
									"Lethargic",
									"Unresponsive",
								].map((status) => (
									<Field
										key={status}
										orientation="horizontal"
									>
										<RadioGroupItem
											value={status.toLowerCase()}
											id={`mental-${status}`}
										/>
										<FieldLabel
											htmlFor={`mental-${status}`}
										>
											{status}
										</FieldLabel>
									</Field>
								))}
							</FieldGroup>
						</RadioGroup>
					</FieldSet>

					<FieldSet>
						<FieldLegend className="text-muted-foreground">
							Respiratory Status
						</FieldLegend>
						<RadioGroup
							value={formData.respiratoryStatus}
							onValueChange={(value) =>
								handleInputChange("respiratoryStatus", value)
							}
						>
							<FieldGroup>
								{[
									"Normal",
									"Laboured",
									"Stridor",
									"Wheezing",
									"None",
								].map((status) => (
									<Field
										key={status}
										orientation="horizontal"
									>
										<RadioGroupItem
											value={status.toLowerCase()}
											id={`resp-${status}`}
										/>
										<FieldLabel htmlFor={`resp-${status}`}>
											{status}
										</FieldLabel>
									</Field>
								))}
							</FieldGroup>
						</RadioGroup>
					</FieldSet>
				</CardContent>
			</Card>

			{/* Medical History Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Medical History</h2>
				</CardHeader>
				<CardContent className="space-y-6 px-8">
					<FieldSet>
						{/* <FieldLegend className="text-muted-foreground">
							Past Medical History (PMH)
						</FieldLegend> */}
						<FieldGroup className="px-4">
							<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{PMH_OPTIONS.map((option) => (
									<Field
										key={option}
										orientation="horizontal"
									>
										<Checkbox
											id={`pmh-${option}`}
											checked={formData.medicalHistory.includes(
												option,
											)}
											onCheckedChange={(checked) =>
												handlePMHChange(
													option,
													!!checked,
												)
											}
										/>
										<Label htmlFor={`pmh-${option}`}>
											{option}
										</Label>
									</Field>
								))}
							</div>
							<Field>
								<FieldLabel htmlFor="other-pmh">
									Other
								</FieldLabel>

								<AddChipInput
									id="other-pmh"
									placeholder="List other PMH..."
									onAdd={(value) => {
										setFormData((prev) => ({
											...prev,
											medicalHistory: [
												...prev.medicalHistory,
												value,
											],
										}));
									}}
								/>
								<div className="flex flex-row flex-wrap  mt-2">
									{formData.medicalHistory.map(
										(allergy, index) => (
											<Chip
												key={index}
												label={allergy}
												onDelete={() => {
													setFormData((prev) => ({
														...prev,
														medicalHistory:
															prev.medicalHistory.filter(
																(_, i) =>
																	i !== index,
															),
													}));
												}}
											/>
										),
									)}
								</div>
							</Field>
						</FieldGroup>
					</FieldSet>

					<FieldSet>
						<FieldLegend className="text-muted-foreground">
							Social History
						</FieldLegend>
						<FieldGroup className="space-y-4 px-4">
							<Field>
								<FieldLabel htmlFor="smoker">
									Smoking
								</FieldLabel>
								<Select
									value={formData.smoker ?? ""}
									onValueChange={(value) =>
										handleInputChange("smoker", value)
									}
								>
									<SelectTrigger id="smoker">
										<SelectValue placeholder="Select..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Yes">Yes</SelectItem>
										<SelectItem value="No">No</SelectItem>
										<SelectItem value="Former">
											Former
										</SelectItem>
									</SelectContent>
								</Select>
							</Field>
							<Field>
								<FieldLabel htmlFor="alcohol">
									Alcohol
								</FieldLabel>
								<Select
									value={formData.alcohol ?? ""}
									onValueChange={(value) =>
										handleInputChange("alcohol", value)
									}
								>
									<SelectTrigger id="alcohol">
										<SelectValue placeholder="Select..." />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="Yes">Yes</SelectItem>
										<SelectItem value="No">No</SelectItem>
										<SelectItem value="Former">
											Former
										</SelectItem>
									</SelectContent>
								</Select>
							</Field>
						</FieldGroup>
					</FieldSet>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Field>
							<FieldLabel htmlFor="allergies">
								Allergies
							</FieldLabel>

							<AddChipInput
								placeholder="List any allergies..."
								onAdd={(value) => {
									setFormData((prev) => ({
										...prev,
										allergies: [...prev.allergies, value],
									}));
								}}
							/>
							<div className="flex flex-row flex-wrap  mt-2">
								{formData.allergies.map((allergy, index) => (
									<Chip
										key={index}
										label={allergy}
										onDelete={() => {
											setFormData((prev) => ({
												...prev,
												allergies:
													prev.allergies.filter(
														(_, i) => i !== index,
													),
											}));
										}}
									/>
								))}
							</div>
						</Field>
						<Field>
							<FieldLabel htmlFor="psh">
								Past Surgical History
							</FieldLabel>

							<AddChipInput
								id="psh"
								placeholder="List any surgeries..."
								onAdd={(value) => {
									setFormData((prev) => ({
										...prev,
										surgicalHistory: [
											...prev.surgicalHistory,
											value,
										],
									}));
								}}
							/>
							<div className="flex flex-row flex-wrap  mt-2">
								{formData.surgicalHistory.map(
									(value, index) => (
										<Chip
											key={index}
											label={value}
											onDelete={() => {
												setFormData((prev) => ({
													...prev,
													surgicalHistory:
														prev.surgicalHistory.filter(
															(_, i) =>
																i !== index,
														),
												}));
											}}
										/>
									),
								)}
							</div>
						</Field>
					</div>

					<Field>
						<FieldLabel htmlFor="immunization">
							Immunization Status
						</FieldLabel>
						<Input
							id="immunization"
							placeholder="e.g., Up to date / Tetanus 2019"
							value={formData.immunization}
							onChange={(e) =>
								handleInputChange(
									"immunization",
									e.target.value,
								)
							}
						/>
					</Field>
					<Field>
						<FieldLabel htmlFor="currentMedication">
							Current Medication
						</FieldLabel>
						<FieldDescription>
							Format: Drug - Occurence (e.g. Acetaminophen - twice
							daily)
						</FieldDescription>
						<AddChipInput
							placeholder="List any current medications..."
							onAdd={(value) => {
								setFormData((prev) => ({
									...prev,
									currentMedication: [
										...prev.currentMedication,
										value,
									],
								}));
							}}
						/>
						<div className="flex flex-row flex-wrap  mt-2">
							{formData.currentMedication.map((meds, index) => (
								<Chip
									key={index}
									label={meds}
									onDelete={() => {
										setFormData((prev) => ({
											...prev,
											currentMedication:
												prev.currentMedication.filter(
													(_, i) => i !== index,
												),
										}));
									}}
								/>
							))}
						</div>
					</Field>
				</CardContent>
			</Card>

			{/* Vital Signs Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Vital Signs</h2>
				</CardHeader>
				<CardContent className="px-10">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Field>
							<FieldLabel htmlFor="temp">
								Temperature (°C)
							</FieldLabel>
							<Input
								id="temp"
								type="number"
								placeholder="36.5"
								step="0.1"
								value={formData.vitals.temperature ?? ""}
								onChange={(e) =>
									handleInputChange(
										"vitals.temperature",
										e.target.value,
									)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="pulse">Pulse (bpm)</FieldLabel>
							<Input
								id="pulse"
								type="number"
								placeholder="72"
								value={formData.vitals.pulse ?? ""}
								onChange={(e) =>
									handleInputChange(
										"vitals.pulse",
										e.target.value,
									)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="respRate">
								Respiratory Rate (/min)
							</FieldLabel>
							<Input
								id="respRate"
								type="number"
								placeholder="16"
								value={formData.vitals.respiratoryRate ?? ""}
								onChange={(e) =>
									handleInputChange(
										"vitals.respiratoryRate",
										e.target.value,
									)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="bp">
								Blood Pressure (mmHg)
							</FieldLabel>
							<Input
								id="bp"
								type="number"
								placeholder="120/80"
								value={formData.vitals.bloodPressure}
								onChange={(e) =>
									handleInputChange(
										"vitals.bloodPressure",
										e.target.value,
									)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="oxygen">
								O₂ Saturation (%)
							</FieldLabel>
							<Input
								id="oxygen"
								type="number"
								placeholder="98"
								value={formData.vitals.oxygenSaturation ?? ""}
								onChange={(e) =>
									handleInputChange(
										"vitals.oxygenSaturation",
										e.target.value,
									)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="glucose">
								Glucose (mg/dL)
							</FieldLabel>
							<Input
								id="glucose"
								type="number"
								placeholder="100"
								value={formData.vitals.glucose ?? ""}
								onChange={(e) =>
									handleInputChange(
										"vitals.glucose",
										e.target.value,
									)
								}
							/>
						</Field>
						<Field>
							<FieldLabel htmlFor="bhcg">BHCG</FieldLabel>
							<Input
								id="bhcg"
								type="text"
								placeholder="± / value"
								value={formData.vitals.bhcg}
								onChange={(e) =>
									handleInputChange(
										"vitals.bhcg",
										e.target.value,
									)
								}
							/>
						</Field>
					</div>
				</CardContent>
			</Card>

			{/* Urinalysis Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Urinalysis</h2>
				</CardHeader>
				<CardContent className="px-10">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Field>
							<FieldLabel htmlFor="ur_blood">Blood</FieldLabel>
							<Select
								value={formData.urinalysis?.blood ?? ""}
								onValueChange={(value) =>
									handleInputChange("urinalysis.blood", value)
								}
							>
								<SelectTrigger id="ur_blood">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Negative">
										Negative
									</SelectItem>
									<SelectItem value="Trace">Trace</SelectItem>
									<SelectItem value="+">+</SelectItem>
									<SelectItem value="++">++</SelectItem>
									<SelectItem value="+++">+++</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="ur_nitrites">
								Nitrites
							</FieldLabel>
							<Select
								value={formData.urinalysis?.nitrites ?? ""}
								onValueChange={(value) =>
									handleInputChange(
										"urinalysis.nitrites",
										value,
									)
								}
							>
								<SelectTrigger id="ur_nitrites">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Negative">
										Negative
									</SelectItem>
									<SelectItem value="Positive">
										Positive
									</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="ur_protein">
								Protein
							</FieldLabel>
							<Select
								value={formData.urinalysis?.protein ?? ""}
								onValueChange={(value) =>
									handleInputChange(
										"urinalysis.protein",
										value,
									)
								}
							>
								<SelectTrigger id="ur_protein">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Negative">
										Negative
									</SelectItem>
									<SelectItem value="Trace">Trace</SelectItem>
									<SelectItem value="+">+</SelectItem>
									<SelectItem value="++">++</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="urine_bilirubin">
								Bilirubin
							</FieldLabel>
							<Select
								value={formData.urinalysis?.bilirubin ?? ""}
								onValueChange={(value) =>
									handleInputChange(
										"urinalysis.bilirubin",
										value,
									)
								}
							>
								<SelectTrigger id="urine_bilirubin">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Negative">
										Negative
									</SelectItem>
									<SelectItem value="Trace">Trace</SelectItem>
									<SelectItem value="Positive">
										Positive
									</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="urine_glucose">
								Glucose
							</FieldLabel>
							<Select
								value={formData.urinalysis?.glucose ?? ""}
								onValueChange={(value) =>
									handleInputChange(
										"urinalysis.glucose",
										value,
									)
								}
							>
								<SelectTrigger id="urine_glucose">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="Negative">
										Negative
									</SelectItem>
									<SelectItem value="Trace">Trace</SelectItem>
									<SelectItem value="+">+</SelectItem>
									<SelectItem value="++">++</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="urine_ph">pH</FieldLabel>
							<Select
								value={formData.urinalysis?.pH ?? ""}
								onValueChange={(value) =>
									handleInputChange("urinalysis.pH", value)
								}
							>
								<SelectTrigger id="urine_ph">
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="5.0">5.0</SelectItem>
									<SelectItem value="6.0">6.0</SelectItem>
									<SelectItem value="6.5">6.5</SelectItem>
									<SelectItem value="7.0">7.0</SelectItem>
									<SelectItem value="7.5">7.5</SelectItem>
									<SelectItem value="8.0">8.0</SelectItem>
								</SelectContent>
							</Select>
						</Field>

						<Field>
							<FieldLabel htmlFor="urine_wbc">
								White Blood Cells
							</FieldLabel>
							<Input
								id="urine_wbc"
								type="text"
								placeholder="e.g., 0-5 /HPF"
								value={formData.urinalysis?.wbc ?? ""}
								onChange={(e) =>
									handleInputChange(
										"urinalysis.wbc",
										e.target.value,
									)
								}
							/>
						</Field>

						<Field>
							<FieldLabel htmlFor="ur_ket">Ketones</FieldLabel>
							<Input
								id="ur_ket"
								type="text"
								placeholder="±"
								value={formData.urinalysis?.ketones ?? ""}
								onChange={(e) =>
									handleInputChange(
										"urinalysis.ketones",
										e.target.value,
									)
								}
							/>
						</Field>
					</div>
				</CardContent>
			</Card>

			{/* Form Actions */}
			<div className="flex gap-3 justify-end pt-4">
				<Button
					type="button"
					variant="outline"
					onClick={() => setFormData(initialFormData)}
				>
					Clear
				</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	);
}

export default ScenarioForm;
