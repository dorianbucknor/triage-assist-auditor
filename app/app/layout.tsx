import React from "react";
import Header from "@/components/ui/header";

export default function Layout({ children }: { children: React.ReactNode }) {
	return (
		<div className="min-h-screen">
			<div className="grid-texture pointer-events-none absolute -z-50 inset-0" />
			<Header />
			<main>{children}</main>
		</div>
	);
}
