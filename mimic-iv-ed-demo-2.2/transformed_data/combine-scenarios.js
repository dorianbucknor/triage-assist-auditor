/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const transformedDataDir = __dirname;

// Get all scenario_*.json files
const files = fs
	.readdirSync(transformedDataDir)
	.filter((file) => file.startsWith("scenario_") && file.endsWith(".json"))
	.sort();

console.log(`Found ${files.length} scenario files to combine...`);

const scenarios = [];

// Read each file and add to array
files.forEach((file, index) => {
	try {
		const filePath = path.join(transformedDataDir, file);
		const content = fs.readFileSync(filePath, "utf-8");
		const scenario = JSON.parse(content);
		scenarios.push(scenario);

		if ((index + 1) % 50 === 0) {
			console.log(`  Processed ${index + 1}/${files.length} files...`);
		}
	} catch (error) {
		console.error(`Error reading ${file}:`, error.message);
	}
});

// Create output filename with timestamp
const timestamp = new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
const outputFilename = `all_scenarios_updated_${timestamp}.json`;
const outputPath = path.join(transformedDataDir, outputFilename);

// Write combined array to new file
fs.writeFileSync(outputPath, JSON.stringify(scenarios, null, 2), "utf-8");

console.log(
	`\n✅ Successfully combined ${scenarios.length} scenarios into: ${outputFilename}`,
);
console.log(
	`   File size: ${(fs.statSync(outputPath).size / 1024 / 1024).toFixed(2)} MB`,
);
