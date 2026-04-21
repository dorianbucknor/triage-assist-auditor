import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
	// Provide the path to your Next.js app to load next.config.js and .env files in your test environment
	dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
	coverageProvider: "v8",
	testEnvironment: "jsdom",
	roots: ["<rootDir>"],
	testMatch: ["**/__tests__/**/*.ts?(x)", "**/?(*.)+(spec|test).ts?(x)"],
	moduleNameMapper: {
		"^@/(.*)$": "<rootDir>/$1",
	},
	setupFilesAfterEnv: ["<rootDir>/jest.setup.tsx"],
	collectCoverageFrom: [
		"app/**/*.{js,jsx,ts,tsx}",
		"components/**/*.{js,jsx,ts,tsx}",
		"hooks/**/*.{js,jsx,ts,tsx}",
		"lib/**/*.{js,jsx,ts,tsx}",
		"providers/**/*.{js,jsx,ts,tsx}",
		"!**/*.d.ts",
		"!**/node_modules/**",
		"!**/.next/**",
		"!**/coverage/**",
		"!**/jest.config.ts",
	],
	testPathIgnorePatterns: ["/node_modules/", "/.next/"],
	transformIgnorePatterns: [
		"/node_modules/",
		"^.+\\.module\\.(css|sass|scss)$",
	],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
