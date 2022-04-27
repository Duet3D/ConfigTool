import type ConfigModel from "@/store/model";

/**
 * Strip default modifiers from a given port (aka '!', '^')
 * @param value Port to strip
 * @returns Stripped port
 */
export function stripPort(value: string): string {
	return value.replace(/[!^]+/, "");
}

export function checkPorts(model: ConfigModel) {
	// TODO

}
