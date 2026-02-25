"use client";

import { Toaster } from "sonner";

export default function ToasterClient() {
	// ensure toaster is visible above other layout elements
	return (
		<div style={{ position: "relative", zIndex: 9999 }}>
			<Toaster position="top-center" richColors />
		</div>
	);
}
