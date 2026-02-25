// components/ThemeToggle.jsx
"use client";

import { useTheme } from "next-themes";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Moon, MoonIcon, Sun, SunIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";

export function ThemeToggle({
	variant,
	size,
	className,
}: {
	variant?:
		| "link"
		| "default"
		| "destructive"
		| "outline"
		| "secondary"
		| "ghost"
		| null
		| undefined;
	size?:
		| "default"
		| "xs"
		| "sm"
		| "lg"
		| "icon"
		| "icon-xs"
		| "icon-sm"
		| "icon-lg"
		| null
		| undefined;
	className?: string;
}) {
	const { resolvedTheme, setTheme } = useTheme();

	const isDark = useMemo(() => resolvedTheme === "dark", [resolvedTheme]);

	return (
		<div>
			<Tooltip>
				<TooltipTrigger asChild>
					<Button
						variant={variant || "ghost"}
						size={size || "icon-sm"}
						onClick={() => setTheme(isDark ? "light" : "dark")}
						className={cn(
							"!cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent transition-colors text-sm",
							className,
						)}
					>
						{isDark ? <SunIcon /> : <MoonIcon />}
					</Button>
				</TooltipTrigger>
				<TooltipContent>
					{isDark ? <span>Light Mode</span> : <span>Dark Mode</span>}
				</TooltipContent>
			</Tooltip>
		</div>
	);
}
