import { useState, useEffect } from "react";

type PointerLocation = {
	x: number;
	y: number;
};

export function usePointerLocation() {
	const [pointerLocation, setPointerLocation] = useState<PointerLocation>({
		x: 0,
		y: 0,
	});

	useEffect(() => {
		const handleMouseMove = (event: MouseEvent) => {
			console.log({
				x: event.movementX,
				y: event.movementY,
			});
			setPointerLocation({
				x: event.clientX,
				y: event.clientY,
			});
		};

		window.addEventListener("mousemove", handleMouseMove);

		return () => {
			window.removeEventListener("mousemove", handleMouseMove);
		};
	}, []);

	return pointerLocation;
}
