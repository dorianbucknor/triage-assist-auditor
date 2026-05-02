/* eslint-disable @typescript-eslint/no-require-imports */
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

// Create a mapping of subjectId to list of indices
const subjectMap = {};
allScenarios.forEach((scenario, index) => {
	if (!subjectMap[scenario.subjectId]) {
		subjectMap[scenario.subjectId] = [];
	}
	subjectMap[scenario.subjectId].push(index);
});

// Add UUID to each scenario and track which file to update
const updates = [];
allScenarios.forEach((scenario, index) => {
	const uuid = generateUUID();
	scenario.id = uuid;

	const subjectId = scenario.subjectId;
	const subjectIndices = subjectMap[subjectId];
	const subjectIndex = subjectIndices.indexOf(index);
	const fileNum = String(subjectIndex).padStart(4, "0");
	const filename = `scenario_${subjectId}_${fileNum}.json`;

	updates.push({
		filename,
		uuid,
		subjectId,
		fileNum,
	});
});

// Save updated all_scenarios.json
fs.writeFileSync(allScenariosPath, JSON.stringify(allScenarios, null, 2));
console.log("✓ Updated all_scenarios.json with UUIDs");

// Update individual scenario files
let filesUpdated = 0;
let filesMissing = 0;
updates.forEach(({ filename, uuid }) => {
	const filePath = path.join(dataDir, filename);
	if (fs.existsSync(filePath)) {
		const scenario = JSON.parse(fs.readFileSync(filePath, "utf-8"));
		scenario.id = uuid;
		fs.writeFileSync(filePath, JSON.stringify(scenario, null, 2));
		filesUpdated++;
	} else {
		console.warn(`⚠ File not found: ${filename}`);
		filesMissing++;
	}
});

console.log(`✓ Updated ${filesUpdated} individual scenario files`);
if (filesMissing > 0)
	console.log(`⚠ Warning: ${filesMissing} files were not found`);
console.log("Done!");
