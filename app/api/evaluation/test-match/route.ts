import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";

async function loadAIResponses() {
	const filePath = path.join(
		process.cwd(),
		"mimic-iv-ed-demo-2.2/ai response results.json",
	);
	const data = await fs.readFile(filePath, "utf-8");
	const parsed = JSON.parse(data);
	return parsed.items || [];
}

async function loadGroundTruthScenarios() {
	const filePath = path.join(
		process.cwd(),
		"mimic-iv-ed-demo-2.2/transformed_data/all_scenarios.json",
	);
	const data = await fs.readFile(filePath, "utf-8");
	return JSON.parse(data);
}

function matchScenarios(aiResponses: any[], groundTruthScenarios: any[]) {
	const map = new Map();
	const groundTruthMap = new Map<string, any>();

	console.log(
		`matchScenarios called with ${aiResponses.length} AI responses`,
	);
	console.log(
		`matchScenarios called with ${groundTruthScenarios.length} ground truth scenarios`,
	);

	groundTruthScenarios.forEach((gt) => {
		groundTruthMap.set(gt.subjectId, gt);
	});

	console.log(`groundTruthMap size after population: ${groundTruthMap.size}`);
	console.log(
		`First 5 keys in groundTruthMap: ${Array.from(groundTruthMap.keys()).slice(0, 5)}`,
	);

	aiResponses.forEach((ai) => {
		const aiSubjectId = ai.triageData.subjectId;
		const gt = groundTruthMap.get(aiSubjectId);
		console.log(`AI ${aiSubjectId}: gt found = ${gt ? "yes" : "no"}`);
		if (gt) {
			map.set(aiSubjectId, { ai, groundTruth: gt });
		}
	});

	console.log(`Final map size: ${map.size}`);
	return map;
}

export async function GET(request: NextRequest) {
	try {
		const aiResponses = await loadAIResponses();
		const groundTruthScenarios = await loadGroundTruthScenarios();
		const matched = matchScenarios(aiResponses, groundTruthScenarios);

		return NextResponse.json({
			aiCount: aiResponses.length,
			gtCount: groundTruthScenarios.length,
			matchedCount: matched.size,
			firstAI: aiResponses[0]?.triageData.subjectId,
			firstGT: groundTruthScenarios[0]?.subjectId,
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
