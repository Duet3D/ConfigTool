import { ProbeType } from "@duet3d/objectmodel";

import { useStore } from ".";

/**
 * Types of configuration sections
 */
export enum ConfigSectionType {
    General = "general",
    Accessories = "accessories",
    Network = "network",
    Expansion = "expansion",
    Kinematics = "kinematics",
    Drivers = "drivers",
    Axes = "axes",
    Extruders = "extruders",
    Probes = "probes",
    Endstops = "endstops",
    Compensation = "compensation",
    Sensors = "sensors",
    Heaters = "heaters",
    Spindles = "spindles",
    Lasers = "lasers",
    Fans = "fans",
    Tools = "tools",
    Miscellaneous = "miscellaneous"
}

/**
 * Get the list of section identifiers to display
 * @param model Object model
 * @returns List of section identifiers
 */
export function getSections() {
    const store = useStore();
    return [
        ConfigSectionType.General,
        ConfigSectionType.Accessories,
        (store.data.network.interfaces.length > 0) ? ConfigSectionType.Network : null,
        ConfigSectionType.Expansion,
        ConfigSectionType.Kinematics,
        ConfigSectionType.Drivers,
        ConfigSectionType.Axes,
        (store.data.configTool.capabilities.fff) ? ConfigSectionType.Extruders : null,
        ConfigSectionType.Probes,
        ConfigSectionType.Endstops,
        ConfigSectionType.Compensation,
        ConfigSectionType.Sensors,
        (store.data.configTool.capabilities.fff) ? ConfigSectionType.Heaters : null,
        (store.data.configTool.capabilities.cnc) ? ConfigSectionType.Spindles : null,
        (store.data.configTool.capabilities.laser) ? ConfigSectionType.Lasers : null,
        ConfigSectionType.Fans,
        ConfigSectionType.Tools, 
        ConfigSectionType.Miscellaneous
    ].filter(item => item !== null) as Array<ConfigSectionType>;
}

/**
 * Get the list of templates and template payloads to generate, optionally for a specific section
 * @param section Requested section or undefined for full bundle
 * @returns List of templates to generate
 */
export function getSectionTemplates(section?: ConfigSectionType) {
    const store = useStore(), result: Array<{ template: string, data: Record<string, any> | null }> = [];
    function addDeployRetractProbeTemplates() {
        for (let i = 0; i < store.data.sensors.probes.length; i++) {
            const probe = store.data.sensors.probes[i];
            if ((probe !== null) && (store.data.configTool.deployRetractProbes.has(i) || probe.type === ProbeType.blTouch)) {
                const data = {
                    probe,
                    probeIndex: store.data.sensors.probes.findIndex(item => item !== null)
                };

                if (store.data.sensors.probes.length === 1) {
                    result.push({ template: "deployprobe", data });
                    result.push({ template: "retractprobe", data });
                } else {
                    result.push({ template: `deployprobe${i}`, data });
                    result.push({ template: `retractprobe${i}`, data });
                }
            }
        }
    }
    function addHomingTemplates() {
        for (let i = 0; i < store.data.sensors.probes.length; i++) {
            const probe = store.data.sensors.probes[i];
            if ((probe !== null) && (store.data.configTool.deployRetractProbes.has(i) || probe.type === ProbeType.blTouch)) {
                const data = {
                    probe,
                    probeIndex: store.data.sensors.probes.findIndex(item => item !== null)
                };

                if (store.data.sensors.probes.length === 1) {
                    result.push({ template: "deployprobe", data });
                    result.push({ template: "retractprobe", data });
                } else {
                    result.push({ template: `deployprobe${i}`, data });
                    result.push({ template: `retractprobe${i}`, data });
                }
            }
        }
    }
    function addToolChangeMacros() {
        for (let i = 0; i < store.data.tools.length; i++) {
            if (store.data.tools[i] !== null) {
                result.push({ template: `tpre${i}`, data: { toolNumber: i } });
                result.push({ template: `tpost${i}`, data: { toolNumber: i } });
                result.push({ template: `tfree${i}`, data: { toolNumber: i } });
            }
        }
    }

    switch (section) {
        case ConfigSectionType.General:
            result.push({ template: "config/general", data: null });
            if (store.data.sbc !== null) {
                result.push({ template: "runonce", data: null });
            }
            break;
        case ConfigSectionType.Accessories:
            if (store.data.boards.some(board => !board.canAddress && board.directDisplay !== null) || store.data.panelDueChannel >= 0) {
                result.push({ template: "config/accessories", data: null });
            }
            break;
        case ConfigSectionType.Network:
            result.push({ template: "config/network", data: null });
            result.push({ template: "runonce", data: null }); // FIXME
            break;
        case ConfigSectionType.Expansion:
            // no templates
            break;
        case ConfigSectionType.Kinematics:
            result.push({ template: "config/kinematics", data: null });
            break;
        case ConfigSectionType.Drivers:
            // defined using sub-sections
            break;
        case ConfigSectionType.Axes:
            result.push({ template: "config/axes", data: null });
            break;
        case ConfigSectionType.Extruders:
            result.push({ template: "config/extruders", data: null });
            break;
        case ConfigSectionType.Probes:
            result.push({ template: "config/probes", data: null });
            addDeployRetractProbeTemplates();
            break;
        case ConfigSectionType.Endstops:
            result.push({ template: "config/endstops", data: null });
            result.push({ template: store.data.isDelta ? "homedelta" : "homeall", data: null });
            addHomingTemplates();
            break;
        case ConfigSectionType.Compensation:
            // defined using sub-sections
            break;
        case ConfigSectionType.Sensors:
            result.push({ template: "config/sensors", data: null });
            break;
        case ConfigSectionType.Heaters:
            result.push({ template: "config/heaters", data: null });
            break;
        case ConfigSectionType.Spindles:
            result.push({ template: "config/spindles", data: null });
            break;
        case ConfigSectionType.Lasers:
            result.push({ template: "config/lasers", data: null });
            break;
        case ConfigSectionType.Fans:
            result.push({ template: "config/fans", data: null });
            break;
        case ConfigSectionType.Tools:
            result.push({ template: "config/tools", data: null });
            addToolChangeMacros();
            break;
        case ConfigSectionType.Miscellaneous:
            result.push({ template: "config/miscellaneous", data: null });
            break;
        
        case undefined:
            result.push({ template: "config", data: null });
            if (store.data.sbc !== null) {
                result.push({ template: "runonce", data: null });
            }
            addDeployRetractProbeTemplates();
            result.push({ template: store.data.isDelta ? "homedelta" : "homeall", data: null });
            addHomingTemplates();
            addToolChangeMacros();
            break;

        default:
            const _exhaustiveCheck: never = section;
            break;
    }
    return result;
}
