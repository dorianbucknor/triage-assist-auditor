import React from "react";
import { Button } from "./button";
import Link from "next/link";
import { HeartPulse } from "lucide-react";
import { ThemeToggle } from "../ThemeToggle";
import { Badge } from "./badge";

export default function Header() {
	return (
		<header className="relative z-50 flex items-center justify-between px-8 py-5 border-b border-border/60 backdrop-blur-sm bg-background/10">
			<div className="flex items-center gap-3">
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
					className="text-[10px] border-primary/40 text-primary tracking-wider"
				>
					BETA
				</Badge>
			</div>

			{
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
			}

			<div className="flex items-center gap-2">
				{/* Theme toggle */}
				<ThemeToggle />

				<Button
					asChild
					variant="ghost"
					className="text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
				>
					<Link href="/auth/sign-in">Sign In</Link>
				</Button>
				<Button
					asChild
					className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-sm px-5 glow-emerald"
				>
					<Link href="/auth/sign-up">Clinician Access →</Link>
				</Button>
			</div>
		</header>
	);
}
