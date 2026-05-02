"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useInfiniteQuery } from "@tanstack/react-query";
import { UserData } from "@/lib/types";

type Role = "admin" | "editor" | "viewer" | "user";

interface UserRecord {
	id: string;
	firstName?: string;
	lastName?: string;
	email: string;
	role: Role;
	tempPassword?: string;
	disabled: boolean;
	metrics: {
		logins: number;
		scenariosGraded: number;
		scenariosAdded: number;
	};
	clinicianPosition?: "nurse" | "doctor" | string;
	registrationNumber?: string;
}

export default function UserManagementPage() {
	// const [users, setUsers] = useState<UserRecord[]>([]);

	// Add form state
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [tempPassword, setTempPassword] = useState("");
	const [role, setRole] = useState<Role>("user");
	const [clinicianPosition, setClinicianPosition] = useState("");
	const [registrationNumber, setRegistrationNumber] = useState("");

	// Edit sheet state
	const [editingUser, setEditingUser] = useState<UserData | null>(null);
	const [editForm, setEditForm] = useState<Partial<UserData>>({});

	// Removal confirmation state
	const [removeCandidate, setRemoveCandidate] = useState<UserData | null>(
		null,
	);

	// Add user sheet state
	const [showAddSheet, setShowAddSheet] = useState(false);

	const addUser = () => {
		// if (!email) return;
		// const id = `u-${String(users.length + 1).padStart(3, "0")}`;
		// const newUser: UserData = {
		// 	id,
		// 	firstName: firstName || undefined,
		// 	lastName: lastName || undefined,
		// 	email,
		// 	role,
		// 	tempPassword: tempPassword || undefined,
		// 	disabled: false,
		// 	metrics: { logIns: 0, scenariosGraded: 0, scenariosAdded: 0 },
		// 	clinicianProfile: {
		// 		professionalRole: role === "user" ? clinicianPosition || undefined : undefined,
		// 		registrationNumber: role === "user" ? registrationNumber || undefined : undefined,
		// 	},
		// 	registrationNumber:
		// 		role === "user" ? registrationNumber || undefined : undefined,
		// };
		// setFirstName("");
		// setLastName("");
		// setEmail("");
		// setTempPassword("");
		// setRole("user");
		// setClinicianPosition("");
		// setRegistrationNumber("");
		// toast.success(`Added user ${newUser.firstName || newUser.email}`);
	};

	const removeUser = (id: string) => {
		toast.success("User removed");
	};

	const openEditor = (u: UserData) => {
		setEditingUser(u);
		setEditForm({ ...u });
	};

	const saveEdit = () => {
		if (!editingUser) return;
		// setUsers((s) =>
		// 	s.map((u) =>
		// 		u.id === editingUser.id
		// 			? { ...u, ...(editForm as UserRecord) }
		// 			: u,
		// 	),
		// );
		setEditingUser(null);
		setEditForm({});

		toast.success(
			`Updated user ${(editForm.firstName as string) || editForm.email || "user"}`,
		);
	};

	const handleAddSubmit = () => {
		addUser();
		setShowAddSheet(false);
	};

	const PAGE_SIZE = 10;

	const {
		data: users,
		isLoading,
		error,
	} = useInfiniteQuery({
		queryKey: ["users", PAGE_SIZE],
		queryFn: ({ pageParam = 0 }) => getUsers(pageParam, PAGE_SIZE),
		getNextPageParam: (lastPage, pages) =>
			lastPage.length < PAGE_SIZE ? undefined : pages.length,
		initialPageParam: 0,
		retry: (failureCount, error) => {
			if (failureCount >= 3) {
				console.log("Error prefeching users: " + error);
				toast.error(
					"Failed to prefetch users after multiple attempts. Please check your connection.",
				);
				return false; // Stop retrying after 3 attempts
			}
			return true; // Retry on other errors
		},
		retryDelay(failureCount, error) {
			const delay = Math.min(1000 * 4 * failureCount, 30000); // Exponential backoff with max delay
			console.log(
				`Retrying fetch users in ${delay}ms... (Attempt ${failureCount})`,
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
							User Management
						</h2>
						<Button onClick={() => setShowAddSheet(true)}>
							Add User
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Email Verified</TableHead>
								<TableHead>App Role</TableHead>
								<TableHead>Disabled</TableHead>
								<TableHead>Institution</TableHead>
								<TableHead>Position</TableHead>
								<TableHead>Reg #</TableHead>
								<TableHead>Reg Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users?.pages
								.flatMap((page) => page)
								.map((u) => (
									<TableRow key={u.id}>
										<TableCell>
											{`${u.firstName || ""} ${u.lastName || ""}`.trim() ||
												"-"}
										</TableCell>
										<TableCell>{u.email}</TableCell>
										<TableCell>
											{u.emailVerified ? "Yes" : "No"}
										</TableCell>
										<TableCell>{u.role || "-"}</TableCell>
										<TableCell>
											{u.disabled ? "Yes" : "No"}
										</TableCell>
										<TableCell>
											{u.clinicianProfile?.institution ||
												"-"}
										</TableCell>
										<TableCell>
											{u.clinicianProfile
												?.professionalRole || "-"}
										</TableCell>
										<TableCell>
											{u.clinicianProfile
												?.registrationNumber || "-"}
										</TableCell>
										<TableCell>
											{u.clinicianProfile
												?.registrationStatus || "-"}
										</TableCell>
										<TableCell>
											<div className="flex gap-2">
												<Button
													size="sm"
													variant="outline"
													onClick={() => {
														openEditor(u);
													}}
												>
													Edit
												</Button>
												<Button
													size="sm"
													variant="destructive"
													onClick={
														() => {}
														// setRemoveCandidate(u)
													}
												>
													Remove
												</Button>
												<Dialog
													open={
														!!removeCandidate &&
														removeCandidate.id ===
															u.id
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
																Remove user{" "}
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
																		removeUser(
																			removeCandidate.id,
																		);
																		setRemoveCandidate(
																			null,
																		);
																	}
																}}
															>
																Remove
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

			{/* Add User Sheet */}
			<Sheet
				open={showAddSheet}
				onOpenChange={(open) => !open && setShowAddSheet(false)}
			>
				<SheetContent side="right">
					<SheetHeader>
						<SheetTitle>Add User</SheetTitle>
					</SheetHeader>
					<div className="p-4 flex flex-col gap-4">
						<div>
							<Label>First Name</Label>
							<Input
								placeholder="First name"
								value={firstName}
								onChange={(e) => setFirstName(e.target.value)}
							/>
						</div>
						<div>
							<Label>Last Name</Label>
							<Input
								placeholder="Last name"
								value={lastName}
								onChange={(e) => setLastName(e.target.value)}
							/>
						</div>
						<div>
							<Label>Email</Label>
							<Input
								placeholder="Email"
								value={email}
								onChange={(e) => setEmail(e.target.value)}
							/>
						</div>
						<div>
							<Label>Temp password</Label>
							<Input
								placeholder="Temp password"
								value={tempPassword}
								onChange={(e) =>
									setTempPassword(e.target.value)
								}
							/>
						</div>
						<div>
							<Label>Role</Label>
							<Select
								value={role}
								onValueChange={(v) => setRole(v as Role)}
							>
								<SelectTrigger>
									<SelectValue placeholder="Role" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="admin">admin</SelectItem>
									<SelectItem value="editor">
										editor
									</SelectItem>
									<SelectItem value="viewer">
										viewer
									</SelectItem>
									<SelectItem value="user">user</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{role === "user" && (
							<>
								<div>
									<Label>Clinician Position</Label>
									<Select
										value={clinicianPosition}
										onValueChange={(v) =>
											setClinicianPosition(v)
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Clinician position" />
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
								</div>
								<div>
									<Label>MOH Registration #</Label>
									<Input
										placeholder="MOH registration #"
										value={registrationNumber}
										onChange={(e) =>
											setRegistrationNumber(
												e.target.value,
											)
										}
									/>
								</div>
							</>
						)}
					</div>
					<SheetFooter>
						<div className="flex gap-2 p-4">
							<Button onClick={handleAddSubmit}>Add</Button>
							<Button
								variant="outline"
								onClick={() => setShowAddSheet(false)}
							>
								Cancel
							</Button>
						</div>
					</SheetFooter>
				</SheetContent>
			</Sheet>

			{/* Edit sheet */}
			<Sheet
				open={!!editingUser}
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
							// value={(editForm.role as Role) || "user"}
							onValueChange={(v) =>
								setEditForm((s) => ({
									...s,
									role: v as Role,
								}))
							}
						>
							<SelectTrigger>
								<SelectValue placeholder="Select role" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="admin">admin</SelectItem>
								<SelectItem value="editor">editor</SelectItem>
								<SelectItem value="viewer">viewer</SelectItem>
								<SelectItem value="user">user</SelectItem>
							</SelectContent>
						</Select>
						{editForm?.clinicianProfile && (
							<>
								<Label>Clinician Position</Label>
								<Select
									value={
										(editForm.clinicianProfile
											.professionalRole as string) || ""
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
										(editForm.clinicianProfile
											?.registrationNumber as string) ||
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
								if (!editingUser) return;
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
async function getUsers(
	pageParam: number,
	PAGE_SIZE: number,
): Promise<UserData[]> {
	const results = await fetch(
		`/api/users?action=GET_USERS&page=${pageParam}&size=${PAGE_SIZE}`,
		{
			method: "GET",
			headers: {
				"Content-Type": "application/json",
			},
		},
	);

	if (!results.ok) {
		toast.error("Failed to fetch users. Please try again.");
		throw new Error("Failed to fetch users");
	}

	const { data, success, error } = await results.json();

	if (error || !success) {
		toast.error("Failed to fetch users. Please try again.");
		throw new Error(error || "Failed to fetch users");
	}

	console.log(data);

	return data as UserData[];
}
