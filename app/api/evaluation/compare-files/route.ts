import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

export async function GET(request: NextRequest) {
	try {
		// Load both files
		const aiPath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/ai response results.json",
		);
		const aiData = await fs.readFile(aiPath, "utf-8");
		const aiParsed = JSON.parse(aiData);
		const aiArray = aiParsed.items || [];

		const gtPath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/transformed_data/all_scenarios_updated_2026-04-21T18-42-04.json",
		);
		const gtData = await fs.readFile(gtPath, "utf-8");
		const gtArray = JSON.parse(gtData);

		// Get sample from AI
		const aiSample = aiArray.slice(0, 3).map((a: any) => ({
			index: a.index,
			subjectId: a.triageData.subjectId,
			chiefComplaint: a.triageData.chiefComplaint.title,
			aiId: a.triageData.id,
		}));

		// Get sample from GT
		const gtSample = gtArray.slice(0, 10).map((g: any) => ({
			subjectId: g.subjectId,
			chiefComplaint: g.chiefComplaint.title,
			inTime: g.inTime,
			gtId: g.id,
		}));

		return NextResponse.json({
			aiSample,
			gtSample,
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
