import { verifySession } from "../../lib/dal";
import { redirect } from "next/navigation";

export default async function AuthPage() {
	const { session, userRole } = await verifySession();

	if (session) {
		if (userRole === "user") {
			redirect("/app");
		} else {
			redirect("/admin/dashboard");
		}
	}
}
