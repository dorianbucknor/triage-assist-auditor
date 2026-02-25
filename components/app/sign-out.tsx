"use client";
import React from "react";
import { Button } from "../ui/button";
import { supabaseClient } from "@/providers/supabase/client";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";

export default function SignOutTrigger() {
	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="destructive"
					size={"icon-sm"}
					asChild
					onClick={async () => {
						await supabaseClient.auth.signOut();
					}}
				>
					<Link href="/">
						<LogOut />
					</Link>
				</Button>
			</TooltipTrigger>
			<TooltipContent>
				<span>Sign Out</span>
			</TooltipContent>
		</Tooltip>
	);
}
