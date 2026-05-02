"use client";
import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import {
	OTPInputBaseProps,
	OTPInputProps,
	REGEXP_ONLY_DIGITS,
} from "input-otp";
import { RefAttributes, useState } from "react";

export function InputOTPWithSeparator({ ...props }: OTPInputBaseProps) {
	const [code, setCode] = useState("");
	return (
		
	);
}
