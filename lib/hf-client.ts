import { AIResponse } from "./types";
import { OpenAI } from "openai";

/**
 * Calls HuggingFace Inference API to generate AI response for triage scenarios
 * @param data - Scenario content as JSON string for the prompt
 * @param medicalHistorySummary - Summary of patient medical history
 * @param labsSummary - Summary of lab results
 * @returns Parsed AIResponse with diagnosis, triage, and treatment recommendations
 */
export async function callHFInference(data: string): Promise<AIResponse> {
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
					'You are a clinical decision support system. Analyze structured patient vitals and triage data. Output must be a single JSON object. \n\nSTRICT OUTPUT RULES:\n1. Every key defined in the schema MUST be present with non-empty values.\n2. Input fields marked as \'unknown\' should be clinically inferred based on available vitals and chief complaints.\n3. \'triage.level\' must be an integer (1-5) following ESI protocols.\n4. \'confidence\' must be a float between 0.0 and 1.0.\n\nSCHEMA:\n{\n  "diagnosis": { "primary": "string", "reason": "string", "confidence": number },\n  "triage": { "level": number, "reason": "string", "confidence": number },\n  "treatment": { "recommendations": ["string"], "reason": "string", "confidence": number }\n}',
			},
			{
				role: "user",
				content: `Analyze this data: ${data}`,
			},
		],
		temperature: 0.1,
		response_format: { type: "json_object" },
		stream: false,
		max_tokens: 1500,
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
}
