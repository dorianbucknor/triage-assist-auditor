"use client";
import React, { useState } from "react";
import { Button } from "../ui/button";
import { supabaseClient } from "@/providers/supabase/client";
import Link from "next/link";
import { LogOut } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { set } from "zod";

export default function SignOutTrigger() {
	const [pending, setPending] = useState(false);

	return (
		<Tooltip>
			<TooltipTrigger asChild>
				<Button
					variant="destructive"
					size={"icon-sm"}
					asChild
					onClick={async () => {
						setPending(true);
						await supabaseClient.auth.signOut();
						setPending(false);
					}}
					disabled={pending}
				>
					<Link href="/auth/sign-in">
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
