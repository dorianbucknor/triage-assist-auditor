/* eslint-disable @typescript-eslint/no-explicit-any */
//
// This file defines the API routes for handling scenarios in the TriageAssist application. It includes endpoints for creating new scenarios, fetching ungraded scenarios for a user, and submitting grading for scenarios. The API interacts with a Supabase database to store and retrieve scenario data, including scenario content and AI-generated responses. The code also includes placeholder functions for summarizing chief complaints, medical history, and labs using AI, as well as generating AI responses based on scenario content.

//==== ignore typescript errors in this file since it's a server component and we can be more flexible with types here ====
//
//

import { verifySession } from "@/lib/dal";
import {
	AIResponse,
	APIResponse,
	ChiefComplaint,
	Scenario,
	ScenarioContent,
	TriageData,
	Urinalysis,
	Vitals,
} from "@/lib/types";
import { createServerClient } from "@/providers/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import camelize from "camelize-ts";
import snakify, { Snakify } from "snakify-ts";
import { callHFInference } from "@/lib/hf-client";
import { SupabaseClient } from "@supabase/supabase-js";
// import logger from "@/providers/vestig/vestig";

export async function GET(request: NextRequest) {
	const { loggedIn: isAuth, userId } = await verifySession();

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
			case "GET_USER_SCENARIOS":
				const userLimit = parseInt(searchParams.get("amount") || "10");
				const userPage = parseInt(searchParams.get("page") || "0");
				return await fetchUserScenarios(userLimit, userId, userPage);
			case "GET_SCENARIO":
				const scenarioId = searchParams.get("scenarioId");
				if (!scenarioId) {
					return new NextResponse(
						JSON.stringify({
							success: false,
							error: "scenarioId is required",
						}),
						{
							status: 400,
							headers: {
								"Content-Type": "application/json",
							},
						},
					);
				}
				return await fetchScenarioById(scenarioId);
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
	const { loggedIn: isAuth, userId } = await verifySession();

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
			return await handleAddScenario(data, userId!);
		case "ADD_TEST_SCENARIO":
			return await handleTestScenario(data, userId!);
		case "ADD_GRADING":
			return await handleAddGrading(data, data.authorId);
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
type TriageAssistData = {
	id: string;
	hadmId: string;
	stayId: string;
	subjectId: string;
	age: number;
	gender: string;
	race: string;
	chiefComplaint: {
		title: string;
		description: string;
	};
	modeOfArrival: string;
	vitals: {
		temperature: number;
		pulse: number;
		respiratoryRate: number;
		bloodPressure: string;
		sbp: number;
		dbp: number;
		oxygenSaturation: number;
		painScore: number;
	};
	clinicianTriage: {
		diagnosis: {
			icdCode: string;
			primary: string;
		};
		inTime: string; // ISO 8601 datetime string
		outTime: string; // ISO 8601 datetime string
		triageLevel: string;
		triageDuration: number; // in seconds
	};
};
async function handleTestScenario(data: TriageAssistData, userId: string) {
	try {
		const { clinicianTriage, stayId, subjectId, hadmId, ...scrubbedData } =
			data;

		// const scrubbedData = Object.entries(preScrub).map(([key, value]) => {
		// 	if (
		// 		value?.toString().toLowerCase() !== "unknown" &&
		// 		value !== null &&
		// 		value !== undefined &&
		// 		value !== ""
		// 	) {
		// 		// console.log(`Key ${key} has value "unknown", replacing with null`);
		// 		return { key, value };
		// 	}
		// });

		//create summaries using AI
		// const medicalHistorySummary =
		// 	await summarizeMedicalHistory(scrubbedData);
		// const labsSummary = await summarizeLabs({
		// 	urinalysis: scrubbedData.urinanalysis,
		// 	otherLabs: scrubbedData.otherLabs,
		// });

		// const scenarioData = (await addScenario()) as Scenario;

		//convert to scenario content
		// const scenarioContent = {
		// 	id: data.id,
		// 	age: scrubbedData.age,
		// 	weight: scrubbedData.weight,
		// 	height: scrubbedData.height,
		// 	gender: scrubbedData.gender,
		// 	chiefComplaint: scrubbedData.chiefComplaint,
		// 	medicalHistorySummary: medicalHistorySummary,
		// 	vitals: scrubbedData.vitals,
		// 	urinanalysis: scrubbedData.urinanalysis,
		// 	otherLabs: scrubbedData.otherLabs,
		// 	labsSummary,
		// };

		// await addScenarioContent(scenarioData.id, scenarioContent);

		//get AI response
		const aiResponse = await getAIResponse(JSON.stringify(scrubbedData));

		// await addAIResponse(scenarioData.id, aiResponse);

		return new NextResponse(
			JSON.stringify({
				success: true,
				error: null,
				data: {
					// ...scenarioData,
					// content: scenarioContent,./
					aiTriage: aiResponse,
					...data,
				},
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
			JSON.stringify({
				success: false,
				error: "Failed to add scenario: " + error,
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}
}

async function handleAddScenario(data: TriageData, userId: string) {
	try {
		const scrubbedData = JSON.parse(
			JSON.stringify(data).replaceAll('"unknown"', "null"),
		);

		//create summaries using AI
		const medicalHistorySummary =
			await summarizeMedicalHistory(scrubbedData);
		const labsSummary = await summarizeLabs({
			urinalysis: scrubbedData.urinanalysis,
			otherLabs: scrubbedData.otherLabs,
		});

		const scenarioData = (await addScenario()) as Scenario;

		//convert to scenario content
		const scenarioContent = {
			triageId: scrubbedData.id,
			id: scenarioData.id,
			subjectId: scrubbedData.subjectId,
			age: scrubbedData.age,
			weight: scrubbedData.weight,
			height: scrubbedData.height,
			gender: scrubbedData.gender,
			chiefComplaint: scrubbedData.chiefComplaint,
			medicalHistorySummary: medicalHistorySummary,
			vitals: scrubbedData.vitals,
			urinanalysis: scrubbedData.urinanalysis,
			otherLabs: scrubbedData.otherLabs,
			labsSummary,
		} as ScenarioContent;

		await addScenarioContent(scenarioData.id, scenarioContent);

		//get AI response
		const aiResponse = await getAIResponse(scenarioContent);

		await addAIResponse(scenarioData.id, aiResponse);

		return new NextResponse(
			JSON.stringify({
				success: true,
				error: null,
				data: {
					...scenarioData,
					content: scenarioContent,
					aiResponse,
					triageData: scrubbedData,
				} as Scenario,
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
			JSON.stringify({
				success: false,
				error: "Failed to add scenario: " + error,
			}),
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

	const { loggedIn, userId } = await verifySession();

	if (!loggedIn) {
		throw new Error("Unauthorized");
	}

	const scenario = {
		authorId: userId,
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
		.insert(snakify(scenario))
		.select()
		.limit(1)
		.single();

	console.log("Scenario: " + JSON.stringify(data));

	if (error) {
		throw new Error("Failed to add scenario: " + error.message);
	}

	if (!data) {
		throw new Error("Failed to add scenario: No data returned");
	}

	// const scenarioData = camelize(data) as unknown as Scenario;

	return data;
}

async function addScenarioContent(
	scenarioId: string,
	scenarioContent: ScenarioContent,
) {
	const supabase = await createServerClient();

	try {
		const { urinalysis, extras, otherLabs } = scenarioContent;
		const filteredContent = Object.fromEntries(
			Object.entries(scenarioContent).filter(
				([key, _]) =>
					key !== "vitals" &&
					key !== "chiefComplaint" &&
					key !== "urinalysis" &&
					key !== "extras" &&
					key !== "triageId" &&
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
			.select("id")
			.limit(1)
			.single();

		if (error) {
			throw new Error("Failed to add scenario content: " + error.message);
		}

		if (!data) {
			throw new Error("Failed to add scenario content: No data returned");
		}

		await insertScenarioVitals(supabase, scenarioId, _vitals);

		await insertScenarioChiefComplaint(
			supabase,
			scenarioId,
			_chiefComplaint,
		);

		console.log("Successfully added scenario content for scenario", {
			scenarioId,
		});

		return true;
	} catch (error) {
		console.error("Error adding scenario content: ", error, {
			scenarioId,
		});

		await supabase
			.schema("ai_auditing")
			.from("scenarios")
			.delete()
			.eq("id", scenarioId);

		throw new Error("Failed to add scenario content: " + error);
	}
}

async function insertScenarioChiefComplaint(
	supabase: SupabaseClient<any, "public", "public", any, any>,
	scenarioId: string,
	_chiefComplaint: { title: string; description: string },
) {
	const { error, data } = await supabase
		.schema("ai_auditing")
		.from("scenario_chief_complaints")
		.insert({ id: scenarioId, ..._chiefComplaint })
		.select()
		.limit(1)
		.single();

	if (error) {
		throw new Error(
			"Failed to add scenario chief complaint: " + error.message,
		);
	}

	if (!data) {
		throw new Error(
			"Failed to add scenario chief complaint: No data returned",
		);
	}
}
type SNVitals = Snakify<Vitals>;

async function insertScenarioVitals(
	supabase: SupabaseClient<any, "public", "public", any, any>,
	scenarioId: string,
	_vitals: SNVitals | null | undefined,
) {
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
}

async function addAIResponse(scenarioId: string, aiResponse: AIResponse) {
	const supabase = await createServerClient();
	try {
		const { loggedIn } = await verifySession();

		if (!loggedIn) {
			throw new Error("Unauthorized");
		}

		const payload = {
			public: true,
			created_at: new Date(),
			ai_model_used: "unsloth/medgemma-27b-it",
		};

		const { error, data } = await supabase
			.schema("ai_auditing")
			.from("ai_scenario_responses")
			.insert({ id: scenarioId, ...payload })
			.select()
			.limit(1)
			.single();

		if (error) {
			throw new Error("Failed to add AI response: " + error.message);
		}

		if (!data) {
			throw new Error("Failed to add AI response: No data returned");
		}

		await insertTriage(supabase, scenarioId, aiResponse);

		await insertDiagnosis(supabase, scenarioId, aiResponse);

		await insertTreatment(supabase, scenarioId, aiResponse);

		console.log("Successfully added AI response for scenario", {
			scenarioId,
		});

		return true;
	} catch (error) {
		await supabase
			.schema("ai_auditing")
			.from("ai_scenario_responses")
			.delete()
			.eq("id", scenarioId);

		await supabase
			.schema("ai_auditing")
			.from("scenarios")
			.delete()
			.eq("id", scenarioId);

		console.error("Error adding AI response: ", error, {
			scenarioId,
		});
		throw new Error("Failed to add AI response: " + error);
	}
}

async function insertTriage(
	supabase: SupabaseClient<any, "public", "public", any, any>,
	scenarioId: string,
	aiResponse: AIResponse,
) {
	const { error: terror } = await supabase
		.schema("ai_auditing")
		.from("ai_triage_responses")
		.insert({ id: scenarioId, ...snakify(aiResponse.triage) });

	if (terror) {
		throw new Error("Failed to add AI triage response: " + terror.message);
	}
}

async function insertDiagnosis(
	supabase: SupabaseClient<any, "public", "public", any, any>,
	scenarioId: string,
	aiResponse: AIResponse,
) {
	const { error: derror } = await supabase
		.schema("ai_auditing")
		.from("ai_diagnosis_responses")
		.insert({ id: scenarioId, ...snakify(aiResponse.diagnosis) });

	if (derror) {
		throw new Error(
			"Failed to add AI diagnosis response: " + derror.message,
		);
	}
}

async function insertTreatment(
	supabase: SupabaseClient<any, "public", "public", any, any>,
	scenarioId: string,
	aiResponse: AIResponse,
) {
	const { error: treason } = await supabase
		.schema("ai_auditing")
		.from("ai_treatment_responses")
		.insert({ id: scenarioId, ...snakify(aiResponse.treatment) });

	if (treason) {
		throw new Error(
			"Failed to add AI treatment response: " + treason.message,
		);
	}
}

async function summarizeChiefComplaint(data: ChiefComplaint): Promise<string> {
	return data.title + ": " + data.description;
}

async function summarizeMedicalHistory(data: TriageData): Promise<string[]> {
	// TODO: Implement AI call to summarize medical history
	const history = [
		`Social History: Smoker - ${data.smoker}, Alcohol - ${data.alcohol}`,
		`Allergies: ${data.allergies?.join(", ")}`,
		`Surgical History: ${data.surgicalHistory?.join(", ")}`,
		`Immunization: ${data.immunization?.join(", ")}`,
		`Medical History: ${data.medicalHistory?.join(", ")}`,
	];
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
	data: ScenarioContent | string,
): Promise<AIResponse> {
	try {
		return await callHFInference(
			typeof data === "string" ? data : JSON.stringify(data),
		);
	} catch (error) {
		throw new Error(
			"Failed to get AI response: " +
				(error instanceof Error ? error.message : error),
		);
	}
}

async function fetchUngradedByUser(
	limit: number,
	userId: string,
	page: number,
): Promise<NextResponse> {
	const { data, error } = await getScenarios(limit, userId, page);
	const convertedData = camelize(data) as unknown as Scenario[];

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

async function fetchUserScenarios(
	limit: number,
	userId: string,
	page: number,
): Promise<NextResponse> {
	const { data, error } = await getUserCreatedScenarios(limit, userId, page);
	const convertedData = camelize(data) as unknown as Scenario[];

	if (error) {
		console.error("Error fetching user scenarios: ", error, {
			userId,
		});

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

	console.log("Successfully fetched user scenarios", {
		userId,
		count: convertedData.length,
	});

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

async function getUserCreatedScenarios(
	limit: number,
	userId: string,
	page: number,
) {
	const supabase = await createServerClient();

	return await supabase
		.schema("ai_auditing")
		.from("scenarios")
		.select(
			"id, created_at, author_id, updated_at, metadata, graded_by, editable, public, content: scenario_content(extras, age, height, weight, gender, chief_complaint : scenario_chief_complaints(title, description), medical_history : medical_history_summary, urinanalysis, other_labs, vitals : scenario_vitals(blood_pressure, pulse, respiratory_rate, temperature, oxygen_saturation, glucose, bhcg, other_vitals)), ai_response: ai_scenario_responses( triage: ai_triage_responses(level, confidence, reason),diagnosis: ai_diagnosis_responses(primary, reason, confidence),treatment: ai_treatment_responses(reason,confidence, recommendations) )",
		)
		.order("created_at", { ascending: false })
		.eq("author_id", userId)
		.range(page * limit, (page + 1) * limit - 1);
}

async function fetchScenarioById(scenarioId: string): Promise<NextResponse> {
	const supabase = await createServerClient();

	const { data, error } = await supabase
		.schema("ai_auditing")
		.from("scenarios")
		.select(
			"id, created_at, author_id, updated_at, metadata, graded_by, editable, public, content: scenario_content(extras, age, height, weight, gender, chief_complaint : scenario_chief_complaints(title, description), medical_history : medical_history_summary, urinanalysis, other_labs, vitals : scenario_vitals(blood_pressure, pulse, respiratory_rate, temperature, oxygen_saturation, glucose, bhcg, other_vitals)), ai_response: ai_scenario_responses( triage: ai_triage_responses(level, confidence, reason),diagnosis: ai_diagnosis_responses(primary, reason, confidence),treatment: ai_treatment_responses(reason,confidence, recommendations) )",
		)
		.eq("id", scenarioId)
		.single();

	if (error) {
		console.error("Error fetching scenario: ", error, {
			scenarioId,
		});

		return new NextResponse(
			JSON.stringify({
				success: false,
				error: "Failed to fetch scenario",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}

	const convertedData = camelize(data) as unknown as Scenario;

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
			"id, created_at, author_id, updated_at, metadata, graded_by, editable, public, content: scenario_content(extras, age, height, weight, gender, chief_complaint : scenario_chief_complaints(title, description), medical_history : medical_history_summary, urinanalysis, other_labs, vitals : scenario_vitals(blood_pressure, pulse, respiratory_rate, temperature, oxygen_saturation, glucose, bhcg, other_vitals)), ai_response: ai_scenario_responses( triage: ai_triage_responses(level, confidence, reason),diagnosis: ai_diagnosis_responses(primary, reason, confidence),treatment: ai_treatment_responses(reason,confidence, recommendations) )",
		)
		.order("created_at", { ascending: true })
		.eq("public", true)
		.not("graded_by", "cs", `{"${userId}"}`)
		.range(page * limit, (page + 1) * limit - 1);
}

async function handleAddGrading(data: any, userId: string) {
	const supabase = await createServerClient();
	const { scenarioId } = data;

	const filteredData = Object.fromEntries(
		Object.entries(data).filter(([key, _]) => key !== "id"),
	);

	const convertedGrading = snakify(filteredData);

	const { error: gerror } = await supabase
		.schema("ai_auditing")
		.from("scenario_gradings")
		.insert(convertedGrading);

	if (gerror) {
		console.error("Error inserting grading:", gerror, {
			scenarioId,
			userId,
		});

		return NextResponse.json(
			{
				success: false,
				error: "Failed to submit grading: " + gerror.message,
			},
			{ status: 500 },
		);
	}

	const { error } = await supabase.rpc("append_graded_by", {
		row_id: scenarioId,
		user_id: userId,
	});

	if (error) {
		console.error("Error inserting grading23:", error, {
			scenarioId,
			userId,
		});

		return NextResponse.json(
			{
				success: false,
				error: "Failed to submit grading: " + error.message,
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
