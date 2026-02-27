import { ClinicalGrading } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { FieldError } from "../ui/field";
import { cn } from "@/lib/utils";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

const MIN_SCALE = 3;

export default function GradingSection({
	onGrade,
	initialGrading,
}: {
	onGrade?: (grading: ClinicalGrading) => Promise<boolean>;
	initialGrading?: ClinicalGrading;
}) {
	const [grading, setGrading] = useState<ClinicalGrading>({
		triageGrading: 5,
		diagnosisGrading: 5,
		treatmentGrading: 5,
		diagnosisFeedback: "",
		treatmentFeedback: "",
		additionalNotes: "",
		triageFeedback: "",
		exclude: false,
		public: true,
		score: 0,
		createdAt: new Date(),
		id: "",
		scenarioId: "",
		authorId: "",
		updatedAt: new Date(),
		...initialGrading,
	});

	const [errors, setErrors] = useState<Record<string, string | null>>({
		triage: null,
		diagnosis: null,
		treatment: null,
	});

	const handleSubmit = async () => {
		if (
			errors.triage ||
			errors.diagnosis ||
			errors.treatment ||
			errors.notes ||
			(grading.triageGrading <= MIN_SCALE && !grading.triageFeedback) ||
			(grading.diagnosisGrading <= MIN_SCALE &&
				(!grading.diagnosisFeedback ||
					grading.diagnosisFeedback.trim() === "")) ||
			(grading.treatmentGrading <= MIN_SCALE &&
				(!grading.treatmentFeedback ||
					grading.treatmentFeedback.trim() === ""))
		) {
			toast.error(
				"Please fix validation errors before submitting grading!",
			);
			return;
		}

		if (onGrade) {
			const gradingToSubmit = {
				...grading,
				score:
					Math.round(
						((grading.triageGrading +
							grading.diagnosisGrading +
							grading.treatmentGrading) /
							3) *
							100,
					) / 100,
			};
			const result = await onGrade(gradingToSubmit);

			//reset
			if (result) {
				setGrading({
					triageGrading: 5,
					diagnosisGrading: 5,
					treatmentGrading: 5,
					diagnosisFeedback: "",
					treatmentFeedback: "",
					additionalNotes: "",
					triageFeedback: "",
					extras: {},
					exclude: false,
					public: false,
					score: 0,
					authorId: "",
					scenarioId: "",
					createdAt: new Date(Date.now()),
					updatedAt: new Date(Date.now()),
					id: "",
					...initialGrading,
				});
			}
		}
	};

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				await handleSubmit();
			}}
			className="space-y-4"
		>
			<h2 className="font-semibold text-lg">Clinical Grading</h2>
			{/* Triage Level Grading */}
			<Card>
				<CardHeader>
					<h3 className="font-medium">Triage Level Assessment</h3>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<Label className="text-base">AI assigned: ESI-2</Label>
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((scale) => (
								<Button
									type="button"
									key={scale}
									variant={
										grading.triageGrading === scale
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() => {
										setGrading({
											...grading,
											triageGrading: scale,
										});
										if (scale > MIN_SCALE) {
											setErrors({
												...errors,
												triage: null,
											});
										}
									}}
									className="flex-1"
								>
									{scale}
								</Button>
							))}
						</div>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Strongly Disagree</span>
							<span>Strongly Agree</span>
						</div>
					</div>

					{grading.triageGrading <= MIN_SCALE && (
						<div className="space-y-2 pt-4 border-t">
							<Label htmlFor="correct-triage">
								Correct Triage Level
							</Label>
							<Select
								required={grading.triageGrading <= MIN_SCALE}
								aria-invalid={errors.triage ? "true" : "false"}
								value={grading.triageFeedback || ""}
								onValueChange={(value) => {
									setGrading({
										...grading,
										triageFeedback: value,
									});
								}}
								onOpenChange={(open) => {
									if (
										!grading.triageFeedback ||
										grading.triageFeedback === ""
									) {
										setErrors({
											...errors,
											triage: "Please select correct triage level",
										});
									} else {
										setErrors({
											...errors,
											triage: null,
										});
									}
								}}
								data-invalid={errors.triage ? "true" : "false"}
							>
								<SelectTrigger
									id="correct-triage-trigger"
									className={cn(
										"w-full",
										errors.triage &&
											"border-destructive focus-visible:ring-destructive",
									)}
								>
									<SelectValue placeholder="Select..." />
								</SelectTrigger>
								<SelectContent
									className={cn(
										"w-full",
										errors.triage &&
											"border-destructive focus-visible:ring-destructive",
									)}
								>
									<SelectItem value="ESI-1">ESI-1</SelectItem>
									<SelectItem value="ESI-2">ESI-2</SelectItem>
									<SelectItem value="ESI-3">ESI-3</SelectItem>
									<SelectItem value="ESI-4">ESI-4</SelectItem>
									<SelectItem value="ESI-5">ESI-5</SelectItem>
								</SelectContent>
							</Select>
							<FieldError>{errors.triage}</FieldError>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Diagnosis Grading */}
			<Card>
				<CardHeader>
					<h3 className="font-medium">Diagnosis Assessment</h3>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<Label className="text-base">
							AI assigned: Acute Coronary Syndrome (ACS)
						</Label>
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((scale) => (
								<Button
									key={scale}
									type="button"
									variant={
										grading.diagnosisGrading === scale
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() => {
										setGrading({
											...grading,
											diagnosisGrading: scale,
										});
										if (scale > MIN_SCALE) {
											setErrors({
												...errors,
												diagnosis: null,
											});
										}
									}}
									className="flex-1"
								>
									{scale}
								</Button>
							))}
						</div>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Strongly Disagree</span>
							<span>Strongly Agree</span>
						</div>
					</div>

					{grading.diagnosisGrading <= MIN_SCALE && (
						<div className="space-y-2 pt-4 border-t">
							<Label htmlFor="correct-diagnosis">
								Correct Diagnosis
							</Label>
							<Textarea
								id="correct-diagnosis"
								placeholder="Enter the correct diagnosis"
								value={grading.diagnosisFeedback || ""}
								required={grading.diagnosisGrading <= MIN_SCALE}
								data-invalid={
									errors.diagnosis ? "true" : "false"
								}
								aria-invalid={
									errors.diagnosis ? "true" : "false"
								}
								className={cn(
									errors.diagnosis &&
										"border-destructive focus-visible:ring-destructive",
								)}
								onChange={(e) => {
									if (e.target.value.length <= 2) {
										setErrors({
											...errors,
											diagnosis:
												"Please provide a more detailed diagnosis",
										});
									} else {
										setErrors({
											...errors,
											diagnosis: null,
										});
									}
									setGrading({
										...grading,
										diagnosisFeedback: e.target.value,
									});
								}}
								onBlur={(e) => {
									if (e.target.value.length <= 2) {
										setErrors({
											...errors,
											diagnosis:
												"Please provide a more detailed diagnosis",
										});
									} else {
										setErrors({
											...errors,
											diagnosis: null,
										});
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										e.stopPropagation();
									}
								}}
							/>
							<FieldError>{errors.diagnosis}</FieldError>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Treatment Grading */}
			<Card>
				<CardHeader>
					<h3 className="font-medium">Treatment Assessment</h3>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="space-y-3">
						<Label className="text-base">
							AI treatment recommendations
						</Label>
						<div className="flex gap-2">
							{[1, 2, 3, 4, 5].map((scale) => (
								<Button
									key={scale}
									type="button"
									variant={
										grading.treatmentGrading === scale
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() => {
										setGrading({
											...grading,
											treatmentGrading: scale,
										});
										if (scale > MIN_SCALE) {
											setErrors({
												...errors,
												treatment: null,
											});
										}
									}}
									className="flex-1"
								>
									{scale}
								</Button>
							))}
						</div>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>Strongly Disagree</span>
							<span>Strongly Agree</span>
						</div>
					</div>

					{grading.treatmentGrading <= MIN_SCALE && (
						<div className="space-y-2 pt-4 border-t">
							<Label htmlFor="correct-treatment">
								Correct Treatment/Recommendations
							</Label>
							<Textarea
								id="correct-treatment"
								placeholder="Enter the correct treatment recommendations"
								value={grading.treatmentFeedback || ""}
								required={grading.treatmentGrading <= MIN_SCALE}
								data-invalid={
									errors.treatment ? "true" : "false"
								}
								onChange={(e) => {
									if (e.target.value.length <= 2) {
										setErrors({
											...errors,
											treatment:
												"Please provide a more detailed treatment recommendation",
										});
									} else {
										setErrors({
											...errors,
											treatment: null,
										});
									}
									setGrading({
										...grading,
										treatmentFeedback: e.target.value,
									});
								}}
								onBlur={(e) => {
									if (e.target.value.length <= 2) {
										setErrors({
											...errors,
											treatment:
												"Please provide a more detailed treatment recommendation",
										});
									} else {
										setErrors({
											...errors,
											treatment: null,
										});
									}
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") {
										e.preventDefault();
										e.stopPropagation();
									}
								}}
							/>
							<FieldError>{errors.treatment}</FieldError>
						</div>
					)}
				</CardContent>
			</Card>

			{/* Additional Notes */}
			<Card>
				<CardHeader>
					<h3 className="font-medium">Additional Notes</h3>
				</CardHeader>
				<CardContent>
					<Textarea
						placeholder="Add any additional clinical notes or observations..."
						value={grading.additionalNotes || ""}
						rows={5}
						onChange={(e) => {
							if (
								e.target.value.trim().length >= 1 &&
								e.target.value.trim().length <= 5
							) {
								setErrors({
									...errors,
									notes: "Please provide a more detailed clinical note",
								});
							} else {
								setErrors({
									...errors,
									notes: null,
								});
							}
							setGrading({
								...grading,
								additionalNotes: e.target.value,
							});
						}}
						onBlur={(e) => {
							if (
								e.target.value.trim().length >= 1 &&
								e.target.value.trim().length <= 5
							) {
								setErrors({
									...errors,
									notes: "Please provide a more detailed clinical note",
								});
							} else {
								setErrors({
									...errors,
									notes: null,
								});
							}
						}}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								e.stopPropagation();
							}
						}}
						data-invalid={errors.notes ? "true" : "false"}
					/>
					<FieldError>{errors.notes}</FieldError>
				</CardContent>
			</Card>

			<Button className="w-full" type="submit">
				Submit Grading
			</Button>
		</form>
	);
}
