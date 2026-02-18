"use client";

import React from "react";
import { ButtonGroup } from "./button-group";
import { Input } from "./input";
import { Button } from "./button";
import { Plus } from "lucide-react";

export default function AddChipInput({
	onAdd,
	placeholder,
	...props
}: {
	onAdd: (value: string) => void;
	placeholder?: string;
} & React.HTMLAttributes<HTMLInputElement>) {
	const ref = React.useRef<HTMLInputElement>(null);

	return (
		<ButtonGroup>
			<Input
				type="text"
				ref={ref}
				placeholder={placeholder}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						e.stopPropagation();

						if (!ref.current) return;
						const input = ref.current;
						if (input && input.value.trim() !== "") {
							onAdd(input.value.trim());
							input.value = "";
						}
					}

					props.onKeyDown?.(e);
				}}
				{...props}
			/>
			<Button
				type="button"
				variant="outline"
				aria-label="Add"
				onClick={() => {
					if (!ref.current) return;

					const input = ref.current;
					if (input && input.value.trim() !== "") {
						onAdd(input.value.trim());
						input.value = "";
					}
				}}
			>
				<Plus />
			</Button>
		</ButtonGroup>
	);
}
