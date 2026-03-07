"use client";
import React from "react";
import { ButtonGroup } from "./button-group";
import { Button } from "./button";
import { Minus, Plus } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export default function NumberInput({
	increment = 1,
	allowFloats = false,
	onChange = () => {},
	onBlur = () => {},
	placeholder,
	// value,
	...props
}: {
	allowFloats?: boolean;
	increment?: number;
	// value?: number;
	onChange: (value?: number) => void;
	onBlur: (value?: number) => void;
	placeholder?: string;
} & React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>) {
	const ref = React.useRef<HTMLInputElement>(null);

	const min = allowFloats
		? parseFloat(props?.min as string)
		: parseInt(props?.min as string, 10);

	const max = allowFloats
		? parseFloat(props?.max as string)
		: parseInt(props?.max as string, 10);

	function handleIncrement(increment: number) {
		if (!ref.current) return;
		const input = ref.current;

		if (input) {
			const val = allowFloats
				? parseFloat(input.value.trim())
				: parseInt(input.value.trim(), 10);

			if (isNaN(val)) {
				input.value = min ? min.toString() : "0";

				onChange(undefined);
				onBlur(undefined);
			} else {
				let newVal = val + increment;

				if (props?.min !== undefined && !isNaN(min) && newVal < min) {
					newVal = min;
				}
				if (props?.max !== undefined && !isNaN(max) && newVal > max) {
					newVal = max;
				}

				input.value = newVal.toString();
				onChange(newVal);
				onBlur(newVal);
			}
		}
	}

	function handleInputChange(e: EventTarget) {
		const input = e as HTMLInputElement;

		if (input && input.value.trim() !== "") {
			let val = allowFloats
				? parseFloat(input.value.trim())
				: parseInt(input.value.trim(), 10);

			if (isNaN(val)) {
				input.value = "";
				onChange(undefined);
				onBlur(undefined);
			} else {
				if (props?.min !== undefined && !isNaN(min) && val < min) {
					val = min;
				}
				if (props?.max !== undefined && !isNaN(max) && val > max) {
					val = max;
				}
				input.value = val.toString();
				onChange(val);
				onBlur(val);
			}
		}
	}

	return (
		<ButtonGroup>
			<Button
				type="button"
				variant="outline"
				aria-label="Subtract"
				onClick={(e) => {
					handleIncrement(-increment);
					e.stopPropagation();
				}}
			>
				<Minus />
			</Button>
			<Input
				placeholder={placeholder}
				{...props}
				className={cn("no-outer-arrows ", props.className)}
				ref={ref}
				type="text"
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						e.stopPropagation();

						handleInputChange(e.target);
					}

					props.onKeyDown?.(e);
				}}
				onChange={(e) => {
					handleInputChange(e.target);
				}}
				onBlur={(e) => {
					handleInputChange(e.target);
				}}
			/>
			<Button
				type="button"
				variant="outline"
				aria-label="Add"
				onClick={(e) => {
					handleIncrement(increment);
					e.stopPropagation();
				}}
			>
				<Plus />
			</Button>
		</ButtonGroup>
	);
}
