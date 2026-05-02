"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from "@tanstack/react-table";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "@/components/ui/dialog";
import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetFooter,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { AccessRequest, UserRole } from "@/lib/types";
import { useInfiniteQuery } from "@tanstack/react-query";

export default function AccessRequestsPage() {
	// const [requests, setUsers] = useState<AccessRequest[]>([]);

	// Edit sheet state
	const [editingRequest, setEditingUser] = useState<AccessRequest | null>(
		null,
	);
	const [editForm, setEditForm] = useState<Partial<AccessRequest>>({});

	// Removal confirmation state
	const [removeCandidate, setRemoveCandidate] =
		useState<AccessRequest | null>(null);

	// Add user sheet state
	const [showAddSheet, setShowAddSheet] = useState(false);

	const removeRequest = (id: string) => {
		// setUsers((s) => s.filter((u) => u.id !== id));
		toast.success("User removed");
	};

	const openEditor = (rq: AccessRequest) => {
		setEditingUser(rq);
		setEditForm({ ...rq });
	};

	const saveEdit = () => {
		if (!editingRequest) return;
		// setUsers((s) =>
		// 	s.map((u) =>
		// 		u.id === editingRequest.id
		// 			? { ...u, ...(editForm as AccessRequest) }
		// 			: u,
		// 	),
		// );
		setEditingUser(null);
		setEditForm({});

		toast.success(
			`Updated user ${(editForm.firstName as string) || editForm.email || "user"}`,
		);
	};

	const PAGE_SIZE = 10;

	const {
		data: requests,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: ["access-requests", PAGE_SIZE],
		queryFn: ({ pageParam = 0 }) => getAccessRequests(pageParam, PAGE_SIZE),
		getNextPageParam: (lastPage, pages) =>
			lastPage.length < PAGE_SIZE ? undefined : pages.length,
		initialPageParam: 0,
		retry: (failureCount, error) => {
			if (failureCount >= 3) {
				console.log("Error prefeching scenarios: " + error);
				toast.error(
					"Failed to prefetch access requests after multiple attempts. Please check your connection.",
				);
				return false; // Stop retrying after 3 attempts
			}
			return true; // Retry on other errors
		},
		retryDelay(failureCount, error) {
			const delay = Math.min(1000 * 4 * failureCount, 30000); // Exponential backoff with max delay
			console.log(
				`Retrying fetch access requests in ${delay}ms... (Attempt ${failureCount})`,
			);
			return delay;
		},
	});

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex items-center justify-between">
						<h2 className="text-lg font-semibold">
							Clinician Access Requests
						</h2>
						<Button onClick={() => setShowAddSheet(true)}>
							Add Request
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Prof. Role</TableHead>
								<TableHead>Reg #</TableHead>
								<TableHead>Institution</TableHead>
								<TableHead>Account Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{requests?.pages
								.flatMap((page) => page)
								.map((request) => (
									<TableRow key={request.id}>
										<TableCell>
											{`${request.firstName || ""} ${request.lastName || ""}`.trim() ||
												"-"}
										</TableCell>
										<TableCell>{request.email}</TableCell>
										<TableCell>
											{request.professionalRole}
										</TableCell>

										<TableCell>
											{request.registrationNumber || "-"}
										</TableCell>
										<TableCell>
											{request.institution?.toUpperCase() ||
												"-"}
										</TableCell>
										<TableCell>
											{request.registrationStatus}
										</TableCell>
										{/* <TableCell>
											{request.denied
												? "Disabled"
												: "Active"}
										</TableCell> */}
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() =>
														openEditor(request)
													}
												>
													Edit
												</Button>{" "}
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														//todo
													}}
												>
													{request.disabled
														? "Enable"
														: "Disable"}
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={() =>
														setRemoveCandidate(
															request,
														)
													}
												>
													Delete
												</Button>
												<Dialog
													open={
														!!removeCandidate &&
														removeCandidate.id ===
															request.id
													}
													onOpenChange={() =>
														setRemoveCandidate(null)
													}
												>
													<DialogContent>
														<DialogHeader>
															<DialogTitle>
																Confirm removal
															</DialogTitle>
															<DialogDescription>
																Delete request{" "}
																{removeCandidate?.email ||
																	""}
																?
															</DialogDescription>
														</DialogHeader>
														<div className="pt-4 flex gap-2">
															<Button
																variant="destructive"
																onClick={() => {
																	if (
																		removeCandidate
																	) {
																		// removeUser(
																		// 	removeCandidate.id,
																		// );
																		setRemoveCandidate(
																			null,
																		);
																	}
																}}
															>
																Delete
															</Button>
															<Button
																variant="outline"
																onClick={() =>
																	setRemoveCandidate(
																		null,
																	)
																}
															>
																Cancel
															</Button>
														</div>
													</DialogContent>
												</Dialog>
											</div>
										</TableCell>
									</TableRow>
								))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			{/* Edit sheet */}
			<Sheet
				open={!!editingRequest}
				onOpenChange={(open) => !open && setEditingUser(null)}
			>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Edit User</SheetTitle>
					</SheetHeader>
					<div className="p-4 flex flex-col gap-2">
						<Label>First Name</Label>
						<Input
							value={(editForm.firstName as string) || ""}
							onChange={(e) =>
								setEditForm((s) => ({
									...s,
									firstName: e.target.value,
								}))
							}
						/>
						<Label>Last Name</Label>
						<Input
							value={(editForm.lastName as string) || ""}
							onChange={(e) =>
								setEditForm((s) => ({
									...s,
									lastName: e.target.value,
								}))
							}
						/>
						<Label>Email</Label>
						<Input
							value={(editForm.email as string) || ""}
							onChange={(e) =>
								setEditForm((s) => ({
									...s,
									email: e.target.value,
								}))
							}
						/>
						<Label>Role</Label>
						<Select
							value={
								(editForm.professionalRole as UserRole) ||
								"user"
							}
							onValueChange={(v) =>
								setEditForm((s) => ({
									...s,
									role: v as UserRole,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select Professional Role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="doctor">doctor</SelectItem>
								<SelectItem value="nurse">nurse</SelectItem>
							</SelectContent>
						</Select>
						{((editForm.professionalRole as UserRole) || "user") ===
							"user" && (
							<>
								<Label>Clinician Position</Label>
								<Select
									value={
										(editForm.registrationStatus as string) ||
										""
									}
									onValueChange={(v) =>
										setEditForm((s) => ({
											...s,
											clinicianPosition: v,
										}))
									}
								>
									<SelectTrigger>
										<SelectValue placeholder="Select position" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="nurse">
											nurse
										</SelectItem>
										<SelectItem value="doctor">
											doctor
										</SelectItem>
									</SelectContent>
								</Select>
								<Label>MOH Registration #</Label>
								<Input
									value={
										(editForm.registrationNumber as string) ||
										""
									}
									onChange={(e) =>
										setEditForm((s) => ({
											...s,
											registrationNumber: e.target.value,
										}))
									}
								/>
							</>
						)}
						<Button
							size="sm"
							variant="outline"
							onClick={() => {
								if (!editingRequest) return;
								setEditForm((s) => ({
									...s,
									disabled: !s.disabled,
								}));
							}}
						>
							{editForm.disabled ? "Enable" : "Disable"}
						</Button>
					</div>
					<SheetFooter>
						<div className="flex gap-2 p-4">
							<Button onClick={saveEdit}>Save</Button>
							<Button
								variant="outline"
								onClick={() => setEditingUser(null)}
							>
								Cancel
							</Button>
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>
		</div>
	);
}
async function getAccessRequests(
	pageParam: number,
	PAGE_SIZE: number,
): Promise<AccessRequest[]> {
	const results = await fetch(
		`/api/access-request?action=GET_REQUESTS&page=${pageParam}&size=${PAGE_SIZE}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!results.ok) {
		toast.error("Failed to fetch access requests. Please try again.");
		throw new Error("Failed to fetch access requests");
	}

	const { data, success, error } = await results.json();

	if (error || !success) {
		toast.error("Failed to fetch access requests. Please try again.");
		throw new Error(error || "Failed to fetch access requests");
	}

	console.log(data);

	return data as AccessRequest[];
}
