"use client";

import React from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import TriageForm from "@/components/app/triage-form";
import { TriageData } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TriageFormDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	onScenarioCreated?: (scenarioId: string) => void;
}

export default function TriageFormDialog({
	open,
	onOpenChange,
	onScenarioCreated,
}: TriageFormDialogProps) {
	const router = useRouter();

	const handleAddScenario = async (data: TriageData): Promise<boolean> => {
		try {
			const response = await fetch("/api/scenarios", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "ADD_SCENARIO",
					data: data,
				}),
			});

			if (!response.ok) {
				toast.error("Failed to add scenario");
				return false;
			}

			const result = await response.json();

			if (result?.error) {
				toast.error("Failed to add scenario! " + result.error);
				return false;
			}

			const scenarioId = result?.data?.id;

			toast.success("Scenario added successfully!");

			// Close the dialog
			onOpenChange(false);

			// Call callback if provided
			if (onScenarioCreated) {
				onScenarioCreated(scenarioId);
			}

			// Navigate to the triage page with the scenario ID
			router.push(`/app/triage?scenarioId=${scenarioId}`);

			return true;
		} catch (error) {
			toast.error("Failed to add scenario");
			console.error("Error adding scenario:", error);
			return false;
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Add New Triage Entry</DialogTitle>
					<DialogDescription>
						Fill in the patient details and clinical information to
						create a new triage entry for AI evaluation.
					</DialogDescription>
				</DialogHeader>
				<div className="py-4">
					<TriageForm
						onSubmit={handleAddScenario}
						onClose={() => onOpenChange(false)}
					/>
				</div>
			</DialogContent>
		</Dialog>
	);
}
