import { Session } from "@supabase/supabase-js";
import { clsx, type ClassValue } from "clsx";
import { decodeJwt } from "jose";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getUserRole(session: Session) {
	const cookie = decodeJwt(session.access_token);

	return cookie["user_role"];
}

export interface APIRequest<T> {
    method: "GET" | "POST" | "PUT" | "DELETE";
    action: string;
    data?: T;

}

export interface APIResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    redirectUrl?: string;
}