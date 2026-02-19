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

const initialUsers: UserRecord[] = [
	{
		id: "u-001",
		firstName: "Alice",
		lastName: "Admin",
		email: "alice@example.com",
		role: "admin",
		tempPassword: undefined,
		disabled: false,
		metrics: { logins: 12, scenariosGraded: 34, scenariosAdded: 4 },
	},
	{
		id: "u-002",
		firstName: "Bob",
		lastName: "Clinician",
		email: "bob@example.com",
		role: "user",
		tempPassword: undefined,
		disabled: false,
		metrics: { logins: 6, scenariosGraded: 8, scenariosAdded: 1 },
		clinicianPosition: "nurse",
		registrationNumber: "MOH-123456",
	},
	{
		id: "u-003",
		firstName: "Carol",
		lastName: "Editor",
		email: "carol@example.com",
		role: "editor",
		tempPassword: undefined,
		disabled: true,
		metrics: { logins: 2, scenariosGraded: 1, scenariosAdded: 0 },
	},
];

export default function UserManagementPage() {
	const [users, setUsers] = useState<UserRecord[]>(initialUsers);

	// Add form state
	const [firstName, setFirstName] = useState("");
	const [lastName, setLastName] = useState("");
	const [email, setEmail] = useState("");
	const [tempPassword, setTempPassword] = useState("");
	const [role, setRole] = useState<Role>("user");
	const [clinicianPosition, setClinicianPosition] = useState("");
	const [registrationNumber, setRegistrationNumber] = useState("");

	// Edit sheet state
	const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
	const [editForm, setEditForm] = useState<Partial<UserRecord>>({});

	// Removal confirmation state
	const [removeCandidate, setRemoveCandidate] = useState<UserRecord | null>(
		null,
	);

	// Add user sheet state
	const [showAddSheet, setShowAddSheet] = useState(false);

	const addUser = () => {
		if (!email) return;
		const id = `u-${String(users.length + 1).padStart(3, "0")}`;
		const newUser: UserRecord = {
			id,
			firstName: firstName || undefined,
			lastName: lastName || undefined,
			email,
			role,
			tempPassword: tempPassword || undefined,
			disabled: false,
			metrics: { logins: 0, scenariosGraded: 0, scenariosAdded: 0 },
			clinicianPosition:
				role === "user" ? clinicianPosition || undefined : undefined,
			registrationNumber:
				role === "user" ? registrationNumber || undefined : undefined,
		};
		setUsers((s) => [...s, newUser]);
		setFirstName("");
		setLastName("");
		setEmail("");
		setTempPassword("");
		setRole("user");
		setClinicianPosition("");
		setRegistrationNumber("");

		toast.success(`Added user ${newUser.firstName || newUser.email}`);
	};

	const removeUser = (id: string) => {
		setUsers((s) => s.filter((u) => u.id !== id));
		toast.success("User removed");
	};

	const openEditor = (u: UserRecord) => {
		setEditingUser(u);
		setEditForm({ ...u });
	};

	const saveEdit = () => {
		if (!editingUser) return;
		setUsers((s) =>
			s.map((u) =>
				u.id === editingUser.id
					? { ...u, ...(editForm as UserRecord) }
					: u,
			),
		);
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
								<TableHead>Role</TableHead>
								<TableHead>Position</TableHead>
								<TableHead>Reg #</TableHead>
								<TableHead>Disabled</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{users.map((u) => (
								<TableRow key={u.id}>
									<TableCell>
										{`${u.firstName || ""} ${u.lastName || ""}`.trim() ||
											"-"}
									</TableCell>
									<TableCell>{u.email}</TableCell>
									<TableCell>{u.role}</TableCell>
									<TableCell>
										{u.clinicianPosition || "-"}
									</TableCell>
									<TableCell>
										{u.registrationNumber || "-"}
									</TableCell>
									<TableCell>
										{u.disabled ? "Yes" : "No"}
									</TableCell>
									<TableCell>
										<div className="flex gap-2">
											<Button
												size="sm"
												variant="outline"
												onClick={() => openEditor(u)}
											>
												Edit
											</Button>
											<Button
												size="sm"
												variant="destructive"
												onClick={() =>
													setRemoveCandidate(u)
												}
											>
												Remove
											</Button>
											<Dialog
												open={
													!!removeCandidate &&
													removeCandidate.id === u.id
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
							value={(editForm.role as Role) || "user"}
							onValueChange={(v) =>
								setEditForm((s) => ({ ...s, role: v as Role }))
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
						{((editForm.role as Role) || "user") === "user" && (
							<>
								<Label>Clinician Position</Label>
								<Select
									value={
										(editForm.clinicianPosition as string) ||
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
