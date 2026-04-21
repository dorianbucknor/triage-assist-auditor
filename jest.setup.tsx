/* eslint-disable @typescript-eslint/no-explicit-any */
import "@testing-library/jest-dom";

// Mock next/navigation
jest.mock("next/navigation", () => ({
	useRouter: () => ({
		push: jest.fn(),
		replace: jest.fn(),
		prefetch: jest.fn(),
		back: jest.fn(),
		forward: jest.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/",
	useParams: () => ({}),
}));

// Mock next/image
jest.mock("next/image", () => ({
	__esModule: true,
	default: (props: any) => {
		// Return a simple div instead of using the real Image component
		// eslint-disable-next-line react/display-name, jsx-a11y/alt-text
		return <img {...props} />;
	},
}));

// Mock Supabase client
jest.mock("@/providers/supabase/client", () => ({
	supabaseClient: {
		auth: {
			signInWithPassword: jest.fn(),
			signUp: jest.fn(),
			signOut: jest.fn(),
			getSession: jest.fn(),
			getUser: jest.fn(),
		},
		from: jest.fn(),
	},
}));

// Mock Supabase server
jest.mock("@/providers/supabase/server", () => ({
	createServerClient: jest.fn(),
}));

// Suppress console errors in tests
const originalError = console.error;
beforeAll(() => {
	console.error = (...args: unknown[]) => {
		if (
			typeof args[0] === "string" &&
			(args[0].includes("Warning: ReactDOM.render") ||
				args[0].includes(
					"Not implemented: HTMLFormElement.prototype.submit",
				))
		) {
			return;
		}
		originalError.call(console, ...args);
	};
});

afterAll(() => {
	console.error = originalError;
});
