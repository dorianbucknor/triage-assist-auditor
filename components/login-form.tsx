"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { supabaseClient } from "@/providers/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import TosPrivacyDialog from "./tos-privacy-dialog";
import { useRef, useState } from "react";
import Image from "next/image";
import squareStock from "@/public/square-stock.jpg";
import { Turnstile, TurnstileInstance } from "@marsidev/react-turnstile";
import { Controller, useForm } from "react-hook-form";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useToastManager } from "@base-ui/react";
import { Session } from "@supabase/supabase-js";
import { decodeJwt } from "jose";

export function LoginForm({
	className,
	...props
}: React.ComponentProps<"div">) {
	const [error, setError] = useState<string | null>(null);
	const [captchaToken, setCaptchaToken] = useState<string>("");
	const captchaRef = useRef<TurnstileInstance | null>(null);
	const router = useRouter();
	const [showTos, setShowTos] = useState(false);
	const validationSchema = z.object({
		email: z.email("Please enter a valid email address"),
		password: z.string(),
	});

	const form = useForm({
		resolver: zodResolver(validationSchema),
		defaultValues: {
			email: "",
			password: "",
		},
		mode: "onBlur",
	});

	const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
		const loadToast = toast.loading("Signing in...");

		event.preventDefault();
		form.trigger();

		if (!captchaRef.current) return;

		// captchaRef.current.getResponse

		const email = form.getValues("email");
		const password = form.getValues("password");

		try {
			const {
				data: { user, session },
				error,
			} = await supabaseClient.auth.signInWithPassword({
				email: email.trim().toLowerCase(),
				password: password,
				options: {
					captchaToken:
						process.env.NODE_ENV === "production"
							? captchaToken
							: "1x0000000000000000000000000000000AA", //todo--rem
					// captchaToken,
				},
			});

			if (error) {
				toast.dismiss(loadToast);
				setError(error.message);
				captchaRef.current.reset();
				return;
			}

			if (user) {
				toast.dismiss(loadToast);
				toast.info("Successfully signed in!");
				if (getUserRole(session) === "user") {
					router.push("/app");
				} else {
					router.push("/admin");
				}
			}
		} catch (error) {
			toast.dismiss(loadToast);
			console.error("Unexpected error:", error);
			toast.error(
				"An unexpected error occurred. Please try again later.",
			);
		}
	};

	function getUserRole(session: Session) {
		const cookie = decodeJwt(session.access_token);

		return cookie["user_role"];
	}

	return (
		<div className={cn("flex flex-col gap-6", className)} {...props}>
			{error && (
				<Alert variant="destructive">
					<AlertTitle>Login Failed</AlertTitle>
					<AlertDescription>{error}</AlertDescription>
				</Alert>
			)}
			<Card className="overflow-hidden p-0">
				<CardContent className="grid p-0 md:grid-cols-2">
					<form className="p-6 md:p-8" onSubmit={handleSubmit}>
						<FieldGroup>
							<div className="flex flex-col items-center gap-2 text-center">
								<h1 className="text-2xl font-bold">
									Welcome back
								</h1>
								<p className="text-muted-foreground text-balance">
									Login to your Triage Assist account
								</p>
							</div>
							<Controller
								control={form.control}
								name="email"
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="flex-1"
									>
										<FieldLabel htmlFor="email">
											Email
										</FieldLabel>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											type="email"
											placeholder="m@example.com"
										/>
										<FieldError>
											{fieldState.error?.message}
										</FieldError>
									</Field>
								)}
							/>
							<Controller
								control={form.control}
								name="password"
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="flex-1"
									>
										<FieldLabel htmlFor="password">
											Password
										</FieldLabel>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											type="password"
											placeholder="••••••••"
										/>
										<FieldError>
											{fieldState.error?.message}
										</FieldError>
									</Field>
								)}
							/>
							<Field>
								<Button type="submit">Login</Button>
							</Field>
							<FieldDescription className="text-center">
								Don&apos;t have an account?{" "}
								<a href="/auth/register">Request Access</a>
							</FieldDescription>
						</FieldGroup>
					</form>
					<div className="bg-muted relative hidden md:block">
						<Image
							src={squareStock.src}
							alt="Image"
							// width="100"
							fill
							className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
						/>
					</div>
				</CardContent>
			</Card>
			<FieldDescription className="px-6 text-center">
				By clicking continue, you agree to our{" "}
				<button
					type="button"
					onClick={() => setShowTos(true)}
					className="underline-offset-2 hover:underline"
				>
					Terms of Service
				</button>{" "}
				and{" "}
				<button
					type="button"
					onClick={() => setShowTos(true)}
					className="underline-offset-2 hover:underline"
				>
					Privacy Policy
				</button>
				.
			</FieldDescription>

			<div className="w-full flex relative justify-center ">
				<Turnstile
					ref={captchaRef}
					siteKey={
						process.env.NODE_ENV === "production"
							? process.env
									.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_KEY || ""
							: "1x00000000000000000000AA"
						//  || ""
					}
					onSuccess={(token: string) => {
						setCaptchaToken(token);
					}}
					onTimeout={() => {
						setCaptchaToken("");
						captchaRef.current?.reset();
					}}
					onError={(error) => {
						setCaptchaToken("");
						captchaRef.current?.reset();
					}}
					className="relative"
				/>
			</div>
			<TosPrivacyDialog
				open={showTos}
				onAccept={() => setShowTos(false)}
				onReject={() => {
					setShowTos(false);
					window.location.href = "/";
				}}
			/>
		</div>
	);
}
