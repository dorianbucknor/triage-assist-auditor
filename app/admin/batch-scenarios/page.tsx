"use client";

import React, { useState, useRef, useEffect } from "react";
import { TriageData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	AlertCircle,
	CheckCircle2,
	Loader2,
	Download,
	Clock,
} from "lucide-react";

type ProcessingStatus = "idle" | "processing" | "completed" | "error";

interface ProcessedItem {
	index: number;
	data: TriageData;
	startTime: Date;
	endTime?: Date;
	duration?: number;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	response?: any;
	error?: string;
}

interface ProcessingResult {
	successful: number;
	failed: number;
	totalDuration: number;
	errors: Array<{
		index: number;
		error: string;
	}>;
	items: ProcessedItem[];
}

export default function BatchScenariosPage() {
	const [jsonInput, setJsonInput] = useState("");
	const [status, setStatus] = useState<ProcessingStatus>("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [results, setResults] = useState<ProcessingResult | null>(null);
	const [isProcessing, setIsProcessing] = useState(false);
	const [elapsedTime, setElapsedTime] = useState(0);
	const timerRef = useRef<NodeJS.Timeout | null>(null);

	// Timer effect
	useEffect(() => {
		if (isProcessing) {
			const startTime = Date.now();
			timerRef.current = setInterval(() => {
				setElapsedTime(Date.now() - startTime);
			}, 100);
		} else {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		}

		return () => {
			if (timerRef.current) {
				clearInterval(timerRef.current);
			}
		};
	}, [isProcessing]);

	const handleClear = () => {
		setJsonInput("");
		setStatus("idle");
		setErrorMessage("");
		setResults(null);
		setElapsedTime(0);
	};

	const validateJSON = (input: string): TriageData[] | null => {
		try {
			const parsed = JSON.parse(input);
			// Check if it's an array
			if (!Array.isArray(parsed)) {
				setErrorMessage(
					"JSON must be an array of objects. Expected: [{...}, {...}]",
				);
				return null;
			}

			if (parsed.length === 0) {
				setErrorMessage(
					"Array cannot be empty. Please provide at least one triage data object.",
				);
				return null;
			}

			// Validate each item has required fields
			const requiredFields = [
				"subjectId",
				"age",
				"gender",
				"chiefComplaint",
			];
			for (let i = 0; i < parsed.length; i++) {
				const item = parsed[i];
				for (const field of requiredFields) {
					if (!(field in item)) {
						setErrorMessage(
							`Item ${i}: Missing required field "${field}"`,
						);
						return null;
					}
				}
			}

			return parsed as TriageData[];
		} catch (error) {
			const errorMsg =
				error instanceof SyntaxError
					? `JSON Syntax Error at line ${error.message}`
					: "Failed to parse JSON";
			setErrorMessage(errorMsg);
			return null;
		}
	};

	const handleProcess = async () => {
		setErrorMessage("");
		setResults(null);
		setElapsedTime(0);

		if (!jsonInput.trim()) {
			setErrorMessage("Please paste JSON data before processing.");
			setStatus("error");
			return;
		}

		const validatedData = validateJSON(jsonInput);
		if (!validatedData) {
			setStatus("error");
			return;
		}

		setIsProcessing(true);
		setStatus("processing");

		const processingResults: ProcessingResult = {
			successful: 0,
			failed: 0,
			totalDuration: 0,
			errors: [],
			items: [],
		};

		try {
			const overallStartTimeMs = Date.now();
			for (let i = 0; i < validatedData.length; i++) {
				const itemStartTime = new Date();
				const itemStartTimeMs = Date.now();

				try {
					const response = await fetch("/api/scenarios", {
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({
							action: "ADD_SCENARIO",
							data: validatedData[i],
						}),
					});

					const responseData = await response.json();
					const itemEndTime = new Date();
					const itemDuration = Date.now() - itemStartTimeMs;

					if (!response.ok || !responseData.success) {
						processingResults.failed++;
						processingResults.errors.push({
							index: i,
							error:
								responseData.error ||
								`HTTP ${response.status}: ${response.statusText}`,
						});
						processingResults.items.push({
							index: i,
							data: validatedData[i],
							startTime: itemStartTime,
							endTime: itemEndTime,
							duration: itemDuration,
							error:
								responseData.error ||
								`HTTP ${response.status}: ${response.statusText}`,
						});
					} else {
						processingResults.successful++;
						processingResults.items.push({
							index: i,
							data: validatedData[i],
							startTime: itemStartTime,
							endTime: itemEndTime,
							duration: itemDuration,
							response: responseData.data,
						});
					}
				} catch (itemError) {
					const itemEndTime = new Date();
					const itemDuration = Date.now() - itemStartTimeMs;

					processingResults.failed++;
					processingResults.errors.push({
						index: i,
						error:
							itemError instanceof Error
								? itemError.message
								: "Unknown error processing item",
					});
					processingResults.items.push({
						index: i,
						data: validatedData[i],
						startTime: itemStartTime,
						endTime: itemEndTime,
						duration: itemDuration,
						error:
							itemError instanceof Error
								? itemError.message
								: "Unknown error processing item",
					});
				}
			}

			processingResults.totalDuration = Date.now() - overallStartTimeMs;
			setResults(processingResults);
			setStatus("completed");
		} catch (error) {
			const errorMsg =
				error instanceof Error
					? error.message
					: "An unexpected error occurred during processing";
			setErrorMessage(errorMsg);
			setStatus("error");
		} finally {
			setIsProcessing(false);
		}
	};

	const formatTime = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const milliseconds = ms % 1000;
		return `${seconds}.${String(milliseconds).padStart(3, "0")}s`;
	};

	const downloadBatchJSON = () => {
		if (!results) return;

		const downloadData = {
			totalDuration: results.totalDuration,
			successful: results.successful,
			failed: results.failed,
			items: results.items.map((item) => ({
				index: item.index,
				startTime: item.startTime,
				endTime: item.endTime,
				duration: item.duration,
				triageData: item.data,
				response: item.response,
				error: item.error,
			})),
			generatedAt: new Date().toISOString(),
		};

		const dataStr = JSON.stringify(downloadData, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `batch-scenarios-${new Date().getTime()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const downloadBatchCSV = () => {
		if (!results) return;

		const headers = [
			"Index",
			"SubjectId",
			"Age",
			"Gender",
			"ChiefComplaint",
			"StartTime",
			"EndTime",
			"DurationMs",
			"Status",
			"Error",
		];

		const rows = results.items.map((item) => [
			item.index,
			item.data.subjectId,
			item.data.age,
			item.data.gender,
			item.data.chiefComplaint?.title,
			item.startTime.toLocaleString(),
			item.endTime?.toLocaleString() || "",
			item.duration || 0,
			item.error ? "Failed" : "Success",
			item.error || "",
		]);

		const csvContent = [
			headers.join(","),
			...rows.map((row) =>
				row
					.map((cell) =>
						typeof cell === "string" && cell.includes(",")
							? `"${cell.replace(/"/g, '""')}"`
							: cell,
					)
					.join(","),
			),
		].join("\n");

		const dataBlob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `batch-scenarios-${new Date().getTime()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Batch Scenario Upload
				</h1>
				<p className="text-muted-foreground mt-2">
					Upload multiple triage scenarios at once by pasting JSON
					data.
				</p>
			</div>

			{/* Instructions Card */}
			<Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
					Expected JSON Format
				</h3>
				<pre className="text-sm text-blue-800 dark:text-blue-200 overflow-auto max-h-40 bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800">
					{JSON.stringify(
						[
							{
								subjectId: "SUBJECT001",
								age: 45,
								gender: "M",
								height: 180,
								weight: 75,
								chiefComplaint: {
									title: "Chest Pain",
									description: "Acute chest pain for 2 hours",
								},
								modeOfArrival: "Ambulance",
								mentalStatus: "Alert",
								respiratoryStatus: "Normal",
								medicalHistory: ["Hypertension"],
								currentMedication: ["Lisinopril"],
								smoker: "Yes",
								alcohol: "No",
								allergies: ["Penicillin"],
								surgicalHistory: [],
								immunization: ["COVID-19"],
								vitals: {
									temperature: 37.5,
									pulse: 88,
									respiratoryRate: 16,
									bloodPressure: "140/90",
									oxygenSaturation: 98,
									glucose: 105,
									bhcg: "Negative",
								},
								urinalysis: null,
								otherLabs: null,
							},
						],
						null,
						2,
					)}
				</pre>
			</Card>

			{/* Input Area */}
			<Card className="p-6">
				<div className="space-y-4">
					<div>
						<label className="text-sm font-medium">
							Paste JSON Array
						</label>
						<Textarea
							placeholder="Paste your JSON array here..."
							value={jsonInput}
							onChange={(e) => setJsonInput(e.target.value)}
							className="mt-2 font-mono text-sm resize-none h-64"
						/>
					</div>

					<div className="flex gap-2 justify-end">
						<Button
							variant="outline"
							onClick={handleClear}
							disabled={isProcessing}
						>
							Clear
						</Button>
						<Button
							onClick={handleProcess}
							disabled={isProcessing || !jsonInput.trim()}
						>
							{isProcessing ? (
								<>
									<Loader2 className="mr-2 h-4 w-4 animate-spin" />
									Processing...
								</>
							) : (
								"Start Processing"
							)}
						</Button>
					</div>
				</div>
			</Card>

			{/* Error Alert */}
			{errorMessage && status === "error" && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			{/* Timer Display */}
			{isProcessing && (
				<Card className="p-4 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
					<div className="flex items-center gap-2">
						<Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
						<span className="font-mono text-lg font-semibold text-yellow-700 dark:text-yellow-300">
							{formatTime(elapsedTime)}
						</span>
					</div>
				</Card>
			)}

			{/* Results */}
			{results && status === "completed" && (
				<Card className="p-6 space-y-4">
					<div className="flex items-center gap-2 mb-4">
						<CheckCircle2 className="h-5 w-5 text-green-600" />
						<h2 className="text-lg font-semibold">
							Processing Complete
						</h2>
					</div>

					{/* Summary with Overall Timing */}
					<div className="grid grid-cols-3 gap-4">
						<div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800">
							<div className="text-sm text-muted-foreground">
								Successful
							</div>
							<div className="text-2xl font-bold text-green-600 dark:text-green-400">
								{results.successful}
							</div>
						</div>
						<div className="bg-red-50 dark:bg-red-950 p-4 rounded-lg border border-red-200 dark:border-red-800">
							<div className="text-sm text-muted-foreground">
								Failed
							</div>
							<div className="text-2xl font-bold text-red-600 dark:text-red-400">
								{results.failed}
							</div>
						</div>
						<div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
							<div className="text-sm text-muted-foreground">
								Total Duration
							</div>
							<div className="text-lg font-bold text-blue-600 dark:text-blue-400 font-mono">
								{formatTime(results.totalDuration)}
							</div>
						</div>
					</div>

					{/* Download Buttons */}
					<div className="flex gap-2">
						<Button
							onClick={downloadBatchJSON}
							className="flex-1"
							variant="outline"
						>
							<Download className="mr-2 h-4 w-4" />
							Download JSON
						</Button>
						<Button
							onClick={downloadBatchCSV}
							className="flex-1"
							variant="outline"
						>
							<Download className="mr-2 h-4 w-4" />
							Download CSV
						</Button>
					</div>

					{/* Per-Item Details */}
					<div className="space-y-3">
						<h3 className="font-semibold">Processing Details</h3>
						<div className="space-y-2 max-h-96 overflow-y-auto">
							{results.items.map((item) => (
								<div
									key={item.index}
									className={`p-3 rounded border text-sm ${
										item.error
											? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
											: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
									}`}
								>
									<div className="flex justify-between items-start mb-2">
										<div className="font-semibold">
											Item {item.index} -{" "}
											{item.data.subjectId}
										</div>
										<div className="text-xs font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded">
											{formatTime(item.duration || 0)}
										</div>
									</div>
									<div className="text-xs text-muted-foreground space-y-1">
										<div>
											Chief Complaint:{" "}
											{item.data.chiefComplaint?.title}
										</div>
										<div>
											Age/Gender: {item.data.age} /{" "}
											{item.data.gender}
										</div>
										{item.error && (
											<div className="text-red-600 dark:text-red-400 font-mono">
												Error: {item.error}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					</div>

					{/* Error Details */}
					{results.errors.length > 0 && (
						<div className="space-y-2">
							<h3 className="font-semibold text-sm">
								Error Summary
							</h3>
							<div className="space-y-2 max-h-64 overflow-y-auto">
								{results.errors.map((error, idx) => (
									<div
										key={idx}
										className="bg-red-50 dark:bg-red-950 p-3 rounded border border-red-200 dark:border-red-800 text-sm"
									>
										<div className="font-mono text-red-600 dark:text-red-400">
											Item {error.index}: {error.error}
										</div>
									</div>
								))}
							</div>
						</div>
					)}
				</Card>
			)}
		</div>
	);
}
