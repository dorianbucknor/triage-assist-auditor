// @ts-nocheck

import { verifySession } from "@/lib/dal";
import { Scenario } from "@/lib/types";
import { createServerClient } from "@/providers/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const { isAuth, userId } = await verifySession();

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
			case "fetch_ungraded_by_user":
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

export async function POST(request: NextRequest) {}

async function fetchUngradedByUser(
	limit: number,
	userId: string,
	page: number,
) {
	const { data, error } = await getScenarios(limit, userId, page);

	const convertedData = data?.map((item) => ({
		id: item.id,
		createdAt: item.createdAt,
		updatedAt: item.updatedAt,
		authorId: item.authorId,
		metadata: item.metadata,
		gradedBy: item.gradedBy,
		editable: item.editable,
		public: item.public,
		content: {
			chiefComplaint: {
				title: item.content.chiefComplaint,
				description: item.content.complaintDetails,
			},
			vitals: {
				bloodPressure: item.content.bloodPressure,
				glucose: item.content.glucoseLevel,
				pulse: item.content.heartRate,
				oxygenSaturation: item.content.oxygenSaturation,
				respiratoryRate: item.content.respitoryRate,
				temperature: item.content.temperature,
				bhcg: item.content.bhcgLevel,
				otherVitals: item.content.otherVitals,
			},
			medicalHistory: item.content.medicalHistorySummary,
			age: item.content.age,
			height: item.content.height,
			weight: item.content.weight,
			gender: item.content.gender,
			extras: item.content.extras,
			urinalysis: item.content.urinanalysis,
		},

		aiResponse: {
			triageLevel: {
				level: item.aiResponse.triageLevel,
				confidence: item.aiResponse.triageConfidence,
				reasoning: item.aiResponse.triageReason,
			},

			diagnosis: {
				primary: item.aiResponse.diagnosis,
				confidence: item.aiResponse.diagnosisConfidence,
				reasoning: item.aiResponse.diagnosisReason,
			},
			treatment: {
				reccommendations: item.aiResponse.reccommendations,
				confidence: item.aiResponse.treatmentConfidence,
				reasoning: item.aiResponse.treatmentReason,
			},
		},
	})) as unknown as Scenario[];

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
			"id, createdAt:created_at, authorId:author_id, updatedAt:updated_at, metadata, gradedBy:graded_by, editable, public, content: scenario_content(extras, age, height, weight, gender, chiefComplaint : chief_complaint, complaintDetails : complaint_details, medicalHistorySummary : medical_history_summary, urinanalysis : urinanalysis, otherLabs : other_labs, bloodPressure : blood_pressure, heartRate : heart_rate, respitoryRate : respitory_rate, temperature : temperature, oxygenSaturation : oxygen_saturation, glucoseLevel : glucose_level, bhcgLevel : bhcg_level, otherVitals : other_vitals), aiResponse: ai_scenario_responses( triageLevel: triage_level, triageConfidence: triage_confidence, triageReason: triage_reason, diagnosis, diagnosisReason: diagnosis_reason, diagnosisConfidence: diagnosis_confidence, reccommendations: treatment, treatmentReason: treatment_reason, treatmentConfidence: treatment_confidence)",
		)
		.order("created_at", { ascending: true })
		.eq("public", true)
		.not("graded_by", "cs", `{"${userId}"}`)
		.range(page * limit, (page + 1) * limit - 1);
}
