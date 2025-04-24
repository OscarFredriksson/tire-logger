// export interface Stint {
//   stintId: string;
//   laps: number;
//   position?: string;
//   trackId: string;
//   date: Date;

//   tires: { tireId: string; position: string }[];

//   // Not stored, enriched later
//   trackName?: string;
//   distance?: number;
// }

export interface Stint {
  stintId: string;
  trackId: string;
  carId: string;
  date: Date;
  laps: number;
  leftFront?: string;
  rightFront?: string;
  leftRear?: string;
  rightRear?: string;
  note?: string;
}

export interface Tire {
  tireId: string;
  name: string;
  allowedLf: boolean;
  allowedRf: boolean;
  allowedLr: boolean;
  allowedRr: boolean;
}

export interface Tires {
  tires: Tire[];
}

export interface Track {
  trackId: string;
  name: string;
  length: number;
}

export interface Tracks {
  tracks: Track[];
}

export interface Stints {
  stints: Stint[];
}

export type PartialValue<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
