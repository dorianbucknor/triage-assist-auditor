"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function MiddleNav() {
	const path = usePathname();
	return (
		<>
			{path === "/" && (
				<nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
					<Link
						href="#about"
						className="hover:text-foreground transition-colors"
					>
						About
					</Link>
					<Link
						href="#how-it-works"
						className="hover:text-foreground transition-colors"
					>
						How It Works
					</Link>
					<Link
						href="#features"
						className="hover:text-foreground transition-colors"
					>
						Dimensions
					</Link>
				</nav>
			)}
		</>
	);
}
