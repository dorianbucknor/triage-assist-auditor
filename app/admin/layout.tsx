import React from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/admin-dashboard/app-sidebar";
import AppHeader from "@/components/admin-dashboard/app-header";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Admin Dashboard | Triage Assist Auditor",
	description:
		"A specialized web-based testing ground designed for clinical experts to evaluate and grade **MedGemma**—Google’s medical-tuned LLM—on its ability to perform emergency room triage. This platform bridges the gap between raw AI inference and clinical safety by collecting high-quality, human-in-the-loop validation data from licensed Doctors and Nurses.",
};

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen bg-background">
			<SidebarProvider>
				<AppSidebar />
				<SidebarInset>
					<AppHeader />
					<main className="p-6">{children}</main>
				</SidebarInset>
			</SidebarProvider>
		</div>
	);
}
