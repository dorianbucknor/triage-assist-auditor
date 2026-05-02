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
		const aiArray = aiParsed.items || [];

		// Load ground truth - trying different approaches
		const gtPath = path.join(
			process.cwd(),
			"mimic-iv-ed-demo-2.2/transformed_data/all_scenarios.json",
		);
		const gtData = await fs.readFile(gtPath, "utf-8");
		const gtParsed = JSON.parse(gtData);
		const gtArray = Array.isArray(gtParsed)
			? gtParsed
			: gtParsed.items || [];

		// Get unique subject IDs
		const aiSubjectIds = new Set(
			aiArray.map((a: any) => a.triageData.subjectId),
		);
		const gtSubjectIds = new Set(gtArray.map((g: any) => g.subjectId));

		const commonIds = new Set(
			[...aiSubjectIds].filter((id) => gtSubjectIds.has(id)),
		);
		const uniqueToAI = new Set(
			[...aiSubjectIds].filter((id) => !gtSubjectIds.has(id)),
		);
		const uniqueToGT = new Set(
			[...gtSubjectIds].filter((id) => !aiSubjectIds.has(id)),
		);

		return NextResponse.json({
			aiCount: aiArray.length,
			gtCount: gtArray.length,
			aiSubjectIdCount: aiSubjectIds.size,
			gtSubjectIdCount: gtSubjectIds.size,
			commonIdCount: commonIds.size,
			uniqueToAICount: uniqueToAI.size,
			uniqueToGTCount: uniqueToGT.size,
			firstAISubject: [...aiSubjectIds][0],
			firstGTSubject: [...gtSubjectIds][0],
			sampleCommonIds: Array.from(commonIds).slice(0, 10),
			sampleUniqueToAI: Array.from(uniqueToAI).slice(0, 5),
			sampleUniqueToGT: Array.from(uniqueToGT).slice(0, 5),
		});
	} catch (error) {
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : String(error),
				stack: error instanceof Error ? error.stack : undefined,
			},
			{ status: 500 },
		);
	}
}
