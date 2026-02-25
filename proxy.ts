import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySession } from "./lib/dal";

// Define public, admin and protected route matchers
const publicRoutes = ["/auth/sign-in", "/auth/register"];
const protectedRoutes = ["/app", "/profile", "/settings"];
const adminRoutes = ["/admin"];

//swap local url for website url when in production
const basePath =
	process.env.NODE_ENV == "production"
		? process.env.NEXT_PUBLIC_SITE_URL
		: "http://localhost:3000";

export async function proxy(request: NextRequest) {
	const { pathname } = request.nextUrl;

	//allow access to landing page
	if (pathname === "/") {
		return NextResponse.next();
	}

	//allow access to all public routes
	for (const element of publicRoutes) {
		if (pathname.startsWith(element)) {
			return NextResponse.next();
		}
	}

	//get current session and user app role
	const { isAuth, userId, userRole, session, user } = await verifySession();

	//Block any unauthenticated user from protected routes
	if (!isAuth) {
		return NextResponse.redirect(new URL(`${basePath}/auth/sign-in`));
	}

	//Block normal users from admin routes
	for (const element of adminRoutes) {
		if (pathname.startsWith(element) && userRole === "user") {
			return NextResponse.redirect(new URL(`${basePath}/app`));
		}
	}

	// Allow the request to proceed if none of the conditions are met
	return NextResponse.next();
}

// Optionally, configure which paths the middleware should or should not run on
export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
