import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
	try {
		// Load AI responses
		const aiPath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/ai response results.json",
		);
		const aiData = await fs.readFile(aiPath, "utf-8");
		const aiParsed = JSON.parse(aiData);

		// Load ground truth
		const gtPath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/transformed_data/all_scenarios.json",
		);
		const gtData = await fs.readFile(gtPath, "utf-8");
		const gtParsed = JSON.parse(gtData);

		return NextResponse.json({
			aiResponsesCount: aiParsed.items ? aiParsed.items.length : 0,
			groundTruthCount: gtParsed.length || 0,
			firstAIResponse: aiParsed.items ? aiParsed.items[0] : null,
			firstGroundTruth: gtParsed[0] || null,
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
