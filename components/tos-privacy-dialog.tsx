"use client";

import * as React from "react";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
	DialogTrigger,
	DialogClose,
} from "./ui/dialog";
import { Button } from "./ui/button";

type Props = {
	open?: boolean;
	onAccept: () => void;
	onReject: () => void;
	trigger?: React.ReactNode;
	onOpenChange?: (open: boolean) => void;
};

export default function TosPrivacyDialog({
	open: controlledOpen,
	onAccept,
	onReject,
	trigger,
	onOpenChange,
}: Props) {
	const [open, setOpen] = React.useState<boolean>(!!controlledOpen);

	// track action to avoid double-invoking handlers when closing
	const actionRef = React.useRef<"accepted" | "rejected" | null>(null);

	React.useEffect(() => {
		if (typeof controlledOpen === "boolean") setOpen(controlledOpen);
	}, [controlledOpen]);

	const handleOpenChange = (v: boolean) => {
		setOpen(v);
		onOpenChange?.(v);
		if (!v) {
			// closed by user (click outside / X) unless an action was taken
			if (actionRef.current === null) {
				onReject();
			}
			// reset action state after close
			actionRef.current = null;
		}
	};

	return (
		<Dialog open={open} onOpenChange={handleOpenChange} modal>
			{trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
			<DialogContent>
				<DialogHeader>
					<DialogTitle>
						📜 Terms of Service & 🔒 Privacy Policy
					</DialogTitle>
					<DialogDescription>
						Please read and accept our Terms of Service and Privacy
						Policy to continue using the platform.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-4 max-h-[50vh] overflow-auto space-y-4 text-sm text-muted-foreground">
					<section>
						<h3 className="font-semibold">
							🔒 Privacy Policy (Snippet)
						</h3>
						<ol className="list-decimal pl-5 space-y-2 mt-2">
							<li>
								<strong>Data Collection & Usage:</strong> We
								collect your professional profile data (name,
								role, specialty) via Supabase to categorize
								evaluation metrics. Your grading of AI scenarios
								and qualitative feedback are stored to improve
								the clinical accuracy of medical LLMs.
							</li>
							<li>
								<strong>
									No Protected Health Information (PHI):
								</strong>{" "}
								This platform has a Strict Zero-PHI Policy. You
								must not upload, enter, or reference any
								real-world patient identifiers. All scenarios
								provided are synthetic or de-identified. Any
								breach of this policy will result in immediate
								account termination.
							</li>
							<li>
								<strong>Third-Party Service Providers:</strong>{" "}
								Your data is securely processed by: Supabase
								(auth & DB), Google Cloud (Vertex AI) for model
								inference, and Vercel for hosting and
								performance monitoring.
							</li>
						</ol>
					</section>

					<section>
						<h3 className="font-semibold">
							📜 Terms of Service (Snippet)
						</h3>
						<ol className="list-decimal pl-5 space-y-2 mt-2">
							<li>
								<strong>Research & Evaluation Only:</strong>{" "}
								This platform is a sandbox environment for the
								evaluation of MedGemma (AI). By accessing this
								tool, you acknowledge that it is intended for
								research purposes only. AI-generated outputs are
								experimental and should never be applied to
								real-life patient care.
							</li>
							<li>
								<strong>User Eligibility:</strong> Access is
								restricted to licensed healthcare professionals.
								By creating an account, you represent and
								warrant that you are a qualified clinician and
								that information provided about your
								professional role is accurate.
							</li>
							<li>
								<strong>Limitation of Liability:</strong> The
								development team, Google Cloud, and Vercel shall
								not be held liable for any decisions made based
								on AI-generated content. You agree that as a
								clinician, you are using this tool to critique
								an LLM, not to receive medical advice.
							</li>
						</ol>
					</section>
				</div>

				<DialogFooter>
					<Button
						type="button"
						variant="ghost"
						onClick={() => {
							actionRef.current = "rejected";
							setOpen(false);
							onReject();
						}}
					>
						Reject
					</Button>

					<Button
						type="submit"
						onClick={() => {
							actionRef.current = "accepted";
							onAccept();
							setOpen(false);
						}}
					>
						Accept
					</Button>
				</DialogFooter>

				<DialogClose
					onClick={() => {
						setOpen(false);
					}}
				/>
			</DialogContent>
		</Dialog>
	);
}
