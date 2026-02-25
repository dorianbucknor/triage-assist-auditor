import { HeartPulse } from "lucide-react";

import { SignupForm } from "@/components/signup-form";
import Image from "next/image";
import image from "@/public/2x3-stock.jpg";
import { ThemeToggle } from "@/components/ThemeToggle";

export default function SignupPage() {
	return (
		<div className="grid min-h-svh lg:grid-cols-2">
			<div className="flex flex-col gap-4 p-6 md:p-10">
				<div className="flex justify-center gap-2 md:justify-start">
					<a href="#" className="flex items-center gap-2 font-medium">
						<div className=" text-primary flex size-6 items-center justify-center rounded-md">
							<HeartPulse className="size-8" />
						</div>
						Triage Assist
					</a>
				</div>
				<div className="flex flex-1 items-center justify-center ">
					<div className="w-full max-w-lg p-4 rounded-lg border bg-card  shadow-2xl">
						<SignupForm className=" " />
						<div className="ambient-glow pointer-events-none fixed bottom-[-20%] right-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]" />
						<div className="ambient-glow pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]" />
					</div>
				</div>
				<div className="grid-texture pointer-events-none -z-50 fixed inset-0" />
			</div>
			<div className="bg-muted relative hidden lg:block">
				<Image
					src={image.src}
					alt="Image"
					fill
					className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
				/>
			</div>
			<div className="absolute bottom-4 right-4">
				<ThemeToggle variant="outline" />
			</div>
		</div>
	);
}
