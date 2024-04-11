import { Axis, AxisLetter, CoreKinematics, KinematicsName, MachineMode, NetworkInterfaceState, NetworkInterfaceType, ProbeType } from "@duet3d/objectmodel";

import { useStore } from ".";

/**
 * Types of configuration sections
 */
export enum ConfigSectionType {
    General = "general",
    Accessories = "accessories",
    LedStrips = "ledStrips",
    Network = "network",
    Expansion = "expansion",
    Accelerometers = "accelerometers",
    Drivers = "drivers",
    Kinematics = "kinematics",
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
        (store.data.limits.ledStrips ?? 0 > 0) ? ConfigSectionType.LedStrips : null,
        (store.data.network.interfaces.length > 0) ? ConfigSectionType.Network : null,
        ConfigSectionType.Expansion,
        ConfigSectionType.Accelerometers,
        ConfigSectionType.Drivers,
        ConfigSectionType.Kinematics,
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
        let axesToSkip = new Set<AxisLetter>();
        if (store.data.isDelta || (store.data.move.kinematics instanceof CoreKinematics && store.data.move.kinematics.name !== KinematicsName.cartesian)) {
            axesToSkip = new Set<AxisLetter>([AxisLetter.X, AxisLetter.Y, AxisLetter.Z]);
            if ([KinematicsName.coreXYU, KinematicsName.coreXYUV].includes(store.data.move.kinematics.name)) {
                axesToSkip.add(AxisLetter.U);
            }
            if (store.data.move.kinematics.name === KinematicsName.coreXYUV) {
                axesToSkip.add(AxisLetter.V);
            }
        }

        for (let i = 0; i < store.data.move.axes.length; i++) {
            const axis = store.data.move.axes[i];
            if (!axesToSkip.has(axis.letter)) {
                if (/[A-Z]/.test(axis.letter)) {
                    result.push({ template: `home${axis.letter.toLowerCase()}`, data: { axis, axisLetter: axis.letter, axisIndex: i } });
                } else {
                    result.push({ template: `home'${axis.letter}`, data: { axis, axisLetter: axis.letter, axisIndex: i } });
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
        case ConfigSectionType.LedStrips:
            if (store.data.ledStrips.length > 0) {
                result.push({ template: "config/ledStrips", data: null });
            }
            break;
        case ConfigSectionType.Network:
            if (store.data.configTool.password !== "" || (store.data.sbc === null && store.data.network.interfaces.some(iface => iface.state !== NetworkInterfaceState.disabled))) {
                // Configure machine password (if set) and in standalone mode network adapters via config.g
                result.push({ template: "config/network", data: null });
            }

            if ((store.data.sbc === null && store.data.configTool.wifi.ssid.trim() !== "" && store.data.network.interfaces.some(iface => iface.state !== NetworkInterfaceState.disabled && iface.type === NetworkInterfaceType.wifi)) ||
                (store.data.sbc !== null && store.data.network.interfaces.some(iface => iface.state !== NetworkInterfaceState.disabled)))
            {
                // WiFi and SBC network interfaces are configured using runonce.g
                result.push({ template: "runonce", data: null });
            }
            break;
        case ConfigSectionType.Expansion:
            // no templates
            break;
        case ConfigSectionType.Accelerometers:
            result.push({ template: "config/accelerometers", data: null });
            break;
        case ConfigSectionType.Drivers:
            // defined using sub-sections
            break;
        case ConfigSectionType.Kinematics:
            result.push({ template: "config/kinematics", data: null });
            break;
        case ConfigSectionType.Axes:
            result.push({ template: "config/axes", data: null });
            break;
        case ConfigSectionType.Extruders:
            if (store.data.move.extruders.length > 0) {
                result.push({ template: "config/extruders", data: null });
            }
            break;
        case ConfigSectionType.Probes:
            if (store.data.sensors.probes.some(probe => probe !== null)) {
                result.push({ template: "config/probes", data: null });
            }
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
            if (store.data.sensors.analog.some(sensor => sensor !== null)) {
                result.push({ template: "config/sensors", data: null });
            }
            break;
        case ConfigSectionType.Heaters:
            if (store.data.heat.heaters.some(heater => heater !== null)) {
                result.push({ template: "config/heaters", data: null });
            }
            break;
        case ConfigSectionType.Spindles:
            if (store.data.spindles.some(spindle => spindle !== null)) {
                result.push({ template: "config/spindles", data: null });
            }
            break;
        case ConfigSectionType.Lasers:
            result.push({ template: "config/lasers", data: null });
            break;
        case ConfigSectionType.Fans:
            if (store.data.fans.some(fan => fan !== null)) {
                result.push({ template: "config/fans", data: null });
            }
            break;
        case ConfigSectionType.Tools:
            if (store.data.tools.some(tool => tool !== null)) {
                result.push({ template: "config/tools", data: null });
            }
            addToolChangeMacros();
            break;
        case ConfigSectionType.Miscellaneous:
            if (store.data.configTool.configOverride ||
                store.data.state.machineMode !== MachineMode.fff || store.data.configTool.capabilities.laser ||
                (store.data.configTool.autoSelectFirstTool && store.data.tools.some(tool => tool !== null)) ||
                store.data.configTool.customSettings.trim() !== "")
            {
                result.push({ template: "config/miscellaneous", data: null });
            }
            break;
        
        case undefined:
            result.push({ template: "config", data: null });
            if ((store.data.sbc === null && store.data.configTool.wifi.ssid.trim() !== "" && store.data.network.interfaces.some(iface => iface.state !== NetworkInterfaceState.disabled && iface.type === NetworkInterfaceType.wifi)) ||
                (store.data.sbc !== null))
            {
                result.push({ template: "runonce", data: null });
            }
            addDeployRetractProbeTemplates();
            result.push({ template: store.data.isDelta ? "homedelta" : "homeall", data: null });
            result.push({ template: "bed", data: null });
            addHomingTemplates();
            addToolChangeMacros();
            break;

        default:
            const _exhaustiveCheck: never = section;
            break;
    }
    return result;
}
