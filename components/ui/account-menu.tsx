"use";
import React from "react";
import { Button } from "./button";
import { UserCircle2 } from "lucide-react";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "./dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "./tooltip";
import Link from "next/link";

export default function AccountMenu() {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<AccountTooltip>
					<Button
						variant="ghost"
						size="icon-sm"
						className=" !cursor-pointer text-muted-foreground hover:text-foreground hover:bg-accent text-sm"
					>
						<UserCircle2 />
					</Button>
				</AccountTooltip>
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
						<Link href="/admin/dashboard">Admin Dashboard</Link>
					</DropdownMenuItem>
				</DropdownMenuGroup>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

function AccountTooltip({ children }: { children: React.ReactNode }) {
	return (
		<Tooltip>
			<TooltipTrigger asChild>{children}</TooltipTrigger>
			<TooltipContent>
				<span>Account Menu</span>
			</TooltipContent>
		</Tooltip>
	);
}
