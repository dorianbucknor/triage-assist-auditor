/* eslint-disable @typescript-eslint/no-explicit-any */
import { createServerClient } from "@/providers/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
	try {
		const { action, data } = await request.json();

		const superbase = await createServerClient();

		switch (action) {
			case "submit_access_request":
				return await handleAccessRequest(superbase, data);
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
	} catch (error) {
		console.log(error); //todo: remove this log and handle error properly

		return new NextResponse(
			JSON.stringify({
				success: false,
				message: "An error occurred",
				error,
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

async function handleAccessRequest(
	superbase: SupabaseClient<any, "public", "public", any, any>,
	data: any,
) {
	const result = await superbase.from("access_requests").insert({
		first_name: data.firstName,
		last_name: data.lastName,
		email: data.email,
		professional_role: data.role,
		registration_number: data.registrationNumber,
		institution: data.institution,
		tos_accepted: data.tosAccepted,
		tos_accepted_at: new Date(Date.now()).toISOString(),
		registration_status: "pending",
		speciality: null,
		approved_at: null,
		denied: false,
		denial_reason: null,
	});

	if (result.error) {
		console.error("Error inserting access request:", result.error);
		return new NextResponse(
			JSON.stringify({
				success: false,
				error: result.error.message,
				redirect: "/auth/register",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	}

	return new NextResponse(JSON.stringify({ success: true, redirect: "/" }), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
		},
	});
}
