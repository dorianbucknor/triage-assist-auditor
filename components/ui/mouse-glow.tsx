"use client";
import { usePointerLocation } from "@/hooks/use-pointer-location";
import React, { RefObject, useEffect, useRef } from "react";
import useMouse from "@react-hook/mouse-position";

export default function MouseGlow({
	parentRef,
}: {
	parentRef: RefObject<HTMLElement> | null;
}) {
	
	const ref = useRef<HTMLDivElement>(null);
const { x, y } = useMouse(parentRef);

	return (
		<div
			ref={ref}
			className="ambient-glow pointer-events-none fixed  w-[800px] h-[500px] rounded-full blur-[60px]"
			style={{
				top: y || window.innerHeight / 2,
				left: x || window.innerWidth / 2,
			}}
		/>
	);
}
