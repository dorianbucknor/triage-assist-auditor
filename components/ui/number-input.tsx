"use client";
import React from "react";
import { ButtonGroup } from "./button-group";
import { Button } from "./button";
import { Minus, Plus } from "lucide-react";
import { Input } from "./input";
import { cn } from "@/lib/utils";
import { es } from "zod/v4/locales";

export default function NumberInput({
	increment = 1,
	allowFloats: allowsDecimal = true,
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
	const min = allowsDecimal
		? parseFloat(props?.min as string)
		: parseInt(props?.min as string, 10);

	const max = allowsDecimal
		? parseFloat(props?.max as string)
		: parseInt(props?.max as string, 10);

	function handleIncrement(increment: number) {
		if (!ref.current) return;
		const input = ref.current;

		handleInput();

		if (input) {
			const val = allowsDecimal
				? parseFloat(input.value.trim())
				: parseInt(input.value.trim(), 10);

			if (isNaN(val)) {
				input.value = min ? min.toString() : "0";
				onChange(input.value);
				onBlur(input.value);
			} else {
				let newVal = val + increment;
				if (props?.min !== undefined && !isNaN(min) && newVal < min) {
					newVal = min;
				}
				if (props?.max !== undefined && !isNaN(max) && newVal > max) {
					newVal = max;
				}

				input.value = allowsDecimal
					? newVal.toFixed(1)
					: newVal.toString();

				onChange(input.value);
				onBlur(input.value);
			}
		}
	}

	function handleInputChange(e: EventTarget, isBlur: boolean = false) {
		const input = e as HTMLInputElement;

		if (!input) return;
		const inputString = input.value.trim();

		if (isValidInput(inputString)) {
			let newValue = inputString;

			if (inputString === ".") {
				if (allowsDecimal) {
					newValue = "0.";
				} else {
					newValue = "";
					handleError("Decimal values are not allowed");
				}
			}
			if (inputString === "-" || inputString === "-.") {
				if (allowsDecimal) {
					newValue = "-0.";
				} else {
					newValue = "-";
				}
			}

			if (inputString === "") {
				newValue = "";
			}

			if (inputString.includes(".") && !allowsDecimal) {
				newValue = inputString.replace(".", "");
				handleError("Decimal values are not allowed");
			}

			if (allowsDecimal) {
				newValue = newValue.replace(
					/^([+-]?)0+(?=\d)|(\.\d*?[1-9])0+(?=$|[eE])|(\.0+)(?=$|[eE])/g,
					"$1$2",
				);
			} else {
				newValue = newValue.replace(/^([+-]?)0+(?=\d)/, "$1");
			}

			const parsedValue = allowsDecimal
				? parseFloat(inputString)
				: parseInt(inputString, 10);

			if (
				props?.min !== undefined &&
				!isNaN(parsedValue) &&
				!isNaN(min) &&
				parsedValue < min
			) {
				newValue = allowsDecimal ? min.toFixed(1) : min.toString();
				handleError(`Value must be at least ${newValue}`);
			}
			if (
				props?.max !== undefined &&
				!isNaN(parsedValue) &&
				!isNaN(max) &&
				parsedValue > max
			) {
				newValue = allowsDecimal ? max.toFixed(1) : max.toString();
				handleError(`Value must be at most ${newValue}`);
			}

			input.value = newValue;

			onChange(newValue);
			onBlur(newValue);
		} else {
			input.value = "";
			onChange("");
			onBlur("");
		}
	}

	const handleInput = () => {
		const inputNode = ref.current;
		if (inputNode) {
			inputNode.setCustomValidity("");
			inputNode.classList.remove("error");
		}
	};

	const handleError = (message: string) => {
		const inputNode = ref.current;
		if (inputNode) {
			inputNode.setCustomValidity(message);
			inputNode.reportValidity();
			inputNode.classList.add("error");
		}
	};

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
				onInput={handleInput}
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
					// if (allowsDecimal && ref.current && ref.current.value) {
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
