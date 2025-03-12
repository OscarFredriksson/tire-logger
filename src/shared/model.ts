export interface Stint {
  stintId: string;
  laps: number;
  position?: string;
  trackId: string;
  date: Date;

  tires: { tireId: string; position: string }[];

  // Not stored, enriched later
  trackName?: string;
  distance?: number;
}

export interface Tire {
  tireId: string;
  name: string;
  stints: Stint[];
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
