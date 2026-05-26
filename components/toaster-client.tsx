"use client";

import { Toaster } from "sonner";

export default function ToasterClient() {
	// ensure toaster is visible above other layout elements
	return (
		<div style={{ position: "relative", zIndex: 99999 }}>
			<Toaster
				position="top-center"
				richColors
				className="pointer-events-auto z-99999"
				toastOptions={{
					style: {
						zIndex: 99999,
						pointerEvents: "auto",
					},
				}}
			/>
		</div>
	);
}
