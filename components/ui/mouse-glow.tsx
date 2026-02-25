"use client";
import { usePointerLocation } from "@/hooks/use-pointer-location";
import React, { useEffect } from "react";

export default function MouseGlow() {
	const { x, y } = usePointerLocation();
	const ref = React.useRef<HTMLDivElement>(null);

	// useEffect(() => {
	// 	if (!!ref?.current) {
	// 		ref.current.style.transform = `translate(${x}px, ${y}px)`;
	// 	}

	// 	return () => {};
	// }, [x, y]);

	return (
		<div
			ref={ref}
			className="ambient-glow pointer-events-none fixed  w-[800px] h-[500px] rounded-full blur-[60px]"
			style={{
				top: y,
				left: x,
			}}
		/>
	);
}
