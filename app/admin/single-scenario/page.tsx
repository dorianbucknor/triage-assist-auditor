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

interface ProcessingResult {
	startTime: Date;
	endTime?: Date;
	duration?: number; // in milliseconds
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	scenarioContent: any;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	aiResponse: any;
	triageData: TriageData;
	authorId: string;
	date: string;
}

export default function SingleScenarioPage() {
	const [jsonInput, setJsonInput] = useState("");
	const [status, setStatus] = useState<ProcessingStatus>("idle");
	const [errorMessage, setErrorMessage] = useState("");
	const [result, setResult] = useState<ProcessingResult | null>(null);
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
		setResult(null);
		setElapsedTime(0);
	};

	const validateJSON = (input: string): TriageData | null => {
		try {
			const parsed = JSON.parse(input);

			// Check if it's a single object (not an array)
			if (Array.isArray(parsed)) {
				setErrorMessage(
					"JSON must be a single object, not an array. Expected: {...}",
				);
				return null;
			}

			if (typeof parsed !== "object" || parsed === null) {
				setErrorMessage("JSON must be a valid object. Expected: {...}");
				return null;
			}

			// Validate required fields
			const requiredFields = [
				"subjectId",
				"age",
				"gender",
				"chiefComplaint",
			];
			for (const field of requiredFields) {
				if (!(field in parsed)) {
					setErrorMessage(`Missing required field: "${field}"`);
					return null;
				}
			}

			return parsed as TriageData;
		} catch (error) {
			const errorMsg =
				error instanceof SyntaxError
					? `JSON Syntax Error: ${error.message}`
					: "Failed to parse JSON";
			setErrorMessage(errorMsg);
			return null;
		}
	};

	const handleProcess = async () => {
		setErrorMessage("");
		setResult(null);
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
		const startTime = new Date();
		const startTimeMs = Date.now();

		try {
			const response = await fetch("/api/scenarios", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					action: "ADD_SCENARIO",
					data: validatedData,
				}),
			});

			const responseData = await response.json();
			const endTime = new Date();
			const actualDuration = Date.now() - startTimeMs;

			if (!response.ok || !responseData.success) {
				setErrorMessage(
					responseData.error ||
						`HTTP ${response.status}: ${response.statusText}`,
				);
				setStatus("error");
			} else {
				setResult({
					startTime,
					endTime,
					duration: actualDuration,
					...responseData.data,
				});
				setStatus("completed");
			}
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

	const downloadJSON = () => {
		if (!result) return;

		const downloadData = {
			startTime: result.startTime,
			endTime: result.endTime,
			duration: result.duration,
			scenarioContent: result.scenarioContent,
			aiResponse: result.aiResponse,
			triageData: result.triageData,
			authorId: result.authorId,
			date: result.date,
			id: result.triageData.subjectId,
		};

		const dataStr = JSON.stringify(downloadData, null, 2);
		const dataBlob = new Blob([dataStr], { type: "application/json" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `scenario-${result.triageData.subjectId}-${new Date().getTime()}.json`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const downloadCSV = () => {
		if (!result) return;

		// Flatten the data for CSV
		const flatData = {
			id: result.triageData.subjectId,
			startTime: result.startTime,
			endTime: result.endTime,
			duration_ms: result.duration,
			subjectId: result.triageData.subjectId,
			age: result.triageData.age,
			gender: result.triageData.gender,
			chiefComplaint: result.triageData.chiefComplaint?.title,
			authorId: result.authorId,
			processingDate: result.date,
		};

		const headers = Object.keys(flatData);
		const values = Object.values(flatData).map((v) => {
			if (v === null || v === undefined) return "";
			if (typeof v === "object") return JSON.stringify(v);
			return String(v).replace(/"/g, '""');
		});

		const csvContent = [
			headers.join(","),
			values
				.map((v) =>
					typeof v === "string" && v.includes(",") ? `"${v}"` : v,
				)
				.join(","),
		].join("\n");

		const dataBlob = new Blob([csvContent], { type: "text/csv" });
		const url = URL.createObjectURL(dataBlob);
		const link = document.createElement("a");
		link.href = url;
		link.download = `scenario-${result.triageData.subjectId}-${new Date().getTime()}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};

	const formatTime = (ms: number) => {
		const seconds = Math.floor(ms / 1000);
		const milliseconds = ms % 1000;
		return `${seconds}.${String(milliseconds).padStart(3, "0")}s`;
	};

	return (
		<div className="space-y-6">
			{/* Header */}
			<div>
				<h1 className="text-3xl font-bold tracking-tight">
					Single Scenario Upload
				</h1>
				<p className="text-muted-foreground mt-2">
					Upload and process a single triage scenario entry.
				</p>
			</div>

			{/* Instructions Card */}
			<Card className="p-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-900">
				<h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
					Expected JSON Format
				</h3>
				<pre className="text-sm text-blue-800 dark:text-blue-200 overflow-auto max-h-40 bg-white dark:bg-slate-900 p-3 rounded border border-blue-200 dark:border-blue-800">
					{JSON.stringify(
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
							Paste JSON Object
						</label>
						<Textarea
							placeholder="Paste your JSON object here..."
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

			{/* Error Alert */}
			{errorMessage && status === "error" && (
				<Alert variant="destructive">
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>{errorMessage}</AlertDescription>
				</Alert>
			)}

			{/* Results */}
			{result && status === "completed" && (
				<Card className="p-6 space-y-4">
					<div className="flex items-center gap-2 mb-4">
						<CheckCircle2 className="h-5 w-5 text-green-600" />
						<h2 className="text-lg font-semibold">
							Processing Complete
						</h2>
					</div>

					{/* Timing Info */}
					<div className="bg-green-50 dark:bg-green-950 p-4 rounded-lg border border-green-200 dark:border-green-800 space-y-2">
						<div>
							<div className="text-sm text-muted-foreground">
								Processing Duration
							</div>
							<div className="font-mono text-lg font-semibold text-green-600 dark:text-green-400">
								{formatTime(result.duration || 0)}
							</div>
						</div>
						<div className="grid grid-cols-2 gap-4">
							<div>
								<div className="text-xs text-muted-foreground">
									Start Time
								</div>
								<div className="text-sm font-mono">
									{result.startTime.toLocaleString()}
								</div>
							</div>
							<div>
								<div className="text-xs text-muted-foreground">
									End Time
								</div>
								<div className="text-sm font-mono">
									{result.endTime?.toLocaleString()}
								</div>
							</div>
						</div>
					</div>

					{/* Scenario Info */}
					<div className="bg-slate-50 dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 space-y-2">
						<h3 className="font-semibold">Scenario Information</h3>
						<div className="grid grid-cols-2 gap-4 text-sm">
							<div>
								<div className="text-muted-foreground">
									Subject ID
								</div>
								<div className="font-mono">
									{result.triageData.subjectId}
								</div>
							</div>
							<div>
								<div className="text-muted-foreground">
									Age / Gender
								</div>
								<div className="font-mono">
									{result.triageData.age} /{" "}
									{result.triageData.gender}
								</div>
							</div>
							<div className="col-span-2">
								<div className="text-muted-foreground">
									Chief Complaint
								</div>
								<div className="font-mono">
									{result.triageData.chiefComplaint?.title}
								</div>
							</div>
						</div>
					</div>

					{/* Download Buttons */}
					<div className="flex gap-2">
						<Button
							onClick={downloadJSON}
							className="flex-1"
							variant="outline"
						>
							<Download className="mr-2 h-4 w-4" />
							Download JSON
						</Button>
						<Button
							onClick={downloadCSV}
							className="flex-1"
							variant="outline"
						>
							<Download className="mr-2 h-4 w-4" />
							Download CSV
						</Button>
					</div>
				</Card>
			)}
		</div>
	);
}
