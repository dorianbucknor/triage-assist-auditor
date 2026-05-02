"use client";
import React from "react";
import { ButtonGroup } from "./button-group";
import { Button } from "./button";
import { Minus, Plus } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export default function NumberInput({
	increment = 1,
	allowFloats = true,
	onChange = () => {},
	onBlur = () => {},
	placeholder,
	value,
	...props
}: {
	allowFloats?: boolean;
	increment?: number;
	onChange: (value?: string | number) => void;
	onBlur: (value?: string | number) => void;
	placeholder?: string;
} & React.DetailedHTMLProps<
	React.InputHTMLAttributes<HTMLInputElement>,
	HTMLInputElement
>) {
	const ref = React.useRef<HTMLInputElement>(null);

	const isNumber = (value: string) => {
		return /^[+-]?(?:\d+\.?\d*|\.\d+)(?:[eE][+-]?\d+)?$/.test(value.trim());
	};

	const isValidInput = (value: string) => {
		return (
			value.trim() === "." ||
			value.trim() === "" ||
			value.trim() === "-" ||
			isNumber(value)
		);
	};
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
				input.value = newVal.toFixed(1);
				onChange(newVal.toFixed(1));
				onBlur(newVal.toFixed(1));
			}
		}
	}

	function handleInputChange(e: EventTarget, isBlur: boolean = false) {
		const input = e as HTMLInputElement;

		if (!input) return;
		const inputString = input.value.trim();

		if (isValidInput(inputString) && onChange) {
			let newValue = inputString;

			if (inputString.trim() === ".") {
				newValue = "0.";
			}

			onChange(newValue);
		} else {
			input.value = "";
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
				value={value}
				type="text"
				onKeyDown={(e) => {
					switch (e.key) {
						case "Enter":
							e.preventDefault();
							e.stopPropagation();
							handleInputChange(e.target, true);
							break;
						case "ArrowUp":
							e.preventDefault();
							handleIncrement(increment);
							break;
						case "ArrowDown":
							e.preventDefault();
							handleIncrement(-increment);
							break;
					}
					props.onKeyDown?.(e);
				}}
				onChange={(e) => {
					handleInputChange(e.target, false);
				}}
				onBlur={(e) => {
					handleInputChange(e.target, true);
					// Ensure floats display with at least one decimal place
					// if (allowFloats && ref.current && ref.current.value) {
					// 	const val = parseFloat(ref.current.value);
					// 	if (!isNaN(val) && !ref.current.value.includes(".")) {
					// 		ref.current.value = val.toFixed(1);
					// 	}
					// }
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
