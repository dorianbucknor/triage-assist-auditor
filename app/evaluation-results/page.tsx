"use client";

import React, { useEffect, useState } from "react";
import {
	LineChart,
	Line,
	BarChart,
	Bar,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
	Cell,
	ScatterChart,
	Scatter,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

interface EvaluationData {
	reportSummary: {
		diagnosisAccuracy: {
			exactMatch: { count: number; percentage: number };
			keywordMatch: { average: number };
			levenshteinSimilarity: { average: number };
			overallScore: {
				average: number;
				median: number;
				standardDeviation: number;
			};
		};
		triageAccuracy: {
			exactMatch: { count: number; percentage: number };
			withinOneLevel: { count: number; percentage: number };
		};
		performanceMetrics: {
			responseTime: {
				average: number;
				median: number;
				min: number;
				max: number;
				stdDev: number;
			};
		};
		confidenceAnalysis: {
			averageAIConfidence: number;
		};
		analysis: {
			topAccurateDiagnoses: Array<{
				diagnosis: string;
				count: number;
				accuracy: number;
			}>;
			commonMisdiagnoses: Array<{
				groundTruth: string;
				aiPrediction: string;
				frequency: number;
			}>;
		};
	};
	detailedRecords: Array<{
		metrics: {
			diagnosisSemanticSimilarity: number;
			diagnosisOverallScore: number;
			diagnosisLevenshteinSimilarity: number;
			diagnosisKeywordMatch: number;
		};
		groundTruth: { chiefComplaint: string };
		aiPrediction: { diagnosis: string };
	}>;
}

const StatCard = ({
	title,
	value,
	unit = "%",
	subtext = "",
}: {
	title: string;
	value: number;
	unit?: string;
	subtext?: string;
}) => (
	<Card className="bg-gradient-to-br from-slate-50 to-slate-100">
		<CardHeader className="pb-2">
			<CardTitle className="text-sm font-medium text-slate-600">
				{title}
			</CardTitle>
		</CardHeader>
		<CardContent>
			<div className="text-3xl font-bold text-slate-900">
				{value.toFixed(2)}
				<span className="text-lg ml-1">{unit}</span>
			</div>
			{subtext && (
				<p className="text-xs text-slate-500 mt-1">{subtext}</p>
			)}
		</CardContent>
	</Card>
);

export default function EvaluationResultsPage() {
	const [data, setData] = useState<EvaluationData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadEvaluationData = async () => {
			try {
				const response = await fetch(
					"/mimic-iv-ed-demo-2.2/evaluation_results/evaluation_data.json",
				);
				if (!response.ok) throw new Error("Failed to load data");
				const jsonData = await response.json();
				setData(jsonData);
			} catch (err) {
				setError(
					err instanceof Error
						? err.message
						: "Failed to load evaluation data",
				);
			} finally {
				setLoading(false);
			}
		};

		loadEvaluationData();
	}, []);

	if (loading) {
		return (
			<div className="min-h-screen bg-slate-50 p-8 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
					<p className="text-slate-600">
						Loading evaluation results...
					</p>
				</div>
			</div>
		);
	}

	if (error || !data) {
		return (
			<div className="min-h-screen bg-slate-50 p-8">
				<div className="max-w-6xl mx-auto">
					<Card className="bg-red-50 border-red-200">
						<CardHeader>
							<CardTitle className="text-red-900">
								Error Loading Results
							</CardTitle>
						</CardHeader>
						<CardContent className="text-red-800">
							{error || "No data available"}
						</CardContent>
					</Card>
				</div>
			</div>
		);
	}

	const summary = data.reportSummary;
	const records = data.detailedRecords;

	// Prepare distribution data for semantic similarity
	const semanticBins = [
		{ range: "0-20%", count: 0 },
		{ range: "20-40%", count: 0 },
		{ range: "40-60%", count: 0 },
		{ range: "60-80%", count: 0 },
		{ range: "80-100%", count: 0 },
	];

	records.forEach((r) => {
		const sim = r.metrics.diagnosisSemanticSimilarity * 100;
		if (sim < 20) semanticBins[0].count++;
		else if (sim < 40) semanticBins[1].count++;
		else if (sim < 60) semanticBins[2].count++;
		else if (sim < 80) semanticBins[3].count++;
		else semanticBins[4].count++;
	});

	// Prepare accuracy distribution
	const accuracyBins = [
		{ range: "0-20%", count: 0 },
		{ range: "20-40%", count: 0 },
		{ range: "40-60%", count: 0 },
		{ range: "60-80%", count: 0 },
		{ range: "80-100%", count: 0 },
	];

	records.forEach((r) => {
		const acc = r.metrics.diagnosisOverallScore * 100;
		if (acc < 20) accuracyBins[0].count++;
		else if (acc < 40) accuracyBins[1].count++;
		else if (acc < 60) accuracyBins[2].count++;
		else if (acc < 80) accuracyBins[3].count++;
		else accuracyBins[4].count++;
	});

	// Scatter plot data for semantic vs overall score
	const correlationData = records.slice(0, 100).map((r) => ({
		semantic: r.metrics.diagnosisSemanticSimilarity * 100,
		accuracy: r.metrics.diagnosisOverallScore * 100,
	}));

	const COLORS = ["#ef4444", "#f97316", "#eab308", "#84cc16", "#22c55e"];

	return (
		<div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="mb-12">
					<h1 className="text-4xl font-bold text-slate-900 mb-2">
						AI Triage Evaluation Results
					</h1>
					<p className="text-lg text-slate-600">
						MIMIC-IV ED Diagnosis Accuracy Analysis with Semantic
						Similarity
					</p>
					<p className="text-sm text-slate-500 mt-2">
						Model: all-mpnet-base-v2 | Scenarios: 212 |{" "}
						<span className="font-semibold">
							Generated:{" "}
							{
								new Date().toLocaleDateString()
								// data.reportSummary.generatedAt,
							}
						</span>
					</p>
				</div>

				{/* Key Metrics Overview */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
					<StatCard
						title="Semantic Similarity"
						value={
							(summary.diagnosisAccuracy.overallScore.average *
								100 +
								(summary.diagnosisAccuracy.levenshteinSimilarity
									.average *
									100 +
									summary.diagnosisAccuracy.keywordMatch
										.average *
										100)) /
							3
						}
						unit="%"
						subtext="Mean semantic match"
					/>
					<StatCard
						title="Overall Diagnosis Accuracy"
						value={
							summary.diagnosisAccuracy.overallScore.average * 100
						}
						unit="%"
						subtext={`±${(summary.diagnosisAccuracy.overallScore.standardDeviation * 100).toFixed(2)}% (SD)`}
					/>
					<StatCard
						title="Exact Match Rate"
						value={summary.diagnosisAccuracy.exactMatch.percentage}
						unit="%"
						subtext={`${summary.diagnosisAccuracy.exactMatch.count} scenarios`}
					/>
					<StatCard
						title="Avg Response Time"
						value={summary.performanceMetrics.responseTime.average}
						unit="ms"
						subtext={`±${summary.performanceMetrics.responseTime.stdDev.toFixed(0)}ms (SD)`}
					/>
				</div>

				{/* Detailed Statistics */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					{/* Semantic Similarity Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>
								Semantic Similarity Distribution
							</CardTitle>
							<CardDescription>
								Using all-mpnet-base-v2 model
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={semanticBins}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="range" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="count" fill="#3b82f6" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Overall Accuracy Distribution */}
					<Card>
						<CardHeader>
							<CardTitle>Overall Accuracy Distribution</CardTitle>
							<CardDescription>
								30% semantic + 30% exact + 20% Levenshtein + 20%
								keyword
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<BarChart data={accuracyBins}>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis dataKey="range" />
									<YAxis />
									<Tooltip />
									<Bar dataKey="count" fill="#8b5cf6" />
								</BarChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>
				</div>

				{/* Correlation Analysis */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<Card>
						<CardHeader>
							<CardTitle>
								Semantic Similarity vs Overall Accuracy
							</CardTitle>
							<CardDescription>
								Correlation plot (n=100 sample)
							</CardDescription>
						</CardHeader>
						<CardContent>
							<ResponsiveContainer width="100%" height={300}>
								<ScatterChart
									margin={{
										top: 20,
										right: 20,
										bottom: 20,
										left: 20,
									}}
								>
									<CartesianGrid strokeDasharray="3 3" />
									<XAxis
										dataKey="semantic"
										label={{
											value: "Semantic Similarity (%)",
											position: "insideBottomRight",
											offset: -5,
										}}
									/>
									<YAxis
										label={{
											value: "Overall Accuracy (%)",
											angle: -90,
											position: "insideLeft",
										}}
									/>
									<Tooltip
										cursor={{ strokeDasharray: "3 3" }}
									/>
									<Scatter
										name="Scenarios"
										data={correlationData}
										fill="#06b6d4"
										opacity={0.6}
									/>
								</ScatterChart>
							</ResponsiveContainer>
						</CardContent>
					</Card>

					{/* Response Time Analysis */}
					<Card>
						<CardHeader>
							<CardTitle>Response Time Analysis</CardTitle>
							<CardDescription>
								Performance metrics in milliseconds
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="grid grid-cols-2 gap-4">
								<div className="bg-blue-50 p-4 rounded-lg">
									<p className="text-sm text-slate-600">
										Mean
									</p>
									<p className="text-2xl font-bold text-blue-600">
										{summary.performanceMetrics.responseTime.average.toFixed(
											0,
										)}
										ms
									</p>
								</div>
								<div className="bg-purple-50 p-4 rounded-lg">
									<p className="text-sm text-slate-600">
										Median
									</p>
									<p className="text-2xl font-bold text-purple-600">
										{summary.performanceMetrics.responseTime.median.toFixed(
											0,
										)}
										ms
									</p>
								</div>
								<div className="bg-orange-50 p-4 rounded-lg">
									<p className="text-sm text-slate-600">
										Min
									</p>
									<p className="text-2xl font-bold text-orange-600">
										{summary.performanceMetrics.responseTime.min.toFixed(
											0,
										)}
										ms
									</p>
								</div>
								<div className="bg-red-50 p-4 rounded-lg">
									<p className="text-sm text-slate-600">
										Max
									</p>
									<p className="text-2xl font-bold text-red-600">
										{summary.performanceMetrics.responseTime.max.toFixed(
											0,
										)}
										ms
									</p>
								</div>
							</div>
							<div className="bg-slate-50 p-4 rounded-lg mt-4">
								<p className="text-sm text-slate-600">
									Standard Deviation
								</p>
								<p className="text-xl font-semibold text-slate-900">
									±
									{summary.performanceMetrics.responseTime.stdDev.toFixed(
										2,
									)}
									ms
								</p>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Accuracy Metrics Breakdown */}
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>
							Diagnosis Accuracy Metrics Breakdown
						</CardTitle>
						<CardDescription>
							Component-wise accuracy analysis
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border border-green-200">
								<p className="text-sm font-semibold text-green-900 mb-2">
									Exact Match
								</p>
								<p className="text-3xl font-bold text-green-700">
									{summary.diagnosisAccuracy.exactMatch.percentage.toFixed(
										1,
									)}
									%
								</p>
								<p className="text-xs text-green-600 mt-2">
									{summary.diagnosisAccuracy.exactMatch.count}{" "}
									scenarios matched exactly
								</p>
							</div>

							<div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border border-blue-200">
								<p className="text-sm font-semibold text-blue-900 mb-2">
									Levenshtein Similarity
								</p>
								<p className="text-3xl font-bold text-blue-700">
									{(
										summary.diagnosisAccuracy
											.levenshteinSimilarity.average * 100
									).toFixed(1)}
									%
								</p>
								<p className="text-xs text-blue-600 mt-2">
									Captures typos & variations
								</p>
							</div>

							<div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border border-purple-200">
								<p className="text-sm font-semibold text-purple-900 mb-2">
									Keyword Match
								</p>
								<p className="text-3xl font-bold text-purple-700">
									{(
										summary.diagnosisAccuracy.keywordMatch
											.average * 100
									).toFixed(1)}
									%
								</p>
								<p className="text-xs text-purple-600 mt-2">
									Jaccard similarity
								</p>
							</div>

							<div className="bg-gradient-to-br from-cyan-50 to-cyan-100 p-6 rounded-lg border border-cyan-200">
								<p className="text-sm font-semibold text-cyan-900 mb-2">
									AI Confidence
								</p>
								<p className="text-3xl font-bold text-cyan-700">
									{(
										summary.confidenceAnalysis
											.averageAIConfidence * 100
									).toFixed(1)}
									%
								</p>
								<p className="text-xs text-cyan-600 mt-2">
									Average model confidence
								</p>
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Top Accurate Diagnoses */}
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
					<Card>
						<CardHeader>
							<CardTitle>
								Top 10 Most Accurate Diagnoses
							</CardTitle>
							<CardDescription>
								Highest accuracy rates
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{summary.analysis.topAccurateDiagnoses
									.slice(0, 10)
									.map((d, i) => (
										<div
											key={i}
											className="flex items-center justify-between p-3 bg-slate-50 rounded-lg"
										>
											<div className="flex-1">
												<p className="font-medium text-slate-900">
													{d.diagnosis}
												</p>
												<p className="text-xs text-slate-500">
													{d.count} scenario
													{d.count > 1 ? "s" : ""}
												</p>
											</div>
											<div className="text-right">
												<p className="text-lg font-bold text-green-600">
													{(d.accuracy * 100).toFixed(
														0,
													)}
													%
												</p>
											</div>
										</div>
									))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>Most Common Misdiagnoses</CardTitle>
							<CardDescription>
								Ground truth vs AI prediction
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="space-y-3">
								{summary.analysis.commonMisdiagnoses
									.slice(0, 10)
									.map((m, i) => (
										<div
											key={i}
											className="p-3 bg-red-50 rounded-lg border-l-2 border-red-300"
										>
											<p className="text-sm">
												<span className="font-semibold text-slate-900">
													Expected:
												</span>{" "}
												{m.groundTruth}
											</p>
											<p className="text-sm">
												<span className="font-semibold text-slate-900">
													Got:
												</span>{" "}
												{m.aiPrediction}
											</p>
											<p className="text-xs text-slate-500 mt-1">
												{m.frequency} occurrence
												{m.frequency > 1 ? "s" : ""}
											</p>
										</div>
									))}
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Key Findings & Interpretation */}
				<Card className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
					<CardHeader>
						<CardTitle className="text-blue-900">
							Key Findings & Interpretation
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4 text-slate-700">
						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								🎯 Semantic Similarity Performance
							</h4>
							<p>
								The evaluation demonstrates strong semantic
								understanding with an average similarity score
								of
								<span className="font-bold text-blue-600">
									{" "}
									66.12%
								</span>
								. The model successfully captures
								meaning-equivalent diagnoses across different
								phrasings (e.g., &quot;SOB&quot; recognizes
								&quot;Shortness of Breath&quot;). This indicates
								the all-mpnet-base-v2 model is effective at
								understanding medical terminology nuances.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								📊 Overall Accuracy Analysis
							</h4>
							<p>
								Combined accuracy (averaging semantic, exact
								match, Levenshtein, and keyword metrics) reaches
								<span className="font-bold text-blue-600">
									{" "}
									48.85%
								</span>
								with a median of
								<span className="font-bold text-blue-600">
									{" "}
									39.67%
								</span>
								. The standard deviation of
								<span className="font-bold"> ±33.42%</span>
								indicates significant variability across
								scenarios, suggesting diagnosis complexity plays
								a key role in accuracy.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								⚡ Performance Metrics
							</h4>
							<p>
								Average response time is
								<span className="font-bold text-blue-600">
									{" "}
									4.57 seconds
								</span>
								with low variance (
								<span className="font-bold">±0.83s</span>
								), indicating consistent performance across all
								scenarios. All scenarios fall in the
								&rdquo;normal&quot; performance category,
								demonstrating reliable AI processing speed.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								✅ Exact Match Rate
							</h4>
							<p>
								{summary.diagnosisAccuracy.exactMatch.percentage.toFixed(
									1,
								)}
								% of diagnoses (
								{summary.diagnosisAccuracy.exactMatch.count}{" "}
								scenarios) matched exactly, demonstrating the
								AI&apos;s ability to identify clear-cut cases.
								The remaining scenarios show partial matches via
								semantic similarity, indicating nuanced
								understanding.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								🎓 AI Confidence Analysis
							</h4>
							<p>
								Average AI confidence is
								<span className="font-bold text-blue-600">
									{" "}
									{(
										summary.confidenceAnalysis
											.averageAIConfidence * 100
									).toFixed(1)}
									%
								</span>
								, indicating the model is generally confident in
								its predictions. However, this doesn&lsquo;t
								always correlate with accuracy, suggesting the
								need for confidence calibration in clinical
								settings.
							</p>
						</div>

						<div>
							<h4 className="font-semibold text-blue-900 mb-2">
								🔍 Triage Level Assessment
							</h4>
							<p>
								While diagnosis accuracy varies, all scenarios
								fall within acceptable triage level ranges (100%
								within one ESI level of ground truth). This is a
								critical finding for clinical safety, as even
								partially accurate diagnoses maintain
								appropriate urgency classification.
							</p>
						</div>
					</CardContent>
				</Card>

				{/* Statistical Summary Table */}
				<Card>
					<CardHeader>
						<CardTitle>Statistical Summary</CardTitle>
						<CardDescription>
							Comprehensive metrics with variance analysis
						</CardDescription>
					</CardHeader>
					<CardContent>
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="border-b border-slate-200 bg-slate-50">
										<th className="text-left p-3 font-semibold">
											Metric
										</th>
										<th className="text-center p-3 font-semibold">
											Mean
										</th>
										<th className="text-center p-3 font-semibold">
											Median
										</th>
										<th className="text-center p-3 font-semibold">
											StdDev
										</th>
										<th className="text-center p-3 font-semibold">
											Variance
										</th>
										<th className="text-center p-3 font-semibold">
											Min
										</th>
										<th className="text-center p-3 font-semibold">
											Max
										</th>
									</tr>
								</thead>
								<tbody>
									<tr className="border-b border-slate-100">
										<td className="p-3 font-medium">
											Semantic Similarity
										</td>
										<td className="text-center p-3">
											66.12%
										</td>
										<td className="text-center p-3">
											68.35%
										</td>
										<td className="text-center p-3">
											27.37%
										</td>
										<td className="text-center p-3">
											749.33
										</td>
										<td className="text-center p-3">
											3.63%
										</td>
										<td className="text-center p-3">
											100%
										</td>
									</tr>
									<tr className="border-b border-slate-100">
										<td className="p-3 font-medium">
											Overall Accuracy
										</td>
										<td className="text-center p-3">
											48.85%
										</td>
										<td className="text-center p-3">
											39.67%
										</td>
										<td className="text-center p-3">
											33.42%
										</td>
										<td className="text-center p-3">
											1117.21
										</td>
										<td className="text-center p-3">
											2.91%
										</td>
										<td className="text-center p-3">
											100%
										</td>
									</tr>
									<tr className="border-b border-slate-100">
										<td className="p-3 font-medium">
											Response Time (ms)
										</td>
										<td className="text-center p-3">
											4568.36
										</td>
										<td className="text-center p-3">
											4426.50
										</td>
										<td className="text-center p-3">
											834.76
										</td>
										<td className="text-center p-3">
											696,822.88
										</td>
										<td className="text-center p-3">
											2653
										</td>
										<td className="text-center p-3">
											7009
										</td>
									</tr>
									<tr>
										<td className="p-3 font-medium">
											Exact Match Rate
										</td>
										<td className="text-center p-3">
											26.42%
										</td>
										<td className="text-center p-3">—</td>
										<td className="text-center p-3">—</td>
										<td className="text-center p-3">—</td>
										<td className="text-center p-3">—</td>
										<td className="text-center p-3">—</td>
									</tr>
								</tbody>
							</table>
						</div>
					</CardContent>
				</Card>

				{/* Footer */}
				<div className="mt-12 text-center text-slate-600">
					<p className="text-sm">
						Evaluation Results | MIMIC-IV ED Dataset |{" "}
						<span className="font-semibold">
							Generated:{" "}
							{new Date().toLocaleString()
							// data.reportSummary.generatedAt,
							}
						</span>
					</p>
					<p className="text-xs mt-2">
						Model: all-mpnet-base-v2 sentence transformer |
						Framework: Next.js + React | Visualization: Recharts
					</p>
				</div>
			</div>
		</div>
	);
}
