<style scoped>
.table-accelerometer-boards tr > td {
    vertical-align: middle;
}
</style>

<template>
    <config-section :type="ConfigSectionType.Accelerometers" title="Accelerometers" url-title="Connecting an accelerometer"
                    url="https://docs.duet3d.com/en/User_manual/Connecting_hardware/Sensors_Accelerometer">
        <template #append>
            <table v-if="accelerometerBoards.length > 0" class="table table-striped table-accelerometer-boards mt-n1 mb-0">
                <colgroup>
                    <col style="width: auto;">
                    <col style="width: 25%;">
                    <col style="width: 35%;">
                    <col style="width: 20%;">
                    <col style="width: 20%;">
                </colgroup>
                <thead>
                    <tr>
                        <th class="text-center text-nowrap">
                            CAN Address
                        </th>
                        <th>
                            Accelerometer Type
                        </th>
                        <th>
                            Orientation
                        </th>
                        <th>
                            SPI CS Port
                        </th>
                        <th>
                            INT Port
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="board in accelerometerBoards">
                        <td class="text-center">
                            {{ board.canAddress ?? "n/a" }}
                        </td>
                        <td>
                            <select-input title="Type of the connected accelerometer" :options="AccelerometerTypes"
                                          :required="false" :model-value="getAccelerometerModel(board)"
                                          @update:model-value="setAccelerometerModel(board, $event)" />
                        </td>
                        <td>
                            <select-input title="Orientation of the accelerometer board, see docs for further info (I parameter)"
                                          :options="OrientationOptions" :model-value="getAccelerometerOrientation(board)"
                                          @update:model-value="setAccelerometerOrientation(board, $event)" />
                        </td>
                        <td>
                            <port-input :board="board.canAddress" :function="ConfigPortFunction.accelerometerSpiCs"
                                        :index="board.canAddress ?? 0" :disabled="getAccelerometerModel(board) === null"
                                        :required="!hasBuiltInAccelerometer(board)" />
                        </td>
                        <td>
                            <port-input :board="board.canAddress" :function="ConfigPortFunction.accelerometerInt"
                                        :index="board.canAddress ?? 0" :disabled="getAccelerometerModel(board) === null"
                                        :required="!hasBuiltInAccelerometer(board)" />
                        </td>
                    </tr>
                </tbody>
            </table>

            <div v-else class="alert alert-info mb-0">
                <i class="bi-info-circle"></i>
                No boards with accelerometer support
            </div>

            <div v-if="store.data.boards.some(board => getExpansionBoardType(board) === ExpansionBoardType.TOOL1LC)"
                 class="alert alert-info mb-0">
                <i class="bi-info-circle"></i>
                Only toolboards with revision 1.1 or later have an on-board accelerometer
            </div>
        </template>
    </config-section>
</template>

<script lang="ts">
import type { SelectOption } from "@/components/inputs/SelectInput.vue";
import { ExpansionBoardType } from "@/store/ExpansionBoards";

const OrientationOptions: Array<SelectOption> = [
    {
        text: "+X to +Y / +Z to +X (I01)",
        value: 1
    },
    {
        text: "+X to +Z / +Z to +X (I02)",
        value: 2
    },
    {
        text: "+X to -Y / +Z to +X (I05)",
        value: 5
    },
    {
        text: "+X to -Z / +Z to +X (I06)",
        value: 6
    },
    {
        text: "+X to +X / +Z to +Y (I10)",
        value: 10
    },
    {
        text: "+X to +Z / +Z to +Y (I12)",
        value: 12
    },
    {
        text: "+X to -X / +Z to +Y (I14)",
        value: 14
    },
    {
        text: "+X to -Z / +Z to +Y (I16)",
        value: 16
    },
    {
        text: "+X to +X / +Z to +Z (I20)",
        value: 20
    },
    {
        text: "+X to +Y / +Z to +Z (I21)",
        value: 21
    },
    {
        text: "+X to -X / +Z to +Z (I24)",
        value: 24
    },
    {
        text: "+X to -Y / +Z to +Z (I25)",
        value: 25
    },
    {
        text: "+X to +Y / +Z to -X (I41)",
        value: 41
    },
    {
        text: "+X to +Z / +Z to -X (I42)",
        value: 42
    },
    {
        text: "+X to -Y / +Z to -X (I45)",
        value: 45
    },
    {
        text: "+X to -Z / +Z to -X (I46)",
        value: 46
    },
    {
        text: "+X to +X / +Z to -Y (I50)",
        value: 50
    },
    {
        text: "+X to +Z / +Z to -Y (I52)",
        value: 52
    },
    {
        text: "+X to -X / +Z to -Y (I54)",
        value: 54
    },
    {
        text: "+X to -Z / +Z to -Y (I56)",
        value: 56
    },
    {
        text: "+X to +X / +Z to -Z (I60)",
        value: 60
    },
    {
        text: "+X to +Y / +Z to -Z (I61)",
        value: 61
    },
    {
        text: "+X to -X / +Z to -Z (I64)",
        value: 64
    },
    {
        text: "+X to -Y / +Z to -Z (I65)",
        value: 65
    }
];

const AccelerometerTypes: Array<SelectOption> = [
    {
        text: "None",
        value: null
    },
    {
        text: "LIS3DH",
        value: "LIS3DH"
    }
];
</script>

<script setup lang="ts">
import { Accelerometer, type Board } from "@duet3d/objectmodel";
import { computed } from "vue";

import ConfigSection from "@/components/ConfigSection.vue";
import SelectInput from "@/components/inputs/SelectInput.vue";
import PortInput from "@/components/inputs/PortInput.vue";

import { useStore } from "@/store";
import { ConfigSectionType } from "@/store/sections";
import { getBoardDefinition } from "@/store/Boards";
import { getExpansionBoardDefinition, getExpansionBoardType } from "@/store/ExpansionBoards";
import { ConfigPortFunction } from "@/store/model/ConfigPort";

const store = useStore();

const accelerometerBoards = computed(() => {
    const result: Array<Board> = [];
    if (getBoardDefinition(store.data)?.supportsAccelerometer) {
        result.push(store.data.boards[0]);
    }
    for (const board of store.data.boards) {
        if (getExpansionBoardDefinition(board)?.supportsAccelerometer) {
            result.push(board);
        }
    }
    return result;
});

function hasBuiltInAccelerometer(board: Board) {
    return board.canAddress && (getExpansionBoardDefinition(board as Board)?.hasBuiltInAccelerometer ?? false);
}

function getAccelerometerModel(board: Board) {
    return (board.accelerometer !== null) ? "LIS3DH" : null;
}

function setAccelerometerModel(board: Board, value: string | null) {
    board.accelerometer = (value !== null) ? new Accelerometer() : null;
    if (value === null) {
        for (const port of store.data.configTool.ports) {
            if ([ConfigPortFunction.accelerometerInt, ConfigPortFunction.accelerometerSpiCs].includes(port.function!) && port.index === (board.canAddress ?? 0)) {
                // Release ports of the deleted accelerometer
                port.function = null;
            }
        }
    }
}

function getAccelerometerOrientation(board: Board) {
    return (board.accelerometer !== null) ? board.accelerometer.orientation : 20;
}

function setAccelerometerOrientation(board: Board, value: number) {
    if (board.accelerometer !== null) {
        board.accelerometer.orientation = value;
    }
}
</script>