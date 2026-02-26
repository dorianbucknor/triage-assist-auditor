import { verifySession } from "@/lib/dal";
import { LoginForm } from "@/components/login-form";
import { ThemeToggle } from "@/components/ThemeToggle";
import { HeartPulse } from "lucide-react";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const { isAuth, userRole } = await verifySession();

	if (isAuth) {
		if (userRole === "user") {
			redirect("/app");
		} else {
			redirect("/admin/dashboard");
		}
	}

	return (
		<div className="flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
			<div className="flex justify-center gap-2 md:justify-start">
				<div
					// href="#"
					className="flex items-center text-4xl gap-2 font-medium mb-8"
				>
					<HeartPulse
						className="size-8 text-primary"
						absoluteStrokeWidth
					/>
					Triage Assist
				</div>
			</div>
			<div className="w-full max-w-sm md:max-w-4xl">
				<LoginForm />
				<div className="ambient-glow pointer-events-none fixed bottom-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]" />
				<div className="ambient-glow pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]" />
			</div>
			<div className="grid-texture -z-10 pointer-events-none fixed inset-0" />
			<div className="absolute bottom-4 right-4">
				<ThemeToggle />
			</div>
		</div>
	);
}
