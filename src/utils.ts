export function fixPrecision(value: number, maxFractionDigits: number) {
	return Math.round(value * (10 ** maxFractionDigits)) / (10 ** maxFractionDigits);
}
