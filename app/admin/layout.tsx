"use client";

import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin-dashboard/app-sidebar";
import AppHeader from "@/components/admin-dashboard/app-header";
import { Toaster } from "sonner";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen bg-background">
			<SidebarProvider>
				<AppSidebar />

				<SidebarInset>
					<AppHeader />
					<Toaster position="bottom-right" />

					<main className="p-6">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
