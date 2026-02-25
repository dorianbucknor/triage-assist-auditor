import React from "react";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { Badge } from "./badge";
import { verifySession } from "@/app/lib/dal";
import HeaderNav from "./header-nav";

export default async function Header() {
	const { session } = await verifySession();

	return (
		<header className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-border/60 backdrop-blur-sm bg-background/10">
			<div className="flex items-center gap-2 relative">
				{/* Minimal cross logo */}
				<HeartPulse className="h-6 w-6 text-primary" />
				<Link
					href={"/"}
					className="text-md font-medium tracking-[0.2em] uppercase text-muted-foreground"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					Triage Assist
				</Link>
				<Badge
					variant="outline"
					className="text-[8px] border-primary/40 text-primary tracking-wider"
				>
					BETA
				</Badge>
			</div>

			{!session && (
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

			<div className="flex items-center gap-2">
				<HeaderNav />
			</div>
		</header>
	);
}
