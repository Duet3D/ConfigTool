import { CoreKinematics, DeltaKinematics, DeltaTower, initCollection, initObject, KinematicsName, NetworkInterface, NetworkInterfaceState, NetworkProtocol } from "@duet3d/objectmodel";

export type CoreKinematicsTypes =
	KinematicsName.cartesian |
	KinematicsName.coreXY |
	KinematicsName.coreXZ |
	KinematicsName.coreXYU |
	KinematicsName.coreXYUV |
	KinematicsName.markForged;

export const DefaultForwardMatrix: { [Property in CoreKinematicsTypes]: ReadonlyArray<ReadonlyArray<number>> } = {
	[KinematicsName.cartesian]: [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	],
	[KinematicsName.coreXY]: [
		[0.5, 0.5, 0],
		[0.5, -0.5, 0],
		[0, 0, 1]
	],
	[KinematicsName.coreXZ]: [
		[0.5, 0, 0.167],
		[0, 1, 0],
		[0.5, 0, -0.167]
	],
	[KinematicsName.coreXYU]: [
		[0.5, 0.5, 0, -0.5],
		[0.5, -0.5, 0, 0.5],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	],
	[KinematicsName.coreXYUV]: [
		[0.5, 0.5, 0, 0, 0],
		[0.5, -0.5, 0, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 0, 0.5, 0.5],
		[0, 0, 0, 0.5, -0.5]
	],
	[KinematicsName.markForged]: [
		[1, 0, 0],
		[1, 1, 0],
		[0, 0, 1]
	]
}

export const DefaultInverseMatrix: { [Property in CoreKinematicsTypes]: ReadonlyArray<ReadonlyArray<number>> } = {
	[KinematicsName.cartesian]: [
		[1, 0, 0],
		[0, 1, 0],
		[0, 0, 1]
	],
	[KinematicsName.coreXY]: [
		[1, 1, 0],
		[1, -1, 0],
		[0, 0, 1]
	],
	[KinematicsName.coreXZ]: [
		[1, 0, 1],
		[0, 1, 0],
		[3, 0, -3]
	],
	[KinematicsName.coreXYU]: [
		[1, 1, 0, 0],
		[1, -1, 0, 1],
		[0, 0, 1, 0],
		[0, 0, 0, 1]
	],
	[KinematicsName.coreXYUV]: [
		[1, 1, 0, 0, 0],
		[1, -1, 0, 0, 0],
		[0, 0, 1, 0, 0],
		[0, 0, 0, 1, 1],
		[0, 0, 0, 1, -1]
	],
	[KinematicsName.markForged]: [
		[1, 0, 0],
		[-1, 1, 0],
		[0, 0, 1]
	]
}

export const DefaultDeltaKinematics = new DeltaKinematics(KinematicsName.delta);
DefaultDeltaKinematics.update({
	deltaRadius: 105.6,
	homedHeight: 250,
	printRadius: 85,
	towers: [
		{
			diagonal: 215
		},
		{
			diagonal: 215
		},
		{
			diagonal: 215
		}
	]
});

export function isDefaultCoreKinematics(kinematics: CoreKinematics) {
	return JSON.stringify(kinematics.forwardMatrix) === JSON.stringify(DefaultForwardMatrix[kinematics.name as CoreKinematicsTypes]);
}

export function preconfigureNetworkInterface(iface: NetworkInterface, updateProtocols: boolean = true) {
	if (updateProtocols && iface.activeProtocols.values.length === 0) {
		iface.activeProtocols.add(NetworkProtocol.HTTP);
	}
	iface.configuredIP ??= "0.0.0.0";
	iface.subnet ??= "255.255.255.0";
	iface.state ??= NetworkInterfaceState.active;
}
