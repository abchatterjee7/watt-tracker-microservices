export interface User {
  id: number;
  name: string;
  surname: string;
  email: string;
  address: string;
  alerting: boolean;
  energyAlertingThreshold: number;
}

export interface Device {
  id: number;
  name: string;
  type: DeviceType;
  location: string;
  userId: number;
  energyConsumed?: number;
}

export const DeviceType = {
  SPEAKER: 'SPEAKER',
  CAMERA: 'CAMERA',
  THERMOSTAT: 'THERMOSTAT',
  LIGHT: 'LIGHT',
  LOCK: 'LOCK',
  DOORBELL: 'DOORBELL'
} as const;

export type DeviceType = typeof DeviceType[keyof typeof DeviceType];

export interface Usage {
  userId: number;
  devices: Device[];
}

export interface Alert {
  id: number;
  userId: number;
  createdAt: string;
  sent: boolean;
}

export interface EnergyUsageEvent {
  deviceId: number;
  energyConsumed: number;
  timestamp: string;
}

export interface DashboardStats {
  totalDevices: number;
  totalEnergyConsumption: number;
  averageDailyConsumption: number;
  alertsCount: number;
}
