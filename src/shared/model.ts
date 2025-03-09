export interface Stint {
  stintId: string;
  laps: number;
  position: string;
  trackId: string;
  date: Date;

  // Not stored, enriched later
  trackName?: string;
  distance?: number;
}

export interface Tire {
  tireId: string;
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
