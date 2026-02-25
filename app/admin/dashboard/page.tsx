"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
	Table,
	TableHeader,
	TableBody,
	TableRow,
	TableHead,
	TableCell,
} from "@/components/ui/table";
import AuthRedirect from "@/components/auth-redirect";

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

export default function DashboardPage() {
	const [users] = useState<UserRecord[]>(initialUsers);

	const totals = useMemo(() => {
		return users.reduce(
			(acc, u) => {
				acc.logins += u.metrics.logins;
				acc.scenariosGraded += u.metrics.scenariosGraded;
				acc.scenariosAdded += u.metrics.scenariosAdded;
				return acc;
			},
			{ logins: 0, scenariosGraded: 0, scenariosAdded: 0 },
		);
	}, [users]);

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">User Metrics</h2>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<div className="text-sm text-muted-foreground">
							Totals
						</div>
						<div className="flex gap-6 pt-2">
							<div>
								Logins: <strong>{totals.logins}</strong>
							</div>
							<div>
								Graded:{" "}
								<strong>{totals.scenariosGraded}</strong>
							</div>
							<div>
								Added: <strong>{totals.scenariosAdded}</strong>
							</div>
						</div>
					</div>

					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Name</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Role</TableHead>
								<TableHead>Logins</TableHead>
								<TableHead>Scenarios Graded</TableHead>
								<TableHead>Scenarios Added</TableHead>
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
									<TableCell>{u.metrics.logins}</TableCell>
									<TableCell>
										{u.metrics.scenariosGraded}
									</TableCell>
									<TableCell>
										{u.metrics.scenariosAdded}
									</TableCell>
								</TableRow>
							))}
						</TableBody>
					</Table>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<h2 className="text-lg font-semibold">Overall Metrics</h2>
				</CardHeader>
				<CardContent>
					<div className="text-sm text-muted-foreground">
						Placeholder for overall metrics (system-wide)
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
