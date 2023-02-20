import { CoreKinematics, KinematicsName, NetworkInterfaceType, ProbeType } from "@duet3d/objectmodel";
import ejs from "ejs";

import { useStore } from "@/store";
import { precise } from "@/utils";

import packageInfo from "../../package.json";
import { ConfigDriverClosedLoopEncoderType, ConfigDriverMode } from "./model/ConfigDriver";
import { ConfigPort, ConfigPortFunction, stripBoard } from "./model/ConfigPort";
import { isDefaultCoreKinematics } from "./defaults";
import { ExpansionBoards, getExpansionBoardDefinition } from "./ExpansionBoards";

const store = useStore();

/**
 * Indent the comments in a G-code file
 * @param content File content
 * @returns Indented file content
 */
export function indent(content: string): string {
    const lines = content.split('\n');

    // Find out how long the maximum command is
    let maxCommandLength = 0;
    for (const line of lines) {
        const commentIndex = line.startsWith(';') ? line.substring(1).indexOf(';') - 1 : line.indexOf(';');
        if (commentIndex > maxCommandLength) {
            maxCommandLength = commentIndex;
        }
    }

    // Align line comments
    let newResult = "";
    for (const line of lines) {
        const commentIndex = line.indexOf(';');
        if (commentIndex <= 0) {
            newResult += line + '\n';
        } else {
            const command = line.substring(0, commentIndex - 1), comment = line.substring(commentIndex);

            let indentation = "";
            for (let i = command.length; i < maxCommandLength; i++) {
                indentation += ' ';
            }

            newResult += command + indentation + comment + '\n';
        }
    }
    return newResult.trim();
}

const renderOptions = {
    // Basics
    /* filename, */
    model: store.data,
    /* render, */
    version: packageInfo.version,

    // Display helpers
    capitalize(value: string) {
        return (value.length > 0) ? value.charAt(0).toUpperCase() + value.slice(1) : value;
    },
    escape(value: string) {
        return '"' + value.replace(/"/g, '""').replace(/'/g, "''") + '"';
    },
    params(params: Record<string, any>) {
        return Object.keys(params)
                .filter(key => (params[key] !== undefined) && (!(params[key] instanceof Array) || params[key].length > 0))
                .map(key => {
                    const value = params[key]
                    if (value === null) {
                        return key;
                    }
                    if (typeof value === "string") {
                        return key + this.escape(value);
                    }
                    if (value instanceof Array) {
                        return key + value.join(':');
                    }
                    return key + value;
                }, this)
                .join(' ');
    },
    precise,
    reduce(array: Array<any>) {
        if (array.length === 0) {
            // skip parameter if no values are present
            return undefined;
        }
        return (array.some(item => item !== array[0])) ? array : array[0];
    },
    sections(sections: Record<string, string>) {
        const result = [];
        for (const key in sections) {
            const value = sections[key].trimEnd();
            if (value !== "") {
                result.push(this.title(key, value));
            }
        }
        return result.join("\n");
    },
    title(title: string, section: string) {
        if (section.trim() !== "") {
            return `; ${title}\n${section.trimEnd()}\n`;
        }
        return "";
    },

    // Ports
    getPort(fn: ConfigPortFunction, index?: number, secondaryIndex?: number): ConfigPort | null {
        let secondaryCounter = 0;
        for (const port of store.data.configTool.ports) {
            if (port.function === fn && ((index === undefined) || (index === port.index)) && ((secondaryIndex === undefined) || (secondaryIndex === secondaryCounter++))) {
                return port;
            }
        }
        return null;
    },
    getPortParam(fn: ConfigPortFunction, index?: number, secondaryIndex?: number): string {
        const port = this.getPort(fn, index, secondaryIndex);
        return `"${(port != null) ? port.toString() : "nil"}"`;
    },
    getCombinedPortParam(fns: Array<ConfigPortFunction>, index?: number): string | undefined {
        const ports: Array<string> = [];
        for (const fn of fns) {
            let portFound = false;
            for (const port of store.data.configTool.ports) {
                if (port.function === fn && ((index === undefined) || (index === port.index))) {
                    if (ports.length === 0) {
                        ports.push(port.toString());
                    } else {
                        ports.push(stripBoard(port.toString()));
                    }
                    portFound = true;
                    break;
                }
            }
            if (!portFound) {
                ports.push("nil");
            }
        }
        for (let i = ports.length - 1; i >= 0; i--) {
            if (ports[i] === "nil") {
                ports.unshift();
            } else {
                break;
            }
        }
        return (ports.length > 0) ? `"${ports.join('+')}"` : undefined;
    },
    getProbeServoIndex(probeIndex: number) {
        let servoIndex = 0;
        for (const port of this.model.configTool.ports) {
            if (port.function === ConfigPortFunction.servo) {
                if (servoIndex <= port.index) {
                    // First probe servo index must be greater than last user-defined servo index
                    servoIndex = port.index + 1;
                }   
            }
        }
        for (let i = 0; i < probeIndex; i++) {
            const probe = this.model.sensors.probes[i];
            if (probe !== null && (this.model.configTool.deployRetractProbes.has(i) || probe.type === ProbeType.blTouch)) {
                servoIndex++;
            }
        }
        return servoIndex;
    },

    // Boards
    mainboard: null,
    ExpansionBoards,
    getExpansionBoardDefinition,

    // Kinematics
    ConfigDriverClosedLoopEncoderType,
    ConfigDriverMode,
    ConfigPortFunction,
    CoreKinematics,
    isDefaultCoreKinematics,
    KinematicsName,

    // Other
    NetworkInterfaceType,
    ProbeType
};
Object.defineProperty(renderOptions, "mainboard", { get: () => store.data.boards.find(board => !board.canAddress) });

/**
 * Render a file and obtain the result as a string
 * @param template Name of the template to render
 * @param args Custom arguments to pass in the EJS context
 * @returns Rendered file
 */
export async function render(template: string, args: Record<string, any> = {}): Promise<string> {
    // Retrieve template
    const fullFilename = `${import.meta.env.BASE_URL}templates/${template.replace(/(\d+)$/, "")}.ejs`;   // remove potential index at the end
    const response = await fetch(fullFilename);
    if (!response.ok) {
        throw new Error(`Failed to get ${fullFilename}: ${response.status} ${response.statusText}`);
    }
    const responseText = await response.text();

    // Prepare args
    const renderArgs: Record<string, any> = { ...renderOptions, ...args };
    renderArgs.filename = template.split('/')[0] + ".g";
    renderArgs.preview ??= true;
    renderArgs.render = (file: string, subArgs: Record<string, any> = {}) => render(file, { ...renderArgs, ...subArgs });

    // Render file
    try {
        return await ejs.render(responseText, renderArgs, { async: true, cache: false });
    } catch (e) {
        console.warn(`Failed to render file ${fullFilename}`);
        throw e;
    }
}

/**
 * Render a full file and write the result to a new tab window.
 * This may be replaced with a modal dialog at some point
 * @param template Name of the template to render
 * @param args Custom arguments to pass in the EJS context
 */
export async function renderFull(template: string, args: Record<string, any> = {}) {
    const baseTemplate = template.split('/')[0];
    let output = await render(baseTemplate, { ...args, preview: false });
    output = indent(output).replace(/\n/g, "<br>").replace(/ /g, "&nbsp;");

    let tab = window.open("about:blank", "_blank");
    if (tab === null) {
        alert("Could not open a new tab!\n\nPlease allow pop-ups for this page and try again.");
    } else {
        tab.document.write(output);
        tab.document.title = baseTemplate + ".g";
        (tab.document.body as HTMLBodyElement).style.fontFamily = "monospace";
        tab.document.close();
    }
}
