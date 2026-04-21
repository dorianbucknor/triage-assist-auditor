import { AIResponse } from "./types";
import { OpenAI } from "openai";

/**
 * Calls HuggingFace Inference API to generate AI response for triage scenarios
 * @param data - Scenario content as JSON string for the prompt
 * @param medicalHistorySummary - Summary of patient medical history
 * @param labsSummary - Summary of lab results
 * @returns Parsed AIResponse with diagnosis, triage, and treatment recommendations
 */
export async function callHFInference(
	data: string,
	medicalHistorySummary: string[],
	labsSummary: string,
): Promise<AIResponse> {
	const hfToken = process.env.HF_API_KEY;

	if (!hfToken) {
		throw new Error("HF_API_KEY environment variable is not set");
	}
	const client = new OpenAI({
		baseURL:
			"https://j9hkgfbvtpn4yil1.us-east-2.aws.endpoints.huggingface.cloud/v1/",
		apiKey: hfToken,
	});

	const chatCompletion = await client.chat.completions.create({
		model: "unsloth/medgemma-27b-it",
		messages: [
			{
				role: "system",
				content:
					"You are a medical assistant. Analyze patient triage data and return ONLY a JSON response with the keys: diagnosis (primary, reason, confidence), triage (level (using ESI: 1 | 2 | 3 |  4 | 5 number only), reason, confidence), and treatment (recommendations, reason, confidence).",
			},
			{
				role: "user",
				content: `Analyze this data: ${data}`,
			},
		],
		temperature: 0.1,
		response_format: { type: "json_object" },
		stream: false,
		max_tokens: 1000,
	});

	if (chatCompletion.choices && chatCompletion.choices.length > 0) {
		const responseData = chatCompletion.choices[0].message?.content;
		if (responseData) {
			try {
				const parsedResponse = JSON.parse(responseData);
				return parsedResponse as AIResponse;
			} catch (error) {
				console.error("Error parsing HF response JSON: ", error);
				console.error("HF response content:", responseData);
				throw new Error("Failed to parse HuggingFace response as JSON");
			}
		} else {
			console.error("No content in HF response message:", chatCompletion);
			throw new Error("HuggingFace response has no content");
		}
	} else {
		console.error("No choices in HF response:", chatCompletion);
		throw new Error("HuggingFace response has no choices");
	}

	// if (!hfResponse.ok) {
	// 	const errorData = await hfResponse.json();
	// 	console.error("HuggingFace API error:", errorData);
	// 	throw new Error(
	// 		`HuggingFace API failed: ${hfResponse.status} - ${JSON.stringify(errorData)}`,
	// 	);
	// }

	// const responseData = await hfResponse.json();
	// console.log("HF Raw response:", responseData);

	// // HF returns an array with generated_text property
	// let generatedText = "";

	// if (Array.isArray(responseData)) {
	// 	generatedText = responseData[0]?.generated_text || "";
	// } else if (responseData.generated_text) {
	// 	generatedText = responseData.generated_text;
	// }

	// // Extract JSON from the generated text
	// // Remove the prompt from the response
	// const jsonMatch = generatedText.match(/\{[\s\S]*\}/);

	// if (!jsonMatch) {
	// 	console.error("No JSON found in HF response:", generatedText);
	// 	throw new Error("Failed to extract JSON from HuggingFace response");
	// }

	// try {
	// 	const parsedResponse = JSON.parse(jsonMatch[0]);
	// 	return parsedResponse as AIResponse;
	// } catch (error) {
	// 	console.error("Error parsing HF response JSON: ", error);
	// 	console.error("Extracted JSON:", jsonMatch[0]);
	// 	throw new Error("Failed to parse HuggingFace response as JSON");
	// }
}
