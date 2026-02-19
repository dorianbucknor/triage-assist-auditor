// app/providers/ThemeProvider.jsx
// Install: npm install next-themes
//
// Usage in app/layout.jsx:
//   import { ThemeProvider } from "@/providers/ThemeProvider";
//   <html lang="en" suppressHydrationWarning>
//     <body>
//       <ThemeProvider>{children}</ThemeProvider>
//     </body>
//   </html>
//
// suppressHydrationWarning on <html> is required — next-themes injects
// the .dark class before React hydrates to prevent flash.

"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }) {
	return (
		<NextThemesProvider
			attribute="class" // toggles .dark on <html>
			// defaultTheme="system" // respects OS preference on first visit
			enableSystem
			disableTransitionOnChange={false}
		>
			{children}
		</NextThemesProvider>
	);
}
