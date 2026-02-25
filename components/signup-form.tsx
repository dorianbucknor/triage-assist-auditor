"use client";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
	Field,
	FieldDescription,
	FieldError,
	FieldGroup,
	FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";
import { useTosDialog } from "./tos-privacy-controller";
import { useState } from "react";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import Link from "next/link";
import { toast } from "sonner";
import { Check, Mail, User, FileText, CheckCircle } from "lucide-react";
import { InputOTPSeparator } from "./ui/input-otp";
import { InputOTPWithSeparator } from "./otp-input";

const validationSchema = z.object({
	firstName: z.string().min(1, "First name is required"),
	lastName: z.string().min(1, "Last name is required"),
	email: z.email("Invalid email address"),
	// otp: z.string().min(6, "OTP must be 6 digits").optional().or(z.literal("")),
	role: z.string().min(1, "Role is required"),
	registrationNumber: z.string().min(5, "Registration number is required"),
	institution: z.string().min(1, "Institution is required"),
	tosAccepted: z.boolean(
		"You must accept the Terms of Service and Privacy Policy",
	),
});

type FormData = z.infer<typeof validationSchema>;

interface StepConfig {
	id: number;
	title: string;
	icon: React.ComponentType<{ className?: string }>;
}

const steps: StepConfig[] = [
	{ id: 1, title: "Personal Info", icon: User },
	{ id: 2, title: "Email Verification", icon: Mail },
	{ id: 3, title: "Clinician Info", icon: FileText },
];

export function SignupForm({
	className,
	...props
}: React.ComponentProps<"form">) {
	const [currentStep, setCurrentStep] = useState(1);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [otp, setOtp] = useState("");
	const { show, Dialog } = useTosDialog();

	const form = useForm<FormData>({
		resolver: zodResolver(validationSchema),
		mode: "onBlur",
		defaultValues: {
			tosAccepted: false,
			// otp: "",
			email: "",
			institution: "",
			registrationNumber: "",
			role: "",
			firstName: "",
			lastName: "",
		},
	});

	const {
		register,
		setValue,
		control,
		formState: { errors },
		watch,
	} = form;

	const formValues = watch();

	// Validate step 1
	const isStep1Valid =
		formValues.firstName &&
		formValues.lastName &&
		formValues.email &&
		!errors.firstName &&
		!errors.lastName &&
		!errors.email;

	// Validate step 3
	const isStep3Valid =
		formValues.role &&
		formValues.registrationNumber &&
		formValues.institution &&
		!errors.role &&
		!errors.registrationNumber &&
		!errors.institution;

	const canProceed =
		currentStep === 1
			? isStep1Valid
			: currentStep === 3
				? isStep3Valid
				: currentStep === 2;

	const handleNext = async () => {
		if (currentStep === 1) {
			// Validate step 1 fields
			const result = await form.trigger([
				"firstName",
				"lastName",
				"email",
			]);
			if (result) {
				setCurrentStep(currentStep + 1);
			}
		} else if (currentStep === 2) {
			// Move to step 3
			setCurrentStep(currentStep + 1);
		}
	};

	const handlePrev = () => {
		if (currentStep > 1) {
			setCurrentStep(currentStep - 1);
		}
	};

	// Dialog is controlled via `useTosDialog` hook; show() returns a promise

	const onSubmit = async (data: FormData) => {
		setIsSubmitting(true);

		try {
			const loadingToast = toast.loading(
				"Submitting your access request...",
			);

			const res = await fetch("/api/access-request", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					data: { ...data },
					action: "submit_access_request",
				}),
			});

			const { success, error, redirect, data: d } = await res.json();

			console.log(d, error);

			if (!success) {
				toast.dismiss(loadingToast);
				console.error("Error submitting access request:", error);
				toast.error(
					"An error occurred while submitting your request. Please try again later.",
				);
			} else {
				toast.dismiss(loadingToast);
				toast.success(
					"Your access request has been submitted successfully!",
				);
				// Reset form after successful submission
				form.reset();
				setCurrentStep(1);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form
			className={cn("flex flex-col gap-2 max-w-2xl", className)}
			onSubmit={async (e) => {
				e.preventDefault();

				if (currentStep === 3) {
					const result = await form.trigger([
						"role",
						"registrationNumber",
						"institution",
					]);

					if (!result) return;

					const accepted = await show();

					if (accepted) {
						setValue("tosAccepted", true);
						const data = {
							...formValues,
							tosAccepted: true,
						} as FormData;
						await onSubmit(data);
					} else {
						toast.error(
							"You must accept the Terms of Service and Privacy Policy to request access.",
						);
					}
				}
			}}
		>
			{/* Header */}
			<div className="flex flex-col items-center gap-1 text-center">
				<h1 className="text-2xl font-bold">Request Access</h1>
				<p className="text-muted-foreground text-sm text-balance">
					Join Triage Assist in a few simple steps
				</p>
			</div>

			{/* Stepper Progress */}
			<div className="flex justify-between items-start gap-2 ">
				{steps.map((step, idx) => {
					const StepIcon = step.icon;
					const isCompleted = currentStep > step.id;
					const isCurrent = currentStep === step.id;

					return (
						<div
							key={step.id}
							className="flex flex-col items-center flex-1"
						>
							{/* Icon Circle */}
							<div
								className={cn(
									"w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-colors",
									isCompleted
										? "bg-green-500 text-white"
										: isCurrent
											? "bg-blue-500 text-white ring-2 ring-blue-200"
											: "bg-gray-200 text-gray-600",
								)}
							>
								{isCompleted ? (
									<Check className="w-5 h-5" />
								) : (
									<StepIcon className="w-5 h-5" />
								)}
							</div>
							{/* Step Title */}
							<p
								className={cn(
									"text-xs font-medium text-center",
									isCurrent
										? "text-blue-600"
										: isCompleted
											? "text-green-600"
											: "text-gray-500",
								)}
							>
								{step.title}
							</p>
							{/* Connector Line */}

							<div className="flex w-full">
								{idx < steps.length - 1 && (
									<div
										className={cn(
											"h-0.5 w-full mt-3 transition-colors",
											isCompleted
												? "bg-green-500"
												: "bg-gray-200",
										)}
									/>
								)}
							</div>
						</div>
					);
				})}
			</div>

			{/* Step Content */}
			<div className="space-y-6">
				{/* Step 1: Personal Info */}
				{currentStep === 1 && (
					<div className="space-y-6 py-2">
						<div>
							<h2 className="text-lg font-semibold mb-4">
								Personal Information
							</h2>
						</div>
						<FieldGroup className="flex flex-row gap-4">
							<Controller
								control={control}
								name="firstName"
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="flex-1"
									>
										<FieldLabel htmlFor="firstName">
											First Name
										</FieldLabel>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											type="text"
											placeholder="John"
										/>
										<FieldError>
											{errors.firstName?.message}
										</FieldError>
									</Field>
								)}
							/>
							<Controller
								control={control}
								name="lastName"
								render={({ field, fieldState }) => (
									<Field
										data-invalid={fieldState.invalid}
										className="flex-1"
									>
										<FieldLabel htmlFor="lastName">
											Last Name
										</FieldLabel>
										<Input
											{...field}
											aria-invalid={fieldState.invalid}
											type="text"
											placeholder="Doe"
										/>
										<FieldError>
											{errors.lastName?.message}
										</FieldError>
									</Field>
								)}
							/>
						</FieldGroup>
						<Field>
							<FieldLabel htmlFor="email">Email</FieldLabel>
							<Input
								type="email"
								placeholder="m@example.com"
								{...register("email")}
							/>
							{!errors.email && (
								<FieldDescription>
									Please use your personal email only.
								</FieldDescription>
							)}
							<FieldError>{errors.email?.message}</FieldError>
						</Field>
					</div>
				)}
			</div>
			{/* Step 2: Email Verification */}
			{currentStep === 2 && (
				<div className="space-y-6 py-2">
					<div>
						<h2 className="text-lg font-semibold mb-4">
							Email Verification
						</h2>
						<p className="text-sm text-muted-foreground mb-4">
							We&apos;ve sent a verification code to{" "}
							<span className="font-medium text-foreground">
								{formValues.email}
							</span>
						</p>
					</div>

					<Field className="flex items-center justify-center w-full py-4">
						<label htmlFor="otp" className="text-center w-full">
							Verification Code
						</label>
						<InputOTPWithSeparator value={otp} onChange={setOtp} />
						<span className="text-center text-xs">
							Enter the 6-digit code sent to your email.
						</span>
						{/* <FieldError>{errors.otp?.message}</FieldError> */}
					</Field>
					<p className="text-xs text-muted-foreground text-center">
						Didn&apos;t receive the code?{" "}
						<button
							type="button"
							className="text-blue-600 hover:underline"
							onClick={
								() =>
									toast.info("Resending verification code...")
								//todo: implement resend logic
							}
						>
							Resend
						</button>
					</p>
				</div>
			)}

			{/* Step 3: Clinician Info */}
			{currentStep === 3 && (
				<div className="space-y-6 py-2">
					<Field>
						<FieldLabel htmlFor="institution">
							Institution
						</FieldLabel>
						<Select
							value={formValues.institution}
							onValueChange={(val) => {
								setValue("institution", val);
								form.trigger("institution");
							}}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select institution" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="uhwi">
									University Hospital of the West Indies
								</SelectItem>
							</SelectContent>
						</Select>
						{!errors.institution && (
							<FieldDescription>
								Currently, only UHWI Jamaica affiliates can be
								accepted.
							</FieldDescription>
						)}
						<FieldError>{errors.institution?.message}</FieldError>
					</Field>
					<div className="grid gap-4 grid-cols-2">
						<Field>
							<FieldLabel htmlFor="role">
								Professional Role
							</FieldLabel>
							<Select
								value={formValues.role}
								onValueChange={(val) => {
									setValue("role", val);
									form.trigger("role");
								}}
							>
								<SelectTrigger>
									<SelectValue placeholder="Select role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="doctor">
										Doctor
									</SelectItem>
									<SelectItem value="nurse">Nurse</SelectItem>
								</SelectContent>
							</Select>
							<FieldError>{errors.role?.message}</FieldError>
						</Field>
						<Controller
							control={control}
							name="registrationNumber"
							render={({ field, fieldState }) => (
								<Field
									data-invalid={fieldState.invalid}
									className="flex-1"
								>
									<FieldLabel htmlFor="registrationNumber">
										Registration Number
									</FieldLabel>
									<Input
										{...field}
										aria-invalid={fieldState.invalid}
										type="text"
										placeholder="1234567"
									/>
									{!errors.registrationNumber && (
										<FieldDescription>
											License# from MOH / Nursing Council.
										</FieldDescription>
									)}
									<FieldError>
										{errors.registrationNumber?.message}
									</FieldError>
								</Field>
							)}
						/>
					</div>
				</div>
			)}

			{/* Step 4: Confirmation
				{currentStep === 4 && (
					<div className="space-y-4">
						<div>
							<h2 className="text-lg font-semibold mb-4">
								Review Your Request
							</h2>
							<p className="text-sm text-muted-foreground mb-6">
								Please review your information below before
								submitting.
							</p>
						</div>

						

			{/* Navigation Buttons */}
			<div className="flex gap-3 justify-between pt-6">
				<Link href="/">
					<Button
						type="button"
						variant="destructive"
						className="px-8"
					>
						Cancel
					</Button>
				</Link>

				<div className="flex gap-3">
					<Button
						type="button"
						variant="outline"
						onClick={handlePrev}
						disabled={currentStep === 1}
						className="px-8"
					>
						Back
					</Button>

					{currentStep < 3 && (
						<Button
							type="button"
							onClick={handleNext}
							className="px-8"
						>
							Continue
						</Button>
					)}

					{currentStep === 3 && (
						<Button
							type="submit"
							disabled={isSubmitting}
							className="px-8"
						>
							{isSubmitting ? "Submitting..." : "Submit"}
						</Button>
					)}
				</div>
			</div>

			{/* TOS Dialog */}
			<Dialog />
		</form>
	);
}
