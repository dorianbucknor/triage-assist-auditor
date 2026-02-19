import React from "react";
import { Button } from "./button";

export default function Chip({
	label,
	onDelete,
	...props
}: {
	label: string;
	onClick?: () => void | undefined;

	onDelete?: () => void | undefined;
} & React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			{...props}
			className="flex bg-card items-center space-x-2 mt-1 border-2  rounded-full px-3 py-1"
		>
			<span className="text-xs">{label}</span>
			<Button
				type="button"
				variant="ghost"
				size="icon-xs"
				onClick={(e) => {
					e.stopPropagation();
					onDelete?.();
				}}
			>
				&times;
			</Button>
		</div>
	);
}
