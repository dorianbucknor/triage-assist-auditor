import { Syringe } from "lucide-react";
import { Card, CardContent, CardHeader } from "../ui/card";

export default function TreatmentRecommendations({
	recommendations,
	reasoning,
	confidence,
}: {
	recommendations: string[];
	reasoning: string;
	confidence: number;
}) {
	const getConfidenceColor = (conf: number) => {
		if (conf >= 85) return "bg-green-100 text-green-800";
		if (conf >= 70) return "bg-yellow-100 text-yellow-800";
		return "bg-red-100 text-red-800";
	};

	return (
		<Card className="mb-4">
			<CardHeader>
				<div className="flex items-center gap-2">
					<Syringe className="h-5 w-5" />
					<h3 className="font-semibold text-lg">
						Treatment Recommendations
					</h3>
				</div>
			</CardHeader>
			<CardContent className="space-y-4">
				<div className="space-y-2">
					<h4 className="text-sm font-medium">Recommended Actions</h4>
					<ul className="space-y-2">
						{recommendations.map((rec, idx) => (
							<li key={idx} className="flex gap-2 text-sm">
								<span className="text-primary font-bold">
									•
								</span>
								<span>{rec}</span>
							</li>
						))}
					</ul>
				</div>
				<div>
					<h4 className="text-sm font-medium mb-2">Reasoning</h4>
					<p className="text-sm text-muted-foreground">{reasoning}</p>
				</div>
				<div className="flex items-center justify-between">
					<span className="text-sm font-medium">Confidence</span>
					<span
						className={`px-3 py-1 rounded-full text-sm font-semibold ${getConfidenceColor(confidence)}`}
					>
						{confidence}%
					</span>
				</div>
			</CardContent>
		</Card>
	);
}
