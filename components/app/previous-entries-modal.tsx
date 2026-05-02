"use client";

import React, { useState, useEffect } from "react";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Scenario, APIResponse } from "@/lib/types";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface PreviousEntriesModalProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

export default function PreviousEntriesModal({
	open,
	onOpenChange,
}: PreviousEntriesModalProps) {
	const router = useRouter();
	const [scenarios, setScenarios] = useState<Scenario[]>([]);
	const [filteredScenarios, setFilteredScenarios] = useState<Scenario[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [searchQuery, setSearchQuery] = useState("");

	const fetchUserScenarios = async () => {
		setIsLoading(true);
		try {
			const res = await fetch(
				"/api/scenarios?action=GET_USER_SCENARIOS&amount=20&page=0",
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
					},
				},
			);

			if (!res.ok) {
				toast.error(
					"Failed to fetch previous entries: " + res.statusText,
				);
				return;
			}

			const result = (await res.json()) as APIResponse<Scenario[]>;

			if (result.error) {
				toast.error(
					"Failed to fetch previous entries: " + result.error,
				);
				return;
			}

			setScenarios(result.data || []);
			setFilteredScenarios(result.data || []);
		} catch (error) {
			toast.error("Failed to fetch previous entries");
			console.error("Error fetching scenarios:", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleViewScenario = (scenarioId: string) => {
		onOpenChange(false);
		router.push(`/app/triage?scenarioId=${scenarioId}`);
	};

	const getTriageLevel = (scenario: Scenario): string | null => {
		return scenario.aiResponse?.triage?.level?.toString() || null;
	};

	const getTriageLevelColor = (level: string | null): string => {
		if (!level) return "bg-gray-200";
		const levelNum = parseInt(level);
		if (levelNum <= 2) return "bg-red-400 text-black dark:text-black";
		if (levelNum === 3) return "bg-yellow-200 text-black dark:text-black";
		if (levelNum >= 4) return "bg-green-200 text-black dark:text-black";
		return "bg-gray-200";
	};

	const formatDate = (date: Date | string | null): string => {
		if (!date) return "Unknown";
		const d = new Date(date);
		return d.toLocaleDateString() + " " + d.toLocaleTimeString();
	};

	useEffect(() => {
		if (open) {
			fetchUserScenarios();
		}
	}, [open]);

	useEffect(() => {
		// Filter scenarios based on search query
		const filtered = scenarios.filter((scenario) => {
			const chiefComplaint =
				scenario.content?.chiefComplaint?.title?.toLowerCase() || "";
			const description =
				scenario.content?.chiefComplaint?.description?.toLowerCase() ||
				"";
			const query = searchQuery.toLowerCase();

			return (
				chiefComplaint.includes(query) || description.includes(query)
			);
		});

		setFilteredScenarios(filtered);
	}, [searchQuery, scenarios]);

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto  ">
				<DialogHeader>
					<DialogTitle>Previous Triage Entries</DialogTitle>
					<DialogDescription>
						View your previously entered triage information and AI
						evaluations.
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4 py-4">
					{/* Search Bar */}
					<div className="space-y-2">
						<label className="text-sm font-medium">
							Search by chief complaint
						</label>
						<Input
							placeholder="Search by chief complaint or description..."
							value={searchQuery}
							onChange={(e) => setSearchQuery(e.target.value)}
							className="w-full"
						/>
					</div>

					{/* Results */}
					<div className="space-y-3">
						{isLoading ? (
							<div className="space-y-3">
								{[1, 2, 3].map((i) => (
									<Skeleton key={i} className="w-full h-24" />
								))}
							</div>
						) : filteredScenarios.length === 0 ? (
							<div className="text-center py-8">
								<p className="text-muted-foreground">
									{scenarios.length === 0
										? "No previous entries found. Create a new triage entry to get started."
										: "No entries match your search."}
								</p>
							</div>
						) : (
							filteredScenarios.map((scenario) => (
								<Card
									key={scenario.id}
									className="cursor-pointer hover:shadow-lg transition-shadow"
									onClick={() =>
										handleViewScenario(scenario.id)
									}
								>
									<CardContent className="pt-6">
										<div className="flex items-start justify-between gap-4">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-2">
													<h3 className="font-semibold text-lg">
														{
															scenario.content
																?.chiefComplaint
																?.title
														}
													</h3>
													{getTriageLevel(
														scenario,
													) && (
														<Badge
															className={getTriageLevelColor(
																getTriageLevel(
																	scenario,
																),
															)}
														>
															ESI{" "}
															{getTriageLevel(
																scenario,
															)}
														</Badge>
													)}
												</div>
												<p className="text-sm text-muted-foreground line-clamp-2 mb-2">
													{
														scenario.content
															?.chiefComplaint
															?.description
													}
												</p>
												<div className="flex gap-4 text-xs text-muted-foreground">
													<span>
														Age:{" "}
														{scenario.content
															?.age || "Unknown"}
													</span>
													<span>
														Gender:{" "}
														{scenario.content
															?.gender ||
															"Unknown"}
													</span>
													<span>
														Date:{" "}
														{formatDate(
															scenario.createdAt ||
																"",
														)}
													</span>
												</div>
											</div>
											<Button
												variant="outline"
												onClick={(e) => {
													e.stopPropagation();
													handleViewScenario(
														scenario.id,
													);
												}}
											>
												View
											</Button>
										</div>
									</CardContent>
								</Card>
							))
						)}
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}
