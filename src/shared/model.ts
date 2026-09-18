export interface Stint extends ArchivedResource {
  stintId: string;
  trackId: string;
  carId: string;
  date: Date;
  laps: number;
  leftFront: string;
  rightFront: string;
  leftRear: string;
  rightRear: string;
  note?: string;
}

export interface TireStint extends Stint {
  position: 'Left Front' | 'Left Rear' | 'Right Front' | 'Right Rear';
}

export interface Tire extends ArchivedResource {
  tireId: string;
  carId: string;
  name: string;
  allowedLf: boolean;
  allowedRf: boolean;
  allowedLr: boolean;
  allowedRr: boolean;
}

export interface Tires {
  tires: Tire[];
}

export interface Track extends ArchivedResource {
  trackId: string;
  name: string;
  length: number;
}

export interface Car extends ArchivedResource {
  carId: string;
  name: string;
}

export interface Tracks {
  tracks: Track[];
}

export interface Stints {
  stints: Stint[];
}

export interface Cars {
  cars: Car[];
}

export type PartialValue<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface ImportData {
  exportDate?: string;
  version?: string;
  appName?: string;
  data: {
    tracks: any[];
    cars: any[];
    tires: any[];
    stints: any[];
  };
}

interface ArchivedResource {
  archived?: boolean;
}
