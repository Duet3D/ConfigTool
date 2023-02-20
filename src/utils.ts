/**
 * Get a rounded value with a custom maximum number of fraction digits
 * @param value Value to round
 * @param maxFractionDigits Maximum number of fraction digits to show
 * @returns	Rounded value
 */
export function precise(value: number, maxFractionDigits: number = 0) {
	const factor = 10 ** maxFractionDigits;
	return (Math.round(value * factor) / factor);
}
