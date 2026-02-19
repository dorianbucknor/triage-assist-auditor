import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/ThemeToggle";
import Header from "@/components/ui/header";

const FEATURES = [
	{
		icon: "⬡",
		label: "ESI Triage Level",
		description:
			"Grade the AI's assignment of Emergency Severity Index levels against your clinical judgment across a range of acuity presentations.",
	},
	{
		icon: "◈",
		label: "Differential Diagnosis",
		description:
			"Evaluate ranked differential lists for completeness, ordering accuracy, and dangerous miss avoidance in time-critical scenarios.",
	},
	{
		icon: "◎",
		label: "Treatment Protocol",
		description:
			"Assess immediate intervention plans for clinical appropriateness, drug safety, contraindication awareness, and protocol alignment.",
	},
	{
		icon: "◇",
		label: "Reasoning & Confidence",
		description:
			"Scrutinize the model's chain-of-thought narrative and calibration of self-reported confidence against scenario ground truth.",
	},
];

const STATS = [
	{ value: "4", unit: "Eval Dimensions", sub: "per scenario" },
	{ value: "ESI", unit: "Validated", sub: "scoring rubric" },
	{ value: "CDSS", unit: "Explainable AI", sub: "framework" },
	{ value: "IRB", unit: "Aligned", sub: "data protocols" },
];

export default function LandingPage() {
	return (
		<div
			className="min-h-screen bg-background text-foreground overflow-x-hidden transition-colors duration-300"
			style={{ fontFamily: "'DM Sans', sans-serif" }}
		>
			{/* ── Grid texture overlay ─────────────────────────────────────────
          Uses CSS class from triage-theme.css which handles opacity per theme */}
			<div className="grid-texture pointer-events-none fixed inset-0" />

			{/* ── Ambient glow ─────────────────────────────────────────────── */}
			<div className="ambient-glow pointer-events-none fixed top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full blur-[120px]" />

			<Header />
			<section className="relative z-10 max-w-6xl mx-auto px-8 pt-28 pb-24">
				{/* Top label */}
				<div
					className="inline-flex items-center gap-2 mb-8 text-[11px] tracking-[0.25em] uppercase text-primary border border-primary/25 px-4 py-2 rounded-sm bg-accent/50"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
					MedGemma · Clinical Decision Support · XAI Evaluation
				</div>

				<h1
					className="text-6xl md:text-8xl font-normal leading-[0.95] tracking-tight text-foreground mb-8 max-w-4xl"
					style={{ fontFamily: "'DM Serif Display', serif" }}
				>
					Human oversight
					<br />
					<span className="italic text-primary">for AI</span> triage.
				</h1>

				<p className="max-w-xl text-muted-foreground text-lg leading-relaxed mb-12 font-light">
					A specialized evaluation platform where licensed clinicians
					review, grade, and validate MedGemma&apos;s emergency
					department triage decisions — building the safety layer
					between AI inference and real patient care.
				</p>

				{/* CTA Block */}
				<div className="flex flex-col sm:flex-row items-start gap-4">
					<Button
						asChild
						size="lg"
						className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-sm px-8 py-6 glow-emerald transition-all"
					>
						<Link href="/auth/sign-up">
							Register as a Clinician
						</Link>
					</Button>
					<Button
						asChild
						size="lg"
						variant="outline"
						className="rounded-sm px-8 py-6 text-base border-border hover:bg-accent hover:text-accent-foreground"
					>
						<Link href="/auth/sign-in">Sign In to Dashboard</Link>
					</Button>
				</div>

				{/* Role callout */}
				<p
					className="mt-5 text-xs text-muted-foreground/50 tracking-wide"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					Open to licensed MDs, DOs, NPs, PAs, and RNs — credentials
					verified on signup.
				</p>
			</section>

			{/* ════════════════════════════════════════════════════════════════
          STATS STRIP
      ════════════════════════════════════════════════════════════════ */}
			<section className="relative z-10 border-y border-border/60 bg-muted/30">
				<div className="max-w-6xl mx-auto px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
					{STATS.map((s) => (
						<div key={s.unit} className="flex flex-col gap-1">
							<span
								className="text-4xl font-normal text-primary"
								style={{
									fontFamily: "'DM Serif Display', serif",
								}}
							>
								{s.value}
							</span>
							<span
								className="text-[11px] tracking-[0.2em] uppercase text-foreground/70"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								{s.unit}
							</span>
							<span className="text-xs text-muted-foreground/60">
								{s.sub}
							</span>
						</div>
					))}
				</div>
			</section>

			{/* ════════════════════════════════════════════════════════════════
          ABOUT / HOW IT WORKS
      ════════════════════════════════════════════════════════════════ */}
			<section
				id="about"
				className="relative z-10 max-w-6xl mx-auto px-8 py-28"
			>
				<div className="grid md:grid-cols-2 gap-16 items-center">
					<div>
						<p
							className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground/60 mb-5"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							The Problem
						</p>
						<h2
							className="text-4xl md:text-5xl font-normal text-foreground leading-tight mb-6"
							style={{ fontFamily: "'DM Serif Display', serif" }}
						>
							AI in the ED needs a{" "}
							<span className="italic text-primary">
								clinical conscience.
							</span>
						</h2>
						<p className="text-muted-foreground leading-relaxed mb-4">
							Large language models like MedGemma show remarkable
							potential in medical reasoning — but deploying them
							in emergency contexts without rigorous, expert
							validation is a patient safety risk.
						</p>
						<p className="text-muted-foreground leading-relaxed">
							Triage Assist closes that gap. We bring licensed
							clinicians into the loop, systematically capturing
							expert judgment to benchmark model performance
							against real-world clinical standards.
						</p>
					</div>

					{/* Terminal-style card — uses card colors from theme */}
					<div
						className="rounded-sm border border-border bg-card p-6 text-sm shadow-sm"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						<div className="flex items-center gap-2 mb-5 pb-4 border-b border-border">
							<span className="w-3 h-3 rounded-full bg-red-500/70" />
							<span className="w-3 h-3 rounded-full bg-yellow-500/70" />
							<span className="w-3 h-3 rounded-full bg-emerald-500/70" />
							<span className="text-muted-foreground/50 text-xs ml-2">
								scenario_eval.json
							</span>
						</div>
						<div className="space-y-2 text-[13px]">
							<div className="text-muted-foreground/50">
								{"// AI Assessment"}
							</div>
							<div>
								<span className="text-primary">
									triage_level
								</span>
								<span className="text-muted-foreground">
									:{" "}
								</span>
								{/* amber shifts per theme to stay legible */}
								<span className="text-amber-600 dark:text-amber-300">
									&quot;ESI-2 (Emergent)&quot;
								</span>
							</div>
							<div>
								<span className="text-primary">primary_dx</span>
								<span className="text-muted-foreground">
									:{" "}
								</span>
								<span className="text-amber-600 dark:text-amber-300">
									&quot;STEMI — Inferior wall&quot;
								</span>
							</div>
							<div>
								<span className="text-primary">confidence</span>
								<span className="text-muted-foreground">
									:{" "}
								</span>
								<span className="text-sky-600 dark:text-sky-400">
									0.91
								</span>
							</div>
							<div>
								<span className="text-primary">
									interventions
								</span>
								<span className="text-muted-foreground">
									: [
								</span>
							</div>
							``
							<div className="pl-4 text-amber-600 dark:text-amber-300">
								&quot;12-lead ECG stat&quot;,
							</div>
							<div className="pl-4 text-amber-600 dark:text-amber-300">
								&quot;Aspirin 325mg PO&quot;,
							</div>
							<div className="pl-4 text-amber-600 dark:text-amber-300">
								&quot;Cardiology consult&quot;
							</div>
							<div className="text-muted-foreground">]</div>
							<div className="pt-3 border-t border-border text-muted-foreground/50">
								{"// Awaiting clinician grade ▌"}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* ════════════════════════════════════════════════════════════════
          EVAL DIMENSIONS
      ════════════════════════════════════════════════════════════════ */}
			<section
				id="features"
				className="relative z-10 max-w-6xl mx-auto px-8 py-16 pb-28"
			>
				<p
					className="text-[11px] tracking-[0.25em] uppercase text-muted-foreground/60 mb-5"
					style={{ fontFamily: "'DM Mono', monospace" }}
				>
					Evaluation Dimensions
				</p>
				<h2
					className="text-4xl font-normal text-foreground mb-14 max-w-lg leading-tight"
					style={{ fontFamily: "'DM Serif Display', serif" }}
				>
					Four axes of clinical scrutiny.
				</h2>

				<div className="grid md:grid-cols-2 gap-4">
					{FEATURES.map((f, i) => (
						<div
							key={f.label}
							className="group relative border border-border rounded-sm p-7 bg-card hover:bg-accent/50 hover:border-primary/30 transition-all duration-300 shadow-sm"
						>
							{/* Index */}
							<span
								className="absolute top-5 right-6 text-[11px] text-muted-foreground/30"
								style={{ fontFamily: "'DM Mono', monospace" }}
							>
								0{i + 1}
							</span>

							<div className="flex items-start gap-5">
								<span className="text-2xl text-primary mt-0.5 group-hover:scale-110 transition-transform">
									{f.icon}
								</span>
								<div>
									<h3
										className="text-base font-medium text-foreground mb-2 tracking-wide"
										style={{
											fontFamily: "'DM Mono', monospace",
										}}
									>
										{f.label}
									</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">
										{f.description}
									</p>
								</div>
							</div>
						</div>
					))}
				</div>
			</section>

			{/* ════════════════════════════════════════════════════════════════
          CTA SECTION
      ════════════════════════════════════════════════════════════════ */}
			<section className="relative z-10 border-t border-border/60">
				<div className="max-w-6xl mx-auto px-8 py-28 flex flex-col items-center text-center">
					{/* Decorative lines */}
					<div className="flex items-center gap-4 mb-10">
						<div className="w-16 h-px bg-primary/30" />
						<span
							className="text-[11px] tracking-[0.3em] uppercase text-primary"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							For Clinicians
						</span>
						<div className="w-16 h-px bg-primary/30" />
					</div>

					<h2
						className="text-5xl md:text-7xl font-normal text-foreground leading-[0.95] mb-7 max-w-2xl"
						style={{ fontFamily: "'DM Serif Display', serif" }}
					>
						Your expertise{" "}
						<span className="italic text-primary">shapes</span>{" "}
						safer AI.
					</h2>

					<p className="text-muted-foreground max-w-lg text-lg leading-relaxed mb-12 font-light">
						Join a growing network of emergency medicine
						professionals helping ensure AI triage tools meet the
						standard patients deserve before they ever reach a
						clinical setting.
					</p>

					<div className="flex flex-col sm:flex-row gap-4">
						<Button
							asChild
							size="lg"
							className="bg-primary hover:bg-primary/90 text-primary-foreground font-bold text-base rounded-sm px-10 py-6 glow-emerald transition-all"
						>
							<Link href="/sign-up">
								Create Clinician Account
							</Link>
						</Button>
						<Button
							asChild
							size="lg"
							variant="ghost"
							className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-sm px-10 py-6 text-base"
						>
							<Link href="/sign-in">
								Already registered? Sign In
							</Link>
						</Button>
					</div>

					<p
						className="mt-8 text-xs text-muted-foreground/40 max-w-sm"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						All scenario data is de-identified. Participation is
						voluntary. Institutional access available for research
						teams.
					</p>
				</div>
			</section>

			{/* ════════════════════════════════════════════════════════════════
          FOOTER
      ════════════════════════════════════════════════════════════════ */}
			<footer className="relative z-10 border-t border-border/60 px-8 py-8">
				<div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
					<div className="flex items-center gap-3">
						<svg
							width="18"
							height="18"
							viewBox="0 0 28 28"
							fill="none"
						>
							<rect
								x="11"
								y="2"
								width="6"
								height="24"
								rx="1.5"
								className="fill-primary"
							/>
							<rect
								x="2"
								y="11"
								width="24"
								height="6"
								rx="1.5"
								className="fill-primary"
							/>
						</svg>
						<span
							className="text-xs tracking-[0.2em] uppercase text-muted-foreground/40"
							style={{ fontFamily: "'DM Mono', monospace" }}
						>
							Triage Assist · XAI CDSS
						</span>
					</div>
					<p
						className="text-xs text-muted-foreground/30"
						style={{ fontFamily: "'DM Mono', monospace" }}
					>
						For research and clinical validation purposes only. Not
						for direct patient care.
					</p>
				</div>
			</footer>
		</div>
	);
}
