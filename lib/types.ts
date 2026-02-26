/* eslint-disable @typescript-eslint/no-explicit-any */
import { Session } from "@supabase/supabase-js";
export type UserRole = "admin" | "editor" | "viewer" | "user";

export interface TriageData {
	// Demographics
	age: number | null;
	gender: string;
	height: number | null | undefined;
	weight: number | null | undefined;
	// Chief Complaint & History
	chiefComplaint: { title: string; description: string };
	modeOfArrival: string;
	mentalStatus: string;
	respiratoryStatus: string;
	// Past Medical History
	medicalHistory: string[];
	currentMedication: string[];
	// Social History
	smoker: string | null;
	alcohol: string | null;
	// Additional History
	allergies: string[];
	surgicalHistory: string[];
	immunization: string[];
	// Vitals
	vitals: {
		temperature: number | null;
		pulse: number | null;
		respiratoryRate: number | null;
		bloodPressure: string;
		oxygenSaturation: number | null;
		glucose: number | null;
		bhcg: string;
	};
	// Urinalysis
	urinalysis: {
		blood: string;
		nitrites: string;
		protein: string;
		bilirubin: string;
		glucose: string;
		pH: string;
		wbc: string;
		ketones: string;
	} | null;
}
export type APIResponse<T> = {
	error: string | null;
	redirect: string | null;
	success: boolean;
	data: T;
};
export interface PatientScenario extends TriageData {
	scenarioId: string;
	createdAt: Date;
}

export interface Scenario {
	id: string;
	authorId: string;
	createdAt: Date;
	updatedAt: Date;
	gradedBy: string[] | null;
	public: boolean;
	editable: boolean;
	triageData: TriageData | null;
	aiResponse: AIResponse;
	content: ScenarioContent;
	metadata: {
		[key: string]: any;
	} | null;
}
export interface ScenarioContent {
	// Demographics
	age: number | null;
	gender: string;
	height: number | null;
	weight: number | null;
	// Chief Complaint & History
	chiefComplaint: ChiefComplaint;
	// Past Medical History
	medicalHistory: string[];
	// Vitals
	vitals: Vitals | null;
	// Urinalysis
	urinalysis: Urinalysis | null;
	extras: {
		[key: string]: any;
	} | null;
	otherLabs: {
		[key: string]: any;
	} | null;
}

export interface ChiefComplaint {
	title: string;
	description: string;
}
export interface Urinalysis {
	blood: string | null;
	nitrites: string | null;
	protein: string | null;
	bilirubin: string | null;
	glucose: string | null;
	pH: string | null;
	wbc: string | null;
	ketones: string | null;
}
export enum TriageLevel {
	ESI1 = "ESI-1",
	ESI2 = "ESI-2",
	ESI3 = "ESI-3",
	ESI4 = "ESI-4",
	ESI5 = "ESI-5",
}
export interface Vitals {
	temperature: number | null;
	pulse: number | null;
	respiratoryRate: number | null;
	bloodPressure: string | null;
	oxygenSaturation: number | null;
	glucose: number | null;
	bhcg: string | null;
	otherVitals?: {
		[key: string]: unknown;
	} | null;
}
export interface AIResponse {
	triageLevel: {
		level: "ESI-1" | "ESI-2" | "ESI-3" | "ESI-4" | "ESI-5";
		reasoning: string;
		confidence: number;
	};
	diagnosis: {
		primary: string;
		reasoning: string;
		confidence: number;
	};
	treatment: {
		reccommendations: string[];
		reasoning: string;
		confidence: number;
	};
}

export interface ClinicalGrading {
	triageLevelScale: number; // 1-5
	correctTriageLevel?: string;
	diagnosisScale: number; // 1-5
	correctDiagnosis?: string;
	treatmentScale: number; // 1-5
	correctTreatment?: string;
	notes?: string;
}

export interface AccessRequest {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	professionalRole: string;
	registrationNumber: string;
	institution: string;
	tosAccepted: boolean;
	tosAcceptedAt: Date;
	registrationStatus:
		| "pending"
		| "confirmed"
		| "under_review"
		| "unconfirmed";
	speciality: string | null;
	approvedAt: Date | null;
	denied: boolean;
	denialReason: string | null;
	createdAt: Date;
	updatedAt: Date;
}

export interface ClinicianProfile {
	professionalRole: string;
	registrationNumber: string;
	institution: string;
	speciality: string | null;
	createdAt: Date;
	updatedAt: Date;
}
export interface UserProfile {
	id: string;
	firstName: string;
	lastName: string;
	email: string;
	role: string;
	tosAccepted: boolean;
	emailVerified: boolean;
	disabled: boolean;
	updatedAt: Date;
	createdAt: Date;
}
export interface UserData extends UserProfile {
	clinicianProfile: ClinicianProfile | null;
}
export interface User {
	data: UserData | null;
	session: Session | null;
}
