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
} from "@/lib/types";
import { createServerClient } from "@/providers/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import camelize from "camelize-ts";
import snakify from "snakify-ts";
import { callHFInference } from "@/lib/hf-client";
import { SupabaseClient } from "@supabase/supabase-js";

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
			return await handleAdd(data, userId!);
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

// async function handleAddMultipleScenarios(data: TriageData, userId: string) {
// 	// const results = [];
// 	// for (const scenarioData of data) {
// 		try {
// 			try {
// 				//create summaries using AI
// 				const complaintDetails = await summarizeChiefComplaint(
// 					scenarioData.chiefComplaint,
// 				);
// 				const medicalHistorySummary =
// 					await summarizeMedicalHistory(scenarioData);
// 				const labsSummary = await summarizeLabs({
// 					urinalysis: scenarioData.urinanalysis,
// 					otherLabs: scenarioData.otherLabs,
// 				});

// 				//convert to scenario content
// 				const scenarioContent = {
// 					subjectId: scenarioData.subjectId,
// 					age: scenarioData.age,
// 					weight: scenarioData.weight,
// 					height: scenarioData.height,
// 					gender: scenarioData.gender,
// 					chiefComplaint: {
// 						...scenarioData.chiefComplaint,
// 						details: complaintDetails,
// 					},
// 					medicalHistorySummary: medicalHistorySummary,
// 					vitals: scenarioData.vitals,
// 					urinanalysis: scenarioData.urinanalysis,
// 					otherLabs: scenarioData.otherLabs,
// 					labsSummary,
// 				} as ScenarioContent;

// 				//get AI response
// 				const aiResponse = await getAIResponse(
// 					scenarioData,
// 					medicalHistorySummary,
// 					labsSummary,
// 				);

// 				const scenario = {
// 					aiResponse,
// 					content: scenarioContent,
// 					triageData: scenarioData,
// 					authorId: userId!,
// 					id: crypto.randomUUID(),
// 					createdAt: new Date(),
// 					updatedAt: new Date(),
// 					gradedBy: [],
// 					public: true,
// 					editable: false,
// 					metadata: null,
// 				} as Scenario;

// 				results.push({
// 					scenarioId: scenario.id,
// 					status: "success",
// 					data: scenario,
// 					error: null,
// 				});
// 			} catch (error) {
// 				console.error("Error adding scenario: ", error);
// 			}
// 		} catch (error) {
// 			console.error("Error adding scenario: ", error);
// 			results.push({
// 				scenarioId: null,
// 				status: "failure",
// 				data: null,
// 				error: error instanceof Error ? error.message : "Unknown error",
// 			});
// 		}
// 	}
// 	return new NextResponse(
// 		JSON.stringify({ success: true, error: null, data: results  }),
// 		{
// 			status: 200,
// 			headers: {
// 				"Content-Type": "application/json",
// 			},
// 		},
// 	);
// }

//1. Use data as TriageData
//2. Convert TriageData to ScenarioContent and AIResponse and store in DB by:
//  a. Use AI (accessed by external api) to summarize the mode of arrival, mental status and respiratory status into a chief complaint details
//  b. Use AI to summarize the social history (previous/current smoker, previous/current alcoholic), allergies, past surgeries, immunizaion, medical history and current medications into a medical history summary
//  c. Use AI to summarize the urinalysis and any other labs into a labs summary
//3. Use AI to get a Triage reponse based on AIResponse format and store in DB
//4. Store the Scenario in DB with public = false and editable = true flags so that the creator can edit the scenario and make it public when ready for grading
//5. Store the scenario contennt
//6. Return success or failure response based on DB operation result
async function handleAdd(data: TriageData, userId: string) {
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
		// const aiResponse = {
		// 	diagnosis: {
		// 		primary: "Acute cystitis",
		// 		reason: "The patient presents with dysuria, frequency, and urgency, which are classic symptoms of a urinary tract infection. The urinalysis shows positive nitrites and leukocyte esterase, supporting the diagnosis of a bacterial infection in the bladder.",
		// 		confidence: 0.95,
		// 	},
		// 	triage: {
		// 		level: 4,
		// 		reason: "The patient is stable with no signs of systemic infection or sepsis. The symptoms are localized to the urinary tract, and there are no indications of severe distress or need for immediate intervention.",
		// 		confidence: 0.9,
		// 	},
		// 	treatment: {
		// 		reccommendations: [
		// 			"Empiric antibiotic therapy targeting common uropathogens, such as trimethoprim-sulfamethoxazole or nitrofurantoin.",
		// 			"Encourage increased fluid intake to help flush the urinary system.",
		// 			"Recommend over-the-counter pain relievers, such as phenazopyridine, for symptomatic relief of dysuria.",
		// 			"Advise the patient to monitor symptoms and seek medical attention if they worsen or if they develop fever, flank pain, or signs of systemic infection.",
		// 		],
		// 		reason: "The treatment recommendations are based on standard guidelines for managing uncomplicated urinary tract infections, which include empiric antibiotics and supportive care. The high confidence in the diagnosis supports the use of targeted therapy.",
		// 		confidence: 0.9,
		// 	},
		// } as AIResponse;

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


    const { loggedIn, userId } = await verifySession()

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

	console.log("Scenario Id: " + scenarioId);

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

	return true;
}

async function insertTriage(supabase: SupabaseClient<any, "public", "public", any, any>, scenarioId: string, aiResponse: AIResponse) {
    const { error: terror } = await supabase
        .schema("ai_auditing")
        .from("ai_triage_responses")
        .insert({ id: scenarioId, ...snakify(aiResponse.triage) });

    if (terror) {
        throw new Error("Failed to add AI triage response: " + terror.message);
    }
}

async function insertDiagnosis(supabase: SupabaseClient<any, "public", "public", any, any>, scenarioId: string, aiResponse: AIResponse) {
    const { error: derror } = await supabase
        .schema("ai_auditing")
        .from("ai_diagnosis_responses")
        .insert({ id: scenarioId, ...snakify(aiResponse.diagnosis) });

    if (derror) {
        throw new Error(
            "Failed to add AI diagnosis response: " + derror.message
        );
    }
}

async function insertTreatment(supabase: SupabaseClient<any, "public", "public", any, any>, scenarioId: string, aiResponse: AIResponse) {
    const { error: treason } = await supabase
        .schema("ai_auditing")
        .from("ai_treatment_responses")
        .insert({ id: scenarioId, ...snakify(aiResponse.treatment) });

    if (treason) {
        throw new Error(
            "Failed to add AI treatment response: " + treason.message
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

async function getAIResponse(data: ScenarioContent): Promise<AIResponse> {
    try {
        return await callHFInference(JSON.stringify(data));
    } catch (error) {
        throw new Error("Failed to get AI response: " + (error instanceof Error ? error.message : "Unknown error"));
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
		console.log("Error fetching user scenarios: ", error);

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
		console.log("Error fetching scenario: ", error);

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
		console.log("Error inserting grading:", gerror);

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
		console.log("Error inserting grading23:", error);

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
