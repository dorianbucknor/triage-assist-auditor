import React from "react";
import Header from "@/components/ui/header";
import { supabaseClient } from "@/providers/supabase/client";
import { redirect } from "next/navigation";
import { createServerClient } from "@/providers/supabase/server";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Scenario Audit | Triage Assist Auditor",
	description:
		"A specialized web-based testing ground designed for clinical experts to evaluate and grade **MedGemma**—Google’s medical-tuned LLM—on its ability to perform emergency room triage. This platform bridges the gap between raw AI inference and clinical safety by collecting high-quality, human-in-the-loop validation data from licensed Doctors and Nurses.",
};

export default async function Layout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="min-h-screen">
			<div className="grid-texture pointer-events-none absolute -z-50 inset-0" />
			<Header />
			<main>{children}</main>
		</div>
	);
}
