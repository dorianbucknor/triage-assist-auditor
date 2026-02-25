import { ClinicalGrading } from "@/lib/types";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useState } from "react";

export default function GradingSection({
	onGrade,
}: {
	onGrade: (grading: ClinicalGrading) => void;
}) {
	const [grading, setGrading] = useState<ClinicalGrading>({
		triageLevelScale: 5,
		diagnosisScale: 5,
		treatmentScale: 5,
	});

	const handleSubmit = () => {
		onGrade(grading);
	};

	return (
		<div className="space-y-4">
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
									key={scale}
									variant={
										grading.triageLevelScale === scale
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() =>
										setGrading({
											...grading,
											triageLevelScale: scale,
										})
									}
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

					{grading.triageLevelScale <= 3 && (
						<div className="space-y-2 pt-4 border-t">
							<Label htmlFor="correct-triage">
								Correct Triage Level
							</Label>
							<Input
								id="correct-triage"
								placeholder="e.g., ESI-1"
								value={grading.correctTriageLevel || ""}
								onChange={(e) =>
									setGrading({
										...grading,
										correctTriageLevel: e.target.value,
									})
								}
							/>
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
									variant={
										grading.diagnosisScale === scale
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() =>
										setGrading({
											...grading,
											diagnosisScale: scale,
										})
									}
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

					{grading.diagnosisScale <= 3 && (
						<div className="space-y-2 pt-4 border-t">
							<Label htmlFor="correct-diagnosis">
								Correct Diagnosis
							</Label>
							<Input
								id="correct-diagnosis"
								placeholder="Enter the correct diagnosis"
								value={grading.correctDiagnosis || ""}
								onChange={(e) =>
									setGrading({
										...grading,
										correctDiagnosis: e.target.value,
									})
								}
							/>
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
									variant={
										grading.treatmentScale === scale
											? "default"
											: "outline"
									}
									size="sm"
									onClick={() =>
										setGrading({
											...grading,
											treatmentScale: scale,
										})
									}
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

					{grading.treatmentScale <= 3 && (
						<div className="space-y-2 pt-4 border-t">
							<Label htmlFor="correct-treatment">
								Correct Treatment/Recommendations
							</Label>
							<Textarea
								id="correct-treatment"
								placeholder="Enter the correct treatment recommendations"
								value={grading.correctTreatment || ""}
								onChange={(e) =>
									setGrading({
										...grading,
										correctTreatment: e.target.value,
									})
								}
							/>
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
						value={grading.notes || ""}
						onChange={(e) =>
							setGrading({
								...grading,
								notes: e.target.value,
							})
						}
					/>
				</CardContent>
			</Card>

			<Button onClick={handleSubmit} className="w-full">
				Submit Grading
			</Button>
		</div>
	);
}
