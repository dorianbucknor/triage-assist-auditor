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

export interface PatientScenario extends TriageData {
	scenarioId: string;
	createdAt: Date;
}

export interface Scenario {
	scenarioId: string;
	dateEntered: Date;
	public: boolean;

	triageData: TriageData;
	aiResponse: AIResponse;
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
		recommendations: string[];
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
