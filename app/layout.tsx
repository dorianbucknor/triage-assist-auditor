import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "../providers/ThemeProvider";
import { TooltipProvider } from "@/components/ui/tooltip";
import ToasterClient from "@/components/toaster-client";
import StoreProvider from "@/providers/jotai/jotai";
import { getUser, verifySession } from "../lib/dal";

const geistSans = Geist({
	variable: "--font-geist-sans",
	subsets: ["latin"],
});

const geistMono = Geist_Mono({
	variable: "--font-geist-mono",
	subsets: ["latin"],
});

export const metadata: Metadata = {
	title: "Triage Assist Auditor",
	description:
		"A specialized web-based testing ground designed for clinical experts to evaluate and grade **MedGemma**—Google’s medical-tuned LLM—on its ability to perform emergency room triage. This platform bridges the gap between raw AI inference and clinical safety by collecting high-quality, human-in-the-loop validation data from licensed Doctors and Nurses.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	const { session } = await verifySession();
	const userData = await getUser();

	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased`}
			>
				<StoreProvider userAuth={{ data: userData, session }}>
					<ThemeProvider>
						<ToasterClient />
						<TooltipProvider> {children}</TooltipProvider>
					</ThemeProvider>
				</StoreProvider>
			</body>
		</html>
	);
}
