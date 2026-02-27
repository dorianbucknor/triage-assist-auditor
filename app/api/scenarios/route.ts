import { verifySession } from "@/lib/dal";
import {
	AIResponse,
	ChiefComplaint,
	Scenario,
	ScenarioContent,
	TriageData,
	Urinalysis,
} from "@/lib/types";
import { createServerClient } from "@/providers/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import camelize from "camelize-ts";
import snakify from "snakify-ts";

export async function GET(request: NextRequest) {
	const { isAuth, userId } = await verifySession();

	// console.log();

	if (!isAuth || !userId) {
		return new NextResponse(
			JSON.stringify({ success: false, error: "Unauthorized" }),
			{
				status: 401,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}

	const { searchParams } = request.nextUrl;
	const action = searchParams.get("action");

	if (action) {
		switch (action) {
			case "GET_UNGRADED":
				const limit = parseInt(searchParams.get("amount") || "5");
				const page = parseInt(searchParams.get("page") || "0");
				return await fetchUngradedByUser(limit, userId, page);
			default:
				return new NextResponse(
					JSON.stringify({ success: false, error: "Invalid action" }),
					{
						status: 400,
						headers: {
							"Content-Type": "application/json",
						},
					},
				);
		}
	}

	return new NextResponse(
		JSON.stringify({ success: false, error: "Invalid action" }),
		{
			status: 400,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
}

export async function POST(request: NextRequest) {
	const { isAuth, userId } = await verifySession();

	if (!isAuth) {
		return new NextResponse(
			JSON.stringify({ success: false, error: "Unauthorized" }),
			{
				status: 401,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}

	const { action, data } = await request.json();

	switch (action) {
		case "ADD_SCENARIO":
			return await handleAdd(data);
		case "ADD_GRADING":
			return await handleAddGrading(data, userId!);
		default:
			return new NextResponse(
				JSON.stringify({ success: false, error: "Invalid action" }),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
	}
}

//1. Use data as TriageData
//2. Convert TriageData to ScenarioContent and AIResponse and store in DB by:
//  a. Use AI (accessed by external api) to summarize the mode of arrival, mental status and respiratory status into a chief complaint details
//  b. Use AI to summarize the social history (previous/current smoker, previous/current alcoholic), allergies, past surgeries, immunizaion, medical history and current medications into a medical history summary
//  c. Use AI to summarize the urinalysis and any other labs into a labs summary
//3. Use AI to get a Triage reponse based on AIResponse format and store in DB
//4. Store the Scenario in DB with public = false and editable = true flags so that the creator can edit the scenario and make it public when ready for grading
//5. Store the scenario contennt
//6. Return success or failure response based on DB operation result
async function handleAdd(data: TriageData) {
	try {
		//create summaries using AI
		const complaintDetails = await summarizeChiefComplaint(
			data.chiefComplaint,
		);
		const medicalHistorySummary = await summarizeMedicalHistory(data);
		const labsSummary = await summarizeLabs({
			urinalysis: data.urinalysis,
			otherLabs: data.otherLabs,
		});

		//convert to scenario content
		const scenarioContent = {
			age: data.age,
			weight: data.weight,
			height: data.height,
			gender: data.gender,
			chiefComplaint: {
				...data.chiefComplaint,
				details: complaintDetails,
			},
			medicalHistory: medicalHistorySummary,
			vitals: data.vitals,
			urinalysis: data.urinalysis,
			otherLabs: data.otherLabs,
			labsSummary,
		} as ScenarioContent;

		//get AI response
		const aiResponse = await getAIResponse(
			data,
			medicalHistorySummary,
			labsSummary,
		);

		const scenario = await addScenario();

		await addScenarioContent(scenario.id, scenarioContent);
		await addAIResponse(scenario.id, aiResponse);

		return new NextResponse(
			JSON.stringify({
				success: true,
				error: null,
				data: { scenarioId: scenario.id },
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	} catch (error) {
		console.error("Error adding scenario: ", error);
		return new NextResponse(
			JSON.stringify({ success: false, error: "Failed to add scenario" }),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}

async function addScenario() {
	const supabase = await createServerClient();
	const {
		data: { session },
	} = await supabase.auth.getSession();

	if (!session) {
		throw new Error("Unauthorized");
	}

	const scenario = {
		authorId: session.user.id,
		createdAt: new Date(),
		gradedBy: [],
		public: true,
		editable: false,
		isSynthetic: true,
		metadata: null,
	};

	const { error, data } = await supabase
		.schema("ai_auditing")
		.from("scenarios")
		.upsert(scenario)
		.select()
		.limit(1)
		.single();

	if (error) {
		throw new Error("Failed to add scenario: " + error.message);
	}

	if (!data) {
		throw new Error("Failed to add scenario: No data returned");
	}

	return data;
}

async function addScenarioContent(
	scenarioId: string,
	scenarioContent: ScenarioContent,
) {
	const supabase = await createServerClient();
	const { urinalysis, extras, otherLabs } = scenarioContent;
	const filteredContent = Object.fromEntries(
		Object.entries(scenarioContent).filter(
			([key, _]) =>
				key !== "vitals" &&
				key !== "chiefComplaint" &&
				key !== "urinalysis" &&
				key !== "extras" &&
				key !== "otherLabs",
		),
	);

	const _vitals = snakify(scenarioContent.vitals);
	const _chiefComplaint = snakify(scenarioContent.chiefComplaint);

	const content = snakify({
		...filteredContent,
		urinalysis: JSON.stringify(urinalysis),
		extras: JSON.stringify(extras),
		other_labs: JSON.stringify(otherLabs),
	});

	const { error, data } = await supabase
		.schema("ai_auditing")
		.from("scenario_content")
		.insert({ id: scenarioId, ...content })
		.select()
		.limit(1)
		.single();

	if (error) {
		throw new Error("Failed to add scenario content: " + error.message);
	}

	if (!data) {
		throw new Error("Failed to add scenario content: No data returned");
	}

	const { error: verror, data: vtls } = await supabase
		.schema("ai_auditing")
		.from("scenario_vitals")
		.insert({ id: scenarioId, ..._vitals })
		.select()
		.limit(1)
		.single();

	if (verror) {
		throw new Error("Failed to add scenario vitals: " + verror.message);
	}

	if (!vtls) {
		throw new Error("Failed to add scenario vitals: No data returned");
	}

	const { error: cerror, data: cc } = await supabase
		.schema("ai_auditing")
		.from("scenario_chief_complaints")
		.insert({ id: scenarioId, ..._chiefComplaint })
		.select()
		.limit(1)
		.single();

	if (cerror) {
		throw new Error(
			"Failed to add scenario chief complaint: " + cerror.message,
		);
	}

	return true;
}

async function addAIResponse(scenarioId: string, aiResponse: AIResponse) {
	const supabase = await createServerClient();

	const { error } = await supabase
		.schema("ai_auditing")
		.from("ai_scenario_responses")
		.insert({ id: scenarioId, ...aiResponse });

	if (error) {
		throw new Error("Failed to add AI response: " + error.message);
	}
}

async function summarizeChiefComplaint(data: ChiefComplaint): Promise<string> {
	// TODO: Implement AI call to summarize chief complaint
	return "";
}

async function summarizeMedicalHistory(data: TriageData): Promise<string[]> {
	// TODO: Implement AI call to summarize medical history
	return [];
}

async function summarizeLabs({
	urinalysis,
	otherLabs,
}: {
	urinalysis: Urinalysis | null;
	otherLabs: any;
}): Promise<string> {
	// TODO: Implement AI call to summarize labs
	return "";
}

async function getAIResponse(
	data: ScenarioContent,
	medicalHistorySummary: string[],
	labsSummary: string,
): Promise<AIResponse> {
	// TODO: Implement AI call to get triage response
	return {} as AIResponse;
}

async function fetchUngradedByUser(
	limit: number,
	userId: string,
	page: number,
) {
	const { data, error } = await getScenarios(limit, userId, page);

	console.log(JSON.stringify(data));

	const convertedData = camelize(data) as unknown as Scenario[];
	console.log(convertedData);

	if (error) {
		console.log("Error fetching scenarios: ", error);

		return new NextResponse(
			JSON.stringify({
				success: false,
				error: "Failed to fetch scenarios",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}

	return new NextResponse(
		JSON.stringify({ success: true, data: convertedData, error: null }),
		{
			status: 200,
			headers: {
				"Content-Type": "application/json",
			},
		},
	);
}

async function getScenarios(limit: number, userId: string, page: number) {
	const supabase = await createServerClient();

	return await supabase
		.schema("ai_auditing")
		.from("scenarios")
		.select(
			"id, created_at, author_id, updated_at, metadata, graded_by, editable, public, content: scenario_content(extras, age, height, weight, gender, chief_complaint : scenario_chief_complaints(title, details), medical_history : medical_history_summary, urinanalysis, other_labs, vitals : scenario_vitals(blood_pressure, pulse, respiratory_rate, temperature, oxygen_saturation, glucose_level, bhcg, other_vitals)), ai_response: ai_scenario_responses( triage: ai_triage_responses(level, confidence, reason),diagnosis: ai_diagnosis_responses(diagnosis, reason, confidence),treatment: ai_treatment_responses(reason,confidence, reccommendations) )",
		)
		.order("created_at", { ascending: true })
		.eq("public", true)
		.not("graded_by", "cs", `{"${userId}"}`)
		.range(page * limit, (page + 1) * limit - 1);
}

async function handleAddGrading(data: any, userId: string) {
	const supabase = await createServerClient();
	const { scenarioId } = data;

	const { error } = await supabase.rpc("append_graded_by", {
		row_id: scenarioId,
		user_id: userId,
	});

	if (error) {
		console.log("Error inserting grading23:", error);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to submit grading: " + error.message,
			},
			{ status: 500 },
		);
	}
	const filteredData = Object.fromEntries(
		Object.entries(data).filter(([key, _]) => key !== "id"),
	);

	const convertedGrading = snakify(filteredData);

	const { error: gerror } = await supabase
		.schema("ai_auditing")
		.from("scenario_gradings")
		.insert(convertedGrading);

	if (gerror) {
		console.log("Error inserting grading:", gerror);

		return NextResponse.json(
			{
				success: false,
				error: "Failed to submit grading: " + gerror.message,
			},
			{ status: 500 },
		);
	}

	return NextResponse.json(
		{
			success: true,
			error: null,
		},
		{ status: 200 },
	);
}

// data?.map((item) => ({
// 	id: item.id,
// 	createdAt: item.createdAt,
// 	updatedAt: item.updatedAt,
// 	authorId: item.authorId,
// 	metadata: item.metadata,
// 	gradedBy: item.gradedBy,
// 	editable: item.editable,
// 	public: item.public,
// 	content: {
// 		chiefComplaint: {
// 			title: item.content.chiefComplaint,
// 			description: item.content.complaintDetails,
// 		},
// 		vitals: {
// 			bloodPressure: item.content.bloodPressure,
// 			glucose: item.content.glucoseLevel,
// 			pulse: item.content.heartRate,
// 			oxygenSaturation: item.content.oxygenSaturation,
// 			respiratoryRate: item.content.respitoryRate,
// 			temperature: item.content.temperature,
// 			bhcg: item.content.bhcgLevel,
// 			otherVitals: item.content.otherVitals,
// 		},
// 		medicalHistory: item.content.medicalHistorySummary,
// 		age: item.content.age,
// 		height: item.content.height,
// 		weight: item.content.weight,
// 		gender: item.content.gender,
// 		extras: item.content.extras,
// 		urinalysis: item.content.urinanalysis,
// 	},

// 	aiResponse: {
// 		triageLevel: {
// 			level: item.aiResponse.triageLevel,
// 			confidence: item.aiResponse.triageConfidence,
// 			reasoning: item.aiResponse.triageReason,
// 		},
// 		diagnosis: {
// 			primary: item.aiResponse.diagnosis,
// 			confidence: item.aiResponse.diagnosisConfidence,
// 			reasoning: item.aiResponse.diagnosisReason,
// 		},
// 		treatment: {
// 			reccommendations: item.aiResponse.reccommendations,
// 			confidence: item.aiResponse.treatmentConfidence,
// 			reasoning: item.aiResponse.treatmentReason,
// 		},
// 	},
// })) as unknown as Scenario[];
