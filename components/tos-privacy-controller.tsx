"use client";

import React from "react";
import TosPrivacyDialog from "./tos-privacy-dialog";

/**
 * useTosDialog
 * - call `show()` to open the dialog and await the user's decision
 * - `Dialog` is a React component you can render anywhere (typically near root)
 */
export function useTosDialog() {
	const [open, setOpen] = React.useState(false);
	const resolverRef = React.useRef<((accepted: boolean) => void) | null>(
		null,
	);

	const show = React.useCallback((): Promise<boolean> => {
		console.debug("useTosDialog.show() called — opening dialog");
		setOpen(true);
		return new Promise((resolve) => {
			console.debug("useTosDialog: resolver created");
			resolverRef.current = (accepted: boolean) => {
				console.debug("useTosDialog: resolving promise ->", accepted);
				resolve(accepted);
			};
		});
	}, []);

	const handleAccept = React.useCallback(() => {
		console.debug("useTosDialog.handleAccept()");
		setOpen(false);
		if (resolverRef.current) {
			resolverRef.current(true);
			resolverRef.current = null;
		} else {
			console.debug(
				"useTosDialog.handleAccept(): no resolver to resolve",
			);
		}
	}, []);

	const handleReject = React.useCallback(() => {
		console.debug("useTosDialog.handleReject()");
		setOpen(false);
		if (resolverRef.current) {
			resolverRef.current(false);
			resolverRef.current = null;
		} else {
			console.debug(
				"useTosDialog.handleReject(): no resolver to resolve",
			);
		}
	}, []);

	const Dialog = React.useMemo(() => {
		return function TosDialogWrapper() {
			return (
				<TosPrivacyDialog
					open={open}
					onAccept={handleAccept}
					onReject={handleReject}
					onOpenChange={(v: boolean) => {
						console.debug("useTosDialog: onOpenChange ->", v);
						// if dialog closed by outside/X ensure promise resolves false
						if (!v && resolverRef.current) {
							console.debug(
								"useTosDialog: dialog closed externally — resolving false",
							);
							resolverRef.current(false);
							resolverRef.current = null;
						}
						setOpen(v);
					}}
				/>
			);
		};
	}, [open, handleAccept, handleReject]);

	return {
		show,
		Dialog,
		open,
		setOpen,
	} as const;
}

/**
 * Convenience component: renders a trigger and the dialog using the hook internally.
 * Example: <TosPrivacyController trigger={<Button>Open</Button>} onDecision={(accepted) => {}} />
 */
export function TosPrivacyController({
	trigger,
	onDecision,
}: {
	trigger: React.ReactNode;
	onDecision?: (accepted: boolean) => void;
}) {
	const { show, Dialog } = useTosDialog();

	const handleClick = React.useCallback(async () => {
		const accepted = await show();
		onDecision?.(accepted);
	}, [show, onDecision]);

	return (
		<>
			<span onClick={handleClick}>{trigger}</span>
			<Dialog />
		</>
	);
}
