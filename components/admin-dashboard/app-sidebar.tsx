"use client";

import React, { useEffect, useState } from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarTrigger,
	useSidebar,
} from "../ui/sidebar";
import { useRouter, usePathname } from "next/navigation";
import {
	HeartPlus,
	HeartPulse,
	Home,
	LogOut,
	TrendingUpDown,
	User,
	Users,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { supabaseClient } from "@/providers/supabase/client";

export default function AppSidebar({
	...props
}: React.ComponentProps<typeof Sidebar>) {
	const router = useRouter();
	const pathname = usePathname();
	const [tab, setTab] = useState(pathname?.split("/").slice(-1)[0] || "");

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setTab(pathname?.split("/").slice(-1)[0] || "");
	}, [pathname]);

	const sidebar = useSidebar();

	return (
		<Sidebar collapsible="icon" {...props}>
			<SidebarHeader>
				<SidebarMenuButton
					// asChild
					// isActive
					className="flex space-x-2 p-1 data-[slot=sidebar-menu-button]:!p-1.5"
				>
					<HeartPulse />
					<span className="text-base font-semibold">
						Triage Assist
					</span>
				</SidebarMenuButton>
			</SidebarHeader>
			<SidebarContent>
				<SidebarGroup>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								className="cursor-pointer"
								onClick={() => {
									router.push("/admin/dashboard");
									sidebar.setOpenMobile(false);
								}}
								isActive={tab === "dashboard"}
								// style={
								// 	tab === "dashboard"
								// 		? {
								// 				backgroundColor: "#000000",
								// 				color: "#ffffff",
								// 			}
								// 		: {}
								// }
							>
								<TrendingUpDown className="mr-2 h-4 w-4" />{" "}
								Metrics
							</SidebarMenuButton>
						</SidebarMenuItem>
						<SidebarMenuItem>
							<SidebarMenuButton
								className="cursor-pointer"
								onClick={() => {
									router.push("/admin/user-management");
									sidebar.setOpenMobile(false);
								}}
								isActive={tab === "user-management"}
								// style={
								// 	tab === "user-management"
								// 		? {
								// 				backgroundColor: "#000000",
								// 				color: "#ffffff",
								// 			}
								// 		: {}
								// }
							>
								<Users className="mr-2 h-4 w-4" />
								User Management
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarGroup>
			</SidebarContent>
			<SidebarFooter>
				<SidebarMenu>
					<SidebarMenuItem>
						<SidebarMenuButton
							onClick={async () => {
								try {
									await supabaseClient.auth.signOut();
								} catch (error) {
									console.log(error);
								}
								router.push("/auth/sign-in");
							}}
							asChild
						>
							<div className="cursor-pointer">
								<LogOut className="mr-2 h-4 w-4 " />
								Log Out
							</div>
						</SidebarMenuButton>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarFooter>
		</Sidebar>
	);
}
