"use client";
import React from "react";
import { ThemeToggle } from "../ThemeToggle";
import { useAtom } from "jotai";
import { userAtom } from "@/providers/jotai/jotai";
import { Button } from "./button";
import { Menu } from "lucide-react";
import Link from "next/link";
import SignOutTrigger from "../app/sign-out";
import AccountMenu from "./account-menu";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { supabaseClient } from "@/providers/supabase/client";

export default function HeaderNav() {
	const [user] = useAtom(userAtom);

	return (
		<nav>
			{/* Desktop Nav */}
			<div className="flex gap-2 max-sm:hidden">
				<ThemeToggle />
				<div>
					{user != null ? (
						<AccountMenu />
					) : (
						<Button
							asChild
							variant="ghost"
							className="text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
						>
							<Link href="/auth/sign-in">Sign In</Link>
						</Button>
					)}
				</div>
				<div>
					{" "}
					{user ? (
						<SignOutTrigger />
					) : (
						<Button
							asChild
							className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm rounded-sm px-5 glow-emerald"
						>
							<Link href="/auth/sign-up">Request Access →</Link>
						</Button>
					)}
				</div>
			</div>
			{/* Mobile Nav */}
			<div className="flex flex-row gap-2 min-sm:hidden">
				<ThemeToggle />

				<DropdownMenu>
					<DropdownMenuTrigger>
						<DropdownMenuLabel className=" !cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent text-sm">
							<Menu />
						</DropdownMenuLabel>
					</DropdownMenuTrigger>
					<DropdownMenuContent>
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/app">Scenarios</Link>
							</DropdownMenuItem>
							<DropdownMenuItem asChild>
								<Link href="/profile">Profile</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem asChild>
								<Link href="/admin/dashboard">
									Admin Dashboard
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
						<DropdownMenuSeparator />
						<DropdownMenuGroup>
							<DropdownMenuItem variant="destructive" asChild>
								<Link
									href="/auth/sign-in"
									onClick={async () => {
										await supabaseClient.auth.signOut();
									}}
								>
									Sign out
								</Link>
							</DropdownMenuItem>
						</DropdownMenuGroup>
					</DropdownMenuContent>
				</DropdownMenu>
			</div>
		</nav>
	);
}
