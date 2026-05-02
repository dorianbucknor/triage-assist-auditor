/* eslint-disable @typescript-eslint/no-explicit-any */
import { verifySession } from "@/lib/dal";
import { createServerClient } from "@/providers/supabase/server";
import { SupabaseClient } from "@supabase/supabase-js";
import camelize from "camelize-ts";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
	const superbase = await createServerClient();

	const { loggedIn } = await verifySession();

	if (!loggedIn) {
		return new NextResponse(
			JSON.stringify({
				success: false,
				message: "Unauthorized",
			}),
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

	console.log(request.nextUrl.searchParams);

	if (action) {
		switch (action) {
			case "GET_REQUESTS":
				const page = parseInt(searchParams.get("page") || "0");
				const limit = parseInt(searchParams.get("amount") || "10");
				return await getRequests(superbase, page, limit);
			default:
				return new NextResponse(
					JSON.stringify({ success: false, error: "Invalid action" }),
					{
						status: 400,
						headers: { "Content-Type": "application/json" },
					},
				);
		}
	} else {
		console.log("GET request received without action parameter");

		return new NextResponse(
			JSON.stringify({ success: false, error: "Request Error" }),
			{
				status: 400,
				headers: { "Content-Type": "application/json" },
			},
		);
	}
}
async function getRequests(
	superbase: SupabaseClient<any, "public", "public", any, any>,
	page: number = 0,
	limit: number = 10,
): Promise<NextResponse> {
	try {
		const { data, error } = await superbase
			.from("access_requests")
			.select("*")
			.order("created_at", { ascending: false })
			.range(page * limit, (page + 1) * limit - 1);

		if (error) {
			console.error("Error fetching access requests:", error);
			return new NextResponse(
				JSON.stringify({
					success: false,
					data: null,
					error: error.message,
				}),
				{
					status: 500,
					headers: {
						"Content-Type": "application/json",
					},
				},
			);
		}

		const transformedData = data.map((request) => camelize(request));

		console.log(JSON.stringify(data));

		return new NextResponse(
			JSON.stringify({
				success: true,
				data: transformedData,
				error: null,
			}),
			{
				status: 200,
				headers: {
					"Content-Type": "application/json",
				},
			},
		);
	} catch (error) {
		console.log(
			"Unexpected error fetching access requests:",
			error instanceof Error ? error.message : error,
		);

		return new NextResponse(
			JSON.stringify({
				success: false,
				data: null,
				error: error instanceof Error ? error.message : "Unknown error",
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
export async function POST(request: NextRequest) {
	try {
		const { action, data } = await request.json();

		const superbase = await createServerClient();

		switch (action) {
			case "NEW_REQUEST":
				return await addNewRequest(superbase, data);
			default:
				return new NextResponse(
					JSON.stringify({
						success: false,
						error: "Invalid action",
					}),
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

async function addNewRequest(
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
