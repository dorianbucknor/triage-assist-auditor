import {
	InputOTP,
	InputOTPGroup,
	InputOTPSeparator,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { REGEXP_ONLY_CHARS, REGEXP_ONLY_DIGITS } from "input-otp";

export function InputOTPWithSeparator({
	value,
	onChange,
	onBlur,
}: {
	value: string;
	onChange: (newValue: string) => void;
	onBlur?: () => void;
}) {
	return (
		<InputOTP
			value={value}
			onChange={onChange}
			onBlur={onBlur}
			maxLength={6}
			pattern={REGEXP_ONLY_DIGITS}
			containerClassName="w-full flex items-center justify-center"
		>
			<InputOTPGroup>
				<InputOTPSlot index={0} />
				<InputOTPSlot index={1} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={2} />
				<InputOTPSlot index={3} />
			</InputOTPGroup>
			<InputOTPSeparator />
			<InputOTPGroup>
				<InputOTPSlot index={4} />
				<InputOTPSlot index={5} />
			</InputOTPGroup>
		</InputOTP>
	);
}
