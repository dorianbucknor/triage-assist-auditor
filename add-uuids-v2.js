const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

// Generate UUID v4
function generateUUID() {
	return crypto.randomUUID();
}

const dataDir = "./mimic-iv-ed-demo-2.2/transformed_data";

// Read all_scenarios.json
const allScenariosPath = path.join(dataDir, "all_scenarios.json");
const allScenarios = JSON.parse(fs.readFileSync(allScenariosPath, "utf-8"));

// Get list of scenario files
const files = fs
	.readdirSync(dataDir)
	.filter((f) => f.startsWith("scenario_") && f.endsWith(".json"))
	.sort();

console.log(`Found ${files.length} individual scenario files`);
console.log(`Found ${allScenarios.length} entries in all_scenarios.json`);

// Add UUID to each scenario
allScenarios.forEach((scenario) => {
	const uuid = generateUUID();
	scenario.id = uuid;
});

// Save updated all_scenarios.json
fs.writeFileSync(allScenariosPath, JSON.stringify(allScenarios, null, 2));
console.log("✓ Updated all_scenarios.json with UUIDs");

// Update individual scenario files by matching
let filesUpdated = 0;
let filesNotMatched = 0;

files.forEach((filename) => {
	const filePath = path.join(dataDir, filename);
	try {
		const scenario = JSON.parse(fs.readFileSync(filePath, "utf-8"));

		// Find matching entry in allScenarios
		const matchingEntry = allScenarios.find(
			(s) =>
				s.subjectId === scenario.subjectId &&
				s.chiefComplaint?.title === scenario.chiefComplaint?.title,
		);

		if (matchingEntry && matchingEntry.id) {
			scenario.id = matchingEntry.id;
			fs.writeFileSync(filePath, JSON.stringify(scenario, null, 2));
			filesUpdated++;
		} else {
			console.warn(`⚠ No matching entry found for: ${filename}`);
			filesNotMatched++;
		}
	} catch (err) {
		console.error(`✗ Error processing ${filename}: ${err.message}`);
	}
});

console.log(`✓ Updated ${filesUpdated} individual scenario files`);
if (filesNotMatched > 0) {
	console.log(`⚠ Warning: ${filesNotMatched} files were not matched`);
}
console.log("Done!");
