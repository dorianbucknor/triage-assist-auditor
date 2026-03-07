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
import { TriageData as TriageData } from "@/lib/types";
import { Plus } from "lucide-react";
import { ButtonGroup } from "../ui/button-group";
import AddChipInput from "../ui/chip-add-input";
import Chip from "../ui/chip";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import NumberInput from "../ui/number-input";

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

function TriageForm({
	onSubmit,
	onClose,
}: {
	onSubmit?: (data: TriageData) => void;
	onClose?: () => void;
}) {
	const schema = z.object({
		age: z.string(),
		gender: z.string(),
		height: z.string(),
		weight: z.string(),
		chiefComplaint: z.object({
			title: z.string(),
			description: z.string(),
		}),
		modeOfArrival: z.string().nullish(),
		mentalStatus: z.string().nullish(),
		respiratoryStatus: z.string().nullish(),
		medicalHistory: z.array(z.string()),
		currentMedication: z.array(z.string()),
		smoker: z.string(),
		alcohol: z.string(),
		allergies: z.array(z.string()),
		surgicalHistory: z.array(z.string()),
		immunization: z.array(z.string()),
		vitals: z.object({
			temperature: z.string(),
			pulse: z.string(),
			respiratoryRate: z.string(),
			bloodPressure: z
				.string()
				.regex(
					/^\d{1,3}\/\d{1,3}$/,
					"Blood pressure must be in the format 'systolic/diastolic'",
				),
			oxygenSaturation: z.string(),
			glucose: z.string(),
			bhcg: z.string(),
		}),
		urinalysis: z
			.object({
				blood: z.string(),
				nitrites: z.string(),
				protein: z.string(),
				bilirubin: z.string(),
				glucose: z.string(),
				pH: z.string(),
				wbc: z.string(),
				ketones: z.string(),
			})
			.nullish(),
	});

	type Type = z.infer<typeof schema>;

	const { control, setValue, reset } = useForm<Type>({
		resolver: zodResolver(schema),
		defaultValues: initialFormData,
	});

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				// handleSubmit(onFormSubmit)();
			}}
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
						<Controller
							control={control}
							name="age"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="age">Age</FieldLabel>
									<NumberInput
										id="age"
										placeholder="Years"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={1}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="gender"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="gender">
										Gender
									</FieldLabel>
									<Select
										value={field.value}
										onValueChange={field.onChange}
										data-invalid={fieldState.invalid}
									>
										<SelectTrigger id="gender">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">
												Male
											</SelectItem>
											<SelectItem value="female">
												Female
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="height"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="height">
										Height
									</FieldLabel>
									<NumberInput
										id="height"
										placeholder="cm"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={1}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="weight"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="weight">
										Weight
									</FieldLabel>
									<NumberInput
										id="weight"
										placeholder="kg"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={1}
									/>
								</Field>
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Chief Complaint Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Chief Complaint</h2>
				</CardHeader>
				<CardContent className="space-y-4">
					<Controller
						control={control}
						name="chiefComplaint.title"
						render={({ field, fieldState }) => (
							<Field>
								<Input
									type="text"
									placeholder="General description..."
									data-invalid={fieldState.invalid}
									{...field}
								/>
							</Field>
						)}
					/>
					<Controller
						control={control}
						name="chiefComplaint.description"
						render={({ field, fieldState }) => (
							<Field>
								<Textarea
									id="complaint"
									placeholder="Detailed description of the patient's complaint..."
									rows={6}
									data-invalid={fieldState.invalid}
									onKeyDown={(e) => {
										if (e.key === "Enter") {
											e.stopPropagation();
										}
									}}
									{...field}
								/>
							</Field>
						)}
					/>
				</CardContent>
			</Card>

			{/* Presentation Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Presentation</h2>
				</CardHeader>
				<CardContent className="space-y-6">
					<Controller
						control={control}
						name="modeOfArrival"
						render={({ field, fieldState }) => (
							<FieldSet>
								<FieldLegend className="text-muted-foreground">
									Mode of Arrival
								</FieldLegend>
								<RadioGroup
									data-invalid={fieldState.invalid}
									{...field}
									onValueChange={(value) =>
										setValue("modeOfArrival", value)
									}
								>
									<FieldGroup>
										{[
											"Ambulated",
											"Wheelchair",
											"Stretcher",
											"Carried",
										].map((mode) => (
											<Field
												key={mode}
												orientation="horizontal"
											>
												<RadioGroupItem
													value={mode}
													id={`arrival-${mode}`}
												/>
												<FieldLabel
													htmlFor={`arrival-${mode}`}
												>
													{mode}
												</FieldLabel>
											</Field>
										))}
									</FieldGroup>
								</RadioGroup>
							</FieldSet>
						)}
					/>
					<Controller
						control={control}
						name="mentalStatus"
						render={({ field, fieldState }) => (
							<FieldSet>
								<FieldLegend className="text-muted-foreground">
									Mental Status
								</FieldLegend>
								<RadioGroup
									onValueChange={(value) =>
										setValue("mentalStatus", value)
									}
									data-invalid={fieldState.invalid}
									{...field}
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
						)}
					/>

					<Controller
						control={control}
						name="respiratoryStatus"
						render={({ field, fieldState }) => (
							<FieldSet>
								<FieldLegend className="text-muted-foreground">
									Respiratory Status
								</FieldLegend>
								<RadioGroup
									data-invalid={fieldState.invalid}
									onValueChange={(value) =>
										setValue("respiratoryStatus", value)
									}
									{...field}
								>
									<FieldGroup>
										{[
											"Normal",
											"Laboured",
											"Stridor",
											"Wheezing",
											"Negative",
										].map((status) => (
											<Field
												key={status}
												orientation="horizontal"
											>
												<RadioGroupItem
													value={status.toLowerCase()}
													id={`resp-${status}`}
												/>
												<FieldLabel
													htmlFor={`resp-${status}`}
												>
													{status}
												</FieldLabel>
											</Field>
										))}
									</FieldGroup>
								</RadioGroup>
							</FieldSet>
						)}
					/>
				</CardContent>
			</Card>

			{/* Medical History Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Medical History</h2>
				</CardHeader>
				<CardContent className="space-y-6 px-8">
					<Controller
						control={control}
						name="medicalHistory"
						render={({ field, fieldState }) => (
							<FieldSet data-invalid={fieldState.invalid}>
								<FieldGroup className="px-4">
									<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
										{PMH_OPTIONS.map((option, idx) => (
											<Field
												key={option}
												orientation="horizontal"
											>
												<Checkbox
													id={`pmh-${option}`}
													checked={field.value?.includes(
														option,
													)}
													onCheckedChange={(
														checked,
													) => {
														if (checked) {
															setValue(
																"medicalHistory",
																[
																	...(field.value ||
																		[]),
																	option,
																],
															);
														} else {
															setValue(
																"medicalHistory",
																field.value.filter(
																	(_, i) =>
																		i !==
																		idx,
																),
															);
														}
													}}
												/>
												<Label
													htmlFor={`pmh-${option}`}
												>
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
												setValue("medicalHistory", [
													...field.value,
													value,
												]);
											}}
										/>
										<div className="flex flex-row flex-wrap  mt-2">
											{field.value.map((pmh, index) => (
												<Chip
													key={index}
													label={pmh}
													onDelete={() => {
														setValue(
															"medicalHistory",
															field.value.filter(
																(_, i) =>
																	i !== index,
															),
														);
													}}
												/>
											))}
										</div>
									</Field>
								</FieldGroup>
							</FieldSet>
						)}
					/>

					<FieldSet>
						<FieldLegend className="text-muted-foreground">
							Social History
						</FieldLegend>
						<FieldGroup className="space-y-4 px-4">
							<Controller
								control={control}
								name="smoker"
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor="smoker">
											Smoking
										</FieldLabel>
										<Select
											data-invalid={fieldState.invalid}
											{...field}
											onValueChange={(value) =>
												setValue("smoker", value)
											}
										>
											<SelectTrigger id="smoker">
												<SelectValue placeholder="Select..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Yes">
													Yes
												</SelectItem>
												<SelectItem value="No">
													No
												</SelectItem>
												<SelectItem value="Former">
													Former
												</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								)}
							/>
							<Controller
								control={control}
								name="alcohol"
								render={({ field, fieldState }) => (
									<Field>
										<FieldLabel htmlFor="alcohol">
											Alcohol Use
										</FieldLabel>
										<Select
											data-invalid={fieldState.invalid}
											{...field}
											onValueChange={(value) =>
												setValue("alcohol", value)
											}
										>
											<SelectTrigger id="alcohol">
												<SelectValue placeholder="Select..." />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="Yes">
													Yes
												</SelectItem>
												<SelectItem value="No">
													No
												</SelectItem>
												<SelectItem value="Former">
													Former
												</SelectItem>
											</SelectContent>
										</Select>
									</Field>
								)}
							/>
						</FieldGroup>
					</FieldSet>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<Controller
							control={control}
							name="allergies"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="allergies">
										Allergies
									</FieldLabel>

									<AddChipInput
										placeholder="List any allergies..."
										onAdd={(value) => {
											setValue("allergies", [
												...field.value,
												value,
											]);
										}}
										data-invalid={fieldState.invalid}
									/>
									<div className="flex flex-row flex-wrap  mt-2">
										{field.value.map((allergy, index) => (
											<Chip
												key={index}
												label={allergy}
												onDelete={() => {
													setValue(
														"allergies",
														field.value.filter(
															(_, i) =>
																i !== index,
														),
													);
												}}
											/>
										))}
									</div>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="surgicalHistory"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="surgicalHistory">
										Past Surgical History
									</FieldLabel>

									<AddChipInput
										id="surgicalHistory"
										placeholder="List any surgeries..."
										onAdd={(value) => {
											setValue("surgicalHistory", [
												...field.value,
												value,
											]);
										}}
										data-invalid={fieldState.invalid}
									/>
									<div className="flex flex-row flex-wrap  mt-2">
										{field.value.map((value, index) => (
											<Chip
												key={index}
												label={value}
												onDelete={() => {
													setValue(
														"surgicalHistory",
														field.value.filter(
															(_, i) =>
																i !== index,
														),
													);
												}}
											/>
										))}
									</div>
								</Field>
							)}
						/>
					</div>

					<Controller
						control={control}
						name="immunization"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel htmlFor="immunization">
									Immunization eg. (Tetanus - 2019)
								</FieldLabel>

								<AddChipInput
									id="immunization"
									placeholder="List any immunizations..."
									onAdd={(value) => {
										setValue("immunization", [
											...field.value,
											value,
										]);
									}}
									data-invalid={fieldState.invalid}
								/>
								<div className="flex flex-row flex-wrap  mt-2">
									{field.value.map((value, index) => (
										<Chip
											key={index}
											label={value}
											onDelete={() => {
												setValue(
													"immunization",
													field.value.filter(
														(_, i) => i !== index,
													),
												);
											}}
										/>
									))}
								</div>
							</Field>
						)}
					/>
					<Controller
						control={control}
						name="currentMedication"
						render={({ field, fieldState }) => (
							<Field>
								<FieldLabel htmlFor="currentMedication">
									Current Medication
								</FieldLabel>
								<FieldDescription>
									Format: Drug - Occurence (e.g. Acetaminophen
									- twice daily)
								</FieldDescription>
								<AddChipInput
									placeholder="List any current medications..."
									onAdd={(value) => {
										setValue("currentMedication", [
											...field.value,
											value,
										]);
									}}
									data-invalid={fieldState.invalid}
								/>
								<div className="flex flex-row flex-wrap  mt-2">
									{field.value.map((meds, index) => (
										<Chip
											key={index}
											label={meds}
											onDelete={() => {
												setValue(
													"currentMedication",
													field.value.filter(
														(_, i) => i !== index,
													),
												);
											}}
										/>
									))}
								</div>
							</Field>
						)}
					/>
				</CardContent>
			</Card>

			{/* Vital Signs Card */}
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Vital Signs</h2>
				</CardHeader>
				<CardContent className="px-10">
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						<Controller
							control={control}
							name="vitals.temperature"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="temperature">
										Temperature (°C)
									</FieldLabel>
									<NumberInput
										id="temperature"
										placeholder="36.5"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
										max={45}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="vitals.pulse"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="pulse">
										Pulse (bpm)
									</FieldLabel>
									<NumberInput
										id="pulse"
										placeholder="72"
										allowFloats
										data-invalid={fieldState.invalid}
										min={0}
										{...field}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="vitals.respiratoryRate"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="respRate">
										Respiratory Rate (/min)
									</FieldLabel>
									<NumberInput
										id="respRate"
										placeholder="16"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="vitals.bloodPressure"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="bp">
										Blood Pressure (mmHg)
									</FieldLabel>
									<Input
										data-invalid={fieldState.invalid}
										id="bp"
										type="text"
										placeholder="120/80"
										{...field}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="vitals.oxygenSaturation"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="oxygenSaturation">
										O₂ Saturation (%)
									</FieldLabel>
									<NumberInput
										id="oxygenSaturation"
										placeholder="98"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="vitals.glucose"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="glucose">
										Glucose (mg/dL)
									</FieldLabel>
									<NumberInput
										id="glucose"
										placeholder="100"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
									/>
								</Field>
							)}
						/>
						<Controller
							control={control}
							name="vitals.bhcg"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="bhcg">BHCG</FieldLabel>
									<Select
										data-invalid={fieldState.invalid}
										onValueChange={(value) =>
											setValue("vitals.bhcg", value)
										}
										{...field}
									>
										<SelectTrigger id="bhcg">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="negative">
												Negative
											</SelectItem>
											<SelectItem value="positive">
												Positive
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>
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
						<Controller
							control={control}
							name="urinalysis.blood"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="ur_blood">
										Blood
									</FieldLabel>
									<Select
										data-invalid={fieldState.invalid}
										onValueChange={(value) =>
											setValue("urinalysis.blood", value)
										}
										{...field}
									>
										<SelectTrigger id="ur_blood">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="negative">
												Negative
											</SelectItem>
											<SelectItem value="trace">
												Trace
											</SelectItem>
											<SelectItem value="high">
												High
											</SelectItem>
											<SelectItem value="very high">
												Very High
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.nitrites"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="ur_nitrites">
										Nitrites
									</FieldLabel>
									<Select
										data-invalid={fieldState.invalid}
										onValueChange={(value) =>
											setValue(
												"urinalysis.nitrites",
												value,
											)
										}
										{...field}
									>
										<SelectTrigger id="ur_nitrites">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="negative">
												Negative
											</SelectItem>
											<SelectItem value="trace">
												Trace
											</SelectItem>
											<SelectItem value="positive">
												Positive
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.protein"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="ur_protein">
										Protein
									</FieldLabel>
									<Select
										data-invalid={fieldState.invalid}
										onValueChange={(value) =>
											setValue(
												"urinalysis.protein",
												value,
											)
										}
										{...field}
									>
										<SelectTrigger id="ur_protein">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="normal">
												Normal
											</SelectItem>
											<SelectItem value="trace">
												Trace
											</SelectItem>
											<SelectItem value="high">
												High
											</SelectItem>
											<SelectItem value="very high">
												Very High
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.bilirubin"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="ur_bilirubin">
										Bilirubin
									</FieldLabel>
									<Select
										data-invalid={fieldState.invalid}
										onValueChange={(value) =>
											setValue(
												"urinalysis.bilirubin",
												value,
											)
										}
										{...field}
									>
										<SelectTrigger id="ur_bilirubin">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="low">
												Low
											</SelectItem>
											<SelectItem value="normal">
												Normal
											</SelectItem>
											<SelectItem value="high">
												High
											</SelectItem>
											<SelectItem value="very high">
												Very High
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.glucose"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="ur_glucose">
										Glucose
									</FieldLabel>
									<Select
										data-invalid={fieldState.invalid}
										onValueChange={(value) =>
											setValue(
												"urinalysis.glucose",
												value,
											)
										}
										{...field}
									>
										<SelectTrigger id="ur_glucose">
											<SelectValue placeholder="Select..." />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="low">
												Low
											</SelectItem>
											<SelectItem value="normal">
												Normal
											</SelectItem>
											<SelectItem value="high">
												High
											</SelectItem>
											<SelectItem value="very high">
												Very High
											</SelectItem>
										</SelectContent>
									</Select>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.pH"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="urine_ph">
										pH
									</FieldLabel>
									<NumberInput
										id="urine_ph"
										placeholder="7.0"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
									/>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.wbc"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="urine_wbc">
										White Blood Cells /HPF)
									</FieldLabel>
									<NumberInput
										id="urine_wbc"
										placeholder="0-5 /HPF"
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
									/>
								</Field>
							)}
						/>

						<Controller
							control={control}
							name="urinalysis.ketones"
							render={({ field, fieldState }) => (
								<Field>
									<FieldLabel htmlFor="urine_ketones">
										Ketones (mmol/L)
									</FieldLabel>
									<NumberInput
										id="urine_ketones"
										placeholder=""
										allowFloats
										data-invalid={fieldState.invalid}
										{...field}
										min={0}
									/>
								</Field>
							)}
						/>
					</div>
				</CardContent>
			</Card>

			{/* Form Actions */}
			<div className="flex gap-3 justify-end pt-4">
				<Button type="button" variant="outline" onClick={() => reset()}>
					Clear
				</Button>
				<Button type="submit">Save</Button>
			</div>
		</form>
	);
}

export default TriageForm;

const initialFormData = {
	age: "",
	gender: "",
	height: "",
	weight: "",
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
		temperature: "",
		pulse: "",
		respiratoryRate: "",
		bloodPressure: "",
		oxygenSaturation: "",
		glucose: "",
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
