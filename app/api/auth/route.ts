import { createServerClient } from "@/providers/supabase/server";
import { verify } from "crypto";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
	const { action, data } = await request.json();

	switch (action) {
		case "SEND_EMAIL_OTP":
			console.log(action, data);
			const { email, captchaToken } = data;
			if (validateEmail(email)) {
				await sendEmailOTP({
					email: email.trim().toLowerCase(),
					captchaToken: captchaToken,
				});
				return new Response(
					JSON.stringify({
						success: true,
						message: "Verification code sent",
					}),
					{ status: 200 },
				);
			} else {
				console.log("Invalid email format:", data.email);

				return new Response(
					JSON.stringify({
						success: false,
						data: null,
						error: "Invalid email format",
					}),
					{ status: 400 },
				);
			}

		case "VERIFY_EMAIL_OTP":
			await verifyOTP(data.email, data.otp, data.tokenHash);
			return new Response(
				JSON.stringify({
					success: true,
					message: "OTP verified successfully",
				}),
				{ status: 200 },
			);
		case "LOGIN":
			//todo
			// Implement your login logic here
			return new Response(
				JSON.stringify({
					success: true,
					message: "Logged in successfully",
				}),
				{ status: 200 },
			);
		case "LOGOUT":
			//todo
			// Implement your logout logic here
			return new Response(
				JSON.stringify({
					success: true,
					message: "Logged out successfully",
				}),
				{ status: 200 },
			);
		default:
			return new Response(
				JSON.stringify({ success: false, error: "Invalid action" }),
				{ status: 400 },
			);
	}
}

function validateEmail(email: string) {
	return /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(email.trim());
}

async function verifyOTP(
	email: string,
	otp: string,
	tokenHash: string,
): Promise<void> {
	try {
		const supabase = await createServerClient();

		const response = await supabase.auth.verifyOtp({
			email,
			// token_hash: tokenHash,
			token: otp,
			type: "email",
		});

		if (response.error) {
			//todo: remove
			console.error("OTP verification failed:", response.error);
			return Promise.reject(new Error("Invalid OTP"));
		}

		return Promise.resolve();
	} catch (error) {
		//todo: remove
		console.error("Error verifying OTP:", error);
		return Promise.reject(new Error("Failed to verify OTP"));
	}
}

async function sendEmailOTP({
	email,
	captchaToken,
}: {
	email: string;
	captchaToken?: string;
}): Promise<void> {
	try {
		const supabase = await createServerClient();

		const response = await supabase.auth.signInWithOtp({
			email: email,
			options: {
				emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/register`,
				shouldCreateUser: false,
				captchaToken: captchaToken || "",
			},
		}); // Adjust the redirect URL as needed

		if (response.error) {
			console.log(response.error);

			throw new Error(response.error.message);
		}

		console.log(`Sending OTP to ${email}`);
		return Promise.resolve();
	} catch (error) {
		console.error("Error sending OTP email:", error);
		throw new Error("Failed to send OTP email: " + error);
	}
}
